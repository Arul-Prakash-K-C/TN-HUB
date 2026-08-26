// ============================================
// AUTH STORE — Firebase Authentication + secure server session
// ============================================

import { browser } from '$app/environment';
import { derived, writable } from 'svelte/store';
import { getFirebaseAuth } from '$lib/firebase/client';
import { locale } from '$lib/i18n';
import type { AuthenticatedUser, UserRole } from '$lib/types';
import type { User as FirebaseUser } from 'firebase/auth';

interface AuthState {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRestored: boolean;
}

interface SessionResponse {
  user?: AuthenticatedUser;
}

const SESSION_ENDPOINT = '/api/auth/session';

async function loadFirebaseAuthModule() {
  return import('firebase/auth');
}

function createAuthStore() {
  let state: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isRestored: false
  };
  const { subscribe, set, update } = writable<AuthState>(state);

  let unsubscribeFromTokenChanges: (() => void) | null = null;
  let handledInitialToken = false;
  let explicitAuthInProgress = false;
  let restoreInFlight: Promise<void> | null = null;
  let latestSync = 0;
  let inFlightSession:
    | {
        uid: string;
        promise: Promise<AuthenticatedUser>;
      }
    | null = null;

  function commit(nextState: AuthState): void {
    state = nextState;
    set(nextState);
  }

  function patch(updater: (current: AuthState) => AuthState): void {
    update((current) => {
      state = updater(current);
      return state;
    });
  }

  async function establishServerSession(firebaseUser: FirebaseUser): Promise<AuthenticatedUser> {
    if (inFlightSession?.uid === firebaseUser.uid) {
      return inFlightSession.promise;
    }

    const promise = (async () => {
      const idToken = await firebaseUser.getIdToken();
      const response = await fetch(SESSION_ENDPOINT, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ idToken })
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message ?? 'Unable to establish a secure session.');
      }

      const body = (await response.json()) as SessionResponse;
      if (!body.user?.uid) {
        throw new Error('The authentication server returned an invalid session.');
      }

      return body.user;
    })();

    inFlightSession = { uid: firebaseUser.uid, promise };

    try {
      return await promise;
    } finally {
      if (inFlightSession?.promise === promise) {
        inFlightSession = null;
      }
    }
  }

  async function syncFirebaseUser(firebaseUser: FirebaseUser | null): Promise<boolean> {
    const syncId = ++latestSync;

    if (!firebaseUser) {
      commit({ user: null, isAuthenticated: false, isLoading: false, isRestored: true });
      return true;
    }

    patch((state) => ({ ...state, isLoading: true }));

    try {
      const user = await establishServerSession(firebaseUser);
      if (syncId === latestSync) {
        // A profile preference is authoritative after login, while the locale
        // store continues to persist the same choice across navigation.
        locale.set(user.preferredLanguage);
        commit({ user, isAuthenticated: true, isLoading: false, isRestored: true });
      }
      return true;
    } catch {
      if (syncId === latestSync) {
        patch((state) => (state.isAuthenticated ? { ...state, isLoading: false, isRestored: true } : { user: null, isAuthenticated: false, isLoading: false, isRestored: true }));
      }
      return false;
    }
  }

  return {
    subscribe,

    /** Synchronously seeds the auth store from server SSR data (+layout.server.ts). */
    setInitialUser(user: AuthenticatedUser | null): void {
      if (user) {
        locale.set(user.preferredLanguage);
      }
      commit({
        user,
        isAuthenticated: !!user,
        isLoading: false,
        isRestored: true
      });
    },

    async login(email: string, password: string): Promise<boolean> {
      if (!browser) return false;

      explicitAuthInProgress = true;
      patch((state) => ({ ...state, isLoading: true }));

      try {
        const [{ signInWithEmailAndPassword }, firebaseAuth] = await Promise.all([
          loadFirebaseAuthModule(),
          getFirebaseAuth()
        ]);
        const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
        return await syncFirebaseUser(credential.user);
      } catch {
        commit({ user: null, isAuthenticated: false, isLoading: false, isRestored: true });
        return false;
      } finally {
        explicitAuthInProgress = false;
      }
    },

    /** Supports the existing citizen-auth requirement without a client role field. */
    async registerCitizen(email: string, password: string, displayName: string): Promise<boolean> {
      if (!browser) return false;

      explicitAuthInProgress = true;
      patch((state) => ({ ...state, isLoading: true }));

      try {
        const [{ createUserWithEmailAndPassword, updateProfile }, firebaseAuth] = await Promise.all([
          loadFirebaseAuthModule(),
          getFirebaseAuth()
        ]);
        const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        if (displayName.trim()) {
          await updateProfile(credential.user, { displayName: displayName.trim() });
        }
        await credential.user.getIdToken(true);
        return await syncFirebaseUser(credential.user);
      } catch {
        commit({ user: null, isAuthenticated: false, isLoading: false, isRestored: true });
        return false;
      } finally {
        explicitAuthInProgress = false;
      }
    },

    async logout(): Promise<void> {
      if (!browser) return;

      // Clear UI state immediately, then revoke both sides of the session.
      commit({ user: null, isAuthenticated: false, isLoading: false, isRestored: true });
      const [{ signOut }, firebaseAuth] = await Promise.all([
        loadFirebaseAuthModule(),
        getFirebaseAuth()
      ]);
      await Promise.allSettled([
        fetch(SESSION_ENDPOINT, { method: 'DELETE', credentials: 'same-origin' }),
        signOut(firebaseAuth)
      ]);
    },

    /** Starts the Firebase token listener once after browser hydration. */
    restore(): void {
      if (!browser || unsubscribeFromTokenChanges || restoreInFlight) return;

      // Only mark loading if we haven't already restored state from SSR
      patch((state) => (state.isRestored ? state : { ...state, isLoading: true }));
      restoreInFlight = Promise.all([loadFirebaseAuthModule(), getFirebaseAuth()])
        .then(([{ onIdTokenChanged }, firebaseAuth]) => {
          unsubscribeFromTokenChanges = onIdTokenChanged(firebaseAuth, (firebaseUser) => {
            const isInitialToken = !handledInitialToken;
            handledInitialToken = true;

            if (isInitialToken && firebaseUser?.uid === state.user?.uid && state.isAuthenticated) {
              patch((state) => ({ ...state, isLoading: false, isRestored: true }));
              return;
            }

            if (explicitAuthInProgress && firebaseUser) {
              return;
            }

            void syncFirebaseUser(firebaseUser);
          });
        })
        .catch(() => {
          commit({ user: null, isAuthenticated: false, isLoading: false, isRestored: true });
        })
        .finally(() => {
          restoreInFlight = null;
        });
    }
  };
}

export const auth = createAuthStore();

export const currentUser = derived(auth, ($auth) => $auth.user);
export const isAuthenticated = derived(auth, ($auth) => $auth.isAuthenticated);
export const isLoading = derived(auth, ($auth) => $auth.isLoading);
export const isRestored = derived(auth, ($auth) => $auth.isRestored);
export const userRole = derived(auth, ($auth): UserRole | null => $auth.user?.role ?? null);
export const userDepartmentId = derived(auth, ($auth) => $auth.user?.departmentId ?? null);

export const isCitizen = derived(auth, ($auth) => $auth.user?.role === 'citizen');
export const isOfficer = derived(auth, ($auth) => $auth.user?.role === 'department_user');
export const isDepartmentUser = derived(auth, ($auth) => $auth.user?.role === 'department_user');
export const isOperator = derived(auth, ($auth) => $auth.user?.role === 'operator');
export const isAdmin = derived(auth, ($auth) => $auth.user?.role === 'admin');

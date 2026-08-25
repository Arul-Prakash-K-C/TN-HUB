// ============================================
// AUTH STORE — Firebase Authentication + secure server session
// ============================================

import { browser } from '$app/environment';
import {
  createUserWithEmailAndPassword,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser
} from 'firebase/auth';
import { derived, writable } from 'svelte/store';
import { getFirebaseAuth } from '$lib/firebase/client';
import { locale } from '$lib/i18n';
import type { AuthenticatedUser, UserRole } from '$lib/types';

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

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isRestored: false
  });

  let unsubscribeFromTokenChanges: (() => void) | null = null;
  let latestSync = 0;

  async function establishServerSession(firebaseUser: FirebaseUser): Promise<AuthenticatedUser> {
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
  }

  async function syncFirebaseUser(firebaseUser: FirebaseUser | null): Promise<boolean> {
    const syncId = ++latestSync;

    if (!firebaseUser) {
      set({ user: null, isAuthenticated: false, isLoading: false, isRestored: true });
      return true;
    }

    update((state) => ({ ...state, isLoading: true }));

    try {
      const user = await establishServerSession(firebaseUser);
      if (syncId === latestSync) {
        // A profile preference is authoritative after login, while the locale
        // store continues to persist the same choice across navigation.
        locale.set(user.preferredLanguage);
        set({ user, isAuthenticated: true, isLoading: false, isRestored: true });
      }
      return true;
    } catch {
      if (syncId === latestSync) {
        set({ user: null, isAuthenticated: false, isLoading: false, isRestored: true });
      }

      // A browser session without a verified server session is never retained.
      await signOut(getFirebaseAuth()).catch(() => undefined);
      return false;
    }
  }

  return {
    subscribe,

    async login(email: string, password: string): Promise<boolean> {
      if (!browser) return false;

      update((state) => ({ ...state, isLoading: true }));

      try {
        const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
        return await syncFirebaseUser(credential.user);
      } catch {
        set({ user: null, isAuthenticated: false, isLoading: false, isRestored: true });
        return false;
      }
    },

    /** Supports the existing citizen-auth requirement without a client role field. */
    async registerCitizen(email: string, password: string, displayName: string): Promise<boolean> {
      if (!browser) return false;

      update((state) => ({ ...state, isLoading: true }));

      try {
        const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
        if (displayName.trim()) {
          await updateProfile(credential.user, { displayName: displayName.trim() });
        }
        await credential.user.getIdToken(true);
        return await syncFirebaseUser(credential.user);
      } catch {
        set({ user: null, isAuthenticated: false, isLoading: false, isRestored: true });
        return false;
      }
    },

    async logout(): Promise<void> {
      if (!browser) return;

      // Clear UI state immediately, then revoke both sides of the session.
      set({ user: null, isAuthenticated: false, isLoading: false, isRestored: true });
      await Promise.allSettled([
        fetch(SESSION_ENDPOINT, { method: 'DELETE', credentials: 'same-origin' }),
        signOut(getFirebaseAuth())
      ]);
    },

    /** Starts the Firebase token listener once after browser hydration. */
    restore(): void {
      if (!browser || unsubscribeFromTokenChanges) return;

      update((state) => ({ ...state, isLoading: true }));
      unsubscribeFromTokenChanges = onIdTokenChanged(getFirebaseAuth(), (firebaseUser) => {
        void syncFirebaseUser(firebaseUser);
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

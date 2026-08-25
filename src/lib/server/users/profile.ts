import { Timestamp } from 'firebase-admin/firestore';
import type { AuthenticatedUser } from '$lib/types';
import { getFirebaseAdminFirestore } from '$lib/server/firebase/admin';

type ProfileData = {
  uid: string;
  email: string;
  displayName: string;
  phone?: string | null;
  role: AuthenticatedUser['role'];
  departmentId?: string | null;
  preferredLanguage: 'en' | 'ta';
  photoURL?: string | null;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export interface ProfilePreferencesInput {
  phone?: string | null;
  preferredLanguage?: 'en' | 'ta';
}

function preferredLanguage(value: unknown, fallback: 'en' | 'ta'): 'en' | 'ta' {
  return value === 'ta' ? 'ta' : fallback;
}

function stringValue(value: unknown, fallback?: string): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
}

/**
 * Creates or refreshes the server-owned users/{uid} profile from a verified
 * Firebase identity. Roles and department assignments come only from verified
 * custom claims, never from browser input.
 */
export async function ensureUserProfile(sessionUser: AuthenticatedUser): Promise<AuthenticatedUser> {
  const db = getFirebaseAdminFirestore();
  const profileRef = db.collection('users').doc(sessionUser.uid);

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(profileRef);
    const now = Timestamp.now();

    if (!snapshot.exists) {
      const newProfile: ProfileData = {
        uid: sessionUser.uid,
        email: sessionUser.email,
        displayName: sessionUser.displayName,
        phone: null,
        role: sessionUser.role,
        departmentId: sessionUser.departmentId ?? null,
        preferredLanguage: sessionUser.preferredLanguage,
        photoURL: sessionUser.photoURL ?? null,
        isActive: sessionUser.isActive,
        createdAt: now,
        updatedAt: now
      };

      transaction.set(profileRef, newProfile);
      return sessionUser;
    }

    const existing = snapshot.data() as Partial<ProfileData>;
    if (existing.isActive === false) {
      throw new Error('This account is pending approval or has been disabled.');
    }

    const mergedRole = existing.role || sessionUser.role;
    const mergedDept = existing.departmentId || sessionUser.departmentId;

    // Custom claims remain the authorization source of truth. This mirror is
    // refreshed only by Firebase Admin code during a verified session.
    transaction.update(profileRef, {
      email: sessionUser.email,
      displayName: sessionUser.displayName,
      photoURL: sessionUser.photoURL ?? null,
      role: mergedRole,
      departmentId: mergedDept ?? null,
      updatedAt: now
    });

    const displayName = stringValue(existing.displayName, sessionUser.displayName) ?? sessionUser.displayName;
    const photoURL = stringValue(existing.photoURL, sessionUser.photoURL);
    // A verified custom claim can immediately disable an account even when
    // its previously mirrored profile is still marked active.
    const isActive = existing.isActive !== undefined ? existing.isActive : sessionUser.isActive;

    return {
      ...sessionUser,
      role: mergedRole,
      departmentId: mergedDept ?? undefined,
      name: displayName,
      displayName,
      phone: stringValue(existing.phone),
      photoURL,
      avatar: photoURL,
      preferredLanguage: preferredLanguage(existing.preferredLanguage, sessionUser.preferredLanguage),
      isActive
    };
  });
}

/**
 * Updates only citizen-controlled presentation and preference fields. Role,
 * department assignment, account status, email, and identity remain
 * server-owned and are intentionally absent from this input type.
 */
export async function updateUserProfilePreferences(
  sessionUser: AuthenticatedUser,
  input: ProfilePreferencesInput
): Promise<Pick<ProfileData, 'phone' | 'preferredLanguage' | 'updatedAt'>> {
  const db = getFirebaseAdminFirestore();
  const profileRef = db.collection('users').doc(sessionUser.uid);
  const phone = input.phone === undefined
    ? undefined
    : (typeof input.phone === 'string' && input.phone.trim().length > 0 ? input.phone.trim() : null);
  const preferredLanguage = input.preferredLanguage === 'ta' ? 'ta' : 'en';

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(profileRef);
    if (!snapshot.exists) throw new Error('User profile not found.');

    const updatedAt = Timestamp.now();
    const updates: Record<string, unknown> = { preferredLanguage, updatedAt };
    if (phone !== undefined) updates.phone = phone;
    transaction.update(profileRef, updates);

    return {
      phone: phone === undefined ? (snapshot.get('phone') ?? null) : phone,
      preferredLanguage,
      updatedAt
    };
  });
}

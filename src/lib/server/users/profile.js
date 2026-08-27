import { Timestamp } from 'firebase-admin/firestore';
import { getFirebaseAdminFirestore } from '$lib/server/firebase/admin';
function preferredLanguage(value, fallback) {
    return value === 'ta' ? 'ta' : fallback;
}
function stringValue(value, fallback) {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
}
const profileCache = new Map();
const PROFILE_CACHE_TTL_MS = 60 * 1000;
/**
 * Creates or refreshes the server-owned users/{uid} profile from a verified
 * Firebase identity. Roles and department assignments come only from verified
 * custom claims, never from browser input.
 */
export async function ensureUserProfile(sessionUser) {
    const now = Date.now();
    const cached = profileCache.get(sessionUser.uid);
    if (cached && (now - cached.timestamp) < PROFILE_CACHE_TTL_MS) {
        return cached.user;
    }
    const db = getFirebaseAdminFirestore();
    const profileRef = db.collection('users').doc(sessionUser.uid);
    const snapshot = await profileRef.get();
    const firestoreNow = Timestamp.now();
    if (!snapshot.exists) {
        const newProfile = {
            uid: sessionUser.uid,
            email: sessionUser.email,
            displayName: sessionUser.displayName,
            phone: null,
            role: sessionUser.role,
            departmentId: sessionUser.departmentId ?? null,
            preferredLanguage: sessionUser.preferredLanguage,
            photoURL: sessionUser.photoURL ?? null,
            isActive: sessionUser.isActive,
            createdAt: firestoreNow,
            updatedAt: firestoreNow
        };
        await profileRef.set(newProfile);
        profileCache.set(sessionUser.uid, { user: sessionUser, timestamp: Date.now() });
        return sessionUser;
    }
    const existing = snapshot.data();
    if (existing.isActive === false) {
        throw new Error('This account is pending approval or has been disabled.');
    }
    const mergedRole = existing.role || sessionUser.role;
    const mergedDept = existing.departmentId || sessionUser.departmentId;
    const needsUpdate = existing.email !== sessionUser.email ||
        existing.displayName !== sessionUser.displayName ||
        existing.photoURL !== (sessionUser.photoURL ?? null) ||
        existing.role !== mergedRole ||
        existing.departmentId !== (mergedDept ?? null);
    if (needsUpdate) {
        await profileRef.update({
            email: sessionUser.email,
            displayName: sessionUser.displayName,
            photoURL: sessionUser.photoURL ?? null,
            role: mergedRole,
            departmentId: mergedDept ?? null,
            updatedAt: firestoreNow
        });
    }
    const displayName = stringValue(existing.displayName, sessionUser.displayName) ?? sessionUser.displayName;
    const photoURL = stringValue(existing.photoURL, sessionUser.photoURL);
    const isActive = existing.isActive !== undefined ? existing.isActive : sessionUser.isActive;
    const resolvedUser = {
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
    profileCache.set(sessionUser.uid, { user: resolvedUser, timestamp: Date.now() });
    return resolvedUser;
}
/**
 * Updates only citizen-controlled presentation and preference fields. Role,
 * department assignment, account status, email, and identity remain
 * server-owned and are intentionally absent from this input type.
 */
export async function updateUserProfilePreferences(sessionUser, input) {
    profileCache.delete(sessionUser.uid);
    const db = getFirebaseAdminFirestore();
    const profileRef = db.collection('users').doc(sessionUser.uid);
    const phone = input.phone === undefined
        ? undefined
        : (typeof input.phone === 'string' && input.phone.trim().length > 0 ? input.phone.trim() : null);
    const preferredLanguage = input.preferredLanguage === 'ta' ? 'ta' : 'en';
    return db.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(profileRef);
        if (!snapshot.exists)
            throw new Error('User profile not found.');
        const updatedAt = Timestamp.now();
        const updates = { preferredLanguage, updatedAt };
        if (phone !== undefined)
            updates.phone = phone;
        transaction.update(profileRef, updates);
        return {
            phone: phone === undefined ? (snapshot.get('phone') ?? null) : phone,
            preferredLanguage,
            updatedAt
        };
    });
}

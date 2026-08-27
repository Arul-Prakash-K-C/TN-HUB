import { createAuthenticatedUser } from '$lib/auth/identity';
import { getFirebaseAdminAuth } from '$lib/server/firebase/admin';
import { ensureUserProfile } from '$lib/server/users/profile';
export const SESSION_COOKIE_NAME = 'tnhub-session';
export const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 5;
async function toSessionUser(token) {
    const sessionUser = createAuthenticatedUser({
        uid: token.uid,
        email: token.email,
        displayName: token.name,
        photoURL: token.picture,
        claims: token,
        issuedAt: token.auth_time
    });
    return ensureUserProfile(sessionUser);
}
function assertActive(user) {
    if (!user.isActive) {
        throw new Error('This account has been disabled.');
    }
    if (user.role === 'department_user' && !user.departmentId) {
        throw new Error('Department users must have a department assignment.');
    }
}
/** Exchanges a Firebase ID token for an HttpOnly, verified server session. */
export async function createSessionFromIdToken(idToken) {
    const auth = getFirebaseAdminAuth();
    const token = await auth.verifyIdToken(idToken);
    const user = await toSessionUser(token);
    assertActive(user);
    const sessionCookie = await auth.createSessionCookie(idToken, {
        expiresIn: SESSION_DURATION_MS
    });
    return { sessionCookie, user };
}
/** Verifies a session cookie and returns only a safe application user shape. */
export async function getVerifiedSessionUser(sessionCookie) {
    const token = await getFirebaseAdminAuth().verifySessionCookie(sessionCookie, false);
    const user = await toSessionUser(token);
    assertActive(user);
    return user;
}
/** Verifies a session cookie with strict revocation checking for high-privilege operations. */
export async function verifySessionCookieWithRevocation(sessionCookie) {
    const token = await getFirebaseAdminAuth().verifySessionCookie(sessionCookie, true);
    const user = await toSessionUser(token);
    assertActive(user);
    return user;
}

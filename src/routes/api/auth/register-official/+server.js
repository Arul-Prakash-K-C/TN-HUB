import { error, json } from '@sveltejs/kit';
import { getFirebaseAdminFirestore } from '$lib/server/firebase/admin';
import { getFirebaseAdminAuth } from '$lib/server/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { checkRateLimit } from '$lib/server/security/rateLimit';
import { cleanString, isEmail, isSafeId } from '$lib/server/security/validation';

const officialRoles = new Set(['operator', 'department_user']);

function bearerToken(request) {
    const authorization = request.headers.get('authorization') ?? '';
    return authorization.startsWith('Bearer ') ? authorization.slice('Bearer '.length).trim() : '';
}

export const POST = async ({ request }) => {
    const rateLimit = checkRateLimit(request, 'official-registration', { limit: 6, windowMs: 60_000 });
    if (!rateLimit.allowed) {
        throw error(429, `Too many registration attempts. Try again in ${rateLimit.retryAfterSeconds} seconds.`);
    }

    let body;
    try {
        body = await request.json();
    }
    catch {
        throw error(400, 'Invalid request payload.');
    }
    const { uid, email, name, desiredRole, departmentId } = body;
    if (!officialRoles.has(desiredRole)) {
        throw error(400, 'Missing required fields.');
    }
    if (desiredRole === 'department_user' && !isSafeId(departmentId, 120)) {
        throw error(400, 'A valid department is required for officer registration.');
    }
    const idToken = bearerToken(request);
    if (!idToken) {
        throw error(401, 'A verified Firebase registration token is required.');
    }

    let token;
    try {
        token = await getFirebaseAdminAuth().verifyIdToken(idToken);
    }
    catch {
        throw error(401, 'A verified Firebase registration token is required.');
    }
    if (token.uid !== uid) {
        throw error(403, 'Registration identity does not match the signed-in Firebase user.');
    }
    const verifiedEmail = typeof token.email === 'string' ? token.email.trim().toLowerCase() : '';
    const submittedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!verifiedEmail || !submittedEmail || verifiedEmail !== submittedEmail || !isEmail(submittedEmail)) {
        throw error(400, 'A valid verified email is required.');
    }
    let displayName;
    try {
        displayName = cleanString(name, 120) || submittedEmail.split('@')[0];
    }
    catch (cause) {
        throw error(400, cause instanceof Error ? cause.message : 'Invalid display name.');
    }

    const db = getFirebaseAdminFirestore();
    const profileRef = db.collection('users').doc(uid);
    try {
        const now = Timestamp.now();
        const existing = await profileRef.get();
        if (existing.exists) {
            throw error(409, 'Registration already exists for this account.');
        }
        await profileRef.create({
            uid,
            email: submittedEmail,
            displayName,
            role: desiredRole === 'operator' ? 'operator' : 'department_user',
            departmentId: desiredRole === 'department_user' ? departmentId : null,
            isActive: false, // Inactive until approved
            approved: false, // Explicit approved flag for admin panel
            registrationStatus: 'APPLIED',
            appliedAt: now,
            desiredRole,
            createdAt: now,
            updatedAt: now,
            preferredLanguage: 'en'
        });
        return json({ message: 'Registration submitted. Pending admin approval.' });
    }
    catch (cause) {
        if (cause?.status) {
            throw cause;
        }
        const message = cause instanceof Error ? cause.message : 'Unable to submit registration.';
        throw error(500, message);
    }
};

import { error, json } from '@sveltejs/kit';
import { getFirebaseAdminFirestore } from '$lib/server/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
export const GET = async ({ locals }) => {
    if (!locals.user || locals.user.role !== 'admin') {
        throw error(403, 'Forbidden: Admin access only.');
    }
    const db = getFirebaseAdminFirestore();
    try {
        const snapshot = await db.collection('users').get();
        const users = snapshot.docs
            .map((document) => ({ ...document.data(), uid: document.id }))
            .filter((user) => Boolean(user.desiredRole || user.registrationStatus))
            .map((user) => ({
            ...user,
            registrationStatus: user.registrationStatus
                ?? (user.approved === true ? 'APPROVED' : 'APPLIED')
        }));
        return json({ users });
    }
    catch (cause) {
        const message = cause instanceof Error ? cause.message : 'Unable to list registrations.';
        throw error(500, message);
    }
};
export const PATCH = async ({ request, locals }) => {
    if (!locals.user || locals.user.role !== 'admin') {
        throw error(403, 'Forbidden: Admin access only.');
    }
    let body;
    try {
        body = await request.json();
    }
    catch {
        throw error(400, 'Invalid request payload.');
    }
    const { uid, approved } = body;
    if (typeof uid !== 'string' || !uid || typeof approved !== 'boolean') {
        throw error(400, 'Missing or invalid parameters.');
    }
    const db = getFirebaseAdminFirestore();
    const profileRef = db.collection('users').doc(uid);
    try {
        const document = await profileRef.get();
        if (!document.exists) {
            throw error(404, 'User registration request not found.');
        }
        const data = document.data() || {};
        const now = Timestamp.now();
        if (approved) {
            await profileRef.update({
                approved: true,
                isActive: true,
                role: data.role || data.desiredRole || 'operator',
                registrationStatus: 'APPROVED',
                approvedAt: now,
                reviewedAt: now,
                reviewedByUserId: locals.user.uid,
                updatedAt: now
            });
        }
        else {
            await profileRef.update({
                approved: false,
                isActive: false,
                registrationStatus: 'REJECTED',
                rejectedAt: now,
                reviewedAt: now,
                reviewedByUserId: locals.user.uid,
                updatedAt: now
            });
        }
        return json({
            success: true,
            registrationStatus: approved ? 'APPROVED' : 'REJECTED',
            message: approved ? 'Registration approved!' : 'Registration request rejected.'
        });
    }
    catch (cause) {
        const message = cause instanceof Error ? cause.message : 'Unable to update registration.';
        throw error(500, message);
    }
};

import { error, json } from '@sveltejs/kit';
import { getFirebaseAdminFirestore } from '$lib/server/firebase/admin';
import { getFirebaseAdminAuth } from '$lib/server/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { sendMail } from '$lib/server/email';

function resolveDepartmentName(departmentId) {
    if (!departmentId) {
        return 'your assigned department';
    }
    const departmentNames = {
        'dept-civil-supplies': 'Civil Supplies Department',
        'dept-social-welfare': 'Social Welfare Department',
        'dept-local-govt': 'Local Government Department',
        'dept-health': 'Health & Family Welfare Department',
        'dept-drugs-control': 'Drugs Control Department',
        'dept-transport': 'Transport Department',
        'dept-revenue': 'Revenue Department'
    };
    return departmentNames[departmentId] || departmentId;
}
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
export const PATCH = async ({ request, locals, url }) => {
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
    const auth = getFirebaseAdminAuth();
    const profileRef = db.collection('users').doc(uid);
    try {
        const document = await profileRef.get();
        if (!document.exists) {
            throw error(404, 'User registration request not found.');
        }
        const data = document.data() || {};
        const now = Timestamp.now();
        if (approved) {
            const resolvedRole = data.role || data.desiredRole || 'operator';
            const resolvedDepartmentId = data.departmentId || null;
            const emailIssues = [];
            await profileRef.update({
                approved: true,
                isActive: true,
                role: resolvedRole,
                registrationStatus: 'APPROVED',
                approvedAt: now,
                reviewedAt: now,
                reviewedByUserId: locals.user.uid,
                updatedAt: now
            });
            await auth.setCustomUserClaims(uid, {
                role: resolvedRole,
                departmentId: resolvedDepartmentId,
                isActive: true,
                preferredLanguage: data.preferredLanguage || 'en'
            }).catch((cause) => {
                emailIssues.push(cause instanceof Error ? cause.message : 'Unable to update account claims.');
            });
            const mailResult = await sendMail({
                to: data.email,
                subject: 'TN Hub registration approved',
                text: [
                    `Hello ${data.displayName || data.email || 'TN Hub user'},`,
                    '',
                    'Your TN Hub registration has been approved by the administrator.',
                    `You can now sign in at ${new URL('/login', url.origin).toString()}.`,
                    '',
                    `Role: ${resolvedRole === 'department_user' ? 'Department Officer' : 'Operator'}`,
                    `Department: ${resolveDepartmentName(resolvedDepartmentId)}`,
                    '',
                    'Thank you,',
                    'TN Hub Team'
                ].join('\n')
            }).catch((cause) => {
                emailIssues.push(cause instanceof Error ? cause.message : 'Unable to send approval email.');
                return { sent: false, skipped: false };
            });
            return json({
                success: true,
                registrationStatus: 'APPROVED',
                message: 'Registration approved!',
                emailSent: mailResult.sent,
                emailSkipped: mailResult.skipped === true,
                warning: emailIssues.length > 0 ? emailIssues[0] : null
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

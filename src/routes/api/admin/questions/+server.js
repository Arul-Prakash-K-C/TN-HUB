import { error, json } from '@sveltejs/kit';
import { getFirebaseAdminFirestore } from '$lib/server/firebase/admin';
import { createNotification } from '$lib/server/notifications/repository';
import { checkRateLimit } from '$lib/server/security/rateLimit';
import { cleanString, isSafeId } from '$lib/server/security/validation';
export const GET = async ({ locals }) => {
    if (!locals.user) {
        throw error(401, 'Authentication required.');
    }
    const db = getFirebaseAdminFirestore();
    try {
        let snapshot;
        if (locals.user.role === 'admin') {
            // Admin sees all questions
            snapshot = await db.collection('user_questions').get();
        }
        else {
            // Citizens/operators see only their questions
            snapshot = await db.collection('user_questions')
                .where('userId', '==', locals.user.uid)
                .get();
        }
        const questions = [];
        snapshot.forEach(doc => {
            questions.push({ id: doc.id, ...doc.data() });
        });
        return json({ questions: questions.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
    }
    catch (cause) {
        console.error('[admin questions list]', cause);
        throw error(500, 'Unable to list questions.');
    }
};
export const POST = async ({ request, locals }) => {
    if (!locals.user) {
        throw error(401, 'Authentication required.');
    }
    const rateLimit = checkRateLimit(request, `help-question:${locals.user.uid}`, { limit: 10, windowMs: 60_000 });
    if (!rateLimit.allowed) {
        throw error(429, `Too many help desk requests. Try again in ${rateLimit.retryAfterSeconds} seconds.`);
    }
    let body;
    try {
        body = await request.json();
    }
    catch {
        throw error(400, 'Invalid request payload.');
    }
    let subject = '';
    let question = '';
    try {
        subject = cleanString(body.subject, 200);
        question = cleanString(body.question, 3000);
    }
    catch (cause) {
        throw error(400, cause instanceof Error ? cause.message : 'Invalid request payload.');
    }
    if (!subject || !question) {
        throw error(400, 'Subject and Question fields are required.');
    }
    const db = getFirebaseAdminFirestore();
    try {
        const id = `q-${Date.now()}`;
        const newQuestion = {
            id,
            userId: locals.user.uid,
            userName: locals.user.name,
            userRole: locals.user.role,
            subject,
            question,
            reply: null,
            repliedAt: null,
            createdAt: new Date().toISOString()
        };
        await db.collection('user_questions').doc(id).set(newQuestion);
        return json({ question: newQuestion }, { status: 201 });
    }
    catch (cause) {
        console.error('[admin question create]', cause);
        throw error(500, 'Unable to submit question.');
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
    const { questionId, reply } = body;
    if (!isSafeId(questionId, 160) || typeof reply !== 'string' || !reply.trim() || reply.length > 3000) {
        throw error(400, 'Missing or invalid parameters.');
    }
    const db = getFirebaseAdminFirestore();
    const questionRef = db.collection('user_questions').doc(questionId);
    try {
        const doc = await questionRef.get();
        if (!doc.exists) {
            throw error(404, 'Question not found.');
        }
        const data = doc.data() || {};
        const now = new Date().toISOString();
        await questionRef.update({
            reply: reply.trim(),
            repliedAt: now
        });
        // Notify the user who asked the question
        await createNotification({
            recipientId: data.userId,
            type: 'system_announcement',
            title: {
                en: 'New Help Desk Reply',
                ta: 'புதிய உதவி மையம் பதில்'
            },
            message: {
                en: `Admin replied to your question: "${reply.trim().substring(0, 50)}..."`,
                ta: `நிர்வாகி உங்கள் கேள்விக்கு பதிலளித்தார்: "${reply.trim().substring(0, 50)}..."`
            }
        });
        return json({ success: true, message: 'Reply sent!' });
    }
    catch (cause) {
        console.error('[admin question reply]', cause);
        throw error(500, 'Unable to send reply.');
    }
};

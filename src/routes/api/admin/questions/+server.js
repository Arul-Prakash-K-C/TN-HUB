import { error, json } from '@sveltejs/kit';
import { getFirebaseAdminFirestore } from '$lib/server/firebase/admin';
import { createNotification } from '$lib/server/notifications/repository';
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
        const message = cause instanceof Error ? cause.message : 'Unable to list questions.';
        throw error(500, message);
    }
};
export const POST = async ({ request, locals }) => {
    if (!locals.user) {
        throw error(401, 'Authentication required.');
    }
    let body;
    try {
        body = await request.json();
    }
    catch {
        throw error(400, 'Invalid request payload.');
    }
    const { subject, question } = body;
    if (typeof subject !== 'string' || !subject || typeof question !== 'string' || !question) {
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
            subject: subject.trim(),
            question: question.trim(),
            reply: null,
            repliedAt: null,
            createdAt: new Date().toISOString()
        };
        await db.collection('user_questions').doc(id).set(newQuestion);
        return json({ question: newQuestion }, { status: 201 });
    }
    catch (cause) {
        const message = cause instanceof Error ? cause.message : 'Unable to submit question.';
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
    const { questionId, reply } = body;
    if (typeof questionId !== 'string' || !questionId || typeof reply !== 'string' || !reply) {
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
        const message = cause instanceof Error ? cause.message : 'Unable to send reply.';
        throw error(500, message);
    }
};

import { json } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';
import { getFirebaseAdminFirestore } from '$lib/server/firebase/admin';
import { checkRateLimit } from '$lib/server/security/rateLimit';
import { cleanString, isEmail } from '$lib/server/security/validation';

const ALLOWED_SOURCES = new Set([
    'contact_page',
    'help_desk',
    'operator_contact',
    'department_contact'
]);

export const POST = async ({ request, locals }) => {
    const contentLength = Number(request.headers.get('content-length') ?? 0);
    if (Number.isFinite(contentLength) && contentLength > 16_384) {
        return json({ success: false, error: 'Message payload is too large.' }, { status: 413 });
    }
    const rateLimit = checkRateLimit(request, 'contact', { limit: 8, windowMs: 60_000 });
    if (!rateLimit.allowed) {
        return json({ success: false, error: 'Too many messages. Please try again shortly.' }, {
            status: 429,
            headers: { 'retry-after': String(rateLimit.retryAfterSeconds) }
        });
    }

    try {
        const body = await request.json();
        const name = cleanString(body.name, 120);
        const email = cleanString(body.email, 254);
        const message = cleanString(body.message, 3000);
        const source = ALLOWED_SOURCES.has(body.source) ? body.source : 'contact_page';

        if (!name || !email || !message) {
            return json({ success: false, error: 'Name, email, and message are required.' }, { status: 400 });
        }
        if (!isEmail(email)) {
            return json({ success: false, error: 'Enter a valid email address.' }, { status: 400 });
        }

        const user = locals.user ?? null;
        const ticket = {
            name,
            email,
            message,
            source,
            status: 'open',
            priority: source === 'operator_contact' || source === 'department_contact' ? 'high' : 'normal',
            userId: user?.uid ?? user?.id ?? null,
            userRole: user?.role ?? 'public',
            userName: user?.name ?? user?.displayName ?? null,
            userEmail: user?.email ?? null,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        };

        const ref = await getFirebaseAdminFirestore().collection('supportTickets').add(ticket);
        return json({ success: true, ticketId: ref.id }, { status: 201 });
    }
    catch (cause) {
        if (cause instanceof Error && cause.message.includes('characters or fewer')) {
            return json({ success: false, error: cause.message }, { status: 400 });
        }
        console.error('Error saving support ticket:', cause);
        return json({ success: false, error: 'Failed to submit message.' }, { status: 500 });
    }
};

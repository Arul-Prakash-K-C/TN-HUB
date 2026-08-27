import { json } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';
import { getFirebaseAdminFirestore } from '$lib/server/firebase/admin';

const ALLOWED_SOURCES = new Set([
    'contact_page',
    'help_desk',
    'operator_contact',
    'department_contact'
]);

function cleanString(value, maxLength) {
    return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export const POST = async ({ request, locals }) => {
    try {
        const body = await request.json();
        const name = cleanString(body.name, 120);
        const email = cleanString(body.email, 254);
        const message = cleanString(body.message, 3000);
        const source = ALLOWED_SOURCES.has(body.source) ? body.source : 'contact_page';

        if (!name || !message) {
            return json({ success: false, error: 'Name and message are required.' }, { status: 400 });
        }
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
        console.error('Error saving support ticket:', cause);
        return json({ success: false, error: 'Failed to submit message.' }, { status: 500 });
    }
};

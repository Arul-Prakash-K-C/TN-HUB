import { json } from '@sveltejs/kit';
import { confirmSimulatedApplicationPayment, submitCitizenDraft } from '$lib/server/applications/repository';
import { checkRateLimit } from '$lib/server/security/rateLimit';

export const POST = async ({ locals, params, request }) => {
    if (!locals.user)
        return json({ message: 'Authentication required.' }, { status: 401 });
    if (!params.id)
        return json({ message: 'Application ID is required.' }, { status: 400 });
    const rateLimit = checkRateLimit(request, `payment-confirm:${locals.user.uid}:${params.id}`, { limit: 8, windowMs: 60_000 });
    if (!rateLimit.allowed) {
        return json({ message: `Too many payment attempts. Try again in ${rateLimit.retryAfterSeconds} seconds.` }, { status: 429 });
    }
    let body;
    try {
        body = await request.json();
    }
    catch {
        return json({ message: 'Invalid payment request.' }, { status: 400 });
    }
    try {
        const payment = await confirmSimulatedApplicationPayment(locals.user, params.id, {
            otp: body?.otp,
            outcome: body?.outcome
        });
        if (payment.status === 'FAILED') {
            return json({ payment, message: 'Payment failed in simulation. You can retry payment.' });
        }
        const application = await submitCitizenDraft(locals.user, params.id);
        return json({ payment, application, message: 'Application submitted.' });
    }
    catch (cause) {
        const message = cause instanceof Error ? cause.message : 'Unable to confirm simulated payment.';
        return json({ message }, { status: message === 'Application not found.' ? 404 : 400 });
    }
};

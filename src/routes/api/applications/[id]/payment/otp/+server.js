import { json } from '@sveltejs/kit';
import { requestApplicationPaymentOtp } from '$lib/server/applications/repository';
import { checkRateLimit } from '$lib/server/security/rateLimit';

export const POST = async ({ locals, params, request }) => {
    if (!locals.user)
        return json({ message: 'Authentication required.' }, { status: 401 });
    if (!params.id)
        return json({ message: 'Application ID is required.' }, { status: 400 });
    const rateLimit = checkRateLimit(request, `payment-otp:${locals.user.uid}:${params.id}`, { limit: 5, windowMs: 60_000 });
    if (!rateLimit.allowed) {
        return json({ message: `Too many payment OTP requests. Try again in ${rateLimit.retryAfterSeconds} seconds.` }, { status: 429 });
    }
    try {
        const payment = await requestApplicationPaymentOtp(locals.user, params.id);
        return json({ payment });
    }
    catch (cause) {
        const message = cause instanceof Error ? cause.message : 'Unable to start simulated payment.';
        return json({ message }, { status: message === 'Application not found.' ? 404 : 400 });
    }
};

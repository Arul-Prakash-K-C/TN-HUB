import { error, json } from '@sveltejs/kit';
import { normalizeUserRole } from '$lib/auth/identity';
import { createCitizenApplication } from '$lib/server/applications/repository';
import { checkRateLimit } from '$lib/server/security/rateLimit';
import { isSafeFormData } from '$lib/server/security/validation';
function isAuthenticatedCitizen(user) {
    return !!user?.uid && (normalizeUserRole(user.role) === 'citizen' || normalizeUserRole(user.role) === 'operator');
}
export const POST = async ({ request, locals }) => {
    if (!locals.user) {
        throw error(401, 'Authentication required.');
    }
    if (!isAuthenticatedCitizen(locals.user)) {
        throw error(403, 'Only citizens and operators can create applications.');
    }
    const rateLimit = checkRateLimit(request, `application-create:${locals.user.uid}`, { limit: 12, windowMs: 60_000 });
    if (!rateLimit.allowed) {
        throw error(429, `Too many application requests. Try again in ${rateLimit.retryAfterSeconds} seconds.`);
    }
    let body;
    try {
        body = (await request.json());
    }
    catch {
        throw error(400, 'Invalid application request.');
    }
    if (typeof body.serviceId !== 'string' || body.serviceId.length === 0 || body.serviceId.length > 120) {
        throw error(400, 'A valid service is required.');
    }
    if (!isSafeFormData(body.formData)) {
        throw error(400, 'Application form data is invalid.');
    }
    // Submission must use the workflow endpoint after required documents are
    // persisted; this endpoint deliberately creates drafts only.
    if (body.submit === true) {
        throw error(400, 'Create a draft before submitting an application.');
    }
    try {
        const application = await createCitizenApplication(locals.user, {
            serviceId: body.serviceId,
            formData: body.formData,
            submit: false
        });
        return json({ application }, { status: 201 });
    }
    catch (cause) {
        const message = cause instanceof Error ? cause.message : 'Unable to create the application.';
        throw error(400, message);
    }
};

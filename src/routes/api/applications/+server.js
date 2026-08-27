import { error, json } from '@sveltejs/kit';
import { normalizeUserRole } from '$lib/auth/identity';
import { createCitizenApplication } from '$lib/server/applications/repository';
function isFormData(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        return false;
    const entries = Object.entries(value);
    return entries.length <= 100 && entries.every(([key, entry]) => key.length <= 100 &&
        (typeof entry === 'string' || typeof entry === 'number' || typeof entry === 'boolean' || entry === null || typeof entry === 'undefined') &&
        (typeof entry !== 'string' || entry.length <= 5000) &&
        (typeof entry !== 'number' || Number.isFinite(entry)));
}
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
    if (!isFormData(body.formData)) {
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

import { error, json } from '@sveltejs/kit';
import { deleteApplicationDraft, updateApplicationDraft } from '$lib/server/applications/repository';
import { isSafeFormData } from '$lib/server/security/validation';
export const PUT = async ({ params, request, locals }) => {
    if (!locals.user)
        throw error(401, 'Authentication required.');
    let body;
    try {
        body = await request.json();
    }
    catch {
        throw error(400, 'Invalid update request.');
    }
    if (!isSafeFormData(body.formData)) {
        throw error(400, 'Invalid form data.');
    }
    const id = params.id;
    if (!id) {
        throw error(400, 'Application ID is required.');
    }
    try {
        const application = await updateApplicationDraft(locals.user, id, body.formData);
        return json({ application });
    }
    catch (cause) {
        const message = cause instanceof Error ? cause.message : 'Unable to update this application.';
        throw error(400, message);
    }
};
export const DELETE = async ({ params, locals }) => {
    if (!locals.user)
        throw error(401, 'Authentication required.');
    if (!params.id)
        throw error(400, 'Application ID is required.');
    try {
        await deleteApplicationDraft(locals.user, params.id);
        return json({ success: true });
    }
    catch (cause) {
        const message = cause instanceof Error ? cause.message : 'Unable to delete this application.';
        throw error(message === 'Application not found.' ? 404 : 400, message);
    }
};

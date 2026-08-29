import { error, json } from '@sveltejs/kit';
import { createAssistedApplicationDraft } from '$lib/server/applications/repository';
import { isSafeFormData } from '$lib/server/security/validation';
export const POST = async ({ request, locals }) => {
    if (!locals.user)
        throw error(401, 'Authentication required.');
    let body;
    try {
        body = await request.json();
    }
    catch {
        throw error(400, 'Invalid service application request.');
    }
    let citizenId = typeof body.citizenId === 'string' && body.citizenId.trim() !== ''
        ? body.citizenId.trim()
        : `kiosk-temp-${Date.now()}`;
    if (typeof body.serviceId !== 'string' || !isSafeFormData(body.formData)) {
        throw error(400, 'A service and valid form data are required.');
    }
    try {
        return json({ application: await createAssistedApplicationDraft(locals.user, citizenId, {
                serviceId: body.serviceId,
                formData: body.formData
            }) }, { status: 201 });
    }
    catch (cause) {
        const message = cause instanceof Error ? cause.message : 'Unable to create the assisted draft.';
        throw error(message.includes('not found') ? 404 : 400, message);
    }
};

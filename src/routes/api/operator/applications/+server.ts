import { error, json, type RequestHandler } from '@sveltejs/kit';
import { createAssistedApplicationDraft } from '$lib/server/applications/repository';

function isFormData(value: unknown): value is Record<string, string | number | boolean | null> {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
	return Object.entries(value as Record<string, unknown>).every(([key, entry]) =>
		key.length <= 100 &&
		(typeof entry === 'string' || typeof entry === 'number' || typeof entry === 'boolean' || entry === null)
	);
}

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'Authentication required.');

	let body: { citizenId?: unknown; serviceId?: unknown; formData?: unknown };
	try {
		body = await request.json() as { citizenId?: unknown; serviceId?: unknown; formData?: unknown };
	} catch {
		throw error(400, 'Invalid assisted application request.');
	}

	if (typeof body.citizenId !== 'string' || typeof body.serviceId !== 'string' || !isFormData(body.formData)) {
		throw error(400, 'A citizen account, service, and valid form data are required.');
	}

	try {
		return json({ application: await createAssistedApplicationDraft(locals.user, body.citizenId, {
			serviceId: body.serviceId,
			formData: body.formData
		}) }, { status: 201 });
	} catch (cause) {
		const message = cause instanceof Error ? cause.message : 'Unable to create the assisted draft.';
		throw error(message.includes('not found') ? 404 : 400, message);
	}
};

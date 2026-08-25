import { error, json, type RequestHandler } from '@sveltejs/kit';
import { updateApplicationDraft } from '$lib/server/applications/repository';

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) throw error(401, 'Authentication required.');

	let body: { formData?: unknown };
	try {
		body = await request.json() as { formData?: unknown };
	} catch {
		throw error(400, 'Invalid update request.');
	}

	if (!body.formData || typeof body.formData !== 'object' || Array.isArray(body.formData)) {
		throw error(400, 'Invalid form data.');
	}

	try {
		const application = await updateApplicationDraft(locals.user, params.id, body.formData as Record<string, any>);
		return json({ application });
	} catch (cause) {
		const message = cause instanceof Error ? cause.message : 'Unable to update this application.';
		throw error(400, message);
	}
};

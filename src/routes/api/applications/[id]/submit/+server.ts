import { error, json, type RequestHandler } from '@sveltejs/kit';
import { submitCitizenDraft } from '$lib/server/applications/repository';

export const POST: RequestHandler = async ({ locals, params }) => {
	if (!locals.user) throw error(401, 'Authentication required.');
	if (!params.id) throw error(400, 'Application ID is required.');

	try {
		return json({ application: await submitCitizenDraft(locals.user, params.id) });
	} catch (cause) {
		const message = cause instanceof Error ? cause.message : 'Unable to submit this application.';
		throw error(message === 'Application not found.' ? 404 : 400, message);
	}
};

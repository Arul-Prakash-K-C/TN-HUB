import { error, json, type RequestHandler } from '@sveltejs/kit';
import { reviewApplicationDocument } from '$lib/server/applications/repository';

export const PATCH: RequestHandler = async ({ request, locals, params }) => {
	if (!locals.user) throw error(401, 'Authentication required.');
	if (!params.id || !params.documentId) throw error(400, 'Application and document IDs are required.');

	let body: { status?: unknown; comment?: unknown };
	try {
		body = await request.json() as { status?: unknown; comment?: unknown };
	} catch {
		throw error(400, 'Invalid document review request.');
	}

	if (body.status !== 'verified' && body.status !== 'rejected') throw error(400, 'A valid document status is required.');
	if (body.comment !== undefined && (typeof body.comment !== 'string' || body.comment.length > 2000)) {
		throw error(400, 'Invalid official remarks.');
	}

	try {
		return json({ application: await reviewApplicationDocument(locals.user, params.id, params.documentId, body.status, body.comment) });
	} catch (cause) {
		const message = cause instanceof Error ? cause.message : 'Unable to review this document.';
		throw error(message.includes('not found') ? 404 : 400, message);
	}
};

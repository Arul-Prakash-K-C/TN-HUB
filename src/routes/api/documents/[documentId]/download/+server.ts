import { error, json, type RequestHandler } from '@sveltejs/kit';
import { getAuthorizedDocumentDownloadUrl } from '$lib/server/documents/repository';

export const GET: RequestHandler = async ({ locals, params }) => {
	if (!locals.user) throw error(401, 'Authentication required.');
	if (!params.documentId) throw error(400, 'Document ID is required.');

	try {
		return json({ url: await getAuthorizedDocumentDownloadUrl(locals.user, params.documentId) });
	} catch (cause) {
		const message = cause instanceof Error ? cause.message : 'Unable to access this document.';
		throw error(message.includes('not found') ? 404 : 400, message);
	}
};

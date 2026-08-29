import { error, json } from '@sveltejs/kit';
import { deleteCitizenDocument } from '$lib/server/documents/repository';

export const DELETE = async ({ locals, params }) => {
    if (!locals.user) {
        throw error(401, 'Authentication required.');
    }
    if (!params.documentId) {
        throw error(400, 'Document ID is required.');
    }
    try {
        const result = await deleteCitizenDocument(locals.user, params.documentId);
        return json(result);
    } catch (cause) {
        const message = cause instanceof Error ? cause.message : 'Unable to delete the document.';
        if (message === 'Document not found.') {
            throw error(404, message);
        }
        if (message.includes('Only citizens') || message.includes('cannot be deleted')) {
            throw error(403, message);
        }
        throw error(400, message);
    }
};

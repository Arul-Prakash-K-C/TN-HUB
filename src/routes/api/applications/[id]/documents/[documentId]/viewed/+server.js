import { error, json } from '@sveltejs/kit';
import { markApplicationDocumentViewed } from '$lib/server/applications/repository';

export const POST = async ({ locals, params }) => {
    if (!locals.user)
        throw error(401, 'Authentication required.');
    if (!params.id || !params.documentId)
        throw error(400, 'Application and document IDs are required.');
    try {
        return json({ application: await markApplicationDocumentViewed(locals.user, params.id, params.documentId) });
    }
    catch (cause) {
        const message = cause instanceof Error ? cause.message : 'Unable to record document view.';
        throw error(message.includes('not found') ? 404 : 400, message);
    }
};

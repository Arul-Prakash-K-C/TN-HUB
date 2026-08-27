import { error, json } from '@sveltejs/kit';
import { transitionApplication } from '$lib/server/applications/repository';
export const POST = async ({ request, locals, params }) => {
    if (!locals.user)
        throw error(401, 'Authentication required.');
    if (!params.id)
        throw error(400, 'Application ID is required.');
    let body;
    try {
        body = await request.json();
    }
    catch {
        throw error(400, 'Invalid workflow action request.');
    }
    if (typeof body.transitionId !== 'string' || body.transitionId.length === 0 || body.transitionId.length > 120) {
        throw error(400, 'A valid workflow action is required.');
    }
    if (body.comment !== undefined && (typeof body.comment !== 'string' || body.comment.length > 2000)) {
        throw error(400, 'Invalid official remarks.');
    }
    try {
        return json({ application: await transitionApplication(locals.user, params.id, {
                transitionId: body.transitionId,
                comment: body.comment
            }) });
    }
    catch (cause) {
        const message = cause instanceof Error ? cause.message : 'Unable to update this application.';
        throw error(message === 'Application not found.' ? 404 : 400, message);
    }
};

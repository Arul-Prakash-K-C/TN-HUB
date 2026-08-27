import { json } from '@sveltejs/kit';
import { submitCitizenDraft } from '$lib/server/applications/repository';
export const POST = async ({ locals, params }) => {
    if (!locals.user)
        return json({ message: 'Authentication required.' }, { status: 401 });
    if (!params.id)
        return json({ message: 'Application ID is required.' }, { status: 400 });
    try {
        return json({ application: await submitCitizenDraft(locals.user, params.id) });
    }
    catch (cause) {
        console.error('[API Submit Error]', cause);
        const message = cause instanceof Error ? cause.message : 'Unable to submit this application.';
        return json({ message }, { status: message === 'Application not found.' ? 404 : 400 });
    }
};

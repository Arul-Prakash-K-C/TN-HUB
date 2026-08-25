import type { PageServerLoad } from './$types';
import { getApplicationForUser, getApplicationWorkflowActions } from '$lib/server/applications/repository';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) return { application: null, availableActions: [] };
	const application = await getApplicationForUser(locals.user, params.id);
	return {
		application,
		availableActions: application ? await getApplicationWorkflowActions(locals.user, params.id) : []
	};
};

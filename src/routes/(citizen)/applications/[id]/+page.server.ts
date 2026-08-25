import type { PageServerLoad } from './$types';
import { getApplicationForUser } from '$lib/server/applications/repository';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) return { application: null };
	return { application: await getApplicationForUser(locals.user, params.id) };
};

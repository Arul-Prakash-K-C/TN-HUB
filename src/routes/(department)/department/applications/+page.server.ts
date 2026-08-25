import type { PageServerLoad } from './$types';
import { listApplicationsForUser } from '$lib/server/applications/repository';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) return { applications: [] };
	return { applications: await listApplicationsForUser(locals.user) };
};

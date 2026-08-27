import { listApplicationsForUser } from '$lib/server/applications/repository';
export const load = async ({ locals }) => {
    if (!locals.user)
        return { applications: [] };
    return { applications: await listApplicationsForUser(locals.user) };
};

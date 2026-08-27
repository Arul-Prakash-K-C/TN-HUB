import { listApplicationsForUser } from '$lib/server/applications/repository';
import { loadPublicCatalog } from '$lib/server/catalog/repository';
export const load = async ({ locals }) => {
    if (!locals.user)
        return { applications: [], catalog: { services: [], departments: [] } };
    return {
        applications: await listApplicationsForUser(locals.user),
        catalog: await loadPublicCatalog()
    };
};

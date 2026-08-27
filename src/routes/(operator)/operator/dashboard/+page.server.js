import { loadPublicCatalog } from '$lib/server/catalog/repository';
import { listApplicationsForUser } from '$lib/server/applications/repository';
export const load = async ({ locals }) => {
    const catalog = await loadPublicCatalog();
    const applications = locals.user ? await listApplicationsForUser(locals.user) : [];
    return {
        catalog,
        applications
    };
};

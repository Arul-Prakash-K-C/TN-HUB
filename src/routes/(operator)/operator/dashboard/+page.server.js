import { loadPublicCatalog } from '$lib/server/catalog/repository';
import { listApplicationsForUser } from '$lib/server/applications/repository';
import { requireRole } from '$lib/server/security/authorize';
export const load = async ({ locals }) => {
    const user = requireRole(locals, ['operator', 'admin']);
    const catalog = await loadPublicCatalog();
    const applications = await listApplicationsForUser(user);
    return {
        catalog,
        applications
    };
};

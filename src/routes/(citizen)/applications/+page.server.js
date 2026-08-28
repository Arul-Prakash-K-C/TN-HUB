import { listApplicationsForUser } from '$lib/server/applications/repository';
import { loadPublicCatalog } from '$lib/server/catalog/repository';
import { requireRole } from '$lib/server/security/authorize';
export const load = async ({ locals }) => {
    const user = requireRole(locals, ['citizen', 'operator', 'admin']);
    return {
        applications: await listApplicationsForUser(user),
        catalog: await loadPublicCatalog()
    };
};

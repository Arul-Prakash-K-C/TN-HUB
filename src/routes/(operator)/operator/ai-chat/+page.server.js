import { loadPublicCatalog } from '$lib/server/catalog/repository';
import { listApplicationsForUser } from '$lib/server/applications/repository';
import { listCitizenDocuments } from '$lib/server/documents/repository';
import { requireRole } from '$lib/server/security/authorize';
export const load = async ({ locals }) => {
    const user = requireRole(locals, ['operator', 'admin']);
    const catalog = await loadPublicCatalog();
    const [applications, documents] = await Promise.all([
        listApplicationsForUser(user),
        listCitizenDocuments(user)
    ]);
    return {
        catalog,
        applications,
        documents,
        user
    };
};

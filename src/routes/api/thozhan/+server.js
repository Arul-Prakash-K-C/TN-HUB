import { json } from '@sveltejs/kit';
import { loadPublicCatalog } from '$lib/server/catalog/repository';
import { listApplicationsForUser } from '$lib/server/applications/repository';
import { listCitizenDocuments } from '$lib/server/documents/repository';
export const GET = async ({ locals }) => {
    const catalog = await loadPublicCatalog();
    if (!locals.user) {
        return json({
            catalog,
            applications: [],
            documents: [],
            user: null
        });
    }
    const [applications, documents] = await Promise.all([
        listApplicationsForUser(locals.user),
        listCitizenDocuments(locals.user)
    ]);
    return json({
        catalog,
        applications,
        documents,
        user: locals.user
    });
};

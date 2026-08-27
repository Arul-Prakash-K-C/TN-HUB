import { error } from '@sveltejs/kit';
import { loadPublicCatalog, loadPublicServiceBySlug } from '$lib/server/catalog/repository';
export const load = async ({ params }) => {
    const [catalogService, catalog] = await Promise.all([
        loadPublicServiceBySlug(params.slug),
        loadPublicCatalog()
    ]);
    if (!catalogService)
        throw error(404, 'Service not found.');
    return { catalogService, catalog };
};

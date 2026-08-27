import { loadPublicCatalog } from '$lib/server/catalog/repository';
export const load = async () => {
    return { catalog: await loadPublicCatalog() };
};

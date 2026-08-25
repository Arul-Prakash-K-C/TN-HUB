import type { PageServerLoad } from './$types';
import { loadPublicCatalog } from '$lib/server/catalog/repository';

export const load: PageServerLoad = async () => ({
  catalog: await loadPublicCatalog()
});

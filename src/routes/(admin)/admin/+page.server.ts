import type { PageServerLoad } from './$types';
import { loadAdminCatalog } from '$lib/server/catalog/repository';

export const load: PageServerLoad = async () => ({
  catalog: await loadAdminCatalog()
});

import type { PageServerLoad } from './$types';
import { loadPublicCatalog } from '$lib/server/catalog/repository';
import { listApplicationsForUser } from '$lib/server/applications/repository';

export const load: PageServerLoad = async ({ locals }) => {
  const catalog = await loadPublicCatalog();
  const applications = locals.user ? await listApplicationsForUser(locals.user) : [];

  return {
    catalog,
    applications
  };
};

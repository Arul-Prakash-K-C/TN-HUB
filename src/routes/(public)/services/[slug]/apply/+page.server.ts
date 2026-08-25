import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { loadPublicServiceBySlug } from '$lib/server/catalog/repository';

export const load: PageServerLoad = async ({ params }) => {
  const catalogService = await loadPublicServiceBySlug(params.slug);
  if (!catalogService) throw error(404, 'Service not found.');
  return { catalogService };
};

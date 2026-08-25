import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { loadPublicServiceBySlug } from '$lib/server/catalog/repository';

export const load: PageServerLoad = async ({ params }) => {
  const catalogService = await loadPublicServiceBySlug(params.slug);
  if (!catalogService) throw error(404, 'Service not found.');
  
  if (catalogService.implementationMode === 'EXTERNAL_REDIRECT') {
    throw redirect(303, catalogService.externalUrl || `/services/${params.slug}`);
  }
  


  return { catalogService };
};

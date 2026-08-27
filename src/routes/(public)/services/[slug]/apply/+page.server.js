import { error, redirect } from '@sveltejs/kit';
import { loadPublicServiceBySlug } from '$lib/server/catalog/repository';
import { findLatestDraftForCitizenByService, getApplicationForUser } from '$lib/server/applications/repository';
export const load = async ({ params, locals, url }) => {
    const catalogService = await loadPublicServiceBySlug(params.slug);
    if (!catalogService)
        throw error(404, 'Service not found.');
    if (catalogService.implementationMode === 'EXTERNAL_REDIRECT') {
        throw redirect(303, catalogService.externalUrl || `/services/${params.slug}`);
    }
    let draftApplication = null;
    const userRole = locals.user?.role;
    if (userRole === 'citizen' || userRole === 'operator') {
        const draftId = url.searchParams.get('draft');
        if (draftId) {
            const existingDraft = await getApplicationForUser(locals.user, draftId);
            if (existingDraft && (existingDraft.status === 'DRAFT' || existingDraft.status === 'CLARIFICATION_REQUESTED') && existingDraft.serviceId === catalogService.id) {
                draftApplication = existingDraft;
            }
        }
        if (!draftApplication && userRole === 'citizen') {
            draftApplication = await findLatestDraftForCitizenByService(locals.user, catalogService.id);
        }
    }
    return { catalogService, draftApplication };
};

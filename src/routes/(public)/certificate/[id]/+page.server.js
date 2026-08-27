import { error } from '@sveltejs/kit';
import { getApplicationForUser } from '$lib/server/applications/repository';
import { loadPublicServiceById } from '$lib/server/catalog/repository';
export const load = async ({ params, locals }) => {
    const { id } = params;
    if (!locals.user) {
        throw error(401, 'Login is required to view this certificate.');
    }
    try {
        const application = await getApplicationForUser(locals.user, id);
        if (!application) {
            throw error(404, 'Certificate not found');
        }
        if (!['APPROVED', 'COMPLETED', 'CERTIFICATE_GENERATED'].includes(application.status)) {
            throw error(404, 'Certificate not generated or application not approved');
        }
        const service = await loadPublicServiceById(application.serviceId);
        if (!service) {
            throw error(404, 'Service details not found');
        }
        return {
            application,
            service
        };
    }
    catch (err) {
        throw error(404, 'Certificate not found');
    }
};

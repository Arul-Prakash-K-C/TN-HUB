import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getApplicationForUser } from '$lib/server/applications/repository';
import { getCatalogService } from '$lib/server/catalog/repository';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		throw error(401, 'Authentication required.');
	}

	if (locals.user.role !== 'operator' && locals.user.role !== 'admin') {
		throw error(403, 'Only operators can edit assisted drafts.');
	}

	const application = await getApplicationForUser(locals.user, params.id);
	if (!application) {
		throw error(404, 'Application draft not found.');
	}

	if (application.status !== 'DRAFT') {
		throw error(400, 'Only draft applications can be edited.');
	}

	const catalogService = await getCatalogService(application.serviceId);
	if (!catalogService) {
		throw error(404, 'Service details not found.');
	}

	return {
		application,
		catalogService
	};
};

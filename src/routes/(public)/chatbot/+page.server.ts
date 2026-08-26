import type { PageServerLoad } from './$types';
import { loadPublicCatalog } from '$lib/server/catalog/repository';
import { listApplicationsForUser } from '$lib/server/applications/repository';
import { listCitizenDocuments } from '$lib/server/documents/repository';

export const load: PageServerLoad = async ({ locals }) => {
	const catalog = await loadPublicCatalog();

	if (!locals.user) {
		return {
			catalog,
			applications: [],
			documents: [],
			user: null
		};
	}

	const [applications, documents] = await Promise.all([
		listApplicationsForUser(locals.user),
		listCitizenDocuments(locals.user)
	]);

	return {
		catalog,
		applications,
		documents,
		user: locals.user
	};
};

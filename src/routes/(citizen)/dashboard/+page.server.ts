import type { PageServerLoad } from './$types';
import { listApplicationsForUser } from '$lib/server/applications/repository';
import { listCitizenDocuments } from '$lib/server/documents/repository';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) return { applications: [], documentCount: 0 };
	const [applications, documents] = await Promise.all([
		listApplicationsForUser(locals.user),
		listCitizenDocuments(locals.user)
	]);
	return { applications, documentCount: documents.length };
};

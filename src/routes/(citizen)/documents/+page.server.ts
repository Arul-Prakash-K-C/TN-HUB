import type { PageServerLoad } from './$types';
import { listCitizenDocuments } from '$lib/server/documents/repository';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) return { documents: [] };
	return { documents: await listCitizenDocuments(locals.user) };
};

import { listCitizenDocuments } from '$lib/server/documents/repository';
export const load = async ({ locals }) => {
    if (!locals.user)
        return { documents: [] };
    return { documents: await listCitizenDocuments(locals.user) };
};

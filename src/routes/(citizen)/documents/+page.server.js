import { listCitizenDocuments } from '$lib/server/documents/repository';
import { requireRole } from '$lib/server/security/authorize';
export const load = async ({ locals }) => {
    const user = requireRole(locals, ['citizen', 'admin']);
    return { documents: await listCitizenDocuments(user) };
};

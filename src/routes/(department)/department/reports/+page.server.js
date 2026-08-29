import { listApplicationsForUser } from '$lib/server/applications/repository';
import { requireDepartmentUser } from '$lib/server/security/authorize';
export const load = async ({ locals }) => {
    const user = requireDepartmentUser(locals);
    return { applications: await listApplicationsForUser(user) };
};

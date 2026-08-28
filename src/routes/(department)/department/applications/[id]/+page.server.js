import { getApplicationForUser, getApplicationWorkflowActions } from '$lib/server/applications/repository';
import { requireDepartmentUser } from '$lib/server/security/authorize';
export const load = async ({ locals, params }) => {
    const user = requireDepartmentUser(locals);
    const application = await getApplicationForUser(user, params.id);
    return {
        application,
        availableActions: application ? await getApplicationWorkflowActions(user, params.id) : []
    };
};

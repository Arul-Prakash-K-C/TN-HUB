import { listNotificationsForUser } from '$lib/server/notifications/repository';
import { requireDepartmentUser } from '$lib/server/security/authorize';
export const load = async ({ locals }) => {
    const user = requireDepartmentUser(locals);
    return { notifications: await listNotificationsForUser(user) };
};

import { listNotificationsForUser } from '$lib/server/notifications/repository';
import { requireRole } from '$lib/server/security/authorize';

export const load = async ({ locals }) => {
    const user = requireRole(locals, ['operator', 'admin']);
    return { notifications: await listNotificationsForUser(user) };
};

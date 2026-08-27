import { error, json } from '@sveltejs/kit';
import { getUnreadNotificationCount } from '$lib/server/notifications/repository';
export const GET = async ({ locals }) => {
    if (!locals.user)
        throw error(401, 'Authentication required.');
    return json({ count: await getUnreadNotificationCount(locals.user) });
};

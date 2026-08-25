import { error, json, type RequestHandler } from '@sveltejs/kit';
import { getUnreadNotificationCount } from '$lib/server/notifications/repository';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) throw error(401, 'Authentication required.');
	return json({ count: await getUnreadNotificationCount(locals.user) });
};

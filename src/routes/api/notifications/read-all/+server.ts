import { error, json, type RequestHandler } from '@sveltejs/kit';
import { markAllNotificationsRead } from '$lib/server/notifications/repository';

export const POST: RequestHandler = async ({ locals }) => {
	if (!locals.user) throw error(401, 'Authentication required.');
	return json({ updated: await markAllNotificationsRead(locals.user) });
};

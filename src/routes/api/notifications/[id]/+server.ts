import { error, json, type RequestHandler } from '@sveltejs/kit';
import { markNotificationRead } from '$lib/server/notifications/repository';

export const PATCH: RequestHandler = async ({ locals, params }) => {
	if (!locals.user) throw error(401, 'Authentication required.');
	if (!params.id) throw error(400, 'Notification ID is required.');

	try {
		await markNotificationRead(locals.user, params.id);
		return json({ ok: true });
	} catch (cause) {
		const message = cause instanceof Error ? cause.message : 'Unable to update this notification.';
		throw error(message === 'Notification not found.' ? 404 : 400, message);
	}
};

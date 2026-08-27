import { error, json } from '@sveltejs/kit';
import { listNotificationsForUser } from '$lib/server/notifications/repository';

export const GET = async ({ locals }) => {
  if (!locals.user) {
    throw error(401, 'Authentication required.');
  }
  try {
    const notifications = await listNotificationsForUser(locals.user);
    return json({ notifications });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Unable to list notifications.';
    throw error(500, message);
  }
};

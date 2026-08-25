import { listNotificationsForUser } from '$lib/server/notifications/repository';

export const load = async ({ locals }) => {
  if (!locals.user) return { notifications: [] };
  return { notifications: await listNotificationsForUser(locals.user) };
};

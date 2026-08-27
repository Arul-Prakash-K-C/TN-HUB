import { redirect } from '@sveltejs/kit';
// Phase 1's duplicate officer route held a browser-only mock work queue.
// Keep the URL, but route it to the server-authorized department portal.
export const load = async () => {
    throw redirect(302, '/department/dashboard');
};

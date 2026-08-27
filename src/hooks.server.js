import { redirect } from '@sveltejs/kit';
import { SESSION_COOKIE_NAME, getVerifiedSessionUser } from '$lib/server/auth/session';
import { canAccessRoute } from '$lib/utils/authGuard';
export const handle = async ({ event, resolve }) => {
    const pathname = event.url.pathname;
    // Session cookies are created by Firebase Admin and cannot be forged by the browser.
    const authCookie = event.cookies.get(SESSION_COOKIE_NAME);
    let user = null;
    if (authCookie) {
        try {
            user = await getVerifiedSessionUser(authCookie);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            const isAuthFailure = message.includes('expired') ||
                message.includes('revoked') ||
                message.includes('invalid') ||
                message.includes('disabled') ||
                err?.code?.startsWith('auth/');
            if (isAuthFailure) {
                event.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
            }
        }
    }
    // Evaluate route accessibility
    const guard = canAccessRoute(user, pathname);
    if (!guard.allowed && guard.redirectTo) {
        throw redirect(302, guard.redirectTo);
    }
    // Pass user context to event.locals if authenticated
    event.locals.user = user;
    const response = await resolve(event);
    return response;
};

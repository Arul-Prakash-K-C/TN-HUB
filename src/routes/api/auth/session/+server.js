import { error, json } from '@sveltejs/kit';
import { createSessionFromIdToken, SESSION_COOKIE_NAME, SESSION_DURATION_MS } from '$lib/server/auth/session';
const cookieOptions = {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: !import.meta.env.DEV,
    maxAge: Math.floor(SESSION_DURATION_MS / 1000)
};
export const POST = async ({ request, cookies }) => {
    let idToken;
    try {
        ({ idToken } = (await request.json()));
    }
    catch {
        throw error(400, 'A Firebase ID token is required.');
    }
    if (typeof idToken !== 'string' || idToken.length === 0) {
        throw error(400, 'A Firebase ID token is required.');
    }
    try {
        const { sessionCookie, user } = await createSessionFromIdToken(idToken);
        cookies.set(SESSION_COOKIE_NAME, sessionCookie, cookieOptions);
        return json({ user });
    }
    catch (cause) {
        const message = cause instanceof Error ? cause.message : 'Unable to establish a secure session.';
        throw error(401, message);
    }
};
export const DELETE = async ({ cookies }) => {
    cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
    return new Response(null, { status: 204 });
};

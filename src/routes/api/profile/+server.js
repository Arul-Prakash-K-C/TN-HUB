import { error, json } from '@sveltejs/kit';
import { updateUserProfilePreferences } from '$lib/server/users/profile';
const protectedProfileFields = new Set(['uid', 'email', 'displayName', 'role', 'departmentId', 'isActive']);
/** Persists only user-controlled profile preferences behind the verified session. */
export const PATCH = async ({ request, locals }) => {
    if (!locals.user)
        throw error(401, 'Authentication required.');
    let body;
    try {
        const candidate = await request.json();
        if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate))
            throw new Error();
        body = candidate;
    }
    catch {
        throw error(400, 'A valid profile update is required.');
    }
    if (Object.keys(body).some((key) => protectedProfileFields.has(key))) {
        throw error(403, 'Role, department, identity, and account status are managed by the platform.');
    }
    if (body.phone !== undefined && body.phone !== null && typeof body.phone !== 'string') {
        throw error(400, 'Phone must be a string or null.');
    }
    if (body.preferredLanguage !== undefined && body.preferredLanguage !== 'en' && body.preferredLanguage !== 'ta') {
        throw error(400, 'Preferred language must be en or ta.');
    }
    const profile = await updateUserProfilePreferences(locals.user, {
        phone: body.phone,
        preferredLanguage: body.preferredLanguage
    });
    return json({
        phone: profile.phone,
        preferredLanguage: profile.preferredLanguage,
        updatedAt: profile.updatedAt.toDate().toISOString()
    });
};

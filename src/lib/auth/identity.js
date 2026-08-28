const roleAliases = {
    citizen: 'citizen',
    department_user: 'department_user',
    officer: 'department_user',
    dept_admin: 'department_user',
    operator: 'operator',
    admin: 'admin',
    tnhub_admin: 'admin'
};
function claimString(value) {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}
/**
 * Maps a trusted Firebase custom claim to a supported application role.
 * Unknown or absent roles deliberately receive the least-privileged citizen
 * role. Claims are verified by Firebase Admin on the server before use for
 * authorization; the client mapping is only for presentation.
 */
export function normalizeUserRole(value) {
    return typeof value === 'string' ? roleAliases[value] ?? 'citizen' : 'citizen';
}
/** Creates the UI-safe user shape from a Firebase identity and signed claims. */
export function createAuthenticatedUser(input) {
    const claims = input.claims ?? {};
    const role = normalizeUserRole(claims.role);
    const email = input.email ?? '';
    const displayName = input.displayName?.trim() || claimString(claims.displayName) || email.split('@')[0] || 'TN Kuviyam user';
    const preferredLanguage = claims.preferredLanguage === 'ta' ? 'ta' : 'en';
    const createdAt = new Date((input.issuedAt ?? Math.floor(Date.now() / 1000)) * 1000).toISOString();
    const departmentId = role === 'department_user' ? claimString(claims.departmentId) : undefined;
    return {
        id: input.uid,
        uid: input.uid,
        email,
        name: displayName,
        displayName,
        role,
        departmentId,
        departmentName: role === 'department_user' ? claimString(claims.departmentName) : undefined,
        photoURL: input.photoURL ?? undefined,
        avatar: input.photoURL ?? undefined,
        createdAt,
        lastLoginAt: createdAt,
        isActive: claims.isActive !== false,
        preferredLanguage
    };
}

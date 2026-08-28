import { error } from '@sveltejs/kit';
import { normalizeUserRole } from '$lib/auth/identity';

export function requireUser(locals) {
    if (!locals.user) {
        throw error(401, 'Authentication required.');
    }
    return locals.user;
}

export function requireRole(locals, allowedRoles) {
    const user = requireUser(locals);
    const role = normalizeUserRole(user.role);
    if (!allowedRoles.includes(role)) {
        throw error(403, 'Access denied.');
    }
    return user;
}

export function requireDepartmentUser(locals) {
    const user = requireRole(locals, ['department_user', 'admin']);
    if (normalizeUserRole(user.role) === 'department_user' && !user.departmentId) {
        throw error(403, 'Department assignment is required.');
    }
    return user;
}

import { describe, expect, it } from 'vitest';
import { canAccessRoute } from '../../src/lib/utils/authGuard.js';

describe('Public Navigation Routes Access Control', () => {
    const unauthenticatedUser = null;
    const citizenUser = { id: 'cit-1', role: 'citizen' };
    const operatorUser = { id: 'op-1', role: 'operator' };
    const officerUser = { id: 'off-1', role: 'department_user', departmentId: 'dept-rev' };
    const adminUser = { id: 'adm-1', role: 'admin' };

    it('allows unauthenticated visitors to access /about, /help, /contact, /services, and /', () => {
        expect(canAccessRoute(unauthenticatedUser, '/')).toEqual({ allowed: true });
        expect(canAccessRoute(unauthenticatedUser, '/about')).toEqual({ allowed: true });
        expect(canAccessRoute(unauthenticatedUser, '/help')).toEqual({ allowed: true });
        expect(canAccessRoute(unauthenticatedUser, '/contact')).toEqual({ allowed: true });
        expect(canAccessRoute(unauthenticatedUser, '/services')).toEqual({ allowed: true });
        expect(canAccessRoute(unauthenticatedUser, '/sitemap')).toEqual({ allowed: true });
        expect(canAccessRoute(unauthenticatedUser, '/tutorials')).toEqual({ allowed: true });
    });

    it('allows authenticated citizens, operators, officers, and admins to access public routes', () => {
        const users = [citizenUser, operatorUser, officerUser, adminUser];
        const publicRoutes = ['/about', '/help', '/contact', '/services', '/sitemap'];

        for (const user of users) {
            for (const route of publicRoutes) {
                expect(canAccessRoute(user, route)).toEqual({ allowed: true });
            }
        }
    });

    it('preserves authentication boundaries on protected routes for unauthenticated visitors', () => {
        const protectedRoutes = ['/dashboard', '/applications', '/documents', '/complaints', '/operator/dashboard', '/department/dashboard', '/admin'];

        for (const route of protectedRoutes) {
            const guard = canAccessRoute(unauthenticatedUser, route);
            expect(guard.allowed).toBe(false);
            expect(guard.redirectTo).toContain('/login');
        }
    });

    it('enforces role-based boundaries on operator, department, and admin routes', () => {
        // Citizen attempting operator or department
        expect(canAccessRoute(citizenUser, '/operator/dashboard').allowed).toBe(false);
        expect(canAccessRoute(citizenUser, '/department/dashboard').allowed).toBe(false);
        expect(canAccessRoute(citizenUser, '/admin').allowed).toBe(false);

        // Operator attempting department or admin
        expect(canAccessRoute(operatorUser, '/operator/dashboard').allowed).toBe(true);
        expect(canAccessRoute(operatorUser, '/department/dashboard').allowed).toBe(false);
        expect(canAccessRoute(operatorUser, '/admin').allowed).toBe(false);

        // Department user attempting operator or admin
        expect(canAccessRoute(officerUser, '/department/dashboard').allowed).toBe(true);
        expect(canAccessRoute(officerUser, '/operator/dashboard').allowed).toBe(false);
        expect(canAccessRoute(officerUser, '/admin').allowed).toBe(false);
    });
});

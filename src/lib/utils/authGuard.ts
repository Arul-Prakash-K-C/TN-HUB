import type { User, UserRole, Application } from '$lib/types';
import { normalizeUserRole } from '$lib/auth/identity';

export function getPortalRedirectForRole(role: UserRole | string | null | undefined): string {
  switch (normalizeUserRole(role)) {
    case 'department_user':
      return '/department/dashboard';
    case 'operator':
      return '/operator/dashboard';
    case 'admin':
      return '/admin';
    case 'citizen':
    default:
      return '/dashboard';
  }
}

export function canAccessRoute(user: User | null, path: string): { allowed: boolean; redirectTo?: string; reason?: string } {
  // Public routes accessible by all. Session creation must stay reachable to
  // an unauthenticated Firebase user so the server can verify their ID token
  // and issue the HttpOnly session cookie.
  const publicExactPaths = ['/api/auth/session', '/api/thozhan', '/api/thozhan/'];
  const publicPrefixes = [
    '/',
    '/login',
    '/services',
    '/about',
    '/contact',
    '/help',
    '/sitemap',
    '/tutorials',
    '/chatbot'
  ];

  // Check exact public paths or public prefixes
  if (
    path === '/' ||
    publicExactPaths.includes(path) ||
    publicPrefixes.some(p => p !== '/' && (path === p || path.startsWith(p + '/')))
  ) {
    return { allowed: true };
  }

  // If not logged in and trying to access a protected route
  if (!user) {
    return {
      allowed: false,
      redirectTo: `/login?redirect=${encodeURIComponent(path)}`,
      reason: 'Authentication required'
    };
  }

  const role = normalizeUserRole(user.role);

  // Department Routes Protection
  if (path.startsWith('/department') || path.startsWith('/officer')) {
    if (role === 'department_user' || role === 'admin') {
      // Check department association
      if (!user.departmentId && role !== 'admin') {
        return {
          allowed: false,
          redirectTo: '/login?error=no_department_assigned',
          reason: 'Department user must be associated with a valid department'
        };
      }
      return { allowed: true };
    }
    return {
      allowed: false,
      redirectTo: getPortalRedirectForRole(role),
      reason: 'Unauthorized access to department portal'
    };
  }

  // Operator Routes Protection
  if (path.startsWith('/operator')) {
    if (role === 'operator' || role === 'admin') {
      return { allowed: true };
    }
    return {
      allowed: false,
      redirectTo: getPortalRedirectForRole(role),
      reason: 'Unauthorized access to operator portal'
    };
  }

  // Admin Routes Protection
  if (path.startsWith('/admin')) {
    if (role === 'admin') {
      return { allowed: true };
    }
    return {
      allowed: false,
      redirectTo: getPortalRedirectForRole(role),
      reason: 'Unauthorized access to admin portal'
    };
  }

  // Citizen Protected Routes (/dashboard, /applications, /documents, /complaints, /profile, /notifications)
  if (
    path.startsWith('/dashboard') ||
    path.startsWith('/applications') ||
    path.startsWith('/documents') ||
    path.startsWith('/complaints') ||
    path.startsWith('/profile') ||
    path.startsWith('/notifications')
  ) {
    if (role === 'citizen' || role === 'admin') {
      return { allowed: true };
    }
    // Department users attempting citizen dashboard get redirected to department dashboard
    return {
      allowed: false,
      redirectTo: getPortalRedirectForRole(role),
      reason: 'Department users must use the department portal'
    };
  }

  return { allowed: true };
}

export function canAccessApplication(user: User | null, application: Application): boolean {
  if (!user) return false;

  // Platform admin can view all
  const role = normalizeUserRole(user.role);

  if (role === 'admin') return true;

  // Citizen can view their own application
  if (role === 'citizen') {
    return application.citizenId === user.id;
  }

  // Operator-scoped records are enforced by the server repository through
  // assistedByOperatorId. This legacy UI model has no such field, so it must
  // never grant blanket application access.
  if (role === 'operator') return false;

  // Department user/officer can ONLY view applications matching their departmentId
  if (role === 'department_user') {
    return !!user.departmentId && application.departmentId === user.departmentId;
  }

  return false;
}

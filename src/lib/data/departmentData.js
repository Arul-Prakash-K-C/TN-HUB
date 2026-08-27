import { applications as mockApplications } from '$lib/data/applications';
import { canAccessApplication } from '$lib/utils/authGuard';
/**
 * Returns applications authorized for the given user context.
 * Strict Department Isolation: Department Users / Officers will ONLY receive
 * applications where application.departmentId === user.departmentId.
 */
export function getApplicationsForUser(user) {
    if (!user)
        return [];
    // Platform Admin sees all
    if (user.role === 'tnhub_admin' || user.role === 'admin') {
        return mockApplications;
    }
    // Citizen sees only their own applications
    if (user.role === 'citizen') {
        return mockApplications.filter(a => a.citizenId === user.id);
    }
    // Operator sees all kiosk applications
    if (user.role === 'operator') {
        return mockApplications;
    }
    // Department User / Officer: STRICT DEPARTMENT ISOLATION
    if (user.role === 'department_user' || user.role === 'officer' || user.role === 'dept_admin') {
        if (!user.departmentId)
            return [];
        return mockApplications.filter(a => a.departmentId === user.departmentId);
    }
    return [];
}
/**
 * Retrieves a single application by ID with strict role & department boundary checks.
 */
export function getApplicationByIdForUser(user, appId) {
    if (!user || !appId)
        return null;
    const app = mockApplications.find(a => a.id === appId || a.applicationNumber === appId);
    if (!app)
        return null;
    if (canAccessApplication(user, app)) {
        return app;
    }
    // Access Denied / Cross-department leakage blocked
    return null;
}
/**
 * Computes department metrics exclusively scoped to user's authorized departmentId.
 */
export function getDepartmentMetrics(user) {
    const apps = getApplicationsForUser(user);
    const total = apps.length;
    const newApplications = apps.filter(a => a.status === 'SUBMITTED').length;
    const pendingVerification = apps.filter(a => a.status === 'DOCUMENT_VERIFICATION').length;
    const underReview = apps.filter(a => a.status === 'OFFICER_REVIEW' || a.status === 'FIELD_VERIFICATION').length;
    const correctionRequired = apps.filter(a => a.status === 'CLARIFICATION_REQUESTED').length;
    const approved = apps.filter(a => a.status === 'APPROVED' || a.status === 'COMPLETED' || a.status === 'CERTIFICATE_GENERATED').length;
    const rejected = apps.filter(a => a.status === 'REJECTED').length;
    const slaBreached = apps.filter(a => a.isSlaBreached).length;
    return {
        total,
        newApplications,
        pendingVerification,
        underReview,
        correctionRequired,
        approved,
        rejected,
        slaBreached
    };
}

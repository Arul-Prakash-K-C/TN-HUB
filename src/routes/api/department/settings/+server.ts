import { error, json, type RequestHandler } from '@sveltejs/kit';
import { getFirebaseAdminFirestore } from '$lib/server/firebase/admin';
import { normalizeUserRole } from '$lib/auth/identity';
import { recordAuditEvent } from '$lib/server/audit/repository';

export interface DepartmentSettings {
  slaThresholdDays: string;
  autoAssign: boolean;
  emailNotifs: boolean;
  smsNotifs: boolean;
  updatedAt: string;
}

const DEFAULT_SETTINGS: DepartmentSettings = {
  slaThresholdDays: '3',
  autoAssign: true,
  emailNotifs: true,
  smsNotifs: true,
  updatedAt: new Date().toISOString()
};

function getAuthorizedDepartmentId(user: NonNullable<App.Locals['user']>, requestedDepartmentId?: string | null): string {
  const role = normalizeUserRole(user.role);

  if (role === 'department_user') {
    if (!user.departmentId) throw error(403, 'Department assignment is required.');
    return user.departmentId;
  }

  if (role === 'admin') {
    const departmentId = requestedDepartmentId?.trim();
    if (!departmentId) throw error(400, 'Department ID is required for admin settings access.');
    return departmentId;
  }

  throw error(403, 'Access denied.');
}

export const GET: RequestHandler = async ({ locals, url }) => {
  if (!locals.user) {
    throw error(401, 'Authentication required.');
  }

  const role = normalizeUserRole(locals.user.role);
  if (role !== 'department_user' && role !== 'admin') {
    throw error(403, 'Access denied.');
  }

  const deptId = getAuthorizedDepartmentId(locals.user, url.searchParams.get('departmentId'));
  const db = getFirebaseAdminFirestore();

  try {
    const docRef = db.collection('departments').doc(deptId).collection('settings').doc('preferences');
    const snap = await docRef.get();

    if (!snap.exists) {
      return json({ settings: DEFAULT_SETTINGS });
    }

    return json({ settings: snap.data() as DepartmentSettings });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Unable to load department settings.';
    throw error(500, message);
  }
};

export const POST: RequestHandler = async ({ request, locals, url }) => {
  if (!locals.user) {
    throw error(401, 'Authentication required.');
  }

  const role = normalizeUserRole(locals.user.role);
  if (role !== 'department_user' && role !== 'admin') {
    throw error(403, 'Only department officers or administrators can update settings.');
  }

  const deptId = getAuthorizedDepartmentId(locals.user, url.searchParams.get('departmentId'));

  let body: { slaThresholdDays?: unknown; autoAssign?: unknown; emailNotifs?: unknown; smsNotifs?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    throw error(400, 'Invalid settings payload.');
  }

  const slaThresholdDays = ['1', '3', '7'].includes(String(body.slaThresholdDays)) ? String(body.slaThresholdDays) : '3';
  const autoAssign = Boolean(body.autoAssign);
  const emailNotifs = Boolean(body.emailNotifs);
  const smsNotifs = Boolean(body.smsNotifs);
  const now = new Date().toISOString();

  const settings: DepartmentSettings = {
    slaThresholdDays,
    autoAssign,
    emailNotifs,
    smsNotifs,
    updatedAt: now
  };

  try {
    const db = getFirebaseAdminFirestore();
    const docRef = db.collection('departments').doc(deptId).collection('settings').doc('preferences');
    await docRef.set(settings, { merge: true });

    await recordAuditEvent({
      actorId: locals.user.uid,
      actorRole: locals.user.role,
      action: 'UPDATE_DEPARTMENT_SETTINGS',
      resourceType: 'DEPARTMENT',
      resourceId: deptId,
      details: { ...settings }
    });

    return json({ settings });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Unable to save department settings.';
    throw error(500, message);
  }
};

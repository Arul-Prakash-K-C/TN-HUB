import { error, json, type RequestHandler } from '@sveltejs/kit';
import { getFirebaseAdminFirestore } from '$lib/server/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

export const POST: RequestHandler = async ({ request }) => {
  let body: { uid?: unknown; email?: unknown; name?: unknown; desiredRole?: unknown; departmentId?: unknown };
  try {
    body = await request.json() as typeof body;
  } catch {
    throw error(400, 'Invalid request payload.');
  }

  const { uid, email, name, desiredRole, departmentId } = body;

  if (typeof uid !== 'string' || !uid || typeof email !== 'string' || !email || typeof desiredRole !== 'string' || !desiredRole) {
    throw error(400, 'Missing required fields.');
  }

  const db = getFirebaseAdminFirestore();
  const profileRef = db.collection('users').doc(uid);

  try {
    const now = Timestamp.now();
    await profileRef.set({
      uid,
      email,
      displayName: name || email.split('@')[0],
      role: desiredRole === 'operator' ? 'operator' : 'department_user',
      departmentId: departmentId || null,
      isActive: false, // Inactive until approved
      approved: false, // Explicit approved flag for admin panel
      desiredRole,
      createdAt: now,
      updatedAt: now,
      preferredLanguage: 'en'
    });

    return json({ message: 'Registration submitted. Pending admin approval.' });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Unable to submit registration.';
    throw error(500, message);
  }
};

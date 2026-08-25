import { error, json, type RequestHandler } from '@sveltejs/kit';
import { getFirebaseAdminFirestore } from '$lib/server/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user || locals.user.role !== 'admin') {
    throw error(403, 'Forbidden: Admin access only.');
  }

  const db = getFirebaseAdminFirestore();

  try {
    const snapshot = await db.collection('users')
      .where('approved', '==', false)
      .get();

    const users: any[] = [];
    snapshot.forEach(doc => {
      users.push(doc.data());
    });

    return json({ users });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Unable to list pending registrations.';
    throw error(500, message);
  }
};

export const PATCH: RequestHandler = async ({ request, locals }) => {
  if (!locals.user || locals.user.role !== 'admin') {
    throw error(403, 'Forbidden: Admin access only.');
  }

  let body: { uid?: unknown; approved?: unknown };
  try {
    body = await request.json() as typeof body;
  } catch {
    throw error(400, 'Invalid request payload.');
  }

  const { uid, approved } = body;

  if (typeof uid !== 'string' || !uid || typeof approved !== 'boolean') {
    throw error(400, 'Missing or invalid parameters.');
  }

  const db = getFirebaseAdminFirestore();
  const profileRef = db.collection('users').doc(uid);

  try {
    if (approved) {
      // Find desired role and details
      const doc = await profileRef.get();
      if (!doc.exists) {
        throw error(404, 'User registration request not found.');
      }
      const data = doc.data() || {};

      await profileRef.update({
        approved: true,
        isActive: true,
        role: data.role || data.desiredRole || 'operator',
        updatedAt: Timestamp.now()
      });
    } else {
      // Rejected registration request: just delete the document or disable it permanently
      await profileRef.delete();
    }

    return json({ success: true, message: approved ? 'Registration approved!' : 'Registration request rejected.' });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Unable to update registration.';
    throw error(500, message);
  }
};

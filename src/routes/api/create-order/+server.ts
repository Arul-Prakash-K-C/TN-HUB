import { error, json, type RequestHandler } from '@sveltejs/kit';
import { getApplicationForUser } from '$lib/server/applications/repository';
import { getCatalogService } from '$lib/server/catalog/repository';
import { getFirebaseAdminFirestore } from '$lib/server/firebase/admin';
import { createRazorpayOrder } from '$lib/server/payments/razorpay';
import { Timestamp } from 'firebase-admin/firestore';

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) throw error(401, 'Authentication required.');

  let body: { applicationId?: unknown };
  try {
    body = await request.json() as { applicationId?: unknown };
  } catch {
    throw error(400, 'Invalid order request.');
  }

  if (typeof body.applicationId !== 'string' || !body.applicationId.trim()) {
    throw error(400, 'Application ID is required.');
  }

  const application = await getApplicationForUser(locals.user, body.applicationId, false);
  if (!application) throw error(404, 'Application not found.');
  if (application.status !== 'DRAFT') throw error(400, 'Only draft applications can be paid.');

  const service = await getCatalogService(application.serviceId);
  if (!service) throw error(404, 'Service not found.');

  const configuredAmount = Math.round(Number(service.fee.amount) * 100);
  const amount = Number.isFinite(configuredAmount) && configuredAmount > 0 ? configuredAmount : 100;

  try {
    const order = await createRazorpayOrder({
      amount,
      currency: 'INR',
      receipt: `tnhub_${application.id}_${Date.now()}`
    });

    await getFirebaseAdminFirestore().collection('applications').doc(application.id).set({
      payment: {
        provider: 'razorpay',
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        status: 'created',
        createdAt: Timestamp.now()
      },
      updatedAt: Timestamp.now()
    }, { merge: true });

    return json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (cause: any) {
    const statusCode = typeof cause?.statusCode === 'number' ? cause.statusCode : 500;
    if (statusCode === 401) {
      throw error(401, 'Razorpay authentication failed.');
    }
    throw error(500, 'Unable to create payment order.');
  }
};

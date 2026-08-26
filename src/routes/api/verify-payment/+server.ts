import { error, json, type RequestHandler } from '@sveltejs/kit';
import { getApplicationForUser, submitCitizenDraft } from '$lib/server/applications/repository';
import { getFirebaseAdminFirestore } from '$lib/server/firebase/admin';
import { verifyRazorpaySignature } from '$lib/server/payments/razorpay';
import { Timestamp } from 'firebase-admin/firestore';

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) throw error(401, 'Authentication required.');

  let body: {
    applicationId?: unknown;
    razorpay_payment_id?: unknown;
    razorpay_order_id?: unknown;
    razorpay_signature?: unknown;
  };
  try {
    body = await request.json() as {
      applicationId?: unknown;
      razorpay_payment_id?: unknown;
      razorpay_order_id?: unknown;
      razorpay_signature?: unknown;
    };
  } catch {
    throw error(400, 'Invalid verification request.');
  }

  if (
    typeof body.applicationId !== 'string' ||
    typeof body.razorpay_payment_id !== 'string' ||
    typeof body.razorpay_order_id !== 'string' ||
    typeof body.razorpay_signature !== 'string'
  ) {
    throw error(400, 'Application ID, payment ID, order ID, and signature are required.');
  }

  const application = await getApplicationForUser(locals.user, body.applicationId, false);
  if (!application) throw error(404, 'Application not found.');

  const applicationRef = getFirebaseAdminFirestore().collection('applications').doc(application.id);
  const snapshot = await applicationRef.get();
  const storedOrderId = snapshot.get('payment.orderId');
  if (typeof storedOrderId !== 'string' || !storedOrderId) {
    throw error(400, 'No payment order exists for this application.');
  }

  const isValid = verifyRazorpaySignature({
    orderId: storedOrderId,
    paymentId: body.razorpay_payment_id,
    signature: body.razorpay_signature
  });

  if (!isValid || storedOrderId !== body.razorpay_order_id) {
    throw error(400, 'Payment signature mismatch.');
  }

  await applicationRef.set({
    payment: {
      provider: 'razorpay',
      orderId: storedOrderId,
      paymentId: body.razorpay_payment_id,
      signature: body.razorpay_signature,
      currency: snapshot.get('payment.currency') ?? 'INR',
      amount: snapshot.get('payment.amount') ?? null,
      status: 'verified',
      verifiedAt: Timestamp.now()
    },
    updatedAt: Timestamp.now()
  }, { merge: true });

  const submittedApplication = await submitCitizenDraft(locals.user, application.id);
  return json({ success: true, application: submittedApplication });
};

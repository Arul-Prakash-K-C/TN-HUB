import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { env } from '$env/dynamic/private';

function requireEnv(name: 'RAZORPAY_KEY_ID' | 'RAZORPAY_KEY_SECRET'): string {
  const value = env[name];
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
}

export function getRazorpayClient(): Razorpay {
  return new Razorpay({
    key_id: requireEnv('RAZORPAY_KEY_ID'),
    key_secret: requireEnv('RAZORPAY_KEY_SECRET')
  });
}

export async function createRazorpayOrder(input: {
  amount: number;
  currency: string;
  receipt: string;
}) {
  if (!Number.isInteger(input.amount) || input.amount < 100) {
    throw new Error('Amount must be at least 100 paise.');
  }

  return getRazorpayClient().orders.create({
    amount: input.amount,
    currency: input.currency,
    receipt: input.receipt.slice(0, 40)
  });
}

export function verifyRazorpaySignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const expected = crypto
    .createHmac('sha256', requireEnv('RAZORPAY_KEY_SECRET'))
    .update(`${input.orderId}|${input.paymentId}`)
    .digest('hex');

  const expectedBuffer = Buffer.from(expected, 'hex');
  const receivedBuffer = Buffer.from(input.signature, 'hex');
  if (expectedBuffer.length !== receivedBuffer.length) return false;

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

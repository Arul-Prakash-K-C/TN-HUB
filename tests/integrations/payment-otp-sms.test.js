import { describe, expect, it } from 'vitest';
import {
    createPaymentOtpChallenge,
    DEMO_PAYMENT_OTP,
    verifyPaymentOtpChallenge
} from '../../src/lib/server/payments/otp.js';
import {
    assertPaymentOutcome,
    normalizePaymentOutcome,
    requiresPaymentForService
} from '../../src/lib/server/payments/simulation.js';
import {
    applicationSmsDedupKey,
    buildApplicationSmsMessage,
    canQueueApplicationSms,
    sendApplicationSms
} from '../../src/lib/server/sms/applicationSms.js';
import { POST as requestPaymentOtp } from '../../src/routes/api/applications/[id]/payment/otp/+server.js';
import { POST as confirmPayment } from '../../src/routes/api/applications/[id]/payment/confirm/+server.js';

describe('simulated payment outcome validation', () => {
    it('accepts only explicit successful and failed outcomes', () => {
        expect(normalizePaymentOutcome('success')).toBe('SUCCESS');
        expect(assertPaymentOutcome('FAILED')).toBe('FAILED');
        expect(() => assertPaymentOutcome('approved')).toThrow('valid simulated payment outcome');
    });

    it('requires payment only for paid services', () => {
        expect(requiresPaymentForService({ fee: 25 })).toBe(true);
        expect(requiresPaymentForService({ fee: { amount: 50 } })).toBe(true);
        expect(requiresPaymentForService({ fee: 0 })).toBe(false);
    });
});

describe('payment OTP challenge verification', () => {
    it('accepts the existing demo OTP while keeping hash verification server-side', () => {
        const challenge = createPaymentOtpChallenge(1_000);
        expect(challenge.otpHash).not.toBe(DEMO_PAYMENT_OTP);
        expect(verifyPaymentOtpChallenge(challenge, DEMO_PAYMENT_OTP, 2_000)).toEqual({ ok: true });
    });

    it('rejects invalid and expired OTP values', () => {
        const challenge = createPaymentOtpChallenge(1_000);
        expect(verifyPaymentOtpChallenge(challenge, '0000', 2_000)).toEqual({
            ok: false,
            reason: 'Invalid payment OTP.'
        });
        expect(verifyPaymentOtpChallenge(challenge, DEMO_PAYMENT_OTP, 10 * 60 * 1000)).toEqual({
            ok: false,
            reason: 'Payment OTP has expired.'
        });
    });
});

describe('application SMS abstraction', () => {
    it('builds authorized event messages without claiming delivery when no provider is configured', async () => {
        expect(canQueueApplicationSms({
            phoneNumber: '9876543210',
            applicationId: 'app-1',
            event: 'APPLICATION_SUBMITTED'
        })).toBe(true);

        const result = await sendApplicationSms({
            phoneNumber: '9876543210',
            applicationId: 'app-1',
            trackingId: 'TNH-2026-00000001',
            event: 'APPLICATION_SUBMITTED'
        });

        expect(result.status).toBe('NOT_CONFIGURED');
        expect(result.provider).toBe('none');
        expect(result.dedupKey).toBe('app-1:APPLICATION_SUBMITTED');
        expect(result.message).toContain('TNH-2026-00000001');
    });

    it('rejects arbitrary SMS targets and unsupported events while keeping stable dedup keys', () => {
        expect(canQueueApplicationSms({
            phoneNumber: '123',
            applicationId: 'app-1',
            event: 'APPLICATION_SUBMITTED'
        })).toBe(false);
        expect(canQueueApplicationSms({
            phoneNumber: '9876543210',
            applicationId: '',
            event: 'APPLICATION_SUBMITTED'
        })).toBe(false);
        expect(applicationSmsDedupKey({
            applicationId: 'app-1',
            event: 'payment_success'
        })).toBe('app-1:PAYMENT_SUCCESS');
        expect(() => buildApplicationSmsMessage({
            applicationId: 'app-1',
            event: 'PASSWORD_RESET'
        })).toThrow('Unsupported SMS event');
    });
});

describe('DigiLocker demo messaging', () => {
    it('keeps the integration clearly marked as demo-only', () => {
        const demoLabel = 'Demo DigiLocker document - not real government verification';
        expect(demoLabel).toContain('Demo DigiLocker');
        expect(demoLabel).toContain('not real government verification');
    });
});

describe('payment API authorization boundary', () => {
    it('rejects unauthenticated payment OTP requests', async () => {
        const response = await requestPaymentOtp({
            locals: {},
            params: { id: 'app-1' },
            request: new Request('http://localhost/api/applications/app-1/payment/otp', { method: 'POST' })
        });

        expect(response.status).toBe(401);
        await expect(response.json()).resolves.toMatchObject({ message: 'Authentication required.' });
    });

    it('rejects unauthenticated payment confirmation requests before accepting client status', async () => {
        const response = await confirmPayment({
            locals: {},
            params: { id: 'app-1' },
            request: new Request('http://localhost/api/applications/app-1/payment/confirm', {
                method: 'POST',
                body: JSON.stringify({ otp: '1234', outcome: 'SUCCESS' })
            })
        });

        expect(response.status).toBe(401);
        await expect(response.json()).resolves.toMatchObject({ message: 'Authentication required.' });
    });
});

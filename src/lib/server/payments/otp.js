import { createHash, randomUUID } from 'node:crypto';

const DEMO_PAYMENT_OTP = '1234';
const DEFAULT_TTL_MS = 5 * 60 * 1000;
const DEFAULT_MAX_ATTEMPTS = 3;

export function normalizeOtp(value) {
    return typeof value === 'string' ? value.replace(/\D/g, '').slice(0, 6) : '';
}

export function hashOtp(otp, salt) {
    return createHash('sha256').update(`${salt}:${otp}`).digest('hex');
}

export function createPaymentOtpChallenge(now = Date.now()) {
    const salt = randomUUID();
    return {
        salt,
        otpHash: hashOtp(DEMO_PAYMENT_OTP, salt),
        expiresAtMs: now + DEFAULT_TTL_MS,
        maxAttempts: DEFAULT_MAX_ATTEMPTS
    };
}

export function verifyPaymentOtpChallenge(challenge, otp, now = Date.now()) {
    if (!challenge || typeof challenge !== 'object') {
        return { ok: false, reason: 'OTP challenge is missing.' };
    }
    if (Number(challenge.expiresAtMs) <= now) {
        return { ok: false, reason: 'Payment OTP has expired.' };
    }
    const attempts = Number(challenge.attempts ?? 0);
    const maxAttempts = Number(challenge.maxAttempts ?? DEFAULT_MAX_ATTEMPTS);
    if (attempts >= maxAttempts) {
        return { ok: false, reason: 'Too many invalid OTP attempts.' };
    }
    const submittedOtp = normalizeOtp(otp);
    if (!submittedOtp || hashOtp(submittedOtp, challenge.salt) !== challenge.otpHash) {
        return { ok: false, reason: 'Invalid payment OTP.' };
    }
    return { ok: true };
}

export { DEMO_PAYMENT_OTP };

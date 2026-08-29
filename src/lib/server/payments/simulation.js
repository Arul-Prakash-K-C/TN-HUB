export const SIMULATED_PAYMENT_OUTCOMES = new Set(['SUCCESS', 'FAILED']);

export function normalizePaymentOutcome(value) {
    return typeof value === 'string' ? value.trim().toUpperCase() : '';
}

export function assertPaymentOutcome(value) {
    const outcome = normalizePaymentOutcome(value);
    if (!SIMULATED_PAYMENT_OUTCOMES.has(outcome)) {
        throw new Error('Select a valid simulated payment outcome.');
    }
    return outcome;
}

export function buildSimulatedPaymentReference(applicationId, now = Date.now()) {
    const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `SIM-RZP-${applicationId.slice(-6).toUpperCase()}-${now}-${suffix}`;
}

export function requiresPaymentForService(service) {
    return Number(service?.fee?.amount ?? service?.fee ?? 0) > 0;
}

const supportedEvents = new Set([
    'APPLICATION_SUBMITTED',
    'PAYMENT_SUCCESS',
    'APPLICATION_APPROVED',
    'APPLICATION_REJECTED',
    'CLARIFICATION_REQUESTED',
    'APPLICATION_COMPLETED'
]);

export function normalizeSmsEvent(value) {
    return typeof value === 'string' ? value.trim().toUpperCase() : '';
}

export function buildApplicationSmsMessage({ applicationId, trackingId, event }) {
    const normalizedEvent = normalizeSmsEvent(event);
    const reference = trackingId || applicationId;
    switch (normalizedEvent) {
        case 'PAYMENT_SUCCESS':
            return `TN Kuviyam: Payment recorded for application ${reference}.`;
        case 'APPLICATION_SUBMITTED':
            return `TN Kuviyam: Application ${reference} has been submitted.`;
        case 'APPLICATION_APPROVED':
            return `TN Kuviyam: Application ${reference} has been approved.`;
        case 'APPLICATION_REJECTED':
            return `TN Kuviyam: Application ${reference} has been rejected.`;
        case 'CLARIFICATION_REQUESTED':
            return `TN Kuviyam: Application ${reference} needs your action.`;
        case 'APPLICATION_COMPLETED':
            return `TN Kuviyam: Application ${reference} is completed.`;
        default:
            throw new Error('Unsupported SMS event.');
    }
}

export function canQueueApplicationSms({ phoneNumber, applicationId, event }) {
    const normalizedPhone = typeof phoneNumber === 'string' ? phoneNumber.replace(/\D/g, '') : '';
    const normalizedApplicationId = typeof applicationId === 'string' ? applicationId.trim() : '';
    return Boolean(normalizedApplicationId) && /^\d{10}$/.test(normalizedPhone) && supportedEvents.has(normalizeSmsEvent(event));
}

export function applicationSmsDedupKey({ applicationId, event }) {
    const normalizedApplicationId = typeof applicationId === 'string' ? applicationId.trim() : '';
    const normalizedEvent = normalizeSmsEvent(event);
    if (!normalizedApplicationId || !supportedEvents.has(normalizedEvent)) {
        throw new Error('A valid application and SMS event are required.');
    }
    return `${normalizedApplicationId}:${normalizedEvent}`;
}

export async function sendApplicationSms(input) {
    if (!canQueueApplicationSms(input)) {
        return { status: 'SKIPPED', reason: 'SMS requires a valid applicant phone number and supported event.' };
    }
    return {
        status: 'NOT_CONFIGURED',
        provider: 'none',
        dedupKey: applicationSmsDedupKey(input),
        message: buildApplicationSmsMessage(input)
    };
}

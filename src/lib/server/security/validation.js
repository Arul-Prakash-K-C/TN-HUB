export function cleanString(value, maxLength) {
    if (typeof value !== 'string') {
        return '';
    }
    const trimmed = value.trim();
    if (trimmed.length > maxLength) {
        throw new Error(`Value must be ${maxLength} characters or fewer.`);
    }
    return trimmed;
}

export function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function assertJsonObject(value, message = 'Invalid request payload.') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error(message);
    }
    return value;
}

export function isSafeId(value, maxLength = 160) {
    return typeof value === 'string' && /^[A-Za-z0-9._:-]+$/.test(value) && value.length <= maxLength;
}

export function isSafeFormData(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return false;
    }
    const entries = Object.entries(value);
    return entries.length <= 100 && entries.every(([key, entry]) => key.length <= 100 &&
        (typeof entry === 'string' || typeof entry === 'number' || typeof entry === 'boolean' || entry === null || typeof entry === 'undefined') &&
        (typeof entry !== 'string' || entry.length <= 5000) &&
        (typeof entry !== 'number' || Number.isFinite(entry)));
}

const buckets = new Map();

function clientAddress(request) {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return request.headers.get('x-real-ip') ?? 'unknown';
}

function pruneExpired(now) {
    for (const [key, bucket] of buckets.entries()) {
        if (bucket.resetAt <= now) {
            buckets.delete(key);
        }
    }
}

/**
 * Best-effort in-memory rate limiting for intake endpoints. It is intentionally
 * small and dependency-free; platform-level rate limiting should complement it
 * in production.
 */
export function checkRateLimit(request, scope, options = {}) {
    const now = Date.now();
    const limit = options.limit ?? 20;
    const windowMs = options.windowMs ?? 60_000;
    pruneExpired(now);

    const key = `${scope}:${clientAddress(request)}`;
    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, retryAfterSeconds: 0 };
    }

    bucket.count += 1;
    if (bucket.count > limit) {
        return {
            allowed: false,
            retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))
        };
    }

    return { allowed: true, retryAfterSeconds: 0 };
}

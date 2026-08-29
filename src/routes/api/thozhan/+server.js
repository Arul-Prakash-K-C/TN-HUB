import { json } from '@sveltejs/kit';
import { loadPublicCatalog } from '$lib/server/catalog/repository';
import { listApplicationsForUser } from '$lib/server/applications/repository';
import { listCitizenDocuments } from '$lib/server/documents/repository';
import { checkRateLimit } from '$lib/server/security/rateLimit';
export const GET = async ({ request, locals }) => {
    const scope = locals.user ? `thozhan:${locals.user.uid}` : 'thozhan:public';
    const rateLimit = checkRateLimit(request, scope, { limit: locals.user ? 60 : 30, windowMs: 60_000 });
    if (!rateLimit.allowed) {
        return json({ message: 'Too many requests. Please try again shortly.' }, {
            status: 429,
            headers: { 'retry-after': String(rateLimit.retryAfterSeconds) }
        });
    }
    const catalog = await loadPublicCatalog();
    if (!locals.user) {
        return json({
            catalog,
            applications: [],
            documents: [],
            user: null
        });
    }
    const [applications, documents] = await Promise.all([
        listApplicationsForUser(locals.user),
        listCitizenDocuments(locals.user)
    ]);
    return json({
        catalog,
        applications,
        documents,
        user: locals.user
    });
};

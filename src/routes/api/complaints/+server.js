import { error, json } from '@sveltejs/kit';
import { listComplaints, createComplaint, updateComplaintStatus } from '$lib/server/complaints/repository';
import { checkRateLimit } from '$lib/server/security/rateLimit';
import { cleanString, isEmail, isSafeId } from '$lib/server/security/validation';
const allowedCategories = new Set(['service_delay', 'document_issue', 'officer_conduct', 'technical_issue', 'other']);
const allowedStatuses = new Set(['SUBMITTED', 'IN_REVIEW', 'RESOLVED', 'REJECTED', 'CLOSED']);
export const GET = async ({ locals }) => {
    if (!locals.user) {
        throw error(401, 'Authentication required.');
    }
    try {
        const complaints = await listComplaints(locals.user);
        return json({ complaints });
    }
    catch (cause) {
        console.error('[complaints list]', cause);
        throw error(500, 'Unable to list complaints.');
    }
};
export const POST = async ({ request, locals }) => {
    if (!locals.user) {
        throw error(401, 'Authentication required.');
    }
    const rateLimit = checkRateLimit(request, `complaints:${locals.user.uid}`, { limit: 10, windowMs: 60_000 });
    if (!rateLimit.allowed) {
        throw error(429, `Too many complaint requests. Try again in ${rateLimit.retryAfterSeconds} seconds.`);
    }
    let body;
    try {
        body = (await request.json());
    }
    catch {
        throw error(400, 'Invalid complaint payload.');
    }
    let subject = '';
    let description = '';
    let location = '';
    try {
        subject = cleanString(body.subject, 200);
        description = cleanString(body.description, 2000);
        location = cleanString(body.location, 300);
    }
    catch (cause) {
        throw error(400, cause instanceof Error ? cause.message : 'Invalid complaint payload.');
    }
    if (!subject) {
        throw error(400, 'Subject is required (max 200 characters).');
    }
    if (!description) {
        throw error(400, 'Description is required (max 2000 characters).');
    }
    const category = typeof body.category === 'string' && allowedCategories.has(body.category) ? body.category : 'service_delay';
    const departmentId = isSafeId(body.departmentId, 120) ? body.departmentId.trim() : 'dept-revenue';
    const submittedEmail = typeof body.email === 'string' ? body.email.trim() : '';
    const email = submittedEmail && isEmail(submittedEmail) ? submittedEmail : (locals.user?.email || '');
    try {
        const complaint = await createComplaint(locals.user, {
            category,
            subject,
            description,
            location,
            departmentId,
            email
        });
        return json({ complaint }, { status: 201 });
    }
    catch (cause) {
        const message = cause instanceof Error ? cause.message : 'Unable to create complaint.';
        throw error(400, message);
    }
};
export const PATCH = async ({ request, locals }) => {
    if (!locals.user || (locals.user.role !== 'admin' && locals.user.role !== 'officer' && locals.user.role !== 'department_user')) {
        throw error(403, 'Forbidden: Official access only.');
    }
    let body;
    try {
        body = await request.json();
    }
    catch {
        throw error(400, 'Invalid request payload.');
    }
    const { complaintId, status, remark } = body;
    if (!isSafeId(complaintId, 160) || typeof status !== 'string' || !allowedStatuses.has(status)) {
        throw error(400, 'Missing or invalid parameters.');
    }
    if (remark !== undefined && (typeof remark !== 'string' || remark.length > 2000)) {
        throw error(400, 'Remark must be 2000 characters or fewer.');
    }
    try {
        const updated = await updateComplaintStatus(locals.user, complaintId, status, typeof remark === 'string' ? remark.trim() : '');
        return json({ success: true, complaint: updated });
    }
    catch (cause) {
        console.error('[complaint status update]', cause);
        throw error(500, 'Unable to update grievance status.');
    }
};

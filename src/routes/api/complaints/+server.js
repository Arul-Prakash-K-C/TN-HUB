import { error, json } from '@sveltejs/kit';
import { listComplaints, createComplaint, updateComplaintStatus } from '$lib/server/complaints/repository';
export const GET = async ({ locals }) => {
    if (!locals.user) {
        throw error(401, 'Authentication required.');
    }
    try {
        const complaints = await listComplaints(locals.user);
        return json({ complaints });
    }
    catch (cause) {
        const message = cause instanceof Error ? cause.message : 'Unable to list complaints.';
        throw error(500, message);
    }
};
export const POST = async ({ request, locals }) => {
    if (!locals.user) {
        throw error(401, 'Authentication required.');
    }
    let body;
    try {
        body = (await request.json());
    }
    catch {
        throw error(400, 'Invalid complaint payload.');
    }
    if (typeof body.subject !== 'string' || !body.subject.trim() || body.subject.length > 200) {
        throw error(400, 'Subject is required (max 200 characters).');
    }
    if (typeof body.description !== 'string' || !body.description.trim() || body.description.length > 2000) {
        throw error(400, 'Description is required (max 2000 characters).');
    }
    const category = typeof body.category === 'string' && body.category ? body.category : 'service_delay';
    const location = typeof body.location === 'string' ? body.location.trim() : '';
    const departmentId = typeof body.departmentId === 'string' ? body.departmentId.trim() : 'dept-revenue';
    const email = typeof body.email === 'string' ? body.email.trim() : (locals.user?.email || '');
    try {
        const complaint = await createComplaint(locals.user, {
            category,
            subject: body.subject.trim(),
            description: body.description.trim(),
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
    if (typeof complaintId !== 'string' || !complaintId || typeof status !== 'string' || !status) {
        throw error(400, 'Missing or invalid parameters.');
    }
    try {
        const updated = await updateComplaintStatus(locals.user, complaintId, status, remark);
        return json({ success: true, complaint: updated });
    }
    catch (cause) {
        const message = cause instanceof Error ? cause.message : 'Unable to update grievance status.';
        throw error(500, message);
    }
};

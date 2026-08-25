import { error, json, type RequestHandler } from '@sveltejs/kit';
import { listComplaints, createComplaint } from '$lib/server/complaints/repository';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    throw error(401, 'Authentication required.');
  }

  try {
    const complaints = await listComplaints(locals.user);
    return json({ complaints });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Unable to list complaints.';
    throw error(500, message);
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    throw error(401, 'Authentication required.');
  }

  let body: { category?: unknown; subject?: unknown; description?: unknown; location?: unknown; departmentId?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
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

  try {
    const complaint = await createComplaint(locals.user, {
      category,
      subject: body.subject.trim(),
      description: body.description.trim(),
      location,
      departmentId
    });

    return json({ complaint }, { status: 201 });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Unable to create complaint.';
    throw error(400, message);
  }
};

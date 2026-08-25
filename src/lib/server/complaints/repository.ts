import { getFirebaseAdminFirestore } from '$lib/server/firebase/admin';
import { generateComplaintId, generateId } from '$lib/utils/id-generator';
import type { User } from '$lib/types';
import { normalizeUserRole } from '$lib/auth/identity';
import { recordAuditEvent } from '$lib/server/audit/repository';

export interface ComplaintHistoryItem {
  id: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';
  timestamp: string;
  description: string;
  descriptionTA?: string;
  actorId: string;
  actorName: string;
}

export interface ComplaintRecord {
  id: string;
  complaintNumber: string;
  citizenId: string;
  citizenName: string;
  departmentId?: string;
  category: 'service_delay' | 'document_issue' | 'officer_misconduct' | 'technical_issue' | string;
  subject: string;
  description: string;
  location?: string;
  attachments?: string[];
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';
  history: ComplaintHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export async function listComplaints(user: User): Promise<ComplaintRecord[]> {
  const db = getFirebaseAdminFirestore();
  const role = normalizeUserRole(user.role);

  let snapshot;
  if (role === 'citizen') {
    snapshot = await db.collection('complaints')
      .where('citizenId', 'in', [user.uid, user.id || user.uid])
      .get();
  } else if (role === 'department_user' && user.departmentId) {
    snapshot = await db.collection('complaints')
      .where('departmentId', '==', user.departmentId)
      .get();
  } else {
    // Admin or default: fetch all
    snapshot = await db.collection('complaints').limit(100).get();
  }

  const results: ComplaintRecord[] = [];
  snapshot.forEach(doc => {
    results.push(doc.data() as ComplaintRecord);
  });

  return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createComplaint(
  user: User,
  input: { category: string; subject: string; description: string; location?: string; departmentId?: string }
): Promise<ComplaintRecord> {
  const db = getFirebaseAdminFirestore();
  const now = new Date().toISOString();

  const id = `comp-${Date.now()}-${generateId().substring(0, 5)}`;
  const complaintNumber = generateComplaintId();

  const historyItem: ComplaintHistoryItem = {
    id: `ch-${Date.now()}`,
    status: 'SUBMITTED',
    timestamp: now,
    description: 'Complaint registered',
    descriptionTA: 'புகார் பதிவு செய்யப்பட்டது',
    actorId: user.uid ?? user.id,
    actorName: user.name
  };

  const record: ComplaintRecord = {
    id,
    complaintNumber,
    citizenId: user.uid ?? user.id,
    citizenName: user.name,
    departmentId: input.departmentId || 'dept-revenue',
    category: input.category,
    subject: input.subject,
    description: input.description,
    location: input.location || '',
    attachments: [],
    status: 'SUBMITTED',
    history: [historyItem],
    createdAt: now,
    updatedAt: now
  };

  await db.collection('complaints').doc(id).set(record);

  await recordAuditEvent({
    actorId: user.uid ?? user.id,
    actorRole: user.role,
    action: 'CREATE_COMPLAINT',
    resourceType: 'COMPLAINT',
    resourceId: id,
    details: { complaintNumber, category: input.category }
  });

  return record;
}

export async function updateComplaintStatus(
  user: User,
  complaintId: string,
  newStatus: 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED',
  remark?: string
): Promise<ComplaintRecord> {
  const db = getFirebaseAdminFirestore();
  const docRef = db.collection('complaints').doc(complaintId);
  const snap = await docRef.get();

  if (!snap.exists) {
    throw new Error('Complaint not found.');
  }

  const existing = snap.data() as ComplaintRecord;
  const role = normalizeUserRole(user.role);

  if (role === 'department_user' && existing.departmentId && existing.departmentId !== user.departmentId) {
    throw new Error('Unauthorized to update complaints for another department.');
  }

  const now = new Date().toISOString();
  const historyItem: ComplaintHistoryItem = {
    id: `ch-${Date.now()}`,
    status: newStatus,
    timestamp: now,
    description: remark || `Status updated to ${newStatus}`,
    actorId: user.uid ?? user.id,
    actorName: user.name
  };

  const updatedHistory = [...(existing.history || []), historyItem];

  await docRef.update({
    status: newStatus,
    history: updatedHistory,
    updatedAt: now
  });

  await recordAuditEvent({
    actorId: user.uid ?? user.id,
    actorRole: user.role,
    action: 'UPDATE_COMPLAINT_STATUS',
    resourceType: 'COMPLAINT',
    resourceId: complaintId,
    details: { oldStatus: existing.status, newStatus, remark }
  });

  return {
    ...existing,
    status: newStatus,
    history: updatedHistory,
    updatedAt: now
  };
}

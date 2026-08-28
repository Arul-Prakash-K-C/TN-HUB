import { getFirebaseAdminFirestore } from '$lib/server/firebase/admin';
import { generateComplaintId, generateId } from '$lib/utils/id-generator';
import { normalizeUserRole } from '$lib/auth/identity';
import { recordAuditEvent } from '$lib/server/audit/repository';
const allowedComplaintStatuses = new Set(['SUBMITTED', 'IN_REVIEW', 'RESOLVED', 'REJECTED', 'CLOSED']);
export async function listComplaints(user) {
    const db = getFirebaseAdminFirestore();
    const role = normalizeUserRole(user.role);
    let snapshot;
    if (role === 'citizen' || role === 'operator') {
        snapshot = await db.collection('complaints')
            .where('citizenId', 'in', [user.uid, user.id || user.uid])
            .limit(100)
            .get();
    }
    else if (role === 'department_user' && user.departmentId) {
        snapshot = await db.collection('complaints')
            .where('departmentId', '==', user.departmentId)
            .limit(100)
            .get();
    }
    else if (role === 'admin') {
        snapshot = await db.collection('complaints').limit(100).get();
    }
    else {
        return [];
    }
    const results = [];
    snapshot.forEach(doc => {
        results.push(doc.data());
    });
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
export async function createComplaint(user, input) {
    const db = getFirebaseAdminFirestore();
    const now = new Date().toISOString();
    const id = `comp-${Date.now()}-${generateId().substring(0, 5)}`;
    const complaintNumber = generateComplaintId();
    const historyItem = {
        id: `ch-${Date.now()}`,
        status: 'SUBMITTED',
        timestamp: now,
        description: 'Complaint registered',
        descriptionTA: 'புகார் பதிவு செய்யப்பட்டது',
        actorId: user.uid ?? user.id,
        actorName: user.name
    };
    const record = {
        id,
        complaintNumber,
        citizenId: user.uid ?? user.id,
        citizenName: user.name,
        citizenEmail: input.email || user.email || '',
        email: input.email || user.email || '',
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
export async function updateComplaintStatus(user, complaintId, newStatus, remark) {
    if (!allowedComplaintStatuses.has(newStatus)) {
        throw new Error('Invalid grievance status.');
    }
    const db = getFirebaseAdminFirestore();
    const docRef = db.collection('complaints').doc(complaintId);
    const snap = await docRef.get();
    if (!snap.exists) {
        throw new Error('Complaint not found.');
    }
    const existing = snap.data();
    const role = normalizeUserRole(user.role);
    if (role === 'department_user' && existing.departmentId && existing.departmentId !== user.departmentId) {
        throw new Error('Unauthorized to update complaints for another department.');
    }
    const now = new Date().toISOString();
    const historyItem = {
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

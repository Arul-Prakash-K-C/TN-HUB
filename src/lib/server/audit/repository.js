import { Timestamp } from 'firebase-admin/firestore';
import { getFirebaseAdminFirestore } from '$lib/server/firebase/admin';
function withoutUndefined(metadata) {
    return Object.fromEntries(Object.entries(metadata ?? {}).filter(([, value]) => value !== undefined));
}
/**
 * Adds a non-sensitive, append-only audit entry to an existing Firestore
 * transaction. The caller owns authorization and chooses the same timestamp
 * as the state change, so a failed transaction cannot leave a partial audit.
 */
export function writeAuditLogInTransaction(db, transaction, input) {
    const auditRef = db.collection('auditLogs').doc();
    transaction.set(auditRef, {
        id: auditRef.id,
        actorId: input.actor.uid,
        actorRole: input.actor.role,
        departmentId: input.departmentId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        timestamp: input.timestamp ?? Timestamp.now(),
        metadata: withoutUndefined(input.metadata)
    });
    return auditRef.id;
}
export async function recordAuditEvent(input) {
    const db = getFirebaseAdminFirestore();
    const ref = db.collection('auditLogs').doc();
    await ref.set({
        id: ref.id,
        actorId: input.actorId,
        actorRole: input.actorRole,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        details: input.details ?? {},
        timestamp: Timestamp.now()
    });
}

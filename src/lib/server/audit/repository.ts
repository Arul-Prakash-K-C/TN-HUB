import { Timestamp, type Firestore, type Transaction } from 'firebase-admin/firestore';
import { getFirebaseAdminFirestore } from '$lib/server/firebase/admin';
import type { AuthenticatedUser } from '$lib/types';

type AuditMetadata = Record<string, string | number | boolean | null | undefined>;

export interface AuditLogInput {
	actor: Pick<AuthenticatedUser, 'uid' | 'role'> | { uid: string; role: string };
	departmentId?: string | null;
	action: string;
	entityType: 'application' | 'document' | 'notification';
	entityId: string;
	timestamp?: Timestamp;
	metadata?: AuditMetadata;
}

function withoutUndefined(metadata: AuditMetadata | undefined): Record<string, string | number | boolean | null> {
	return Object.fromEntries(
		Object.entries(metadata ?? {}).filter(([, value]) => value !== undefined)
	) as Record<string, string | number | boolean | null>;
}

/**
 * Adds a non-sensitive, append-only audit entry to an existing Firestore
 * transaction. The caller owns authorization and chooses the same timestamp
 * as the state change, so a failed transaction cannot leave a partial audit.
 */
export function writeAuditLogInTransaction(
	db: Firestore,
	transaction: Transaction,
	input: AuditLogInput
): string {
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

// ────────────────────────────────────────────────────────────────────
// Standalone (non-transactional) audit write used by fire-and-forget
// callers (complaints, settings, etc.).
// ────────────────────────────────────────────────────────────────────
export interface StandaloneAuditInput {
	actorId: string;
	actorRole: string;
	action: string;
	resourceType: string;
	resourceId: string;
	details?: Record<string, unknown>;
}

export async function recordAuditEvent(input: StandaloneAuditInput): Promise<void> {
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

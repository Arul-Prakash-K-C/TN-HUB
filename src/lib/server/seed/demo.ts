import { Timestamp, type DocumentReference } from 'firebase-admin/firestore';
import { applications as mockApplications } from '$lib/data/applications';
import { mockDocuments } from '$lib/data/documents';
import { departments } from '$lib/data/departments';
import { mockNotifications } from '$lib/data/notifications';
import { services } from '$lib/data/services';
import { demoAdmin, demoCitizen, demoCivilSuppliesOfficer, demoOfficer, demoOperator } from '$lib/data/users';
import { workflows } from '$lib/data/workflows';
import { normalizeUserRole } from '$lib/auth/identity';
import { toCatalogDepartment, toCatalogService } from '$lib/server/catalog/repository';
import { getFirebaseAdminFirestore } from '$lib/server/firebase/admin';

type SeedCollection =
  | 'users'
  | 'departments'
  | 'services'
  | 'workflows'
  | 'applications'
  | 'statusHistory'
  | 'documents'
  | 'notifications'
  | 'auditLogs';

type SeedDocument = {
  collection: SeedCollection;
  ref: DocumentReference;
  data: Record<string, unknown>;
};

export type DemoSeedResult = Record<SeedCollection, { created: number; skipped: number }>;

function toTimestamp(value: string | undefined): Timestamp | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : Timestamp.fromDate(date);
}

function withoutUndefined(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(withoutUndefined);
  if (!value || typeof value !== 'object' || value instanceof Timestamp) return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, entry]) => entry !== undefined)
      .map(([key, entry]) => [key, withoutUndefined(entry)])
  );
}

function emptyResult(): DemoSeedResult {
  return {
    users: { created: 0, skipped: 0 },
    departments: { created: 0, skipped: 0 },
    services: { created: 0, skipped: 0 },
    workflows: { created: 0, skipped: 0 },
    applications: { created: 0, skipped: 0 },
    statusHistory: { created: 0, skipped: 0 },
    documents: { created: 0, skipped: 0 },
    notifications: { created: 0, skipped: 0 },
    auditLogs: { created: 0, skipped: 0 }
  };
}

function normalizeActorRole(role: string): string {
	return role === 'system' ? 'system' : normalizeUserRole(role);
}

function buildDemoDocuments(): SeedDocument[] {
  const db = getFirebaseAdminFirestore();
  const now = Timestamp.now();
  const documents: SeedDocument[] = [];
  const demoUsers = [demoCitizen, demoOfficer, demoCivilSuppliesOfficer, demoOperator, demoAdmin];

  for (const user of demoUsers) {
    const role = normalizeUserRole(user.role);
    documents.push({
      collection: 'users',
      ref: db.collection('users').doc(user.id),
      data: {
        uid: user.id,
        email: user.email,
        displayName: user.name,
        displayNameTA: user.nameTA ?? null,
        phone: user.phone ?? null,
        role,
        departmentId: role === 'department_user' ? user.departmentId ?? null : null,
        preferredLanguage: user.preferredLanguage,
        photoURL: user.avatar ?? null,
        isActive: user.isActive,
        createdAt: toTimestamp(user.createdAt) ?? now,
        updatedAt: now,
        seededDemo: true
      }
    });
  }

  for (const department of departments) {
    documents.push({
      collection: 'departments',
      ref: db.collection('departments').doc(department.id),
      data: {
        ...toCatalogDepartment(department),
        createdAt: now,
        updatedAt: now,
        seededDemo: true
      }
    });
  }

  for (const service of services) {
    documents.push({
      collection: 'services',
      ref: db.collection('services').doc(service.id),
      data: {
        ...toCatalogService(service),
        createdAt: toTimestamp(service.createdAt) ?? now,
        updatedAt: toTimestamp(service.updatedAt) ?? now,
        seededDemo: true
      }
    });
  }

  for (const workflow of workflows) {
    documents.push({
      collection: 'workflows',
      ref: db.collection('workflows').doc(workflow.id),
      data: {
        id: workflow.id,
        serviceId: workflow.serviceId,
        name: { en: workflow.name, ta: workflow.nameTA },
        version: workflow.version,
        states: workflow.states.map((state) => ({
          id: state.id,
          name: { en: state.name, ta: state.nameTA },
          description: { en: state.description, ta: state.descriptionTA },
          type: state.type,
          assigneeRole: state.assigneeRole === 'officer' ? 'department_user' : state.assigneeRole ?? null,
          slaHours: state.slaHours ?? null
        })),
        transitions: workflow.transitions.map((transition) => ({
          id: transition.id,
          fromState: transition.fromState,
          toState: transition.toState,
          action: { en: transition.action, ta: transition.actionTA },
          requiredRole: transition.requiredRole === 'officer' ? 'department_user' : transition.requiredRole,
          requiresReason: transition.requiresReason ?? false,
          requiresDocuments: transition.requiresDocuments ?? false,
          autoTransition: transition.autoTransition ?? false
        })),
        initialState: workflow.initialState,
        terminalStates: workflow.terminalStates,
        isActive: true,
        createdAt: toTimestamp(workflow.createdAt) ?? now,
        updatedAt: toTimestamp(workflow.updatedAt) ?? now,
        seededDemo: true
      }
    });
  }

  for (const document of mockDocuments) {
    documents.push({
      collection: 'documents',
      ref: db.collection('documents').doc(document.id),
      data: {
        id: document.id,
        applicationId: null,
        citizenId: document.citizenId,
        documentType: document.name,
        name: { en: document.name, ta: document.nameTA },
        fileName: document.fileName,
        storagePath: null,
        mimeType: document.fileType,
        size: document.fileSize,
        uploadedAt: toTimestamp(document.uploadedAt) ?? now,
        uploadedBy: document.citizenId,
        status: document.verificationStatus,
        source: document.source === 'digilocker' ? 'DEMO_DIGILOCKER' : 'DEMO_UPLOAD',
        expiryDate: toTimestamp(document.expiryDate),
        issuedBy: document.issuedBy ?? null,
        documentNumber: document.documentNumber ?? null,
        metadata: document.metadata ?? {},
        seededDemo: true
      }
    });
  }

  for (const application of mockApplications) {
    const applicationRef = db.collection('applications').doc(application.id);
    const applicationDocuments = application.documents.map((document) => ({
      id: document.id,
      documentId: `application-${application.id}-${document.id}`,
      documentType: document.documentId,
      name: document.name,
      fileName: document.fileName,
      fileSize: document.fileSize,
      fileType: document.fileType,
      uploadedAt: toTimestamp(document.uploadedAt) ?? now,
      status: document.status,
      source: document.source
    }));

    documents.push({
      collection: 'applications',
      ref: applicationRef,
      data: {
        id: application.id,
        trackingId: application.applicationNumber,
        serviceId: application.serviceId,
        serviceName: { en: application.serviceName, ta: application.serviceNameTA },
        citizenId: application.citizenId,
        citizenName: application.citizenName,
        departmentId: application.departmentId,
        departmentName: { en: application.departmentName, ta: application.departmentNameTA },
        workflowId: application.workflowId,
        status: application.status,
        currentStage: application.status,
        formData: application.formData,
        documents: applicationDocuments,
        assignedOfficerId: application.assignedOfficerId ?? null,
        assignedOfficerName: application.assignedOfficerName ?? null,
        rejectionReason: application.rejectionReason ?? null,
        resultUrl: application.resultUrl ?? null,
        certificateUrl: application.certificateUrl ?? null,
        submittedAt: toTimestamp(application.submittedAt),
        completedAt: toTimestamp(application.completedAt),
        expectedCompletionDate: toTimestamp(application.expectedCompletionDate),
        slaDeadline: toTimestamp(application.slaDeadline),
        isSlaBreached: application.isSlaBreached,
        createdAt: toTimestamp(application.createdAt) ?? now,
        updatedAt: toTimestamp(application.updatedAt) ?? now,
        seededDemo: true
      }
    });

    for (const document of application.documents) {
      const documentId = `application-${application.id}-${document.id}`;
      documents.push({
        collection: 'documents',
        ref: db.collection('documents').doc(documentId),
        data: {
          id: documentId,
          applicationId: application.id,
          citizenId: application.citizenId,
          documentType: document.documentId,
          name: { en: document.name, ta: document.name },
          fileName: document.fileName,
          storagePath: null,
          mimeType: document.fileType,
          size: document.fileSize,
          uploadedAt: toTimestamp(document.uploadedAt) ?? now,
          uploadedBy: application.citizenId,
          status: document.status,
          source: document.source === 'digilocker' ? 'DEMO_DIGILOCKER' : 'DEMO_UPLOAD',
          rejectionReason: document.rejectionReason ?? null,
          seededDemo: true
        }
      });
    }

    for (const entry of application.history) {
      documents.push({
        collection: 'statusHistory',
        ref: applicationRef.collection('statusHistory').doc(entry.id),
        data: {
          id: entry.id,
          status: entry.status,
          stage: entry.status,
          changedBy: entry.actorId,
          changedByRole: normalizeActorRole(entry.actorRole),
          comment: entry.remarks ?? entry.description,
          commentTA: entry.descriptionTA,
          createdAt: toTimestamp(entry.timestamp) ?? now,
          seededDemo: true
        }
      });

      documents.push({
        collection: 'auditLogs',
        ref: db.collection('auditLogs').doc(`seed-${application.id}-${entry.id}`),
        data: {
          actorId: entry.actorId,
          actorRole: normalizeActorRole(entry.actorRole),
          departmentId: application.departmentId,
          action: entry.status === 'SUBMITTED' ? 'APPLICATION_SUBMITTED' : 'APPLICATION_STATUS_RECORDED',
          entityType: 'application',
          entityId: application.id,
          timestamp: toTimestamp(entry.timestamp) ?? now,
          metadata: { status: entry.status, seededDemo: true }
        }
      });
    }
  }

  for (const notification of mockNotifications) {
    documents.push({
      collection: 'notifications',
      ref: db.collection('notifications').doc(notification.id),
      data: {
        id: notification.id,
        recipientId: notification.userId,
        type: notification.type,
        title: { en: notification.title, ta: notification.titleTA },
        message: { en: notification.message, ta: notification.messageTA },
        applicationId: notification.relatedEntityType === 'application' ? notification.relatedEntityId ?? null : null,
        relatedEntityId: notification.relatedEntityId ?? null,
        relatedEntityType: notification.relatedEntityType ?? null,
        channel: notification.channel,
        isRead: notification.isRead,
        actionUrl: notification.actionUrl ?? null,
        createdAt: toTimestamp(notification.createdAt) ?? now,
        readAt: toTimestamp(notification.readAt),
        seededDemo: true
      }
    });
  }

  return documents.map((document) => ({ ...document, data: withoutUndefined(document.data) as Record<string, unknown> }));
}

/**
 * Safe, idempotent demo seeding. Existing documents are skipped; no delete,
 * merge, or overwrite operation is performed. This function is only invoked
 * by the explicit local seed command and is never imported during app startup.
 */
export async function seedDemoFirestore(): Promise<DemoSeedResult> {
  const db = getFirebaseAdminFirestore();
  const documents = buildDemoDocuments();
  const snapshots = await db.getAll(...documents.map((document) => document.ref));
  const existing = new Set(snapshots.filter((snapshot) => snapshot.exists).map((snapshot) => snapshot.ref.path));
  const result = emptyResult();
  const pending = documents.filter((document) => {
    if (existing.has(document.ref.path)) {
      result[document.collection].skipped += 1;
    }
    return true; // Force include all
  });

  for (let index = 0; index < pending.length; index += 400) {
    const batch = db.batch();
    for (const document of pending.slice(index, index + 400)) {
      batch.set(document.ref, document.data, { merge: true });
      result[document.collection].created += 1;
    }
    await batch.commit();
  }

  return result;
}

import { Timestamp, type CollectionReference, type DocumentReference, type DocumentSnapshot, type Transaction } from 'firebase-admin/firestore';
import type { Application, ApplicationDocument, ApplicationFormData, ApplicationHistoryEntry, ApplicationStatus, AuthenticatedUser } from '$lib/types';
import { getCatalogDepartment, getCatalogService } from '$lib/server/catalog/repository';
import { getFirebaseAdminFirestore } from '$lib/server/firebase/admin';
import { writeAuditLogInTransaction } from '$lib/server/audit/repository';
import {
  applicationTransitionNotification,
  documentReviewNotification,
  writeDepartmentSubmissionNotificationsInTransaction,
  writeNotificationInTransaction
} from '$lib/server/notifications/repository';
import {
  getAvailableWorkflowActions,
  getWorkflowDefinition,
  getWorkflowTransition,
  type AvailableWorkflowAction
} from '$lib/server/workflows/repository';

type FirestoreFormData = Record<string, string | number | boolean | null>;

export interface CreateApplicationInput {
  serviceId: string;
  formData: FirestoreFormData;
  submit: boolean;
}

export interface CreatedApplication {
  id: string;
  trackingId: string;
  serviceId: string;
  serviceName: { en: string; ta: string };
  citizenId: string;
  departmentId: string;
  workflowId: string;
  status: ApplicationStatus;
  currentStage: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

function toIso(timestamp: Timestamp): string {
  return timestamp.toDate().toISOString();
}

function trackingIdFor(year: number, sequence: number): string {
  return `SYM-${year}-${String(sequence).padStart(8, '0')}`;
}

/**
 * Allocates a counter-backed ID inside the application transaction and checks
 * pre-existing records (including independently seeded demo records). The
 * counter read serializes concurrent allocations; the lookup prevents a
 * collision if a historic record used the same formatted number.
 */
async function allocateUniqueTrackingId(
  transaction: Transaction,
  applications: CollectionReference,
  counterRef: DocumentReference,
  year: number,
  now: Timestamp
): Promise<string> {
  const counter = await transaction.get(counterRef);
  let sequence = counter.exists && Number.isInteger(counter.get('sequence'))
    ? Number(counter.get('sequence'))
    : 0;

  for (let attempts = 0; attempts < 10_000; attempts += 1) {
    sequence += 1;
    const candidate = trackingIdFor(year, sequence);
    const duplicate = await transaction.get(applications.where('trackingId', '==', candidate).limit(1));
    if (!duplicate.empty) continue;

    transaction.set(counterRef, { sequence, year, updatedAt: now }, { merge: true });
    return candidate;
  }

  throw new Error('Unable to allocate a unique application tracking ID.');
}

const applicationStatuses = new Set<ApplicationStatus>([
  'DRAFT',
  'SUBMITTED',
  'DOCUMENT_VERIFICATION',
  'OFFICER_REVIEW',
  'FIELD_VERIFICATION',
  'FAMILY_VERIFICATION',
  'CLARIFICATION_REQUESTED',
  'APPROVAL',
  'APPROVED',
  'REJECTED',
  'CERTIFICATE_GENERATED',
  'CARD_GENERATED',
  'COMPLETED',
  'CANCELLED'
]);

type LocalizedText = { en: string; ta: string };
type StoredApplication = Record<string, unknown>;

function requiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Application record has an invalid ${field}.`);
  }
  return value.trim();
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function localized(value: unknown, fallback: string): LocalizedText {
  if (value && typeof value === 'object') {
    const candidate = value as Partial<LocalizedText>;
    if (typeof candidate.en === 'string' && typeof candidate.ta === 'string') {
      return { en: candidate.en, ta: candidate.ta };
    }
  }

  if (typeof value === 'string' && value.trim()) {
    return { en: value, ta: value };
  }

  return { en: fallback, ta: fallback };
}

function asApplicationStatus(value: unknown): ApplicationStatus {
  if (typeof value !== 'string' || !applicationStatuses.has(value as ApplicationStatus)) {
    throw new Error('Application record has an invalid status.');
  }
  return value as ApplicationStatus;
}

function auditActionForTransition(fromStatus: ApplicationStatus, targetStatus: ApplicationStatus): string {
  if (fromStatus === 'DRAFT' && targetStatus === 'SUBMITTED') return 'APPLICATION_SUBMITTED';
  if (targetStatus === 'CLARIFICATION_REQUESTED') return 'CORRECTION_REQUESTED';
  if (targetStatus === 'APPROVED') return 'APPLICATION_APPROVED';
  if (targetStatus === 'REJECTED') return 'APPLICATION_REJECTED';
  return 'APPLICATION_STATUS_CHANGED';
}

function toTimestampIso(value: unknown): string | undefined {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  return undefined;
}

function toFormData(value: unknown): ApplicationFormData {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(([, entry]) =>
      typeof entry === 'string' || typeof entry === 'number' || typeof entry === 'boolean'
    )
  ) as ApplicationFormData;
}

function toApplicationDocument(value: unknown): ApplicationDocument | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const document = value as Record<string, unknown>;
  const id = optionalString(document.id) ?? optionalString(document.documentId);
  if (!id) return null;

  const source = String(document.source ?? '').toLowerCase().includes('digilocker') ? 'digilocker' : 'upload';
  const statusValue = String(document.status ?? 'pending').toLowerCase();
  const status = statusValue === 'verified'
    ? 'verified'
    : statusValue === 'rejected'
      ? 'rejected'
      : statusValue === 'reupload_required'
        ? 'reupload_required'
        : 'pending';

  return {
    id,
    documentId: optionalString(document.documentType) ?? optionalString(document.documentId) ?? id,
    name: localized(document.name, 'Document').en,
    fileName: optionalString(document.fileName) ?? 'document',
    fileSize: typeof document.size === 'number' ? document.size : typeof document.fileSize === 'number' ? document.fileSize : 0,
    fileType: optionalString(document.mimeType) ?? optionalString(document.fileType) ?? 'application/octet-stream',
    uploadedAt: toTimestampIso(document.uploadedAt) ?? new Date(0).toISOString(),
    status,
    rejectionReason: optionalString(document.rejectionReason),
    source
  };
}

function toHistoryEntry(snapshot: DocumentSnapshot): ApplicationHistoryEntry {
  const entry = (snapshot.data() ?? {}) as Record<string, unknown>;
  const comment = optionalString(entry.comment) ?? optionalString(entry.description) ?? asApplicationStatus(entry.status);
  const changedBy = optionalString(entry.changedBy) ?? optionalString(entry.actorId) ?? 'system';
  const actorRole = optionalString(entry.changedByRole) ?? optionalString(entry.actorRole) ?? 'system';

  return {
    id: optionalString(entry.id) ?? snapshot.id,
    status: asApplicationStatus(entry.status),
    timestamp: toTimestampIso(entry.createdAt) ?? toTimestampIso(entry.timestamp) ?? new Date(0).toISOString(),
    description: comment,
    descriptionTA: optionalString(entry.commentTA) ?? optionalString(entry.descriptionTA) ?? comment,
    actorId: changedBy,
    actorName: optionalString(entry.actorName) ?? changedBy,
    actorRole,
    remarks: optionalString(entry.remarks)
  };
}

function toApplication(
  snapshot: DocumentSnapshot,
  details: { documents?: ApplicationDocument[]; history?: ApplicationHistoryEntry[] } = {}
): Application {
  const data = (snapshot.data() ?? {}) as StoredApplication;
  const formData = toFormData(data.formData);
  const serviceName = localized(data.serviceName, 'Service');
  const departmentName = localized(data.departmentName, 'Department');
  const inlineDocuments = Array.isArray(data.documents)
    ? data.documents.map(toApplicationDocument).filter((document): document is ApplicationDocument => document !== null)
    : [];

  return {
    id: requiredString(data.id ?? snapshot.id, 'id'),
    applicationNumber: requiredString(data.trackingId ?? data.applicationNumber, 'tracking ID'),
    serviceId: requiredString(data.serviceId, 'service ID'),
    serviceName: serviceName.en,
    serviceNameTA: serviceName.ta,
    departmentId: requiredString(data.departmentId, 'department ID'),
    departmentName: departmentName.en,
    departmentNameTA: departmentName.ta,
    citizenId: requiredString(data.citizenId, 'citizen ID'),
    citizenName: optionalString(data.citizenName) ?? optionalString(formData.fullName) ?? 'Citizen',
    workflowId: requiredString(data.workflowId, 'workflow ID'),
    status: asApplicationStatus(data.status),
    formData,
    documents: details.documents ?? inlineDocuments,
    history: details.history ?? [],
    assignedOfficerId: optionalString(data.assignedOfficerId),
    assignedOfficerName: optionalString(data.assignedOfficerName),
    rejectionReason: optionalString(data.rejectionReason),
    resultUrl: optionalString(data.resultUrl),
    certificateUrl: optionalString(data.certificateUrl),
    createdAt: toTimestampIso(data.createdAt) ?? new Date(0).toISOString(),
    updatedAt: toTimestampIso(data.updatedAt) ?? new Date(0).toISOString(),
    submittedAt: toTimestampIso(data.submittedAt),
    completedAt: toTimestampIso(data.completedAt),
    expectedCompletionDate: toTimestampIso(data.expectedCompletionDate),
    slaDeadline: toTimestampIso(data.slaDeadline),
    isSlaBreached: data.isSlaBreached === true
  };
}

function canReadApplication(user: AuthenticatedUser, application: StoredApplication): boolean {
  const citizenId = optionalString(application.citizenId);
  const departmentId = optionalString(application.departmentId);
  const assistedByOperatorId = optionalString(application.assistedByOperatorId);

  if (user.role === 'admin') return true;
  if (user.role === 'citizen') return citizenId === user.uid;
  if (user.role === 'department_user') return !!user.departmentId && departmentId === user.departmentId;
  if (user.role === 'operator') return assistedByOperatorId === user.uid;
  return false;
}

function assertDepartmentProcessor(user: AuthenticatedUser, application: StoredApplication): void {
  if (user.role === 'admin') return;
  if (user.role !== 'department_user' || !user.departmentId || application.departmentId !== user.departmentId) {
    throw new Error('You are not authorized to process this application.');
  }
}

async function getApplicationSnapshot(applicationId: string): Promise<DocumentSnapshot> {
  return getFirebaseAdminFirestore().collection('applications').doc(applicationId).get();
}

async function loadApplicationDocuments(applicationId: string): Promise<ApplicationDocument[]> {
  const snapshot = await getFirebaseAdminFirestore().collection('documents').where('applicationId', '==', applicationId).get();
  return snapshot.docs
    .map((document) => toApplicationDocument({ id: document.id, ...(document.data() as Record<string, unknown>) }))
    .filter((document): document is ApplicationDocument => document !== null)
    .sort((left, right) => right.uploadedAt.localeCompare(left.uploadedAt));
}

/**
 * Creates an application and its initial status record in one transaction.
 * Department, workflow, status, and tracking number never come from the
 * browser, preventing cross-department or client-generated identifiers.
 */
export async function createCitizenApplication(
  citizen: AuthenticatedUser,
  input: CreateApplicationInput
): Promise<CreatedApplication> {
  if (citizen.role !== 'citizen') {
    throw new Error('Only citizens can create applications.');
  }

  return createApplicationForCitizen(citizen, input);
}

async function createApplicationForCitizen(
  citizen: AuthenticatedUser,
  input: CreateApplicationInput,
  assistedByOperator?: AuthenticatedUser
): Promise<CreatedApplication> {

  const service = await getCatalogService(input.serviceId);
  if (!service || !service.isActive || !service.isOnline) {
    throw new Error('This service is unavailable.');
  }

  if (service.implementationMode !== 'NATIVE_WORKFLOW' || !service.workflowId) {
    throw new Error('This service is not yet available for a native Sympho application.');
  }

  // Services are configured by administrators, but the application record
  // must still resolve to an active, real department on the server.
  const department = await getCatalogDepartment(service.departmentId);
  if (!department || !department.isActive) {
    throw new Error('The department responsible for this service is unavailable.');
  }

  const db = getFirebaseAdminFirestore();
  const now = Timestamp.now();
  const year = now.toDate().getUTCFullYear();
  const applications = db.collection('applications');
  const counterRef = db.collection('systemCounters').doc(`applicationTracking-${year}`);
  const applicationRef = applications.doc();
  const historyRef = applicationRef.collection('statusHistory').doc();
  const status: ApplicationStatus = input.submit ? 'SUBMITTED' : 'DRAFT';
  let trackingId = '';

  await db.runTransaction(async (transaction) => {
    trackingId = await allocateUniqueTrackingId(transaction, applications, counterRef, year, now);

    transaction.set(applicationRef, {
      id: applicationRef.id,
      trackingId,
      serviceId: service.id,
      serviceName: service.name,
      citizenId: citizen.uid,
      citizenName: citizen.displayName,
      ...(assistedByOperator ? {
        assistedByOperatorId: assistedByOperator.uid,
        assistedByOperatorName: assistedByOperator.displayName
      } : {}),
      departmentId: service.departmentId,
      departmentName: department.name,
      workflowId: service.workflowId,
      status,
      currentStage: status,
      formData: input.formData,
      documents: [],
      assignedOfficerId: null,
      submittedAt: input.submit ? now : null,
      createdAt: now,
      updatedAt: now
    });

    transaction.set(historyRef, {
      id: historyRef.id,
      status,
      stage: status,
      changedBy: assistedByOperator?.uid ?? citizen.uid,
      changedByRole: assistedByOperator?.role ?? citizen.role,
      actorName: assistedByOperator?.displayName ?? citizen.displayName,
      comment: input.submit ? 'Application submitted' : 'Application saved as draft',
      createdAt: now
    });
    const actor = assistedByOperator ?? citizen;
    writeAuditLogInTransaction(db, transaction, {
      actor,
      departmentId: service.departmentId,
      action: assistedByOperator ? 'ASSISTED_APPLICATION_DRAFT_CREATED' : 'APPLICATION_DRAFT_CREATED',
      entityType: 'application',
      entityId: applicationRef.id,
      timestamp: now,
      metadata: { serviceId: service.id, status }
    });
  });

  return {
    id: applicationRef.id,
    trackingId,
    serviceId: service.id,
    serviceName: service.name,
    citizenId: citizen.uid,
    departmentId: service.departmentId,
    workflowId: service.workflowId,
    status,
    currentStage: status,
    createdAt: toIso(now),
    updatedAt: toIso(now),
    submittedAt: input.submit ? toIso(now) : undefined
  };
}

/**
 * Operators may create a draft for a known citizen UID, but cannot submit or
 * process it. This gives assisted-service support without broad citizen or
 * department access.
 */
export async function createAssistedApplicationDraft(
  operator: AuthenticatedUser,
  citizenId: string,
  input: Omit<CreateApplicationInput, 'submit'>
): Promise<CreatedApplication> {
  if (operator.role !== 'operator') throw new Error('Only operators can create assisted drafts.');
  if (!citizenId.trim() || citizenId.length > 128) throw new Error('A valid citizen account ID is required.');

  const profileSnapshot = await getFirebaseAdminFirestore().collection('users').doc(citizenId).get();
  if (!profileSnapshot.exists) throw new Error('Citizen account not found.');
  const profile = profileSnapshot.data() as Record<string, unknown>;
  if (profile.role !== 'citizen' || profile.isActive === false) throw new Error('Citizen account is unavailable.');

  const email = optionalString(profile.email);
  const displayName = optionalString(profile.displayName) ?? email?.split('@')[0] ?? 'Citizen';
  const citizen: AuthenticatedUser = {
    id: citizenId,
    uid: citizenId,
    email: email ?? '',
    name: displayName,
    displayName,
    role: 'citizen',
    createdAt: toTimestampIso(profile.createdAt) ?? new Date().toISOString(),
    isActive: true,
    preferredLanguage: profile.preferredLanguage === 'ta' ? 'ta' : 'en'
  };

  return createApplicationForCitizen(citizen, { ...input, submit: false }, operator);
}

/**
 * Lists only the applications visible to the verified user. Department and
 * operator queries are scoped in Firestore before the result is mapped.
 */
export async function listApplicationsForUser(user: AuthenticatedUser): Promise<Application[]> {
  const applications = getFirebaseAdminFirestore().collection('applications');
  let snapshot;

  if (user.role === 'citizen') {
    snapshot = await applications.where('citizenId', '==', user.uid).get();
  } else if (user.role === 'department_user') {
    if (!user.departmentId) return [];
    snapshot = await applications.where('departmentId', '==', user.departmentId).get();
  } else if (user.role === 'operator') {
    // Operators see only explicitly assisted applications, never a whole department queue.
    snapshot = await applications.where('assistedByOperatorId', '==', user.uid).get();
  } else {
    snapshot = await applications.limit(250).get();
  }

  return snapshot.docs
    .map((application) => toApplication(application))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

/** Reads a single application after applying the same server-side scope check. */
export async function getApplicationForUser(
  user: AuthenticatedUser,
  applicationId: string,
  includeDetails = true
): Promise<Application | null> {
  const snapshot = await getApplicationSnapshot(applicationId);
  if (!snapshot.exists) return null;

  const stored = snapshot.data() as StoredApplication;
  if (!canReadApplication(user, stored)) return null;

  if (!includeDetails) return toApplication(snapshot);

  const [historySnapshot, documents] = await Promise.all([
    snapshot.ref.collection('statusHistory').get(),
    loadApplicationDocuments(applicationId)
  ]);
  const history = historySnapshot.docs
    .map(toHistoryEntry)
    .sort((left, right) => left.timestamp.localeCompare(right.timestamp));

  return toApplication(snapshot, { documents: documents.length > 0 ? documents : undefined, history });
}

/** Returns transitions that the verified user may take from the application's current state. */
export async function getApplicationWorkflowActions(
  user: AuthenticatedUser,
  applicationId: string
): Promise<AvailableWorkflowAction[]> {
  const snapshot = await getApplicationSnapshot(applicationId);
  if (!snapshot.exists) return [];

  const stored = snapshot.data() as StoredApplication;
  if (!canReadApplication(user, stored)) return [];

  const workflowId = requiredString(stored.workflowId, 'workflow ID');
  const workflow = await getWorkflowDefinition(workflowId);
  if (!workflow) return [];
  return getAvailableWorkflowActions(workflow, asApplicationStatus(stored.status), user);
}

export interface TransitionApplicationInput {
  transitionId: string;
  comment?: string;
}

/**
 * Advances an application through its Firestore workflow. The status change
 * and append-only history entry are committed in a single transaction.
 */
export async function transitionApplication(
  user: AuthenticatedUser,
  applicationId: string,
  input: TransitionApplicationInput
): Promise<Application> {
  const db = getFirebaseAdminFirestore();
  const applicationRef = db.collection('applications').doc(applicationId);
  const initial = await applicationRef.get();
  if (!initial.exists) throw new Error('Application not found.');

  const initialData = initial.data() as StoredApplication;
  if (!canReadApplication(user, initialData)) throw new Error('Application not found.');
  const workflowId = requiredString(initialData.workflowId, 'workflow ID');
  const workflow = await getWorkflowDefinition(workflowId);
  if (!workflow) throw new Error('Application workflow is unavailable.');

  const comment = input.comment?.trim();
  if (comment && comment.length > 2000) throw new Error('Remarks are too long.');

  await db.runTransaction(async (transaction) => {
    const applicationSnapshot = await transaction.get(applicationRef);
    if (!applicationSnapshot.exists) throw new Error('Application not found.');

    const application = applicationSnapshot.data() as StoredApplication;
    if (!canReadApplication(user, application)) throw new Error('Application not found.');
    if (requiredString(application.workflowId, 'workflow ID') !== workflowId) {
      throw new Error('The application workflow changed. Refresh and try again.');
    }

    const currentStatus = asApplicationStatus(application.status);
    const transition = getWorkflowTransition(workflow, currentStatus, user, input.transitionId);
    if (!transition) throw new Error('This workflow action is not permitted from the current stage.');
    if (transition.requiresReason && !comment) throw new Error('Official remarks are required for this action.');

    const targetStatus = asApplicationStatus(transition.toState);
    const departmentId = requiredString(application.departmentId, 'department ID');
    // Firestore requires every transaction read before its first write.
    // Recipient lookup therefore occurs before history/audit/notification
    // writes, while preserving one atomic submission transaction.
    const departmentRecipientIds = currentStatus === 'DRAFT' && targetStatus === 'SUBMITTED'
      ? (await transaction.get(
          db.collection('users')
            .where('role', '==', 'department_user')
            .where('departmentId', '==', departmentId)
        )).docs
          .filter((officer) => officer.get('isActive') !== false)
          .map((officer) => officer.id)
      : [];

    const documents = Array.isArray(application.documents) ? application.documents : [];
    if (transition.requiresDocuments && documents.length === 0) {
      throw new Error('Required documents have not been uploaded.');
    }

    const now = Timestamp.now();
    const automaticTransitions: Array<{ status: ApplicationStatus; action: { en: string; ta: string } }> = [];
    let finalStatus = targetStatus;

    // Run only workflow-configured system transitions. The bounded chain keeps
    // a malformed workflow from creating an unbounded transaction loop.
    for (let index = 0; index < 10; index += 1) {
      const automaticTransition = workflow.transitions.find((candidate) =>
        candidate.fromState === finalStatus && candidate.autoTransition === true && candidate.requiredRole === 'system'
      );
      if (!automaticTransition) break;

      finalStatus = asApplicationStatus(automaticTransition.toState);
      automaticTransitions.push({ status: finalStatus, action: automaticTransition.action });
    }
    if (automaticTransitions.length === 10) throw new Error('Workflow has an invalid automatic transition loop.');

    const update: Record<string, unknown> = {
      status: finalStatus,
      currentStage: finalStatus,
      updatedAt: now
    };

    if (user.role === 'department_user') {
      update.assignedOfficerId = user.uid;
      update.assignedOfficerName = user.displayName;
    }
    if (finalStatus === 'REJECTED') update.rejectionReason = comment ?? null;
    if (workflow.terminalStates.includes(finalStatus)) update.completedAt = now;

    const historyRef = applicationRef.collection('statusHistory').doc();
    transaction.update(applicationRef, update);
    transaction.set(historyRef, {
      id: historyRef.id,
      status: targetStatus,
      stage: targetStatus,
      changedBy: user.uid,
      changedByRole: user.role,
      actorName: user.displayName,
      comment: comment ?? transition.action.en,
      commentTA: transition.action.ta,
      remarks: comment ?? null,
      createdAt: now
    });
    for (const automaticTransition of automaticTransitions) {
      const automaticHistoryRef = applicationRef.collection('statusHistory').doc();
      transaction.set(automaticHistoryRef, {
        id: automaticHistoryRef.id,
        status: automaticTransition.status,
        stage: automaticTransition.status,
        changedBy: 'system',
        changedByRole: 'system',
        actorName: 'System',
        comment: automaticTransition.action.en,
        commentTA: automaticTransition.action.ta,
        createdAt: now
      });
    }

    const storedApplicationId = requiredString(application.id ?? applicationRef.id, 'id');
    const trackingId = requiredString(application.trackingId, 'tracking ID');
    const citizenId = requiredString(application.citizenId, 'citizen ID');
    const assignmentChanged = user.role === 'department_user'
      && optionalString(application.assignedOfficerId) !== user.uid;
    writeAuditLogInTransaction(db, transaction, {
      actor: user,
      departmentId: requiredString(application.departmentId, 'department ID'),
      action: auditActionForTransition(currentStatus, targetStatus),
      entityType: 'application',
      entityId: storedApplicationId,
      timestamp: now,
      metadata: {
        fromStatus: currentStatus,
        targetStatus,
        finalStatus,
        transitionId: transition.id
      }
    });
    if (assignmentChanged) {
      writeAuditLogInTransaction(db, transaction, {
        actor: user,
        departmentId: requiredString(application.departmentId, 'department ID'),
        action: 'APPLICATION_ASSIGNED',
        entityType: 'application',
        entityId: storedApplicationId,
        timestamp: now,
        metadata: { assignedOfficerId: user.uid }
      });
    }
    if (automaticTransitions.length > 0) {
      writeAuditLogInTransaction(db, transaction, {
        actor: { uid: 'system', role: 'system' },
        departmentId: requiredString(application.departmentId, 'department ID'),
        action: 'APPLICATION_AUTO_ADVANCED',
        entityType: 'application',
        entityId: storedApplicationId,
        timestamp: now,
        metadata: { fromStatus: targetStatus, finalStatus, transitionCount: automaticTransitions.length }
      });
    }
    writeNotificationInTransaction(db, transaction, applicationTransitionNotification({
      recipientId: citizenId,
      applicationId: storedApplicationId,
      trackingId,
      fromStatus: currentStatus,
      targetStatus,
      finalStatus
    }));
    if (departmentRecipientIds.length > 0) {
      writeDepartmentSubmissionNotificationsInTransaction(db, transaction, {
        recipientIds: departmentRecipientIds,
        applicationId: storedApplicationId,
        trackingId
      });
    }
  });

  const application = await getApplicationForUser(user, applicationId);
  if (!application) throw new Error('Application not found.');
  return application;
}

/** Submits a citizen-owned draft by using the workflow's configured transition. */
export async function submitCitizenDraft(user: AuthenticatedUser, applicationId: string): Promise<Application> {
  if (user.role !== 'citizen') throw new Error('Only citizens can submit drafts.');

  const snapshot = await getApplicationSnapshot(applicationId);
  if (!snapshot.exists) throw new Error('Application not found.');
  const application = snapshot.data() as StoredApplication;
  if (!canReadApplication(user, application)) throw new Error('Application not found.');
  if (asApplicationStatus(application.status) !== 'DRAFT') {
    throw new Error('Only draft applications can be submitted.');
  }

  const service = await getCatalogService(requiredString(application.serviceId, 'service ID'));
  if (!service) throw new Error('Application service is unavailable.');
  const uploadedTypes = new Set(
    (Array.isArray(application.documents) ? application.documents : [])
      .filter((document): document is Record<string, unknown> => !!document && typeof document === 'object')
      .map((document) => optionalString(document.documentType))
      .filter((documentType): documentType is string => !!documentType)
  );
  const missingRequiredDocument = service.requiredDocuments.find(
    (document) => document.mandatory && !uploadedTypes.has(document.id)
  );
  if (missingRequiredDocument) throw new Error('Upload all mandatory documents before submitting this application.');

  const workflow = await getWorkflowDefinition(requiredString(application.workflowId, 'workflow ID'));
  if (!workflow) throw new Error('Application workflow is unavailable.');
  const submitTransition = getAvailableWorkflowActions(workflow, 'DRAFT', user)
    .find((transition) => transition.toState === 'SUBMITTED');
  if (!submitTransition) throw new Error('This draft cannot be submitted through its workflow.');

  return transitionApplication(user, applicationId, { transitionId: submitTransition.id });
}

export async function reviewApplicationDocument(
  user: AuthenticatedUser,
  applicationId: string,
  documentId: string,
  status: 'verified' | 'rejected',
  comment?: string
): Promise<Application> {
  const db = getFirebaseAdminFirestore();
  const applicationRef = db.collection('applications').doc(applicationId);
  const documentRef = db.collection('documents').doc(documentId);
  const normalizedComment = comment?.trim();
  if (normalizedComment && normalizedComment.length > 2000) throw new Error('Remarks are too long.');

  await db.runTransaction(async (transaction) => {
    const [applicationSnapshot, documentSnapshot] = await Promise.all([
      transaction.get(applicationRef),
      transaction.get(documentRef)
    ]);
    if (!applicationSnapshot.exists || !documentSnapshot.exists) throw new Error('Application document not found.');

    const application = applicationSnapshot.data() as StoredApplication;
    assertDepartmentProcessor(user, application);
    const document = documentSnapshot.data() as Record<string, unknown>;
    if (document.applicationId !== applicationId) throw new Error('Application document not found.');
    if (status === 'rejected' && !normalizedComment) throw new Error('Remarks are required when rejecting a document.');

    const now = Timestamp.now();
    const applicationDocuments = Array.isArray(application.documents) ? application.documents : [];
    const updatedDocuments = applicationDocuments.map((entry) => {
      if (!entry || typeof entry !== 'object') return entry;
      const current = entry as Record<string, unknown>;
      if (current.id === documentId || current.documentId === documentId) {
        return {
          ...current,
          status,
          ...(status === 'rejected' ? { rejectionReason: normalizedComment ?? null } : { rejectionReason: null })
        };
      }
      return entry;
    });
    const historyRef = applicationRef.collection('statusHistory').doc();

    transaction.update(documentRef, {
      status,
      reviewedAt: now,
      reviewedBy: user.uid,
      ...(status === 'rejected' ? { rejectionReason: normalizedComment ?? null } : { rejectionReason: null })
    });
    transaction.update(applicationRef, { documents: updatedDocuments, updatedAt: now });
    transaction.set(historyRef, {
      id: historyRef.id,
      status: asApplicationStatus(application.status),
      stage: asApplicationStatus(application.status),
      changedBy: user.uid,
      changedByRole: user.role,
      actorName: user.displayName,
      comment: normalizedComment ?? `Document ${status}`,
      commentTA: normalizedComment ?? `Document ${status}`,
      remarks: normalizedComment ?? null,
      createdAt: now
    });
    const storedApplicationId = requiredString(application.id ?? applicationRef.id, 'id');
    const trackingId = requiredString(application.trackingId, 'tracking ID');
    const citizenId = requiredString(application.citizenId, 'citizen ID');
    writeAuditLogInTransaction(db, transaction, {
      actor: user,
      departmentId: requiredString(application.departmentId, 'department ID'),
      action: status === 'verified' ? 'DOCUMENT_VERIFIED' : 'DOCUMENT_REJECTED',
      entityType: 'document',
      entityId: documentId,
      timestamp: now,
      metadata: { applicationId: storedApplicationId }
    });
    writeNotificationInTransaction(db, transaction, documentReviewNotification({
      recipientId: citizenId,
      applicationId: storedApplicationId,
      trackingId,
      status
    }));
  });

  const application = await getApplicationForUser(user, applicationId);
  if (!application) throw new Error('Application not found.');
  return application;
}

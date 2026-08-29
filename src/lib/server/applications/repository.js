import { Timestamp } from 'firebase-admin/firestore';
import { getCatalogDepartment, getCatalogService } from '$lib/server/catalog/repository';
import { getFirebaseAdminFirestore } from '$lib/server/firebase/admin';
import { writeAuditLogInTransaction } from '$lib/server/audit/repository';
import { applicationTransitionNotification, documentReviewNotification, writeDepartmentSubmissionNotificationsInTransaction, writeNotificationInTransaction } from '$lib/server/notifications/repository';
import { createPaymentOtpChallenge, verifyPaymentOtpChallenge } from '$lib/server/payments/otp';
import { assertPaymentOutcome, buildSimulatedPaymentReference, requiresPaymentForService } from '$lib/server/payments/simulation';
import { sendApplicationSms } from '$lib/server/sms/applicationSms';
import { getAvailableWorkflowActions, getWorkflowDefinition, getWorkflowTransition } from '$lib/server/workflows/repository';
function toIso(timestamp) {
    return timestamp.toDate().toISOString();
}
function trackingIdFor(year, sequence) {
    return `TNH-${year}-${String(sequence).padStart(8, '0')}`;
}
/**
 * Allocates a counter-backed ID inside the application transaction and checks
 * pre-existing records (including independently seeded demo records). The
 * counter read serializes concurrent allocations; the lookup prevents a
 * collision if a historic record used the same formatted number.
 */
async function allocateUniqueTrackingId(transaction, applications, counterRef, year, now) {
    const counter = await transaction.get(counterRef);
    let sequence = counter.exists && Number.isInteger(counter.get('sequence'))
        ? Number(counter.get('sequence'))
        : 0;
    for (let attempts = 0; attempts < 10_000; attempts += 1) {
        sequence += 1;
        const candidate = trackingIdFor(year, sequence);
        const duplicate = await transaction.get(applications.where('trackingId', '==', candidate).limit(1));
        if (!duplicate.empty)
            continue;
        transaction.set(counterRef, { sequence, year, updatedAt: now }, { merge: true });
        return candidate;
    }
    throw new Error('Unable to allocate a unique application tracking ID.');
}
const applicationStatuses = new Set([
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
function requiredString(value, field) {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error(`Application record has an invalid ${field}.`);
    }
    return value.trim();
}
function optionalString(value) {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}
function localized(value, fallback) {
    if (value && typeof value === 'object') {
        const candidate = value;
        if (typeof candidate.en === 'string' && typeof candidate.ta === 'string') {
            return { en: candidate.en, ta: candidate.ta };
        }
    }
    if (typeof value === 'string' && value.trim()) {
        return { en: value, ta: value };
    }
    return { en: fallback, ta: fallback };
}
function asApplicationStatus(value) {
    if (typeof value !== 'string' || !applicationStatuses.has(value)) {
        throw new Error('Application record has an invalid status.');
    }
    return value;
}
function auditActionForTransition(fromStatus, targetStatus) {
    if (fromStatus === 'DRAFT' && targetStatus === 'SUBMITTED')
        return 'APPLICATION_SUBMITTED';
    if (targetStatus === 'CLARIFICATION_REQUESTED')
        return 'CORRECTION_REQUESTED';
    if (targetStatus === 'APPROVED')
        return 'APPLICATION_APPROVED';
    if (targetStatus === 'REJECTED')
        return 'APPLICATION_REJECTED';
    return 'APPLICATION_STATUS_CHANGED';
}
function smsEventForTransition(fromStatus, targetStatus, finalStatus) {
    if (fromStatus === 'DRAFT' && targetStatus === 'SUBMITTED')
        return 'APPLICATION_SUBMITTED';
    if (targetStatus === 'CLARIFICATION_REQUESTED')
        return 'CLARIFICATION_REQUESTED';
    if (targetStatus === 'REJECTED' || finalStatus === 'REJECTED')
        return 'APPLICATION_REJECTED';
    if (targetStatus === 'APPROVED')
        return 'APPLICATION_APPROVED';
    if (finalStatus === 'COMPLETED')
        return 'APPLICATION_COMPLETED';
    return null;
}
function toTimestampIso(value) {
    if (value instanceof Timestamp)
        return value.toDate().toISOString();
    if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
        return value.toDate().toISOString();
    }
    return undefined;
}
function toFormData(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        return {};
    return Object.fromEntries(Object.entries(value).filter(([, entry]) => typeof entry === 'string' || typeof entry === 'number' || typeof entry === 'boolean'));
}
function toApplicationDocument(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        return null;
    const document = value;
    const id = optionalString(document.id) ?? optionalString(document.documentId);
    if (!id)
        return null;
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
function toHistoryEntry(snapshot) {
    const entry = (snapshot.data() ?? {});
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
function toApplication(snapshot, details = {}) {
    const data = (snapshot.data() ?? {});
    const formData = toFormData(data.formData);
    const serviceName = localized(data.serviceName, 'Service');
    const departmentName = localized(data.departmentName, 'Department');
    const inlineDocuments = Array.isArray(data.documents)
        ? data.documents.map(toApplicationDocument).filter((document) => document !== null)
        : [];
    return {
        id: requiredString(data.id ?? snapshot.id, 'id'),
        applicationNumber: requiredString(data.trackingId ?? data.applicationNumber, 'tracking ID'),
        serviceId: requiredString(data.serviceId, 'service ID'),
        serviceSlug: optionalString(data.serviceSlug),
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
        reviewedDocumentIds: Array.isArray(data.reviewedDocumentIds)
            ? data.reviewedDocumentIds.filter((value) => typeof value === 'string' && value.trim().length > 0)
            : [],
        payment: data.payment && typeof data.payment === 'object' ? {
            status: optionalString(data.payment.status) ?? 'NOT_REQUIRED',
            amount: Number(data.payment.amount ?? 0),
            provider: optionalString(data.payment.provider),
            referenceId: optionalString(data.payment.referenceId),
            updatedAt: toTimestampIso(data.payment.updatedAt)
        } : undefined,
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
function canReadApplication(user, application) {
    const citizenId = optionalString(application.citizenId);
    const departmentId = optionalString(application.departmentId);
    const assistedByOperatorId = optionalString(application.assistedByOperatorId);
    if (user.role === 'admin')
        return true;
    if (user.role === 'citizen')
        return citizenId === user.uid;
    if (user.role === 'department_user')
        return !!user.departmentId && departmentId === user.departmentId;
    if (user.role === 'operator')
        return assistedByOperatorId === user.uid || citizenId === user.uid;
    return false;
}
function assertDepartmentProcessor(user, application) {
    if (user.role === 'admin')
        return;
    if (user.role !== 'department_user' || !user.departmentId || application.departmentId !== user.departmentId) {
        throw new Error('You are not authorized to process this application.');
    }
}
function canSubmitApplication(user, application) {
    const isOwner = optionalString(application.citizenId) === user.uid;
    const isAssistingOperator = optionalString(application.assistedByOperatorId) === user.uid;
    return user.role === 'admin' || isOwner || isAssistingOperator;
}
function applicationPaymentStatus(application) {
    return optionalString(application?.payment?.status) ?? 'NOT_REQUIRED';
}
function paymentChallengeFromApplication(application) {
    const challenge = application?.payment?.otpChallenge;
    if (!challenge || typeof challenge !== 'object')
        return null;
    const expiresAt = challenge.expiresAt;
    const expiresAtMs = expiresAt instanceof Timestamp
        ? expiresAt.toMillis()
        : expiresAt && typeof expiresAt.toDate === 'function'
            ? expiresAt.toDate().getTime()
            : Number(challenge.expiresAtMs ?? 0);
    return {
        salt: optionalString(challenge.salt),
        otpHash: optionalString(challenge.otpHash),
        expiresAtMs,
        attempts: Number(challenge.attempts ?? 0),
        maxAttempts: Number(challenge.maxAttempts ?? 3)
    };
}
function assertPaymentUser(user, application) {
    if (user.role !== 'citizen' && user.role !== 'operator') {
        throw new Error('Only citizens or operators can manage application payment.');
    }
    if (!canReadApplication(user, application) || !canSubmitApplication(user, application)) {
        throw new Error('Application not found.');
    }
}
function normalizeReviewedDocumentIds(value) {
    if (!Array.isArray(value))
        return [];
    return [...new Set(value
            .filter((entry) => typeof entry === 'string' && entry.trim().length > 0)
            .map((entry) => entry.trim()))];
}
async function getApplicationSnapshot(applicationId) {
    return getFirebaseAdminFirestore().collection('applications').doc(applicationId).get();
}
async function loadApplicationDocuments(applicationId) {
    const snapshot = await getFirebaseAdminFirestore().collection('documents').where('applicationId', '==', applicationId).get();
    return snapshot.docs
        .map((document) => toApplicationDocument({ id: document.id, ...document.data() }))
        .filter((document) => document !== null)
        .sort((left, right) => right.uploadedAt.localeCompare(left.uploadedAt));
}
/**
 * Creates an application and its initial status record in one transaction.
 * Department, workflow, status, and tracking number never come from the
 * browser, preventing cross-department or client-generated identifiers.
 */
export async function createCitizenApplication(citizen, input) {
    if (citizen.role !== 'citizen' && citizen.role !== 'operator') {
        throw new Error('Only citizens or operators can create applications.');
    }
    return createApplicationForCitizen(citizen, input);
}
async function createApplicationForCitizen(citizen, input, assistedByOperator) {
    const service = await getCatalogService(input.serviceId);
    if (!service || !service.isActive || !service.isOnline) {
        throw new Error('This service is unavailable.');
    }
    if (!service.workflowId) {
        throw new Error('This service is unavailable.');
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
    const status = input.submit ? 'SUBMITTED' : 'DRAFT';
    let trackingId = '';
    await db.runTransaction(async (transaction) => {
        trackingId = await allocateUniqueTrackingId(transaction, applications, counterRef, year, now);
        transaction.set(applicationRef, {
            id: applicationRef.id,
            trackingId,
            serviceId: service.id,
            serviceSlug: service.slug,
            serviceName: service.name,
            citizenId: citizen.uid,
            citizenName: input.formData.fullName || citizen.displayName,
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
            reviewedDocumentIds: [],
            assignedOfficerId: null,
            submittedAt: input.submit ? now : null,
            ...(input.submit ? {
                submittedByUserId: assistedByOperator?.uid ?? citizen.uid,
                submittedByRole: assistedByOperator?.role ?? citizen.role,
                submissionMode: assistedByOperator ? 'assisted' : 'self_service'
            } : {}),
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
export async function createAssistedApplicationDraft(operator, citizenIdOrEmailOrPhone, input) {
    if (operator.role !== 'operator')
        throw new Error('Only operators can create assisted drafts.');
    const identifier = citizenIdOrEmailOrPhone.trim();
    if (!identifier)
        throw new Error('A valid citizen identifier (UID, email, or phone) is required.');
    const db = getFirebaseAdminFirestore();
    let citizenId = identifier;
    let profile;
    // 1. Try search by UID
    const docRef = db.collection('users').doc(identifier);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
        profile = docSnap.data();
    }
    else {
        // 2. Try search by Email
        const emailQuery = await db.collection('users')
            .where('email', '==', identifier)
            .limit(1)
            .get();
        if (!emailQuery.empty) {
            profile = emailQuery.docs[0].data();
            citizenId = emailQuery.docs[0].id;
        }
        else {
            // 3. Try search by Phone
            const phoneQuery = await db.collection('users')
                .where('phone', '==', identifier)
                .limit(1)
                .get();
            if (!phoneQuery.empty) {
                profile = phoneQuery.docs[0].data();
                citizenId = phoneQuery.docs[0].id;
            }
        }
    }
    // 4. Register new citizen placeholder on the fly if not found
    if (!profile) {
        const isEmail = identifier.includes('@');
        const newCitizenRef = db.collection('users').doc();
        citizenId = newCitizenRef.id;
        profile = {
            id: citizenId,
            uid: citizenId,
            email: isEmail ? identifier : '',
            phone: !isEmail ? identifier : '',
            name: isEmail ? identifier.split('@')[0] : `Citizen (${identifier.substring(identifier.length - 4)})`,
            displayName: isEmail ? identifier.split('@')[0] : `Citizen (${identifier.substring(identifier.length - 4)})`,
            role: 'citizen',
            isActive: true,
            preferredLanguage: 'en',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };
        await newCitizenRef.set(profile);
    }
    const email = optionalString(profile.email);
    const displayName = optionalString(profile.name) ?? optionalString(profile.displayName) ?? email?.split('@')[0] ?? 'Citizen';
    const citizen = {
        id: citizenId,
        uid: citizenId,
        email: email ?? '',
        name: displayName,
        displayName,
        role: 'citizen',
        createdAt: profile.createdAt instanceof Timestamp ? profile.createdAt.toDate().toISOString() : new Date().toISOString(),
        isActive: true,
        preferredLanguage: profile.preferredLanguage === 'ta' ? 'ta' : 'en'
    };
    // Pre-fill application form with the resolved citizen details
    const updatedInput = {
        ...input,
        formData: {
            email: email ?? '',
            phone: optionalString(profile.phone) ?? '',
            fullName: displayName.startsWith('Citizen (') ? '' : displayName,
            ...input.formData
        }
    };
    return createApplicationForCitizen(citizen, { ...updatedInput, submit: false }, operator);
}
/**
 * Lists only the applications visible to the verified user. Department and
 * operator queries are scoped in Firestore before the result is mapped.
 */
export async function listApplicationsForUser(user, maxResults = 100) {
    const applications = getFirebaseAdminFirestore().collection('applications');
    let snapshot;
    if (user.role === 'citizen') {
        snapshot = await applications.where('citizenId', '==', user.uid).limit(maxResults).get();
    }
    else if (user.role === 'department_user') {
        if (!user.departmentId)
            return [];
        snapshot = await applications.where('departmentId', '==', user.departmentId).limit(maxResults).get();
    }
    else if (user.role === 'operator') {
        snapshot = await applications.where('assistedByOperatorId', '==', user.uid).limit(maxResults).get();
    }
    else {
        snapshot = await applications.limit(maxResults).get();
    }
    const mapped = snapshot.docs
        .map((application) => toApplication(application))
        .filter((application) => user.role !== 'department_user' || application.status !== 'DRAFT')
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
    return Promise.all(mapped.map(async (application) => {
        if (application.serviceSlug)
            return application;
        const service = await getCatalogService(application.serviceId);
        return service ? { ...application, serviceSlug: service.slug } : application;
    }));
}
/** Reads a single application after applying the same server-side scope check. */
export async function getApplicationForUser(user, applicationId, includeDetails = true) {
    const snapshot = await getApplicationSnapshot(applicationId);
    if (!snapshot.exists)
        return null;
    const stored = snapshot.data();
    if (!canReadApplication(user, stored))
        return null;
    if (!includeDetails)
        return toApplication(snapshot);
    const [historySnapshot, documents] = await Promise.all([
        snapshot.ref.collection('statusHistory').get(),
        loadApplicationDocuments(applicationId)
    ]);
    const history = historySnapshot.docs
        .map(toHistoryEntry)
        .sort((left, right) => left.timestamp.localeCompare(right.timestamp));
    const application = toApplication(snapshot, { documents: documents.length > 0 ? documents : undefined, history });
    if (application.serviceSlug)
        return application;
    const service = await getCatalogService(application.serviceId);
    return service ? { ...application, serviceSlug: service.slug } : application;
}
/** Returns transitions that the verified user may take from the application's current state. */
export async function getApplicationWorkflowActions(user, applicationId) {
    const snapshot = await getApplicationSnapshot(applicationId);
    if (!snapshot.exists)
        return [];
    const stored = snapshot.data();
    if (!canReadApplication(user, stored))
        return [];
    const workflowId = requiredString(stored.workflowId, 'workflow ID');
    const workflow = await getWorkflowDefinition(workflowId);
    if (!workflow)
        return [];
    return getAvailableWorkflowActions(workflow, asApplicationStatus(stored.status), user);
}
/**
 * Advances an application through its Firestore workflow. The status change
 * and append-only history entry are committed in a single transaction.
 */
export async function transitionApplication(user, applicationId, input) {
    const db = getFirebaseAdminFirestore();
    const applicationRef = db.collection('applications').doc(applicationId);
    const initial = await applicationRef.get();
    if (!initial.exists)
        throw new Error('Application not found.');
    const initialData = initial.data();
    if (!canReadApplication(user, initialData))
        throw new Error('Application not found.');
    const workflowId = requiredString(initialData.workflowId, 'workflow ID');
    const workflow = await getWorkflowDefinition(workflowId);
    if (!workflow)
        throw new Error('Application workflow is unavailable.');
    const serviceId = requiredString(initialData.serviceId, 'service ID');
    const service = await getCatalogService(serviceId);
    const comment = input.comment?.trim();
    if (comment && comment.length > 2000)
        throw new Error('Remarks are too long.');
    let smsEvent = null;
    await db.runTransaction(async (transaction) => {
        const applicationSnapshot = await transaction.get(applicationRef);
        if (!applicationSnapshot.exists)
            throw new Error('Application not found.');
        const application = applicationSnapshot.data();
        if (!canReadApplication(user, application))
            throw new Error('Application not found.');
        const storedApplicationId = requiredString(application.id ?? applicationRef.id, 'id');
        const trackingId = requiredString(application.trackingId, 'tracking ID');
        const citizenId = requiredString(application.citizenId, 'citizen ID');
        const assistedByOperatorId = optionalString(application.assistedByOperatorId);
        if (requiredString(application.workflowId, 'workflow ID') !== workflowId) {
            throw new Error('The application workflow changed. Refresh and try again.');
        }
        const currentStatus = asApplicationStatus(application.status);
        const transition = getWorkflowTransition(workflow, currentStatus, user, input.transitionId);
        if (!transition)
            throw new Error('This workflow action is not permitted from the current stage.');
        if (transition.requiresReason && !comment)
            throw new Error('Official remarks are required for this action.');
        const targetStatus = asApplicationStatus(transition.toState);
        const departmentId = requiredString(application.departmentId, 'department ID');
        // Firestore requires every transaction read before its first write.
        // Recipient lookup therefore occurs before history/audit/notification
        // writes, while preserving one atomic submission transaction.
        const departmentRecipientIds = currentStatus === 'DRAFT' && targetStatus === 'SUBMITTED'
            ? (await transaction.get(db.collection('users')
                .where('role', '==', 'department_user')
                .where('departmentId', '==', departmentId))).docs
                .filter((officer) => officer.get('isActive') !== false)
                .map((officer) => officer.id)
            : [];
        const documents = Array.isArray(application.documents) ? application.documents : [];
        const reviewedDocumentIds = normalizeReviewedDocumentIds(application.reviewedDocumentIds);
        const submittedDocumentIds = documents
            .map((document) => optionalString(document.id) ?? optionalString(document.documentId))
            .filter((documentId) => typeof documentId === 'string');
        if (transition.requiresDocuments && documents.length === 0) {
            throw new Error('Required documents have not been uploaded.');
        }
        if (user.role === 'department_user' && ['APPROVED', 'REJECTED'].includes(targetStatus)) {
            const unreviewedDocuments = submittedDocumentIds.filter((documentId) => !reviewedDocumentIds.includes(documentId));
            if (submittedDocumentIds.length > 0 && unreviewedDocuments.length > 0) {
                throw new Error('Please view all submitted documents before making a final decision.');
            }
        }
        const now = Timestamp.now();
        const automaticTransitions = [];
        let finalStatus = targetStatus;
        // Run only workflow-configured system transitions. The bounded chain keeps
        // a malformed workflow from creating an unbounded transaction loop.
        for (let index = 0; index < 10; index += 1) {
            const automaticTransition = workflow.transitions.find((candidate) => candidate.fromState === finalStatus && candidate.autoTransition === true && candidate.requiredRole === 'system');
            if (!automaticTransition)
                break;
            finalStatus = asApplicationStatus(automaticTransition.toState);
            automaticTransitions.push({ status: finalStatus, action: automaticTransition.action });
        }
        if (automaticTransitions.length === 10)
            throw new Error('Workflow has an invalid automatic transition loop.');
        smsEvent = smsEventForTransition(currentStatus, targetStatus, finalStatus);
        const update = {
            status: finalStatus,
            currentStage: finalStatus,
            updatedAt: now
        };
        if (currentStatus === 'DRAFT' && targetStatus === 'SUBMITTED') {
            update.submittedAt = now;
            update.submittedByUserId = user.uid;
            update.submittedByRole = user.role;
            update.submissionMode = user.role === 'operator' ? 'assisted' : 'self_service';
        }
        if (user.role === 'department_user') {
            update.assignedOfficerId = user.uid;
            update.assignedOfficerName = user.displayName;
        }
        if (finalStatus === 'REJECTED')
            update.rejectionReason = comment ?? null;
        if (workflow.terminalStates.includes(finalStatus))
            update.completedAt = now;
        if (currentStatus === 'CLARIFICATION_REQUESTED' && targetStatus === 'DOCUMENT_VERIFICATION') {
            update.isResubmitted = true;
            update.isReady = true;
        } else if (currentStatus === 'DOCUMENT_VERIFICATION') {
            update.isResubmitted = false;
            update.isReady = false;
        }
        if (finalStatus === 'APPROVED' || finalStatus === 'COMPLETED') {
            const certRef = db.collection('documents').doc();
            const serviceName = service ? service.name.en : (workflowId.includes('income') ? 'Income Certificate' : (workflowId.includes('adangal') ? 'e-Adangal Extract' : 'Government Certificate'));
            const serviceNameTA = service ? service.name.ta : (workflowId.includes('income') ? 'வருமானச் சான்றிதழ்' : (workflowId.includes('adangal') ? 'இ-அடங்கல் சாறு' : 'அரசு சான்றிதழ்'));
            transaction.set(certRef, {
                id: certRef.id,
                applicationId: null,
                citizenId,
                documentType: 'certificates',
                name: { en: serviceName, ta: serviceNameTA },
                category: 'certificates',
                fileName: `${trackingId}.pdf`,
                storagePath: '',
                mimeType: 'application/pdf',
                size: 256 * 1024,
                uploadedAt: now,
                uploadedBy: 'system',
                status: 'verified',
                source: 'SYSTEM',
                issuedBy: 'Government of Tamil Nadu',
                documentNumber: trackingId
            });
        }
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
        if (assistedByOperatorId) {
            writeNotificationInTransaction(db, transaction, applicationTransitionNotification({
                recipientId: assistedByOperatorId,
                applicationId: storedApplicationId,
                trackingId,
                fromStatus: currentStatus,
                targetStatus,
                finalStatus
            }));
        }
        if (departmentRecipientIds.length > 0) {
            writeDepartmentSubmissionNotificationsInTransaction(db, transaction, {
                recipientIds: departmentRecipientIds,
                applicationId: storedApplicationId,
                trackingId
            });
        }
    });
    const application = await getApplicationForUser(user, applicationId);
    if (!application)
        throw new Error('Application not found.');
    return application;
}
function hasRequiredValue(value) {
    return String(value ?? '').trim() !== '';
}
function assertApplicationRequiredFields(formData, service) {
    if (!formData || typeof formData !== 'object' || Array.isArray(formData)) {
        throw new Error('Complete all required application fields before submitting.');
    }
    const requiredFields = [
        ['fullName', 'Full Name'],
        ['fatherName', "Father's/Guardian Name"],
        ['dateOfBirth', 'Date of Birth'],
        ['gender', 'Gender'],
        ['phone', 'Mobile Number'],
        ['aadhaarNumber', 'Aadhaar Number']
    ];
    if (service.slug === 'e-adangal-extract') {
        requiredFields.push(['district', 'District'], ['taluk', 'Taluk'], ['village', 'Village'], ['surveyNumber', 'Survey Number']);
    }
    else if (service.slug === 'income-certificate') {
        requiredFields.push(['annualIncome', 'Annual Family Income'], ['occupation', 'Occupation']);
    }
    else if (service.slug === 'community-certificate') {
        requiredFields.push(['religion', 'Religion'], ['communityCategory', 'Community Category'], ['subCaste', 'Sub-Caste Name']);
    }
    else if (service.slug === 'nativity-certificate') {
        requiredFields.push(['placeOfBirth', 'Place of Birth'], ['residenceDurationYears', 'Duration of Residence']);
    }
    else {
        requiredFields.push(['doorNo', 'Door No'], ['street', 'Street'], ['area', 'Area/Locality'], ['district', 'District'], ['taluk', 'Taluk'], ['pincode', 'Pincode']);
    }
    const missingField = requiredFields.find(([field]) => !hasRequiredValue(formData[field]));
    if (missingField) {
        throw new Error(`${missingField[1]} is required before submitting this application.`);
    }
    if (!/^\d{10}$/.test(String(formData.phone).trim())) {
        throw new Error('Enter a valid 10-digit mobile number before submitting this application.');
    }
    if (!/^\d{12}$/.test(String(formData.aadhaarNumber).trim())) {
        throw new Error('Enter a valid 12-digit Aadhaar number before submitting this application.');
    }
    if (hasRequiredValue(formData.pincode) && !/^[1-9][0-9]{5}$/.test(String(formData.pincode).trim())) {
        throw new Error('Enter a valid 6-digit pincode before submitting this application.');
    }
    if (hasRequiredValue(formData.annualIncome) && Number(formData.annualIncome) <= 0) {
        throw new Error('Enter a valid annual income before submitting this application.');
    }
    if (hasRequiredValue(formData.residenceDurationYears) && Number(formData.residenceDurationYears) <= 0) {
        throw new Error('Enter a valid duration of residence before submitting this application.');
    }
}
/** Submits a citizen-owned draft by using the workflow's configured transition. */
export async function submitCitizenDraft(user, applicationId) {
    if (user.role !== 'citizen' && user.role !== 'operator')
        throw new Error('Only citizens or operators can submit drafts.');
    const snapshot = await getApplicationSnapshot(applicationId);
    if (!snapshot.exists)
        throw new Error('Application not found.');
    const application = snapshot.data();
    if (!canReadApplication(user, application))
        throw new Error('Application not found.');
    const currentStatus = asApplicationStatus(application.status);
    if (currentStatus !== 'DRAFT' && currentStatus !== 'CLARIFICATION_REQUESTED') {
        if (['SUBMITTED', 'DOCUMENT_VERIFICATION', 'UNDER_REVIEW', 'APPROVED', 'ISSUED', 'COMPLETED'].includes(String(application.status))) {
            const app = await getApplicationForUser(user, applicationId);
            if (!app)
                throw new Error('Application not found.');
            return app;
        }
        throw new Error('Only draft or correction-requested applications can be submitted.');
    }
    const service = await getCatalogService(requiredString(application.serviceId, 'service ID'));
    if (!service)
        throw new Error('Application service is unavailable.');
    if (currentStatus === 'DRAFT' && requiresPaymentForService(service) && applicationPaymentStatus(application) !== 'SUCCESS') {
        throw new Error('Complete the simulated payment before submitting this paid application.');
    }
    assertApplicationRequiredFields(application.formData, service);
    const persistedDocuments = await loadApplicationDocuments(applicationId);
    const uploadedTypes = new Set(persistedDocuments.map((document) => document.documentId));
    const missingRequiredDocument = service.requiredDocuments.find((document) => document.mandatory && !uploadedTypes.has(document.id));
    if (missingRequiredDocument)
        throw new Error('Upload all mandatory documents before submitting this application.');
    const workflow = await getWorkflowDefinition(requiredString(application.workflowId, 'workflow ID'));
    if (!workflow)
        throw new Error('Application workflow is unavailable.');
    const submitTransition = getAvailableWorkflowActions(workflow, currentStatus, user)
        .find((transition) => currentStatus === 'CLARIFICATION_REQUESTED' ? transition.toState === 'DOCUMENT_VERIFICATION' : transition.toState === 'SUBMITTED');
    if (!submitTransition)
        throw new Error('This application cannot be submitted through its workflow.');
    return transitionApplication(user, applicationId, { transitionId: submitTransition.id });
}
export async function requestApplicationPaymentOtp(user, applicationId) {
    const db = getFirebaseAdminFirestore();
    const applicationRef = db.collection('applications').doc(applicationId);
    const snapshot = await applicationRef.get();
    if (!snapshot.exists)
        throw new Error('Application not found.');
    const application = snapshot.data();
    assertPaymentUser(user, application);
    const currentStatus = asApplicationStatus(application.status);
    if (currentStatus !== 'DRAFT') {
        throw new Error('Payment can only be started for draft applications.');
    }
    const service = await getCatalogService(requiredString(application.serviceId, 'service ID'));
    if (!service)
        throw new Error('Application service is unavailable.');
    const amount = Number(service.fee?.amount ?? service.fee ?? 0);
    if (!requiresPaymentForService(service)) {
        throw new Error('This application does not require payment.');
    }
    if (applicationPaymentStatus(application) === 'SUCCESS') {
        return {
            amount,
            status: 'SUCCESS',
            message: 'Payment is already recorded.'
        };
    }
    const phone = String(application.formData?.phone ?? '').replace(/\D/g, '');
    if (!/^\d{10}$/.test(phone)) {
        throw new Error('A verified 10-digit mobile number is required before payment.');
    }
    const challenge = createPaymentOtpChallenge();
    const now = Timestamp.now();
    await applicationRef.update({
        payment: {
            provider: 'razorpay_simulation',
            mode: 'SIMULATION_ONLY',
            status: 'OTP_SENT',
            amount,
            currency: 'INR',
            phoneLast4: phone.slice(-4),
            otpChallenge: {
                salt: challenge.salt,
                otpHash: challenge.otpHash,
                expiresAt: Timestamp.fromDate(new Date(challenge.expiresAtMs)),
                attempts: 0,
                maxAttempts: challenge.maxAttempts
            },
            updatedAt: now
        },
        updatedAt: now
    });
    return {
        amount,
        currency: 'INR',
        status: 'OTP_SENT',
        provider: 'razorpay_simulation',
        demoOtpHint: 'Use OTP 1234 for this simulation only.'
    };
}
export async function confirmSimulatedApplicationPayment(user, applicationId, input) {
    const outcome = assertPaymentOutcome(input?.outcome);
    const db = getFirebaseAdminFirestore();
    const applicationRef = db.collection('applications').doc(applicationId);
    let result;
    let otpError = null;
    await db.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(applicationRef);
        if (!snapshot.exists)
            throw new Error('Application not found.');
        const application = snapshot.data();
        assertPaymentUser(user, application);
        if (asApplicationStatus(application.status) !== 'DRAFT') {
            throw new Error('Payment can only be completed for draft applications.');
        }
        const payment = application.payment && typeof application.payment === 'object' ? application.payment : null;
        if (!payment || payment.status !== 'OTP_SENT') {
            throw new Error('Start payment OTP verification before confirming payment.');
        }
        const storedApplicationId = requiredString(application.id ?? applicationId, 'id');
        const applicantPhone = optionalString(application.formData?.phone);
        const trackingId = optionalString(application.trackingId);
        const challenge = paymentChallengeFromApplication(application);
        const verification = verifyPaymentOtpChallenge(challenge, input?.otp);
        const attempts = Number(challenge?.attempts ?? 0);
        const now = Timestamp.now();
        if (!verification.ok) {
            transaction.update(applicationRef, {
                'payment.otpChallenge.attempts': attempts + 1,
                'payment.updatedAt': now,
                updatedAt: now
            });
            otpError = verification.reason;
            return;
        }
        const referenceId = outcome === 'SUCCESS' ? buildSimulatedPaymentReference(applicationId) : null;
        const amount = Number(payment.amount ?? 0);
        transaction.update(applicationRef, {
            payment: {
                provider: 'razorpay_simulation',
                mode: 'SIMULATION_ONLY',
                status: outcome,
                amount,
                currency: 'INR',
                referenceId,
                completedAt: now,
                updatedAt: now
            },
            updatedAt: now
        });
        const historyRef = applicationRef.collection('statusHistory').doc();
        transaction.set(historyRef, {
            id: historyRef.id,
            status: asApplicationStatus(application.status),
            stage: asApplicationStatus(application.status),
            changedBy: user.uid,
            changedByRole: user.role,
            actorName: user.displayName,
            comment: outcome === 'SUCCESS' ? 'Simulated Razorpay payment successful' : 'Simulated Razorpay payment failed',
            createdAt: now
        });
        writeAuditLogInTransaction(db, transaction, {
            actor: user,
            departmentId: requiredString(application.departmentId, 'department ID'),
            action: outcome === 'SUCCESS' ? 'SIMULATED_PAYMENT_SUCCESS' : 'SIMULATED_PAYMENT_FAILED',
            entityType: 'application',
            entityId: storedApplicationId,
            timestamp: now,
            metadata: { amount, provider: 'razorpay_simulation', mode: 'SIMULATION_ONLY' }
        });
        result = {
            status: outcome,
            amount,
            currency: 'INR',
            provider: 'razorpay_simulation',
            referenceId,
            applicationId: storedApplicationId,
            trackingId,
            applicantPhone
        };
    });
    if (otpError) {
        throw new Error(otpError);
    }
    if (result?.status === 'SUCCESS') {
        await sendApplicationSms({
            phoneNumber: result.applicantPhone,
            applicationId: result.applicationId,
            trackingId: result.trackingId,
            event: 'PAYMENT_SUCCESS'
        });
    }
    return result;
}
export async function reviewApplicationDocument(user, applicationId, documentId, status, comment) {
    const db = getFirebaseAdminFirestore();
    const applicationRef = db.collection('applications').doc(applicationId);
    const documentRef = db.collection('documents').doc(documentId);
    const normalizedComment = comment?.trim();
    if (normalizedComment && normalizedComment.length > 2000)
        throw new Error('Remarks are too long.');
    await db.runTransaction(async (transaction) => {
        const [applicationSnapshot, documentSnapshot] = await Promise.all([
            transaction.get(applicationRef),
            transaction.get(documentRef)
        ]);
        if (!applicationSnapshot.exists || !documentSnapshot.exists)
            throw new Error('Application document not found.');
        const application = applicationSnapshot.data();
        assertDepartmentProcessor(user, application);
        const document = documentSnapshot.data();
        if (document.applicationId !== applicationId)
            throw new Error('Application document not found.');
        if (status === 'rejected' && !normalizedComment)
            throw new Error('Remarks are required when rejecting a document.');
        const now = Timestamp.now();
        const applicationDocuments = Array.isArray(application.documents) ? application.documents : [];
        const updatedDocuments = applicationDocuments.map((entry) => {
            if (!entry || typeof entry !== 'object')
                return entry;
            const current = entry;
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
    if (!application)
        throw new Error('Application not found.');
    return application;
}
export async function markApplicationDocumentViewed(user, applicationId, documentId) {
    const db = getFirebaseAdminFirestore();
    const applicationRef = db.collection('applications').doc(applicationId);
    const normalizedDocumentId = documentId.trim();
    if (!normalizedDocumentId)
        throw new Error('Document ID is required.');
    await db.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(applicationRef);
        if (!snapshot.exists)
            throw new Error('Application not found.');
        const application = snapshot.data();
        if (!canReadApplication(user, application))
            throw new Error('Application not found.');
        if (user.role !== 'department_user' && user.role !== 'admin') {
            throw new Error('You are not authorized to review this document.');
        }
        if (user.role === 'department_user' && user.departmentId && application.departmentId !== user.departmentId) {
            throw new Error('You are not authorized to review this document.');
        }
        const applicationDocuments = Array.isArray(application.documents) ? application.documents : [];
        const hasDocument = applicationDocuments.some((document) => optionalString(document.id) === normalizedDocumentId || optionalString(document.documentId) === normalizedDocumentId);
        if (!hasDocument) {
            throw new Error('Application document not found.');
        }
        const reviewedDocumentIds = normalizeReviewedDocumentIds(application.reviewedDocumentIds);
        if (!reviewedDocumentIds.includes(normalizedDocumentId)) {
            reviewedDocumentIds.push(normalizedDocumentId);
        }
        transaction.update(applicationRef, {
            reviewedDocumentIds,
            updatedAt: Timestamp.now()
        });
    });
    const application = await getApplicationForUser(user, applicationId);
    if (!application)
        throw new Error('Application not found.');
    return application;
}
export async function updateApplicationDraft(user, applicationId, formData) {
    const db = getFirebaseAdminFirestore();
    const applicationRef = db.collection('applications').doc(applicationId);
    const initial = await applicationRef.get();
    if (!initial.exists)
        throw new Error('Application not found.');
    const initialData = initial.data();
    const isOwner = initialData.citizenId === user.uid;
    const isAssistingOperator = initialData.assistedByOperatorId === user.uid;
    if (!isOwner && !isAssistingOperator && user.role !== 'admin') {
        throw new Error('Unauthorized to update this application.');
    }
    const currentStatus = asApplicationStatus(initialData.status);
    if (currentStatus !== 'DRAFT' && currentStatus !== 'CLARIFICATION_REQUESTED') {
        throw new Error('Only drafts and correction-requested applications can be updated.');
    }
    const now = Timestamp.now();
    await applicationRef.update({
        formData,
        updatedAt: now
    });
    const updated = await getApplicationForUser(user, applicationId);
    if (!updated)
        throw new Error('Application not found.');
    return updated;
}
export async function findLatestDraftForCitizenByService(user, serviceId) {
    if (user.role !== 'citizen')
        return null;
    const snapshot = await getFirebaseAdminFirestore()
        .collection('applications')
        .where('citizenId', '==', user.uid)
        .where('serviceId', '==', serviceId)
        .where('status', '==', 'DRAFT')
        .limit(10)
        .get();
    const latest = snapshot.docs
        .map((document) => toApplication(document))
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0];
    if (!latest)
        return null;
    if (latest.serviceSlug)
        return latest;
    const service = await getCatalogService(latest.serviceId);
    return service ? { ...latest, serviceSlug: service.slug } : latest;
}
export async function deleteApplicationDraft(user, applicationId) {
    const db = getFirebaseAdminFirestore();
    const applicationRef = db.collection('applications').doc(applicationId);
    const snapshot = await applicationRef.get();
    if (!snapshot.exists)
        throw new Error('Application not found.');
    const application = snapshot.data();
    const isOwner = optionalString(application.citizenId) === user.uid;
    const isAssistingOperator = optionalString(application.assistedByOperatorId) === user.uid;
    if (user.role !== 'admin' && !isOwner && !isAssistingOperator) {
        throw new Error('Unauthorized to delete this draft.');
    }
    if (asApplicationStatus(application.status) !== 'DRAFT') {
        throw new Error('Only drafts can be deleted.');
    }
    const now = Timestamp.now();
    const documents = await db.collection('documents').where('applicationId', '==', applicationId).get();
    await db.runTransaction(async (transaction) => {
        const history = await transaction.get(applicationRef.collection('statusHistory'));
        documents.docs.forEach((document) => transaction.delete(document.ref));
        history.docs.forEach((entry) => transaction.delete(entry.ref));
        transaction.delete(applicationRef);
        writeAuditLogInTransaction(db, transaction, {
            actor: user,
            departmentId: optionalString(application.departmentId) ?? null,
            action: 'APPLICATION_DRAFT_DELETED',
            entityType: 'application',
            entityId: requiredString(application.id ?? applicationId, 'id'),
            timestamp: now,
            metadata: { serviceId: optionalString(application.serviceId) ?? null }
        });
    });
}

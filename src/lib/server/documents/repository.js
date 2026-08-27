import { Timestamp } from 'firebase-admin/firestore';
import { getCatalogService } from '$lib/server/catalog/repository';
import { getApplicationForUser } from '$lib/server/applications/repository';
import { getFirebaseAdminFirestore, getFirebaseAdminStorage } from '$lib/server/firebase/admin';
import { writeAuditLogInTransaction } from '$lib/server/audit/repository';
const MAX_DOCUMENT_BYTES = 1 * 1024 * 1024;
const acceptedMimeTypes = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const documentCategories = new Set(['identity', 'address', 'education', 'income', 'certificates', 'other']);
function toIso(value) {
    if (value instanceof Timestamp)
        return value.toDate().toISOString();
    if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
        return value.toDate().toISOString();
    }
    return new Date(0).toISOString();
}
function stringValue(value, fallback = '') {
    return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}
function localized(value, fallback) {
    if (value && typeof value === 'object') {
        const text = value;
        if (typeof text.en === 'string' && typeof text.ta === 'string')
            return { en: text.en, ta: text.ta };
    }
    const string = stringValue(value, fallback);
    return { en: string, ta: string };
}
function toCategory(value) {
    return typeof value === 'string' && documentCategories.has(value)
        ? value
        : 'other';
}
function toVerificationStatus(value) {
    switch (String(value).toLowerCase()) {
        case 'verified': return 'verified';
        case 'rejected': return 'rejected';
        case 'expired': return 'expired';
        default: return 'unverified';
    }
}
function toDocument(id, data) {
    const name = localized(data.name, 'Document');
    return {
        id,
        citizenId: stringValue(data.citizenId),
        name: name.en,
        nameTA: name.ta,
        category: toCategory(data.category),
        fileName: stringValue(data.fileName, 'document'),
        fileSize: typeof data.size === 'number' ? data.size : 0,
        fileType: stringValue(data.mimeType, 'application/octet-stream'),
        uploadedAt: toIso(data.uploadedAt),
        verificationStatus: toVerificationStatus(data.status),
        expiryDate: data.expiryDate ? toIso(data.expiryDate) : undefined,
        issuedBy: stringValue(data.issuedBy) || undefined,
        documentNumber: stringValue(data.documentNumber) || undefined,
        source: String(data.source).toLowerCase().includes('digilocker') ? 'digilocker' : 'upload'
    };
}
function assertUpload(file) {
    if (file.size <= 0)
        throw new Error('Select a document to upload.');
    if (file.size > MAX_DOCUMENT_BYTES)
        throw new Error('Documents must be 1 MB or smaller.');
    if (!acceptedMimeTypes.has(file.type))
        throw new Error('Only PDF, JPEG, and PNG documents are accepted.');
}
async function savePrivateFile(storagePath, file) {
    const bucket = getFirebaseAdminStorage().bucket();
    await bucket.file(storagePath).save(Buffer.from(await file.arrayBuffer()), {
        resumable: false,
        metadata: { contentType: file.type }
    });
}
async function removePrivateFile(storagePath) {
    await getFirebaseAdminStorage().bucket().file(storagePath).delete({ ignoreNotFound: true }).catch(() => undefined);
}
/** Lists a citizen's own vault documents. Department document access stays application-scoped. */
export async function listCitizenDocuments(user) {
    if (user.role !== 'citizen')
        return [];
    const snapshot = await getFirebaseAdminFirestore().collection('documents').where('citizenId', '==', user.uid).limit(100).get();
    return snapshot.docs
        .filter((document) => document.get('applicationId') == null)
        .map((document) => toDocument(document.id, document.data()))
        .sort((left, right) => right.uploadedAt.localeCompare(left.uploadedAt));
}
/** Persists a private citizen-vault document with metadata only in Firestore. */
export async function uploadCitizenDocument(user, input) {
    if (user.role !== 'citizen')
        throw new Error('Only citizens can upload personal documents.');
    assertUpload(input.file);
    const db = getFirebaseAdminFirestore();
    const documentRef = db.collection('documents').doc();
    const storagePath = `citizens/${user.uid}/documents/${documentRef.id}/original`;
    await savePrivateFile(storagePath, input.file);
    try {
        const now = Timestamp.now();
        const name = input.documentType.trim().slice(0, 120) || 'Uploaded document';
        await db.runTransaction(async (transaction) => {
            transaction.create(documentRef, {
                id: documentRef.id,
                applicationId: null,
                citizenId: user.uid,
                documentType: name,
                name: { en: name, ta: name },
                category: 'other',
                fileName: input.file.name.slice(0, 180),
                storagePath,
                mimeType: input.file.type,
                size: input.file.size,
                uploadedAt: now,
                uploadedBy: user.uid,
                status: 'unverified',
                source: 'UPLOAD'
            });
            writeAuditLogInTransaction(db, transaction, {
                actor: user,
                action: 'DOCUMENT_UPLOADED',
                entityType: 'document',
                entityId: documentRef.id,
                timestamp: now,
                metadata: { applicationId: null, documentType: name }
            });
        });
        return toDocument(documentRef.id, (await documentRef.get()).data());
    }
    catch (cause) {
        await removePrivateFile(storagePath);
        throw cause;
    }
}
/**
 * Uploads a citizen-owned application document. The storage object is private;
 * Firestore receives only its metadata and storage path.
 */
export async function uploadApplicationDocument(user, applicationId, input) {
    assertUpload(input.file);
    const application = await getApplicationForUser(user, applicationId, false);
    if (!application)
        throw new Error('Application not found.');
    const canUpload = user.role === 'citizen'
        ? application.citizenId === user.uid
        : user.role === 'operator' || user.role === 'admin';
    if (!canUpload)
        throw new Error('Application not found.');
    if (['COMPLETED', 'REJECTED', 'CANCELLED'].includes(application.status)) {
        throw new Error('Documents cannot be uploaded after this application is closed.');
    }
    const service = await getCatalogService(application.serviceId);
    const requiredDocument = service?.requiredDocuments.find((document) => document.id === input.documentType);
    if (!requiredDocument)
        throw new Error('This document is not required for the selected service.');
    const db = getFirebaseAdminFirestore();
    const applicationRef = db.collection('applications').doc(applicationId);
    const documentRef = db.collection('documents').doc();
    const storagePath = `applications/${applicationId}/documents/${documentRef.id}/original`;
    await savePrivateFile(storagePath, input.file);
    try {
        const now = Timestamp.now();
        await db.runTransaction(async (transaction) => {
            const applicationSnapshot = await transaction.get(applicationRef);
            const citizenId = stringValue(applicationSnapshot.get('citizenId'));
            const assistedByOperatorId = stringValue(applicationSnapshot.get('assistedByOperatorId'));
            const allowed = applicationSnapshot.exists && ((user.role === 'citizen' && citizenId === user.uid) ||
                (user.role === 'operator' && (citizenId === user.uid || assistedByOperatorId === user.uid)) ||
                user.role === 'admin');
            if (!allowed) {
                throw new Error('Application not found.');
            }
            const applicationDocuments = Array.isArray(applicationSnapshot.get('documents'))
                ? applicationSnapshot.get('documents')
                : [];
            const metadata = {
                id: documentRef.id,
                documentId: documentRef.id,
                documentType: requiredDocument.id,
                name: requiredDocument.name,
                fileName: input.file.name.slice(0, 180),
                fileSize: input.file.size,
                fileType: input.file.type,
                uploadedAt: now,
                status: 'pending',
                source: 'upload'
            };
            transaction.create(documentRef, {
                ...metadata,
                applicationId,
                citizenId,
                storagePath,
                mimeType: input.file.type,
                size: input.file.size,
                uploadedBy: user.uid,
                category: 'other',
                status: 'pending',
                source: 'UPLOAD'
            });
            transaction.update(applicationRef, {
                documents: [...applicationDocuments, metadata],
                updatedAt: now
            });
            writeAuditLogInTransaction(db, transaction, {
                actor: user,
                departmentId: typeof applicationSnapshot.get('departmentId') === 'string'
                    ? applicationSnapshot.get('departmentId')
                    : null,
                action: 'DOCUMENT_UPLOADED',
                entityType: 'document',
                entityId: documentRef.id,
                timestamp: now,
                metadata: { applicationId, documentType: requiredDocument.id }
            });
        });
        return toDocument(documentRef.id, (await documentRef.get()).data());
    }
    catch (cause) {
        await removePrivateFile(storagePath);
        throw cause;
    }
}
/** Creates a short-lived URL only after server-side application or citizen ownership checks. */
export async function getAuthorizedDocumentDownloadUrl(user, documentId) {
    const snapshot = await getFirebaseAdminFirestore().collection('documents').doc(documentId).get();
    if (!snapshot.exists)
        throw new Error('Document not found.');
    const document = snapshot.data();
    const applicationId = stringValue(document.applicationId);
    if (applicationId) {
        const application = await getApplicationForUser(user, applicationId, false);
        if (!application)
            throw new Error('Document not found.');
    }
    else if (user.role !== 'admin' && (user.role !== 'citizen' || document.citizenId !== user.uid)) {
        throw new Error('Document not found.');
    }
    const storagePath = stringValue(document.storagePath);
    if (!storagePath)
        throw new Error('This demo document has no stored file.');
    const [url] = await getFirebaseAdminStorage().bucket().file(storagePath).getSignedUrl({
        action: 'read',
        expires: Date.now() + 5 * 60 * 1000
    });
    return url;
}

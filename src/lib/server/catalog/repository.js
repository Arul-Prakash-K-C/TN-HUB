import { Timestamp } from 'firebase-admin/firestore';
import { dev } from '$app/environment';
import { services as fallbackServices } from '$lib/data/services';
import { departments as fallbackDepartments } from '$lib/data/departments';
import { getFirebaseAdminFirestore } from '$lib/server/firebase/admin';
function localized(en, ta) {
    return { en, ta };
}
function canUseFixtureFallback() {
    return dev || process.env.TN_KUVIYAM_ALLOW_FIXTURE_FALLBACK === 'true';
}
export function toCatalogDepartment(department) {
    return {
        id: department.id,
        name: localized(department.name, department.nameTA),
        code: department.id.replace(/^dept-/, '').replace(/-/g, '_').toUpperCase(),
        shortName: department.shortName,
        description: localized(department.description, department.descriptionTA),
        icon: department.icon,
        serviceCount: department.serviceCount,
        ...(department.headOfficer ? { headOfficer: department.headOfficer } : {}),
        ...(department.contactEmail ? { contactEmail: department.contactEmail } : {}),
        ...(department.contactPhone ? { contactPhone: department.contactPhone } : {}),
        ...(department.website ? { website: department.website } : {}),
        isActive: department.isActive
    };
}
export function toCatalogService(service) {
    const external = service.externalUrl || service.externalDepartmentName
        ? {
            ...(service.externalUrl ? { url: service.externalUrl } : {}),
            ...(service.externalDepartmentName ? { departmentName: service.externalDepartmentName } : {})
        }
        : undefined;
    return {
        id: service.id,
        slug: service.slug,
        name: localized(service.name, service.nameTA),
        shortDescription: localized(service.shortDescription, service.shortDescriptionTA),
        description: localized(service.description, service.descriptionTA),
        category: service.category,
        departmentId: service.departmentId,
        implementationMode: service.implementationMode,
        workflowId: service.workflowId ?? null,
        eligibility: {
            statements: service.eligibility.map((entry, index) => localized(entry, service.eligibilityTA[index] ?? entry)),
            whoCanApply: localized(service.whoCanApply, service.whoCanApplyTA)
        },
        requiredDocuments: service.requiredDocuments.map((document) => ({
            id: document.id,
            name: localized(document.name, document.nameTA),
            description: localized(document.description, document.descriptionTA),
            mandatory: document.mandatory,
            acceptedFormats: document.acceptedFormats,
            maxSizeMB: document.maxSizeMB,
            digilockerAvailable: document.digilockerAvailable
        })),
        fee: {
            amount: service.fee,
            description: localized(service.feeDescription, service.feeDescriptionTA)
        },
        processingTime: {
            days: service.processingTimeDays,
            description: localized(service.processingTimeDescription, service.processingTimeDescriptionTA)
        },
        applicationSteps: service.applicationSteps.map((step) => ({
            step: step.step,
            title: localized(step.title, step.titleTA),
            description: localized(step.description, step.descriptionTA)
        })),
        faqs: service.faqs.map((faq) => ({
            question: localized(faq.question, faq.questionTA),
            answer: localized(faq.answer, faq.answerTA)
        })),
        ...(external ? { external } : {}),
        relatedServiceIds: service.relatedServiceIds,
        isActive: service.isActive,
        isOnline: service.isOnline,
        version: service.version
    };
}
/** Reads a Firestore-backed service by stable ID for trusted server actions. */
export async function getCatalogService(serviceId) {
    try {
        const snapshot = await getFirebaseAdminFirestore().collection('services').doc(serviceId).get();
        if (snapshot.exists) {
            const service = snapshot.data();
            if (!service.id || !service.departmentId || !service.slug || !service.name?.en) {
                throw new Error(`Service ${serviceId} has an invalid catalog record.`);
            }
            return service;
        }
    }
    catch (cause) {
        if (!canUseFixtureFallback()) {
            throw cause;
        }
        warnAboutFallback('service lookup', cause);
    }
    if (!canUseFixtureFallback())
        return null;
    const fallback = fallbackServices.find((service) => service.id === serviceId && service.isActive);
    return fallback ? toCatalogService(fallback) : null;
}
/** Reads a Firestore-backed department by its stable ID for trusted server actions. */
export async function getCatalogDepartment(departmentId) {
    try {
        const snapshot = await getFirebaseAdminFirestore().collection('departments').doc(departmentId).get();
        if (snapshot.exists) {
            const department = snapshot.data();
            if (!department.id || department.id !== departmentId || !department.name?.en || !department.name?.ta) {
                throw new Error(`Department ${departmentId} has an invalid catalog record.`);
            }
            return department;
        }
    }
    catch (cause) {
        if (!canUseFixtureFallback()) {
            throw cause;
        }
        warnAboutFallback('department lookup', cause);
    }
    if (!canUseFixtureFallback())
        return null;
    const fallback = fallbackDepartments.find((department) => department.id === departmentId && department.isActive);
    return fallback ? toCatalogDepartment(fallback) : null;
}
function timestampToIso(value) {
    if (value instanceof Timestamp)
        return value.toDate().toISOString();
    if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
        return value.toDate().toISOString();
    }
    return new Date().toISOString();
}
function toUiDepartment(department) {
    return {
        id: department.id,
        name: department.name.en,
        nameTA: department.name.ta,
        shortName: department.shortName,
        description: department.description.en,
        descriptionTA: department.description.ta,
        icon: department.icon,
        serviceCount: department.serviceCount,
        headOfficer: department.headOfficer,
        contactEmail: department.contactEmail,
        contactPhone: department.contactPhone,
        website: department.website,
        isActive: department.isActive
    };
}
function toUiService(service) {
    return {
        id: service.id,
        slug: service.slug,
        name: service.name.en,
        nameTA: service.name.ta,
        shortDescription: service.shortDescription.en,
        shortDescriptionTA: service.shortDescription.ta,
        description: service.description.en,
        descriptionTA: service.description.ta,
        departmentId: service.departmentId,
        category: service.category,
        implementationMode: service.implementationMode,
        eligibility: service.eligibility.statements.map((entry) => entry.en),
        eligibilityTA: service.eligibility.statements.map((entry) => entry.ta),
        whoCanApply: service.eligibility.whoCanApply.en,
        whoCanApplyTA: service.eligibility.whoCanApply.ta,
        requiredDocuments: service.requiredDocuments.map((document) => ({
            id: document.id,
            name: document.name.en,
            nameTA: document.name.ta,
            description: document.description.en,
            descriptionTA: document.description.ta,
            mandatory: document.mandatory,
            acceptedFormats: document.acceptedFormats,
            maxSizeMB: document.maxSizeMB,
            digilockerAvailable: document.digilockerAvailable
        })),
        fee: service.fee.amount,
        feeDescription: service.fee.description.en,
        feeDescriptionTA: service.fee.description.ta,
        processingTimeDays: service.processingTime.days,
        processingTimeDescription: service.processingTime.description.en,
        processingTimeDescriptionTA: service.processingTime.description.ta,
        applicationSteps: service.applicationSteps.map((step) => ({
            step: step.step,
            title: step.title.en,
            titleTA: step.title.ta,
            description: step.description.en,
            descriptionTA: step.description.ta
        })),
        faqs: service.faqs.map((faq) => ({
            question: faq.question.en,
            questionTA: faq.question.ta,
            answer: faq.answer.en,
            answerTA: faq.answer.ta
        })),
        workflowId: service.workflowId ?? undefined,
        externalUrl: service.external?.url,
        externalDepartmentName: service.external?.departmentName,
        relatedServiceIds: service.relatedServiceIds,
        isActive: service.isActive,
        isOnline: service.isOnline,
        version: service.version,
        createdAt: timestampToIso(service.createdAt),
        updatedAt: timestampToIso(service.updatedAt)
    };
}
const PUBLIC_CATALOG_TTL_MS = 5 * 60 * 1000;
const PUBLIC_CATALOG_FALLBACK_TTL_MS = 30 * 1000;
const DEFAULT_FIRESTORE_PUBLIC_TIMEOUT_MS = 2500;
let publicCatalogCache = null;
const fallbackWarnings = new Set();

function getPublicCatalogTimeoutMs() {
    const timeout = Number(process.env.FIRESTORE_PUBLIC_TIMEOUT_MS);
    return Number.isFinite(timeout) && timeout > 0 ? timeout : DEFAULT_FIRESTORE_PUBLIC_TIMEOUT_MS;
}

function isPublicCatalogCacheFresh(now) {
    if (!publicCatalogCache)
        return false;
    const ttl = publicCatalogCache.source === 'fallback'
        ? PUBLIC_CATALOG_FALLBACK_TTL_MS
        : PUBLIC_CATALOG_TTL_MS;
    return (now - publicCatalogCache.timestamp) < ttl;
}

function cachePublicCatalog(data, source) {
    publicCatalogCache = { data, source, timestamp: Date.now() };
    return data;
}

function getFallbackCatalog() {
    if (!canUseFixtureFallback()) {
        throw new Error('Bundled catalog fixture fallback is disabled in production.');
    }
    return {
        services: fallbackServices.filter((service) => service.isActive),
        departments: fallbackDepartments.filter((department) => department.isActive)
    };
}

function warnAboutFallback(context, error) {
    if (fallbackWarnings.has(context))
        return;
    fallbackWarnings.add(context);
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[catalog] Firestore public ${context} unavailable; using bundled catalog fallback. ${message}`);
}

function withPublicFirestoreTimeout(promise, context) {
    const timeoutMs = getPublicCatalogTimeoutMs();
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error(`Timed out after ${timeoutMs}ms while loading ${context}.`));
        }, timeoutMs);
        promise.then(
            (value) => {
                clearTimeout(timeout);
                resolve(value);
            },
            (error) => {
                clearTimeout(timeout);
                reject(error);
            }
        );
    });
}

async function readPublicCatalogFromFirestore() {
    const db = getFirebaseAdminFirestore();
    const [serviceSnapshots, departmentSnapshots] = await Promise.all([
        db.collection('services').get(),
        db.collection('departments').get()
    ]);
    return {
        services: serviceSnapshots.docs
            .map((snapshot) => toUiService(snapshot.data()))
            .filter((service) => service.isActive),
        departments: departmentSnapshots.docs
            .map((snapshot) => toUiDepartment(snapshot.data()))
            .filter((department) => department.isActive)
    };
}
/** Public DTOs intentionally contain no Firestore Timestamp instances. */
export async function loadPublicCatalog() {
    const now = Date.now();
    if (isPublicCatalogCacheFresh(now)) {
        return publicCatalogCache.data;
    }
    try {
        const data = await withPublicFirestoreTimeout(readPublicCatalogFromFirestore(), 'catalog');
        return cachePublicCatalog(data, 'firestore');
    }
    catch (error) {
        if (!canUseFixtureFallback()) {
            throw error;
        }
        warnAboutFallback('catalog', error);
        return cachePublicCatalog(getFallbackCatalog(), 'fallback');
    }
}
/** Administrative catalog view includes inactive records for platform management. */
export async function loadAdminCatalog() {
    const db = getFirebaseAdminFirestore();
    const [serviceSnapshots, departmentSnapshots] = await Promise.all([
        db.collection('services').get(),
        db.collection('departments').get()
    ]);
    return {
        services: serviceSnapshots.docs
            .map((snapshot) => toUiService(snapshot.data())),
        departments: departmentSnapshots.docs.map((snapshot) => toUiDepartment(snapshot.data()))
    };
}
export async function loadPublicServiceBySlug(slug) {
    try {
        const snapshot = await withPublicFirestoreTimeout(getFirebaseAdminFirestore()
            .collection('services')
            .where('slug', '==', slug)
            .limit(1)
            .get(), `service slug "${slug}"`);
        if (snapshot.empty)
            return null;
        const service = toUiService(snapshot.docs[0].data());
        return service.isActive ? service : null;
    }
    catch (error) {
        if (!canUseFixtureFallback()) {
            throw error;
        }
        warnAboutFallback('service detail', error);
        return fallbackServices.find((service) => service.slug === slug && service.isActive) ?? null;
    }
}
export async function loadPublicServiceById(id) {
    try {
        const snapshot = await withPublicFirestoreTimeout(getFirebaseAdminFirestore()
            .collection('services')
            .doc(id)
            .get(), `service id "${id}"`);
        if (!snapshot.exists)
            return null;
        const service = toUiService(snapshot.data());
        return service.isActive ? service : null;
    }
    catch (error) {
        if (!canUseFixtureFallback()) {
            throw error;
        }
        warnAboutFallback('service detail', error);
        return fallbackServices.find((service) => service.id === id && service.isActive) ?? null;
    }
}

import { Timestamp } from 'firebase-admin/firestore';
import type { Department, Service } from '$lib/types';
import { getFirebaseAdminFirestore } from '$lib/server/firebase/admin';

export interface LocalizedText {
  en: string;
  ta: string;
}

export interface CatalogDepartment {
  id: string;
  name: LocalizedText;
  code: string;
  shortName: string;
  description: LocalizedText;
  icon: string;
  serviceCount: number;
  headOfficer?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CatalogService {
  id: string;
  slug: string;
  name: LocalizedText;
  shortDescription: LocalizedText;
  description: LocalizedText;
  category: Service['category'];
  departmentId: string;
  implementationMode: Service['implementationMode'];
  workflowId: string | null;
  eligibility: {
    statements: LocalizedText[];
    whoCanApply: LocalizedText;
  };
  requiredDocuments: Array<{
    id: string;
    name: LocalizedText;
    description: LocalizedText;
    mandatory: boolean;
    acceptedFormats: string[];
    maxSizeMB: number;
    digilockerAvailable: boolean;
  }>;
  fee: {
    amount: number;
    description: LocalizedText;
  };
  processingTime: {
    days: number;
    description: LocalizedText;
  };
  applicationSteps: Array<{
    step: number;
    title: LocalizedText;
    description: LocalizedText;
  }>;
  faqs: Array<{
    question: LocalizedText;
    answer: LocalizedText;
  }>;
  external?: {
    url?: string;
    departmentName?: string;
  };
  relatedServiceIds: string[];
  isActive: boolean;
  isOnline: boolean;
  version: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

function localized(en: string, ta: string): LocalizedText {
  return { en, ta };
}

export function toCatalogDepartment(department: Department): Omit<CatalogDepartment, 'createdAt' | 'updatedAt'> {
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

export function toCatalogService(service: Service): Omit<CatalogService, 'createdAt' | 'updatedAt'> {
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
export async function getCatalogService(serviceId: string): Promise<CatalogService | null> {
  const snapshot = await getFirebaseAdminFirestore().collection('services').doc(serviceId).get();
  if (!snapshot.exists) return null;

  const service = snapshot.data() as CatalogService;
  if (!service.id || !service.departmentId || !service.slug || !service.name?.en) {
    throw new Error(`Service ${serviceId} has an invalid catalog record.`);
  }

  return service;
}

/** Reads a Firestore-backed department by its stable ID for trusted server actions. */
export async function getCatalogDepartment(departmentId: string): Promise<CatalogDepartment | null> {
  const snapshot = await getFirebaseAdminFirestore().collection('departments').doc(departmentId).get();
  if (!snapshot.exists) return null;

  const department = snapshot.data() as CatalogDepartment;
  if (!department.id || department.id !== departmentId || !department.name?.en || !department.name?.ta) {
    throw new Error(`Department ${departmentId} has an invalid catalog record.`);
  }

  return department;
}

function timestampToIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  return new Date().toISOString();
}

function toUiDepartment(department: CatalogDepartment): Department {
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

function toUiService(service: CatalogService): Service {
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

/** Public DTOs intentionally contain no Firestore Timestamp instances. */
export async function loadPublicCatalog(): Promise<{ services: Service[]; departments: Department[] }> {
  const db = getFirebaseAdminFirestore();
  const [serviceSnapshots, departmentSnapshots] = await Promise.all([
    db.collection('services').get(),
    db.collection('departments').get()
  ]);

  return {
    services: serviceSnapshots.docs
      .map((snapshot) => toUiService(snapshot.data() as CatalogService))
      .filter((service) => service.isActive),
    departments: departmentSnapshots.docs
      .map((snapshot) => toUiDepartment(snapshot.data() as CatalogDepartment))
      .filter((department) => department.isActive)
  };
}

/** Administrative catalog view includes inactive records for platform management. */
export async function loadAdminCatalog(): Promise<{ services: Service[]; departments: Department[] }> {
  const db = getFirebaseAdminFirestore();
  const [serviceSnapshots, departmentSnapshots] = await Promise.all([
    db.collection('services').get(),
    db.collection('departments').get()
  ]);

  return {
    services: serviceSnapshots.docs
      .map((snapshot) => toUiService(snapshot.data() as CatalogService))
      .filter((service) => service.implementationMode === 'NATIVE_WORKFLOW'),
    departments: departmentSnapshots.docs.map((snapshot) => toUiDepartment(snapshot.data() as CatalogDepartment))
  };
}

export async function loadPublicServiceBySlug(slug: string): Promise<Service | null> {
  const snapshot = await getFirebaseAdminFirestore()
    .collection('services')
    .where('slug', '==', slug)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  const service = toUiService(snapshot.docs[0].data() as CatalogService);
  return service.isActive ? service : null;
}

export async function loadPublicServiceById(id: string): Promise<Service | null> {
  const snapshot = await getFirebaseAdminFirestore().collection('services').doc(id).get();
  if (!snapshot.exists) return null;

  const service = toUiService(snapshot.data() as CatalogService);
  return service.isActive ? service : null;
}

// ============================================
// SERVICE TYPES
// ============================================

export type ImplementationMode = 'NATIVE_WORKFLOW' | 'API_INTEGRATED' | 'EXTERNAL_REDIRECT';

export type ServiceCategory =
  | 'revenue'
  | 'civil_supplies'
  | 'transport'
  | 'health'
  | 'education'
  | 'social_welfare'
  | 'labour'
  | 'agriculture'
  | 'local_government'
  | 'drugs_control'
  | 'certificates'
  | 'licences'
  | 'welfare_schemes'
  | 'utility_services'
  | 'complaints';

export interface ServiceDocument {
  id: string;
  name: string;
  nameTA: string;
  description: string;
  descriptionTA: string;
  mandatory: boolean;
  acceptedFormats: string[];
  maxSizeMB: number;
  digilockerAvailable: boolean;
}

export interface ServiceFAQ {
  question: string;
  questionTA: string;
  answer: string;
  answerTA: string;
}

export interface ServiceStep {
  step: number;
  title: string;
  titleTA: string;
  description: string;
  descriptionTA: string;
}

export interface Service {
  id: string;
  slug: string;
  name: string;
  nameTA: string;
  shortDescription: string;
  shortDescriptionTA: string;
  description: string;
  descriptionTA: string;
  departmentId: string;
  category: ServiceCategory;
  implementationMode: ImplementationMode;
  
  // Eligibility
  eligibility: string[];
  eligibilityTA: string[];
  whoCanApply: string;
  whoCanApplyTA: string;
  
  // Documents
  requiredDocuments: ServiceDocument[];
  
  // Fee & Time
  fee: number;
  feeDescription: string;
  feeDescriptionTA: string;
  processingTimeDays: number;
  processingTimeDescription: string;
  processingTimeDescriptionTA: string;
  
  // Steps
  applicationSteps: ServiceStep[];
  
  // FAQ
  faqs: ServiceFAQ[];
  
  // Workflow
  workflowId?: string;
  
  // External
  externalUrl?: string;
  externalDepartmentName?: string;
  
  // Related
  relatedServiceIds: string[];
  
  // Metadata
  isActive: boolean;
  isOnline: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCategoryInfo {
  id: ServiceCategory;
  name: string;
  nameTA: string;
  icon: string;
  description: string;
  descriptionTA: string;
  serviceCount: number;
}

// ============================================
// APPLICATION TYPES
// ============================================

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'DOCUMENT_VERIFICATION'
  | 'OFFICER_REVIEW'
  | 'FIELD_VERIFICATION'
  | 'FAMILY_VERIFICATION'
  | 'CLARIFICATION_REQUESTED'
  | 'APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'CERTIFICATE_GENERATED'
  | 'CARD_GENERATED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface ApplicationDocument {
  id: string;
  documentId: string;
  name: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  status: 'pending' | 'verified' | 'rejected' | 'reupload_required';
  rejectionReason?: string;
  source: 'upload' | 'digilocker';
}

export interface ApplicationHistoryEntry {
  id: string;
  status: ApplicationStatus;
  timestamp: string;
  description: string;
  descriptionTA: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  remarks?: string;
}

export interface ApplicationFormData {
  // Personal Details
  fullName?: string;
  fatherName?: string;
  motherName?: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  aadhaarNumber?: string;
  
  // Address
  doorNo?: string;
  street?: string;
  area?: string;
  city?: string;
  district?: string;
  taluk?: string;
  village?: string;
  pincode?: string;
  
  // Service-specific
  [key: string]: string | number | boolean | undefined;
}

export interface Application {
  id: string;
  applicationNumber: string; // SYM-2026-XXXXXX
  serviceId: string;
  serviceName: string;
  serviceNameTA: string;
  departmentId: string;
  departmentName: string;
  departmentNameTA: string;
  citizenId: string;
  citizenName: string;
  workflowId: string;
  
  status: ApplicationStatus;
  formData: ApplicationFormData;
  documents: ApplicationDocument[];
  history: ApplicationHistoryEntry[];
  
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  
  rejectionReason?: string;
  resultUrl?: string;
  certificateUrl?: string;
  
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  completedAt?: string;
  expectedCompletionDate?: string;
  
  slaDeadline?: string;
  isSlaBreached: boolean;
}

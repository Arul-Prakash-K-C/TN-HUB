// ============================================
// COMPLAINT / GRIEVANCE TYPES
// ============================================

export type ComplaintCategory =
  | 'service_delay'
  | 'document_issue'
  | 'officer_misconduct'
  | 'technical_issue'
  | 'incorrect_information'
  | 'payment_issue'
  | 'accessibility_issue'
  | 'other';

export type ComplaintStatus =
  | 'SUBMITTED'
  | 'CLASSIFIED'
  | 'ASSIGNED'
  | 'INVESTIGATION'
  | 'ACTION_TAKEN'
  | 'RESOLUTION'
  | 'CLOSED'
  | 'REOPENED';

export interface ComplaintHistoryEntry {
  id: string;
  status: ComplaintStatus;
  timestamp: string;
  description: string;
  descriptionTA: string;
  actorId: string;
  actorName: string;
  remarks?: string;
}

export interface Complaint {
  id: string;
  complaintNumber: string; // GRV-2026-XXXXXX
  citizenId: string;
  citizenName: string;
  category: ComplaintCategory;
  subject: string;
  description: string;
  relatedServiceId?: string;
  relatedApplicationId?: string;
  relatedDepartmentId?: string;
  location?: string;
  attachments: string[];
  status: ComplaintStatus;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  history: ComplaintHistoryEntry[];
  resolution?: string;
  citizenFeedback?: number; // 1-5
  citizenFeedbackText?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

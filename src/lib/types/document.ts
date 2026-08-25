// ============================================
// DOCUMENT TYPES
// ============================================

export type DocumentCategory = 
  | 'identity'
  | 'address'
  | 'education'
  | 'income'
  | 'certificates'
  | 'other';

export type DocumentVerificationStatus = 
  | 'unverified'
  | 'verified'
  | 'expired'
  | 'rejected';

export interface Document {
  id: string;
  citizenId: string;
  name: string;
  nameTA: string;
  category: DocumentCategory;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  verificationStatus: DocumentVerificationStatus;
  expiryDate?: string;
  issuedBy?: string;
  documentNumber?: string;
  source: 'upload' | 'digilocker';
  metadata?: Record<string, string>;
}

export interface DigiLockerDocument {
  id: string;
  type: string;
  name: string;
  nameTA: string;
  issuer: string;
  issuerTA: string;
  issuedDate: string;
  documentNumber: string;
  category: DocumentCategory;
  available: boolean;
}

export interface DigiLockerConsent {
  id: string;
  citizenId: string;
  purpose: string;
  documentTypes: string[];
  grantedAt: string;
  status: 'active' | 'revoked';
  revokedAt?: string;
}

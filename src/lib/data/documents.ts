import type { Document, DigiLockerDocument } from '$lib/types';

export const mockDocuments: Document[] = [
  {
    id: 'mydoc-001', citizenId: 'citizen-001', name: 'Aadhaar Card', nameTA: 'ஆதார் அட்டை',
    category: 'identity', fileName: 'aadhaar_meena.pdf', fileSize: 245000, fileType: 'application/pdf',
    uploadedAt: '2026-03-10T10:00:00Z', verificationStatus: 'verified', documentNumber: 'XXXX XXXX 4329',
    issuedBy: 'UIDAI', source: 'digilocker'
  },
  {
    id: 'mydoc-002', citizenId: 'citizen-001', name: 'PAN Card', nameTA: 'PAN அட்டை',
    category: 'identity', fileName: 'pan_card.pdf', fileSize: 180000, fileType: 'application/pdf',
    uploadedAt: '2026-03-15T10:00:00Z', verificationStatus: 'verified', documentNumber: 'ABCPD1234R',
    issuedBy: 'Income Tax Department', source: 'upload'
  },
  {
    id: 'mydoc-003', citizenId: 'citizen-001', name: 'Community Certificate', nameTA: 'சமூக சான்றிதழ்',
    category: 'certificates', fileName: 'community_cert.pdf', fileSize: 320000, fileType: 'application/pdf',
    uploadedAt: '2026-06-05T15:10:00Z', verificationStatus: 'verified', documentNumber: 'CC-CHN-2026-392847',
    issuedBy: 'Revenue Department, Tamil Nadu', source: 'upload'
  },
  {
    id: 'mydoc-004', citizenId: 'citizen-001', name: 'Electricity Bill', nameTA: 'மின் கட்டண ரசீது',
    category: 'address', fileName: 'eb_bill_aug2026.pdf', fileSize: 95000, fileType: 'application/pdf',
    uploadedAt: '2026-08-05T10:00:00Z', verificationStatus: 'unverified',
    issuedBy: 'TANGEDCO', source: 'upload', expiryDate: '2026-09-05T00:00:00Z'
  },
  {
    id: 'mydoc-005', citizenId: 'citizen-001', name: 'Degree Certificate', nameTA: 'பட்ட சான்றிதழ்',
    category: 'education', fileName: 'degree_cert.pdf', fileSize: 520000, fileType: 'application/pdf',
    uploadedAt: '2026-04-20T10:00:00Z', verificationStatus: 'verified', documentNumber: 'AU-2017-CS-4521',
    issuedBy: 'Anna University', source: 'upload'
  }
];

export const mockDigiLockerDocuments: DigiLockerDocument[] = [
  { id: 'dl-001', type: 'AADHAAR', name: 'Aadhaar Card', nameTA: 'ஆதார் அட்டை', issuer: 'UIDAI', issuerTA: 'UIDAI', issuedDate: '2015-06-20', documentNumber: 'XXXX XXXX 4329', category: 'identity', available: true },
  { id: 'dl-002', type: 'DRIVING_LICENCE', name: 'Driving Licence', nameTA: 'ஓட்டுநர் உரிமம்', issuer: 'Transport Department', issuerTA: 'போக்குவரத்து துறை', issuedDate: '2018-03-14', documentNumber: 'TN01-20180012345', category: 'identity', available: true },
  { id: 'dl-003', type: 'PAN', name: 'PAN Card', nameTA: 'PAN அட்டை', issuer: 'Income Tax Department', issuerTA: 'வருமான வரி துறை', issuedDate: '2016-01-10', documentNumber: 'ABCPD1234R', category: 'identity', available: true },
  { id: 'dl-004', type: 'MARKSHEET_10', name: 'Class X Marksheet', nameTA: '10ஆம் வகுப்பு மதிப்பெண் பட்டியல்', issuer: 'Tamil Nadu State Board', issuerTA: 'தமிழ்நாடு மாநில வாரியம்', issuedDate: '2010-06-15', documentNumber: 'TNSB-2010-123456', category: 'education', available: true },
  { id: 'dl-005', type: 'MARKSHEET_12', name: 'Class XII Marksheet', nameTA: '12ஆம் வகுப்பு மதிப்பெண் பட்டியல்', issuer: 'Tamil Nadu State Board', issuerTA: 'தமிழ்நாடு மாநில வாரியம்', issuedDate: '2012-06-15', documentNumber: 'TNSB-2012-654321', category: 'education', available: true }
];

export function getDocumentsByUser(userId: string): Document[] {
  return mockDocuments.filter(d => d.citizenId === userId);
}

export function getDocumentById(id: string): Document | undefined {
  return mockDocuments.find(d => d.id === id);
}

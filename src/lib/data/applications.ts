import type { Application } from '$lib/types';

export const mockApplications: Application[] = [
  {
    id: 'app-001',
    applicationNumber: 'SYM-2026-784521',
    serviceId: 'svc-income-cert',
    serviceName: 'Income Certificate',
    serviceNameTA: 'வருமான சான்றிதழ்',
    departmentId: 'dept-revenue',
    departmentName: 'Revenue Department',
    departmentNameTA: 'வருவாய் துறை',
    citizenId: 'citizen-001',
    citizenName: 'Meena Lakshmi',
    workflowId: 'wf-income-cert',
    status: 'OFFICER_REVIEW',
    formData: {
      fullName: 'Meena Lakshmi',
      fatherName: 'Lakshmi Narayanan',
      motherName: 'Saraswathi',
      dateOfBirth: '1995-03-14',
      gender: 'female',
      phone: '9876543210',
      email: 'meena@demo.com',
      aadhaarLast4: '4329',
      doorNo: '42',
      street: 'Anna Nagar Main Road',
      area: 'Anna Nagar',
      city: 'Chennai',
      district: 'Chennai',
      taluk: 'Egmore',
      village: 'Anna Nagar',
      pincode: '600040',
      annualIncome: 480000,
      occupation: 'Software Engineer',
      purpose: 'Scholarship Application'
    },
    documents: [
      { id: 'adoc-1', documentId: 'doc-aadhaar', name: 'Aadhaar Card', fileName: 'aadhaar_meena.pdf', fileSize: 245000, fileType: 'application/pdf', uploadedAt: '2026-08-10T10:00:00Z', status: 'verified', source: 'digilocker' },
      { id: 'adoc-2', documentId: 'doc-ration', name: 'Ration Card', fileName: 'ration_card.pdf', fileSize: 380000, fileType: 'application/pdf', uploadedAt: '2026-08-10T10:05:00Z', status: 'verified', source: 'upload' },
      { id: 'adoc-3', documentId: 'doc-salary', name: 'Salary Certificate', fileName: 'salary_cert.pdf', fileSize: 156000, fileType: 'application/pdf', uploadedAt: '2026-08-10T10:10:00Z', status: 'verified', source: 'upload' },
      { id: 'adoc-4', documentId: 'doc-address', name: 'Address Proof', fileName: 'address_proof.pdf', fileSize: 290000, fileType: 'application/pdf', uploadedAt: '2026-08-10T10:15:00Z', status: 'verified', source: 'upload' }
    ],
    history: [
      { id: 'h1', status: 'DRAFT', timestamp: '2026-08-10T09:30:00Z', description: 'Application created', descriptionTA: 'விண்ணப்பம் உருவாக்கப்பட்டது', actorId: 'citizen-001', actorName: 'Meena Lakshmi', actorRole: 'citizen' },
      { id: 'h2', status: 'SUBMITTED', timestamp: '2026-08-10T10:20:00Z', description: 'Application submitted', descriptionTA: 'விண்ணப்பம் சமர்ப்பிக்கப்பட்டது', actorId: 'citizen-001', actorName: 'Meena Lakshmi', actorRole: 'citizen' },
      { id: 'h3', status: 'DOCUMENT_VERIFICATION', timestamp: '2026-08-11T09:00:00Z', description: 'Documents under verification', descriptionTA: 'ஆவணங்கள் சரிபார்ப்பில்', actorId: 'system', actorName: 'System', actorRole: 'system' },
      { id: 'h4', status: 'OFFICER_REVIEW', timestamp: '2026-08-12T14:30:00Z', description: 'Documents verified. Under officer review.', descriptionTA: 'ஆவணங்கள் சரிபார்க்கப்பட்டன. அலுவலர் மறுஆய்வில்.', actorId: 'officer-001', actorName: 'Rajesh Kumar', actorRole: 'officer' }
    ],
    assignedOfficerId: 'officer-001',
    assignedOfficerName: 'Rajesh Kumar',
    createdAt: '2026-08-10T09:30:00Z',
    updatedAt: '2026-08-12T14:30:00Z',
    submittedAt: '2026-08-10T10:20:00Z',
    expectedCompletionDate: '2026-08-20T00:00:00Z',
    slaDeadline: '2026-08-19T10:20:00Z',
    isSlaBreached: false
  },
  {
    id: 'app-002',
    applicationNumber: 'SYM-2026-392847',
    serviceId: 'svc-community-cert',
    serviceName: 'Community Certificate',
    serviceNameTA: 'சமூக சான்றிதழ்',
    departmentId: 'dept-revenue',
    departmentName: 'Revenue Department',
    departmentNameTA: 'வருவாய் துறை',
    citizenId: 'citizen-001',
    citizenName: 'Meena Lakshmi',
    workflowId: 'wf-general-cert',
    status: 'COMPLETED',
    formData: {
      fullName: 'Meena Lakshmi',
      fatherName: 'Lakshmi Narayanan',
      dateOfBirth: '1995-03-14',
      gender: 'female',
      community: 'BC',
      religion: 'Hindu',
      district: 'Chennai'
    },
    documents: [
      { id: 'adoc-5', documentId: 'doc-aadhaar', name: 'Aadhaar Card', fileName: 'aadhaar.pdf', fileSize: 245000, fileType: 'application/pdf', uploadedAt: '2026-06-01T10:00:00Z', status: 'verified', source: 'upload' },
      { id: 'adoc-6', documentId: 'doc-tc', name: 'Transfer Certificate', fileName: 'tc.pdf', fileSize: 180000, fileType: 'application/pdf', uploadedAt: '2026-06-01T10:05:00Z', status: 'verified', source: 'upload' }
    ],
    history: [
      { id: 'h5', status: 'DRAFT', timestamp: '2026-06-01T09:00:00Z', description: 'Application created', descriptionTA: 'விண்ணப்பம் உருவாக்கப்பட்டது', actorId: 'citizen-001', actorName: 'Meena Lakshmi', actorRole: 'citizen' },
      { id: 'h6', status: 'SUBMITTED', timestamp: '2026-06-01T10:10:00Z', description: 'Application submitted', descriptionTA: 'விண்ணப்பம் சமர்ப்பிக்கப்பட்டது', actorId: 'citizen-001', actorName: 'Meena Lakshmi', actorRole: 'citizen' },
      { id: 'h7', status: 'DOCUMENT_VERIFICATION', timestamp: '2026-06-02T09:00:00Z', description: 'Under doc verification', descriptionTA: 'ஆவண சரிபார்ப்பில்', actorId: 'system', actorName: 'System', actorRole: 'system' },
      { id: 'h8', status: 'OFFICER_REVIEW', timestamp: '2026-06-03T11:00:00Z', description: 'Officer review', descriptionTA: 'அலுவலர் மறுஆய்வு', actorId: 'officer-001', actorName: 'Rajesh Kumar', actorRole: 'officer' },
      { id: 'h9', status: 'APPROVED', timestamp: '2026-06-05T15:00:00Z', description: 'Application approved', descriptionTA: 'விண்ணப்பம் ஒப்புதல்', actorId: 'officer-001', actorName: 'Rajesh Kumar', actorRole: 'officer' },
      { id: 'h10', status: 'CERTIFICATE_GENERATED', timestamp: '2026-06-05T15:05:00Z', description: 'Certificate generated', descriptionTA: 'சான்றிதழ் உருவாக்கப்பட்டது', actorId: 'system', actorName: 'System', actorRole: 'system' },
      { id: 'h11', status: 'COMPLETED', timestamp: '2026-06-05T15:10:00Z', description: 'Process completed', descriptionTA: 'செயல்முறை நிறைவடைந்தது', actorId: 'system', actorName: 'System', actorRole: 'system' }
    ],
    certificateUrl: '/mock/community-certificate.pdf',
    createdAt: '2026-06-01T09:00:00Z',
    updatedAt: '2026-06-05T15:10:00Z',
    submittedAt: '2026-06-01T10:10:00Z',
    completedAt: '2026-06-05T15:10:00Z',
    isSlaBreached: false
  },
  {
    id: 'app-003',
    applicationNumber: 'SYM-2026-561234',
    serviceId: 'svc-new-ration',
    serviceName: 'New Ration Card',
    serviceNameTA: 'புதிய ரேஷன் கார்டு',
    departmentId: 'dept-civil-supplies',
    departmentName: 'Civil Supplies Department',
    departmentNameTA: 'குடிமைப் பொருள் வழங்கல் துறை',
    citizenId: 'citizen-001',
    citizenName: 'Meena Lakshmi',
    workflowId: 'wf-ration-card',
    status: 'DOCUMENT_VERIFICATION',
    formData: {
      fullName: 'Meena Lakshmi',
      fatherName: 'Lakshmi Narayanan',
      phone: '9876543210',
      district: 'Chennai',
      pincode: '600040'
    },
    documents: [
      { id: 'adoc-7', documentId: 'doc-aadhaar', name: 'Aadhaar Card', fileName: 'aadhaar.pdf', fileSize: 245000, fileType: 'application/pdf', uploadedAt: '2026-08-18T10:00:00Z', status: 'pending', source: 'upload' }
    ],
    history: [
      { id: 'h12', status: 'DRAFT', timestamp: '2026-08-18T09:00:00Z', description: 'Application created', descriptionTA: 'விண்ணப்பம் உருவாக்கப்பட்டது', actorId: 'citizen-001', actorName: 'Meena Lakshmi', actorRole: 'citizen' },
      { id: 'h13', status: 'SUBMITTED', timestamp: '2026-08-18T10:15:00Z', description: 'Application submitted', descriptionTA: 'விண்ணப்பம் சமர்ப்பிக்கப்பட்டது', actorId: 'citizen-001', actorName: 'Meena Lakshmi', actorRole: 'citizen' },
      { id: 'h14', status: 'DOCUMENT_VERIFICATION', timestamp: '2026-08-19T09:00:00Z', description: 'Under document verification', descriptionTA: 'ஆவண சரிபார்ப்பில்', actorId: 'system', actorName: 'System', actorRole: 'system' }
    ],
    assignedOfficerId: 'officer-001',
    assignedOfficerName: 'Rajesh Kumar',
    createdAt: '2026-08-18T09:00:00Z',
    updatedAt: '2026-08-19T09:00:00Z',
    submittedAt: '2026-08-18T10:15:00Z',
    expectedCompletionDate: '2026-09-05T00:00:00Z',
    slaDeadline: '2026-09-03T10:15:00Z',
    isSlaBreached: false
  }
];

export function getApplicationsByUser(userId: string): Application[] {
  return mockApplications.filter(a => a.citizenId === userId);
}

export function getApplicationById(id: string): Application | undefined {
  return mockApplications.find(a => a.id === id || a.applicationNumber === id);
}

export function getApplicationsByOfficer(officerId: string): Application[] {
  return mockApplications.filter(a => a.assignedOfficerId === officerId && a.status !== 'COMPLETED' && a.status !== 'REJECTED' && a.status !== 'DRAFT');
}

export function getPendingApplications(): Application[] {
  return mockApplications.filter(a => !['COMPLETED', 'REJECTED', 'DRAFT', 'CANCELLED'].includes(a.status));
}

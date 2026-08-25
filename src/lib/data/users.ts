import type { CitizenProfile, OfficerProfile, DepartmentUserProfile, OperatorProfile, AdminProfile, DemoCredentials } from '$lib/types';

export const demoCredentials: DemoCredentials[] = [
  { email: 'meena@demo.com', password: 'demo123', role: 'citizen', name: 'Meena Lakshmi' },
  { email: 'rajesh@demo.com', password: 'demo123', role: 'officer', name: 'Rajesh Kumar (Revenue Dept)' },
  { email: 'kavitha@demo.com', password: 'demo123', role: 'department_user', name: 'Kavitha Selvam (Civil Supplies)' },
  { email: 'kannan@demo.com', password: 'demo123', role: 'operator', name: 'Kannan M (e-Sevai Kiosk Operator)' },
  { email: 'priya@demo.com', password: 'demo123', role: 'tnhub_admin', name: 'Priya Sundaram (Admin)' }
];

export const demoCitizen: CitizenProfile = {
  id: 'citizen-001',
  email: 'meena@demo.com',
  name: 'Meena Lakshmi',
  nameTA: 'மீனா லட்சுமி',
  role: 'citizen',
  phone: '9876543210',
  createdAt: '2026-01-15T10:30:00Z',
  lastLoginAt: '2026-08-22T09:00:00Z',
  isActive: true,
  preferredLanguage: 'en',
  aadhaarNumber: '123456784329',
  dateOfBirth: '1995-03-14',
  gender: 'female',
  address: {
    doorNo: '42',
    street: 'Anna Nagar Main Road',
    area: 'Anna Nagar',
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600040'
  },
  district: 'Chennai',
  taluk: 'Egmore',
  village: 'Anna Nagar',
  pincode: '600040',
  occupation: 'Software Engineer',
  annualIncome: 480000,
  community: 'BC',
  religion: 'Hindu',
  digilockerConnected: false
};

export const demoOfficer: OfficerProfile = {
  id: 'officer-001',
  email: 'rajesh@demo.com',
  name: 'Rajesh Kumar',
  nameTA: 'ராஜேஷ் குமார்',
  role: 'officer',
  phone: '9876543211',
  createdAt: '2025-06-01T08:00:00Z',
  lastLoginAt: '2026-08-22T08:30:00Z',
  isActive: true,
  preferredLanguage: 'en',
  departmentId: 'dept-revenue',
  departmentName: 'Revenue Department',
  designation: 'Revenue Inspector',
  employeeId: 'RI-CHN-2024-0142',
  jurisdiction: 'Chennai District',
  assignedServiceIds: ['svc-income-cert', 'svc-community-cert', 'svc-nativity-cert', 'svc-residence-cert'],
  maxConcurrentApplications: 25
};

export const demoCivilSuppliesOfficer: DepartmentUserProfile = {
  id: 'dept-user-002',
  email: 'kavitha@demo.com',
  name: 'Kavitha Selvam',
  nameTA: 'கவிதா செல்வம்',
  role: 'department_user',
  phone: '9876543213',
  createdAt: '2025-08-10T08:00:00Z',
  lastLoginAt: '2026-08-23T08:30:00Z',
  isActive: true,
  preferredLanguage: 'en',
  departmentId: 'dept-civil-supplies',
  departmentName: 'Civil Supplies Department',
  designation: 'Supply Officer',
  employeeId: 'CSO-CHN-2025-0089',
  jurisdiction: 'North Chennai'
};

export const demoOperator: OperatorProfile = {
  id: 'operator-001',
  email: 'kannan@demo.com',
  name: 'Kannan M',
  nameTA: 'கண்ணன் மு',
  role: 'operator',
  phone: '9876543214',
  createdAt: '2025-09-01T08:00:00Z',
  lastLoginAt: '2026-08-23T09:00:00Z',
  isActive: true,
  preferredLanguage: 'en',
  kioskId: 'ESV-CHN-0042',
  centerLocation: 'Egmore e-Sevai Center',
  district: 'Chennai'
};

export const demoAdmin: AdminProfile = {
  id: 'admin-001',
  email: 'priya@demo.com',
  name: 'Priya Sundaram',
  nameTA: 'பிரியா சுந்தரம்',
  role: 'tnhub_admin',
  phone: '9876543212',
  createdAt: '2025-01-01T00:00:00Z',
  lastLoginAt: '2026-08-22T07:00:00Z',
  isActive: true,
  preferredLanguage: 'en',
  permissions: ['manage_services', 'manage_departments', 'manage_users', 'manage_workflows', 'manage_integrations', 'view_analytics', 'view_audit_logs']
};

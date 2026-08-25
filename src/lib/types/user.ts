// ============================================
// USER & ROLE TYPES
// ============================================

/** Roles issued in Firebase custom claims for newly authenticated users. */
export type CanonicalUserRole = 'citizen' | 'department_user' | 'operator' | 'admin';

/**
 * Legacy aliases are retained only while the Phase 1 mock fixtures remain in
 * the repository. Firebase sessions are normalised to CanonicalUserRole.
 */
export type LegacyUserRole = 'officer' | 'dept_admin' | 'sympho_admin';

export type UserRole = CanonicalUserRole | LegacyUserRole;

export interface User {
  /**
   * Existing UI compatibility identifier. Authenticated Firebase users set
   * this to the same value as uid.
   */
  id: string;
  /** Firebase Authentication UID for real sessions. */
  uid?: string;
  email: string;
  name: string;
  /** Firebase display name for real sessions. */
  displayName?: string;
  nameTA?: string;
  role: UserRole;
  departmentId?: string;
  departmentName?: string;
  phone?: string;
  avatar?: string;
  photoURL?: string;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
  isActive: boolean;
  preferredLanguage: 'en' | 'ta';
}

/** A verified Firebase session exposed to the app and SvelteKit locals. */
export interface AuthenticatedUser extends User {
  uid: string;
  displayName: string;
  role: CanonicalUserRole;
}

export interface CitizenProfile extends User {
  role: 'citizen';
  aadhaarLast4?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: Address;
  district?: string;
  taluk?: string;
  village?: string;
  pincode?: string;
  occupation?: string;
  annualIncome?: number;
  community?: string;
  religion?: string;
  rationCardNumber?: string;
  digilockerConnected?: boolean;
}

export interface OfficerProfile extends User {
  role: 'officer' | 'department_user';
  departmentId: string;
  departmentName: string;
  designation: string;
  employeeId: string;
  jurisdiction?: string;
  assignedServiceIds: string[];
  maxConcurrentApplications: number;
}

export interface DepartmentUserProfile extends User {
  role: 'department_user' | 'officer';
  departmentId: string;
  departmentName: string;
  designation: string;
  employeeId: string;
  jurisdiction?: string;
}

export interface OperatorProfile extends User {
  role: 'operator';
  kioskId: string;
  centerLocation: string;
  district: string;
}

export interface AdminProfile extends User {
  role: 'dept_admin' | 'sympho_admin' | 'admin';
  departmentId?: string;
  permissions: string[];
}

export interface Address {
  doorNo: string;
  street: string;
  area: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
}

export interface DemoCredentials {
  email: string;
  password: string;
  role: UserRole;
  name: string;
}

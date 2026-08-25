// ============================================
// DEPARTMENT TYPES
// ============================================

export interface Department {
  id: string;
  name: string;
  nameTA: string;
  shortName: string;
  description: string;
  descriptionTA: string;
  icon: string;
  serviceCount: number;
  headOfficer?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  isActive: boolean;
}

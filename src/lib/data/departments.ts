import type { Department } from '$lib/types';

export const departments: Department[] = [
  {
    id: 'dept-revenue',
    name: 'Revenue Department',
    nameTA: 'வருவாய் துறை',
    shortName: 'Revenue',
    description: 'Handles land records, certificates, and revenue administration',
    descriptionTA: 'நில பதிவுகள், சான்றிதழ்கள் மற்றும் வருவாய் நிர்வாகத்தை கையாளுகிறது',
    icon: 'landmark',
    serviceCount: 4,
    headOfficer: 'District Collector',
    contactEmail: 'revenue@tn.gov.in',
    contactPhone: '044-25670001',
    website: 'https://tnrevenue.gov.in',
    isActive: true
  },
  {
    id: 'dept-civil-supplies',
    name: 'Civil Supplies Department',
    nameTA: 'குடிமைப் பொருள் வழங்கல் துறை',
    shortName: 'Civil Supplies',
    description: 'Manages public distribution system and ration card services',
    descriptionTA: 'பொது விநியோக அமைப்பு மற்றும் ரேஷன் கார்டு சேவைகளை நிர்வகிக்கிறது',
    icon: 'shopping-cart',
    serviceCount: 5,
    headOfficer: 'Commissioner of Civil Supplies',
    contactEmail: 'civilsupplies@tn.gov.in',
    contactPhone: '044-25670002',
    website: 'https://www.tncsc.tn.gov.in',
    isActive: true
  },
  {
    id: 'dept-social-welfare',
    name: 'Social Welfare Department',
    nameTA: 'சமூக நலத்துறை',
    shortName: 'Social Welfare',
    description: 'Implements social welfare schemes for underprivileged sections',
    descriptionTA: 'நலிவடைந்த பிரிவினருக்கான சமூக நல திட்டங்களை செயல்படுத்துகிறது',
    icon: 'heart-handshake',
    serviceCount: 1,
    headOfficer: 'Director of Social Welfare',
    contactEmail: 'socialwelfare@tn.gov.in',
    contactPhone: '044-25670003',
    website: 'https://www.tnsocialwelfare.tn.gov.in',
    isActive: true
  },
  {
    id: 'dept-local-govt',
    name: 'Local Government Department',
    nameTA: 'உள்ளாட்சித் துறை',
    shortName: 'Local Govt',
    description: 'Manages birth, death registrations and local body services',
    descriptionTA: 'பிறப்பு, இறப்பு பதிவுகள் மற்றும் உள்ளாட்சி சேவைகளை நிர்வகிக்கிறது',
    icon: 'building-2',
    serviceCount: 2,
    headOfficer: 'Commissioner of Municipal Administration',
    contactEmail: 'localgov@tn.gov.in',
    contactPhone: '044-25670004',
    website: 'https://www.tnurbantree.tn.gov.in',
    isActive: true
  },
  {
    id: 'dept-health',
    name: 'Health & Family Welfare Department',
    nameTA: 'சுகாதார மற்றும் குடும்ப நலத்துறை',
    shortName: 'Health',
    description: 'Provides healthcare services and health scheme enrollment',
    descriptionTA: 'சுகாதார சேவைகள் மற்றும் சுகாதார திட்டப்பதிவை வழங்குகிறது',
    icon: 'heart-pulse',
    serviceCount: 1,
    headOfficer: 'Director of Medical & Rural Health Services',
    contactEmail: 'health@tn.gov.in',
    contactPhone: '044-25670005',
    website: 'https://www.tnhealth.tn.gov.in',
    isActive: true
  },
  {
    id: 'dept-drugs-control',
    name: 'Drugs Control Department',
    nameTA: 'மருந்து கட்டுப்பாட்டு துறை',
    shortName: 'Drugs Control',
    description: 'Regulates drug manufacturing, distribution and licensing',
    descriptionTA: 'மருந்து உற்பத்தி, விநியோகம் மற்றும் உரிமத்தை ஒழுங்குபடுத்துகிறது',
    icon: 'pill',
    serviceCount: 1,
    headOfficer: 'Drug Controller',
    contactEmail: 'drugscontrol@tn.gov.in',
    contactPhone: '044-25670006',
    website: 'https://www.tndrugscontrol.tn.gov.in',
    isActive: true
  },
  {
    id: 'dept-transport',
    name: 'Transport Department',
    nameTA: 'போக்குவரத்து துறை',
    shortName: 'Transport',
    description: 'Manages vehicle registration and transport services',
    descriptionTA: 'வாகன பதிவு மற்றும் போக்குவரத்து சேவைகளை நிர்வகிக்கிறது',
    icon: 'car',
    serviceCount: 0,
    headOfficer: 'Transport Commissioner',
    contactEmail: 'transport@tn.gov.in',
    contactPhone: '044-25670007',
    website: 'https://www.tnsta.gov.in',
    isActive: true
  }
];

export function getDepartmentById(id: string): Department | undefined {
  return departments.find(d => d.id === id);
}

export function getDepartmentName(id: string, locale: 'en' | 'ta' = 'en'): string {
  const dept = getDepartmentById(id);
  if (!dept) return 'Unknown Department';
  return locale === 'ta' ? dept.nameTA : dept.name;
}

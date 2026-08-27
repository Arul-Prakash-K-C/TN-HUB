export interface ApplicationFormData {
  fullName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  aadhaarNumber?: string;
  doorNo?: string;
  street?: string;
  area?: string;
  city?: string;
  district?: string;
  taluk?: string;
  village?: string;
  pincode?: string;
  annualIncome?: number;
  occupation?: string;
  community?: string;
  religion?: string;
  purpose?: string;
  [key: string]: any;
}

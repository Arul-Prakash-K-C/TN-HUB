import type { Service } from '$lib/types';

export const services: Service[] = [
  // ===================== REVENUE DEPARTMENT =====================
  {
    id: 'svc-income-cert',
    slug: 'income-certificate',
    name: 'Income Certificate',
    nameTA: 'வருமான சான்றிதழ்',
    shortDescription: 'Certificate to verify annual income for various government schemes',
    shortDescriptionTA: 'பல்வேறு அரசு திட்டங்களுக்கான ஆண்டு வருமானத்தை சரிபார்க்கும் சான்றிதழ்',
    description: 'An Income Certificate is an official document issued by the Revenue Department of Tamil Nadu that certifies the annual income of an individual or family. This certificate is required for various purposes including admission to educational institutions, applying for scholarships, government schemes, and subsidies.',
    descriptionTA: 'வருமான சான்றிதழ் என்பது தமிழ்நாடு வருவாய் துறையால் வழங்கப்படும் அதிகாரப்பூர்வ ஆவணமாகும், இது ஒரு தனிநபர் அல்லது குடும்பத்தின் ஆண்டு வருமானத்தை சான்றளிக்கிறது. கல்வி நிறுவனங்களில் சேர்க்கை, உதவித்தொகை, அரசு திட்டங்கள் மற்றும் மானியங்களுக்கு விண்ணப்பிப்பதற்கு இந்த சான்றிதழ் தேவைப்படுகிறது.',
    departmentId: 'dept-revenue',
    category: 'revenue',
    implementationMode: 'NATIVE_WORKFLOW',
    eligibility: [
      'Must be a resident of Tamil Nadu',
      'Must be an Indian citizen',
      'Must provide valid address proof within Tamil Nadu'
    ],
    eligibilityTA: [
      'தமிழ்நாட்டில் வசிப்பவராக இருக்க வேண்டும்',
      'இந்திய குடிமகனாக இருக்க வேண்டும்',
      'தமிழ்நாட்டில் செல்லுபடியான முகவரி சான்றை வழங்க வேண்டும்'
    ],
    whoCanApply: 'Any resident of Tamil Nadu who needs to certify their annual income',
    whoCanApplyTA: 'தங்கள் ஆண்டு வருமானத்தை சான்றளிக்க வேண்டிய தமிழ்நாட்டில் வசிக்கும் எவரும்',
    requiredDocuments: [
      { id: 'doc-aadhaar', name: 'Aadhaar Card', nameTA: 'ஆதார் அட்டை', description: 'Government-issued identity proof', descriptionTA: 'அரசு வழங்கிய அடையாள சான்று', mandatory: true, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeMB: 5, digilockerAvailable: true },
      { id: 'doc-ration', name: 'Ration Card', nameTA: 'ரேஷன் கார்டு', description: 'Family ration card for income verification', descriptionTA: 'வருமான சரிபார்ப்புக்கான குடும்ப ரேஷன் கார்டு', mandatory: true, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeMB: 5, digilockerAvailable: false },
      { id: 'doc-salary', name: 'Salary Certificate / Income Proof', nameTA: 'சம்பள சான்றிதழ் / வருமான சான்று', description: 'Employer-issued salary certificate or income proof', descriptionTA: 'முதலாளி வழங்கிய சம்பள சான்றிதழ் அல்லது வருமான சான்று', mandatory: true, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeMB: 5, digilockerAvailable: false },
      { id: 'doc-address', name: 'Address Proof', nameTA: 'முகவரி சான்று', description: 'Any government-issued address proof', descriptionTA: 'அரசு வழங்கிய முகவரி சான்று', mandatory: true, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeMB: 5, digilockerAvailable: true }
    ],
    fee: 0,
    feeDescription: 'Free of charge',
    feeDescriptionTA: 'கட்டணமின்றி',
    processingTimeDays: 7,
    processingTimeDescription: '5-7 working days',
    processingTimeDescriptionTA: '5-7 வேலை நாட்கள்',
    applicationSteps: [
      { step: 1, title: 'Check Eligibility', titleTA: 'தகுதியை சரிபார்', description: 'Verify you meet the eligibility criteria', descriptionTA: 'நீங்கள் தகுதி நிபந்தனைகளை பூர்த்தி செய்கிறீர்களா என்று சரிபார்க்கவும்' },
      { step: 2, title: 'Fill Personal Details', titleTA: 'தனிப்பட்ட விவரங்களை நிரப்புங்கள்', description: 'Enter your personal and address information', descriptionTA: 'உங்கள் தனிப்பட்ட மற்றும் முகவரி தகவல்களை உள்ளிடுங்கள்' },
      { step: 3, title: 'Enter Income Details', titleTA: 'வருமான விவரங்களை உள்ளிடுங்கள்', description: 'Provide your annual income and occupation details', descriptionTA: 'உங்கள் ஆண்டு வருமானம் மற்றும் தொழில் விவரங்களை வழங்குங்கள்' },
      { step: 4, title: 'Upload Documents', titleTA: 'ஆவணங்களை பதிவேற்றுங்கள்', description: 'Upload required supporting documents', descriptionTA: 'தேவையான துணை ஆவணங்களை பதிவேற்றுங்கள்' },
      { step: 5, title: 'Review & Submit', titleTA: 'மறுஆய்வு & சமர்ப்பி', description: 'Review your application and submit', descriptionTA: 'உங்கள் விண்ணப்பத்தை மறுஆய்வு செய்து சமர்ப்பிக்கவும்' }
    ],
    faqs: [
      { question: 'What is the validity of an Income Certificate?', questionTA: 'வருமான சான்றிதழின் செல்லுபடியாகும் காலம் என்ன?', answer: 'The Income Certificate is generally valid for 1 year from the date of issue.', answerTA: 'வருமான சான்றிதழ் பொதுவாக வழங்கப்பட்ட நாளிலிருந்து 1 ஆண்டு செல்லும்.' },
      { question: 'Can I apply online?', questionTA: 'ஆன்லைனில் விண்ணப்பிக்க முடியுமா?', answer: 'Yes, you can apply through TN Hub. The application will be processed by the Revenue Department.', answerTA: 'ஆம், TN Hub மூலம் விண்ணப்பிக்கலாம். விண்ணப்பம் வருவாய் துறையால் செயலாக்கப்படும்.' },
      { question: 'Is there any fee?', questionTA: 'ஏதாவது கட்டணம் உள்ளதா?', answer: 'No, the Income Certificate is issued free of charge.', answerTA: 'இல்லை, வருமான சான்றிதழ் இலவசமாக வழங்கப்படுகிறது.' }
    ],
    workflowId: 'wf-income-cert',
    relatedServiceIds: ['svc-community-cert', 'svc-nativity-cert', 'svc-residence-cert'],
    isActive: true,
    isOnline: true,
    version: 1,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'svc-community-cert',
    slug: 'community-certificate',
    name: 'Community Certificate',
    nameTA: 'சமூக சான்றிதழ்',
    shortDescription: 'Certificate certifying community/caste for reservation benefits',
    shortDescriptionTA: 'இட ஒதுக்கீடு நலன்களுக்கான சமூகம்/சாதியை சான்றளிக்கும் சான்றிதழ்',
    description: 'A Community Certificate is issued by the Revenue Department to certify the community/caste of an individual. This certificate is essential for availing reservation benefits in education and government employment in Tamil Nadu.',
    descriptionTA: 'சமூக சான்றிதழ் என்பது ஒரு தனிநபரின் சமூகம்/சாதியை சான்றளிக்க வருவாய் துறையால் வழங்கப்படும் ஆவணமாகும். தமிழ்நாட்டில் கல்வி மற்றும் அரசு வேலைவாய்ப்பில் இட ஒதுக்கீடு நலன்களைப் பெற இந்த சான்றிதழ் அவசியமானது.',
    departmentId: 'dept-revenue',
    category: 'revenue',
    implementationMode: 'NATIVE_WORKFLOW',
    eligibility: ['Must be a resident of Tamil Nadu', 'Must belong to a recognized community category (SC/ST/BC/MBC/DNC)'],
    eligibilityTA: ['தமிழ்நாட்டில் வசிப்பவராக இருக்க வேண்டும்', 'அங்கீகரிக்கப்பட்ட சமூக வகையைச் சேர்ந்தவராக இருக்க வேண்டும் (SC/ST/BC/MBC/DNC)'],
    whoCanApply: 'Any resident of Tamil Nadu belonging to a recognized community category',
    whoCanApplyTA: 'அங்கீகரிக்கப்பட்ட சமூக வகையைச் சேர்ந்த தமிழ்நாட்டில் வசிக்கும் எவரும்',
    requiredDocuments: [
      { id: 'doc-aadhaar', name: 'Aadhaar Card', nameTA: 'ஆதார் அட்டை', description: 'Identity proof', descriptionTA: 'அடையாள சான்று', mandatory: true, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeMB: 5, digilockerAvailable: true },
      { id: 'doc-tc', name: 'Transfer Certificate', nameTA: 'மாற்றுச் சான்றிதழ்', description: 'School TC showing community', descriptionTA: 'சமூகத்தைக் காட்டும் பள்ளி TC', mandatory: true, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeMB: 5, digilockerAvailable: false },
      { id: 'doc-parent-cc', name: "Parent's Community Certificate", nameTA: 'பெற்றோர் சமூக சான்றிதழ்', description: "Father's or Mother's community certificate", descriptionTA: 'தந்தை அல்லது தாயின் சமூக சான்றிதழ்', mandatory: false, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeMB: 5, digilockerAvailable: false }
    ],
    fee: 0, feeDescription: 'Free of charge', feeDescriptionTA: 'கட்டணமின்றி',
    processingTimeDays: 10, processingTimeDescription: '7-10 working days', processingTimeDescriptionTA: '7-10 வேலை நாட்கள்',
    applicationSteps: [
      { step: 1, title: 'Check Eligibility', titleTA: 'தகுதியை சரிபார்', description: 'Verify eligibility', descriptionTA: 'தகுதியை சரிபார்க்கவும்' },
      { step: 2, title: 'Fill Details', titleTA: 'விவரங்களை நிரப்புங்கள்', description: 'Enter personal and community details', descriptionTA: 'தனிப்பட்ட மற்றும் சமூக விவரங்களை உள்ளிடுங்கள்' },
      { step: 3, title: 'Upload Documents', titleTA: 'ஆவணங்களை பதிவேற்றுங்கள்', description: 'Upload supporting documents', descriptionTA: 'துணை ஆவணங்களை பதிவேற்றுங்கள்' },
      { step: 4, title: 'Review & Submit', titleTA: 'மறுஆய்வு & சமர்ப்பி', description: 'Review and submit', descriptionTA: 'மறுஆய்வு செய்து சமர்ப்பிக்கவும்' }
    ],
    faqs: [
      { question: 'Who issues the Community Certificate?', questionTA: 'சமூக சான்றிதழை யார் வழங்குகிறார்கள்?', answer: 'The Revenue Divisional Officer (RDO) issues the Community Certificate.', answerTA: 'வருவாய் கோட்ட அலுவலர் (RDO) சமூக சான்றிதழை வழங்குகிறார்.' }
    ],
    workflowId: 'wf-general-cert',
    relatedServiceIds: ['svc-income-cert', 'svc-nativity-cert'],
    isActive: true, isOnline: true, version: 1, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'svc-nativity-cert',
    slug: 'nativity-certificate',
    name: 'Nativity Certificate',
    nameTA: 'பூர்வீக சான்றிதழ்',
    shortDescription: 'Certificate proving native status in Tamil Nadu',
    shortDescriptionTA: 'தமிழ்நாட்டில் பூர்வீக நிலையை நிரூபிக்கும் சான்றிதழ்',
    description: 'A Nativity Certificate is issued to certify that a person is a native of Tamil Nadu. It is required for educational admissions, government job applications, and other purposes where proof of nativity is mandated.',
    descriptionTA: 'பூர்வீக சான்றிதழ் என்பது ஒரு நபர் தமிழ்நாட்டை பூர்வீகமாக கொண்டவர் என்பதை சான்றளிக்க வழங்கப்படுகிறது.',
    departmentId: 'dept-revenue',
    category: 'revenue',
    implementationMode: 'NATIVE_WORKFLOW',
    eligibility: ['Must be born in Tamil Nadu or have domicile in Tamil Nadu'],
    eligibilityTA: ['தமிழ்நாட்டில் பிறந்திருக்க வேண்டும் அல்லது தமிழ்நாட்டில் வசிப்பிடம் கொண்டிருக்க வேண்டும்'],
    whoCanApply: 'Any person native to Tamil Nadu',
    whoCanApplyTA: 'தமிழ்நாட்டை பூர்வீகமாகக் கொண்ட எந்தவொரு நபரும்',
    requiredDocuments: [
      { id: 'doc-aadhaar', name: 'Aadhaar Card', nameTA: 'ஆதார் அட்டை', description: 'Identity proof', descriptionTA: 'அடையாள சான்று', mandatory: true, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeMB: 5, digilockerAvailable: true },
      { id: 'doc-birth', name: 'Birth Certificate', nameTA: 'பிறப்புச் சான்றிதழ்', description: 'Birth certificate showing place of birth', descriptionTA: 'பிறந்த இடத்தைக் காட்டும் பிறப்புச் சான்றிதழ்', mandatory: true, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeMB: 5, digilockerAvailable: true },
      { id: 'doc-tc', name: 'Transfer Certificate', nameTA: 'மாற்றுச் சான்றிதழ்', description: 'School Transfer Certificate', descriptionTA: 'பள்ளி மாற்றுச் சான்றிதழ்', mandatory: false, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeMB: 5, digilockerAvailable: false }
    ],
    fee: 0, feeDescription: 'Free of charge', feeDescriptionTA: 'கட்டணமின்றி',
    processingTimeDays: 7, processingTimeDescription: '5-7 working days', processingTimeDescriptionTA: '5-7 வேலை நாட்கள்',
    applicationSteps: [
      { step: 1, title: 'Check Eligibility', titleTA: 'தகுதியை சரிபார்', description: 'Verify eligibility', descriptionTA: 'தகுதியை சரிபார்க்கவும்' },
      { step: 2, title: 'Fill Details', titleTA: 'விவரங்களை நிரப்புங்கள்', description: 'Enter personal details', descriptionTA: 'தனிப்பட்ட விவரங்களை உள்ளிடுங்கள்' },
      { step: 3, title: 'Upload Documents', titleTA: 'ஆவணங்களை பதிவேற்றுங்கள்', description: 'Upload supporting documents', descriptionTA: 'துணை ஆவணங்களை பதிவேற்றுங்கள்' },
      { step: 4, title: 'Review & Submit', titleTA: 'மறுஆய்வு & சமர்ப்பி', description: 'Review and submit', descriptionTA: 'மறுஆய்வு செய்து சமர்ப்பிக்கவும்' }
    ],
    faqs: [],
    workflowId: 'wf-general-cert',
    relatedServiceIds: ['svc-income-cert', 'svc-community-cert', 'svc-residence-cert'],
    isActive: true, isOnline: true, version: 1, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'svc-residence-cert',
    slug: 'residence-certificate',
    name: 'Residence Certificate',
    nameTA: 'குடியிருப்பு சான்றிதழ்',
    shortDescription: 'Certificate proving residential status in a specific area',
    shortDescriptionTA: 'குறிப்பிட்ட பகுதியில் குடியிருப்பு நிலையை நிரூபிக்கும் சான்றிதழ்',
    description: 'A Residence Certificate is issued to certify that a person has been residing in a particular area for a specified period. It is required for various administrative and legal purposes.',
    descriptionTA: 'குடியிருப்பு சான்றிதழ் என்பது ஒரு நபர் குறிப்பிட்ட பகுதியில் குறிப்பிட்ட காலத்திற்கு வசித்திருப்பதை சான்றளிக்க வழங்கப்படுகிறது.',
    departmentId: 'dept-revenue',
    category: 'revenue',
    implementationMode: 'NATIVE_WORKFLOW',
    eligibility: ['Must be residing in the specified area', 'Must have valid address proof'],
    eligibilityTA: ['குறிப்பிட்ட பகுதியில் வசித்திருக்க வேண்டும்', 'செல்லுபடியான முகவரி சான்று இருக்க வேண்டும்'],
    whoCanApply: 'Any person residing in Tamil Nadu',
    whoCanApplyTA: 'தமிழ்நாட்டில் வசிக்கும் எந்தவொரு நபரும்',
    requiredDocuments: [
      { id: 'doc-aadhaar', name: 'Aadhaar Card', nameTA: 'ஆதார் அட்டை', description: 'Identity proof', descriptionTA: 'அடையாள சான்று', mandatory: true, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeMB: 5, digilockerAvailable: true },
      { id: 'doc-address', name: 'Address Proof', nameTA: 'முகவரி சான்று', description: 'Utility bill, rent agreement etc.', descriptionTA: 'மின் கட்டண ரசீது, வாடகை ஒப்பந்தம் போன்றவை', mandatory: true, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeMB: 5, digilockerAvailable: false }
    ],
    fee: 0, feeDescription: 'Free of charge', feeDescriptionTA: 'கட்டணமின்றி',
    processingTimeDays: 7, processingTimeDescription: '5-7 working days', processingTimeDescriptionTA: '5-7 வேலை நாட்கள்',
    applicationSteps: [
      { step: 1, title: 'Check Eligibility', titleTA: 'தகுதியை சரிபார்', description: 'Verify eligibility', descriptionTA: 'தகுதியை சரிபார்க்கவும்' },
      { step: 2, title: 'Fill Details', titleTA: 'விவரங்களை நிரப்புங்கள்', description: 'Enter details', descriptionTA: 'விவரங்களை உள்ளிடுங்கள்' },
      { step: 3, title: 'Upload Documents', titleTA: 'ஆவணங்களை பதிவேற்றுங்கள்', description: 'Upload documents', descriptionTA: 'ஆவணங்களை பதிவேற்றுங்கள்' },
      { step: 4, title: 'Review & Submit', titleTA: 'மறுஆய்வு & சமர்ப்பி', description: 'Review and submit', descriptionTA: 'மறுஆய்வு செய்து சமர்ப்பிக்கவும்' }
    ],
    faqs: [],
    workflowId: 'wf-general-cert',
    relatedServiceIds: ['svc-income-cert', 'svc-nativity-cert'],
    isActive: true, isOnline: true, version: 1, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z'
  },

  // ===================== CIVIL SUPPLIES =====================
  {
    id: 'svc-new-ration',
    slug: 'new-ration-card',
    name: 'New Ration Card',
    nameTA: 'புதிய ரேஷன் கார்டு',
    shortDescription: 'Apply for a new family ration card under PDS',
    shortDescriptionTA: 'PDS இன் கீழ் புதிய குடும்ப ரேஷன் கார்டுக்கு விண்ணப்பிக்கவும்',
    description: 'Apply for a new ration card to avail benefits under the Public Distribution System (PDS). The ration card serves as an important identity and address proof, and entitles the holder to purchase subsidized food grains and other essential commodities.',
    descriptionTA: 'பொது விநியோக அமைப்பு (PDS) கீழ் நலன்களைப் பெற புதிய ரேஷன் கார்டுக்கு விண்ணப்பிக்கவும்.',
    departmentId: 'dept-civil-supplies',
    category: 'civil_supplies',
    implementationMode: 'NATIVE_WORKFLOW',
    eligibility: ['Must be a resident of Tamil Nadu', 'Must not hold a ration card in any other state', 'Must have valid family head identification'],
    eligibilityTA: ['தமிழ்நாட்டில் வசிப்பவராக இருக்க வேண்டும்', 'வேறு எந்த மாநிலத்திலும் ரேஷன் கார்டு வைத்திருக்கக்கூடாது', 'செல்லுபடியான குடும்பத் தலைவர் அடையாளம் இருக்க வேண்டும்'],
    whoCanApply: 'Any Tamil Nadu resident without an existing ration card',
    whoCanApplyTA: 'ஏற்கனவே ரேஷன் கார்டு இல்லாத தமிழ்நாடு குடியிருப்பாளர்',
    requiredDocuments: [
      { id: 'doc-aadhaar', name: 'Aadhaar Card (All Family Members)', nameTA: 'ஆதார் அட்டை (அனைத்து குடும்ப உறுப்பினர்கள்)', description: 'Aadhaar for all family members', descriptionTA: 'அனைத்து குடும்ப உறுப்பினர்களுக்கான ஆதார்', mandatory: true, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeMB: 10, digilockerAvailable: true },
      { id: 'doc-address', name: 'Address Proof', nameTA: 'முகவரி சான்று', description: 'Address proof document', descriptionTA: 'முகவரி சான்று ஆவணம்', mandatory: true, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeMB: 5, digilockerAvailable: false },
      { id: 'doc-income', name: 'Income Certificate', nameTA: 'வருமான சான்றிதழ்', description: 'For card type determination', descriptionTA: 'கார்டு வகை நிர்ணயத்திற்கு', mandatory: true, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeMB: 5, digilockerAvailable: false },
      { id: 'doc-gas', name: 'Gas Connection Proof', nameTA: 'எரிவாயு இணைப்பு சான்று', description: 'LPG gas connection details', descriptionTA: 'LPG எரிவாயு இணைப்பு விவரங்கள்', mandatory: false, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeMB: 5, digilockerAvailable: false }
    ],
    fee: 0, feeDescription: 'Free of charge', feeDescriptionTA: 'கட்டணமின்றி',
    processingTimeDays: 15, processingTimeDescription: '10-15 working days', processingTimeDescriptionTA: '10-15 வேலை நாட்கள்',
    applicationSteps: [
      { step: 1, title: 'Check Eligibility', titleTA: 'தகுதியை சரிபார்', description: 'Verify eligibility', descriptionTA: 'தகுதியை சரிபார்க்கவும்' },
      { step: 2, title: 'Family Details', titleTA: 'குடும்ப விவரங்கள்', description: 'Enter all family member details', descriptionTA: 'அனைத்து குடும்ப உறுப்பினர் விவரங்களை உள்ளிடுங்கள்' },
      { step: 3, title: 'Upload Documents', titleTA: 'ஆவணங்களை பதிவேற்றுங்கள்', description: 'Upload documents', descriptionTA: 'ஆவணங்களை பதிவேற்றுங்கள்' },
      { step: 4, title: 'Review & Submit', titleTA: 'மறுஆய்வு & சமர்ப்பி', description: 'Review and submit', descriptionTA: 'மறுஆய்வு செய்து சமர்ப்பிக்கவும்' }
    ],
    faqs: [],
    workflowId: 'wf-ration-card',
    relatedServiceIds: ['svc-ration-add-member', 'svc-ration-address'],
    isActive: true, isOnline: true, version: 1, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'svc-ration-add-member',
    slug: 'ration-card-add-member',
    name: 'Add Family Member to Ration Card',
    nameTA: 'ரேஷன் கார்டில் குடும்ப உறுப்பினர் சேர்',
    shortDescription: 'Add a new family member to your existing ration card',
    shortDescriptionTA: 'உங்கள் ரேஷன் கார்டில் புதிய குடும்ப உறுப்பினரை சேர்க்கவும்',
    description: 'Add a new family member to your existing ration card due to birth, marriage, or other reasons.',
    descriptionTA: 'பிறப்பு, திருமணம் அல்லது பிற காரணங்களால் உங்கள் ரேஷன் கார்டில் புதிய குடும்ப உறுப்பினரை சேர்க்கவும்.',
    departmentId: 'dept-civil-supplies', category: 'civil_supplies', implementationMode: 'NATIVE_WORKFLOW',
    eligibility: ['Must have an existing ration card', 'New member must be a family member'],
    eligibilityTA: ['ஏற்கனவே ரேஷன் கார்டு இருக்க வேண்டும்', 'புதிய உறுப்பினர் குடும்ப உறுப்பினராக இருக்க வேண்டும்'],
    whoCanApply: 'Ration card holders', whoCanApplyTA: 'ரேஷன் கார்டு வைத்திருப்பவர்கள்',
    requiredDocuments: [
      { id: 'doc-ration', name: 'Existing Ration Card', nameTA: 'ஏற்கனவே உள்ள ரேஷன் கார்டு', description: 'Current ration card', descriptionTA: 'தற்போதைய ரேஷன் கார்டு', mandatory: true, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeMB: 5, digilockerAvailable: false },
      { id: 'doc-aadhaar-new', name: 'New Member Aadhaar', nameTA: 'புதிய உறுப்பினர் ஆதார்', description: 'Aadhaar of new member', descriptionTA: 'புதிய உறுப்பினரின் ஆதார்', mandatory: true, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeMB: 5, digilockerAvailable: true }
    ],
    fee: 0, feeDescription: 'Free', feeDescriptionTA: 'இலவசம்',
    processingTimeDays: 10, processingTimeDescription: '7-10 working days', processingTimeDescriptionTA: '7-10 வேலை நாட்கள்',
    applicationSteps: [
      { step: 1, title: 'Enter Details', titleTA: 'விவரங்களை உள்ளிடு', description: 'Enter new member details', descriptionTA: 'புதிய உறுப்பினர் விவரங்களை உள்ளிடுங்கள்' },
      { step: 2, title: 'Upload Documents', titleTA: 'ஆவணங்களை பதிவேற்றுங்கள்', description: 'Upload documents', descriptionTA: 'ஆவணங்களை பதிவேற்றுங்கள்' },
      { step: 3, title: 'Review & Submit', titleTA: 'மறுஆய்வு & சமர்ப்பி', description: 'Review and submit', descriptionTA: 'மறுஆய்வு செய்து சமர்ப்பிக்கவும்' }
    ],
    faqs: [], workflowId: 'wf-ration-card',
    relatedServiceIds: ['svc-new-ration', 'svc-ration-remove-member'],
    isActive: true, isOnline: true, version: 1, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'svc-ration-remove-member',
    slug: 'ration-card-remove-member',
    name: 'Remove Family Member from Ration Card',
    nameTA: 'ரேஷன் கார்டில் இருந்து குடும்ப உறுப்பினர் நீக்கு',
    shortDescription: 'Remove a family member from your existing ration card',
    shortDescriptionTA: 'உங்கள் ரேஷன் கார்டில் இருந்து குடும்ப உறுப்பினரை நீக்கவும்',
    description: 'Remove a family member from your ration card due to death, marriage, or transfer to another card.',
    descriptionTA: 'இறப்பு, திருமணம் அல்லது வேறு கார்டுக்கு மாற்றம் காரணமாக ரேஷன் கார்டில் இருந்து குடும்ப உறுப்பினரை நீக்கவும்.',
    departmentId: 'dept-civil-supplies', category: 'civil_supplies', implementationMode: 'NATIVE_WORKFLOW',
    eligibility: ['Must have an existing ration card'], eligibilityTA: ['ஏற்கனவே ரேஷன் கார்டு இருக்க வேண்டும்'],
    whoCanApply: 'Ration card holders', whoCanApplyTA: 'ரேஷன் கார்டு வைத்திருப்பவர்கள்',
    requiredDocuments: [
      { id: 'doc-ration', name: 'Existing Ration Card', nameTA: 'ஏற்கனவே உள்ள ரேஷன் கார்டு', description: 'Current ration card', descriptionTA: 'தற்போதைய ரேஷன் கார்டு', mandatory: true, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeMB: 5, digilockerAvailable: false },
      { id: 'doc-reason', name: 'Supporting Document', nameTA: 'துணை ஆவணம்', description: 'Death certificate, marriage cert, etc.', descriptionTA: 'இறப்புச் சான்றிதழ், திருமண சான்றிதழ் போன்றவை', mandatory: true, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeMB: 5, digilockerAvailable: false }
    ],
    fee: 0, feeDescription: 'Free', feeDescriptionTA: 'இலவசம்',
    processingTimeDays: 10, processingTimeDescription: '7-10 working days', processingTimeDescriptionTA: '7-10 வேலை நாட்கள்',
    applicationSteps: [
      { step: 1, title: 'Enter Details', titleTA: 'விவரங்களை உள்ளிடு', description: 'Enter details', descriptionTA: 'விவரங்களை உள்ளிடுங்கள்' },
      { step: 2, title: 'Upload Documents', titleTA: 'ஆவணங்களை பதிவேற்றுங்கள்', description: 'Upload docs', descriptionTA: 'ஆவணங்களை பதிவேற்றுங்கள்' },
      { step: 3, title: 'Review & Submit', titleTA: 'மறுஆய்வு & சமர்ப்பி', description: 'Review & submit', descriptionTA: 'மறுஆய்வு & சமர்ப்பி' }
    ],
    faqs: [], workflowId: 'wf-ration-card',
    relatedServiceIds: ['svc-new-ration', 'svc-ration-add-member'],
    isActive: true, isOnline: true, version: 1, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'svc-ration-address',
    slug: 'ration-card-address-change',
    name: 'Ration Card Address Change',
    nameTA: 'ரேஷன் கார்டு முகவரி மாற்றம்',
    shortDescription: 'Update the address on your existing ration card',
    shortDescriptionTA: 'உங்கள் ரேஷன் கார்டின் முகவரியை புதுப்பிக்கவும்',
    description: 'Apply for address change on your existing ration card when you move to a new residence within Tamil Nadu.',
    descriptionTA: 'தமிழ்நாட்டில் புதிய குடியிருப்புக்கு மாறும்போது உங்கள் ரேஷன் கார்டில் முகவரி மாற்றத்திற்கு விண்ணப்பிக்கவும்.',
    departmentId: 'dept-civil-supplies', category: 'civil_supplies', implementationMode: 'NATIVE_WORKFLOW',
    eligibility: ['Must have an existing ration card', 'Must have moved to a new address within TN'],
    eligibilityTA: ['ஏற்கனவே ரேஷன் கார்டு இருக்க வேண்டும்', 'தமிழ்நாட்டுக்குள் புதிய முகவரிக்கு மாறியிருக்க வேண்டும்'],
    whoCanApply: 'Ration card holders who changed address', whoCanApplyTA: 'முகவரி மாற்றிய ரேஷன் கார்டு வைத்திருப்பவர்கள்',
    requiredDocuments: [
      { id: 'doc-ration', name: 'Existing Ration Card', nameTA: 'ஏற்கனவே உள்ள ரேஷன் கார்டு', description: 'Current ration card', descriptionTA: 'தற்போதைய ரேஷன் கார்டு', mandatory: true, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeMB: 5, digilockerAvailable: false },
      { id: 'doc-new-address', name: 'New Address Proof', nameTA: 'புதிய முகவரி சான்று', description: 'Proof of new address', descriptionTA: 'புதிய முகவரிக்கான சான்று', mandatory: true, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeMB: 5, digilockerAvailable: false }
    ],
    fee: 0, feeDescription: 'Free', feeDescriptionTA: 'இலவசம்',
    processingTimeDays: 10, processingTimeDescription: '7-10 working days', processingTimeDescriptionTA: '7-10 வேலை நாட்கள்',
    applicationSteps: [
      { step: 1, title: 'Enter New Address', titleTA: 'புதிய முகவரியை உள்ளிடு', description: 'Enter new address', descriptionTA: 'புதிய முகவரியை உள்ளிடுங்கள்' },
      { step: 2, title: 'Upload Documents', titleTA: 'ஆவணங்களை பதிவேற்றுங்கள்', description: 'Upload documents', descriptionTA: 'ஆவணங்களை பதிவேற்றுங்கள்' },
      { step: 3, title: 'Review & Submit', titleTA: 'மறுஆய்வு & சமர்ப்பி', description: 'Review & submit', descriptionTA: 'மறுஆய்வு & சமர்ப்பி' }
    ],
    faqs: [], workflowId: 'wf-ration-card',
    relatedServiceIds: ['svc-new-ration', 'svc-ration-add-member'],
    isActive: true, isOnline: true, version: 1, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'svc-ration-duplicate',
    slug: 'duplicate-ration-card',
    name: 'Duplicate Ration Card',
    nameTA: 'நகல் ரேஷன் கார்டு',
    shortDescription: 'Get a duplicate ration card if original is lost or damaged',
    shortDescriptionTA: 'அசல் தொலைந்தால் அல்லது சேதமடைந்தால் நகல் ரேஷன் கார்டு பெறவும்',
    description: 'Apply for a duplicate ration card if your original card is lost, damaged, or stolen.',
    descriptionTA: 'உங்கள் அசல் கார்டு தொலைந்தால், சேதமடைந்தால் அல்லது திருடப்பட்டால் நகல் ரேஷன் கார்டுக்கு விண்ணப்பிக்கவும்.',
    departmentId: 'dept-civil-supplies', category: 'civil_supplies', implementationMode: 'NATIVE_WORKFLOW',
    eligibility: ['Must have had an existing ration card'], eligibilityTA: ['ஏற்கனவே ரேஷன் கார்டு வைத்திருந்திருக்க வேண்டும்'],
    whoCanApply: 'Persons who lost their ration card', whoCanApplyTA: 'ரேஷன் கார்டை இழந்தவர்கள்',
    requiredDocuments: [
      { id: 'doc-aadhaar', name: 'Aadhaar Card', nameTA: 'ஆதார் அட்டை', description: 'Identity proof', descriptionTA: 'அடையாள சான்று', mandatory: true, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeMB: 5, digilockerAvailable: true },
      { id: 'doc-fir', name: 'FIR / Affidavit', nameTA: 'FIR / பிரமாண பத்திரம்', description: 'Police FIR or affidavit for lost card', descriptionTA: 'தொலைந்த கார்டுக்கான போலீஸ் FIR அல்லது பிரமாண பத்திரம்', mandatory: true, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeMB: 5, digilockerAvailable: false }
    ],
    fee: 25, feeDescription: '₹25', feeDescriptionTA: '₹25',
    processingTimeDays: 15, processingTimeDescription: '10-15 working days', processingTimeDescriptionTA: '10-15 வேலை நாட்கள்',
    applicationSteps: [
      { step: 1, title: 'Enter Details', titleTA: 'விவரங்களை உள்ளிடு', description: 'Enter details', descriptionTA: 'விவரங்களை உள்ளிடுங்கள்' },
      { step: 2, title: 'Upload Documents', titleTA: 'ஆவணங்களை பதிவேற்றுங்கள்', description: 'Upload docs', descriptionTA: 'ஆவணங்களை பதிவேற்றுங்கள்' },
      { step: 3, title: 'Review & Submit', titleTA: 'மறுஆய்வு & சமர்ப்பி', description: 'Review & submit', descriptionTA: 'மறுஆய்வு & சமர்ப்பி' }
    ],
    faqs: [], workflowId: 'wf-ration-card',
    relatedServiceIds: ['svc-new-ration'],
    isActive: true, isOnline: true, version: 1, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z'
  },

  // ===================== SOCIAL WELFARE =====================
  {
    id: 'svc-welfare-scheme',
    slug: 'welfare-scheme-application',
    name: 'Welfare Scheme Application',
    nameTA: 'நல திட்ட விண்ணப்பம்',
    shortDescription: 'Apply for social welfare schemes and benefits',
    shortDescriptionTA: 'சமூக நல திட்டங்கள் மற்றும் நலன்களுக்கு விண்ணப்பிக்கவும்',
    description: 'Apply for various social welfare schemes offered by the Tamil Nadu Government for eligible citizens including pension, financial assistance, and other benefits.',
    descriptionTA: 'தமிழ்நாடு அரசு வழங்கும் பல்வேறு சமூக நல திட்டங்களுக்கு விண்ணப்பிக்கவும் — ஓய்வூதியம், நிதி உதவி மற்றும் பிற நலன்கள்.',
    departmentId: 'dept-social-welfare', category: 'social_welfare', implementationMode: 'NATIVE_WORKFLOW',
    eligibility: ['Must meet specific scheme eligibility criteria', 'Must be a resident of Tamil Nadu'],
    eligibilityTA: ['குறிப்பிட்ட திட்ட தகுதி நிபந்தனைகளை பூர்த்தி செய்ய வேண்டும்', 'தமிழ்நாட்டில் வசிப்பவராக இருக்க வேண்டும்'],
    whoCanApply: 'Eligible citizens of Tamil Nadu', whoCanApplyTA: 'தகுதியுள்ள தமிழ்நாடு குடிமக்கள்',
    requiredDocuments: [
      { id: 'doc-aadhaar', name: 'Aadhaar Card', nameTA: 'ஆதார் அட்டை', description: 'Identity proof', descriptionTA: 'அடையாள சான்று', mandatory: true, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeMB: 5, digilockerAvailable: true },
      { id: 'doc-income', name: 'Income Certificate', nameTA: 'வருமான சான்றிதழ்', description: 'Income proof', descriptionTA: 'வருமான சான்று', mandatory: true, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeMB: 5, digilockerAvailable: false },
      { id: 'doc-community', name: 'Community Certificate', nameTA: 'சமூக சான்றிதழ்', description: 'If applicable', descriptionTA: 'பொருந்தினால்', mandatory: false, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeMB: 5, digilockerAvailable: false }
    ],
    fee: 0, feeDescription: 'Free', feeDescriptionTA: 'இலவசம்',
    processingTimeDays: 21, processingTimeDescription: '15-21 working days', processingTimeDescriptionTA: '15-21 வேலை நாட்கள்',
    applicationSteps: [
      { step: 1, title: 'Select Scheme', titleTA: 'திட்டத்தை தேர்ந்தெடு', description: 'Choose scheme', descriptionTA: 'திட்டத்தை தேர்ந்தெடுங்கள்' },
      { step: 2, title: 'Fill Details', titleTA: 'விவரங்களை நிரப்புங்கள்', description: 'Enter details', descriptionTA: 'விவரங்களை உள்ளிடுங்கள்' },
      { step: 3, title: 'Upload Documents', titleTA: 'ஆவணங்களை பதிவேற்றுங்கள்', description: 'Upload docs', descriptionTA: 'ஆவணங்களை பதிவேற்றுங்கள்' },
      { step: 4, title: 'Review & Submit', titleTA: 'மறுஆய்வு & சமர்ப்பி', description: 'Review & submit', descriptionTA: 'மறுஆய்வு & சமர்ப்பி' }
    ],
    faqs: [], workflowId: 'wf-general-cert',
    relatedServiceIds: ['svc-income-cert'],
    isActive: true, isOnline: true, version: 1, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z'
  },

  // ===================== LOCAL GOVERNMENT =====================
  {
    id: 'svc-birth-cert',
    slug: 'birth-certificate',
    name: 'Birth Certificate Request',
    nameTA: 'பிறப்புச் சான்றிதழ் கோரிக்கை',
    shortDescription: 'Request birth certificate from local body records',
    shortDescriptionTA: 'உள்ளாட்சி பதிவுகளிலிருந்து பிறப்புச் சான்றிதழ் கோரிக்கை',
    description: 'Request a birth certificate from the local municipal or panchayat body. Birth certificates are essential for school admission, passport application, and various government services.',
    descriptionTA: 'உள்ளூர் நகராட்சி அல்லது ஊராட்சி அமைப்பிலிருந்து பிறப்புச் சான்றிதழ் கோருங்கள்.',
    departmentId: 'dept-local-govt', category: 'local_government', implementationMode: 'API_INTEGRATED',
    eligibility: ['Birth must have been registered in Tamil Nadu'],
    eligibilityTA: ['பிறப்பு தமிழ்நாட்டில் பதிவு செய்யப்பட்டிருக்க வேண்டும்'],
    whoCanApply: 'The person or their parent/guardian', whoCanApplyTA: 'நபர் அல்லது அவர்களின் பெற்றோர்/பாதுகாவலர்',
    requiredDocuments: [
      { id: 'doc-aadhaar', name: 'Aadhaar Card', nameTA: 'ஆதார் அட்டை', description: 'Identity proof', descriptionTA: 'அடையாள சான்று', mandatory: true, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeMB: 5, digilockerAvailable: true },
      { id: 'doc-hospital', name: 'Hospital Record', nameTA: 'மருத்துவமனை பதிவு', description: 'Hospital discharge summary or birth record', descriptionTA: 'மருத்துவமனை வெளியேற்ற சுருக்கம்', mandatory: false, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeMB: 5, digilockerAvailable: false }
    ],
    fee: 50, feeDescription: '₹50', feeDescriptionTA: '₹50',
    processingTimeDays: 7, processingTimeDescription: '5-7 working days', processingTimeDescriptionTA: '5-7 வேலை நாட்கள்',
    applicationSteps: [
      { step: 1, title: 'Enter Birth Details', titleTA: 'பிறப்பு விவரங்களை உள்ளிடு', description: 'Enter birth details', descriptionTA: 'பிறப்பு விவரங்களை உள்ளிடுங்கள்' },
      { step: 2, title: 'Upload Documents', titleTA: 'ஆவணங்களை பதிவேற்றுங்கள்', description: 'Upload docs', descriptionTA: 'ஆவணங்களை பதிவேற்றுங்கள்' },
      { step: 3, title: 'Review & Submit', titleTA: 'மறுஆய்வு & சமர்ப்பி', description: 'Review & submit', descriptionTA: 'மறுஆய்வு & சமர்ப்பி' }
    ],
    faqs: [], workflowId: 'wf-general-cert',
    relatedServiceIds: ['svc-death-cert'],
    isActive: true, isOnline: true, version: 1, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'svc-death-cert',
    slug: 'death-certificate',
    name: 'Death Certificate Request',
    nameTA: 'இறப்புச் சான்றிதழ் கோரிக்கை',
    shortDescription: 'Request death certificate from local body records',
    shortDescriptionTA: 'உள்ளாட்சி பதிவுகளிலிருந்து இறப்புச் சான்றிதழ் கோரிக்கை',
    description: 'Request a death certificate from the local municipal or panchayat body.',
    descriptionTA: 'உள்ளூர் நகராட்சி அல்லது ஊராட்சி அமைப்பிலிருந்து இறப்புச் சான்றிதழ் கோருங்கள்.',
    departmentId: 'dept-local-govt', category: 'local_government', implementationMode: 'API_INTEGRATED',
    eligibility: ['Death must have been registered'], eligibilityTA: ['இறப்பு பதிவு செய்யப்பட்டிருக்க வேண்டும்'],
    whoCanApply: 'Next of kin or authorized person', whoCanApplyTA: 'உறவினர் அல்லது அங்கீகரிக்கப்பட்ட நபர்',
    requiredDocuments: [
      { id: 'doc-aadhaar', name: 'Applicant Aadhaar', nameTA: 'விண்ணப்பதாரரின் ஆதார்', description: 'Applicant identity proof', descriptionTA: 'விண்ணப்பதாரர் அடையாள சான்று', mandatory: true, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeMB: 5, digilockerAvailable: true }
    ],
    fee: 50, feeDescription: '₹50', feeDescriptionTA: '₹50',
    processingTimeDays: 7, processingTimeDescription: '5-7 working days', processingTimeDescriptionTA: '5-7 வேலை நாட்கள்',
    applicationSteps: [
      { step: 1, title: 'Enter Details', titleTA: 'விவரங்களை உள்ளிடு', description: 'Enter death details', descriptionTA: 'இறப்பு விவரங்களை உள்ளிடுங்கள்' },
      { step: 2, title: 'Upload Documents', titleTA: 'ஆவணங்களை பதிவேற்றுங்கள்', description: 'Upload docs', descriptionTA: 'ஆவணங்களை பதிவேற்றுங்கள்' },
      { step: 3, title: 'Review & Submit', titleTA: 'மறுஆய்வு & சமர்ப்பி', description: 'Review & submit', descriptionTA: 'மறுஆய்வு & சமர்ப்பி' }
    ],
    faqs: [], workflowId: 'wf-general-cert',
    relatedServiceIds: ['svc-birth-cert'],
    isActive: true, isOnline: true, version: 1, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z'
  },

  // ===================== HEALTH =====================
  {
    id: 'svc-health-scheme',
    slug: 'health-scheme-enrollment',
    name: 'Health Scheme Enrollment',
    nameTA: 'சுகாதார திட்டப்பதிவு',
    shortDescription: 'Enroll in Tamil Nadu government health insurance scheme',
    shortDescriptionTA: 'தமிழ்நாடு அரசு சுகாதார காப்பீட்டு திட்டத்தில் பதிவு செய்யுங்கள்',
    description: 'Enroll in the Chief Minister\'s Comprehensive Health Insurance Scheme (CMCHIS) for cashless medical treatment at empanelled hospitals.',
    descriptionTA: 'பட்டியலிடப்பட்ட மருத்துவமனைகளில் பணமில்லா மருத்துவ சிகிச்சைக்கு முதலமைச்சர் விரிவான சுகாதார காப்பீட்டு திட்டத்தில் (CMCHIS) பதிவு செய்யுங்கள்.',
    departmentId: 'dept-health', category: 'health', implementationMode: 'NATIVE_WORKFLOW',
    eligibility: ['Must be a resident of Tamil Nadu', 'Must have valid ration card', 'Annual family income below ₹1.2 lakh'],
    eligibilityTA: ['தமிழ்நாட்டில் வசிப்பவராக இருக்க வேண்டும்', 'செல்லுபடியான ரேஷன் கார்டு இருக்க வேண்டும்', 'ஆண்டு குடும்ப வருமானம் ₹1.2 லட்சத்திற்கு கீழ்'],
    whoCanApply: 'Tamil Nadu residents with ration card', whoCanApplyTA: 'ரேஷன் கார்டு கொண்ட தமிழ்நாடு குடியிருப்பாளர்கள்',
    requiredDocuments: [
      { id: 'doc-aadhaar', name: 'Aadhaar Card', nameTA: 'ஆதார் அட்டை', description: 'Identity proof', descriptionTA: 'அடையாள சான்று', mandatory: true, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeMB: 5, digilockerAvailable: true },
      { id: 'doc-ration', name: 'Ration Card', nameTA: 'ரேஷன் கார்டு', description: 'Ration card', descriptionTA: 'ரேஷன் கார்டு', mandatory: true, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeMB: 5, digilockerAvailable: false }
    ],
    fee: 0, feeDescription: 'Free', feeDescriptionTA: 'இலவசம்',
    processingTimeDays: 14, processingTimeDescription: '10-14 working days', processingTimeDescriptionTA: '10-14 வேலை நாட்கள்',
    applicationSteps: [
      { step: 1, title: 'Check Eligibility', titleTA: 'தகுதியை சரிபார்', description: 'Verify eligibility', descriptionTA: 'தகுதியை சரிபார்க்கவும்' },
      { step: 2, title: 'Fill Details', titleTA: 'விவரங்களை நிரப்புங்கள்', description: 'Enter details', descriptionTA: 'விவரங்களை உள்ளிடுங்கள்' },
      { step: 3, title: 'Upload Documents', titleTA: 'ஆவணங்களை பதிவேற்றுங்கள்', description: 'Upload docs', descriptionTA: 'ஆவணங்களை பதிவேற்றுங்கள்' },
      { step: 4, title: 'Review & Submit', titleTA: 'மறுஆய்வு & சமர்ப்பி', description: 'Review & submit', descriptionTA: 'மறுஆய்வு & சமர்ப்பி' }
    ],
    faqs: [], workflowId: 'wf-general-cert',
    relatedServiceIds: [],
    isActive: true, isOnline: true, version: 1, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z'
  },

  // ===================== EXTERNAL REDIRECT SERVICES =====================
  {
    id: 'svc-drug-licence',
    slug: 'drug-licence',
    name: 'Drug Licence Information',
    nameTA: 'மருந்து உரிம தகவல்',
    shortDescription: 'Drug licence applications via Drugs Control Department portal',
    shortDescriptionTA: 'மருந்து கட்டுப்பாட்டு துறை போர்டல் வழியாக மருந்து உரிம விண்ணப்பங்கள்',
    description: 'Drug licence applications are currently processed through the Drugs Control Department\'s dedicated portal. You will be redirected to their website to complete the application.',
    descriptionTA: 'மருந்து உரிம விண்ணப்பங்கள் தற்போது மருந்து கட்டுப்பாட்டு துறையின் போர்டல் வழியாக செயலாக்கப்படுகின்றன.',
    departmentId: 'dept-drugs-control', category: 'licences', implementationMode: 'EXTERNAL_REDIRECT',
    eligibility: ['Must meet Drugs & Cosmetics Act requirements'],
    eligibilityTA: ['மருந்து மற்றும் அழகுசாதனப் பொருட்கள் சட்ட தேவைகளை பூர்த்தி செய்ய வேண்டும்'],
    whoCanApply: 'Pharmacists and drug establishments', whoCanApplyTA: 'மருந்தாளர்கள் மற்றும் மருந்து நிறுவனங்கள்',
    requiredDocuments: [],
    fee: 0, feeDescription: 'Varies by licence type', feeDescriptionTA: 'உரிம வகையைப் பொறுத்து மாறுபடும்',
    processingTimeDays: 30, processingTimeDescription: 'Varies', processingTimeDescriptionTA: 'மாறுபடும்',
    applicationSteps: [],
    faqs: [],
    externalUrl: 'https://www.tndrugscontrol.tn.gov.in',
    externalDepartmentName: 'Drugs Control Department',
    relatedServiceIds: [],
    isActive: true, isOnline: true, version: 1, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'svc-e-adangal',
    slug: 'e-adangal-extract',
    name: 'e-Adangal Extract',
    nameTA: 'இ-அடங்கல் சாறு',
    shortDescription: 'Official Land Crop & Cultivation Register extract',
    shortDescriptionTA: 'அதிகாரப்பூர்வ நில பயிர் மற்றும் சாகுபடி பதிவு சாறு',
    description: 'An e-Adangal Extract is an official document issued by the Revenue Department of Tamil Nadu that lists crop and land cultivation details for a survey number, including pattadar name, crop season, area extent, and soil classification.',
    descriptionTA: 'இ-அடங்கல் சாறு என்பது ஒரு நிலத்தின் பயிர் மற்றும் சாகுபடி விவரங்களை சான்றளிக்கும் ஆவணமாகும்.',
    departmentId: 'dept-revenue',
    category: 'revenue',
    implementationMode: 'NATIVE_WORKFLOW',
    eligibility: [
      'Must be the land owner (pattadar) or authorized cultivator',
      'Must provide valid survey number and sub-division details in Tamil Nadu'
    ],
    eligibilityTA: [
      'நில உரிமையாளர் (பட்டாதாரர்) அல்லது அங்கீகரிக்கப்பட்ட சாகுபடியாளராக இருக்க வேண்டும்',
      'தமிழ்நாட்டில் செல்லுபடியான சர்வே எண் மற்றும் உட்பிரிவு விவரங்களை வழங்க வேண்டும்'
    ],
    whoCanApply: 'Any land owner or cultivator in Tamil Nadu',
    whoCanApplyTA: 'தமிழ்நாட்டில் உள்ள எந்தவொரு நில உரிமையாளர் அல்லது சாகுபடியாளர்',
    requiredDocuments: [
      { id: 'doc-aadhaar', name: 'Aadhaar Card', nameTA: 'ஆதார் அட்டை', description: 'Identity proof', descriptionTA: 'அடையாள சான்று', mandatory: true, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeMB: 5, digilockerAvailable: true },
      { id: 'doc-patta', name: 'Patta / Land Deed', nameTA: 'பட்டா / நிலப் பத்திரம்', description: 'Proof of land ownership', descriptionTA: 'நில உரிமைக்கான சான்று', mandatory: true, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeMB: 5, digilockerAvailable: false }
    ],
    fee: 0,
    feeDescription: 'Free of charge',
    feeDescriptionTA: 'கட்டணமின்றி',
    processingTimeDays: 2,
    processingTimeDescription: '1-2 working days',
    processingTimeDescriptionTA: '1-2 வேலை நாட்கள்',
    applicationSteps: [
      { step: 1, title: 'Check Eligibility', titleTA: 'தகுதியை சரிபார்', description: 'Verify eligibility criteria', descriptionTA: 'தகுதி நிபந்தனைகளை சரிபார்க்கவும்' },
      { step: 2, title: 'Select District & Land details', titleTA: 'மாவட்டம் & நில விவரங்களை தேர்ந்தெடு', description: 'Enter district, taluk, village and survey number', descriptionTA: 'மாவட்டம், வட்டம், கிராமம் மற்றும் சர்வே எண்ணை உள்ளிடவும்' },
      { step: 3, title: 'Upload Land Ownership Proof', titleTA: 'நில உரிமை சான்றை பதிவேற்றுக', description: 'Upload Patta/Land deed', descriptionTA: 'பட்டா அல்லது நில பத்திரத்தை பதிவேற்றவும்' },
      { step: 4, title: 'Review & Download', titleTA: 'மறுஆய்வு & பதிவிறக்கம்', description: 'Verify details and download e-Adangal', descriptionTA: 'விவரங்களை சரிபார்த்து இ-அடங்கலை பதிவிறக்கவும்' }
    ],
    faqs: [],
    workflowId: 'wf-general-cert',
    relatedServiceIds: ['svc-income-cert', 'svc-community-cert'],
    isActive: true,
    isOnline: true,
    version: 1,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z'
  },
  // ===================== TRANSPORT DEPARTMENT =====================
  {
    id: 'svc-tnstc-booking',
    slug: 'tnstc-bus-booking',
    name: 'TNSTC Bus Booking',
    nameTA: 'டிஎன்எஸ்டிசி பேருந்து முன்பதிவு',
    shortDescription: 'Book TNSTC government buses online via TNSTC portal',
    shortDescriptionTA: 'TNSTC போர்ட்டல் வழியாக அரசு பேருந்துகளை ஆன்லைனில் முன்பதிவு செய்யுங்கள்',
    description: 'Book tickets for Tamil Nadu State Transport Corporation (TNSTC) and State Express Transport Corporation (SETC) buses online. This service redirects you to the official TNSTC backend for live seat availability, booking, and cancellation.',
    descriptionTA: 'தமிழ்நாடு அரசுப் போக்குவரத்துக் கழகம் (TNSTC) மற்றும் விரைவுப் போக்குவரத்துக் கழக (SETC) பேருந்துகளுக்கான பயணச்சீட்டுகளை ஆன்லைனில் முன்பதிவு செய்யுங்கள். இந்த சேவை அதிகாரப்பூர்வ TNSTC இணையதளத்திற்கு உங்களை அழைத்துச் செல்லும்.',
    departmentId: 'dept-transport',
    category: 'transport',
    implementationMode: 'EXTERNAL_REDIRECT',
    eligibility: [
      'Open to all citizens for travel booking'
    ],
    eligibilityTA: [
      'பயண முன்பதிவு செய்ய அனைத்து குடிமக்களுக்கும் திறக்கப்பட்டுள்ளது'
    ],
    whoCanApply: 'Any individual planning to travel on TNSTC/SETC buses',
    whoCanApplyTA: 'TNSTC/SETC பேருந்துகளில் பயணிக்க திட்டமிட்டுள்ள எந்தவொரு தனிநபரும்',
    requiredDocuments: [],
    fee: 0,
    feeDescription: 'As per ticket fare',
    feeDescriptionTA: 'பயணச்சீட்டு கட்டணத்தின்படி',
    processingTimeDays: 0,
    processingTimeDescription: 'Instant Booking',
    processingTimeDescriptionTA: 'உடனடி முன்பதிவு',
    applicationSteps: [
      { step: 1, title: 'Search Route', titleTA: 'வழித்தடத்தை தேடுங்கள்', description: 'Enter source, destination and date', descriptionTA: 'புறப்படும் இடம், சேரும் இடம் மற்றும் தேதியை உள்ளிடுங்கள்' },
      { step: 2, title: 'Select Bus & Seats', titleTA: 'பேருந்து மற்றும் இருக்கைகளைத் தேர்ந்தெடுங்கள்', description: 'Choose your preferred bus and select seats', descriptionTA: 'உங்களுக்கு விருப்பமான பேருந்தைத் தேர்ந்தெடுத்து இருக்கைகளைத் தேர்ந்தெடுக்கவும்' },
      { step: 3, title: 'Payment', titleTA: 'கட்டணம் செலுத்துதல்', description: 'Pay the ticket fare online', descriptionTA: 'பயணச்சீட்டு கட்டணத்தை ஆன்லைனில் செலுத்துங்கள்' }
    ],
    faqs: [
      { question: 'Can I cancel my bus ticket online?', questionTA: 'ஆன்லைனில் பஸ் டிக்கெட்டை ரத்து செய்ய முடியுமா?', answer: 'Yes, tickets booked online can be cancelled through the TNSTC portal.', answerTA: 'ஆம், ஆன்லைனில் முன்பதிவு செய்த டிக்கெட்டுகளை TNSTC போர்டல் மூலம் ரத்து செய்யலாம்.' }
    ],
    externalUrl: 'https://vazhi-cyan.vercel.app/',
    externalDepartmentName: 'Tamil Nadu State Transport Corporation',
    relatedServiceIds: [],
    isActive: true,
    isOnline: true,
    version: 1,
    createdAt: '2026-08-25T00:00:00Z',
    updatedAt: '2026-08-25T00:00:00Z'
  }
];

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find(s => s.slug === slug);
}

export function getServiceById(id: string): Service | undefined {
  return services.find(s => s.id === id);
}

export function getServicesByDepartment(deptId: string): Service[] {
  return services.filter(s => s.departmentId === deptId);
}

export function getServicesByCategory(category: string): Service[] {
  return services.filter(s => s.category === category);
}

export function searchServices(query: string): Service[] {
  const q = query.toLowerCase();
  return services.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.nameTA.includes(query) ||
    s.shortDescription.toLowerCase().includes(q) ||
    s.shortDescriptionTA.includes(query) ||
    s.category.includes(q)
  );
}

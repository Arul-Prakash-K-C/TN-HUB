export const workflows = [
    {
        id: 'wf-income-cert',
        serviceId: 'svc-income-cert',
        name: 'Income Certificate Workflow',
        nameTA: 'வருமான சான்றிதழ் பணிப்பாய்வு',
        version: 1,
        states: [
            { id: 'DRAFT', name: 'Draft', nameTA: 'வரைவு', description: 'Application saved as draft', descriptionTA: 'விண்ணப்பம் வரைவாக சேமிக்கப்பட்டது', type: 'initial', assigneeRole: 'citizen' },
            { id: 'SUBMITTED', name: 'Submitted', nameTA: 'சமர்ப்பிக்கப்பட்டது', description: 'Application submitted', descriptionTA: 'விண்ணப்பம் சமர்ப்பிக்கப்பட்டது', type: 'intermediate', assigneeRole: 'system' },
            { id: 'DOCUMENT_VERIFICATION', name: 'Document Verification', nameTA: 'ஆவண சரிபார்ப்பு', description: 'Documents being verified', descriptionTA: 'ஆவணங்கள் சரிபார்க்கப்படுகின்றன', type: 'intermediate', assigneeRole: 'officer', slaHours: 48 },
            { id: 'OFFICER_REVIEW', name: 'Officer Review', nameTA: 'அலுவலர் மறுஆய்வு', description: 'Under officer review', descriptionTA: 'அலுவலர் மறுஆய்வில் உள்ளது', type: 'intermediate', assigneeRole: 'officer', slaHours: 72 },
            { id: 'FIELD_VERIFICATION', name: 'Field Verification', nameTA: 'கள சரிபார்ப்பு', description: 'Field verification in progress', descriptionTA: 'கள சரிபார்ப்பு நடைபெறுகிறது', type: 'intermediate', assigneeRole: 'officer', slaHours: 96 },
            { id: 'APPROVAL', name: 'Pending Approval', nameTA: 'ஒப்புதலுக்கு நிலுவையில்', description: 'Pending final approval', descriptionTA: 'இறுதி ஒப்புதலுக்கு நிலுவையில்', type: 'intermediate', assigneeRole: 'officer', slaHours: 48 },
            { id: 'APPROVED', name: 'Approved', nameTA: 'ஒப்புதல் அளிக்கப்பட்டது', description: 'Application approved', descriptionTA: 'விண்ணப்பம் ஒப்புதல் அளிக்கப்பட்டது', type: 'intermediate', assigneeRole: 'system' },
            { id: 'CERTIFICATE_GENERATED', name: 'Certificate Generated', nameTA: 'சான்றிதழ் உருவாக்கப்பட்டது', description: 'Certificate generated', descriptionTA: 'சான்றிதழ் உருவாக்கப்பட்டது', type: 'intermediate', assigneeRole: 'system' },
            { id: 'COMPLETED', name: 'Completed', nameTA: 'நிறைவடைந்தது', description: 'Process completed', descriptionTA: 'செயல்முறை நிறைவடைந்தது', type: 'terminal' },
            { id: 'REJECTED', name: 'Rejected', nameTA: 'நிராகரிக்கப்பட்டது', description: 'Application rejected', descriptionTA: 'விண்ணப்பம் நிராகரிக்கப்பட்டது', type: 'terminal' },
            { id: 'CLARIFICATION_REQUESTED', name: 'Clarification Requested', nameTA: 'விளக்கம் கோரப்பட்டது', description: 'Additional info requested', descriptionTA: 'கூடுதல் தகவல் கோரப்பட்டது', type: 'intermediate', assigneeRole: 'citizen' }
        ],
        transitions: [
            { id: 't1', fromState: 'DRAFT', toState: 'SUBMITTED', action: 'Submit Application', actionTA: 'விண்ணப்பத்தை சமர்ப்பி', requiredRole: 'citizen' },
            { id: 't2', fromState: 'SUBMITTED', toState: 'DOCUMENT_VERIFICATION', action: 'Start Verification', actionTA: 'சரிபார்ப்பைத் தொடங்கு', requiredRole: 'system', autoTransition: true },
            { id: 't3', fromState: 'DOCUMENT_VERIFICATION', toState: 'OFFICER_REVIEW', action: 'Documents Verified', actionTA: 'ஆவணங்கள் சரிபார்க்கப்பட்டன', requiredRole: 'officer' },
            { id: 't4', fromState: 'DOCUMENT_VERIFICATION', toState: 'CLARIFICATION_REQUESTED', action: 'Request Clarification', actionTA: 'விளக்கம் கோரு', requiredRole: 'officer', requiresReason: true },
            { id: 't5', fromState: 'OFFICER_REVIEW', toState: 'FIELD_VERIFICATION', action: 'Send for Field Verification', actionTA: 'கள சரிபார்ப்புக்கு அனுப்பு', requiredRole: 'officer' },
            { id: 't6', fromState: 'FIELD_VERIFICATION', toState: 'APPROVAL', action: 'Field Verified', actionTA: 'கள சரிபார்ப்பு முடிந்தது', requiredRole: 'officer' },
            { id: 't7', fromState: 'APPROVAL', toState: 'APPROVED', action: 'Approve', actionTA: 'ஒப்புதல்', requiredRole: 'officer' },
            { id: 't8', fromState: 'APPROVAL', toState: 'REJECTED', action: 'Reject', actionTA: 'நிராகரி', requiredRole: 'officer', requiresReason: true },
            { id: 't9', fromState: 'APPROVED', toState: 'CERTIFICATE_GENERATED', action: 'Generate Certificate', actionTA: 'சான்றிதழை உருவாக்கு', requiredRole: 'system', autoTransition: true },
            { id: 't10', fromState: 'CERTIFICATE_GENERATED', toState: 'COMPLETED', action: 'Complete', actionTA: 'நிறைவு', requiredRole: 'system', autoTransition: true },
            { id: 't11', fromState: 'CLARIFICATION_REQUESTED', toState: 'DOCUMENT_VERIFICATION', action: 'Provide Clarification', actionTA: 'விளக்கம் அளி', requiredRole: 'citizen' },
            { id: 't12', fromState: 'OFFICER_REVIEW', toState: 'REJECTED', action: 'Reject', actionTA: 'நிராகரி', requiredRole: 'officer', requiresReason: true }
        ],
        initialState: 'DRAFT',
        terminalStates: ['COMPLETED', 'REJECTED'],
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-08-01T00:00:00Z'
    },
    {
        id: 'wf-general-cert',
        serviceId: 'general',
        name: 'General Certificate Workflow',
        nameTA: 'பொது சான்றிதழ் பணிப்பாய்வு',
        version: 1,
        states: [
            { id: 'DRAFT', name: 'Draft', nameTA: 'வரைவு', description: 'Draft', descriptionTA: 'வரைவு', type: 'initial', assigneeRole: 'citizen' },
            { id: 'SUBMITTED', name: 'Submitted', nameTA: 'சமர்ப்பிக்கப்பட்டது', description: 'Submitted', descriptionTA: 'சமர்ப்பிக்கப்பட்டது', type: 'intermediate', assigneeRole: 'system' },
            { id: 'DOCUMENT_VERIFICATION', name: 'Document Verification', nameTA: 'ஆவண சரிபார்ப்பு', description: 'Docs being verified', descriptionTA: 'ஆவணங்கள் சரிபார்க்கப்படுகின்றன', type: 'intermediate', assigneeRole: 'officer', slaHours: 48 },
            { id: 'OFFICER_REVIEW', name: 'Officer Review', nameTA: 'அலுவலர் மறுஆய்வு', description: 'Under review', descriptionTA: 'மறுஆய்வில்', type: 'intermediate', assigneeRole: 'officer', slaHours: 72 },
            { id: 'APPROVED', name: 'Approved', nameTA: 'ஒப்புதல்', description: 'Approved', descriptionTA: 'ஒப்புதல்', type: 'intermediate', assigneeRole: 'system' },
            { id: 'CERTIFICATE_GENERATED', name: 'Certificate Generated', nameTA: 'சான்றிதழ் உருவாக்கப்பட்டது', description: 'Generated', descriptionTA: 'உருவாக்கப்பட்டது', type: 'intermediate', assigneeRole: 'system' },
            { id: 'COMPLETED', name: 'Completed', nameTA: 'நிறைவு', description: 'Complete', descriptionTA: 'நிறைவு', type: 'terminal' },
            { id: 'REJECTED', name: 'Rejected', nameTA: 'நிராகரிப்பு', description: 'Rejected', descriptionTA: 'நிராகரிப்பு', type: 'terminal' },
            { id: 'CLARIFICATION_REQUESTED', name: 'Clarification', nameTA: 'விளக்கம்', description: 'Info requested', descriptionTA: 'தகவல் கோரப்பட்டது', type: 'intermediate', assigneeRole: 'citizen' }
        ],
        transitions: [
            { id: 't1', fromState: 'DRAFT', toState: 'SUBMITTED', action: 'Submit', actionTA: 'சமர்ப்பி', requiredRole: 'citizen' },
            { id: 't2', fromState: 'SUBMITTED', toState: 'DOCUMENT_VERIFICATION', action: 'Start', actionTA: 'தொடங்கு', requiredRole: 'system', autoTransition: true },
            { id: 't3', fromState: 'DOCUMENT_VERIFICATION', toState: 'OFFICER_REVIEW', action: 'Verify', actionTA: 'சரிபார்', requiredRole: 'officer' },
            { id: 't4', fromState: 'OFFICER_REVIEW', toState: 'APPROVED', action: 'Approve', actionTA: 'ஒப்புதல்', requiredRole: 'officer' },
            { id: 't5', fromState: 'OFFICER_REVIEW', toState: 'REJECTED', action: 'Reject', actionTA: 'நிராகரி', requiredRole: 'officer', requiresReason: true },
            { id: 't6', fromState: 'APPROVED', toState: 'CERTIFICATE_GENERATED', action: 'Generate', actionTA: 'உருவாக்கு', requiredRole: 'system', autoTransition: true },
            { id: 't7', fromState: 'CERTIFICATE_GENERATED', toState: 'COMPLETED', action: 'Complete', actionTA: 'நிறைவு', requiredRole: 'system', autoTransition: true },
            { id: 't8', fromState: 'DOCUMENT_VERIFICATION', toState: 'CLARIFICATION_REQUESTED', action: 'Request Info', actionTA: 'தகவல் கோரு', requiredRole: 'officer' },
            { id: 't9', fromState: 'CLARIFICATION_REQUESTED', toState: 'DOCUMENT_VERIFICATION', action: 'Respond', actionTA: 'பதில்', requiredRole: 'citizen' }
        ],
        initialState: 'DRAFT',
        terminalStates: ['COMPLETED', 'REJECTED'],
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-08-01T00:00:00Z'
    },
    {
        id: 'wf-ration-card',
        serviceId: 'ration-card',
        name: 'Ration Card Workflow',
        nameTA: 'ரேஷன் கார்டு பணிப்பாய்வு',
        version: 1,
        states: [
            { id: 'DRAFT', name: 'Draft', nameTA: 'வரைவு', description: 'Draft', descriptionTA: 'வரைவு', type: 'initial', assigneeRole: 'citizen' },
            { id: 'SUBMITTED', name: 'Submitted', nameTA: 'சமர்ப்பிக்கப்பட்டது', description: 'Submitted', descriptionTA: 'சமர்ப்பிக்கப்பட்டது', type: 'intermediate', assigneeRole: 'system' },
            { id: 'DOCUMENT_VERIFICATION', name: 'Document Verification', nameTA: 'ஆவண சரிபார்ப்பு', description: 'Docs being verified', descriptionTA: 'ஆவணங்கள் சரிபார்க்கப்படுகின்றன', type: 'intermediate', assigneeRole: 'officer', slaHours: 48 },
            { id: 'FAMILY_VERIFICATION', name: 'Family Verification', nameTA: 'குடும்ப சரிபார்ப்பு', description: 'Family details being verified', descriptionTA: 'குடும்ப விவரங்கள் சரிபார்க்கப்படுகின்றன', type: 'intermediate', assigneeRole: 'officer', slaHours: 72 },
            { id: 'OFFICER_REVIEW', name: 'Officer Review', nameTA: 'அலுவலர் மறுஆய்வு', description: 'Under review', descriptionTA: 'மறுஆய்வில்', type: 'intermediate', assigneeRole: 'officer', slaHours: 72 },
            { id: 'APPROVED', name: 'Approved', nameTA: 'ஒப்புதல்', description: 'Approved', descriptionTA: 'ஒப்புதல்', type: 'intermediate', assigneeRole: 'system' },
            { id: 'CARD_GENERATED', name: 'Card Generated', nameTA: 'அட்டை உருவாக்கப்பட்டது', description: 'Card generated', descriptionTA: 'அட்டை உருவாக்கப்பட்டது', type: 'intermediate', assigneeRole: 'system' },
            { id: 'COMPLETED', name: 'Completed', nameTA: 'நிறைவு', description: 'Complete', descriptionTA: 'நிறைவு', type: 'terminal' },
            { id: 'REJECTED', name: 'Rejected', nameTA: 'நிராகரிப்பு', description: 'Rejected', descriptionTA: 'நிராகரிப்பு', type: 'terminal' }
        ],
        transitions: [
            { id: 't1', fromState: 'DRAFT', toState: 'SUBMITTED', action: 'Submit', actionTA: 'சமர்ப்பி', requiredRole: 'citizen' },
            { id: 't2', fromState: 'SUBMITTED', toState: 'DOCUMENT_VERIFICATION', action: 'Start', actionTA: 'தொடங்கு', requiredRole: 'system', autoTransition: true },
            { id: 't3', fromState: 'DOCUMENT_VERIFICATION', toState: 'FAMILY_VERIFICATION', action: 'Verify Docs', actionTA: 'ஆவணங்களை சரிபார்', requiredRole: 'officer' },
            { id: 't4', fromState: 'FAMILY_VERIFICATION', toState: 'OFFICER_REVIEW', action: 'Family Verified', actionTA: 'குடும்பம் சரிபார்க்கப்பட்டது', requiredRole: 'officer' },
            { id: 't5', fromState: 'OFFICER_REVIEW', toState: 'APPROVED', action: 'Approve', actionTA: 'ஒப்புதல்', requiredRole: 'officer' },
            { id: 't6', fromState: 'OFFICER_REVIEW', toState: 'REJECTED', action: 'Reject', actionTA: 'நிராகரி', requiredRole: 'officer', requiresReason: true },
            { id: 't7', fromState: 'APPROVED', toState: 'CARD_GENERATED', action: 'Generate Card', actionTA: 'அட்டையை உருவாக்கு', requiredRole: 'system', autoTransition: true },
            { id: 't8', fromState: 'CARD_GENERATED', toState: 'COMPLETED', action: 'Complete', actionTA: 'நிறைவு', requiredRole: 'system', autoTransition: true }
        ],
        initialState: 'DRAFT',
        terminalStates: ['COMPLETED', 'REJECTED'],
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-08-01T00:00:00Z'
    }
];
export function getWorkflowById(id) {
    return workflows.find(w => w.id === id);
}
export function getWorkflowByServiceId(serviceId) {
    return workflows.find(w => w.serviceId === serviceId) || workflows.find(w => w.id === 'wf-general-cert');
}

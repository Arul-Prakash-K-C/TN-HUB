export const mockComplaints = [
    {
        id: 'comp-001',
        complaintNumber: 'GRV-2026-284519',
        citizenId: 'citizen-001',
        citizenName: 'Meena Lakshmi',
        category: 'service_delay',
        subject: 'Delay in Residence Certificate processing',
        description: 'I applied for a Residence Certificate on July 15, 2026. It has been over a month and the application is still pending. The expected processing time was 7 working days.',
        relatedServiceId: 'svc-residence-cert',
        relatedDepartmentId: 'dept-revenue',
        location: 'Chennai, Anna Nagar',
        attachments: [],
        status: 'ASSIGNED',
        assignedOfficerId: 'officer-001',
        assignedOfficerName: 'Rajesh Kumar',
        history: [
            { id: 'ch1', status: 'SUBMITTED', timestamp: '2026-08-15T10:00:00Z', description: 'Complaint submitted', descriptionTA: 'புகார் சமர்ப்பிக்கப்பட்டது', actorId: 'citizen-001', actorName: 'Meena Lakshmi' },
            { id: 'ch2', status: 'CLASSIFIED', timestamp: '2026-08-15T11:00:00Z', description: 'Classified as service delay', descriptionTA: 'சேவை தாமதம் என வகைப்படுத்தப்பட்டது', actorId: 'system', actorName: 'System' },
            { id: 'ch3', status: 'ASSIGNED', timestamp: '2026-08-16T09:00:00Z', description: 'Assigned to Revenue Inspector', descriptionTA: 'வருவாய் ஆய்வாளருக்கு ஒதுக்கப்பட்டது', actorId: 'system', actorName: 'System' }
        ],
        createdAt: '2026-08-15T10:00:00Z',
        updatedAt: '2026-08-16T09:00:00Z'
    }
];
export function getComplaintsByUser(userId) {
    return mockComplaints.filter(c => c.citizenId === userId);
}
export function getComplaintById(id) {
    return mockComplaints.find(c => c.id === id || c.complaintNumber === id);
}

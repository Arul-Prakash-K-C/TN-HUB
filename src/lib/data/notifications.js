export const mockNotifications = [
    {
        id: 'notif-001',
        userId: 'citizen-001',
        type: 'application_submitted',
        title: 'Application Submitted',
        titleTA: 'à®µà®¿à®£à¯à®£à®ªà¯à®ªà®®à¯ à®šà®®à®°à¯à®ªà¯à®ªà®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯',
        message: 'Your Income Certificate application (TNH-2026-784521) has been submitted successfully.',
        messageTA: 'à®‰à®™à¯à®•à®³à¯ à®µà®°à¯à®®à®¾à®© à®šà®¾à®©à¯à®±à®¿à®¤à®´à¯ à®µà®¿à®£à¯à®£à®ªà¯à®ªà®®à¯ (TNH-2026-784521) à®µà¯†à®±à¯à®±à®¿à®•à®°à®®à®¾à®• à®šà®®à®°à¯à®ªà¯à®ªà®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯.',
        isRead: true,
        channel: 'in_app',
        relatedEntityId: 'app-001',
        relatedEntityType: 'application',
        actionUrl: '/applications/app-001',
        createdAt: '2026-08-10T10:20:00Z',
        readAt: '2026-08-10T10:25:00Z'
    },
    {
        id: 'notif-002',
        userId: 'citizen-001',
        type: 'document_verified',
        title: 'Documents Verified',
        titleTA: 'à®†à®µà®£à®™à¯à®•à®³à¯ à®šà®°à®¿à®ªà®¾à®°à¯à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®©',
        message: 'Your documents for Income Certificate (TNH-2026-784521) have been verified.',
        messageTA: 'à®‰à®™à¯à®•à®³à¯ à®µà®°à¯à®®à®¾à®© à®šà®¾à®©à¯à®±à®¿à®¤à®´à¯à®•à¯à®•à®¾à®© à®†à®µà®£à®™à¯à®•à®³à¯ (TNH-2026-784521) à®šà®°à®¿à®ªà®¾à®°à¯à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®©.',
        isRead: false,
        channel: 'in_app',
        relatedEntityId: 'app-001',
        relatedEntityType: 'application',
        actionUrl: '/applications/app-001',
        createdAt: '2026-08-12T14:30:00Z'
    },
    {
        id: 'notif-003',
        userId: 'citizen-001',
        type: 'application_approved',
        title: 'Application Approved!',
        titleTA: 'à®µà®¿à®£à¯à®£à®ªà¯à®ªà®®à¯ à®’à®ªà¯à®ªà¯à®¤à®²à¯ à®…à®³à®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯!',
        message: 'Your Community Certificate (TNH-2026-392847) has been approved. Download your certificate now.',
        messageTA: 'à®‰à®™à¯à®•à®³à¯ à®šà®®à¯‚à®• à®šà®¾à®©à¯à®±à®¿à®¤à®´à¯ (TNH-2026-392847) à®’à®ªà¯à®ªà¯à®¤à®²à¯ à®…à®³à®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯. à®‡à®ªà¯à®ªà¯‹à®¤à¯ à®ªà®¤à®¿à®µà®¿à®±à®•à¯à®•à¯à®™à¯à®•à®³à¯.',
        isRead: true,
        channel: 'in_app',
        relatedEntityId: 'app-002',
        relatedEntityType: 'application',
        actionUrl: '/applications/app-002',
        createdAt: '2026-06-05T15:10:00Z',
        readAt: '2026-06-05T16:00:00Z'
    },
    {
        id: 'notif-004',
        userId: 'citizen-001',
        type: 'system_announcement',
        title: 'New Service Available',
        titleTA: 'à®ªà¯à®¤à®¿à®¯ à®šà¯‡à®µà¯ˆ à®•à®¿à®Ÿà¯ˆà®•à¯à®•à®¿à®±à®¤à¯',
        message: 'Health Scheme Enrollment is now available on TN Hub. Apply today!',
        messageTA: 'à®šà¯à®•à®¾à®¤à®¾à®° à®¤à®¿à®Ÿà¯à®Ÿà®ªà¯à®ªà®¤à®¿à®µà¯ à®‡à®ªà¯à®ªà¯‹à®¤à¯ TN Hub-à®²à¯ à®•à®¿à®Ÿà¯ˆà®•à¯à®•à®¿à®±à®¤à¯. à®‡à®©à¯à®±à¯‡ à®µà®¿à®£à¯à®£à®ªà¯à®ªà®¿à®¯à¯à®™à¯à®•à®³à¯!',
        isRead: false,
        channel: 'in_app',
        actionUrl: '/services/health-scheme-enrollment',
        createdAt: '2026-08-20T09:00:00Z'
    }
];
export function getNotificationsByUser(userId) {
    return mockNotifications.filter(n => n.userId === userId);
}
export function getUnreadCount(userId) {
    return mockNotifications.filter(n => n.userId === userId && !n.isRead).length;
}

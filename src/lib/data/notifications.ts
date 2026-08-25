import type { Notification } from '$lib/types';

export const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    userId: 'citizen-001',
    type: 'application_submitted',
    title: 'Application Submitted',
    titleTA: 'விண்ணப்பம் சமர்ப்பிக்கப்பட்டது',
    message: 'Your Income Certificate application (SYM-2026-784521) has been submitted successfully.',
    messageTA: 'உங்கள் வருமான சான்றிதழ் விண்ணப்பம் (SYM-2026-784521) வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது.',
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
    titleTA: 'ஆவணங்கள் சரிபார்க்கப்பட்டன',
    message: 'Your documents for Income Certificate (SYM-2026-784521) have been verified.',
    messageTA: 'உங்கள் வருமான சான்றிதழுக்கான ஆவணங்கள் (SYM-2026-784521) சரிபார்க்கப்பட்டன.',
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
    titleTA: 'விண்ணப்பம் ஒப்புதல் அளிக்கப்பட்டது!',
    message: 'Your Community Certificate (SYM-2026-392847) has been approved. Download your certificate now.',
    messageTA: 'உங்கள் சமூக சான்றிதழ் (SYM-2026-392847) ஒப்புதல் அளிக்கப்பட்டது. இப்போது பதிவிறக்குங்கள்.',
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
    titleTA: 'புதிய சேவை கிடைக்கிறது',
    message: 'Health Scheme Enrollment is now available on TN Hub. Apply today!',
    messageTA: 'சுகாதார திட்டப்பதிவு இப்போது TN Hub-ல் கிடைக்கிறது. இன்றே விண்ணப்பியுங்கள்!',
    isRead: false,
    channel: 'in_app',
    actionUrl: '/services/health-scheme-enrollment',
    createdAt: '2026-08-20T09:00:00Z'
  }
];

export function getNotificationsByUser(userId: string): Notification[] {
  return mockNotifications.filter(n => n.userId === userId);
}

export function getUnreadCount(userId: string): number {
  return mockNotifications.filter(n => n.userId === userId && !n.isRead).length;
}

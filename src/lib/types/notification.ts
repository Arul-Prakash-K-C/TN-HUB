// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType = 
  | 'application_submitted'
  | 'application_status_updated'
  | 'application_approved'
  | 'application_rejected'
  | 'document_verified'
  | 'document_rejected'
  | 'clarification_requested'
  | 'certificate_ready'
  | 'complaint_update'
  | 'system_announcement'
  | 'sla_warning';

export type NotificationChannel = 'in_app' | 'sms' | 'email' | 'push';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  titleTA: string;
  message: string;
  messageTA: string;
  isRead: boolean;
  channel: NotificationChannel;
  relatedEntityId?: string;
  relatedEntityType?: 'application' | 'complaint' | 'document';
  actionUrl?: string;
  createdAt: string;
  readAt?: string;
}

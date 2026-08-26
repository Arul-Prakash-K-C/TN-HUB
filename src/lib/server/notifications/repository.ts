import { Timestamp, type DocumentSnapshot, type Firestore, type Transaction } from 'firebase-admin/firestore';
import type { ApplicationStatus, AuthenticatedUser, Notification, NotificationChannel, NotificationType } from '$lib/types';
import { getFirebaseAdminFirestore } from '$lib/server/firebase/admin';

type LocalizedText = { en: string; ta: string };

export interface NotificationInput {
	recipientId: string;
	type: NotificationType;
	title: LocalizedText;
	message: LocalizedText;
	applicationId?: string;
	actionUrl?: string;
	channel?: NotificationChannel;
	createdAt?: Timestamp;
}

const statusLabels: Record<ApplicationStatus, LocalizedText> = {
	DRAFT: { en: 'saved as a draft', ta: 'வரைவாக சேமிக்கப்பட்டது' },
	SUBMITTED: { en: 'submitted', ta: 'சமர்ப்பிக்கப்பட்டது' },
	DOCUMENT_VERIFICATION: { en: 'under document verification', ta: 'ஆவணச் சரிபார்ப்பில் உள்ளது' },
	OFFICER_REVIEW: { en: 'under officer review', ta: 'அலுவலர் மதிப்பாய்வில் உள்ளது' },
	FIELD_VERIFICATION: { en: 'under field verification', ta: 'களச் சரிபார்ப்பில் உள்ளது' },
	FAMILY_VERIFICATION: { en: 'under family verification', ta: 'குடும்பச் சரிபார்ப்பில் உள்ளது' },
	CLARIFICATION_REQUESTED: { en: 'waiting for your clarification', ta: 'உங்கள் விளக்கத்திற்காக காத்திருக்கிறது' },
	APPROVAL: { en: 'pending approval', ta: 'ஒப்புதலுக்காக நிலுவையில் உள்ளது' },
	APPROVED: { en: 'approved', ta: 'ஒப்புதல் அளிக்கப்பட்டது' },
	REJECTED: { en: 'rejected', ta: 'நிராகரிக்கப்பட்டது' },
	CERTIFICATE_GENERATED: { en: 'certificate generated', ta: 'சான்றிதழ் உருவாக்கப்பட்டது' },
	CARD_GENERATED: { en: 'card generated', ta: 'அட்டை உருவாக்கப்பட்டது' },
	COMPLETED: { en: 'completed', ta: 'நிறைவடைந்தது' },
	CANCELLED: { en: 'cancelled', ta: 'ரத்து செய்யப்பட்டது' }
};

function toIso(value: unknown): string {
	if (value instanceof Timestamp) return value.toDate().toISOString();
	if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
		return value.toDate().toISOString();
	}
	return new Date(0).toISOString();
}

function localized(value: unknown, fallback: string): LocalizedText {
	if (value && typeof value === 'object') {
		const candidate = value as Partial<LocalizedText>;
		if (typeof candidate.en === 'string' && typeof candidate.ta === 'string') return { en: candidate.en, ta: candidate.ta };
	}
	return { en: fallback, ta: fallback };
}

function notificationType(value: unknown): NotificationType {
	const supported: NotificationType[] = [
		'application_submitted', 'application_status_updated', 'application_approved', 'application_rejected',
		'document_verified', 'document_rejected', 'clarification_requested', 'certificate_ready',
		'complaint_update', 'system_announcement', 'sla_warning'
	];
	return typeof value === 'string' && supported.includes(value as NotificationType)
		? value as NotificationType
		: 'system_announcement';
}

function channel(value: unknown): NotificationChannel {
	return value === 'sms' || value === 'email' || value === 'push' ? value : 'in_app';
}

function toNotification(snapshot: DocumentSnapshot): Notification {
	const data = (snapshot.data() ?? {}) as Record<string, unknown>;
	return {
		id: snapshot.id,
		userId: typeof data.recipientId === 'string' ? data.recipientId : '',
		type: notificationType(data.type),
		title: localized(data.title, 'Notification').en,
		titleTA: localized(data.title, 'Notification').ta,
		message: localized(data.message, 'Notification').en,
		messageTA: localized(data.message, 'Notification').ta,
		isRead: data.isRead === true,
		channel: channel(data.channel),
		relatedEntityId: typeof data.relatedEntityId === 'string' ? data.relatedEntityId : undefined,
		relatedEntityType: data.relatedEntityType === 'application' || data.relatedEntityType === 'document' || data.relatedEntityType === 'complaint'
			? data.relatedEntityType
			: undefined,
		actionUrl: typeof data.actionUrl === 'string' ? data.actionUrl : undefined,
		createdAt: toIso(data.createdAt),
		readAt: data.readAt ? toIso(data.readAt) : undefined
	};
}

/** Adds a private, multilingual in-app notification to an existing transaction. */
export function writeNotificationInTransaction(
	db: Firestore,
	transaction: Transaction,
	input: NotificationInput
): string {
	const notificationRef = db.collection('notifications').doc();
	transaction.set(notificationRef, {
		id: notificationRef.id,
		recipientId: input.recipientId,
		type: input.type,
		title: input.title,
		message: input.message,
		applicationId: input.applicationId ?? null,
		relatedEntityId: input.applicationId ?? null,
		relatedEntityType: input.applicationId ? 'application' : null,
		actionUrl: input.actionUrl ?? null,
		channel: input.channel ?? 'in_app',
		isRead: false,
		createdAt: input.createdAt ?? Timestamp.now(),
		readAt: null
	});
	return notificationRef.id;
}

/**
 * Queues private department notifications while an application submission is
 * still in the same Firestore transaction. The caller resolves recipients
 * with transaction reads before its first transaction write.
 */
export function writeDepartmentSubmissionNotificationsInTransaction(
  db: Firestore,
  transaction: Transaction,
  input: { recipientIds: string[]; applicationId: string; trackingId: string }
): number {
  for (const recipientId of input.recipientIds) {
    writeNotificationInTransaction(db, transaction, {
      recipientId,
      type: 'application_submitted',
      title: { en: 'New application submitted', ta: 'புதிய விண்ணப்பம் சமர்ப்பிக்கப்பட்டது' },
      message: {
        en: `Application ${input.trackingId} has been submitted to your department.`,
        ta: `விண்ணப்பம் ${input.trackingId} உங்கள் துறைக்கு சமர்ப்பிக்கப்பட்டுள்ளது.`
      },
      applicationId: input.applicationId,
      actionUrl: `/department/applications/${input.applicationId}`
    });
  }

  return input.recipientIds.length;
}

export function applicationTransitionNotification(input: {
	recipientId: string;
	applicationId: string;
	trackingId: string;
	fromStatus: ApplicationStatus;
	targetStatus: ApplicationStatus;
	finalStatus: ApplicationStatus;
}): NotificationInput {
	const actionUrl = `/applications/${input.applicationId}`;
	if (input.fromStatus === 'DRAFT' && input.targetStatus === 'SUBMITTED') {
		return {
			recipientId: input.recipientId,
			type: 'application_submitted',
			title: { en: 'Application submitted', ta: 'விண்ணப்பம் சமர்ப்பிக்கப்பட்டது' },
			message: {
				en: `Your application ${input.trackingId} has been submitted successfully.`,
				ta: `உங்கள் விண்ணப்பம் ${input.trackingId} வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது.`
			},
			applicationId: input.applicationId,
			actionUrl
		};
	}

	if (input.targetStatus === 'REJECTED') {
		return {
			recipientId: input.recipientId,
			type: 'application_rejected',
			title: { en: 'Application update', ta: 'விண்ணப்பப் புதுப்பிப்பு' },
			message: {
				en: `Your application ${input.trackingId} has been rejected.`,
				ta: `உங்கள் விண்ணப்பம் ${input.trackingId} நிராகரிக்கப்பட்டது.`
			},
			applicationId: input.applicationId,
			actionUrl
		};
	}

	if (input.targetStatus === 'CLARIFICATION_REQUESTED') {
		return {
			recipientId: input.recipientId,
			type: 'clarification_requested',
			title: { en: 'Clarification requested', ta: 'விளக்கம் கோரப்பட்டுள்ளது' },
			message: {
				en: `Your application ${input.trackingId} needs additional clarification.`,
				ta: `உங்கள் விண்ணப்பம் ${input.trackingId} கூடுதல் விளக்கத்தைக் கோருகிறது.`
			},
			applicationId: input.applicationId,
			actionUrl
		};
	}

	if (input.targetStatus === 'APPROVED' || input.finalStatus === 'COMPLETED') {
		return {
			recipientId: input.recipientId,
			type: 'application_approved',
			title: { en: 'Application approved', ta: 'விண்ணப்பம் ஒப்புதல் அளிக்கப்பட்டது' },
			message: {
				en: `Your application ${input.trackingId} has been approved.`,
				ta: `உங்கள் விண்ணப்பம் ${input.trackingId} ஒப்புதல் அளிக்கப்பட்டது.`
			},
			applicationId: input.applicationId,
			actionUrl
		};
	}

	const label = statusLabels[input.finalStatus];
	return {
		recipientId: input.recipientId,
		type: 'application_status_updated',
		title: { en: 'Application status updated', ta: 'விண்ணப்ப நிலை புதுப்பிக்கப்பட்டது' },
		message: {
			en: `Your application ${input.trackingId} is now ${label.en}.`,
			ta: `உங்கள் விண்ணப்பம் ${input.trackingId} இப்போது ${label.ta}.`
		},
		applicationId: input.applicationId,
		actionUrl
	};
}

export function documentReviewNotification(input: {
	recipientId: string;
	applicationId: string;
	trackingId: string;
	status: 'verified' | 'rejected';
}): NotificationInput {
	const verified = input.status === 'verified';
	return {
		recipientId: input.recipientId,
		type: verified ? 'document_verified' : 'document_rejected',
		title: verified
			? { en: 'Document verified', ta: 'ஆவணம் சரிபார்க்கப்பட்டது' }
			: { en: 'Document update required', ta: 'ஆவணப் புதுப்பிப்பு தேவை' },
		message: verified
			? {
				en: `A document for application ${input.trackingId} has been verified.`,
				ta: `விண்ணப்பம் ${input.trackingId} க்கான ஒரு ஆவணம் சரிபார்க்கப்பட்டது.`
			}
			: {
				en: `A document for application ${input.trackingId} requires correction.`,
				ta: `விண்ணப்பம் ${input.trackingId} க்கான ஒரு ஆவணத்தில் திருத்தம் தேவை.`
			},
		applicationId: input.applicationId,
		actionUrl: `/applications/${input.applicationId}`
	};
}

/** Lists only the verified recipient's own notifications. */
export async function listNotificationsForUser(user: AuthenticatedUser): Promise<Notification[]> {
	const snapshot = await getFirebaseAdminFirestore().collection('notifications').where('recipientId', '==', user.uid).limit(100).get();
	return snapshot.docs.map(toNotification).sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function getUnreadNotificationCount(user: AuthenticatedUser): Promise<number> {
	const snapshot = await getFirebaseAdminFirestore()
		.collection('notifications')
		.where('recipientId', '==', user.uid)
		.where('isRead', '==', false)
		.limit(100)
		.get();
	return snapshot.size;
}

export async function markNotificationRead(user: AuthenticatedUser, notificationId: string): Promise<void> {
	const db = getFirebaseAdminFirestore();
	const notificationRef = db.collection('notifications').doc(notificationId);
	await db.runTransaction(async (transaction) => {
		const snapshot = await transaction.get(notificationRef);
		if (!snapshot.exists || snapshot.get('recipientId') !== user.uid) throw new Error('Notification not found.');
		if (snapshot.get('isRead') === true) return;
		transaction.update(notificationRef, { isRead: true, readAt: Timestamp.now() });
	});
}

export async function markAllNotificationsRead(user: AuthenticatedUser): Promise<number> {
	const db = getFirebaseAdminFirestore();
	const snapshot = await db.collection('notifications').where('recipientId', '==', user.uid).get();
	const unread = snapshot.docs.filter((notification) => notification.get('isRead') !== true);
	for (let index = 0; index < unread.length; index += 400) {
		const batch = db.batch();
		for (const notification of unread.slice(index, index + 400)) {
			batch.update(notification.ref, { isRead: true, readAt: Timestamp.now() });
		}
		await batch.commit();
	}
	return unread.length;
}

export async function createNotification(input: NotificationInput): Promise<string> {
	const db = getFirebaseAdminFirestore();
	const ref = db.collection('notifications').doc();
	await ref.set({
		id: ref.id,
		recipientId: input.recipientId,
		type: input.type,
		title: input.title,
		message: input.message,
		applicationId: input.applicationId ?? null,
		relatedEntityId: input.applicationId ?? null,
		relatedEntityType: input.applicationId ? 'application' : null,
		actionUrl: input.actionUrl ?? null,
		channel: input.channel ?? 'in_app',
		isRead: false,
		createdAt: input.createdAt ?? Timestamp.now(),
		readAt: null
	});
	return ref.id;
}

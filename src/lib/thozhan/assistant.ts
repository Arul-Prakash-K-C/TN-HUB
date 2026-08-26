import type { Application, ApplicationStatus, AuthenticatedUser, Department, Document, Service, ServiceDocument } from '$lib/types';

export type ThozhanStateId =
	| 'root'
	| 'find.method'
	| 'find.category'
	| 'find.department'
	| 'find.services'
	| 'service.details'
	| 'apply.method'
	| 'apply.category'
	| 'apply.department'
	| 'apply.services'
	| 'apply.details'
	| 'track.filter'
	| 'track.list'
	| 'track.details'
	| 'documents.method'
	| 'documents.category'
	| 'documents.department'
	| 'documents.services'
	| 'documents.details'
	| 'fees.method'
	| 'fees.category'
	| 'fees.department'
	| 'fees.services'
	| 'fees.details'
	| 'department.method'
	| 'department.service.category'
	| 'department.service.department'
	| 'department.service.list'
	| 'department.directory'
	| 'department.details'
	| 'help.topic'
	| 'help.issue'
	| 'help.details';

export type OptionText =
	| { type: 'key'; key: string; params?: Record<string, string | number> }
	| { type: 'value'; value: string };

export type ThozhanAction =
	| { kind: 'state'; nextState: ThozhanStateId; patch?: Partial<ThozhanContext> }
	| { kind: 'navigate'; href: string }
	| { kind: 'external'; href: string }
	| { kind: 'noop' };

export interface ThozhanOption {
	id: string;
	label: OptionText;
	description?: OptionText;
	meta?: string;
	action: ThozhanAction;
	disabled?: boolean;
	selected?: boolean;
}

export interface DetailItem {
	id: string;
	label: OptionText;
	value: OptionText;
}

export interface DetailSection {
	id: string;
	title: OptionText;
	items: DetailItem[];
}

export interface ThozhanResultCard {
	title: OptionText;
	subtitle?: OptionText;
	badges?: OptionText[];
	sections?: DetailSection[];
	notice?: OptionText;
}

export interface ThozhanScreen {
	state: ThozhanStateId;
	title: OptionText;
	description?: OptionText;
	breadcrumbs: OptionText[];
	options: ThozhanOption[];
	resultCard?: ThozhanResultCard;
	actions?: ThozhanOption[];
	emptyTitle?: OptionText;
	emptyDescription?: OptionText;
	authRequired?: boolean;
}

export interface ThozhanData {
	user: AuthenticatedUser | null;
	services: Service[];
	departments: Department[];
	applications: Application[];
	documents: Document[];
}

export interface ThozhanContext {
	state: ThozhanStateId;
	categoryId?: string;
	departmentId?: string;
	serviceId?: string;
	applicationId?: string;
	methodId?: string;
	filterId?: string;
	helpTopicId?: string;
	helpIssueId?: string;
}

type Translate = (key: string, params?: Record<string, string | number>) => string;
type Locale = 'en' | 'ta';

type HelpTopicId =
	| 'login'
	| 'application'
	| 'document'
	| 'payment'
	| 'submit'
	| 'notifications'
	| 'profile'
	| 'contact';

const activeStatuses = new Set<ApplicationStatus>([
	'SUBMITTED',
	'DOCUMENT_VERIFICATION',
	'OFFICER_REVIEW',
	'FIELD_VERIFICATION',
	'FAMILY_VERIFICATION',
	'CLARIFICATION_REQUESTED',
	'APPROVAL'
]);

const completedStatuses = new Set<ApplicationStatus>([
	'APPROVED',
	'CERTIFICATE_GENERATED',
	'CARD_GENERATED',
	'COMPLETED'
]);

const rejectedStatuses = new Set<ApplicationStatus>(['REJECTED', 'CANCELLED']);

const topLevelCategories: Array<{ id: string; key: string; next: ThozhanStateId }> = [
	{ id: 'find-service', key: 'chatbot.menu.findService', next: 'find.method' },
	{ id: 'apply-service', key: 'chatbot.menu.applyService', next: 'apply.method' },
	{ id: 'track-application', key: 'chatbot.menu.trackApplication', next: 'track.filter' },
	{ id: 'required-documents', key: 'chatbot.menu.requiredDocuments', next: 'documents.method' },
	{ id: 'fees-processing', key: 'chatbot.menu.feesProcessing', next: 'fees.method' },
	{ id: 'department-office', key: 'chatbot.menu.departmentOffice', next: 'department.method' },
	{ id: 'tnhub-help', key: 'chatbot.menu.help', next: 'help.topic' }
];

const helpTopics: Array<{ id: HelpTopicId; key: string }> = [
	{ id: 'login', key: 'chatbot.help.topic.login' },
	{ id: 'application', key: 'chatbot.help.topic.application' },
	{ id: 'document', key: 'chatbot.help.topic.document' },
	{ id: 'payment', key: 'chatbot.help.topic.payment' },
	{ id: 'submit', key: 'chatbot.help.topic.submit' },
	{ id: 'notifications', key: 'chatbot.help.topic.notifications' },
	{ id: 'profile', key: 'chatbot.help.topic.profile' },
	{ id: 'contact', key: 'chatbot.help.topic.contact' }
];

const helpIssues: Record<HelpTopicId, string[]> = {
	login: ['cannotLogin', 'otpNotReceived', 'changeMobileNumber', 'changeEmail', 'accountInformation'],
	application: ['cannotStartApplication', 'cannotSaveApplication', 'cannotUploadDocument', 'cannotSubmit', 'applicationAlreadySubmitted', 'applicationMissing'],
	document: ['cannotUpload', 'documentNotAccepted', 'documentMissing', 'documentVaultHelp'],
	payment: ['paymentFailed', 'paymentStatusPending', 'amountDeducted', 'refundInformation'],
	submit: ['unableToSubmit'],
	notifications: ['applicationUpdates', 'paymentUpdates', 'serviceUpdates', 'systemNotifications'],
	profile: ['personalInformation', 'mobileNumber', 'email', 'address', 'language', 'settings'],
	contact: ['contactHelpDesk']
};

const helpTopicDescriptions: Record<HelpTopicId, string> = {
	login: 'chatbot.help.topicDescription.login',
	application: 'chatbot.help.topicDescription.application',
	document: 'chatbot.help.topicDescription.document',
	payment: 'chatbot.help.topicDescription.payment',
	submit: 'chatbot.help.topicDescription.submit',
	notifications: 'chatbot.help.topicDescription.notifications',
	profile: 'chatbot.help.topicDescription.profile',
	contact: 'chatbot.help.topicDescription.contact'
};

function key(keyValue: string, params?: Record<string, string | number>): OptionText {
	return { type: 'key', key: keyValue, params };
}

function value(text: string): OptionText {
	return { type: 'value', value: text };
}

export function createInitialContext(): ThozhanContext {
	return { state: 'root' };
}

function getVisibleServices(data: ThozhanData): Service[] {
	return data.services
		.filter((service) => service.isActive && service.isOnline)
		.sort((left, right) => left.name.localeCompare(right.name));
}

function getServiceName(service: Service | undefined, locale: Locale): string {
	if (!service) return '';
	return locale === 'ta' ? service.nameTA : service.name;
}

function getDepartmentName(department: Department | undefined, locale: Locale): string {
	if (!department) return '';
	return locale === 'ta' ? department.nameTA : department.name;
}

function getDepartmentById(data: ThozhanData, departmentId?: string): Department | undefined {
	return data.departments.find((department) => department.id === departmentId);
}

function getServiceById(data: ThozhanData, serviceId?: string): Service | undefined {
	return getVisibleServices(data).find((service) => service.id === serviceId);
}

function getApplicationById(data: ThozhanData, applicationId?: string): Application | undefined {
	return data.applications.find((application) => application.id === applicationId);
}

function getUniqueRecentServices(data: ThozhanData): Service[] {
	const visibleById = new Map(getVisibleServices(data).map((service) => [service.id, service]));
	const seen = new Set<string>();
	const recent: Service[] = [];

	for (const application of [...data.applications].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))) {
		if (seen.has(application.serviceId)) continue;
		const service = visibleById.get(application.serviceId);
		if (!service) continue;
		seen.add(application.serviceId);
		recent.push(service);
	}

	return recent;
}

function getPopularServices(data: ThozhanData): Service[] {
	return getVisibleServices(data)
		.sort((left, right) => {
			const certificatesLeft = left.category === 'certificates' ? -1 : 0;
			const certificatesRight = right.category === 'certificates' ? -1 : 0;
			if (certificatesLeft !== certificatesRight) return certificatesLeft - certificatesRight;
			if (left.processingTimeDays !== right.processingTimeDays) return left.processingTimeDays - right.processingTimeDays;
			return left.name.localeCompare(right.name);
		})
		.slice(0, 8);
}

function getServicesForCategory(data: ThozhanData, categoryId?: string): Service[] {
	return getVisibleServices(data).filter((service) => service.category === categoryId);
}

function getServicesForDepartment(data: ThozhanData, departmentId?: string): Service[] {
	return getVisibleServices(data).filter((service) => service.departmentId === departmentId);
}

function getServiceCategoryOptions(data: ThozhanData, locale: Locale): ThozhanOption[] {
	const counts = new Map<string, number>();
	for (const service of getVisibleServices(data)) {
		counts.set(service.category, (counts.get(service.category) ?? 0) + 1);
	}

	return [...counts.entries()]
		.sort((left, right) => left[0].localeCompare(right[0]))
		.map(([categoryId, count]) => ({
			id: categoryId,
			label: key(`chatbot.category.${categoryId}`),
			description: key('chatbot.option.serviceCount', { count }),
			meta: String(count),
			action: { kind: 'noop' }
		}));
}

function getDepartmentOptions(data: ThozhanData, locale: Locale): ThozhanOption[] {
	return data.departments
		.filter((department) => department.isActive && getServicesForDepartment(data, department.id).length > 0)
		.sort((left, right) => left.name.localeCompare(right.name))
		.map((department) => ({
			id: department.id,
			label: value(getDepartmentName(department, locale)),
			description: key('chatbot.option.serviceCount', { count: getServicesForDepartment(data, department.id).length }),
			action: { kind: 'noop' }
		}));
}

function toServiceOption(service: Service, locale: Locale, action: ThozhanAction): ThozhanOption {
	return {
		id: service.id,
		label: value(getServiceName(service, locale)),
		description: value(locale === 'ta' ? service.shortDescriptionTA : service.shortDescription),
		meta: service.processingTimeDays > 0 ? `${service.processingTimeDays}` : undefined,
		action
	};
}

function toApplicationOption(application: Application, locale: Locale, action: ThozhanAction): ThozhanOption {
	return {
		id: application.id,
		label: value(`${application.applicationNumber} — ${locale === 'ta' ? application.serviceNameTA : application.serviceName}`),
		description: value(locale === 'ta' ? application.departmentNameTA : application.departmentName),
		meta: application.status,
		action
	};
}

function getApplicationList(data: ThozhanData, filterId?: string): Application[] {
	const applications = [...data.applications].sort((left, right) => {
		const leftDate = left.submittedAt ?? left.updatedAt;
		const rightDate = right.submittedAt ?? right.updatedAt;
		return rightDate.localeCompare(leftDate);
	});

	switch (filterId) {
		case 'active':
			return applications.filter((application) => activeStatuses.has(application.status));
		case 'completed':
			return applications.filter((application) => completedStatuses.has(application.status));
		case 'rejected':
			return applications.filter((application) => rejectedStatuses.has(application.status));
		default:
			return applications.filter((application) => application.status !== 'DRAFT');
	}
}

function getLatestApplicationStage(application: Application, locale: Locale): string {
	const latest = [...application.history].sort((left, right) => right.timestamp.localeCompare(left.timestamp))[0];
	if (!latest) return locale === 'ta' ? application.status : application.status;
	return locale === 'ta' ? latest.descriptionTA : latest.description;
}

function buildServiceResultCard(service: Service, department: Department | undefined, locale: Locale): ThozhanResultCard {
	return {
		title: value(getServiceName(service, locale)),
		subtitle: value(getDepartmentName(department, locale)),
		badges: [
			key(`chatbot.category.${service.category}`),
			key(`chatbot.implementation.${service.implementationMode}`)
		],
		sections: [
			{
				id: 'summary',
				title: key('chatbot.section.serviceSummary'),
				items: [
					{
						id: 'description',
						label: key('chatbot.detail.description'),
						value: value(locale === 'ta' ? service.descriptionTA : service.description)
					},
					{
						id: 'eligibility',
						label: key('chatbot.detail.eligibility'),
						value: value((locale === 'ta' ? service.eligibilityTA : service.eligibility).join(' • ') || (locale === 'ta' ? service.whoCanApplyTA : service.whoCanApply))
					},
					{
						id: 'documents',
						label: key('chatbot.detail.documents'),
						value: value(service.requiredDocuments.length ? service.requiredDocuments.map((document) => locale === 'ta' ? document.nameTA : document.name).join(' • ') : '')
					},
					{
						id: 'fee',
						label: key('chatbot.detail.fee'),
						value: value(service.fee > 0 ? `₹${service.fee}` : '₹0')
					},
					{
						id: 'sla',
						label: key('chatbot.detail.sla'),
						value: value(service.processingTimeDescription ? (locale === 'ta' ? service.processingTimeDescriptionTA : service.processingTimeDescription) : `${service.processingTimeDays}`)
					},
					{
						id: 'availability',
						label: key('chatbot.detail.applicationAvailability'),
						value: key(service.implementationMode === 'EXTERNAL_REDIRECT' ? 'chatbot.availability.external' : 'chatbot.availability.online')
					}
				]
			}
		]
	};
}

function buildDocumentRequirementItems(document: ServiceDocument, locale: Locale): DetailItem[] {
	return [
		{
			id: 'mandatory',
			label: key('chatbot.detail.documentType'),
			value: key(document.mandatory ? 'service.mandatory' : 'service.optional')
		},
		{
			id: 'formats',
			label: key('chatbot.detail.acceptedFormats'),
			value: value(document.acceptedFormats.join(', ') || 'PDF')
		},
		{
			id: 'size',
			label: key('chatbot.detail.maxFileSize'),
			value: value(`${document.maxSizeMB} MB`)
		},
		{
			id: 'description',
			label: key('chatbot.detail.requirement'),
			value: value(locale === 'ta' ? document.descriptionTA : document.description)
		}
	];
}

function buildDocumentsResultCard(service: Service, locale: Locale): ThozhanResultCard {
	return {
		title: value(getServiceName(service, locale)),
		subtitle: key('chatbot.section.requiredDocuments'),
		sections: service.requiredDocuments.map((document) => ({
			id: document.id,
			title: value(locale === 'ta' ? document.nameTA : document.name),
			items: buildDocumentRequirementItems(document, locale)
		})),
		notice: key(service.requiredDocuments.length ? 'chatbot.notice.documentVault' : 'chatbot.empty.noDocumentRequirements')
	};
}

function buildFeesResultCard(service: Service, department: Department | undefined, locale: Locale): ThozhanResultCard {
	return {
		title: value(getServiceName(service, locale)),
		subtitle: value(getDepartmentName(department, locale)),
		sections: [
			{
				id: 'fees',
				title: key('chatbot.section.fees'),
				items: [
					{ id: 'govtFee', label: key('chatbot.detail.governmentFee'), value: value(service.fee > 0 ? `₹${service.fee}` : '₹0') },
					{ id: 'serviceCharge', label: key('chatbot.detail.serviceCharge'), value: key('chatbot.value.informationUnavailable') },
					{ id: 'otherCharges', label: key('chatbot.detail.otherCharges'), value: key('chatbot.value.informationUnavailable') },
					{ id: 'totalPayable', label: key('chatbot.detail.totalPayable'), value: value(service.fee > 0 ? `₹${service.fee}` : '₹0') }
				]
			},
			{
				id: 'processing',
				title: key('chatbot.section.processing'),
				items: [
					{
						id: 'expectedSla',
						label: key('chatbot.detail.expectedSla'),
						value: value(service.processingTimeDescription ? (locale === 'ta' ? service.processingTimeDescriptionTA : service.processingTimeDescription) : `${service.processingTimeDays}`)
					},
					{
						id: 'currentWait',
						label: key('chatbot.detail.currentProcessingTime'),
						value: service.processingTimeDescription ? value(locale === 'ta' ? service.processingTimeDescriptionTA : service.processingTimeDescription) : key('chatbot.value.informationUnavailable')
					}
				]
			}
		]
	};
}

function buildDepartmentResultCard(
	department: Department | undefined,
	service: Service | undefined,
	mode: string | undefined,
	locale: Locale
): ThozhanResultCard | undefined {
	if (!department && !service) return undefined;

	return {
		title: value(service ? getServiceName(service, locale) : getDepartmentName(department, locale)),
		subtitle: value(service && department ? getDepartmentName(department, locale) : locale === 'ta' ? department?.descriptionTA ?? '' : department?.description ?? ''),
		sections: [
			{
				id: 'department',
				title: key('chatbot.section.departmentOffice'),
				items: [
					{
						id: 'responsibleDepartment',
						label: key('chatbot.detail.responsibleDepartment'),
						value: value(getDepartmentName(department, locale) || '')
					},
					{
						id: 'contactInformation',
						label: key('chatbot.detail.contactInformation'),
						value: value([department?.contactPhone, department?.contactEmail].filter(Boolean).join(' • ') || '')
					},
					{
						id: 'officeAddress',
						label: key('chatbot.detail.officeAddress'),
						value: key('chatbot.value.informationUnavailable')
					},
					{
						id: 'workingHours',
						label: key('chatbot.detail.workingHours'),
						value: key('chatbot.value.informationUnavailable')
					}
				]
			}
		],
		notice: mode && !department?.website && !department?.contactPhone && !department?.contactEmail ? key('chatbot.notice.officeInfoUnavailable') : undefined
	};
}

function buildApplicationResultCard(application: Application, locale: Locale, translate: Translate): ThozhanResultCard {
	return {
		title: value(application.applicationNumber),
		subtitle: value(locale === 'ta' ? application.serviceNameTA : application.serviceName),
		badges: [key(`status.${application.status}`)],
		sections: [
			{
				id: 'application',
				title: key('chatbot.section.applicationDetails'),
				items: [
					{ id: 'service', label: key('applications.service'), value: value(locale === 'ta' ? application.serviceNameTA : application.serviceName) },
					{ id: 'department', label: key('applications.department'), value: value(locale === 'ta' ? application.departmentNameTA : application.departmentName) },
					{ id: 'submittedDate', label: key('chatbot.detail.submittedDate'), value: value(application.submittedAt ? new Date(application.submittedAt).toLocaleDateString(locale === 'ta' ? 'ta-IN' : 'en-IN') : translate('chatbot.value.notAvailable')) },
					{ id: 'submittedTime', label: key('chatbot.detail.submittedTime'), value: value(application.submittedAt ? new Date(application.submittedAt).toLocaleTimeString(locale === 'ta' ? 'ta-IN' : 'en-IN') : translate('chatbot.value.notAvailable')) },
					{ id: 'status', label: key('applications.status'), value: key(`status.${application.status}`) },
					{ id: 'stage', label: key('chatbot.detail.processingStage'), value: value(getLatestApplicationStage(application, locale)) },
					{ id: 'sla', label: key('chatbot.detail.expectedSla'), value: value(application.expectedCompletionDate ? new Date(application.expectedCompletionDate).toLocaleDateString(locale === 'ta' ? 'ta-IN' : 'en-IN') : application.slaDeadline ? new Date(application.slaDeadline).toLocaleDateString(locale === 'ta' ? 'ta-IN' : 'en-IN') : translate('chatbot.value.informationUnavailable')) },
					{ id: 'action', label: key('chatbot.detail.requiredAction'), value: value(application.status === 'CLARIFICATION_REQUESTED' ? translate('chatbot.requiredAction.clarification') : translate('chatbot.requiredAction.none')) }
				]
			}
		]
	};
}

function buildSubmitHelpCard(data: ThozhanData, locale: Locale): ThozhanResultCard {
	const draft = [...data.applications]
		.filter((application) => application.status === 'DRAFT' || application.status === 'CLARIFICATION_REQUESTED')
		.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0];

	if (!draft) {
		return {
			title: key('chatbot.help.issue.unableToSubmit'),
			subtitle: key('chatbot.help.submit.noDraftTitle'),
			notice: key('chatbot.help.submit.noDraftDescription')
		};
	}

	const service = data.services.find((entry) => entry.id === draft.serviceId);
	const missingDocuments = service
		? service.requiredDocuments.filter((document) => document.mandatory && !draft.documents.some((uploaded) => uploaded.name === document.name || uploaded.name === document.nameTA))
		: [];

	return {
		title: key('chatbot.help.issue.unableToSubmit'),
		subtitle: value(locale === 'ta' ? draft.serviceNameTA : draft.serviceName),
		sections: [
			{
				id: 'submitChecks',
				title: key('chatbot.help.submit.checks'),
				items: [
					{
						id: 'requiredFields',
						label: key('chatbot.help.submit.requiredFields'),
						value: key(Object.keys(draft.formData).length > 0 ? 'chatbot.value.checkCompleted' : 'chatbot.value.checkPending')
					},
					{
						id: 'requiredDocuments',
						label: key('chatbot.help.submit.requiredDocuments'),
						value: missingDocuments.length
							? value(missingDocuments.map((document) => locale === 'ta' ? document.nameTA : document.name).join(' • '))
							: key('chatbot.value.checkCompleted')
					},
					{
						id: 'existingSubmission',
						label: key('chatbot.help.submit.existingSubmission'),
						value: key(draft.status === 'DRAFT' ? 'chatbot.value.no' : 'chatbot.value.yes')
					},
					{
						id: 'validation',
						label: key('chatbot.help.submit.validation'),
						value: key(draft.status === 'CLARIFICATION_REQUESTED' ? 'chatbot.help.submit.correctionRequired' : 'chatbot.help.submit.continueDraft')
					}
				]
			}
		]
	};
}

function authAction(data: ThozhanData, href: string): ThozhanAction {
	return data.user ? { kind: 'navigate', href } : { kind: 'navigate', href: '/login' };
}

function buildHelpActions(data: ThozhanData, issueId: string): ThozhanOption[] {
	switch (issueId) {
		case 'cannotLogin':
		case 'otpNotReceived':
			return [
				{ id: 'login', label: key('chatbot.action.goToLogin'), action: { kind: 'navigate', href: '/login' } },
				{ id: 'help', label: key('chatbot.action.contactHelpDesk'), action: { kind: 'navigate', href: '/help' } }
			];
		case 'changeMobileNumber':
		case 'changeEmail':
		case 'accountInformation':
			return [
				{ id: 'profile', label: key('chatbot.action.openProfile'), action: authAction(data, '/profile') },
				{ id: 'help', label: key('chatbot.action.contactHelpDesk'), action: { kind: 'navigate', href: '/help' } }
			];
		case 'cannotStartApplication':
			return [
				{ id: 'services', label: key('chatbot.action.browseServices'), action: { kind: 'navigate', href: '/services' } },
				{ id: 'help', label: key('chatbot.action.contactHelpDesk'), action: { kind: 'navigate', href: '/help' } }
			];
		case 'cannotSaveApplication':
		case 'cannotUploadDocument':
		case 'cannotSubmit':
		case 'applicationAlreadySubmitted':
		case 'applicationMissing':
			return [
				{ id: 'applications', label: key('chatbot.action.openApplications'), action: authAction(data, '/applications') },
				{ id: 'help', label: key('chatbot.action.contactHelpDesk'), action: { kind: 'navigate', href: '/help' } }
			];
		case 'cannotUpload':
		case 'documentNotAccepted':
		case 'documentMissing':
		case 'documentVaultHelp':
			return [
				{ id: 'documents', label: key('chatbot.action.openDocuments'), action: authAction(data, '/documents') },
				{ id: 'help', label: key('chatbot.action.contactHelpDesk'), action: { kind: 'navigate', href: '/help' } }
			];
		case 'paymentFailed':
		case 'paymentStatusPending':
		case 'amountDeducted':
		case 'refundInformation':
			return [
				{ id: 'applications', label: key('chatbot.action.openApplications'), action: authAction(data, '/applications') },
				{ id: 'help', label: key('chatbot.action.contactHelpDesk'), action: { kind: 'navigate', href: '/help' } }
			];
		case 'unableToSubmit':
			return [
				{ id: 'applications', label: key('chatbot.action.openApplications'), action: authAction(data, '/applications') },
				{ id: 'documents', label: key('chatbot.action.openDocuments'), action: authAction(data, '/documents') },
				{ id: 'help', label: key('chatbot.action.contactHelpDesk'), action: { kind: 'navigate', href: '/help' } }
			];
		case 'applicationUpdates':
		case 'paymentUpdates':
		case 'serviceUpdates':
		case 'systemNotifications':
			return [
				{ id: 'notifications', label: key('chatbot.action.openNotifications'), action: authAction(data, '/notifications') },
				{ id: 'help', label: key('chatbot.action.contactHelpDesk'), action: { kind: 'navigate', href: '/help' } }
			];
		case 'personalInformation':
		case 'mobileNumber':
		case 'email':
		case 'address':
		case 'language':
		case 'settings':
			return [
				{ id: 'profile', label: key('chatbot.action.openProfile'), action: authAction(data, '/profile') },
				{ id: 'help', label: key('chatbot.action.contactHelpDesk'), action: { kind: 'navigate', href: '/help' } }
			];
		default:
			return [{ id: 'help', label: key('chatbot.action.contactHelpDesk'), action: { kind: 'navigate', href: '/help' } }];
	}
}

function buildCommonActions(): ThozhanOption[] {
	return [
		{ id: 'back', label: key('chatbot.action.back'), action: { kind: 'noop' } },
		{ id: 'startOver', label: key('chatbot.action.startOver'), action: { kind: 'noop' } }
	];
}

export function buildScreen(
	context: ThozhanContext,
	data: ThozhanData,
	locale: Locale,
	translate: Translate
): ThozhanScreen {
	const commonActions = buildCommonActions();
	const service = getServiceById(data, context.serviceId);
	const department = getDepartmentById(data, context.departmentId ?? service?.departmentId);
	const application = getApplicationById(data, context.applicationId);

	switch (context.state) {
		case 'root':
			return {
				state: 'root',
				title: key('chatbot.controlled.title'),
				description: key('chatbot.controlled.description'),
				breadcrumbs: [],
				options: topLevelCategories.map((item) => ({
					id: item.id,
					label: key(item.key),
					action: { kind: 'state', nextState: item.next }
				})),
				actions: [{ id: 'startOver', label: key('chatbot.action.startOver'), action: { kind: 'noop' } }]
			};

		case 'find.method':
			return {
				state: 'find.method',
				title: key('chatbot.find.title'),
				description: key('chatbot.find.description'),
				breadcrumbs: [key('chatbot.menu.findService')],
				options: [
					{ id: 'byCategory', label: key('chatbot.find.byCategory'), action: { kind: 'state', nextState: 'find.category' } },
					{ id: 'byDepartment', label: key('chatbot.find.byDepartment'), action: { kind: 'state', nextState: 'find.department' } },
					{ id: 'popularServices', label: key('chatbot.find.popularServices'), action: { kind: 'state', nextState: 'find.services', patch: { methodId: 'popular' } } },
					{ id: 'recentlyUsedServices', label: key('chatbot.find.recentlyUsedServices'), action: { kind: 'state', nextState: 'find.services', patch: { methodId: 'recent' } }, disabled: getUniqueRecentServices(data).length === 0 }
				],
				actions: commonActions
			};

		case 'find.category':
			return {
				state: 'find.category',
				title: key('chatbot.find.chooseCategory'),
				description: key('chatbot.find.chooseCategoryDescription'),
				breadcrumbs: [key('chatbot.menu.findService')],
				options: getServiceCategoryOptions(data, locale).map((option) => ({
					...option,
					action: { kind: 'state', nextState: 'find.services', patch: { methodId: 'category', categoryId: option.id } }
				})),
				actions: commonActions
			};

		case 'find.department':
			return {
				state: 'find.department',
				title: key('chatbot.find.chooseDepartment'),
				description: key('chatbot.find.chooseDepartmentDescription'),
				breadcrumbs: [key('chatbot.menu.findService')],
				options: getDepartmentOptions(data, locale).map((option) => ({
					...option,
					action: { kind: 'state', nextState: 'find.services', patch: { methodId: 'department', departmentId: option.id } }
				})),
				actions: commonActions
			};

		case 'find.services': {
			const services = context.methodId === 'popular'
				? getPopularServices(data)
				: context.methodId === 'recent'
					? getUniqueRecentServices(data)
					: context.methodId === 'department'
						? getServicesForDepartment(data, context.departmentId)
						: getServicesForCategory(data, context.categoryId);

			return {
				state: 'find.services',
				title: key('chatbot.find.selectService'),
				description: key('chatbot.find.selectServiceDescription'),
				breadcrumbs: [key('chatbot.menu.findService')],
				options: services.map((entry) => toServiceOption(entry, locale, { kind: 'state', nextState: 'service.details', patch: { serviceId: entry.id } })),
				emptyTitle: key('chatbot.empty.noServicesTitle'),
				emptyDescription: key('chatbot.empty.noServicesDescription'),
				actions: commonActions
			};
		}

		case 'service.details':
			return {
				state: 'service.details',
				title: key('chatbot.find.serviceSummary'),
				description: key('chatbot.find.serviceSummaryDescription'),
				breadcrumbs: [key('chatbot.menu.findService'), service ? value(getServiceName(service, locale)) : key('chatbot.find.selectService')],
				options: [],
				resultCard: service ? buildServiceResultCard(service, department, locale) : undefined,
				actions: service
					? [
						{
							id: 'applyNow',
							label: key('chatbot.action.applyNow'),
							action: { kind: 'navigate', href: `/services/${service.slug}${data.user?.role === 'citizen' ? '/apply' : ''}` }
						},
						{ id: 'requiredDocuments', label: key('chatbot.action.requiredDocuments'), action: { kind: 'state', nextState: 'documents.details', patch: { serviceId: service.id } } },
						{ id: 'feesProcessing', label: key('chatbot.action.feesProcessing'), action: { kind: 'state', nextState: 'fees.details', patch: { serviceId: service.id } } },
						{ id: 'departmentOffice', label: key('chatbot.action.departmentOffice'), action: { kind: 'state', nextState: 'department.details', patch: { serviceId: service.id, departmentId: service.departmentId, methodId: 'service' } } },
						...commonActions
					]
					: commonActions
			};

		case 'apply.method':
			return {
				state: 'apply.method',
				title: key('chatbot.apply.title'),
				description: key('chatbot.apply.description'),
				breadcrumbs: [key('chatbot.menu.applyService')],
				options: [
					{ id: 'recentlyUsedServices', label: key('chatbot.apply.recentlyUsedServices'), action: { kind: 'state', nextState: 'apply.services', patch: { methodId: 'recent' } }, disabled: getUniqueRecentServices(data).length === 0 },
					{ id: 'popularServices', label: key('chatbot.apply.popularServices'), action: { kind: 'state', nextState: 'apply.services', patch: { methodId: 'popular' } } },
					{ id: 'browseByDepartment', label: key('chatbot.apply.browseByDepartment'), action: { kind: 'state', nextState: 'apply.department' } },
					{ id: 'browseByCategory', label: key('chatbot.apply.browseByCategory'), action: { kind: 'state', nextState: 'apply.category' } }
				],
				actions: commonActions
			};

		case 'apply.category':
			return {
				state: 'apply.category',
				title: key('chatbot.apply.chooseCategory'),
				description: key('chatbot.apply.chooseCategoryDescription'),
				breadcrumbs: [key('chatbot.menu.applyService')],
				options: getServiceCategoryOptions(data, locale).map((option) => ({
					...option,
					action: { kind: 'state', nextState: 'apply.services', patch: { methodId: 'category', categoryId: option.id } }
				})),
				actions: commonActions
			};

		case 'apply.department':
			return {
				state: 'apply.department',
				title: key('chatbot.apply.chooseDepartment'),
				description: key('chatbot.apply.chooseDepartmentDescription'),
				breadcrumbs: [key('chatbot.menu.applyService')],
				options: getDepartmentOptions(data, locale).map((option) => ({
					...option,
					action: { kind: 'state', nextState: 'apply.services', patch: { methodId: 'department', departmentId: option.id } }
				})),
				actions: commonActions
			};

		case 'apply.services': {
			const services = context.methodId === 'popular'
				? getPopularServices(data)
				: context.methodId === 'recent'
					? getUniqueRecentServices(data)
					: context.methodId === 'department'
						? getServicesForDepartment(data, context.departmentId)
						: getServicesForCategory(data, context.categoryId);

			return {
				state: 'apply.services',
				title: key('chatbot.apply.selectService'),
				description: key('chatbot.apply.selectServiceDescription'),
				breadcrumbs: [key('chatbot.menu.applyService')],
				options: services.map((entry) => toServiceOption(entry, locale, { kind: 'state', nextState: 'apply.details', patch: { serviceId: entry.id } })),
				emptyTitle: key('chatbot.empty.noServicesTitle'),
				emptyDescription: key('chatbot.empty.noServicesDescription'),
				actions: commonActions
			};
		}

		case 'apply.details':
			return {
				state: 'apply.details',
				title: key('chatbot.apply.serviceInformation'),
				description: key('chatbot.apply.serviceInformationDescription'),
				breadcrumbs: [key('chatbot.menu.applyService'), service ? value(getServiceName(service, locale)) : key('chatbot.apply.selectService')],
				options: [],
				resultCard: service ? buildServiceResultCard(service, department, locale) : undefined,
				actions: service
					? [
						{ id: 'checkEligibility', label: key('chatbot.action.checkEligibility'), action: { kind: 'state', nextState: 'service.details', patch: { serviceId: service.id } } },
						{ id: 'requiredDocuments', label: key('chatbot.action.requiredDocuments'), action: { kind: 'state', nextState: 'documents.details', patch: { serviceId: service.id } } },
						{ id: 'fees', label: key('chatbot.action.fees'), action: { kind: 'state', nextState: 'fees.details', patch: { serviceId: service.id } } },
						{ id: 'processingTime', label: key('chatbot.action.processingTime'), action: { kind: 'state', nextState: 'fees.details', patch: { serviceId: service.id } } },
						{ id: 'applyNow', label: key('chatbot.action.applyNow'), action: { kind: 'navigate', href: `/services/${service.slug}/apply` } },
						...commonActions
					]
					: commonActions,
				authRequired: !data.user
			};

		case 'track.filter':
			return {
				state: 'track.filter',
				title: key('chatbot.track.title'),
				description: key('chatbot.track.description'),
				breadcrumbs: [key('chatbot.menu.trackApplication')],
				options: [
					{ id: 'active', label: key('chatbot.track.activeApplications'), action: { kind: 'state', nextState: 'track.list', patch: { filterId: 'active' } } },
					{ id: 'completed', label: key('chatbot.track.completedApplications'), action: { kind: 'state', nextState: 'track.list', patch: { filterId: 'completed' } } },
					{ id: 'rejected', label: key('chatbot.track.rejectedApplications'), action: { kind: 'state', nextState: 'track.list', patch: { filterId: 'rejected' } } },
					{ id: 'all', label: key('chatbot.track.viewAll'), action: { kind: 'state', nextState: 'track.list', patch: { filterId: 'all' } } }
				],
				actions: commonActions,
				authRequired: !data.user
			};

		case 'track.list': {
			const applications = getApplicationList(data, context.filterId);
			return {
				state: 'track.list',
				title: key('chatbot.track.selectApplication'),
				description: key('chatbot.track.selectApplicationDescription'),
				breadcrumbs: [key('chatbot.menu.trackApplication')],
				options: applications.map((entry) => toApplicationOption(entry, locale, { kind: 'state', nextState: 'track.details', patch: { applicationId: entry.id } })),
				emptyTitle: key('chatbot.empty.noApplicationsTitle'),
				emptyDescription: key('chatbot.empty.noApplicationsDescription'),
				actions: commonActions,
				authRequired: !data.user
			};
		}

		case 'track.details':
			return {
				state: 'track.details',
				title: key('chatbot.track.applicationDetails'),
				description: key('chatbot.track.applicationDetailsDescription'),
				breadcrumbs: [key('chatbot.menu.trackApplication'), application ? value(application.applicationNumber) : key('chatbot.track.selectApplication')],
				options: [],
				resultCard: application ? buildApplicationResultCard(application, locale, translate) : undefined,
				actions: application
					? [
						{ id: 'viewApplication', label: key('chatbot.action.viewApplication'), action: { kind: 'navigate', href: `/applications/${application.id}` } },
						{ id: 'viewDocuments', label: key('chatbot.action.viewDocuments'), action: { kind: 'navigate', href: `/applications/${application.id}` } },
						...(application.status === 'CLARIFICATION_REQUESTED'
							? [{ id: 'correctApplication', label: key('chatbot.action.correctApplication'), action: { kind: 'navigate' as const, href: `/applications/${application.id}` } }]
							: []),
						{ id: 'contactHelpDesk', label: key('chatbot.action.contactHelpDesk'), action: { kind: 'navigate', href: '/help' } },
						...commonActions
					]
					: commonActions,
				authRequired: !data.user
			};

		case 'documents.method':
			return {
				state: 'documents.method',
				title: key('chatbot.documents.title'),
				description: key('chatbot.documents.description'),
				breadcrumbs: [key('chatbot.menu.requiredDocuments')],
				options: [
					{ id: 'recentlyUsedServices', label: key('chatbot.documents.recentlyUsedServices'), action: { kind: 'state', nextState: 'documents.services', patch: { methodId: 'recent' } }, disabled: getUniqueRecentServices(data).length === 0 },
					{ id: 'popularServices', label: key('chatbot.documents.popularServices'), action: { kind: 'state', nextState: 'documents.services', patch: { methodId: 'popular' } } },
					{ id: 'browseServices', label: key('chatbot.documents.browseServices'), action: { kind: 'state', nextState: 'documents.category' } }
				],
				actions: commonActions
			};

		case 'documents.category':
			return {
				state: 'documents.category',
				title: key('chatbot.documents.chooseCategory'),
				description: key('chatbot.documents.chooseCategoryDescription'),
				breadcrumbs: [key('chatbot.menu.requiredDocuments')],
				options: getServiceCategoryOptions(data, locale).map((option) => ({
					...option,
					action: { kind: 'state', nextState: 'documents.services', patch: { methodId: 'category', categoryId: option.id } }
				})),
				actions: commonActions
			};

		case 'documents.services': {
			const services = context.methodId === 'popular'
				? getPopularServices(data)
				: context.methodId === 'recent'
					? getUniqueRecentServices(data)
					: getServicesForCategory(data, context.categoryId);

			return {
				state: 'documents.services',
				title: key('chatbot.documents.selectService'),
				description: key('chatbot.documents.selectServiceDescription'),
				breadcrumbs: [key('chatbot.menu.requiredDocuments')],
				options: services.map((entry) => toServiceOption(entry, locale, { kind: 'state', nextState: 'documents.details', patch: { serviceId: entry.id } })),
				emptyTitle: key('chatbot.empty.noServicesTitle'),
				emptyDescription: key('chatbot.empty.noServicesDescription'),
				actions: commonActions
			};
		}

		case 'documents.details':
			return {
				state: 'documents.details',
				title: key('chatbot.documents.serviceRequirements'),
				description: key('chatbot.documents.serviceRequirementsDescription'),
				breadcrumbs: [key('chatbot.menu.requiredDocuments'), service ? value(getServiceName(service, locale)) : key('chatbot.documents.selectService')],
				options: [],
				resultCard: service ? buildDocumentsResultCard(service, locale) : undefined,
				actions: service
					? [
						{ id: 'uploadFromVault', label: key('chatbot.action.uploadFromVault'), action: authAction(data, '/documents'), disabled: !data.user || data.documents.length === 0 },
						{ id: 'uploadNewDocument', label: key('chatbot.action.uploadNewDocument'), action: authAction(data, '/documents') },
						...commonActions
					]
					: commonActions,
				authRequired: !data.user
			};

		case 'fees.method':
			return {
				state: 'fees.method',
				title: key('chatbot.fees.title'),
				description: key('chatbot.fees.description'),
				breadcrumbs: [key('chatbot.menu.feesProcessing')],
				options: [
					{ id: 'popularServices', label: key('chatbot.fees.popularServices'), action: { kind: 'state', nextState: 'fees.services', patch: { methodId: 'popular' } } },
					{ id: 'recentlyUsedServices', label: key('chatbot.fees.recentlyUsedServices'), action: { kind: 'state', nextState: 'fees.services', patch: { methodId: 'recent' } }, disabled: getUniqueRecentServices(data).length === 0 },
					{ id: 'browseByCategory', label: key('chatbot.fees.browseByCategory'), action: { kind: 'state', nextState: 'fees.category' } },
					{ id: 'browseByDepartment', label: key('chatbot.fees.browseByDepartment'), action: { kind: 'state', nextState: 'fees.department' } }
				],
				actions: commonActions
			};

		case 'fees.category':
			return {
				state: 'fees.category',
				title: key('chatbot.fees.chooseCategory'),
				description: key('chatbot.fees.chooseCategoryDescription'),
				breadcrumbs: [key('chatbot.menu.feesProcessing')],
				options: getServiceCategoryOptions(data, locale).map((option) => ({
					...option,
					action: { kind: 'state', nextState: 'fees.services', patch: { methodId: 'category', categoryId: option.id } }
				})),
				actions: commonActions
			};

		case 'fees.department':
			return {
				state: 'fees.department',
				title: key('chatbot.fees.chooseDepartment'),
				description: key('chatbot.fees.chooseDepartmentDescription'),
				breadcrumbs: [key('chatbot.menu.feesProcessing')],
				options: getDepartmentOptions(data, locale).map((option) => ({
					...option,
					action: { kind: 'state', nextState: 'fees.services', patch: { methodId: 'department', departmentId: option.id } }
				})),
				actions: commonActions
			};

		case 'fees.services': {
			const services = context.methodId === 'popular'
				? getPopularServices(data)
				: context.methodId === 'recent'
					? getUniqueRecentServices(data)
					: context.methodId === 'department'
						? getServicesForDepartment(data, context.departmentId)
						: getServicesForCategory(data, context.categoryId);

			return {
				state: 'fees.services',
				title: key('chatbot.fees.selectService'),
				description: key('chatbot.fees.selectServiceDescription'),
				breadcrumbs: [key('chatbot.menu.feesProcessing')],
				options: services.map((entry) => toServiceOption(entry, locale, { kind: 'state', nextState: 'fees.details', patch: { serviceId: entry.id } })),
				emptyTitle: key('chatbot.empty.noServicesTitle'),
				emptyDescription: key('chatbot.empty.noServicesDescription'),
				actions: commonActions
			};
		}

		case 'fees.details':
			return {
				state: 'fees.details',
				title: key('chatbot.fees.serviceFees'),
				description: key('chatbot.fees.serviceFeesDescription'),
				breadcrumbs: [key('chatbot.menu.feesProcessing'), service ? value(getServiceName(service, locale)) : key('chatbot.fees.selectService')],
				options: [],
				resultCard: service ? buildFeesResultCard(service, department, locale) : undefined,
				actions: service
					? [
						{ id: 'applyNow', label: key('chatbot.action.applyNow'), action: { kind: 'navigate', href: `/services/${service.slug}/apply` } },
						{ id: 'requiredDocuments', label: key('chatbot.action.requiredDocuments'), action: { kind: 'state', nextState: 'documents.details', patch: { serviceId: service.id } } },
						{ id: 'departmentOffice', label: key('chatbot.action.departmentOffice'), action: { kind: 'state', nextState: 'department.details', patch: { serviceId: service.id, departmentId: service.departmentId, methodId: 'service' } } },
						...commonActions
					]
					: commonActions
			};

		case 'department.method':
			return {
				state: 'department.method',
				title: key('chatbot.department.title'),
				description: key('chatbot.department.description'),
				breadcrumbs: [key('chatbot.menu.departmentOffice')],
				options: [
					{ id: 'whichDepartmentHandlesService', label: key('chatbot.department.whichDepartmentHandlesService'), action: { kind: 'state', nextState: 'department.service.category', patch: { methodId: 'service' } } },
					{ id: 'findOffice', label: key('chatbot.department.findOffice'), action: { kind: 'state', nextState: 'department.directory', patch: { methodId: 'findOffice' } } },
					{ id: 'officeAddress', label: key('chatbot.department.officeAddress'), action: { kind: 'state', nextState: 'department.directory', patch: { methodId: 'officeAddress' } } },
					{ id: 'workingHours', label: key('chatbot.department.workingHours'), action: { kind: 'state', nextState: 'department.directory', patch: { methodId: 'workingHours' } } },
					{ id: 'contactInformation', label: key('chatbot.department.contactInformation'), action: { kind: 'state', nextState: 'department.directory', patch: { methodId: 'contactInformation' } } }
				],
				actions: commonActions
			};

		case 'department.service.category':
			return {
				state: 'department.service.category',
				title: key('chatbot.department.chooseCategory'),
				description: key('chatbot.department.chooseCategoryDescription'),
				breadcrumbs: [key('chatbot.menu.departmentOffice')],
				options: getServiceCategoryOptions(data, locale).map((option) => ({
					...option,
					action: { kind: 'state', nextState: 'department.service.list', patch: { categoryId: option.id } }
				})),
				actions: commonActions
			};

		case 'department.service.list':
			return {
				state: 'department.service.list',
				title: key('chatbot.department.selectService'),
				description: key('chatbot.department.selectServiceDescription'),
				breadcrumbs: [key('chatbot.menu.departmentOffice')],
				options: getServicesForCategory(data, context.categoryId).map((entry) =>
					toServiceOption(entry, locale, { kind: 'state', nextState: 'department.details', patch: { serviceId: entry.id, departmentId: entry.departmentId } })
				),
				emptyTitle: key('chatbot.empty.noServicesTitle'),
				emptyDescription: key('chatbot.empty.noServicesDescription'),
				actions: commonActions
			};

		case 'department.directory':
			return {
				state: 'department.directory',
				title: key('chatbot.department.selectDepartment'),
				description: key('chatbot.department.selectDepartmentDescription'),
				breadcrumbs: [key('chatbot.menu.departmentOffice')],
				options: getDepartmentOptions(data, locale).map((option) => ({
					...option,
					action: { kind: 'state', nextState: 'department.details', patch: { departmentId: option.id } }
				})),
				actions: commonActions
			};

		case 'department.details':
			return {
				state: 'department.details',
				title: key('chatbot.department.departmentDetails'),
				description: key('chatbot.department.departmentDetailsDescription'),
				breadcrumbs: [key('chatbot.menu.departmentOffice'), service ? value(getServiceName(service, locale)) : department ? value(getDepartmentName(department, locale)) : key('chatbot.department.selectDepartment')],
				options: [],
				resultCard: buildDepartmentResultCard(department, service, context.methodId, locale),
				actions: [
					...(department?.website ? [{ id: 'viewOffice', label: key('chatbot.action.viewOffice'), action: { kind: 'external', href: department.website } as ThozhanAction }] : []),
					{ id: 'viewOnMap', label: key('chatbot.action.viewOnMap'), action: { kind: 'noop' }, disabled: true },
					{ id: 'getDirections', label: key('chatbot.action.getDirections'), action: { kind: 'noop' }, disabled: true },
					...(department?.contactPhone ? [{ id: 'contactOffice', label: key('chatbot.action.contactOffice'), action: { kind: 'external', href: `tel:${department.contactPhone}` } as ThozhanAction }] : []),
					...(service ? [{ id: 'applyForService', label: key('chatbot.action.applyForService'), action: { kind: 'navigate', href: `/services/${service.slug}/apply` } as ThozhanAction }] : []),
					...commonActions
				]
			};

		case 'help.topic':
			return {
				state: 'help.topic',
				title: key('chatbot.help.title'),
				description: key('chatbot.help.description'),
				breadcrumbs: [key('chatbot.menu.help')],
				options: helpTopics.map((topic) => ({
					id: topic.id,
					label: key(topic.key),
					action: { kind: 'state', nextState: 'help.issue', patch: { helpTopicId: topic.id } }
				})),
				actions: commonActions
			};

		case 'help.issue': {
			const topicId = (context.helpTopicId ?? 'contact') as HelpTopicId;
			return {
				state: 'help.issue',
				title: key(`chatbot.help.topic.${topicId}`),
				description: key(helpTopicDescriptions[topicId]),
				breadcrumbs: [key('chatbot.menu.help'), key(`chatbot.help.topic.${topicId}`)],
				options: helpIssues[topicId].map((issueId) => ({
					id: issueId,
					label: key(`chatbot.help.issue.${issueId}`),
					action: { kind: 'state', nextState: 'help.details', patch: { helpIssueId: issueId } }
				})),
				actions: commonActions
			};
		}

		case 'help.details': {
			const topicId = (context.helpTopicId ?? 'contact') as HelpTopicId;
			const issueId = context.helpIssueId ?? 'contactHelpDesk';
			return {
				state: 'help.details',
				title: key(`chatbot.help.issue.${issueId}`),
				description: key(helpTopicDescriptions[topicId]),
				breadcrumbs: [key('chatbot.menu.help'), key(`chatbot.help.topic.${topicId}`), key(`chatbot.help.issue.${issueId}`)],
				options: [],
				resultCard: issueId === 'unableToSubmit'
					? buildSubmitHelpCard(data, locale)
					: {
						title: key(`chatbot.help.issue.${issueId}`),
						subtitle: key(helpTopicDescriptions[topicId]),
						notice: key('chatbot.help.genericNotice')
					},
				actions: [...buildHelpActions(data, issueId), ...commonActions],
				authRequired: !data.user && topicId !== 'login' && topicId !== 'contact'
			};
		}
	}

	return {
		state: 'root',
		title: key('chatbot.controlled.title'),
		description: key('chatbot.controlled.description'),
		breadcrumbs: [],
		options: topLevelCategories.map((item) => ({
			id: item.id,
			label: key(item.key),
			action: { kind: 'state', nextState: item.next }
		})),
		actions: [{ id: 'startOver', label: key('chatbot.action.startOver'), action: { kind: 'noop' } }]
	};
}

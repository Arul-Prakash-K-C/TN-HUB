import type { AuthenticatedUser, ApplicationStatus } from '$lib/types';
import { getFirebaseAdminFirestore } from '$lib/server/firebase/admin';

type LocalizedText = { en: string; ta: string };

export type WorkflowTransitionDefinition = {
	id: string;
	fromState: string;
	toState: string;
	action: LocalizedText;
	requiredRole: string;
	requiresReason?: boolean;
	requiresDocuments?: boolean;
	autoTransition?: boolean;
};

export type WorkflowDefinition = {
	id: string;
	serviceId: string;
	name: LocalizedText;
	version: number;
	states: Array<{
		id: string;
		name: LocalizedText;
		description: LocalizedText;
		type: 'initial' | 'intermediate' | 'terminal' | 'error';
		assigneeRole?: string | null;
		slaHours?: number | null;
	}>;
	transitions: WorkflowTransitionDefinition[];
	initialState: string;
	terminalStates: string[];
	isActive: boolean;
};

export type AvailableWorkflowAction = {
	id: string;
	toState: ApplicationStatus;
	label: LocalizedText;
	requiresReason: boolean;
	requiresDocuments: boolean;
};

function isLocalizedText(value: unknown): value is LocalizedText {
	return !!value && typeof value === 'object' && typeof (value as LocalizedText).en === 'string' && typeof (value as LocalizedText).ta === 'string';
}

function assertWorkflow(value: unknown, workflowId: string): asserts value is WorkflowDefinition {
	if (!value || typeof value !== 'object') {
		throw new Error(`Workflow ${workflowId} has an invalid definition.`);
	}

	const workflow = value as Partial<WorkflowDefinition>;
	if (
		workflow.id !== workflowId ||
		typeof workflow.serviceId !== 'string' ||
		!isLocalizedText(workflow.name) ||
		!Array.isArray(workflow.states) ||
		!Array.isArray(workflow.transitions) ||
		typeof workflow.initialState !== 'string' ||
		!Array.isArray(workflow.terminalStates)
	) {
		throw new Error(`Workflow ${workflowId} has an invalid definition.`);
	}
}

/** Loads the reusable Firestore workflow used by a service application. */
export async function getWorkflowDefinition(workflowId: string): Promise<WorkflowDefinition | null> {
	const snapshot = await getFirebaseAdminFirestore().collection('workflows').doc(workflowId).get();
	if (!snapshot.exists) return null;

	const workflow = snapshot.data();
	assertWorkflow(workflow, workflowId);
	return { ...workflow, isActive: workflow.isActive !== false };
}

function roleCanPerformTransition(user: AuthenticatedUser, requiredRole: string): boolean {
	if (user.role === 'admin') return requiredRole !== 'system';

	switch (requiredRole) {
		case 'citizen':
			return user.role === 'citizen';
		case 'department_user':
		case 'officer':
			return user.role === 'department_user';
		case 'operator':
			return user.role === 'operator';
		default:
			return false;
	}
}

export function getAvailableWorkflowActions(
	workflow: WorkflowDefinition,
	currentStatus: ApplicationStatus,
	user: AuthenticatedUser
): AvailableWorkflowAction[] {
	if (!workflow.isActive) return [];

	return workflow.transitions
		.filter((transition) =>
			transition.fromState === currentStatus &&
			!transition.autoTransition &&
			roleCanPerformTransition(user, transition.requiredRole)
		)
		.map((transition) => ({
			id: transition.id,
			toState: transition.toState as ApplicationStatus,
			label: transition.action,
			requiresReason: transition.requiresReason === true,
			requiresDocuments: transition.requiresDocuments === true
		}));
}

export function getWorkflowTransition(
	workflow: WorkflowDefinition,
	currentStatus: ApplicationStatus,
	user: AuthenticatedUser,
	transitionId: string
): WorkflowTransitionDefinition | null {
	if (!workflow.isActive) return null;

	return workflow.transitions.find((transition) =>
		transition.id === transitionId &&
		transition.fromState === currentStatus &&
		!transition.autoTransition &&
		roleCanPerformTransition(user, transition.requiredRole)
	) ?? null;
}

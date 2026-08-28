import { dev } from '$app/environment';
import { getFirebaseAdminFirestore } from '$lib/server/firebase/admin';
import { workflows as fallbackWorkflows } from '$lib/data/workflows';

function localized(en, ta) {
    return { en, ta };
}
function canUseFixtureFallback() {
    return dev || process.env.TN_KUVIYAM_ALLOW_FIXTURE_FALLBACK === 'true';
}

function toWorkflowDefinition(workflow) {
    return {
        id: workflow.id,
        serviceId: workflow.serviceId,
        name: localized(workflow.name, workflow.nameTA),
        version: workflow.version,
        states: workflow.states.map((state) => ({
            ...state,
            name: localized(state.name, state.nameTA),
            description: localized(state.description, state.descriptionTA)
        })),
        transitions: workflow.transitions.map((transition) => ({
            ...transition,
            action: localized(transition.action, transition.actionTA)
        })),
        initialState: workflow.initialState,
        terminalStates: workflow.terminalStates,
        isActive: true,
        createdAt: workflow.createdAt,
        updatedAt: workflow.updatedAt
    };
}

function isLocalizedText(value) {
    return !!value && typeof value === 'object' && typeof value.en === 'string' && typeof value.ta === 'string';
}
function assertWorkflow(value, workflowId) {
    if (!value || typeof value !== 'object') {
        throw new Error(`Workflow ${workflowId} has an invalid definition.`);
    }
    const workflow = value;
    if (workflow.id !== workflowId ||
        typeof workflow.serviceId !== 'string' ||
        !isLocalizedText(workflow.name) ||
        !Array.isArray(workflow.states) ||
        !Array.isArray(workflow.transitions) ||
        typeof workflow.initialState !== 'string' ||
        !Array.isArray(workflow.terminalStates)) {
        throw new Error(`Workflow ${workflowId} has an invalid definition.`);
    }
}
/** Loads the reusable Firestore workflow used by a service application. */
export async function getWorkflowDefinition(workflowId) {
    try {
        const snapshot = await getFirebaseAdminFirestore().collection('workflows').doc(workflowId).get();
        if (snapshot.exists) {
            const workflow = snapshot.data();
            assertWorkflow(workflow, workflowId);
            return { ...workflow, isActive: workflow.isActive !== false };
        }
    }
    catch (cause) {
        if (!canUseFixtureFallback()) {
            throw cause;
        }
        console.warn(`[workflow] Firestore workflow lookup unavailable; using bundled fallback. ${cause instanceof Error ? cause.message : String(cause)}`);
    }
    if (!canUseFixtureFallback())
        return null;
    const fallback = fallbackWorkflows.find((workflow) => workflow.id === workflowId);
    return fallback ? toWorkflowDefinition(fallback) : null;
}
function roleCanPerformTransition(user, requiredRole) {
    if (user.role === 'admin')
        return requiredRole !== 'system';
    switch (requiredRole) {
        case 'citizen':
            return user.role === 'citizen' || user.role === 'operator';
        case 'department_user':
        case 'officer':
            return user.role === 'department_user';
        case 'operator':
            return user.role === 'operator';
        default:
            return false;
    }
}
function canUseSyntheticReject(user, currentStatus, workflow) {
    return user.role === 'department_user' &&
        !workflow.terminalStates.includes(currentStatus) &&
        currentStatus !== 'DRAFT' &&
        currentStatus !== 'SUBMITTED';
}
function buildSyntheticRejectTransition(currentStatus) {
    return {
        id: 'reject',
        fromState: currentStatus,
        toState: 'REJECTED',
        action: localized('Reject', 'Reject'),
        requiresReason: true,
        requiresDocuments: false,
        requiredRole: 'officer',
        autoTransition: false
    };
}
export function getAvailableWorkflowActions(workflow, currentStatus, user) {
    if (!workflow.isActive)
        return [];
    const actions = workflow.transitions
        .filter((transition) => transition.fromState === currentStatus &&
        !transition.autoTransition &&
        roleCanPerformTransition(user, transition.requiredRole))
        .map((transition) => ({
        id: transition.id,
        toState: transition.toState,
        label: transition.action,
        requiresReason: transition.requiresReason === true,
        requiresDocuments: transition.requiresDocuments === true
    }));
    if (!actions.some((action) => action.toState === 'REJECTED') && canUseSyntheticReject(user, currentStatus, workflow)) {
        actions.push({
            id: 'reject',
            toState: 'REJECTED',
            label: localized('Reject', 'Reject'),
            requiresReason: true,
            requiresDocuments: false
        });
    }
    return actions;
}
export function getWorkflowTransition(workflow, currentStatus, user, transitionId) {
    if (!workflow.isActive)
        return null;
    const transition = workflow.transitions.find((candidate) => candidate.id === transitionId &&
        candidate.fromState === currentStatus &&
        !candidate.autoTransition &&
        roleCanPerformTransition(user, candidate.requiredRole)) ?? null;
    if (transition)
        return transition;
    if (transitionId === 'reject' && canUseSyntheticReject(user, currentStatus, workflow)) {
        return buildSyntheticRejectTransition(currentStatus);
    }
    return workflow.transitions.find((transition) => transition.id === transitionId &&
        transition.fromState === currentStatus &&
        !transition.autoTransition &&
        roleCanPerformTransition(user, transition.requiredRole)) ?? null;
}

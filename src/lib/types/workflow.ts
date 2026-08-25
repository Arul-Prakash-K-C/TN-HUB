// ============================================
// WORKFLOW TYPES
// ============================================

export interface WorkflowState {
  id: string;
  name: string;
  nameTA: string;
  description: string;
  descriptionTA: string;
  type: 'initial' | 'intermediate' | 'terminal' | 'error';
  assigneeRole?: 'citizen' | 'officer' | 'system';
  slaHours?: number;
}

export interface WorkflowTransition {
  id: string;
  fromState: string;
  toState: string;
  action: string;
  actionTA: string;
  requiredRole: 'citizen' | 'officer' | 'system';
  requiresReason?: boolean;
  requiresDocuments?: boolean;
  autoTransition?: boolean;
}

export interface Workflow {
  id: string;
  serviceId: string;
  name: string;
  nameTA: string;
  version: number;
  states: WorkflowState[];
  transitions: WorkflowTransition[];
  initialState: string;
  terminalStates: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowAuditEntry {
  id: string;
  applicationId: string;
  workflowId: string;
  fromState: string;
  toState: string;
  transitionId: string;
  actorId: string;
  actorRole: string;
  timestamp: string;
  remarks?: string;
  metadata?: Record<string, unknown>;
}

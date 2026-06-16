export type TokenScope =
  | 'customers:read' | 'customers:write'
  | 'vehicles:read' | 'vehicles:write'
  | 'bookings:read' | 'bookings:write'
  | 'visits:read' | 'visits:write'
  | 'invoices:read' | 'invoices:write'
  | 'products:read' | 'products:write'
  | 'services:read' | 'services:write'
  | 'inspections:read' | 'inspections:write'
  | 'fleet:read' | 'fleet:write'
  | 'communications:read' | 'communications:write';

export interface ApiToken {
  id: string;
  name: string;
  scopes: TokenScope[];
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  preview: string;
}

export interface OAuthClient {
  id: string;
  clientId: string;
  name: string;
  scopes: TokenScope[];
  createdAt: string;
  lastUsedAt: string | null;
}

export type WebhookEventType =
  | 'booking.created' | 'booking.rescheduled' | 'booking.cancelled'
  | 'visit.started' | 'visit.completed'
  | 'invoice.paid' | 'invoice.voided'
  | 'customer.created' | 'customer.updated'
  | 'recommendation.approved' | 'recommendation.decided'
  | 'fleet.session_closed'
  | 'campaign.started' | 'campaign.completed'
  | 'inspection.completed'
  | 'plan.enrolled' | 'plan.renewed' | 'plan.cancelled';

export type DeliveryStatus = 'delivered' | 'failed' | 'retrying' | 'pending';

export interface WebhookEndpoint {
  id: string;
  url: string;
  events: WebhookEventType[];
  secretPreview: string;
  active: boolean;
  createdAt: string;
}

export interface WebhookDelivery {
  id: string;
  endpointId: string;
  eventType: WebhookEventType;
  status: DeliveryStatus;
  attempts: number;
  responseStatus: number | null;
  latencyMs: number | null;
  deliveredAt: string;
}

export type WorkflowTrigger =
  | 'booking.created' | 'booking.rescheduled' | 'booking.cancelled'
  | 'visit.completed' | 'invoice.paid'
  | 'inspection.completed' | 'inspection.critical_findings'
  | 'recommendation.deferred_60d'
  | 'customer.no_visit_180d'
  | 'fleet.credit_limit_80pct'
  | 'warranty.expires_30d'
  | 'plan.enrolled' | 'plan.renewed';

export type WorkflowActionType =
  | 'send_email' | 'send_sms'
  | 'add_to_segment' | 'create_task'
  | 'send_slack' | 'send_webhook'
  | 'create_discount' | 'add_tag'
  | 'schedule_trigger' | 'send_campaign_step'
  | 'route_notification';

export type WorkflowStatus = 'active' | 'paused' | 'draft';

export interface WorkflowCondition {
  id: string;
  logic: 'AND' | 'OR';
  field: string;
  operator: string;
  value: string;
}

export interface WorkflowAction {
  id: string;
  type: WorkflowActionType;
  config: Record<string, string>;
}

export interface Workflow {
  id: string;
  name: string;
  triggerType: WorkflowTrigger;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  status: WorkflowStatus;
  source: 'builder' | 'campaign';
  executionCount: number;
  lastExecutedAt: string | null;
  createdAt: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  triggerEvent: string;
  conditionsMatched: boolean;
  actionsLog: { type: WorkflowActionType; status: 'success' | 'failed'; detail: string }[];
  startedAt: string;
  status: 'success' | 'partial' | 'failed';
}

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  summary: string;
  resource: string;
}

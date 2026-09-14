import type {
  ApiToken, OAuthClient, WebhookEndpoint, WebhookDelivery,
  Workflow, WorkflowExecution, ApiEndpoint,
} from './types';

export const API_TOKENS: ApiToken[] = [
  {
    id: 'tok-1',
    name: 'Production Integration',
    scopes: ['customers:read', 'vehicles:read', 'bookings:read', 'bookings:write', 'invoices:read'],
    lastUsedAt: '2026-06-16T08:14:00Z',
    revokedAt: null,
    createdAt: '2026-01-10T09:00:00Z',
    preview: 'fb-business-connect_live_sk_****4a2f',
  },
  {
    id: 'tok-2',
    name: 'Zapier Connector',
    scopes: ['customers:read', 'customers:write', 'bookings:read', 'bookings:write', 'visits:read'],
    lastUsedAt: '2026-06-15T22:00:00Z',
    revokedAt: null,
    createdAt: '2026-02-18T14:30:00Z',
    preview: 'fb-business-connect_live_sk_****9b1c',
  },
  {
    id: 'tok-3',
    name: 'Reporting Warehouse',
    scopes: ['customers:read', 'invoices:read', 'visits:read', 'inspections:read'],
    lastUsedAt: '2026-06-10T03:00:00Z',
    revokedAt: null,
    createdAt: '2026-03-05T11:00:00Z',
    preview: 'fb-business-connect_live_sk_****c7d3',
  },
  {
    id: 'tok-4',
    name: 'Old CRM Sync (deprecated)',
    scopes: ['customers:read', 'customers:write'],
    lastUsedAt: '2025-11-02T16:45:00Z',
    revokedAt: '2026-01-01T00:00:00Z',
    createdAt: '2025-06-01T10:00:00Z',
    preview: 'fb-business-connect_live_sk_****0e5a',
  },
];

export const OAUTH_CLIENTS: OAuthClient[] = [
  {
    id: 'oc-1',
    clientId: 'client_fb-business-connect_DealerSocket_9X2',
    name: 'DealerSocket DMS Connector',
    scopes: ['customers:read', 'customers:write', 'vehicles:read', 'vehicles:write', 'invoices:read'],
    createdAt: '2026-03-20T09:00:00Z',
    lastUsedAt: '2026-06-16T07:30:00Z',
  },
  {
    id: 'oc-2',
    clientId: 'client_fb-business-connect_QuickBooks_7P4',
    name: 'QuickBooks Sync',
    scopes: ['invoices:read', 'customers:read'],
    createdAt: '2026-04-01T10:00:00Z',
    lastUsedAt: '2026-06-16T00:01:00Z',
  },
];

export const WEBHOOK_ENDPOINTS: WebhookEndpoint[] = [
  {
    id: 'wh-1',
    url: 'https://hooks.dealersocket.com/fb-business-connect/v1/inbound',
    events: ['booking.created', 'booking.cancelled', 'visit.completed', 'invoice.paid'],
    secretPreview: 'whsec_****kL7m',
    active: true,
    createdAt: '2026-02-10T09:00:00Z',
  },
  {
    id: 'wh-2',
    url: 'https://hooks.zapier.com/hooks/catch/1234567/abcdef/',
    events: ['customer.created', 'customer.updated', 'visit.completed', 'recommendation.approved'],
    secretPreview: 'whsec_****pQ3n',
    active: true,
    createdAt: '2026-03-15T14:00:00Z',
  },
  {
    id: 'wh-3',
    url: 'https://internal.acme-fleet.com/fb-business-connect-events',
    events: ['fleet.session_closed', 'invoice.paid', 'booking.created'],
    secretPreview: 'whsec_****xR9s',
    active: false,
    createdAt: '2026-01-20T11:00:00Z',
  },
];

export const WEBHOOK_DELIVERIES: WebhookDelivery[] = [
  { id: 'wd-1', endpointId: 'wh-1', eventType: 'invoice.paid',       status: 'delivered', attempts: 1, responseStatus: 200, latencyMs: 142,  deliveredAt: '2026-06-16T08:10:00Z' },
  { id: 'wd-2', endpointId: 'wh-2', eventType: 'customer.created',   status: 'delivered', attempts: 1, responseStatus: 200, latencyMs: 87,   deliveredAt: '2026-06-16T07:45:00Z' },
  { id: 'wd-3', endpointId: 'wh-1', eventType: 'booking.created',    status: 'delivered', attempts: 1, responseStatus: 200, latencyMs: 201,  deliveredAt: '2026-06-16T07:30:00Z' },
  { id: 'wd-4', endpointId: 'wh-2', eventType: 'visit.completed',    status: 'failed',    attempts: 6, responseStatus: 503, latencyMs: 5002, deliveredAt: '2026-06-16T06:15:00Z' },
  { id: 'wd-5', endpointId: 'wh-1', eventType: 'visit.completed',    status: 'delivered', attempts: 2, responseStatus: 200, latencyMs: 330,  deliveredAt: '2026-06-16T05:00:00Z' },
  { id: 'wd-6', endpointId: 'wh-2', eventType: 'recommendation.approved', status: 'retrying', attempts: 3, responseStatus: 500, latencyMs: 4100, deliveredAt: '2026-06-16T04:30:00Z' },
  { id: 'wd-7', endpointId: 'wh-1', eventType: 'invoice.paid',       status: 'delivered', attempts: 1, responseStatus: 200, latencyMs: 99,   deliveredAt: '2026-06-15T22:00:00Z' },
  { id: 'wd-8', endpointId: 'wh-1', eventType: 'booking.cancelled',  status: 'delivered', attempts: 1, responseStatus: 201, latencyMs: 155,  deliveredAt: '2026-06-15T20:00:00Z' },
];

export const WORKFLOWS: Workflow[] = [
  {
    id: 'wf-1',
    name: 'Post-Visit Follow-Up',
    triggerType: 'visit.completed',
    conditions: [
      { id: 'c1', logic: 'AND', field: 'customer.ltv', operator: '>', value: 'R 9,250' },
      { id: 'c2', logic: 'AND', field: 'visit.total', operator: '>', value: 'R 1,850' },
    ],
    actions: [
      { id: 'a1', type: 'send_email', config: { template: 'Post-Visit Thank You', delay: '1h' } },
      { id: 'a2', type: 'add_to_segment', config: { segment: 'High-Value Customers' } },
    ],
    status: 'active',
    source: 'builder',
    executionCount: 247,
    lastExecutedAt: '2026-06-16T07:55:00Z',
    createdAt: '2026-01-15T09:00:00Z',
  },
  {
    id: 'wf-2',
    name: 'Win-Back: Lapsed Customers',
    triggerType: 'customer.no_visit_180d',
    conditions: [
      { id: 'c1', logic: 'AND', field: 'customer.ltv', operator: '>', value: 'R 3,700' },
    ],
    actions: [
      { id: 'a1', type: 'send_sms', config: { template: "We miss you — 15% off your next visit", delay: '0' } },
      { id: 'a2', type: 'create_discount', config: { amount: '15%', expires: '30d' } },
      { id: 'a3', type: 'create_task', config: { assignTo: 'Service Advisor', note: 'Call lapsed customer' } },
    ],
    status: 'active',
    source: 'builder',
    executionCount: 34,
    lastExecutedAt: '2026-06-15T09:00:00Z',
    createdAt: '2026-02-20T10:00:00Z',
  },
  {
    id: 'wf-3',
    name: 'Critical Inspection Alert',
    triggerType: 'inspection.critical_findings',
    conditions: [
      { id: 'c1', logic: 'AND', field: 'inspection.critical_count', operator: '>=', value: '2' },
    ],
    actions: [
      { id: 'a1', type: 'send_sms', config: { template: 'Urgent: your inspection found critical issues', delay: '0' } },
      { id: 'a2', type: 'route_notification', config: { role: 'Service Manager', channel: 'Slack #alerts' } },
    ],
    status: 'active',
    source: 'builder',
    executionCount: 12,
    lastExecutedAt: '2026-06-14T14:20:00Z',
    createdAt: '2026-03-01T08:00:00Z',
  },
  {
    id: 'wf-4',
    name: 'Warranty Expiry Reminder',
    triggerType: 'warranty.expires_30d',
    conditions: [],
    actions: [
      { id: 'a1', type: 'send_email', config: { template: 'Warranty Expiry Notice', delay: '0' } },
    ],
    status: 'paused',
    source: 'builder',
    executionCount: 88,
    lastExecutedAt: '2026-06-01T09:00:00Z',
    createdAt: '2026-02-10T09:00:00Z',
  },
  {
    id: 'wf-5',
    name: 'Post-Campaign Follow-Up (from Campaigns)',
    triggerType: 'visit.completed',
    conditions: [
      { id: 'c1', logic: 'AND', field: 'campaign.source', operator: '=', value: 'Summer Tire Sale 2026' },
    ],
    actions: [
      { id: 'a1', type: 'send_campaign_step', config: { step: 'Review Request', campaign: 'Summer Tire Sale 2026' } },
    ],
    status: 'active',
    source: 'campaign',
    executionCount: 61,
    lastExecutedAt: '2026-06-16T06:00:00Z',
    createdAt: '2026-05-28T08:00:00Z',
  },
];

export const WORKFLOW_EXECUTIONS: WorkflowExecution[] = [
  {
    id: 'ex-1',
    workflowId: 'wf-1',
    workflowName: 'Post-Visit Follow-Up',
    triggerEvent: 'visit.completed — Visit #V-4821 (Sarah Chen)',
    conditionsMatched: true,
    actionsLog: [
      { type: 'send_email', status: 'success', detail: 'Email sent to sarah.chen@email.com' },
      { type: 'add_to_segment', status: 'success', detail: 'Added to High-Value Customers' },
    ],
    startedAt: '2026-06-16T07:55:00Z',
    status: 'success',
  },
  {
    id: 'ex-2',
    workflowId: 'wf-3',
    workflowName: 'Critical Inspection Alert',
    triggerEvent: 'inspection.completed — Inspection #I-0291 (Marcus Johnson)',
    conditionsMatched: true,
    actionsLog: [
      { type: 'send_sms', status: 'success', detail: 'SMS delivered to +1 (555) 201-2345' },
      { type: 'route_notification', status: 'success', detail: 'Slack #alerts notified' },
    ],
    startedAt: '2026-06-14T14:20:00Z',
    status: 'success',
  },
  {
    id: 'ex-3',
    workflowId: 'wf-2',
    workflowName: 'Win-Back: Lapsed Customers',
    triggerEvent: 'customer.no_visit_180d — Diana Ruiz',
    conditionsMatched: true,
    actionsLog: [
      { type: 'send_sms', status: 'success', detail: 'SMS delivered to +1 (555) 400-6789' },
      { type: 'create_discount', status: 'success', detail: 'Discount code WINBACK15 created' },
      { type: 'create_task', status: 'failed', detail: 'No service advisor assigned — task not created' },
    ],
    startedAt: '2026-06-15T09:00:00Z',
    status: 'partial',
  },
  {
    id: 'ex-4',
    workflowId: 'wf-5',
    workflowName: 'Post-Campaign Follow-Up (from Campaigns)',
    triggerEvent: 'visit.completed — Visit #V-4800 (Ben Nakamura)',
    conditionsMatched: false,
    actionsLog: [],
    startedAt: '2026-06-16T06:00:00Z',
    status: 'failed',
  },
];

export const API_ENDPOINTS: ApiEndpoint[] = [
  { method: 'GET',    path: '/v1/customers',           summary: 'List customers',              resource: 'Customers' },
  { method: 'POST',   path: '/v1/customers',           summary: 'Create customer',             resource: 'Customers' },
  { method: 'GET',    path: '/v1/customers/:id',       summary: 'Get customer',                resource: 'Customers' },
  { method: 'PUT',    path: '/v1/customers/:id',       summary: 'Update customer',             resource: 'Customers' },
  { method: 'GET',    path: '/v1/vehicles',            summary: 'List vehicles',               resource: 'Vehicles' },
  { method: 'POST',   path: '/v1/vehicles',            summary: 'Create vehicle',              resource: 'Vehicles' },
  { method: 'GET',    path: '/v1/vehicles/:id',        summary: 'Get vehicle',                 resource: 'Vehicles' },
  { method: 'GET',    path: '/v1/bookings',            summary: 'List bookings',               resource: 'Bookings' },
  { method: 'POST',   path: '/v1/bookings',            summary: 'Create booking',              resource: 'Bookings' },
  { method: 'GET',    path: '/v1/bookings/:id',        summary: 'Get booking',                 resource: 'Bookings' },
  { method: 'PATCH',  path: '/v1/bookings/:id',        summary: 'Update booking',              resource: 'Bookings' },
  { method: 'DELETE', path: '/v1/bookings/:id',        summary: 'Cancel booking',              resource: 'Bookings' },
  { method: 'GET',    path: '/v1/visits',              summary: 'List visits',                 resource: 'Visits' },
  { method: 'GET',    path: '/v1/visits/:id',          summary: 'Get visit',                   resource: 'Visits' },
  { method: 'GET',    path: '/v1/invoices',            summary: 'List invoices',               resource: 'Invoices' },
  { method: 'GET',    path: '/v1/invoices/:id',        summary: 'Get invoice',                 resource: 'Invoices' },
  { method: 'GET',    path: '/v1/products',            summary: 'List products / SKUs',        resource: 'Products' },
  { method: 'GET',    path: '/v1/products/:id',        summary: 'Get product',                 resource: 'Products' },
  { method: 'GET',    path: '/v1/services',            summary: 'List service types',          resource: 'Services' },
  { method: 'GET',    path: '/v1/inspections',         summary: 'List inspections',            resource: 'Inspections' },
  { method: 'GET',    path: '/v1/inspections/:id',     summary: 'Get inspection',              resource: 'Inspections' },
  { method: 'GET',    path: '/v1/fleet/accounts',      summary: 'List fleet accounts',         resource: 'Fleet' },
  { method: 'GET',    path: '/v1/fleet/accounts/:id',  summary: 'Get fleet account',           resource: 'Fleet' },
];

export const USAGE_STATS = {
  apiCallsThisPeriod: 34_821,
  apiCallsLimit: 150_000,
  webhookDeliveries: 1_247,
  webhookFailures: 8,
  workflowExecutions: 442,
  topEndpoints: [
    { path: 'GET /v1/customers',  calls: 12_402 },
    { path: 'GET /v1/bookings',   calls: 8_991 },
    { path: 'POST /v1/bookings',  calls: 5_217 },
    { path: 'GET /v1/invoices',   calls: 4_803 },
    { path: 'GET /v1/visits',     calls: 3_408 },
  ],
};

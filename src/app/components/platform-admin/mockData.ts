import type {
  PlatformAdmin, Tenant, CrossTenantAccessLog, FeatureFlag,
  PlatformAnnouncement, Credential, CredentialAccessLog,
  OperationalToolLog, StatusService, Incident,
} from './types';

export const CURRENT_ADMIN: PlatformAdmin = {
  id: 'adm_001',
  email: 'ops@fb-business-connect.com',
  name: 'Alex Rivera',
  role: 'super_admin',
  mfaEnabled: true,
  createdAt: '2024-01-15T09:00:00Z',
};

export const MOCK_TENANTS: Tenant[] = [
  {
    id: 'shop_001', businessName: "Ace Tire & Auto", ownerName: "Marcus Webb",
    ownerEmail: "marcus@acetire.com", subdomain: "acetire",
    planTier: 'pro', lifecycleState: 'active', stripeConnectStatus: 'connected',
    createdAt: '2024-03-12T10:00:00Z', lastActivityAt: '2026-06-15T14:22:00Z',
    mrrCents: 14900, locationCount: 3, technicianCount: 11, trialExtensions: [],
  },
  {
    id: 'shop_002', businessName: "Premier Wheel Works", ownerName: "Sandra Kim",
    ownerEmail: "sandra@premierwheel.com", subdomain: "premierwheel",
    planTier: 'enterprise', lifecycleState: 'active', stripeConnectStatus: 'connected',
    createdAt: '2023-11-05T08:30:00Z', lastActivityAt: '2026-06-15T13:45:00Z',
    mrrCents: 49900, locationCount: 8, technicianCount: 34, trialExtensions: [],
  },
  {
    id: 'shop_003', businessName: "FastFit Tires", ownerName: "Jordan Lee",
    ownerEmail: "jordan@fastfit.com", subdomain: "fastfit",
    planTier: 'starter', lifecycleState: 'trial', stripeConnectStatus: 'pending',
    trialEndsAt: '2026-06-28T00:00:00Z',
    createdAt: '2026-06-08T11:00:00Z', lastActivityAt: '2026-06-14T09:00:00Z',
    mrrCents: 0, locationCount: 1, technicianCount: 2, trialExtensions: [],
  },
  {
    id: 'shop_004', businessName: "RoadGrip Auto", ownerName: "Patricia Moore",
    ownerEmail: "pat@roadgrip.com", subdomain: "roadgrip",
    planTier: 'pro', lifecycleState: 'suspended', stripeConnectStatus: 'restricted',
    createdAt: '2024-07-20T14:00:00Z', lastActivityAt: '2026-05-01T10:30:00Z',
    mrrCents: 14900, locationCount: 2, technicianCount: 6,
    suspendedReason: 'Payment failed after 3 retry attempts. Awaiting updated card.',
    trialExtensions: [],
  },
  {
    id: 'shop_005', businessName: "QuickRoll Garage", ownerName: "David Cheng",
    ownerEmail: "david@quickroll.com", subdomain: "quickroll",
    planTier: 'starter', lifecycleState: 'archived', stripeConnectStatus: 'disconnected',
    createdAt: '2023-08-01T09:00:00Z', lastActivityAt: '2025-12-15T08:00:00Z',
    mrrCents: 0, locationCount: 1, technicianCount: 0,
    suspendedReason: 'Owner requested cancellation. Account archived per request.',
    trialExtensions: [],
  },
  {
    id: 'shop_006', businessName: "TireXpress Hub", ownerName: "Emma Davis",
    ownerEmail: "emma@tirexpress.com", subdomain: "tirexpress",
    planTier: 'pro', lifecycleState: 'provisioning', stripeConnectStatus: 'pending',
    createdAt: '2026-06-15T08:00:00Z', lastActivityAt: '2026-06-15T08:00:00Z',
    mrrCents: 14900, locationCount: 0, technicianCount: 0, trialExtensions: [],
  },
  {
    id: 'shop_007', businessName: "Metro Alignment Co.", ownerName: "Ryan Thompson",
    ownerEmail: "ryan@metroalign.com", subdomain: "metroalign",
    planTier: 'enterprise', lifecycleState: 'active', stripeConnectStatus: 'connected',
    createdAt: '2024-01-10T09:00:00Z', lastActivityAt: '2026-06-15T12:00:00Z',
    mrrCents: 49900, locationCount: 12, technicianCount: 52, trialExtensions: [],
  },
];

export const MOCK_ACCESS_LOGS: CrossTenantAccessLog[] = [
  {
    id: 'log_001', adminId: 'adm_001', adminEmail: 'ops@fb-business-connect.com', adminName: 'Alex Rivera',
    targetShopId: 'shop_001', targetShopName: 'Ace Tire & Auto',
    action: 'view_billing', writtenReason: 'Investigating failed charge report from owner.',
    recordKind: 'billing_subscription', sessionId: 'ses_abc123',
    durationSeconds: 187, createdAt: '2026-06-15T11:30:00Z', piiAccessed: false,
  },
  {
    id: 'log_002', adminId: 'adm_002', adminEmail: 'support@fb-business-connect.com', adminName: 'Jamie Chen',
    targetShopId: 'shop_002', targetShopName: 'Premier Wheel Works',
    action: 'view_customers', writtenReason: 'Debugging duplicate customer import issue. Ticket #4821.',
    recordKind: 'customer_records', sessionId: 'ses_def456',
    durationSeconds: 412, createdAt: '2026-06-14T15:20:00Z', piiAccessed: true,
  },
  {
    id: 'log_003', adminId: 'adm_001', adminEmail: 'ops@fb-business-connect.com', adminName: 'Alex Rivera',
    targetShopId: 'shop_004', targetShopName: 'RoadGrip Auto',
    action: 'suspend_tenant', writtenReason: 'Payment failed 3x. Suspending per dunning policy.',
    recordKind: 'tenant_lifecycle', sessionId: 'ses_ghi789',
    durationSeconds: 45, createdAt: '2026-06-10T09:15:00Z', piiAccessed: false,
  },
  {
    id: 'log_004', adminId: 'adm_003', adminEmail: 'infra@fb-business-connect.com', adminName: 'Sam Patel',
    targetShopId: 'shop_007', targetShopName: 'Metro Alignment Co.',
    action: 'view_appointments', writtenReason: 'Validating booking sync after webhook replay. Ticket #5102.',
    recordKind: 'appointment_data', sessionId: 'ses_jkl012',
    durationSeconds: 330, createdAt: '2026-06-13T16:05:00Z', piiAccessed: true,
  },
];

export const MOCK_FEATURE_FLAGS: FeatureFlag[] = [
  {
    id: 'ff_001', key: 'multi_location_dashboard', description: 'Unified dashboard across all locations',
    scopeType: 'global', enabled: true, createdBy: 'Alex Rivera', updatedAt: '2026-05-01T10:00:00Z',
  },
  {
    id: 'ff_002', key: 'ai_job_summary', description: 'AI-generated job summary on invoice',
    scopeType: 'plan_tier', scopeId: 'enterprise', scopeLabel: 'Enterprise',
    enabled: true, createdBy: 'Jamie Chen', updatedAt: '2026-06-01T09:00:00Z',
  },
  {
    id: 'ff_003', key: 'live_chat_widget', description: 'Embedded live chat for customer-facing storefront',
    scopeType: 'global', enabled: false, createdBy: 'Sam Patel', updatedAt: '2026-04-20T14:30:00Z',
  },
  {
    id: 'ff_004', key: 'stripe_express_payouts', description: 'Instant payout via Stripe Express',
    scopeType: 'plan_tier', scopeId: 'pro', scopeLabel: 'Pro',
    enabled: true, createdBy: 'Alex Rivera', updatedAt: '2026-03-15T11:00:00Z',
  },
  {
    id: 'ff_005', key: 'beta_catalog_v2', description: 'Next-gen distributor catalog with real-time pricing',
    scopeType: 'tenant', scopeId: 'shop_002', scopeLabel: 'Premier Wheel Works',
    enabled: true, createdBy: 'Sam Patel', updatedAt: '2026-06-10T16:00:00Z',
  },
  {
    id: 'ff_006', key: 'commission_auto_calc', description: 'Automatic technician commission calculation on invoice close',
    scopeType: 'plan_tier', scopeId: 'pro', scopeLabel: 'Pro',
    enabled: true, createdBy: 'Jamie Chen', updatedAt: '2026-02-28T09:30:00Z',
  },
  {
    id: 'ff_007', key: 'sms_two_way', description: 'Two-way SMS inbox in notifications module',
    scopeType: 'global', enabled: true, createdBy: 'Alex Rivera', updatedAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'ff_008', key: 'warranty_claims_portal', description: 'Customer-facing warranty claim submission',
    scopeType: 'tenant', scopeId: 'shop_007', scopeLabel: 'Metro Alignment Co.',
    enabled: false, createdBy: 'Alex Rivera', updatedAt: '2026-06-12T13:00:00Z',
  },
];

export const MOCK_ANNOUNCEMENTS: PlatformAnnouncement[] = [
  {
    id: 'ann_001', title: 'Scheduled Maintenance – Saturday 2 AM – 4 AM EDT',
    body: 'We will be performing database maintenance. Storefront may be briefly unavailable. No action required.',
    visibleFrom: '2026-06-18T00:00:00Z', visibleUntil: '2026-06-21T04:00:00Z',
    createdBy: 'Alex Rivera', createdAt: '2026-06-15T09:00:00Z', status: 'scheduled',
  },
  {
    id: 'ann_002', title: 'New Feature: AI Job Summaries now live for Enterprise',
    body: 'Enterprise plan shops can now enable AI-generated job summaries from Settings → Field Service.',
    visibleFrom: '2026-06-01T00:00:00Z', visibleUntil: '2026-06-30T00:00:00Z',
    createdBy: 'Jamie Chen', createdAt: '2026-06-01T08:00:00Z', status: 'active',
  },
  {
    id: 'ann_003', title: 'ATD API Latency Incident – Resolved',
    body: 'ATD distributor API experienced elevated latency from 14:00–15:30 EDT. All systems restored.',
    visibleFrom: '2026-06-12T14:00:00Z', visibleUntil: '2026-06-13T00:00:00Z',
    createdBy: 'Sam Patel', createdAt: '2026-06-12T14:30:00Z', status: 'expired',
  },
];

export const MOCK_CREDENTIALS: Credential[] = [
  {
    id: 'cred_001', key: 'ATD_API_KEY', provider: 'ATD (American Tire Distributors)',
    description: 'Platform-wide API key for ATD catalog and order sync',
    lastRotatedAt: '2026-05-01T00:00:00Z', lastAccessedAt: '2026-06-14T11:00:00Z',
    maskedValue: 'atd_live_••••••••••••••••••••Xk9P',
  },
  {
    id: 'cred_002', key: 'TIREHUB_SECRET', provider: 'TireHub',
    description: 'Platform-wide secret for TireHub B2B pricing feed',
    lastRotatedAt: '2026-03-15T00:00:00Z',
    maskedValue: 'th_sk_••••••••••••••••••••••••Mn2Q',
  },
  {
    id: 'cred_003', key: 'TWILIO_AUTH_TOKEN', provider: 'Twilio',
    description: 'Twilio auth token for SMS delivery (shared pool)',
    lastRotatedAt: '2026-04-10T00:00:00Z', lastAccessedAt: '2026-06-15T07:00:00Z',
    maskedValue: '••••••••••••••••••••••••••••••2a',
  },
  {
    id: 'cred_004', key: 'RESEND_API_KEY', provider: 'Resend',
    description: 'Transactional email API key',
    lastRotatedAt: '2026-02-20T00:00:00Z', lastAccessedAt: '2026-06-15T06:45:00Z',
    maskedValue: 're_••••••••••••••••••••••••••••Lv7',
  },
  {
    id: 'cred_005', key: 'STRIPE_SECRET_KEY', provider: 'Stripe (Platform)',
    description: 'Platform Stripe secret for subscription billing',
    lastRotatedAt: '2026-01-01T00:00:00Z',
    maskedValue: 'sk_live_••••••••••••••••••••••••••••••••••••Bq3',
  },
  {
    id: 'cred_006', key: 'TIREXPRESS_STRIPE_CONNECT', provider: 'Stripe Connect (Tenant)',
    description: 'Per-tenant Stripe Connect access token',
    lastRotatedAt: '2026-06-01T00:00:00Z',
    maskedValue: 'acct_••••••••••••••••Yz5',
    tenantId: 'shop_006', tenantName: 'TireXpress Hub',
  },
];

export const MOCK_CREDENTIAL_LOGS: CredentialAccessLog[] = [
  {
    id: 'cl_001', adminId: 'adm_001', adminEmail: 'ops@fb-business-connect.com', adminName: 'Alex Rivera',
    credentialKey: 'ATD_API_KEY', reason: 'Verifying key validity after ATD reported auth errors.',
    createdAt: '2026-06-14T11:00:00Z',
  },
  {
    id: 'cl_002', adminId: 'adm_003', adminEmail: 'infra@fb-business-connect.com', adminName: 'Sam Patel',
    credentialKey: 'TWILIO_AUTH_TOKEN', reason: 'Rotating credential as part of Q2 security review.',
    createdAt: '2026-06-15T07:00:00Z',
  },
];

export const MOCK_TOOL_LOGS: OperationalToolLog[] = [
  {
    id: 'tl_001', adminId: 'adm_001', adminEmail: 'ops@fb-business-connect.com',
    toolName: 'replay_webhook', targetShopId: 'shop_001', targetShopName: 'Ace Tire & Auto',
    targetEntity: 'wh_evt_1Kxy9Z2eZvKYlo2C', outcome: 'success', createdAt: '2026-06-15T10:45:00Z',
  },
  {
    id: 'tl_002', adminId: 'adm_003', adminEmail: 'infra@fb-business-connect.com',
    toolName: 'catalog_sync', targetShopId: 'shop_002', targetShopName: 'Premier Wheel Works',
    targetEntity: 'ATD', outcome: 'success', createdAt: '2026-06-14T17:00:00Z',
  },
  {
    id: 'tl_003', adminId: 'adm_001', adminEmail: 'ops@fb-business-connect.com',
    toolName: 'reprocess_queue', targetShopId: 'shop_007', targetShopName: 'Metro Alignment Co.',
    targetEntity: 'booking_sync_queue', outcome: 'failed', createdAt: '2026-06-13T12:30:00Z',
  },
];

export const MOCK_STATUS_SERVICES: StatusService[] = [
  { name: 'Storefront', uptime99d: 99.92, currentStatus: 'operational', latencyMs: 84 },
  { name: 'Booking API', uptime99d: 99.87, currentStatus: 'operational', latencyMs: 112 },
  { name: 'Dispatch & Field Service', uptime99d: 99.78, currentStatus: 'operational', latencyMs: 96 },
  { name: 'Distributor Sync', uptime99d: 98.41, currentStatus: 'degraded', latencyMs: 1420 },
  { name: 'SMS Delivery (Twilio)', uptime99d: 99.95, currentStatus: 'operational', latencyMs: 210 },
  { name: 'Email Delivery (Resend)', uptime99d: 99.99, currentStatus: 'operational', latencyMs: 145 },
  { name: 'Stripe Billing', uptime99d: 99.97, currentStatus: 'operational', latencyMs: 320 },
  { name: 'Admin Console', uptime99d: 99.80, currentStatus: 'operational', latencyMs: 68 },
];

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'inc_001', title: 'ATD Distributor Sync Elevated Latency',
    status: 'monitoring', severity: 'minor', affectedServices: ['Distributor Sync'],
    createdAt: '2026-06-15T08:30:00Z',
    updates: [
      { message: 'ATD API response times increased to ~1.4s (normal <200ms). Investigating.', at: '2026-06-15T08:30:00Z' },
      { message: 'ATD confirmed upstream infrastructure issue on their end. Monitoring.', at: '2026-06-15T09:15:00Z' },
    ],
  },
  {
    id: 'inc_002', title: 'Booking API Intermittent 502s',
    status: 'resolved', severity: 'major', affectedServices: ['Booking API'],
    createdAt: '2026-06-12T14:00:00Z', resolvedAt: '2026-06-12T15:30:00Z',
    updates: [
      { message: 'Receiving reports of booking API 502 errors. Investigating.', at: '2026-06-12T14:00:00Z' },
      { message: 'Identified faulty ALB health check config. Rolling back.', at: '2026-06-12T14:45:00Z' },
      { message: 'Rollback complete. All booking APIs operational.', at: '2026-06-12T15:30:00Z' },
    ],
  },
];

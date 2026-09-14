import type {
  Subscription, UsageRecord, DailyUsage, Invoice, StripeConnectAccount,
  Payout, CapabilityDefinition, CapabilityOverride,
} from './types';

// ─── Subscription ─────────────────────────────────────────────────────────────
export const SUBSCRIPTION: Subscription = {
  id: 'sub-001',
  shopId: 'shop-1',
  planTier: 'pro',
  stripeSubscriptionId: 'sub_1OxKpPLkdIwHu7ix3n4T8m9G',
  status: 'active',
  billingInterval: 'annual',
  currentPeriodStart: '2026-06-01T00:00:00Z',
  currentPeriodEnd: '2026-06-30T23:59:59Z',
  cancelAtPeriodEnd: false,
  cardLast4: '4242',
  cardBrand: 'Visa',
};

// ─── Usage Records ────────────────────────────────────────────────────────────
export const CURRENT_USAGE: UsageRecord = {
  id: 'ur-001',
  shopId: 'shop-1',
  resourceType: 'sms',
  quantity: 7_820,
  periodStart: '2026-06-01T00:00:00Z',
  periodEnd: '2026-06-30T23:59:59Z',
  billed: false,
  overageQuantity: 0,
  overageCost: 0,
};

export const DAILY_SMS_USAGE: DailyUsage[] = [
  { date: '2026-06-01', quantity: 210 },
  { date: '2026-06-02', quantity: 195 },
  { date: '2026-06-03', quantity: 320 },
  { date: '2026-06-04', quantity: 410 },
  { date: '2026-06-05', quantity: 380 },
  { date: '2026-06-06', quantity: 290 },
  { date: '2026-06-07', quantity: 145 },
  { date: '2026-06-08', quantity: 260 },
  { date: '2026-06-09', quantity: 315 },
  { date: '2026-06-10', quantity: 480 },
  { date: '2026-06-11', quantity: 520 },
  { date: '2026-06-12', quantity: 445 },
  { date: '2026-06-13', quantity: 390 },
  { date: '2026-06-14', quantity: 460 },
];

// ─── Invoices ─────────────────────────────────────────────────────────────────
export const INVOICES: Invoice[] = [
  {
    id: 'inv-001',
    shopId: 'shop-1',
    stripeInvoiceId: 'in_1Ox4eLkdIwHu7ix8pQ2Rv3mN',
    number: 'TDF-2026-006',
    amount: 46_974,
    tax: 2_574,
    subtotal: 44_400,
    status: 'paid',
    pdfUrl: '#',
    periodStart: '2026-06-01T00:00:00Z',
    periodEnd: '2026-06-30T23:59:59Z',
    createdAt: '2026-06-01T08:00:00Z',
    lineItems: [
      { description: 'Pro Plan — Annual (Jun 2026)', amount: 42_400 },
      { description: 'SMS overage — 2,100 SMS @ R 0.14 (May)', amount: 1_575 },
      { description: 'Stripe Tax — CA State', amount: 425 },
    ],
  },
  {
    id: 'inv-002',
    shopId: 'shop-1',
    stripeInvoiceId: 'in_1OmYjNkdIwHu7ix6nP1Qs2kJ',
    number: 'TDF-2026-005',
    amount: 45_388,
    tax: 2_388,
    subtotal: 43_000,
    status: 'paid',
    pdfUrl: '#',
    periodStart: '2026-05-01T00:00:00Z',
    periodEnd: '2026-05-31T23:59:59Z',
    createdAt: '2026-05-01T08:00:00Z',
    lineItems: [
      { description: 'Pro Plan — Annual (May 2026)', amount: 42_400 },
      { description: 'SMS overage — 800 SMS @ R 0.14 (Apr)', amount: 600 },
    ],
  },
  {
    id: 'inv-003',
    shopId: 'shop-1',
    stripeInvoiceId: 'in_1OdRpMkdIwHu7ix5mO0Rr1iH',
    number: 'TDF-2026-004',
    amount: 42_568,
    tax: 2_168,
    subtotal: 40_400,
    status: 'paid',
    pdfUrl: '#',
    periodStart: '2026-04-01T00:00:00Z',
    periodEnd: '2026-04-30T23:59:59Z',
    createdAt: '2026-04-01T08:00:00Z',
    lineItems: [
      { description: 'Pro Plan — Annual (Apr 2026)', amount: 42_400 },
    ],
  },
  {
    id: 'inv-004',
    shopId: 'shop-1',
    stripeInvoiceId: 'in_1OULlLkdIwHu7ix4lN9Qq0gF',
    number: 'TDF-2026-003',
    amount: 42_400,
    tax: 2_168,
    subtotal: 40_232,
    status: 'paid',
    pdfUrl: '#',
    periodStart: '2026-03-01T00:00:00Z',
    periodEnd: '2026-03-31T23:59:59Z',
    createdAt: '2026-03-01T08:00:00Z',
    lineItems: [
      { description: 'Pro Plan — Annual (Mar 2026)', amount: 42_400 },
    ],
  },
  {
    id: 'inv-005',
    shopId: 'shop-1',
    stripeInvoiceId: 'in_1OLGkKkdIwHu7ix3kM8Pp9eD',
    number: 'TDF-2026-002',
    amount: 42_400,
    tax: 2_168,
    subtotal: 40_232,
    status: 'paid',
    pdfUrl: '#',
    periodStart: '2026-02-01T00:00:00Z',
    periodEnd: '2026-02-28T23:59:59Z',
    createdAt: '2026-02-01T08:00:00Z',
    lineItems: [
      { description: 'Pro Plan — Annual (Feb 2026)', amount: 42_400 },
    ],
  },
  {
    id: 'inv-006',
    shopId: 'shop-1',
    stripeInvoiceId: 'in_1OCBjJkdIwHu7ix2jL7Oo8cB',
    number: 'TDF-2026-001',
    amount: 49_900,
    tax: 0,
    subtotal: 49_900,
    status: 'paid',
    pdfUrl: '#',
    periodStart: '2026-01-01T00:00:00Z',
    periodEnd: '2026-01-31T23:59:59Z',
    createdAt: '2026-01-01T08:00:00Z',
    lineItems: [
      { description: 'Pro Plan — Monthly (Jan 2026, pre-annual switch)', amount: 49_900 },
    ],
  },
];

// ─── Stripe Connect ───────────────────────────────────────────────────────────
export const CONNECT_ACCOUNT: StripeConnectAccount = {
  id: 'ca-001',
  shopId: 'shop-1',
  stripeAccountId: 'acct_1OxKpQLkdIwHu7ix',
  onboardingComplete: true,
  payoutEnabled: true,
  chargesEnabled: true,
  defaultCurrency: 'usd',
  country: 'ZA',
  businessName: "Rudimax Tire & Auto",
};

export const PAYOUTS: Payout[] = [
  { id: 'po-001', shopId: 'shop-1', stripePayoutId: 'po_1OxKqRLkdIwHu7ix', amount: 8_742_00, currency: 'usd', status: 'paid', arrivalDate: '2026-06-12T00:00:00Z', createdAt: '2026-06-10T00:00:00Z', description: 'Payout for Jun 1–10', transactionCount: 47, fees: 142_00, applicationFeeTotal: 43_71 },
  { id: 'po-002', shopId: 'shop-1', stripePayoutId: 'po_1OpJpQLkdIwHu7ix', amount: 6_219_00, currency: 'usd', status: 'in_transit', arrivalDate: '2026-06-16T00:00:00Z', createdAt: '2026-06-14T00:00:00Z', description: 'Payout for Jun 11–13', transactionCount: 31, fees: 101_00, applicationFeeTotal: 31_10 },
  { id: 'po-003', shopId: 'shop-1', stripePayoutId: 'po_1OhIoNkdIwHu7ix', amount: 11_380_00, currency: 'usd', status: 'paid', arrivalDate: '2026-05-29T00:00:00Z', createdAt: '2026-05-27T00:00:00Z', description: 'Payout for May 21–27', transactionCount: 62, fees: 186_00, applicationFeeTotal: 56_90 },
  { id: 'po-004', shopId: 'shop-1', stripePayoutId: 'po_1OaHnMkdIwHu7ix', amount: 9_156_00, currency: 'usd', status: 'paid', arrivalDate: '2026-05-22T00:00:00Z', createdAt: '2026-05-20T00:00:00Z', description: 'Payout for May 14–20', transactionCount: 53, fees: 149_00, applicationFeeTotal: 45_78 },
  { id: 'po-005', shopId: 'shop-1', stripePayoutId: 'po_1OTGmLkdIwHu7ix', amount: 7_934_00, currency: 'usd', status: 'paid', arrivalDate: '2026-05-15T00:00:00Z', createdAt: '2026-05-13T00:00:00Z', description: 'Payout for May 7–13', transactionCount: 44, fees: 129_00, applicationFeeTotal: 39_67 },
];

// ─── Capability Definitions ───────────────────────────────────────────────────
export const CAPABILITY_DEFINITIONS: CapabilityDefinition[] = [
  { key: 'multi_location',          label: 'Multiple Locations',     description: 'Manage more than one shop location', category: 'feature',   requiredTier: 'pro',        starterValue: false,          proValue: '5 locations',        enterpriseValue: 'Unlimited' },
  { key: 'custom_domain',           label: 'Custom Domain',          description: 'Use your own domain for the storefront', category: 'feature',   requiredTier: 'pro',        starterValue: false,          proValue: true,                 enterpriseValue: true },
  { key: 'sms_campaigns',           label: 'SMS Campaigns',          description: 'Send outbound SMS marketing campaigns', category: 'feature',   requiredTier: 'pro',        starterValue: false,          proValue: true,                 enterpriseValue: true },
  { key: 'email_campaigns_advanced', label: 'Advanced Email Campaigns', description: 'Segmentation, A/B testing, automation', category: 'feature', requiredTier: 'pro',        starterValue: 'Basic',        proValue: 'Advanced',           enterpriseValue: 'Advanced' },
  { key: 'analytics_advanced',      label: 'Advanced Analytics',     description: 'Custom reports, funnel analysis, data export', category: 'feature', requiredTier: 'pro',   starterValue: 'Basic',        proValue: 'Advanced',           enterpriseValue: 'Advanced + custom' },
  { key: 'license_plate_lookup',    label: 'VIN / Plate Lookup',     description: 'Auto-fill vehicle details from plate or VIN', category: 'feature', requiredTier: 'pro',  starterValue: false,          proValue: true,                 enterpriseValue: true },
  { key: 'quickbooks_import',       label: 'QuickBooks Import',      description: 'Import invoices and customers from QuickBooks', category: 'feature', requiredTier: 'pro', starterValue: false,          proValue: true,                 enterpriseValue: true },
  { key: 'custom_roles',            label: 'Custom Staff Roles',     description: 'Define granular role-based permissions', category: 'feature',   requiredTier: 'pro',        starterValue: false,          proValue: 'Limited',            enterpriseValue: true },
  { key: 'distributor_multi',       label: 'Multiple Distributors',  description: 'Connect more than one distributor API', category: 'volume',    requiredTier: 'pro',        starterValue: '1',            proValue: '3',                  enterpriseValue: 'Unlimited' },
  { key: 'volume_customer_records', label: 'Customer Record Limit',  description: 'Max number of customer records in the CRM', category: 'volume', requiredTier: 'starter',   starterValue: '500',          proValue: 'Unlimited',          enterpriseValue: 'Unlimited' },
  { key: 'api_access',              label: 'REST API Access',        description: 'Programmatic access to FB Business Connect platform data', category: 'feature', requiredTier: 'enterprise', starterValue: false,       proValue: false,                enterpriseValue: true },
  { key: 'saml_sso',               label: 'SAML SSO',               description: 'Single sign-on via SAML 2.0 / OIDC', category: 'feature',      requiredTier: 'enterprise', starterValue: false,          proValue: false,                enterpriseValue: true },
  { key: 'white_label_invoices',   label: 'White-Label Invoices',   description: 'Remove FB Business Connect branding from customer invoices', category: 'behavior', requiredTier: 'enterprise', starterValue: false,    proValue: false,                enterpriseValue: true },
  { key: 'dedicated_support',      label: 'Dedicated Support',      description: 'Named account manager + SLA-backed support', category: 'behavior', requiredTier: 'enterprise', starterValue: 'Email',     proValue: 'Phone + Email',      enterpriseValue: 'Dedicated manager' },
  { key: 'sla_guarantee',          label: 'SLA Guarantee',          description: '99.9% uptime SLA with credit for downtime', category: 'behavior', requiredTier: 'enterprise', starterValue: false,        proValue: false,                enterpriseValue: true },
];

// Capabilities currently active on this shop (custom domain is configured)
export const ACTIVE_COMMITMENTS: { key: string; label: string; description: string; resolveAction: string }[] = [
  { key: 'custom_domain', label: 'Custom Domain Configured', description: 'rudimax.fb-business-connect.app is currently live', resolveAction: 'Remove custom domain in Settings → Storefront' },
  { key: 'multi_location', label: '3 Locations Active', description: 'You have 3 locations configured. Starter allows 1.', resolveAction: 'Archive 2 locations in Settings → Locations' },
  { key: 'sms_campaigns', label: 'Active SMS Campaign', description: '"Winter Tire Sale" campaign is in Sending status', resolveAction: 'Pause or archive the campaign in Marketing → Campaigns' },
];

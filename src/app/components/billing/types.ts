// ─── Core Enums ───────────────────────────────────────────────────────────────
export type PlanTier       = 'starter' | 'pro' | 'enterprise';
export type BillingInterval = 'monthly' | 'annual';
export type SubscriptionStatus = 'active' | 'past_due' | 'suspended_billing' | 'cancelled';
export type InvoiceStatus  = 'paid' | 'pending' | 'failed' | 'void';
export type PayoutStatus   = 'paid' | 'in_transit' | 'pending' | 'failed';

// ─── Subscription ─────────────────────────────────────────────────────────────
export interface Subscription {
  id: string;
  shopId: string;
  planTier: PlanTier;
  stripeSubscriptionId: string;
  status: SubscriptionStatus;
  billingInterval: BillingInterval;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  pendingDowngradeTier?: PlanTier;
  trialEnd?: string;
  cardLast4: string;
  cardBrand: string;
}

// ─── Usage ────────────────────────────────────────────────────────────────────
export type UsageResourceType = 'sms' | 'email' | 'api_calls' | 'storage_gb';

export interface UsageRecord {
  id: string;
  shopId: string;
  resourceType: UsageResourceType;
  quantity: number;
  periodStart: string;
  periodEnd: string;
  billed: boolean;
  overageQuantity: number;
  overageCost: number;
}

export interface DailyUsage {
  date: string;
  quantity: number;
}

// ─── Invoices ─────────────────────────────────────────────────────────────────
export interface InvoiceLineItem {
  description: string;
  amount: number;
}

export interface Invoice {
  id: string;
  shopId: string;
  stripeInvoiceId: string;
  number: string;
  amount: number;
  tax: number;
  subtotal: number;
  status: InvoiceStatus;
  pdfUrl: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  lineItems: InvoiceLineItem[];
}

// ─── Stripe Connect ───────────────────────────────────────────────────────────
export interface StripeConnectAccount {
  id: string;
  shopId: string;
  stripeAccountId: string;
  onboardingComplete: boolean;
  payoutEnabled: boolean;
  chargesEnabled: boolean;
  defaultCurrency: string;
  country: string;
  businessName: string;
}

export interface Payout {
  id: string;
  shopId: string;
  stripePayoutId: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  arrivalDate: string;
  createdAt: string;
  description: string;
  transactionCount: number;
  fees: number;
  applicationFeeTotal: number;
}

// ─── Capabilities ─────────────────────────────────────────────────────────────
export type CapabilityKey =
  | 'multi_location'
  | 'custom_domain'
  | 'sms_campaigns'
  | 'email_campaigns_advanced'
  | 'api_access'
  | 'saml_sso'
  | 'custom_roles'
  | 'analytics_advanced'
  | 'quickbooks_import'
  | 'license_plate_lookup'
  | 'white_label_invoices'
  | 'dedicated_support'
  | 'sla_guarantee'
  | 'distributor_multi'
  | 'volume_customer_records';

export interface CapabilityDefinition {
  key: CapabilityKey;
  label: string;
  description: string;
  category: 'feature' | 'volume' | 'behavior';
  requiredTier: PlanTier;
  starterValue: string | boolean | number;
  proValue: string | boolean | number;
  enterpriseValue: string | boolean | number;
}

export interface CapabilityOverride {
  id: string;
  shopId: string;
  capabilityKey: CapabilityKey;
  enabled: boolean;
  expiresAt?: string;
  setBy: string;
  reason?: string;
}

// ─── Plan Config ──────────────────────────────────────────────────────────────
export interface PlanConfig {
  tier: PlanTier;
  name: string;
  monthlyPrice: number | null;
  annualMonthlyPrice: number | null;
  smsInclusion: number | null;
  applicationFeePercent: number;
  locationLimit: number | null;
  customerRecordLimit: number | null;
  distributorLimit: number | null;
}

export const PLAN_CONFIGS: Record<PlanTier, PlanConfig> = {
  starter: {
    tier: 'starter',
    name: 'Starter',
    monthlyPrice: 199,
    annualMonthlyPrice: 169,
    smsInclusion: 1000,
    applicationFeePercent: 1.5,
    locationLimit: 1,
    customerRecordLimit: 500,
    distributorLimit: 1,
  },
  pro: {
    tier: 'pro',
    name: 'Pro',
    monthlyPrice: 499,
    annualMonthlyPrice: 424,
    smsInclusion: 10000,
    applicationFeePercent: 0.5,
    locationLimit: 5,
    customerRecordLimit: null,
    distributorLimit: 3,
  },
  enterprise: {
    tier: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: null,
    annualMonthlyPrice: null,
    smsInclusion: null,
    applicationFeePercent: 0,
    locationLimit: null,
    customerRecordLimit: null,
    distributorLimit: null,
  },
};

export const SMS_OVERAGE_RATE = 0.0075; // $0.0075 per SMS over inclusion

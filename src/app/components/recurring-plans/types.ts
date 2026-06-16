export type BillingCadence = 'monthly' | 'quarterly' | 'annual';
export type CancellationPolicy = 'end_of_period' | 'immediate_proration' | 'term_locked';
export type EnrollmentStatus = 'active' | 'past_due' | 'cancelled' | 'paused' | 'pending';

export interface FreeServiceEntitlement {
  type: 'free_service';
  serviceId: string;
  serviceName: string;
  quantityPerPeriod: number;
}

export interface DiscountEntitlement {
  type: 'discount';
  discountPct: number;
  label: string;
}

export interface PriorityBookingEntitlement {
  type: 'priority_booking';
  description: string;
}

export interface IncludedAddonEntitlement {
  type: 'addon_included';
  addonId: string;
  addonName: string;
}

export type Entitlement =
  | FreeServiceEntitlement
  | DiscountEntitlement
  | PriorityBookingEntitlement
  | IncludedAddonEntitlement;

export interface PlanTier {
  id: string;
  planId: string;
  name: string;
  price: number;
  entitlements: Entitlement[];
  highlight?: boolean;
}

export interface ServicePlan {
  id: string;
  shopId: string;
  name: string;
  description: string;
  billingCadence: BillingCadence;
  basePrice: number;
  entitlements: Entitlement[];
  exclusions: string[];
  termMonths: number;
  autoRenew: boolean;
  cancellationPolicy: CancellationPolicy;
  customerSelfEnrollable: boolean;
  tiers: PlanTier[];
  active: boolean;
  color: string;
}

export interface EntitlementUsage {
  entitlementKey: string;
  serviceName: string;
  used: number;
  included: number;
}

export interface PlanEnrollment {
  id: string;
  shopId: string;
  customerId: string;
  customerName: string;
  vehicleId: string;
  vehicleLabel: string;
  planId: string;
  planName: string;
  tierId: string;
  tierName: string;
  tierPrice: number;
  billingCadence: BillingCadence;
  stripeSubscriptionId: string;
  status: EnrollmentStatus;
  termStart: string;
  termEnd: string;
  nextBillingDate: string;
  paymentMethod: 'card' | 'ach';
  paymentLast4: string;
  entitlementUsage: EntitlementUsage[];
}

export interface EntitlementTransaction {
  id: string;
  enrollmentId: string;
  visitId: string;
  type: 'free_service' | 'discount' | 'addon_included';
  description: string;
  amountSaved: number;
  createdAt: string;
}

export interface PlanPnLRow {
  planId: string;
  planName: string;
  tierName: string;
  enrolledCount: number;
  mrr: number;
  totalServicesDelivered: number;
  costOfServicesUnderEntitlement: number;
  netContribution: number;
}

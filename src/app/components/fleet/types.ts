export type PaymentTerms = 'net_15' | 'net_30' | 'net_45' | 'net_60' | 'immediate';
export type FleetAccountStatus = 'active' | 'suspended' | 'pending';
export type AgingBucket = 'current' | '1_30' | '31_60' | '61_90' | '90_plus';
export type FleetSessionStatus = 'scheduled' | 'in_progress' | 'closed' | 'invoiced';
export type ApprovalRouting = 'sequential' | 'any_one';
export type DiscountType = 'percentage' | 'flat';
export type BuyerRole = 'fleet_manager' | 'authorized_buyer' | 'viewer';
export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'overdue' | 'voided';

export interface FleetContact {
  name: string;
  email: string;
  phone: string;
  title?: string;
}

export interface FleetAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}

export interface AuthorizedBuyer {
  id: string;
  fleetAccountId: string;
  name: string;
  email: string;
  phone: string;
  role: BuyerRole;
  spendLimitPerTransaction: number | null;
  spendLimitPerPeriod: number | null;
  vehicleScope: 'all' | string[]; // 'all' or array of vehicle IDs
  active: boolean;
}

export interface FleetVehicle {
  id: string;
  fleetAccountId: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  vin: string;
  plate: string;
  plateState: string;
  lastServiceDate?: string;
  mileage?: number;
  notes?: string;
}

export interface FleetAccount {
  id: string;
  shopId: string;
  businessName: string;
  ein: string;
  status: FleetAccountStatus;
  billingContact: FleetContact;
  apContact: FleetContact;
  billingAddress: FleetAddress;
  shippingAddress: FleetAddress;
  paymentTerms: PaymentTerms;
  creditLimitCents: number;
  outstandingBalanceCents: number;
  pricingTierId?: string;
  pricingMenuId?: string;
  approvalThresholdCents: number | null;
  approvalRouting: ApprovalRouting;
  approverEmails: string[];
  vehicles: FleetVehicle[];
  authorizedBuyers: AuthorizedBuyer[];
  createdAt: string;
  lastActivityAt: string;
  aging: Record<AgingBucket, number>;
}

export interface PricingTier {
  id: string;
  shopId: string;
  name: string;
  discountType: DiscountType;
  discountValue: number;
  description: string;
}

export interface PricingMenuLine {
  id: string;
  type: 'product' | 'service' | 'labor';
  sku?: string;
  description: string;
  retailPrice: number;
  agreedPrice: number;
  unit: string;
  notes?: string;
}

export interface VolumeTier {
  minQty: number;
  maxQty: number | null;
  discountPct: number;
  label: string;
}

export interface PricingMenu {
  id: string;
  fleetAccountId: string;
  name: string;
  effectiveFrom: string;
  effectiveTo: string;
  lines: PricingMenuLine[];
  volumeTiers: VolumeTier[];
}

export interface FleetInvoiceLine {
  vehicleId?: string;
  vehicleLabel?: string;
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
  sku?: string;
}

export interface FleetInvoice {
  id: string;
  fleetAccountId: string;
  shopId: string;
  invoiceNumber: string;
  poNumber?: string;
  status: InvoiceStatus;
  lines: FleetInvoiceLine[];
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  paidCents: number;
  dueDate: string;
  issuedDate: string;
  sessionId?: string;
  notes?: string;
}

export interface ReorderList {
  id: string;
  fleetAccountId: string;
  name: string;
  lines: { sku: string; description: string; agreedPrice: number; defaultQty: number }[];
  lastOrderedAt?: string;
}

export interface FleetSessionVehicleWork {
  vehicleId: string;
  vehicleLabel: string;
  services: { description: string; qty: number; unitPrice: number }[];
  parts: { sku: string; description: string; qty: number; unitPrice: number }[];
  findings: string;
  photoCount: number;
  subtotalCents: number;
}

export interface FleetSession {
  id: string;
  shopId: string;
  fleetAccountId: string;
  fleetAccountName: string;
  technicianName: string;
  locationName: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: FleetSessionStatus;
  vehicleWork: FleetSessionVehicleWork[];
  consolidatedInvoiceId?: string;
  notes?: string;
  isRecurring: boolean;
  recurringPattern?: string;
  commissionType: 'per_line_item' | 'per_session_rate' | 'session_exempt';
}

export interface ApprovalRequest {
  id: string;
  fleetAccountId: string;
  fleetAccountName: string;
  buyerName: string;
  totalCents: number;
  poNumber?: string;
  items: string[];
  status: 'pending' | 'approved' | 'rejected';
  approver?: string;
  reason?: string;
  createdAt: string;
}

// ─── Catalog ──────────────────────────────────────────────────────────────────

export type DistributionMode = 'embedded_bind' | 'referral';
export type RequirementLevel = 'required' | 'commonly_carried' | 'optional';
export type OperationsType = 'mobile' | 'in_shop' | 'both';

export interface CoverageType {
  id: string;
  code: string;
  display_name: string;
  plain_description: string;
  icon: string;
  distribution_mode: DistributionMode;
  typical_premium_low: number;  // cents / year
  typical_premium_high: number; // cents / year
  sort_order: number;
  active: boolean;
}

export interface RequirementRule {
  id: string;
  coverage_type_id: string;
  // null means "matches any"
  industry_packs: string[] | null;
  operations_types: OperationsType[] | null;
  states: string[] | null;
  min_team_size: number | null;
  min_vehicle_count: number | null;
  has_premises: boolean | null;
  requirement_level: RequirementLevel;
  reason_text: string;
  source_url: string | null;
  effective_from: string;
  version: number;
}

// ─── Tenant context (input to requirement engine) ─────────────────────────────

export interface TenantContext {
  industry_pack: string;
  operations_type: OperationsType;
  team_size: number;
  location_count: number;
  state: string;
  vehicle_count: number;
  has_premises: boolean;
}

export interface RequirementResult {
  level: RequirementLevel;
  reason: string;
}

// ─── Applications ─────────────────────────────────────────────────────────────

export type ApplicationStatus =
  | 'draft' | 'submitted' | 'quoted' | 'referred' | 'declined' | 'bound';

export interface InsuranceApplication {
  id: string;
  shop_id: string;
  coverage_type_ids: string[];
  status: ApplicationStatus;
  answers_json: Record<string, unknown>;
  prefill_snapshot_json: Record<string, unknown>;
  partner_application_id: string | null;
  signed_at: string | null;
  signature_ip: string | null;
  created_by: string;
  submitted_at: string | null;
}

// ─── Quotes ───────────────────────────────────────────────────────────────────

export interface PolicyLimits {
  per_occurrence: number;  // cents
  aggregate: number;       // cents
  [key: string]: number;
}

export interface InsuranceQuote {
  id: string;
  application_id: string;
  shop_id: string;
  coverage_type_id: string;
  carrier_name: string;
  carrier_rating: string; // AM Best: A++, A+, A, A-, B++, etc.
  annual_premium: number;  // cents
  monthly_premium: number; // cents
  limits_json: PolicyLimits;
  deductible: number; // cents
  exclusions_json: string[];
  valid_until: string;
  partner_quote_id: string;
  selected_at: string | null;
}

// ─── Policies ─────────────────────────────────────────────────────────────────

export type PolicyStatus = 'active' | 'pending' | 'lapsed' | 'cancelled' | 'expired';
export type PaymentFrequency = 'annual' | 'semi_annual' | 'quarterly' | 'monthly';

export interface InsurancePolicy {
  id: string;
  shop_id: string;
  coverage_type_id: string;
  coverage_name: string;
  quote_id: string | null;
  carrier_name: string;
  carrier_contact: string;
  policy_number: string;
  status: PolicyStatus;
  effective_date: string;
  expiry_date: string;
  premium: number; // cents / year
  payment_frequency: PaymentFrequency;
  next_payment_date: string | null;
  limits_json: PolicyLimits;
  deductible: number; // cents
  is_external: boolean;
  created_at: string;
}

export interface PolicyDocument {
  id: string;
  policy_id: string;
  shop_id: string;
  doc_type: 'declarations' | 'full_policy' | 'endorsement' | 'invoice' | 'receipt' | 'coi';
  file_url: string;
  version: number;
  uploaded_at: string;
}

// ─── Certificates of Insurance ────────────────────────────────────────────────

export interface InsuranceCertificate {
  id: string;
  shop_id: string;
  holder_name: string;
  holder_address: string;
  holder_email: string;
  policy_ids_json: string[];
  additional_insured: string | null;
  description_of_operations: string;
  pdf_url: string;
  verify_token: string;
  fleet_account_id: string | null;
  issued_by: string;
  issued_at: string;
  expires_at: string;
  reissue_required: boolean;
}

// ─── Endorsements ─────────────────────────────────────────────────────────────

export type EndorsementType =
  | 'add_vehicle' | 'remove_vehicle' | 'add_driver' | 'remove_driver'
  | 'change_limits' | 'add_additional_insured' | 'change_address';

export type EndorsementStatus = 'pending' | 'in_review' | 'approved' | 'rejected';

export interface InsuranceEndorsement {
  id: string;
  policy_id: string;
  shop_id: string;
  type: EndorsementType;
  payload_json: Record<string, unknown>;
  status: EndorsementStatus;
  requested_at: string;
  effective_at: string | null;
  carrier_reference: string | null;
}

// ─── Drivers ──────────────────────────────────────────────────────────────────

export type DriverStatus = 'active' | 'inactive' | 'pending_mvr';

export interface InsuranceDriver {
  id: string;
  shop_id: string;
  user_id: string | null;
  full_name: string;
  license_number: string;
  license_state: string;
  license_expiry: string;
  mvr_consent_at: string | null;
  status: DriverStatus;
}

// ─── Claims ───────────────────────────────────────────────────────────────────

export type LossType =
  | 'property_damage' | 'bodily_injury' | 'vehicle_accident' | 'theft'
  | 'vandalism' | 'weather' | 'fire' | 'slip_fall' | 'other';

export type ClaimStatus =
  | 'reported' | 'acknowledged' | 'investigating' | 'approved' | 'denied' | 'paid' | 'closed';

export interface InsuranceClaim {
  id: string;
  shop_id: string;
  policy_id: string;
  coverage_name: string;
  claim_number: string | null;
  loss_type: LossType;
  loss_datetime: string;
  location_json: { lat?: number; lng?: number; address: string };
  description: string;
  parties_json: Array<{ name: string; contact: string; role: string }>;
  injuries: boolean;
  police_report_number: string | null;
  visit_id: string | null;
  order_id: string | null;
  status: ClaimStatus;
  adjuster_name: string | null;
  adjuster_contact: string | null;
  reserve_amount: number; // cents
  payout_amount: number;  // cents
  reported_at: string;
  closed_at: string | null;
}

export interface ClaimDocument {
  id: string;
  claim_id: string;
  shop_id: string;
  doc_type: string;
  file_url: string;
  uploaded_by: string;
  uploaded_at: string;
}

// ─── Renewals ─────────────────────────────────────────────────────────────────

export type RenewalChannel = 'email' | 'sms' | 'in_app';
export type RenewalTaskStatus = 'pending' | 'sent' | 'snoozed' | 'cancelled';

export interface RenewalTask {
  id: string;
  policy_id: string;
  shop_id: string;
  remind_at: string;
  days_before_expiry: number;
  channel: RenewalChannel;
  sent_at: string | null;
  status: RenewalTaskStatus;
}

// ─── Commissions (platform admin) ─────────────────────────────────────────────

export interface InsuranceCommission {
  id: string;
  policy_id: string;
  carrier_name: string;
  premium: number;       // cents
  commission_rate: number; // percentage, e.g. 12.5
  expected_amount: number; // cents
  received_amount: number; // cents
  period: string;          // YYYY-MM
  status: 'pending' | 'received' | 'reconciled';
}

// ─── Provider interface ───────────────────────────────────────────────────────

export interface SubmitApplicationInput {
  coverage_type_ids: string[];
  answers: Record<string, unknown>;
  signature_ip: string;
  idempotency_key: string;
}

export interface BindInput {
  quote_id: string;
  effective_date: string;
  payment_frequency: PaymentFrequency;
  payment_method: 'bank_account' | 'card' | 'fb-business-connect_banking';
  signature_ip: string;
  idempotency_key: string;
}

export interface GenerateCOIInput {
  policy_ids: string[];
  holder_name: string;
  holder_address: string;
  holder_email: string;
  additional_insured: string | null;
  description_of_operations: string;
}

export interface SubmitClaimInput {
  policy_id: string;
  loss_type: LossType;
  loss_datetime: string;
  location: string;
  description: string;
  parties: Array<{ name: string; contact: string; role: string }>;
  injuries: boolean;
  police_report_number: string | null;
  idempotency_key: string;
}

export interface InsuranceProvider {
  getQuote(application_id: string): Promise<InsuranceQuote[]>;
  submitApplication(input: SubmitApplicationInput): Promise<{ application_id: string; status: ApplicationStatus }>;
  bindPolicy(input: BindInput): Promise<{ policy_id: string; policy_number: string }>;
  getPolicy(policy_id: string): Promise<InsurancePolicy>;
  requestEndorsement(policy_id: string, type: EndorsementType, payload: Record<string, unknown>): Promise<{ endorsement_id: string }>;
  generateCOI(input: GenerateCOIInput): Promise<{ pdf_url: string; verify_token: string }>;
  submitClaim(input: SubmitClaimInput): Promise<{ claim_id: string; claim_number: string }>;
  getClaimStatus(claim_id: string): Promise<{ status: ClaimStatus; adjuster_name: string | null; adjuster_contact: string | null }>;
}

// ─── Roles ────────────────────────────────────────────────────────────────────

export type InsuranceRole = 'owner' | 'admin' | 'bookkeeper' | 'tech';

export interface InsurancePermissions {
  view_policies: boolean;
  start_application: boolean;
  bind_policy: boolean;
  request_endorsement: boolean;
  issue_coi: boolean;
  file_fnol: boolean;
  file_incident_report: boolean;
  cancel_policy: boolean;
}

export const INSURANCE_PERMISSIONS: Record<InsuranceRole, InsurancePermissions> = {
  owner:      { view_policies: true,  start_application: true,  bind_policy: true,  request_endorsement: true,  issue_coi: true,  file_fnol: true,  file_incident_report: true,  cancel_policy: true  },
  admin:      { view_policies: true,  start_application: false, bind_policy: false, request_endorsement: true,  issue_coi: true,  file_fnol: true,  file_incident_report: true,  cancel_policy: false },
  bookkeeper: { view_policies: true,  start_application: false, bind_policy: false, request_endorsement: false, issue_coi: false, file_fnol: false, file_incident_report: false, cancel_policy: false },
  tech:       { view_policies: false, start_application: false, bind_policy: false, request_endorsement: false, issue_coi: false, file_fnol: false, file_incident_report: true,  cancel_policy: false },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatCents(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(cents / 100);
}

export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}

// ─── Application ─────────────────────────────────────────────────────────────

export type ApplicationStatus =
  | 'not_started' | 'in_progress' | 'submitted' | 'pending_review'
  | 'approved' | 'requires_documents' | 'denied';

export type EntityType = 'sole_proprietor' | 'llc' | 's_corp' | 'c_corp' | 'partnership';

export interface BankingApplication {
  id: string;
  shop_id: string;
  status: ApplicationStatus;
  partner_application_id: string | null;
  submitted_at: string | null;
  decided_at: string | null;
  denial_reason: string | null;
  documents_required_json: RequiredDocument[] | null;
}

export interface RequiredDocument {
  id: string;
  type: 'ein_letter' | 'formation_docs' | 'id' | 'proof_of_address';
  label: string;
  status: 'pending' | 'uploaded' | 'accepted' | 'rejected';
  rejection_reason?: string;
}

// ─── Owner / Control Person ───────────────────────────────────────────────────

export interface BankingOwner {
  id: string;
  application_id: string;
  shop_id: string;
  full_name: string;
  dob: string; // YYYY-MM-DD
  ssn_token: string; // token from partner, never the actual SSN
  address_json: Address;
  ownership_pct: number; // 0-100
  is_control_person: boolean;
  email: string;
  phone: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

// ─── Account ─────────────────────────────────────────────────────────────────

export type AccountStatus = 'active' | 'suspended' | 'closed';

export interface BankingAccount {
  id: string;
  shop_id: string;
  location_id: string | null;
  partner_account_id: string;
  routing_last4: string;
  account_last4: string;
  status: AccountStatus;
  balance_available_cached: number; // integer cents
  balance_pending_cached: number;   // integer cents
  synced_at: string;
  opened_at: string;
  closed_at: string | null;
  currency: string;
}

// ─── Vaults ───────────────────────────────────────────────────────────────────

export interface BankingVault {
  id: string;
  shop_id: string;
  account_id: string;
  name: string;
  balance_cached: number; // integer cents
  target_balance?: number;
  currency: string;
  is_default: boolean;
  sort_order: number;
}

export type AllocationTrigger = 'inbound_deposit' | 'manual';
export type AllocationType = 'percentage' | 'fixed';

export interface BankingVaultRule {
  id: string;
  shop_id: string;
  vault_id: string;
  vault_name: string;
  trigger: AllocationTrigger;
  allocation_type: AllocationType;
  allocation_value: number; // pct (0-100) or fixed cents
  priority: number;
  active: boolean;
}

// ─── Cards ────────────────────────────────────────────────────────────────────

export type CardFormFactor = 'virtual' | 'physical';
export type CardStatus = 'active' | 'frozen' | 'lost_stolen' | 'cancelled' | 'pending_activation';

export interface BankingCard {
  id: string;
  shop_id: string;
  account_id: string;
  partner_card_id: string;
  assigned_user_id: string | null;
  assigned_user_name: string | null;
  asset_id: string | null;
  asset_name: string | null;
  card_name: string;
  form_factor: CardFormFactor;
  last4: string;
  status: CardStatus;
  shipped_at: string | null;
  activated_at: string | null;
}

export interface MccGroup {
  id: string;
  label: string;
  mccs: string[];
}

export interface BankingCardControls {
  id: string;
  card_id: string;
  monthly_limit: number | null; // cents
  per_txn_limit: number | null; // cents
  allowed_mcc_groups: string[];
  allowed_days: number[]; // 0=Sun … 6=Sat
  allowed_hours: { start: string; end: string } | null; // HH:MM
  geo_radius_miles: number | null;
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export type TransactionDirection = 'credit' | 'debit';
export type TransactionStatus = 'pending' | 'posted' | 'returned' | 'cancelled';

export interface BankingTransaction {
  id: string;
  shop_id: string;
  account_id: string;
  vault_id: string | null;
  vault_name: string | null;
  card_id: string | null;
  card_name: string | null;
  partner_txn_id: string;
  direction: TransactionDirection;
  amount: number; // integer cents
  currency: string;
  status: TransactionStatus;
  merchant_name: string | null;
  mcc: string | null;
  category: string | null;
  description: string;
  visit_id: string | null;
  purchase_order_id: string | null;
  order_id: string | null;
  receipt_url: string | null;
  posted_at: string;
}

// ─── Transfers ────────────────────────────────────────────────────────────────

export type TransferType = 'vault_to_vault' | 'ach_out' | 'ach_in' | 'external' | 'bill_pay' | 'wire';
export type TransferStatus = 'pending_approval' | 'scheduled' | 'processing' | 'completed' | 'failed' | 'returned' | 'cancelled';
export type ApprovalStatus = 'not_required' | 'pending' | 'approved' | 'expired';

export interface BankingTransfer {
  id: string;
  shop_id: string;
  account_id: string;
  type: TransferType;
  counterparty_id: string | null;
  counterparty_name: string | null;
  from_vault_id: string | null;
  from_vault_name: string | null;
  to_vault_id: string | null;
  to_vault_name: string | null;
  amount: number; // cents
  currency: string;
  status: TransferStatus;
  scheduled_for: string | null;
  recurrence_json: RecurrenceRule | null;
  initiated_by: string;
  approved_by: string | null;
  approval_status: ApprovalStatus;
  idempotency_key: string;
  partner_transfer_id: string | null;
  created_at: string;
}

export interface RecurrenceRule {
  frequency: 'weekly' | 'biweekly' | 'monthly';
  day_of_week?: number;
  day_of_month?: number;
  end_date?: string;
}

// ─── Counterparties ───────────────────────────────────────────────────────────

export type CounterpartyType = 'external_bank' | 'vendor' | 'plaid_linked';
export type VerificationStatus = 'unverified' | 'micro_deposit_pending' | 'verified' | 'plaid_verified';

export interface BankingCounterparty {
  id: string;
  shop_id: string;
  nickname: string;
  type: CounterpartyType;
  routing_token: string;
  account_token: string;
  last4: string;
  bank_name: string | null;
  verification_status: VerificationStatus;
  last_used_at: string | null;
}

// ─── Disputes ─────────────────────────────────────────────────────────────────

export type DisputeStatus = 'open' | 'in_review' | 'provisional_credit' | 'resolved_won' | 'resolved_lost' | 'cancelled';

export interface BankingDispute {
  id: string;
  shop_id: string;
  transaction_id: string;
  merchant_name: string;
  amount: number; // cents
  reason_code: string;
  description: string;
  evidence_json: DisputeEvidence[];
  status: DisputeStatus;
  partner_dispute_id: string | null;
  provisional_credit_amount: number; // cents
  filed_at: string;
}

export interface DisputeEvidence {
  id: string;
  type: string;
  url: string;
  uploaded_at: string;
}

// ─── Statements ───────────────────────────────────────────────────────────────

export interface BankingStatement {
  id: string;
  shop_id: string;
  account_id: string;
  period_start: string;
  period_end: string;
  pdf_url: string;
  generated_at: string;
}

// ─── Audit ────────────────────────────────────────────────────────────────────

export interface BankingAuditLog {
  id: string;
  shop_id: string;
  actor_user_id: string;
  action: string;
  object_type: string;
  object_id: string;
  before_json: Record<string, unknown> | null;
  after_json: Record<string, unknown> | null;
  ip: string;
  user_agent: string;
  created_at: string;
}

// ─── Provider input / output ──────────────────────────────────────────────────

export interface CreateApplicationInput {
  business: {
    legal_name: string;
    dba: string | null;
    entity_type: EntityType;
    ein: string;
    formation_state: string;
    formation_date: string;
    address: Address;
    phone: string;
    website: string | null;
    estimated_monthly_revenue: number; // cents
    naics_code: string;
  };
  owners: Array<{
    full_name: string;
    dob: string;
    ssn_token: string;
    address: Address;
    ownership_pct: number;
    is_control_person: boolean;
    email: string;
    phone: string;
  }>;
  disclosures: {
    deposit_agreement_accepted_at: string;
    esign_consent_accepted_at: string;
    patriot_act_accepted_at: string;
    ip: string;
  };
  idempotency_key: string;
}

export interface CreateTransferInput {
  type: TransferType;
  from_vault_id?: string;
  to_vault_id?: string;
  counterparty_id?: string;
  amount: number; // cents
  currency: string;
  memo?: string;
  scheduled_for?: string;
  recurrence?: RecurrenceRule;
  idempotency_key: string;
}

export interface IssueCardInput {
  form_factor: CardFormFactor;
  card_name: string;
  assigned_user_id?: string;
  asset_id?: string;
}

export interface CreateDisputeInput {
  transaction_id: string;
  reason_code: string;
  description: string;
  idempotency_key: string;
}

// ─── Provider interface ───────────────────────────────────────────────────────

export interface BankingProvider {
  createApplication(input: CreateApplicationInput): Promise<{ application_id: string; status: ApplicationStatus }>;
  getApplicationStatus(application_id: string): Promise<{ status: ApplicationStatus; denial_reason: string | null; documents_required: RequiredDocument[] | null }>;
  uploadDocument(application_id: string, doc_type: string, file_data: string): Promise<{ doc_id: string; status: string }>;
  getAccount(account_id: string): Promise<{ balance_available: number; balance_pending: number; synced_at: string }>;
  listTransactions(account_id: string, params: { limit?: number; offset?: number; from?: string; to?: string }): Promise<{ transactions: BankingTransaction[]; total: number }>;
  createTransfer(account_id: string, input: CreateTransferInput): Promise<{ transfer_id: string; status: TransferStatus }>;
  issueCard(account_id: string, input: IssueCardInput): Promise<{ card_id: string; last4: string; status: CardStatus }>;
  updateCardControls(card_id: string, controls: Partial<BankingCardControls>): Promise<void>;
  freezeCard(card_id: string, reason?: string): Promise<void>;
  createDispute(input: CreateDisputeInput): Promise<{ dispute_id: string; status: DisputeStatus }>;
  getStatement(statement_id: string): Promise<{ pdf_url: string }>;
}

// ─── Roles + permissions ──────────────────────────────────────────────────────

export type BankingRole = 'owner' | 'admin' | 'bookkeeper' | 'tech';

export interface BankingPermissions {
  view_balances: boolean;
  initiate_transfer: boolean;
  approve_transfer: boolean;
  issue_freeze_cards: boolean;
  own_assigned_card: boolean;
  upload_receipt: boolean;
  export_accounting: boolean;
  close_account: boolean;
}

export const BANKING_PERMISSIONS: Record<BankingRole, BankingPermissions> = {
  owner:      { view_balances: true,  initiate_transfer: true,  approve_transfer: true,  issue_freeze_cards: true,  own_assigned_card: true,  upload_receipt: true,  export_accounting: true,  close_account: true  },
  admin:      { view_balances: true,  initiate_transfer: true,  approve_transfer: false, issue_freeze_cards: true,  own_assigned_card: true,  upload_receipt: true,  export_accounting: true,  close_account: false },
  bookkeeper: { view_balances: true,  initiate_transfer: false, approve_transfer: false, issue_freeze_cards: false, own_assigned_card: false, upload_receipt: true,  export_accounting: true,  close_account: false },
  tech:       { view_balances: false, initiate_transfer: false, approve_transfer: false, issue_freeze_cards: false, own_assigned_card: true,  upload_receipt: true,  export_accounting: false, close_account: false },
};

export const DUAL_APPROVAL_THRESHOLD_DEFAULT = 25000000; // $250,000 in cents

// ─── MCC groups ───────────────────────────────────────────────────────────────

export const MCC_GROUPS: MccGroup[] = [
  { id: 'fuel',     label: 'Fuel & Gas',      mccs: ['5541', '5542', '5172'] },
  { id: 'parts',    label: 'Auto Parts',       mccs: ['5013', '5533', '5571'] },
  { id: 'tolls',    label: 'Tolls & Parking',  mccs: ['7523', '4784'] },
  { id: 'supplies', label: 'Shop Supplies',    mccs: ['5251', '5065', '5085'] },
  { id: 'food',     label: 'Meals',            mccs: ['5812', '5814'] },
  { id: 'hardware', label: 'Hardware',         mccs: ['5251', '5211'] },
  { id: 'software', label: 'Software / SaaS',  mccs: ['7372', '7379'] },
  { id: 'travel',   label: 'Travel & Lodging', mccs: ['3000', '7011', '4511'] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format integer cents as currency string. Always pass cents — never floats. */
export function formatCents(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/** Generate a client-side idempotency key for money-moving writes. */
export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}

export const NAICS_BY_INDUSTRY: Record<string, string> = {
  tires:    '441320',
  hvac:     '238220',
  lawn:     '561730',
  plumbing: '238220',
  pest:     '561710',
  cleaning: '561720',
  auto:     '811111',
  electric: '238210',
};

import type {
  BankingAccount, BankingVault, BankingVaultRule, BankingCard, BankingCardControls,
  BankingTransaction, BankingTransfer, BankingCounterparty, BankingDispute, BankingStatement,
} from '../../../lib/banking/types';

// Pre-approved tenant scenario — all amounts in integer cents

export const MOCK_ACCOUNT: BankingAccount = {
  id: 'acc1',
  shop_id: 'shop1',
  location_id: null,
  partner_account_id: 'prt_acc_8821',
  routing_last4: '0021',
  account_last4: '4471',
  status: 'active',
  balance_available_cached: 842341,  // $8,423.41
  balance_pending_cached: 34500,     // $345.00
  synced_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(), // 4 min ago
  opened_at: '2026-06-01T00:00:00Z',
  closed_at: null,
  currency: 'USD',
};

export const MOCK_VAULTS: BankingVault[] = [
  { id: 'v1', shop_id: 'shop1', account_id: 'acc1', name: 'Operating',          balance_cached: 538306, target_balance: 600000, currency: 'USD', is_default: true,  sort_order: 0 },
  { id: 'v2', shop_id: 'shop1', account_id: 'acc1', name: 'Tax Reserve',         balance_cached: 189500, target_balance: 250000, currency: 'USD', is_default: false, sort_order: 1 },
  { id: 'v3', shop_id: 'shop1', account_id: 'acc1', name: 'Parts & Inventory',   balance_cached: 114535, target_balance: undefined,               currency: 'USD', is_default: false, sort_order: 2 },
];

export const MOCK_VAULT_RULES: BankingVaultRule[] = [
  { id: 'vr1', shop_id: 'shop1', vault_id: 'v2', vault_name: 'Tax Reserve',       trigger: 'inbound_deposit', allocation_type: 'percentage', allocation_value: 20, priority: 1, active: true },
  { id: 'vr2', shop_id: 'shop1', vault_id: 'v3', vault_name: 'Parts & Inventory', trigger: 'inbound_deposit', allocation_type: 'percentage', allocation_value: 10, priority: 2, active: true },
];

export const MOCK_CARDS: BankingCard[] = [
  { id: 'c1', shop_id: 'shop1', account_id: 'acc1', partner_card_id: 'prt_c001', assigned_user_id: 'u1', assigned_user_name: 'Mike Torres', asset_id: null, asset_name: null, card_name: 'Mike – Truck 1', form_factor: 'physical', last4: '7812', status: 'active',   shipped_at: '2026-06-05T00:00:00Z', activated_at: '2026-06-08T00:00:00Z' },
  { id: 'c2', shop_id: 'shop1', account_id: 'acc1', partner_card_id: 'prt_c002', assigned_user_id: 'u2', assigned_user_name: 'Sarah Lee',   asset_id: null, asset_name: null, card_name: 'Sarah – Truck 2', form_factor: 'physical', last4: '3344', status: 'active',   shipped_at: '2026-06-05T00:00:00Z', activated_at: '2026-06-09T00:00:00Z' },
  { id: 'c3', shop_id: 'shop1', account_id: 'acc1', partner_card_id: 'prt_c003', assigned_user_id: null, assigned_user_name: null, asset_id: 'asset_3', asset_name: 'Shop Van', card_name: 'Shop Van',          form_factor: 'virtual',  last4: '9901', status: 'frozen', shipped_at: null,                    activated_at: '2026-07-01T00:00:00Z' },
  { id: 'c4', shop_id: 'shop1', account_id: 'acc1', partner_card_id: 'prt_c004', assigned_user_id: 'u3', assigned_user_name: 'James Okafor', asset_id: null, asset_name: null, card_name: 'James – Parts Runs', form_factor: 'physical', last4: '5566', status: 'pending_activation', shipped_at: '2026-09-10T00:00:00Z', activated_at: null },
];

export const MOCK_CARD_CONTROLS: Record<string, BankingCardControls> = {
  c1: { id: 'cc1', card_id: 'c1', monthly_limit: 50000,  per_txn_limit: 15000, allowed_mcc_groups: ['fuel', 'parts', 'tolls'], allowed_days: [1,2,3,4,5,6], allowed_hours: { start: '06:00', end: '20:00' }, geo_radius_miles: 50 },
  c2: { id: 'cc2', card_id: 'c2', monthly_limit: 50000,  per_txn_limit: 15000, allowed_mcc_groups: ['fuel', 'parts', 'tolls'], allowed_days: [1,2,3,4,5,6], allowed_hours: { start: '06:00', end: '20:00' }, geo_radius_miles: 50 },
  c3: { id: 'cc3', card_id: 'c3', monthly_limit: 100000, per_txn_limit: 25000, allowed_mcc_groups: ['fuel', 'parts', 'supplies'],  allowed_days: [0,1,2,3,4,5,6], allowed_hours: null, geo_radius_miles: null },
  c4: { id: 'cc4', card_id: 'c4', monthly_limit: 30000,  per_txn_limit: 8000,  allowed_mcc_groups: ['parts', 'supplies'], allowed_days: [1,2,3,4,5], allowed_hours: { start: '08:00', end: '18:00' }, geo_radius_miles: 30 },
};

export const MOCK_TRANSACTIONS: BankingTransaction[] = [
  { id: 't1', shop_id: 'shop1', account_id: 'acc1', vault_id: 'v1', vault_name: 'Operating', card_id: 'c1', card_name: 'Mike – Truck 1',    partner_txn_id: 'ptx001', direction: 'debit',  amount: 8734,   currency: 'USD', status: 'posted',  merchant_name: 'Shell Gas Station',  mcc: '5541', category: 'Fuel & Gas',      description: 'Shell Gas Station #4421',          visit_id: null,      purchase_order_id: null,    order_id: null,    receipt_url: 'https://example.com/r1', posted_at: '2026-09-13T08:22:00Z' },
  { id: 't2', shop_id: 'shop1', account_id: 'acc1', vault_id: 'v1', vault_name: 'Operating', card_id: null, card_name: null,                 partner_txn_id: 'ptx002', direction: 'credit', amount: 345678, currency: 'USD', status: 'posted',  merchant_name: null,                 mcc: null,   category: 'Shop Payout',     description: 'TDforge Payout – Batch #0913',     visit_id: null,      purchase_order_id: null,    order_id: 'ord_892', receipt_url: null,                    posted_at: '2026-09-13T06:00:00Z' },
  { id: 't3', shop_id: 'shop1', account_id: 'acc1', vault_id: 'v2', vault_name: 'Tax Reserve', card_id: null, card_name: null,               partner_txn_id: 'ptx003', direction: 'debit',  amount: 69135,  currency: 'USD', status: 'posted',  merchant_name: null,                 mcc: null,   category: 'Vault Transfer',  description: 'Vault rule: 20% → Tax Reserve',    visit_id: null,      purchase_order_id: null,    order_id: null,    receipt_url: null,                    posted_at: '2026-09-13T06:00:01Z' },
  { id: 't4', shop_id: 'shop1', account_id: 'acc1', vault_id: 'v1', vault_name: 'Operating', card_id: 'c1', card_name: 'Mike – Truck 1',    partner_txn_id: 'ptx004', direction: 'debit',  amount: 24599,  currency: 'USD', status: 'posted',  merchant_name: 'O\'Reilly Auto Parts', mcc: '5013', category: 'Auto Parts',    description: 'O\'Reilly Auto Parts #1187',       visit_id: 'vis_441', purchase_order_id: 'po_221', order_id: null,    receipt_url: null,                    posted_at: '2026-09-12T14:35:00Z' },
  { id: 't5', shop_id: 'shop1', account_id: 'acc1', vault_id: 'v1', vault_name: 'Operating', card_id: 'c2', card_name: 'Sarah – Truck 2',   partner_txn_id: 'ptx005', direction: 'debit',  amount: 6210,   currency: 'USD', status: 'posted',  merchant_name: 'EZPass Tolls',       mcc: '4784', category: 'Tolls & Parking', description: 'EZPass Toll Charge',               visit_id: null,      purchase_order_id: null,    order_id: null,    receipt_url: null,                    posted_at: '2026-09-12T11:10:00Z' },
  { id: 't6', shop_id: 'shop1', account_id: 'acc1', vault_id: 'v3', vault_name: 'Parts & Inventory', card_id: null, card_name: null,         partner_txn_id: 'ptx006', direction: 'debit',  amount: 189500, currency: 'USD', status: 'posted',  merchant_name: 'ATD Distribution',   mcc: '5013', category: 'Parts Purchase', description: 'ACH – ATD Invoice #88231',          visit_id: null,      purchase_order_id: 'po_220', order_id: null,    receipt_url: 'https://example.com/r6', posted_at: '2026-09-11T09:00:00Z' },
  { id: 't7', shop_id: 'shop1', account_id: 'acc1', vault_id: 'v1', vault_name: 'Operating', card_id: null, card_name: null,                 partner_txn_id: 'ptx007', direction: 'credit', amount: 289000, currency: 'USD', status: 'posted',  merchant_name: null,                 mcc: null,   category: 'Shop Payout',     description: 'TDforge Payout – Batch #0911',     visit_id: null,      purchase_order_id: null,    order_id: 'ord_891', receipt_url: null,                    posted_at: '2026-09-11T06:00:00Z' },
  { id: 't8', shop_id: 'shop1', account_id: 'acc1', vault_id: 'v1', vault_name: 'Operating', card_id: 'c1', card_name: 'Mike – Truck 1',    partner_txn_id: 'ptx008', direction: 'debit',  amount: 3499,   currency: 'USD', status: 'pending', merchant_name: 'Home Depot',         mcc: '5251', category: 'Hardware',        description: 'Home Depot #4418',                 visit_id: null,      purchase_order_id: null,    order_id: null,    receipt_url: null,                    posted_at: '2026-09-13T10:55:00Z' },
  { id: 't9', shop_id: 'shop1', account_id: 'acc1', vault_id: 'v1', vault_name: 'Operating', card_id: 'c2', card_name: 'Sarah – Truck 2',   partner_txn_id: 'ptx009', direction: 'debit',  amount: 15240,  currency: 'USD', status: 'posted',  merchant_name: 'AutoZone',           mcc: '5533', category: 'Auto Parts',      description: 'AutoZone #7734',                   visit_id: 'vis_439', purchase_order_id: 'po_219', order_id: null,    receipt_url: null,                    posted_at: '2026-09-10T13:20:00Z' },
  { id: 't10',shop_id: 'shop1', account_id: 'acc1', vault_id: 'v1', vault_name: 'Operating', card_id: null, card_name: null,                 partner_txn_id: 'ptx010', direction: 'credit', amount: 52000,  currency: 'USD', status: 'posted',  merchant_name: null,                 mcc: null,   category: 'ACH Transfer In', description: 'ACH Pull – Business Checking',     visit_id: null,      purchase_order_id: null,    order_id: null,    receipt_url: null,                    posted_at: '2026-09-09T08:00:00Z' },
];

export const MOCK_TRANSFERS: BankingTransfer[] = [
  { id: 'txfr1', shop_id: 'shop1', account_id: 'acc1', type: 'vault_to_vault', counterparty_id: null, counterparty_name: null, from_vault_id: 'v1', from_vault_name: 'Operating', to_vault_id: 'v2', to_vault_name: 'Tax Reserve', amount: 50000, currency: 'USD', status: 'completed', scheduled_for: null, recurrence_json: null, initiated_by: 'Owner', approved_by: null, approval_status: 'not_required', idempotency_key: 'idem_1', partner_transfer_id: 'pt001', created_at: '2026-09-10T09:00:00Z' },
  { id: 'txfr2', shop_id: 'shop1', account_id: 'acc1', type: 'ach_out', counterparty_id: 'cp1', counterparty_name: 'ATD Distribution', from_vault_id: 'v3', from_vault_name: 'Parts & Inventory', to_vault_id: null, to_vault_name: null, amount: 189500, currency: 'USD', status: 'completed', scheduled_for: null, recurrence_json: null, initiated_by: 'Owner', approved_by: null, approval_status: 'not_required', idempotency_key: 'idem_2', partner_transfer_id: 'pt002', created_at: '2026-09-11T08:55:00Z' },
  { id: 'txfr3', shop_id: 'shop1', account_id: 'acc1', type: 'ach_out', counterparty_id: 'cp2', counterparty_name: 'Landlord – Main St.', from_vault_id: 'v1', from_vault_name: 'Operating', to_vault_id: null, to_vault_name: null, amount: 250000, currency: 'USD', status: 'scheduled', scheduled_for: '2026-10-01T08:00:00Z', recurrence_json: { frequency: 'monthly', day_of_month: 1 }, initiated_by: 'Owner', approved_by: null, approval_status: 'not_required', idempotency_key: 'idem_3', partner_transfer_id: null, created_at: '2026-09-01T10:00:00Z' },
];

export const MOCK_COUNTERPARTIES: BankingCounterparty[] = [
  { id: 'cp1', shop_id: 'shop1', nickname: 'ATD Distribution',     type: 'vendor',       routing_token: 'rt_tok_1', account_token: 'at_tok_1', last4: '8821', bank_name: 'JPMorgan Chase', verification_status: 'verified',      last_used_at: '2026-09-11T08:55:00Z' },
  { id: 'cp2', shop_id: 'shop1', nickname: 'Landlord – Main St.',  type: 'vendor',       routing_token: 'rt_tok_2', account_token: 'at_tok_2', last4: '3344', bank_name: 'Wells Fargo',    verification_status: 'verified',      last_used_at: '2026-09-01T08:00:00Z' },
  { id: 'cp3', shop_id: 'shop1', nickname: 'Owner Personal Acct.', type: 'external_bank', routing_token: 'rt_tok_3', account_token: 'at_tok_3', last4: '7712', bank_name: 'Bank of America', verification_status: 'plaid_verified', last_used_at: '2026-08-15T12:00:00Z' },
];

export const MOCK_DISPUTES: BankingDispute[] = [
  { id: 'disp1', shop_id: 'shop1', transaction_id: 't6', merchant_name: 'ATD Distribution', amount: 189500, reason_code: 'not_as_described', description: 'Received wrong tire sizes, full batch returned', evidence_json: [{ id: 'ev1', type: 'return_receipt', url: 'https://example.com/ev1', uploaded_at: '2026-09-12T10:00:00Z' }], status: 'in_review', partner_dispute_id: 'pd_001', provisional_credit_amount: 189500, filed_at: '2026-09-12T09:00:00Z' },
];

export const MOCK_STATEMENTS: BankingStatement[] = [
  { id: 'stmt3', shop_id: 'shop1', account_id: 'acc1', period_start: '2026-09-01', period_end: '2026-09-30', pdf_url: 'https://example.com/stmt-sep-2026.pdf', generated_at: '2026-10-01T06:00:00Z' },
  { id: 'stmt2', shop_id: 'shop1', account_id: 'acc1', period_start: '2026-08-01', period_end: '2026-08-31', pdf_url: 'https://example.com/stmt-aug-2026.pdf', generated_at: '2026-09-01T06:00:00Z' },
  { id: 'stmt1', shop_id: 'shop1', account_id: 'acc1', period_start: '2026-07-01', period_end: '2026-07-31', pdf_url: 'https://example.com/stmt-jul-2026.pdf', generated_at: '2026-08-01T06:00:00Z' },
];

// 30-day bar chart data — amounts in cents
export const MOCK_CASHFLOW_30D = Array.from({ length: 30 }, (_, i) => {
  const d = new Date('2026-08-15');
  d.setDate(d.getDate() + i);
  return {
    date: d.toISOString().slice(0, 10),
    inflow: Math.floor(50000 + Math.random() * 250000),
    outflow: Math.floor(30000 + Math.random() * 180000),
  };
});

export const MOCK_UPCOMING_OBLIGATIONS = [
  { id: 'ob1', label: 'Rent – Main St.',           amount: 250000, currency: 'USD', due: '2026-10-01', type: 'scheduled_transfer' },
  { id: 'ob2', label: 'TDforge Subscription',      amount: 49900,  currency: 'USD', due: '2026-09-28', type: 'subscription' },
  { id: 'ob3', label: 'ATD Parts Invoice #88299',  amount: 124000, currency: 'USD', due: '2026-09-20', type: 'bill_pay' },
];

export const MISSING_RECEIPT_TRANSACTIONS = MOCK_TRANSACTIONS.filter(
  t => t.direction === 'debit' && !t.receipt_url &&
    (Date.now() - new Date(t.posted_at).getTime()) > 48 * 60 * 60 * 1000
);

export const FEE_SCHEDULE = [
  { feature: 'Monthly account fee',    fee: 'Included' },
  { feature: 'ACH transfers',          fee: 'Free' },
  { feature: 'Instant payout',         fee: '1.5% of payout (min $0.25)' },
  { feature: 'Domestic wires',         fee: '$25 / wire (Enterprise)' },
  { feature: 'Physical card',          fee: 'Free (1 per user)' },
  { feature: 'Card replacement',       fee: '$5 / card' },
  { feature: 'International txns',     fee: '3% of amount' },
  { feature: 'Paper statements',       fee: '$5 / statement' },
  { feature: 'Mobile check deposit',   fee: 'Free' },
];

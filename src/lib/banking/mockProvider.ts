import type {
  BankingProvider, ApplicationStatus, RequiredDocument, BankingTransaction,
  TransferStatus, CardStatus, DisputeStatus, BankingCardControls,
  CreateApplicationInput, CreateTransferInput, IssueCardInput, CreateDisputeInput,
} from './types';

function delay(min = 400, max = 1200): Promise<void> {
  return new Promise(r => setTimeout(r, min + Math.random() * (max - min)));
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

const MOCK_TRANSACTIONS: BankingTransaction[] = [
  { id: 't1', shop_id: 'shop1', account_id: 'acc1', vault_id: 'v1', vault_name: 'Operating', card_id: 'c1', card_name: 'Mike – Truck 1', partner_txn_id: 'ptx001', direction: 'debit', amount: 8734, currency: 'USD', status: 'posted', merchant_name: 'Shell Gas Station', mcc: '5541', category: 'Fuel & Gas', description: 'Shell Gas Station #4421', visit_id: null, purchase_order_id: null, order_id: null, receipt_url: 'https://example.com/r1', posted_at: '2026-09-13T08:22:00Z' },
  { id: 't2', shop_id: 'shop1', account_id: 'acc1', vault_id: 'v1', vault_name: 'Operating', card_id: null, card_name: null, partner_txn_id: 'ptx002', direction: 'credit', amount: 345678, currency: 'USD', status: 'posted', merchant_name: null, mcc: null, category: 'Shop Payout', description: 'FB Business Connect Payout – Batch #0913', visit_id: null, purchase_order_id: null, order_id: 'ord_892', receipt_url: null, posted_at: '2026-09-13T06:00:00Z' },
  { id: 't3', shop_id: 'shop1', account_id: 'acc1', vault_id: 'v2', vault_name: 'Tax Reserve', card_id: null, card_name: null, partner_txn_id: 'ptx003', direction: 'debit', amount: 69135, currency: 'USD', status: 'posted', merchant_name: null, mcc: null, category: 'Vault Transfer', description: 'Vault rule: 20% to Tax Reserve', visit_id: null, purchase_order_id: null, order_id: null, receipt_url: null, posted_at: '2026-09-13T06:00:01Z' },
  { id: 't4', shop_id: 'shop1', account_id: 'acc1', vault_id: 'v1', vault_name: 'Operating', card_id: 'c1', card_name: 'Mike – Truck 1', partner_txn_id: 'ptx004', direction: 'debit', amount: 24599, currency: 'USD', status: 'posted', merchant_name: 'O\'Reilly Auto Parts', mcc: '5013', category: 'Auto Parts', description: 'O\'Reilly Auto Parts #1187', visit_id: 'vis_441', purchase_order_id: 'po_221', order_id: null, receipt_url: null, posted_at: '2026-09-12T14:35:00Z' },
  { id: 't5', shop_id: 'shop1', account_id: 'acc1', vault_id: 'v1', vault_name: 'Operating', card_id: 'c2', card_name: 'Sarah – Truck 2', partner_txn_id: 'ptx005', direction: 'debit', amount: 6210, currency: 'USD', status: 'posted', merchant_name: 'EZPass Tolls', mcc: '4784', category: 'Tolls & Parking', description: 'EZPass Toll Charge', visit_id: null, purchase_order_id: null, order_id: null, receipt_url: null, posted_at: '2026-09-12T11:10:00Z' },
  { id: 't6', shop_id: 'shop1', account_id: 'acc1', vault_id: 'v3', vault_name: 'Parts & Inventory', card_id: null, card_name: null, partner_txn_id: 'ptx006', direction: 'debit', amount: 189500, currency: 'USD', status: 'posted', merchant_name: 'ATD Distribution', mcc: '5013', category: 'Parts Purchase', description: 'ACH – ATD Invoice #88231', visit_id: null, purchase_order_id: 'po_220', order_id: null, receipt_url: 'https://example.com/r6', posted_at: '2026-09-11T09:00:00Z' },
  { id: 't7', shop_id: 'shop1', account_id: 'acc1', vault_id: 'v1', vault_name: 'Operating', card_id: null, card_name: null, partner_txn_id: 'ptx007', direction: 'credit', amount: 289000, currency: 'USD', status: 'posted', merchant_name: null, mcc: null, category: 'Shop Payout', description: 'FB Business Connect Payout – Batch #0911', visit_id: null, purchase_order_id: null, order_id: 'ord_891', receipt_url: null, posted_at: '2026-09-11T06:00:00Z' },
  { id: 't8', shop_id: 'shop1', account_id: 'acc1', vault_id: 'v1', vault_name: 'Operating', card_id: 'c1', card_name: 'Mike – Truck 1', partner_txn_id: 'ptx008', direction: 'debit', amount: 3499, currency: 'USD', status: 'pending', merchant_name: 'Home Depot', mcc: '5251', category: 'Hardware', description: 'Home Depot #4418', visit_id: null, purchase_order_id: null, order_id: null, receipt_url: null, posted_at: '2026-09-13T10:55:00Z' },
];

export class MockBankingProvider implements BankingProvider {
  private applicationStatus: ApplicationStatus = 'approved';

  async createApplication(input: CreateApplicationInput) {
    await delay();
    console.log('[MockBankingProvider] createApplication', {
      legal_name: input.business.legal_name,
      entity_type: input.business.entity_type,
      owners: input.owners.map(o => ({ full_name: o.full_name, ownership_pct: o.ownership_pct })),
      // ssn_token is logged (never the raw SSN), pan/card_number/cvv/account_number are never here
    });
    this.applicationStatus = 'submitted';
    return { application_id: `app_${uid()}`, status: 'submitted' as ApplicationStatus };
  }

  async getApplicationStatus(application_id: string) {
    await delay(400, 800);
    // Simulate progression: submitted → pending_review → approved
    if (this.applicationStatus === 'submitted') {
      this.applicationStatus = 'pending_review';
    }
    return {
      status: this.applicationStatus,
      denial_reason: null,
      documents_required: null,
    };
  }

  async uploadDocument(application_id: string, doc_type: string, _file_data: string) {
    await delay();
    return { doc_id: `doc_${uid()}`, status: 'uploaded' };
  }

  async getAccount(account_id: string) {
    await delay(400, 700);
    return {
      balance_available: 842341, // $8,423.41
      balance_pending: 34500,    // $345.00
      synced_at: new Date().toISOString(),
    };
  }

  async listTransactions(account_id: string, params: { limit?: number; offset?: number; from?: string; to?: string }) {
    await delay(500, 900);
    const limit = params.limit ?? 25;
    const offset = params.offset ?? 0;
    const slice = MOCK_TRANSACTIONS.slice(offset, offset + limit);
    return { transactions: slice, total: MOCK_TRANSACTIONS.length };
  }

  async createTransfer(account_id: string, input: CreateTransferInput) {
    await delay();
    console.log('[MockBankingProvider] createTransfer', {
      type: input.type,
      amount: input.amount,
      currency: input.currency,
      idempotency_key: input.idempotency_key,
      // routing/account details are tokenized — never raw
    });
    const needsApproval = input.amount >= 25000000; // $250k threshold
    return {
      transfer_id: `txfr_${uid()}`,
      status: (needsApproval ? 'pending_approval' : 'processing') as TransferStatus,
    };
  }

  async issueCard(account_id: string, input: IssueCardInput) {
    await delay();
    const last4 = String(Math.floor(1000 + Math.random() * 9000));
    return {
      card_id: `card_${uid()}`,
      last4,
      status: (input.form_factor === 'virtual' ? 'active' : 'pending_activation') as CardStatus,
    };
  }

  async updateCardControls(card_id: string, controls: Partial<BankingCardControls>) {
    await delay(400, 700);
    console.log('[MockBankingProvider] updateCardControls', { card_id, controls });
  }

  async freezeCard(card_id: string, reason?: string) {
    await delay(400, 700);
    console.log('[MockBankingProvider] freezeCard', { card_id, reason });
  }

  async createDispute(input: CreateDisputeInput) {
    await delay();
    return {
      dispute_id: `disp_${uid()}`,
      status: 'open' as DisputeStatus,
    };
  }

  async getStatement(statement_id: string) {
    await delay(400, 600);
    return { pdf_url: `https://example.com/statements/${statement_id}.pdf` };
  }
}

const PROVIDER_MODE = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_PROVIDER_MODE ?? 'mock';

let _provider: BankingProvider | null = null;

export function getBankingProvider(): BankingProvider {
  if (_provider) return _provider;
  if (PROVIDER_MODE === 'mock' || !PROVIDER_MODE) {
    _provider = new MockBankingProvider();
    return _provider;
  }
  // sandbox / live: throw — not wired in this build
  throw new Error(`Banking provider mode "${PROVIDER_MODE}" is not configured. Set VITE_PROVIDER_MODE=mock for demo.`);
}

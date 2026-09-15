import { useState, useMemo } from 'react';
import { Search, Paperclip, X, Download, ChevronRight, SlidersHorizontal, Link2 } from 'lucide-react';
import { formatCents } from '../../../lib/banking/types';
import type { BankingTransaction } from '../../../lib/banking/types';
import { MOCK_TRANSACTIONS, MOCK_ACCOUNT } from './mockData';

// ─── Status pill ──────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: BankingTransaction['status'] }) {
  const cfg = {
    posted:    { label: 'Posted',    bg: '#F0FDF4', color: '#27AE60' },
    pending:   { label: 'Pending',   bg: '#FFF8E1', color: '#F39C12' },
    returned:  { label: 'Returned',  bg: '#FEF2F2', color: '#00BFC3' },
    cancelled: { label: 'Cancelled', bg: '#F3F4F6', color: '#6B7280' },
  }[status];
  return (
    <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

// ─── Amount cell ──────────────────────────────────────────────────────────────

function AmountCell({ txn }: { txn: BankingTransaction }) {
  const color = txn.status === 'pending' ? '#6B7280'
    : txn.direction === 'credit' ? '#27AE60'
    : '#00A9AC';
  const prefix = txn.direction === 'credit' ? '+' : '−';
  return (
    <span style={{ fontFeatureSettings: '"tnum"', fontVariantNumeric: 'tabular-nums', fontWeight: 700, color, fontSize: '0.9375rem', whiteSpace: 'nowrap' }}>
      {prefix}{formatCents(txn.amount, txn.currency)}
    </span>
  );
}

// ─── Row detail drawer ────────────────────────────────────────────────────────

function RowDrawer({ txn, onClose }: { txn: BankingTransaction; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex" style={{ background: 'rgba(0,0,0,0.3)' }} onClick={onClose}>
      <div className="ml-auto h-full overflow-auto" style={{ width: 400, background: '#fff', boxShadow: '-4px 0 20px rgba(0,0,0,0.12)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#E5E7EB' }}>
          <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.0625rem' }}>Transaction detail</p>
          <button onClick={onClose}><X size={18} style={{ color: '#9CA3AF' }} /></button>
        </div>
        <div className="p-5 space-y-4">
          {/* Amount */}
          <div className="text-center py-4 rounded-[10px]" style={{ background: '#F9FAFB' }}>
            <AmountCell txn={txn} />
            <p style={{ color: '#9CA3AF', fontSize: '0.8125rem', marginTop: 4 }}>{new Date(txn.posted_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>

          {/* Details */}
          {[
            ['Merchant',     txn.merchant_name ?? '—'],
            ['Description',  txn.description],
            ['Direction',    txn.direction === 'credit' ? 'Money in' : 'Money out'],
            ['Status',       txn.status],
            ['Vault',        txn.vault_name ?? '—'],
            ['Card',         txn.card_name ?? '—'],
            ['Category',     txn.category ?? '—'],
            ['MCC',          txn.mcc ?? '—'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>{k}</span>
              <span style={{ color: '#1A1A1A', fontSize: '0.875rem', fontWeight: 600, maxWidth: 220, textAlign: 'right' }}>{v}</span>
            </div>
          ))}

          {/* Linked objects */}
          {txn.visit_id && (
            <div className="flex items-center gap-2 p-3 rounded-[8px]" style={{ background: '#EBF5FB', border: '1px solid #AED6F1' }}>
              <Link2 size={14} style={{ color: '#2980B9' }} />
              <span style={{ fontSize: '0.875rem', color: '#1A5276' }}>Visit <strong>{txn.visit_id}</strong></span>
            </div>
          )}
          {txn.purchase_order_id && (
            <div className="flex items-center gap-2 p-3 rounded-[8px]" style={{ background: '#EBF5FB', border: '1px solid #AED6F1' }}>
              <Link2 size={14} style={{ color: '#2980B9' }} />
              <span style={{ fontSize: '0.875rem', color: '#1A5276' }}>Purchase order <strong>{txn.purchase_order_id}</strong></span>
            </div>
          )}
          {txn.order_id && (
            <div className="flex items-center gap-2 p-3 rounded-[8px]" style={{ background: '#EBF5FB', border: '1px solid #AED6F1' }}>
              <Link2 size={14} style={{ color: '#2980B9' }} />
              <span style={{ fontSize: '0.875rem', color: '#1A5276' }}>Order <strong>{txn.order_id}</strong></span>
            </div>
          )}

          {/* Receipt */}
          <div>
            <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.875rem', marginBottom: 8 }}>Receipt</p>
            {txn.receipt_url ? (
              <a href={txn.receipt_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-[6px]" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#15803D', fontSize: '0.875rem', fontWeight: 600 }}>
                <Paperclip size={14} /> View receipt
              </a>
            ) : txn.direction === 'debit' ? (
              <label className="flex items-center gap-2 px-3 py-2 rounded-[6px] cursor-pointer" style={{ background: '#F9FAFB', border: '1px dashed #D1D5DB', color: '#6B7280', fontSize: '0.875rem' }}>
                <Paperclip size={14} /> Attach receipt
                <input type="file" className="hidden" />
              </label>
            ) : (
              <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>N/A</p>
            )}
          </div>

          {/* Category override */}
          <div>
            <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.875rem', marginBottom: 6 }}>Category</p>
            <select defaultValue={txn.category ?? ''} className="w-full px-3 py-2 rounded-[6px]" style={{ border: '1px solid #E5E7EB', fontSize: '0.9375rem' }}>
              {['Fuel & Gas', 'Auto Parts', 'Tolls & Parking', 'Shop Supplies', 'Meals', 'Hardware', 'Software / SaaS', 'Travel & Lodging', 'Shop Payout', 'Vault Transfer', 'ACH Transfer In', 'Parts Purchase', 'Uncategorized'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reconciliation queue ─────────────────────────────────────────────────────

function ReconciliationQueue() {
  const unmatched = MOCK_TRANSACTIONS.filter(t => !t.visit_id && !t.purchase_order_id && !t.order_id && t.direction === 'debit');
  const [dismissed, setDismissed] = useState<string[]>([]);
  const visible = unmatched.filter(t => !dismissed.includes(t.id));

  if (visible.length === 0) {
    return (
      <div className="text-center py-10" style={{ color: '#9CA3AF' }}>
        All transactions are matched. ✓
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>{visible.length} transaction{visible.length !== 1 ? 's' : ''} need matching to a visit, PO, or order.</p>
      {visible.map(txn => (
        <div key={txn.id} className="rounded-[8px] p-4" style={{ border: '1.5px solid #E5E7EB', background: '#fff' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.9375rem' }}>{txn.merchant_name ?? txn.description}</p>
              <p style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>{new Date(txn.posted_at).toLocaleDateString()}</p>
            </div>
            <AmountCell txn={txn} />
          </div>
          <div className="flex gap-2">
            <select className="flex-1 px-2 py-1.5 rounded-[6px] text-sm" style={{ border: '1px solid #E5E7EB' }}>
              <option value="">— Link to visit, PO, or order —</option>
              <option value="vis_441">Visit #vis_441 – Tire rotation, Sep 12</option>
              <option value="po_219">PO #po_219 – AutoZone order, Sep 10</option>
              <option value="ord_890">Order #ord_890 – Sep 8</option>
            </select>
            <button className="px-3 py-1.5 rounded-[6px] text-sm font-semibold" style={{ background: '#1A1A1A', color: '#fff' }}>Confirm</button>
            <button onClick={() => setDismissed(d => [...d, txn.id])} className="px-2 py-1.5 rounded-[6px]" style={{ color: '#9CA3AF' }}>
              <X size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main ledger ──────────────────────────────────────────────────────────────

export function LedgerPage() {
  const [activeTab, setActiveTab] = useState<'ledger' | 'reconciliation'>('ledger');
  const [search, setSearch] = useState('');
  const [dirFilter, setDirFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [cardFilter, setCardFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTxn, setSelectedTxn] = useState<BankingTransaction | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredTxns = useMemo(() => {
    return MOCK_TRANSACTIONS.filter(t => {
      if (dirFilter !== 'all' && t.direction !== dirFilter) return false;
      if (categoryFilter && t.category !== categoryFilter) return false;
      if (cardFilter && t.card_id !== cardFilter) return false;
      if (statusFilter && t.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!t.merchant_name?.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [search, dirFilter, categoryFilter, cardFilter, statusFilter]);

  const categories = [...new Set(MOCK_TRANSACTIONS.map(t => t.category).filter(Boolean))];
  const cards = [...new Set(MOCK_TRANSACTIONS.filter(t => t.card_id).map(t => ({ id: t.card_id!, name: t.card_name! })))];

  function exportCSV() {
    const header = 'Date,Description,Merchant,Amount,Direction,Status,Card,Vault,Category';
    const rows = filteredTxns.map(t =>
      [t.posted_at.slice(0, 10), `"${t.description}"`, t.merchant_name ?? '', (t.direction === 'debit' ? '-' : '') + (t.amount / 100).toFixed(2), t.direction, t.status, t.card_name ?? '', t.vault_name ?? '', t.category ?? ''].join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'ledger.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-4 p-1 rounded-[8px] inline-flex" style={{ background: '#F3F4F6' }}>
        {(['ledger', 'reconciliation'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className="px-4 py-1.5 rounded-[6px] font-semibold text-sm capitalize"
            style={{ background: activeTab === t ? '#fff' : 'transparent', color: activeTab === t ? '#1A1A1A' : '#6B7280', boxShadow: activeTab === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>
            {t === 'reconciliation' ? 'Reconciliation' : 'Ledger'}
          </button>
        ))}
      </div>

      {activeTab === 'reconciliation' && <ReconciliationQueue />}

      {activeTab === 'ledger' && (
        <>
          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="relative flex-1 min-w-[160px]">
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                type="text"
                placeholder="Search merchant or description…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full py-2 pl-8 pr-3 rounded-[6px] text-sm"
                style={{ border: '1px solid #E5E7EB', outline: 'none' }}
              />
            </div>
            <select value={dirFilter} onChange={e => setDirFilter(e.target.value as typeof dirFilter)} className="px-3 py-2 rounded-[6px] text-sm" style={{ border: '1px solid #E5E7EB' }}>
              <option value="all">All directions</option>
              <option value="credit">Money in</option>
              <option value="debit">Money out</option>
            </select>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-3 py-2 rounded-[6px] text-sm" style={{ border: '1px solid #E5E7EB' }}>
              <option value="">All categories</option>
              {categories.map(c => <option key={c} value={c!}>{c}</option>)}
            </select>
            <select value={cardFilter} onChange={e => setCardFilter(e.target.value)} className="px-3 py-2 rounded-[6px] text-sm" style={{ border: '1px solid #E5E7EB' }}>
              <option value="">All cards</option>
              {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-[6px] text-sm font-semibold ml-auto" style={{ background: '#F3F4F6', color: '#374151' }}>
              <Download size={14} /> Export CSV
            </button>
          </div>

          {/* Ledger table */}
          <div className="rounded-[10px] overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
            {/* Sticky header */}
            <div className="grid px-4 py-2.5 text-xs font-semibold" style={{ gridTemplateColumns: '120px 1fr 120px 90px 110px 44px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span>Date</span>
              <span>Description</span>
              <span>Category</span>
              <span>Status</span>
              <span style={{ textAlign: 'right' }}>Amount</span>
              <span />
            </div>

            <div className="divide-y" style={{ borderColor: '#F3F4F6' }}>
              {filteredTxns.length === 0 && (
                <div className="text-center py-10" style={{ color: '#9CA3AF' }}>No transactions match your filters.</div>
              )}
              {filteredTxns.map(txn => {
                const missingReceipt = txn.direction === 'debit' && !txn.receipt_url && (Date.now() - new Date(txn.posted_at).getTime()) > 48 * 60 * 60 * 1000;
                return (
                  <div
                    key={txn.id}
                    onClick={() => setSelectedTxn(txn)}
                    className="grid px-4 items-center cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{
                      gridTemplateColumns: '120px 1fr 120px 90px 110px 44px',
                      height: 56,
                      borderLeft: missingReceipt ? '3px solid #F39C12' : '3px solid transparent',
                      background: '#fff',
                    }}
                  >
                    <span style={{ color: '#6B7280', fontSize: '0.8125rem' }}>{new Date(txn.posted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.9375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {txn.merchant_name ?? txn.description}
                      </p>
                      {txn.card_name && <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>{txn.card_name}</p>}
                    </div>
                    <div>
                      {txn.category && (
                        <span className="px-2 py-0.5 rounded text-xs" style={{ background: '#F3F4F6', color: '#6B7280', whiteSpace: 'nowrap' }}>
                          {txn.category}
                        </span>
                      )}
                    </div>
                    <StatusPill status={txn.status} />
                    <div style={{ textAlign: 'right' }}>
                      <AmountCell txn={txn} />
                    </div>
                    <div className="flex items-center justify-end gap-1">
                      {txn.receipt_url && <Paperclip size={14} style={{ color: '#27AE60' }} />}
                      {missingReceipt && <Paperclip size={14} style={{ color: '#F39C12' }} />}
                      <ChevronRight size={14} style={{ color: '#D1D5DB' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination stub */}
            <div className="px-4 py-3 border-t flex items-center justify-between" style={{ borderColor: '#E5E7EB', background: '#F9FAFB' }}>
              <p style={{ fontSize: '0.8125rem', color: '#9CA3AF' }}>Showing {filteredTxns.length} of {MOCK_TRANSACTIONS.length} transactions</p>
              <p style={{ fontSize: '0.8125rem', color: '#9CA3AF' }}>Source of truth: partner account — synced {new Date(MOCK_ACCOUNT.synced_at).toLocaleTimeString()}</p>
            </div>
          </div>
        </>
      )}

      {selectedTxn && <RowDrawer txn={selectedTxn} onClose={() => setSelectedTxn(null)} />}
    </div>
  );
}

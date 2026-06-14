import { useState } from 'react';
import {
  Plus, Trash2, Send, Download, CheckCircle2, ChevronRight,
  Edit2, Clock, Lock, ExternalLink, DollarSign,
} from 'lucide-react';
import { INVOICES } from './mockData';
import type { Invoice, InvoiceLine, InvoiceStatus } from './types';

function fmtMoney(n: number) { return `$${n.toFixed(2)}`; }
function fmtDate(iso: string) { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }

const STATUS_STYLE: Record<InvoiceStatus, { bg: string; color: string; label: string; icon: React.ReactNode }> = {
  estimate: { bg: '#EFF6FF', color: '#1D4ED8', label: 'Estimate', icon: <Edit2 size={11} /> },
  invoice:  { bg: '#FFF7ED', color: '#B45309', label: 'Invoice', icon: <Clock size={11} /> },
  order:    { bg: '#F0FDF4', color: '#15803D', label: 'Order', icon: <CheckCircle2 size={11} /> },
  refunded: { bg: '#FDEDEC', color: '#C0392B', label: 'Refunded', icon: <DollarSign size={11} /> },
  void:     { bg: '#F9FAFB', color: '#9CA3AF', label: 'Void', icon: <Lock size={11} /> },
};

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: s.bg, color: s.color }}>
      {s.icon} {s.label}
    </span>
  );
}

// ─── Line Item Row ────────────────────────────────────────────────────────────
function LineRow({ line, editable, onUpdate, onDelete }: {
  line: InvoiceLine;
  editable: boolean;
  onUpdate: (l: InvoiceLine) => void;
  onDelete: (id: string) => void;
}) {
  const total = line.qty * line.unitPrice;
  const CAT_COLORS: Record<InvoiceLine['category'], string> = {
    labor: '#3B82F6', parts: '#8B5CF6', addon: '#10B981', discount: '#F59E0B', tip: '#EC4899',
  };

  return (
    <div className="grid gap-2 py-2.5 items-center" style={{ gridTemplateColumns: '1fr 60px 90px 80px 24px', borderBottom: '1px solid #F3F4F6' }}>
      <div className="flex items-center gap-2 min-w-0">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: CAT_COLORS[line.category] }} />
        {editable ? (
          <input value={line.description} onChange={e => onUpdate({ ...line, description: e.target.value })} className="flex-1 px-2 py-0.5 rounded text-sm min-w-0" style={{ border: '1px solid #E5E7EB', outline: 'none', color: '#1A1A1A' }} />
        ) : (
          <span style={{ color: '#1A1A1A', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{line.description}</span>
        )}
      </div>
      {editable ? (
        <input type="number" min="1" value={line.qty} onChange={e => onUpdate({ ...line, qty: +e.target.value })} className="px-2 py-0.5 rounded text-sm text-center" style={{ border: '1px solid #E5E7EB', outline: 'none', color: '#1A1A1A' }} />
      ) : (
        <span style={{ color: '#6B7280', fontSize: '0.875rem', textAlign: 'center' }}>×{line.qty}</span>
      )}
      {editable ? (
        <input type="number" step="0.01" value={line.unitPrice} onChange={e => onUpdate({ ...line, unitPrice: +e.target.value })} className="px-2 py-0.5 rounded text-sm text-right" style={{ border: '1px solid #E5E7EB', outline: 'none', color: '#1A1A1A' }} />
      ) : (
        <span style={{ color: '#6B7280', fontSize: '0.875rem', textAlign: 'right' }}>{fmtMoney(line.unitPrice)}</span>
      )}
      <span style={{ color: '#1A1A1A', fontWeight: 600, fontSize: '0.875rem', textAlign: 'right' }}>{fmtMoney(total)}</span>
      {editable ? (
        <button onClick={() => onDelete(line.id)} style={{ color: '#EF4444' }}><Trash2 size={13} /></button>
      ) : <span />}
    </div>
  );
}

// ─── Invoice Detail ───────────────────────────────────────────────────────────
function InvoiceDetail({ invoice, onBack, onStatusChange }: {
  invoice: Invoice;
  onBack: () => void;
  onStatusChange: (id: string, status: InvoiceStatus, lines?: InvoiceLine[]) => void;
}) {
  const editable = invoice.status === 'estimate' || invoice.status === 'invoice';
  const [lines, setLines] = useState<InvoiceLine[]>(invoice.lines);
  const [newLine, setNewLine] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newQty, setNewQty] = useState(1);
  const [newPrice, setNewPrice] = useState(0);
  const [tip, setTip] = useState(invoice.tipAmount);
  const [showSent, setShowSent] = useState(false);

  const subtotal = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
  const taxAmount = subtotal * invoice.taxRate;
  const total = subtotal + taxAmount + tip;

  const addLine = () => {
    if (!newDesc) return;
    const line: InvoiceLine = { id: `l-${Date.now()}`, description: newDesc, qty: newQty, unitPrice: newPrice, category: 'labor', taxable: true };
    setLines(ls => [...ls, line]);
    setNewDesc(''); setNewQty(1); setNewPrice(0); setNewLine(false);
  };

  const nextStatus: Partial<Record<InvoiceStatus, InvoiceStatus>> = {
    estimate: 'invoice', invoice: 'order',
  };
  const nextLabel: Partial<Record<InvoiceStatus, string>> = {
    estimate: 'Convert to Invoice', invoice: 'Mark as Paid → Order',
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 mb-4" style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
        ← Back to list
      </button>

      <div className="bg-white rounded-[10px] p-6" style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={invoice.status} />
              <span style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>#{invoice.id.toUpperCase()}</span>
            </div>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.125rem' }}>{invoice.customerName}</h3>
            <p style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>{invoice.customerEmail}</p>
          </div>
          <div className="text-right">
            <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#C0392B', fontSize: '1.5rem' }}>{fmtMoney(total)}</p>
            <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>Created {fmtDate(invoice.createdAt)}</p>
            {invoice.status === 'order' && invoice.paidAt && (
              <p style={{ color: '#27AE60', fontSize: '0.75rem', fontWeight: 600 }}>Paid {fmtDate(invoice.paidAt)}</p>
            )}
          </div>
        </div>

        {/* Locked notice */}
        {invoice.status === 'order' && (
          <div className="p-3 rounded-[6px] mb-4 flex items-center gap-2" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <Lock size={14} style={{ color: '#15803D' }} />
            <p style={{ color: '#15803D', fontSize: '0.8125rem', fontWeight: 600 }}>Immutable — payment received. Changes require refund/exchange workflow.</p>
          </div>
        )}

        {/* Shareable link */}
        {invoice.publicToken && (
          <div className="flex items-center gap-2 p-3 rounded-[6px] mb-4" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
            <ExternalLink size={13} style={{ color: '#9CA3AF' }} />
            <span style={{ color: '#6B7280', fontSize: '0.8125rem', flex: 1 }}>
              Public link: <span style={{ color: '#1D4ED8' }}>tdforge.app/pay/{invoice.publicToken}</span>
            </span>
            <button
              onClick={() => { setShowSent(true); setTimeout(() => setShowSent(false), 2000); }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-xs font-semibold"
              style={{ background: showSent ? '#27AE60' : '#C0392B', color: '#fff' }}
            >
              {showSent ? <><CheckCircle2 size={11} /> Sent!</> : <><Send size={11} /> Send</>}
            </button>
          </div>
        )}

        {/* Line items */}
        <div className="mb-2">
          <div className="grid gap-2 pb-1 mb-1" style={{ gridTemplateColumns: '1fr 60px 90px 80px 24px', borderBottom: '1.5px solid #E5E7EB' }}>
            {['Description', 'Qty', 'Unit Price', 'Total', ''].map(h => (
              <span key={h} style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: h === 'Total' ? 'right' : 'left' }}>{h}</span>
            ))}
          </div>
          {lines.map(line => (
            <LineRow
              key={line.id}
              line={line}
              editable={editable}
              onUpdate={l => setLines(ls => ls.map(x => x.id === l.id ? l : x))}
              onDelete={id => setLines(ls => ls.filter(x => x.id !== id))}
            />
          ))}

          {/* New line form */}
          {newLine && editable && (
            <div className="grid gap-2 py-2 items-center" style={{ gridTemplateColumns: '1fr 60px 90px 80px 24px' }}>
              <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description…" className="px-2 py-1 rounded text-sm" style={{ border: '1.5px solid #C0392B', outline: 'none' }} />
              <input type="number" min="1" value={newQty} onChange={e => setNewQty(+e.target.value)} className="px-2 py-1 rounded text-sm text-center" style={{ border: '1px solid #E5E7EB', outline: 'none' }} />
              <input type="number" step="0.01" value={newPrice} onChange={e => setNewPrice(+e.target.value)} placeholder="0.00" className="px-2 py-1 rounded text-sm text-right" style={{ border: '1px solid #E5E7EB', outline: 'none' }} />
              <span />
              <button onClick={addLine} style={{ color: '#27AE60' }}><CheckCircle2 size={13} /></button>
            </div>
          )}

          {editable && !newLine && (
            <button onClick={() => setNewLine(true)} className="flex items-center gap-1.5 mt-2 text-sm" style={{ color: '#C0392B' }}>
              <Plus size={14} /> Add Line Item
            </button>
          )}
        </div>

        {/* Totals */}
        <div className="mt-4 p-4 rounded-[8px]" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
          {[
            { label: 'Subtotal', value: subtotal },
            { label: `Tax (${(invoice.taxRate * 100).toFixed(0)}%)`, value: taxAmount },
          ].map(r => (
            <div key={r.label} className="flex justify-between mb-1.5">
              <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>{r.label}</span>
              <span style={{ color: '#1A1A1A', fontSize: '0.875rem' }}>{fmtMoney(r.value)}</span>
            </div>
          ))}

          {/* Tip capture */}
          {invoice.status === 'invoice' && (
            <div className="flex justify-between mb-1.5">
              <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>Tip</span>
              <input
                type="number" step="0.01" min="0" value={tip}
                onChange={e => setTip(+e.target.value)}
                className="w-20 text-right px-2 py-0.5 rounded text-sm"
                style={{ border: '1px solid #E5E7EB', outline: 'none', color: '#1A1A1A' }}
              />
            </div>
          )}
          {invoice.status === 'order' && invoice.tipAmount > 0 && (
            <div className="flex justify-between mb-1.5">
              <span style={{ color: '#EC4899', fontSize: '0.875rem' }}>Tip ♥</span>
              <span style={{ color: '#EC4899', fontSize: '0.875rem', fontWeight: 600 }}>{fmtMoney(invoice.tipAmount)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 mt-1" style={{ borderTop: '1px solid #E5E7EB' }}>
            <span style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '1rem' }}>Total</span>
            <span style={{ fontWeight: 700, color: '#C0392B', fontSize: '1.125rem' }}>{fmtMoney(total)}</span>
          </div>
          {invoice.status === 'order' && (
            <div className="flex justify-between mt-1">
              <span style={{ color: '#27AE60', fontSize: '0.875rem', fontWeight: 600 }}>Paid</span>
              <span style={{ color: '#27AE60', fontSize: '0.875rem', fontWeight: 600 }}>{fmtMoney(invoice.paidAmount)}</span>
            </div>
          )}
        </div>

        {/* Edit history */}
        {invoice.editHistory.length > 0 && (
          <div className="mt-4">
            <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '6px' }}>Edit History</p>
            {invoice.editHistory.map((e, i) => (
              <p key={i} style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
                {e.at} · {e.by} changed {e.field}: {e.from} → {e.to}
              </p>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-5">
          <button
            className="flex items-center gap-1.5 px-3 py-2 rounded-[6px] text-sm"
            style={{ border: '1.5px solid #E5E7EB', color: '#6B7280' }}
          >
            <Download size={14} /> PDF
          </button>
          {nextStatus[invoice.status] && (
            <button
              onClick={() => onStatusChange(invoice.id, nextStatus[invoice.status]!, lines)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[6px] text-white font-semibold text-sm"
              style={{ background: '#C0392B' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#A93226')}
              onMouseLeave={e => (e.currentTarget.style.background = '#C0392B')}
            >
              {nextLabel[invoice.status]} <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main EstimateInvoice ─────────────────────────────────────────────────────
export function EstimateInvoice() {
  const [invoices, setInvoices] = useState<Invoice[]>(INVOICES);
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | 'all'>('all');

  const filtered = filterStatus === 'all' ? invoices : invoices.filter(i => i.status === filterStatus);

  const handleStatusChange = (id: string, status: InvoiceStatus, lines?: InvoiceLine[]) => {
    setInvoices(is => is.map(i => i.id === id ? { ...i, status, ...(lines ? { lines } : {}), ...(status === 'order' ? { paidAt: new Date().toISOString(), paidAmount: i.total, balance: 0 } : {}) } : i));
    setSelected(s => s?.id === id ? { ...s, status, ...(status === 'order' ? { paidAt: new Date().toISOString(), paidAmount: s.total, balance: 0 } : {}) } : s);
  };

  if (selected) {
    return (
      <InvoiceDetail
        invoice={invoices.find(i => i.id === selected.id) ?? selected}
        onBack={() => setSelected(null)}
        onStatusChange={handleStatusChange}
      />
    );
  }

  const stats = {
    estimates: invoices.filter(i => i.status === 'estimate').length,
    open: invoices.filter(i => i.status === 'invoice').reduce((s, i) => s + i.balance, 0),
    orders: invoices.filter(i => i.status === 'order').length,
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Open Estimates', value: stats.estimates.toString(), color: '#1D4ED8', bg: '#EFF6FF' },
          { label: 'Outstanding Balance', value: fmtMoney(stats.open), color: '#B45309', bg: '#FFF7ED' },
          { label: 'Orders (Paid)', value: stats.orders.toString(), color: '#15803D', bg: '#F0FDF4' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-[8px] p-4" style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
            <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: s.color, fontSize: '1.5rem', marginTop: '4px' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter + new */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          {(['all', 'estimate', 'invoice', 'order', 'refunded'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className="px-3 py-1.5 rounded-[6px] text-sm font-medium"
              style={{ background: filterStatus === s ? '#C0392B' : '#F3F4F6', color: filterStatus === s ? '#fff' : '#6B7280' }}
            >
              {s === 'all' ? 'All' : STATUS_STYLE[s].label}
            </button>
          ))}
        </div>
        <button
          className="flex items-center gap-1.5 px-4 py-2 rounded-[6px] text-white text-sm font-semibold"
          style={{ background: '#C0392B' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#A93226')}
          onMouseLeave={e => (e.currentTarget.style.background = '#C0392B')}
        >
          <Plus size={14} /> New Estimate
        </button>
      </div>

      {/* Invoice list */}
      <div className="space-y-2">
        {filtered.map(inv => (
          <button
            key={inv.id}
            onClick={() => setSelected(inv)}
            className="w-full text-left bg-white rounded-[8px] p-4 flex items-center gap-4 transition-all"
            style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)')}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status={inv.status} />
                <span style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>#{inv.id.toUpperCase()}</span>
              </div>
              <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.9375rem' }}>{inv.customerName}</p>
              <p style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>{fmtDate(inv.createdAt)} · {inv.lines.length} line{inv.lines.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="text-right shrink-0">
              <p style={{ fontWeight: 700, color: '#C0392B', fontSize: '1rem' }}>{fmtMoney(inv.total)}</p>
              {inv.balance > 0 && (
                <p style={{ color: '#F59E0B', fontSize: '0.75rem', fontWeight: 600 }}>Balance: {fmtMoney(inv.balance)}</p>
              )}
              {inv.status === 'order' && (
                <p style={{ color: '#27AE60', fontSize: '0.75rem', fontWeight: 600 }}>✓ Paid</p>
              )}
            </div>
            <ChevronRight size={16} style={{ color: '#D1D5DB', flexShrink: 0 }} />
          </button>
        ))}
      </div>
    </div>
  );
}

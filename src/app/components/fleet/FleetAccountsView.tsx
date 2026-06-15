import { useState } from 'react';
import { Search, Plus, Building2, ChevronRight, AlertTriangle, CheckCircle2, X, Loader2 } from 'lucide-react';
import type { FleetAccount, FleetAccountStatus, PaymentTerms } from './types';
import { MOCK_FLEET_ACCOUNTS } from './mockData';

const STATUS_BADGE: Record<FleetAccountStatus, { label: string; bg: string; color: string }> = {
  active:    { label: 'Active',    bg: '#F0FDF4', color: '#15803D' },
  suspended: { label: 'Suspended', bg: '#FFF1F2', color: '#BE123C' },
  pending:   { label: 'Pending',   bg: '#FFF7ED', color: '#C2410C' },
};

const TERMS_LABEL: Record<PaymentTerms, string> = {
  net_15: 'Net 15', net_30: 'Net 30', net_45: 'Net 45', net_60: 'Net 60', immediate: 'Immediate',
};

function cents(c: number) { return `$${(c / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }

function AgingIndicator({ aging }: { aging: FleetAccount['aging'] }) {
  const overdue = (aging['61_90'] || 0) + (aging['90_plus'] || 0);
  const lateish = aging['31_60'] || 0;
  if (overdue > 0) return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: '#FFF1F2', color: '#BE123C' }}>⚠ Overdue</span>;
  if (lateish > 0) return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: '#FFF7ED', color: '#C2410C' }}>Late</span>;
  return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: '#F0FDF4', color: '#15803D' }}>Current</span>;
}

interface Props {
  onSelect: (account: FleetAccount) => void;
}

const TERM_OPTIONS: PaymentTerms[] = ['net_15', 'net_30', 'net_45', 'net_60', 'immediate'];

export function FleetAccountsView({ onSelect }: Props) {
  const [accounts, setAccounts] = useState<FleetAccount[]>(MOCK_FLEET_ACCOUNTS);
  const [query, setQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  // Create form state
  const [bizName, setBizName] = useState('');
  const [ein, setEin] = useState('');
  const [bcName, setBcName] = useState('');
  const [bcEmail, setBcEmail] = useState('');
  const [bcPhone, setBcPhone] = useState('');
  const [apName, setApName] = useState('');
  const [apEmail, setApEmail] = useState('');
  const [terms, setTerms] = useState<PaymentTerms>('net_30');
  const [creditLimit, setCreditLimit] = useState('');
  const [creating, setCreating] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  function showToast(msg: string) { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); }

  const filtered = accounts.filter(a => {
    const q = query.toLowerCase();
    return !q || a.businessName.toLowerCase().includes(q) || a.billingContact.email.toLowerCase().includes(q);
  });

  function handleCreate() {
    if (!bizName || !bcName || !bcEmail || !apEmail || !creditLimit) return;
    setCreating(true);
    setTimeout(() => {
      const newAccount: FleetAccount = {
        id: `fleet_${Date.now()}`, shopId: 'shop_001',
        businessName: bizName, ein, status: 'active',
        billingContact: { name: bcName, email: bcEmail, phone: bcPhone },
        apContact: { name: apName || bcName, email: apEmail, phone: bcPhone },
        billingAddress: { line1: '', city: '', state: '', zip: '' },
        shippingAddress: { line1: '', city: '', state: '', zip: '' },
        paymentTerms: terms,
        creditLimitCents: Math.round(parseFloat(creditLimit) * 100),
        outstandingBalanceCents: 0,
        approvalThresholdCents: null, approvalRouting: 'any_one', approverEmails: [bcEmail],
        createdAt: new Date().toISOString(), lastActivityAt: new Date().toISOString(),
        aging: { current: 0, '1_30': 0, '31_60': 0, '61_90': 0, '90_plus': 0 },
        authorizedBuyers: [], vehicles: [],
      };
      setAccounts(a => [...a, newAccount]);
      setCreating(false);
      setShowCreate(false);
      setBizName(''); setEin(''); setBcName(''); setBcEmail(''); setBcPhone('');
      setApName(''); setApEmail(''); setCreditLimit('');
      showToast(`Fleet account "${newAccount.businessName}" created.`);
    }, 900);
  }

  const canCreate = bizName && bcName && bcEmail && apEmail && creditLimit;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.125rem', color: '#1A1A1A' }}>Fleet Accounts</h2>
          <p style={{ fontSize: '0.825rem', color: '#6B7280', marginTop: 2 }}>{accounts.length} B2B accounts</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-[8px] text-sm font-semibold"
          style={{ background: '#C0392B', color: '#fff' }}>
          <Plus size={14} /> New Fleet Account
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by company or contact email…"
          className="w-full pl-9 pr-4 py-2.5 rounded-[8px] text-sm outline-none"
          style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', color: '#1A1A1A' }}
          onFocus={e => (e.target.style.borderColor = '#C0392B')}
          onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
      </div>

      {/* Table */}
      <div className="rounded-[12px] overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              {['Company', 'Terms', 'Credit Limit', 'Outstanding', 'Vehicles', 'Aging', 'Status', ''].map(h => (
                <th key={h} className="text-left px-4 py-3"
                  style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((a, i) => {
              const sb = STATUS_BADGE[a.status];
              return (
                <tr key={a.id} onClick={() => onSelect(a)} className="cursor-pointer"
                  style={{ borderBottom: '1px solid #F3F4F6', background: '#fff' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: '#FDEDEC', color: '#C0392B' }}>
                        <Building2 size={15} />
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>{a.businessName}</p>
                        <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{a.billingContact.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{ fontSize: '0.825rem', color: '#374151' }}>{TERMS_LABEL[a.paymentTerms]}</td>
                  <td className="px-4 py-3" style={{ fontSize: '0.875rem', color: '#374151', fontVariantNumeric: 'tabular-nums' }}>
                    {cents(a.creditLimitCents)}
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: a.outstandingBalanceCents > a.creditLimitCents * 0.8 ? '#BE123C' : '#374151', fontVariantNumeric: 'tabular-nums' }}>
                      {cents(a.outstandingBalanceCents)}
                    </span>
                    <div className="mt-0.5 h-1 rounded-full overflow-hidden" style={{ background: '#F3F4F6', width: 64 }}>
                      <div className="h-full rounded-full" style={{
                        width: `${Math.min(100, (a.outstandingBalanceCents / a.creditLimitCents) * 100)}%`,
                        background: a.outstandingBalanceCents > a.creditLimitCents * 0.8 ? '#EF4444' : '#C0392B',
                      }} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center" style={{ fontSize: '0.875rem', color: '#374151' }}>{a.vehicles.length}</td>
                  <td className="px-4 py-3"><AgingIndicator aging={a.aging} /></td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: sb.bg, color: sb.color }}>
                      {sb.label}
                    </span>
                  </td>
                  <td className="px-4 py-3"><ChevronRight size={15} style={{ color: '#D1D5DB' }} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-2xl rounded-2xl p-6 mx-4 max-h-[90vh] overflow-y-auto" style={{ background: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.125rem', color: '#1A1A1A' }}>New Fleet Account</h3>
              <button onClick={() => setShowCreate(false)} style={{ color: '#9CA3AF' }}><X size={20} /></button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Business Name *</label>
                <input value={bizName} onChange={e => setBizName(e.target.value)} placeholder="Acme Delivery Co."
                  className="w-full mt-1 px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ border: '1px solid #E5E7EB', color: '#1A1A1A', background: '#F9FAFB' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>EIN</label>
                <input value={ein} onChange={e => setEin(e.target.value)} placeholder="12-3456789"
                  className="w-full mt-1 px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ border: '1px solid #E5E7EB', color: '#1A1A1A', background: '#F9FAFB' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment Terms *</label>
                <select value={terms} onChange={e => setTerms(e.target.value as PaymentTerms)}
                  className="w-full mt-1 px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ border: '1px solid #E5E7EB', color: '#374151', background: '#F9FAFB' }}>
                  {TERM_OPTIONS.map(t => <option key={t} value={t}>{TERMS_LABEL[t]}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Credit Limit ($) *</label>
                <input type="number" value={creditLimit} onChange={e => setCreditLimit(e.target.value)} placeholder="25000"
                  className="w-full mt-1 px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ border: '1px solid #E5E7EB', color: '#1A1A1A', background: '#F9FAFB' }} />
              </div>

              <div className="col-span-2 pt-2 border-t" style={{ borderColor: '#F3F4F6' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: 10 }}>Billing Contact</p>
                <div className="grid grid-cols-3 gap-3">
                  <input value={bcName} onChange={e => setBcName(e.target.value)} placeholder="Full Name *"
                    className="px-3 py-2.5 rounded-lg text-sm outline-none" style={{ border: '1px solid #E5E7EB', color: '#1A1A1A', background: '#F9FAFB' }} />
                  <input value={bcEmail} onChange={e => setBcEmail(e.target.value)} placeholder="Email *"
                    className="px-3 py-2.5 rounded-lg text-sm outline-none" style={{ border: '1px solid #E5E7EB', color: '#1A1A1A', background: '#F9FAFB' }} />
                  <input value={bcPhone} onChange={e => setBcPhone(e.target.value)} placeholder="Phone"
                    className="px-3 py-2.5 rounded-lg text-sm outline-none" style={{ border: '1px solid #E5E7EB', color: '#1A1A1A', background: '#F9FAFB' }} />
                </div>
              </div>

              <div className="col-span-2 pt-2 border-t" style={{ borderColor: '#F3F4F6' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: 10 }}>AP Contact</p>
                <div className="grid grid-cols-2 gap-3">
                  <input value={apName} onChange={e => setApName(e.target.value)} placeholder="AP Contact Name"
                    className="px-3 py-2.5 rounded-lg text-sm outline-none" style={{ border: '1px solid #E5E7EB', color: '#1A1A1A', background: '#F9FAFB' }} />
                  <input value={apEmail} onChange={e => setApEmail(e.target.value)} placeholder="AP Email *"
                    className="px-3 py-2.5 rounded-lg text-sm outline-none" style={{ border: '1px solid #E5E7EB', color: '#1A1A1A', background: '#F9FAFB' }} />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreate(false)}
                className="flex-1 py-2.5 rounded-lg text-sm" style={{ background: '#F9FAFB', color: '#6B7280', border: '1px solid #E5E7EB' }}>Cancel</button>
              <button onClick={handleCreate} disabled={!canCreate || creating}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                style={{ background: '#C0392B', color: '#fff', opacity: canCreate && !creating ? 1 : 0.4 }}>
                {creating ? <Loader2 size={14} className="animate-spin" /> : null}
                {creating ? 'Creating…' : 'Create Fleet Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-6 right-6 px-4 py-3 rounded-xl text-sm font-medium z-50 flex items-center gap-2"
          style={{ background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
          <CheckCircle2 size={14} /> {toastMsg}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Download, FileText, AlertTriangle, CheckCircle2, Clock, X, Upload, ChevronDown, Loader2 } from 'lucide-react';
import { formatCents, newIdempotencyKey } from '../../../lib/banking/types';
import type { BankingDispute, DisputeStatus } from '../../../lib/banking/types';
import { MOCK_STATEMENTS, MOCK_DISPUTES, MOCK_TRANSACTIONS } from './mockData';
import { getBankingProvider } from '../../../lib/banking/mockProvider';

// ─── Dispute status config ────────────────────────────────────────────────────

const DISPUTE_STATUS: Record<DisputeStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  open:               { label: 'Open',               color: '#2980B9', bg: '#EBF5FB', icon: Clock },
  in_review:          { label: 'In review',          color: '#F39C12', bg: '#FFF8E1', icon: Clock },
  provisional_credit: { label: 'Provisional credit', color: '#27AE60', bg: '#F0FDF4', icon: CheckCircle2 },
  resolved_won:       { label: 'Resolved — Won',     color: '#27AE60', bg: '#F0FDF4', icon: CheckCircle2 },
  resolved_lost:      { label: 'Resolved — Lost',    color: '#00BFC3', bg: '#F0FBFB', icon: AlertTriangle },
  cancelled:          { label: 'Cancelled',           color: '#9CA3AF', bg: '#F3F4F6', icon: X },
};

const REASON_CODES = [
  { value: 'unauthorized',       label: 'Unauthorized charge' },
  { value: 'not_as_described',   label: 'Item/service not as described' },
  { value: 'not_received',       label: 'Item/service not received' },
  { value: 'duplicate',          label: 'Duplicate charge' },
  { value: 'cancelled',          label: 'Cancelled transaction' },
  { value: 'credit_not_issued',  label: 'Credit not issued' },
  { value: 'other',              label: 'Other' },
];

// ─── Statements ───────────────────────────────────────────────────────────────

function StatementsTab() {
  const [downloading, setDownloading] = useState<string | null>(null);

  async function handleDownload(stmtId: string) {
    setDownloading(stmtId);
    const provider = getBankingProvider();
    const { pdf_url } = await provider.getStatement(stmtId);
    // In mock mode, just open a placeholder
    window.open(pdf_url, '_blank');
    setDownloading(null);
  }

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-[8px] flex items-center gap-2" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
        <FileText size={15} style={{ color: '#6B7280' }} />
        <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
          Statements are retained for 7 years. Year-end summaries and 1099-INT forms are generated in January.
        </p>
      </div>

      <div className="rounded-[10px] overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: '#E5E7EB', background: '#F9FAFB' }}>
          <div className="grid" style={{ gridTemplateColumns: '1fr 160px 100px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Period</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Generated</span>
            <span />
          </div>
        </div>
        <div className="divide-y" style={{ borderColor: '#F3F4F6' }}>
          {MOCK_STATEMENTS.map(stmt => {
            const start = new Date(stmt.period_start).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            return (
              <div key={stmt.id} className="px-5 py-4 grid items-center" style={{ gridTemplateColumns: '1fr 160px 100px', background: '#fff' }}>
                <div className="flex items-center gap-2">
                  <FileText size={16} style={{ color: '#6B7280', flexShrink: 0 }} />
                  <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.9375rem' }}>{start} Statement</p>
                </div>
                <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>{new Date(stmt.generated_at).toLocaleDateString()}</p>
                <button
                  onClick={() => handleDownload(stmt.id)}
                  disabled={downloading === stmt.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-sm font-semibold"
                  style={{ background: '#F3F4F6', color: '#374151' }}
                >
                  {downloading === stmt.id ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={13} />}
                  PDF
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── New dispute form ─────────────────────────────────────────────────────────

function NewDisputeForm({ onSubmit }: { onSubmit: (d: BankingDispute) => void }) {
  const [txnId, setTxnId] = useState('');
  const [reasonCode, setReasonCode] = useState('');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const chargeableTxns = MOCK_TRANSACTIONS.filter(t => t.direction === 'debit' && t.status === 'posted');

  async function submit() {
    if (!txnId || !reasonCode || !description) return;
    setSubmitting(true);
    try {
      const provider = getBankingProvider();
      const result = await provider.createDispute({ transaction_id: txnId, reason_code: reasonCode, description, idempotency_key: newIdempotencyKey() });
      const txn = chargeableTxns.find(t => t.id === txnId)!;
      const newDispute: BankingDispute = {
        id: result.dispute_id, shop_id: 'shop1', transaction_id: txnId,
        merchant_name: txn?.merchant_name ?? txn.description,
        amount: txn?.amount ?? 0,
        reason_code: reasonCode, description,
        evidence_json: evidence.map((f, i) => ({ id: `ev_${i}`, type: 'upload', url: URL.createObjectURL(f), uploaded_at: new Date().toISOString() })),
        status: result.status, partner_dispute_id: null, provisional_credit_amount: 0,
        filed_at: new Date().toISOString(),
      };
      onSubmit(newDispute);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4" style={{ maxWidth: 560 }}>
      <div>
        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Transaction to dispute</label>
        <select value={txnId} onChange={e => setTxnId(e.target.value)} className="w-full px-3 py-2 rounded-[6px]" style={{ border: '1px solid #E5E7EB', outline: 'none' }}>
          <option value="">— Select transaction —</option>
          {chargeableTxns.map(t => (
            <option key={t.id} value={t.id}>
              {new Date(t.posted_at).toLocaleDateString()} · {t.merchant_name ?? t.description} · {formatCents(t.amount)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Reason</label>
        <select value={reasonCode} onChange={e => setReasonCode(e.target.value)} className="w-full px-3 py-2 rounded-[6px]" style={{ border: '1px solid #E5E7EB', outline: 'none' }}>
          <option value="">— Select reason —</option>
          {REASON_CODES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>
      <div>
        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Describe the issue in detail…"
          className="w-full px-3 py-2 rounded-[6px]" style={{ border: '1px solid #E5E7EB', outline: 'none', resize: 'vertical' }} />
      </div>
      <div>
        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Supporting evidence (optional)</label>
        <label className="flex items-center gap-2 px-4 py-3 rounded-[8px] cursor-pointer" style={{ border: '1.5px dashed #D1D5DB', background: '#F9FAFB' }}>
          <Upload size={16} style={{ color: '#6B7280' }} />
          <span style={{ color: '#6B7280', fontSize: '0.9375rem' }}>
            {evidence.length > 0 ? `${evidence.length} file${evidence.length !== 1 ? 's' : ''} selected` : 'Upload receipts, communications, etc.'}
          </span>
          <input type="file" multiple className="hidden" onChange={e => setEvidence(Array.from(e.target.files ?? []))} />
        </label>
      </div>
      <button
        onClick={submit}
        disabled={!txnId || !reasonCode || !description || submitting}
        className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] font-semibold"
        style={{ background: txnId && reasonCode && description && !submitting ? '#00A9AC' : '#E5E7EB', color: txnId && reasonCode && description && !submitting ? '#fff' : '#9CA3AF' }}
      >
        {submitting ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Filing…</> : 'File dispute'}
      </button>
    </div>
  );
}

// ─── Disputes list ────────────────────────────────────────────────────────────

function DisputesList({ disputes }: { disputes: BankingDispute[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (disputes.length === 0) {
    return <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '24px 0' }}>No disputes filed.</p>;
  }

  return (
    <div className="space-y-3">
      {disputes.map(d => {
        const cfg = DISPUTE_STATUS[d.status];
        const Icon = cfg.icon;
        const isExp = expanded === d.id;
        return (
          <div key={d.id} className="rounded-[10px] overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
            <button className="w-full flex items-center justify-between px-5 py-4" style={{ background: '#fff' }} onClick={() => setExpanded(isExp ? null : d.id)}>
              <div className="flex items-center gap-3">
                <Icon size={16} style={{ color: cfg.color }} />
                <div className="text-left">
                  <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.9375rem' }}>{d.merchant_name}</p>
                  <p style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>Filed {new Date(d.filed_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ fontFeatureSettings: '"tnum"', fontWeight: 700, color: '#00A9AC', fontSize: '0.9375rem' }}>{formatCents(d.amount)}</span>
                <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                <ChevronDown size={16} style={{ color: '#9CA3AF', transform: isExp ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </div>
            </button>

            {isExp && (
              <div className="px-5 pb-5 space-y-4" style={{ borderTop: '1px solid #F3F4F6' }}>
                {/* Status timeline */}
                <div className="pt-4">
                  <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.875rem', marginBottom: 12 }}>Dispute timeline</p>
                  {[
                    { label: 'Dispute filed',           done: true },
                    { label: 'Partner notified',        done: ['in_review','provisional_credit','resolved_won','resolved_lost'].includes(d.status) },
                    { label: 'Provisional credit issued', done: ['provisional_credit','resolved_won'].includes(d.status) },
                    { label: 'Final resolution',        done: ['resolved_won','resolved_lost'].includes(d.status) },
                  ].map((step, i, arr) => (
                    <div key={step.label} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: step.done ? '#27AE60' : '#F3F4F6', border: step.done ? 'none' : '1.5px solid #E5E7EB' }}>
                          {step.done ? <CheckCircle2 size={12} color="#fff" /> : null}
                        </div>
                        {i < arr.length - 1 && <div style={{ width: 2, height: 20, background: step.done ? '#27AE60' : '#E5E7EB', margin: '2px 0' }} />}
                      </div>
                      <p style={{ paddingTop: 2, color: step.done ? '#1A1A1A' : '#9CA3AF', fontSize: '0.875rem', fontWeight: step.done ? 600 : 400 }}>{step.label}</p>
                    </div>
                  ))}
                </div>

                {d.provisional_credit_amount > 0 && (
                  <div className="p-3 rounded-[8px] flex items-center gap-2" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                    <CheckCircle2 size={15} style={{ color: '#27AE60' }} />
                    <p style={{ color: '#15803D', fontSize: '0.875rem', fontWeight: 600 }}>
                      Provisional credit of {formatCents(d.provisional_credit_amount)} applied to your account.
                    </p>
                  </div>
                )}

                <div>
                  <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.875rem', marginBottom: 4 }}>Reason</p>
                  <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>{REASON_CODES.find(r => r.value === d.reason_code)?.label}</p>
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.875rem', marginBottom: 4 }}>Description</p>
                  <p style={{ color: '#6B7280', fontSize: '0.875rem', lineHeight: 1.5 }}>{d.description}</p>
                </div>
                {d.evidence_json.length > 0 && (
                  <div>
                    <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.875rem', marginBottom: 6 }}>Evidence</p>
                    <div className="flex gap-2 flex-wrap">
                      {d.evidence_json.map(ev => (
                        <a key={ev.id} href={ev.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-sm" style={{ background: '#F3F4F6', color: '#374151' }}>
                          <Upload size={13} /> {ev.type}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Account closure ──────────────────────────────────────────────────────────

function AccountClosure() {
  const [step, setStep] = useState<'confirm' | 'done'>('confirm');
  const [sweepDest, setSweepDest] = useState('');
  const [typed, setTyped] = useState('');
  const CONFIRM_PHRASE = 'close my account';

  if (step === 'done') {
    return (
      <div className="text-center py-10">
        <CheckCircle2 size={36} style={{ color: '#27AE60', margin: '0 auto 12px' }} />
        <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '1.125rem' }}>Closure request submitted</p>
        <p style={{ color: '#6B7280', fontSize: '0.9375rem', marginTop: 6 }}>Remaining balance will be swept within 1–3 business days. Statements remain available for 30 days.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <div className="p-4 rounded-[8px] mb-4" style={{ background: '#F0FBFB', border: '1px solid #80D4D5' }}>
        <p style={{ color: '#005F62', fontWeight: 700, fontSize: '0.9375rem', marginBottom: 4 }}>Close business bank account</p>
        <p style={{ color: '#7F1D1D', fontSize: '0.875rem', lineHeight: 1.5 }}>
          This will permanently close your FB Business Connect Banking account. Your remaining balance will be swept to the destination you specify. Statements will remain available for 30 days after closure.
        </p>
      </div>
      <div className="space-y-4">
        <div>
          <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Sweep balance to (required)</label>
          <input type="text" value={sweepDest} onChange={e => setSweepDest(e.target.value)} placeholder="External account — routing + account (tokenized on confirm)" className="w-full px-3 py-2 rounded-[6px]" style={{ border: '1px solid #E5E7EB', outline: 'none' }} />
        </div>
        <div>
          <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
            Type <strong>close my account</strong> to confirm
          </label>
          <input type="text" value={typed} onChange={e => setTyped(e.target.value)} placeholder={CONFIRM_PHRASE} className="w-full px-3 py-2 rounded-[6px]" style={{ border: `1px solid ${typed === CONFIRM_PHRASE ? '#00A9AC' : '#E5E7EB'}`, outline: 'none' }} />
        </div>
        <button
          onClick={() => typed === CONFIRM_PHRASE && sweepDest && setStep('done')}
          disabled={typed !== CONFIRM_PHRASE || !sweepDest}
          className="px-5 py-2.5 rounded-[8px] font-semibold"
          style={{ background: typed === CONFIRM_PHRASE && sweepDest ? '#00A9AC' : '#E5E7EB', color: typed === CONFIRM_PHRASE && sweepDest ? '#fff' : '#9CA3AF' }}
        >
          Close account
        </button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function StatementsDisputes() {
  const [tab, setTab] = useState<'statements' | 'disputes' | 'new_dispute' | 'closure'>('statements');
  const [disputes, setDisputes] = useState<BankingDispute[]>(MOCK_DISPUTES);

  return (
    <div>
      <div className="flex gap-1 flex-wrap mb-6 p-1 rounded-[8px] w-fit" style={{ background: '#F3F4F6' }}>
        {[
          { id: 'statements',   label: 'Statements' },
          { id: 'disputes',     label: `Disputes (${disputes.length})` },
          { id: 'new_dispute',  label: 'File dispute' },
          { id: 'closure',      label: 'Account closure' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
            className="px-3 py-1.5 rounded-[6px] font-semibold text-sm whitespace-nowrap"
            style={{ background: tab === t.id ? '#fff' : 'transparent', color: tab === t.id ? '#1A1A1A' : '#6B7280', boxShadow: tab === t.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'statements'  && <StatementsTab />}
      {tab === 'disputes'    && <DisputesList disputes={disputes} />}
      {tab === 'new_dispute' && <NewDisputeForm onSubmit={d => { setDisputes(prev => [d, ...prev]); setTab('disputes'); }} />}
      {tab === 'closure'     && <AccountClosure />}
    </div>
  );
}

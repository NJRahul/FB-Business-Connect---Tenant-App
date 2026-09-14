import { useState } from 'react';
import { Copy, Check, ArrowRight, Plus, X, Clock, Repeat, CheckCircle2, AlertCircle, Lock, Loader2, Zap } from 'lucide-react';
import { formatCents, newIdempotencyKey } from '../../../lib/banking/types';
import type { BankingVault, BankingCounterparty, BankingTransfer } from '../../../lib/banking/types';
import { MOCK_COUNTERPARTIES, MOCK_TRANSFERS, MOCK_VAULTS } from './mockData';
import { getBankingProvider } from '../../../lib/banking/mockProvider';

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={copy} style={{ color: copied ? '#27AE60' : '#9CA3AF' }}>
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

// ─── MFA re-auth gate ─────────────────────────────────────────────────────────

function MFAGate({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  function submit() {
    if (code === '123456') onConfirm();
    else { setError(true); setCode(''); }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-white rounded-[12px] p-6 shadow-xl" style={{ width: 340 }}>
        <div className="flex items-center gap-3 mb-4">
          <Lock size={18} style={{ color: '#C0392B' }} />
          <p style={{ fontWeight: 700, color: '#1A1A1A' }}>Confirm identity to send funds</p>
        </div>
        <input type="text" inputMode="numeric" maxLength={6} value={code} onChange={e => { setCode(e.target.value.replace(/\D/g,'')); setError(false); }} onKeyDown={e => e.key==='Enter'&&submit()} placeholder="6-digit MFA code" autoFocus
          className="w-full text-center py-3 rounded-[8px] text-xl tracking-[0.4em]"
          style={{ border: `1.5px solid ${error?'#C0392B':'#E5E7EB'}`, outline: 'none', fontFamily: 'monospace' }} />
        {error && <p style={{ color: '#C0392B', fontSize: '0.8125rem', textAlign: 'center', marginTop: 4 }}>Invalid. (Demo: 123456)</p>}
        <div className="flex gap-2 mt-4">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-[8px] font-semibold" style={{ background: '#F3F4F6', color: '#374151' }}>Cancel</button>
          <button onClick={submit} className="flex-1 py-2.5 rounded-[8px] font-semibold" style={{ background: '#C0392B', color: '#fff' }}>Verify</button>
        </div>
      </div>
    </div>
  );
}

// ─── Inbound tab ──────────────────────────────────────────────────────────────

function InboundTab({ routingFull, accountFull }: { routingFull: string; accountFull: string }) {
  const [checkSide, setCheckSide] = useState<'front' | 'back'>('front');

  return (
    <div className="space-y-5">
      {/* Wire instructions */}
      <div className="rounded-[10px] overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: '#E5E7EB', background: '#F9FAFB' }}>
          <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>Wire / ACH instructions</p>
        </div>
        <div className="p-5 space-y-3">
          {[
            { label: 'Bank name',        value: 'our partner bank' },
            { label: 'Routing number',   value: routingFull },
            { label: 'Account number',   value: accountFull },
            { label: 'Account type',     value: 'Checking' },
            { label: 'Account name',     value: 'Your Shop LLC' },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #F3F4F6' }}>
              <span style={{ color: '#6B7280', fontSize: '0.9375rem' }}>{row.label}</span>
              <div className="flex items-center gap-2">
                <span style={{ fontFeatureSettings: '"tnum"', fontWeight: 600, color: '#1A1A1A', fontSize: '0.9375rem' }}>{row.value}</span>
                <CopyBtn text={row.value} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ACH pull */}
      <div className="rounded-[10px] p-5" style={{ border: '1px solid #E5E7EB' }}>
        <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem', marginBottom: 4 }}>Pull from linked account</p>
        <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: 12 }}>Transfer funds from a Plaid-linked external account. Arrives in 1–2 business days.</p>
        <div className="flex gap-3 flex-wrap">
          {MOCK_COUNTERPARTIES.filter(c => c.type === 'external_bank' || c.type === 'plaid_linked').map(c => (
            <div key={c.id} className="flex items-center gap-2 px-3 py-2 rounded-[8px]" style={{ border: '1px solid #E5E7EB', background: '#F9FAFB' }}>
              <span style={{ fontSize: '0.875rem', color: '#1A1A1A', fontWeight: 600 }}>{c.nickname}</span>
              <span style={{ fontSize: '0.8125rem', color: '#9CA3AF' }}>···{c.last4}</span>
              <span className="px-1.5 py-0.5 rounded text-xs font-semibold" style={{ background: '#F0FDF4', color: '#27AE60' }}>{c.verification_status === 'plaid_verified' ? 'Plaid' : 'Verified'}</span>
            </div>
          ))}
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] text-sm font-semibold" style={{ border: '1.5px dashed #D1D5DB', color: '#6B7280', background: '#F9FAFB' }}>
            <Plus size={14} /> Link account (Plaid)
          </button>
        </div>
      </div>

      {/* Mobile check deposit */}
      <div className="rounded-[10px] p-5" style={{ border: '1px solid #E5E7EB' }}>
        <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem', marginBottom: 4 }}>Mobile check deposit</p>
        <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: 4 }}>Endorse the back: <strong style={{ color: '#1A1A1A' }}>For Mobile Deposit Only – Evolve B&T</strong></p>
        <p style={{ color: '#9CA3AF', fontSize: '0.8125rem', marginBottom: 12 }}>Checks up to $10,000. Hold period: 1 business day for first $225, remainder released in 2 business days.</p>
        <div className="flex gap-2 mb-3">
          {(['front','back'] as const).map(side => (
            <button key={side} onClick={() => setCheckSide(side)} className="px-3 py-1.5 rounded-[6px] text-sm font-semibold capitalize"
              style={{ background: checkSide === side ? '#1A1A1A' : '#F3F4F6', color: checkSide === side ? '#fff' : '#6B7280' }}>
              {side}
            </button>
          ))}
        </div>
        <label className="flex flex-col items-center justify-center rounded-[10px] cursor-pointer p-8" style={{ border: '2px dashed #E5E7EB', background: '#F9FAFB' }}>
          <span style={{ fontSize: '1.5rem', marginBottom: 8 }}>📸</span>
          <span style={{ color: '#6B7280', fontWeight: 600, fontSize: '0.9375rem' }}>Capture {checkSide} of check</span>
          <span style={{ color: '#9CA3AF', fontSize: '0.8125rem', marginTop: 4 }}>JPEG or PNG, max 10MB</span>
          <input type="file" accept="image/*" capture="environment" className="hidden" />
        </label>
      </div>
    </div>
  );
}

// ─── Outbound form ────────────────────────────────────────────────────────────

function OutboundForm({ vaults }: { vaults: BankingVault[] }) {
  const [type, setType] = useState<'ach_out' | 'vault_to_vault' | 'external'>('vault_to_vault');
  const [fromVault, setFromVault] = useState(vaults[0]?.id ?? '');
  const [toVault, setToVault] = useState(vaults[1]?.id ?? '');
  const [counterparty, setCounterparty] = useState(MOCK_COUNTERPARTIES[0]?.id ?? '');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [scheduleFor, setScheduleFor] = useState('');
  const [showMFA, setShowMFA] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ transfer_id: string; status: string } | null>(null);

  const fromVaultObj = vaults.find(v => v.id === fromVault);
  const amountCents = Math.round(parseFloat(amount || '0') * 100);
  const insufficient = fromVaultObj && amountCents > fromVaultObj.balance_cached && amountCents > 0;
  const shortfall = insufficient ? amountCents - fromVaultObj.balance_cached : 0;
  const needsDualApproval = amountCents >= 25000000;

  async function handleSend() {
    setShowMFA(false);
    setSubmitting(true);
    try {
      const provider = getBankingProvider();
      const res = await provider.createTransfer('acc1', {
        type,
        from_vault_id: fromVault,
        to_vault_id: type === 'vault_to_vault' ? toVault : undefined,
        counterparty_id: type !== 'vault_to_vault' ? counterparty : undefined,
        amount: amountCents,
        currency: 'USD',
        memo: memo || undefined,
        scheduled_for: scheduleFor || undefined,
        idempotency_key: newIdempotencyKey(),
      });
      setResult(res);
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <CheckCircle2 size={40} style={{ color: '#27AE60', marginBottom: 12 }} />
        <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '1.125rem', marginBottom: 4 }}>Transfer submitted</p>
        <p style={{ color: '#6B7280', fontSize: '0.9375rem' }}>Status: <span className="font-semibold" style={{ color: result.status === 'pending_approval' ? '#F39C12' : '#27AE60' }}>{result.status}</span></p>
        {result.status === 'pending_approval' && (
          <div className="mt-4 p-4 rounded-[8px]" style={{ background: '#FFF8E1', border: '1px solid #FDE68A', maxWidth: 380 }}>
            <p style={{ color: '#92400E', fontSize: '0.875rem', fontWeight: 600 }}>Requires second approval</p>
            <p style={{ color: '#6B7280', fontSize: '0.8125rem', marginTop: 4 }}>This transfer exceeds the dual-approval threshold. A second Owner must approve within 72 hours.</p>
          </div>
        )}
        <button onClick={() => { setResult(null); setAmount(''); setMemo(''); }} className="mt-4 px-4 py-2 rounded-[6px] font-semibold text-sm" style={{ background: '#F3F4F6', color: '#374151' }}>
          New transfer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4" style={{ maxWidth: 520 }}>
      {/* Transfer type */}
      <div>
        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Transfer type</label>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'vault_to_vault', label: 'Between vaults (instant)' },
            { value: 'ach_out',        label: 'ACH to counterparty' },
            { value: 'external',       label: 'To linked external account' },
          ].map(t => (
            <button key={t.value} onClick={() => setType(t.value as typeof type)}
              className="px-3 py-1.5 rounded-[6px] text-sm font-semibold"
              style={{ background: type === t.value ? '#1A1A1A' : '#F3F4F6', color: type === t.value ? '#fff' : '#374151' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* From vault */}
      <div>
        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>From vault</label>
        <select value={fromVault} onChange={e => setFromVault(e.target.value)} className="w-full px-3 py-2 rounded-[6px]" style={{ border: '1px solid #E5E7EB' }}>
          {vaults.map(v => <option key={v.id} value={v.id}>{v.name} — {formatCents(v.balance_cached)} available</option>)}
        </select>
      </div>

      {/* To vault or counterparty */}
      {type === 'vault_to_vault' ? (
        <div>
          <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>To vault</label>
          <select value={toVault} onChange={e => setToVault(e.target.value)} className="w-full px-3 py-2 rounded-[6px]" style={{ border: '1px solid #E5E7EB' }}>
            {vaults.filter(v => v.id !== fromVault).map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
      ) : (
        <div>
          <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Counterparty</label>
          <select value={counterparty} onChange={e => setCounterparty(e.target.value)} className="w-full px-3 py-2 rounded-[6px]" style={{ border: '1px solid #E5E7EB' }}>
            {MOCK_COUNTERPARTIES.map(c => <option key={c.id} value={c.id}>{c.nickname} ···{c.last4}</option>)}
          </select>
        </div>
      )}

      {/* Amount */}
      <div>
        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Amount</label>
        <div className="relative">
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>$</span>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
            className="w-full px-3 py-2 rounded-[6px]" style={{ paddingLeft: 24, border: `1px solid ${insufficient ? '#C0392B' : '#E5E7EB'}`, outline: 'none' }} />
        </div>
        {insufficient && (
          <div className="flex items-center gap-2 mt-2 p-2.5 rounded-[6px]" style={{ background: '#FEF2F2', border: '1px solid #FCA5A5' }}>
            <AlertCircle size={14} style={{ color: '#C0392B', flexShrink: 0 }} />
            <p style={{ color: '#991B1B', fontSize: '0.8125rem', fontWeight: 600 }}>
              Insufficient funds. Shortfall: {formatCents(shortfall)}
            </p>
          </div>
        )}
        {needsDualApproval && !insufficient && amountCents > 0 && (
          <div className="flex items-center gap-2 mt-2 p-2.5 rounded-[6px]" style={{ background: '#FFF8E1', border: '1px solid #FDE68A' }}>
            <Clock size={14} style={{ color: '#F39C12', flexShrink: 0 }} />
            <p style={{ color: '#92400E', fontSize: '0.8125rem', fontWeight: 600 }}>Requires dual approval (≥$250,000)</p>
          </div>
        )}
      </div>

      <div>
        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Memo (optional)</label>
        <input type="text" value={memo} onChange={e => setMemo(e.target.value)} placeholder="Invoice #, purpose…"
          className="w-full px-3 py-2 rounded-[6px]" style={{ border: '1px solid #E5E7EB', outline: 'none' }} />
      </div>

      <div>
        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Schedule for (optional)</label>
        <input type="date" value={scheduleFor} onChange={e => setScheduleFor(e.target.value)}
          className="w-full px-3 py-2 rounded-[6px]" style={{ border: '1px solid #E5E7EB', outline: 'none' }} />
      </div>

      <button
        onClick={() => !insufficient && amountCents > 0 && setShowMFA(true)}
        disabled={insufficient || amountCents <= 0 || submitting}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-[8px] font-semibold"
        style={{ background: insufficient || amountCents <= 0 ? '#E5E7EB' : '#C0392B', color: insufficient || amountCents <= 0 ? '#9CA3AF' : '#fff', cursor: insufficient || amountCents <= 0 ? 'not-allowed' : 'pointer' }}
      >
        {submitting ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing…</> : <><Lock size={15} /> Confirm & send</>}
      </button>

      {showMFA && <MFAGate onConfirm={handleSend} onCancel={() => setShowMFA(false)} />}
    </div>
  );
}

// ─── Scheduled transfers ──────────────────────────────────────────────────────

function ScheduledTransfers({ transfers }: { transfers: BankingTransfer[] }) {
  const scheduled = transfers.filter(t => t.status === 'scheduled' || t.recurrence_json);
  return (
    <div className="space-y-3">
      {scheduled.length === 0 && <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '24px 0' }}>No scheduled transfers.</p>}
      {scheduled.map(t => (
        <div key={t.id} className="flex items-center justify-between p-4 rounded-[10px]" style={{ border: '1px solid #E5E7EB', background: '#fff' }}>
          <div className="flex items-center gap-3">
            {t.recurrence_json ? <Repeat size={16} style={{ color: '#6B7280' }} /> : <Clock size={16} style={{ color: '#6B7280' }} />}
            <div>
              <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.9375rem' }}>
                {t.counterparty_name ?? (t.to_vault_name ? `→ ${t.to_vault_name}` : '—')}
              </p>
              <p style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>
                {t.recurrence_json ? `Repeats ${t.recurrence_json.frequency}` : ''}{' '}
                Next: {t.scheduled_for ? new Date(t.scheduled_for).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span style={{ fontFeatureSettings: '"tnum"', fontWeight: 700, color: '#C0392B', fontSize: '0.9375rem' }}>
              −{formatCents(t.amount)}
            </span>
            <div className="flex gap-1">
              <button className="px-2 py-1 rounded-[4px] text-xs font-semibold" style={{ background: '#FFF8E1', color: '#F39C12' }}>Skip next</button>
              <button className="px-2 py-1 rounded-[4px] text-xs font-semibold" style={{ background: '#FEF2F2', color: '#C0392B' }}>Cancel</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Counterparty book ────────────────────────────────────────────────────────

function CounterpartyBook() {
  const [counterparties, setCounterparties] = useState<BankingCounterparty[]>(MOCK_COUNTERPARTIES);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>Saved counterparties</p>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-sm font-semibold" style={{ background: '#1A1A1A', color: '#fff' }}>
          <Plus size={14} /> Add
        </button>
      </div>
      {counterparties.map(cp => {
        const vStatus: Record<string, { label: string; color: string; bg: string }> = {
          verified:              { label: 'Verified',      color: '#27AE60', bg: '#F0FDF4' },
          plaid_verified:        { label: 'Plaid',         color: '#2980B9', bg: '#EBF5FB' },
          micro_deposit_pending: { label: 'Pending',       color: '#F39C12', bg: '#FFF8E1' },
          unverified:            { label: 'Unverified',    color: '#9CA3AF', bg: '#F3F4F6' },
        };
        const vs = vStatus[cp.verification_status] ?? vStatus.unverified;
        return (
          <div key={cp.id} className="flex items-center justify-between p-4 rounded-[8px]" style={{ border: '1px solid #E5E7EB', background: '#fff' }}>
            <div>
              <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.9375rem' }}>{cp.nickname}</p>
              <p style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>{cp.bank_name ?? 'Bank'} ···{cp.last4}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: vs.bg, color: vs.color }}>{vs.label}</span>
              <button style={{ color: '#9CA3AF' }}><X size={15} /></button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Payout routing ───────────────────────────────────────────────────────────

function PayoutRouting() {
  const [routed, setRouted] = useState(false);
  const [speed, setSpeed] = useState<'standard' | 'instant'>('standard');

  return (
    <div className="space-y-4">
      <div className="rounded-[10px] p-5" style={{ border: '1.5px solid #E5E7EB', background: '#fff' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>Shop payout destination</p>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: 2 }}>Route your FB Business Connect shop payouts directly into your FB Business Connect banking account.</p>
          </div>
          {routed && <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ background: '#F0FDF4', color: '#27AE60' }}>Active</span>}
        </div>
        {routed ? (
          <div className="flex items-center gap-2 p-3 rounded-[8px]" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <CheckCircle2 size={16} style={{ color: '#27AE60' }} />
            <span style={{ color: '#15803D', fontSize: '0.9375rem', fontWeight: 600 }}>Payouts routing to FB Business Connect Banking ···4471</span>
          </div>
        ) : (
          <button onClick={() => setRouted(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-[8px] font-semibold" style={{ background: '#C0392B', color: '#fff' }}>
            Route my shop payouts here <ArrowRight size={16} />
          </button>
        )}
        <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: 10 }}>
          Your previous external account will be kept as a backup destination.
        </p>
      </div>

      <div className="rounded-[10px] p-5" style={{ border: '1px solid #E5E7EB' }}>
        <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem', marginBottom: 12 }}>Payout speed</p>
        <div className="space-y-3">
          {[
            { value: 'standard', label: 'Standard — T+2',  sub: 'Free. Funds arrive in 2 business days.', fee: null },
            { value: 'instant',  label: 'Instant — Same day', sub: 'Fee: 1.5% of payout (min $0.25).', fee: '1.5%' },
          ].map(opt => (
            <label key={opt.value} className="flex items-center gap-3 p-4 rounded-[8px] cursor-pointer" style={{ border: `1.5px solid ${speed === opt.value ? '#1A1A1A' : '#E5E7EB'}`, background: speed === opt.value ? '#F9FAFB' : '#fff' }}>
              <input type="radio" name="speed" value={opt.value} checked={speed === opt.value} onChange={() => setSpeed(opt.value as typeof speed)} style={{ accentColor: '#C0392B' }} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.9375rem' }}>{opt.label}</p>
                  {opt.value === 'instant' && <Zap size={14} style={{ color: '#F39C12' }} />}
                </div>
                <p style={{ color: '#6B7280', fontSize: '0.8125rem', marginTop: 2 }}>{opt.sub}</p>
              </div>
              {opt.fee && <span className="text-sm font-semibold" style={{ color: '#F39C12' }}>{opt.fee}</span>}
              {!opt.fee && <span className="text-sm font-semibold" style={{ color: '#27AE60' }}>Free</span>}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function FundingPayouts() {
  const [tab, setTab] = useState<'payout' | 'inbound' | 'outbound' | 'scheduled' | 'counterparties'>('payout');

  const TABS = [
    { id: 'payout',        label: 'Payout routing' },
    { id: 'inbound',       label: 'Receive money' },
    { id: 'outbound',      label: 'Send money' },
    { id: 'scheduled',     label: 'Scheduled' },
    { id: 'counterparties',label: 'Counterparties' },
  ] as const;

  return (
    <div>
      <div className="flex gap-1 flex-wrap mb-6 p-1 rounded-[8px] w-fit" style={{ background: '#F3F4F6' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="px-3 py-1.5 rounded-[6px] font-semibold text-sm whitespace-nowrap"
            style={{ background: tab === t.id ? '#fff' : 'transparent', color: tab === t.id ? '#1A1A1A' : '#6B7280', boxShadow: tab === t.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'payout'        && <PayoutRouting />}
      {tab === 'inbound'       && <InboundTab routingFull="011020021" accountFull="202044714471" />}
      {tab === 'outbound'      && <OutboundForm vaults={MOCK_VAULTS} />}
      {tab === 'scheduled'     && <ScheduledTransfers transfers={MOCK_TRANSFERS} />}
      {tab === 'counterparties'&& <CounterpartyBook />}
    </div>
  );
}

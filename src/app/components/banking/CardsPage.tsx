import { useState } from 'react';
import { Plus, X, Eye, EyeOff, Lock, Unlock, AlertTriangle, Paperclip, ChevronRight, Sliders, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { formatCents, MCC_GROUPS } from '../../../lib/banking/types';
import type { BankingCard, BankingCardControls, CardStatus } from '../../../lib/banking/types';
import { MOCK_CARDS, MOCK_CARD_CONTROLS, MOCK_TRANSACTIONS } from './mockData';
import { getBankingProvider } from '../../../lib/banking/mockProvider';

// ─── Card visual ──────────────────────────────────────────────────────────────

function CardVisual({ card, small = false }: { card: BankingCard; small?: boolean }) {
  const frozen = card.status === 'frozen' || card.status === 'lost_stolen';
  const size = small ? { width: 140, height: 88 } : { width: 280, height: 176 };
  return (
    <div style={{ ...size, borderRadius: 12, background: frozen ? '#888' : '#1A1A1A', position: 'relative', overflow: 'hidden', flexShrink: 0, fontFamily: 'monospace' }}>
      {/* Red accent stripe */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: small ? 6 : 12, background: frozen ? '#555' : '#C0392B' }} />
      {/* Chip */}
      <div style={{ position: 'absolute', top: small ? 10 : 24, left: small ? 12 : 24, width: small ? 18 : 32, height: small ? 14 : 24, borderRadius: 3, background: '#C9A227', border: '1px solid #b8921e' }} />
      {/* Card name */}
      <p style={{ position: 'absolute', top: small ? 10 : 24, right: small ? 12 : 20, fontSize: small ? 7 : 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {card.form_factor}
      </p>
      {/* Last4 */}
      <p style={{ position: 'absolute', bottom: small ? 20 : 40, left: small ? 12 : 24, fontSize: small ? 10 : 18, color: '#fff', letterSpacing: '0.2em', fontWeight: 700 }}>
        •••• {card.last4}
      </p>
      {/* Holder */}
      <p style={{ position: 'absolute', bottom: small ? 8 : 18, left: small ? 12 : 24, fontSize: small ? 7 : 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {card.card_name}
      </p>
      {/* Frozen overlay */}
      {frozen && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Lock size={small ? 16 : 28} color="#fff" />
        </div>
      )}
      {/* Network logo stub */}
      <p style={{ position: 'absolute', bottom: small ? 8 : 18, right: small ? 12 : 20, fontSize: small ? 7 : 11, color: '#9CA3AF', fontStyle: 'italic' }}>VISA</p>
    </div>
  );
}

// ─── Status pill ──────────────────────────────────────────────────────────────

function CardStatusPill({ status }: { status: CardStatus }) {
  const cfg: Record<CardStatus, { label: string; color: string; bg: string }> = {
    active:              { label: 'Active',        color: '#27AE60', bg: '#F0FDF4' },
    frozen:              { label: 'Frozen',        color: '#6B7280', bg: '#F3F4F6' },
    lost_stolen:         { label: 'Lost/Stolen',   color: '#E74C3C', bg: '#FEF2F2' },
    cancelled:           { label: 'Cancelled',     color: '#9CA3AF', bg: '#F3F4F6' },
    pending_activation:  { label: 'Activate',      color: '#F39C12', bg: '#FFF8E1' },
  };
  const c = cfg[status];
  return <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: c.bg, color: c.color }}>{c.label}</span>;
}

// ─── MFA modal ────────────────────────────────────────────────────────────────

function MFAModal({ title, onConfirm, onClose }: { title: string; onConfirm: () => void; onClose: () => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  function submit() {
    if (code === '123456') onConfirm();
    else { setError(true); setCode(''); }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-white rounded-[12px] p-6 shadow-xl" style={{ width: 340 }}>
        <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '1rem', marginBottom: 4 }}>{title}</p>
        <p style={{ color: '#6B7280', fontSize: '0.8125rem', marginBottom: 16 }}>Enter your 6-digit MFA code. (Demo: 123456)</p>
        <input type="text" inputMode="numeric" maxLength={6} value={code} onChange={e => { setCode(e.target.value.replace(/\D/g,'')); setError(false); }} onKeyDown={e => e.key==='Enter'&&submit()} placeholder="000000" autoFocus
          className="w-full text-center py-3 rounded-[8px] text-xl"
          style={{ border: `1.5px solid ${error?'#C0392B':'#E5E7EB'}`, outline: 'none', fontFamily: 'monospace', letterSpacing: '0.4em' }} />
        {error && <p style={{ color: '#C0392B', fontSize: '0.8125rem', textAlign: 'center', marginTop: 4 }}>Invalid code.</p>}
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-[8px] font-semibold" style={{ background: '#F3F4F6', color: '#374151' }}>Cancel</button>
          <button onClick={submit} className="flex-1 py-2.5 rounded-[8px] font-semibold" style={{ background: '#C0392B', color: '#fff' }}>Verify</button>
        </div>
      </div>
    </div>
  );
}

// ─── Card controls drawer ─────────────────────────────────────────────────────

function ControlsDrawer({ card, controls, onClose, onUpdate, onFreeze, onReportLost }: {
  card: BankingCard;
  controls: BankingCardControls;
  onClose: () => void;
  onUpdate: (patch: Partial<BankingCardControls>) => void;
  onFreeze: () => void;
  onReportLost: () => void;
}) {
  const [showPANMFA, setShowPANMFA] = useState(false);
  const [panRevealed, setPanRevealed] = useState(false);
  const [saving, setSaving] = useState(false);

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  async function save() {
    setSaving(true);
    const provider = getBankingProvider();
    await provider.updateCardControls(card.id, controls);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex" style={{ background: 'rgba(0,0,0,0.3)' }} onClick={onClose}>
      <div className="ml-auto h-full overflow-auto" style={{ width: 420, background: '#fff', boxShadow: '-4px 0 20px rgba(0,0,0,0.12)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white z-10" style={{ borderColor: '#E5E7EB' }}>
          <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A' }}>{card.card_name}</p>
          <button onClick={onClose}><X size={18} style={{ color: '#9CA3AF' }} /></button>
        </div>

        <div className="p-5 space-y-6">
          {/* Card visual + status */}
          <div className="flex items-center gap-4">
            <CardVisual card={card} />
            <div className="space-y-2">
              <CardStatusPill status={card.status} />
              <p style={{ color: '#6B7280', fontSize: '0.8125rem' }}>
                {card.form_factor === 'virtual' ? 'Virtual card' : 'Physical card'}<br />
                {card.assigned_user_name ? `Assigned to ${card.assigned_user_name}` : card.asset_name ? `Asset: ${card.asset_name}` : 'Unassigned'}
              </p>
            </div>
          </div>

          {/* PAN reveal */}
          <div className="p-4 rounded-[10px]" style={{ border: '1px solid #E5E7EB' }}>
            <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.9375rem', marginBottom: 8 }}>Card number</p>
            {panRevealed ? (
              <div>
                <p style={{ fontFamily: 'monospace', fontSize: '1.125rem', letterSpacing: '0.2em', color: '#1A1A1A', fontWeight: 700 }}>
                  •••• •••• •••• {card.last4}
                </p>
                <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: 4 }}>Shown via partner iframe. Not stored on TDforge.</p>
              </div>
            ) : (
              <button onClick={() => setShowPANMFA(true)} className="flex items-center gap-2 px-3 py-2 rounded-[6px] font-semibold text-sm" style={{ background: '#F3F4F6', color: '#374151' }}>
                <Eye size={14} /> Reveal full card number
              </button>
            )}
            <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: 6 }}>Requires fresh MFA (&lt;5 min).</p>
          </div>

          {/* Spend limits */}
          <div>
            <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem', marginBottom: 12 }}>Spend limits</p>
            <div className="space-y-3">
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Monthly limit</label>
                <div className="relative">
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>$</span>
                  <input type="number" value={(controls.monthly_limit ?? 0) / 100} onChange={e => onUpdate({ monthly_limit: Math.round(parseFloat(e.target.value || '0') * 100) })}
                    className="w-full px-3 py-2 rounded-[6px]" style={{ paddingLeft: 22, border: '1px solid #E5E7EB', outline: 'none' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Per-transaction limit</label>
                <div className="relative">
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>$</span>
                  <input type="number" value={(controls.per_txn_limit ?? 0) / 100} onChange={e => onUpdate({ per_txn_limit: Math.round(parseFloat(e.target.value || '0') * 100) })}
                    className="w-full px-3 py-2 rounded-[6px]" style={{ paddingLeft: 22, border: '1px solid #E5E7EB', outline: 'none' }} />
                </div>
              </div>
            </div>
          </div>

          {/* MCC groups */}
          <div>
            <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem', marginBottom: 10 }}>Allowed merchant categories</p>
            <div className="flex flex-wrap gap-2">
              {MCC_GROUPS.map(grp => {
                const on = controls.allowed_mcc_groups.includes(grp.id);
                return (
                  <button key={grp.id} onClick={() => onUpdate({ allowed_mcc_groups: on ? controls.allowed_mcc_groups.filter(g => g !== grp.id) : [...controls.allowed_mcc_groups, grp.id] })}
                    className="px-3 py-1.5 rounded-full text-sm font-semibold"
                    style={{ background: on ? '#1A1A1A' : '#F3F4F6', color: on ? '#fff' : '#6B7280', border: on ? 'none' : '1px solid #E5E7EB' }}>
                    {grp.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Allowed days */}
          <div>
            <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem', marginBottom: 10 }}>Allowed days</p>
            <div className="flex gap-1.5 flex-wrap">
              {DAYS.map((day, i) => {
                const on = controls.allowed_days.includes(i);
                return (
                  <button key={day} onClick={() => onUpdate({ allowed_days: on ? controls.allowed_days.filter(d => d !== i) : [...controls.allowed_days, i] })}
                    className="w-10 h-10 rounded-full text-sm font-semibold"
                    style={{ background: on ? '#1A1A1A' : '#F3F4F6', color: on ? '#fff' : '#6B7280' }}>
                    {day.slice(0, 2)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Allowed hours */}
          <div>
            <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem', marginBottom: 8 }}>Allowed hours</p>
            <div className="flex items-center gap-3">
              <input type="time" value={controls.allowed_hours?.start ?? ''} onChange={e => onUpdate({ allowed_hours: { start: e.target.value, end: controls.allowed_hours?.end ?? '23:59' } })}
                className="px-2 py-1.5 rounded-[6px]" style={{ border: '1px solid #E5E7EB', outline: 'none' }} />
              <span style={{ color: '#9CA3AF' }}>to</span>
              <input type="time" value={controls.allowed_hours?.end ?? ''} onChange={e => onUpdate({ allowed_hours: { start: controls.allowed_hours?.start ?? '00:00', end: e.target.value } })}
                className="px-2 py-1.5 rounded-[6px]" style={{ border: '1px solid #E5E7EB', outline: 'none' }} />
              {controls.allowed_hours && (
                <button onClick={() => onUpdate({ allowed_hours: null })} style={{ color: '#9CA3AF' }}><X size={14} /></button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <button onClick={save} disabled={saving} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[8px] font-semibold"
              style={{ background: '#1A1A1A', color: '#fff' }}>
              {saving ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : 'Save controls'}
            </button>
            <button onClick={onFreeze} className="w-full py-2.5 rounded-[8px] font-semibold"
              style={{ background: card.status === 'frozen' ? '#F0FDF4' : '#F3F4F6', color: card.status === 'frozen' ? '#27AE60' : '#374151' }}>
              {card.status === 'frozen' ? '🔓 Unfreeze card' : '🔒 Freeze card'}
            </button>
            <button onClick={onReportLost} className="w-full py-2.5 rounded-[8px] font-semibold"
              style={{ background: '#FEF2F2', color: '#C0392B' }}>
              Report lost / stolen
            </button>
          </div>
        </div>

        {showPANMFA && (
          <MFAModal title="Reveal card number" onConfirm={() => { setPanRevealed(true); setShowPANMFA(false); }} onClose={() => setShowPANMFA(false)} />
        )}
      </div>
    </div>
  );
}

// ─── Issue card modal ─────────────────────────────────────────────────────────

function IssueCardModal({ onClose, onIssue }: { onClose: () => void; onIssue: (name: string, form: 'virtual' | 'physical', assignee: string) => void }) {
  const [cardName, setCardName] = useState('');
  const [form, setForm] = useState<'virtual' | 'physical'>('virtual');
  const [assignee, setAssignee] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-white rounded-[12px] p-6 shadow-xl" style={{ width: 380 }}>
        <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.125rem', marginBottom: 20 }}>Issue new card</p>
        <div className="space-y-4">
          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Card name (required)</label>
            <input type="text" value={cardName} onChange={e => setCardName(e.target.value)} placeholder="e.g. Mike – Truck 1, Shop Van" className="w-full px-3 py-2 rounded-[6px]" style={{ border: '1px solid #E5E7EB', outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Card type</label>
            <div className="flex gap-2">
              {(['virtual', 'physical'] as const).map(f => (
                <button key={f} onClick={() => setForm(f)} className="flex-1 py-2.5 rounded-[8px] font-semibold capitalize"
                  style={{ background: form === f ? '#1A1A1A' : '#F3F4F6', color: form === f ? '#fff' : '#374151' }}>{f}</button>
              ))}
            </div>
            {form === 'virtual' && <p style={{ color: '#27AE60', fontSize: '0.8125rem', marginTop: 4 }}>✓ Issued instantly — ready to use immediately.</p>}
            {form === 'physical' && <p style={{ color: '#6B7280', fontSize: '0.8125rem', marginTop: 4 }}>Ships in 3–5 business days. Requires activation on arrival.</p>}
          </div>
          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Assign to (optional)</label>
            <input type="text" value={assignee} onChange={e => setAssignee(e.target.value)} placeholder="Technician name or asset" className="w-full px-3 py-2 rounded-[6px]" style={{ border: '1px solid #E5E7EB', outline: 'none' }} />
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-[8px] font-semibold" style={{ background: '#F3F4F6', color: '#374151' }}>Cancel</button>
          <button onClick={() => cardName && onIssue(cardName, form, assignee)} disabled={!cardName} className="flex-1 py-2.5 rounded-[8px] font-semibold"
            style={{ background: cardName ? '#C0392B' : '#E5E7EB', color: cardName ? '#fff' : '#9CA3AF' }}>
            Issue card
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Missing receipts queue ───────────────────────────────────────────────────

function MissingReceiptsQueue() {
  const missing = MOCK_TRANSACTIONS.filter(t =>
    t.direction === 'debit' && !t.receipt_url &&
    (Date.now() - new Date(t.posted_at).getTime()) > 48 * 60 * 60 * 1000
  );

  if (missing.length === 0) {
    return (
      <div className="text-center py-10" style={{ color: '#9CA3AF' }}>
        No missing receipts — all card transactions have attachments. ✓
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="p-3 rounded-[8px] flex items-center gap-2" style={{ background: '#FFF8E1', border: '1px solid #FDE68A' }}>
        <AlertTriangle size={15} style={{ color: '#F39C12' }} />
        <p style={{ color: '#92400E', fontSize: '0.875rem', fontWeight: 600 }}>{missing.length} card transaction{missing.length !== 1 ? 's' : ''} older than 48h with no receipt attached.</p>
      </div>
      {missing.map(txn => (
        <div key={txn.id} className="flex items-center justify-between p-4 rounded-[8px]" style={{ border: '1.5px solid #F39C12', background: '#FFFBEB' }}>
          <div>
            <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.9375rem' }}>{txn.merchant_name ?? txn.description}</p>
            <p style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>{txn.card_name} · {new Date(txn.posted_at).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-3">
            <span style={{ fontFeatureSettings: '"tnum"', fontWeight: 700, color: '#C0392B' }}>−{formatCents(txn.amount)}</span>
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] cursor-pointer font-semibold text-sm" style={{ background: '#1A1A1A', color: '#fff' }}>
              <Paperclip size={13} /> Attach
              <input type="file" className="hidden" />
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function CardsPage() {
  const [tab, setTab] = useState<'cards' | 'missing'>('cards');
  const [cards, setCards] = useState(MOCK_CARDS);
  const [controls, setControls] = useState(MOCK_CARD_CONTROLS);
  const [selectedCard, setSelectedCard] = useState<BankingCard | null>(null);
  const [showIssue, setShowIssue] = useState(false);
  const [issuing, setIssuing] = useState(false);

  async function handleIssue(name: string, form: 'virtual' | 'physical', assignee: string) {
    setShowIssue(false);
    setIssuing(true);
    const provider = getBankingProvider();
    const result = await provider.issueCard('acc1', { form_factor: form, card_name: name });
    const newCard: BankingCard = {
      id: result.card_id, shop_id: 'shop1', account_id: 'acc1', partner_card_id: `prt_${result.card_id}`,
      assigned_user_id: null, assigned_user_name: assignee || null,
      asset_id: null, asset_name: null,
      card_name: name, form_factor: form, last4: result.last4, status: result.status,
      shipped_at: form === 'physical' ? new Date().toISOString() : null,
      activated_at: form === 'virtual' ? new Date().toISOString() : null,
    };
    setCards(prev => [...prev, newCard]);
    setControls(prev => ({ ...prev, [result.card_id]: { id: `cc_${result.card_id}`, card_id: result.card_id, monthly_limit: null, per_txn_limit: null, allowed_mcc_groups: [], allowed_days: [0,1,2,3,4,5,6], allowed_hours: null, geo_radius_miles: null } }));
    setIssuing(false);
  }

  function handleFreeze(cardId: string) {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, status: c.status === 'frozen' ? 'active' as const : 'frozen' as const } : c));
    setSelectedCard(null);
  }

  function handleReportLost(cardId: string) {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, status: 'lost_stolen' as const } : c));
    setSelectedCard(null);
  }

  const missingCount = MOCK_TRANSACTIONS.filter(t => t.direction === 'debit' && !t.receipt_url && (Date.now() - new Date(t.posted_at).getTime()) > 48 * 60 * 60 * 1000).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 p-1 rounded-[8px]" style={{ background: '#F3F4F6' }}>
          {[{ id: 'cards', label: 'Cards' }, { id: 'missing', label: `Missing receipts${missingCount > 0 ? ` (${missingCount})` : ''}` }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
              className="px-4 py-1.5 rounded-[6px] font-semibold text-sm whitespace-nowrap"
              style={{ background: tab === t.id ? '#fff' : 'transparent', color: tab === t.id ? '#1A1A1A' : '#6B7280', boxShadow: tab === t.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>
              {t.label}
            </button>
          ))}
        </div>
        {tab === 'cards' && (
          <button onClick={() => setShowIssue(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] font-semibold text-sm" style={{ background: '#C0392B', color: '#fff' }}>
            {issuing ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Issuing…</> : <><Plus size={14} /> Issue card</>}
          </button>
        )}
      </div>

      {tab === 'missing' && <MissingReceiptsQueue />}

      {tab === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {cards.map(card => (
            <div key={card.id} className="rounded-[12px] overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              style={{ border: '1px solid #E5E7EB', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
              onClick={() => setSelectedCard(card)}>
              <div className="p-4 flex justify-center" style={{ background: '#F9FAFB' }}>
                <CardVisual card={card} small />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>{card.card_name}</p>
                  <CardStatusPill status={card.status} />
                </div>
                <p style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>
                  {card.form_factor === 'virtual' ? 'Virtual' : 'Physical'} · ···{card.last4}
                  {card.assigned_user_name && ` · ${card.assigned_user_name}`}
                </p>
                {controls[card.id]?.monthly_limit && (
                  <p style={{ color: '#6B7280', fontSize: '0.8125rem', marginTop: 4, fontFeatureSettings: '"tnum"' }}>
                    Limit: {formatCents(controls[card.id].monthly_limit!)} / mo
                  </p>
                )}
                <div className="flex items-center gap-1 mt-3" style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>
                  <Sliders size={12} /> Tap to manage controls
                  <ChevronRight size={12} style={{ marginLeft: 'auto' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCard && (
        <ControlsDrawer
          card={selectedCard}
          controls={controls[selectedCard.id] ?? { id: '', card_id: selectedCard.id, monthly_limit: null, per_txn_limit: null, allowed_mcc_groups: [], allowed_days: [0,1,2,3,4,5,6], allowed_hours: null, geo_radius_miles: null }}
          onClose={() => setSelectedCard(null)}
          onUpdate={patch => setControls(prev => ({ ...prev, [selectedCard.id]: { ...prev[selectedCard.id], ...patch } }))}
          onFreeze={() => handleFreeze(selectedCard.id)}
          onReportLost={() => handleReportLost(selectedCard.id)}
        />
      )}
      {showIssue && <IssueCardModal onClose={() => setShowIssue(false)} onIssue={handleIssue} />}
    </div>
  );
}

import React, { useState } from 'react';
import { Tag, Eye, EyeOff, Plus, ExternalLink, CheckCircle, Clock, AlertCircle, Mail } from 'lucide-react';
import { REBATES, REBATE_ATTRIBUTIONS } from './mockData';
import type { Rebate, RebateType } from './types';

function RebateTypeBadge({ type }: { type: RebateType }) {
  const map: Record<RebateType, { label: string; color: string; bg: string }> = {
    mail_in:    { label: 'Mail-in',    color: '#2563EB', bg: '#EFF6FF' },
    instant:    { label: 'Instant',    color: '#16A34A', bg: '#F0FDF4' },
    promo_code: { label: 'Promo Code', color: '#7C3AED', bg: '#F5F3FF' },
  };
  const s = map[type];
  return <span style={{ padding: '2px 8px', borderRadius: 99, background: s.bg, color: s.color, fontSize: 11, fontWeight: 600 }}>{s.label}</span>;
}

function ProductPageBadgePreview({ rebate }: { rebate: Rebate }) {
  return (
    <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ padding: '10px 14px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>
        Product Page Badge Preview — {rebate.name}
      </div>
      {/* Simulated product page snippet */}
      <div style={{ padding: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ width: 48, height: 48, borderRadius: 8, background: rebate.logoColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Tag size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1A1A1A' }}>
              {rebate.manufacturer} {rebate.amountType === 'fixed' ? `R ${rebate.amount}` : `${rebate.amount}%`} Off
            </div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>{rebate.name}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              <RebateTypeBadge type={rebate.rebateType} />
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>Exp: {rebate.endDate}</span>
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <a href={rebate.termsUrl} style={{ fontSize: 11, color: '#00A9AC', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              Terms <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function MailInFormModal({ rebate, onClose }: { rebate: Rebate; onClose: () => void }) {
  const [step, setStep] = useState<'form' | 'success'>('form');

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 14, width: 460, maxWidth: '100%', overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Mail-in Rebate Form</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{rebate.name} — {rebate.manufacturer}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: '#9CA3AF', cursor: 'pointer' }}>×</button>
        </div>
        {step === 'form' ? (
          <div style={{ padding: 20 }}>
            <div style={{ background: '#F0F7FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#1D4ED8' }}>
              Rebate amount: <strong>{rebate.amountType === 'fixed' ? `R ${rebate.amount}` : `${rebate.amount}% off`}</strong> · Expires: {rebate.endDate}
            </div>
            {[
              { label: 'Customer Name', placeholder: 'Maria Santos' },
              { label: 'Mailing Address', placeholder: '123 Main St, Springfield, IL 62701' },
              { label: 'Order / Invoice Number', placeholder: 'ORD-4201' },
              { label: 'Tire SKU(s)', placeholder: rebate.eligibleSkus.join(', ') },
              { label: 'Purchase Date', placeholder: '2026-06-15', type: 'date' },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>{f.label}</label>
                <input type={f.type || 'text'} placeholder={f.placeholder} style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: 7, fontSize: 13, boxSizing: 'border-box' }} />
              </div>
            ))}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: '#374151', cursor: 'pointer', marginBottom: 16 }}>
              <input type="checkbox" style={{ marginTop: 2, flexShrink: 0 }} />
              Customer acknowledges that the mail-in rebate submission is subject to {rebate.manufacturer} terms and conditions.
            </label>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={onClose} style={{ padding: '8px 16px', border: '1px solid #E5E7EB', borderRadius: 7, background: '#fff', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => setStep('success')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', background: '#00A9AC', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                <Mail size={13} /> Submit & Print
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <CheckCircle size={40} color="#16A34A" style={{ display: 'block', margin: '0 auto 12px' }} />
            <div style={{ fontWeight: 700, fontSize: 16, color: '#1A1A1A', marginBottom: 6 }}>Rebate Form Submitted</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>Print the form and include it with the customer's purchase receipt and mailing submission.</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button style={{ padding: '8px 18px', background: '#1A1A1A', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Print Form</button>
              <button onClick={onClose} style={{ padding: '8px 18px', border: '1px solid #E5E7EB', borderRadius: 7, background: '#fff', fontSize: 13, cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RebateCard({ rebate, onMailIn, onTogglePublish }: { rebate: Rebate; onMailIn: () => void; onTogglePublish: () => void }) {
  const today = new Date();
  const expired = new Date(rebate.endDate) < today;

  return (
    <div style={{ background: '#fff', border: `1px solid ${!rebate.active ? '#E5E7EB' : expired ? '#FCA5A5' : '#E5E7EB'}`, borderRadius: 10, padding: '14px 16px', opacity: !rebate.active ? 0.65 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 8, background: rebate.logoColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Tag size={18} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#1A1A1A' }}>{rebate.name}</span>
            <RebateTypeBadge type={rebate.rebateType} />
            {!rebate.active && <span style={{ padding: '1px 6px', borderRadius: 99, background: '#F3F4F6', color: '#9CA3AF', fontSize: 10, fontWeight: 600 }}>Inactive</span>}
            {expired && <span style={{ padding: '1px 6px', borderRadius: 99, background: '#FEF2F2', color: '#DC2626', fontSize: 10, fontWeight: 600 }}>Expired</span>}
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
            {rebate.manufacturer} · {rebate.amountType === 'fixed' ? `R ${rebate.amount}` : `${rebate.amount}%`} off · {rebate.startDate} → {rebate.endDate}
          </div>
          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 3 }}>
            Eligible SKUs: {rebate.eligibleSkus.length} · Categories: {rebate.eligibleCategories.join(', ')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button
            onClick={onTogglePublish}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 6, border: '1px solid', borderColor: rebate.platformPublished ? '#86EFAC' : '#E5E7EB', background: rebate.platformPublished ? '#F0FDF4' : '#F9FAFB', color: rebate.platformPublished ? '#16A34A' : '#6B7280', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
          >
            {rebate.platformPublished ? <><Eye size={11} /> Published</> : <><EyeOff size={11} /> Unpublished</>}
          </button>
          {rebate.rebateType === 'mail_in' && (
            <button onClick={onMailIn} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: 11, cursor: 'pointer' }}>
              <Mail size={11} /> Form
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function RebatesView() {
  const [subtab, setSubtab] = useState<'registry' | 'preview' | 'attributions'>('registry');
  const [mailInRebate, setMailInRebate] = useState<Rebate | null>(null);
  const [rebates, setRebates] = useState(REBATES);
  const [previewRebate, setPreviewRebate] = useState(REBATES.find(r => r.platformPublished && r.active) || REBATES[0]);

  const togglePublish = (id: string) => {
    setRebates(rs => rs.map(r => r.id === id ? { ...r, platformPublished: !r.platformPublished } : r));
  };

  const claimedTotal = REBATE_ATTRIBUTIONS.filter(a => a.claimedAt).reduce((s, a) => s + a.amount, 0);
  const pendingTotal = REBATE_ATTRIBUTIONS.filter(a => !a.claimedAt).reduce((s, a) => s + a.amount, 0);

  return (
    <div>
      {mailInRebate && <MailInFormModal rebate={mailInRebate} onClose={() => setMailInRebate(null)} />}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Active Rebates', value: rebates.filter(r => r.active).length, color: '#1A1A1A' },
          { label: 'Platform Published', value: rebates.filter(r => r.active && r.platformPublished).length, color: '#16A34A' },
          { label: 'Claimed (30d)', value: `R ${claimedTotal}`, color: '#2563EB' },
          { label: 'Pending Claim', value: `R ${pendingTotal}`, color: '#D97706' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 9, padding: '14px 16px' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #E5E7EB', marginBottom: 20, alignItems: 'flex-end' }}>
        {(['registry', 'preview', 'attributions'] as const).map(t => (
          <button key={t} onClick={() => setSubtab(t)} style={{ padding: '8px 18px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: subtab === t ? '#00A9AC' : '#6B7280', borderBottom: subtab === t ? '2px solid #00A9AC' : '2px solid transparent', marginBottom: -2, textTransform: 'capitalize' }}>
            {t === 'attributions' ? 'Attributions' : t === 'preview' ? 'Badge Preview' : 'Registry'}
          </button>
        ))}
        <button style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#00A9AC', color: '#fff', border: 'none', borderRadius: 7, fontWeight: 600, fontSize: 12, cursor: 'pointer', marginBottom: 8 }}>
          <Plus size={13} /> Add Rebate
        </button>
      </div>

      {subtab === 'registry' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rebates.map(r => (
            <RebateCard key={r.id} rebate={r} onMailIn={() => setMailInRebate(r)} onTogglePublish={() => togglePublish(r.id)} />
          ))}
        </div>
      )}

      {subtab === 'preview' && (
        <div>
          <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 14 }}>
            See how rebate badges will appear on product pages when platform-published. Select a rebate below.
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {rebates.filter(r => r.active).map(r => (
              <button key={r.id} onClick={() => setPreviewRebate(r)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid', borderColor: previewRebate.id === r.id ? '#00A9AC' : '#E5E7EB', background: previewRebate.id === r.id ? '#FEF2F2' : '#fff', color: previewRebate.id === r.id ? '#00A9AC' : '#374151', fontSize: 12, cursor: 'pointer' }}>
                {r.manufacturer}
              </button>
            ))}
          </div>
          <ProductPageBadgePreview rebate={previewRebate} />
          <div style={{ padding: '10px 14px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12, color: '#6B7280' }}>
            Badge is shown on product listing pages for all eligible SKUs. Toggle "Published" in the Registry to control visibility.
          </div>
        </div>
      )}

      {subtab === 'attributions' && (
        <div>
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  {['Rebate', 'Order', 'Customer', 'Amount', 'Status'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {REBATE_ATTRIBUTIONS.map((a, i) => (
                  <tr key={a.id} style={{ borderBottom: i < REBATE_ATTRIBUTIONS.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <td style={{ padding: '11px 14px', color: '#374151' }}>{a.rebateName}</td>
                    <td style={{ padding: '11px 14px', color: '#6B7280', fontSize: 12 }}>{a.orderId}</td>
                    <td style={{ padding: '11px 14px', fontWeight: 500, color: '#1A1A1A' }}>{a.customerName}</td>
                    <td style={{ padding: '11px 14px', fontWeight: 700, color: '#1A1A1A' }}>${a.amount}</td>
                    <td style={{ padding: '11px 14px' }}>
                      {a.claimedAt
                        ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#16A34A', fontSize: 12, fontWeight: 600 }}><CheckCircle size={11} />Claimed {new Date(a.claimedAt).toLocaleDateString()}</span>
                        : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#D97706', fontSize: 12, fontWeight: 600 }}><Clock size={11} />Pending</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

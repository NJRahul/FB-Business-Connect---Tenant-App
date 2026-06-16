import React, { useState } from 'react';
import { Wrench, ArrowLeftRight, Trash2, Package, Plus, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';
import { TIRE_POSITIONS, TAKEOFF_RECORDS, SWAP_STORE_ENTRIES } from './mockData';
import type { TakeOffDisposition, WheelPosition } from './types';

const POSITION_LABEL: Record<string, string> = { FL: 'FL', FR: 'FR', RL: 'RL', RR: 'RR', RL2: 'RL2', RR2: 'RR2' };

// ── T5: Mount & Balance ───────────────────────────────────────────────────────
function MountBalanceTab() {
  const [bundleMode, setBundleMode] = useState<'standalone' | 'bundle'>('bundle');

  const services = [
    { name: 'Tire Mount (per wheel)', basePrice: 18, bundlePrice: 15, time: '15 min' },
    { name: 'Wheel Balance (per wheel)', basePrice: 20, bundlePrice: 16, time: '10 min' },
    { name: 'Valve Stem Replacement', basePrice: 6, bundlePrice: 4, time: '3 min' },
    { name: 'Torque Stud Re-check', basePrice: 0, bundlePrice: 0, time: '5 min', included: true },
    { name: 'Road Force Balance Upgrade', basePrice: 40, bundlePrice: 35, time: '20 min' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['bundle', 'standalone'] as const).map(m => (
          <button key={m} onClick={() => setBundleMode(m)} style={{ padding: '6px 16px', borderRadius: 7, border: '1px solid', borderColor: bundleMode === m ? '#C0392B' : '#E5E7EB', background: bundleMode === m ? '#FEF2F2' : '#fff', color: bundleMode === m ? '#C0392B' : '#6B7280', fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
            {m === 'bundle' ? 'Bundle Pricing' : 'Standalone'}
          </button>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              {['Service', 'Price', 'Std Time', ''].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {services.map((s, i) => (
              <tr key={s.name} style={{ borderBottom: i < services.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                <td style={{ padding: '12px 14px', fontWeight: 500, color: '#1A1A1A' }}>
                  {s.name}
                  {s.included && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: '#16A34A', background: '#F0FDF4', padding: '1px 6px', borderRadius: 99 }}>Included</span>}
                </td>
                <td style={{ padding: '12px 14px', color: '#374151', fontWeight: 600 }}>
                  {s.included ? <span style={{ color: '#16A34A' }}>Free</span> : `$${bundleMode === 'bundle' ? s.bundlePrice : s.basePrice}`}
                </td>
                <td style={{ padding: '12px 14px', color: '#6B7280' }}>{s.time}</td>
                <td style={{ padding: '12px 14px' }}>
                  <button style={{ fontSize: 11, color: '#C0392B', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ padding: '12px 16px', background: '#F0F7FF', border: '1px solid #BFDBFE', borderRadius: 8, fontSize: 13, color: '#1D4ED8' }}>
        Bundle pricing applies when Mount + Balance are sold together in the same visit order. Valve stem and torque re-check auto-add to bundled orders.
      </div>
    </div>
  );
}

// ── T6: Tire Position ─────────────────────────────────────────────────────────
function PositionTab() {
  const treadColor = (mm: number) => mm < 3 ? '#DC2626' : mm < 5 ? '#D97706' : '#16A34A';

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
        {TIRE_POSITIONS.map(tp => (
          <div key={tp.id} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 9, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: treadColor(tp.treadDepthMm) + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: treadColor(tp.treadDepthMm) }}>
              {POSITION_LABEL[tp.position]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>{tp.skuName}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2, fontFamily: 'monospace' }}>{tp.dotCode}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: treadColor(tp.treadDepthMm) }}>{tp.treadDepthMm}mm</div>
              <div style={{ fontSize: 10, color: '#9CA3AF' }}>tread</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: '10px 14px', background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: 8, fontSize: 12, color: '#92400E' }}>
        Rotation recommended — rear tires are 3.6mm lower than fronts. Consider recommending rotation at next visit.
      </div>
    </div>
  );
}

// ── T7: Take-offs ─────────────────────────────────────────────────────────────
function DispositionBadge({ disposition }: { disposition: TakeOffDisposition }) {
  const map: Record<TakeOffDisposition, { label: string; color: string; bg: string }> = {
    disposal:          { label: 'Disposal',         color: '#DC2626', bg: '#FEF2F2' },
    customer_retained: { label: 'Customer Kept',    color: '#2563EB', bg: '#EFF6FF' },
    shop_resale:       { label: 'Shop Resale',      color: '#16A34A', bg: '#F0FDF4' },
  };
  const s = map[disposition];
  return <span style={{ padding: '2px 8px', borderRadius: 99, background: s.bg, color: s.color, fontSize: 11, fontWeight: 600 }}>{s.label}</span>;
}

function TakeOffTab() {
  const forResale = TAKEOFF_RECORDS.filter(r => r.disposition === 'shop_resale');
  const resaleValue = forResale.reduce((a, r) => a + (r.suggestedResalePrice || 0), 0);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 9, padding: '14px 16px' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A' }}>{TAKEOFF_RECORDS.length}</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>Take-offs Logged</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 9, padding: '14px 16px' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#16A34A' }}>${resaleValue}</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>Potential Resale Value</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 9, padding: '14px 16px' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#DC2626' }}>${TAKEOFF_RECORDS.reduce((a, r) => a + (r.disposalFeeCharged || 0), 0).toFixed(2)}</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>Disposal Fees Collected</div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              {['Position', 'Visit', 'Tread (mm)', 'Condition', 'DOT Year', 'Disposition', 'Value'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TAKEOFF_RECORDS.map((r, i) => (
              <tr key={r.id} style={{ borderBottom: i < TAKEOFF_RECORDS.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                <td style={{ padding: '11px 14px', fontWeight: 700, color: '#1A1A1A' }}>{r.position}</td>
                <td style={{ padding: '11px 14px', color: '#6B7280', fontSize: 11 }}>{r.visitId}</td>
                <td style={{ padding: '11px 14px', color: r.treadDepthMm < 3 ? '#DC2626' : '#374151', fontWeight: r.treadDepthMm < 3 ? 700 : 400 }}>{r.treadDepthMm}</td>
                <td style={{ padding: '11px 14px' }}>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[1,2,3,4,5].map(n => (
                      <div key={n} style={{ width: 8, height: 8, borderRadius: 2, background: n <= r.conditionRating ? '#C0392B' : '#E5E7EB' }} />
                    ))}
                  </div>
                </td>
                <td style={{ padding: '11px 14px', color: '#6B7280' }}>{r.dotYear}</td>
                <td style={{ padding: '11px 14px' }}><DispositionBadge disposition={r.disposition} /></td>
                <td style={{ padding: '11px 14px', color: '#374151' }}>
                  {r.suggestedResalePrice ? <span style={{ color: '#16A34A', fontWeight: 600 }}>${r.suggestedResalePrice}</span>
                    : r.disposalFeeCharged ? <span style={{ color: '#DC2626' }}>-${r.disposalFeeCharged}</span>
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── T8: Swap & Store ──────────────────────────────────────────────────────────
function SwapStoreTab() {
  const today = new Date();
  const isOverdue = (date: string) => new Date(date) < today;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: '#6B7280' }}>{SWAP_STORE_ENTRIES.length} sets in storage · {SWAP_STORE_ENTRIES.reduce((a, e) => a + e.tires.length, 0)} total tires</div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#C0392B', color: '#fff', border: 'none', borderRadius: 7, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
          <Plus size={13} /> Store New Set
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {SWAP_STORE_ENTRIES.map(entry => {
          const overdue = isOverdue(entry.retrieveBy);
          return (
            <div key={entry.id} style={{ background: '#fff', border: `1px solid ${overdue ? '#FCA5A5' : '#E5E7EB'}`, borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: '#1A1A1A' }}>{entry.customerName}</span>
                    <span style={{ padding: '2px 8px', borderRadius: 99, background: '#F3F4F6', color: '#6B7280', fontSize: 11, fontWeight: 600 }}>Bay {entry.storageBay}</span>
                    {overdue && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 99, background: '#FEF2F2', color: '#DC2626', fontSize: 11, fontWeight: 600 }}><AlertTriangle size={10} />Overdue</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{entry.vehicleLabel}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2, display: 'flex', gap: 12 }}>
                    <span><Calendar size={10} style={{ display: 'inline', marginRight: 3 }} />Stored: {entry.storedAt}</span>
                    <span style={{ color: overdue ? '#DC2626' : '#6B7280', fontWeight: overdue ? 600 : 400 }}>Retrieve by: {entry.retrieveBy}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ padding: '6px 12px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 12, cursor: 'pointer', color: '#374151' }}>View Tires</button>
                  <button style={{ padding: '6px 12px', background: '#C0392B', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Schedule Swap</button>
                </div>
              </div>
              {/* Tire mini-list */}
              <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {entry.tires.map(t => (
                  <div key={t.position} style={{ padding: '4px 10px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 11, color: '#374151' }}>
                    <span style={{ fontWeight: 700 }}>{t.position}</span> · {t.treadDepthMm}mm · {t.skuName.split(' ').slice(0, 2).join(' ')}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const SUBTABS = [
  { id: 'mb',       label: 'Mount & Balance',  icon: Wrench },
  { id: 'position', label: 'Position Tracking', icon: ArrowLeftRight },
  { id: 'takeoffs', label: 'Take-offs',         icon: Trash2 },
  { id: 'swap',     label: 'Swap & Store',      icon: Package },
] as const;
type ServicesSubtab = typeof SUBTABS[number]['id'];

export function ServicesView() {
  const [subtab, setSubtab] = useState<ServicesSubtab>('mb');
  const overdueCount = SWAP_STORE_ENTRIES.filter(e => new Date(e.retrieveBy) < new Date()).length;

  return (
    <div>
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #E5E7EB', marginBottom: 20 }}>
        {SUBTABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setSubtab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: subtab === t.id ? '#C0392B' : '#6B7280', borderBottom: subtab === t.id ? '2px solid #C0392B' : '2px solid transparent', marginBottom: -2, whiteSpace: 'nowrap' }}>
              <Icon size={13} />
              {t.label}
              {t.id === 'swap' && overdueCount > 0 && (
                <span style={{ background: '#DC2626', color: '#fff', borderRadius: 99, padding: '1px 5px', fontSize: 10, fontWeight: 700 }}>{overdueCount}</span>
              )}
            </button>
          );
        })}
      </div>

      {subtab === 'mb'       && <MountBalanceTab />}
      {subtab === 'position' && <PositionTab />}
      {subtab === 'takeoffs' && <TakeOffTab />}
      {subtab === 'swap'     && <SwapStoreTab />}
    </div>
  );
}

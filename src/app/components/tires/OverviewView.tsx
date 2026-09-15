import React from 'react';
import { Gauge, FileCheck, Shield, Wrench, ArrowLeftRight, Trash2, Package, BarChart2, Tag, ClipboardCheck, TrendingUp, AlertCircle } from 'lucide-react';
import { TPMS_VISITS, TIRE_REGISTRATIONS, ROAD_HAZARD_WARRANTIES, WARRANTY_CLAIMS, SWAP_STORE_ENTRIES, REBATES, REGISTRATION_RATE_ROWS } from './mockData';

const MODULE_CARDS = [
  { id: 'tpms',         label: 'T1 — TPMS Sensor Mgmt',       icon: Gauge,        color: '#2563EB', tab: 'tpms' },
  { id: 'registration', label: 'T2/T3 — Tire Registration + DOT', icon: FileCheck,  color: '#059669', tab: 'registration' },
  { id: 'warranties',   label: 'T4/T9 — Road Hazard + Claims', icon: Shield,       color: '#7C3AED', tab: 'warranties' },
  { id: 'services',     label: 'T5–T8 — Services + Swap/Store', icon: Wrench,      color: '#D97706', tab: 'services' },
  { id: 'reports',      label: 'T10 — Registration Reporting',  icon: BarChart2,   color: '#0891B2', tab: 'reports' },
  { id: 'rebates',      label: 'T11 — Manufacturer Rebates',    icon: Tag,         color: '#00A9AC', tab: 'rebates' },
  { id: 'inspections',  label: 'T12 — Inspection Templates',    icon: ClipboardCheck, color: '#64748B', tab: 'inspections' },
];

interface OverviewViewProps {
  onNavigate: (tab: string) => void;
}

export function OverviewView({ onNavigate }: OverviewViewProps) {
  const overallRate = REGISTRATION_RATE_ROWS[0];
  const activeClaims = WARRANTY_CLAIMS.filter(c => c.status === 'open' || c.status === 'under_review').length;
  const activeWarranties = ROAD_HAZARD_WARRANTIES.filter(w => w.status === 'active').length;
  const overdueSwaps = SWAP_STORE_ENTRIES.filter(s => new Date(s.retrieveBy) < new Date()).length;
  const activeRebates = REBATES.filter(r => r.active).length;
  const pendingRegs = TIRE_REGISTRATIONS.filter(r => r.status === 'pending' || r.status === 'in_batch').length;

  const stats = [
    { label: 'TPMS Visits (30d)', value: TPMS_VISITS.length, icon: Gauge, color: '#2563EB', sub: 'Avg 3.8 wheels/visit' },
    { label: 'Reg. Completion', value: `${overallRate.rate}%`, icon: FileCheck, color: '#059669', sub: `${pendingRegs} pending` },
    { label: 'Active Warranties', value: activeWarranties, icon: Shield, color: '#7C3AED', sub: `${activeClaims} open claims` },
    { label: 'Tires in Storage', value: SWAP_STORE_ENTRIES.reduce((a, e) => a + e.tires.length, 0), icon: Package, color: '#D97706', sub: overdueSwaps > 0 ? `${overdueSwaps} overdue retrieval` : 'All current' },
    { label: 'Active Rebates', value: activeRebates, icon: Tag, color: '#00A9AC', sub: `${REBATES.filter(r => r.active && r.platformPublished).length} platform-published` },
  ];

  return (
    <div>
      {/* Alert strip */}
      {(activeClaims > 0 || overdueSwaps > 0) && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {activeClaims > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 8, background: '#F0FBFB', border: '1px solid #80D4D5', fontSize: 13, color: '#DC2626', cursor: 'pointer' }} onClick={() => onNavigate('warranties')}>
              <AlertCircle size={14} />
              {activeClaims} warranty claim{activeClaims > 1 ? 's' : ''} need attention
            </div>
          )}
          {overdueSwaps > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 8, background: '#FFFBEB', border: '1px solid #FCD34D', fontSize: 13, color: '#D97706', cursor: 'pointer' }} onClick={() => onNavigate('services')}>
              <AlertCircle size={14} />
              {overdueSwaps} swap storage overdue for retrieval
            </div>
          )}
        </div>
      )}

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} color={s.color} />
                </div>
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#1A1A1A', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: s.color, marginTop: 3 }}>{s.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Module grid */}
      <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#6B7280', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Module Index</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {MODULE_CARDS.map(m => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => onNavigate(m.tab)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = m.color)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#E5E7EB')}
            >
              <div style={{ width: 36, height: 36, borderRadius: 8, background: m.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color={m.color} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>{m.label}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Open →</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick insight */}
      <div style={{ marginTop: 24, padding: '14px 18px', borderRadius: 10, background: '#F0FDF4', border: '1px solid #86EFAC', display: 'flex', gap: 10 }}>
        <TrendingUp size={16} color="#16A34A" style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 13, color: '#15803D' }}>
          Registration completion rate is <strong>{overallRate.rate}%</strong> — above the 80% benchmark. Michelin leads at 92.3%. Pirelli is lowest at 63% — consider consent flow improvements for performance tires.
        </div>
      </div>
    </div>
  );
}

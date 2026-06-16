import { useState } from 'react';
import { LayoutGrid, Users, User, BarChart2, Mail, AlertTriangle, X } from 'lucide-react';
import { PlansGridView } from './PlansGridView';
import { EnrollmentsView } from './EnrollmentsView';
import { CustomerMembershipView } from './CustomerMembershipView';
import { PlanPnLView } from './PlanPnLView';
import { RenewalNoticeView } from './RenewalNoticeView';

const TABS = [
  { id: 'plans',    label: 'Plans',              icon: LayoutGrid },
  { id: 'enrollments', label: 'Enrollments',     icon: Users },
  { id: 'portal',   label: 'Customer Portal',    icon: User },
  { id: 'pnl',      label: 'P&L',               icon: BarChart2 },
  { id: 'renewal',  label: 'Renewal Notices',    icon: Mail },
] as const;

type Tab = typeof TABS[number]['id'];

export function RecurringPlansModule() {
  const [tab, setTab] = useState<Tab>('plans');
  const [banner, setBanner] = useState(true);

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1A1A1A' }}>
      {/* Page header */}
      <div className="mb-5">
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.625rem', color: '#1A1A1A', margin: 0 }}>
          Recurring Service Plans
        </h1>
        <p style={{ color: '#6B7280', marginTop: '4px', fontSize: '0.9375rem' }}>
          Build and manage membership plans, enroll customers per vehicle, consume entitlements at booking, and track recurring revenue.
        </p>
      </div>

      {/* Engine-ready notice banner */}
      {banner && (
        <div className="mb-5 flex items-start gap-3 p-4 rounded-[10px]" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
          <AlertTriangle size={17} style={{ color: '#F39C12', flexShrink: 0, marginTop: '1px' }} />
          <div className="flex-1">
            <p style={{ fontWeight: 700, color: '#92400E', fontSize: '0.9375rem' }}>Framework ready — v1 Tires pack not yet activated</p>
            <p style={{ color: '#92400E', fontSize: '0.8125rem', marginTop: '2px' }}>
              This engine is built and wired. The Tires service pack does not activate this module in v1. Plans shown are demos.
              Full activation is planned for HVAC, lawn care, and pest control packs.
            </p>
          </div>
          <button onClick={() => setBanner(false)} style={{ color: '#D97706', flexShrink: 0 }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #E5E7EB', marginBottom: '28px' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 13,
              color: tab === t.id ? '#C0392B' : '#6B7280',
              borderBottom: tab === t.id ? '2px solid #C0392B' : '2px solid transparent',
              marginBottom: -2,
            }}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'plans'       && <PlansGridView />}
      {tab === 'enrollments' && <EnrollmentsView />}
      {tab === 'portal'      && <CustomerMembershipView />}
      {tab === 'pnl'         && <PlanPnLView />}
      {tab === 'renewal'     && <RenewalNoticeView />}
    </div>
  );
}

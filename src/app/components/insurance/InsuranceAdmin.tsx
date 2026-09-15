import { ShieldCheck } from 'lucide-react';
import { formatCents } from '../../../lib/insurance/types';
import {
  ADMIN_FUNNEL, ADMIN_TENANTS, ADMIN_CARRIERS, MOCK_COMMISSIONS,
} from './mockData';

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: 'Active',    color: '#27AE60', bg: '#F0FDF4' },
  quoted:    { label: 'Quoted',    color: '#F39C12', bg: '#FFF8E1' },
  declined:  { label: 'Declined', color: '#00BFC3', bg: '#FEF2F2' },
  pending:   { label: 'Pending',  color: '#2980B9', bg: '#EBF5FB' },
};

const COMMISSION_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:     { label: 'Pending',     color: '#F39C12', bg: '#FFF8E1' },
  received:    { label: 'Received',    color: '#2980B9', bg: '#EBF5FB' },
  reconciled:  { label: 'Reconciled', color: '#27AE60', bg: '#F0FDF4' },
};

export function InsuranceAdmin() {
  return (
    <div className="space-y-6">
      {/* Read-only notice */}
      <div className="p-4 rounded-[8px] flex items-center gap-2" style={{ background: '#FFF8E1', border: '1px solid #FDE68A' }}>
        <ShieldCheck size={15} style={{ color: '#F39C12' }} />
        <p style={{ color: '#92400E', fontSize: '0.875rem' }}>
          <strong>Platform admin view.</strong> Read-only. Staff cannot bind policies, modify tenant accounts, or contact carriers on behalf of tenants.
        </p>
      </div>

      {/* Adoption funnel */}
      <div className="rounded-[10px] overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
        <div className="px-5 py-3 border-b" style={{ background: '#F9FAFB', borderColor: '#E5E7EB' }}>
          <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>Insurance adoption funnel</p>
        </div>
        <div className="p-5 space-y-3">
          {ADMIN_FUNNEL.map((stage, i) => (
            <div key={stage.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span style={{ color: '#374151', fontSize: '0.9375rem' }}>{stage.label}</span>
                <div className="flex items-center gap-3">
                  <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>{stage.count.toLocaleString()}</span>
                  <span style={{ color: '#9CA3AF', fontSize: '0.8125rem', width: 40, textAlign: 'right' }}>{stage.pct}%</span>
                </div>
              </div>
              <div className="rounded-full overflow-hidden h-2" style={{ background: '#F3F4F6' }}>
                <div className="h-2 rounded-full" style={{ width: `${stage.pct}%`, background: i === 0 ? '#6B7280' : i < 4 ? '#F39C12' : '#27AE60' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tenant table */}
      <div className="rounded-[10px] overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
        <div className="px-5 py-3 border-b" style={{ background: '#F9FAFB', borderColor: '#E5E7EB' }}>
          <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>Tenant accounts</p>
        </div>
        <div className="grid px-5 py-2.5 text-xs font-semibold" style={{ gridTemplateColumns: '1fr 90px 80px 140px 140px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <span>Tenant</span><span>Status</span><span>Policies</span><span>Annual premium</span><span>Commission (YTD)</span>
        </div>
        <div className="divide-y" style={{ borderColor: '#F3F4F6' }}>
          {ADMIN_TENANTS.map(t => {
            const sc = STATUS_CFG[t.status] ?? STATUS_CFG.pending;
            return (
              <div key={t.id} className="grid px-5 py-3.5 items-center" style={{ gridTemplateColumns: '1fr 90px 80px 140px 140px', background: '#fff' }}>
                <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.9375rem' }}>{t.name}</p>
                <span className="px-2 py-0.5 rounded text-xs font-semibold w-fit" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                <p style={{ fontVariantNumeric: 'tabular-nums', color: '#1A1A1A' }}>{t.policies}</p>
                <p style={{ fontVariantNumeric: 'tabular-nums', fontWeight: t.annual_premium ? 600 : 400, color: t.annual_premium ? '#1A1A1A' : '#9CA3AF' }}>
                  {t.annual_premium ? formatCents(t.annual_premium) : '—'}
                </p>
                <p style={{ fontVariantNumeric: 'tabular-nums', fontWeight: t.commission ? 600 : 400, color: t.commission ? '#1A1A1A' : '#9CA3AF' }}>
                  {t.commission ? formatCents(t.commission) : '—'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Carrier performance */}
      <div className="rounded-[10px] overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
        <div className="px-5 py-3 border-b" style={{ background: '#F9FAFB', borderColor: '#E5E7EB' }}>
          <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>Carrier performance</p>
        </div>
        <div className="grid px-5 py-2.5 text-xs font-semibold" style={{ gridTemplateColumns: '1fr 60px 80px 140px 100px 100px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <span>Carrier</span><span>Rating</span><span>Policies bound</span><span>Avg premium</span><span>Loss ratio</span><span>On-time %</span>
        </div>
        <div className="divide-y" style={{ borderColor: '#F3F4F6' }}>
          {ADMIN_CARRIERS.map(c => (
            <div key={c.name} className="grid px-5 py-3.5 items-center" style={{ gridTemplateColumns: '1fr 60px 80px 140px 100px 100px', background: '#fff' }}>
              <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.9375rem' }}>{c.name}</p>
              <span className="px-1.5 py-0.5 rounded text-xs font-semibold w-fit" style={{ background: '#EBF5FB', color: '#2980B9' }}>AM {c.rating}</span>
              <p style={{ fontVariantNumeric: 'tabular-nums', color: '#1A1A1A' }}>{c.bound}</p>
              <p style={{ fontVariantNumeric: 'tabular-nums', color: '#1A1A1A' }}>{formatCents(c.avg_premium)}</p>
              <p style={{ fontVariantNumeric: 'tabular-nums', color: c.loss_ratio > 0.5 ? '#00A9AC' : '#1A1A1A', fontWeight: 600 }}>{(c.loss_ratio * 100).toFixed(0)}%</p>
              <p style={{ fontVariantNumeric: 'tabular-nums', color: c.on_time_pct >= 97 ? '#27AE60' : '#F39C12', fontWeight: 600 }}>{c.on_time_pct}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Commission reconciliation */}
      <div className="rounded-[10px] overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
        <div className="px-5 py-3 border-b" style={{ background: '#F9FAFB', borderColor: '#E5E7EB' }}>
          <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>Commission reconciliation</p>
        </div>
        <div className="grid px-5 py-2.5 text-xs font-semibold" style={{ gridTemplateColumns: '1fr 100px 120px 120px 120px 100px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <span>Carrier</span><span>Period</span><span>Premium</span><span>Expected</span><span>Received</span><span>Status</span>
        </div>
        <div className="divide-y" style={{ borderColor: '#F3F4F6' }}>
          {MOCK_COMMISSIONS.map(c => {
            const sc = COMMISSION_STATUS[c.status] ?? COMMISSION_STATUS.pending;
            return (
              <div key={c.id} className="grid px-5 py-3.5 items-center" style={{ gridTemplateColumns: '1fr 100px 120px 120px 120px 100px', background: '#fff' }}>
                <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.9375rem' }}>{c.carrier_name}</p>
                <p style={{ fontVariantNumeric: 'tabular-nums', color: '#6B7280' }}>{c.period}</p>
                <p style={{ fontVariantNumeric: 'tabular-nums', color: '#1A1A1A' }}>{formatCents(c.premium)}</p>
                <p style={{ fontVariantNumeric: 'tabular-nums', color: '#1A1A1A' }}>{formatCents(c.expected_amount)}</p>
                <p style={{ fontVariantNumeric: 'tabular-nums', color: c.received_amount > 0 ? '#1A1A1A' : '#9CA3AF', fontWeight: c.received_amount > 0 ? 600 : 400 }}>
                  {c.received_amount > 0 ? formatCents(c.received_amount) : '—'}
                </p>
                <span className="px-2 py-0.5 rounded text-xs font-semibold w-fit" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

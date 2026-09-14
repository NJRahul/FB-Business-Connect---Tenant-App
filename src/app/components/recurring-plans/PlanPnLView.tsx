import { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart2, DollarSign, Users, Wrench, ArrowUpRight } from 'lucide-react';
import { PLAN_PNL, PLAN_ENROLLMENTS } from './mockData';
import type { PlanPnLRow } from './types';

function fmtMoney(n: number) { return `R ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }

function NetBadge({ net }: { net: number }) {
  if (net >= 0) {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: '#DCFCE7', color: '#16A34A' }}>
        <TrendingUp size={11} /> {fmtMoney(net)}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: '#FEF2F2', color: '#DC2626' }}>
      <TrendingDown size={11} /> {fmtMoney(net)}
    </span>
  );
}

function SummaryCard({ label, value, sub, color, icon: Icon }: {
  label: string; value: string; sub: string; color: string; icon: React.ElementType;
}) {
  return (
    <div className="bg-white rounded-[10px] p-4" style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-[6px] flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon size={14} style={{ color }} />
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      </div>
      <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '1.5rem', color }}>{value}</p>
      <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '2px' }}>{sub}</p>
    </div>
  );
}

export function PlanPnLView() {
  const [rows] = useState<PlanPnLRow[]>(PLAN_PNL);

  const totalMRR = rows.reduce((s, r) => s + r.mrr, 0);
  const totalEnrolled = rows.reduce((s, r) => s + r.enrolledCount, 0);
  const totalCost = rows.reduce((s, r) => s + r.costOfServicesUnderEntitlement, 0);
  const totalNet = rows.reduce((s, r) => s + r.netContribution, 0);
  const totalServices = rows.reduce((s, r) => s + r.totalServicesDelivered, 0);

  const annualRevEst = totalMRR * 12;

  return (
    <div>
      <div className="mb-5">
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.125rem' }}>Plan P&L</h2>
        <p style={{ color: '#6B7280', fontSize: '0.8125rem', marginTop: '2px' }}>
          Subscription revenue vs. cost of services delivered under entitlement, per plan and tier.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard label="MRR" value={fmtMoney(totalMRR)} sub={`~${fmtMoney(annualRevEst)} ARR`} color="#C0392B" icon={DollarSign} />
        <SummaryCard label="Active Enrollments" value={String(totalEnrolled)} sub="across all tiers" color="#1D4ED8" icon={Users} />
        <SummaryCard label="Services Under Entitlement" value={String(totalServices)} sub="this period" color="#D97706" icon={Wrench} />
        <SummaryCard label="Net Contribution" value={fmtMoney(totalNet)} sub="revenue − cost" color={totalNet >= 0 ? '#16A34A' : '#DC2626'} icon={BarChart2} />
      </div>

      {/* P&L Table */}
      <div className="bg-white rounded-[10px] overflow-hidden" style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              {['Plan', 'Tier', 'Enrolled', 'MRR', 'Services Delivered', 'Cost (Entitlements)', 'Net Contribution', 'Margin'].map(h => (
                <th key={h} className="px-4 py-3 text-left" style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const totalRevForRow = row.tierPrice ? row.tierPrice * row.enrolledCount : row.mrr * 12;
              const marginPct = totalRevForRow > 0 ? ((row.netContribution / totalRevForRow) * 100) : 0;
              const isPositive = row.netContribution >= 0;

              return (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td className="px-4 py-3">
                    <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.875rem' }}>{row.planName}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: '#F3F4F6', color: '#374151' }}>
                      {row.tierName}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1" style={{ color: '#1A1A1A', fontSize: '0.875rem', fontWeight: 600 }}>
                      <Users size={13} style={{ color: '#9CA3AF' }} />
                      {row.enrolledCount}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p style={{ fontWeight: 700, color: '#C0392B', fontFamily: 'Sora, sans-serif', fontSize: '0.9375rem' }}>
                      {fmtMoney(row.mrr)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p style={{ color: '#374151', fontSize: '0.875rem', fontWeight: 500 }}>{row.totalServicesDelivered}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p style={{ color: '#DC2626', fontSize: '0.875rem', fontWeight: 600 }}>
                      {fmtMoney(row.costOfServicesUnderEntitlement)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <NetBadge net={row.netContribution} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 h-1.5 rounded-full" style={{ background: '#F3F4F6' }}>
                        <div
                          className="h-1.5 rounded-full"
                          style={{ width: `${Math.min(Math.abs(marginPct), 100)}%`, background: isPositive ? '#16A34A' : '#DC2626' }}
                        />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isPositive ? '#16A34A' : '#DC2626' }}>
                        {marginPct.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: '#F9FAFB', borderTop: '2px solid #E5E7EB' }}>
              <td className="px-4 py-3" colSpan={2}>
                <span style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.875rem' }}>Total</span>
              </td>
              <td className="px-4 py-3">
                <span style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.875rem' }}>{totalEnrolled}</span>
              </td>
              <td className="px-4 py-3">
                <span style={{ fontWeight: 800, color: '#C0392B', fontFamily: 'Sora, sans-serif', fontSize: '1rem' }}>{fmtMoney(totalMRR)}</span>
              </td>
              <td className="px-4 py-3">
                <span style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.875rem' }}>{totalServices}</span>
              </td>
              <td className="px-4 py-3">
                <span style={{ fontWeight: 700, color: '#DC2626', fontSize: '0.875rem' }}>{fmtMoney(totalCost)}</span>
              </td>
              <td className="px-4 py-3" colSpan={2}>
                <span style={{ fontWeight: 800, fontSize: '0.9375rem', color: totalNet >= 0 ? '#16A34A' : '#DC2626' }}>
                  {fmtMoney(totalNet)}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Insight callout */}
      <div className="mt-5 p-4 rounded-[10px] flex items-start gap-3" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
        <ArrowUpRight size={18} style={{ color: '#16A34A', marginTop: '1px', flexShrink: 0 }} />
        <div>
          <p style={{ fontWeight: 700, color: '#166534', fontSize: '0.9375rem' }}>Revenue insight</p>
          <p style={{ color: '#16A34A', fontSize: '0.875rem', marginTop: '2px' }}>
            Fleet Maintenance Pack has the highest MRR per enrolled customer at {fmtMoney(299.99)}/mo with a strong net contribution of {fmtMoney(160.06)}/mo. Expanding fleet enrollment would be high-leverage.
          </p>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { AlertTriangle, TrendingUp, MessageSquare, Zap } from 'lucide-react';
import { CURRENT_USAGE, DAILY_SMS_USAGE } from './mockData';
import { PLAN_CONFIGS, SMS_OVERAGE_RATE, type PlanTier } from './types';

interface Props {
  currentPlan: PlanTier;
}

function UsageMeter({ used, included, label }: { used: number; included: number | null; label: string }) {
  if (included === null) {
    return (
      <div style={{ padding: '16px 20px', borderRadius: 10, background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#15803D' }}>{label}</div>
        <div style={{ fontSize: 24, fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#15803D', marginTop: 4 }}>Unlimited</div>
        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{used.toLocaleString()} used this period</div>
      </div>
    );
  }
  const pct = Math.min((used / included) * 100, 100);
  const barColor = pct >= 100 ? '#DC2626' : pct >= 80 ? '#D97706' : '#27AE60';
  const overage = Math.max(0, used - included);
  const overageCost = overage * SMS_OVERAGE_RATE;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{label}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: pct >= 100 ? '#DC2626' : pct >= 80 ? '#D97706' : '#374151' }}>
          {used.toLocaleString()} / {included.toLocaleString()}
          <span style={{ fontWeight: 400, color: '#9CA3AF', marginLeft: 4 }}>({Math.round(pct)}%)</span>
        </div>
      </div>
      <div style={{ height: 10, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ height: '100%', borderRadius: 99, background: barColor, width: `${pct}%`, transition: 'width 0.5s ease' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9CA3AF' }}>
        <span>0</span>
        {pct < 100 && <span style={{ color: '#D97706' }}>⚠ 80% threshold: {Math.round(included * 0.8).toLocaleString()}</span>}
        <span>{included.toLocaleString()}</span>
      </div>
      {overage > 0 && (
        <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 6, background: '#F0FBFB', border: '1px solid #80D4D5', fontSize: 12, color: '#DC2626', fontWeight: 600 }}>
          {overage.toLocaleString()} overage SMS · ${overageCost.toFixed(2)} will be added to next invoice
        </div>
      )}
    </div>
  );
}

function MiniBar({ value, max, date }: { value: number; max: number; date: string }) {
  const h = Math.round((value / max) * 60);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ fontSize: 10, color: '#9CA3AF' }}>{value > 300 ? value : ''}</div>
      <div style={{ width: 18, height: 60, background: '#F3F4F6', borderRadius: 3, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div style={{ height: h, background: '#00A9AC', borderRadius: 3 }} />
      </div>
      <div style={{ fontSize: 9, color: '#9CA3AF', transform: 'rotate(-45deg)', transformOrigin: 'top center', whiteSpace: 'nowrap' }}>
        {new Date(date).getDate()}
      </div>
    </div>
  );
}

export function UsageView({ currentPlan }: Props) {
  const cfg = PLAN_CONFIGS[currentPlan];
  const used = CURRENT_USAGE.quantity;
  const included = cfg.smsInclusion;

  // Project month-end: 14 days elapsed, 30-day month
  const daysElapsed  = 14;
  const daysInPeriod = 30;
  const projected    = Math.round((used / daysElapsed) * daysInPeriod);
  const projectedOverage = included !== null ? Math.max(0, projected - included) : 0;
  const projectedCost    = projectedOverage * SMS_OVERAGE_RATE;

  const pct    = included ? (used / included) * 100 : 0;
  const maxDay = Math.max(...DAILY_SMS_USAGE.map(d => d.quantity));

  const atAlert80  = included !== null && pct >= 80 && pct < 100;
  const atAlert100 = included !== null && pct >= 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Alert banners */}
      {atAlert100 && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px', borderRadius: 8, background: '#F0FBFB', border: '1px solid #80D4D5', color: '#005F62' }}>
          <AlertTriangle size={16} style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>SMS inclusion exhausted</div>
            <div style={{ fontSize: 12, marginTop: 2 }}>You've used all {included?.toLocaleString()} included SMS for this period. Additional messages are charged at ${SMS_OVERAGE_RATE}/SMS. <strong>Upgrade to Pro</strong> for 10× the inclusion.</div>
          </div>
        </div>
      )}
      {atAlert80 && !atAlert100 && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px', borderRadius: 8, background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E' }}>
          <AlertTriangle size={16} style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>Approaching SMS limit — 80%+ used</div>
            <div style={{ fontSize: 12, marginTop: 2 }}>You've used {used.toLocaleString()} of {included?.toLocaleString()} SMS. At current pace you're on track to exceed your inclusion by month-end.</div>
          </div>
        </div>
      )}

      {/* Main usage card */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, background: '#fff', padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <MessageSquare size={16} color="#00A9AC" />
          <span style={{ fontWeight: 700, fontSize: 15, color: '#1A1A1A' }}>SMS Usage — June 2026</span>
        </div>

        <UsageMeter used={used} included={included} label="SMS Messages" />
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'Used this period',  value: used.toLocaleString(),                                       sub: 'of ' + (included?.toLocaleString() ?? 'unlimited'),  color: pct >= 100 ? '#DC2626' : pct >= 80 ? '#D97706' : '#2563EB' },
          { label: 'Days remaining',    value: `${daysInPeriod - daysElapsed}`,                             sub: 'in billing period',                                   color: '#374151' },
          { label: 'Projected month-end',value: projected.toLocaleString(),                                  sub: included ? `${Math.round((projected / included) * 100)}% of inclusion` : 'of unlimited', color: projected > (included ?? Infinity) ? '#DC2626' : '#374151' },
          { label: 'Projected overage', value: projectedOverage > 0 ? `R ${projectedCost.toFixed(2)}` : 'R 0.00', sub: projectedOverage > 0 ? `${projectedOverage.toLocaleString()} extra SMS` : 'No overage expected', color: projectedOverage > 0 ? '#DC2626' : '#15803D' },
        ].map(s => (
          <div key={s.label} style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '14px 18px', background: '#fff' }}>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 22, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Daily usage chart */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, background: '#fff', padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <TrendingUp size={15} color="#6B7280" />
          <span style={{ fontWeight: 700, fontSize: 14, color: '#1A1A1A' }}>Daily SMS Volume</span>
          <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 4 }}>Jun 1–14</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, paddingBottom: 20 }}>
          {DAILY_SMS_USAGE.map(d => (
            <MiniBar key={d.date} value={d.quantity} max={maxDay} date={d.date} />
          ))}
        </div>
      </div>

      {/* Overage pricing info */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, background: '#fff', padding: '18px 22px' }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#1A1A1A', marginBottom: 12 }}>Overage Pricing</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {(['starter', 'pro', 'enterprise'] as PlanTier[]).map(tier => {
            const p = PLAN_CONFIGS[tier];
            const active = tier === currentPlan;
            return (
              <div key={tier} style={{ padding: '14px 16px', borderRadius: 8, border: `1.5px solid ${active ? '#00A9AC' : '#E5E7EB'}`, background: active ? '#E6F7F7' : '#F9FAFB' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: active ? '#00A9AC' : '#374151', marginBottom: 6 }}>
                  {p.name} {active && '← current'}
                </div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>
                  <strong style={{ color: '#1A1A1A' }}>{p.smsInclusion !== null ? p.smsInclusion.toLocaleString() : 'Unlimited'}</strong> SMS/mo included
                </div>
                {p.smsInclusion !== null ? (
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
                    Overage: <strong style={{ color: '#DC2626' }}>${SMS_OVERAGE_RATE}/SMS</strong>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: '#15803D', fontWeight: 600, marginTop: 4 }}>No overage (fair-use)</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upgrade CTA if approaching limit */}
      {pct >= 80 && currentPlan !== 'enterprise' && (
        <div style={{ padding: '16px 20px', borderRadius: 10, background: '#E6F7F7', border: '1.5px solid #00A9AC', display: 'flex', alignItems: 'center', gap: 14 }}>
          <Zap size={20} color="#00A9AC" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#00A9AC' }}>
              {currentPlan === 'starter' ? 'Upgrade to Pro for 10× more SMS' : 'Upgrade to Enterprise for unlimited SMS'}
            </div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3 }}>
              {currentPlan === 'starter'
                ? 'Pro includes 10,000 SMS/mo — 10× your current plan — plus no overage charges up to 10k'
                : 'Enterprise is fair-use unlimited with no per-SMS charges at any volume'
              }
            </div>
          </div>
          <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#00A9AC', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', flexShrink: 0 }}>
            Upgrade Plan
          </button>
        </div>
      )}
    </div>
  );
}

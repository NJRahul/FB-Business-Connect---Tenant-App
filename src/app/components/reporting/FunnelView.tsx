import React, { useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { FUNNEL_STEPS, ABANDONED_CARTS } from './mockData';

function fmtMoney(n: number) {
  return `R ${(n / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function FunnelView() {
  const [recovered, setRecovered] = useState<string[]>([]);
  const [triggering, setTriggering] = useState<string | null>(null);

  function triggerRecovery(id: string) {
    setTriggering(id);
    setTimeout(() => {
      setTriggering(null);
      setRecovered(prev => [...prev, id]);
    }, 800);
  }

  const topCount = FUNNEL_STEPS[0].count;
  const completed = FUNNEL_STEPS[FUNNEL_STEPS.length - 1].count;
  const abandoned = FUNNEL_STEPS.find(s => s.event === 'abandoned')?.count ?? 0;
  const overallCvr = ((completed / topCount) * 100).toFixed(1);
  const cartAbdRate = ((abandoned / (abandoned + completed)) * 100).toFixed(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {[
          { label: 'Catalog Views', value: topCount.toLocaleString(), sub: 'Top of funnel' },
          { label: 'Overall CVR', value: `${overallCvr}%`, sub: `${completed} completed bookings` },
          { label: 'Cart Abandonment', value: `${cartAbdRate}%`, sub: `${abandoned} carts abandoned` },
        ].map(k => (
          <div key={k.label} style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '14px 18px', background: '#fff' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 28, color: '#1A1A1A' }}>{k.value}</div>
            <div style={{ fontSize: 11, color: '#6B7280', marginTop: 3 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Funnel visualization */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', padding: '18px 20px' }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: '#1A1A1A', marginBottom: 18 }}>Booking Funnel</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {FUNNEL_STEPS.map((step, i) => {
            const prevCount = i > 0 ? FUNNEL_STEPS[i - 1].count : step.count;
            const dropPct = i > 0 ? (((prevCount - step.count) / prevCount) * 100).toFixed(1) : null;
            const widthPct = (step.count / topCount) * 100;
            const isAbandoned = step.event === 'abandoned';
            const isCompleted = step.event === 'completed';

            return (
              <div key={step.event}>
                {dropPct && !isAbandoned && !isCompleted && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0', marginLeft: 12 }}>
                    <div style={{ width: 1, height: 12, background: '#E5E7EB' }} />
                    <span style={{ fontSize: 11, color: '#DC2626', fontWeight: 600 }}>↓ {dropPct}% dropped</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 130, fontSize: 12, color: '#374151', textAlign: 'right', flexShrink: 0 }}>{step.label}</div>
                  <div style={{ flex: 1, height: 32, background: '#F3F4F6', borderRadius: 4, position: 'relative' }}>
                    <div style={{
                      height: '100%', borderRadius: 4,
                      background: isAbandoned ? '#DC2626' : isCompleted ? '#15803D' : '#00A9AC',
                      opacity: isAbandoned ? 1 : 0.75 + (widthPct / 100) * 0.25,
                      width: `${widthPct}%`,
                      transition: 'width 0.5s',
                      display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8,
                    }}>
                      {widthPct > 20 && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{step.count.toLocaleString()}</span>
                      )}
                    </div>
                    {widthPct <= 20 && (
                      <span style={{ position: 'absolute', left: `calc(${widthPct}% + 6px)`, top: '50%', transform: 'translateY(-50%)', fontSize: 11, fontWeight: 700, color: '#374151' }}>{step.count.toLocaleString()}</span>
                    )}
                  </div>
                  <div style={{ width: 48, fontSize: 11, color: '#9CA3AF', textAlign: 'right', flexShrink: 0 }}>
                    {((step.count / topCount) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Win / Loss */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ border: '1px solid #D1FAE5', borderRadius: 10, background: '#F0FDF4', padding: '16px 18px' }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#15803D', marginBottom: 12 }}>Win Reasons</div>
          {[
            { reason: 'Competitive price', pct: 38 },
            { reason: 'Same-day availability', pct: 27 },
            { reason: 'Positive reviews', pct: 19 },
            { reason: 'Referral / promo code', pct: 10 },
            { reason: 'Other', pct: 6 },
          ].map(w => (
            <div key={w.reason} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ flex: 1, fontSize: 12, color: '#374151' }}>{w.reason}</div>
              <div style={{ width: 80, height: 6, background: '#D1FAE5', borderRadius: 99 }}>
                <div style={{ height: '100%', borderRadius: 99, background: '#15803D', width: `${w.pct}%` }} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#15803D', minWidth: 28 }}>{w.pct}%</div>
            </div>
          ))}
        </div>
        <div style={{ border: '1px solid #FCA5A5', borderRadius: 10, background: '#FEF2F2', padding: '16px 18px' }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#DC2626', marginBottom: 12 }}>Loss Reasons</div>
          {[
            { reason: 'Price too high', pct: 41 },
            { reason: 'No availability', pct: 24 },
            { reason: 'Chose competitor', pct: 18 },
            { reason: 'Changed mind', pct: 11 },
            { reason: 'Other', pct: 6 },
          ].map(l => (
            <div key={l.reason} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ flex: 1, fontSize: 12, color: '#374151' }}>{l.reason}</div>
              <div style={{ width: 80, height: 6, background: '#FECACA', borderRadius: 99 }}>
                <div style={{ height: '100%', borderRadius: 99, background: '#DC2626', width: `${l.pct}%` }} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', minWidth: 28 }}>{l.pct}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Abandoned carts */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={14} color="#D97706" />
          <div style={{ fontWeight: 700, fontSize: 13, color: '#1A1A1A' }}>Abandoned Carts</div>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#6B7280' }}>
            {ABANDONED_CARTS.filter(c => c.recoveryTriggered || recovered.includes(c.id)).length} / {ABANDONED_CARTS.length} recovery triggered
          </span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              {['Customer', 'Vehicle', 'Service', 'Cart Value', 'Drop Step', 'Age', 'Recovery'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.03em', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ABANDONED_CARTS.map((c, i) => {
              const isRecovered = c.recoveryTriggered || recovered.includes(c.id);
              const isTrig = triggering === c.id;
              return (
                <tr key={c.id} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA', borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>{c.customerName}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: '#6B7280' }}>{c.vehicle}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#374151' }}>{c.service}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>{fmtMoney(c.cartValue)}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: '#FEF2F2', color: '#DC2626' }}>
                      {c.dropStep.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: c.hoursSinceDropOff > 24 ? '#DC2626' : '#D97706' }}>
                    {c.hoursSinceDropOff}h ago
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    {isRecovered ? (
                      <span style={{ fontSize: 12, color: '#15803D', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        ✓ Sent
                      </span>
                    ) : (
                      <button
                        onClick={() => triggerRecovery(c.id)}
                        disabled={isTrig}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: '1px solid #00A9AC', background: '#E6F7F7', color: '#00A9AC', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                      >
                        {isTrig ? <RefreshCw size={11} style={{ animation: 'spin 0.8s linear infinite' }} /> : null}
                        {isTrig ? 'Sending…' : 'Send SMS'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

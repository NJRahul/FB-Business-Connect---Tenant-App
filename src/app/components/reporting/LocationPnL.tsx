import React from 'react';
import { Lock } from 'lucide-react';
import { LOCATION_PNL } from './mockData';

function fmtMoney(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function pct(n: number, d: number) {
  return d > 0 ? `${((n / d) * 100).toFixed(1)}%` : '—';
}

export function LocationPnL() {
  const currentPlan = 'pro';
  const locked = currentPlan === 'starter';

  const consolidated = {
    revenue:     LOCATION_PNL.reduce((s, l) => s + l.revenue, 0),
    cogs:        LOCATION_PNL.reduce((s, l) => s + l.cogs, 0),
    refunds:     LOCATION_PNL.reduce((s, l) => s + l.refunds, 0),
    discounts:   LOCATION_PNL.reduce((s, l) => s + l.discounts, 0),
    laborCost:   LOCATION_PNL.reduce((s, l) => s + l.laborCost, 0),
    grossMargin: LOCATION_PNL.reduce((s, l) => s + l.grossMargin, 0),
  };

  if (locked) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', gap: 16, border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff' }}>
        <Lock size={32} color="#D97706" />
        <div style={{ fontWeight: 700, fontSize: 18, color: '#1A1A1A' }}>Multi-Location P&L — Pro Plan</div>
        <div style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', maxWidth: 400 }}>
          Per-location profit and loss reporting is available on the Pro and Enterprise plans. Upgrade to compare revenue, margins, and costs across all your locations.
        </div>
        <button style={{ padding: '10px 24px', borderRadius: 8, background: '#C0392B', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
          Upgrade to Pro
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Consolidated summary */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', padding: '18px 20px' }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: '#1A1A1A', marginBottom: 14 }}>Consolidated — All Locations (Jun 2026)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[
            { label: 'Total Revenue', value: fmtMoney(consolidated.revenue), color: '#1A1A1A' },
            { label: 'Gross Profit', value: fmtMoney(consolidated.grossMargin), color: '#15803D' },
            { label: 'Gross Margin %', value: pct(consolidated.grossMargin, consolidated.revenue), color: consolidated.grossMargin / consolidated.revenue > 0.4 ? '#15803D' : '#D97706' },
          ].map(k => (
            <div key={k.label} style={{ background: '#F9FAFB', borderRadius: 8, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{k.label}</div>
              <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 24, color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-location table */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', fontWeight: 700, fontSize: 13, color: '#1A1A1A' }}>Per-Location P&L</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              {['Location', 'Revenue', 'COGS', 'Labor Cost', 'Refunds', 'Discounts', 'Gross Profit', 'Margin %'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.03em', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LOCATION_PNL.map((l, i) => {
              const marginPct = l.revenue > 0 ? (l.grossMargin / l.revenue) * 100 : 0;
              const marginColor = marginPct >= 40 ? '#15803D' : marginPct >= 25 ? '#D97706' : '#DC2626';
              return (
                <tr key={l.locationId} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA', borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>{l.name}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: '#374151' }}>{fmtMoney(l.revenue)}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: '#6B7280' }}>{fmtMoney(l.cogs)}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: '#6B7280' }}>{fmtMoney(l.laborCost)}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: '#DC2626' }}>({fmtMoney(l.refunds)})</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: '#D97706' }}>({fmtMoney(l.discounts)})</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: '#15803D' }}>{fmtMoney(l.grossMargin)}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 50, height: 6, background: '#F3F4F6', borderRadius: 99 }}>
                        <div style={{ height: '100%', borderRadius: 99, background: marginColor, width: `${Math.min(marginPct, 100)}%` }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: marginColor }}>{marginPct.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
            {/* Totals row */}
            <tr style={{ background: '#F9FAFB', borderTop: '2px solid #E5E7EB' }}>
              <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>Total</td>
              <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>{fmtMoney(consolidated.revenue)}</td>
              <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: '#6B7280' }}>{fmtMoney(consolidated.cogs)}</td>
              <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: '#6B7280' }}>{fmtMoney(consolidated.laborCost)}</td>
              <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: '#DC2626' }}>({fmtMoney(consolidated.refunds)})</td>
              <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: '#D97706' }}>({fmtMoney(consolidated.discounts)})</td>
              <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: '#15803D' }}>{fmtMoney(consolidated.grossMargin)}</td>
              <td style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#15803D' }}>
                {pct(consolidated.grossMargin, consolidated.revenue)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Cost allocation note */}
      <div style={{ padding: '12px 16px', borderRadius: 8, background: '#F9FAFB', border: '1px solid #E5E7EB', fontSize: 12, color: '#6B7280' }}>
        <span style={{ fontWeight: 600, color: '#374151' }}>Cost Allocation:</span> Labor costs allocated at hourly rate per tech × hours worked per location. Platform fees and Stripe processing fees excluded from location-level P&L. Configure shared cost allocation in Settings → Locations.
      </div>
    </div>
  );
}

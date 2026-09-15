import React, { useState } from 'react';
import { BarChart2, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { REGISTRATION_RATE_ROWS, TECH_REGISTRATION_RATES } from './mockData';
import type { RegistrationRateRow } from './types';

function GaugeArc({ rate }: { rate: number }) {
  const radius = 70;
  const cx = 90;
  const cy = 90;
  const sweepDeg = 180;
  const toRad = (d: number) => (d * Math.PI) / 180;

  const gaugeStart = 180;
  const gaugeEnd = 360;
  const fillEnd = gaugeStart + (rate / 100) * sweepDeg;

  const polar = (angleDeg: number, r: number) => {
    const a = toRad(angleDeg);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  const arcPath = (startDeg: number, endDeg: number, r: number) => {
    const s = polar(startDeg, r);
    const e = polar(endDeg, r);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  const color = rate >= 80 ? '#16A34A' : rate >= 60 ? '#D97706' : '#DC2626';
  const label = rate >= 80 ? 'On Track' : rate >= 60 ? 'Needs Attention' : 'Critical';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={180} height={105}>
        {/* BG arc */}
        <path d={arcPath(180, 360, radius)} fill="none" stroke="#E5E7EB" strokeWidth={18} strokeLinecap="round" />
        {/* Zone colors behind */}
        <path d={arcPath(180, 216, radius)} fill="none" stroke="#FEE2E2" strokeWidth={18} />
        <path d={arcPath(216, 252, radius)} fill="none" stroke="#FEF3C7" strokeWidth={18} />
        <path d={arcPath(252, 360, radius)} fill="none" stroke="#DCFCE7" strokeWidth={18} />
        {/* Fill arc */}
        {rate > 0 && (
          <path d={arcPath(180, Math.min(fillEnd, 360), radius)} fill="none" stroke={color} strokeWidth={18} strokeLinecap="round" />
        )}
        {/* Center text */}
        <text x={cx} y={cy + 8} textAnchor="middle" style={{ fontSize: 22, fontWeight: 800, fill: color, fontFamily: 'Inter, sans-serif' }}>{rate}%</text>
      </svg>
      <div style={{ marginTop: -4, fontSize: 13, fontWeight: 700, color }}>{label}</div>
      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Registration Completion Rate</div>
    </div>
  );
}

function RateBar({ row, max }: { row: RegistrationRateRow; max: number }) {
  const color = row.rate >= 80 ? '#16A34A' : row.rate >= 60 ? '#D97706' : '#DC2626';
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <div style={{ width: 90, fontSize: 12, color: '#374151', fontWeight: 500, flexShrink: 0 }}>{row.dimension}</div>
        <div style={{ flex: 1, background: '#F3F4F6', borderRadius: 99, height: 10, overflow: 'hidden' }}>
          <div style={{ width: `${(row.rate / max) * 100}%`, background: color, height: '100%', borderRadius: 99, transition: 'width 0.3s' }} />
        </div>
        <div style={{ width: 42, fontSize: 12, fontWeight: 700, color, textAlign: 'right' }}>{row.rate}%</div>
        <div style={{ width: 50, fontSize: 11, color: '#9CA3AF', textAlign: 'right' }}>{row.registered}/{row.total}</div>
      </div>
    </div>
  );
}

function FailureBreakdown({ row }: { row: RegistrationRateRow }) {
  const total = row.failureReasons.reduce((a, f) => a + f.count, 0);
  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 9, padding: '12px 14px' }}>
      <div style={{ fontWeight: 600, fontSize: 13, color: '#1A1A1A', marginBottom: 8 }}>{row.dimension} — Failure Reasons</div>
      {row.failureReasons.map(f => (
        <div key={f.reason} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div style={{ flex: 1, fontSize: 12, color: '#374151' }}>{f.reason}</div>
          <div style={{ background: '#F3F4F6', borderRadius: 99, height: 6, width: 80, overflow: 'hidden' }}>
            <div style={{ width: `${(f.count / total) * 100}%`, background: '#DC2626', height: '100%', borderRadius: 99 }} />
          </div>
          <div style={{ fontSize: 11, color: '#6B7280', width: 20, textAlign: 'right' }}>{f.count}</div>
        </div>
      ))}
    </div>
  );
}

export function ReportsView() {
  const [dimension, setDimension] = useState<'manufacturer' | 'tech'>('manufacturer');
  const overall = REGISTRATION_RATE_ROWS[0];
  const byMfr = REGISTRATION_RATE_ROWS.slice(1);
  const maxRate = 100;

  return (
    <div>
      {/* Overall gauge + summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20, marginBottom: 24 }}>
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GaugeArc rate={overall.rate} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignContent: 'start' }}>
          {[
            { label: 'Total Tires Sold (30d)', value: overall.total, color: '#1A1A1A' },
            { label: 'Registered', value: overall.registered, color: '#16A34A' },
            { label: 'Not Registered', value: overall.total - overall.registered, color: '#DC2626' },
            { label: 'Failure Count', value: overall.failureReasons.reduce((a, f) => a + f.count, 0), color: '#D97706' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 9, padding: '14px 16px' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Dimension toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['manufacturer', 'tech'] as const).map(d => (
          <button key={d} onClick={() => setDimension(d)} style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid', borderColor: dimension === d ? '#00A9AC' : '#E5E7EB', background: dimension === d ? '#F0FBFB' : '#fff', color: dimension === d ? '#00A9AC' : '#6B7280', fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
            By {d}
          </button>
        ))}
      </div>

      {dimension === 'manufacturer' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 18px' }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#1A1A1A', marginBottom: 14 }}>Rate by Manufacturer</div>
            {byMfr.map(r => <RateBar key={r.dimension} row={r} max={maxRate} />)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {byMfr.map(r => <FailureBreakdown key={r.dimension} row={r} />)}
          </div>
        </div>
      )}

      {dimension === 'tech' && (
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 18px' }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#1A1A1A', marginBottom: 14 }}>Registration Rate by Technician</div>
          {TECH_REGISTRATION_RATES.map(t => {
            const color = t.rate >= 80 ? '#16A34A' : t.rate >= 60 ? '#D97706' : '#DC2626';
            return (
              <div key={t.techName} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 70, fontSize: 13, color: '#374151', fontWeight: 500 }}>{t.techName}</div>
                <div style={{ flex: 1, background: '#F3F4F6', borderRadius: 99, height: 10, overflow: 'hidden' }}>
                  <div style={{ width: `${t.rate}%`, background: color, height: '100%', borderRadius: 99 }} />
                </div>
                <div style={{ width: 44, fontSize: 13, fontWeight: 700, color, textAlign: 'right' }}>{t.rate}%</div>
                <div>
                  {t.rate >= 80
                    ? <CheckCircle size={14} color="#16A34A" />
                    : <AlertTriangle size={14} color="#D97706" />}
                </div>
              </div>
            );
          })}

          <div style={{ marginTop: 14, padding: '10px 14px', background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: 8, fontSize: 12, color: '#92400E', display: 'flex', gap: 8 }}>
            <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
            Sam T. is at 76.4% — below the 80% target. Consider reviewing consent capture workflow at point of sale.
          </div>
        </div>
      )}

      {/* Insight strip */}
      <div style={{ marginTop: 16, padding: '12px 16px', background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 8, fontSize: 13, color: '#15803D', display: 'flex', gap: 10 }}>
        <TrendingUp size={15} style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <strong>Insight:</strong> Pirelli registrations are the lowest at 63%. The primary gap is customer consent (8 instances). Adding a consent checkbox to the point-of-sale flow for Pirelli SKUs could close the gap significantly.
        </div>
      </div>
    </div>
  );
}

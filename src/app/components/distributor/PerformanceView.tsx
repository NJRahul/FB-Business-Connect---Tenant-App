'use client';
import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Save } from 'lucide-react';
import { PERFORMANCE, TENANT_DISTRIBUTORS, DISTRIBUTORS } from './mockData';
import type { SupplierPerformance } from './types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const W = 96;
  const H = 32;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 4) - 2;
    return `${x},${y}`;
  });

  return (
    <svg width={W} height={H} style={{ overflow: 'visible' }}>
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * W;
        const y = H - ((v - min) / range) * (H - 4) - 2;
        return <circle key={i} cx={x} cy={y} r={3} fill={color} />;
      })}
    </svg>
  );
}

function getTrend(data: number[]): 'up' | 'down' | 'flat' {
  if (data.length < 2) return 'flat';
  const delta = data[data.length - 1] - data[data.length - 2];
  if (delta > 2) return 'up';
  if (delta < -2) return 'down';
  return 'flat';
}

function PerfRow({ perf }: { perf: SupplierPerformance }) {
  const total = perf.onTimeCount + perf.lateCount;
  const pct = total > 0 ? Math.round((perf.onTimeCount / total) * 100) : 0;
  const trend = getTrend(perf.sparkline);
  const color = pct >= 90 ? '#059669' : pct >= 75 ? '#D97706' : '#DC2626';
  const bg = pct >= 90 ? '#D1FAE5' : pct >= 75 ? '#FEF3C7' : '#FEE2E2';
  const border = pct >= 90 ? '#10B981' : pct >= 75 ? '#F59E0B' : '#EF4444';

  return (
    <tr style={{ borderTop: '1px solid #E5E7EB' }}>
      <td style={{ padding: '14px 16px', fontWeight: 600, fontSize: 14, color: '#1A1A1A' }}>{perf.distributorName}</td>
      <td style={{ padding: '14px 16px' }}>
        <span style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 800, color }}>{pct}%</span>
        <span style={{ fontSize: 12, color: '#6B7280', marginLeft: 6 }}>on time</span>
      </td>
      <td style={{ padding: '14px 16px' }}>
        <div style={{ width: 180, height: 8, background: '#E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.4s' }} />
        </div>
      </td>
      <td style={{ padding: '14px 16px' }}>
        <Sparkline data={perf.sparkline} color={color} />
        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          {MONTHS.map((m, i) => (
            <span key={m} style={{ fontSize: 9, color: '#9CA3AF', width: 14, textAlign: 'center' }}>{m}</span>
          ))}
        </div>
      </td>
      <td style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {trend === 'up'   && <TrendingUp size={16} color="#059669" />}
          {trend === 'down' && <TrendingDown size={16} color="#DC2626" />}
          {trend === 'flat' && <Minus size={16} color="#9CA3AF" />}
          <span style={{ fontSize: 13, color: trend === 'up' ? '#059669' : trend === 'down' ? '#DC2626' : '#6B7280', fontWeight: 600 }}>
            {trend === 'up' ? '▲ Improving' : trend === 'down' ? '▼ Declining' : '→ Stable'}
          </span>
        </div>
      </td>
      <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B7280' }}>
        {perf.onTimeCount} / {total}
      </td>
      <td style={{ padding: '14px 16px' }}>
        <span style={{ background: bg, color, border: `1px solid ${border}`, borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>
          {perf.avgDeviationDays === 0 ? '0d avg late' : `+${perf.avgDeviationDays}d avg late`}
        </span>
      </td>
    </tr>
  );
}

function SafetyBufferConfig() {
  const [buffers, setBuffers] = useState<Record<string, number>>(
    Object.fromEntries(TENANT_DISTRIBUTORS.map(td => [td.distributorId, td.safetyBufferDays]))
  );
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 15, color: '#1A1A1A', marginBottom: 2 }}>Safety Buffer Configuration</div>
        <div style={{ fontSize: 13, color: '#6B7280' }}>Days added to each supplier's ETA before a slot becomes bookable. Higher buffer = safer booking, fewer surprises.</div>
      </div>
      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {DISTRIBUTORS.map(dist => {
            const td = TENANT_DISTRIBUTORS.find(t => t.distributorId === dist.id);
            if (!td) return null;
            const val = buffers[dist.id] ?? 1;
            const isZero = val === 0;
            return (
              <div key={dist.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: '#F9FAFB', border: `1px solid ${isZero ? '#80D4D5' : '#E5E7EB'}`, borderRadius: 10 }}>
                <span style={{ fontSize: 20 }}>{dist.logoEmoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#1A1A1A' }}>{dist.name}</div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>{dist.tier === 'A' ? 'Tier A · Live API' : dist.tier === 'B' ? 'Tier B · Catalog Feed' : 'Tier C · Manual'}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="number" min={0} max={14} value={val}
                    onChange={e => setBuffers(prev => ({ ...prev, [dist.id]: Number(e.target.value) }))}
                    style={{ width: 64, border: `1.5px solid ${isZero ? '#EF4444' : '#E5E7EB'}`, borderRadius: 8, padding: '6px 10px', fontSize: 14, outline: 'none', textAlign: 'center' }}
                  />
                  <span style={{ fontSize: 13, color: '#6B7280' }}>day{val !== 1 ? 's' : ''}</span>
                  {isZero && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#FEE2E2', border: '1px solid #80D4D5', borderRadius: 7, padding: '4px 10px' }}>
                      <AlertTriangle size={13} color="#DC2626" />
                      <span style={{ fontSize: 12, color: '#DC2626', fontWeight: 600 }}>0-day buffer — no safety margin</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 16, padding: '12px 16px', background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 10 }}>
          <div style={{ fontSize: 13, color: '#0C4A6E' }}>
            <strong>How buffers work:</strong> If ATD's ETA for a part is June 15 and your buffer is 1 day, the earliest bookable slot is June 16. This accounts for transit variance and inspection time.
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <button onClick={handleSave}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: saved ? '#27AE60' : '#00A9AC', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}>
            <Save size={14} /> {saved ? 'Saved!' : 'Save Buffers'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function PerformanceView() {
  return (
    <div style={{ padding: '20px 0', fontFamily: 'Inter, sans-serif' }}>
      {/* On-time metrics */}
      <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 16, color: '#1A1A1A', marginBottom: 14 }}>On-Time Arrival Metrics</div>
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden', marginBottom: 28 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1A1A1A' }}>
              {['Distributor', 'On-Time %', 'Progress', 'Last 6 Months', 'Trend', 'Deliveries', 'Deviation'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERFORMANCE.map(p => <PerfRow key={p.id} perf={p} />)}
            {PERFORMANCE.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '32px 0', textAlign: 'center', color: '#9CA3AF' }}>No performance data yet. Data accumulates as orders are fulfilled.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Note on empirical tuning */}
      <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '12px 16px', marginBottom: 24 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: '#92400E', marginBottom: 4 }}>Tip: Tune Safety Buffers Based on Actual Performance</div>
        <div style={{ fontSize: 13, color: '#78350F' }}>
          TireHub is averaging +1.2 days late. Consider increasing their buffer from 1 day to 2 days to avoid scheduling conflicts. NTW shows 67% on-time — you may want to increase their buffer as well.
        </div>
      </div>

      {/* Safety buffer config */}
      <SafetyBufferConfig />
    </div>
  );
}

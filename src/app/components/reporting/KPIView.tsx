import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { KPI_METRICS } from './mockData';

function Sparkline13({ values, color, goodDir }: { values: number[]; color: string; goodDir: 'up' | 'down' }) {
  const w = 120, h = 36;
  if (values.length < 2) return null;
  const mn = Math.min(...values), mx = Math.max(...values), rng = mx - mn || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - mn) / rng) * (h - 6) - 3}`).join(' ');
  const fill = `0,${h} ${pts} ${w},${h}`;
  return (
    <svg width={w} height={h} style={{ display: 'block' }} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polygon points={fill} fill={color} fillOpacity="0.12" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function BenchmarkBar({ current, benchmark, goodDir, unit }: { current: number; benchmark?: number; goodDir: 'up' | 'down'; unit: string }) {
  if (!benchmark) return null;
  const isGood = goodDir === 'up' ? current >= benchmark : current <= benchmark;
  const pct = Math.min((current / benchmark) * 100, 130);
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ height: 6, background: '#F3F4F6', borderRadius: 99, position: 'relative', overflow: 'visible' }}>
        <div style={{ height: '100%', borderRadius: 99, background: isGood ? '#15803D' : '#D97706', width: `${Math.min(pct, 100)}%`, transition: 'width 0.5s' }} />
        <div style={{ position: 'absolute', top: -3, left: '100%', width: 2, height: 12, background: '#6B7280', borderRadius: 1, transform: 'translateX(-50%)' }} title={`Benchmark: ${benchmark}${unit}`} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 10, color: '#9CA3AF' }}>0</span>
        <span style={{ fontSize: 10, color: '#6B7280' }}>Benchmark: {benchmark}{unit}</span>
      </div>
    </div>
  );
}

export function KPIView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ fontSize: 13, color: '#6B7280', padding: '12px 16px', background: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB' }}>
        Operational KPIs updated weekly. Benchmark lines show industry targets for mobile auto service.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {KPI_METRICS.map(k => {
          const last = k.history13w[k.history13w.length - 1];
          const prev = k.history13w[k.history13w.length - 2] ?? last;
          const delta = last - prev;
          const deltaGood = k.goodDirection === 'up' ? delta >= 0 : delta <= 0;
          const absBeat = k.benchmark != null ? (k.goodDirection === 'up' ? k.current >= k.benchmark : k.current <= k.benchmark) : null;

          let statusColor = '#6B7280';
          if (absBeat === true) statusColor = '#15803D';
          else if (absBeat === false) statusColor = '#D97706';

          const TrendIcon = delta === 0 ? Minus : delta > 0 ? TrendingUp : TrendingDown;
          const trendColor = deltaGood ? '#15803D' : '#D97706';

          return (
            <div key={k.key} style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k.label}</div>
                {absBeat !== null && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: statusColor, background: statusColor + '18', padding: '2px 7px', borderRadius: 99 }}>
                    {absBeat ? '✓ On target' : '! Off target'}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
                <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 30, color: statusColor !== '#6B7280' ? statusColor : '#1A1A1A' }}>
                  {k.current}{k.unit}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 600, color: trendColor }}>
                  <TrendIcon size={13} />
                  {Math.abs(delta).toFixed(1)}{k.unit}
                </div>
              </div>

              {k.benchmark != null && (
                <BenchmarkBar current={k.current} benchmark={k.benchmark} goodDir={k.goodDirection} unit={k.unit} />
              )}

              <div style={{ marginTop: 14 }}>
                <Sparkline13 values={k.history13w} color={statusColor !== '#6B7280' ? statusColor : '#00A9AC'} goodDir={k.goodDirection} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 10, color: '#9CA3AF' }}>13 weeks ago</span>
                  <span style={{ fontSize: 10, color: '#9CA3AF' }}>Now</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', padding: '10px 14px', background: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB' }}>
        {[
          { dot: '#15803D', label: 'On or above target' },
          { dot: '#D97706', label: 'Below target' },
          { dot: '#6B7280', label: 'No benchmark set' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6B7280' }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: l.dot }} />
            {l.label}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6B7280' }}>
          <div style={{ width: 2, height: 12, background: '#6B7280', borderRadius: 1 }} />
          Dashed line = benchmark
        </div>
      </div>
    </div>
  );
}

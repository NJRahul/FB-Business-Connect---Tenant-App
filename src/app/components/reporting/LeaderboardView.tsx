import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Star, RefreshCw, Maximize2, X } from 'lucide-react';
import { TECH_STATS } from './mockData';

function fmtMoney(cents: number) {
  return `R ${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function RankChange({ delta }: { delta: number }) {
  if (delta === 0) return <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 11, color: '#9CA3AF' }}><Minus size={11} /> –</span>;
  if (delta > 0)  return <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 11, color: '#15803D', fontWeight: 700 }}><TrendingUp size={11} /> +{delta}</span>;
  return <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 11, color: '#DC2626', fontWeight: 700 }}><TrendingDown size={11} /> {delta}</span>;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={11} fill={i <= Math.round(rating) ? '#D97706' : 'none'} color={i <= Math.round(rating) ? '#D97706' : '#D1D5DB'} />
      ))}
      <span style={{ fontSize: 11, color: '#6B7280', marginLeft: 3 }}>{rating.toFixed(1)}</span>
    </span>
  );
}

const SORTED = [...TECH_STATS].sort((a, b) => b.revenue - a.revenue);

function WallDisplay({ onClose }: { onClose: () => void }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0F0F0F', zIndex: 9999, display: 'flex', flexDirection: 'column', padding: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
        <div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 32, color: '#fff' }}>Technician Leaderboard</div>
          <div style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>Jun 2026 · Auto-refreshes every 30s</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
          <X size={24} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, flex: 1 }}>
        {SORTED.map((t, rank) => {
          const medalColors = ['#F59E0B', '#9CA3AF', '#B45309', '#6B7280'];
          const mc = medalColors[rank] ?? '#6B7280';
          return (
            <div key={t.techId} style={{ background: '#1A1A1A', borderRadius: 16, padding: '32px 28px', border: rank === 0 ? '2px solid #F59E0B' : '1px solid #2A2A2A', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <div style={{ position: 'absolute', top: 16, left: 16, fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 18, color: mc }}>#{rank + 1}</div>
              <div style={{ position: 'absolute', top: 16, right: 16 }}>
                <RankChange delta={t.rankChange} />
              </div>

              <div style={{ width: 64, height: 64, borderRadius: 99, background: '#2A2A2A', border: `3px solid ${mc}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 22, color: mc }}>
                {t.initials}
              </div>

              <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 18, color: '#fff', textAlign: 'center' }}>{t.name}</div>

              <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 40, color: '#fff', textAlign: 'center' }}>
                {fmtMoney(t.revenue * 100)}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                {[
                  { label: 'Jobs', value: t.visitsCompleted },
                  { label: 'Rating', value: t.avgRating.toFixed(1) + ' ★' },
                  { label: 'On-Time', value: `${Math.round(t.onTimeRate * 100)}%` },
                  { label: 'Utilization', value: `${Math.round(t.utilization * 100)}%` },
                ].map(m => (
                  <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2A2A2A', paddingTop: 6 }}>
                    <span style={{ fontSize: 12, color: '#6B7280' }}>{m.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28, fontSize: 12, color: '#374151', gap: 6, alignItems: 'center' }}>
        <RefreshCw size={11} />
        Live · updates every 30s
      </div>
    </div>
  );
}

export function LeaderboardView() {
  const [wallOpen, setWallOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {wallOpen && <WallDisplay onClose={() => setWallOpen(false)} />}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 13, color: '#6B7280' }}>Jun 2026 performance · ranked by revenue</div>
        <button
          onClick={() => setWallOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#1A1A1A', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
        >
          <Maximize2 size={13} />
          Wall Display
        </button>
      </div>

      {/* Podium cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {SORTED.map((t, rank) => {
          const medals = ['🥇', '🥈', '🥉', ''];
          const borderColors = ['#F59E0B', '#9CA3AF', '#B45309', '#E5E7EB'];
          return (
            <div key={t.techId} style={{ border: `2px solid ${borderColors[rank]}`, borderRadius: 10, background: '#fff', padding: '18px 18px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{medals[rank] || `#${rank + 1}`}</div>
              <div style={{ width: 44, height: 44, borderRadius: 99, background: '#E6F7F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 16, color: '#00A9AC', margin: '0 auto 10px' }}>
                {t.initials}
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1A1A1A', marginBottom: 2 }}>{t.name}</div>
              <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 22, color: '#00A9AC' }}>{fmtMoney(t.revenue * 100)}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{t.visitsCompleted} jobs completed</div>
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center' }}>
                <Stars rating={t.avgRating} />
              </div>
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center' }}>
                <RankChange delta={t.rankChange} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Full leaderboard table */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', fontWeight: 700, fontSize: 13, color: '#1A1A1A' }}>Full Leaderboard</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              {['Rank', 'Technician', 'Revenue', 'Labor Rev', 'Jobs', 'Avg Rating', 'On-Time %', 'Follow-Up CVR', 'Utilization', 'Trend'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.03em', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SORTED.map((t, rank) => {
              const util = Math.round(t.utilization * 100);
              return (
                <tr key={t.techId} style={{ background: rank % 2 === 0 ? '#fff' : '#FAFAFA', borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '12px 14px', fontSize: 16, fontWeight: 700, color: rank === 0 ? '#F59E0B' : rank === 1 ? '#9CA3AF' : rank === 2 ? '#B45309' : '#6B7280' }}>
                    #{rank + 1}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 99, background: '#E6F7F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#00A9AC' }}>{t.initials}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>{t.name}</div>
                        <RankChange delta={t.rankChange} />
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>{fmtMoney(t.revenue * 100)}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: '#2563EB' }}>{fmtMoney(t.laborRevenue * 100)}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: '#374151' }}>{t.visitsCompleted}</td>
                  <td style={{ padding: '12px 14px' }}><Stars rating={t.avgRating} /></td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: t.onTimeRate >= 0.9 ? '#15803D' : t.onTimeRate >= 0.8 ? '#D97706' : '#DC2626' }}>
                    {Math.round(t.onTimeRate * 100)}%
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: '#374151' }}>{Math.round(t.followUpConvRate * 100)}%</td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 50, height: 6, background: '#F3F4F6', borderRadius: 99 }}>
                        <div style={{ height: '100%', borderRadius: 99, background: util >= 85 ? '#15803D' : util >= 70 ? '#D97706' : '#DC2626', width: `${util}%` }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{util}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: 11, color: rank === 0 ? '#15803D' : '#9CA3AF' }}>
                      {rank === 0 ? '🔥 Top performer' : ''}
                    </span>
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

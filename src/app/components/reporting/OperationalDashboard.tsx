import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Clock, TrendingUp, Users, Package, CheckCircle, XCircle } from 'lucide-react';
import { DAILY_REVENUE, TECH_STATS, AT_RISK_VISITS, LIVE_VISITS } from './mockData';

function fmtMoney(cents: number) {
  return `R ${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Sparkline({ values, color = '#C0392B', h = 40 }: { values: number[]; color?: string; h?: number }) {
  const w = 100;
  if (values.length < 2) return null;
  const mn = Math.min(...values), mx = Math.max(...values), rng = mx - mn || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - mn) / rng) * (h - 2) - 1}`).join(' ');
  const fill = `0,${h} ${pts} ${w},${h}`;
  return (
    <svg width={w} height={h} style={{ display: 'block' }} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polygon points={fill} fill={color} fillOpacity="0.12" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// Simulated today's visits by state
const TODAY_VISITS = [
  { state: 'completed',   label: 'Completed',   count: 14, color: '#15803D', bg: '#F0FDF4' },
  { state: 'in_progress', label: 'In Progress', count: 3,  color: '#2563EB', bg: '#EFF6FF' },
  { state: 'en_route',    label: 'En Route',    count: 2,  color: '#7E22CE', bg: '#FDF4FF' },
  { state: 'scheduled',   label: 'Scheduled',   count: 8,  color: '#D97706', bg: '#FEF3C7' },
  { state: 'no_show',     label: 'No Show',     count: 1,  color: '#DC2626', bg: '#FEF2F2' },
];

const STATE_ICONS: Record<string, React.ElementType> = {
  completed: CheckCircle, in_progress: Clock, en_route: TrendingUp, scheduled: Clock, no_show: XCircle,
};

export function OperationalDashboard() {
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [ticking, setTicking] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setLastRefresh(new Date());
      setTicking(true);
      setTimeout(() => setTicking(false), 500);
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  function manualRefresh() {
    setTicking(true);
    setTimeout(() => { setLastRefresh(new Date()); setTicking(false); }, 400);
  }

  const last7 = DAILY_REVENUE.slice(-7);
  const rev7d  = last7.reduce((s, d) => s + d.gross, 0);
  const rev7dValues = last7.map(d => d.gross / 100);

  const prev7 = DAILY_REVENUE.slice(-14, -7);
  const prevRev = prev7.reduce((s, d) => s + d.gross, 0);
  const revTrend = prevRev > 0 ? ((rev7d - prevRev) / prevRev) * 100 : 0;

  const totalToday = TODAY_VISITS.reduce((s, v) => s + v.count, 0);
  const techUtil   = Math.round(TECH_STATS.reduce((s, t) => s + t.utilization, 0) / TECH_STATS.length * 100);
  const partsPending = 2; // from AT_RISK_VISITS
  const weekBookings = 47;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Refresh header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 20, color: '#1A1A1A' }}>Live Operations — Jun 14, 2026</div>
          <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Clock size={11} />
            Last refreshed {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} · auto-refreshes every 60s
          </div>
        </div>
        <button
          onClick={manualRefresh}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', color: '#374151', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}
        >
          <RefreshCw size={13} style={{ animation: ticking ? 'spin 0.4s linear' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* At-risk alert */}
      {AT_RISK_VISITS.length > 0 && (
        <div style={{ padding: '12px 16px', borderRadius: 8, background: '#FFFBEB', border: '1px solid #FDE68A' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <AlertTriangle size={14} color="#D97706" />
            <span style={{ fontWeight: 700, fontSize: 13, color: '#92400E' }}>
              {AT_RISK_VISITS.length} at-risk visit{AT_RISK_VISITS.length > 1 ? 's' : ''} — parts may not arrive in time
            </span>
          </div>
          {AT_RISK_VISITS.map(r => (
            <div key={r.visitId} style={{ fontSize: 12, color: '#92400E', paddingLeft: 22, marginTop: 4 }}>
              <strong>{r.customerName}</strong> · {r.service} · {r.scheduledFor} — {r.riskReason} (<em>{r.partName}</em> ETA {r.partEta})
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr) repeat(2, 1fr)', gap: 16 }}>
        {/* Today's visits */}
        <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', padding: '16px 18px', gridColumn: 'span 2' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>Today's Visits ({totalToday} total)</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {TODAY_VISITS.map(v => {
              const Icon = STATE_ICONS[v.state];
              return (
                <div key={v.state} style={{ flex: 1, minWidth: 80, padding: '12px 14px', borderRadius: 8, background: v.bg, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Icon size={13} color={v.color} />
                    <span style={{ fontSize: 11, color: v.color, fontWeight: 600 }}>{v.label}</span>
                  </div>
                  <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 28, color: v.color }}>{v.count}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue 7d */}
        <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', padding: '16px 18px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Revenue — Last 7 Days</div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 26, color: '#1A1A1A' }}>{fmtMoney(rev7d)}</div>
          <div style={{ fontSize: 12, color: revTrend >= 0 ? '#15803D' : '#DC2626', marginTop: 4 }}>
            {revTrend >= 0 ? '▲' : '▼'} {Math.abs(revTrend).toFixed(1)}% vs prior 7 days
          </div>
          <div style={{ marginTop: 10 }}>
            <Sparkline values={rev7dValues} />
          </div>
        </div>

        {/* Week bookings */}
        <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', padding: '16px 18px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>This Week's Bookings</div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 38, color: '#C0392B' }}>{weekBookings}</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>Mon–Sun · 8 remaining today</div>
        </div>

        {/* Tech utilization */}
        <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', padding: '16px 18px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Avg Tech Utilization</div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 38, color: techUtil >= 85 ? '#15803D' : techUtil >= 70 ? '#D97706' : '#DC2626' }}>{techUtil}%</div>
          <div style={{ marginTop: 8, height: 6, background: '#F3F4F6', borderRadius: 99 }}>
            <div style={{ height: '100%', borderRadius: 99, background: techUtil >= 85 ? '#15803D' : techUtil >= 70 ? '#D97706' : '#DC2626', width: `${techUtil}%` }} />
          </div>
        </div>

        {/* Parts pending */}
        <div style={{ border: `1px solid ${partsPending > 0 ? '#FDE68A' : '#E5E7EB'}`, borderRadius: 10, background: partsPending > 0 ? '#FFFBEB' : '#fff', padding: '16px 18px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Parts Pending</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Package size={20} color={partsPending > 0 ? '#D97706' : '#9CA3AF'} />
            <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 38, color: partsPending > 0 ? '#D97706' : '#374151' }}>{partsPending}</span>
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>visits waiting on parts</div>
        </div>
      </div>

      {/* Live visits */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
        <div style={{ padding: '12px 18px', borderBottom: '1px solid #F3F4F6', fontWeight: 700, fontSize: 14, color: '#1A1A1A', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: '#15803D', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          Live Visits ({LIVE_VISITS.length} active)
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              {['Customer', 'Tech', 'Service', 'Vehicle', 'State', 'Revenue', 'Duration'].map(h => (
                <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', borderBottom: '1px solid #E5E7EB', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LIVE_VISITS.map((v, i) => {
              const stateColors: Record<string, { color: string; bg: string }> = {
                in_progress: { color: '#2563EB', bg: '#EFF6FF' },
                on_site:     { color: '#7E22CE', bg: '#FDF4FF' },
                en_route:    { color: '#D97706', bg: '#FEF3C7' },
              };
              const sc = stateColors[v.state];
              const elapsedMin = Math.round((Date.now() - new Date(v.startedAt).getTime()) / 60000);
              return (
                <tr key={v.id} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                  <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>{v.customerName}</td>
                  <td style={{ padding: '11px 16px', fontSize: 13, color: '#6B7280' }}>{v.techName}</td>
                  <td style={{ padding: '11px 16px', fontSize: 13, color: '#374151' }}>{v.service}</td>
                  <td style={{ padding: '11px 16px', fontSize: 12, color: '#9CA3AF' }}>{v.vehicle}</td>
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.color }}>
                      {v.state.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 600, color: '#374151' }}>{fmtMoney(v.revenue)}</td>
                  <td style={{ padding: '11px 16px', fontSize: 12, color: '#9CA3AF' }}>
                    {elapsedMin}m ago
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Tech utilization breakdown */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', padding: '16px 20px' }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: '#1A1A1A', marginBottom: 14 }}>Technician Utilization Today</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {TECH_STATS.map(t => (
            <div key={t.techId} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 30, height: 30, borderRadius: 99, background: '#FDEDEC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#C0392B', flexShrink: 0 }}>{t.initials}</div>
              <div style={{ width: 100, fontSize: 12, fontWeight: 500, color: '#374151', flexShrink: 0 }}>{t.name.split(' ')[0]}</div>
              <div style={{ flex: 1, height: 8, background: '#F3F4F6', borderRadius: 99 }}>
                <div style={{ height: '100%', borderRadius: 99, background: t.utilization >= 0.85 ? '#15803D' : t.utilization >= 0.7 ? '#D97706' : '#DC2626', width: `${t.utilization * 100}%`, transition: 'width 0.5s' }} />
              </div>
              <div style={{ width: 36, textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#374151' }}>{Math.round(t.utilization * 100)}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

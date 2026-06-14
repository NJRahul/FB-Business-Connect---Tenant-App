import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Lock } from 'lucide-react';
import { CONNECTOR_HEALTH, API_METRICS } from './mockData';

function StatusDot({ status }: { status: 'healthy' | 'degraded' | 'down' }) {
  const MAP = {
    healthy:  { color: '#15803D', bg: '#F0FDF4', label: 'Healthy',  icon: CheckCircle },
    degraded: { color: '#D97706', bg: '#FFFBEB', label: 'Degraded', icon: AlertTriangle },
    down:     { color: '#DC2626', bg: '#FEF2F2', label: 'Down',     icon: XCircle },
  };
  const m = MAP[status];
  const Icon = m.icon;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: m.bg, color: m.color }}>
      <Icon size={11} />
      {m.label}
    </span>
  );
}

function BarChart({ data, color = '#C0392B', h = 80 }: { data: number[]; color?: string; h?: number }) {
  const mx = Math.max(...data) || 1;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: h }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, height: `${(v / mx) * (h - 10)}px`, background: color, borderRadius: 2, opacity: 0.8 }} />
      ))}
    </div>
  );
}

function ErrorRateChart({ data, h = 80 }: { data: { requests: number; errors: number }[]; h?: number }) {
  const maxReq = Math.max(...data.map(d => d.requests)) || 1;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: h }}>
      {data.map((d, i) => {
        const barH = Math.max(4, (d.requests / maxReq) * (h - 10));
        const errH = d.requests > 0 ? (d.errors / d.requests) * barH : 0;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-end', height: h }}>
            <div style={{ flex: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: barH }}>
              <div style={{ height: errH, background: '#DC2626', borderRadius: '2px 2px 0 0' }} />
              <div style={{ height: barH - errH, background: '#C0392B', borderRadius: 2, opacity: 0.7 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ObservabilityView() {
  const currentPlan = 'pro';
  const locked = currentPlan === 'starter';

  const degradedCount = CONNECTOR_HEALTH.filter(c => c.status === 'degraded').length;
  const downCount = CONNECTOR_HEALTH.filter(c => c.status === 'down').length;

  const totalReqs = API_METRICS.reduce((s, m) => s + m.requests, 0);
  const totalErrs = API_METRICS.reduce((s, m) => s + m.errors, 0);
  const avgP95   = Math.round(API_METRICS.reduce((s, m) => s + m.p95ms, 0) / API_METRICS.length);

  if (locked) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', gap: 16, border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff' }}>
        <Lock size={32} color="#7C3AED" />
        <div style={{ fontWeight: 700, fontSize: 18, color: '#1A1A1A' }}>Platform Observability — Pro Plan</div>
        <div style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', maxWidth: 420 }}>
          API metrics, connector health, uptime tracking, and error rate charts are available on Pro and Enterprise plans.
        </div>
        <button style={{ padding: '10px 24px', borderRadius: 8, background: '#C0392B', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
          Upgrade to Pro
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Alerts */}
      {(degradedCount > 0 || downCount > 0) && (
        <div style={{ padding: '12px 16px', borderRadius: 8, background: degradedCount > 0 ? '#FFFBEB' : '#FEF2F2', border: `1px solid ${degradedCount > 0 ? '#FDE68A' : '#FCA5A5'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={14} color={degradedCount > 0 ? '#D97706' : '#DC2626'} />
            <span style={{ fontSize: 13, fontWeight: 700, color: degradedCount > 0 ? '#92400E' : '#991B1B' }}>
              {downCount > 0 ? `${downCount} connector down` : `${degradedCount} connector degraded`} — check connector health below
            </span>
          </div>
        </div>
      )}

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: 'API Requests (24h)', value: totalReqs.toLocaleString(), sub: 'across all endpoints', color: '#1A1A1A' },
          { label: 'Error Rate', value: `${((totalErrs / totalReqs) * 100).toFixed(2)}%`, sub: `${totalErrs} errors`, color: totalErrs > totalReqs * 0.01 ? '#DC2626' : '#15803D' },
          { label: 'Avg P95 Latency', value: `${avgP95}ms`, sub: 'across all endpoints', color: avgP95 > 500 ? '#DC2626' : avgP95 > 200 ? '#D97706' : '#15803D' },
          { label: 'Connectors Healthy', value: `${CONNECTOR_HEALTH.filter(c => c.status === 'healthy').length} / ${CONNECTOR_HEALTH.length}`, sub: `${degradedCount} degraded · ${downCount} down`, color: downCount > 0 ? '#DC2626' : degradedCount > 0 ? '#D97706' : '#15803D' },
        ].map(k => (
          <div key={k.label} style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '14px 18px', background: '#fff' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 24, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 11, color: '#6B7280', marginTop: 3 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* API metrics chart */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', padding: '18px 20px' }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: '#1A1A1A', marginBottom: 6 }}>API Request Volume & Error Rate (24h)</div>
        <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 16, display: 'flex', gap: 16 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: '#C0392B', opacity: 0.7, display: 'inline-block' }} /> Requests</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: '#DC2626', display: 'inline-block' }} /> Errors</span>
        </div>
        <ErrorRateChart data={API_METRICS} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          {API_METRICS.filter((_, i) => i % 4 === 0 || i === API_METRICS.length - 1).map(m => (
            <span key={m.hour} style={{ fontSize: 10, color: '#9CA3AF' }}>{m.hour}</span>
          ))}
        </div>
      </div>

      {/* Connector health */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', fontWeight: 700, fontSize: 13, color: '#1A1A1A' }}>Connector Health</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              {['Connector', 'Status', 'Uptime (30d)', 'P50', 'P95', 'P99', 'Last Checked'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.03em', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CONNECTOR_HEALTH.map((c, i) => (
              <tr key={c.name} style={{ background: c.status === 'degraded' ? '#FFFDF5' : c.status === 'down' ? '#FFF5F5' : i % 2 === 0 ? '#fff' : '#FAFAFA', borderBottom: '1px solid #F3F4F6' }}>
                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>{c.name}</td>
                <td style={{ padding: '12px 16px' }}><StatusDot status={c.status} /></td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: c.uptimePct >= 99.9 ? '#15803D' : c.uptimePct >= 99 ? '#D97706' : '#DC2626', fontWeight: 600 }}>
                  {c.uptimePct.toFixed(2)}%
                </td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: '#6B7280' }}>{c.p50ms}ms</td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: c.p95ms > 500 ? '#D97706' : '#6B7280' }}>{c.p95ms}ms</td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: c.p99ms > 1000 ? '#DC2626' : '#6B7280' }}>{c.p99ms}ms</td>
                <td style={{ padding: '12px 16px', fontSize: 11, color: '#9CA3AF' }}>{c.lastChecked}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* P95 latency bar chart */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', padding: '18px 20px' }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: '#1A1A1A', marginBottom: 14 }}>P95 API Latency (24h)</div>
        <BarChart data={API_METRICS.map(m => m.p95ms)} color="#7E22CE" />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          {API_METRICS.filter((_, i) => i % 4 === 0 || i === API_METRICS.length - 1).map(m => (
            <span key={m.hour} style={{ fontSize: 10, color: '#9CA3AF' }}>{m.hour}</span>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10, fontSize: 11, color: '#9CA3AF' }}>
          <div style={{ width: 24, borderTop: '2px dashed #DC2626' }} />
          SLA target: 300ms
        </div>
      </div>
    </div>
  );
}

'use client';
import React, { useState } from 'react';
import { RefreshCw, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { API_LOGS, DISTRIBUTORS } from './mockData';
import type { DistributorApiLog } from './types';

function LatencyBadge({ ms }: { ms: number }) {
  const color = ms < 200 ? '#059669' : ms < 1000 ? '#D97706' : '#DC2626';
  const bg = ms < 200 ? '#D1FAE5' : ms < 1000 ? '#FEF3C7' : '#FEE2E2';
  const border = ms < 200 ? '#10B981' : ms < 1000 ? '#F59E0B' : '#EF4444';
  return (
    <span style={{ background: bg, color, border: `1px solid ${border}`, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700, fontFamily: 'monospace' }}>
      {ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`}
    </span>
  );
}

function StatusBadge({ code }: { code: number }) {
  const is2xx = code >= 200 && code < 300;
  const is4xx = code >= 400 && code < 500;
  const color = is2xx ? '#059669' : is4xx ? '#D97706' : '#DC2626';
  const bg = is2xx ? '#D1FAE5' : is4xx ? '#FEF3C7' : '#FEE2E2';
  const border = is2xx ? '#10B981' : is4xx ? '#F59E0B' : '#EF4444';
  return (
    <span style={{ background: bg, color, border: `1px solid ${border}`, borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>
      {code}
    </span>
  );
}

function MethodBadge({ method }: { method: DistributorApiLog['method'] }) {
  const colors: Record<string, { bg: string; color: string }> = {
    GET:   { bg: '#EFF6FF', color: '#1D4ED8' },
    POST:  { bg: '#F0FDF4', color: '#15803D' },
    PUT:   { bg: '#FDF4FF', color: '#7E22CE' },
    PATCH: { bg: '#FFF7ED', color: '#C2410C' },
  };
  const c = colors[method] ?? { bg: '#F3F4F6', color: '#4B5563' };
  return (
    <span style={{ background: c.bg, color: c.color, borderRadius: 5, padding: '1px 7px', fontSize: 11, fontWeight: 700, fontFamily: 'monospace' }}>{method}</span>
  );
}

function LogRow({ log, expanded, onToggle }: { log: DistributorApiLog; expanded: boolean; onToggle: () => void }) {
  const time = new Date(log.createdAt);
  return (
    <>
      <tr
        onClick={onToggle}
        style={{ borderTop: '1px solid #E5E7EB', cursor: 'pointer', background: log.responseStatus >= 500 ? '#FFF7F7' : log.responseStatus >= 400 ? '#FFFBF0' : 'transparent' }}
        onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
        onMouseLeave={e => (e.currentTarget.style.background = log.responseStatus >= 500 ? '#FFF7F7' : log.responseStatus >= 400 ? '#FFFBF0' : 'transparent')}
      >
        <td style={{ padding: '10px 12px', fontSize: 12, color: '#6B7280', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </td>
        <td style={{ padding: '10px 12px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{log.distributorName}</div>
        </td>
        <td style={{ padding: '10px 12px' }}><MethodBadge method={log.method} /></td>
        <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 12, color: '#1A1A1A' }}>{log.endpoint}</td>
        <td style={{ padding: '10px 12px' }}><StatusBadge code={log.responseStatus} /></td>
        <td style={{ padding: '10px 12px' }}><LatencyBadge ms={log.latencyMs} /></td>
        <td style={{ padding: '10px 12px', color: '#9CA3AF' }}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </td>
      </tr>
      {expanded && (
        <tr style={{ background: '#1A1A1A' }}>
          <td colSpan={7} style={{ padding: '12px 16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Request</div>
                <pre style={{ color: '#E5E7EB', fontSize: 12, fontFamily: 'monospace', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {log.method} {log.endpoint}{'\n'}
                  {log.requestSummary}
                  {log.idempotencyKey && `\n\nX-Idempotency-Key: ${log.idempotencyKey}`}
                </pre>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Response</div>
                <pre style={{ color: log.error ? '#FCA5A5' : '#86EFAC', fontSize: 12, fontFamily: 'monospace', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  HTTP {log.responseStatus}{'\n'}
                  Latency: {log.latencyMs}ms{'\n'}
                  {log.error ? `\nError: ${log.error}` : '\nStatus: OK'}
                </pre>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function ApiLogsView() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterDist, setFilterDist] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'error'>('all');
  const [limit, setLimit] = useState(50);

  const filtered = API_LOGS.filter(l => {
    if (filterDist !== 'all' && l.distributorId !== filterDist) return false;
    if (filterStatus === 'success' && l.responseStatus >= 400) return false;
    if (filterStatus === 'error' && l.responseStatus < 400) return false;
    return true;
  }).slice(0, limit);

  const errorCount = API_LOGS.filter(l => l.responseStatus >= 400).length;
  const avgLatency = Math.round(API_LOGS.reduce((s, l) => s + l.latencyMs, 0) / API_LOGS.length);
  const successRate = Math.round((API_LOGS.filter(l => l.responseStatus < 400).length / API_LOGS.length) * 100);

  return (
    <div style={{ padding: '20px 0', fontFamily: 'Inter, sans-serif' }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Calls', value: API_LOGS.length, color: '#2980B9', bg: '#EBF5FB' },
          { label: 'Success Rate', value: `${successRate}%`, color: successRate >= 95 ? '#059669' : '#D97706', bg: successRate >= 95 ? '#D1FAE5' : '#FEF3C7' },
          { label: 'Errors', value: errorCount, color: errorCount > 0 ? '#DC2626' : '#059669', bg: errorCount > 0 ? '#FEE2E2' : '#D1FAE5' },
          { label: 'Avg Latency', value: `${avgLatency}ms`, color: avgLatency < 500 ? '#059669' : '#D97706', bg: '#F9FAFB' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <Filter size={14} color="#6B7280" />
        <select value={filterDist} onChange={e => setFilterDist(e.target.value)}
          style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: '7px 12px', fontSize: 13, outline: 'none', background: '#fff' }}>
          <option value="all">All Distributors</option>
          {DISTRIBUTORS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['all', 'success', 'error'] as const).map(f => (
            <button key={f} onClick={() => setFilterStatus(f)}
              style={{ padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: filterStatus === f ? 700 : 400, cursor: 'pointer', border: filterStatus === f ? '1.5px solid #C0392B' : '1px solid #E5E7EB', background: filterStatus === f ? '#FDEDEC' : '#fff', color: filterStatus === f ? '#C0392B' : '#6B7280', textTransform: 'capitalize' }}>
              {f === 'all' ? 'All' : f === 'success' ? '2xx Only' : '4xx/5xx Only'}
            </button>
          ))}
        </div>
        <button style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: '#fff' }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Note on retention */}
      <div style={{ marginBottom: 12, fontSize: 12, color: '#9CA3AF' }}>
        Showing {filtered.length} of {API_LOGS.length} logged calls · Logs retained ≥ 90 days
      </div>

      {/* Log table */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#1A1A1A' }}>
              {['Time', 'Distributor', 'Method', 'Endpoint', 'Status', 'Latency', ''].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '32px 0', textAlign: 'center', color: '#9CA3AF' }}>No logs match your filters.</td></tr>
            )}
            {filtered.map(log => (
              <LogRow
                key={log.id}
                log={log}
                expanded={expandedId === log.id}
                onToggle={() => setExpandedId(expandedId === log.id ? null : log.id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {API_LOGS.length > limit && (
        <button onClick={() => setLimit(l => l + 50)}
          style={{ marginTop: 12, width: '100%', padding: '10px 0', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: '#fff', color: '#374151' }}>
          Load more (showing {limit} of {API_LOGS.length})
        </button>
      )}
    </div>
  );
}

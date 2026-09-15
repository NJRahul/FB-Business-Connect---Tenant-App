'use client';
import React, { useState } from 'react';
import { Shield, ShieldOff, RefreshCw, CheckCircle, XCircle, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { WEBHOOKS } from './mockData';
import type { DistributorWebhook, WebhookStatus } from './types';

const STATUS_CFG: Record<WebhookStatus, { bg: string; color: string; border: string; label: string; icon: React.ReactNode }> = {
  processed: { bg: '#D1FAE5', color: '#065F46', border: '#10B981', label: 'Processed',  icon: <CheckCircle size={13} /> },
  duplicate: { bg: '#F3F4F6', color: '#4B5563', border: '#9CA3AF', label: 'Duplicate',  icon: <Copy size={13} /> },
  rejected:  { bg: '#FEE2E2', color: '#005F62', border: '#EF4444', label: 'Rejected',   icon: <XCircle size={13} /> },
  failed:    { bg: '#FEF3C7', color: '#B45309', border: '#F59E0B', label: 'Failed',     icon: <RefreshCw size={13} /> },
};

const EVENT_TYPE_COLOR: Record<string, string> = {
  'order.shipped':       '#2563EB',
  'order.arrived':       '#059669',
  'order.eta_updated':   '#D97706',
  'catalog.price_update':'#7C3AED',
  'order.cancelled':     '#DC2626',
};

function WebhookRow({ wh, expanded, onToggle }: { wh: DistributorWebhook; expanded: boolean; onToggle: () => void }) {
  const cfg = STATUS_CFG[wh.status];
  const time = new Date(wh.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const evtColor = EVENT_TYPE_COLOR[wh.eventType] ?? '#6B7280';

  return (
    <>
      <tr
        onClick={onToggle}
        style={{ borderTop: '1px solid #E5E7EB', cursor: 'pointer' }}
        onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <td style={{ padding: '11px 12px', fontSize: 12, color: '#6B7280', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{time}</td>
        <td style={{ padding: '11px 12px', fontSize: 13, fontWeight: 600, color: '#374151' }}>{wh.distributorName}</td>
        <td style={{ padding: '11px 12px' }}>
          <span style={{ background: `${evtColor}18`, color: evtColor, borderRadius: 6, padding: '2px 9px', fontSize: 12, fontWeight: 600, fontFamily: 'monospace' }}>
            {wh.eventType}
          </span>
        </td>
        <td style={{ padding: '11px 12px' }}>
          {wh.signatureValid
            ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#059669', fontSize: 12, fontWeight: 600 }}><Shield size={13} /> Valid</span>
            : <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#DC2626', fontSize: 12, fontWeight: 600 }}><ShieldOff size={13} /> Invalid</span>
          }
        </td>
        <td style={{ padding: '11px 12px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, borderRadius: 6, padding: '2px 9px', fontSize: 12, fontWeight: 600 }}>
            {cfg.icon} {cfg.label}
          </span>
        </td>
        <td style={{ padding: '11px 12px', color: '#9CA3AF' }}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={6} style={{ padding: 0 }}>
            <div style={{ background: '#F9FAFB', borderTop: '1px solid #E5E7EB', padding: '14px 16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Event Details</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      ['Event ID', wh.eventId],
                      ['Idempotency Key', wh.idempotencyKey],
                      ['Signature', wh.signatureValid ? '✓ HMAC-SHA256 valid' : '✗ Signature mismatch'],
                      ['Processed At', wh.processedAt ? new Date(wh.processedAt).toLocaleString() : '—'],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', gap: 10 }}>
                        <span style={{ fontSize: 12, color: '#6B7280', width: 130, flexShrink: 0 }}>{k}</span>
                        <span style={{ fontSize: 12, color: '#374151', fontFamily: 'monospace', wordBreak: 'break-all' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Payload Summary</div>
                  <div style={{ background: '#1A1A1A', borderRadius: 8, padding: '10px 14px' }}>
                    <pre style={{ color: '#E5E7EB', fontSize: 12, fontFamily: 'monospace', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{wh.payloadSummary}</pre>
                  </div>
                  {wh.autoAction && (
                    <div style={{ marginTop: 10, background: wh.status === 'processed' ? '#D1FAE5' : wh.status === 'rejected' ? '#FEE2E2' : '#FEF3C7', border: `1px solid ${wh.status === 'processed' ? '#10B981' : wh.status === 'rejected' ? '#EF4444' : '#F59E0B'}`, borderRadius: 8, padding: '8px 12px' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: wh.status === 'processed' ? '#065F46' : wh.status === 'rejected' ? '#005F62' : '#92400E', marginBottom: 2 }}>Auto Action</div>
                      <div style={{ fontSize: 12, color: wh.status === 'processed' ? '#065F46' : wh.status === 'rejected' ? '#005F62' : '#92400E' }}>{wh.autoAction}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function WebhooksView() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<WebhookStatus | 'all'>('all');
  const [filterDist, setFilterDist] = useState('all');

  const filtered = WEBHOOKS.filter(w => {
    if (filterStatus !== 'all' && w.status !== filterStatus) return false;
    if (filterDist !== 'all' && w.distributorId !== filterDist) return false;
    return true;
  });

  const processedCount = WEBHOOKS.filter(w => w.status === 'processed').length;
  const rejectedCount  = WEBHOOKS.filter(w => w.status === 'rejected').length;
  const duplicateCount = WEBHOOKS.filter(w => w.status === 'duplicate').length;
  const failedCount    = WEBHOOKS.filter(w => w.status === 'failed').length;

  const dists = [...new Set(WEBHOOKS.map(w => w.distributorId))].map(id => ({ id, name: WEBHOOKS.find(w => w.distributorId === id)!.distributorName }));

  return (
    <div style={{ padding: '20px 0', fontFamily: 'Inter, sans-serif' }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Processed',  value: processedCount, color: '#059669', bg: '#D1FAE5' },
          { label: 'Duplicates', value: duplicateCount, color: '#4B5563', bg: '#F3F4F6' },
          { label: 'Rejected',   value: rejectedCount,  color: '#DC2626', bg: '#FEE2E2' },
          { label: 'Failed',     value: failedCount,    color: '#D97706', bg: '#FEF3C7' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Security note */}
      <div style={{ background: '#EFF6FF', border: '1px solid #93C5FD', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <Shield size={16} color="#1D4ED8" style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 13, color: '#1E3A8A' }}>
          <strong>Webhook Security:</strong> All inbound webhooks verified via HMAC-SHA256 signed payload. Invalid signatures returned HTTP 401 and are never processed. Duplicate event IDs returned HTTP 200 (idempotent).
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {(['all', 'processed', 'duplicate', 'rejected', 'failed'] as const).map(f => (
          <button key={f} onClick={() => setFilterStatus(f)}
            style={{ padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: filterStatus === f ? 700 : 400, cursor: 'pointer', border: filterStatus === f ? '1.5px solid #00A9AC' : '1px solid #E5E7EB', background: filterStatus === f ? '#E6F7F7' : '#fff', color: filterStatus === f ? '#00A9AC' : '#6B7280', textTransform: 'capitalize' }}>
            {f === 'all' ? 'All' : STATUS_CFG[f]?.label ?? f}
          </button>
        ))}
        <select value={filterDist} onChange={e => setFilterDist(e.target.value)}
          style={{ marginLeft: 'auto', border: '1px solid #E5E7EB', borderRadius: 8, padding: '7px 12px', fontSize: 13, outline: 'none', background: '#fff' }}>
          <option value="all">All Distributors</option>
          {dists.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      {/* Webhook table */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              {['Time', 'Source', 'Event Type', 'Signature', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '32px 0', textAlign: 'center', color: '#9CA3AF' }}>No webhooks match your filters.</td></tr>
            )}
            {filtered.map(wh => (
              <WebhookRow
                key={wh.id}
                wh={wh}
                expanded={expandedId === wh.id}
                onToggle={() => setExpandedId(expandedId === wh.id ? null : wh.id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Endpoint config hint */}
      <div style={{ marginTop: 16, background: '#1A1A1A', borderRadius: 10, padding: '14px 16px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Webhook Endpoint</div>
        <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#E5E7EB' }}>POST https://api.fb-business-connect.app/webhooks/distributor/{'{shopId}'}</div>
        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 6 }}>Configure this URL in each distributor's dashboard. HMAC secret available in Settings → Distributor → Security.</div>
      </div>
    </div>
  );
}

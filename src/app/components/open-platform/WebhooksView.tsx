import { useState } from 'react';
import {
  Plus, RefreshCw, Trash2, ToggleLeft, ToggleRight, AlertTriangle,
  CheckCircle2, Clock, X, Zap, RotateCcw, ChevronDown,
} from 'lucide-react';
import { WEBHOOK_ENDPOINTS, WEBHOOK_DELIVERIES } from './mockData';
import type { WebhookEndpoint, WebhookDelivery, WebhookEventType, DeliveryStatus } from './types';

const ALL_EVENTS: { group: string; events: WebhookEventType[] }[] = [
  { group: 'Bookings', events: ['booking.created', 'booking.rescheduled', 'booking.cancelled'] },
  { group: 'Visits', events: ['visit.started', 'visit.completed'] },
  { group: 'Invoices', events: ['invoice.paid', 'invoice.voided'] },
  { group: 'Customers', events: ['customer.created', 'customer.updated'] },
  { group: 'Recommendations', events: ['recommendation.approved', 'recommendation.decided'] },
  { group: 'Fleet', events: ['fleet.session_closed'] },
  { group: 'Campaigns', events: ['campaign.started', 'campaign.completed'] },
  { group: 'Inspections', events: ['inspection.completed'] },
  { group: 'Memberships', events: ['plan.enrolled', 'plan.renewed', 'plan.cancelled'] },
];

const STATUS_CFG: Record<DeliveryStatus, { bg: string; color: string; label: string; icon: React.ElementType }> = {
  delivered: { bg: '#DCFCE7', color: '#16A34A', label: 'Delivered', icon: CheckCircle2 },
  failed:    { bg: '#F0FBFB', color: '#DC2626', label: 'Failed',    icon: X },
  retrying:  { bg: '#FEF3C7', color: '#D97706', label: 'Retrying',  icon: RefreshCw },
  pending:   { bg: '#F3F4F6', color: '#9CA3AF', label: 'Pending',   icon: Clock },
};

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
}

// ─── Register Endpoint Modal ───────────────────────────────────────────────────

function RegisterModal({ onClose }: { onClose: (created: boolean) => void }) {
  const [url, setUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<Set<WebhookEventType>>(new Set());
  const [step, setStep] = useState<'form' | 'secret'>('form');
  const secret = 'whsec_lK7mPq3nXsR9tE2vFa8cBj0uYdHwNz6';

  function toggleEvent(e: WebhookEventType) {
    setSelectedEvents(prev => {
      const n = new Set(prev);
      n.has(e) ? n.delete(e) : n.add(e);
      return n;
    });
  }

  function toggleGroup(events: WebhookEventType[]) {
    const allSelected = events.every(e => selectedEvents.has(e));
    setSelectedEvents(prev => {
      const n = new Set(prev);
      if (allSelected) {
        events.forEach(e => n.delete(e));
      } else {
        events.forEach(e => n.add(e));
      }
      return n;
    });
  }

  if (step === 'secret') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
        <div className="bg-white rounded-[14px] p-6 w-full max-w-md" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: '#DCFCE7' }}>
            <CheckCircle2 size={22} style={{ color: '#16A34A' }} />
          </div>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.0625rem', marginBottom: '4px' }}>Endpoint Registered</h3>
          <p style={{ color: '#DC2626', fontWeight: 600, fontSize: '0.875rem', marginBottom: '12px' }}>
            Copy your signing secret now — it won't be shown again.
          </p>
          <div className="p-3 rounded-[8px] mb-4 font-mono text-sm break-all" style={{ background: '#0D1117', color: '#e6edf3' }}>
            {secret}
          </div>
          <p style={{ color: '#6B7280', fontSize: '0.8125rem', marginBottom: '16px' }}>
            Use this secret to verify HMAC-SHA256 signatures on the <code style={{ fontFamily: 'monospace' }}>FB Business Connect-Signature</code> header of incoming webhook deliveries.
          </p>
          <button onClick={() => onClose(true)} className="w-full py-2.5 rounded-[8px] text-sm font-semibold text-white" style={{ background: '#00A9AC' }}>Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-white rounded-[14px] w-full max-w-lg flex flex-col" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.18)', maxHeight: '88vh' }}>
        <div className="flex items-center justify-between px-6 pt-5 pb-4" style={{ borderBottom: '1px solid #F3F4F6' }}>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.0625rem' }}>Register Webhook Endpoint</h3>
          <button onClick={() => onClose(false)} style={{ color: '#9CA3AF' }}>✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div>
            <label className="block mb-1" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>Endpoint URL</label>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://your-server.com/webhooks/fb-business-connect"
              className="w-full px-3 py-2 rounded-[6px] text-sm font-mono"
              style={{ border: '1.5px solid #E5E7EB', outline: 'none', color: '#1A1A1A' }}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>Events to Subscribe</label>
              <button onClick={() => {
                const all = ALL_EVENTS.flatMap(g => g.events);
                setSelectedEvents(new Set(all));
              }} style={{ color: '#00A9AC', fontSize: '0.75rem', fontWeight: 600 }}>Select all</button>
            </div>
            <div className="space-y-2">
              {ALL_EVENTS.map(group => {
                const allSel = group.events.every(e => selectedEvents.has(e));
                const someSel = group.events.some(e => selectedEvents.has(e));
                return (
                  <div key={group.group} className="rounded-[8px] p-3" style={{ border: '1px solid #E5E7EB' }}>
                    <label className="flex items-center gap-2 mb-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allSel}
                        ref={el => { if (el) el.indeterminate = someSel && !allSel; }}
                        onChange={() => toggleGroup(group.events)}
                        className="accent-red-600"
                      />
                      <span style={{ fontWeight: 700, color: '#374151', fontSize: '0.875rem' }}>{group.group}</span>
                    </label>
                    <div className="grid grid-cols-2 gap-1 pl-5">
                      {group.events.map(e => (
                        <label key={e} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={selectedEvents.has(e)} onChange={() => toggleEvent(e)} className="accent-red-600" />
                          <code style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#6B7280' }}>{e}</code>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4" style={{ borderTop: '1px solid #F3F4F6' }}>
          <button onClick={() => onClose(false)} className="px-4 py-2.5 rounded-[8px] text-sm font-semibold" style={{ border: '1.5px solid #E5E7EB', color: '#6B7280' }}>Cancel</button>
          <button
            onClick={() => setStep('secret')}
            disabled={!url || selectedEvents.size === 0}
            className="flex-1 py-2.5 rounded-[8px] text-sm font-semibold text-white"
            style={{ background: url && selectedEvents.size > 0 ? '#00A9AC' : '#F3F4F6', color: url && selectedEvents.size > 0 ? '#fff' : '#D1D5DB' }}
          >
            Register & Get Signing Secret
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Endpoint Card ────────────────────────────────────────────────────────────

function EndpointCard({ endpoint, deliveries, onRotateSecret }: {
  endpoint: WebhookEndpoint;
  deliveries: WebhookDelivery[];
  onRotateSecret: () => void;
}) {
  const [active, setActive] = useState(endpoint.active);
  const [expanded, setExpanded] = useState(false);
  const endDeliveries = deliveries.filter(d => d.endpointId === endpoint.id);
  const failCount = endDeliveries.filter(d => d.status === 'failed').length;

  return (
    <div className="bg-white rounded-[10px]" style={{ border: `1.5px solid ${failCount > 0 ? '#80D4D5' : '#E5E7EB'}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={14} style={{ color: active ? '#27AE60' : '#D1D5DB', flexShrink: 0 }} />
              <code style={{ fontFamily: 'monospace', color: '#1A1A1A', fontSize: '0.875rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {endpoint.url}
              </code>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {endpoint.events.slice(0, 5).map(e => (
                <span key={e} className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: '#F0F9FF', color: '#0369A1' }}>{e}</span>
              ))}
              {endpoint.events.length > 5 && (
                <span style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>+{endpoint.events.length - 5} more</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
                Secret: <code style={{ fontFamily: 'monospace' }}>{endpoint.secretPreview}</code>
              </span>
              <button onClick={onRotateSecret} className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#00A9AC' }}>
                <RefreshCw size={11} /> Rotate
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {failCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: '#F0FBFB', color: '#DC2626' }}>
                <AlertTriangle size={11} /> {failCount} failed
              </span>
            )}
            <button onClick={() => setActive(a => !a)} style={{ color: active ? '#27AE60' : '#D1D5DB' }}>
              {active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
            </button>
            <button style={{ color: '#DC2626' }}><Trash2 size={15} /></button>
          </div>
        </div>

        <button
          onClick={() => setExpanded(x => !x)}
          className="mt-3 flex items-center gap-1 text-xs font-semibold"
          style={{ color: '#00A9AC' }}
        >
          <ChevronDown size={13} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          {expanded ? 'Hide' : 'Show'} recent deliveries
        </button>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid #F3F4F6' }}>
          <DeliveryLog deliveries={endDeliveries} />
        </div>
      )}
    </div>
  );
}

// ─── Delivery Log ─────────────────────────────────────────────────────────────

function DeliveryLog({ deliveries }: { deliveries: WebhookDelivery[] }) {
  const [replayedIds, setReplayedIds] = useState<Set<string>>(new Set());

  return (
    <table className="w-full text-sm">
      <thead>
        <tr style={{ background: '#F9FAFB' }}>
          {['Event', 'Status', 'Response', 'Latency', 'Attempts', 'Time', ''].map(h => (
            <th key={h} className="px-4 py-2 text-left" style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {deliveries.length === 0 ? (
          <tr>
            <td colSpan={7} className="py-6 text-center" style={{ color: '#9CA3AF' }}>No deliveries yet.</td>
          </tr>
        ) : (
          deliveries.map(d => {
            const cfg = STATUS_CFG[d.status];
            const Icon = cfg.icon;
            const replayed = replayedIds.has(d.id);
            return (
              <tr key={d.id} style={{ borderTop: '1px solid #F3F4F6' }}>
                <td className="px-4 py-2.5">
                  <code style={{ fontFamily: 'monospace', color: '#374151', fontSize: '0.8125rem' }}>{d.eventType}</code>
                </td>
                <td className="px-4 py-2.5">
                  <span className="flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: cfg.bg, color: cfg.color }}>
                    <Icon size={10} />
                    {cfg.label}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <span style={{ fontFamily: 'monospace', fontWeight: 600, color: d.responseStatus === 200 || d.responseStatus === 201 ? '#16A34A' : '#DC2626', fontSize: '0.875rem' }}>
                    {d.responseStatus ?? '—'}
                  </span>
                </td>
                <td className="px-4 py-2.5" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                  {d.latencyMs != null ? `${d.latencyMs}ms` : '—'}
                </td>
                <td className="px-4 py-2.5" style={{ color: d.attempts > 1 ? '#D97706' : '#6B7280', fontWeight: d.attempts > 1 ? 600 : 400, fontSize: '0.875rem' }}>
                  {d.attempts}
                </td>
                <td className="px-4 py-2.5" style={{ color: '#9CA3AF', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                  {fmtTime(d.deliveredAt)}
                </td>
                <td className="px-4 py-2.5">
                  <button
                    onClick={() => setReplayedIds(s => new Set([...s, d.id]))}
                    className="flex items-center gap-1 text-xs font-semibold"
                    style={{ color: replayed ? '#16A34A' : '#00A9AC' }}
                  >
                    {replayed ? <CheckCircle2 size={12} /> : <RotateCcw size={12} />}
                    {replayed ? 'Replayed' : 'Replay'}
                  </button>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

export function WebhooksView() {
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>(WEBHOOK_ENDPOINTS);
  const [showRegister, setShowRegister] = useState(false);
  const [rotateToast, setRotateToast] = useState(false);

  function handleRotate() {
    setRotateToast(true);
    setTimeout(() => setRotateToast(false), 3000);
  }

  const retrySchedule = ['1 min', '5 min', '15 min', '1 hour', '6 hours', '24 hours'];

  return (
    <div>
      {rotateToast && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-[8px] text-sm" style={{ background: '#1A1A1A', color: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }}>
          New signing secret generated — copy it from the modal.
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.125rem' }}>Webhooks</h2>
          <p style={{ color: '#6B7280', fontSize: '0.8125rem', marginTop: '2px' }}>
            Register endpoints to receive real-time HTTP POST events. Payloads are HMAC-SHA256 signed.
          </p>
        </div>
        <button
          onClick={() => setShowRegister(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-[8px] text-sm font-semibold text-white"
          style={{ background: '#00A9AC' }}
        >
          <Plus size={14} /> Register Endpoint
        </button>
      </div>

      {/* Retry policy info */}
      <div className="mb-5 p-4 rounded-[10px] flex items-start gap-3" style={{ background: '#F0F9FF', border: '1px solid #BAE6FD' }}>
        <RefreshCw size={16} style={{ color: '#0369A1', marginTop: '2px', flexShrink: 0 }} />
        <div>
          <p style={{ fontWeight: 700, color: '#0C4A6E', fontSize: '0.875rem' }}>Retry policy: exponential backoff</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {retrySchedule.map((r, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold" style={{ background: '#0369A1', color: '#fff' }}>{r}</span>
                {i < retrySchedule.length - 1 && <span style={{ color: '#7DD3FC', fontSize: '0.75rem' }}>→</span>}
              </span>
            ))}
            <span style={{ color: '#0369A1', fontSize: '0.8125rem' }}>→ <strong>Marked failed</strong> after 6 attempts</span>
          </div>
        </div>
      </div>

      {/* Endpoints */}
      <div className="space-y-3 mb-6">
        {endpoints.map(ep => (
          <EndpointCard key={ep.id} endpoint={ep} deliveries={WEBHOOK_DELIVERIES} onRotateSecret={handleRotate} />
        ))}
        {endpoints.length === 0 && (
          <div className="text-center py-12" style={{ color: '#9CA3AF' }}>
            <Zap size={28} style={{ margin: '0 auto 8px', color: '#E5E7EB' }} />
            <p>No webhook endpoints yet.</p>
          </div>
        )}
      </div>

      {/* Full delivery log */}
      <div>
        <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.0625rem', marginBottom: '12px' }}>
          All Recent Deliveries
        </h3>
        <div className="bg-white rounded-[10px] overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
          <DeliveryLog deliveries={WEBHOOK_DELIVERIES} />
        </div>
      </div>

      {showRegister && (
        <RegisterModal onClose={created => {
          setShowRegister(false);
        }} />
      )}
    </div>
  );
}

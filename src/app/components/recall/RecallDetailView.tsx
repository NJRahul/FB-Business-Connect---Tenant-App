import { useState } from 'react';
import { ArrowLeft, Shield, Send, CheckCircle2, Clock, XCircle, CalendarCheck, MessageSquare, Mail, Phone, AlertTriangle, Info } from 'lucide-react';
import type { Recall, RecallCustomerMatch, RecallOutreachLog, MatchStatus } from './types';
import { MOCK_RECALL_MATCHES, MOCK_OUTREACH_LOG } from './mockData';
import { SEVERITY_CONFIG, STATUS_CONFIG, SOURCE_CONFIG } from './RecallRegistryView';

const MATCH_STATUS_CONFIG: Record<MatchStatus, { label: string; bg: string; color: string }> = {
  uncontacted: { label: 'Uncontacted', bg: '#F9FAFB',  color: '#6B7280' },
  notified:    { label: 'Notified',    bg: '#EFF6FF',  color: '#1D4ED8' },
  acknowledged:{ label: 'Acknowledged',bg: '#F0FDFA',  color: '#0D9488' },
  scheduled:   { label: 'Scheduled',   bg: '#F5F3FF',  color: '#7C3AED' },
  resolved:    { label: 'Resolved',    bg: '#F0FDF4',  color: '#15803D' },
  declined:    { label: 'Declined',    bg: '#F9FAFB',  color: '#9CA3AF' },
};

function ProgressRing({ pct, color, label, numerator, denominator }: {
  pct: number; color: string; label: string; numerator: number; denominator: number;
}) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(pct, 100) / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg width="96" height="96" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={r} fill="none" stroke="#F3F4F6" strokeWidth="9" />
          <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="9"
            strokeDasharray={`${circ} ${circ}`} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '48px 48px', transition: 'stroke-dashoffset 0.6s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.125rem', color: '#1A1A1A' }}>{Math.round(pct)}%</span>
          <span style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>{numerator}/{denominator}</span>
        </div>
      </div>
      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', textAlign: 'center' }}>{label}</p>
    </div>
  );
}

interface Props {
  recall: Recall;
  onBack: () => void;
}

export function RecallDetailView({ recall, onBack }: Props) {
  const [matches, setMatches] = useState<RecallCustomerMatch[]>(
    MOCK_RECALL_MATCHES.filter(m => m.recallId === recall.id)
  );
  const [log, setLog] = useState<RecallOutreachLog[]>(
    MOCK_OUTREACH_LOG.filter(l => l.recallId === recall.id)
  );
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  function showToast(msg: string) { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); }

  function sendNotification(match: RecallCustomerMatch) {
    setSendingId(match.id);
    setTimeout(() => {
      const channel = match.contactPreference === 'email' ? 'email' : 'sms';
      setMatches(ms => ms.map(m => m.id === match.id ? { ...m, status: 'notified', notifiedAt: new Date().toISOString() } : m));
      setLog(l => [{
        id: `log_${Date.now()}`, recallId: recall.id, customerId: match.customerId,
        customerName: match.customerName, channel, sentAt: new Date().toISOString(), deliveryStatus: 'delivered',
      }, ...l]);
      setSendingId(null);
      showToast(`Safety recall notification sent to ${match.customerName} via ${channel}.`);
    }, 800);
  }

  function sendAllUncontacted() {
    const uncontacted = matches.filter(m => m.status === 'uncontacted');
    uncontacted.forEach((m, i) => {
      setTimeout(() => sendNotification(m), i * 200);
    });
  }

  const total = matches.length;
  const notifiedCount = matches.filter(m => ['notified', 'acknowledged', 'scheduled', 'resolved'].includes(m.status)).length;
  const resolvedCount = matches.filter(m => m.status === 'resolved').length;
  const uncontactedCount = matches.filter(m => m.status === 'uncontacted').length;
  const acknowledgedCount = matches.filter(m => m.status === 'acknowledged').length;
  const scheduledCount = matches.filter(m => m.status === 'scheduled').length;
  const declinedCount = matches.filter(m => m.status === 'declined').length;

  const notifiedPct = total > 0 ? (notifiedCount / total) * 100 : 0;
  const resolvedPct = total > 0 ? (resolvedCount / total) * 100 : 0;
  const uncontactedPct = total > 0 ? (uncontactedCount / total) * 100 : 0;

  const sev = SEVERITY_CONFIG[recall.severity];
  const sta = STATUS_CONFIG[recall.status];
  const src = SOURCE_CONFIG[recall.source];

  const confirmedMatches = matches.filter(m => m.matchCertainty === 'confirmed');
  const uncertainMatches = matches.filter(m => m.matchCertainty === 'uncertain');

  return (
    <div className="flex flex-col gap-5">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm w-fit" style={{ color: '#6B7280' }}>
        <ArrowLeft size={14} /> Back to Recall Registry
      </button>

      {/* Header card */}
      <div className="rounded-xl p-5" style={{ background: '#fff', border: `1px solid ${sev.dot}30` }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: sev.bg, color: sev.color }}>
                {sev.label}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: src.bg, color: src.color }}>
                {src.label}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: sta.bg, color: sta.color }}>
                {sta.label}
              </span>
              {recall.shopId === null && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full" style={{ background: '#EEF2FF', color: '#3730A3' }}>
                  <Shield size={9} /> Platform Published
                </span>
              )}
              {recall.nhtsaCampaignId && (
                <span className="text-xs font-mono px-2 py-1 rounded" style={{ background: '#F9FAFB', color: '#374151', border: '1px solid #E5E7EB' }}>
                  NHTSA #{recall.nhtsaCampaignId}
                </span>
              )}
            </div>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.125rem', color: '#1A1A1A', lineHeight: 1.35 }}>{recall.title}</h2>
            <p style={{ fontSize: '0.825rem', color: '#6B7280', marginTop: 8, lineHeight: 1.6 }}>{recall.description}</p>
            <div className="flex items-start gap-2 mt-4 p-3 rounded-lg" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
              <AlertTriangle size={14} color="#B45309" className="shrink-0 mt-0.5" />
              <p style={{ fontSize: '0.8rem', color: '#92400E', lineHeight: 1.5 }}>
                <strong>Recommended Action:</strong> {recall.recommendedAction}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Effective</p>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A1A1A' }}>{recall.effectiveFrom}</p>
            {recall.effectiveTo && <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>to {recall.effectiveTo}</p>}
            <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: 8 }}>Category</p>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#00A9AC' }}>Safety/Recall</p>
            <p style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>Not marketing · No opt-in required</p>
          </div>
        </div>
      </div>

      {/* Progress rings */}
      <div className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#1A1A1A' }}>Outreach Progress</h3>
          {uncontactedCount > 0 && (
            <button onClick={sendAllUncontacted}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
              style={{ background: '#00A9AC', color: '#fff' }}>
              <Send size={13} /> Send All Uncontacted ({uncontactedCount})
            </button>
          )}
        </div>

        <div className="flex items-center justify-around gap-4 mb-5 flex-wrap">
          <ProgressRing pct={notifiedPct}  color="#1D4ED8" label="Contacted"   numerator={notifiedCount}    denominator={total} />
          <ProgressRing pct={(acknowledgedCount + scheduledCount) / Math.max(total, 1) * 100} color="#7C3AED" label="Acknowledged / Scheduled" numerator={acknowledgedCount + scheduledCount} denominator={total} />
          <ProgressRing pct={resolvedPct}  color="#15803D" label="Resolved"    numerator={resolvedCount}    denominator={total} />
          <ProgressRing pct={uncontactedPct} color="#E5E7EB" label="Uncontacted" numerator={uncontactedCount} denominator={total} />
        </div>

        {/* Stat chips */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Total Matched', count: total, bg: '#F9FAFB', color: '#374151' },
            { label: 'Uncontacted',   count: uncontactedCount, bg: '#F9FAFB', color: '#6B7280' },
            { label: 'Notified',      count: notifiedCount - acknowledgedCount - scheduledCount - resolvedCount, bg: '#EFF6FF', color: '#1D4ED8' },
            { label: 'Acknowledged',  count: acknowledgedCount, bg: '#F0FDFA', color: '#0D9488' },
            { label: 'Scheduled',     count: scheduledCount,    bg: '#F5F3FF', color: '#7C3AED' },
            { label: 'Resolved',      count: resolvedCount,     bg: '#F0FDF4', color: '#15803D' },
            { label: 'Declined',      count: declinedCount,     bg: '#F9FAFB', color: '#9CA3AF' },
          ].map(s => (
            <div key={s.label} className="px-3 py-2 rounded-lg text-center" style={{ background: s.bg, border: '1px solid #F3F4F6', minWidth: 80 }}>
              <p style={{ fontWeight: 700, fontSize: '1.125rem', color: s.color }}>{s.count}</p>
              <p style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: 1 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Affected products & vehicles */}
      {(recall.affectedSkus.length > 0 || recall.affectedDotRanges.length > 0 || recall.affectedVehicles.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {recall.affectedSkus.length > 0 && (
            <div className="rounded-xl p-4" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Affected SKUs</p>
              {recall.affectedSkus.map(s => <p key={s} style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#1A1A1A' }}>{s}</p>)}
              {recall.affectedLots.map(l => <p key={l} style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#6B7280', marginTop: 2 }}>Lot: {l}</p>)}
            </div>
          )}
          {recall.affectedDotRanges.length > 0 && (
            <div className="rounded-xl p-4" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>DOT Code Ranges</p>
              {recall.affectedDotRanges.map((d, i) => (
                <div key={i} className="mb-1">
                  {d.plantCode && <p style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#6B7280' }}>Plant: {d.plantCode}</p>}
                  <p style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#1A1A1A' }}>{d.weekFrom} – {d.weekTo}</p>
                </div>
              ))}
            </div>
          )}
          {recall.affectedVehicles.length > 0 && (
            <div className="rounded-xl p-4" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Affected Vehicles</p>
              {recall.affectedVehicles.map((v, i) => (
                <p key={i} style={{ fontSize: '0.825rem', color: '#1A1A1A' }}>
                  {v.yearFrom}–{v.yearTo} {v.make} {v.model} {v.trim !== 'All' ? `(${v.trim})` : ''}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Customer matches */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E5E7EB', background: '#fff' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #F3F4F6' }}>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#1A1A1A' }}>
            Confirmed Matches ({confirmedMatches.length})
          </h3>
        </div>
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              {['Customer', 'Vehicle', 'Product / Install Date', 'Preference', 'Status', 'Action'].map(h => (
                <th key={h} className="text-left px-4 py-2.5" style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {confirmedMatches.map((m, i) => {
              const ms = MATCH_STATUS_CONFIG[m.status];
              const isSending = sendingId === m.id;
              return (
                <tr key={m.id} style={{ borderTop: i > 0 ? '1px solid #F3F4F6' : undefined }}>
                  <td className="px-4 py-3">
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1A1A1A' }}>{m.customerName}</p>
                    <p style={{ fontSize: '0.775rem', color: '#6B7280' }}>{m.customerEmail}</p>
                    <p style={{ fontSize: '0.775rem', color: '#6B7280' }}>{m.customerPhone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p style={{ fontSize: '0.825rem', color: '#1A1A1A' }}>{m.vehicle}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p style={{ fontSize: '0.8rem', color: '#374151' }}>{m.productSold}</p>
                    <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: 2 }}>Installed {m.installDate}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {(m.contactPreference === 'sms' || m.contactPreference === 'both') && <MessageSquare size={12} color="#6B7280" />}
                      {(m.contactPreference === 'email' || m.contactPreference === 'both') && <Mail size={12} color="#6B7280" />}
                      <span style={{ fontSize: '0.775rem', color: '#6B7280' }}>{m.contactPreference}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: ms.bg, color: ms.color }}>{ms.label}</span>
                    {m.notifiedAt && <p style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: 2 }}>
                      {new Date(m.notifiedAt).toLocaleDateString()}
                    </p>}
                    {m.resolvedAt && <p style={{ fontSize: '0.7rem', color: '#15803D', marginTop: 2 }}>
                      Resolved {new Date(m.resolvedAt).toLocaleDateString()}
                    </p>}
                  </td>
                  <td className="px-4 py-3">
                    {m.status === 'uncontacted' && (
                      <button onClick={() => sendNotification(m)} disabled={isSending}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity"
                        style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', opacity: isSending ? 0.6 : 1 }}>
                        <Send size={11} /> {isSending ? 'Sending…' : 'Send Notice'}
                      </button>
                    )}
                    {m.status === 'resolved' && <CheckCircle2 size={16} color="#15803D" />}
                    {m.status === 'declined' && <XCircle size={16} color="#9CA3AF" />}
                    {m.status === 'scheduled' && <CalendarCheck size={16} color="#7C3AED" />}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Uncertain matches */}
        {uncertainMatches.length > 0 && (
          <>
            <div className="px-5 py-3 flex items-center gap-2" style={{ background: '#FFFBEB', borderTop: '1px solid #FDE68A' }}>
              <Info size={14} color="#B45309" />
              <p style={{ fontSize: '0.8rem', color: '#92400E', fontWeight: 500 }}>
                Uncertain matches ({uncertainMatches.length}) — DOT code was not captured at install. Customer may or may not be affected.
              </p>
            </div>
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <tbody>
                {uncertainMatches.map((m, i) => {
                  const ms = MATCH_STATUS_CONFIG[m.status];
                  const isSending = sendingId === m.id;
                  return (
                    <tr key={m.id} style={{ borderTop: '1px solid #F3F4F6', background: '#FFFBEB10' }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#FEF3C7', color: '#B45309', fontWeight: 600 }}>Uncertain</span>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1A1A1A' }}>{m.customerName}</p>
                            <p style={{ fontSize: '0.775rem', color: '#6B7280' }}>{m.customerEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><p style={{ fontSize: '0.825rem', color: '#1A1A1A' }}>{m.vehicle}</p></td>
                      <td className="px-4 py-3">
                        <p style={{ fontSize: '0.8rem', color: '#374151' }}>{m.productSold}</p>
                        <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>DOT code not captured at install</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {(m.contactPreference === 'sms' || m.contactPreference === 'both') && <MessageSquare size={12} color="#6B7280" />}
                          {(m.contactPreference === 'email' || m.contactPreference === 'both') && <Mail size={12} color="#6B7280" />}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: ms.bg, color: ms.color }}>{ms.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        {m.status === 'uncontacted' && (
                          <button onClick={() => sendNotification(m)} disabled={isSending}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                            style={{ background: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A', opacity: isSending ? 0.6 : 1 }}>
                            <Send size={11} /> {isSending ? 'Sending…' : 'Send Uncertain Notice'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Outreach log */}
      {log.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E5E7EB', background: '#fff' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid #F3F4F6' }}>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#1A1A1A' }}>Outreach Log</h3>
          </div>
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB' }}>
                {['Sent At', 'Customer', 'Channel', 'Delivery'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5" style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {log.map((entry, i) => (
                <tr key={entry.id} style={{ borderTop: i > 0 ? '1px solid #F3F4F6' : undefined }}>
                  <td className="px-4 py-2.5" style={{ fontSize: '0.8rem', color: '#6B7280', fontVariantNumeric: 'tabular-nums' }}>
                    {new Date(entry.sentAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5" style={{ fontSize: '0.825rem', color: '#1A1A1A', fontWeight: 500 }}>{entry.customerName}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      {entry.channel === 'sms' && <MessageSquare size={12} color="#6B7280" />}
                      {entry.channel === 'email' && <Mail size={12} color="#6B7280" />}
                      {entry.channel === 'phone' && <Phone size={12} color="#6B7280" />}
                      <span style={{ fontSize: '0.8rem', color: '#374151' }}>{entry.channel.toUpperCase()}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: entry.deliveryStatus === 'delivered' ? '#F0FDF4' : '#FEF2F2',
                        color: entry.deliveryStatus === 'delivered' ? '#15803D' : '#B91C1C',
                      }}>
                      {entry.deliveryStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-6 right-6 px-4 py-3 rounded-xl text-sm font-medium z-50 flex items-center gap-2"
          style={{ background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
          <CheckCircle2 size={14} /> {toastMsg}
        </div>
      )}
    </div>
  );
}

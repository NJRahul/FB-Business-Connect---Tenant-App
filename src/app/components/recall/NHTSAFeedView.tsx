import { useState } from 'react';
import { Rss, AlertTriangle, ChevronDown, ChevronUp, CheckCircle2, X, Shield, Clock } from 'lucide-react';
import type { NHTSAPendingRecall, RecallSeverity } from './types';

const SEVERITY_CONFIG: Record<RecallSeverity, { label: string; bg: string; color: string; dot: string }> = {
  critical: { label: 'Critical', bg: '#F0FBFB', color: '#B91C1C', dot: '#DC2626' },
  warning:  { label: 'Warning',  bg: '#FFFBEB', color: '#B45309', dot: '#D97706' },
  info:     { label: 'Advisory', bg: '#EFF6FF', color: '#1D4ED8', dot: '#3B82F6' },
};

interface Props {
  queue: NHTSAPendingRecall[];
  onPublish: (item: NHTSAPendingRecall) => void;
}

export function NHTSAFeedView({ queue, onPublish }: Props) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [publishing, setPublishing] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  function showToast(msg: string) { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3500); }

  function toggleExpand(id: string) {
    setExpanded(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function dismiss(id: string) {
    setDismissed(s => new Set([...s, id]));
    showToast('NHTSA recall dismissed from queue. You can re-check the NHTSA feed manually if needed.');
  }

  function publish(item: NHTSAPendingRecall) {
    setPublishing(item.id);
    setTimeout(() => {
      onPublish(item);
      setPublishing(null);
      showToast(`NHTSA #${item.nhtsaCampaignId} published to all tenant shops. Shops will see this recall in their Recall Registry.`);
    }, 900);
  }

  const visible = queue.filter(n => !dismissed.has(n.id));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.125rem', color: '#1A1A1A' }}>NHTSA Recall Feed</h2>
        <p style={{ fontSize: '0.825rem', color: '#6B7280', marginTop: 2 }}>
          Incoming NHTSA safety campaigns matched to vehicles in your customer database. Review and publish to your Recall Registry.
        </p>
      </div>

      {/* Feed source badge */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
        <Rss size={15} color="#1D4ED8" />
        <div className="flex-1">
          <p style={{ fontSize: '0.825rem', fontWeight: 600, color: '#1E40AF' }}>Auto-ingested from NHTSA ORDS API</p>
          <p style={{ fontSize: '0.775rem', color: '#3B82F6' }}>Refreshed every 6 hours · Last sync: 6/15/2026 8:00 AM</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#DBEAFE', color: '#1D4ED8' }}>
          {visible.length} Pending Review
        </span>
      </div>

      {/* How it works */}
      <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
        <Shield size={14} color="#6B7280" className="shrink-0 mt-0.5" />
        <div style={{ fontSize: '0.8rem', color: '#6B7280', lineHeight: 1.6 }}>
          <strong style={{ color: '#374151' }}>Review before publishing.</strong> NHTSA campaigns are matched against your customer vehicle database.
          Estimated affected counts are based on vehicles on file. Publishing sends the recall to all tenant shops in the platform.
          Dismissed items are removed from this queue and not published.
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl p-10 flex flex-col items-center justify-center gap-3 text-center" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <CheckCircle2 size={28} color="#15803D" />
          <p style={{ fontWeight: 600, color: '#15803D', fontSize: '0.95rem' }}>All caught up — no pending NHTSA campaigns.</p>
          <p style={{ fontSize: '0.825rem', color: '#6B7280' }}>New campaigns will appear here automatically as they're published by NHTSA.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {visible.map(item => {
            const sev = SEVERITY_CONFIG[item.severity];
            const isExpanded = expanded.has(item.id);
            const isPublishing = publishing === item.id;

            return (
              <div key={item.id} className="rounded-xl overflow-hidden" style={{ background: '#fff', border: `1px solid ${sev.dot}40` }}>
                {/* Card header */}
                <div className="px-5 py-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: sev.bg }}>
                      <AlertTriangle size={17} color={sev.dot} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: sev.bg, color: sev.color }}>
                          {sev.label}
                        </span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE' }}>
                          NHTSA #{item.nhtsaCampaignId}
                        </span>
                        <span className="flex items-center gap-1 text-xs" style={{ color: '#9CA3AF' }}>
                          <Clock size={11} /> Received {new Date(item.receivedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A1A1A', lineHeight: 1.35 }}>{item.title}</p>
                      {isExpanded && (
                        <p style={{ fontSize: '0.825rem', color: '#6B7280', marginTop: 6, lineHeight: 1.6 }}>{item.description}</p>
                      )}

                      {/* Affected info */}
                      <div className="flex flex-wrap gap-4 mt-3">
                        <div>
                          <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Affected Vehicles</p>
                          {item.affectedVehicles.map((v, i) => (
                            <p key={i} style={{ fontSize: '0.8rem', color: '#374151', marginTop: 2 }}>
                              {v.yearFrom}–{v.yearTo} {v.make} {v.model}
                            </p>
                          ))}
                        </div>
                        <div>
                          <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Components</p>
                          {item.affectedComponents.map((c, i) => (
                            <p key={i} style={{ fontSize: '0.8rem', color: '#374151', marginTop: 2 }}>{c}</p>
                          ))}
                        </div>
                        <div>
                          <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Est. Customers Affected</p>
                          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: sev.color, lineHeight: 1 }}>{item.estimatedAffected}</p>
                          <p style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>in your database</p>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-2 shrink-0">
                      <button onClick={() => publish(item)} disabled={isPublishing}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
                        style={{ background: isPublishing ? '#E5E7EB' : '#00A9AC', color: isPublishing ? '#9CA3AF' : '#fff', minWidth: 140 }}>
                        {isPublishing ? (
                          <><span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" /> Publishing…</>
                        ) : (
                          <>Publish Recall</>
                        )}
                      </button>
                      <button onClick={() => dismiss(item.id)}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm"
                        style={{ background: '#F9FAFB', color: '#6B7280', border: '1px solid #E5E7EB' }}>
                        <X size={12} /> Dismiss
                      </button>
                      <button onClick={() => toggleExpand(item.id)}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs rounded-lg"
                        style={{ color: '#9CA3AF' }}>
                        {isExpanded ? <><ChevronUp size={12} /> Less</> : <><ChevronDown size={12} /> Full Detail</>}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Warning stripe for critical */}
                {item.severity === 'critical' && (
                  <div className="px-5 py-2.5 flex items-center gap-2" style={{ background: '#F0FBFB', borderTop: '1px solid #FECACA' }}>
                    <AlertTriangle size={13} color="#B91C1C" />
                    <p style={{ fontSize: '0.775rem', color: '#B91C1C', fontWeight: 500 }}>
                      Critical safety campaign — recommend publishing immediately. Affected customers should be notified within 24 hours.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
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

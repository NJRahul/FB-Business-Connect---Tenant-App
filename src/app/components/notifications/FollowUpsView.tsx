import React, { useState } from 'react';
import { Mail, MessageSquare, X, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import { FOLLOW_UP_QUEUE } from './mockData';
import type { FollowUpCategory, FollowUpStatus } from './types';

const CATEGORY_META: Record<FollowUpCategory, { label: string; color: string; bg: string }> = {
  maintenance:      { label: 'Maintenance',      color: '#2563EB', bg: '#EFF6FF' },
  rotation:         { label: 'Tire Rotation',    color: '#7E22CE', bg: '#FDF4FF' },
  seasonal:         { label: 'Seasonal',         color: '#D97706', bg: '#FEF3C7' },
  'vehicle-specific': { label: 'Vehicle Specific', color: '#C0392B', bg: '#FDEDEC' },
};

const STATUS_META: Record<FollowUpStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  queued:    { label: 'Queued',    color: '#2563EB', bg: '#EFF6FF', icon: Clock },
  sent:      { label: 'Sent',      color: '#15803D', bg: '#F0FDF4', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: '#9CA3AF', bg: '#F3F4F6', icon: XCircle },
};

export function FollowUpsView() {
  const [activeTab, setActiveTab] = useState<FollowUpStatus | 'all'>('all');
  const [cancelled, setCancelled] = useState<string[]>([]);

  const displayed = FOLLOW_UP_QUEUE.filter(fu => {
    const effectiveStatus = cancelled.includes(fu.id) ? 'cancelled' : fu.status;
    if (activeTab === 'all') return true;
    return effectiveStatus === activeTab;
  });

  const totalAttributed = FOLLOW_UP_QUEUE.filter(f => f.status === 'sent').reduce((s, f) => s + f.attributedRevenue, 0);

  const counts = {
    all:       FOLLOW_UP_QUEUE.length,
    queued:    FOLLOW_UP_QUEUE.filter(f => f.status === 'queued').length,
    sent:      FOLLOW_UP_QUEUE.filter(f => f.status === 'sent').length,
    cancelled: FOLLOW_UP_QUEUE.filter(f => f.status === 'cancelled').length + cancelled.length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'Queued',           value: counts.queued,                     color: '#2563EB' },
          { label: 'Sent',             value: counts.sent,                       color: '#15803D' },
          { label: 'Cancelled',        value: counts.cancelled,                  color: '#9CA3AF' },
          { label: 'Attributed Revenue', value: `$${totalAttributed.toLocaleString()}`, color: '#15803D' },
        ].map(s => (
          <div key={s.label} style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 20px', background: '#fff' }}>
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 26, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #E5E7EB' }}>
        {([
          { id: 'all' as const,       label: 'All' },
          { id: 'queued' as const,    label: 'Queued' },
          { id: 'sent' as const,      label: 'Sent' },
          { id: 'cancelled' as const, label: 'Cancelled' },
        ]).map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '9px 16px', border: 'none', background: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 13,
              color: activeTab === t.id ? '#C0392B' : '#6B7280',
              borderBottom: activeTab === t.id ? '2px solid #C0392B' : '2px solid transparent',
              marginBottom: -2,
            }}
          >
            {t.label} <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 4 }}>{counts[t.id]}</span>
          </button>
        ))}
      </div>

      {/* Follow-up cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {displayed.map(fu => {
          const effectiveStatus: FollowUpStatus = cancelled.includes(fu.id) ? 'cancelled' : fu.status;
          const sm = STATUS_META[effectiveStatus];
          const cm = CATEGORY_META[fu.category];
          const SIcon = sm.icon;
          const CIcon = fu.customerChannel === 'email' ? Mail : MessageSquare;
          const isQueued = effectiveStatus === 'queued';

          return (
            <div key={fu.id} style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', padding: '16px 18px', opacity: effectiveStatus === 'cancelled' ? 0.6 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#1A1A1A' }}>{fu.customerName}</span>
                    <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: cm.bg, color: cm.color }}>
                      {cm.label}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: sm.bg, color: sm.color }}>
                      <SIcon size={10} />
                      {sm.label}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6B7280' }}>
                      <CIcon size={12} />
                      {fu.customerChannel}
                    </span>
                  </div>

                  {/* Tech + template */}
                  <div style={{ fontSize: 12, color: '#6B7280', marginBottom: fu.note ? 10 : 0 }}>
                    <strong style={{ color: '#374151' }}>{fu.techName}</strong> · {fu.templateName}
                    <span style={{ margin: '0 6px', color: '#D1D5DB' }}>·</span>
                    <Clock size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
                    Scheduled: {new Date(fu.scheduledFor).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>

                  {/* Tech note */}
                  {fu.note && (
                    <div style={{ marginTop: 8, padding: '8px 12px', background: '#F9FAFB', borderRadius: 6, border: '1px solid #E5E7EB', fontSize: 12, color: '#374151', fontStyle: 'italic', lineHeight: 1.5 }}>
                      "{fu.note}"
                    </div>
                  )}

                  {/* Attribution */}
                  {fu.status === 'sent' && fu.attributedRevenue > 0 && (
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#15803D', fontWeight: 600 }}>
                      <DollarSign size={12} />
                      ${fu.attributedRevenue.toLocaleString()} attributed revenue
                    </div>
                  )}
                </div>

                {/* Cancel button */}
                {isQueued && (
                  <button
                    onClick={() => setCancelled(p => [...p, fu.id])}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid #D1D5DB', background: '#fff', color: '#6B7280', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
                  >
                    <X size={12} /> Cancel
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {displayed.length === 0 && (
          <div style={{ padding: '40px 16px', textAlign: 'center', fontSize: 13, color: '#9CA3AF' }}>
            No follow-ups in this view.
          </div>
        )}
      </div>
    </div>
  );
}

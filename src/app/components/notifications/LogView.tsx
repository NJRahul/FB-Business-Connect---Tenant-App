import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Mail, MessageSquare, Bell, Smartphone, RotateCcw } from 'lucide-react';
import { NOTIFICATION_LOGS } from './mockData';
import type { NotificationStatus, NotificationChannel, NotificationCategory } from './types';

const STATUS_META: Record<NotificationStatus, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Pending',   color: '#6B7280', bg: '#F3F4F6' },
  sent:      { label: 'Sent',      color: '#2563EB', bg: '#EFF6FF' },
  delivered: { label: 'Delivered', color: '#15803D', bg: '#F0FDF4' },
  opened:    { label: 'Opened',    color: '#7E22CE', bg: '#FDF4FF' },
  clicked:   { label: 'Clicked',   color: '#0F766E', bg: '#F0FDFA' },
  failed:    { label: 'Failed',    color: '#DC2626', bg: '#F0FBFB' },
  bounced:   { label: 'Bounced',   color: '#D97706', bg: '#FEF3C7' },
};

const CHANNEL_ICON: Record<NotificationChannel, React.ElementType> = {
  email: Mail, sms: MessageSquare, 'in-app': Bell, push: Smartphone,
};

const CHANNEL_COLOR: Record<NotificationChannel, string> = {
  email: '#2563EB', sms: '#15803D', 'in-app': '#7E22CE', push: '#D97706',
};

export function LogView() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus,   setFilterStatus]   = useState<NotificationStatus | 'all'>('all');
  const [filterChannel,  setFilterChannel]  = useState<NotificationChannel | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<NotificationCategory | 'all'>('all');

  const logs = [...NOTIFICATION_LOGS].sort((a, b) => {
    const ta = a.sentAt ? new Date(a.sentAt).getTime() : 0;
    const tb = b.sentAt ? new Date(b.sentAt).getTime() : 0;
    return tb - ta;
  }).filter(l =>
    (filterStatus   === 'all' || l.status   === filterStatus) &&
    (filterChannel  === 'all' || l.channel  === filterChannel) &&
    (filterCategory === 'all' || l.category === filterCategory)
  );

  function fmtTime(iso?: string) {
    if (!iso) return '—';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  function fmtDt(iso?: string) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as NotificationStatus | 'all')}
          style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 12, color: '#374151', background: '#fff', cursor: 'pointer' }}
        >
          <option value="all">All Statuses</option>
          {(Object.keys(STATUS_META) as NotificationStatus[]).map(s => (
            <option key={s} value={s}>{STATUS_META[s].label}</option>
          ))}
        </select>
        <select
          value={filterChannel}
          onChange={e => setFilterChannel(e.target.value as NotificationChannel | 'all')}
          style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 12, color: '#374151', background: '#fff', cursor: 'pointer' }}
        >
          <option value="all">All Channels</option>
          <option value="email">Email</option>
          <option value="sms">SMS</option>
          <option value="in-app">In-App</option>
          <option value="push">Push</option>
        </select>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value as NotificationCategory | 'all')}
          style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 12, color: '#374151', background: '#fff', cursor: 'pointer' }}
        >
          <option value="all">All Categories</option>
          <option value="transactional-customer">Customer Transactional</option>
          <option value="transactional-staff">Staff Transactional</option>
          <option value="marketing">Marketing</option>
          <option value="system">System</option>
        </select>
        <span style={{ fontSize: 12, color: '#9CA3AF', alignSelf: 'center', marginLeft: 4 }}>
          {logs.length} of {NOTIFICATION_LOGS.length} records
        </span>
      </div>

      {/* Table */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              {['', 'Recipient', 'Template', 'Channel', 'Category', 'Status', 'Sent', 'Retries'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map(log => {
              const sm = STATUS_META[log.status];
              const Icon = CHANNEL_ICON[log.channel];
              const isExpanded = expandedId === log.id;
              return (
                <React.Fragment key={log.id}>
                  <tr
                    style={{ background: isExpanded ? '#F9FAFB' : '#fff', borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }}
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  >
                    <td style={{ padding: '10px 14px', width: 24 }}>
                      {isExpanded ? <ChevronUp size={14} color="#9CA3AF" /> : <ChevronDown size={14} color="#9CA3AF" />}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>{log.recipientName}</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{log.recipientContact}</div>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#6B7280' }}>{log.templateName}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Icon size={13} color={CHANNEL_COLOR[log.channel]} />
                        <span style={{ fontSize: 12, color: CHANNEL_COLOR[log.channel], fontWeight: 600, textTransform: 'capitalize' }}>{log.channel}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontSize: 12, color: '#6B7280', textTransform: 'capitalize' }}>
                        {log.category.replace('transactional-', '')}
                      </div>
                      {log.isTransactional && (
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#2563EB', marginTop: 1 }}>TXN</div>
                      )}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: sm.bg, color: sm.color }}>
                        {sm.label}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: '#9CA3AF' }}>{fmtTime(log.sentAt)}</td>
                    <td style={{ padding: '10px 14px' }}>
                      {log.retryCount > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <RotateCcw size={11} color="#D97706" />
                          <span style={{ fontSize: 12, color: '#D97706', fontWeight: 600 }}>{log.retryCount}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: '#D1D5DB' }}>—</span>
                      )}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr style={{ background: '#F9FAFB' }}>
                      <td colSpan={8} style={{ padding: '0 14px 16px 44px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
                          {[
                            { label: 'Sent at',      value: fmtDt(log.sentAt) },
                            { label: 'Delivered at', value: fmtDt(log.deliveredAt) },
                            { label: 'Opened at',    value: fmtDt(log.openedAt) },
                            { label: 'Clicked at',   value: fmtDt(log.clickedAt) },
                          ].map(f => (
                            <div key={f.label}>
                              <div style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', marginBottom: 3 }}>{f.label.toUpperCase()}</div>
                              <div style={{ fontSize: 13, color: f.value === '—' ? '#D1D5DB' : '#374151' }}>{f.value}</div>
                            </div>
                          ))}
                        </div>
                        {log.error && (
                          <div style={{ marginTop: 10, padding: '8px 12px', background: '#F0FBFB', border: '1px solid #80D4D5', borderRadius: 6 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: '#DC2626', marginBottom: 2 }}>ERROR</div>
                            <div style={{ fontSize: 12, color: '#005F62', fontFamily: 'monospace' }}>{log.error}</div>
                          </div>
                        )}
                        {log.retryCount > 0 && (
                          <div style={{ marginTop: 8, fontSize: 12, color: '#D97706' }}>
                            Retried {log.retryCount}× with exponential backoff (1m → 5m → 25m)
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {logs.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: '40px 16px', textAlign: 'center', fontSize: 13, color: '#9CA3AF' }}>
                  No logs match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

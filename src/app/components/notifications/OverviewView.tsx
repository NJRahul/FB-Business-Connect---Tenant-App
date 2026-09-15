import React from 'react';
import { Mail, MessageSquare, Bell, Smartphone, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { NOTIFICATION_LOGS } from './mockData';
import type { NotificationChannel, NotificationStatus } from './types';

const STATUS_COLOR: Record<NotificationStatus, { color: string; bg: string }> = {
  pending:   { color: '#6B7280', bg: '#F3F4F6' },
  sent:      { color: '#2563EB', bg: '#EFF6FF' },
  delivered: { color: '#15803D', bg: '#F0FDF4' },
  opened:    { color: '#7E22CE', bg: '#FDF4FF' },
  clicked:   { color: '#0F766E', bg: '#F0FDFA' },
  failed:    { color: '#DC2626', bg: '#F0FBFB' },
  bounced:   { color: '#D97706', bg: '#FEF3C7' },
};

const CHANNEL_META: Record<NotificationChannel, { label: string; icon: React.ElementType; color: string }> = {
  email:  { label: 'Email',  icon: Mail,          color: '#2563EB' },
  sms:    { label: 'SMS',    icon: MessageSquare,  color: '#15803D' },
  'in-app': { label: 'In-App', icon: Bell,         color: '#7E22CE' },
  push:   { label: 'Push',   icon: Smartphone,     color: '#D97706' },
};

export function OverviewView() {
  const total     = NOTIFICATION_LOGS.length;
  const sent      = NOTIFICATION_LOGS.filter(l => l.status !== 'pending').length;
  const delivered = NOTIFICATION_LOGS.filter(l => ['delivered','opened','clicked'].includes(l.status)).length;
  const failed    = NOTIFICATION_LOGS.filter(l => l.status === 'failed').length;
  const bounced   = NOTIFICATION_LOGS.filter(l => l.status === 'bounced').length;
  const opened    = NOTIFICATION_LOGS.filter(l => ['opened','clicked'].includes(l.status)).length;

  const deliveryRate = sent > 0 ? Math.round((delivered / sent) * 100) : 0;
  const openRate     = delivered > 0 ? Math.round((opened / delivered) * 100) : 0;
  const failRate     = sent > 0 ? Math.round(((failed + bounced) / sent) * 100) : 0;

  const transactionalFailed = NOTIFICATION_LOGS.filter(l => l.isTransactional && (l.status === 'failed' || l.status === 'bounced'));

  const channelCounts = (['email','sms','in-app','push'] as NotificationChannel[]).map(ch => ({
    ch,
    count: NOTIFICATION_LOGS.filter(l => l.channel === ch).length,
    delivered: NOTIFICATION_LOGS.filter(l => l.channel === ch && ['delivered','opened','clicked'].includes(l.status)).length,
    failed: NOTIFICATION_LOGS.filter(l => l.channel === ch && (l.status === 'failed' || l.status === 'bounced')).length,
  }));

  const recentLogs = [...NOTIFICATION_LOGS]
    .filter(l => l.sentAt)
    .sort((a, b) => new Date(b.sentAt!).getTime() - new Date(a.sentAt!).getTime())
    .slice(0, 10);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Transactional failure alert */}
      {transactionalFailed.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px', borderRadius: 8, background: '#F0FBFB', border: '1px solid #80D4D5', color: '#005F62' }}>
          <AlertTriangle size={16} style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>Transactional delivery failures</div>
            <div style={{ fontSize: 12, marginTop: 2 }}>
              {transactionalFailed.length} transactional message{transactionalFailed.length > 1 ? 's' : ''} failed or bounced:&nbsp;
              {transactionalFailed.map(l => l.recipientName).join(', ')}
            </div>
          </div>
        </div>
      )}

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'Total Sent', value: sent, sub: `${total - sent} pending`, icon: CheckCircle, color: '#2563EB' },
          { label: 'Delivery Rate', value: `${deliveryRate}%`, sub: `${delivered} delivered`, icon: CheckCircle, color: '#15803D' },
          { label: 'Open Rate', value: `${openRate}%`, sub: `${opened} opened or clicked`, icon: Clock, color: '#7E22CE' },
          { label: 'Failure Rate', value: `${failRate}%`, sub: `${failed} failed · ${bounced} bounced`, icon: XCircle, color: '#DC2626' },
        ].map(s => (
          <div key={s.label} style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 20px', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <s.icon size={16} color={s.color} />
              <div style={{ fontSize: 12, color: '#6B7280' }}>{s.label}</div>
            </div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 28, color: '#1A1A1A' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Channel breakdown */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', fontWeight: 700, fontSize: 14 }}>Channel Breakdown</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
          {channelCounts.map(({ ch, count, delivered: del, failed: fail }) => {
            const meta = CHANNEL_META[ch];
            const Icon = meta.icon;
            const rate = count > 0 ? Math.round((del / count) * 100) : 0;
            return (
              <div key={ch} style={{ padding: '20px 24px', borderRight: ch !== 'push' ? '1px solid #F3F4F6' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Icon size={16} color={meta.color} />
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#1A1A1A' }}>{meta.label}</div>
                </div>
                <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 24, color: '#1A1A1A' }}>{count}</div>
                <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>sent</div>
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6B7280', marginBottom: 4 }}>
                    <span>Delivery rate</span><span style={{ fontWeight: 600, color: rate >= 90 ? '#15803D' : rate >= 70 ? '#D97706' : '#DC2626' }}>{rate}%</span>
                  </div>
                  <div style={{ height: 4, background: '#F3F4F6', borderRadius: 99 }}>
                    <div style={{ height: 4, borderRadius: 99, background: meta.color, width: `${rate}%` }} />
                  </div>
                </div>
                {fail > 0 && (
                  <div style={{ marginTop: 8, fontSize: 11, color: '#DC2626' }}>{fail} failure{fail > 1 ? 's' : ''}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Status distribution */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', fontWeight: 700, fontSize: 14 }}>Status Distribution</div>
        <div style={{ padding: '16px 20px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {(Object.keys(STATUS_COLOR) as NotificationStatus[]).map(st => {
            const count = NOTIFICATION_LOGS.filter(l => l.status === st).length;
            if (count === 0) return null;
            const sc = STATUS_COLOR[st];
            return (
              <div key={st} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 99, background: sc.bg, border: `1px solid ${sc.color}22` }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: sc.color }}>{count}</span>
                <span style={{ fontSize: 12, color: sc.color, textTransform: 'capitalize' }}>{st}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent activity */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', fontWeight: 700, fontSize: 14 }}>Recent Activity</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              {['Recipient', 'Template', 'Channel', 'Category', 'Status', 'Sent At'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentLogs.map((log, i) => {
              const sc = STATUS_COLOR[log.status];
              const cm = CHANNEL_META[log.channel];
              const CIcon = cm.icon;
              return (
                <tr key={log.id} style={{ background: i % 2 === 0 ? '#fff' : '#F9FAFB' }}>
                  <td style={{ padding: '11px 16px', fontSize: 13, color: '#1A1A1A', fontWeight: 500 }}>{log.recipientName}</td>
                  <td style={{ padding: '11px 16px', fontSize: 13, color: '#6B7280' }}>{log.templateName}</td>
                  <td style={{ padding: '11px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CIcon size={13} color={cm.color} />
                      <span style={{ fontSize: 12, color: cm.color, fontWeight: 600 }}>{cm.label}</span>
                    </div>
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: 12, color: '#6B7280', textTransform: 'capitalize' }}>
                    {log.category.replace('transactional-', '')}
                    {log.isTransactional && <span style={{ marginLeft: 4, color: '#2563EB', fontSize: 10, fontWeight: 700 }}>TXN</span>}
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: sc.bg, color: sc.color, textTransform: 'capitalize' }}>
                      {log.status}
                    </span>
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: 12, color: '#9CA3AF' }}>
                    {log.sentAt ? new Date(log.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
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

import React, { useState, Component } from 'react';
import {
  LayoutDashboard, FileText, List, Clock, Users, GitBranch, MessageSquare, Bell, AlertTriangle, CheckCircle,
} from 'lucide-react';
import { OverviewView }   from './OverviewView';
import { TemplatesView }  from './TemplatesView';
import { LogView }        from './LogView';
import { RemindersView }  from './RemindersView';
import { WaitlistView }   from './WaitlistView';
import { FollowUpsView }  from './FollowUpsView';
import { InboxView }      from './InboxView';
import { NOTIFICATION_LOGS, SMS_CONVERSATIONS, WAITLIST_OFFERS, FOLLOW_UP_QUEUE } from './mockData';

class ErrorBoundary extends Component<{ children: React.ReactNode }, { error: string | null }> {
  constructor(props: { children: React.ReactNode }) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error: Error) { return { error: error.message }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, margin: 24 }}>
          <div style={{ fontWeight: 700, color: '#DC2626', marginBottom: 8 }}>Render error</div>
          <pre style={{ fontSize: 12, color: '#991B1B', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{this.state.error}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const TABS = [
  { id: 'overview',   label: 'Overview',     icon: LayoutDashboard },
  { id: 'templates',  label: 'Templates',    icon: FileText },
  { id: 'log',        label: 'Delivery Log', icon: List },
  { id: 'reminders',  label: 'Reminders',    icon: Clock },
  { id: 'waitlist',   label: 'Waitlist',     icon: Users },
  { id: 'followups',  label: 'Follow-Ups',   icon: GitBranch },
  { id: 'inbox',      label: 'SMS Inbox',    icon: MessageSquare },
] as const;
type Tab = typeof TABS[number]['id'];

export default function NotificationsModule() {
  const [tab, setTab] = useState<Tab>('overview');

  const unreadSms     = SMS_CONVERSATIONS.reduce((s, c) => s + c.unreadCount, 0);
  const pendingOffers = WAITLIST_OFFERS.filter(o => o.status === 'pending').length;
  const txnFailed     = NOTIFICATION_LOGS.filter(l => l.isTransactional && (l.status === 'failed' || l.status === 'bounced')).length;
  const queuedFollowups = FOLLOW_UP_QUEUE.filter(f => f.status === 'queued').length;

  const badgeCounts: Record<string, number> = {
    inbox:     unreadSms,
    waitlist:  pendingOffers,
    log:       txnFailed,
    followups: queuedFollowups,
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1A1A1A' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 26, color: '#1A1A1A' }}>
          Notifications
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6B7280' }}>
          Delivery engine, templates, reminders, waitlist, follow-ups, and two-way SMS for shop-1
        </p>
      </div>

      {/* Alert strip */}
      {txnFailed > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', marginBottom: 20 }}>
          <AlertTriangle size={14} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>
            {txnFailed} transactional notification{txnFailed > 1 ? 's' : ''} failed — check the Delivery Log
          </span>
        </div>
      )}

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #E5E7EB', marginBottom: 28, flexWrap: 'wrap' }}>
        {TABS.map(t => {
          const badge = badgeCounts[t.id] ?? 0;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: 13,
                color: tab === t.id ? '#C0392B' : '#6B7280',
                borderBottom: tab === t.id ? '2px solid #C0392B' : '2px solid transparent',
                marginBottom: -2, position: 'relative',
              }}
            >
              <t.icon size={14} />
              {t.label}
              {badge > 0 && (
                <span style={{
                  minWidth: 18, height: 18, borderRadius: 99, background: '#C0392B', color: '#fff',
                  fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px',
                }}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <ErrorBoundary key={tab}>
        {tab === 'overview'  && <OverviewView />}
        {tab === 'templates' && <TemplatesView />}
        {tab === 'log'       && <LogView />}
        {tab === 'reminders' && <RemindersView />}
        {tab === 'waitlist'  && <WaitlistView />}
        {tab === 'followups' && <FollowUpsView />}
        {tab === 'inbox'     && <InboxView />}
      </ErrorBoundary>
    </div>
  );
}

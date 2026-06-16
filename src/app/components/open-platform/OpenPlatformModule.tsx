import React, { useState, Component } from 'react';
import { Code2, Webhook, Zap, GitBranch, Activity, Lock } from 'lucide-react';
import { ApiView } from './ApiView';
import { WebhooksView } from './WebhooksView';
import { ZapierView } from './ZapierView';
import { WorkflowBuilderView } from './WorkflowBuilderView';
import { UsageView } from './UsageView';

class ErrorBoundary extends Component<{ children: React.ReactNode }, { error: string | null }> {
  constructor(props: { children: React.ReactNode }) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error: Error) { return { error: error.message }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, margin: '24px 0' }}>
          <div style={{ fontWeight: 700, color: '#DC2626', marginBottom: 8 }}>Render error</div>
          <pre style={{ fontSize: 12, color: '#991B1B', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{this.state.error}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const TABS = [
  { id: 'api',       label: 'API Reference & Keys', icon: Code2,     tier: 'Pro / Enterprise' },
  { id: 'webhooks',  label: 'Webhooks',             icon: Webhook,   tier: 'Pro / Enterprise' },
  { id: 'zapier',    label: 'Zapier',               icon: Zap,       tier: 'All Tiers' },
  { id: 'workflows', label: 'Workflow Builder',     icon: GitBranch, tier: 'Pro / Enterprise' },
  { id: 'usage',     label: 'Usage & Dev Portal',   icon: Activity,  tier: 'All' },
] as const;
type Tab = typeof TABS[number]['id'];

export function OpenPlatformModule() {
  const [tab, setTab] = useState<Tab>('api');

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1A1A1A' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 26, color: '#1A1A1A' }}>
          Open Platform
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6B7280' }}>
          REST API, webhooks, Zapier integration, visual workflow automation, and developer tooling.
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #E5E7EB', marginBottom: 28, overflowX: 'auto' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap',
              color: tab === t.id ? '#C0392B' : '#6B7280',
              borderBottom: tab === t.id ? '2px solid #C0392B' : '2px solid transparent',
              marginBottom: -2, position: 'relative',
            }}
          >
            <t.icon size={14} />
            {t.label}
            {t.tier !== 'All' && t.tier !== 'All Tiers' && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '1px 6px', borderRadius: 99, background: '#F3F4F6', color: '#9CA3AF', fontSize: 10, fontWeight: 700 }}>
                <Lock size={8} />
                {t.tier}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <ErrorBoundary key={tab}>
        {tab === 'api'       && <ApiView />}
        {tab === 'webhooks'  && <WebhooksView />}
        {tab === 'zapier'    && <ZapierView />}
        {tab === 'workflows' && <WorkflowBuilderView />}
        {tab === 'usage'     && <UsageView />}
      </ErrorBoundary>
    </div>
  );
}

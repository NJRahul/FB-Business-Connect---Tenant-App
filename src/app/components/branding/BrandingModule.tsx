import React, { useState, Component } from 'react';
import { Palette, Globe, Mail, LayoutGrid, AlertTriangle } from 'lucide-react';
import { VisualBrandingView } from './VisualBrandingView';
import { CustomDomainView }   from './CustomDomainView';
import { EmailSenderView }    from './EmailSenderView';
import { ConsistencyView }    from './ConsistencyView';
import { CUSTOM_EMAIL_SENDER } from './mockData';
import type { BrandingPlanTier } from './types';

class ErrorBoundary extends Component<{ children: React.ReactNode }, { error: string | null }> {
  constructor(props: { children: React.ReactNode }) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error: Error) { return { error: error.message }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, background: '#F0FBFB', border: '1px solid #80D4D5', borderRadius: 10 }}>
          <div style={{ fontWeight: 700, color: '#DC2626', marginBottom: 8 }}>Render error</div>
          <pre style={{ fontSize: 12, color: '#005F62', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{this.state.error}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const TABS = [
  { id: 'visual',      label: 'Visual Branding',  icon: Palette   },
  { id: 'domain',      label: 'Custom Domain',     icon: Globe     },
  { id: 'email',       label: 'Email Sender',      icon: Mail      },
  { id: 'consistency', label: 'Consistency',       icon: LayoutGrid },
] as const;
type Tab = typeof TABS[number]['id'];

interface Props {
  currentPlan?: BrandingPlanTier;
}

export default function BrandingModule({ currentPlan = 'pro' }: Props) {
  const [tab, setTab] = useState<Tab>('visual');

  const dmarcFailing = CUSTOM_EMAIL_SENDER.dmarcStatus === 'fail';

  const badgeCounts: Record<string, number> = {
    email: dmarcFailing ? 1 : 0,
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1A1A1A' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 26, color: '#1A1A1A' }}>
          White-Label Branding
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6B7280' }}>
          Customize your storefront identity, custom domain, email sender, and brand consistency for shop-1
        </p>
      </div>

      {/* Alert strip for failing email records */}
      {dmarcFailing && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E', marginBottom: 20 }}>
          <AlertTriangle size={14} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>DMARC record failing — custom email sender inactive until fixed</span>
        </div>
      )}

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #E5E7EB', marginBottom: 28, flexWrap: 'wrap' }}>
        {TABS.map(t => {
          const badge = badgeCounts[t.id] ?? 0;
          const domainLocked = t.id === 'domain' && currentPlan === 'starter';
          const emailLocked  = t.id === 'email'  && currentPlan === 'starter';
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: 13,
                color: tab === t.id ? '#00A9AC' : '#6B7280',
                borderBottom: tab === t.id ? '2px solid #00A9AC' : '2px solid transparent',
                marginBottom: -2, position: 'relative',
              }}
            >
              <t.icon size={14} />
              {t.label}
              {(domainLocked || emailLocked) && (
                <span style={{ fontSize: 9, fontWeight: 700, color: '#D97706', background: '#FEF3C7', padding: '1px 5px', borderRadius: 99 }}>Pro</span>
              )}
              {badge > 0 && (
                <span style={{ minWidth: 18, height: 18, borderRadius: 99, background: '#00A9AC', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <ErrorBoundary key={tab}>
        {tab === 'visual'      && <VisualBrandingView plan={currentPlan} />}
        {tab === 'domain'      && <CustomDomainView plan={currentPlan} />}
        {tab === 'email'       && <EmailSenderView plan={currentPlan} />}
        {tab === 'consistency' && <ConsistencyView />}
      </ErrorBoundary>
    </div>
  );
}

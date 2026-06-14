import React, { useState, Component } from 'react';
import {
  CreditCard, BarChart2, Banknote, FileText, Shield, AlertTriangle, X,
} from 'lucide-react';
import { PlanView }         from './PlanView';
import { UsageView }        from './UsageView';
import { PayoutsView }      from './PayoutsView';
import { InvoicesView }     from './InvoicesView';
import { CapabilitiesView } from './CapabilitiesView';
import { CURRENT_USAGE }    from './mockData';
import { PLAN_CONFIGS, type PlanTier } from './types';

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
  { id: 'plan',         label: 'Plan',         icon: CreditCard },
  { id: 'usage',        label: 'Usage',        icon: BarChart2 },
  { id: 'payouts',      label: 'Payouts',      icon: Banknote },
  { id: 'invoices',     label: 'Invoices',     icon: FileText },
  { id: 'capabilities', label: 'Capabilities', icon: Shield },
] as const;
type Tab = typeof TABS[number]['id'];

interface Props {
  currentPlan: PlanTier;
  onPlanChange: (p: PlanTier) => void;
}

export function BillingModule({ currentPlan, onPlanChange }: Props) {
  const [tab, setTab]           = useState<Tab>('plan');
  const [dunning, setDunning]   = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const cfg = PLAN_CONFIGS[currentPlan];
  const smsUsed     = CURRENT_USAGE.quantity;
  const smsIncluded = cfg.smsInclusion;
  const smsPct      = smsIncluded !== null ? (smsUsed / smsIncluded) * 100 : 0;

  const badgeCounts: Record<string, number> = {
    usage: smsPct >= 80 ? 1 : 0,
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1A1A1A' }}>

      {/* Dunning banner */}
      {dunning && !dismissed && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 24px', background: '#DC2626', color: '#fff',
          marginBottom: 24, borderRadius: 10,
        }}>
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Payment failed — your access will be suspended in 14 days</span>
            <span style={{ fontSize: 13, marginLeft: 12, opacity: 0.9 }}>
              Stripe retried your card ending in 4242 on Jun 14. Update your billing info to restore access.
            </span>
          </div>
          <button
            onClick={() => setDunning(false)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.4)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
          >
            Update Billing
          </button>
          <button
            onClick={() => setDismissed(true)}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: 4 }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 26, color: '#1A1A1A' }}>
          Billing & Plan
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6B7280' }}>
          Subscription, usage, payouts, invoices, and feature capabilities for shop-1
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #E5E7EB', marginBottom: 28 }}>
        {TABS.map(t => {
          const badge = badgeCounts[t.id] ?? 0;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: 13,
                color: tab === t.id ? '#C0392B' : '#6B7280',
                borderBottom: tab === t.id ? '2px solid #C0392B' : '2px solid transparent',
                marginBottom: -2, position: 'relative',
              }}
            >
              <t.icon size={14} />
              {t.label}
              {badge > 0 && (
                <span style={{ minWidth: 18, height: 18, borderRadius: 99, background: '#D97706', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <ErrorBoundary key={tab}>
        {tab === 'plan'         && <PlanView         currentPlan={currentPlan} onPlanChange={onPlanChange} onDunningDemo={() => { setDunning(true); setDismissed(false); }} />}
        {tab === 'usage'        && <UsageView        currentPlan={currentPlan} />}
        {tab === 'payouts'      && <PayoutsView      currentPlan={currentPlan} />}
        {tab === 'invoices'     && <InvoicesView />}
        {tab === 'capabilities' && <CapabilitiesView currentPlan={currentPlan} />}
      </ErrorBoundary>
    </div>
  );
}

import React, { useState, Component } from 'react';
import {
  Activity, DollarSign, Megaphone, BarChart2, Users, GitBranch,
  MapPin, Award, Download, Cpu, AlertTriangle,
} from 'lucide-react';
import { OperationalDashboard } from './OperationalDashboard';
import { FinancialReports }    from './FinancialReports';
import { MarketingReports }    from './MarketingReports';
import { KPIView }             from './KPIView';
import { CustomerAnalytics }   from './CustomerAnalytics';
import { FunnelView }          from './FunnelView';
import { LocationPnL }         from './LocationPnL';
import { LeaderboardView }     from './LeaderboardView';
import { ExportView }          from './ExportView';
import { ObservabilityView }   from './ObservabilityView';
import { CONNECTOR_HEALTH }    from './mockData';

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
  { id: 'liveops',      label: 'Live Ops',      icon: Activity },
  { id: 'revenue',      label: 'Revenue',       icon: DollarSign },
  { id: 'marketing',    label: 'Marketing',     icon: Megaphone },
  { id: 'kpis',         label: 'KPIs',          icon: BarChart2 },
  { id: 'customers',    label: 'Customers',     icon: Users },
  { id: 'funnel',       label: 'Funnel',        icon: GitBranch },
  { id: 'locations',    label: 'Locations',     icon: MapPin },
  { id: 'leaderboard',  label: 'Leaderboard',   icon: Award },
  { id: 'export',       label: 'Export',        icon: Download },
  { id: 'platform',     label: 'Platform',      icon: Cpu },
] as const;
type Tab = typeof TABS[number]['id'];

export default function ReportingModule() {
  const [tab, setTab] = useState<Tab>('liveops');

  const degradedConnectors = CONNECTOR_HEALTH.filter(c => c.status !== 'healthy').length;

  const badgeCounts: Record<string, number> = {
    platform: degradedConnectors,
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1A1A1A' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 26, color: '#1A1A1A' }}>
          Reporting & Analytics
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6B7280' }}>
          Live operations, revenue, KPIs, customer analytics, and platform observability for shop-1
        </p>
      </div>

      {/* Connector degraded alert */}
      {degradedConnectors > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E', marginBottom: 20 }}>
          <AlertTriangle size={14} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>
            {degradedConnectors} connector{degradedConnectors > 1 ? 's' : ''} degraded or down — check Platform tab
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
                color: tab === t.id ? '#00A9AC' : '#6B7280',
                borderBottom: tab === t.id ? '2px solid #00A9AC' : '2px solid transparent',
                marginBottom: -2, position: 'relative',
              }}
            >
              <t.icon size={14} />
              {t.label}
              {badge > 0 && (
                <span style={{
                  minWidth: 18, height: 18, borderRadius: 99, background: '#00A9AC', color: '#fff',
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
        {tab === 'liveops'     && <OperationalDashboard />}
        {tab === 'revenue'     && <FinancialReports />}
        {tab === 'marketing'   && <MarketingReports />}
        {tab === 'kpis'        && <KPIView />}
        {tab === 'customers'   && <CustomerAnalytics />}
        {tab === 'funnel'      && <FunnelView />}
        {tab === 'locations'   && <LocationPnL />}
        {tab === 'leaderboard' && <LeaderboardView />}
        {tab === 'export'      && <ExportView />}
        {tab === 'platform'    && <ObservabilityView />}
      </ErrorBoundary>
    </div>
  );
}

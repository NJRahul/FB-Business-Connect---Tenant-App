import React, { useState, Component } from 'react';
import { LayoutDashboard, Gauge, FileCheck, Shield, Wrench, BarChart2, Tag, ClipboardCheck } from 'lucide-react';
import { OverviewView } from './OverviewView';
import { TpmsView } from './TpmsView';
import { RegistrationView } from './RegistrationView';
import { WarrantiesView } from './WarrantiesView';
import { ServicesView } from './ServicesView';
import { ReportsView } from './ReportsView';
import { RebatesView } from './RebatesView';
import { InspectionDefaultsView } from './InspectionDefaultsView';

class ErrorBoundary extends Component<{ children: React.ReactNode; tab: string }, { error: string | null }> {
  constructor(props: { children: React.ReactNode; tab: string }) { super(props); this.state = { error: null }; }
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
  { id: 'overview',     label: 'Overview',           icon: LayoutDashboard },
  { id: 'tpms',         label: 'TPMS',               icon: Gauge },
  { id: 'registration', label: 'Registration + DOT', icon: FileCheck },
  { id: 'warranties',   label: 'Warranties & Claims', icon: Shield },
  { id: 'services',     label: 'Services',            icon: Wrench },
  { id: 'reports',      label: 'Reg. Reports',        icon: BarChart2 },
  { id: 'rebates',      label: 'Rebates',             icon: Tag },
  { id: 'inspections',  label: 'Inspection Defaults', icon: ClipboardCheck },
] as const;
type TiresTab = typeof TABS[number]['id'];

export function TiresModule() {
  const [tab, setTab] = useState<TiresTab>('overview');

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1A1A1A' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 26, color: '#1A1A1A' }}>
          Tires Industry Pack
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6B7280' }}>
          TPMS · Tire Registration · Road Hazard Warranty · Mount & Balance · Position Tracking · Take-offs · Swap & Store · Rebates · Inspections
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #E5E7EB', marginBottom: 24, overflowX: 'auto' }}>
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 16px', border: 'none', background: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap',
                color: tab === t.id ? '#C0392B' : '#6B7280',
                borderBottom: tab === t.id ? '2px solid #C0392B' : '2px solid transparent',
                marginBottom: -2,
              }}
            >
              <Icon size={13} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <ErrorBoundary key={tab} tab={tab}>
        {tab === 'overview'     && <OverviewView onNavigate={(t) => setTab(t as TiresTab)} />}
        {tab === 'tpms'         && <TpmsView />}
        {tab === 'registration' && <RegistrationView />}
        {tab === 'warranties'   && <WarrantiesView />}
        {tab === 'services'     && <ServicesView />}
        {tab === 'reports'      && <ReportsView />}
        {tab === 'rebates'      && <RebatesView />}
        {tab === 'inspections'  && <InspectionDefaultsView />}
      </ErrorBoundary>
    </div>
  );
}

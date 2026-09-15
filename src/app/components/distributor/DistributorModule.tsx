'use client';
import React, { useState } from 'react';
import {
  Plug, Package, FileText, Webhook, BarChart2, AlertTriangle,
  CheckCircle, Activity, RefreshCw, ShoppingBag,
} from 'lucide-react';
import { ConnectorsView } from './ConnectorsView';
import { CatalogView } from './CatalogView';
import { ApiLogsView } from './ApiLogsView';
import { WebhooksView } from './WebhooksView';
import { PerformanceView } from './PerformanceView';
import { DISTRIBUTORS, API_LOGS, WEBHOOKS, MANUAL_ORDERS } from './mockData';

type DSTab = 'overview' | 'connectors' | 'catalog' | 'api_logs' | 'webhooks' | 'performance';

const TABS: { id: DSTab; label: string; icon: React.ElementType }[] = [
  { id: 'overview',    label: 'Overview',      icon: Activity },
  { id: 'connectors', label: 'Connectors',     icon: Plug },
  { id: 'catalog',    label: 'Catalog & SKUs', icon: Package },
  { id: 'api_logs',   label: 'API Logs',       icon: FileText },
  { id: 'webhooks',   label: 'Webhooks',       icon: Webhook },
  { id: 'performance',label: 'Performance',    icon: BarChart2 },
];

function OverviewDashboard({ onNavigate }: { onNavigate: (t: DSTab) => void }) {
  const activeCount    = DISTRIBUTORS.filter(d => d.status === 'active').length;
  const degradedList   = DISTRIBUTORS.filter(d => d.status === 'degraded');
  const errorLogs      = API_LOGS.filter(l => l.responseStatus >= 400).length;
  const pendingOrders  = MANUAL_ORDERS.filter(o => o.status === 'pending_action').length;
  const pendingWebhooks= WEBHOOKS.filter(w => w.status === 'failed').length;

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Degraded banner */}
      {degradedList.length > 0 && (
        <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <AlertTriangle size={18} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#92400E', fontSize: 14 }}>
              {degradedList.map(d => d.name).join(', ')} {degradedList.length > 1 ? 'connectors are' : 'connector is'} degraded
            </div>
            <div style={{ fontSize: 13, color: '#B45309', marginTop: 2 }}>
              Serving cached data. Prices may have changed. Booking slots for exclusive items temporarily disabled.
            </div>
          </div>
          <button onClick={() => onNavigate('connectors')}
            style={{ padding: '6px 14px', background: '#D97706', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
            View Connectors
          </button>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Connected Distributors', value: DISTRIBUTORS.length, color: '#2980B9', bg: '#EBF5FB', tab: 'connectors' as DSTab },
          { label: 'Active',                 value: activeCount,         color: '#059669', bg: '#D1FAE5', tab: 'connectors' as DSTab },
          { label: 'API Errors (today)',      value: errorLogs,           color: errorLogs > 0 ? '#DC2626' : '#059669', bg: errorLogs > 0 ? '#FEE2E2' : '#D1FAE5', tab: 'api_logs' as DSTab },
          { label: 'Pending Manual Orders',  value: pendingOrders,       color: pendingOrders > 0 ? '#D97706' : '#059669', bg: pendingOrders > 0 ? '#FEF3C7' : '#D1FAE5', tab: 'catalog' as DSTab },
        ].map(s => (
          <div key={s.label} onClick={() => onNavigate(s.tab)}
            style={{ background: s.bg, border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px 18px', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 32, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Connector status grid */}
      <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 16, color: '#1A1A1A', marginBottom: 14 }}>Connector Status</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, marginBottom: 28 }}>
        {DISTRIBUTORS.map(dist => {
          const statusCfg = {
            active:       { color: '#059669', bg: '#D1FAE5', border: '#10B981', label: 'Active' },
            degraded:     { color: '#D97706', bg: '#FEF3C7', border: '#F59E0B', label: 'Degraded' },
            disconnected: { color: '#6B7280', bg: '#F3F4F6', border: '#9CA3AF', label: 'Disconnected' },
            syncing:      { color: '#2563EB', bg: '#DBEAFE', border: '#60A5FA', label: 'Syncing' },
          }[dist.status];
          const tierCfg = { A: { bg: '#EFF6FF', color: '#1D4ED8' }, B: { bg: '#F0FDF4', color: '#15803D' }, C: { bg: '#FDF4FF', color: '#7E22CE' } }[dist.tier];
          const lastSync = dist.lastSyncAt ? Math.round((Date.now() - new Date(dist.lastSyncAt).getTime()) / 60000) : null;

          return (
            <div key={dist.id} onClick={() => onNavigate('connectors')}
              style={{ background: '#fff', border: `1px solid ${dist.status === 'degraded' ? '#80D4D5' : '#E5E7EB'}`, borderRadius: 12, padding: '16px', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#00A9AC'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(192,57,43,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = dist.status === 'degraded' ? '#80D4D5' : '#E5E7EB'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 24 }}>{dist.logoEmoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dist.name}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                    <span style={{ background: tierCfg.bg, color: tierCfg.color, borderRadius: 5, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>Tier {dist.tier}</span>
                    <span style={{ background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}`, borderRadius: 5, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>
                      {statusCfg.label}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>
                Last sync: {lastSync === null ? 'Never' : lastSync < 1 ? 'just now' : lastSync < 60 ? `${lastSync}m ago` : `${Math.floor(lastSync / 60)}h ago`}
              </div>
              {dist.errorCount > 0 && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#DC2626', fontWeight: 600 }}>{dist.errorCount} errors since last sync</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick links */}
      <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 16, color: '#1A1A1A', marginBottom: 14 }}>Quick Access</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {[
          { tab: 'catalog' as DSTab,     label: 'Catalog & SKUs',   icon: Package,   desc: 'Browse, filter, add local SKUs' },
          { tab: 'api_logs' as DSTab,    label: 'API Logs',         icon: FileText,  desc: `${API_LOGS.length} calls logged today` },
          { tab: 'webhooks' as DSTab,    label: 'Webhooks',         icon: Webhook,   desc: `${WEBHOOKS.length} events received`, badge: pendingWebhooks },
          { tab: 'performance' as DSTab, label: 'Performance',      icon: BarChart2, desc: 'On-time metrics + safety buffers' },
        ].map(card => {
          const Icon = card.icon;
          return (
            <div key={card.tab} onClick={() => onNavigate(card.tab)}
              style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px', cursor: 'pointer', position: 'relative' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#00A9AC'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(192,57,43,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = 'none'; }}>
              {(card as { badge?: number }).badge != null && (card as { badge?: number }).badge! > 0 && (
                <span style={{ position: 'absolute', top: 12, right: 12, background: '#00A9AC', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                  {(card as { badge?: number }).badge}
                </span>
              )}
              <div style={{ width: 40, height: 40, background: '#E6F7F7', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Icon size={18} color="#00A9AC" />
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1A1A1A', marginBottom: 4 }}>{card.label}</div>
              <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>{card.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DistributorModule() {
  const [activeTab, setActiveTab] = useState<DSTab>('overview');

  const degradedCount = DISTRIBUTORS.filter(d => d.status === 'degraded').length;
  const pendingOrderCount = MANUAL_ORDERS.filter(o => o.status === 'pending_action').length;

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', minHeight: '100%' }}>
      <div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 800, color: '#1A1A1A', margin: 0 }}>
          Distributor & Supplier Integration
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280', margin: '4px 0 0' }}>
          Manage live API connectors (Tier A), catalog feeds (Tier B), and local inventory (Tier C).
        </p>
      </div>

      {/* Tab nav */}
      <div style={{ borderBottom: '1px solid #E5E7EB', marginTop: 20, overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 0, minWidth: 'max-content' }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            const badge =
              tab.id === 'connectors' ? degradedCount :
              tab.id === 'catalog'    ? pendingOrderCount :
              undefined;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7, padding: '12px 16px',
                  borderBottom: active ? '2.5px solid #00A9AC' : '2.5px solid transparent',
                  background: active ? '#E6F7F7' : 'transparent',
                  color: active ? '#00A9AC' : '#6B7280',
                  fontWeight: active ? 700 : 500, fontSize: 13, cursor: 'pointer', border: 'none',
                  borderBottomStyle: 'solid', whiteSpace: 'nowrap',
                }}>
                <Icon size={14} />
                {tab.label}
                {badge != null && badge > 0 && (
                  <span style={{ background: '#00A9AC', color: '#fff', borderRadius: '50%', minWidth: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, padding: '0 4px' }}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ paddingTop: 20 }}>
        {activeTab === 'overview'    && <OverviewDashboard onNavigate={setActiveTab} />}
        {activeTab === 'connectors' && <ConnectorsView />}
        {activeTab === 'catalog'    && <CatalogView />}
        {activeTab === 'api_logs'   && <ApiLogsView />}
        {activeTab === 'webhooks'   && <WebhooksView />}
        {activeTab === 'performance'&& <PerformanceView />}
      </div>
    </div>
  );
}

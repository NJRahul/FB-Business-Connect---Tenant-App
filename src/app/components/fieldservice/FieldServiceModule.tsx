'use client';
import React, { useState } from 'react';
import {
  LayoutGrid, Smartphone, FileText, Package, ShieldAlert, MessageSquareWarning,
  Clock, DollarSign, Activity, AlertTriangle, CheckCircle, Wrench, Users
} from 'lucide-react';
import { DispatchBoard } from './DispatchBoard';
import { TechnicianPWA } from './TechnicianPWA';
import { EstimateInvoice } from './EstimateInvoice';
import { TruckInventory } from './TruckInventory';
import { MidJobAuth } from './MidJobAuth';
import { ClaimsAndRecs } from './ClaimsAndRecs';
import { TimeTracking } from './TimeTracking';
import { CommissionTracking } from './CommissionTracking';
import { DISPATCH_VISITS, MID_JOB_AUTHS } from './mockData';

type FSTab =
  | 'overview'
  | 'dispatch'
  | 'pwa'
  | 'invoices'
  | 'inventory'
  | 'auth'
  | 'claims'
  | 'time'
  | 'commissions';

const TABS: { id: FSTab; label: string; icon: React.ElementType; badge?: number }[] = [
  { id: 'overview',    label: 'Overview',         icon: Activity },
  { id: 'dispatch',   label: 'Dispatch Board',    icon: LayoutGrid },
  { id: 'pwa',        label: 'Technician App',    icon: Smartphone },
  { id: 'invoices',   label: 'Estimates & Invoices', icon: FileText },
  { id: 'inventory',  label: 'Truck Inventory',   icon: Package },
  { id: 'auth',       label: 'Mid-Job Auth',      icon: ShieldAlert },
  { id: 'claims',     label: 'Claims & Recos',    icon: MessageSquareWarning },
  { id: 'time',       label: 'Time Tracking',     icon: Clock },
  { id: 'commissions',label: 'Commissions',       icon: DollarSign },
];

function OverviewDashboard({ onNavigate }: { onNavigate: (tab: FSTab) => void }) {
  const atRisk = DISPATCH_VISITS.filter(v => v.atRisk).length;
  const inProgress = DISPATCH_VISITS.filter(v => v.visitState === 'in_progress').length;
  const completed = DISPATCH_VISITS.filter(v => v.visitState === 'completed').length;
  const pendingAuths = MID_JOB_AUTHS.filter(a => a.status === 'pending').length;
  const onRoute = DISPATCH_VISITS.filter(v => v.visitState === 'en_route').length;

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Alert banner */}
      {(atRisk > 0 || pendingAuths > 0) && (
        <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertTriangle size={18} color="#D97706" />
          <div style={{ flex: 1, fontSize: 14, color: '#92400E' }}>
            {atRisk > 0 && <span><strong>{atRisk} visit{atRisk > 1 ? 's' : ''}</strong> at risk of running late. </span>}
            {pendingAuths > 0 && <span><strong>{pendingAuths} mid-job authorization{pendingAuths > 1 ? 's' : ''}</strong> awaiting customer response.</span>}
          </div>
          <button onClick={() => onNavigate(atRisk > 0 ? 'dispatch' : 'auth')}
            style={{ padding: '6px 14px', background: '#D97706', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            View
          </button>
        </div>
      )}

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: "Today's Visits", value: DISPATCH_VISITS.length, color: '#2980B9', bg: '#EBF5FB', icon: LayoutGrid, tab: 'dispatch' as FSTab },
          { label: 'In Progress',    value: inProgress, color: '#27AE60', bg: '#D1FAE5', icon: Wrench, tab: 'dispatch' as FSTab },
          { label: 'En Route',       value: onRoute, color: '#F39C12', bg: '#FEF3C7', icon: Users, tab: 'dispatch' as FSTab },
          { label: 'Completed',      value: completed, color: '#6B7280', bg: '#F9FAFB', icon: CheckCircle, tab: 'dispatch' as FSTab },
        ].map(s => (
          <div key={s.label} onClick={() => onNavigate(s.tab)}
            style={{ background: s.bg, border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px 18px', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 32, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick access cards */}
      <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 16, color: '#1A1A1A', marginBottom: 14 }}>Modules</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {[
          { tab: 'dispatch' as FSTab,    label: 'Dispatch Board',        icon: LayoutGrid,            desc: 'Time-grid + map view, drag-and-drop' },
          { tab: 'pwa' as FSTab,         label: 'Technician App',        icon: Smartphone,            desc: 'PWA with offline, photos, signatures' },
          { tab: 'invoices' as FSTab,    label: 'Estimates & Invoices',  icon: FileText,              desc: 'Full lifecycle with payment capture' },
          { tab: 'inventory' as FSTab,   label: 'Truck Inventory',       icon: Package,               desc: 'Parts loaded vs. required tracking' },
          { tab: 'auth' as FSTab,        label: 'Mid-Job Auth',          icon: ShieldAlert,           desc: 'Customer approvals with countdown', badge: pendingAuths },
          { tab: 'claims' as FSTab,      label: 'Claims & Recos',        icon: MessageSquareWarning,  desc: 'Damage claims + follow-up recos' },
          { tab: 'time' as FSTab,        label: 'Time Tracking',         icon: Clock,                 desc: 'Clock in/out with CSV payroll export' },
          { tab: 'commissions' as FSTab, label: 'Commissions',           icon: DollarSign,            desc: 'Pro/Enterprise payout rules' },
        ].map(card => {
          const Icon = card.icon;
          return (
            <div key={card.tab} onClick={() => onNavigate(card.tab)}
              style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px', cursor: 'pointer', position: 'relative', transition: 'border-color 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#00A9AC'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(192,57,43,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = 'none'; }}>
              {card.badge != null && card.badge > 0 && (
                <span style={{ position: 'absolute', top: 12, right: 12, background: '#00A9AC', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                  {card.badge}
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

      {/* Today's visit timeline */}
      <div style={{ marginTop: 28 }}>
        <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 16, color: '#1A1A1A', marginBottom: 14 }}>Today's Schedule Snapshot</div>
        <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F9FAFB' }}>
                {['Time', 'Customer', 'Service', 'Technician', 'State'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DISPATCH_VISITS.slice(0, 8).map((v, i) => {
                const stateColors: Record<string, { bg: string; color: string }> = {
                  completed:   { bg: '#D1FAE5', color: '#065F46' },
                  in_progress: { bg: '#DBEAFE', color: '#1E40AF' },
                  en_route:    { bg: '#FEF3C7', color: '#B45309' },
                  on_site:     { bg: '#EDE9FE', color: '#5B21B6' },
                  scheduled:   { bg: '#F3F4F6', color: '#4B5563' },
                  cancelled:   { bg: '#FEE2E2', color: '#991B1B' },
                };
                const sc = stateColors[v.visitState] ?? { bg: '#F3F4F6', color: '#4B5563' };
                return (
                  <tr key={v.id} style={{ borderTop: i > 0 ? '1px solid #E5E7EB' : 'none' }}>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: '#374151' }}>
                      {v.scheduledStart?.slice(11, 16) ?? '—'}
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1A1A1A' }}>{v.customerName}</td>
                    <td style={{ padding: '10px 14px', color: '#6B7280' }}>{v.serviceTypeId?.replace(/-/g, ' ')}</td>
                    <td style={{ padding: '10px 14px', color: '#374151' }}>{v.technicianId ? v.technicianId.replace('tech-', 'Tech ') : '—'}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ background: sc.bg, color: sc.color, borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                        {v.visitState.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function FieldServiceModule() {
  const [activeTab, setActiveTab] = useState<FSTab>('overview');

  const pendingAuths = MID_JOB_AUTHS.filter(a => a.status === 'pending').length;
  const atRisk = DISPATCH_VISITS.filter(v => v.atRisk).length;

  const tabsWithBadges = TABS.map(t => ({
    ...t,
    badge:
      t.id === 'auth'     ? pendingAuths :
      t.id === 'dispatch' ? atRisk :
      undefined,
  }));

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', minHeight: '100%' }}>
      {/* Module header */}
      <div style={{ marginBottom: 0 }}>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 800, color: '#1A1A1A', margin: 0 }}>
          Field Service Operations
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280', margin: '4px 0 0' }}>
          Dispatch, technician apps, invoicing, inventory, and team management — all in one place.
        </p>
      </div>

      {/* Tab navigation */}
      <div style={{ borderBottom: '1px solid #E5E7EB', marginTop: 20, overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 0, minWidth: 'max-content' }}>
          {tabsWithBadges.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7, padding: '12px 16px',
                  borderBottom: active ? '2.5px solid #00A9AC' : '2.5px solid transparent',
                  background: active ? '#E6F7F7' : 'transparent',
                  color: active ? '#00A9AC' : '#6B7280',
                  fontWeight: active ? 700 : 500,
                  fontSize: 13, cursor: 'pointer', border: 'none',
                  borderBottomStyle: 'solid',
                  transition: 'color 0.15s, background 0.15s',
                  position: 'relative',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={14} />
                {tab.label}
                {tab.badge != null && tab.badge > 0 && (
                  <span style={{ background: '#00A9AC', color: '#fff', borderRadius: '50%', minWidth: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, padding: '0 4px' }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ paddingTop: 20 }}>
        {activeTab === 'overview'    && <OverviewDashboard onNavigate={setActiveTab} />}
        {activeTab === 'dispatch'    && <DispatchBoard />}
        {activeTab === 'pwa'         && <TechnicianPWA />}
        {activeTab === 'invoices'    && <EstimateInvoice />}
        {activeTab === 'inventory'   && <TruckInventory />}
        {activeTab === 'auth'        && <MidJobAuth />}
        {activeTab === 'claims'      && <ClaimsAndRecs />}
        {activeTab === 'time'        && <TimeTracking />}
        {activeTab === 'commissions' && <CommissionTracking enabled={true} />}
      </div>
    </div>
  );
}

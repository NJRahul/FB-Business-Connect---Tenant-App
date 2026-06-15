import { useState } from 'react';
import {
  Shield, Building2, Flag, Megaphone, Lock, Wrench, FileText,
  ShieldCheck, Activity, LogOut, Menu, X, ChevronRight, AlertTriangle,
} from 'lucide-react';
import type { Tenant } from './types';
import { CURRENT_ADMIN } from './mockData';
import { TenantListView } from './TenantListView';
import { TenantDetailView } from './TenantDetailView';
import { FeatureFlagsView } from './FeatureFlagsView';
import { AnnouncementsView } from './AnnouncementsView';
import { IntegrationVaultView } from './IntegrationVaultView';
import { OperationalToolsView } from './OperationalToolsView';
import { AuditLogView } from './AuditLogView';
import { ComplianceDashboard } from './ComplianceDashboard';
import { StatusPageView } from './StatusPageView';

type Section =
  | 'tenants' | 'flags' | 'announcements' | 'vault'
  | 'tools' | 'auditlog' | 'compliance' | 'status';

interface NavItem { id: Section; label: string; icon: React.ElementType; group?: string }

const NAV_ITEMS: NavItem[] = [
  { id: 'tenants',       label: 'Tenants',        icon: Building2,   group: 'admin' },
  { id: 'flags',         label: 'Feature Flags',  icon: Flag,        group: 'admin' },
  { id: 'announcements', label: 'Announcements',  icon: Megaphone,   group: 'admin' },
  { id: 'vault',         label: 'Vault',          icon: Lock,        group: 'platform' },
  { id: 'tools',         label: 'Op Tools',       icon: Wrench,      group: 'platform' },
  { id: 'auditlog',      label: 'Audit Log',      icon: FileText,    group: 'security' },
  { id: 'compliance',    label: 'Compliance',     icon: ShieldCheck, group: 'security' },
  { id: 'status',        label: 'Status Page',    icon: Activity,    group: 'security' },
];

const GROUP_LABELS: Record<string, string> = {
  admin: 'Tenant Admin',
  platform: 'Platform',
  security: 'Security & Compliance',
};

interface Props {
  onExit: () => void;
}

export function PlatformAdminConsole({ onExit }: Props) {
  const [section, setSection] = useState<Section>('tenants');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const admin = CURRENT_ADMIN;

  function handleNavClick(id: Section) {
    setSection(id);
    setSelectedTenant(null);
    setMobileNavOpen(false);
  }

  function handleTenantSelect(t: Tenant) {
    setSelectedTenant(t);
  }

  const sectionTitle: Record<Section, string> = {
    tenants: 'Tenant Management',
    flags: 'Feature Flags',
    announcements: 'System Announcements',
    vault: 'Integration Vault',
    tools: 'Operational Tools',
    auditlog: 'Cross-Tenant Audit Log',
    compliance: 'Compliance Dashboard',
    status: 'Platform Status',
  };

  const groups = ['admin', 'platform', 'security'];

  function SidebarContent() {
    return (
      <>
        {/* Logo */}
        <div className="p-5 border-b" style={{ borderColor: '#1F2937' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[6px] flex items-center justify-center" style={{ background: '#DC2626' }}>
              <Shield size={16} color="#fff" />
            </div>
            <div>
              <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#F9FAFB', fontSize: '0.9rem' }}>TDForge</p>
              <p style={{ fontSize: '0.65rem', color: '#DC2626', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', lineHeight: 1 }}>Platform Admin</p>
            </div>
          </div>
        </div>

        {/* Warning badge */}
        <div className="mx-3 mt-3 mb-1 px-3 py-2 rounded-lg flex items-center gap-2" style={{ background: '#1F0A0A', border: '1px solid #3F1515' }}>
          <AlertTriangle size={12} color="#DC2626" />
          <span style={{ fontSize: '0.7rem', color: '#F87171', fontWeight: 600, letterSpacing: '0.04em' }}>INTERNAL USE ONLY</span>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto">
          {groups.map(group => {
            const items = NAV_ITEMS.filter(n => n.group === group);
            return (
              <div key={group} className="mb-4">
                <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.1em', paddingLeft: 8, marginBottom: 4 }}>
                  {GROUP_LABELS[group]}
                </p>
                {items.map(item => {
                  const active = section === item.id && !selectedTenant;
                  return (
                    <button key={item.id} onClick={() => handleNavClick(item.id)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-0.5 transition-all text-left"
                      style={{
                        background: active ? '#1F0A0A' : 'transparent',
                        color: active ? '#DC2626' : '#9CA3AF',
                        fontWeight: active ? 600 : 400,
                      }}
                      onMouseEnter={e => !active && (e.currentTarget.style.background = '#111827')}
                      onMouseLeave={e => !active && (e.currentTarget.style.background = 'transparent')}>
                      <item.icon size={15} />
                      {item.label}
                      {active && <ChevronRight size={13} className="ml-auto" style={{ color: '#DC2626' }} />}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Admin info + exit */}
        <div className="p-4 border-t" style={{ borderColor: '#1F2937' }}>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: '#1F0A0A', color: '#DC2626', fontWeight: 700, fontSize: '0.8rem' }}>
              {admin.name[0]}
            </div>
            <div className="min-w-0">
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#D1D5DB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{admin.name}</p>
              <p style={{ fontSize: '0.7rem', color: '#4B5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{admin.role}</p>
            </div>
          </div>
          <button onClick={onExit}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{ background: '#1F2937', color: '#6B7280', border: '1px solid #374151' }}>
            <LogOut size={12} /> Exit Admin Console
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="flex" style={{ height: '100vh', overflow: 'hidden', fontFamily: 'Inter, sans-serif', background: '#0A0F1E' }}>
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-56 xl:w-60 shrink-0" style={{ background: '#0D1526', borderRight: '1px solid #1F2937', height: '100vh' }}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMobileNavOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 flex flex-col" style={{ background: '#0D1526', borderRight: '1px solid #1F2937' }}>
            <button onClick={() => setMobileNavOpen(false)} className="absolute top-4 right-4 z-10" style={{ color: '#6B7280' }}>
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0" style={{ overflow: 'hidden' }}>
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ background: '#0D1526', borderBottom: '1px solid #1F2937' }}>
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setMobileNavOpen(true)} style={{ color: '#6B7280' }}>
              <Menu size={20} />
            </button>
            <div>
              <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#F9FAFB' }}>
                {selectedTenant ? selectedTenant.businessName : sectionTitle[section]}
              </h1>
              {selectedTenant && (
                <p style={{ fontSize: '0.75rem', color: '#4B5563' }}>
                  Tenant Admin &rsaquo; Tenants &rsaquo; {selectedTenant.businessName}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
              style={{ background: '#052E16', border: '1px solid #14532D' }}>
              <Shield size={11} color="#4ADE80" />
              <span style={{ fontSize: '0.7rem', color: '#4ADE80', fontWeight: 600 }}>MFA Active</span>
            </div>
            <span style={{ fontSize: '0.775rem', color: '#4B5563' }}>{admin.email}</span>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-6">
          {section === 'tenants' && !selectedTenant && (
            <TenantListView onSelect={handleTenantSelect} />
          )}
          {section === 'tenants' && selectedTenant && (
            <TenantDetailView tenant={selectedTenant} onBack={() => setSelectedTenant(null)} />
          )}
          {section === 'flags' && <FeatureFlagsView />}
          {section === 'announcements' && <AnnouncementsView />}
          {section === 'vault' && <IntegrationVaultView />}
          {section === 'tools' && <OperationalToolsView />}
          {section === 'auditlog' && <AuditLogView />}
          {section === 'compliance' && <ComplianceDashboard />}
          {section === 'status' && <StatusPageView />}
        </main>
      </div>
    </div>
  );
}

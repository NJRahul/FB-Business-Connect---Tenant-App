import { useState } from 'react';
import {
  LayoutDashboard, TrendingUp, List, CreditCard, ArrowLeftRight,
  FileText, Building2, Users, ShieldCheck, BarChart2, Clock, CheckCircle2,
  XCircle, AlertTriangle, ChevronRight, ArrowRight,
} from 'lucide-react';
import { BankingIntro } from './BankingIntro';
import { KYBWizard } from './KYBWizard';
import { AccountOverview } from './AccountOverview';
import { CashPosition } from './CashPosition';
import { LedgerPage } from './LedgerPage';
import { CardsPage } from './CardsPage';
import { FundingPayouts } from './FundingPayouts';
import { StatementsDisputes } from './StatementsDisputes';
import { PartnerBankDisclosure } from './PartnerBankDisclosure';
import { MOCK_ACCOUNT, MOCK_VAULTS } from './mockData';
import { BANKING_PERMISSIONS, formatCents } from '../../../lib/banking/types';
import type { BankingRole } from '../../../lib/banking/types';

// ─── Flow states ──────────────────────────────────────────────────────────────

type FlowState = 'eligibility' | 'intro' | 'kyb' | 'status' | 'active';
type ActiveTab = 'overview' | 'cash' | 'ledger' | 'cards' | 'transfers' | 'statements' | 'admin';

const ACTIVE_TABS: { id: ActiveTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview',   label: 'Overview',      icon: LayoutDashboard },
  { id: 'cash',       label: 'Cash position', icon: TrendingUp },
  { id: 'ledger',     label: 'Ledger',        icon: List },
  { id: 'cards',      label: 'Cards',         icon: CreditCard },
  { id: 'transfers',  label: 'Transfers',     icon: ArrowLeftRight },
  { id: 'statements', label: 'Statements',    icon: FileText },
  { id: 'admin',      label: 'Platform admin', icon: BarChart2 },
];

// ─── Platform admin view ──────────────────────────────────────────────────────

function PlatformAdminView() {
  const funnelStages = [
    { label: 'Eligible tenants',  count: 1842, pct: 100 },
    { label: 'Application started', count: 632, pct: 34 },
    { label: 'Submitted',         count: 581, pct: 32 },
    { label: 'Approved',          count: 487, pct: 26 },
    { label: 'Funded (deposit > R 0)', count: 391, pct: 21 },
    { label: 'Active (txn in 30d)', count: 318, pct: 17 },
  ];

  const tenants = [
    { id: 'shop1', name: 'Acme Tire Shop',    status: 'approved',      deposit_vol: 842341, interchange: 3214 },
    { id: 'shop2', name: 'Metro HVAC',        status: 'pending_review', deposit_vol: 0,      interchange: 0 },
    { id: 'shop3', name: 'GreenLawn Care',    status: 'denied',        deposit_vol: 0,      interchange: 0 },
    { id: 'shop4', name: 'QuickFix Electric', status: 'approved',      deposit_vol: 1298500,interchange: 5821 },
  ];

  const statusCfg: Record<string, { label: string; color: string; bg: string }> = {
    approved:       { label: 'Approved',    color: '#27AE60', bg: '#F0FDF4' },
    pending_review: { label: 'In review',   color: '#F39C12', bg: '#FFF8E1' },
    denied:         { label: 'Denied',      color: '#00BFC3', bg: '#F0FBFB' },
    submitted:      { label: 'Submitted',   color: '#2980B9', bg: '#EBF5FB' },
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-[8px] flex items-center gap-2" style={{ background: '#FFF8E1', border: '1px solid #FDE68A' }}>
        <ShieldCheck size={15} style={{ color: '#F39C12' }} />
        <p style={{ color: '#92400E', fontSize: '0.875rem' }}>
          <strong>Platform admin view.</strong> Read-only. Staff cannot initiate transfers, view full card numbers, or modify tenant accounts. Support requires raising a partner ticket.
        </p>
      </div>

      {/* Funnel */}
      <div className="rounded-[10px] overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: '#E5E7EB', background: '#F9FAFB' }}>
          <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>Banking adoption funnel</p>
        </div>
        <div className="p-5 space-y-3">
          {funnelStages.map((stage, i) => (
            <div key={stage.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span style={{ color: '#374151', fontSize: '0.9375rem' }}>{stage.label}</span>
                <div className="flex items-center gap-3">
                  <span style={{ fontFeatureSettings: '"tnum"', fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>{stage.count.toLocaleString()}</span>
                  <span style={{ color: '#9CA3AF', fontSize: '0.8125rem', width: 40, textAlign: 'right' }}>{stage.pct}%</span>
                </div>
              </div>
              <div className="rounded-full overflow-hidden h-2" style={{ background: '#F3F4F6' }}>
                <div className="h-2 rounded-full" style={{ width: `${stage.pct}%`, background: i === 0 ? '#6B7280' : i < 4 ? '#F39C12' : '#27AE60' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-tenant table */}
      <div className="rounded-[10px] overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: '#E5E7EB', background: '#F9FAFB' }}>
          <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>Tenant accounts</p>
        </div>
        <div>
          <div className="grid px-5 py-2.5 text-xs font-semibold" style={{ gridTemplateColumns: '1fr 120px 130px 130px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Tenant</span>
            <span>Status</span>
            <span>Deposit vol. (30d)</span>
            <span>Interchange (30d)</span>
          </div>
          <div className="divide-y" style={{ borderColor: '#F3F4F6' }}>
            {tenants.map(t => {
              const sc = statusCfg[t.status] ?? statusCfg.submitted;
              return (
                <div key={t.id} className="grid px-5 py-3.5 items-center" style={{ gridTemplateColumns: '1fr 120px 130px 130px', background: '#fff' }}>
                  <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.9375rem' }}>{t.name}</p>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold w-fit" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                  <p style={{ fontFeatureSettings: '"tnum"', color: t.deposit_vol ? '#1A1A1A' : '#9CA3AF', fontWeight: t.deposit_vol ? 600 : 400 }}>
                    {t.deposit_vol ? formatCents(t.deposit_vol) : '—'}
                  </p>
                  <p style={{ fontFeatureSettings: '"tnum"', color: t.interchange ? '#1A1A1A' : '#9CA3AF', fontWeight: t.interchange ? 600 : 400 }}>
                    {t.interchange ? formatCents(t.interchange) : '—'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Roles demo banner ────────────────────────────────────────────────────────

function RoleBanner({ role, onRoleChange }: { role: BankingRole; onRoleChange: (r: BankingRole) => void }) {
  const perms = BANKING_PERMISSIONS[role];
  return (
    <div className="mb-4 p-3 rounded-[8px] flex flex-wrap items-center gap-3" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
      <span style={{ fontSize: '0.8125rem', color: '#6B7280', fontWeight: 600 }}>Demo role:</span>
      <div className="flex gap-1">
        {(['owner', 'admin', 'bookkeeper', 'tech'] as BankingRole[]).map(r => (
          <button key={r} onClick={() => onRoleChange(r)}
            className="px-3 py-1 rounded-full text-xs font-semibold capitalize"
            style={{ background: role === r ? '#1A1A1A' : '#F3F4F6', color: role === r ? '#fff' : '#6B7280' }}>
            {r}
          </button>
        ))}
      </div>
      <div className="flex gap-2 ml-auto flex-wrap">
        {[
          { label: 'Transfers', can: perms.initiate_transfer },
          { label: 'Approve',   can: perms.approve_transfer },
          { label: 'Cards',     can: perms.issue_freeze_cards },
          { label: 'Export',    can: perms.export_accounting },
        ].map(p => (
          <span key={p.label} className="flex items-center gap-1 text-xs" style={{ color: p.can ? '#27AE60' : '#00BFC3' }}>
            {p.can ? <CheckCircle2 size={11} /> : <XCircle size={11} />} {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main module ──────────────────────────────────────────────────────────────

interface Props {
  tenant?: { businessName: string; email: string; planTier: string; industryPack?: string; ein?: string };
}

export function BankingModule({ tenant }: Props) {
  const [flow, setFlow] = useState<FlowState>('intro');
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [role, setRole] = useState<BankingRole>('owner');

  const perms = BANKING_PERMISSIONS[role];

  // For demo, treat as EIN-eligible (real app would derive from tenant profile)
  const hasEIN = !!(tenant?.ein) || true;
  const isUS = true;

  // ─── Eligibility / Intro ───────────────────────────────────────────────────

  if (flow === 'eligibility' || flow === 'intro') {
    return (
      <div style={{ marginTop: -24, marginLeft: -24, marginRight: -24, height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
        <BankingIntro
          hasEIN={hasEIN}
          isUS={isUS}
          onGetStarted={() => setFlow('kyb')}
          onSkipToDemo={() => setFlow('active')}
        />
      </div>
    );
  }

  // ─── KYB wizard ───────────────────────────────────────────────────────────

  if (flow === 'kyb') {
    return (
      <div style={{ marginTop: -24, marginLeft: -24, marginRight: -24, height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
        <KYBWizard
          tenantName={tenant?.businessName ?? 'Your Shop LLC'}
          tenantEmail={tenant?.email ?? ''}
          industryPack={tenant?.industryPack ?? 'tires'}
          ein={tenant?.ein ?? ''}
          onApproved={() => setFlow('active')}
          onExternalAccount={() => setFlow('eligibility')}
        />
      </div>
    );
  }

  // ─── Active account — tab layout ───────────────────────────────────────────

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1A1A1A' }}>

      {/* Demo role controls */}
      <RoleBanner role={role} onRoleChange={setRole} />

      {/* Demo navigation */}
      <div className="mb-4 flex items-center gap-2">
        <button onClick={() => setFlow('intro')} className="px-2.5 py-1 rounded-[6px] text-xs" style={{ border: '1px solid #E5E7EB', color: '#9CA3AF' }}>
          ← Back to intro
        </button>
        <button onClick={() => setFlow('kyb')} className="px-2.5 py-1 rounded-[6px] text-xs" style={{ border: '1px solid #E5E7EB', color: '#9CA3AF' }}>
          Demo: KYB wizard
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-0.5 mb-6 overflow-x-auto" style={{ borderBottom: '2px solid #E5E7EB' }}>
        {ACTIVE_TABS.filter(t => {
          if (t.id === 'transfers'  && !perms.initiate_transfer) return false;
          if (t.id === 'cards'      && !perms.issue_freeze_cards && !perms.own_assigned_card) return false;
          if (t.id === 'statements' && !perms.export_accounting) return false;
          return true;
        }).map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold whitespace-nowrap"
              style={{
                borderBottom: active ? '2px solid #1A1A1A' : '2px solid transparent',
                marginBottom: -2,
                color: active ? '#1A1A1A' : '#6B7280',
                background: 'transparent',
              }}>
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'overview'   && <AccountOverview account={MOCK_ACCOUNT} vaults={MOCK_VAULTS} />}
      {activeTab === 'cash'       && <CashPosition account={MOCK_ACCOUNT} vaults={MOCK_VAULTS} />}
      {activeTab === 'ledger'     && <LedgerPage />}
      {activeTab === 'cards'      && <CardsPage />}
      {activeTab === 'transfers'  && perms.initiate_transfer && <FundingPayouts />}
      {activeTab === 'statements' && <StatementsDisputes />}
      {activeTab === 'admin'      && <PlatformAdminView />}

      {/* Role gate messages */}
      {activeTab === 'transfers' && !perms.initiate_transfer && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: '#F3F4F6' }}>
            <ShieldCheck size={22} style={{ color: '#9CA3AF' }} />
          </div>
          <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '1rem' }}>Transfer access not available</p>
          <p style={{ color: '#9CA3AF', fontSize: '0.9375rem', marginTop: 4 }}>The <strong>{role}</strong> role does not have permission to initiate transfers.</p>
        </div>
      )}

      {/* PartnerBankDisclosure — pinned footer below main content */}
      <div style={{ marginTop: 40 }}>
        <PartnerBankDisclosure />
      </div>
    </div>
  );
}

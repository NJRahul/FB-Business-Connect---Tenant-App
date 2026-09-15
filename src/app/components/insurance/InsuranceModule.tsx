import { useState } from 'react';
import {
  LayoutGrid, FileText, Award, RefreshCw, AlertTriangle, BarChart2,
  CheckCircle2, XCircle,
} from 'lucide-react';
import { CoverageCatalog } from './CoverageCatalog';
import { ApplicationWizard } from './ApplicationWizard';
import { PolicyManagement } from './PolicyManagement';
import { COIBuilder } from './COIBuilder';
import { RenewalsPage } from './RenewalsPage';
import { ClaimsPage } from './ClaimsPage';
import { InsuranceAdmin } from './InsuranceAdmin';
import { AgencyDisclosure } from './AgencyDisclosure';
import { computeRequirements } from './requirementEngine';
import { REQUIREMENT_RULES, DEMO_TENANT_CONTEXT, MOCK_POLICIES } from './mockData';
import { INSURANCE_PERMISSIONS } from '../../../lib/insurance/types';
import type { InsuranceRole } from '../../../lib/insurance/types';

type ActiveTab = 'catalog' | 'policies' | 'coi' | 'renewals' | 'claims' | 'admin';

const TABS: { id: ActiveTab; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'catalog',  label: 'Coverage catalog', icon: LayoutGrid },
  { id: 'policies', label: 'Policies',         icon: FileText   },
  { id: 'coi',      label: 'Certificates',     icon: Award      },
  { id: 'renewals', label: 'Renewals',         icon: RefreshCw  },
  { id: 'claims',   label: 'Claims',           icon: AlertTriangle },
  { id: 'admin',    label: 'Platform admin',   icon: BarChart2  },
];

function RoleBanner({ role, onRoleChange }: { role: InsuranceRole; onRoleChange: (r: InsuranceRole) => void }) {
  const perms = INSURANCE_PERMISSIONS[role];
  return (
    <div className="mb-4 p-3 rounded-[8px] flex flex-wrap items-center gap-3" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
      <span style={{ fontSize: '0.8125rem', color: '#6B7280', fontWeight: 600 }}>Demo role:</span>
      <div className="flex gap-1">
        {(['owner', 'admin', 'bookkeeper', 'tech'] as InsuranceRole[]).map(r => (
          <button key={r} onClick={() => onRoleChange(r)}
            className="px-3 py-1 rounded-full text-xs font-semibold capitalize"
            style={{ background: role === r ? '#1A1A1A' : '#F3F4F6', color: role === r ? '#fff' : '#6B7280' }}>
            {r}
          </button>
        ))}
      </div>
      <div className="flex gap-3 ml-auto flex-wrap">
        {[
          { label: 'View policies', can: perms.view_policies },
          { label: 'Bind',          can: perms.bind_policy },
          { label: 'COI',           can: perms.issue_coi },
          { label: 'File claim',    can: perms.file_fnol },
        ].map(p => (
          <span key={p.label} className="flex items-center gap-1 text-xs" style={{ color: p.can ? '#27AE60' : '#00BFC3' }}>
            {p.can ? <CheckCircle2 size={11} /> : <XCircle size={11} />} {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}

interface Props {
  tenant?: { businessName: string; email: string; planTier: string; industryPack?: string; ein?: string; state?: string; teamSize?: number; vehicleCount?: number };
}

export function InsuranceModule({ tenant }: Props) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('catalog');
  const [role, setRole] = useState<InsuranceRole>('owner');
  const [applyingFor, setApplyingFor] = useState<string | null>(null);
  const [focusPolicyId, setFocusPolicyId] = useState<string | null>(null);

  const perms = INSURANCE_PERMISSIONS[role];

  const tenantContext = {
    ...DEMO_TENANT_CONTEXT,
    industry_pack: tenant?.industryPack ?? DEMO_TENANT_CONTEXT.industry_pack,
  };
  const requirements = computeRequirements(tenantContext, REQUIREMENT_RULES);

  const tenantInfo = {
    businessName: tenant?.businessName ?? 'Acme Tire Shop',
    email: tenant?.email ?? '',
    state: tenant?.state ?? 'TX',
    ein: tenant?.ein ?? '82-1234567',
    teamSize: tenant?.teamSize ?? 8,
    vehicleCount: tenant?.vehicleCount ?? 3,
  };

  // Application wizard fullscreen overlay
  if (applyingFor) {
    return (
      <div style={{ fontFamily: 'Inter, sans-serif', color: '#1A1A1A' }}>
        <div className="rounded-[10px] p-6" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
          <ApplicationWizard
            initialCoverageTypeId={applyingFor}
            tenant={tenantInfo}
            onComplete={() => { setApplyingFor(null); setActiveTab('policies'); }}
            onBack={() => setApplyingFor(null)}
          />
        </div>
        <div style={{ marginTop: 32 }}>
          <AgencyDisclosure />
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1A1A1A' }}>
      <RoleBanner role={role} onRoleChange={setRole} />

      {/* Tab bar */}
      <div className="flex gap-0.5 mb-6 overflow-x-auto" style={{ borderBottom: '2px solid #E5E7EB' }}>
        {TABS.filter(t => {
          if (t.id === 'policies' && !perms.view_policies) return false;
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
      {activeTab === 'catalog' && (
        <CoverageCatalog
          requirements={requirements}
          policies={MOCK_POLICIES}
          onStartApplication={id => {
            if (perms.start_application) {
              setApplyingFor(id);
            }
          }}
          onViewPolicy={id => { setFocusPolicyId(id); setActiveTab('policies'); }}
        />
      )}

      {activeTab === 'policies' && (
        <PolicyManagement canViewPolicies={perms.view_policies} initialPolicyId={focusPolicyId} />
      )}

      {activeTab === 'coi' && (
        <COIBuilder canIssueCOI={perms.issue_coi} />
      )}

      {activeTab === 'renewals' && <RenewalsPage />}

      {activeTab === 'claims' && (
        <ClaimsPage canFileClaim={perms.file_fnol} />
      )}

      {activeTab === 'admin' && <InsuranceAdmin />}

      {/* Role gate for start_application on catalog */}
      {activeTab === 'catalog' && !perms.start_application && (
        <div className="mt-4 flex items-center gap-2 p-3 rounded-[8px]" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
          <XCircle size={14} style={{ color: '#9CA3AF' }} />
          <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
            The <strong>{role}</strong> role cannot start applications. An Owner can begin a new coverage application.
          </p>
        </div>
      )}

      <div style={{ marginTop: 40 }}>
        <AgencyDisclosure />
      </div>
    </div>
  );
}

import { useState } from 'react';
import {
  Shield, Package, Car, Truck, Wrench, HeartHandshake, Building2,
  Wifi, BadgeCheck, Users, Umbrella, ChevronRight, Info, CheckCircle2, AlertCircle, Circle,
} from 'lucide-react';
import type { CoverageType, RequirementResult, InsurancePolicy } from '../../../lib/insurance/types';
import { formatCents } from '../../../lib/insurance/types';
import { COVERAGE_TYPES, MOCK_POLICIES } from './mockData';

const ICON_MAP: Record<string, React.ElementType> = {
  shield: Shield, package: Package, car: Car, truck: Truck, wrench: Wrench,
  'heart-handshake': HeartHandshake, 'building-2': Building2, wifi: Wifi,
  'badge-check': BadgeCheck, users: Users, umbrella: Umbrella,
};

function RequirementBadge({ level }: { level: RequirementResult['level'] | undefined }) {
  if (!level) return null;
  const cfg = {
    required:         { label: 'Required',          color: '#C0392B', bg: '#FEF2F2' },
    commonly_carried: { label: 'Commonly carried',   color: '#F39C12', bg: '#FFF8E1' },
    optional:         { label: 'Optional',           color: '#6B7280', bg: '#F3F4F6' },
  }[level];
  return (
    <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

function DistributionBadge({ mode }: { mode: CoverageType['distribution_mode'] }) {
  if (mode === 'embedded_bind') return null;
  return (
    <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: '#EBF5FB', color: '#2980B9' }}>
      Referral
    </span>
  );
}

function PolicyStatusChip({ status }: { status: InsurancePolicy['status'] }) {
  const cfg = {
    active:    { label: 'Active',    color: '#27AE60', bg: '#F0FDF4' },
    pending:   { label: 'Pending',   color: '#F39C12', bg: '#FFF8E1' },
    lapsed:    { label: 'Lapsed',    color: '#E74C3C', bg: '#FEF2F2' },
    cancelled: { label: 'Cancelled', color: '#E74C3C', bg: '#FEF2F2' },
    expired:   { label: 'Expired',   color: '#6B7280', bg: '#F3F4F6' },
  }[status];
  return (
    <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

interface Props {
  requirements: Map<string, RequirementResult>;
  policies: InsurancePolicy[];
  onStartApplication: (coverageTypeId: string) => void;
  onViewPolicy: (policyId: string) => void;
}

export function CoverageCatalog({ requirements, policies, onStartApplication, onViewPolicy }: Props) {
  const [tooltip, setTooltip] = useState<string | null>(null);

  const policyByCoverage = new Map<string, InsurancePolicy>();
  for (const p of policies) policyByCoverage.set(p.coverage_type_id, p);

  const sorted = [...COVERAGE_TYPES].sort((a, b) => {
    const ra = requirements.get(a.id);
    const rb = requirements.get(b.id);
    const rank = (r?: RequirementResult) => !r ? 0 : r.level === 'required' ? 3 : r.level === 'commonly_carried' ? 2 : 1;
    return rank(rb) - rank(ra) || a.sort_order - b.sort_order;
  });

  return (
    <div>
      <div className="mb-5">
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.25rem', fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>
          Coverage catalog
        </h2>
        <p style={{ color: '#6B7280', fontSize: '0.9375rem' }}>
          Coverage guidance is based on your business profile. All decisions are yours to make.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-5 p-3 rounded-[8px]" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
        {[
          { icon: <AlertCircle size={13} style={{ color: '#C0392B' }} />, label: 'Required by your profile' },
          { icon: <CheckCircle2 size={13} style={{ color: '#F39C12' }} />, label: 'Commonly carried' },
          { icon: <Circle size={13} style={{ color: '#6B7280' }} />, label: 'Optional' },
          { icon: <CheckCircle2 size={13} style={{ color: '#27AE60' }} />, label: 'Policy active' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            {item.icon}
            <span style={{ fontSize: '0.8125rem', color: '#6B7280' }}>{item.label}</span>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {sorted.map(ct => {
          const req = requirements.get(ct.id);
          const policy = policyByCoverage.get(ct.id);
          const Icon = ICON_MAP[ct.icon] ?? Shield;

          const borderColor = policy
            ? '#BBF7D0'
            : req?.level === 'required'
            ? '#FECACA'
            : req?.level === 'commonly_carried'
            ? '#FDE68A'
            : '#E5E7EB';

          return (
            <div
              key={ct.id}
              className="rounded-[10px] p-5"
              style={{ background: '#fff', border: `1.5px solid ${borderColor}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-[8px] flex items-center justify-center flex-shrink-0" style={{ background: '#F3F4F6' }}>
                  <Icon size={20} style={{ color: '#1A1A1A' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>{ct.display_name}</p>
                    {req && <RequirementBadge level={req.level} />}
                    <DistributionBadge mode={ct.distribution_mode} />
                    {policy && <PolicyStatusChip status={policy.status} />}
                  </div>
                  <p style={{ color: '#6B7280', fontSize: '0.875rem', lineHeight: 1.55 }}>{ct.plain_description}</p>

                  {req && (
                    <div className="flex items-start gap-1.5 mt-2">
                      <Info size={12} style={{ color: '#9CA3AF', marginTop: 2, flexShrink: 0 }} />
                      <p style={{ color: '#9CA3AF', fontSize: '0.8125rem', lineHeight: 1.5 }}>{req.reason}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-3">
                    <span style={{ color: '#6B7280', fontSize: '0.8125rem' }}>
                      Typical:{' '}
                      <span style={{ color: '#1A1A1A', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                        {formatCents(ct.typical_premium_low)}–{formatCents(ct.typical_premium_high)}
                      </span>
                      {' '}/yr
                    </span>
                    {policy && (
                      <span style={{ color: '#1A1A1A', fontSize: '0.8125rem', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                        Your premium: {formatCents(policy.premium)}/yr
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  {policy ? (
                    <button
                      onClick={() => onViewPolicy(policy.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-[6px] text-sm font-semibold"
                      style={{ background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' }}
                    >
                      View policy <ChevronRight size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={() => onStartApplication(ct.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-[6px] text-sm font-semibold"
                      style={{ background: '#1A1A1A', color: '#fff' }}
                    >
                      {ct.distribution_mode === 'referral' ? 'Get referral' : 'Get quotes'} <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { CheckCircle2, Lock, Shield, AlertTriangle, Zap, Star } from 'lucide-react';
import { CAPABILITY_DEFINITIONS } from './mockData';
import { PLAN_CONFIGS, type PlanTier, type CapabilityKey } from './types';

const TIER_ORDER: PlanTier[] = ['starter', 'pro', 'enterprise'];
const TIER_ICONS: Record<PlanTier, React.ElementType> = { starter: Zap, pro: Star, enterprise: Shield };
const TIER_COLORS: Record<PlanTier, string> = { starter: '#6B7280', pro: '#00A9AC', enterprise: '#1A1A1A' };

const CATEGORY_LABEL: Record<string, { label: string; desc: string }> = {
  feature:  { label: 'Feature Gates',  desc: 'UI and API features enabled by plan tier' },
  volume:   { label: 'Volume Gates',   desc: 'Quantity limits enforced at the API level' },
  behavior: { label: 'Behavior Gates', desc: 'Platform-level behavior and SLA commitments' },
};

function renderValue(val: string | boolean | number) {
  if (val === true)  return <CheckCircle2 size={15} color="#27AE60" />;
  if (val === false) return <Lock size={13} color="#D1D5DB" />;
  return <span style={{ fontSize: 12, color: '#374151' }}>{String(val)}</span>;
}

function tierHasCapability(cap: typeof CAPABILITY_DEFINITIONS[0], tier: PlanTier): boolean {
  const tIdx = TIER_ORDER.indexOf(tier);
  const rIdx = TIER_ORDER.indexOf(cap.requiredTier);
  return tIdx >= rIdx;
}

interface Props {
  currentPlan: PlanTier;
}

export function CapabilitiesView({ currentPlan }: Props) {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = ['all', 'feature', 'volume', 'behavior'] as const;
  const filtered = filterCategory === 'all' ? CAPABILITY_DEFINITIONS : CAPABILITY_DEFINITIONS.filter(c => c.category === filterCategory);
  const grouped = {
    feature:  filtered.filter(c => c.category === 'feature'),
    volume:   filtered.filter(c => c.category === 'volume'),
    behavior: filtered.filter(c => c.category === 'behavior'),
  };

  const lockedCount = CAPABILITY_DEFINITIONS.filter(c => !tierHasCapability(c, currentPlan)).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Enforcement layer info */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {[
          { layer: 'UI Layer',       desc: 'Features are visible but shown as locked with upgrade CTA. Never hidden.', color: '#7E22CE', bg: '#FDF4FF', icon: '👁️' },
          { layer: 'API Layer',      desc: 'Server-side check on every request. Returns structured error with upgrade CTA.', color: '#2563EB', bg: '#EFF6FF', icon: '⚡' },
          { layer: 'Database Layer', desc: 'Row-Level Security in Postgres. No data access possible without plan gate.', color: '#15803D', bg: '#F0FDF4', icon: '🔒' },
        ].map(l => (
          <div key={l.layer} style={{ padding: '14px 16px', borderRadius: 10, background: l.bg, border: `1px solid ${l.color}22` }}>
            <div style={{ fontSize: 16, marginBottom: 6 }}>{l.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: l.color, marginBottom: 4 }}>{l.layer}</div>
            <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>{l.desc}</div>
          </div>
        ))}
      </div>

      {/* Gate error example */}
      <div style={{ padding: '12px 16px', borderRadius: 8, background: '#E6F7F7', border: '1.5px solid #00A9AC' }}>
        <div style={{ fontWeight: 700, fontSize: 12, color: '#00A9AC', marginBottom: 6 }}>EXAMPLE GATE ERROR (API response when limit exceeded)</div>
        <pre style={{ margin: 0, fontSize: 11, color: '#374151', fontFamily: 'monospace', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
{`{
  "error": "CAPABILITY_GATE",
  "code": "MULTI_LOCATION_LIMIT_EXCEEDED",
  "message": "Your Starter plan allows 1 location. You have 1 location configured.",
  "upgrade_cta": {
    "label": "Upgrade to Pro for up to 5 locations",
    "url": "/billing/upgrade"
  }
}`}
        </pre>
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {lockedCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: '#FFFBEB', border: '1px solid #FDE68A' }}>
            <AlertTriangle size={13} color="#D97706" />
            <span style={{ fontSize: 12, color: '#92400E', fontWeight: 600 }}>{lockedCount} capabilities locked on your plan</span>
          </div>
        )}
        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              style={{
                padding: '5px 12px', borderRadius: 99, border: '1px solid',
                borderColor: filterCategory === cat ? '#00A9AC' : '#E5E7EB',
                background: filterCategory === cat ? '#E6F7F7' : '#fff',
                color: filterCategory === cat ? '#00A9AC' : '#6B7280',
                fontWeight: 600, fontSize: 12, cursor: 'pointer',
              }}
            >
              {cat === 'all' ? 'All' : CATEGORY_LABEL[cat].label}
            </button>
          ))}
        </div>
      </div>

      {/* Capability matrix */}
      {(Object.entries(grouped) as [string, typeof CAPABILITY_DEFINITIONS][]).map(([cat, caps]) => {
        if (caps.length === 0) return null;
        const catMeta = CATEGORY_LABEL[cat];
        return (
          <div key={cat} style={{ border: '1px solid #E5E7EB', borderRadius: 12, background: '#fff', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #E5E7EB', background: '#F9FAFB' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1A1A1A' }}>{catMeta.label}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{catMeta.desc}</div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em', width: '40%', borderBottom: '1px solid #E5E7EB' }}>Capability</th>
                  {TIER_ORDER.map(tier => {
                    const Icon = TIER_ICONS[tier];
                    const isCurrent = tier === currentPlan;
                    return (
                      <th key={tier} style={{
                        padding: '10px 16px', textAlign: 'center', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
                        color: isCurrent ? '#00A9AC' : '#6B7280',
                        background: isCurrent ? '#E6F7F7' : 'transparent',
                        borderBottom: '1px solid #E5E7EB',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                          <Icon size={12} color={TIER_COLORS[tier]} />
                          {PLAN_CONFIGS[tier].name}
                        </div>
                        {isCurrent && <div style={{ fontSize: 9, marginTop: 2 }}>YOUR PLAN</div>}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {caps.map((cap, i) => {
                  const currentlyHas = tierHasCapability(cap, currentPlan);
                  return (
                    <tr key={cap.key} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                      <td style={{ padding: '12px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          {!currentlyHas && <Lock size={12} color="#D1D5DB" style={{ marginTop: 2, flexShrink: 0 }} />}
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: currentlyHas ? '#1A1A1A' : '#9CA3AF' }}>{cap.label}</div>
                            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{cap.description}</div>
                            {!currentlyHas && (
                              <div style={{ marginTop: 4, fontSize: 11, color: '#00A9AC', fontWeight: 600 }}>
                                Available on {PLAN_CONFIGS[cap.requiredTier].name}
                                {cap.requiredTier === 'enterprise' ? '' : ' and above'}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      {TIER_ORDER.map(tier => {
                        const val = tier === 'starter' ? cap.starterValue : tier === 'pro' ? cap.proValue : cap.enterpriseValue;
                        const isCurrent = tier === currentPlan;
                        return (
                          <td key={tier} style={{ padding: '12px 16px', textAlign: 'center', background: isCurrent ? 'rgba(253,237,236,0.3)' : 'transparent' }}>
                            {renderValue(val)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

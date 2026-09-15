import { useState } from 'react';
import {
  Plus, ChevronDown, ChevronUp, Star, Tag, Zap, Package,
  CheckCircle2, XCircle, Edit3, ToggleLeft, ToggleRight,
  Users, RefreshCw, Shield,
} from 'lucide-react';
import { SERVICE_PLANS } from './mockData';
import type { ServicePlan, PlanTier, Entitlement } from './types';

const CADENCE_LABEL: Record<string, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annual: 'Annual',
};

const CANCEL_LABEL: Record<string, string> = {
  end_of_period: 'End of period',
  immediate_proration: 'Immediate + proration',
  term_locked: 'Term-locked',
};

function entitlementIcon(e: Entitlement) {
  if (e.type === 'free_service') return <CheckCircle2 size={13} style={{ color: '#27AE60', flexShrink: 0 }} />;
  if (e.type === 'discount') return <Tag size={13} style={{ color: '#F39C12', flexShrink: 0 }} />;
  if (e.type === 'priority_booking') return <Zap size={13} style={{ color: '#8B5CF6', flexShrink: 0 }} />;
  return <Package size={13} style={{ color: '#1D4ED8', flexShrink: 0 }} />;
}

function entitlementLabel(e: Entitlement): string {
  if (e.type === 'free_service') return `${e.quantityPerPeriod}× free ${e.serviceName} / period`;
  if (e.type === 'discount') return e.label;
  if (e.type === 'priority_booking') return e.description;
  return `Included: ${e.addonName}`;
}

function TierCard({ tier, planColor }: { tier: PlanTier; planColor: string }) {
  return (
    <div
      className="rounded-[8px] p-4"
      style={{
        border: tier.highlight ? `2px solid ${planColor}` : '1.5px solid #E5E7EB',
        background: tier.highlight ? '#FAFAFA' : '#fff',
        position: 'relative',
      }}
    >
      {tier.highlight && (
        <div
          className="absolute -top-3 left-4 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1"
          style={{ background: planColor, color: '#fff' }}
        >
          <Star size={10} />
          Most Popular
        </div>
      )}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>{tier.name}</p>
          <p style={{ color: planColor, fontWeight: 800, fontSize: '1.25rem', fontFamily: 'Sora, sans-serif' }}>
            ${tier.price.toFixed(2)}
          </p>
        </div>
        <button
          className="flex items-center gap-1 text-xs px-2 py-1 rounded-[5px]"
          style={{ border: '1px solid #E5E7EB', color: '#6B7280' }}
        >
          <Edit3 size={11} /> Edit
        </button>
      </div>
      <div className="space-y-1.5">
        {tier.entitlements.map((e, i) => (
          <div key={i} className="flex items-start gap-2">
            {entitlementIcon(e)}
            <span style={{ color: '#374151', fontSize: '0.8125rem' }}>{entitlementLabel(e)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlanCard({ plan }: { plan: ServicePlan }) {
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState(plan.active);

  return (
    <div
      className="bg-white rounded-[12px]"
      style={{
        border: '1.5px solid #E5E7EB',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        borderTop: `4px solid ${plan.color}`,
        opacity: active ? 1 : 0.65,
      }}
    >
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.0625rem' }}>
                {plan.name}
              </h3>
              <span
                className="px-1.5 py-0.5 rounded text-xs font-bold uppercase"
                style={{ background: active ? '#DCFCE7' : '#F3F4F6', color: active ? '#16A34A' : '#9CA3AF' }}
              >
                {active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p style={{ color: '#6B7280', fontSize: '0.8125rem', lineHeight: 1.5 }}>{plan.description}</p>
          </div>
          <button
            onClick={() => setActive(a => !a)}
            title={active ? 'Deactivate plan' : 'Activate plan'}
            style={{ color: active ? plan.color : '#D1D5DB', flexShrink: 0 }}
          >
            {active ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: '#F3F4F6', color: '#374151' }}>
            <RefreshCw size={10} /> {CADENCE_LABEL[plan.billingCadence]}
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: '#F3F4F6', color: '#374151' }}>
            <Shield size={10} /> {plan.termMonths}mo term
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: '#F3F4F6', color: '#374151' }}>
            <Users size={10} /> {plan.tiers.length} tier{plan.tiers.length !== 1 ? 's' : ''}
          </span>
          {plan.customerSelfEnrollable && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
              Self-enroll
            </span>
          )}
          {plan.autoRenew && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: '#F0FDF4', color: '#16A34A' }}>
              Auto-renew
            </span>
          )}
        </div>

        <div className="mt-3 pt-3" style={{ borderTop: '1px solid #F3F4F6' }}>
          <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
            Cancel policy: <span style={{ color: '#374151', fontWeight: 600 }}>{CANCEL_LABEL[plan.cancellationPolicy]}</span>
          </p>
          {plan.exclusions.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {plan.exclusions.map((ex, i) => (
                <span key={i} className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs" style={{ background: '#F0FBFB', color: '#005F62' }}>
                  <XCircle size={9} /> {ex}
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setExpanded(x => !x)}
          className="mt-4 flex items-center gap-1.5 text-sm font-semibold"
          style={{ color: plan.color }}
        >
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          {expanded ? 'Hide' : 'Show'} tiers & entitlements
        </button>
      </div>

      {/* Tiers */}
      {expanded && (
        <div className="px-5 pb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {plan.tiers.map(tier => (
              <TierCard key={tier.id} tier={tier} planColor={plan.color} />
            ))}
            <button
              className="rounded-[8px] p-4 flex flex-col items-center justify-center gap-2 text-sm font-semibold"
              style={{ border: '1.5px dashed #D1D5DB', color: '#9CA3AF', minHeight: '80px' }}
            >
              <Plus size={18} />
              Add Tier
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CreatePlanModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-white rounded-[14px] w-full max-w-lg p-6" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.125rem' }}>
            New Service Plan
          </h3>
          <button onClick={onClose} style={{ color: '#9CA3AF' }}>✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block mb-1" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>Plan Name</label>
            <input className="w-full px-3 py-2 rounded-[6px] text-sm" style={{ border: '1.5px solid #E5E7EB', outline: 'none', color: '#1A1A1A' }} placeholder="e.g. HVAC Maintenance Plan" />
          </div>
          <div>
            <label className="block mb-1" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>Description</label>
            <textarea rows={2} className="w-full px-3 py-2 rounded-[6px] text-sm resize-none" style={{ border: '1.5px solid #E5E7EB', outline: 'none', color: '#1A1A1A' }} placeholder="Short customer-facing description" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>Billing Cadence</label>
              <select className="w-full px-3 py-2 rounded-[6px] text-sm" style={{ border: '1.5px solid #E5E7EB', outline: 'none', color: '#1A1A1A' }}>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
            <div>
              <label className="block mb-1" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>Term (months)</label>
              <input type="number" className="w-full px-3 py-2 rounded-[6px] text-sm" style={{ border: '1.5px solid #E5E7EB', outline: 'none', color: '#1A1A1A' }} defaultValue={12} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>Cancellation Policy</label>
              <select className="w-full px-3 py-2 rounded-[6px] text-sm" style={{ border: '1.5px solid #E5E7EB', outline: 'none', color: '#1A1A1A' }}>
                <option value="end_of_period">End of period</option>
                <option value="immediate_proration">Immediate + proration</option>
                <option value="term_locked">Term-locked</option>
              </select>
            </div>
            <div>
              <label className="block mb-1" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>Plan Color</label>
              <input type="color" className="w-full h-9 rounded-[6px] cursor-pointer" style={{ border: '1.5px solid #E5E7EB' }} defaultValue="#00A9AC" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm" style={{ color: '#374151', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked className="accent-red-600" />
              Auto-renew
            </label>
            <label className="flex items-center gap-2 text-sm" style={{ color: '#374151', cursor: 'pointer' }}>
              <input type="checkbox" className="accent-red-600" />
              Customer self-enrollable
            </label>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-[8px] text-sm font-semibold" style={{ border: '1.5px solid #E5E7EB', color: '#6B7280' }}>
            Cancel
          </button>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-[8px] text-sm font-semibold text-white" style={{ background: '#00A9AC' }}>
            Create Plan
          </button>
        </div>
      </div>
    </div>
  );
}

export function PlansGridView() {
  const [plans] = useState<ServicePlan[]>(SERVICE_PLANS);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.125rem' }}>Service Plans</h2>
          <p style={{ color: '#6B7280', fontSize: '0.8125rem', marginTop: '2px' }}>
            Define plans, tiers, entitlements, and billing rules. Click a plan to expand tiers.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-[8px] text-sm font-semibold text-white"
          style={{ background: '#00A9AC' }}
        >
          <Plus size={15} /> New Plan
        </button>
      </div>

      <div className="space-y-4">
        {plans.map(plan => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>

      {showCreate && <CreatePlanModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

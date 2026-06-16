import { useState } from 'react';
import { Star, Check, CreditCard, Landmark, ChevronRight, X, Car } from 'lucide-react';
import { SERVICE_PLANS } from './mockData';
import type { ServicePlan, PlanTier } from './types';

function entitlementLabel(e: { type: string; [k: string]: unknown }): string {
  if (e.type === 'free_service') return `${(e as { quantityPerPeriod: number }).quantityPerPeriod}× free ${(e as { serviceName: string }).serviceName}`;
  if (e.type === 'discount') return (e as { label: string }).label;
  if (e.type === 'priority_booking') return (e as { description: string }).description;
  return `Included: ${(e as { addonName: string }).addonName}`;
}

// ─── Step 1: Select Plan ────────────────────────────────────────────────────

function StepPlan({ selected, onSelect }: { selected: ServicePlan | null; onSelect: (p: ServicePlan) => void }) {
  return (
    <div className="space-y-3">
      <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '12px' }}>
        Choose the plan to enroll this customer in.
      </p>
      {SERVICE_PLANS.filter(p => p.active).map(plan => (
        <button
          key={plan.id}
          onClick={() => onSelect(plan)}
          className="w-full text-left rounded-[10px] p-4 transition-all"
          style={{
            border: selected?.id === plan.id ? `2px solid ${plan.color}` : '1.5px solid #E5E7EB',
            background: selected?.id === plan.id ? '#FAFAFA' : '#fff',
            borderLeft: `4px solid ${plan.color}`,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>{plan.name}</p>
              <p style={{ color: '#6B7280', fontSize: '0.8125rem', marginTop: '2px' }}>{plan.description}</p>
              <p style={{ color: plan.color, fontSize: '0.75rem', fontWeight: 600, marginTop: '4px' }}>
                {plan.tiers.length} tier{plan.tiers.length !== 1 ? 's' : ''} · {plan.billingCadence} billing · {plan.termMonths}mo term
              </p>
            </div>
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style={{
                border: `2px solid ${selected?.id === plan.id ? plan.color : '#D1D5DB'}`,
                background: selected?.id === plan.id ? plan.color : 'transparent',
              }}
            >
              {selected?.id === plan.id && <Check size={11} color="#fff" strokeWidth={3} />}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Step 2: Select Tier ────────────────────────────────────────────────────

function StepTier({ plan, selected, onSelect }: { plan: ServicePlan; selected: PlanTier | null; onSelect: (t: PlanTier) => void }) {
  return (
    <div className="space-y-3">
      <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '12px' }}>
        Choose a tier for <strong style={{ color: '#1A1A1A' }}>{plan.name}</strong>.
      </p>
      {plan.tiers.map(tier => (
        <button
          key={tier.id}
          onClick={() => onSelect(tier)}
          className="w-full text-left rounded-[10px] p-4 transition-all"
          style={{
            border: selected?.id === tier.id ? `2px solid ${plan.color}` : '1.5px solid #E5E7EB',
            background: selected?.id === tier.id ? '#FAFAFA' : '#fff',
            position: 'relative',
          }}
        >
          {tier.highlight && (
            <span
              className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1"
              style={{ background: plan.color, color: '#fff' }}
            >
              <Star size={9} fill="#fff" /> Most Popular
            </span>
          )}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>{tier.name}</p>
              <p style={{ color: plan.color, fontWeight: 800, fontSize: '1.125rem', fontFamily: 'Sora, sans-serif', marginTop: '2px' }}>
                ${tier.price.toFixed(2)} <span style={{ fontWeight: 400, fontSize: '0.8125rem', color: '#9CA3AF' }}>/ {plan.billingCadence}</span>
              </p>
              <ul className="mt-2 space-y-1">
                {tier.entitlements.map((e, i) => (
                  <li key={i} style={{ color: '#374151', fontSize: '0.8125rem' }}>• {entitlementLabel(e as Parameters<typeof entitlementLabel>[0])}</li>
                ))}
              </ul>
            </div>
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-1"
              style={{
                border: `2px solid ${selected?.id === tier.id ? plan.color : '#D1D5DB'}`,
                background: selected?.id === tier.id ? plan.color : 'transparent',
              }}
            >
              {selected?.id === tier.id && <Check size={11} color="#fff" strokeWidth={3} />}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Step 3: Billing Method ────────────────────────────────────────────────

type BillingOpt = 'card' | 'ach';

function StepBilling({ selected, onSelect }: { selected: BillingOpt | null; onSelect: (b: BillingOpt) => void }) {
  return (
    <div className="space-y-3">
      <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '12px' }}>
        Select the customer's payment method for recurring charges.
      </p>
      {[
        { id: 'card' as BillingOpt, label: 'Credit / Debit Card', sub: 'Visa, Mastercard, Amex — via Stripe', icon: CreditCard },
        { id: 'ach' as BillingOpt, label: 'ACH Bank Transfer', sub: 'US bank account via Stripe ACH', icon: Landmark },
      ].map(opt => {
        const Icon = opt.icon;
        return (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className="w-full text-left rounded-[10px] p-4 flex items-center gap-4"
            style={{
              border: selected === opt.id ? '2px solid #C0392B' : '1.5px solid #E5E7EB',
              background: selected === opt.id ? '#FEFEFE' : '#fff',
            }}
          >
            <div className="w-10 h-10 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
              <Icon size={20} style={{ color: selected === opt.id ? '#C0392B' : '#9CA3AF' }} />
            </div>
            <div className="flex-1">
              <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.9375rem' }}>{opt.label}</p>
              <p style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>{opt.sub}</p>
            </div>
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{
                border: `2px solid ${selected === opt.id ? '#C0392B' : '#D1D5DB'}`,
                background: selected === opt.id ? '#C0392B' : 'transparent',
              }}
            >
              {selected === opt.id && <Check size={11} color="#fff" strokeWidth={3} />}
            </div>
          </button>
        );
      })}

      <div className="mt-4 p-3 rounded-[8px]" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
        <p style={{ color: '#6B7280', fontSize: '0.8125rem' }}>
          <strong style={{ color: '#1A1A1A' }}>Stripe handles recurring charges.</strong> The customer's card or bank account will be charged automatically on the billing cadence. A mandate will be sent to their email.
        </p>
      </div>
    </div>
  );
}

// ─── Step 4: Confirm ───────────────────────────────────────────────────────

function StepConfirm({ plan, tier, billing, vehicle }: { plan: ServicePlan; tier: PlanTier; billing: BillingOpt; vehicle: string }) {
  const PayIcon = billing === 'card' ? CreditCard : Landmark;

  return (
    <div className="space-y-4">
      <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>Review enrollment details before confirming.</p>

      <div className="rounded-[10px] p-4 space-y-3" style={{ border: '1.5px solid #E5E7EB', background: '#FAFAFA' }}>
        <div className="flex items-center gap-2 pb-2" style={{ borderBottom: '1px solid #F3F4F6' }}>
          <div className="w-3 h-3 rounded-full" style={{ background: plan.color }} />
          <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>{plan.name}</p>
          <span className="ml-auto px-2 py-0.5 rounded text-xs font-bold" style={{ background: '#DCFCE7', color: '#16A34A' }}>
            {tier.name}
          </span>
        </div>

        {[
          { label: 'Vehicle', value: vehicle, icon: Car },
          { label: 'Price', value: `$${tier.price.toFixed(2)} / ${plan.billingCadence}`, icon: CreditCard },
          { label: 'Payment', value: billing === 'card' ? 'Credit / Debit Card (Stripe)' : 'ACH Bank Transfer', icon: PayIcon },
          { label: 'Term Start', value: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), icon: null },
          { label: 'Term End', value: (() => { const d = new Date(); d.setMonth(d.getMonth() + plan.termMonths); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); })(), icon: null },
          { label: 'Auto-renew', value: plan.autoRenew ? 'Yes — customer notified 30 days prior' : 'No', icon: null },
          { label: 'Cancellation', value: plan.cancellationPolicy === 'end_of_period' ? 'End of period' : plan.cancellationPolicy === 'immediate_proration' ? 'Immediate + proration' : 'Term-locked', icon: null },
        ].map(row => (
          <div key={row.label} className="flex items-center justify-between gap-2">
            <span style={{ color: '#9CA3AF', fontSize: '0.8125rem', minWidth: '90px' }}>{row.label}</span>
            <span style={{ color: '#1A1A1A', fontSize: '0.875rem', fontWeight: 500, textAlign: 'right' }}>{row.value}</span>
          </div>
        ))}
      </div>

      <div className="p-3 rounded-[8px]" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
        <p style={{ color: '#1D4ED8', fontSize: '0.8125rem' }}>
          Enrollment activates immediately. Stripe will initiate the first charge now and set up recurring billing.
        </p>
      </div>
    </div>
  );
}

// ─── Main Modal ────────────────────────────────────────────────────────────

interface EnrollmentModalProps {
  customerName: string;
  onClose: () => void;
  onComplete: () => void;
}

const STEPS = ['Select Plan', 'Select Tier', 'Payment Method', 'Confirm'];

export function EnrollmentModal({ customerName, onClose, onComplete }: EnrollmentModalProps) {
  const [step, setStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<ServicePlan | null>(null);
  const [selectedTier, setSelectedTier] = useState<PlanTier | null>(null);
  const [selectedBilling, setSelectedBilling] = useState<BillingOpt | null>(null);
  const [success, setSuccess] = useState(false);

  const vehicle = '2022 Toyota RAV4'; // demo

  const canAdvance =
    (step === 0 && selectedPlan !== null) ||
    (step === 1 && selectedTier !== null) ||
    (step === 2 && selectedBilling !== null) ||
    step === 3;

  function handleNext() {
    if (step < 3) {
      if (step === 0 && selectedPlan) setSelectedTier(null);
      setStep(s => s + 1);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
        <div className="bg-white rounded-[14px] w-full max-w-md p-8 text-center" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#DCFCE7' }}>
            <Check size={28} style={{ color: '#16A34A' }} strokeWidth={2.5} />
          </div>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.25rem', marginBottom: '8px' }}>
            Enrollment Confirmed
          </h3>
          <p style={{ color: '#6B7280', fontSize: '0.9375rem' }}>
            {customerName} is now enrolled in <strong style={{ color: '#1A1A1A' }}>{selectedPlan?.name} — {selectedTier?.name}</strong>. Stripe will process the first charge and send a confirmation email.
          </p>
          <button
            onClick={onComplete}
            className="mt-6 w-full py-2.5 rounded-[8px] text-sm font-semibold text-white"
            style={{ background: '#C0392B' }}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-white rounded-[14px] w-full max-w-lg flex flex-col" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.18)', maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4" style={{ borderBottom: '1px solid #F3F4F6' }}>
          <div>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.0625rem' }}>
              Enroll Customer
            </h3>
            <p style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>{customerName} · {vehicle}</p>
          </div>
          <button onClick={onClose}><X size={18} style={{ color: '#9CA3AF' }} /></button>
        </div>

        {/* Step indicators */}
        <div className="flex items-center px-6 py-3" style={{ borderBottom: '1px solid #F3F4F6' }}>
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: i < step ? '#C0392B' : i === step ? '#C0392B' : '#F3F4F6',
                    color: i <= step ? '#fff' : '#9CA3AF',
                  }}
                >
                  {i < step ? <Check size={12} strokeWidth={3} /> : i + 1}
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: i === step ? 700 : 400, color: i === step ? '#C0392B' : i < step ? '#374151' : '#9CA3AF' }}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 mx-2 h-px" style={{ background: i < step ? '#C0392B' : '#E5E7EB' }} />
              )}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 0 && <StepPlan selected={selectedPlan} onSelect={p => setSelectedPlan(p)} />}
          {step === 1 && selectedPlan && <StepTier plan={selectedPlan} selected={selectedTier} onSelect={t => setSelectedTier(t)} />}
          {step === 2 && <StepBilling selected={selectedBilling} onSelect={b => setSelectedBilling(b)} />}
          {step === 3 && selectedPlan && selectedTier && selectedBilling && (
            <StepConfirm plan={selectedPlan} tier={selectedTier} billing={selectedBilling} vehicle={vehicle} />
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4" style={{ borderTop: '1px solid #F3F4F6' }}>
          {step > 0 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              className="px-4 py-2.5 rounded-[8px] text-sm font-semibold"
              style={{ border: '1.5px solid #E5E7EB', color: '#6B7280' }}
            >
              Back
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-[8px] text-sm font-semibold"
              style={{ border: '1.5px solid #E5E7EB', color: '#6B7280' }}
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canAdvance}
            className="flex-1 py-2.5 rounded-[8px] text-sm font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: canAdvance ? '#C0392B' : '#F3F4F6', color: canAdvance ? '#fff' : '#D1D5DB', cursor: canAdvance ? 'pointer' : 'not-allowed' }}
          >
            {step === 3 ? 'Confirm & Enroll' : 'Continue'}
            {step < 3 && <ChevronRight size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
}

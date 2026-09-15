import { useState } from 'react';
import { CheckCircle2, Lock, ArrowUp, ArrowDown, AlertTriangle, X, Zap, Star, Shield } from 'lucide-react';

type PlanTier = 'starter' | 'pro' | 'enterprise';

interface PlanManagementProps {
  currentPlan: PlanTier;
  onPlanChange: (plan: PlanTier) => void;
}

const PLAN_FEATURES = [
  { feature: 'Locations', starter: '1', pro: 'Up to 5', enterprise: 'Unlimited' },
  { feature: 'Customer records', starter: '500', pro: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'Tire catalog', starter: 'Basic', pro: 'Full + custom', enterprise: 'Full + custom' },
  { feature: 'Distributor connections', starter: '1', pro: '3', enterprise: 'Unlimited' },
  { feature: 'Stripe payouts', starter: true, pro: true, enterprise: true },
  { feature: 'SMS campaigns', starter: false, pro: true, enterprise: true },
  { feature: 'Email campaigns', starter: 'Basic', pro: 'Advanced', enterprise: 'Advanced' },
  { feature: 'Multi-location routing', starter: false, pro: true, enterprise: true },
  { feature: 'Custom domain', starter: false, pro: true, enterprise: true },
  { feature: 'License plate / VIN lookup', starter: false, pro: true, enterprise: true },
  { feature: 'Per-location hours', starter: false, pro: true, enterprise: true },
  { feature: 'Custom roles', starter: false, pro: 'Limited', enterprise: true },
  { feature: 'SAML SSO', starter: false, pro: false, enterprise: true },
  { feature: 'API access', starter: false, pro: false, enterprise: true },
  { feature: 'Analytics & reporting', starter: 'Basic', pro: 'Advanced', enterprise: 'Advanced + custom' },
  { feature: 'Data import / CSV', starter: true, pro: true, enterprise: true },
  { feature: 'QuickBooks import', starter: false, pro: true, enterprise: true },
  { feature: 'Support', starter: 'Email', pro: 'Phone + Email', enterprise: 'Dedicated manager' },
  { feature: 'SLA guarantee', starter: false, pro: false, enterprise: true },
];

const PLANS = [
  {
    id: 'starter' as PlanTier,
    name: 'Starter',
    price: 49,
    period: '/mo',
    description: 'Perfect for single-location shops',
    icon: Zap,
    color: '#6B7280',
  },
  {
    id: 'pro' as PlanTier,
    name: 'Pro',
    price: 149,
    period: '/mo',
    description: 'For growing multi-location businesses',
    icon: Star,
    color: '#00A9AC',
    popular: true,
  },
  {
    id: 'enterprise' as PlanTier,
    name: 'Enterprise',
    price: null,
    period: '',
    description: 'For large chains and franchises',
    icon: Shield,
    color: '#1A1A1A',
  },
];

type ModalType = 'upgrade' | 'downgrade' | null;

export function PlanManagement({ currentPlan, onPlanChange }: PlanManagementProps) {
  const [modal, setModal] = useState<{ type: ModalType; target: PlanTier | null }>({ type: null, target: null });
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const planOrder: PlanTier[] = ['starter', 'pro', 'enterprise'];
  const currentIndex = planOrder.indexOf(currentPlan);

  const handleAction = (target: PlanTier) => {
    const targetIndex = planOrder.indexOf(target);
    if (targetIndex > currentIndex) {
      setModal({ type: 'upgrade', target });
    } else if (targetIndex < currentIndex) {
      setModal({ type: 'downgrade', target });
    }
  };

  const confirmAction = async () => {
    if (!modal.target) return;
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1500));
    setProcessing(false);
    if (modal.type === 'upgrade') {
      setSuccessMessage(`Upgraded to ${modal.target.charAt(0).toUpperCase() + modal.target.slice(1)}! Changes are active immediately.`);
      onPlanChange(modal.target);
    } else {
      setSuccessMessage(`Downgrade to ${modal.target.charAt(0).toUpperCase() + modal.target.slice(1)} scheduled for end of billing period.`);
    }
    setModal({ type: null, target: null });
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const renderCell = (val: boolean | string) => {
    if (val === true) return <CheckCircle2 size={16} style={{ color: '#27AE60' }} />;
    if (val === false) return <span style={{ color: '#D1D5DB' }}>—</span>;
    return <span style={{ color: '#1A1A1A', fontSize: '0.8125rem' }}>{val}</span>;
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="mb-6">
        <h1 style={{ fontFamily: 'Sora, sans-serif', color: '#1A1A1A', fontSize: '1.5rem', fontWeight: 700 }}>Plan & Billing</h1>
        <p style={{ color: '#6B7280', fontSize: '0.9375rem', marginTop: '4px' }}>Manage your subscription and compare plan features</p>
      </div>

      {successMessage && (
        <div className="flex items-center gap-3 p-4 rounded-[8px] mb-6" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <CheckCircle2 size={18} style={{ color: '#27AE60' }} />
          <p style={{ color: '#15803D', fontWeight: 500, fontSize: '0.9375rem' }}>{successMessage}</p>
          <button onClick={() => setSuccessMessage('')} className="ml-auto">
            <X size={16} style={{ color: '#9CA3AF' }} />
          </button>
        </div>
      )}

      {/* Current plan card */}
      <div className="bg-white rounded-[8px] p-6 mb-8" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Current Plan</p>
            <div className="flex items-center gap-3 mt-2">
              <h2 style={{ fontFamily: 'Sora, sans-serif', color: '#1A1A1A', fontSize: '1.75rem', fontWeight: 700 }}>
                {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
              </h2>
              <span className="px-2.5 py-1 rounded-[4px]" style={{ background: '#E6F7F7', color: '#00A9AC', fontSize: '0.75rem', fontWeight: 700 }}>
                ACTIVE
              </span>
            </div>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>
              {currentPlan === 'starter' && 'Renews monthly · R 3,499/mo'}
              {currentPlan === 'pro' && 'Renews monthly · R 8,999/mo'}
              {currentPlan === 'enterprise' && 'Annual contract · Custom pricing'}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-[6px] transition-colors" style={{ border: '1.5px solid #E5E7EB', color: '#6B7280', fontSize: '0.875rem', fontWeight: 500, background: '#fff' }}>
              View Invoices
            </button>
            <button className="px-4 py-2 rounded-[6px] transition-colors" style={{ border: '1.5px solid #E5E7EB', color: '#6B7280', fontSize: '0.875rem', fontWeight: 500, background: '#fff' }}>
              Update Payment
            </button>
          </div>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {PLANS.map(plan => {
          const Icon = plan.icon;
          const isCurrent = currentPlan === plan.id;
          const targetIndex = planOrder.indexOf(plan.id);
          const isUpgrade = targetIndex > currentIndex;
          const isDowngrade = targetIndex < currentIndex;

          return (
            <div
              key={plan.id}
              className="relative bg-white rounded-[8px] p-5"
              style={{
                boxShadow: isCurrent ? '0 0 0 2px #00A9AC, 0 4px 12px rgba(192,57,43,0.15)' : '0 1px 3px rgba(0,0,0,0.08)',
                border: isCurrent ? '2px solid #00A9AC' : '2px solid #E5E7EB',
              }}
            >
              {plan.popular && !isCurrent && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-white" style={{ background: '#00A9AC', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  MOST POPULAR
                </span>
              )}
              {isCurrent && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-white" style={{ background: '#27AE60', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  YOUR PLAN
                </span>
              )}

              <div className="flex items-center gap-2 mb-3">
                <Icon size={18} style={{ color: plan.color }} />
                <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: plan.color, fontSize: '1.0625rem' }}>{plan.name}</span>
              </div>
              <p style={{ color: '#1A1A1A', fontWeight: 700, fontSize: '1.625rem', fontFamily: 'Sora, sans-serif' }}>
                {plan.price ? `R ${plan.price}` : 'Custom'}
                {plan.price && <span style={{ color: '#9CA3AF', fontWeight: 400, fontSize: '0.875rem' }}>/mo</span>}
              </p>
              <p style={{ color: '#6B7280', fontSize: '0.8125rem', marginTop: '4px', marginBottom: '16px' }}>{plan.description}</p>

              {isCurrent ? (
                <button disabled className="w-full py-2 rounded-[6px]" style={{ background: '#F0FDF4', color: '#27AE60', fontWeight: 600, fontSize: '0.875rem', border: '1px solid #BBF7D0' }}>
                  Current Plan ✓
                </button>
              ) : isUpgrade ? (
                <button
                  onClick={() => handleAction(plan.id)}
                  className="w-full py-2 rounded-[6px] text-white flex items-center justify-center gap-2 transition-colors"
                  style={{ background: '#00A9AC', fontWeight: 600, fontSize: '0.875rem' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#007F82')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#00A9AC')}
                >
                  <ArrowUp size={14} /> Upgrade to {plan.name}
                </button>
              ) : (
                <button
                  onClick={() => handleAction(plan.id)}
                  className="w-full py-2 rounded-[6px] flex items-center justify-center gap-2 transition-colors"
                  style={{ border: '1.5px solid #E5E7EB', color: '#6B7280', fontWeight: 600, fontSize: '0.875rem', background: '#fff' }}
                >
                  <ArrowDown size={14} /> Downgrade to {plan.name}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Feature comparison table */}
      <div className="bg-white rounded-[8px] overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <div className="p-5 border-b" style={{ borderColor: '#E5E7EB' }}>
          <h3 style={{ color: '#1A1A1A', fontWeight: 700, fontSize: '1.0625rem', fontFamily: 'Sora, sans-serif' }}>Full Feature Comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: '500px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                <th className="text-left px-5 py-3" style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', width: '40%' }}>Feature</th>
                {PLANS.map(plan => (
                  <th key={plan.id} className="text-center px-4 py-3" style={{ color: currentPlan === plan.id ? '#00A9AC' : '#6B7280', fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', background: currentPlan === plan.id ? '#E6F7F7' : 'transparent' }}>
                    {plan.name}
                    {currentPlan === plan.id && <span className="block" style={{ fontSize: '0.6rem', marginTop: '2px' }}>YOUR PLAN</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PLAN_FEATURES.map((row, i) => (
                <tr key={row.feature} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                  <td className="px-5 py-3" style={{ color: '#1A1A1A', fontSize: '0.875rem' }}>{row.feature}</td>
                  {(['starter', 'pro', 'enterprise'] as const).map(plan => (
                    <td key={plan} className="text-center px-4 py-3" style={{ background: currentPlan === plan ? 'rgba(253,237,236,0.4)' : 'transparent' }}>
                      {renderCell(row[plan])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upgrade/Downgrade Modal */}
      {modal.type && modal.target && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-[8px] p-6 max-w-md w-full" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: modal.type === 'upgrade' ? '#E6F7F7' : '#FFF7ED' }}>
                  {modal.type === 'upgrade' ? <ArrowUp size={20} style={{ color: '#DC2626' }} /> : <AlertTriangle size={20} style={{ color: '#F39C12' }} />}
                </div>
                <h3 style={{ fontFamily: 'Sora, sans-serif', color: '#1A1A1A', fontWeight: 700, fontSize: '1.125rem' }}>
                  {modal.type === 'upgrade' ? 'Confirm Upgrade' : 'Confirm Downgrade'}
                </h3>
              </div>
              <button onClick={() => setModal({ type: null, target: null })}>
                <X size={20} style={{ color: '#9CA3AF' }} />
              </button>
            </div>

            {modal.type === 'upgrade' ? (
              <div>
                <p style={{ color: '#6B7280', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                  Upgrading to <strong style={{ color: '#1A1A1A' }}>{modal.target.charAt(0).toUpperCase() + modal.target.slice(1)}</strong> will take effect immediately. Your billing will be prorated for the remainder of this cycle.
                </p>
                <div className="mt-4 p-4 rounded-[8px]" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                  <p style={{ color: '#15803D', fontSize: '0.875rem', fontWeight: 600 }}>Prorated amount today</p>
                  <p style={{ color: '#15803D', fontSize: '1.25rem', fontWeight: 700, marginTop: '4px' }}>~$67.00</p>
                  <p style={{ color: '#6B7280', fontSize: '0.75rem', marginTop: '4px' }}>16 days remaining in billing period</p>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ color: '#6B7280', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                  Downgrading to <strong style={{ color: '#1A1A1A' }}>{modal.target.charAt(0).toUpperCase() + modal.target.slice(1)}</strong> will take effect at the end of your current billing period.
                </p>
                <div className="mt-4 p-4 rounded-[8px]" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={16} style={{ color: '#F39C12', marginTop: '2px' }} />
                    <div>
                      <p style={{ color: '#92400E', fontSize: '0.875rem', fontWeight: 600 }}>Features you'll lose</p>
                      <ul className="mt-2 space-y-1">
                        {['Multi-location routing', 'SMS campaigns', 'Custom domain', 'License plate lookup'].map(f => (
                          <li key={f} style={{ color: '#92400E', fontSize: '0.8125rem' }}>• {f}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="mt-3 p-3 rounded-[6px]" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                  <p style={{ color: '#6B7280', fontSize: '0.8125rem' }}>
                    ⚠️ You'll receive a 14-day warning email before downgrade activates.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModal({ type: null, target: null })}
                className="flex-1 py-2.5 rounded-[6px]"
                style={{ border: '1.5px solid #E5E7EB', color: '#6B7280', fontWeight: 600, fontSize: '0.9375rem', background: '#fff' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                disabled={processing}
                className="flex-1 py-2.5 rounded-[6px] text-white flex items-center justify-center gap-2 transition-colors"
                style={{ background: processing ? '#9CA3AF' : modal.type === 'upgrade' ? '#00A9AC' : '#F39C12', fontWeight: 600, fontSize: '0.9375rem' }}
              >
                {processing ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                ) : modal.type === 'upgrade' ? 'Upgrade Now' : 'Schedule Downgrade'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

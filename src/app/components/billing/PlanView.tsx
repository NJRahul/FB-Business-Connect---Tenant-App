import React, { useState } from 'react';
import {
  Zap, Star, Shield, ArrowUp, ArrowDown, Check, X, AlertTriangle,
  CreditCard, Calendar, CheckCircle2, ExternalLink,
} from 'lucide-react';
import { SUBSCRIPTION, ACTIVE_COMMITMENTS } from './mockData';
import { PLAN_CONFIGS, type PlanTier } from './types';

const PLAN_ICONS: Record<PlanTier, React.ElementType> = { starter: Zap, pro: Star, enterprise: Shield };
const PLAN_COLORS: Record<PlanTier, string> = { starter: '#6B7280', pro: '#C0392B', enterprise: '#1A1A1A' };

const PLAN_FEATURES = [
  { label: 'Monthly price',          starter: '$199/mo',       pro: '$499/mo',       enterprise: 'Custom' },
  { label: 'Annual price (−15%)',    starter: '$169/mo',       pro: '$424/mo',       enterprise: 'Custom' },
  { label: 'Locations',              starter: '1',             pro: 'Up to 5',       enterprise: 'Unlimited' },
  { label: 'Customer records',       starter: '500',           pro: 'Unlimited',     enterprise: 'Unlimited' },
  { label: 'SMS inclusion/mo',       starter: '1,000',         pro: '10,000',        enterprise: 'Unlimited' },
  { label: 'Distributor connections',starter: '1',             pro: '3',             enterprise: 'Unlimited' },
  { label: 'Application fee',        starter: '1.5%',          pro: '0.5%',          enterprise: '0%' },
  { label: 'Stripe payouts',         starter: true,            pro: true,            enterprise: true },
  { label: 'SMS campaigns',          starter: false,           pro: true,            enterprise: true },
  { label: 'Email campaigns',        starter: 'Basic',         pro: 'Advanced',      enterprise: 'Advanced' },
  { label: 'Custom domain',          starter: false,           pro: true,            enterprise: true },
  { label: 'VIN / Plate lookup',     starter: false,           pro: true,            enterprise: true },
  { label: 'Multi-location routing', starter: false,           pro: true,            enterprise: true },
  { label: 'QuickBooks import',      starter: false,           pro: true,            enterprise: true },
  { label: 'Custom roles',           starter: false,           pro: 'Limited',       enterprise: true },
  { label: 'Advanced analytics',     starter: 'Basic',         pro: 'Advanced',      enterprise: 'Advanced + custom' },
  { label: 'API access',             starter: false,           pro: false,           enterprise: true },
  { label: 'SAML SSO',              starter: false,           pro: false,           enterprise: true },
  { label: 'White-label invoices',   starter: false,           pro: false,           enterprise: true },
  { label: 'Support',                starter: 'Email',         pro: 'Phone + Email', enterprise: 'Dedicated manager' },
  { label: 'SLA guarantee',          starter: false,           pro: false,           enterprise: true },
];

function renderCell(val: boolean | string) {
  if (val === true)  return <CheckCircle2 size={15} color="#27AE60" />;
  if (val === false) return <span style={{ color: '#D1D5DB', fontSize: 16 }}>—</span>;
  return <span style={{ fontSize: 12, color: '#374151' }}>{val}</span>;
}

interface Props {
  currentPlan: PlanTier;
  onPlanChange: (p: PlanTier) => void;
  onDunningDemo: () => void;
}

export function PlanView({ currentPlan, onPlanChange, onDunningDemo }: Props) {
  const [interval, setInterval]     = useState<'monthly' | 'annual'>(SUBSCRIPTION.billingInterval);
  const [modal, setModal]           = useState<{ type: 'upgrade' | 'downgrade' | 'blocked'; target: PlanTier } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess]       = useState('');

  const planOrder: PlanTier[] = ['starter', 'pro', 'enterprise'];
  const curIdx = planOrder.indexOf(currentPlan);

  function handlePlanClick(target: PlanTier) {
    const tgtIdx = planOrder.indexOf(target);
    if (tgtIdx === curIdx) return;
    if (tgtIdx > curIdx) {
      setModal({ type: 'upgrade', target });
    } else {
      // Check blocking commitments
      if (ACTIVE_COMMITMENTS.length > 0 && target === 'starter') {
        setModal({ type: 'blocked', target });
      } else {
        setModal({ type: 'downgrade', target });
      }
    }
  }

  async function confirmAction() {
    if (!modal) return;
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1400));
    setProcessing(false);
    if (modal.type === 'upgrade') {
      onPlanChange(modal.target);
      setSuccess(`Upgraded to ${PLAN_CONFIGS[modal.target].name}! Changes are active immediately.`);
    } else {
      setSuccess(`Downgrade to ${PLAN_CONFIGS[modal.target].name} scheduled for end of billing period (Jun 30).`);
    }
    setModal(null);
    setTimeout(() => setSuccess(''), 5000);
  }

  const cfg = PLAN_CONFIGS[currentPlan];
  const displayPrice = interval === 'annual' ? cfg.annualMonthlyPrice : cfg.monthlyPrice;
  const nextBilling  = new Date(SUBSCRIPTION.currentPeriodEnd).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Success banner */}
      {success && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 8, background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <CheckCircle2 size={16} color="#27AE60" />
          <span style={{ fontSize: 13, color: '#15803D', fontWeight: 500, flex: 1 }}>{success}</span>
          <button onClick={() => setSuccess('')} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={14} color="#9CA3AF" /></button>
        </div>
      )}

      {/* Current plan card */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, background: '#fff', padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Current Plan</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 28, color: '#1A1A1A' }}>{cfg.name}</div>
              <span style={{ padding: '3px 10px', borderRadius: 99, background: '#F0FDF4', color: '#15803D', fontSize: 11, fontWeight: 700 }}>ACTIVE</span>
              {SUBSCRIPTION.billingInterval === 'annual' && (
                <span style={{ padding: '3px 10px', borderRadius: 99, background: '#EFF6FF', color: '#2563EB', fontSize: 11, fontWeight: 700 }}>ANNUAL −15%</span>
              )}
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6B7280' }}>
                <CreditCard size={13} />
                {SUBSCRIPTION.cardBrand} ···· {SUBSCRIPTION.cardLast4}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6B7280' }}>
                <Calendar size={13} />
                Next billing: <strong style={{ color: '#374151' }}>{nextBilling}</strong>
              </div>
              <div style={{ fontSize: 13, color: '#6B7280' }}>
                {displayPrice !== null ? (
                  <><strong style={{ color: '#374151', fontFamily: 'Sora, sans-serif', fontSize: 16 }}>${displayPrice}</strong>/mo</>
                ) : (
                  <strong style={{ color: '#374151' }}>Contract pricing</strong>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onDunningDemo}
              style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', color: '#6B7280', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              Simulate Failed Payment
            </button>
            <button style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <ExternalLink size={12} /> Stripe Portal
            </button>
          </div>
        </div>
      </div>

      {/* Billing interval toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: interval === 'monthly' ? '#1A1A1A' : '#9CA3AF' }}>Monthly</span>
        <div
          onClick={() => setInterval(v => v === 'monthly' ? 'annual' : 'monthly')}
          style={{ width: 44, height: 24, borderRadius: 99, background: interval === 'annual' ? '#C0392B' : '#D1D5DB', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}
        >
          <div style={{ position: 'absolute', top: 2, left: interval === 'annual' ? 22 : 2, width: 20, height: 20, borderRadius: 99, background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: interval === 'annual' ? '#1A1A1A' : '#9CA3AF' }}>Annual</span>
        <span style={{ padding: '2px 8px', borderRadius: 99, background: '#FDEDEC', color: '#C0392B', fontSize: 11, fontWeight: 700 }}>Save 15%</span>
      </div>

      {/* Plan cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {(['starter', 'pro', 'enterprise'] as PlanTier[]).map(tier => {
          const p = PLAN_CONFIGS[tier];
          const Icon = PLAN_ICONS[tier];
          const color = PLAN_COLORS[tier];
          const isCurrent = tier === currentPlan;
          const tgtIdx = planOrder.indexOf(tier);
          const isUpgrade = tgtIdx > curIdx;
          const price = interval === 'annual' ? p.annualMonthlyPrice : p.monthlyPrice;

          return (
            <div key={tier} style={{
              border: isCurrent ? '2px solid #C0392B' : '2px solid #E5E7EB',
              borderRadius: 12, background: '#fff', padding: '20px',
              position: 'relative',
              boxShadow: isCurrent ? '0 0 0 4px rgba(192,57,43,0.08)' : 'none',
            }}>
              {isCurrent && (
                <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', padding: '2px 10px', borderRadius: 99, background: '#27AE60', color: '#fff', fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>
                  YOUR PLAN
                </div>
              )}
              {tier === 'pro' && !isCurrent && (
                <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', padding: '2px 10px', borderRadius: 99, background: '#C0392B', color: '#fff', fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>
                  MOST POPULAR
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Icon size={18} color={color} />
                <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 16, color }}>{p.name}</span>
              </div>

              <div style={{ marginBottom: 6 }}>
                {price !== null ? (
                  <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 28, color: '#1A1A1A' }}>
                    ${price}<span style={{ fontSize: 13, fontWeight: 400, color: '#9CA3AF' }}>/mo</span>
                  </span>
                ) : (
                  <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 28, color: '#1A1A1A' }}>Custom</span>
                )}
              </div>
              {interval === 'annual' && price !== null && (
                <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 14 }}>
                  Billed ${price! * 12}/yr · Save ${((tier === 'starter' ? 199 : 499) - price!) * 12}/yr
                </div>
              )}

              <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 16 }}>
                {p.applicationFeePercent > 0 ? `${p.applicationFeePercent}% platform fee` : 'No platform fee'} · {p.smsInclusion !== null ? `${p.smsInclusion.toLocaleString()} SMS/mo` : 'Unlimited SMS'}
              </div>

              {isCurrent ? (
                <button disabled style={{ width: '100%', padding: '9px', borderRadius: 8, background: '#F0FDF4', color: '#27AE60', fontWeight: 600, fontSize: 13, border: '1px solid #BBF7D0', cursor: 'default' }}>
                  Current Plan ✓
                </button>
              ) : isUpgrade ? (
                <button
                  onClick={() => handlePlanClick(tier)}
                  style={{ width: '100%', padding: '9px', borderRadius: 8, background: '#C0392B', color: '#fff', fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <ArrowUp size={13} /> Upgrade to {p.name}
                </button>
              ) : (
                <button
                  onClick={() => handlePlanClick(tier)}
                  style={{ width: '100%', padding: '9px', borderRadius: 8, background: '#fff', color: '#6B7280', fontWeight: 600, fontSize: 13, border: '1px solid #D1D5DB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <ArrowDown size={13} /> Downgrade to {p.name}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Feature comparison */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, background: '#fff', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', fontWeight: 700, fontSize: 14, color: '#1A1A1A' }}>
          Full Feature Comparison
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
            <thead>
              <tr>
                <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', width: '40%' }}>Feature</th>
                {(['starter', 'pro', 'enterprise'] as PlanTier[]).map(tier => (
                  <th key={tier} style={{
                    padding: '10px 16px', textAlign: 'center', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                    color: currentPlan === tier ? '#C0392B' : '#6B7280',
                    background: currentPlan === tier ? '#FDEDEC' : 'transparent',
                  }}>
                    {PLAN_CONFIGS[tier].name}
                    {currentPlan === tier && <div style={{ fontSize: 9, marginTop: 2 }}>YOUR PLAN</div>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PLAN_FEATURES.map((row, i) => (
                <tr key={row.label} style={{ background: i % 2 === 0 ? '#fff' : '#F9FAFB', borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '10px 20px', fontSize: 13, color: '#374151' }}>{row.label}</td>
                  {(['starter', 'pro', 'enterprise'] as PlanTier[]).map(tier => (
                    <td key={tier} style={{ padding: '10px 16px', textAlign: 'center', background: currentPlan === tier ? 'rgba(253,237,236,0.35)' : 'transparent' }}>
                      {renderCell(row[tier])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modals ── */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center', background: modal.type === 'upgrade' ? '#FDEDEC' : '#FEF2F2' }}>
                  {modal.type === 'upgrade' ? <ArrowUp size={18} color="#C0392B" /> : <AlertTriangle size={18} color="#DC2626" />}
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#1A1A1A' }}>
                  {modal.type === 'upgrade' ? `Upgrade to ${PLAN_CONFIGS[modal.target].name}` :
                   modal.type === 'blocked' ? 'Cannot Downgrade Yet' :
                   `Downgrade to ${PLAN_CONFIGS[modal.target].name}`}
                </div>
              </div>
              <button onClick={() => setModal(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={18} color="#9CA3AF" /></button>
            </div>

            <div style={{ padding: '20px 22px' }}>
              {modal.type === 'upgrade' && (
                <>
                  <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, marginBottom: 14 }}>
                    Your upgrade takes effect immediately. Your billing will be prorated for the remainder of this cycle.
                  </p>
                  <div style={{ padding: '14px 16px', borderRadius: 8, background: '#F0FDF4', border: '1px solid #BBF7D0', marginBottom: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#15803D', marginBottom: 4 }}>PRORATED CHARGE TODAY</div>
                    <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 22, color: '#15803D' }}>~$184.00</div>
                    <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>16 days remaining in current period</div>
                  </div>
                  <p style={{ fontSize: 12, color: '#9CA3AF' }}>
                    Future invoices will be at the {PLAN_CONFIGS[modal.target].name} rate (${interval === 'annual' ? PLAN_CONFIGS[modal.target].annualMonthlyPrice : PLAN_CONFIGS[modal.target].monthlyPrice}/mo).
                  </p>
                </>
              )}

              {modal.type === 'downgrade' && (
                <>
                  <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, marginBottom: 14 }}>
                    Downgrade to <strong style={{ color: '#1A1A1A' }}>{PLAN_CONFIGS[modal.target].name}</strong> will take effect at the end of your current billing period (Jun 30). You will receive a 14-day warning email.
                  </p>
                  <div style={{ padding: '12px 14px', borderRadius: 8, background: '#FEF3C7', border: '1px solid #FDE68A', marginBottom: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#92400E', marginBottom: 8 }}>FEATURES YOU'LL LOSE</div>
                    {['SMS campaigns', 'Multi-location routing', 'Custom domain', 'VIN / Plate lookup', 'QuickBooks import', '3 distributor connections (→ 1)'].map(f => (
                      <div key={f} style={{ display: 'flex', gap: 6, fontSize: 12, color: '#92400E', marginBottom: 3 }}>
                        <X size={12} style={{ marginTop: 1, flexShrink: 0 }} /> {f}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {modal.type === 'blocked' && (
                <>
                  <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, marginBottom: 14 }}>
                    The following active commitments must be resolved before you can downgrade to <strong style={{ color: '#1A1A1A' }}>Starter</strong>:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {ACTIVE_COMMITMENTS.map(c => (
                      <div key={c.key} style={{ padding: '12px 14px', borderRadius: 8, background: '#FEF2F2', border: '1px solid #FCA5A5' }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#DC2626', marginBottom: 4 }}>
                          <AlertTriangle size={12} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
                          {c.label}
                        </div>
                        <div style={{ fontSize: 12, color: '#991B1B', marginBottom: 6 }}>{c.description}</div>
                        <div style={{ fontSize: 11, color: '#6B7280' }}>To resolve: {c.resolveAction}</div>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 14 }}>
                    Resolve all blocking items above, then return here to complete the downgrade.
                  </p>
                </>
              )}
            </div>

            <div style={{ padding: '16px 22px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setModal(null)}
                style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid #D1D5DB', background: '#fff', color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
              >
                {modal.type === 'blocked' ? 'Close' : 'Cancel'}
              </button>
              {modal.type !== 'blocked' && (
                <button
                  onClick={confirmAction}
                  disabled={processing}
                  style={{
                    padding: '9px 18px', borderRadius: 8, border: 'none',
                    background: processing ? '#9CA3AF' : modal.type === 'upgrade' ? '#C0392B' : '#D97706',
                    color: '#fff', fontWeight: 600, fontSize: 13, cursor: processing ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  {processing && <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: 99, display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />}
                  {processing ? 'Processing…' : modal.type === 'upgrade' ? 'Upgrade Now' : 'Schedule Downgrade'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

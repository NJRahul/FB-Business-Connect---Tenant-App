import React, { useState } from 'react';
import { CheckCircle, Clock, AlertTriangle, ExternalLink, DollarSign, ArrowRight, Building2 } from 'lucide-react';
import { CONNECT_ACCOUNT, PAYOUTS } from './mockData';
import { PLAN_CONFIGS, type PlanTier, type PayoutStatus } from './types';

const STATUS_META: Record<PayoutStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  paid:       { label: 'Paid',       color: '#15803D', bg: '#F0FDF4', icon: CheckCircle },
  in_transit: { label: 'In Transit', color: '#2563EB', bg: '#EFF6FF', icon: Clock },
  pending:    { label: 'Pending',    color: '#D97706', bg: '#FEF3C7', icon: Clock },
  failed:     { label: 'Failed',     color: '#DC2626', bg: '#FEF2F2', icon: AlertTriangle },
};

function fmtMoney(cents: number) {
  return `R ${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

interface Props {
  currentPlan: PlanTier;
}

export function PayoutsView({ currentPlan }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const cfg = PLAN_CONFIGS[currentPlan];
  const nextPayout = PAYOUTS.find(p => p.status === 'in_transit' || p.status === 'pending');
  const totalPaid  = PAYOUTS.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Connect account status */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, background: '#fff', padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Building2 size={16} color="#00A9AC" />
              <span style={{ fontWeight: 700, fontSize: 15, color: '#1A1A1A' }}>Stripe Connect Account</span>
              {CONNECT_ACCOUNT.onboardingComplete && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 99, background: '#F0FDF4', color: '#15803D', fontSize: 11, fontWeight: 700 }}>
                  <CheckCircle size={10} /> Onboarded
                </span>
              )}
            </div>
            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}>
              <strong style={{ color: '#374151' }}>{CONNECT_ACCOUNT.businessName}</strong> · {CONNECT_ACCOUNT.stripeAccountId}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
              {[
                { label: 'Charges',  enabled: CONNECT_ACCOUNT.chargesEnabled },
                { label: 'Payouts',  enabled: CONNECT_ACCOUNT.payoutEnabled },
                { label: 'Onboarding', enabled: CONNECT_ACCOUNT.onboardingComplete },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                  <div style={{ width: 7, height: 7, borderRadius: 99, background: s.enabled ? '#27AE60' : '#DC2626' }} />
                  <span style={{ color: s.enabled ? '#374151' : '#DC2626', fontWeight: 500 }}>{s.label} {s.enabled ? 'enabled' : 'disabled'}</span>
                </div>
              ))}
            </div>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid #D1D5DB', background: '#fff', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <ExternalLink size={12} /> Stripe Dashboard
          </button>
        </div>
      </div>

      {/* Fee + next payout summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 20px', background: '#fff' }}>
          <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Platform Fee</div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 26, color: '#1A1A1A' }}>{cfg.applicationFeePercent}%</div>
          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>Withheld at transaction time</div>
        </div>
        <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 20px', background: '#fff' }}>
          <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Next Payout</div>
          {nextPayout ? (
            <>
              <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 26, color: '#2563EB' }}>{fmtMoney(nextPayout.amount)}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>Arriving {fmtDate(nextPayout.arrivalDate)}</div>
            </>
          ) : (
            <div style={{ fontSize: 14, color: '#9CA3AF' }}>No pending payout</div>
          )}
        </div>
        <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 20px', background: '#fff' }}>
          <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Total Paid (6 mo)</div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 26, color: '#15803D' }}>{fmtMoney(totalPaid)}</div>
          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{PAYOUTS.filter(p => p.status === 'paid').length} payouts</div>
        </div>
      </div>

      {/* Platform fee by plan */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, background: '#fff', padding: '18px 22px' }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#1A1A1A', marginBottom: 14 }}>Platform Fee Structure</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(['starter', 'pro', 'enterprise'] as PlanTier[]).map(tier => {
            const p = PLAN_CONFIGS[tier];
            const active = tier === currentPlan;
            return (
              <div key={tier} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 8, background: active ? '#E6F7F7' : '#F9FAFB', border: `1px solid ${active ? '#00A9AC' : '#E5E7EB'}` }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: active ? '#00A9AC' : '#374151' }}>
                    {p.name} {active && <span style={{ fontSize: 10, fontWeight: 600 }}>← current plan</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>Withheld from each customer payment at transaction time</div>
                </div>
                <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 20, color: active ? '#00A9AC' : '#374151' }}>
                  {p.applicationFeePercent > 0 ? `${p.applicationFeePercent}%` : '0%'}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 12, padding: '10px 14px', background: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: 12, color: '#6B7280' }}>
            Platform fees are collected via <strong>Stripe Connect application fees</strong> and never pass through your payout balance. Stripe's processing fees (2.9% + 30¢) are separate and charged to the customer.
          </div>
        </div>
      </div>

      {/* Payout history table */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, background: '#fff', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', fontWeight: 700, fontSize: 14, color: '#1A1A1A' }}>
          Payout History
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              {['', 'Description', 'Transactions', 'Status', 'Arrival Date', 'Fees', 'App Fee Withheld', 'Net Amount'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', borderBottom: '1px solid #E5E7EB', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PAYOUTS.map((payout, i) => {
              const sm = STATUS_META[payout.status];
              const SIcon = sm.icon;
              const isExpanded = expandedId === payout.id;
              return (
                <React.Fragment key={payout.id}>
                  <tr
                    style={{ background: isExpanded ? '#F9FAFB' : i % 2 === 0 ? '#fff' : '#FAFAFA', borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }}
                    onClick={() => setExpandedId(isExpanded ? null : payout.id)}
                  >
                    <td style={{ padding: '11px 14px', width: 20 }}>
                      <ArrowRight size={13} color="#9CA3AF" style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 13, color: '#374151', fontWeight: 500 }}>{payout.description}</td>
                    <td style={{ padding: '11px 14px', fontSize: 13, color: '#6B7280' }}>{payout.transactionCount}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content', padding: '3px 9px', borderRadius: 99, background: sm.bg, color: sm.color, fontSize: 11, fontWeight: 700 }}>
                        <SIcon size={10} /> {sm.label}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: '#6B7280' }}>{fmtDate(payout.arrivalDate)}</td>
                    <td style={{ padding: '11px 14px', fontSize: 13, color: '#DC2626' }}>−{fmtMoney(payout.fees)}</td>
                    <td style={{ padding: '11px 14px', fontSize: 13, color: '#D97706' }}>−{fmtMoney(payout.applicationFeeTotal)}</td>
                    <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 700, color: '#15803D' }}>{fmtMoney(payout.amount - payout.fees - payout.applicationFeeTotal)}</td>
                  </tr>
                  {isExpanded && (
                    <tr style={{ background: '#F9FAFB' }}>
                      <td colSpan={8} style={{ padding: '0 14px 16px 34px' }}>
                        <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                          <div style={{ padding: '10px 14px', background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB' }}>
                            <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, marginBottom: 4 }}>GROSS VOLUME</div>
                            <div style={{ fontWeight: 700, fontSize: 16, color: '#1A1A1A' }}>{fmtMoney(payout.amount)}</div>
                          </div>
                          <div style={{ padding: '10px 14px', background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB' }}>
                            <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, marginBottom: 4 }}>STRIPE FEES</div>
                            <div style={{ fontWeight: 700, fontSize: 16, color: '#DC2626' }}>−{fmtMoney(payout.fees)}</div>
                            <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>2.9% + 30¢ per txn</div>
                          </div>
                          <div style={{ padding: '10px 14px', background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB' }}>
                            <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, marginBottom: 4 }}>TDFORGE FEE ({cfg.applicationFeePercent}%)</div>
                            <div style={{ fontWeight: 700, fontSize: 16, color: '#D97706' }}>−{fmtMoney(payout.applicationFeeTotal)}</div>
                          </div>
                        </div>
                        <div style={{ marginTop: 8, padding: '8px 12px', background: '#F0FDF4', borderRadius: 6, fontSize: 13, color: '#15803D', fontWeight: 600 }}>
                          Net to bank: {fmtMoney(payout.amount - payout.fees - payout.applicationFeeTotal)}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Mail, Eye, CheckCircle2, Tag, Zap, Send } from 'lucide-react';
import { PLAN_ENROLLMENTS } from './mockData';
import type { PlanEnrollment } from './types';

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function EmailPreview({ enrollment }: { enrollment: PlanEnrollment }) {
  return (
    <div className="rounded-[12px] overflow-hidden" style={{ border: '2px solid #E5E7EB', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontFamily: 'Inter, sans-serif' }}>
      {/* Email header bar */}
      <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: '#FC5F57' }} />
          <div className="w-3 h-3 rounded-full" style={{ background: '#FDBB2D' }} />
          <div className="w-3 h-3 rounded-full" style={{ background: '#27C93F' }} />
        </div>
        <div className="flex-1 mx-3 px-3 py-1 rounded text-xs" style={{ background: '#fff', border: '1px solid #E5E7EB', color: '#9CA3AF' }}>
          From: noreply@fb-business-connect.app · Subject: Your membership renews on {fmtDate(enrollment.nextBillingDate)}
        </div>
      </div>

      {/* Email body */}
      <div style={{ background: '#F3F4F6', padding: '32px 16px' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          {/* Brand header */}
          <div style={{ background: '#C0392B', padding: '28px 32px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '1.625rem', color: '#fff', letterSpacing: '-0.02em' }}>
              FB Business Connect
            </p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', marginTop: '4px' }}>
              Membership Renewal Notice
            </p>
          </div>

          {/* Body */}
          <div style={{ padding: '32px' }}>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: '#1A1A1A', marginBottom: '8px' }}>
              Hi {enrollment.customerName.split(' ')[0]},
            </p>
            <p style={{ color: '#374151', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '24px' }}>
              Your <strong style={{ color: '#1A1A1A' }}>{enrollment.planName} — {enrollment.tierName}</strong> membership is set to auto-renew in 30 days.
              Here's a quick summary of what's included and what you'll be charged.
            </p>

            {/* Plan summary box */}
            <div style={{ background: '#FAFAFA', border: '1.5px solid #E5E7EB', borderRadius: '10px', padding: '20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '1rem' }}>{enrollment.planName}</p>
                  <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: '99px', background: '#FDEDEC', color: '#C0392B', fontSize: '0.75rem', fontWeight: 700, marginTop: '4px' }}>
                    {enrollment.tierName}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#C0392B' }}>
                    ${enrollment.tierPrice.toFixed(2)}
                  </p>
                  <p style={{ color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'capitalize' }}>per {enrollment.billingCadence}</p>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '14px' }}>
                <p style={{ fontWeight: 600, color: '#6B7280', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>What's included</p>
                {[
                  { icon: '✅', text: '4× free Tire Rotations per year' },
                  { icon: '✅', text: '2× free Tire Balance per year' },
                  { icon: '🏷️', text: '15% off additional tire services' },
                  { icon: '⚡', text: 'Priority booking — jump the waitlist' },
                ].map((item, i) => (
                  <p key={i} style={{ color: '#374151', fontSize: '0.875rem', marginBottom: '6px' }}>
                    {item.icon} {item.text}
                  </p>
                ))}
              </div>

              <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '14px', marginTop: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>Renewal date</p>
                  <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.875rem' }}>{fmtDate(enrollment.nextBillingDate)}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>Payment</p>
                  <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.875rem' }}>
                    {enrollment.paymentMethod === 'card' ? 'Card' : 'ACH'} ···{enrollment.paymentLast4}
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>Vehicle</p>
                  <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.875rem' }}>{enrollment.vehicleLabel}</p>
                </div>
              </div>
            </div>

            {/* CTA buttons */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <a href="#" style={{ flex: 1, display: 'block', background: '#C0392B', color: '#fff', textAlign: 'center', padding: '13px', borderRadius: '8px', fontWeight: 700, fontSize: '0.9375rem', textDecoration: 'none' }}>
                Manage Membership
              </a>
              <a href="#" style={{ flex: 1, display: 'block', background: '#fff', color: '#374151', textAlign: 'center', padding: '13px', borderRadius: '8px', fontWeight: 600, fontSize: '0.9375rem', textDecoration: 'none', border: '1.5px solid #E5E7EB' }}>
                Cancel Plan
              </a>
            </div>

            <p style={{ color: '#9CA3AF', fontSize: '0.8125rem', lineHeight: 1.6, marginBottom: '16px' }}>
              If you take no action, your membership will renew automatically on <strong>{fmtDate(enrollment.nextBillingDate)}</strong> and you'll be charged <strong>${enrollment.tierPrice.toFixed(2)}</strong>. You can cancel anytime up to that date with no penalty.
            </p>
            <p style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>
              Questions? Reply to this email or call us at (555) 123-4567. We're happy to help.
            </p>
          </div>

          {/* Footer */}
          <div style={{ background: '#F9FAFB', borderTop: '1px solid #E5E7EB', padding: '20px 32px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#9CA3AF', fontSize: '0.875rem' }}>FB Business Connect Auto Shop</p>
            <p style={{ color: '#D1D5DB', fontSize: '0.75rem', marginTop: '4px' }}>
              123 Main St · Anytown, TX 75001 · <a href="#" style={{ color: '#D1D5DB' }}>Unsubscribe</a> · <a href="#" style={{ color: '#D1D5DB' }}>Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RenewalNoticeView() {
  const [selectedId, setSelectedId] = useState(PLAN_ENROLLMENTS[0].id);
  const [sent, setSent] = useState<Set<string>>(new Set());

  const activeEnrollments = PLAN_ENROLLMENTS.filter(e => e.status === 'active');
  const selected = PLAN_ENROLLMENTS.find(e => e.id === selectedId)!;

  const renewalCandidates = activeEnrollments.map(e => {
    const next = new Date(e.nextBillingDate);
    const now = new Date('2026-06-16');
    const daysUntil = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return { enrollment: e, daysUntil };
  }).sort((a, b) => a.daysUntil - b.daysUntil);

  return (
    <div>
      <div className="mb-5">
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.125rem' }}>Renewal Notices</h2>
        <p style={{ color: '#6B7280', fontSize: '0.8125rem', marginTop: '2px' }}>
          Preview and manually trigger the 30-day renewal email. Production sends are automated by Stripe.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: enrollment list */}
        <div className="space-y-2">
          <p style={{ fontWeight: 700, color: '#374151', fontSize: '0.875rem', marginBottom: '8px' }}>Upcoming Renewals</p>
          {renewalCandidates.map(({ enrollment: e, daysUntil }) => {
            const isSelected = selectedId === e.id;
            const urgent = daysUntil <= 30;
            return (
              <button
                key={e.id}
                onClick={() => setSelectedId(e.id)}
                className="w-full text-left rounded-[10px] p-3 transition-all"
                style={{ border: isSelected ? '2px solid #C0392B' : '1.5px solid #E5E7EB', background: isSelected ? '#FFF8F8' : '#fff' }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {e.customerName}
                    </p>
                    <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>{e.planName} · {e.tierName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p style={{ fontWeight: 700, color: urgent ? '#D97706' : '#1A1A1A', fontSize: '0.8125rem' }}>
                      {daysUntil}d
                    </p>
                    {sent.has(e.id) && (
                      <span style={{ fontSize: '0.6875rem', color: '#16A34A', fontWeight: 600 }}>✓ Sent</span>
                    )}
                  </div>
                </div>
                {urgent && (
                  <div className="mt-1.5 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#D97706' }} />
                    <span style={{ fontSize: '0.6875rem', color: '#D97706', fontWeight: 600 }}>Renews within 30 days</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: email preview + actions */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Mail size={16} style={{ color: '#C0392B' }} />
              <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>Email Preview</p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-sm font-semibold" style={{ border: '1.5px solid #E5E7EB', color: '#6B7280' }}>
                <Eye size={13} /> Preview as customer
              </button>
              <button
                onClick={() => setSent(s => new Set([...s, selectedId]))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-sm font-semibold text-white"
                style={{ background: sent.has(selectedId) ? '#6B7280' : '#C0392B' }}
                disabled={sent.has(selectedId)}
              >
                {sent.has(selectedId) ? <CheckCircle2 size={13} /> : <Send size={13} />}
                {sent.has(selectedId) ? 'Email Sent' : 'Send Now'}
              </button>
            </div>
          </div>

          <EmailPreview enrollment={selected} />

          <div className="mt-4 p-3 rounded-[8px]" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
            <p style={{ color: '#1D4ED8', fontSize: '0.8125rem' }}>
              <strong>Auto-send rule:</strong> Stripe triggers the renewal email 30 days before each billing date. This page lets you preview the template and manually send for any enrollment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

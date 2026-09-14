import { useState } from 'react';
import {
  Shield, CreditCard, CalendarDays, CheckCircle2, Tag, Zap, Package,
  ChevronRight, Download, ArrowUpCircle, XCircle, AlertTriangle,
} from 'lucide-react';
import { PLAN_ENROLLMENTS, ENTITLEMENT_TRANSACTIONS } from './mockData';
import type { PlanEnrollment } from './types';

const DEMO_ENROLLMENT = PLAN_ENROLLMENTS[0];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function UsageBar({ used, included, label }: { used: number; included: number; label: string }) {
  const pct = included > 0 ? Math.min((used / included) * 100, 100) : 0;
  const exhausted = used >= included;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span style={{ color: '#374151', fontSize: '0.875rem', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: exhausted ? '#C0392B' : '#1A1A1A' }}>
          {used} of {included} used
        </span>
      </div>
      <div className="h-2.5 rounded-full" style={{ background: '#F3F4F6' }}>
        <div
          className="h-2.5 rounded-full transition-all"
          style={{ width: `${pct}%`, background: exhausted ? '#C0392B' : pct >= 75 ? '#F39C12' : '#C0392B' }}
        />
      </div>
      {exhausted && (
        <p style={{ color: '#C0392B', fontSize: '0.75rem', marginTop: '3px' }}>
          All included {label.toLowerCase()} for this period have been used.
        </p>
      )}
    </div>
  );
}

function PlanCard({ enrollment }: { enrollment: PlanEnrollment }) {
  const [cancelOpen, setCancelOpen] = useState(false);

  return (
    <div className="bg-white rounded-[12px] overflow-hidden" style={{ border: '1.5px solid #E5E7EB', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', borderTop: '4px solid #C0392B' }}>
      <div className="p-5">
        {/* Plan header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Shield size={16} style={{ color: '#C0392B' }} />
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.0625rem' }}>
                {enrollment.planName}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: '#FDEDEC', color: '#C0392B' }}>
                {enrollment.tierName}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: '#DCFCE7', color: '#16A34A' }}>
                Active
              </span>
            </div>
          </div>
          <div className="text-right">
            <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, color: '#C0392B', fontSize: '1.5rem' }}>
              ${enrollment.tierPrice.toFixed(2)}
            </p>
            <p style={{ color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'capitalize' }}>
              / {enrollment.billingCadence}
            </p>
          </div>
        </div>

        {/* Key details */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: 'Next Billing', value: fmtDate(enrollment.nextBillingDate), icon: CalendarDays },
            { label: 'Term Ends', value: fmtDate(enrollment.termEnd), icon: CalendarDays },
            { label: 'Payment', value: `${enrollment.paymentMethod === 'card' ? 'Card' : 'ACH'} ···${enrollment.paymentLast4}`, icon: CreditCard },
            { label: 'Vehicle', value: enrollment.vehicleLabel, icon: null },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="p-3 rounded-[8px]" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  {Icon && <Icon size={12} style={{ color: '#9CA3AF' }} />}
                  <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</p>
                </div>
                <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.875rem' }}>{item.value}</p>
              </div>
            );
          })}
        </div>

        {/* Entitlement usage */}
        <div className="mb-5">
          <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem', marginBottom: '12px' }}>
            Entitlement Usage — Current Period
          </p>
          <div className="space-y-4">
            {enrollment.entitlementUsage.map(u => (
              <UsageBar key={u.entitlementKey} used={u.used} included={u.included} label={u.serviceName} />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[8px] text-sm font-semibold"
            style={{ background: '#C0392B', color: '#fff' }}
          >
            <ArrowUpCircle size={14} /> Upgrade
          </button>
          <button
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[8px] text-sm font-semibold"
            style={{ border: '1.5px solid #FCA5A5', color: '#DC2626', background: '#FEF2F2' }}
            onClick={() => setCancelOpen(true)}
          >
            <XCircle size={14} /> Cancel
          </button>
        </div>
      </div>

      {cancelOpen && (
        <div className="px-5 pb-5 pt-0">
          <div className="rounded-[8px] p-4" style={{ background: '#FEF2F2', border: '1px solid #FCA5A5' }}>
            <div className="flex items-start gap-2 mb-3">
              <AlertTriangle size={15} style={{ color: '#DC2626', marginTop: '1px', flexShrink: 0 }} />
              <div>
                <p style={{ fontWeight: 700, color: '#991B1B', fontSize: '0.875rem' }}>Cancel Membership?</p>
                <p style={{ color: '#B91C1C', fontSize: '0.8125rem', marginTop: '2px' }}>
                  Your plan stays active until <strong>{fmtDate(enrollment.termEnd)}</strong>. After that date, you won't be charged and entitlements will end.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCancelOpen(false)}
                className="flex-1 py-2 rounded-[6px] text-sm font-semibold"
                style={{ border: '1.5px solid #FCA5A5', color: '#DC2626' }}
              >
                Keep Plan
              </button>
              <button
                onClick={() => setCancelOpen(false)}
                className="flex-1 py-2 rounded-[6px] text-sm font-semibold"
                style={{ background: '#DC2626', color: '#fff' }}
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TransactionLog() {
  const txns = ENTITLEMENT_TRANSACTIONS.filter(t => t.enrollmentId === DEMO_ENROLLMENT.id);
  return (
    <div className="bg-white rounded-[12px] p-5" style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem', marginBottom: '12px' }}>
        Savings This Year
      </p>
      {txns.length === 0 ? (
        <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>No entitlements used yet this period.</p>
      ) : (
        <div className="space-y-2">
          {txns.map(t => {
            const icon = t.type === 'free_service' ? CheckCircle2 : t.type === 'discount' ? Tag : Package;
            const iconColor = t.type === 'free_service' ? '#27AE60' : t.type === 'discount' ? '#F39C12' : '#1D4ED8';
            const Icon = icon;
            return (
              <div key={t.id} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid #F3F4F6' }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: '#F9FAFB' }}>
                  <Icon size={14} style={{ color: iconColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ color: '#374151', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</p>
                  <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
                    {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <span style={{ fontWeight: 700, color: '#27AE60', fontSize: '0.875rem', flexShrink: 0 }}>
                  −${t.amountSaved.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      )}
      {txns.length > 0 && (
        <div className="mt-3 flex items-center justify-between pt-2" style={{ borderTop: '1px solid #E5E7EB' }}>
          <span style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>Total saved</span>
          <span style={{ fontWeight: 800, color: '#27AE60', fontFamily: 'Sora, sans-serif', fontSize: '1.125rem' }}>
            ${txns.reduce((s, t) => s + t.amountSaved, 0).toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}

export function CustomerMembershipView() {
  const enrollment = DEMO_ENROLLMENT;

  return (
    <div>
      <div className="mb-5 p-3 rounded-[8px] flex items-center gap-2" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
        <span style={{ fontSize: '0.8125rem', color: '#1D4ED8' }}>
          👤 Previewing customer membership portal as <strong>{enrollment.customerName}</strong> — this is what members see in their self-service hub.
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          <PlanCard enrollment={enrollment} />
          <div className="bg-white rounded-[12px] p-5" style={{ border: '1px solid #E5E7EB' }}>
            <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem', marginBottom: '10px' }}>Documents</p>
            {[
              { label: 'Membership Agreement', date: fmtDate(enrollment.termStart) },
              { label: 'Billing Receipt – Jan 2026', date: 'Jan 15, 2026' },
            ].map(doc => (
              <div key={doc.label} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #F3F4F6' }}>
                <div>
                  <p style={{ fontWeight: 500, color: '#374151', fontSize: '0.875rem' }}>{doc.label}</p>
                  <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>{doc.date}</p>
                </div>
                <button className="flex items-center gap-1 text-sm font-semibold" style={{ color: '#1D4ED8' }}>
                  <Download size={13} /> PDF
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <TransactionLog />
          <div className="bg-white rounded-[12px] p-5" style={{ border: '1px solid #E5E7EB' }}>
            <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem', marginBottom: '10px' }}>Browse Other Plans</p>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '12px' }}>
              Other plans available for your vehicle.
            </p>
            {[
              { name: 'Tire Care Plan — Premium', price: 'R 4,299 / yr', highlight: 'More rotations + flat repair' },
              { name: 'TPMS Shield', price: 'R 899 / yr', highlight: 'Sensor coverage' },
            ].map(p => (
              <div key={p.name} className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid #F3F4F6' }}>
                <div>
                  <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.875rem' }}>{p.name}</p>
                  <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>{p.highlight}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontWeight: 700, color: '#C0392B', fontSize: '0.875rem' }}>{p.price}</span>
                  <ChevronRight size={14} style={{ color: '#D1D5DB' }} />
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-[10px]" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <div className="flex items-start gap-2">
              <Zap size={16} style={{ color: '#16A34A', marginTop: '1px', flexShrink: 0 }} />
              <div>
                <p style={{ fontWeight: 700, color: '#166534', fontSize: '0.875rem' }}>Priority Booking Active</p>
                <p style={{ color: '#16A34A', fontSize: '0.8125rem', marginTop: '2px' }}>
                  As a Standard member, you jump the waitlist on all bookings. Book now to see your priority slot.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import {
  UserPlus, Search, ChevronDown, CreditCard, Landmark,
  AlertTriangle, CheckCircle2, XCircle, PauseCircle, Clock,
  RefreshCw, ArrowUpCircle, ArrowDownCircle, Ban, MoreVertical,
} from 'lucide-react';
import { PLAN_ENROLLMENTS } from './mockData';
import type { PlanEnrollment, EnrollmentStatus } from './types';
import { EnrollmentModal } from './EnrollmentModal';

const STATUS_CONFIG: Record<EnrollmentStatus, { label: string; bg: string; color: string; icon: React.ElementType }> = {
  active:   { label: 'Active',    bg: '#DCFCE7', color: '#16A34A', icon: CheckCircle2 },
  past_due: { label: 'Past Due',  bg: '#FEF3C7', color: '#D97706', icon: AlertTriangle },
  cancelled:{ label: 'Cancelled', bg: '#F3F4F6', color: '#9CA3AF', icon: XCircle },
  paused:   { label: 'Paused',    bg: '#EFF6FF', color: '#1D4ED8', icon: PauseCircle },
  pending:  { label: 'Pending',   bg: '#FFF7ED', color: '#EA580C', icon: Clock },
};

function StatusBadge({ status }: { status: EnrollmentStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: cfg.bg, color: cfg.color }}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

function PaymentBadge({ method, last4 }: { method: 'card' | 'ach'; last4: string }) {
  return (
    <span className="flex items-center gap-1 text-xs" style={{ color: '#6B7280' }}>
      {method === 'card' ? <CreditCard size={12} /> : <Landmark size={12} />}
      ···{last4}
    </span>
  );
}

function EnrollmentRow({ enrollment, onAction }: {
  enrollment: PlanEnrollment;
  onAction: (action: string, e: PlanEnrollment) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const cfg = STATUS_CONFIG[enrollment.status];

  return (
    <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
      <td className="px-4 py-3">
        <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.875rem' }}>{enrollment.customerName}</p>
        <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>{enrollment.vehicleLabel}</p>
      </td>
      <td className="px-4 py-3">
        <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.875rem' }}>{enrollment.planName}</p>
        <p style={{ color: '#6B7280', fontSize: '0.75rem' }}>{enrollment.tierName}</p>
      </td>
      <td className="px-4 py-3">
        <p style={{ fontWeight: 600, color: '#00A9AC', fontSize: '0.875rem', fontFamily: 'Sora, sans-serif' }}>
          ${enrollment.tierPrice.toFixed(2)}
        </p>
        <p style={{ color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'capitalize' }}>{enrollment.billingCadence}</p>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={enrollment.status} />
      </td>
      <td className="px-4 py-3">
        <p style={{ color: '#1A1A1A', fontSize: '0.875rem' }}>
          {enrollment.nextBillingDate === '—' ? '—' : new Date(enrollment.nextBillingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
        <PaymentBadge method={enrollment.paymentMethod} last4={enrollment.paymentLast4} />
      </td>
      <td className="px-4 py-3">
        <div className="space-y-1">
          {enrollment.entitlementUsage.map(u => {
            const pct = (u.used / u.included) * 100;
            return (
              <div key={u.entitlementKey}>
                <div className="flex items-center justify-between mb-0.5">
                  <span style={{ fontSize: '0.6875rem', color: '#9CA3AF' }}>{u.serviceName}</span>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#374151' }}>{u.used}/{u.included}</span>
                </div>
                <div className="w-24 h-1.5 rounded-full" style={{ background: '#F3F4F6' }}>
                  <div className="h-1.5 rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: pct >= 100 ? '#00A9AC' : '#F39C12' }} />
                </div>
              </div>
            );
          })}
        </div>
      </td>
      <td className="px-4 py-3 relative">
        <button
          onClick={() => setMenuOpen(m => !m)}
          className="p-1.5 rounded-[6px]"
          style={{ color: '#9CA3AF', background: menuOpen ? '#F3F4F6' : 'transparent' }}
        >
          <MoreVertical size={15} />
        </button>
        {menuOpen && (
          <div
            className="absolute right-4 mt-1 z-20 bg-white rounded-[8px] py-1"
            style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid #E5E7EB', minWidth: '180px' }}
            onMouseLeave={() => setMenuOpen(false)}
          >
            {[
              { label: 'Upgrade plan', icon: ArrowUpCircle, color: '#16A34A' },
              { label: 'Downgrade plan', icon: ArrowDownCircle, color: '#D97706' },
              { label: 'Pause enrollment', icon: PauseCircle, color: '#1D4ED8' },
              { label: 'Cancel enrollment', icon: Ban, color: '#DC2626' },
              { label: 'View transactions', icon: RefreshCw, color: '#374151' },
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => { onAction(item.label, enrollment); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm"
                  style={{ color: item.color }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <Icon size={14} />
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </td>
    </tr>
  );
}

export function EnrollmentsView() {
  const [enrollments] = useState<PlanEnrollment[]>(PLAN_ENROLLMENTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EnrollmentStatus | 'all'>('all');
  const [showEnroll, setShowEnroll] = useState(false);
  const [actionToast, setActionToast] = useState<string | null>(null);

  const filtered = enrollments.filter(e => {
    const matchSearch = !search ||
      e.customerName.toLowerCase().includes(search.toLowerCase()) ||
      e.planName.toLowerCase().includes(search.toLowerCase()) ||
      e.vehicleLabel.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function handleAction(action: string, enrollment: PlanEnrollment) {
    setActionToast(`${action} — ${enrollment.customerName} (${enrollment.planName})`);
    setTimeout(() => setActionToast(null), 3500);
  }

  const stats = {
    active: enrollments.filter(e => e.status === 'active').length,
    past_due: enrollments.filter(e => e.status === 'past_due').length,
    mrr: enrollments.filter(e => e.status === 'active').reduce((s, e) => {
      const monthly = e.billingCadence === 'monthly' ? e.tierPrice : e.billingCadence === 'quarterly' ? e.tierPrice / 3 : e.tierPrice / 12;
      return s + monthly;
    }, 0),
  };

  return (
    <div>
      {/* Action toast */}
      {actionToast && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-[8px] text-sm font-medium" style={{ background: '#1A1A1A', color: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }}>
          {actionToast}
        </div>
      )}

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Active Enrollments', value: stats.active, color: '#16A34A', bg: '#DCFCE7' },
          { label: 'Past Due', value: stats.past_due, color: '#D97706', bg: '#FEF3C7' },
          { label: 'Est. MRR', value: `R ${stats.mrr.toFixed(2)}`, color: '#00A9AC', bg: '#E6F7F7' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-[10px] p-4" style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
            <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: s.color, marginTop: '4px' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search customer, plan, vehicle…"
            className="w-full pl-9 pr-3 py-2 rounded-[8px] text-sm"
            style={{ border: '1.5px solid #E5E7EB', outline: 'none', color: '#1A1A1A' }}
          />
        </div>
        <div className="flex items-center gap-1 px-3 py-2 rounded-[8px] text-sm" style={{ border: '1.5px solid #E5E7EB', background: '#fff', cursor: 'pointer' }}>
          <span style={{ color: '#6B7280' }}>Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
            className="text-sm font-medium"
            style={{ border: 'none', outline: 'none', color: '#1A1A1A', background: 'transparent', cursor: 'pointer' }}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="past_due">Past Due</option>
            <option value="cancelled">Cancelled</option>
            <option value="paused">Paused</option>
          </select>
          <ChevronDown size={13} style={{ color: '#9CA3AF' }} />
        </div>
        <button
          onClick={() => setShowEnroll(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-[8px] text-sm font-semibold text-white"
          style={{ background: '#00A9AC' }}
        >
          <UserPlus size={14} /> Enroll Customer
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[10px] overflow-hidden" style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              {['Customer / Vehicle', 'Plan / Tier', 'Price', 'Status', 'Next Billing', 'Entitlement Usage', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center" style={{ color: '#9CA3AF' }}>
                  No enrollments match your filters.
                </td>
              </tr>
            ) : (
              filtered.map(e => (
                <EnrollmentRow key={e.id} enrollment={e} onAction={handleAction} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {showEnroll && (
        <EnrollmentModal
          customerName="Sarah Chen"
          onClose={() => setShowEnroll(false)}
          onComplete={() => setShowEnroll(false)}
        />
      )}
    </div>
  );
}

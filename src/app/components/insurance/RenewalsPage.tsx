import { useState } from 'react';
import { Bell, CheckCircle2, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import type { RenewalTask, InsurancePolicy } from '../../../lib/insurance/types';
import { formatCents } from '../../../lib/insurance/types';
import { MOCK_RENEWAL_TASKS, MOCK_POLICIES } from './mockData';

const CHANNEL_LABELS: Record<string, string> = { email: 'Email', sms: 'SMS', in_app: 'In-app' };

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  sent:      { label: 'Sent',      color: '#27AE60', bg: '#F0FDF4', icon: <CheckCircle2 size={13} style={{ color: '#27AE60' }} /> },
  pending:   { label: 'Pending',   color: '#F39C12', bg: '#FFF8E1', icon: <Clock size={13} style={{ color: '#F39C12' }} /> },
  snoozed:   { label: 'Snoozed',   color: '#6B7280', bg: '#F3F4F6', icon: <Clock size={13} style={{ color: '#6B7280' }} /> },
  cancelled: { label: 'Cancelled', color: '#00BFC3', bg: '#FEF2F2', icon: <AlertTriangle size={13} style={{ color: '#00BFC3' }} /> },
};

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

function PolicyExpiryCard({ policy }: { policy: InsurancePolicy }) {
  const days = daysUntil(policy.expiry_date);
  const urgency = days <= 7 ? 'high' : days <= 14 ? 'med' : 'low';
  const borderColor = urgency === 'high' ? '#FECACA' : urgency === 'med' ? '#FDE68A' : '#BBF7D0';
  const badgeColor = urgency === 'high' ? '#00A9AC' : urgency === 'med' ? '#F39C12' : '#27AE60';
  const badgeBg = urgency === 'high' ? '#FEF2F2' : urgency === 'med' ? '#FFF8E1' : '#F0FDF4';

  if (policy.status !== 'active' && policy.status !== 'pending') return null;
  if (days > 60) return null;

  return (
    <div className="rounded-[10px] p-5" style={{ border: `1.5px solid ${borderColor}`, background: '#fff' }}>
      <div className="flex items-start justify-between">
        <div>
          <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem', marginBottom: 4 }}>{policy.coverage_name}</p>
          <p style={{ color: '#6B7280', fontSize: '0.8125rem' }}>
            {policy.carrier_name} · #{policy.policy_number}
          </p>
          <p style={{ color: '#6B7280', fontSize: '0.8125rem', marginTop: 2 }}>
            Expires {policy.expiry_date} · {formatCents(policy.premium)}/yr
          </p>
        </div>
        <span className="px-2 py-1 rounded text-xs font-semibold" style={{ background: badgeBg, color: badgeColor }}>
          {days > 0 ? `${days}d left` : 'Expired'}
        </span>
      </div>
      <div className="flex gap-2 mt-4">
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-sm font-semibold" style={{ background: '#1A1A1A', color: '#fff' }}>
          <RefreshCw size={13} /> Start renewal
        </button>
        <button className="px-3 py-1.5 rounded-[6px] text-sm font-semibold" style={{ border: '1px solid #E5E7EB', color: '#6B7280' }}>
          Contact carrier
        </button>
      </div>
    </div>
  );
}

export function RenewalsPage() {
  const [tasks] = useState<RenewalTask[]>(MOCK_RENEWAL_TASKS);

  const expiringPolicies = MOCK_POLICIES.filter(p =>
    (p.status === 'active' || p.status === 'pending') && daysUntil(p.expiry_date) <= 60
  ).sort((a, b) => a.expiry_date.localeCompare(b.expiry_date));

  const policyName = (id: string) => MOCK_POLICIES.find(p => p.id === id)?.coverage_name ?? id;

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.25rem', fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>Renewals</h2>
        <p style={{ color: '#6B7280', fontSize: '0.9375rem' }}>Policies expiring within 60 days and their reminder history.</p>
      </div>

      {expiringPolicies.length > 0 ? (
        <div>
          <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.9375rem', marginBottom: 12 }}>Expiring soon</p>
          <div className="space-y-3">
            {expiringPolicies.map(p => <PolicyExpiryCard key={p.id} policy={p} />)}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 rounded-[8px]" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <CheckCircle2 size={18} style={{ color: '#27AE60' }} />
          <p style={{ color: '#15803D', fontSize: '0.9375rem', fontWeight: 600 }}>No policies expiring within 60 days.</p>
        </div>
      )}

      {/* Reminder log */}
      <div className="rounded-[10px] overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
        <div className="px-5 py-3 border-b flex items-center gap-2" style={{ background: '#F9FAFB', borderColor: '#E5E7EB' }}>
          <Bell size={15} style={{ color: '#6B7280' }} />
          <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>Reminder history</p>
        </div>
        <div className="divide-y" style={{ borderColor: '#F3F4F6' }}>
          {tasks.map(task => {
            const sc = STATUS_CFG[task.status] ?? STATUS_CFG.pending;
            return (
              <div key={task.id} className="flex items-center justify-between px-5 py-3" style={{ background: '#fff' }}>
                <div>
                  <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.875rem' }}>
                    {policyName(task.policy_id)} — T-{task.days_before_expiry}
                  </p>
                  <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
                    {CHANNEL_LABELS[task.channel]} · Scheduled {task.remind_at}
                    {task.sent_at && ` · Sent ${new Date(task.sent_at).toLocaleDateString()}`}
                  </p>
                </div>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold" style={{ background: sc.bg, color: sc.color }}>
                  {sc.icon} {sc.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 rounded-[8px]" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
        <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.875rem', marginBottom: 6 }}>Renewal reminder schedule</p>
        <p style={{ color: '#6B7280', fontSize: '0.8125rem', lineHeight: 1.6 }}>
          Reminders are sent automatically at T-60, T-30, T-14, T-7, and T-1 days before expiry via the channels configured in your notification settings.
        </p>
      </div>
    </div>
  );
}

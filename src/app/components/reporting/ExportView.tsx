import React, { useState } from 'react';
import { Download, Calendar, Database, BookOpen, CheckCircle, Clock, Lock } from 'lucide-react';

type ExportStatus = 'idle' | 'queued' | 'done';

const EXPORT_ENTITIES = [
  { id: 'visits',    label: 'Visits / Work Orders',   description: 'All visit records, service details, statuses, timestamps', rows: '1,284', plan: 'starter' },
  { id: 'revenue',   label: 'Revenue Transactions',   description: 'Daily revenue breakdown: gross, labor, parts, refunds', rows: '90',      plan: 'starter' },
  { id: 'customers', label: 'Customer Database',       description: 'Customer profiles, LTV, AOV, opt-in status, tags', rows: '847',      plan: 'starter' },
  { id: 'techs',     label: 'Technician Performance', description: 'Per-tech stats: revenue, ratings, utilization, on-time rate', rows: '4', plan: 'starter' },
  { id: 'campaigns', label: 'Campaign Performance',   description: 'Email/SMS campaign metrics and delivery logs', rows: '12',      plan: 'starter' },
  { id: 'invoices',  label: 'Invoices & Payouts',     description: 'Invoice line items, Stripe payouts, platform fees', rows: '31',      plan: 'starter' },
  { id: 'kpis',      label: 'KPI History',            description: '13-week KPI trend data for all tracked metrics', rows: '104',     plan: 'pro' },
  { id: 'cohorts',   label: 'Cohort Retention Data',  description: 'Monthly cohort sizes, retention rates, revenue per head', rows: '6',  plan: 'pro' },
  { id: 'locations', label: 'Location P&L',           description: 'Per-location revenue, costs, margins', rows: '3',           plan: 'pro' },
];

const SCHEDULED_EXPORTS = [
  { id: 'sch1', label: 'Weekly Revenue Summary', frequency: 'Every Monday 8:00 AM', format: 'CSV', destination: 'email', nextRun: 'Jun 16, 2026' },
  { id: 'sch2', label: 'Monthly Customer Export', frequency: 'First of month 7:00 AM', format: 'CSV', destination: 'email', nextRun: 'Jul 1, 2026' },
];

export function ExportView() {
  const [statuses, setStatuses] = useState<Record<string, ExportStatus>>({});
  const currentPlan = 'pro';

  function triggerExport(id: string) {
    if (statuses[id] && statuses[id] !== 'idle') return;
    setStatuses(s => ({ ...s, [id]: 'queued' }));
    setTimeout(() => setStatuses(s => ({ ...s, [id]: 'done' })), 1200);
  }

  function isPlanLocked(planRequired: string) {
    if (planRequired === 'starter') return false;
    if (planRequired === 'pro' && currentPlan === 'starter') return true;
    if (planRequired === 'enterprise' && currentPlan !== 'enterprise') return true;
    return false;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* On-demand exports */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', fontWeight: 700, fontSize: 13, color: '#1A1A1A', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Download size={14} />
          On-Demand CSV Exports
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {EXPORT_ENTITIES.map((e, i) => {
            const status = statuses[e.id] ?? 'idle';
            const locked = isPlanLocked(e.plan);
            return (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < EXPORT_ENTITIES.length - 1 ? '1px solid #F3F4F6' : 'none', background: locked ? '#FAFAFA' : '#fff' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: locked ? '#9CA3AF' : '#1A1A1A' }}>{e.label}</span>
                    {e.plan !== 'starter' && (
                      <span style={{ padding: '1px 7px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: '#FEF3C7', color: '#D97706' }}>
                        {e.plan === 'pro' ? 'Pro' : 'Enterprise'}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>{e.description} · {e.rows} rows</div>
                </div>
                {locked ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#D97706' }}>
                    <Lock size={13} />
                    Upgrade required
                  </div>
                ) : (
                  <button
                    onClick={() => triggerExport(e.id)}
                    disabled={status !== 'idle'}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 7,
                      border: '1px solid', fontSize: 12, fontWeight: 600, cursor: status !== 'idle' ? 'default' : 'pointer',
                      background: status === 'done' ? '#F0FDF4' : '#fff',
                      color: status === 'done' ? '#15803D' : status === 'queued' ? '#6B7280' : '#374151',
                      borderColor: status === 'done' ? '#BBF7D0' : '#E5E7EB',
                    }}
                  >
                    {status === 'queued' && <Clock size={12} style={{ animation: 'spin 1s linear infinite' }} />}
                    {status === 'done'   && <CheckCircle size={12} />}
                    {status === 'idle'   && <Download size={12} />}
                    {status === 'queued' ? 'Preparing…' : status === 'done' ? 'Downloaded' : 'Export CSV'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Scheduled exports */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#1A1A1A', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={14} />
            Scheduled Exports
          </div>
          <button style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
            + New Schedule
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {SCHEDULED_EXPORTS.map((s, i) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < SCHEDULED_EXPORTS.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>{s.frequency} · {s.format} → {s.destination}</div>
              </div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>Next: {s.nextRun}</div>
              <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: '#F0FDF4', color: '#15803D' }}>Active</span>
            </div>
          ))}
        </div>
      </div>

      {/* Data warehouse + integrations */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Postgres read replica */}
        <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', padding: '18px 20px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 14, right: 14 }}>
            <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: '#EDE9FE', color: '#7C3AED' }}>Enterprise</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={18} color="#7C3AED" />
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1A1A1A' }}>Postgres Read Replica</div>
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 14 }}>
            Direct SQL access to your shop data. Connect any BI tool — Metabase, Redash, Looker — to a read-only replica that mirrors your production database.
          </div>
          <div style={{ padding: '10px 12px', background: '#F3F4F6', borderRadius: 6, fontFamily: 'monospace', fontSize: 11, color: '#374151', marginBottom: 12 }}>
            postgres://readonly:●●●●@db.tdforge.io:5432/shop_1
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Lock size={13} color="#9CA3AF" />
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>Upgrade to Enterprise to enable</span>
          </div>
        </div>

        {/* QuickBooks */}
        <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', padding: '18px 20px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 14, right: 14 }}>
            <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: '#FEF3C7', color: '#D97706' }}>Pro</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={18} color="#D97706" />
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1A1A1A' }}>QuickBooks Sync</div>
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 14 }}>
            Two-way sync with QuickBooks Online. Revenue, invoices, refunds, and payouts sync nightly. Map TDForge categories to your chart of accounts.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
            {['Revenue → Income Account', 'Refunds → Expense Account', 'Payouts → Bank Account'].map(l => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6B7280' }}>
                <CheckCircle size={12} color="#15803D" />
                {l}
              </div>
            ))}
          </div>
          <button style={{ padding: '7px 16px', borderRadius: 7, border: '1px solid #D97706', background: '#FEF3C7', color: '#92400E', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            Connect QuickBooks
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { Search, ChevronRight, Building2, RefreshCw } from 'lucide-react';
import type { Tenant, LifecycleState, PlanTier } from './types';
import { MOCK_TENANTS } from './mockData';

const LIFECYCLE_BADGE: Record<LifecycleState, { label: string; bg: string; color: string }> = {
  active:       { label: 'Active',       bg: '#052E16', color: '#4ADE80' },
  trial:        { label: 'Trial',        bg: '#1C1917', color: '#FBBF24' },
  provisioning: { label: 'Provisioning', bg: '#0C1A2E', color: '#60A5FA' },
  suspended:    { label: 'Suspended',    bg: '#1C0A0A', color: '#F87171' },
  archived:     { label: 'Archived',     bg: '#1F1F1F', color: '#6B7280' },
  deleted:      { label: 'Deleted',      bg: '#1C0A0A', color: '#EF4444' },
};

const PLAN_BADGE: Record<PlanTier, { label: string; bg: string; color: string }> = {
  starter:    { label: 'Starter',    bg: '#1F2937', color: '#9CA3AF' },
  pro:        { label: 'Pro',        bg: '#1F0A0A', color: '#F87171' },
  enterprise: { label: 'Enterprise', bg: '#0F0F1A', color: '#A78BFA' },
};

function LifecycleBadge({ state }: { state: LifecycleState }) {
  const s = LIFECYCLE_BADGE[state];
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}22` }}>
      {s.label}
    </span>
  );
}

function PlanBadge({ tier }: { tier: PlanTier }) {
  const s = PLAN_BADGE[tier];
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function formatMRR(cents: number) {
  if (cents === 0) return '—';
  return `R ${(cents / 100).toFixed(0)}/mo`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface Props {
  onSelect: (tenant: Tenant) => void;
}

export function TenantListView({ onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState<PlanTier | 'all'>('all');
  const [filterState, setFilterState] = useState<LifecycleState | 'all'>('all');

  const tenants = useMemo(() => {
    return MOCK_TENANTS.filter(t => {
      const q = query.toLowerCase();
      const matchQ = !q || t.businessName.toLowerCase().includes(q) || t.subdomain.includes(q) || t.ownerEmail.toLowerCase().includes(q);
      const matchPlan = filterPlan === 'all' || t.planTier === filterPlan;
      const matchState = filterState === 'all' || t.lifecycleState === filterState;
      return matchQ && matchPlan && matchState;
    });
  }, [query, filterPlan, filterState]);

  return (
    <div className="flex flex-col h-full" style={{ color: '#F9FAFB' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.25rem' }}>Tenants</h2>
          <p style={{ fontSize: '0.825rem', color: '#6B7280', marginTop: 2 }}>{MOCK_TENANTS.length} shops on platform</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
          style={{ background: '#1F2937', color: '#9CA3AF', border: '1px solid #374151' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#4B5563' }} />
          <input
            value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, subdomain, or email…"
            className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: '#1F2937', border: '1px solid #374151', color: '#F9FAFB', fontFamily: 'Inter, sans-serif' }}
            onFocus={e => (e.target.style.borderColor = '#DC2626')}
            onBlur={e => (e.target.style.borderColor = '#374151')}
          />
        </div>
        <select value={filterPlan} onChange={e => setFilterPlan(e.target.value as any)}
          className="px-3 py-2.5 rounded-lg text-sm outline-none"
          style={{ background: '#1F2937', border: '1px solid #374151', color: '#D1D5DB' }}>
          <option value="all">All Plans</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <select value={filterState} onChange={e => setFilterState(e.target.value as any)}
          className="px-3 py-2.5 rounded-lg text-sm outline-none"
          style={{ background: '#1F2937', border: '1px solid #374151', color: '#D1D5DB' }}>
          <option value="all">All States</option>
          <option value="active">Active</option>
          <option value="trial">Trial</option>
          <option value="provisioning">Provisioning</option>
          <option value="suspended">Suspended</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden flex-1" style={{ border: '1px solid #1F2937' }}>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0D1526', borderBottom: '1px solid #1F2937' }}>
                {['Tenant', 'Subdomain', 'Plan', 'Lifecycle', 'MRR', 'Locations', 'Last Activity', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3"
                    style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4B5563', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tenants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16" style={{ color: '#4B5563', fontSize: '0.875rem' }}>
                    No tenants match your filters.
                  </td>
                </tr>
              ) : tenants.map((t, i) => (
                <tr key={t.id}
                  onClick={() => onSelect(t)}
                  className="cursor-pointer transition-colors"
                  style={{
                    borderBottom: '1px solid #1F2937',
                    background: i % 2 === 0 ? '#111827' : '#0F1623',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#1A2540')}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? '#111827' : '#0F1623')}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: '#1F2937', color: '#DC2626' }}>
                        <Building2 size={14} />
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#F9FAFB' }}>{t.businessName}</p>
                        <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>{t.ownerEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ fontFamily: 'monospace', fontSize: '0.825rem', color: '#9CA3AF' }}>{t.subdomain}.fb-business-connect.app</span>
                  </td>
                  <td className="px-4 py-3"><PlanBadge tier={t.planTier} /></td>
                  <td className="px-4 py-3"><LifecycleBadge state={t.lifecycleState} /></td>
                  <td className="px-4 py-3" style={{ fontSize: '0.875rem', color: '#D1D5DB', fontVariantNumeric: 'tabular-nums' }}>
                    {formatMRR(t.mrrCents)}
                  </td>
                  <td className="px-4 py-3" style={{ fontSize: '0.875rem', color: '#D1D5DB', textAlign: 'center' }}>
                    {t.locationCount}
                  </td>
                  <td className="px-4 py-3" style={{ fontSize: '0.825rem', color: '#6B7280' }}>
                    {timeAgo(t.lastActivityAt)}
                  </td>
                  <td className="px-4 py-3">
                    <ChevronRight size={16} style={{ color: '#4B5563' }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

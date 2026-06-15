import { useState } from 'react';
import { ArrowLeft, Building2, ExternalLink, AlertTriangle, CheckCircle2, Clock, CreditCard, Settings2, FileText, Wrench, Loader2, X } from 'lucide-react';
import type { Tenant, LifecycleState } from './types';
import { CrossTenantModal } from './CrossTenantModal';
import { MOCK_ACCESS_LOGS } from './mockData';

type Tab = 'overview' | 'billing' | 'settings' | 'auditlog' | 'tools';

const LIFECYCLE_CONFIG: Record<LifecycleState, { color: string; bg: string }> = {
  active:       { color: '#4ADE80', bg: '#052E16' },
  trial:        { color: '#FBBF24', bg: '#1C1917' },
  provisioning: { color: '#60A5FA', bg: '#0C1A2E' },
  suspended:    { color: '#F87171', bg: '#1C0A0A' },
  archived:     { color: '#6B7280', bg: '#1F1F1F' },
  deleted:      { color: '#EF4444', bg: '#1C0A0A' },
};

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: '#0D1526', border: '1px solid #1F2937' }}>
      <p style={{ fontSize: '0.75rem', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{label}</p>
      <p style={{ fontSize: '1.375rem', fontWeight: 700, color: '#F9FAFB', marginTop: 4 }}>{value}</p>
      {sub && <p style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: 2 }}>{sub}</p>}
    </div>
  );
}

interface ActionModalState {
  action: 'suspend' | 'restore' | 'archive' | 'delete' | 'extend_trial' | 'discount' | 'credit' | null;
}

interface Props {
  tenant: Tenant;
  onBack: () => void;
}

export function TenantDetailView({ tenant, onBack }: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const [crossTenantAction, setCrossTenantAction] = useState<{ action: Tab; label: string } | null>(null);
  const [accessGranted, setAccessGranted] = useState(false);
  const [actionModal, setActionModal] = useState<ActionModalState>({ action: null });
  const [actionReason, setActionReason] = useState('');
  const [extendDays, setExtendDays] = useState(7);
  const [discountCode, setDiscountCode] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [tenantState, setTenantState] = useState<Tenant>(tenant);

  const lc = LIFECYCLE_CONFIG[tenantState.lifecycleState];
  const accessLogs = MOCK_ACCESS_LOGS.filter(l => l.targetShopId === tenant.id);

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  }

  function handleTabClick(t: Tab) {
    if ((t === 'billing' || t === 'settings' || t === 'tools') && !accessGranted) {
      setCrossTenantAction({ action: t, label: `View ${t} data for ${tenant.businessName}` });
    } else {
      setTab(t);
    }
  }

  function onCrossTenantConfirm(reason: string) {
    setCrossTenantAction(null);
    setAccessGranted(true);
    if (crossTenantAction) setTab(crossTenantAction.action);
    console.log('[AUDIT] Cross-tenant access:', { tenant: tenant.id, action: crossTenantAction?.action, reason });
    showToast('Access logged. Cross-tenant session started.');
  }

  function executeAction() {
    if (!actionReason.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const act = actionModal.action;
      if (act === 'suspend') setTenantState(t => ({ ...t, lifecycleState: 'suspended', suspendedReason: actionReason }));
      if (act === 'restore') setTenantState(t => ({ ...t, lifecycleState: 'active', suspendedReason: undefined }));
      if (act === 'archive') setTenantState(t => ({ ...t, lifecycleState: 'archived' }));
      const labels: Record<string, string> = {
        suspend: 'Tenant suspended.', restore: 'Tenant restored to active.',
        archive: 'Tenant archived.', delete: 'Permanent deletion queued.',
        extend_trial: `Trial extended by ${extendDays} days.`,
        discount: `Discount code ${discountCode} applied.`,
        credit: `$${creditAmount} SLA credit applied.`,
      };
      showToast(labels[act!] || 'Action completed.');
      setActionModal({ action: null });
      setActionReason('');
    }, 800);
  }

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings2 },
    { id: 'auditlog', label: 'Audit Log', icon: FileText },
    { id: 'tools', label: 'Tools', icon: Wrench },
  ];

  return (
    <div className="flex flex-col h-full" style={{ color: '#F9FAFB' }}>
      {/* Back + header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors"
          style={{ color: '#9CA3AF', background: '#1F2937' }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#1F2937' }}>
            <Building2 size={18} color="#DC2626" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.125rem' }}>{tenantState.businessName}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#6B7280' }}>{tenantState.subdomain}.tdforge.app</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
                style={{ background: lc.bg, color: lc.color }}>{tenantState.lifecycleState}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b" style={{ borderColor: '#1F2937' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => handleTabClick(t.id)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors relative"
            style={{
              color: tab === t.id ? '#DC2626' : '#6B7280',
              borderBottom: tab === t.id ? '2px solid #DC2626' : '2px solid transparent',
            }}>
            <t.icon size={14} />
            {t.label}
            {(t.id === 'billing' || t.id === 'settings' || t.id === 'tools') && !accessGranted && (
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#DC2626' }} />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'overview' && (
          <div className="flex flex-col gap-6">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard label="MRR" value={tenantState.mrrCents === 0 ? '—' : `$${(tenantState.mrrCents / 100).toFixed(0)}`} sub="monthly recurring" />
              <StatCard label="Locations" value={String(tenantState.locationCount)} />
              <StatCard label="Technicians" value={String(tenantState.technicianCount)} />
              <StatCard label="Plan" value={tenantState.planTier.charAt(0).toUpperCase() + tenantState.planTier.slice(1)} />
            </div>

            {/* Info card */}
            <div className="rounded-xl p-5" style={{ background: '#111827', border: '1px solid #1F2937' }}>
              <h3 style={{ fontWeight: 600, fontSize: '0.9rem', color: '#F9FAFB', marginBottom: 16 }}>Tenant Info</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Owner', value: tenantState.ownerName },
                  { label: 'Email', value: tenantState.ownerEmail },
                  { label: 'Stripe Connect', value: tenantState.stripeConnectStatus },
                  { label: 'Created', value: new Date(tenantState.createdAt).toLocaleDateString() },
                  { label: 'Last Active', value: new Date(tenantState.lastActivityAt).toLocaleString() },
                  ...(tenantState.trialEndsAt ? [{ label: 'Trial Ends', value: new Date(tenantState.trialEndsAt).toLocaleDateString() }] : []),
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p style={{ fontSize: '0.75rem', color: '#4B5563', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                    <p style={{ fontSize: '0.875rem', color: '#D1D5DB', marginTop: 2 }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Suspended reason */}
            {tenantState.suspendedReason && (
              <div className="flex items-start gap-3 rounded-xl p-4" style={{ background: '#1C0A0A', border: '1px solid #3F1515' }}>
                <AlertTriangle size={16} color="#F87171" className="mt-0.5 shrink-0" />
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.825rem', color: '#F87171' }}>Suspension Reason</p>
                  <p style={{ fontSize: '0.825rem', color: '#FCA5A5', marginTop: 2 }}>{tenantState.suspendedReason}</p>
                </div>
              </div>
            )}

            {/* Lifecycle actions */}
            <div className="rounded-xl p-5" style={{ background: '#111827', border: '1px solid #1F2937' }}>
              <h3 style={{ fontWeight: 600, fontSize: '0.9rem', color: '#F9FAFB', marginBottom: 12 }}>Lifecycle Actions</h3>
              <div className="flex flex-wrap gap-2">
                {tenantState.lifecycleState !== 'active' && tenantState.lifecycleState !== 'provisioning' && (
                  <button onClick={() => setActionModal({ action: 'restore' })}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ background: '#052E16', color: '#4ADE80', border: '1px solid #14532D' }}>
                    Restore
                  </button>
                )}
                {tenantState.lifecycleState === 'active' && (
                  <button onClick={() => setActionModal({ action: 'suspend' })}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ background: '#1C0A0A', color: '#F87171', border: '1px solid #3F1515' }}>
                    Suspend
                  </button>
                )}
                {tenantState.lifecycleState === 'trial' && (
                  <button onClick={() => setActionModal({ action: 'extend_trial' })}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ background: '#1C1917', color: '#FBBF24', border: '1px solid #3D2E0A' }}>
                    Extend Trial
                  </button>
                )}
                <button onClick={() => setActionModal({ action: 'archive' })}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ background: '#1F2937', color: '#9CA3AF', border: '1px solid #374151' }}>
                  Archive
                </button>
                <button onClick={() => setActionModal({ action: 'delete' })}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ background: '#1C0A0A', color: '#EF4444', border: '1px solid #7F1D1D' }}>
                  Permanent Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'billing' && (
          <div className="flex flex-col gap-5">
            <div className="rounded-xl p-5" style={{ background: '#111827', border: '1px solid #1F2937' }}>
              <h3 style={{ fontWeight: 600, fontSize: '0.9rem', color: '#F9FAFB', marginBottom: 16 }}>Billing Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><p style={{ fontSize: '0.75rem', color: '#4B5563', textTransform: 'uppercase', fontWeight: 600 }}>Plan</p>
                  <p style={{ color: '#D1D5DB', marginTop: 2 }}>{tenantState.planTier}</p></div>
                <div><p style={{ fontSize: '0.75rem', color: '#4B5563', textTransform: 'uppercase', fontWeight: 600 }}>MRR</p>
                  <p style={{ color: '#D1D5DB', marginTop: 2 }}>${(tenantState.mrrCents / 100).toFixed(2)}/mo</p></div>
                <div><p style={{ fontSize: '0.75rem', color: '#4B5563', textTransform: 'uppercase', fontWeight: 600 }}>Stripe Connect</p>
                  <p style={{ color: tenantState.stripeConnectStatus === 'connected' ? '#4ADE80' : '#F87171', marginTop: 2 }}>{tenantState.stripeConnectStatus}</p></div>
                <div><p style={{ fontSize: '0.75rem', color: '#4B5563', textTransform: 'uppercase', fontWeight: 600 }}>Next Invoice</p>
                  <p style={{ color: '#D1D5DB', marginTop: 2 }}>Jul 1, 2026</p></div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setActionModal({ action: 'discount' })}
                className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ background: '#0C1A2E', color: '#60A5FA', border: '1px solid #1D3557' }}>
                Apply Discount Code
              </button>
              <button onClick={() => setActionModal({ action: 'credit' })}
                className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ background: '#052E16', color: '#4ADE80', border: '1px solid #14532D' }}>
                Apply SLA Credit
              </button>
            </div>
          </div>
        )}

        {tab === 'settings' && (
          <div className="rounded-xl p-5" style={{ background: '#111827', border: '1px solid #1F2937' }}>
            <h3 style={{ fontWeight: 600, fontSize: '0.9rem', color: '#F9FAFB', marginBottom: 16 }}>Tenant Settings</h3>
            {[
              { label: 'Subdomain', value: `${tenantState.subdomain}.tdforge.app` },
              { label: 'Business Name', value: tenantState.businessName },
              { label: 'Owner', value: `${tenantState.ownerName} (${tenantState.ownerEmail})` },
              { label: 'Plan', value: tenantState.planTier },
              { label: 'Stripe Connect', value: tenantState.stripeConnectStatus },
              { label: 'Lifecycle', value: tenantState.lifecycleState },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid #1F2937' }}>
                <p style={{ fontSize: '0.825rem', color: '#6B7280' }}>{label}</p>
                <p style={{ fontSize: '0.825rem', color: '#D1D5DB', fontFamily: label === 'Subdomain' ? 'monospace' : undefined }}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'auditlog' && (
          <div className="flex flex-col gap-4">
            <h3 style={{ fontWeight: 600, fontSize: '0.9rem', color: '#F9FAFB' }}>Cross-Tenant Access Log</h3>
            {accessLogs.length === 0 ? (
              <div className="rounded-xl p-8 text-center" style={{ background: '#111827', border: '1px solid #1F2937' }}>
                <CheckCircle2 size={24} color="#4ADE80" className="mx-auto mb-2" />
                <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>No recorded access to this tenant's data.</p>
              </div>
            ) : accessLogs.map(l => (
              <div key={l.id} className="rounded-xl p-4" style={{ background: '#111827', border: '1px solid #1F2937' }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#F9FAFB' }}>{l.adminName}</span>
                    <span style={{ fontSize: '0.8rem', color: '#6B7280', marginLeft: 8 }}>{l.adminEmail}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#4B5563' }}>{new Date(l.createdAt).toLocaleString()}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Action: <span style={{ color: '#D1D5DB' }}>{l.action}</span></p>
                <p style={{ fontSize: '0.8rem', color: '#9CA3AF', marginTop: 4 }}>Reason: <span style={{ color: '#D1D5DB' }}>{l.writtenReason}</span></p>
                <div className="flex gap-3 mt-3">
                  <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#1F2937', color: '#9CA3AF' }}>{l.recordKind}</span>
                  <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#1F2937', color: '#9CA3AF' }}>{l.durationSeconds}s</span>
                  {l.piiAccessed && <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#1C0A0A', color: '#F87171' }}>PII accessed</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'tools' && (
          <div className="flex flex-col gap-4">
            <h3 style={{ fontWeight: 600, fontSize: '0.9rem', color: '#F9FAFB', marginBottom: 4 }}>Tenant-Scoped Tools</h3>
            {[
              { label: 'Replay Failed Webhooks', desc: 'Re-deliver failed webhook events for this tenant.', action: 'replay_webhook' },
              { label: 'Force Catalog Sync', desc: 'Trigger immediate distributor catalog refresh.', action: 'catalog_sync' },
              { label: 'Reprocess Queue Items', desc: 'Unstick items in the booking sync queue.', action: 'reprocess_queue' },
              { label: 'Disconnect Stripe Connect', desc: 'Force-disconnect misbehaving Stripe Connect account.', action: 'disconnect_stripe', danger: true },
            ].map(tool => (
              <div key={tool.action} className="flex items-center justify-between rounded-xl p-4"
                style={{ background: '#111827', border: `1px solid ${tool.danger ? '#3F1515' : '#1F2937'}` }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem', color: tool.danger ? '#F87171' : '#F9FAFB' }}>{tool.label}</p>
                  <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: 2 }}>{tool.desc}</p>
                </div>
                <button className="px-3 py-1.5 rounded-lg text-sm font-medium ml-4 shrink-0"
                  style={{ background: tool.danger ? '#1C0A0A' : '#1F2937', color: tool.danger ? '#EF4444' : '#9CA3AF', border: `1px solid ${tool.danger ? '#7F1D1D' : '#374151'}` }}
                  onClick={() => showToast(`${tool.label} executed for ${tenantState.businessName}.`)}>
                  Run
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cross-tenant modal */}
      {crossTenantAction && (
        <CrossTenantModal
          tenantName={tenant.businessName}
          actionLabel={crossTenantAction.label}
          onConfirm={onCrossTenantConfirm}
          onCancel={() => setCrossTenantAction(null)}
        />
      )}

      {/* Action modal */}
      {actionModal.action && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 mx-4" style={{ background: '#111827', border: '1px solid #1F2937' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontWeight: 700, color: '#F9FAFB', fontSize: '1rem' }}>
                {actionModal.action === 'suspend' && 'Suspend Tenant'}
                {actionModal.action === 'restore' && 'Restore Tenant'}
                {actionModal.action === 'archive' && 'Archive Tenant'}
                {actionModal.action === 'delete' && 'Permanently Delete Tenant'}
                {actionModal.action === 'extend_trial' && 'Extend Trial'}
                {actionModal.action === 'discount' && 'Apply Discount Code'}
                {actionModal.action === 'credit' && 'Apply SLA Credit'}
              </h3>
              <button onClick={() => { setActionModal({ action: null }); setActionReason(''); }} style={{ color: '#6B7280' }}><X size={18} /></button>
            </div>

            {actionModal.action === 'extend_trial' && (
              <div className="mb-4">
                <label style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 600 }}>Days to Extend</label>
                <input type="number" min={1} max={30} value={extendDays} onChange={e => setExtendDays(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: '#0D1526', border: '1px solid #1F2937', color: '#F9FAFB' }} />
                {extendDays > 30 && <p style={{ fontSize: '0.75rem', color: '#F87171', marginTop: 4 }}>⚠ &gt;30 days requires Engineering Lead approval.</p>}
              </div>
            )}
            {actionModal.action === 'discount' && (
              <div className="mb-4">
                <label style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 600 }}>Discount Code</label>
                <input value={discountCode} onChange={e => setDiscountCode(e.target.value)} placeholder="e.g. SLA20OFF"
                  className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: '#0D1526', border: '1px solid #1F2937', color: '#F9FAFB' }} />
              </div>
            )}
            {actionModal.action === 'credit' && (
              <div className="mb-4">
                <label style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 600 }}>Credit Amount ($)</label>
                <input type="number" min={1} value={creditAmount} onChange={e => setCreditAmount(e.target.value)} placeholder="e.g. 25"
                  className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: '#0D1526', border: '1px solid #1F2937', color: '#F9FAFB' }} />
              </div>
            )}

            <div className="mb-4">
              <label style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 600 }}>Written Reason <span style={{ color: '#EF4444' }}>*</span></label>
              <textarea value={actionReason} onChange={e => setActionReason(e.target.value)} rows={3}
                placeholder="Explain why this action is being taken…"
                className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none resize-none"
                style={{ background: '#0D1526', border: '1px solid #1F2937', color: '#F9FAFB', fontFamily: 'Inter, sans-serif' }} />
            </div>

            {actionModal.action === 'delete' && (
              <div className="flex items-start gap-2 rounded-lg p-3 mb-4" style={{ background: '#1C0A0A', border: '1px solid #3F1515' }}>
                <AlertTriangle size={14} color="#EF4444" className="mt-0.5 shrink-0" />
                <p style={{ fontSize: '0.8rem', color: '#FCA5A5' }}>
                  This action is irreversible. All tenant data will be permanently erased.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => { setActionModal({ action: null }); setActionReason(''); }}
                className="flex-1 py-2 rounded-lg text-sm" style={{ background: '#1F2937', color: '#9CA3AF' }}>Cancel</button>
              <button onClick={executeAction} disabled={!actionReason.trim() || loading}
                className="flex-1 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                style={{ background: actionModal.action === 'delete' ? '#7F1D1D' : '#DC2626', color: '#fff', opacity: actionReason.trim() && !loading ? 1 : 0.4 }}>
                {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 px-4 py-3 rounded-xl text-sm font-medium z-50"
          style={{ background: '#052E16', color: '#4ADE80', border: '1px solid #14532D', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
          <CheckCircle2 size={14} className="inline mr-2" />{toastMsg}
        </div>
      )}
    </div>
  );
}

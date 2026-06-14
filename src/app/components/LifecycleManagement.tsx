import { useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Archive, ChevronRight, Mail, Phone, Clock, ArrowRight } from 'lucide-react';

type LifecycleState = 'provisioning' | 'active' | 'suspended_billing' | 'suspended_admin' | 'archived';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  planTier: string;
  state: LifecycleState;
  email: string;
  createdAt: string;
  suspendedReason?: string;
}

const SAMPLE_TENANTS: Tenant[] = [
  { id: '1', name: 'Acme Tire & Auto', slug: 'acmetire', planTier: 'Pro', state: 'active', email: 'john@acmetire.com', createdAt: '2026-01-15' },
  { id: '2', name: 'Valley Tire Shop', slug: 'valleytire', planTier: 'Starter', state: 'suspended_billing', email: 'owner@valleytire.com', createdAt: '2026-02-20', suspendedReason: 'Payment failed — card declined' },
  { id: '3', name: 'Downtown Auto Center', slug: 'downtownauto', planTier: 'Enterprise', state: 'active', email: 'admin@downtownauto.com', createdAt: '2025-11-05' },
  { id: '4', name: 'Speedway Tires', slug: 'speedway', planTier: 'Starter', state: 'suspended_admin', email: 'info@speedway.com', createdAt: '2026-03-01', suspendedReason: 'Terms of Service violation — review required' },
  { id: '5', name: 'Old School Motors', slug: 'oldschool', planTier: 'Starter', state: 'archived', email: 'owner@oldschool.com', createdAt: '2025-08-10' },
];

const STATE_CONFIG: Record<LifecycleState, { label: string; color: string; bg: string; border: string; icon: typeof CheckCircle2; description: string }> = {
  provisioning: { label: 'Provisioning', color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB', icon: Clock, description: 'Account is being set up' },
  active: { label: 'Active', color: '#27AE60', bg: '#F0FDF4', border: '#BBF7D0', icon: CheckCircle2, description: 'Storefront live, all features enabled' },
  suspended_billing: { label: 'Billing Suspended', color: '#F39C12', bg: '#FFF7ED', border: '#FED7AA', icon: AlertTriangle, description: 'Storefront + campaigns disabled; owner has read-only access' },
  suspended_admin: { label: 'Admin Suspended', color: '#E74C3C', bg: '#FEF2F2', border: '#FECACA', icon: XCircle, description: 'All access disabled; owner notified via email' },
  archived: { label: 'Archived', color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB', icon: Archive, description: '30-day soft delete window; then permanent deletion' },
};

const ALLOWED_TRANSITIONS: Record<LifecycleState, LifecycleState[]> = {
  provisioning: ['active'],
  active: ['suspended_billing', 'suspended_admin', 'archived'],
  suspended_billing: ['active', 'suspended_admin', 'archived'],
  suspended_admin: ['active', 'archived'],
  archived: [],
};

const STATE_FLOW: LifecycleState[] = ['provisioning', 'active', 'suspended_billing', 'suspended_admin', 'archived'];

export function LifecycleManagement() {
  const [tenants, setTenants] = useState<Tenant[]>(SAMPLE_TENANTS);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ tenant: Tenant; targetState: LifecycleState } | null>(null);
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [filterState, setFilterState] = useState<LifecycleState | 'all'>('all');

  const filtered = filterState === 'all' ? tenants : tenants.filter(t => t.state === filterState);

  const handleTransition = async () => {
    if (!confirmModal) return;
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1000));
    setTenants(prev =>
      prev.map(t =>
        t.id === confirmModal.tenant.id
          ? { ...t, state: confirmModal.targetState, suspendedReason: reason || undefined }
          : t
      )
    );
    if (selectedTenant?.id === confirmModal.tenant.id) {
      setSelectedTenant(prev => prev ? { ...prev, state: confirmModal.targetState, suspendedReason: reason || undefined } : null);
    }
    setProcessing(false);
    setConfirmModal(null);
    setReason('');
  };

  const stateCounts = Object.keys(STATE_CONFIG).reduce((acc, s) => {
    acc[s as LifecycleState] = tenants.filter(t => t.state === s).length;
    return acc;
  }, {} as Record<LifecycleState, number>);

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="mb-6">
        <h1 style={{ fontFamily: 'Sora, sans-serif', color: '#1A1A1A', fontSize: '1.5rem', fontWeight: 700 }}>Lifecycle Management</h1>
        <p style={{ color: '#6B7280', fontSize: '0.9375rem', marginTop: '4px' }}>Manage tenant account states across the platform</p>
      </div>

      {/* State overview */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {(Object.entries(STATE_CONFIG) as [LifecycleState, typeof STATE_CONFIG[LifecycleState]][]).map(([state, cfg]) => {
          const Icon = cfg.icon;
          const count = stateCounts[state] || 0;
          return (
            <button
              key={state}
              onClick={() => setFilterState(filterState === state ? 'all' : state)}
              className="rounded-[8px] p-4 text-left transition-all"
              style={{
                background: filterState === state ? cfg.bg : '#fff',
                border: `1.5px solid ${filterState === state ? cfg.border : '#E5E7EB'}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} style={{ color: cfg.color }} />
                <span style={{ color: '#6B7280', fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {cfg.label}
                </span>
              </div>
              <p style={{ color: cfg.color, fontWeight: 700, fontSize: '1.5rem', fontFamily: 'Sora, sans-serif' }}>{count}</p>
            </button>
          );
        })}
      </div>

      {/* Lifecycle state diagram */}
      <div className="bg-white rounded-[8px] p-5 mb-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <h3 style={{ color: '#1A1A1A', fontWeight: 600, marginBottom: '16px', fontSize: '0.9375rem' }}>State Machine</h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 flex-wrap sm:flex-nowrap">
          {STATE_FLOW.map((state, i) => {
            const cfg = STATE_CONFIG[state];
            const Icon = cfg.icon;
            return (
              <div key={state} className="flex items-center gap-2">
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-[6px] shrink-0"
                  style={{ background: cfg.bg, border: `1.5px solid ${cfg.border}` }}
                >
                  <Icon size={14} style={{ color: cfg.color }} />
                  <span style={{ color: cfg.color, fontSize: '0.8125rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{cfg.label}</span>
                </div>
                {i < STATE_FLOW.length - 1 && <ArrowRight size={16} style={{ color: '#D1D5DB', shrink: 0 }} />}
              </div>
            );
          })}
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(Object.entries(STATE_CONFIG) as [LifecycleState, typeof STATE_CONFIG[LifecycleState]][]).map(([state, cfg]) => (
            <div key={state} className="flex items-start gap-2">
              <span className="shrink-0 mt-1 w-2 h-2 rounded-full" style={{ background: cfg.color }} />
              <span style={{ color: '#6B7280', fontSize: '0.8125rem' }}><strong style={{ color: '#1A1A1A' }}>{cfg.label}:</strong> {cfg.description}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">
        {/* Tenant list */}
        <div className="space-y-2">
          {filtered.map(tenant => {
            const cfg = STATE_CONFIG[tenant.state];
            const Icon = cfg.icon;
            const isSelected = selectedTenant?.id === tenant.id;
            return (
              <button
                key={tenant.id}
                onClick={() => setSelectedTenant(isSelected ? null : tenant)}
                className="w-full bg-white rounded-[8px] p-4 text-left transition-all"
                style={{
                  boxShadow: isSelected ? `0 0 0 2px #C0392B` : '0 1px 3px rgba(0,0,0,0.06)',
                  border: isSelected ? '1.5px solid #C0392B' : '1.5px solid transparent',
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: '#FDEDEC', color: '#C0392B', fontWeight: 700, fontSize: '0.875rem' }}>
                      {tenant.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p style={{ color: '#1A1A1A', fontWeight: 600, fontSize: '0.9375rem' }}>{tenant.name}</p>
                      <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>{tenant.slug}.tdforge.app · {tenant.planTier} · Since {tenant.createdAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-[4px]" style={{ background: cfg.bg, color: cfg.color, fontSize: '0.75rem', fontWeight: 600, border: `1px solid ${cfg.border}` }}>
                      <Icon size={12} />
                      {cfg.label}
                    </span>
                    <ChevronRight size={16} style={{ color: '#9CA3AF', transform: isSelected ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                  </div>
                </div>
                {tenant.suspendedReason && (
                  <p className="mt-2 flex items-center gap-1.5" style={{ color: '#F39C12', fontSize: '0.8125rem' }}>
                    <AlertTriangle size={12} />
                    {tenant.suspendedReason}
                  </p>
                )}
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12" style={{ color: '#9CA3AF' }}>
              <Archive size={28} style={{ margin: '0 auto 8px' }} />
              <p>No tenants in this state</p>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selectedTenant && (
          <div className="bg-white rounded-[8px] overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)', height: 'fit-content' }}>
            {(() => {
              const cfg = STATE_CONFIG[selectedTenant.state];
              const Icon = cfg.icon;
              const transitions = ALLOWED_TRANSITIONS[selectedTenant.state];
              return (
                <>
                  <div className="p-5 border-b" style={{ borderColor: '#E5E7EB' }}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#FDEDEC', color: '#C0392B', fontWeight: 700 }}>
                        {selectedTenant.name[0]}
                      </div>
                      <div>
                        <h3 style={{ color: '#1A1A1A', fontWeight: 700, fontSize: '1.0625rem' }}>{selectedTenant.name}</h3>
                        <p style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>{selectedTenant.slug}.tdforge.app</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Plan', value: selectedTenant.planTier },
                        { label: 'Member since', value: selectedTenant.createdAt },
                        { label: 'Email', value: selectedTenant.email },
                        { label: 'Shop ID', value: selectedTenant.id },
                      ].map(item => (
                        <div key={item.label}>
                          <p style={{ color: '#9CA3AF', fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</p>
                          <p style={{ color: '#1A1A1A', fontSize: '0.875rem', marginTop: '2px' }}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 border-b" style={{ borderColor: '#E5E7EB' }}>
                    <p style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Current State</p>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-[6px]" style={{ background: cfg.bg, border: `1.5px solid ${cfg.border}`, display: 'inline-flex' }}>
                      <Icon size={16} style={{ color: cfg.color }} />
                      <span style={{ color: cfg.color, fontWeight: 600, fontSize: '0.9375rem' }}>{cfg.label}</span>
                    </div>
                    <p style={{ color: '#6B7280', fontSize: '0.8125rem', marginTop: '8px' }}>{cfg.description}</p>
                    {selectedTenant.suspendedReason && (
                      <div className="mt-3 p-3 rounded-[6px]" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
                        <p style={{ color: '#92400E', fontSize: '0.8125rem' }}>
                          <strong>Reason:</strong> {selectedTenant.suspendedReason}
                        </p>
                      </div>
                    )}
                  </div>

                  {transitions.length > 0 && (
                    <div className="p-5 border-b" style={{ borderColor: '#E5E7EB' }}>
                      <p style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Transition State</p>
                      <div className="space-y-2">
                        {transitions.map(target => {
                          const tcfg = STATE_CONFIG[target];
                          const TIcon = tcfg.icon;
                          return (
                            <button
                              key={target}
                              onClick={() => setConfirmModal({ tenant: selectedTenant, targetState: target })}
                              className="w-full flex items-center justify-between px-4 py-3 rounded-[6px] transition-colors text-left"
                              style={{ border: `1.5px solid ${tcfg.border}`, background: tcfg.bg }}
                            >
                              <div className="flex items-center gap-2">
                                <TIcon size={16} style={{ color: tcfg.color }} />
                                <span style={{ color: tcfg.color, fontWeight: 600, fontSize: '0.875rem' }}>Move to {tcfg.label}</span>
                              </div>
                              <ChevronRight size={14} style={{ color: tcfg.color }} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="p-5">
                    <p style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Quick Actions</p>
                    <div className="space-y-2">
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-[6px] transition-colors" style={{ border: '1.5px solid #E5E7EB', background: '#fff', color: '#6B7280', fontSize: '0.875rem', fontWeight: 500 }}>
                        <Mail size={14} /> Send notification email
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-[6px] transition-colors" style={{ border: '1.5px solid #E5E7EB', background: '#fff', color: '#6B7280', fontSize: '0.875rem', fontWeight: 500 }}>
                        <Phone size={14} /> View contact info
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Confirm transition modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-[8px] p-6 max-w-md w-full" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            {(() => {
              const cfg = STATE_CONFIG[confirmModal.targetState];
              const Icon = cfg.icon;
              return (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: cfg.bg }}>
                      <Icon size={20} style={{ color: cfg.color }} />
                    </div>
                    <h3 style={{ fontFamily: 'Sora, sans-serif', color: '#1A1A1A', fontWeight: 700, fontSize: '1.125rem' }}>
                      Change State to {cfg.label}
                    </h3>
                  </div>
                  <p style={{ color: '#6B7280', fontSize: '0.9375rem', marginBottom: '16px' }}>
                    <strong style={{ color: '#1A1A1A' }}>{confirmModal.tenant.name}</strong> will be transitioned to <strong style={{ color: cfg.color }}>{cfg.label}</strong>.
                  </p>
                  <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '16px' }}>{cfg.description}</p>

                  {(confirmModal.targetState === 'suspended_billing' || confirmModal.targetState === 'suspended_admin') && (
                    <div className="mb-4">
                      <label style={{ color: '#1A1A1A', fontWeight: 600, fontSize: '0.875rem' }}>
                        Reason {confirmModal.targetState === 'suspended_admin' ? '(required)' : '(optional)'}
                      </label>
                      <textarea
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        rows={3}
                        style={{ display: 'block', width: '100%', marginTop: '6px', border: '1.5px solid #E5E7EB', borderRadius: '6px', padding: '8px 12px', fontSize: '0.875rem', color: '#1A1A1A', outline: 'none', resize: 'vertical' }}
                        placeholder="Explain why this account is being suspended..."
                      />
                      {confirmModal.targetState === 'suspended_admin' && (
                        <p style={{ color: '#6B7280', fontSize: '0.75rem', marginTop: '4px' }}>
                          This reason will be included in the email notification to the account owner.
                        </p>
                      )}
                    </div>
                  )}

                  {confirmModal.targetState === 'archived' && (
                    <div className="p-3 rounded-[6px] mb-4" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                      <p style={{ color: '#B91C1C', fontSize: '0.8125rem', fontWeight: 600 }}>
                        ⚠️ This will begin the 30-day deletion countdown
                      </p>
                      <p style={{ color: '#6B7280', fontSize: '0.8125rem', marginTop: '4px' }}>
                        After 30 days, all data will be permanently deleted and anonymized per privacy policy.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => { setConfirmModal(null); setReason(''); }}
                      className="flex-1 py-2.5 rounded-[6px]"
                      style={{ border: '1.5px solid #E5E7EB', color: '#6B7280', fontWeight: 600, background: '#fff' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleTransition}
                      disabled={processing || (confirmModal.targetState === 'suspended_admin' && !reason.trim())}
                      className="flex-1 py-2.5 rounded-[6px] text-white flex items-center justify-center gap-2 transition-colors"
                      style={{ background: processing ? '#9CA3AF' : cfg.color, fontWeight: 600 }}
                    >
                      {processing ? (
                        <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                      ) : `Confirm`}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

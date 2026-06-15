import { useState } from 'react';
import { Plus, Search, CheckCircle2, X, Loader2 } from 'lucide-react';
import type { FeatureFlag, FlagScopeType } from './types';
import { MOCK_FEATURE_FLAGS, MOCK_TENANTS } from './mockData';

const SCOPE_BADGE: Record<FlagScopeType, { bg: string; color: string }> = {
  global:    { bg: '#0C1A2E', color: '#60A5FA' },
  plan_tier: { bg: '#1C1917', color: '#FBBF24' },
  tenant:    { bg: '#1F0A0A', color: '#F87171' },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'today';
  if (d === 1) return '1 day ago';
  return `${d} days ago`;
}

export function FeatureFlagsView() {
  const [flags, setFlags] = useState<FeatureFlag[]>(MOCK_FEATURE_FLAGS);
  const [query, setQuery] = useState('');
  const [filterScope, setFilterScope] = useState<FlagScopeType | 'all'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newScope, setNewScope] = useState<FlagScopeType>('global');
  const [newScopeId, setNewScopeId] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [toggling, setToggling] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  }

  function toggleFlag(id: string) {
    setToggling(id);
    setTimeout(() => {
      setFlags(fs => fs.map(f => f.id === id ? { ...f, enabled: !f.enabled, updatedAt: new Date().toISOString() } : f));
      setToggling(null);
      showToast('Flag updated. Change takes effect within 60 seconds.');
    }, 500);
  }

  function createFlag() {
    if (!newKey.trim() || !newDesc.trim()) return;
    const newFlag: FeatureFlag = {
      id: `ff_${Date.now()}`, key: newKey.trim(), description: newDesc.trim(),
      scopeType: newScope, scopeId: newScopeId || undefined,
      scopeLabel: newScopeId || undefined,
      enabled: false, createdBy: 'Alex Rivera', updatedAt: new Date().toISOString(),
    };
    setFlags(fs => [newFlag, ...fs]);
    setShowCreate(false);
    setNewKey(''); setNewDesc(''); setNewScope('global'); setNewScopeId('');
    showToast(`Flag "${newFlag.key}" created (disabled by default).`);
  }

  const filtered = flags.filter(f => {
    const q = query.toLowerCase();
    return (!q || f.key.toLowerCase().includes(q) || f.description.toLowerCase().includes(q))
      && (filterScope === 'all' || f.scopeType === filterScope);
  });

  return (
    <div className="flex flex-col h-full" style={{ color: '#F9FAFB' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.25rem' }}>Feature Flags</h2>
          <p style={{ fontSize: '0.825rem', color: '#6B7280', marginTop: 2 }}>
            Precedence: <span style={{ color: '#F87171' }}>tenant</span> › <span style={{ color: '#FBBF24' }}>plan-tier</span> › <span style={{ color: '#60A5FA' }}>global</span> · Cache TTL: 60s
          </p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ background: '#DC2626', color: '#fff' }}>
          <Plus size={14} /> New Flag
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#4B5563' }} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search flags…"
            className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: '#1F2937', border: '1px solid #374151', color: '#F9FAFB', fontFamily: 'Inter, sans-serif' }}
            onFocus={e => (e.target.style.borderColor = '#DC2626')}
            onBlur={e => (e.target.style.borderColor = '#374151')} />
        </div>
        <select value={filterScope} onChange={e => setFilterScope(e.target.value as any)}
          className="px-3 py-2.5 rounded-lg text-sm outline-none"
          style={{ background: '#1F2937', border: '1px solid #374151', color: '#D1D5DB' }}>
          <option value="all">All Scopes</option>
          <option value="global">Global</option>
          <option value="plan_tier">Plan Tier</option>
          <option value="tenant">Tenant</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #1F2937' }}>
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0D1526', borderBottom: '1px solid #1F2937' }}>
              {['Flag Key', 'Description', 'Scope', 'Last Changed By', 'Updated', 'State'].map(h => (
                <th key={h} className="text-left px-4 py-3"
                  style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4B5563', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((f, i) => {
              const sb = SCOPE_BADGE[f.scopeType];
              return (
                <tr key={f.id} style={{ borderBottom: '1px solid #1F2937', background: i % 2 === 0 ? '#111827' : '#0F1623' }}>
                  <td className="px-4 py-3">
                    <span style={{ fontFamily: 'monospace', fontSize: '0.825rem', color: '#E2E8F0', fontWeight: 600 }}>{f.key}</span>
                  </td>
                  <td className="px-4 py-3" style={{ fontSize: '0.825rem', color: '#9CA3AF', maxWidth: 260 }}>{f.description}</td>
                  <td className="px-4 py-3">
                    <div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
                        style={{ background: sb.bg, color: sb.color }}>
                        {f.scopeType.replace('_', ' ')}
                      </span>
                      {f.scopeLabel && <p style={{ fontSize: '0.7rem', color: '#4B5563', marginTop: 2 }}>{f.scopeLabel}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{ fontSize: '0.825rem', color: '#6B7280' }}>{f.createdBy}</td>
                  <td className="px-4 py-3" style={{ fontSize: '0.825rem', color: '#6B7280' }}>{timeAgo(f.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleFlag(f.id)} disabled={toggling === f.id}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: f.enabled ? '#3F1515' : '#1F2937',
                        color: f.enabled ? '#EF4444' : '#6B7280',
                        border: `1px solid ${f.enabled ? '#7F1D1D' : '#374151'}`,
                        opacity: toggling === f.id ? 0.6 : 1,
                      }}>
                      {toggling === f.id ? <Loader2 size={12} className="animate-spin" /> : (
                        <div className="w-2 h-2 rounded-full" style={{ background: f.enabled ? '#EF4444' : '#4B5563' }} />
                      )}
                      {f.enabled ? 'ON' : 'OFF'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create flag modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 mx-4" style={{ background: '#111827', border: '1px solid #1F2937' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 style={{ fontWeight: 700, color: '#F9FAFB', fontSize: '1rem' }}>New Feature Flag</h3>
              <button onClick={() => setShowCreate(false)} style={{ color: '#6B7280' }}><X size={18} /></button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 600 }}>Flag Key</label>
                <input value={newKey} onChange={e => setNewKey(e.target.value.replace(/\s/g, '_').toLowerCase())}
                  placeholder="e.g. my_new_feature"
                  className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none font-mono"
                  style={{ background: '#0D1526', border: '1px solid #1F2937', color: '#F9FAFB' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 600 }}>Description</label>
                <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="What does this flag control?"
                  className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: '#0D1526', border: '1px solid #1F2937', color: '#F9FAFB' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 600 }}>Scope</label>
                <select value={newScope} onChange={e => { setNewScope(e.target.value as FlagScopeType); setNewScopeId(''); }}
                  className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: '#0D1526', border: '1px solid #1F2937', color: '#D1D5DB' }}>
                  <option value="global">Global</option>
                  <option value="plan_tier">Plan Tier</option>
                  <option value="tenant">Specific Tenant</option>
                </select>
              </div>
              {newScope === 'plan_tier' && (
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 600 }}>Plan Tier</label>
                  <select value={newScopeId} onChange={e => setNewScopeId(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: '#0D1526', border: '1px solid #1F2937', color: '#D1D5DB' }}>
                    <option value="">Select…</option>
                    <option value="starter">Starter</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              )}
              {newScope === 'tenant' && (
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 600 }}>Tenant</label>
                  <select value={newScopeId} onChange={e => setNewScopeId(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: '#0D1526', border: '1px solid #1F2937', color: '#D1D5DB' }}>
                    <option value="">Select…</option>
                    {MOCK_TENANTS.map(t => <option key={t.id} value={t.id}>{t.businessName}</option>)}
                  </select>
                </div>
              )}
              <div className="flex gap-3 mt-1">
                <button onClick={() => setShowCreate(false)}
                  className="flex-1 py-2 rounded-lg text-sm" style={{ background: '#1F2937', color: '#9CA3AF' }}>Cancel</button>
                <button onClick={createFlag} disabled={!newKey.trim() || !newDesc.trim()}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: '#DC2626', color: '#fff', opacity: newKey.trim() && newDesc.trim() ? 1 : 0.4 }}>
                  Create (Disabled)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-6 right-6 px-4 py-3 rounded-xl text-sm font-medium z-50"
          style={{ background: '#052E16', color: '#4ADE80', border: '1px solid #14532D' }}>
          <CheckCircle2 size={14} className="inline mr-2" />{toastMsg}
        </div>
      )}
    </div>
  );
}

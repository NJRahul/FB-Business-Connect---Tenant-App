import { useState } from 'react';
import { RefreshCw, RotateCcw, Zap, Unlink, CheckCircle2, XCircle, Loader2, X, Clock } from 'lucide-react';
import type { OperationalToolLog, ToolName } from './types';
import { MOCK_TOOL_LOGS, MOCK_TENANTS } from './mockData';

interface Tool {
  name: ToolName;
  label: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  danger?: boolean;
  tenantRequired: boolean;
  entityLabel?: string;
  entityPlaceholder?: string;
}

const TOOLS: Tool[] = [
  {
    name: 'replay_webhook', label: 'Replay Failed Webhooks',
    description: 'Re-deliver failed webhook events for a tenant. Use after webhook receiver was temporarily down or returned non-2xx.',
    icon: RefreshCw, iconColor: '#60A5FA', iconBg: '#0C1A2E',
    tenantRequired: true, entityLabel: 'Webhook Event ID', entityPlaceholder: 'wh_evt_...',
  },
  {
    name: 'reprocess_queue', label: 'Reprocess Queue Items',
    description: 'Unstick items stuck in a processing queue (booking sync, invoice generation, notification delivery).',
    icon: RotateCcw, iconColor: '#A78BFA', iconBg: '#1A0F2E',
    tenantRequired: true, entityLabel: 'Queue Name', entityPlaceholder: 'e.g. booking_sync_queue',
  },
  {
    name: 'catalog_sync', label: 'Force Distributor Catalog Sync',
    description: 'Trigger an immediate catalog sync from a distributor for a specific tenant. Bypasses the normal 6-hour cadence.',
    icon: Zap, iconColor: '#FBBF24', iconBg: '#1C1917',
    tenantRequired: true, entityLabel: 'Distributor', entityPlaceholder: 'e.g. ATD, TireHub',
  },
  {
    name: 'disconnect_stripe', label: 'Force-Disconnect Stripe Connect',
    description: 'Hard-disconnect a misbehaving Stripe Connect account. Use only when the account is causing errors across the platform.',
    icon: Unlink, iconColor: '#F87171', iconBg: '#1C0A0A', danger: true,
    tenantRequired: true,
  },
];

interface ConfirmState { tool: Tool; tenantId: string; entity: string }

export function OperationalToolsView() {
  const [logs, setLogs] = useState<OperationalToolLog[]>(MOCK_TOOL_LOGS);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [selectedTenants, setSelectedTenants] = useState<Record<ToolName, string>>({} as any);
  const [entityValues, setEntityValues] = useState<Record<ToolName, string>>({} as any);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; success: boolean } | null>(null);

  function showToast(text: string, success: boolean) {
    setToastMsg({ text, success });
    setTimeout(() => setToastMsg(null), 3500);
  }

  function openConfirm(tool: Tool) {
    const tid = selectedTenants[tool.name] || '';
    const entity = entityValues[tool.name] || '';
    if (tool.tenantRequired && !tid) return;
    setConfirmState({ tool, tenantId: tid, entity });
  }

  function executeTool() {
    if (!confirmState) return;
    setLoading(true);
    const { tool, tenantId, entity } = confirmState;
    const tenant = MOCK_TENANTS.find(t => t.id === tenantId);

    setTimeout(() => {
      setLoading(false);
      const success = Math.random() > 0.15;
      const newLog: OperationalToolLog = {
        id: `tl_${Date.now()}`, adminId: 'adm_001', adminEmail: 'ops@fb-business-connect.com',
        toolName: tool.name, targetShopId: tenantId,
        targetShopName: tenant?.businessName,
        targetEntity: entity || undefined,
        outcome: success ? 'success' : 'failed',
        createdAt: new Date().toISOString(),
      };
      setLogs(l => [newLog, ...l]);
      setConfirmState(null);
      setEntityValues(v => ({ ...v, [tool.name]: '' }));
      if (success) {
        showToast(`${tool.label} completed successfully.`, true);
      } else {
        showToast(`${tool.label} failed. Check logs for details.`, false);
      }
    }, 1200);
  }

  function outcomeIcon(outcome: 'success' | 'failed' | 'pending') {
    if (outcome === 'success') return <CheckCircle2 size={13} color="#4ADE80" />;
    if (outcome === 'failed') return <XCircle size={13} color="#F87171" />;
    return <Clock size={13} color="#FBBF24" />;
  }

  const toolLabel: Record<ToolName, string> = {
    replay_webhook: 'Replay Webhooks',
    reprocess_queue: 'Reprocess Queue',
    catalog_sync: 'Catalog Sync',
    disconnect_stripe: 'Disconnect Stripe',
  };

  return (
    <div className="flex flex-col gap-6" style={{ color: '#F9FAFB' }}>
      <div>
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.25rem' }}>Operational Tools</h2>
        <p style={{ fontSize: '0.825rem', color: '#6B7280', marginTop: 2 }}>
          Every action is logged with your identity, target, and outcome.
        </p>
      </div>

      {/* Tool cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {TOOLS.map(tool => {
          const tid = selectedTenants[tool.name] || '';
          const entity = entityValues[tool.name] || '';
          const canRun = !tool.tenantRequired || !!tid;
          return (
            <div key={tool.name} className="rounded-xl p-5"
              style={{ background: '#111827', border: `1px solid ${tool.danger ? '#3F1515' : '#1F2937'}` }}>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: tool.iconBg }}>
                  <tool.icon size={18} color={tool.iconColor} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', color: tool.danger ? '#F87171' : '#F9FAFB' }}>{tool.label}</p>
                  <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: 3, lineHeight: 1.5 }}>{tool.description}</p>
                </div>
              </div>

              {/* Tenant selector */}
              <div className="flex flex-col gap-2 mb-4">
                <select value={tid} onChange={e => setSelectedTenants(v => ({ ...v, [tool.name]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: '#0D1526', border: '1px solid #1F2937', color: '#D1D5DB' }}>
                  <option value="">Select tenant…</option>
                  {MOCK_TENANTS.map(t => <option key={t.id} value={t.id}>{t.businessName}</option>)}
                </select>
                {tool.entityLabel && (
                  <input value={entity} onChange={e => setEntityValues(v => ({ ...v, [tool.name]: e.target.value }))}
                    placeholder={tool.entityPlaceholder || ''}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: '#0D1526', border: '1px solid #1F2937', color: '#D1D5DB', fontFamily: entity ? 'monospace' : 'Inter, sans-serif' }} />
                )}
              </div>

              <button onClick={() => openConfirm(tool)} disabled={!canRun}
                className="w-full py-2 rounded-lg text-sm font-semibold transition-opacity"
                style={{
                  background: tool.danger ? '#7F1D1D' : '#1F2937',
                  color: tool.danger ? '#F87171' : '#D1D5DB',
                  border: `1px solid ${tool.danger ? '#991B1B' : '#374151'}`,
                  opacity: canRun ? 1 : 0.4,
                }}>
                Run Tool
              </button>
            </div>
          );
        })}
      </div>

      {/* Tool log */}
      <div>
        <h3 style={{ fontWeight: 600, fontSize: '0.875rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
          Recent Executions
        </h3>
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #1F2937' }}>
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0D1526', borderBottom: '1px solid #1F2937' }}>
                {['Timestamp', 'Actor', 'Tool', 'Tenant', 'Entity', 'Outcome'].map(h => (
                  <th key={h} className="text-left px-4 py-3"
                    style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4B5563', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((l, i) => (
                <tr key={l.id} style={{ borderBottom: '1px solid #1F2937', background: i % 2 === 0 ? '#111827' : '#0F1623' }}>
                  <td className="px-4 py-3" style={{ fontSize: '0.8rem', color: '#6B7280', whiteSpace: 'nowrap' }}>
                    {new Date(l.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3" style={{ fontSize: '0.825rem', color: '#9CA3AF' }}>{l.adminEmail}</td>
                  <td className="px-4 py-3" style={{ fontSize: '0.825rem', color: '#D1D5DB', fontWeight: 500 }}>
                    {toolLabel[l.toolName]}
                  </td>
                  <td className="px-4 py-3" style={{ fontSize: '0.825rem', color: '#9CA3AF' }}>{l.targetShopName || '—'}</td>
                  <td className="px-4 py-3">
                    {l.targetEntity && (
                      <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#6B7280' }}>{l.targetEntity}</span>
                    )}
                    {!l.targetEntity && <span style={{ color: '#374151' }}>—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {outcomeIcon(l.outcome)}
                      <span style={{ fontSize: '0.8rem', color: l.outcome === 'success' ? '#4ADE80' : l.outcome === 'failed' ? '#F87171' : '#FBBF24' }}>
                        {l.outcome}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm modal */}
      {confirmState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 mx-4" style={{ background: '#111827', border: '1px solid #1F2937' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontWeight: 700, color: '#F9FAFB', fontSize: '1rem' }}>Confirm Execution</h3>
              <button onClick={() => setConfirmState(null)} style={{ color: '#6B7280' }}><X size={18} /></button>
            </div>
            <div className="rounded-xl p-4 mb-4" style={{ background: '#0D1526', border: '1px solid #1F2937' }}>
              <p style={{ fontSize: '0.825rem', color: '#9CA3AF' }}>Tool: <span style={{ color: '#F9FAFB', fontWeight: 600 }}>{confirmState.tool.label}</span></p>
              <p style={{ fontSize: '0.825rem', color: '#9CA3AF', marginTop: 4 }}>
                Tenant: <span style={{ color: '#F9FAFB' }}>{MOCK_TENANTS.find(t => t.id === confirmState.tenantId)?.businessName}</span>
              </p>
              {confirmState.entity && (
                <p style={{ fontSize: '0.825rem', color: '#9CA3AF', marginTop: 4, fontFamily: 'monospace' }}>
                  Target: {confirmState.entity}
                </p>
              )}
            </div>
            {confirmState.tool.danger && (
              <div className="flex items-start gap-2 rounded-lg p-3 mb-4" style={{ background: '#1C0A0A', border: '1px solid #3F1515' }}>
                <span style={{ fontSize: '0.8rem', color: '#FCA5A5' }}>
                  ⚠ This is a destructive action. Ensure you have verified the situation before proceeding.
                </span>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setConfirmState(null)} className="flex-1 py-2 rounded-lg text-sm" style={{ background: '#1F2937', color: '#9CA3AF' }}>Cancel</button>
              <button onClick={executeTool} disabled={loading}
                className="flex-1 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                style={{ background: confirmState.tool.danger ? '#7F1D1D' : '#DC2626', color: '#fff', opacity: loading ? 0.7 : 1 }}>
                {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                {loading ? 'Running…' : 'Execute'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-6 right-6 px-4 py-3 rounded-xl text-sm font-medium z-50 flex items-center gap-2"
          style={{ background: toastMsg.success ? '#052E16' : '#1C0A0A', color: toastMsg.success ? '#4ADE80' : '#F87171', border: `1px solid ${toastMsg.success ? '#14532D' : '#3F1515'}` }}>
          {toastMsg.success ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
          {toastMsg.text}
        </div>
      )}
    </div>
  );
}

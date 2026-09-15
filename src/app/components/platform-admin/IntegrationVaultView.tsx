import { useState } from 'react';
import { Lock, Eye, RotateCcw, CheckCircle2, AlertTriangle, X, Loader2, Clock } from 'lucide-react';
import type { Credential } from './types';
import { MOCK_CREDENTIALS, MOCK_CREDENTIAL_LOGS } from './mockData';

interface RevealModal { credential: Credential; reason: string }

export function IntegrationVaultView() {
  const [credentials] = useState<Credential[]>(MOCK_CREDENTIALS);
  const [revealModal, setRevealModal] = useState<{ cred: Credential } | null>(null);
  const [rotateModal, setRotateModal] = useState<{ cred: Credential } | null>(null);
  const [revealReason, setRevealReason] = useState('');
  const [rotateReason, setRotateReason] = useState('');
  const [revealedValue, setRevealedValue] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs] = useState(MOCK_CREDENTIAL_LOGS);

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  }

  function handleReveal() {
    if (!revealReason.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setRevealedValue(revealModal!.cred.maskedValue.replace(/•/g, '*') + ' [demo: actual value hidden]');
      console.log('[AUDIT] Credential read:', { key: revealModal!.cred.key, reason: revealReason });
      showToast(`Access to "${revealModal!.cred.key}" logged.`);
    }, 700);
  }

  function handleRotate() {
    if (!rotateReason.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setRotateModal(null);
      setRotateReason('');
      console.log('[AUDIT] Credential rotated:', { key: rotateModal!.cred.key, reason: rotateReason });
      showToast(`"${rotateModal!.cred.key}" rotation initiated. New value provisioned in vault.`);
    }, 900);
  }

  function daysSince(iso: string) {
    const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
    if (d === 0) return 'today';
    if (d === 1) return '1 day ago';
    return `${d} days ago`;
  }

  const platformCreds = credentials.filter(c => !c.tenantId);
  const tenantCreds = credentials.filter(c => c.tenantId);

  return (
    <div className="flex flex-col gap-6" style={{ color: '#F9FAFB' }}>
      <div>
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.25rem' }}>Integration Vault</h2>
        <p style={{ fontSize: '0.825rem', color: '#6B7280', marginTop: 2 }}>
          Secret values are never displayed in full. Every read and rotation is logged.
        </p>
      </div>

      {/* Platform credentials */}
      <div>
        <h3 style={{ fontWeight: 600, fontSize: '0.875rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
          Platform-Wide Credentials
        </h3>
        <div className="flex flex-col gap-3">
          {platformCreds.map(c => (
            <CredentialRow key={c.id} cred={c} daysSince={daysSince}
              onReveal={() => { setRevealModal({ cred: c }); setRevealReason(''); setRevealedValue(null); }}
              onRotate={() => { setRotateModal({ cred: c }); setRotateReason(''); }} />
          ))}
        </div>
      </div>

      {/* Per-tenant credentials */}
      {tenantCreds.length > 0 && (
        <div>
          <h3 style={{ fontWeight: 600, fontSize: '0.875rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            Per-Tenant Credentials
          </h3>
          <div className="flex flex-col gap-3">
            {tenantCreds.map(c => (
              <CredentialRow key={c.id} cred={c} daysSince={daysSince}
                onReveal={() => { setRevealModal({ cred: c }); setRevealReason(''); setRevealedValue(null); }}
                onRotate={() => { setRotateModal({ cred: c }); setRotateReason(''); }} />
            ))}
          </div>
        </div>
      )}

      {/* Access log */}
      <div>
        <h3 style={{ fontWeight: 600, fontSize: '0.875rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
          Recent Credential Access Log
        </h3>
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #1F2937' }}>
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0D1526', borderBottom: '1px solid #1F2937' }}>
                {['Timestamp', 'Actor', 'Credential Key', 'Reason'].map(h => (
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
                  <td className="px-4 py-3" style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                    {new Date(l.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <p style={{ fontSize: '0.825rem', fontWeight: 600, color: '#D1D5DB' }}>{l.adminName}</p>
                    <p style={{ fontSize: '0.75rem', color: '#4B5563' }}>{l.adminEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#E2E8F0' }}>{l.credentialKey}</span>
                  </td>
                  <td className="px-4 py-3" style={{ fontSize: '0.8rem', color: '#9CA3AF', maxWidth: 280 }}>{l.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reveal modal */}
      {revealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 mx-4" style={{ background: '#111827', border: '1px solid #1F2937' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontWeight: 700, color: '#F9FAFB' }}>View Credential</h3>
              <button onClick={() => { setRevealModal(null); setRevealedValue(null); }} style={{ color: '#6B7280' }}><X size={18} /></button>
            </div>
            <div className="flex items-start gap-2 rounded-lg p-3 mb-4" style={{ background: '#1C0A0A', border: '1px solid #3F1515' }}>
              <AlertTriangle size={14} color="#F87171" className="mt-0.5 shrink-0" />
              <p style={{ fontSize: '0.8rem', color: '#80D4D5' }}>
                This credential read will be audit-logged with your identity and reason.
              </p>
            </div>
            <div className="mb-4">
              <p style={{ fontSize: '0.825rem', color: '#9CA3AF', marginBottom: 6 }}>
                Key: <span style={{ fontFamily: 'monospace', color: '#E2E8F0' }}>{revealModal.cred.key}</span>
              </p>
              <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>{revealModal.cred.description}</p>
            </div>
            {!revealedValue ? (
              <>
                <div className="mb-4">
                  <label style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 600 }}>Reason for Access <span style={{ color: '#EF4444' }}>*</span></label>
                  <textarea value={revealReason} onChange={e => setRevealReason(e.target.value)} rows={3}
                    placeholder="Explain why you need to view this credential…"
                    className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none resize-none"
                    style={{ background: '#0D1526', border: '1px solid #1F2937', color: '#F9FAFB', fontFamily: 'Inter, sans-serif' }} />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setRevealModal(null)} className="flex-1 py-2 rounded-lg text-sm" style={{ background: '#1F2937', color: '#9CA3AF' }}>Cancel</button>
                  <button onClick={handleReveal} disabled={!revealReason.trim() || loading}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                    style={{ background: '#DC2626', color: '#fff', opacity: revealReason.trim() && !loading ? 1 : 0.4 }}>
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
                    {loading ? 'Logging…' : 'Reveal'}
                  </button>
                </div>
              </>
            ) : (
              <div>
                <div className="px-3 py-3 rounded-lg font-mono text-sm mb-4" style={{ background: '#0D1526', color: '#80D4D5', wordBreak: 'break-all' }}>
                  {revealedValue}
                </div>
                <p style={{ fontSize: '0.75rem', color: '#4B5563', marginBottom: 12 }}>
                  Auto-hide in 30 seconds. Close this window when done.
                </p>
                <button onClick={() => { setRevealModal(null); setRevealedValue(null); }}
                  className="w-full py-2 rounded-lg text-sm font-medium" style={{ background: '#1F2937', color: '#9CA3AF' }}>
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rotate modal */}
      {rotateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 mx-4" style={{ background: '#111827', border: '1px solid #1F2937' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontWeight: 700, color: '#F9FAFB' }}>Rotate Credential</h3>
              <button onClick={() => setRotateModal(null)} style={{ color: '#6B7280' }}><X size={18} /></button>
            </div>
            <div className="flex items-start gap-2 rounded-lg p-3 mb-4" style={{ background: '#1C1917', border: '1px solid #3D2E0A' }}>
              <AlertTriangle size={14} color="#FBBF24" className="mt-0.5 shrink-0" />
              <p style={{ fontSize: '0.8rem', color: '#FDE68A' }}>
                Rotating this credential will invalidate the current value. Ensure all dependent services are updated.
              </p>
            </div>
            <p style={{ fontSize: '0.825rem', color: '#9CA3AF', marginBottom: 16 }}>
              Key: <span style={{ fontFamily: 'monospace', color: '#E2E8F0' }}>{rotateModal.cred.key}</span>
            </p>
            <div className="mb-4">
              <label style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 600 }}>Reason for Rotation <span style={{ color: '#EF4444' }}>*</span></label>
              <textarea value={rotateReason} onChange={e => setRotateReason(e.target.value)} rows={3}
                placeholder="e.g. Q2 security review rotation, suspected compromise…"
                className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none resize-none"
                style={{ background: '#0D1526', border: '1px solid #1F2937', color: '#F9FAFB', fontFamily: 'Inter, sans-serif' }} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRotateModal(null)} className="flex-1 py-2 rounded-lg text-sm" style={{ background: '#1F2937', color: '#9CA3AF' }}>Cancel</button>
              <button onClick={handleRotate} disabled={!rotateReason.trim() || loading}
                className="flex-1 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                style={{ background: '#D97706', color: '#fff', opacity: rotateReason.trim() && !loading ? 1 : 0.4 }}>
                {loading ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                {loading ? 'Rotating…' : 'Rotate'}
              </button>
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

function CredentialRow({ cred, daysSince, onReveal, onRotate }: {
  cred: Credential; daysSince: (s: string) => string;
  onReveal: () => void; onRotate: () => void;
}) {
  const rotatedDays = Math.floor((Date.now() - new Date(cred.lastRotatedAt).getTime()) / 86400000);
  const isStale = rotatedDays > 90;

  return (
    <div className="rounded-xl p-4" style={{ background: '#111827', border: `1px solid ${isStale ? '#3D2E0A' : '#1F2937'}` }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: isStale ? '#1C1917' : '#0D1526' }}>
            <Lock size={15} color={isStale ? '#FBBF24' : '#60A5FA'} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.875rem', color: '#F9FAFB' }}>{cred.key}</p>
              {isStale && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs" style={{ background: '#1C1917', color: '#FBBF24' }}>
                  Stale
                </span>
              )}
              {cred.tenantName && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs" style={{ background: '#1F0A0A', color: '#F87171' }}>
                  {cred.tenantName}
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: 2 }}>{cred.provider} — {cred.description}</p>
            <div className="flex items-center gap-4 mt-2">
              <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#4B5563' }}>{cred.maskedValue}</span>
            </div>
            <div className="flex items-center gap-4 mt-1.5">
              <span className="flex items-center gap-1 text-xs" style={{ color: '#4B5563' }}>
                <Clock size={10} /> Rotated {daysSince(cred.lastRotatedAt)}
              </span>
              {cred.lastAccessedAt && (
                <span className="text-xs" style={{ color: '#4B5563' }}>Last accessed {daysSince(cred.lastAccessedAt)}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onReveal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: '#1F2937', color: '#9CA3AF', border: '1px solid #374151' }}>
            <Eye size={12} /> View
          </button>
          <button onClick={onRotate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: isStale ? '#1C1917' : '#1F2937', color: isStale ? '#FBBF24' : '#9CA3AF', border: `1px solid ${isStale ? '#3D2E0A' : '#374151'}` }}>
            <RotateCcw size={12} /> Rotate
          </button>
        </div>
      </div>
    </div>
  );
}

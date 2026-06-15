import { useState } from 'react';
import { ShieldAlert, X, Loader2 } from 'lucide-react';

interface Props {
  tenantName: string;
  actionLabel: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export function CrossTenantModal({ tenantName, actionLabel, onConfirm, onCancel }: Props) {
  const [reason, setReason] = useState('');
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim() || !checked) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onConfirm(reason.trim());
    }, 600);
  }

  const canSubmit = reason.trim().length >= 10 && checked;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="relative w-full max-w-md rounded-2xl p-6 mx-4" style={{ background: '#111827', border: '1px solid #DC2626', boxShadow: '0 0 40px rgba(220,38,38,0.15)' }}>
        <button onClick={onCancel} className="absolute top-4 right-4" style={{ color: '#6B7280' }}>
          <X size={18} />
        </button>

        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#1F0A0A' }}>
            <ShieldAlert size={20} color="#DC2626" />
          </div>
          <div>
            <h3 style={{ fontWeight: 700, color: '#F9FAFB', fontSize: '1rem' }}>Cross-Tenant Data Access</h3>
            <p style={{ fontSize: '0.825rem', color: '#9CA3AF', marginTop: 2 }}>
              You are about to access <span style={{ color: '#FCA5A5', fontWeight: 600 }}>{tenantName}</span>
              {' '}to perform: <span style={{ color: '#F9FAFB', fontWeight: 500 }}>{actionLabel}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Written Reason <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Describe why you need to access this tenant's data, including any relevant ticket or issue number…"
              rows={4}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
              style={{
                background: '#0D1526', border: '1px solid #1F2937', color: '#F9FAFB',
                fontFamily: 'Inter, sans-serif', lineHeight: 1.6,
              }}
              onFocus={e => (e.target.style.borderColor = '#DC2626')}
              onBlur={e => (e.target.style.borderColor = '#1F2937')}
            />
            <p style={{ fontSize: '0.75rem', color: reason.trim().length < 10 ? '#6B7280' : '#10B981', marginTop: 4 }}>
              {reason.trim().length}/10 characters minimum
            </p>
          </div>

          <label className="flex items-start gap-3 cursor-pointer" onClick={() => setChecked(v => !v)}>
            <div className="mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors"
              style={{ background: checked ? '#DC2626' : 'transparent', border: `2px solid ${checked ? '#DC2626' : '#374151'}` }}>
              {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>}
            </div>
            <span style={{ fontSize: '0.825rem', color: '#D1D5DB', lineHeight: 1.5 }}>
              I understand I am accessing another shop's data. This action will be logged and audited.
            </span>
          </label>

          <div className="flex gap-3 mt-1">
            <button type="button" onClick={onCancel}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium"
              style={{ background: '#1F2937', color: '#9CA3AF' }}>
              Cancel
            </button>
            <button type="submit" disabled={!canSubmit || loading}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-opacity"
              style={{ background: '#DC2626', color: '#fff', opacity: canSubmit && !loading ? 1 : 0.4 }}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : null}
              {loading ? 'Logging…' : 'Proceed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

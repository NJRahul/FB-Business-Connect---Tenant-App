'use client';
import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle, Send, Phone, ExternalLink, RefreshCw } from 'lucide-react';
import { MID_JOB_AUTHS } from './mockData';
import type { MidJobAuth as MidJobAuthType, AuthStatus } from './types';

const STATUS_CONFIG: Record<AuthStatus, { bg: string; color: string; border: string; label: string; icon: React.ReactNode }> = {
  pending:   { bg: '#FEF3C7', color: '#B45309', border: '#F59E0B', label: 'Awaiting Response', icon: <Clock size={14} /> },
  approved:  { bg: '#D1FAE5', color: '#065F46', border: '#10B981', label: 'Approved',           icon: <CheckCircle size={14} /> },
  declined:  { bg: '#FEE2E2', color: '#991B1B', border: '#EF4444', label: 'Declined',           icon: <XCircle size={14} /> },
  timeout:   { bg: '#F3F4F6', color: '#4B5563', border: '#9CA3AF', label: 'Timed Out',          icon: <Clock size={14} /> },
  bypassed:  { bg: '#EDE9FE', color: '#5B21B6', border: '#7C3AED', label: 'Bypassed',           icon: <AlertTriangle size={14} /> },
};

function CountdownTimer({ requestedAt, timeoutMinutes, status }: { requestedAt: string; timeoutMinutes: number; status: AuthStatus }) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (status !== 'pending') return;
    const deadline = new Date(requestedAt).getTime() + timeoutMinutes * 60 * 1000;
    const tick = () => setRemaining(Math.max(0, Math.round((deadline - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [requestedAt, timeoutMinutes, status]);

  if (status !== 'pending') return null;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const pct = Math.min(100, ((timeoutMinutes * 60 - remaining) / (timeoutMinutes * 60)) * 100);
  const urgent = remaining < 120;

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: '#6B7280' }}>Response window</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: urgent ? '#DC2626' : '#D97706', fontFamily: 'monospace' }}>
          {mins}:{String(secs).padStart(2, '0')}
        </span>
      </div>
      <div style={{ height: 6, background: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: urgent ? '#EF4444' : '#F59E0B', borderRadius: 3, transition: 'width 1s linear' }} />
      </div>
    </div>
  );
}

interface AuthDetailProps {
  auth: MidJobAuthType;
  onStatusChange: (id: string, status: AuthStatus) => void;
}

function AuthDetail({ auth, onStatusChange }: AuthDetailProps) {
  const [showPortal, setShowPortal] = useState(false);
  const cfg = STATUS_CONFIG[auth.status];

  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 15, color: '#1A1A1A' }}>{auth.customerName}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, borderRadius: 8, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>
              {cfg.icon} {cfg.label}
            </span>
          </div>
          <div style={{ fontSize: 13, color: '#6B7280' }}>{auth.visitSummary}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 800, color: '#00A9AC' }}>${auth.price.toFixed(2)}</div>
          <div style={{ fontSize: 11, color: '#9CA3AF' }}>additional charge</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Root Cause</div>
            <div style={{ fontSize: 13, color: '#1A1A1A' }}>{auth.rootCause}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Proposed By</div>
            <div style={{ fontSize: 13, color: '#1A1A1A' }}>{auth.proposedBy}</div>
          </div>
        </div>

        <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: '10px 14px', marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Description</div>
          <div style={{ fontSize: 13, color: '#374151' }}>{auth.description}</div>
        </div>

        {/* Photos */}
        {auth.photos.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {auth.photos.map((p, i) => (
              <div key={i} style={{ width: 56, height: 56, background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                {p}
              </div>
            ))}
          </div>
        )}

        <CountdownTimer requestedAt={auth.requestedAt} timeoutMinutes={auth.timeoutMinutes} status={auth.status} />

        {/* Responded at */}
        {auth.respondedAt && (
          <div style={{ marginTop: 10, fontSize: 12, color: '#6B7280' }}>
            Responded: {new Date(auth.respondedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}

        {/* Actions */}
        {auth.status === 'pending' && (
          <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowPortal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: '#fff' }}
            >
              <ExternalLink size={14} /> Preview Portal
            </button>
            <button
              onClick={() => {}}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: '#fff' }}
            >
              <Send size={14} /> Resend Link
            </button>
            <button
              onClick={() => {}}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: '#fff' }}
            >
              <Phone size={14} /> Call Customer
            </button>
            <button
              onClick={() => onStatusChange(auth.id, 'bypassed')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #7C3AED', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: '#EDE9FE', color: '#5B21B6' }}
            >
              Bypass & Proceed
            </button>
          </div>
        )}

        {/* Simulate response buttons (demo only) */}
        {auth.status === 'pending' && (
          <div style={{ marginTop: 10, padding: '10px 14px', background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: '#15803D', fontWeight: 600, marginBottom: 8 }}>DEMO — Simulate customer response:</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => onStatusChange(auth.id, 'approved')}
                style={{ padding: '6px 14px', background: '#22C55E', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                ✓ Approve
              </button>
              <button onClick={() => onStatusChange(auth.id, 'declined')}
                style={{ padding: '6px 14px', background: '#EF4444', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                ✗ Decline
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Portal Preview */}
      {showPortal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 400, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            {/* Mobile-style header */}
            <div style={{ background: '#00A9AC', padding: '20px 20px 16px', color: '#fff' }}>
              <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Authorization Request</div>
              <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 800 }}>Additional Work Found</div>
              <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>{auth.visitSummary}</div>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#1A1A1A', marginBottom: 8 }}>{auth.description}</div>
              <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>{auth.rootCause}</div>
              {auth.photos.length > 0 && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  {auth.photos.map((p, i) => (
                    <div key={i} style={{ width: 64, height: 64, background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{p}</div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#E6F7F7', border: '1px solid #00A9AC', borderRadius: 10, marginBottom: 16 }}>
                <span style={{ fontWeight: 600, color: '#00A9AC' }}>Additional Charge</span>
                <span style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 800, color: '#00A9AC' }}>${auth.price.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button style={{ flex: 1, padding: '12px 0', border: '2px solid #E5E7EB', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', background: '#fff', color: '#6B7280' }}>Decline</button>
                <button style={{ flex: 2, padding: '12px 0', background: '#00A9AC', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Approve & Authorize</button>
              </div>
              <div style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginTop: 10 }}>
                Secured link · expires in {auth.timeoutMinutes} min · {auth.customerPhone}
              </div>
            </div>
            <div style={{ padding: '0 20px 20px' }}>
              <button onClick={() => setShowPortal(false)} style={{ width: '100%', padding: '10px 0', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: '#F9FAFB', color: '#6B7280' }}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface NewAuthModalProps {
  onClose: () => void;
  onCreate: (auth: MidJobAuthType) => void;
}

function NewAuthModal({ onClose, onCreate }: NewAuthModalProps) {
  const [form, setForm] = useState({ visitId: '', customerName: '', customerPhone: '', description: '', rootCause: '', price: '' });

  const visits = [
    { id: 'v-001', label: 'James Calloway – Wheel Alignment' },
    { id: 'v-002', label: 'Maria Garcia – Oil Change' },
    { id: 'v-005', label: 'Robert Kim – Tire Install' },
  ];

  const handleSubmit = () => {
    if (!form.visitId || !form.description || !form.price) return;
    const sel = visits.find(v => v.id === form.visitId);
    const auth: MidJobAuthType = {
      id: `mjauth-${Date.now()}`,
      visitId: form.visitId,
      visitSummary: sel?.label ?? form.visitId,
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      proposedBy: 'Mike Torres',
      description: form.description,
      photos: [],
      rootCause: form.rootCause,
      price: Number(form.price),
      status: 'pending',
      publicToken: `tok_${Math.random().toString(36).slice(2, 10)}`,
      requestedAt: new Date().toISOString(),
      timeoutMinutes: 15,
    };
    onCreate(auth);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 480, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 16 }}>New Mid-Job Authorization</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Visit', key: 'visitId', type: 'select', options: visits },
            { label: 'Customer Name', key: 'customerName', type: 'text', placeholder: 'e.g. James Calloway' },
            { label: 'Customer Phone', key: 'customerPhone', type: 'text', placeholder: 'e.g. +27 11 200 1111' },
            { label: 'Description of Work', key: 'description', type: 'textarea', placeholder: 'What additional work is needed?' },
            { label: 'Root Cause', key: 'rootCause', type: 'text', placeholder: 'e.g. Found corroded caliper during brake inspection' },
            { label: 'Additional Charge ($)', key: 'price', type: 'number', placeholder: '0.00' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>{f.label}</label>
              {f.type === 'select' ? (
                <select value={(form as Record<string, string>)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}>
                  <option value="">Select visit...</option>
                  {f.options?.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              ) : f.type === 'textarea' ? (
                <textarea value={(form as Record<string, string>)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder} rows={3}
                  style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
              ) : (
                <input type={f.type} value={(form as Record<string, string>)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              )}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px 0', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, cursor: 'pointer', background: '#fff' }}>Cancel</button>
          <button onClick={handleSubmit} style={{ flex: 2, padding: '10px 0', background: '#00A9AC', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Send Authorization Request
          </button>
        </div>
      </div>
    </div>
  );
}

export function MidJobAuth() {
  const [auths, setAuths] = useState<MidJobAuthType[]>(MID_JOB_AUTHS);
  const [showNew, setShowNew] = useState(false);
  const [filter, setFilter] = useState<AuthStatus | 'all'>('all');

  const handleStatusChange = (id: string, status: AuthStatus) => {
    setAuths(prev => prev.map(a => a.id === id ? { ...a, status, respondedAt: new Date().toISOString() } : a));
  };

  const filtered = filter === 'all' ? auths : auths.filter(a => a.status === filter);
  const pendingCount = auths.filter(a => a.status === 'pending').length;

  return (
    <div style={{ padding: '20px 0', fontFamily: 'Inter, sans-serif' }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Pending', value: auths.filter(a => a.status === 'pending').length, color: '#D97706', bg: '#FEF3C7' },
          { label: 'Approved', value: auths.filter(a => a.status === 'approved').length, color: '#059669', bg: '#D1FAE5' },
          { label: 'Declined', value: auths.filter(a => a.status === 'declined').length, color: '#DC2626', bg: '#FEE2E2' },
          { label: 'Bypassed', value: auths.filter(a => a.status === 'bypassed').length, color: '#7C3AED', bg: '#EDE9FE' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'pending', 'approved', 'declined', 'bypassed'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: filter === f ? 700 : 400, cursor: 'pointer', border: filter === f ? '1.5px solid #00A9AC' : '1px solid #E5E7EB', background: filter === f ? '#E6F7F7' : '#fff', color: filter === f ? '#00A9AC' : '#6B7280', textTransform: 'capitalize' }}>
              {f === 'all' ? 'All' : STATUS_CONFIG[f]?.label ?? f}
              {f === 'pending' && pendingCount > 0 && (
                <span style={{ marginLeft: 6, background: '#00A9AC', color: '#fff', borderRadius: '50%', padding: '0 6px', fontSize: 11, fontWeight: 700 }}>{pendingCount}</span>
              )}
            </button>
          ))}
        </div>
        <button onClick={() => setShowNew(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#00A9AC', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          <Send size={14} /> New Authorization
        </button>
      </div>

      {/* Auth list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF', fontSize: 15 }}>No authorizations match this filter.</div>
        )}
        {filtered.map(auth => (
          <AuthDetail key={auth.id} auth={auth} onStatusChange={handleStatusChange} />
        ))}
      </div>

      {showNew && <NewAuthModal onClose={() => setShowNew(false)} onCreate={a => setAuths(prev => [a, ...prev])} />}
    </div>
  );
}

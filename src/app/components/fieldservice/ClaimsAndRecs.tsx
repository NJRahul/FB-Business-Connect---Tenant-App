'use client';
import React, { useState } from 'react';
import { AlertOctagon, ThumbsUp, Calendar, ChevronDown, ChevronUp, Plus, X, Image } from 'lucide-react';
import { DAMAGE_CLAIMS, RECOMMENDATIONS } from './mockData';
import type { DamageClaim, ClaimStatus, Recommendation, RecoStatus } from './types';

// ─── Recommendations ────────────────────────────────────────────────────────

const RECO_STATUS_CFG: Record<RecoStatus, { bg: string; color: string; border: string; label: string }> = {
  pending:     { bg: '#FEF3C7', color: '#B45309', border: '#F59E0B', label: 'Pending Follow-up' },
  booked:      { bg: '#D1FAE5', color: '#065F46', border: '#10B981', label: 'Booked' },
  declined:    { bg: '#FEE2E2', color: '#991B1B', border: '#EF4444', label: 'Declined' },
  no_response: { bg: '#F3F4F6', color: '#4B5563', border: '#9CA3AF', label: 'No Response' },
};

function RecoCard({ reco, onStatusChange }: { reco: Recommendation; onStatusChange: (id: string, s: RecoStatus) => void }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = RECO_STATUS_CFG[reco.status];

  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
      <div onClick={() => setExpanded(e => !e)} style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, background: '#E6F7F7', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ThumbsUp size={16} color="#00A9AC" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#1A1A1A', marginBottom: 2 }}>{reco.type}</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>{reco.customerName} · {reco.followUpDate}</div>
        </div>
        <span style={{ display: 'flex', alignItems: 'center', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, borderRadius: 8, padding: '3px 10px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
          {cfg.label}
        </span>
        {expanded ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid #E5E7EB', padding: '14px 16px' }}>
          <div style={{ fontSize: 13, color: '#374151', marginBottom: 12 }}>{reco.notes}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {reco.status === 'pending' && (
              <>
                <button onClick={() => onStatusChange(reco.id, 'booked')}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#27AE60', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  <Calendar size={14} /> Book Appointment
                </button>
                <button onClick={() => onStatusChange(reco.id, 'declined')}
                  style={{ padding: '7px 14px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: '#fff', color: '#6B7280' }}>
                  Mark Declined
                </button>
                <button onClick={() => onStatusChange(reco.id, 'no_response')}
                  style={{ padding: '7px 14px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: '#fff', color: '#6B7280' }}>
                  No Response
                </button>
              </>
            )}
            {reco.status !== 'pending' && (
              <button onClick={() => onStatusChange(reco.id, 'pending')}
                style={{ padding: '7px 14px', border: '1px dashed #6B7280', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: '#fff', color: '#6B7280' }}>
                Reset to Pending
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NewRecoModal({ onClose, onCreate }: { onClose: () => void; onCreate: (r: Recommendation) => void }) {
  const [form, setForm] = useState({ customerName: '', type: '', notes: '', followUpDate: '' });
  const types = ['Brake Inspection', 'Wheel Alignment', 'Tire Rotation', 'Battery Check', 'Cabin Air Filter', 'Transmission Service', 'Coolant Flush'];

  const handleSubmit = () => {
    if (!form.customerName || !form.type || !form.followUpDate) return;
    onCreate({
      id: `reco-${Date.now()}`,
      shopId: 'shop-1',
      visitId: 'v-001',
      customerId: 'cust-1',
      customerName: form.customerName,
      type: form.type,
      notes: form.notes,
      followUpDate: form.followUpDate,
      status: 'pending',
      photoIds: [],
      createdAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 420, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 16 }}>New Recommendation</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="#6B7280" /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Customer Name</label>
            <input value={form.customerName} onChange={e => setForm(p => ({ ...p, customerName: e.target.value }))} placeholder="e.g. James Calloway"
              style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Service Type</label>
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
              style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}>
              <option value="">Select type...</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Notes</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} placeholder="Technician observations..."
              style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Follow-up Date</label>
            <input type="date" value={form.followUpDate} onChange={e => setForm(p => ({ ...p, followUpDate: e.target.value }))} min="2026-06-15"
              style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px 0', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, cursor: 'pointer', background: '#fff' }}>Cancel</button>
          <button onClick={handleSubmit} style={{ flex: 2, padding: '10px 0', background: '#00A9AC', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Create Recommendation</button>
        </div>
      </div>
    </div>
  );
}

// ─── Damage Claims ───────────────────────────────────────────────────────────

const CLAIM_STATUS_CFG: Record<ClaimStatus, { bg: string; color: string; border: string; label: string }> = {
  received:              { bg: '#EFF6FF', color: '#1D4ED8', border: '#93C5FD', label: 'Received' },
  under_investigation:   { bg: '#FEF3C7', color: '#B45309', border: '#F59E0B', label: 'Under Investigation' },
  awaiting_customer_info:{ bg: '#FDF4FF', color: '#7E22CE', border: '#C084FC', label: 'Awaiting Customer Info' },
  awaiting_parts:        { bg: '#F0FDFA', color: '#0F766E', border: '#5EEAD4', label: 'Awaiting Parts' },
  resolved:              { bg: '#D1FAE5', color: '#065F46', border: '#10B981', label: 'Resolved' },
  denied:                { bg: '#F3F4F6', color: '#4B5563', border: '#9CA3AF', label: 'Denied' },
};

const STATUS_ORDER: ClaimStatus[] = ['received', 'under_investigation', 'awaiting_customer_info', 'awaiting_parts', 'resolved'];

function ClaimCard({ claim, onUpdate }: { claim: DamageClaim; onUpdate: (id: string, patch: Partial<DamageClaim>) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(claim.internalNotes);
  const cfg = CLAIM_STATUS_CFG[claim.status];

  const nextStatus = (): ClaimStatus | null => {
    const idx = STATUS_ORDER.indexOf(claim.status);
    return idx >= 0 && idx < STATUS_ORDER.length - 1 ? STATUS_ORDER[idx + 1] : null;
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
      <div onClick={() => setExpanded(e => !e)} style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, background: '#FFF7ED', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <AlertOctagon size={16} color="#F97316" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#1A1A1A', marginBottom: 2 }}>{claim.customerName} — {claim.category}</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>{claim.visitSummary} · {claim.createdAt.slice(0, 10)}</div>
        </div>
        <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, borderRadius: 8, padding: '3px 10px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
          {cfg.label}
        </span>
        {expanded ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid #E5E7EB', padding: '14px 16px' }}>
          {/* Status pipeline */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
            {STATUS_ORDER.map((s, i) => {
              const cur = STATUS_ORDER.indexOf(claim.status);
              const done = i <= cur;
              const c = CLAIM_STATUS_CFG[s];
              return (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {i > 0 && <div style={{ width: 20, height: 2, background: done ? c.border : '#E5E7EB' }} />}
                  <div style={{ padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: done ? c.bg : '#F9FAFB', color: done ? c.color : '#9CA3AF', border: `1px solid ${done ? c.border : '#E5E7EB'}` }}>
                    {c.label}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Description</div>
              <div style={{ fontSize: 13, color: '#374151' }}>{claim.description}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Preferred Resolution</div>
              <div style={{ fontSize: 13, color: '#374151' }}>{claim.preferredResolution}</div>
            </div>
          </div>

          {claim.photos.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {claim.photos.map((p, i) => (
                <div key={i} style={{ width: 56, height: 56, background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                  {p}
                </div>
              ))}
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Internal Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {nextStatus() && (
              <button onClick={() => onUpdate(claim.id, { status: nextStatus()!, updatedAt: new Date().toISOString() })}
                style={{ padding: '7px 14px', background: '#00A9AC', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Advance → {CLAIM_STATUS_CFG[nextStatus()!].label}
              </button>
            )}
            {claim.status !== 'denied' && claim.status !== 'resolved' && (
              <button onClick={() => onUpdate(claim.id, { status: 'denied', updatedAt: new Date().toISOString() })}
                style={{ padding: '7px 14px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: '#fff', color: '#6B7280' }}>
                Deny Claim
              </button>
            )}
            <button onClick={() => onUpdate(claim.id, { internalNotes: notes, updatedAt: new Date().toISOString() })}
              style={{ padding: '7px 14px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: '#fff', color: '#6B7280' }}>
              Save Notes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NewClaimModal({ onClose, onCreate }: { onClose: () => void; onCreate: (c: DamageClaim) => void }) {
  const [form, setForm] = useState({ customerName: '', category: '', description: '', preferredResolution: '' });
  const categories = ['Paint/Scratch', 'Rim Damage', 'Interior Damage', 'Mechanical Damage', 'Missing Items', 'Other'];

  const handleSubmit = () => {
    if (!form.customerName || !form.category || !form.description) return;
    onCreate({
      id: `claim-${Date.now()}`,
      shopId: 'shop-1',
      visitId: 'v-001',
      visitSummary: 'Walk-in visit',
      customerId: 'cust-1',
      customerName: form.customerName,
      category: form.category,
      description: form.description,
      photos: [],
      preferredResolution: form.preferredResolution,
      status: 'received',
      internalNotes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 420, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 16 }}>File Damage Claim</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="#6B7280" /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Customer Name', key: 'customerName', type: 'text', placeholder: 'e.g. James Calloway' },
            { label: 'Category', key: 'category', type: 'select' },
            { label: 'Description', key: 'description', type: 'textarea', placeholder: 'Describe the damage in detail...' },
            { label: 'Preferred Resolution', key: 'preferredResolution', type: 'text', placeholder: 'e.g. Repaint at no charge' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>{f.label}</label>
              {f.type === 'select' ? (
                <select value={(form as Record<string, string>)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}>
                  <option value="">Select category...</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              ) : f.type === 'textarea' ? (
                <textarea value={(form as Record<string, string>)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder} rows={3}
                  style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
              ) : (
                <input type="text" value={(form as Record<string, string>)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              )}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px 0', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, cursor: 'pointer', background: '#fff' }}>Cancel</button>
          <button onClick={handleSubmit} style={{ flex: 2, padding: '10px 0', background: '#00A9AC', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>File Claim</button>
        </div>
      </div>
    </div>
  );
}

// ─── Combined view ───────────────────────────────────────────────────────────

export function ClaimsAndRecs() {
  const [tab, setTab] = useState<'recos' | 'claims'>('recos');
  const [recos, setRecos] = useState<Recommendation[]>(RECOMMENDATIONS);
  const [claims, setClaims] = useState<DamageClaim[]>(DAMAGE_CLAIMS);
  const [showNewReco, setShowNewReco] = useState(false);
  const [showNewClaim, setShowNewClaim] = useState(false);

  const updateRecoStatus = (id: string, status: RecoStatus) =>
    setRecos(prev => prev.map(r => r.id === id ? { ...r, status } : r));

  const updateClaim = (id: string, patch: Partial<DamageClaim>) =>
    setClaims(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));

  const pendingRecos = recos.filter(r => r.status === 'pending').length;
  const openClaims = claims.filter(c => !['resolved', 'denied'].includes(c.status)).length;

  return (
    <div style={{ padding: '20px 0', fontFamily: 'Inter, sans-serif' }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Pending Follow-ups', value: pendingRecos, color: '#D97706', bg: '#FEF3C7' },
          { label: 'Booked from Recos', value: recos.filter(r => r.status === 'booked').length, color: '#059669', bg: '#D1FAE5' },
          { label: 'Open Claims', value: openClaims, color: '#00A9AC', bg: '#E6F7F7' },
          { label: 'Resolved Claims', value: claims.filter(c => c.status === 'resolved').length, color: '#6B7280', bg: '#F9FAFB' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 4, background: '#F9FAFB', padding: 4, borderRadius: 10, border: '1px solid #E5E7EB' }}>
          {([['recos', 'Recommendations', ThumbsUp], ['claims', 'Damage Claims', AlertOctagon]] as const).map(([id, label, Icon]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: tab === id ? 700 : 500, cursor: 'pointer', border: 'none', background: tab === id ? '#fff' : 'transparent', color: tab === id ? '#00A9AC' : '#6B7280', boxShadow: tab === id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>
              <Icon size={14} /> {label}
              {id === 'recos' && pendingRecos > 0 && (
                <span style={{ background: '#F59E0B', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{pendingRecos}</span>
              )}
              {id === 'claims' && openClaims > 0 && (
                <span style={{ background: '#00A9AC', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{openClaims}</span>
              )}
            </button>
          ))}
        </div>
        <button onClick={() => tab === 'recos' ? setShowNewReco(true) : setShowNewClaim(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#00A9AC', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} /> {tab === 'recos' ? 'New Recommendation' : 'File Claim'}
        </button>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tab === 'recos' && (
          recos.length === 0
            ? <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>No recommendations yet.</div>
            : recos.map(r => <RecoCard key={r.id} reco={r} onStatusChange={updateRecoStatus} />)
        )}
        {tab === 'claims' && (
          claims.length === 0
            ? <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>No damage claims on file.</div>
            : claims.map(c => <ClaimCard key={c.id} claim={c} onUpdate={updateClaim} />)
        )}
      </div>

      {showNewReco && <NewRecoModal onClose={() => setShowNewReco(false)} onCreate={r => setRecos(prev => [r, ...prev])} />}
      {showNewClaim && <NewClaimModal onClose={() => setShowNewClaim(false)} onCreate={c => setClaims(prev => [c, ...prev])} />}
    </div>
  );
}

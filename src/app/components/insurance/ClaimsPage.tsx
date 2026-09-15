import { useState, useRef } from 'react';
import {
  AlertTriangle, CheckCircle2, Clock, FileText, ChevronDown, ChevronRight,
  Plus, Loader2, MapPin, Phone, User,
} from 'lucide-react';
import type { InsuranceClaim, LossType, ClaimStatus } from '../../../lib/insurance/types';
import { getInsuranceProvider } from '../../../lib/insurance/mockProvider';
import { newIdempotencyKey } from '../../../lib/insurance/types';
import { MOCK_CLAIMS, MOCK_POLICIES } from './mockData';

const LOSS_TYPE_LABELS: Record<LossType, string> = {
  property_damage: 'Property damage',
  bodily_injury:   'Bodily injury',
  vehicle_accident:'Vehicle accident',
  theft:           'Theft',
  vandalism:       'Vandalism',
  weather:         'Weather',
  fire:            'Fire',
  slip_fall:       'Slip & fall',
  other:           'Other',
};

const STATUS_CFG: Record<ClaimStatus, { label: string; color: string; bg: string }> = {
  reported:      { label: 'Reported',      color: '#2980B9', bg: '#EBF5FB' },
  acknowledged:  { label: 'Acknowledged',  color: '#2980B9', bg: '#EBF5FB' },
  investigating: { label: 'Investigating', color: '#F39C12', bg: '#FFF8E1' },
  approved:      { label: 'Approved',      color: '#27AE60', bg: '#F0FDF4' },
  denied:        { label: 'Denied',        color: '#00BFC3', bg: '#FEF2F2' },
  paid:          { label: 'Paid',          color: '#27AE60', bg: '#F0FDF4' },
  closed:        { label: 'Closed',        color: '#6B7280', bg: '#F3F4F6' },
};

const CLAIM_TIMELINE: Record<ClaimStatus, string[]> = {
  reported:      ['Reported', 'Acknowledged', 'Investigating', 'Resolved'],
  acknowledged:  ['Reported', 'Acknowledged', 'Investigating', 'Resolved'],
  investigating: ['Reported', 'Acknowledged', 'Investigating', 'Resolved'],
  approved:      ['Reported', 'Acknowledged', 'Investigating', 'Approved', 'Paid'],
  denied:        ['Reported', 'Acknowledged', 'Denied'],
  paid:          ['Reported', 'Acknowledged', 'Investigating', 'Approved', 'Paid'],
  closed:        ['Reported', 'Acknowledged', 'Closed'],
};

function statusStepIndex(status: ClaimStatus): number {
  const steps = CLAIM_TIMELINE[status] ?? [];
  const label = STATUS_CFG[status]?.label ?? '';
  const idx = steps.findIndex(s => s.toLowerCase() === label.toLowerCase());
  return idx < 0 ? 0 : idx;
}

function ClaimCard({ claim }: { claim: InsuranceClaim }) {
  const [expanded, setExpanded] = useState(false);
  const sc = STATUS_CFG[claim.status];
  const timeline = CLAIM_TIMELINE[claim.status] ?? [];
  const activeIdx = statusStepIndex(claim.status);
  const policy = MOCK_POLICIES.find(p => p.id === claim.policy_id);

  return (
    <div className="rounded-[10px]" style={{ border: '1px solid #E5E7EB', background: '#fff' }}>
      <div className="flex items-center justify-between px-5 py-4 cursor-pointer" onClick={() => setExpanded(v => !v)}>
        <div className="flex items-center gap-3">
          <AlertTriangle size={18} style={{ color: '#F39C12' }} />
          <div>
            <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>
              {LOSS_TYPE_LABELS[claim.loss_type]} — {claim.coverage_name}
            </p>
            <p style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>
              {claim.claim_number ?? 'Pending claim #'} · {new Date(claim.reported_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
          {expanded ? <ChevronDown size={16} style={{ color: '#6B7280' }} /> : <ChevronRight size={16} style={{ color: '#6B7280' }} />}
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 pt-2 space-y-5" style={{ borderTop: '1px solid #F3F4F6' }}>
          {/* Timeline */}
          <div>
            <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.875rem', marginBottom: 12 }}>Claim status</p>
            <div className="flex items-center gap-2">
              {timeline.map((step, i) => {
                const done = i <= activeIdx;
                return (
                  <div key={step} className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: done ? '#1A1A1A' : '#E5E7EB' }}>
                        {done ? <CheckCircle2 size={12} style={{ color: '#fff' }} /> : <div className="w-2 h-2 rounded-full" style={{ background: '#9CA3AF' }} />}
                      </div>
                      <p style={{ fontSize: '0.65rem', color: done ? '#1A1A1A' : '#9CA3AF', fontWeight: done ? 600 : 400, whiteSpace: 'nowrap', marginTop: 4 }}>{step}</p>
                    </div>
                    {i < timeline.length - 1 && (
                      <div className="flex-1 h-0.5 mb-5" style={{ background: i < activeIdx ? '#1A1A1A' : '#E5E7EB' }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <span style={{ color: '#6B7280' }}>Loss date</span>
            <span style={{ fontWeight: 600, color: '#1A1A1A' }}>{new Date(claim.loss_datetime).toLocaleString()}</span>
            <span style={{ color: '#6B7280' }}>Location</span>
            <span style={{ fontWeight: 600, color: '#1A1A1A' }}>{claim.location_json.address}</span>
            <span style={{ color: '#6B7280' }}>Injuries</span>
            <span style={{ fontWeight: 600, color: claim.injuries ? '#00A9AC' : '#27AE60' }}>{claim.injuries ? 'Yes' : 'No'}</span>
            {claim.adjuster_name && (
              <>
                <span style={{ color: '#6B7280' }}>Adjuster</span>
                <span style={{ fontWeight: 600, color: '#1A1A1A' }}>{claim.adjuster_name}</span>
                <span style={{ color: '#6B7280' }}>Adjuster contact</span>
                <span style={{ fontWeight: 600, color: '#1A1A1A' }}>{claim.adjuster_contact}</span>
              </>
            )}
            <span style={{ color: '#6B7280' }}>Reserve amount</span>
            <span style={{ fontWeight: 700, color: '#1A1A1A', fontVariantNumeric: 'tabular-nums' }}>
              {claim.reserve_amount > 0 ? `R ${(claim.reserve_amount / 100).toLocaleString()}` : '—'}
            </span>
            <span style={{ color: '#6B7280' }}>Payout</span>
            <span style={{ fontWeight: 700, color: claim.payout_amount > 0 ? '#1A1A1A' : '#9CA3AF', fontVariantNumeric: 'tabular-nums' }}>
              {claim.payout_amount > 0 ? `R ${(claim.payout_amount / 100).toLocaleString()}` : 'Pending'}
            </span>
          </div>

          <div>
            <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.875rem', marginBottom: 4 }}>Description</p>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', lineHeight: 1.6 }}>{claim.description}</p>
          </div>

          {claim.parties_json.length > 0 && (
            <div>
              <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.875rem', marginBottom: 8 }}>Involved parties</p>
              {claim.parties_json.map((party, i) => (
                <div key={i} className="flex items-center gap-4 text-sm mb-2">
                  <div className="flex items-center gap-1.5"><User size={12} style={{ color: '#9CA3AF' }} /><span style={{ color: '#1A1A1A' }}>{party.name}</span></div>
                  <div className="flex items-center gap-1.5"><Phone size={12} style={{ color: '#9CA3AF' }} /><span style={{ color: '#6B7280' }}>{party.contact}</span></div>
                  <span className="px-1.5 py-0.5 rounded text-xs" style={{ background: '#F3F4F6', color: '#6B7280' }}>{party.role}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── FNOL form ────────────────────────────────────────────────────────────────

interface FNOLData {
  policy_id: string;
  loss_type: LossType;
  loss_date: string;
  loss_time: string;
  location: string;
  description: string;
  injuries: boolean;
  police_report: string;
  party_name: string;
  party_contact: string;
  party_role: string;
}

function FNOLForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [data, setData] = useState<FNOLData>({
    policy_id: MOCK_POLICIES[0]?.id ?? '',
    loss_type: 'property_damage',
    loss_date: new Date().toISOString().split('T')[0],
    loss_time: '12:00',
    location: '',
    description: '',
    injuries: false,
    police_report: '',
    party_name: '',
    party_contact: '',
    party_role: 'claimant',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ claim_number: string } | null>(null);
  const idKey = useRef(newIdempotencyKey());

  const set = (k: keyof FNOLData) => (v: string | boolean) => setData(prev => ({ ...prev, [k]: v }));
  const inputStyle = { width: '100%', border: '1px solid #D1D5DB', borderRadius: 6, padding: '8px 12px', fontSize: '0.9375rem', boxSizing: 'border-box' as const };

  async function submit() {
    if (!data.location.trim() || !data.description.trim()) {
      setError('Location and description are required.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await getInsuranceProvider().submitClaim({
        policy_id: data.policy_id,
        loss_type: data.loss_type,
        loss_datetime: `${data.loss_date}T${data.loss_time}:00Z`,
        location: data.location,
        description: data.description,
        parties: data.party_name ? [{ name: data.party_name, contact: data.party_contact, role: data.party_role }] : [],
        injuries: data.injuries,
        police_report_number: data.police_report.trim() || null,
        idempotency_key: idKey.current,
      });
      setSuccess({ claim_number: result.claim_number });
    } catch {
      setError('Submission failed. Please try again.');
    } finally { setLoading(false); }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 size={40} style={{ color: '#27AE60', margin: '0 auto 12px' }} />
        <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '1rem' }}>Claim reported</p>
        <p style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: 6 }}>Claim number: <strong style={{ fontFamily: 'monospace' }}>{success.claim_number}</strong></p>
        <p style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: 4 }}>A claims adjuster will contact you within 1 business day.</p>
        <button onClick={onSubmitted} className="mt-5 px-5 py-2 rounded-[8px] font-semibold" style={{ background: '#1A1A1A', color: '#fff' }}>
          View all claims
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-[8px]" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
          <AlertTriangle size={14} style={{ color: '#00A9AC' }} />
          <p style={{ color: '#00A9AC', fontSize: '0.875rem' }}>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: '0.875rem', marginBottom: 6 }}>Policy *</label>
          <select value={data.policy_id} onChange={e => set('policy_id')(e.target.value)} style={{ ...inputStyle, background: '#fff' }}>
            {MOCK_POLICIES.filter(p => p.status === 'active').map(p => (
              <option key={p.id} value={p.id}>{p.coverage_name} — #{p.policy_number}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: '0.875rem', marginBottom: 6 }}>Type of loss *</label>
          <select value={data.loss_type} onChange={e => set('loss_type')(e.target.value as LossType)} style={{ ...inputStyle, background: '#fff' }}>
            {(Object.entries(LOSS_TYPE_LABELS) as [LossType, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: '0.875rem', marginBottom: 6 }}>Date of loss *</label>
          <input type="date" value={data.loss_date} onChange={e => set('loss_date')(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: '0.875rem', marginBottom: 6 }}>Time of loss</label>
          <input type="time" value={data.loss_time} onChange={e => set('loss_time')(e.target.value)} style={inputStyle} />
        </div>
        <div className="sm:col-span-2">
          <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: '0.875rem', marginBottom: 6 }}>Location of loss *</label>
          <input value={data.location} onChange={e => set('location')(e.target.value)} style={inputStyle} placeholder="Full address or description" />
        </div>
        <div className="sm:col-span-2">
          <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: '0.875rem', marginBottom: 6 }}>Description *</label>
          <textarea value={data.description} onChange={e => set('description')(e.target.value)} rows={4}
            placeholder="Describe what happened..."
            style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: '0.875rem', marginBottom: 6 }}>Police report number</label>
          <input value={data.police_report} onChange={e => set('police_report')(e.target.value)} style={inputStyle} placeholder="Leave blank if none" />
        </div>
        <div className="flex items-center gap-2 self-end pb-2">
          <input type="checkbox" id="injuries" checked={data.injuries} onChange={e => set('injuries')(e.target.checked)} />
          <label htmlFor="injuries" style={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem', cursor: 'pointer' }}>Injuries involved</label>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 16 }}>
        <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.875rem', marginBottom: 12 }}>Involved party (optional)</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Name</label>
            <input value={data.party_name} onChange={e => set('party_name')(e.target.value)} style={inputStyle} placeholder="Full name" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Contact</label>
            <input value={data.party_contact} onChange={e => set('party_contact')(e.target.value)} style={inputStyle} placeholder="Phone or email" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Role</label>
            <select value={data.party_role} onChange={e => set('party_role')(e.target.value)} style={{ ...inputStyle, background: '#fff' }}>
              <option value="claimant">Claimant</option>
              <option value="witness">Witness</option>
              <option value="other_driver">Other driver</option>
              <option value="property_owner">Property owner</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-3 rounded-[8px]" style={{ background: '#FFF8E1', border: '1px solid #FDE68A' }}>
        <p style={{ color: '#92400E', fontSize: '0.8125rem', lineHeight: 1.6 }}>
          Report the claim promptly. Late reporting may affect coverage. Do not admit fault or make statements about liability. Your insurer will investigate independently.
        </p>
      </div>

      <button onClick={submit} disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] font-semibold"
        style={{ background: loading ? '#9CA3AF' : '#00A9AC', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer' }}>
        {loading ? <Loader2 size={15} className="animate-spin" /> : <AlertTriangle size={15} />}
        {loading ? 'Submitting claim…' : 'Submit claim report'}
      </button>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

interface Props {
  canFileClaim: boolean;
}

export function ClaimsPage({ canFileClaim }: Props) {
  const [tab, setTab] = useState<'history' | 'fnol'>('history');
  const [claims, setClaims] = useState<InsuranceClaim[]>(MOCK_CLAIMS);

  const tabStyle = (active: boolean) => ({
    padding: '8px 16px',
    fontWeight: 600,
    fontSize: '0.875rem',
    borderBottom: active ? '2px solid #1A1A1A' : '2px solid transparent',
    marginBottom: -2,
    color: active ? '#1A1A1A' : '#6B7280',
    background: 'transparent',
    cursor: 'pointer',
    border: 'none',
    borderBottomColor: active ? '#1A1A1A' : 'transparent',
    borderBottomStyle: 'solid' as const,
    borderBottomWidth: 2,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.25rem', fontWeight: 700, color: '#1A1A1A' }}>Claims</h2>
      </div>

      <div className="flex gap-0.5 mb-5" style={{ borderBottom: '2px solid #E5E7EB' }}>
        <button style={tabStyle(tab === 'history')} onClick={() => setTab('history')}>Claim history</button>
        {canFileClaim && <button style={tabStyle(tab === 'fnol')} onClick={() => setTab('fnol')}>Report a claim (FNOL)</button>}
      </div>

      {tab === 'history' && (
        <div>
          {canFileClaim && (
            <div className="mb-4">
              <button onClick={() => setTab('fnol')}
                className="flex items-center gap-2 px-4 py-2 rounded-[8px] text-sm font-semibold"
                style={{ background: '#00A9AC', color: '#fff' }}>
                <Plus size={14} /> Report a claim
              </button>
            </div>
          )}
          {claims.length === 0 ? (
            <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '40px 0', fontSize: '0.9375rem' }}>No claims on file.</p>
          ) : (
            <div className="space-y-3">
              {claims.map(c => <ClaimCard key={c.id} claim={c} />)}
            </div>
          )}
        </div>
      )}

      {tab === 'fnol' && canFileClaim && (
        <div className="rounded-[10px] p-6" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
          <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem', marginBottom: 4 }}>Report a claim (FNOL)</p>
          <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: 20 }}>
            First notice of loss. Complete this form to begin the claims process. Your insurer will contact you within 1 business day.
          </p>
          <FNOLForm onSubmitted={() => setTab('history')} />
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import {
  FileText, Download, ChevronRight, ChevronDown, AlertTriangle,
  CheckCircle2, Clock, XCircle, Plus, ExternalLink, Upload,
} from 'lucide-react';
import type { InsurancePolicy, PolicyDocument, InsuranceEndorsement, EndorsementType } from '../../../lib/insurance/types';
import { formatCents } from '../../../lib/insurance/types';
import { MOCK_POLICIES, MOCK_DOCUMENTS } from './mockData';
import { getInsuranceProvider } from '../../../lib/insurance/mockProvider';
import { newIdempotencyKey } from '../../../lib/insurance/types';

function StatusChip({ status }: { status: InsurancePolicy['status'] }) {
  const cfg = {
    active:    { label: 'Active',    color: '#27AE60', bg: '#F0FDF4' },
    pending:   { label: 'Pending',   color: '#F39C12', bg: '#FFF8E1' },
    lapsed:    { label: 'Lapsed',    color: '#E74C3C', bg: '#FEF2F2' },
    cancelled: { label: 'Cancelled', color: '#E74C3C', bg: '#FEF2F2' },
    expired:   { label: 'Expired',   color: '#6B7280', bg: '#F3F4F6' },
  }[status] ?? { label: status, color: '#6B7280', bg: '#F3F4F6' };
  return <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>;
}

const ENDORSEMENT_TYPES: { value: EndorsementType; label: string }[] = [
  { value: 'add_vehicle',            label: 'Add vehicle' },
  { value: 'remove_vehicle',         label: 'Remove vehicle' },
  { value: 'add_driver',             label: 'Add driver' },
  { value: 'remove_driver',          label: 'Remove driver' },
  { value: 'change_limits',          label: 'Change limits' },
  { value: 'add_additional_insured', label: 'Add additional insured' },
  { value: 'change_address',         label: 'Change address' },
];

function EndorsementModal({ policyId, onClose }: { policyId: string; onClose: () => void }) {
  const [type, setType] = useState<EndorsementType>('add_vehicle');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    setSubmitting(true);
    await getInsuranceProvider().requestEndorsement(policyId, type, { description });
    setSubmitting(false);
    setDone(true);
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div className="rounded-[12px] p-6 w-full" style={{ maxWidth: 440, background: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
        {done ? (
          <div className="text-center py-4">
            <CheckCircle2 size={40} style={{ color: '#27AE60', margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '1rem' }}>Endorsement requested</p>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: 6 }}>The carrier will review and confirm within 1–3 business days.</p>
            <button onClick={onClose} className="mt-5 px-5 py-2 rounded-[8px] font-semibold" style={{ background: '#1A1A1A', color: '#fff' }}>Done</button>
          </div>
        ) : (
          <>
            <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '1rem', marginBottom: 16 }}>Request endorsement</p>
            <div className="space-y-4">
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Endorsement type</label>
                <select value={type} onChange={e => setType(e.target.value as EndorsementType)}
                  style={{ width: '100%', border: '1px solid #D1D5DB', borderRadius: 6, padding: '8px 12px', fontSize: '0.9375rem', background: '#fff' }}>
                  {ENDORSEMENT_TYPES.map(et => <option key={et.value} value={et.value}>{et.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Details</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Describe the change you need..."
                  rows={3}
                  style={{ width: '100%', border: '1px solid #D1D5DB', borderRadius: 6, padding: '8px 12px', fontSize: '0.9375rem', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={onClose} className="flex-1 py-2 rounded-[8px] font-semibold text-sm" style={{ border: '1px solid #E5E7EB', color: '#6B7280' }}>Cancel</button>
              <button onClick={submit} disabled={submitting || !description.trim()}
                className="flex-1 py-2 rounded-[8px] font-semibold text-sm"
                style={{ background: submitting || !description.trim() ? '#9CA3AF' : '#1A1A1A', color: '#fff', cursor: submitting || !description.trim() ? 'not-allowed' : 'pointer' }}>
                {submitting ? 'Submitting…' : 'Submit request'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PolicyDetail({ policy, docs }: { policy: InsurancePolicy; docs: PolicyDocument[] }) {
  const [endorsementOpen, setEndorsementOpen] = useState(false);
  const daysToExpiry = Math.ceil((new Date(policy.expiry_date).getTime() - Date.now()) / 86400000);
  const expiringSoon = daysToExpiry <= 30 && daysToExpiry > 0;

  const docTypes: Record<string, string> = { declarations: 'Declarations', full_policy: 'Full policy', endorsement: 'Endorsement', invoice: 'Invoice', receipt: 'Receipt', coi: 'Certificate' };

  return (
    <div className="space-y-5">
      {expiringSoon && (
        <div className="flex items-center gap-2 p-3 rounded-[8px]" style={{ background: '#FFF8E1', border: '1px solid #FDE68A' }}>
          <AlertTriangle size={15} style={{ color: '#F39C12' }} />
          <p style={{ color: '#92400E', fontSize: '0.875rem' }}>
            This policy expires in <strong>{daysToExpiry} days</strong> ({policy.expiry_date}). Renew to avoid a coverage gap.
          </p>
        </div>
      )}

      <div className="rounded-[10px] p-5" style={{ border: '1px solid #E5E7EB', background: '#fff' }}>
        <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem', marginBottom: 12 }}>Policy details</p>
        <div className="grid grid-cols-2 gap-y-3 text-sm">
          {[
            ['Policy number', policy.policy_number],
            ['Carrier', policy.carrier_name],
            ['Carrier contact', policy.carrier_contact],
            ['Status', null],
            ['Effective date', policy.effective_date],
            ['Expiry date', policy.expiry_date],
            ['Premium', `${formatCents(policy.premium)}/yr`],
            ['Payment', policy.payment_frequency],
            ['Deductible', formatCents(policy.deductible)],
            ['Per occurrence', formatCents(policy.limits_json.per_occurrence)],
            ['Aggregate', formatCents(policy.limits_json.aggregate)],
          ].map(([k, v]) => (
            <div key={String(k)} className="contents">
              <span style={{ color: '#6B7280' }}>{k}</span>
              {k === 'Status' ? <StatusChip status={policy.status} /> : <span style={{ fontWeight: 600, color: '#1A1A1A', fontVariantNumeric: 'tabular-nums' }}>{v}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Documents */}
      <div className="rounded-[10px] overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
        <div className="px-5 py-3 border-b" style={{ background: '#F9FAFB', borderColor: '#E5E7EB' }}>
          <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>Document vault</p>
        </div>
        <div className="divide-y" style={{ borderColor: '#F3F4F6' }}>
          {docs.length === 0 && <p className="px-5 py-4 text-sm" style={{ color: '#9CA3AF' }}>No documents yet.</p>}
          {docs.map(d => (
            <div key={d.id} className="flex items-center justify-between px-5 py-3" style={{ background: '#fff' }}>
              <div className="flex items-center gap-3">
                <FileText size={16} style={{ color: '#6B7280' }} />
                <div>
                  <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.875rem' }}>{docTypes[d.doc_type] ?? d.doc_type}</p>
                  <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>v{d.version} · {new Date(d.uploaded_at).toLocaleDateString()}</p>
                </div>
              </div>
              <a href={d.file_url} target="_blank" rel="noreferrer"
                className="flex items-center gap-1 px-3 py-1 rounded-[6px] text-xs font-semibold"
                style={{ background: '#F3F4F6', color: '#1A1A1A' }}>
                <Download size={12} /> Download
              </a>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t" style={{ borderColor: '#E5E7EB', background: '#F9FAFB' }}>
          <button className="flex items-center gap-2 text-sm" style={{ color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer' }}>
            <Upload size={14} /> Upload document
          </button>
        </div>
      </div>

      {/* Actions */}
      {policy.status === 'active' && (
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setEndorsementOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-[8px] text-sm font-semibold"
            style={{ background: '#1A1A1A', color: '#fff' }}>
            <Plus size={14} /> Request endorsement
          </button>
          <a href={`tel:${policy.carrier_contact}`}
            className="flex items-center gap-2 px-4 py-2 rounded-[8px] text-sm font-semibold"
            style={{ border: '1px solid #E5E7EB', color: '#6B7280', textDecoration: 'none' }}>
            <ExternalLink size={14} /> Contact carrier
          </a>
        </div>
      )}

      {endorsementOpen && <EndorsementModal policyId={policy.id} onClose={() => setEndorsementOpen(false)} />}
    </div>
  );
}

interface Props {
  canViewPolicies: boolean;
  initialPolicyId?: string | null;
}

export function PolicyManagement({ canViewPolicies, initialPolicyId }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(initialPolicyId ?? null);

  if (!canViewPolicies) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <XCircle size={32} style={{ color: '#9CA3AF', marginBottom: 12 }} />
        <p style={{ fontWeight: 700, color: '#1A1A1A' }}>Access restricted</p>
        <p style={{ color: '#9CA3AF', fontSize: '0.9375rem', marginTop: 4 }}>Your role does not have permission to view policies.</p>
      </div>
    );
  }

  const selected = MOCK_POLICIES.find(p => p.id === selectedId);
  const policyDocs = MOCK_DOCUMENTS.filter(d => d.policy_id === selectedId);

  return (
    <div>
      <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.25rem', fontWeight: 700, color: '#1A1A1A', marginBottom: 16 }}>Policies</h2>

      {/* Policy list */}
      <div className="rounded-[10px] overflow-hidden mb-5" style={{ border: '1px solid #E5E7EB' }}>
        {MOCK_POLICIES.map((p, i) => {
          const isSelected = p.id === selectedId;
          const daysToExpiry = Math.ceil((new Date(p.expiry_date).getTime() - Date.now()) / 86400000);
          return (
            <div key={p.id} style={{ borderTop: i > 0 ? '1px solid #F3F4F6' : undefined }}>
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer"
                style={{ background: isSelected ? '#F9FAFB' : '#fff' }}
                onClick={() => setSelectedId(isSelected ? null : p.id)}
              >
                <div className="flex items-center gap-3">
                  <FileText size={18} style={{ color: '#6B7280' }} />
                  <div>
                    <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>{p.coverage_name}</p>
                    <p style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>{p.carrier_name} · #{p.policy_number}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusChip status={p.status} />
                  <span style={{ color: '#9CA3AF', fontSize: '0.8125rem', fontVariantNumeric: 'tabular-nums' }}>
                    {daysToExpiry > 0 ? `${daysToExpiry}d left` : 'Expired'}
                  </span>
                  <span style={{ fontWeight: 600, color: '#1A1A1A', fontVariantNumeric: 'tabular-nums', fontSize: '0.9375rem' }}>
                    {formatCents(p.premium)}/yr
                  </span>
                  {isSelected ? <ChevronDown size={16} style={{ color: '#6B7280' }} /> : <ChevronRight size={16} style={{ color: '#6B7280' }} />}
                </div>
              </div>
              {isSelected && (
                <div className="px-5 pb-5 pt-2" style={{ borderTop: '1px solid #F3F4F6' }}>
                  <PolicyDetail policy={p} docs={policyDocs} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {MOCK_POLICIES.length === 0 && (
        <p style={{ color: '#9CA3AF', fontSize: '0.9375rem', textAlign: 'center', padding: '40px 0' }}>No policies yet. Start by getting a quote from the coverage catalog.</p>
      )}
    </div>
  );
}

import { useState } from 'react';
import { FileText, Copy, CheckCircle2, Loader2, AlertTriangle, ExternalLink, Plus } from 'lucide-react';
import type { InsuranceCertificate } from '../../../lib/insurance/types';
import { getInsuranceProvider } from '../../../lib/insurance/mockProvider';
import { newIdempotencyKey } from '../../../lib/insurance/types';
import { MOCK_CERTIFICATES, MOCK_POLICIES } from './mockData';

function COICard({ cert }: { cert: InsuranceCertificate }) {
  const [copied, setCopied] = useState(false);
  const isExpired = new Date(cert.expires_at) < new Date();

  function copyLink() {
    const url = `https://verify.fb-business-connect.app/coi/${cert.verify_token}`;
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  return (
    <div className="rounded-[10px] p-5" style={{ border: `1.5px solid ${cert.reissue_required ? '#FECACA' : isExpired ? '#E5E7EB' : '#BBF7D0'}`, background: '#fff' }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem', marginBottom: 2 }}>{cert.holder_name}</p>
          <p style={{ color: '#6B7280', fontSize: '0.8125rem' }}>{cert.holder_email}</p>
        </div>
        {cert.reissue_required && (
          <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: '#FEF2F2', color: '#DC2626' }}>Reissue required</span>
        )}
        {!cert.reissue_required && !isExpired && (
          <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: '#F0FDF4', color: '#27AE60' }}>Active</span>
        )}
        {isExpired && (
          <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: '#F3F4F6', color: '#6B7280' }}>Expired</span>
        )}
      </div>

      {cert.description_of_operations && (
        <p style={{ color: '#6B7280', fontSize: '0.8125rem', marginBottom: 10, fontStyle: 'italic' }}>"{cert.description_of_operations}"</p>
      )}
      {cert.additional_insured && (
        <p style={{ color: '#374151', fontSize: '0.8125rem', marginBottom: 10 }}>
          Additional insured: <strong>{cert.additional_insured}</strong>
        </p>
      )}

      <div className="flex flex-wrap gap-1 mb-3">
        {cert.policy_ids_json.map(pid => {
          const pol = MOCK_POLICIES.find(p => p.id === pid);
          return pol ? (
            <span key={pid} className="px-1.5 py-0.5 rounded text-xs" style={{ background: '#EBF5FB', color: '#2980B9' }}>{pol.coverage_name}</span>
          ) : null;
        })}
      </div>

      <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginBottom: 12 }}>
        Issued {new Date(cert.issued_at).toLocaleDateString()} · Expires {new Date(cert.expires_at).toLocaleDateString()}
      </p>

      <div className="flex gap-2">
        <a href={cert.pdf_url} target="_blank" rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-sm font-semibold"
          style={{ background: '#F3F4F6', color: '#1A1A1A', textDecoration: 'none' }}>
          <ExternalLink size={13} /> View PDF
        </a>
        <button onClick={copyLink}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-sm font-semibold"
          style={{ background: '#F3F4F6', color: '#1A1A1A' }}>
          {copied ? <CheckCircle2 size={13} style={{ color: '#27AE60' }} /> : <Copy size={13} />}
          {copied ? 'Copied!' : 'Copy verify link'}
        </button>
      </div>
    </div>
  );
}

function NewCOIForm({ onCreated }: { onCreated: (cert: InsuranceCertificate) => void }) {
  const [holderName, setHolderName] = useState('');
  const [holderAddress, setHolderAddress] = useState('');
  const [holderEmail, setHolderEmail] = useState('');
  const [additionalInsured, setAdditionalInsured] = useState('');
  const [operations, setOperations] = useState('');
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>(MOCK_POLICIES.filter(p => p.status === 'active').map(p => p.id));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activePolicies = MOCK_POLICIES.filter(p => p.status === 'active');

  function togglePolicy(id: string) {
    setSelectedPolicies(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  }

  async function submit() {
    if (!holderName.trim() || !holderEmail.trim() || selectedPolicies.length === 0) {
      setError('Please fill in holder name, email, and select at least one policy.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await getInsuranceProvider().generateCOI({
        policy_ids: selectedPolicies,
        holder_name: holderName.trim(),
        holder_address: holderAddress.trim(),
        holder_email: holderEmail.trim(),
        additional_insured: additionalInsured.trim() || null,
        description_of_operations: operations.trim(),
      });
      const expiryPol = MOCK_POLICIES.filter(p => selectedPolicies.includes(p.id)).sort((a, b) => a.expiry_date.localeCompare(b.expiry_date));
      const newCert: InsuranceCertificate = {
        id: crypto.randomUUID(),
        shop_id: 'shop-demo',
        holder_name: holderName,
        holder_address: holderAddress,
        holder_email: holderEmail,
        policy_ids_json: selectedPolicies,
        additional_insured: additionalInsured.trim() || null,
        description_of_operations: operations.trim(),
        pdf_url: result.pdf_url,
        verify_token: result.verify_token,
        fleet_account_id: null,
        issued_by: 'user-demo',
        issued_at: new Date().toISOString(),
        expires_at: expiryPol[0]?.expiry_date ?? new Date().toISOString().split('T')[0],
        reissue_required: false,
      };
      onCreated(newCert);
    } catch {
      setError('Failed to generate certificate. Please try again.');
    } finally { setLoading(false); }
  }

  const inputStyle = { width: '100%', border: '1px solid #D1D5DB', borderRadius: 6, padding: '8px 12px', fontSize: '0.9375rem', boxSizing: 'border-box' as const };

  return (
    <div className="rounded-[10px] p-5" style={{ border: '1px solid #E5E7EB', background: '#fff' }}>
      <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem', marginBottom: 16 }}>Issue new certificate</p>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-[8px] mb-4" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
          <AlertTriangle size={14} style={{ color: '#DC2626' }} />
          <p style={{ color: '#DC2626', fontSize: '0.875rem' }}>{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: '0.875rem', marginBottom: 6 }}>Certificate holder name *</label>
            <input value={holderName} onChange={e => setHolderName(e.target.value)} style={inputStyle} placeholder="e.g. Westfield Mall Management LLC" />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: '0.875rem', marginBottom: 6 }}>Holder email *</label>
            <input type="email" value={holderEmail} onChange={e => setHolderEmail(e.target.value)} style={inputStyle} placeholder="risk@example.com" />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: '0.875rem', marginBottom: 6 }}>Holder address</label>
            <input value={holderAddress} onChange={e => setHolderAddress(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: '0.875rem', marginBottom: 6 }}>Additional insured (if any)</label>
            <input value={additionalInsured} onChange={e => setAdditionalInsured(e.target.value)} style={inputStyle} placeholder="Leave blank if none" />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: '0.875rem', marginBottom: 6 }}>Description of operations</label>
          <textarea value={operations} onChange={e => setOperations(e.target.value)} rows={2}
            placeholder="e.g. Tire installation and service at leased commercial premises."
            style={{ ...inputStyle, resize: 'vertical' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: '0.875rem', marginBottom: 8 }}>Include policies *</label>
          <div className="space-y-2">
            {activePolicies.map(p => (
              <label key={p.id} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={selectedPolicies.includes(p.id)} onChange={() => togglePolicy(p.id)} />
                <span style={{ fontSize: '0.875rem', color: '#374151' }}>
                  {p.coverage_name} — {p.carrier_name} · #{p.policy_number}
                </span>
              </label>
            ))}
            {activePolicies.length === 0 && <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>No active policies to include.</p>}
          </div>
        </div>

        <button onClick={submit} disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] font-semibold"
          style={{ background: loading ? '#9CA3AF' : '#1A1A1A', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} />}
          {loading ? 'Generating…' : 'Generate certificate'}
        </button>
      </div>
    </div>
  );
}

interface Props {
  canIssueCOI: boolean;
}

export function COIBuilder({ canIssueCOI }: Props) {
  const [certs, setCerts] = useState<InsuranceCertificate[]>(MOCK_CERTIFICATES);
  const [showForm, setShowForm] = useState(false);

  function handleCreated(cert: InsuranceCertificate) {
    setCerts(prev => [cert, ...prev]);
    setShowForm(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.25rem', fontWeight: 700, color: '#1A1A1A' }}>Certificates of Insurance</h2>
        {canIssueCOI && (
          <button onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-[8px] text-sm font-semibold"
            style={{ background: '#1A1A1A', color: '#fff' }}>
            <Plus size={14} /> Issue certificate
          </button>
        )}
      </div>

      {!canIssueCOI && (
        <div className="p-3 rounded-[8px] mb-4 flex items-center gap-2" style={{ background: '#FFF8E1', border: '1px solid #FDE68A' }}>
          <AlertTriangle size={14} style={{ color: '#F39C12' }} />
          <p style={{ color: '#92400E', fontSize: '0.875rem' }}>Your role does not have permission to issue certificates. Contact an Owner or Admin.</p>
        </div>
      )}

      {showForm && canIssueCOI && (
        <div className="mb-5">
          <NewCOIForm onCreated={handleCreated} />
        </div>
      )}

      <div className="space-y-4">
        {certs.length === 0 && <p style={{ color: '#9CA3AF', fontSize: '0.9375rem', textAlign: 'center', padding: '32px 0' }}>No certificates issued yet.</p>}
        {certs.map(cert => <COICard key={cert.id} cert={cert} />)}
      </div>
    </div>
  );
}

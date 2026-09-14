import { useState } from 'react';
import {
  CheckCircle2, Circle, ChevronRight, ChevronLeft, Plus, X, Upload,
  AlertCircle, Info, Building2, Users, UserCheck, FileText, Clock,
  CheckCircle, XCircle, AlertTriangle, Loader2,
} from 'lucide-react';
import { PartnerBankDisclosure } from './PartnerBankDisclosure';
import { getBankingProvider } from '../../../lib/banking/mockProvider';
import { newIdempotencyKey, NAICS_BY_INDUSTRY } from '../../../lib/banking/types';
import type { EntityType, Address, ApplicationStatus, RequiredDocument } from '../../../lib/banking/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BusinessInfo {
  legal_name: string;
  dba: string;
  entity_type: EntityType | '';
  ein: string;
  formation_state: string;
  formation_date: string;
  address: Address;
  phone: string;
  website: string;
  estimated_monthly_revenue: string; // dollars string, converted to cents on submit
  naics_code: string;
}

interface OwnerInfo {
  id: string;
  full_name: string;
  dob: string;
  ssn_token: string; // only the token is ever stored
  address: Address;
  ownership_pct: string;
  is_control_person: boolean;
  email: string;
  phone: string;
}

interface ControlPerson {
  full_name: string;
  title: string;
  is_same_as_owner: boolean;
  owner_id: string | null;
}

interface Disclosures {
  deposit_agreement: boolean;
  esign_consent: boolean;
  patriot_act: boolean;
}

interface WizardState {
  business: BusinessInfo;
  owners: OwnerInfo[];
  controlPerson: ControlPerson;
  disclosures: Disclosures;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const US_STATES = ['GP','WC','KZN','EC','FS','LP','MP','NC','NW'];

const ENTITY_TYPES: { value: EntityType; label: string }[] = [
  { value: 'sole_proprietor', label: 'Sole Proprietor' },
  { value: 'llc',             label: 'LLC' },
  { value: 's_corp',          label: 'S-Corporation' },
  { value: 'c_corp',          label: 'C-Corporation' },
  { value: 'partnership',     label: 'Partnership' },
];

const STEPS = [
  { id: 1, label: 'Business',         icon: Building2,   helper: 'We collect this to verify your business with our banking partner.' },
  { id: 2, label: 'Beneficial owners',icon: Users,       helper: 'Federal law requires identifying all individuals owning 25% or more.' },
  { id: 3, label: 'Control person',   icon: UserCheck,   helper: 'One officer or manager with significant control over the business.' },
  { id: 4, label: 'Review & sign',    icon: FileText,    helper: 'Read and accept the required disclosures to submit your application.' },
];

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  not_started:        { label: 'Not started',      color: '#6B7280', bg: '#F3F4F6', icon: Circle },
  in_progress:        { label: 'In progress',      color: '#F39C12', bg: '#FFF8E1', icon: Clock },
  submitted:          { label: 'Submitted',         color: '#2980B9', bg: '#EBF5FB', icon: Clock },
  pending_review:     { label: 'Under review',      color: '#F39C12', bg: '#FFF8E1', icon: Clock },
  approved:           { label: 'Approved',          color: '#27AE60', bg: '#F0FDF4', icon: CheckCircle },
  requires_documents: { label: 'Documents needed',  color: '#F39C12', bg: '#FFF8E1', icon: AlertTriangle },
  denied:             { label: 'Not approved',      color: '#E74C3C', bg: '#FEF2F2', icon: XCircle },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function blankOwner(): OwnerInfo {
  return {
    id: Math.random().toString(36).slice(2),
    full_name: '', dob: '', ssn_token: '',
    address: { line1: '', city: '', state: '', zip: '', country: 'ZA' },
    ownership_pct: '', is_control_person: false,
    email: '', phone: '',
  };
}

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <label className="block" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>
      {children}
      {hint && <span style={{ fontWeight: 400, color: '#9CA3AF', marginLeft: 6 }}>{hint}</span>}
    </label>
  );
}

function Input({ value, onChange, placeholder, type = 'text', disabled }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-3 py-2 rounded-[6px]"
      style={{ border: '1px solid #E5E7EB', fontSize: '0.9375rem', outline: 'none', background: disabled ? '#F9FAFB' : '#fff', color: '#1A1A1A' }}
    />
  );
}

function Select({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-[6px]"
      style={{ border: '1px solid #E5E7EB', fontSize: '0.9375rem', outline: 'none', background: '#fff', color: value ? '#1A1A1A' : '#9CA3AF' }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// Simulates a partner-hosted SSN field — only the token is ever stored
function HostedSSNField({ onToken }: { onToken: (token: string) => void }) {
  const [raw, setRaw] = useState('');
  const [tokenized, setTokenized] = useState(false);

  function handleBlur() {
    if (raw.replace(/\D/g, '').length === 13) {
      const fakeToken = `said_tok_${Math.random().toString(36).slice(2)}`;
      onToken(fakeToken);
      setTokenized(true);
      setRaw(''); // clear raw value immediately
    }
  }

  if (tokenized) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-[6px]" style={{ border: '1px solid #27AE60', background: '#F0FDF4' }}>
        <CheckCircle2 size={16} style={{ color: '#27AE60' }} />
        <span style={{ color: '#15803D', fontSize: '0.9375rem' }}>SA ID Number captured (encrypted)</span>
      </div>
    );
  }

  return (
    <div>
      <div className="relative">
        <input
          type="password"
          value={raw}
          onChange={e => setRaw(e.target.value)}
          onBlur={handleBlur}
          placeholder="XXXXXXXXXXXXX"
          maxLength={13}
          className="w-full px-3 py-2 rounded-[6px]"
          style={{ border: '1.5px solid #F39C12', fontSize: '0.9375rem', outline: 'none', background: '#FFFEF0' }}
          autoComplete="off"
        />
      </div>
      <p className="mt-1" style={{ fontSize: '0.75rem', color: '#6B7280' }}>
        <Info size={11} style={{ display: 'inline', marginRight: 4 }} />
        Encrypted in the partner's iframe — never sent to FB Business Connect servers.
      </p>
    </div>
  );
}

// ─── Step 1: Business ─────────────────────────────────────────────────────────

function Step1({ data, onChange }: { data: BusinessInfo; onChange: (d: Partial<BusinessInfo>) => void }) {
  function addr(k: keyof Address, v: string) {
    onChange({ address: { ...data.address, [k]: v } });
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel>Legal business name</FieldLabel>
          <Input value={data.legal_name} onChange={v => onChange({ legal_name: v })} placeholder="Acme Tire Shop LLC" />
        </div>
        <div>
          <FieldLabel hint="optional">DBA (doing business as)</FieldLabel>
          <Input value={data.dba} onChange={v => onChange({ dba: v })} placeholder="Acme Tires" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel>Entity type</FieldLabel>
          <Select
            value={data.entity_type}
            onChange={v => onChange({ entity_type: v as EntityType })}
            options={ENTITY_TYPES}
            placeholder="Select entity type"
          />
        </div>
        <div>
          <FieldLabel>CIPC Registration Number</FieldLabel>
          <Input value={data.ein} onChange={v => onChange({ ein: v })} placeholder="2023/123456/07" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel>Formation state</FieldLabel>
          <Select value={data.formation_state} onChange={v => onChange({ formation_state: v })} options={US_STATES.map(s => ({ value: s, label: s }))} placeholder="Province" />
        </div>
        <div>
          <FieldLabel>Formation date</FieldLabel>
          <Input type="date" value={data.formation_date} onChange={v => onChange({ formation_date: v })} />
        </div>
      </div>
      <div>
        <FieldLabel>Physical address</FieldLabel>
        <div className="p-4 rounded-[8px] space-y-3" style={{ border: '1px solid #E5E7EB', background: '#F9FAFB' }}>
          <Input value={data.address.line1} onChange={v => addr('line1', v)} placeholder="123 Main St (no PO Boxes)" />
          <Input value={data.address.line2 ?? ''} onChange={v => addr('line2', v)} placeholder="Suite / Unit (optional)" />
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1">
              <Input value={data.address.city} onChange={v => addr('city', v)} placeholder="City" />
            </div>
            <div>
              <Select value={data.address.state} onChange={v => addr('state', v)} options={US_STATES.map(s => ({ value: s, label: s }))} placeholder="Province" />
            </div>
            <div>
              <Input value={data.address.zip} onChange={v => addr('zip', v)} placeholder="Postal Code" />
            </div>
          </div>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: 4 }}>PO boxes are not accepted for business accounts.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel>Business phone</FieldLabel>
          <Input value={data.phone} onChange={v => onChange({ phone: v })} placeholder="+27 XX XXX XXXX" />
        </div>
        <div>
          <FieldLabel hint="optional">Website</FieldLabel>
          <Input value={data.website} onChange={v => onChange({ website: v })} placeholder="https://yourshop.com" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel>Estimated monthly revenue</FieldLabel>
          <div className="relative">
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>$</span>
            <input
              type="number"
              value={data.estimated_monthly_revenue}
              onChange={e => onChange({ estimated_monthly_revenue: e.target.value })}
              placeholder="0"
              className="w-full px-3 py-2 rounded-[6px]"
              style={{ paddingLeft: 24, border: '1px solid #E5E7EB', fontSize: '0.9375rem', outline: 'none' }}
            />
          </div>
        </div>
        <div>
          <FieldLabel>NAICS code</FieldLabel>
          <Input value={data.naics_code} onChange={v => onChange({ naics_code: v })} placeholder="e.g. 441320" />
          <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: 4 }}>Auto-mapped from your industry pack — editable.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Beneficial owners ────────────────────────────────────────────────

function Step2({ owners, onChange }: { owners: OwnerInfo[]; onChange: (owners: OwnerInfo[]) => void }) {
  const totalPct = owners.reduce((s, o) => s + (parseFloat(o.ownership_pct) || 0), 0);
  const overLimit = totalPct > 100;

  function update(id: string, patch: Partial<OwnerInfo>) {
    onChange(owners.map(o => o.id === id ? { ...o, ...patch } : o));
  }
  function updateAddr(id: string, k: keyof Address, v: string) {
    update(id, { address: { ...owners.find(o => o.id === id)!.address, [k]: v } });
  }

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-[8px] flex items-start gap-3" style={{ background: '#EBF5FB', border: '1px solid #AED6F1' }}>
        <Info size={16} style={{ color: '#2980B9', marginTop: 2, flexShrink: 0 }} />
        <p style={{ color: '#1A5276', fontSize: '0.875rem', lineHeight: 1.55 }}>
          Federal law requires collecting information about individuals who own 25% or more of the business. Add a block for each qualifying owner. Total ownership may not exceed 100%.
        </p>
      </div>

      {overLimit && (
        <div className="p-3 rounded-[8px] flex items-center gap-2" style={{ background: '#FEF2F2', border: '1px solid #FCA5A5' }}>
          <AlertCircle size={16} style={{ color: '#E74C3C' }} />
          <span style={{ color: '#991B1B', fontSize: '0.875rem', fontWeight: 600 }}>Total ownership ({totalPct}%) exceeds 100%.</span>
        </div>
      )}

      {owners.map((owner, idx) => (
        <div key={owner.id} className="rounded-[10px] p-5 space-y-4" style={{ border: '1.5px solid #E5E7EB', background: '#fff' }}>
          <div className="flex items-center justify-between mb-1">
            <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>Owner {idx + 1}</p>
            {owners.length > 1 && (
              <button onClick={() => onChange(owners.filter(o => o.id !== owner.id))} style={{ color: '#9CA3AF' }}>
                <X size={16} />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel>Full legal name</FieldLabel>
              <Input value={owner.full_name} onChange={v => update(owner.id, { full_name: v })} />
            </div>
            <div>
              <FieldLabel>Date of birth</FieldLabel>
              <Input type="date" value={owner.dob} onChange={v => update(owner.id, { dob: v })} />
            </div>
          </div>
          <div>
            <FieldLabel>South African ID Number</FieldLabel>
            <HostedSSNField onToken={token => update(owner.id, { ssn_token: token })} />
          </div>
          <div>
            <FieldLabel>Home address</FieldLabel>
            <div className="p-4 rounded-[8px] space-y-3" style={{ border: '1px solid #E5E7EB', background: '#F9FAFB' }}>
              <Input value={owner.address.line1} onChange={v => updateAddr(owner.id, 'line1', v)} placeholder="Street address" />
              <div className="grid grid-cols-3 gap-2">
                <Input value={owner.address.city} onChange={v => updateAddr(owner.id, 'city', v)} placeholder="City" />
                <Select value={owner.address.state} onChange={v => updateAddr(owner.id, 'state', v)} options={US_STATES.map(s => ({ value: s, label: s }))} placeholder="Province" />
                <Input value={owner.address.zip} onChange={v => updateAddr(owner.id, 'zip', v)} placeholder="Postal Code" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <FieldLabel>Ownership %</FieldLabel>
              <Input type="number" value={owner.ownership_pct} onChange={v => update(owner.id, { ownership_pct: v })} placeholder="0" />
            </div>
            <div>
              <FieldLabel>Email</FieldLabel>
              <Input type="email" value={owner.email} onChange={v => update(owner.id, { email: v })} />
            </div>
            <div>
              <FieldLabel>Phone</FieldLabel>
              <Input value={owner.phone} onChange={v => update(owner.id, { phone: v })} placeholder="+27 XX XXX XXXX" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={owner.is_control_person}
              onChange={e => update(owner.id, { is_control_person: e.target.checked })}
              style={{ accentColor: '#C0392B' }}
            />
            <span style={{ fontSize: '0.875rem', color: '#374151' }}>This person is also the control person (primary officer)</span>
          </label>
        </div>
      ))}

      {owners.length < 4 && (
        <button
          onClick={() => onChange([...owners, blankOwner()])}
          className="flex items-center gap-2 px-4 py-2.5 rounded-[8px] font-semibold"
          style={{ border: '1.5px dashed #D1D5DB', color: '#374151', background: '#F9FAFB', fontSize: '0.9375rem' }}
        >
          <Plus size={16} /> Add another owner
        </button>
      )}
    </div>
  );
}

// ─── Step 3: Control person ───────────────────────────────────────────────────

function Step3({ data, owners, onChange }: { data: ControlPerson; owners: OwnerInfo[]; onChange: (d: ControlPerson) => void }) {
  const ownerControlPersons = owners.filter(o => o.is_control_person);

  if (ownerControlPersons.length > 0) {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-[8px] flex items-start gap-3" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <CheckCircle2 size={16} style={{ color: '#27AE60', marginTop: 2, flexShrink: 0 }} />
          <div>
            <p style={{ fontWeight: 600, color: '#15803D', fontSize: '0.9375rem' }}>Control person already identified</p>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: 2 }}>
              The following owner(s) were marked as control persons in the previous step:
            </p>
            <ul className="mt-2 space-y-1">
              {ownerControlPersons.map(o => (
                <li key={o.id} style={{ color: '#1A1A1A', fontSize: '0.9375rem' }}>• {o.full_name} ({o.ownership_pct}%)</li>
              ))}
            </ul>
          </div>
        </div>
        <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
          You can proceed to the next step. If you need a different control person, go back and uncheck the box on the owner block, then enter the person's details below.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="p-4 rounded-[8px] flex items-start gap-3" style={{ background: '#EBF5FB', border: '1px solid #AED6F1' }}>
        <Info size={16} style={{ color: '#2980B9', marginTop: 2, flexShrink: 0 }} />
        <p style={{ color: '#1A5276', fontSize: '0.875rem', lineHeight: 1.55 }}>
          A control person is an individual with significant responsibility for managing or directing the business (e.g., CEO, President, CFO).
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel>Full name</FieldLabel>
          <Input value={data.full_name} onChange={v => onChange({ ...data, full_name: v })} />
        </div>
        <div>
          <FieldLabel>Title</FieldLabel>
          <Input value={data.title} onChange={v => onChange({ ...data, title: v })} placeholder="CEO, President, CFO, Manager…" />
        </div>
      </div>
      {owners.length > 0 && (
        <div>
          <FieldLabel hint="optional">Same as a beneficial owner listed above?</FieldLabel>
          <Select
            value={data.owner_id ?? ''}
            onChange={v => onChange({ ...data, owner_id: v || null, is_same_as_owner: !!v })}
            options={owners.map(o => ({ value: o.id, label: `${o.full_name} (${o.ownership_pct}%)` }))}
            placeholder="Select an owner, or leave blank"
          />
        </div>
      )}
    </div>
  );
}

// ─── Step 4: Review + disclosures ─────────────────────────────────────────────

function Step4({ business, owners, disclosures, onChange }: {
  business: BusinessInfo; owners: OwnerInfo[];
  disclosures: Disclosures; onChange: (d: Disclosures) => void;
}) {
  const allChecked = disclosures.deposit_agreement && disclosures.esign_consent && disclosures.patriot_act;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="rounded-[10px] overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: '#E5E7EB', background: '#F9FAFB' }}>
          <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>Application summary</p>
        </div>
        <div className="p-5 space-y-2">
          <div className="flex justify-between"><span style={{ color: '#6B7280' }}>Legal name</span><span style={{ color: '#1A1A1A', fontWeight: 600 }}>{business.legal_name || '—'}</span></div>
          <div className="flex justify-between"><span style={{ color: '#6B7280' }}>Entity type</span><span style={{ color: '#1A1A1A', fontWeight: 600 }}>{business.entity_type || '—'}</span></div>
          <div className="flex justify-between"><span style={{ color: '#6B7280' }}>CIPC Reg. No.</span><span style={{ color: '#1A1A1A', fontWeight: 600 }}>{business.ein ? `***${business.ein.slice(-4)}` : '—'}</span></div>
          <div className="flex justify-between"><span style={{ color: '#6B7280' }}>Registration province</span><span style={{ color: '#1A1A1A', fontWeight: 600 }}>{business.formation_state || '—'}</span></div>
          <div className="flex justify-between"><span style={{ color: '#6B7280' }}>Beneficial owners</span><span style={{ color: '#1A1A1A', fontWeight: 600 }}>{owners.length} person{owners.length !== 1 ? 's' : ''}</span></div>
        </div>
      </div>

      {/* Disclosures */}
      <div className="space-y-3">
        <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>Required disclosures</p>
        {[
          { key: 'deposit_agreement' as const, label: 'Deposit Account Agreement', detail: 'I have read and agree to the terms of the Deposit Account Agreement, including account fees, transaction limits, and Deposit Insurance Scheme (DIS) coverage details.' },
          { key: 'esign_consent' as const, label: 'E-Sign Consent', detail: 'I consent to receive disclosures, notices, and account documents electronically.' },
          { key: 'patriot_act' as const, label: 'FICA Notice (Financial Intelligence Centre Act)', detail: 'To help combat financial crime and money laundering, all financial institutions in South Africa are required by FICA to obtain, verify, and record information that identifies each person who opens an account.' },
        ].map(d => (
          <label key={d.key} className="flex items-start gap-3 cursor-pointer p-4 rounded-[8px]" style={{ border: `1.5px solid ${disclosures[d.key] ? '#27AE60' : '#E5E7EB'}`, background: disclosures[d.key] ? '#F0FDF4' : '#fff' }}>
            <input
              type="checkbox"
              checked={disclosures[d.key]}
              onChange={e => onChange({ ...disclosures, [d.key]: e.target.checked })}
              style={{ marginTop: 3, accentColor: '#27AE60' }}
            />
            <div>
              <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.9375rem' }}>{d.label}</p>
              <p style={{ color: '#6B7280', fontSize: '0.8125rem', lineHeight: 1.5, marginTop: 2 }}>{d.detail}</p>
            </div>
          </label>
        ))}
      </div>

      {allChecked && (
        <div className="flex items-center gap-2 p-3 rounded-[8px]" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <CheckCircle2 size={16} style={{ color: '#27AE60' }} />
          <span style={{ color: '#15803D', fontSize: '0.875rem', fontWeight: 600 }}>All disclosures accepted. Ready to submit.</span>
        </div>
      )}
    </div>
  );
}

// ─── Application status page ──────────────────────────────────────────────────

function ApplicationStatusPage({
  status, denialReason, docsRequired, onUploadDoc, onExternalAccount, onRetry,
}: {
  status: ApplicationStatus;
  denialReason: string | null;
  docsRequired: RequiredDocument[] | null;
  onUploadDoc: (docId: string, file: File) => void;
  onExternalAccount: () => void;
  onRetry: () => void;
}) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;

  const timeline: { label: string; done: boolean }[] = [
    { label: 'Application submitted',   done: ['submitted','pending_review','requires_documents','approved','denied'].includes(status) },
    { label: 'Identity verification',   done: ['pending_review','approved','denied'].includes(status) },
    { label: 'Business review',         done: ['approved','denied'].includes(status) },
    { label: 'Account provisioned',     done: status === 'approved' },
  ];

  return (
    <div className="flex flex-col" style={{ minHeight: '100%' }}>
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div style={{ maxWidth: 640, margin: '0 auto' }}>

          <div className="rounded-[10px] p-6 mb-6 text-center" style={{ background: '#fff', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: cfg.bg }}>
              <Icon size={28} style={{ color: cfg.color }} />
            </div>
            <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold mb-2" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.25rem', fontWeight: 700, color: '#1A1A1A', marginBottom: 6 }}>Application Status</h2>
            {status === 'pending_review' && <p style={{ color: '#6B7280', fontSize: '0.9375rem' }}>Our banking partner is reviewing your application. This typically takes 1–3 business days. You'll receive an email on any status change.</p>}
            {status === 'submitted'      && <p style={{ color: '#6B7280', fontSize: '0.9375rem' }}>Your application has been submitted and is in the queue for review.</p>}
            {status === 'approved'       && <p style={{ color: '#6B7280', fontSize: '0.9375rem' }}>Your business bank account is ready. Setting up your account…</p>}
            {status === 'denied' && denialReason && (
              <div className="mt-3 p-3 rounded-[8px] text-left" style={{ background: '#FEF2F2', border: '1px solid #FCA5A5' }}>
                <p style={{ color: '#991B1B', fontWeight: 600, fontSize: '0.875rem', marginBottom: 4 }}>Reason provided by our banking partner:</p>
                <p style={{ color: '#7F1D1D', fontSize: '0.875rem' }}>{denialReason}</p>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="rounded-[10px] p-5 mb-6" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
            <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem', marginBottom: 16 }}>Application timeline</p>
            <div className="space-y-0">
              {timeline.map((step, i) => (
                <div key={step.label} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: step.done ? '#27AE60' : '#F3F4F6', border: step.done ? 'none' : '1.5px solid #E5E7EB' }}>
                      {step.done ? <CheckCircle2 size={14} color="#fff" /> : <Circle size={12} style={{ color: '#D1D5DB' }} />}
                    </div>
                    {i < timeline.length - 1 && <div style={{ width: 2, height: 28, background: step.done ? '#27AE60' : '#E5E7EB', margin: '2px 0' }} />}
                  </div>
                  <p style={{ paddingTop: 4, color: step.done ? '#1A1A1A' : '#9CA3AF', fontSize: '0.9375rem', fontWeight: step.done ? 600 : 400 }}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Document upload queue */}
          {status === 'requires_documents' && docsRequired && (
            <div className="rounded-[10px] mb-6 overflow-hidden" style={{ border: '1.5px solid #F39C12' }}>
              <div className="px-5 py-3 border-b" style={{ borderColor: '#F39C12', background: '#FFFBEB' }}>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} style={{ color: '#F39C12' }} />
                  <p style={{ fontWeight: 700, color: '#92400E', fontSize: '0.9375rem' }}>Additional documents required</p>
                </div>
              </div>
              <div className="divide-y" style={{ borderColor: '#E5E7EB' }}>
                {docsRequired.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between px-5 py-4" style={{ background: '#fff' }}>
                    <div>
                      <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.9375rem' }}>{doc.label}</p>
                      {doc.rejection_reason && <p style={{ color: '#C0392B', fontSize: '0.8125rem', marginTop: 2 }}>{doc.rejection_reason}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: doc.status === 'uploaded' ? '#EBF5FB' : '#FEF2F2', color: doc.status === 'uploaded' ? '#2980B9' : '#C0392B' }}>
                        {doc.status}
                      </span>
                      <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] cursor-pointer font-semibold text-sm" style={{ background: '#1A1A1A', color: '#fff' }}>
                        <Upload size={14} /> Upload
                        <input type="file" className="hidden" onChange={e => e.target.files?.[0] && onUploadDoc(doc.id, e.target.files[0])} />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Denied CTA */}
          {status === 'denied' && (
            <div className="rounded-[10px] p-5" style={{ border: '1px solid #E5E7EB', background: '#F9FAFB' }}>
              <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.9375rem', marginBottom: 4 }}>Continue selling without a FB Business Connect account</p>
              <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: 12 }}>You can connect an external bank account to receive payouts. Your store stays live and all other features remain available.</p>
              <button onClick={onExternalAccount} className="flex items-center gap-2 px-4 py-2.5 rounded-[8px] font-semibold" style={{ background: '#1A1A1A', color: '#fff', fontSize: '0.9375rem' }}>
                Set up external bank account <ChevronRight size={16} />
              </button>
            </div>
          )}

          {(status === 'submitted' || status === 'pending_review') && (
            <button onClick={onRetry} className="flex items-center gap-1.5 text-sm" style={{ color: '#9CA3AF', marginTop: 8 }}>
              <Loader2 size={14} /> Refresh status
            </button>
          )}
        </div>
      </div>
      <PartnerBankDisclosure />
    </div>
  );
}

// ─── Main wizard ──────────────────────────────────────────────────────────────

interface KYBWizardProps {
  tenantName: string;
  tenantEmail: string;
  industryPack: string;
  ein: string;
  onApproved: () => void;
  onExternalAccount: () => void;
}

export function KYBWizard({ tenantName, tenantEmail, industryPack, ein, onApproved, onExternalAccount }: KYBWizardProps) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [appStatus, setAppStatus] = useState<ApplicationStatus | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [denialReason, setDenialReason] = useState<string | null>(null);
  const [docsRequired, setDocsRequired] = useState<RequiredDocument[] | null>(null);

  const [state, setState] = useState<WizardState>({
    business: {
      legal_name: tenantName,
      dba: '',
      entity_type: 'llc',
      ein,
      formation_state: '',
      formation_date: '',
      address: { line1: '', city: '', state: '', zip: '', country: 'ZA' },
      phone: '',
      website: '',
      estimated_monthly_revenue: '',
      naics_code: NAICS_BY_INDUSTRY[industryPack] ?? '',
    },
    owners: [blankOwner()],
    controlPerson: { full_name: '', title: '', is_same_as_owner: false, owner_id: null },
    disclosures: { deposit_agreement: false, esign_consent: false, patriot_act: false },
  });

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const provider = getBankingProvider();
      const now = new Date().toISOString();
      const result = await provider.createApplication({
        business: {
          ...state.business,
          dba: state.business.dba || null,
          entity_type: state.business.entity_type as EntityType,
          website: state.business.website || null,
          estimated_monthly_revenue: Math.round(parseFloat(state.business.estimated_monthly_revenue || '0') * 100),
        },
        owners: state.owners.map(o => ({
          full_name: o.full_name,
          dob: o.dob,
          ssn_token: o.ssn_token,
          address: o.address,
          ownership_pct: parseFloat(o.ownership_pct) || 0,
          is_control_person: o.is_control_person,
          email: o.email,
          phone: o.phone,
        })),
        disclosures: {
          deposit_agreement_accepted_at: now,
          esign_consent_accepted_at: now,
          patriot_act_accepted_at: now,
          ip: '127.0.0.1',
        },
        idempotency_key: newIdempotencyKey(),
      });
      setApplicationId(result.application_id);
      setAppStatus(result.status);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRefresh() {
    if (!applicationId) return;
    const provider = getBankingProvider();
    const result = await provider.getApplicationStatus(applicationId);
    setAppStatus(result.status);
    setDenialReason(result.denial_reason);
    setDocsRequired(result.documents_required);
    if (result.status === 'approved') onApproved();
  }

  async function handleUploadDoc(docId: string, file: File) {
    if (!applicationId) return;
    const provider = getBankingProvider();
    await provider.uploadDocument(applicationId, docId, file.name);
    setDocsRequired(prev => prev?.map(d => d.id === docId ? { ...d, status: 'uploaded' as const } : d) ?? prev);
  }

  // After submission — show status page
  if (appStatus) {
    return (
      <ApplicationStatusPage
        status={appStatus}
        denialReason={denialReason}
        docsRequired={docsRequired}
        onUploadDoc={handleUploadDoc}
        onExternalAccount={onExternalAccount}
        onRetry={handleRefresh}
      />
    );
  }

  const allDisclosuresAccepted = state.disclosures.deposit_agreement && state.disclosures.esign_consent && state.disclosures.patriot_act;
  const canProceed = step < 4 || allDisclosuresAccepted;

  return (
    <div className="flex flex-col" style={{ minHeight: '100%' }}>
      <div className="flex-1 flex overflow-hidden">

        {/* Stepper rail */}
        <aside className="hidden lg:flex flex-col w-56 xl:w-64 p-6 border-r shrink-0" style={{ borderColor: '#E5E7EB', background: '#F9FAFB' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 20 }}>KYB Application</p>
          <div className="space-y-2">
            {STEPS.map(s => {
              const done = step > s.id;
              const active = step === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => step > s.id && setStep(s.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-left"
                  style={{ background: active ? '#FDEDEC' : 'transparent', cursor: done ? 'pointer' : 'default' }}
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: done ? '#27AE60' : active ? '#C0392B' : '#E5E7EB' }}>
                    {done ? <CheckCircle2 size={14} color="#fff" /> : <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: active ? '#fff' : '#9CA3AF' }}>{s.id}</span>}
                  </div>
                  <span style={{ fontSize: '0.9375rem', fontWeight: active ? 600 : 400, color: active ? '#C0392B' : done ? '#1A1A1A' : '#6B7280' }}>
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-6">
            <div className="p-3 rounded-[8px]" style={{ background: '#EBF5FB', border: '1px solid #AED6F1' }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1A5276', marginBottom: 4 }}>Why we ask</p>
              <p style={{ fontSize: '0.8125rem', color: '#2980B9', lineHeight: 1.5 }}>{STEPS[step - 1].helper}</p>
            </div>
          </div>
        </aside>

        {/* Form */}
        <main className="flex-1 overflow-auto p-6 lg:p-8">
          <div style={{ maxWidth: 600 }}>
            <div className="mb-6">
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#C0392B', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Step {step} of {STEPS.length}</p>
              <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.375rem', fontWeight: 700, color: '#1A1A1A' }}>{STEPS[step - 1].label}</h2>
            </div>

            {step === 1 && <Step1 data={state.business} onChange={d => setState(s => ({ ...s, business: { ...s.business, ...d } }))} />}
            {step === 2 && <Step2 owners={state.owners} onChange={owners => setState(s => ({ ...s, owners }))} />}
            {step === 3 && <Step3 data={state.controlPerson} owners={state.owners} onChange={cp => setState(s => ({ ...s, controlPerson: cp }))} />}
            {step === 4 && <Step4 business={state.business} owners={state.owners} disclosures={state.disclosures} onChange={d => setState(s => ({ ...s, disclosures: d }))} />}

            <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: '1px solid #E5E7EB' }}>
              <button
                onClick={() => setStep(s => Math.max(1, s - 1))}
                disabled={step === 1}
                className="flex items-center gap-2 px-4 py-2.5 rounded-[8px] font-semibold"
                style={{ background: '#F3F4F6', color: step === 1 ? '#D1D5DB' : '#374151', cursor: step === 1 ? 'not-allowed' : 'pointer' }}
              >
                <ChevronLeft size={16} /> Back
              </button>

              {step < 4 ? (
                <button
                  onClick={() => setStep(s => Math.min(4, s + 1))}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] font-semibold"
                  style={{ background: '#C0392B', color: '#fff' }}
                >
                  Continue <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!allDisclosuresAccepted || submitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] font-semibold"
                  style={{ background: allDisclosuresAccepted && !submitting ? '#C0392B' : '#E5E7EB', color: allDisclosuresAccepted && !submitting ? '#fff' : '#9CA3AF', cursor: allDisclosuresAccepted && !submitting ? 'pointer' : 'not-allowed' }}
                >
                  {submitting ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting…</> : <>Submit application <ChevronRight size={16} /></>}
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
      <PartnerBankDisclosure />
    </div>
  );
}

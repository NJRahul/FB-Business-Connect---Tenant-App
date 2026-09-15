import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, ExternalLink, Loader2, AlertTriangle } from 'lucide-react';
import type { CoverageType, InsuranceQuote, PaymentFrequency } from '../../../lib/insurance/types';
import { formatCents, newIdempotencyKey } from '../../../lib/insurance/types';
import { getInsuranceProvider } from '../../../lib/insurance/mockProvider';
import { COVERAGE_TYPES } from './mockData';

// ─── Shared form helpers ──────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: '0.875rem', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ width: '100%', border: '1px solid #D1D5DB', borderRadius: 6, padding: '8px 12px', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box' }}
    />
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ width: '100%', border: '1px solid #D1D5DB', borderRadius: 6, padding: '8px 12px', fontSize: '0.9375rem', outline: 'none', background: '#fff' }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ─── Step 1: Business info (prefilled) ───────────────────────────────────────

interface BusinessInfo {
  business_name: string;
  dba: string;
  entity_type: string;
  ein: string;
  state: string;
  address: string;
  years_in_business: string;
  annual_revenue: string;
  employee_count: string;
  operations_type: string;
}

function StepBusinessInfo({ data, onChange }: { data: BusinessInfo; onChange: (d: BusinessInfo) => void }) {
  const set = (key: keyof BusinessInfo) => (v: string) => onChange({ ...data, [key]: v });
  return (
    <div className="space-y-4">
      <div className="p-3 rounded-[8px] flex items-center gap-2" style={{ background: '#EBF5FB', border: '1px solid #BEE3F8' }}>
        <CheckCircle2 size={14} style={{ color: '#2980B9' }} />
        <p style={{ color: '#1e4a70', fontSize: '0.8125rem' }}>Pre-filled from your business profile. Review and update if needed.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Legal business name"><Input value={data.business_name} onChange={set('business_name')} /></Field>
        <Field label="DBA (if different)"><Input value={data.dba} onChange={set('dba')} placeholder="Optional" /></Field>
        <Field label="Entity type">
          <Select value={data.entity_type} onChange={set('entity_type')} options={[
            { value: 'llc', label: 'LLC' }, { value: 'sole_prop', label: 'Sole proprietorship' },
            { value: 's_corp', label: 'S-Corp' }, { value: 'c_corp', label: 'C-Corp' },
            { value: 'partnership', label: 'Partnership' },
          ]} />
        </Field>
        <Field label="Tax Reference Number"><Input value={data.ein} onChange={set('ein')} placeholder="XXXXXXXXX" /></Field>
        <Field label="State of operations">
          <Select value={data.state} onChange={set('state')} options={[
            'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
          ].map(s => ({ value: s, label: s }))} />
        </Field>
        <Field label="Business address"><Input value={data.address} onChange={set('address')} /></Field>
        <Field label="Years in business"><Input value={data.years_in_business} onChange={set('years_in_business')} type="number" /></Field>
        <Field label="Estimated annual revenue ($)"><Input value={data.annual_revenue} onChange={set('annual_revenue')} type="number" /></Field>
        <Field label="Employee count"><Input value={data.employee_count} onChange={set('employee_count')} type="number" /></Field>
        <Field label="Operations type">
          <Select value={data.operations_type} onChange={set('operations_type')} options={[
            { value: 'in_shop', label: 'In-shop only' },
            { value: 'mobile', label: 'Mobile only' },
            { value: 'both', label: 'Both' },
          ]} />
        </Field>
      </div>
    </div>
  );
}

// ─── Step 2: Coverage-specific questions ─────────────────────────────────────

interface CoverageAnswers {
  // WC
  wc_payroll: string;
  wc_class_code: string;
  // Auto
  vehicle_count: string;
  oldest_driver_age: string;
  // GK
  service_bays: string;
  overnight_vehicles: string;
  // GL / general
  prior_claims: string;
  has_alarm: string;
}

function StepCoverageQuestions({
  coverageTypeIds, answers, onChange,
}: { coverageTypeIds: string[]; answers: CoverageAnswers; onChange: (a: CoverageAnswers) => void }) {
  const set = (key: keyof CoverageAnswers) => (v: string) => onChange({ ...answers, [key]: v });

  const hasWC   = coverageTypeIds.includes('ct-wc');
  const hasAuto = coverageTypeIds.includes('ct-auto');
  const hasGK   = coverageTypeIds.includes('ct-gk');

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.9375rem' }}>General questions</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Prior claims in last 3 years">
            <Select value={answers.prior_claims} onChange={set('prior_claims')} options={[
              { value: '0', label: 'None' }, { value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3+', label: '3 or more' },
            ]} />
          </Field>
          <Field label="Burglar alarm installed">
            <Select value={answers.has_alarm} onChange={set('has_alarm')} options={[
              { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' },
            ]} />
          </Field>
        </div>
      </div>

      {hasWC && (
        <div className="space-y-4 pt-4" style={{ borderTop: '1px solid #E5E7EB' }}>
          <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.9375rem' }}>Workers' Compensation</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Annual payroll ($)"><Input value={answers.wc_payroll} onChange={set('wc_payroll')} type="number" placeholder="e.g. 450000" /></Field>
            <Field label="Primary NCCI class code"><Input value={answers.wc_class_code} onChange={set('wc_class_code')} placeholder="e.g. 8810" /></Field>
          </div>
        </div>
      )}

      {hasAuto && (
        <div className="space-y-4 pt-4" style={{ borderTop: '1px solid #E5E7EB' }}>
          <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.9375rem' }}>Commercial Auto</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Number of vehicles"><Input value={answers.vehicle_count} onChange={set('vehicle_count')} type="number" /></Field>
            <Field label="Youngest driver age"><Input value={answers.oldest_driver_age} onChange={set('oldest_driver_age')} type="number" placeholder="e.g. 23" /></Field>
          </div>
        </div>
      )}

      {hasGK && (
        <div className="space-y-4 pt-4" style={{ borderTop: '1px solid #E5E7EB' }}>
          <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.9375rem' }}>Garage Keepers</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Number of service bays"><Input value={answers.service_bays} onChange={set('service_bays')} type="number" /></Field>
            <Field label="Max vehicles stored overnight"><Input value={answers.overnight_vehicles} onChange={set('overnight_vehicles')} type="number" /></Field>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 3: Quote comparison ─────────────────────────────────────────────────

function QuoteCard({
  quote, selected, onSelect,
}: { quote: InsuranceQuote; selected: boolean; onSelect: () => void }) {
  const ratingColor = (r: string) => r === 'A++' ? '#27AE60' : r.startsWith('A') ? '#2980B9' : '#F39C12';
  return (
    <div
      className="rounded-[10px] p-5 cursor-pointer"
      style={{
        border: `2px solid ${selected ? '#1A1A1A' : '#E5E7EB'}`,
        background: selected ? '#F9FAFB' : '#fff',
        boxShadow: selected ? '0 2px 8px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
      }}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>{quote.carrier_name}</p>
          <span className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{ background: '#EBF5FB', color: ratingColor(quote.carrier_rating) }}>
            AM Best {quote.carrier_rating}
          </span>
        </div>
        {selected && <CheckCircle2 size={20} style={{ color: '#1A1A1A' }} />}
      </div>
      <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1A1A1A', fontVariantNumeric: 'tabular-nums', marginBottom: 2 }}>
        {formatCents(quote.annual_premium)}<span style={{ fontSize: '0.9375rem', fontWeight: 400, color: '#6B7280' }}>/yr</span>
      </p>
      <p style={{ color: '#6B7280', fontSize: '0.8125rem', marginBottom: 12 }}>
        {formatCents(quote.monthly_premium)}/mo · Deductible {formatCents(quote.deductible)}
      </p>
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span style={{ color: '#6B7280' }}>Per occurrence</span>
          <span style={{ fontWeight: 600, color: '#1A1A1A', fontVariantNumeric: 'tabular-nums' }}>{formatCents(quote.limits_json.per_occurrence)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span style={{ color: '#6B7280' }}>Aggregate</span>
          <span style={{ fontWeight: 600, color: '#1A1A1A', fontVariantNumeric: 'tabular-nums' }}>{formatCents(quote.limits_json.aggregate)}</span>
        </div>
      </div>
      {quote.exclusions_json.length > 0 && (
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid #F3F4F6' }}>
          <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: 4 }}>Key exclusions</p>
          <div className="flex flex-wrap gap-1">
            {quote.exclusions_json.map(ex => (
              <span key={ex} className="px-1.5 py-0.5 rounded text-xs" style={{ background: '#F3F4F6', color: '#6B7280' }}>{ex}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 4: Bind ─────────────────────────────────────────────────────────────

function StepBind({
  quote, coverageType, effectiveDate, setEffectiveDate,
  frequency, setFrequency, agreed, setAgreed,
}: {
  quote: InsuranceQuote;
  coverageType: CoverageType;
  effectiveDate: string;
  setEffectiveDate: (v: string) => void;
  frequency: PaymentFrequency;
  setFrequency: (v: PaymentFrequency) => void;
  agreed: boolean;
  setAgreed: (v: boolean) => void;
}) {
  if (coverageType.distribution_mode === 'referral') {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ background: '#EBF5FB' }}>
          <ExternalLink size={26} style={{ color: '#2980B9' }} />
        </div>
        <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.125rem', fontWeight: 700, color: '#1A1A1A' }}>Referral coverage</p>
        <p style={{ color: '#6B7280', fontSize: '0.9375rem', maxWidth: 400, margin: '0 auto', lineHeight: 1.6 }}>
          This coverage type is placed through a licensed carrier partner. You'll receive a call from a specialist within 1–2 business days to complete your application.
        </p>
        <div className="p-4 rounded-[8px] text-left" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', maxWidth: 400, margin: '0 auto' }}>
          <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.875rem', marginBottom: 8 }}>What happens next</p>
          {['A specialist will contact you within 2 business days', "They'll review your business details and provide a quote", 'You can bind coverage directly with the carrier'].map((s, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: '#1A1A1A', color: '#fff' }}>{i + 1}</span>
              <span style={{ color: '#374151', fontSize: '0.875rem' }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-[10px]" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
        <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem', marginBottom: 12 }}>Selected quote</p>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <span style={{ color: '#6B7280' }}>Carrier</span>
          <span style={{ fontWeight: 600, color: '#1A1A1A' }}>{quote.carrier_name}</span>
          <span style={{ color: '#6B7280' }}>Annual premium</span>
          <span style={{ fontWeight: 700, color: '#1A1A1A', fontVariantNumeric: 'tabular-nums' }}>{formatCents(quote.annual_premium)}</span>
          <span style={{ color: '#6B7280' }}>Monthly premium</span>
          <span style={{ fontWeight: 700, color: '#1A1A1A', fontVariantNumeric: 'tabular-nums' }}>{formatCents(quote.monthly_premium)}</span>
          <span style={{ color: '#6B7280' }}>Deductible</span>
          <span style={{ fontVariantNumeric: 'tabular-nums', color: '#1A1A1A' }}>{formatCents(quote.deductible)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Effective date">
          <Input value={effectiveDate} onChange={setEffectiveDate} type="date" />
        </Field>
        <Field label="Payment frequency">
          <Select value={frequency} onChange={v => setFrequency(v as PaymentFrequency)} options={[
            { value: 'annual', label: 'Annual' },
            { value: 'semi_annual', label: 'Semi-annual' },
            { value: 'quarterly', label: 'Quarterly' },
            { value: 'monthly', label: 'Monthly' },
          ]} />
        </Field>
      </div>

      <div className="p-4 rounded-[8px]" style={{ background: '#FFF8F8', border: '1px solid #FECACA' }}>
        <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.875rem', marginBottom: 8 }}>Before you bind</p>
        <ul className="space-y-1">
          {['Coverage is subject to carrier underwriting approval', 'Policy terms and exclusions apply — review your declarations page', 'Premium is due on the effective date'].map(item => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle2 size={13} style={{ color: '#00A9AC', marginTop: 2, flexShrink: 0 }} />
              <span style={{ color: '#374151', fontSize: '0.875rem' }}>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-1" style={{ flexShrink: 0 }} />
        <span style={{ color: '#374151', fontSize: '0.875rem', lineHeight: 1.6 }}>
          I authorize binding this coverage and confirm the information I provided is accurate. I understand that misrepresentation may void coverage.
        </span>
      </label>
    </div>
  );
}

// ─── Main wizard ──────────────────────────────────────────────────────────────

const STEPS_BIND    = ['Business info', 'Coverage questions', 'Compare quotes', 'Bind coverage'];
const STEPS_REFERRAL = ['Business info', 'Coverage questions', 'Submit referral'];

interface Props {
  initialCoverageTypeId: string;
  tenant: { businessName: string; email: string; state: string; ein: string; teamSize: number; vehicleCount: number };
  onComplete: () => void;
  onBack: () => void;
}

export function ApplicationWizard({ initialCoverageTypeId, tenant, onComplete, onBack }: Props) {
  const coverageType = COVERAGE_TYPES.find(c => c.id === initialCoverageTypeId)!;
  const isReferral = coverageType?.distribution_mode === 'referral';
  const STEPS = isReferral ? STEPS_REFERRAL : STEPS_BIND;

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<InsuranceQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [boundPolicyNumber, setBoundPolicyNumber] = useState<string | null>(null);
  const idempotencyKey = useRef(newIdempotencyKey());

  const today = new Date().toISOString().split('T')[0];

  const [bizInfo, setBizInfo] = useState<BusinessInfo>({
    business_name: tenant.businessName,
    dba: '',
    entity_type: 'llc',
    ein: tenant.ein,
    state: tenant.state,
    address: '',
    years_in_business: '5',
    annual_revenue: '850000',
    employee_count: String(tenant.teamSize),
    operations_type: 'both',
  });

  const [coverageAnswers, setCoverageAnswers] = useState<CoverageAnswers>({
    wc_payroll: '',
    wc_class_code: '',
    vehicle_count: String(tenant.vehicleCount),
    oldest_driver_age: '',
    service_bays: '4',
    overnight_vehicles: '8',
    prior_claims: '0',
    has_alarm: 'yes',
  });

  const [effectiveDate, setEffectiveDate] = useState(today);
  const [frequency, setFrequency] = useState<PaymentFrequency>('monthly');
  const [agreed, setAgreed] = useState(false);

  const provider = getInsuranceProvider();

  async function handleNext() {
    setError(null);

    if (step === 0) { setStep(1); return; }

    if (step === 1) {
      // Submit application + fetch quotes
      if (isReferral) {
        setLoading(true);
        try {
          await provider.submitApplication({
            coverage_type_ids: [initialCoverageTypeId],
            answers: { ...bizInfo, ...coverageAnswers },
            signature_ip: '127.0.0.1',
            idempotency_key: idempotencyKey.current,
          });
          setSubmitted(true);
          setStep(2);
        } catch {
          setError('Submission failed. Please try again.');
        } finally { setLoading(false); }
        return;
      }

      setLoading(true);
      try {
        const { application_id } = await provider.submitApplication({
          coverage_type_ids: [initialCoverageTypeId],
          answers: { ...bizInfo, ...coverageAnswers },
          signature_ip: '127.0.0.1',
          idempotency_key: idempotencyKey.current,
        });
        const q = await provider.getQuote(application_id);
        setQuotes(q);
        setSelectedQuote(q[0]?.id ?? null);
        setStep(2);
      } catch {
        setError('Could not retrieve quotes. Please try again.');
      } finally { setLoading(false); }
      return;
    }

    if (step === 2 && !isReferral) {
      setStep(3); return;
    }

    if (step === 3 && !isReferral) {
      if (!agreed) { setError('Please confirm the authorization above to proceed.'); return; }
      const quote = quotes.find(q => q.id === selectedQuote);
      if (!quote) { setError('Please select a quote.'); return; }
      setLoading(true);
      try {
        const { policy_number } = await provider.bindPolicy({
          quote_id: quote.id,
          effective_date: effectiveDate,
          payment_frequency: frequency,
          payment_method: 'card',
          signature_ip: '127.0.0.1',
          idempotency_key: newIdempotencyKey(),
        });
        setBoundPolicyNumber(policy_number);
        setSubmitted(true);
      } catch {
        setError('Could not bind policy. Please try again.');
      } finally { setLoading(false); }
    }
  }

  if (submitted && boundPolicyNumber) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#F0FDF4' }}>
          <CheckCircle2 size={32} style={{ color: '#27AE60' }} />
        </div>
        <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.25rem', fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>Policy bound</p>
        <p style={{ color: '#6B7280', fontSize: '0.9375rem', marginBottom: 4 }}>Policy number</p>
        <p style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.125rem', color: '#1A1A1A', marginBottom: 24 }}>{boundPolicyNumber}</p>
        <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: 24 }}>Your declarations page will be available in the document vault within 24 hours.</p>
        <button onClick={onComplete} className="px-6 py-2.5 rounded-[8px] font-semibold" style={{ background: '#1A1A1A', color: '#fff' }}>
          View all policies
        </button>
      </div>
    );
  }

  if (submitted && isReferral) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#EBF5FB' }}>
          <ExternalLink size={28} style={{ color: '#2980B9' }} />
        </div>
        <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.25rem', fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>Referral submitted</p>
        <p style={{ color: '#6B7280', fontSize: '0.9375rem', maxWidth: 380, margin: '0 auto 24px' }}>
          A specialist will contact you within 1–2 business days. You'll receive email updates on your referral status.
        </p>
        <button onClick={onComplete} className="px-6 py-2.5 rounded-[8px] font-semibold" style={{ background: '#1A1A1A', color: '#fff' }}>
          Back to coverage catalog
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={step === 0 ? onBack : () => setStep(s => s - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
          <ChevronLeft size={20} />
        </button>
        <div>
          <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.125rem', color: '#1A1A1A' }}>
            {coverageType?.display_name} application
          </p>
          <p style={{ color: '#6B7280', fontSize: '0.8125rem' }}>Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
        </div>
      </div>

      {/* Step rail */}
      <div className="flex gap-1 mb-6">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1 h-1.5 rounded-full" style={{ background: i <= step ? '#1A1A1A' : '#E5E7EB' }} />
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-[8px] mb-4" style={{ background: '#F0FBFB', border: '1px solid #FECACA' }}>
          <AlertTriangle size={15} style={{ color: '#00A9AC' }} />
          <p style={{ color: '#00A9AC', fontSize: '0.875rem' }}>{error}</p>
        </div>
      )}

      {/* Step content */}
      <div className="rounded-[10px] p-6 mb-6" style={{ background: '#fff', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        {step === 0 && <StepBusinessInfo data={bizInfo} onChange={setBizInfo} />}
        {step === 1 && <StepCoverageQuestions coverageTypeIds={[initialCoverageTypeId]} answers={coverageAnswers} onChange={setCoverageAnswers} />}
        {step === 2 && !isReferral && (
          <div>
            <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem', marginBottom: 16 }}>Select a quote</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {quotes.map(q => (
                <QuoteCard key={q.id} quote={q} selected={selectedQuote === q.id} onSelect={() => setSelectedQuote(q.id)} />
              ))}
            </div>
          </div>
        )}
        {step === 2 && isReferral && (
          <div className="text-center py-4">
            <p style={{ color: '#6B7280' }}>Submitting your referral request...</p>
          </div>
        )}
        {step === 3 && !isReferral && quotes.find(q => q.id === selectedQuote) && (
          <StepBind
            quote={quotes.find(q => q.id === selectedQuote)!}
            coverageType={coverageType}
            effectiveDate={effectiveDate}
            setEffectiveDate={setEffectiveDate}
            frequency={frequency}
            setFrequency={setFrequency}
            agreed={agreed}
            setAgreed={setAgreed}
          />
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between">
        <button
          onClick={step === 0 ? onBack : () => setStep(s => s - 1)}
          className="px-5 py-2.5 rounded-[8px] font-semibold text-sm"
          style={{ border: '1px solid #E5E7EB', color: '#6B7280', background: '#fff' }}
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] font-semibold text-sm"
          style={{ background: loading ? '#9CA3AF' : '#1A1A1A', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading && <Loader2 size={15} className="animate-spin" />}
          {step === STEPS.length - 1 ? (isReferral ? 'Submit referral' : 'Bind policy') : 'Continue'}
          {!loading && <ChevronRight size={15} />}
        </button>
      </div>
    </div>
  );
}

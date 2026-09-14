import type {
  InsuranceProvider,
  InsuranceQuote,
  InsurancePolicy,
  InsuranceApplication,
  InsuranceCertificate,
  InsuranceClaim,
  InsuranceEndorsement,
  ApplicationStatus,
  ClaimStatus,
  EndorsementType,
  SubmitApplicationInput,
  BindInput,
  GenerateCOIInput,
  SubmitClaimInput,
  PaymentFrequency,
} from './types';

function delay(min = 400, max = 1200): Promise<void> {
  return new Promise(r => setTimeout(r, min + Math.random() * (max - min)));
}

function uuid(): string { return crypto.randomUUID(); }

const MOCK_QUOTES: InsuranceQuote[] = [
  {
    id: 'q-gl-1',
    application_id: '',
    shop_id: 'shop-demo',
    coverage_type_id: 'ct-gl',
    carrier_name: 'Acuity Insurance',
    carrier_rating: 'A+',
    annual_premium: 142000,
    monthly_premium: 11833,
    limits_json: { per_occurrence: 100000000, aggregate: 200000000 },
    deductible: 50000,
    exclusions_json: ['Intentional acts', 'War and terrorism'],
    valid_until: '2026-12-13',
    partner_quote_id: 'pq-acuity-001',
    selected_at: null,
  },
  {
    id: 'q-gl-2',
    application_id: '',
    shop_id: 'shop-demo',
    coverage_type_id: 'ct-gl',
    carrier_name: 'Markel Insurance',
    carrier_rating: 'A',
    annual_premium: 128000,
    monthly_premium: 10667,
    limits_json: { per_occurrence: 100000000, aggregate: 200000000 },
    deductible: 100000,
    exclusions_json: ['Intentional acts', 'War and terrorism', 'Professional services'],
    valid_until: '2026-12-13',
    partner_quote_id: 'pq-markel-001',
    selected_at: null,
  },
  {
    id: 'q-gl-3',
    application_id: '',
    shop_id: 'shop-demo',
    coverage_type_id: 'ct-gl',
    carrier_name: 'Philadelphia Insurance',
    carrier_rating: 'A++',
    annual_premium: 167000,
    monthly_premium: 13917,
    limits_json: { per_occurrence: 200000000, aggregate: 400000000 },
    deductible: 25000,
    exclusions_json: ['Intentional acts'],
    valid_until: '2026-12-13',
    partner_quote_id: 'pq-phily-001',
    selected_at: null,
  },
];

const MOCK_POLICIES: InsurancePolicy[] = [
  {
    id: 'pol-gl-1',
    shop_id: 'shop-demo',
    coverage_type_id: 'ct-gl',
    coverage_name: 'General Liability',
    quote_id: 'q-gl-1',
    carrier_name: 'Acuity Insurance',
    carrier_contact: '1-800-242-7666',
    policy_number: 'ACU-2025-GL-88412',
    status: 'active',
    effective_date: '2025-09-13',
    expiry_date: '2026-09-13',
    premium: 142000,
    payment_frequency: 'monthly',
    next_payment_date: '2026-10-13',
    limits_json: { per_occurrence: 100000000, aggregate: 200000000 },
    deductible: 50000,
    is_external: false,
    created_at: '2025-09-10T14:22:00Z',
  },
  {
    id: 'pol-gk-1',
    shop_id: 'shop-demo',
    coverage_type_id: 'ct-gk',
    coverage_name: 'Garage Keepers',
    quote_id: null,
    carrier_name: 'Markel Insurance',
    carrier_contact: '1-800-431-1270',
    policy_number: 'MKL-2025-GK-22018',
    status: 'active',
    effective_date: '2025-09-01',
    expiry_date: '2026-09-01',
    premium: 284000,
    payment_frequency: 'annual',
    next_payment_date: null,
    limits_json: { per_occurrence: 10000000, aggregate: 30000000 },
    deductible: 100000,
    is_external: true,
    created_at: '2025-09-01T10:00:00Z',
  },
  {
    id: 'pol-wc-1',
    shop_id: 'shop-demo',
    coverage_type_id: 'ct-wc',
    coverage_name: "Workers' Compensation",
    quote_id: null,
    carrier_name: 'ICW Group',
    carrier_contact: '1-800-877-1111',
    policy_number: 'ICW-2025-WC-55103',
    status: 'pending',
    effective_date: '2026-10-01',
    expiry_date: '2027-10-01',
    premium: 410000,
    payment_frequency: 'monthly',
    next_payment_date: '2026-10-01',
    limits_json: { per_occurrence: 10000000, aggregate: 20000000 },
    deductible: 0,
    is_external: false,
    created_at: '2026-09-01T09:00:00Z',
  },
];

export class MockInsuranceProvider implements InsuranceProvider {
  async getQuote(application_id: string): Promise<InsuranceQuote[]> {
    await delay();
    return MOCK_QUOTES.map(q => ({ ...q, application_id }));
  }

  async submitApplication(input: SubmitApplicationInput): Promise<{ application_id: string; status: ApplicationStatus }> {
    await delay(800, 1500);
    console.log('[MockInsuranceProvider] submitApplication — idempotency_key:', input.idempotency_key);
    return { application_id: uuid(), status: 'submitted' };
  }

  async bindPolicy(input: BindInput): Promise<{ policy_id: string; policy_number: string }> {
    await delay(1000, 1800);
    console.log('[MockInsuranceProvider] bindPolicy — quote_id:', input.quote_id, 'idempotency_key:', input.idempotency_key);
    return { policy_id: uuid(), policy_number: `ACU-${new Date().getFullYear()}-GL-${Math.floor(10000 + Math.random() * 89999)}` };
  }

  async getPolicy(policy_id: string): Promise<InsurancePolicy> {
    await delay();
    const p = MOCK_POLICIES.find(p => p.id === policy_id) ?? MOCK_POLICIES[0];
    return { ...p, id: policy_id };
  }

  async requestEndorsement(
    policy_id: string,
    type: EndorsementType,
    payload: Record<string, unknown>,
  ): Promise<{ endorsement_id: string }> {
    await delay();
    console.log('[MockInsuranceProvider] requestEndorsement — policy_id:', policy_id, 'type:', type);
    return { endorsement_id: uuid() };
  }

  async generateCOI(input: GenerateCOIInput): Promise<{ pdf_url: string; verify_token: string }> {
    await delay(600, 1200);
    const token = uuid().replace(/-/g, '').substring(0, 16);
    console.log('[MockInsuranceProvider] generateCOI — policies:', input.policy_ids, 'holder:', input.holder_name);
    return {
      pdf_url: `https://docs.fb-business-connect.app/coi/${token}.pdf`,
      verify_token: token,
    };
  }

  async submitClaim(input: SubmitClaimInput): Promise<{ claim_id: string; claim_number: string }> {
    await delay(800, 1400);
    console.log('[MockInsuranceProvider] submitClaim — policy_id:', input.policy_id, 'idempotency_key:', input.idempotency_key);
    const claimNum = `CLM-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 899999)}`;
    return { claim_id: uuid(), claim_number: claimNum };
  }

  async getClaimStatus(claim_id: string): Promise<{ status: ClaimStatus; adjuster_name: string | null; adjuster_contact: string | null }> {
    await delay(400, 800);
    return {
      status: 'investigating',
      adjuster_name: 'Sarah Mitchell',
      adjuster_contact: 'smitchell@acuity.com',
    };
  }
}

let _instance: InsuranceProvider | null = null;

export function getInsuranceProvider(): InsuranceProvider {
  if (!_instance) {
    const mode = (typeof import.meta !== 'undefined' && (import.meta as Record<string, unknown>).env)
      ? ((import.meta as { env: Record<string, string> }).env.VITE_PROVIDER_MODE ?? 'mock')
      : 'mock';
    if (mode === 'mock') {
      _instance = new MockInsuranceProvider();
    } else {
      _instance = new MockInsuranceProvider();
    }
  }
  return _instance;
}

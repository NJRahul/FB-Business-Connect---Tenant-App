import type {
  CoverageType, RequirementRule, InsuranceApplication, InsuranceQuote,
  InsurancePolicy, PolicyDocument, InsuranceCertificate, InsuranceClaim,
  InsuranceDriver, RenewalTask, InsuranceCommission, TenantContext,
} from '../../../lib/insurance/types';

// ─── Coverage catalog ─────────────────────────────────────────────────────────

export const COVERAGE_TYPES: CoverageType[] = [
  { id: 'ct-gl',   code: 'GL',   display_name: 'General Liability',          plain_description: 'Covers bodily injury and property damage claims by third parties arising from your operations.',                              icon: 'shield',        distribution_mode: 'embedded_bind', typical_premium_low: 80000,  typical_premium_high: 250000, sort_order: 1,  active: true },
  { id: 'ct-bop',  code: 'BOP',  display_name: 'Business Owners Policy',     plain_description: 'Bundles general liability and commercial property into one policy — typically lower cost than buying separately.',             icon: 'package',       distribution_mode: 'embedded_bind', typical_premium_low: 120000, typical_premium_high: 380000, sort_order: 2,  active: true },
  { id: 'ct-gk',   code: 'GK',   display_name: 'Garage Keepers',             plain_description: 'Protects customer vehicles in your care, custody, or control — required if you service or store vehicles.',                  icon: 'car',           distribution_mode: 'embedded_bind', typical_premium_low: 180000, typical_premium_high: 600000, sort_order: 3,  active: true },
  { id: 'ct-auto', code: 'AUTO', display_name: 'Commercial Auto',            plain_description: 'Covers vehicles owned or operated by your business — employees driving for work purposes.',                                   icon: 'truck',         distribution_mode: 'embedded_bind', typical_premium_low: 150000, typical_premium_high: 500000, sort_order: 4,  active: true },
  { id: 'ct-im',   code: 'IM',   display_name: 'Inland Marine / Tools',      plain_description: 'Covers your tools, equipment, and inventory while in transit or at a job site.',                                             icon: 'wrench',        distribution_mode: 'embedded_bind', typical_premium_low: 60000,  typical_premium_high: 180000, sort_order: 5,  active: true },
  { id: 'ct-wc',   code: 'WC',   display_name: "Workers' Compensation",      plain_description: 'Required in most states when you have employees. Covers medical costs and lost wages for work-related injuries.',             icon: 'heart-handshake', distribution_mode: 'referral',       typical_premium_low: 200000, typical_premium_high: 800000, sort_order: 6,  active: true },
  { id: 'ct-cp',   code: 'CP',   display_name: 'Commercial Property',        plain_description: 'Covers your building, equipment, and inventory against fire, theft, vandalism, and weather damage.',                         icon: 'building-2',    distribution_mode: 'embedded_bind', typical_premium_low: 90000,  typical_premium_high: 320000, sort_order: 7,  active: true },
  { id: 'ct-cyber',code: 'CYB',  display_name: 'Cyber Liability',            plain_description: 'Covers costs from data breaches, ransomware attacks, and customer notification obligations.',                                  icon: 'wifi',          distribution_mode: 'embedded_bind', typical_premium_low: 50000,  typical_premium_high: 200000, sort_order: 8,  active: true },
  { id: 'ct-bond', code: 'BOND', display_name: 'Surety Bond / License Bond', plain_description: 'Required by many states for contractors and service businesses. Guarantees performance and legal compliance.',               icon: 'badge-check',   distribution_mode: 'referral',       typical_premium_low: 15000,  typical_premium_high: 60000,  sort_order: 9,  active: true },
  { id: 'ct-epli', code: 'EPLI', display_name: 'Employment Practices',       plain_description: 'Covers claims of wrongful termination, harassment, or discrimination by current or former employees.',                        icon: 'users',         distribution_mode: 'embedded_bind', typical_premium_low: 70000,  typical_premium_high: 240000, sort_order: 10, active: true },
  { id: 'ct-umb',  code: 'UMB',  display_name: 'Commercial Umbrella',        plain_description: 'Provides an extra layer of liability protection above your underlying policies for large claims.',                            icon: 'umbrella',      distribution_mode: 'embedded_bind', typical_premium_low: 40000,  typical_premium_high: 150000, sort_order: 11, active: true },
];

// ─── Requirement rules ─────────────────────────────────────────────────────────

export const REQUIREMENT_RULES: RequirementRule[] = [
  // GL — required for any business with premises
  { id: 'rr-01', coverage_type_id: 'ct-gl',   industry_packs: null,       operations_types: null,                     states: null, min_team_size: null, min_vehicle_count: null, has_premises: true,  requirement_level: 'required',         reason_text: 'Required by most commercial landlords and state law for businesses open to the public.',               source_url: null, effective_from: '2025-01-01', version: 1 },
  { id: 'rr-02', coverage_type_id: 'ct-gl',   industry_packs: null,       operations_types: null,                     states: null, min_team_size: null, min_vehicle_count: null, has_premises: false, requirement_level: 'commonly_carried',  reason_text: 'Strongly advised for mobile operations — protects against third-party claims at customer sites.',         source_url: null, effective_from: '2025-01-01', version: 1 },
  // GK — required for tires/auto shops
  { id: 'rr-03', coverage_type_id: 'ct-gk',   industry_packs: ['tires', 'auto'], operations_types: null,              states: null, min_team_size: null, min_vehicle_count: null, has_premises: null,  requirement_level: 'required',         reason_text: 'Required when customer vehicles are in your care, custody, or control for service.',                     source_url: null, effective_from: '2025-01-01', version: 1 },
  { id: 'rr-04', coverage_type_id: 'ct-gk',   industry_packs: null,       operations_types: ['in_shop', 'both'],      states: null, min_team_size: null, min_vehicle_count: null, has_premises: null,  requirement_level: 'commonly_carried',  reason_text: 'Standard coverage for any shop that services or stores vehicles overnight.',                              source_url: null, effective_from: '2025-01-01', version: 1 },
  // Commercial Auto
  { id: 'rr-05', coverage_type_id: 'ct-auto', industry_packs: null,       operations_types: ['mobile', 'both'],       states: null, min_team_size: null, min_vehicle_count: 1,    has_premises: null,  requirement_level: 'required',         reason_text: 'Required for any business-owned or operated vehicle used for commercial purposes.',                      source_url: null, effective_from: '2025-01-01', version: 1 },
  // Workers Comp
  { id: 'rr-06', coverage_type_id: 'ct-wc',   industry_packs: null,       operations_types: null,                     states: ['CA','NY','TX','FL','IL','WA','OH','PA','NJ','GA'], min_team_size: 1, min_vehicle_count: null, has_premises: null, requirement_level: 'required', reason_text: 'Legally required by state law when you have one or more employees.', source_url: null, effective_from: '2025-01-01', version: 1 },
  { id: 'rr-07', coverage_type_id: 'ct-wc',   industry_packs: null,       operations_types: null,                     states: null, min_team_size: 1,    min_vehicle_count: null, has_premises: null,  requirement_level: 'commonly_carried',  reason_text: 'Recommended when you have employees — protects against work-related injury claims.',                     source_url: null, effective_from: '2025-01-01', version: 1 },
  // Inland Marine
  { id: 'rr-08', coverage_type_id: 'ct-im',   industry_packs: null,       operations_types: ['mobile', 'both'],       states: null, min_team_size: null, min_vehicle_count: null, has_premises: null,  requirement_level: 'commonly_carried',  reason_text: 'Protects tools and equipment transported to and from job sites.',                                        source_url: null, effective_from: '2025-01-01', version: 1 },
  // Commercial Property
  { id: 'rr-09', coverage_type_id: 'ct-cp',   industry_packs: null,       operations_types: ['in_shop', 'both'],      states: null, min_team_size: null, min_vehicle_count: null, has_premises: true,  requirement_level: 'commonly_carried',  reason_text: 'Covers your building, inventory, and equipment from fire, theft, and weather events.',                   source_url: null, effective_from: '2025-01-01', version: 1 },
  // Surety Bond
  { id: 'rr-10', coverage_type_id: 'ct-bond', industry_packs: ['hvac','plumbing','electrical'], operations_types: null, states: null, min_team_size: null, min_vehicle_count: null, has_premises: null, requirement_level: 'required', reason_text: 'State contractor license requires a surety bond to operate legally.', source_url: null, effective_from: '2025-01-01', version: 1 },
  // EPLI
  { id: 'rr-11', coverage_type_id: 'ct-epli', industry_packs: null,       operations_types: null,                     states: null, min_team_size: 5,    min_vehicle_count: null, has_premises: null,  requirement_level: 'commonly_carried',  reason_text: 'As you grow your team, employment practices claims become more common.',                                 source_url: null, effective_from: '2025-01-01', version: 1 },
  // Umbrella
  { id: 'rr-12', coverage_type_id: 'ct-umb',  industry_packs: null,       operations_types: null,                     states: null, min_team_size: 10,   min_vehicle_count: null, has_premises: null,  requirement_level: 'commonly_carried',  reason_text: 'For larger operations, an umbrella policy provides important additional protection above underlying limits.', source_url: null, effective_from: '2025-01-01', version: 1 },
  // Cyber
  { id: 'rr-13', coverage_type_id: 'ct-cyber',industry_packs: null,       operations_types: null,                     states: null, min_team_size: null, min_vehicle_count: null, has_premises: null,  requirement_level: 'optional',         reason_text: 'Covers costs from data breaches and ransomware — relevant if you store customer payment or personal data.', source_url: null, effective_from: '2025-01-01', version: 1 },
];

// ─── Demo tenant context ──────────────────────────────────────────────────────

export const DEMO_TENANT_CONTEXT: TenantContext = {
  industry_pack: 'tires',
  operations_type: 'both',
  team_size: 8,
  location_count: 1,
  state: 'TX',
  vehicle_count: 3,
  has_premises: true,
};

// ─── Applications ─────────────────────────────────────────────────────────────

export const MOCK_APPLICATIONS: InsuranceApplication[] = [
  {
    id: 'app-demo-1',
    shop_id: 'shop-demo',
    coverage_type_ids: ['ct-gl', 'ct-gk'],
    status: 'quoted',
    answers_json: { business_years: 6, annual_revenue_cents: 85000000 },
    prefill_snapshot_json: { business_name: 'Acme Tire Shop', state: 'TX', team_size: 8 },
    partner_application_id: 'pa-acuity-10291',
    signed_at: '2026-09-10T10:30:00Z',
    signature_ip: '192.168.1.100',
    created_by: 'user-owner-1',
    submitted_at: '2026-09-10T10:30:00Z',
  },
];

// ─── Quotes ───────────────────────────────────────────────────────────────────

export const MOCK_QUOTES: InsuranceQuote[] = [
  {
    id: 'q-gl-1',
    application_id: 'app-demo-1',
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
    application_id: 'app-demo-1',
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
    application_id: 'app-demo-1',
    shop_id: 'shop-demo',
    coverage_type_id: 'ct-gl',
    carrier_name: 'Philadelphia Indemnity',
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
  {
    id: 'q-gk-1',
    application_id: 'app-demo-1',
    shop_id: 'shop-demo',
    coverage_type_id: 'ct-gk',
    carrier_name: 'Markel Insurance',
    carrier_rating: 'A',
    annual_premium: 284000,
    monthly_premium: 23667,
    limits_json: { per_occurrence: 10000000, aggregate: 30000000 },
    deductible: 100000,
    exclusions_json: ['Intentional acts', 'Racing damage'],
    valid_until: '2026-12-13',
    partner_quote_id: 'pq-markel-gk-001',
    selected_at: null,
  },
];

// ─── Policies ─────────────────────────────────────────────────────────────────

export const MOCK_POLICIES: InsurancePolicy[] = [
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

// ─── Policy documents ─────────────────────────────────────────────────────────

export const MOCK_DOCUMENTS: PolicyDocument[] = [
  { id: 'doc-1', policy_id: 'pol-gl-1', shop_id: 'shop-demo', doc_type: 'declarations', file_url: 'https://docs.fb-business-connect.app/dec/pol-gl-1-dec.pdf',    version: 1, uploaded_at: '2025-09-10T15:00:00Z' },
  { id: 'doc-2', policy_id: 'pol-gl-1', shop_id: 'shop-demo', doc_type: 'full_policy',  file_url: 'https://docs.fb-business-connect.app/pol/pol-gl-1-full.pdf',   version: 1, uploaded_at: '2025-09-10T15:05:00Z' },
  { id: 'doc-3', policy_id: 'pol-gk-1', shop_id: 'shop-demo', doc_type: 'declarations', file_url: 'https://docs.fb-business-connect.app/dec/pol-gk-1-dec.pdf',    version: 1, uploaded_at: '2025-09-01T12:00:00Z' },
  { id: 'doc-4', policy_id: 'pol-gl-1', shop_id: 'shop-demo', doc_type: 'invoice',      file_url: 'https://docs.fb-business-connect.app/inv/pol-gl-1-inv-oct.pdf', version: 2, uploaded_at: '2026-09-30T08:00:00Z' },
];

// ─── Certificates ─────────────────────────────────────────────────────────────

export const MOCK_CERTIFICATES: InsuranceCertificate[] = [
  {
    id: 'coi-1',
    shop_id: 'shop-demo',
    holder_name: 'Westfield Mall Management LLC',
    holder_address: '1200 William Nicol Drive, Fourways, GP 2055',
    holder_email: 'risk@westfieldmall.com',
    policy_ids_json: ['pol-gl-1', 'pol-gk-1'],
    additional_insured: 'Westfield Mall Management LLC',
    description_of_operations: 'Tire installation and service at leased commercial premises.',
    pdf_url: 'https://docs.fb-business-connect.app/coi/abc123def456.pdf',
    verify_token: 'abc123def456',
    fleet_account_id: null,
    issued_by: 'user-owner-1',
    issued_at: '2026-08-15T09:00:00Z',
    expires_at: '2026-09-13',
    reissue_required: true,
  },
];

// ─── Claims ───────────────────────────────────────────────────────────────────

export const MOCK_CLAIMS: InsuranceClaim[] = [
  {
    id: 'clm-1',
    shop_id: 'shop-demo',
    policy_id: 'pol-gl-1',
    coverage_name: 'General Liability',
    claim_number: 'CLM-2026-881422',
    loss_type: 'property_damage',
    loss_datetime: '2026-08-14T14:30:00Z',
    location_json: { address: '48 Rivonia Road, Sandton, GP 2196', lat: 32.802, lng: -96.812 },
    description: 'Customer vehicle sustained minor damage to front bumper while being moved in the parking lot.',
    parties_json: [{ name: 'John Martinez', contact: '214-555-0192', role: 'claimant' }],
    injuries: false,
    police_report_number: null,
    visit_id: 'v-99821',
    order_id: 'ord-88142',
    status: 'investigating',
    adjuster_name: 'Sarah Mitchell',
    adjuster_contact: 'smitchell@acuity.com',
    reserve_amount: 250000,
    payout_amount: 0,
    reported_at: '2026-08-14T16:00:00Z',
    closed_at: null,
  },
];

// ─── Drivers ─────────────────────────────────────────────────────────────────

export const MOCK_DRIVERS: InsuranceDriver[] = [
  { id: 'drv-1', shop_id: 'shop-demo', user_id: 'user-owner-1', full_name: 'Marcus Thompson',  license_number: 'TX-DL-8821441', license_state: 'TX', license_expiry: '2028-03-15', mvr_consent_at: '2026-01-10T09:00:00Z', status: 'active' },
  { id: 'drv-2', shop_id: 'shop-demo', user_id: 'user-tech-1',  full_name: 'Rosa Calderon',    license_number: 'TX-DL-5610922', license_state: 'TX', license_expiry: '2027-11-20', mvr_consent_at: '2026-01-10T09:05:00Z', status: 'active' },
  { id: 'drv-3', shop_id: 'shop-demo', user_id: null,           full_name: 'David Kim',        license_number: 'TX-DL-3391845', license_state: 'TX', license_expiry: '2029-06-30', mvr_consent_at: null,                   status: 'pending_mvr' },
];

// ─── Renewals ─────────────────────────────────────────────────────────────────

export const MOCK_RENEWAL_TASKS: RenewalTask[] = [
  { id: 'ren-1', policy_id: 'pol-gk-1', shop_id: 'shop-demo', remind_at: '2026-07-03', days_before_expiry: 60, channel: 'in_app', sent_at: '2026-07-03T08:00:00Z', status: 'sent' },
  { id: 'ren-2', policy_id: 'pol-gk-1', shop_id: 'shop-demo', remind_at: '2026-08-02', days_before_expiry: 30, channel: 'email', sent_at: '2026-08-02T08:00:00Z', status: 'sent' },
  { id: 'ren-3', policy_id: 'pol-gk-1', shop_id: 'shop-demo', remind_at: '2026-08-18', days_before_expiry: 14, channel: 'email', sent_at: null,                    status: 'pending' },
  { id: 'ren-4', policy_id: 'pol-gl-1', shop_id: 'shop-demo', remind_at: '2026-07-14', days_before_expiry: 60, channel: 'in_app', sent_at: '2026-07-14T08:00:00Z', status: 'sent' },
  { id: 'ren-5', policy_id: 'pol-gl-1', shop_id: 'shop-demo', remind_at: '2026-08-13', days_before_expiry: 30, channel: 'email', sent_at: null,                    status: 'pending' },
];

// ─── Commissions ─────────────────────────────────────────────────────────────

export const MOCK_COMMISSIONS: InsuranceCommission[] = [
  { id: 'com-1', policy_id: 'pol-gl-1', carrier_name: 'Acuity Insurance',   premium: 142000, commission_rate: 12.5, expected_amount: 17750, received_amount: 17750, period: '2025-09', status: 'reconciled' },
  { id: 'com-2', policy_id: 'pol-gk-1', carrier_name: 'Markel Insurance',   premium: 284000, commission_rate: 10.0, expected_amount: 28400, received_amount: 28400, period: '2025-09', status: 'reconciled' },
  { id: 'com-3', policy_id: 'pol-gl-1', carrier_name: 'Acuity Insurance',   premium: 142000, commission_rate: 12.5, expected_amount: 17750, received_amount: 0,     period: '2026-09', status: 'pending'    },
];

// ─── Admin platform funnel ───────────────────────────────────────────────────

export const ADMIN_FUNNEL = [
  { label: 'Eligible tenants',        count: 2214, pct: 100 },
  { label: 'Catalog viewed',          count: 1489, pct: 67  },
  { label: 'Application started',     count: 821,  pct: 37  },
  { label: 'Submitted',               count: 688,  pct: 31  },
  { label: 'Quoted',                  count: 605,  pct: 27  },
  { label: 'Bound (at least 1 policy)', count: 412, pct: 19 },
];

export const ADMIN_TENANTS = [
  { id: 'shop1', name: 'Acme Tire Shop',     policies: 2, annual_premium: 426000, commission: 46150, status: 'active'   },
  { id: 'shop2', name: 'Metro HVAC',         policies: 1, annual_premium: 196000, commission: 24500, status: 'active'   },
  { id: 'shop3', name: 'GreenLawn Care',     policies: 0, annual_premium: 0,      commission: 0,     status: 'quoted'   },
  { id: 'shop4', name: 'QuickFix Electric',  policies: 3, annual_premium: 718000, commission: 82070, status: 'active'   },
  { id: 'shop5', name: 'Speedy Lube Center', policies: 0, annual_premium: 0,      commission: 0,     status: 'declined' },
];

export const ADMIN_CARRIERS = [
  { name: 'Acuity Insurance',        rating: 'A+',  bound: 184, avg_premium: 168000, loss_ratio: 0.41, on_time_pct: 98 },
  { name: 'Markel Insurance',        rating: 'A',   bound: 142, avg_premium: 214000, loss_ratio: 0.38, on_time_pct: 96 },
  { name: 'Philadelphia Indemnity',  rating: 'A++', bound: 86,  avg_premium: 247000, loss_ratio: 0.35, on_time_pct: 99 },
  { name: 'ICW Group',               rating: 'A',   bound: 71,  avg_premium: 398000, loss_ratio: 0.44, on_time_pct: 94 },
];

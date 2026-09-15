import { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2, Circle, Building2, MapPin, Clock, CreditCard, Package,
  Wrench, DollarSign, Users, Rocket, ChevronRight, ChevronLeft, Plus,
  X, ExternalLink, Upload, Check, AlertCircle, Phone, Mail, Briefcase,
  Truck, Home, Bell, Palette, Globe, Copy, Lock, Star, Eye, EyeOff,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────

type OperationsType = 'mobile' | 'inshop' | 'both' | null;

interface ServiceTypeRow {
  id: string;
  name: string;
  duration: number;
  price: number;
  pattern: 'Parts-Install' | 'No-Parts';
  checked: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface TenantData {
  businessName: string;
  ownerName: string;
  email: string;
  planTier: 'starter' | 'pro' | 'enterprise';
}

interface OnboardingWizardProps {
  tenant: TenantData;
  onComplete: () => void;
}

interface WizardState {
  // Step 1
  industryPack: string | null;
  industryLabel: string;
  // Step 2
  legalName: string;
  displayName: string;
  legalEntity: string;
  ein: string;
  address: string;
  city: string;
  stateCode: string;
  zip: string;
  phone: string;
  supportEmail: string;
  website: string;
  yearEstablished: string;
  serviceBays: string;
  teamSize: string;
  // Step 3
  operationsType: OperationsType;
  serviceAreaType: 'zips' | 'radius';
  serviceZips: string[];
  zipInput: string;
  serviceRadius: string;
  locationCount: string;
  // Step 4
  hours: Record<string, { open: string; close: string; closed: boolean; break: boolean; breakStart: string; breakEnd: string }>;
  emergencyHours: boolean;
  weekendService: boolean;
  timezone: string;
  holidays: string[];
  // Step 5
  stripeConnected: boolean;
  // Step 6
  catalogSource: 'distributor' | 'local' | 'both' | null;
  connectedDistributors: string[];
  // Step 7
  serviceTypes: ServiceTypeRow[];
  // Step 8
  taxRate: string;
  disposalFeeEnabled: boolean;
  disposalFeeAmount: string;
  calloutFeeEnabled: boolean;
  calloutFeeAmount: string;
  calloutFeeThreshold: string;
  depositPolicy: 'full' | 'deposit' | 'completion';
  depositPercent: string;
  // Step 9
  teamMembers: TeamMember[];
  techInput: { name: string; email: string; role: string };
  // Industry-specific
  licenseNumber: string;
  insurancePolicy: string;
  certType: string;
  // Bank Account step
  bankAccountName: string;
  bankName: string;
  bankAccountNumber: string;
  bankBranchCode: string;
  bankAccountType: string;
  cipcNumber: string;
  bankSkipped: boolean;
  // Step 10
  brandColor: string;
  tagline: string;
  businessDescription: string;
  serviceAreaText: string;
  // Step 11
  published: boolean;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const US_STATES = ['GP','WC','KZN','EC','FS','LP','MP','NC','NW'];
const US_TIMEZONES = [
  { value: 'Africa/Johannesburg', label: 'South Africa Standard Time (SAST)' },
];
const FEDERAL_HOLIDAYS = [
  "New Year's Day — Jan 1", "Human Rights Day — Mar 21", "Freedom Day — Apr 27",
  "Workers' Day — May 1", "Youth Day — Jun 16", "National Women's Day — Aug 9",
  "Heritage Day — Sep 24", "Day of Reconciliation — Dec 16", "Christmas Day — Dec 25", "Day of Goodwill — Dec 26",
];
const DISTRIBUTORS = [
  { id: 'atd', name: 'ATD — American Tire Distributors', logo: '🚛' },
  { id: 'tirehub', name: 'TireHub', logo: '🏭' },
  { id: 'ndc', name: 'National Tire Distributors', logo: '📦' },
  { id: 'tbc', name: 'TBC Wholesale', logo: '🔄' },
];

const SERVICE_SEEDS: Record<string, ServiceTypeRow[]> = {
  tires_mobile: [
    { id: 'tm1', name: '4-Tire Installation (with M&B)', duration: 90, price: 0, pattern: 'Parts-Install', checked: true },
    { id: 'tm2', name: '2-Tire Installation (with M&B)', duration: 60, price: 0, pattern: 'Parts-Install', checked: true },
    { id: 'tm3', name: 'Single Tire Replacement', duration: 30, price: 0, pattern: 'Parts-Install', checked: true },
    { id: 'tm4', name: 'Tire Rotation', duration: 30, price: 35, pattern: 'No-Parts', checked: true },
    { id: 'tm5', name: 'TPMS Reset', duration: 15, price: 25, pattern: 'No-Parts', checked: true },
    { id: 'tm6', name: 'Mobile Flat Repair', duration: 45, price: 85, pattern: 'Parts-Install', checked: true },
    { id: 'tm7', name: 'Battery Replacement', duration: 30, price: 149, pattern: 'Parts-Install', checked: false },
    { id: 'tm8', name: 'Oil Change', duration: 45, price: 79, pattern: 'Parts-Install', checked: false },
  ],
  tires_inshop: [
    { id: 'ti1', name: '4-Tire Installation (with M&B)', duration: 90, price: 0, pattern: 'Parts-Install', checked: true },
    { id: 'ti2', name: '2-Tire Installation (with M&B)', duration: 60, price: 0, pattern: 'Parts-Install', checked: true },
    { id: 'ti3', name: 'Tire Rotation', duration: 30, price: 35, pattern: 'No-Parts', checked: true },
    { id: 'ti4', name: 'Flat Repair', duration: 30, price: 45, pattern: 'Parts-Install', checked: true },
    { id: 'ti5', name: 'TPMS Service', duration: 20, price: 25, pattern: 'No-Parts', checked: true },
    { id: 'ti6', name: 'Wheel Alignment', duration: 60, price: 99, pattern: 'No-Parts', checked: false },
    { id: 'ti7', name: 'Oil Change', duration: 45, price: 79, pattern: 'Parts-Install', checked: false },
  ],
  hvac: [
    { id: 'hv1', name: 'AC Installation', duration: 240, price: 1200, pattern: 'Parts-Install', checked: true },
    { id: 'hv2', name: 'Furnace Installation', duration: 180, price: 1500, pattern: 'Parts-Install', checked: true },
    { id: 'hv3', name: 'AC Tune-Up', duration: 60, price: 149, pattern: 'No-Parts', checked: true },
    { id: 'hv4', name: 'Emergency HVAC Repair', duration: 120, price: 299, pattern: 'Parts-Install', checked: true },
    { id: 'hv5', name: 'Filter Replacement', duration: 30, price: 79, pattern: 'Parts-Install', checked: true },
    { id: 'hv6', name: 'Heat Pump Installation', duration: 240, price: 1800, pattern: 'Parts-Install', checked: false },
    { id: 'hv7', name: 'Thermostat Replacement', duration: 60, price: 199, pattern: 'Parts-Install', checked: false },
    { id: 'hv8', name: 'Duct Cleaning', duration: 120, price: 399, pattern: 'No-Parts', checked: false },
  ],
  electrical: [
    { id: 'el1', name: 'Panel Upgrade (200A)', duration: 240, price: 1800, pattern: 'Parts-Install', checked: true },
    { id: 'el2', name: 'Outlet Installation', duration: 60, price: 199, pattern: 'Parts-Install', checked: true },
    { id: 'el3', name: 'Ceiling Fan Installation', duration: 90, price: 249, pattern: 'Parts-Install', checked: true },
    { id: 'el4', name: 'Light Fixture Install', duration: 45, price: 149, pattern: 'Parts-Install', checked: true },
    { id: 'el5', name: 'EV Charger Install (Level 2)', duration: 120, price: 699, pattern: 'Parts-Install', checked: true },
    { id: 'el6', name: 'GFCI Replacement', duration: 30, price: 99, pattern: 'Parts-Install', checked: true },
    { id: 'el7', name: 'Smoke Detector Install', duration: 30, price: 79, pattern: 'Parts-Install', checked: false },
    { id: 'el8', name: 'Emergency Electrical', duration: 120, price: 349, pattern: 'Parts-Install', checked: false },
  ],
  plumbing: [
    { id: 'pl1', name: 'Drain Cleaning', duration: 60, price: 149, pattern: 'Parts-Install', checked: true },
    { id: 'pl2', name: 'Toilet Replacement', duration: 90, price: 349, pattern: 'Parts-Install', checked: true },
    { id: 'pl3', name: 'Faucet Installation', duration: 60, price: 249, pattern: 'Parts-Install', checked: true },
    { id: 'pl4', name: 'Water Heater Install', duration: 180, price: 1200, pattern: 'Parts-Install', checked: true },
    { id: 'pl5', name: 'Pipe Repair / Replacement', duration: 120, price: 399, pattern: 'Parts-Install', checked: true },
    { id: 'pl6', name: 'Garbage Disposal Install', duration: 60, price: 249, pattern: 'Parts-Install', checked: false },
    { id: 'pl7', name: 'Emergency Leak Repair', duration: 120, price: 299, pattern: 'Parts-Install', checked: false },
    { id: 'pl8', name: 'Sewer Line Inspection', duration: 60, price: 199, pattern: 'No-Parts', checked: false },
  ],
  cleaning: [
    { id: 'cl1', name: 'Standard Home Cleaning', duration: 120, price: 149, pattern: 'No-Parts', checked: true },
    { id: 'cl2', name: 'Deep Cleaning', duration: 240, price: 299, pattern: 'No-Parts', checked: true },
    { id: 'cl3', name: 'Move-In / Move-Out Clean', duration: 300, price: 399, pattern: 'No-Parts', checked: true },
    { id: 'cl4', name: 'Post-Construction Clean', duration: 240, price: 499, pattern: 'No-Parts', checked: false },
    { id: 'cl5', name: 'Office Cleaning', duration: 120, price: 199, pattern: 'No-Parts', checked: false },
    { id: 'cl6', name: 'Window Cleaning', duration: 90, price: 149, pattern: 'No-Parts', checked: false },
    { id: 'cl7', name: 'Carpet Cleaning', duration: 120, price: 199, pattern: 'No-Parts', checked: false },
  ],
  pest_control: [
    { id: 'pc1', name: 'General Pest Treatment', duration: 60, price: 149, pattern: 'No-Parts', checked: true },
    { id: 'pc2', name: 'Termite Inspection', duration: 90, price: 199, pattern: 'No-Parts', checked: true },
    { id: 'pc3', name: 'Rodent Control Setup', duration: 60, price: 249, pattern: 'Parts-Install', checked: true },
    { id: 'pc4', name: 'Mosquito Treatment', duration: 45, price: 99, pattern: 'No-Parts', checked: true },
    { id: 'pc5', name: 'Bed Bug Treatment', duration: 120, price: 399, pattern: 'Parts-Install', checked: false },
    { id: 'pc6', name: 'Ant & Roach Treatment', duration: 60, price: 129, pattern: 'No-Parts', checked: false },
    { id: 'pc7', name: 'Termite Treatment', duration: 180, price: 1200, pattern: 'Parts-Install', checked: false },
  ],
  carpentry: [
    { id: 'ca1', name: 'Custom Cabinet Installation', duration: 240, price: 2500, pattern: 'Parts-Install', checked: true },
    { id: 'ca2', name: 'Door Installation', duration: 120, price: 850, pattern: 'Parts-Install', checked: true },
    { id: 'ca3', name: 'Shelving & Storage Build', duration: 180, price: 1200, pattern: 'Parts-Install', checked: true },
    { id: 'ca4', name: 'Deck Construction', duration: 480, price: 6500, pattern: 'Parts-Install', checked: true },
    { id: 'ca5', name: 'Flooring Installation', duration: 300, price: 3500, pattern: 'Parts-Install', checked: false },
    { id: 'ca6', name: 'Window Frame Repair', duration: 90, price: 650, pattern: 'Parts-Install', checked: false },
    { id: 'ca7', name: 'Furniture Assembly', duration: 60, price: 350, pattern: 'No-Parts', checked: false },
    { id: 'ca8', name: 'Trim & Moulding Install', duration: 120, price: 900, pattern: 'Parts-Install', checked: false },
  ],
  salon: [
    { id: 'sl1', name: 'Haircut & Style', duration: 45, price: 350, pattern: 'No-Parts', checked: true },
    { id: 'sl2', name: 'Colour Treatment', duration: 120, price: 950, pattern: 'Parts-Install', checked: true },
    { id: 'sl3', name: 'Highlights / Balayage', duration: 150, price: 1400, pattern: 'Parts-Install', checked: true },
    { id: 'sl4', name: 'Blow-Dry & Finish', duration: 45, price: 280, pattern: 'No-Parts', checked: true },
    { id: 'sl5', name: 'Keratin Treatment', duration: 180, price: 1800, pattern: 'Parts-Install', checked: false },
    { id: 'sl6', name: 'Manicure & Pedicure', duration: 60, price: 450, pattern: 'Parts-Install', checked: false },
    { id: 'sl7', name: 'Eyebrow Shaping & Tint', duration: 30, price: 200, pattern: 'No-Parts', checked: false },
    { id: 'sl8', name: 'Facial Treatment', duration: 60, price: 650, pattern: 'Parts-Install', checked: false },
  ],
  consulting: [
    { id: 'co1', name: 'Initial Consultation (1 hr)', duration: 60, price: 1500, pattern: 'No-Parts', checked: true },
    { id: 'co2', name: 'Strategy Workshop (Half Day)', duration: 240, price: 8500, pattern: 'No-Parts', checked: true },
    { id: 'co3', name: 'Strategy Workshop (Full Day)', duration: 480, price: 15000, pattern: 'No-Parts', checked: true },
    { id: 'co4', name: 'Monthly Retainer', duration: 0, price: 25000, pattern: 'No-Parts', checked: true },
    { id: 'co5', name: 'Project Assessment & Report', duration: 120, price: 6500, pattern: 'No-Parts', checked: false },
    { id: 'co6', name: 'Training Session (Group)', duration: 180, price: 5000, pattern: 'No-Parts', checked: false },
    { id: 'co7', name: 'Coaching Session (1-on-1)', duration: 60, price: 2200, pattern: 'No-Parts', checked: false },
  ],
  healthcare: [
    { id: 'hc1', name: 'General Consultation', duration: 30, price: 650, pattern: 'No-Parts', checked: true },
    { id: 'hc2', name: 'Follow-Up Appointment', duration: 20, price: 350, pattern: 'No-Parts', checked: true },
    { id: 'hc3', name: 'Health Screening', duration: 60, price: 1200, pattern: 'No-Parts', checked: true },
    { id: 'hc4', name: 'Physiotherapy Session', duration: 45, price: 850, pattern: 'No-Parts', checked: false },
    { id: 'hc5', name: 'Chronic Disease Management', duration: 45, price: 750, pattern: 'No-Parts', checked: false },
    { id: 'hc6', name: 'Home Visit Consultation', duration: 60, price: 1500, pattern: 'No-Parts', checked: false },
    { id: 'hc7', name: 'Vaccination / Injection', duration: 15, price: 280, pattern: 'Parts-Install', checked: false },
  ],
  education: [
    { id: 'ed1', name: 'Individual Tutoring (1 hr)', duration: 60, price: 450, pattern: 'No-Parts', checked: true },
    { id: 'ed2', name: 'Group Class (Up to 10)', duration: 90, price: 1200, pattern: 'No-Parts', checked: true },
    { id: 'ed3', name: 'Online Course Enrolment', duration: 0, price: 2500, pattern: 'No-Parts', checked: true },
    { id: 'ed4', name: 'Exam Preparation Pack (4 sessions)', duration: 240, price: 1600, pattern: 'No-Parts', checked: false },
    { id: 'ed5', name: 'Workshop (Half Day)', duration: 240, price: 1800, pattern: 'No-Parts', checked: false },
    { id: 'ed6', name: 'Monthly Subscription (Unlimited Classes)', duration: 0, price: 2200, pattern: 'No-Parts', checked: false },
    { id: 'ed7', name: 'Corporate Training Session', duration: 180, price: 8500, pattern: 'No-Parts', checked: false },
  ],
  generic: [],
};

const INDUSTRY_CARDS = [
  { id: 'tires_mobile', label: 'Mobile Tire Service', icon: '🔧', desc: 'Sell tires, dispatch techs to customer locations', active: true, ops: 'mobile' as OperationsType },
  { id: 'tires_inshop', label: 'In-Shop Tire Service', icon: '🏪', desc: 'Tire retail + service bay management', active: true, ops: 'inshop' as OperationsType },
  { id: 'hvac', label: 'HVAC', icon: '❄️', desc: 'Install, repair, and maintenance plans', active: true, ops: 'mobile' as OperationsType },
  { id: 'electrical', label: 'Electrical', icon: '⚡', desc: 'Code compliance, permit tracking', active: true, ops: 'mobile' as OperationsType },
  { id: 'plumbing', label: 'Plumbing', icon: '🔩', desc: 'Parts-install + on-demand jobs', active: true, ops: 'mobile' as OperationsType },
  { id: 'cleaning', label: 'Cleaning', icon: '🧹', desc: 'Recurring routes, team dispatch', active: true, ops: 'mobile' as OperationsType },
  { id: 'pest_control', label: 'Pest Control', icon: '🐛', desc: 'Recurring routes, chemical management', active: true, ops: 'mobile' as OperationsType },
  { id: 'carpentry', label: 'Carpentry', icon: '🪚', desc: 'Custom builds, installations, renovations', active: true, ops: 'mobile' as OperationsType },
  { id: 'salon', label: 'Salon & Beauty', icon: '💇', desc: 'Appointments, stylists, product retail', active: true, ops: 'inshop' as OperationsType },
  { id: 'consulting', label: 'Consulting', icon: '💼', desc: 'Sessions, retainers, workshops', active: true, ops: 'inshop' as OperationsType },
  { id: 'healthcare', label: 'Healthcare', icon: '🏥', desc: 'Appointments, patient records, home visits', active: true, ops: 'both' as OperationsType },
  { id: 'education', label: 'Education', icon: '🎓', desc: 'Tutoring, classes, online courses', active: true, ops: 'both' as OperationsType },
  { id: 'lawn_care', label: 'Lawn Care', icon: '🌿', desc: 'Mowing, aeration, seasonal programs', active: false },
  { id: 'painting', label: 'Painting', icon: '🎨', desc: 'Quote-to-job, phase management', active: false },
  { id: 'roofing', label: 'Roofing', icon: '🏠', desc: 'Inspect-quote-job, material tracking', active: false },
  { id: 'pool_service', label: 'Pool Service', icon: '🏊', desc: 'Chemical logs, seasonal plans', active: false },
];

const STEPS = [
  { id: 1,  label: 'Industry',        icon: Briefcase,  time: '1 min', required: false },
  { id: 2,  label: 'Business Profile', icon: Building2,  time: '3 min', required: false },
  { id: 3,  label: 'Service Area',     icon: MapPin,     time: '2 min', required: false },
  { id: 4,  label: 'Business Hours',   icon: Clock,      time: '2 min', required: false },
  { id: 5,  label: 'Bank Account',     icon: Building2,  time: '3 min', required: false },
  { id: 6,  label: 'Payout Setup',     icon: CreditCard, time: '5 min', required: true  },
  { id: 7,  label: 'Catalog Setup',    icon: Package,    time: '3 min', required: true  },
  { id: 8,  label: 'Service Types',    icon: Wrench,     time: '3 min', required: false },
  { id: 9,  label: 'Pricing & Fees',   icon: DollarSign, time: '3 min', required: false },
  { id: 10, label: 'Team Setup',       icon: Users,      time: '2 min', required: false },
  { id: 11, label: 'Branding',         icon: Palette,    time: '3 min', required: false },
  { id: 12, label: 'Publish',          icon: Rocket,     time: '1 min', required: false },
];

const DEFAULT_HOURS = Object.fromEntries(DAYS.map((d, i) => [d, {
  open: '08:00', close: '17:00', closed: i === 6,
  break: false, breakStart: '12:00', breakEnd: '13:00',
}]));

const inp: React.CSSProperties = {
  border: '1.5px solid #E5E7EB', borderRadius: '6px', padding: '8px 12px',
  fontSize: '0.9375rem', color: '#1A1A1A', outline: 'none', background: '#fff', width: '100%',
};

// ─── Confetti ───────────────────────────────────────────────────────────────

function fireConfetti() {
  const colors = ['#00A9AC', '#FA9D1E', '#ffffff', '#00BFC3', '#FFD08A'];
  const fire = (particleRatio: number, opts: object) => {
    const count = 200;
    (window as any).confetti?.({
      origin: { y: 0.7 },
      colors,
      particleCount: Math.floor(count * particleRatio),
      ...opts,
    });
  };
  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function OnboardingWizard({ tenant, onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [state, setState] = useState<WizardState>({
    industryPack: null, industryLabel: '',
    legalName: tenant.businessName, displayName: tenant.businessName,
    legalEntity: 'Private Company (Pty) Ltd', ein: '', address: '', city: '', stateCode: 'GP', zip: '',
    phone: '', supportEmail: tenant.email, website: '', yearEstablished: '',
    serviceBays: '', teamSize: '',
    operationsType: null, serviceAreaType: 'zips', serviceZips: [], zipInput: '',
    serviceRadius: '25', locationCount: '1',
    hours: DEFAULT_HOURS, emergencyHours: false, weekendService: false,
    timezone: 'Africa/Johannesburg', holidays: FEDERAL_HOLIDAYS.slice(0, 4),
    stripeConnected: false,
    catalogSource: null, connectedDistributors: [],
    serviceTypes: [],
    taxRate: '8.25', disposalFeeEnabled: true, disposalFeeAmount: '5',
    calloutFeeEnabled: false, calloutFeeAmount: '75', calloutFeeThreshold: '250',
    depositPolicy: 'full', depositPercent: '25',
    teamMembers: [], techInput: { name: '', email: '', role: 'Technician' },
    licenseNumber: '', insurancePolicy: '', certType: '',
    bankAccountName: '', bankName: '', bankAccountNumber: '', bankBranchCode: '', bankAccountType: 'Cheque / Current', cipcNumber: '', bankSkipped: false,
    brandColor: '#00A9AC', tagline: '', businessDescription: '',
    serviceAreaText: '', published: false,
  });

  const markComplete = (step: number) => setCompletedSteps(prev => new Set([...prev, step]));
  const goNext = () => { markComplete(currentStep); if (currentStep < 12) setCurrentStep(s => s + 1); };
  const goBack = () => { if (currentStep > 1) setCurrentStep(s => s - 1); };

  const isTireInMain = state.industryPack?.startsWith('tires');
  const canPublish = state.stripeConnected && (
    isTireInMain
      ? (state.connectedDistributors.length > 0 || state.catalogSource === 'local' || state.catalogSource === 'both')
      : !!state.catalogSource
  );

  const slug = (state.displayName || tenant.businessName)
    .toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 20) || 'yourshop';

  const stepInfo = STEPS[currentStep - 1];
  const remaining = STEPS.filter(s => !completedSteps.has(s.id) && s.id > currentStep)
    .reduce((a, s) => a + parseInt(s.time), 0);


  const setStateField = <K extends keyof WizardState>(key: K, val: WizardState[K]) =>
    setState(s => ({ ...s, [key]: val }));

  const renderStep = () => {
    switch (currentStep) {
      case 1:  return <Step1 state={state} setState={setState} setStateField={setStateField} goNext={goNext} />;
      case 2:  return <Step2 state={state} setState={setState} tenant={tenant} />;
      case 3:  return <Step3 state={state} setState={setState} />;
      case 4:  return <Step4 state={state} setState={setState} />;
      case 5:  return <StepBankAccount state={state} setState={setState} />;
      case 6:  return <Step5 state={state} setState={setState} />;
      case 7:  return <Step6 state={state} setState={setState} />;
      case 8:  return <Step7 state={state} setState={setState} />;
      case 9:  return <Step8 state={state} setState={setState} />;
      case 10: return <Step9 state={state} setState={setState} />;
      case 11: return <Step10 state={state} setState={setState} slug={slug} />;
      case 12: return <Step11 state={state} canPublish={canPublish} slug={slug}
        onPublish={() => { setState(s => ({ ...s, published: true })); markComplete(12); }} onComplete={onComplete} />;
      default: return null;
    }
  };

  if (state.published) {
    return <PublishSuccess slug={slug} state={state} onComplete={onComplete} />;
  }

  return (
    <div className="h-screen flex overflow-hidden" style={{ fontFamily: 'Inter, sans-serif', background: '#F9FAFB' }}>
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 xl:w-64 bg-white border-r shrink-0 overflow-y-auto" style={{ borderColor: '#E5E7EB' }}>
        <div className="p-4 border-b flex items-center gap-2.5" style={{ borderColor: '#E5E7EB' }}>
          <div className="w-8 h-8 rounded-[6px] flex items-center justify-center shrink-0" style={{ background: '#00A9AC' }}>
            <Wrench size={16} color="#fff" />
          </div>
          <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.0625rem' }}>FB Business Connect</span>
        </div>

        <div className="p-4 border-b" style={{ borderColor: '#E5E7EB' }}>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${(completedSteps.size / 12) * 100}%`, background: '#00A9AC' }} />
          </div>
          <p className="mt-1.5" style={{ color: '#9CA3AF', fontSize: '0.6875rem' }}>
            {completedSteps.size}/12 steps · ~{remaining} min left
          </p>
        </div>

        <nav className="flex-1 p-2 overflow-y-auto">
          {STEPS.map(step => {
            const Icon = step.icon;
            const isDone = completedSteps.has(step.id);
            const isActive = currentStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-left transition-colors mb-0.5"
                style={{ background: isActive ? '#E6F7F7' : 'transparent', color: isActive ? '#00A9AC' : isDone ? '#27AE60' : '#6B7280' }}
              >
                <span className="w-4.5 h-4.5 shrink-0 flex items-center justify-center">
                  {isDone
                    ? <CheckCircle2 size={16} style={{ color: '#27AE60' }} />
                    : isActive
                      ? <span className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center" style={{ borderColor: '#00A9AC' }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: '#00A9AC' }} /></span>
                      : <Circle size={16} style={{ color: '#D1D5DB' }} />
                  }
                </span>
                <div className="flex-1 min-w-0 flex items-center justify-between gap-1">
                  <span style={{ fontSize: '0.8125rem', fontWeight: isActive ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{step.label}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    {step.required && <span className="px-1 py-0.5 rounded" style={{ background: '#E6F7F7', color: '#DC2626', fontSize: '0.5rem', fontWeight: 700 }}>REQ</span>}
                    <span style={{ fontSize: '0.625rem', color: '#D1D5DB' }}>{step.time}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: '#E5E7EB' }}>
          <div className="p-2.5 rounded-[6px]" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
            <p style={{ fontSize: '0.6875rem', color: '#9CA3AF' }}>Signed in as</p>
            <p style={{ fontSize: '0.8125rem', color: '#1A1A1A', fontWeight: 600, marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tenant.businessName || 'Your Shop'}</p>
            <p style={{ fontSize: '0.6875rem', color: '#9CA3AF', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tenant.email}</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile stepper */}
        <div className="lg:hidden flex overflow-x-auto px-3 py-2.5 gap-1.5 bg-white border-b" style={{ borderColor: '#E5E7EB' }}>
          {STEPS.map(step => {
            const isDone = completedSteps.has(step.id);
            const isActive = currentStep === step.id;
            return (
              <button key={step.id} onClick={() => setCurrentStep(step.id)} className="shrink-0 flex flex-col items-center gap-0.5">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: isDone ? '#27AE60' : isActive ? '#00A9AC' : '#E5E7EB', color: isDone || isActive ? '#fff' : '#9CA3AF' }}>
                  {isDone ? <Check size={11} /> : step.id}
                </span>
                <span style={{ fontSize: '0.5625rem', color: isActive ? '#00A9AC' : '#9CA3AF', whiteSpace: 'nowrap' }}>{step.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Step header */}
        <div className="bg-white border-b px-5 lg:px-8 py-4" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex items-center justify-between w-full">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>Step {currentStep} of 12</span>
                {stepInfo.required && (
                  <span className="px-1.5 py-0.5 rounded" style={{ background: '#E6F7F7', color: '#DC2626', fontSize: '0.6875rem', fontWeight: 600 }}>Required to publish</span>
                )}
                {state.industryPack && currentStep > 1 && (
                  <span className="px-1.5 py-0.5 rounded" style={{ background: '#F3F4F6', color: '#6B7280', fontSize: '0.6875rem', fontWeight: 600 }}>
                    {INDUSTRY_CARDS.find(c => c.id === state.industryPack)?.icon} {state.industryLabel}
                  </span>
                )}
              </div>
              <h2 style={{ fontFamily: 'Sora, sans-serif', color: '#1A1A1A', fontSize: '1.25rem', fontWeight: 700 }}>{stepInfo.label}</h2>
            </div>
            <span className="hidden sm:inline" style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>~{stepInfo.time}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 lg:p-8">
          <div className="w-full">
            {renderStep()}
          </div>
        </div>

        {/* Footer nav (not shown on publish screen) */}
        {currentStep < 12 && (
          <div className="bg-white border-t px-5 lg:px-8 py-3.5 flex items-center justify-between" style={{ borderColor: '#E5E7EB' }}>
            <button
              onClick={goBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-4 py-2 rounded-[6px]"
              style={{ border: '1.5px solid #E5E7EB', color: currentStep === 1 ? '#D1D5DB' : '#6B7280', background: '#fff', fontSize: '0.9375rem', cursor: currentStep === 1 ? 'default' : 'pointer' }}
            >
              <ChevronLeft size={16} /> Back
            </button>
            <div className="flex items-center gap-3">
              {currentStep > 1 && !stepInfo.required && (
                <button onClick={goNext} className="px-3 py-2" style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Skip for now</button>
              )}
              <button
                onClick={goNext}
                disabled={currentStep === 1 && !state.industryPack}
                className="flex items-center gap-2 px-5 py-2.5 rounded-[6px] text-white transition-colors"
                style={{ background: currentStep === 1 && !state.industryPack ? '#D1D5DB' : '#00A9AC', fontWeight: 600, fontSize: '0.9375rem', cursor: currentStep === 1 && !state.industryPack ? 'not-allowed' : 'pointer' }}
                onMouseEnter={e => { if (!(currentStep === 1 && !state.industryPack)) e.currentTarget.style.background = '#007F82'; }}
                onMouseLeave={e => { if (!(currentStep === 1 && !state.industryPack)) e.currentTarget.style.background = '#00A9AC'; }}
              >
                {currentStep === 1 ? (state.industryPack ? `Continue with ${state.industryLabel}` : 'Select an industry') : 'Save & Continue'}
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step 1: Industry Selector ───────────────────────────────────────────────

function Step1({ state, setState, setStateField, goNext }: {
  state: WizardState;
  setState: React.Dispatch<React.SetStateAction<WizardState>>;
  setStateField: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void;
  goNext: () => void;
}) {
  const [waitlistCard, setWaitlistCard] = useState<string | null>(null);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSubmitted, setWaitlistSubmitted] = useState<Set<string>>(new Set());
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customIndustry, setCustomIndustry] = useState({ name: '', services: '', jobSize: '', teamSize: '' });

  const handleSelect = (card: typeof INDUSTRY_CARDS[0]) => {
    if (!card.active) return;
    setState(s => ({
      ...s,
      industryPack: card.id,
      industryLabel: card.label,
      operationsType: card.ops || null,
      serviceTypes: SERVICE_SEEDS[card.id] || [],
    }));
  };

  const handleNotify = (id: string) => {
    setWaitlistSubmitted(prev => new Set([...prev, id]));
    setWaitlistCard(null);
    setWaitlistEmail('');
  };

  return (
    <div className="space-y-5">
      <p style={{ color: '#6B7280', fontSize: '0.9375rem', lineHeight: 1.6 }}>
        Your industry determines your catalog schema, service templates, dispatch logic, and the features your team sees. Choose carefully — this can't be changed after setup.
      </p>

      {/* Active industries */}
      <div className="bg-white rounded-[8px] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <p style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Available now</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {INDUSTRY_CARDS.filter(c => c.active).map(card => {
            const selected = state.industryPack === card.id;
            return (
              <button
                key={card.id}
                onClick={() => handleSelect(card)}
                className="relative p-5 rounded-[8px] text-left transition-all"
                style={{
                  border: selected ? '2px solid #00A9AC' : '2px solid #E5E7EB',
                  background: selected ? '#E6F7F7' : '#fff',
                }}
              >
                {selected && (
                  <span className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#00A9AC' }}>
                    <Check size={13} color="#fff" />
                  </span>
                )}
                <div className="flex items-center gap-4">
                  <span style={{ fontSize: '2.25rem' }}>{card.icon}</span>
                  <div>
                    <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: selected ? '#00A9AC' : '#1A1A1A', fontSize: '1.0625rem' }}>{card.label}</p>
                    <p style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '3px' }}>{card.desc}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Coming soon */}
      <div className="bg-white rounded-[8px] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <p style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Coming soon</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {INDUSTRY_CARDS.filter(c => !c.active).map(card => {
            const submitted = waitlistSubmitted.has(card.id);
            const notifying = waitlistCard === card.id;
            return (
              <div
                key={card.id}
                className="p-4 rounded-[8px] flex flex-col"
                style={{ background: '#F9FAFB', border: '1.5px solid #E5E7EB' }}
              >
                <div className="flex items-start justify-between mb-2">
                  <span style={{ fontSize: '1.375rem' }}>{card.icon}</span>
                  <span className="px-1.5 py-0.5 rounded" style={{ background: '#F3F4F6', color: '#9CA3AF', fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.06em' }}>SOON</span>
                </div>
                <p style={{ color: '#1A1A1A', fontWeight: 600, fontSize: '0.875rem' }}>{card.label}</p>
                <p style={{ color: '#9CA3AF', fontSize: '0.6875rem', marginTop: '3px', lineHeight: 1.4, flex: 1 }}>{card.desc}</p>

                {submitted ? (
                  <p className="mt-2.5 flex items-center gap-1" style={{ color: '#27AE60', fontSize: '0.75rem', fontWeight: 600 }}>
                    <CheckCircle2 size={12} /> On the waitlist
                  </p>
                ) : notifying ? (
                  <div className="mt-2.5">
                    <input
                      value={waitlistEmail}
                      onChange={e => setWaitlistEmail(e.target.value)}
                      placeholder="your@email.com"
                      style={{ ...inp, fontSize: '0.75rem', padding: '5px 8px', marginBottom: '6px' }}
                    />
                    <div className="flex gap-1.5">
                      <button onClick={() => handleNotify(card.id)} disabled={!waitlistEmail.includes('@')} className="flex-1 py-1.5 rounded text-white text-xs font-semibold" style={{ background: waitlistEmail.includes('@') ? '#00A9AC' : '#D1D5DB' }}>Notify me</button>
                      <button onClick={() => { setWaitlistCard(null); setWaitlistEmail(''); }} className="px-2 py-1.5 rounded text-xs" style={{ color: '#6B7280', border: '1px solid #E5E7EB', background: '#fff' }}>✕</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setWaitlistCard(card.id)}
                    className="mt-2.5 py-1.5 rounded-[4px] text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                    style={{ border: '1.5px solid #E5E7EB', color: '#6B7280', background: '#fff' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#00A9AC'; e.currentTarget.style.color = '#00A9AC'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280'; }}
                  >
                    <Bell size={11} /> Notify Me
                  </button>
                )}
              </div>
            );
          })}

          {/* Custom industry card */}
          <button
            onClick={() => setShowCustomForm(v => !v)}
            className="p-4 rounded-[8px] flex flex-col items-center justify-center gap-2 transition-all"
            style={{ border: '1.5px dashed #E5E7EB', background: showCustomForm ? '#E6F7F7' : '#fff', minHeight: '120px' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#00A9AC')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = showCustomForm ? '#00A9AC' : '#E5E7EB')}
          >
            <Plus size={18} style={{ color: '#00A9AC' }} />
            <p style={{ color: '#6B7280', fontSize: '0.75rem', textAlign: 'center', lineHeight: 1.4 }}>
              Don't see your industry?
            </p>
          </button>
        </div>
      </div>

      {/* Custom industry form */}
      {showCustomForm && (
        <div className="bg-white rounded-[8px] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1.5px solid #FCA5A5' }}>
          <h3 style={{ color: '#1A1A1A', fontWeight: 600, marginBottom: '4px' }}>Tell us about your business</h3>
          <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '16px' }}>This feeds the product roadmap for future industry packs.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: 'name', label: 'Industry / Trade', placeholder: 'e.g., Mobile Detailing' },
              { key: 'services', label: 'Services you offer', placeholder: 'e.g., wash, polish, ceramic coat' },
              { key: 'jobSize', label: 'Average job size', placeholder: 'e.g., R 2,500–R 8,000' },
              { key: 'teamSize', label: 'Team size', placeholder: 'e.g., 3 technicians' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>{f.label}</label>
                <input
                  value={customIndustry[f.key as keyof typeof customIndustry]}
                  onChange={e => setCustomIndustry(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{ ...inp, marginTop: '4px', display: 'block' }}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-[6px] text-white font-semibold text-sm transition-colors"
              style={{ background: '#00A9AC' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#007F82')}
              onMouseLeave={e => (e.currentTarget.style.background = '#00A9AC')}
              onClick={() => setShowCustomForm(false)}
            >
              Submit to Product Team
            </button>
            <button onClick={() => setShowCustomForm(false)} className="px-4 py-2 rounded-[6px] text-sm" style={{ color: '#6B7280', border: '1.5px solid #E5E7EB', background: '#fff' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 2: Business Profile ────────────────────────────────────────────────

function Step2({ state, setState, tenant }: { state: WizardState; setState: React.Dispatch<React.SetStateAction<WizardState>>; tenant: TenantData }) {
  const isTire = state.industryPack?.startsWith('tires');
  const isMobile = state.industryPack === 'tires_mobile';

  const planRec = !state.teamSize ? null
    : ['just-me', '2-5'].includes(state.teamSize) ? 'Starter (R 3,499/mo)'
    : state.teamSize === '6-20' ? 'Pro (R 8,999/mo)'
    : 'Enterprise — Talk to Sales';

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <h3 style={{ color: '#1A1A1A', fontWeight: 600, marginBottom: '16px' }}>Business Identity</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Legal Business Name</label>
            <input value={state.legalName} onChange={e => setState(s => ({ ...s, legalName: e.target.value }))} style={{ ...inp, marginTop: '6px', display: 'block' }} placeholder="Acme Tire & Auto, LLC" />
          </div>
          <div className="sm:col-span-2">
            <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Display / Trading Name <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(shown to customers)</span></label>
            <input value={state.displayName} onChange={e => setState(s => ({ ...s, displayName: e.target.value }))} style={{ ...inp, marginTop: '6px', display: 'block' }} placeholder="Acme Tire" />
          </div>
          <div>
            <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Business Type</label>
            <select value={state.legalEntity} onChange={e => setState(s => ({ ...s, legalEntity: e.target.value }))} style={{ ...inp, marginTop: '6px', display: 'block', appearance: 'none', cursor: 'pointer' }}>
              {['Private Company (Pty) Ltd', 'Public Company (Ltd)', 'Sole Proprietor', 'Close Corporation (CC)', 'Partnership', 'Non-Profit Company (NPC)', 'Trust'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>SARS Income Tax Number <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(encrypted)</span></label>
            <div className="relative mt-1.5">
              <input type="password" value={state.ein} onChange={e => setState(s => ({ ...s, ein: e.target.value }))} style={{ ...inp, display: 'block' }} placeholder="10-digit SARS tax number" />
              <Lock size={12} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <h3 style={{ color: '#1A1A1A', fontWeight: 600, marginBottom: '16px' }}>Primary Address</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Street Address</label>
            <input value={state.address} onChange={e => setState(s => ({ ...s, address: e.target.value }))} style={{ ...inp, marginTop: '6px', display: 'block' }} placeholder="123 Main St" />
          </div>
          <div>
            <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>City</label>
            <input value={state.city} onChange={e => setState(s => ({ ...s, city: e.target.value }))} style={{ ...inp, marginTop: '6px', display: 'block' }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Province</label>
              <select value={state.stateCode} onChange={e => setState(s => ({ ...s, stateCode: e.target.value }))} style={{ ...inp, marginTop: '6px', display: 'block', appearance: 'none', cursor: 'pointer' }}>
                {US_STATES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>ZIP</label>
              <input value={state.zip} onChange={e => setState(s => ({ ...s, zip: e.target.value.replace(/\D/g, '').slice(0, 4) }))} style={{ ...inp, marginTop: '6px', display: 'block' }} maxLength={5} />
            </div>
          </div>
          <div>
            <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Primary Phone</label>
            <div className="relative mt-1.5"><Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} /><input value={state.phone} onChange={e => setState(s => ({ ...s, phone: e.target.value }))} style={{ ...inp, display: 'block', paddingLeft: '32px' }} placeholder="+27 11 555 0100" /></div>
          </div>
          <div>
            <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Support Email</label>
            <div className="relative mt-1.5"><Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} /><input value={state.supportEmail} onChange={e => setState(s => ({ ...s, supportEmail: e.target.value }))} style={{ ...inp, display: 'block', paddingLeft: '32px' }} /></div>
          </div>
          <div>
            <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Website <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional)</span></label>
            <input value={state.website} onChange={e => setState(s => ({ ...s, website: e.target.value }))} style={{ ...inp, marginTop: '6px', display: 'block' }} placeholder="https://acmetire.com" />
          </div>
          <div>
            <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Year Established <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional)</span></label>
            <input value={state.yearEstablished} onChange={e => setState(s => ({ ...s, yearEstablished: e.target.value }))} style={{ ...inp, marginTop: '6px', display: 'block' }} placeholder="2010" maxLength={4} />
          </div>
        </div>
      </div>

      {/* Industry-adaptive fields */}
      {state.industryPack && (
        <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div className="flex items-center gap-2 mb-4">
            <span style={{ fontSize: '1.25rem' }}>{INDUSTRY_CARDS.find(c => c.id === state.industryPack)?.icon}</span>
            <h3 style={{ color: '#1A1A1A', fontWeight: 600 }}>Industry Details</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isTire && isMobile && (
              <div className="sm:col-span-2">
                <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Primary Warehouse / Truck Dispatch Address</label>
                <input value={state.address} onChange={e => setState(s => ({ ...s, address: e.target.value }))} style={{ ...inp, marginTop: '6px', display: 'block' }} placeholder="Where your trucks depart from each day" />
              </div>
            )}
            {isTire && !isMobile && (
              <div>
                <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Number of Service Bays</label>
                <input type="number" value={state.serviceBays} onChange={e => setState(s => ({ ...s, serviceBays: e.target.value }))} style={{ ...inp, marginTop: '6px', display: 'block', width: '120px' }} placeholder="4" min="1" />
              </div>
            )}
            {state.industryPack === 'hvac' && (
              <div>
                <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Refrigerant Handler Certification #</label>
                <input value={state.licenseNumber} onChange={e => setState(s => ({ ...s, licenseNumber: e.target.value }))} style={{ ...inp, marginTop: '6px', display: 'block' }} placeholder="EPA 608 Cert #" />
                <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '4px' }}>Required for refrigerant purchasing and compliance logging</p>
              </div>
            )}
            {state.industryPack === 'electrical' && (
              <>
                <div>
                  <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Electrical Contractor License #</label>
                  <input value={state.licenseNumber} onChange={e => setState(s => ({ ...s, licenseNumber: e.target.value }))} style={{ ...inp, marginTop: '6px', display: 'block' }} placeholder="State license number" />
                </div>
                <div>
                  <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Bond / Insurance Policy # <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional)</span></label>
                  <input value={state.insurancePolicy} onChange={e => setState(s => ({ ...s, insurancePolicy: e.target.value }))} style={{ ...inp, marginTop: '6px', display: 'block' }} placeholder="Policy number" />
                </div>
              </>
            )}
            {state.industryPack === 'plumbing' && (
              <>
                <div>
                  <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Plumbing Contractor License #</label>
                  <input value={state.licenseNumber} onChange={e => setState(s => ({ ...s, licenseNumber: e.target.value }))} style={{ ...inp, marginTop: '6px', display: 'block' }} placeholder="State license number" />
                </div>
                <div>
                  <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Bond / Insurance Policy # <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional)</span></label>
                  <input value={state.insurancePolicy} onChange={e => setState(s => ({ ...s, insurancePolicy: e.target.value }))} style={{ ...inp, marginTop: '6px', display: 'block' }} placeholder="Policy number" />
                </div>
              </>
            )}
            {state.industryPack === 'pest_control' && (
              <>
                <div>
                  <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>State Pest Control License #</label>
                  <input value={state.licenseNumber} onChange={e => setState(s => ({ ...s, licenseNumber: e.target.value }))} style={{ ...inp, marginTop: '6px', display: 'block' }} placeholder="State applicator license #" />
                </div>
                <div>
                  <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Applicator Certification Type</label>
                  <select value={state.certType || ''} onChange={e => setState(s => ({ ...s, certType: e.target.value }))} style={{ ...inp, marginTop: '6px', display: 'block', appearance: 'none', cursor: 'pointer' }}>
                    <option value="">— Select —</option>
                    <option>General Pest Control</option>
                    <option>Termite Control</option>
                    <option>Fumigation</option>
                    <option>Wood-Destroying Organisms</option>
                    <option>Multiple Categories</option>
                  </select>
                </div>
              </>
            )}
            {state.industryPack === 'cleaning' && (
              <>
                <div>
                  <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Business Bond / Liability Insurance <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional)</span></label>
                  <input value={state.insurancePolicy} onChange={e => setState(s => ({ ...s, insurancePolicy: e.target.value }))} style={{ ...inp, marginTop: '6px', display: 'block' }} placeholder="Policy # or carrier name" />
                  <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '4px' }}>Shown as a trust signal on your storefront</p>
                </div>
                <div>
                  <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Number of Cleaning Crews</label>
                  <input type="number" value={state.serviceBays} onChange={e => setState(s => ({ ...s, serviceBays: e.target.value }))} style={{ ...inp, marginTop: '6px', display: 'block', width: '120px' }} placeholder="1" min="1" />
                </div>
              </>
            )}
            {state.industryPack === 'carpentry' && (
              <>
                <div>
                  <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Carpentry / Builder Registration # <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional)</span></label>
                  <input value={state.licenseNumber} onChange={e => setState(s => ({ ...s, licenseNumber: e.target.value }))} style={{ ...inp, marginTop: '6px', display: 'block' }} placeholder="NHBRC or trade registration number" />
                </div>
                <div>
                  <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Number of Carpenters / Crew</label>
                  <input type="number" value={state.serviceBays} onChange={e => setState(s => ({ ...s, serviceBays: e.target.value }))} style={{ ...inp, marginTop: '6px', display: 'block', width: '120px' }} placeholder="2" min="1" />
                </div>
                <div>
                  <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Public Liability Insurance # <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional)</span></label>
                  <input value={state.insurancePolicy} onChange={e => setState(s => ({ ...s, insurancePolicy: e.target.value }))} style={{ ...inp, marginTop: '6px', display: 'block' }} placeholder="Policy # or carrier name" />
                </div>
              </>
            )}
            {state.industryPack === 'salon' && (
              <>
                <div>
                  <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Salon / Cosmetology Registration # <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional)</span></label>
                  <input value={state.licenseNumber} onChange={e => setState(s => ({ ...s, licenseNumber: e.target.value }))} style={{ ...inp, marginTop: '6px', display: 'block' }} placeholder="SAQA or provincial registration" />
                </div>
                <div>
                  <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Number of Chairs / Stations</label>
                  <input type="number" value={state.serviceBays} onChange={e => setState(s => ({ ...s, serviceBays: e.target.value }))} style={{ ...inp, marginTop: '6px', display: 'block', width: '120px' }} placeholder="4" min="1" />
                </div>
                <div>
                  <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Specialisation</label>
                  <select value={state.certType || ''} onChange={e => setState(s => ({ ...s, certType: e.target.value }))} style={{ ...inp, marginTop: '6px', display: 'block', appearance: 'none', cursor: 'pointer' }}>
                    <option value="">— Select —</option>
                    <option>Hair & Styling</option>
                    <option>Nails & Beauty</option>
                    <option>Skin & Facials</option>
                    <option>Full-Service Salon</option>
                    <option>Barbershop</option>
                  </select>
                </div>
              </>
            )}
            {state.industryPack === 'consulting' && (
              <>
                <div>
                  <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Consulting Domain</label>
                  <select value={state.certType || ''} onChange={e => setState(s => ({ ...s, certType: e.target.value }))} style={{ ...inp, marginTop: '6px', display: 'block', appearance: 'none', cursor: 'pointer' }}>
                    <option value="">— Select —</option>
                    <option>Business Strategy</option>
                    <option>Financial Advisory</option>
                    <option>HR & Organisational</option>
                    <option>IT & Technology</option>
                    <option>Marketing & Branding</option>
                    <option>Legal & Compliance</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Professional Membership / Accreditation <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional)</span></label>
                  <input value={state.licenseNumber} onChange={e => setState(s => ({ ...s, licenseNumber: e.target.value }))} style={{ ...inp, marginTop: '6px', display: 'block' }} placeholder="e.g. SAICA, SABPP, IODSA" />
                </div>
                <div>
                  <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Number of Consultants</label>
                  <input type="number" value={state.serviceBays} onChange={e => setState(s => ({ ...s, serviceBays: e.target.value }))} style={{ ...inp, marginTop: '6px', display: 'block', width: '120px' }} placeholder="1" min="1" />
                </div>
              </>
            )}
            {state.industryPack === 'healthcare' && (
              <>
                <div>
                  <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>HPCSA Registration # <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(required)</span></label>
                  <input value={state.licenseNumber} onChange={e => setState(s => ({ ...s, licenseNumber: e.target.value }))} style={{ ...inp, marginTop: '6px', display: 'block' }} placeholder="Health Professions Council SA registration" />
                </div>
                <div>
                  <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Practice Type</label>
                  <select value={state.certType || ''} onChange={e => setState(s => ({ ...s, certType: e.target.value }))} style={{ ...inp, marginTop: '6px', display: 'block', appearance: 'none', cursor: 'pointer' }}>
                    <option value="">— Select —</option>
                    <option>General Practice (GP)</option>
                    <option>Physiotherapy</option>
                    <option>Psychology / Counselling</option>
                    <option>Dentistry</option>
                    <option>Optometry</option>
                    <option>Nursing Practice</option>
                    <option>Specialist Clinic</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Medical Aid Billing Codes <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional)</span></label>
                  <input value={state.insurancePolicy} onChange={e => setState(s => ({ ...s, insurancePolicy: e.target.value }))} style={{ ...inp, marginTop: '6px', display: 'block' }} placeholder="e.g. Discovery, Momentum, Medshield" />
                  <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '4px' }}>List accepted medical aid schemes for storefront display</p>
                </div>
              </>
            )}
            {state.industryPack === 'education' && (
              <>
                <div>
                  <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Education Focus</label>
                  <select value={state.certType || ''} onChange={e => setState(s => ({ ...s, certType: e.target.value }))} style={{ ...inp, marginTop: '6px', display: 'block', appearance: 'none', cursor: 'pointer' }}>
                    <option value="">— Select —</option>
                    <option>Academic Tutoring (School)</option>
                    <option>Academic Tutoring (University)</option>
                    <option>Languages</option>
                    <option>Music & Arts</option>
                    <option>Professional Skills</option>
                    <option>Sports & Fitness Coaching</option>
                    <option>Early Childhood Development</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>SACE / ETQA Registration # <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional)</span></label>
                  <input value={state.licenseNumber} onChange={e => setState(s => ({ ...s, licenseNumber: e.target.value }))} style={{ ...inp, marginTop: '6px', display: 'block' }} placeholder="SA Council for Educators or ETQA number" />
                </div>
                <div>
                  <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Number of Educators / Tutors</label>
                  <input type="number" value={state.serviceBays} onChange={e => setState(s => ({ ...s, serviceBays: e.target.value }))} style={{ ...inp, marginTop: '6px', display: 'block', width: '120px' }} placeholder="1" min="1" />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Team size */}
      <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <h3 style={{ color: '#1A1A1A', fontWeight: 600, marginBottom: '4px' }}>Team Size</h3>
        <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '16px' }}>We'll recommend the right plan for you.</p>
        <div className="space-y-2">
          {[['just-me', 'Just me'], ['2-5', '2–5 people'], ['6-20', '6–20 people'], ['21-50', '21–50 people'], ['50+', '50+ people']].map(([val, label]) => (
            <label key={val} className="flex items-center gap-3 p-3 rounded-[6px] cursor-pointer transition-all" style={{ border: `1.5px solid ${state.teamSize === val ? '#00A9AC' : '#E5E7EB'}`, background: state.teamSize === val ? '#E6F7F7' : '#fff' }}>
              <input type="radio" name="teamSize" value={val} checked={state.teamSize === val} onChange={() => setState(s => ({ ...s, teamSize: val }))} style={{ accentColor: '#00A9AC' }} />
              <span style={{ color: '#1A1A1A', fontWeight: state.teamSize === val ? 600 : 400, fontSize: '0.9375rem' }}>{label}</span>
            </label>
          ))}
        </div>
        {planRec && (
          <div className="mt-4 flex items-center gap-2.5 p-3 rounded-[6px]" style={{ background: '#E6F7F7', border: '1px solid #FCA5A5' }}>
            <Star size={14} style={{ color: '#00A9AC' }} />
            <p style={{ color: '#00A9AC', fontSize: '0.875rem', fontWeight: 600 }}>Recommended: {planRec}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step 3: Service Area & Operations Type ──────────────────────────────────

function Step3({ state, setState }: { state: WizardState; setState: React.Dispatch<React.SetStateAction<WizardState>> }) {
  const addZip = () => {
    const z = state.zipInput.trim();
    if (/^d{4}$/.test(z) && !state.serviceZips.includes(z)) {
      setState(s => ({ ...s, serviceZips: [...s.serviceZips, z], zipInput: '' }));
    }
  };

  const OPS = [
    { id: 'mobile' as OperationsType, icon: '🚐', label: 'Mobile / On-site', desc: 'We go to the customer\'s location', activates: 'GPS tracking, truck inventory, call-out fee logic, travel-time allowance' },
    { id: 'inshop' as OperationsType, icon: '🏪', label: 'In-Shop / Fixed', desc: 'Customers come to us', activates: 'Service bay management, walk-in queue, in-shop inspection template' },
    { id: 'both' as OperationsType, icon: '🔀', label: 'Both', desc: 'Mobile + in-shop service', activates: 'All features from Mobile and In-Shop' },
  ];

  const showArea = state.operationsType === 'mobile' || state.operationsType === 'both';

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <h3 style={{ color: '#1A1A1A', fontWeight: 600, marginBottom: '4px' }}>How do you deliver your service?</h3>
        <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '16px' }}>This drives your scheduling logic, dispatch tools, and booking flow.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {OPS.map(opt => {
            const sel = state.operationsType === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setState(s => ({ ...s, operationsType: opt.id }))}
                className="p-4 rounded-[8px] text-left transition-all"
                style={{ border: sel ? `2px solid #00A9AC` : '2px solid #E5E7EB', background: sel ? '#E6F7F7' : '#fff', borderLeft: sel ? '4px solid #00A9AC' : '2px solid #E5E7EB' }}
              >
                <span style={{ fontSize: '2rem' }}>{opt.icon}</span>
                <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: sel ? '#00A9AC' : '#1A1A1A', marginTop: '10px', fontSize: '0.9375rem' }}>{opt.label}</p>
                <p style={{ color: '#6B7280', fontSize: '0.8125rem', marginTop: '4px', lineHeight: 1.4 }}>{opt.desc}</p>
                {sel && <p className="mt-2" style={{ color: '#9CA3AF', fontSize: '0.6875rem', lineHeight: 1.4 }}>Activates: {opt.activates}</p>}
              </button>
            );
          })}
        </div>
      </div>

      {showArea && (
        <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h3 style={{ color: '#1A1A1A', fontWeight: 600, marginBottom: '4px' }}>Service Area Definition</h3>
          <div className="flex gap-2 mb-4">
            {(['zips', 'radius'] as const).map(t => (
              <button key={t} onClick={() => setState(s => ({ ...s, serviceAreaType: t }))} className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all" style={{ background: state.serviceAreaType === t ? '#00A9AC' : '#F3F4F6', color: state.serviceAreaType === t ? '#fff' : '#6B7280' }}>
                {t === 'zips' ? '📍 Postal Codes' : '📏 Radius'}
              </button>
            ))}
          </div>
          {state.serviceAreaType === 'zips' ? (
            <>
              <div className="flex gap-2 mb-3">
                <input value={state.zipInput} onChange={e => setState(s => ({ ...s, zipInput: e.target.value.replace(/\D/g, '').slice(0, 4) }))} onKeyDown={e => e.key === 'Enter' && addZip()} style={{ ...inp, width: '140px', flex: 'none' }} placeholder="Postal code" />
                <button onClick={addZip} className="flex items-center gap-1.5 px-4 py-2 rounded-[6px] text-white text-sm font-semibold" style={{ background: '#00A9AC', whiteSpace: 'nowrap' }}>
                  <Plus size={13} /> Add ZIP
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {state.serviceZips.map(z => (
                  <span key={z} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px]" style={{ background: '#E6F7F7', color: '#00A9AC', fontWeight: 600, fontSize: '0.875rem' }}>
                    <MapPin size={11} />{z}
                    <button onClick={() => setState(s => ({ ...s, serviceZips: s.serviceZips.filter(v => v !== z) }))}><X size={11} style={{ color: '#FCA5A5' }} /></button>
                  </span>
                ))}
                {state.serviceZips.length === 0 && <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>No postal codes added yet</p>}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <input type="number" value={state.serviceRadius} onChange={e => setState(s => ({ ...s, serviceRadius: e.target.value }))} style={{ ...inp, width: '80px', flex: 'none' }} min="1" max="200" />
              <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>mile radius from your primary address</span>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <h3 style={{ color: '#1A1A1A', fontWeight: 600, marginBottom: '16px' }}>How many locations?</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[['1', '1 location'], ['2-5', '2–5'], ['6-20', '6–20'], ['20+', '20+ (chain)']].map(([val, label]) => (
            <button key={val} onClick={() => setState(s => ({ ...s, locationCount: val }))} className="py-3 rounded-[8px] font-semibold text-sm transition-all" style={{ border: state.locationCount === val ? '2px solid #00A9AC' : '2px solid #E5E7EB', background: state.locationCount === val ? '#E6F7F7' : '#fff', color: state.locationCount === val ? '#00A9AC' : '#6B7280' }}>
              {label}
            </button>
          ))}
        </div>
        {state.locationCount === '20+' && (
          <div className="mt-3 p-3 rounded-[6px] flex items-center gap-2.5" style={{ background: '#E6F7F7', border: '1px solid #FCA5A5' }}>
            <Star size={14} style={{ color: '#00A9AC' }} />
            <p style={{ color: '#00A9AC', fontSize: '0.875rem', fontWeight: 600 }}>Enterprise plan recommended — <button className="underline">Talk to Sales</button></p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step 4: Business Hours ───────────────────────────────────────────────────

function Step4({ state, setState }: { state: WizardState; setState: React.Dispatch<React.SetStateAction<WizardState>> }) {
  const isTire = state.industryPack?.startsWith('tires');
  const showEmergency = ['tires_mobile', 'tires_inshop', 'hvac', 'plumbing', 'electrical'].includes(state.industryPack || '');
  const showWeekend = ['pest_control', 'cleaning', 'lawn_care'].includes(state.industryPack || '');
  const [customHoliday, setCustomHoliday] = useState('');

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ color: '#1A1A1A', fontWeight: 600 }}>Weekly Hours</h3>
          <select value={state.timezone} onChange={e => setState(s => ({ ...s, timezone: e.target.value }))} style={{ ...inp, width: 'auto', fontSize: '0.8125rem', padding: '4px 10px' }}>
            {US_TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
          </select>
        </div>
        <div className="space-y-3">
          {DAYS.map(day => {
            const h = state.hours[day];
            return (
              <div key={day} className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                <div className="w-24 shrink-0"><span style={{ color: '#1A1A1A', fontWeight: 500, fontSize: '0.9375rem' }}>{day.slice(0, 3)}</span></div>
                <label className="flex items-center gap-2 cursor-pointer shrink-0">
                  <input type="checkbox" checked={!h.closed} onChange={e => setState(s => ({ ...s, hours: { ...s.hours, [day]: { ...h, closed: !e.target.checked } } }))} style={{ accentColor: '#00A9AC' }} />
                  <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>Open</span>
                </label>
                {!h.closed ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <input type="time" value={h.open} onChange={e => setState(s => ({ ...s, hours: { ...s.hours, [day]: { ...h, open: e.target.value } } }))} style={{ ...inp, width: 'auto', padding: '6px 10px', fontSize: '0.875rem' }} />
                    <span style={{ color: '#9CA3AF' }}>–</span>
                    <input type="time" value={h.close} onChange={e => setState(s => ({ ...s, hours: { ...s.hours, [day]: { ...h, close: e.target.value } } }))} style={{ ...inp, width: 'auto', padding: '6px 10px', fontSize: '0.875rem' }} />
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={h.break} onChange={e => setState(s => ({ ...s, hours: { ...s.hours, [day]: { ...h, break: e.target.checked } } }))} style={{ accentColor: '#00A9AC' }} />
                      <span style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>Break</span>
                    </label>
                    {h.break && (
                      <>
                        <input type="time" value={h.breakStart} onChange={e => setState(s => ({ ...s, hours: { ...s.hours, [day]: { ...h, breakStart: e.target.value } } }))} style={{ ...inp, width: 'auto', padding: '6px 10px', fontSize: '0.75rem' }} />
                        <span style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>–</span>
                        <input type="time" value={h.breakEnd} onChange={e => setState(s => ({ ...s, hours: { ...s.hours, [day]: { ...h, breakEnd: e.target.value } } }))} style={{ ...inp, width: 'auto', padding: '6px 10px', fontSize: '0.75rem' }} />
                      </>
                    )}
                  </div>
                ) : (
                  <span style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Closed</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {(showEmergency || showWeekend) && (
        <div className="bg-white rounded-[8px] p-6 space-y-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h3 style={{ color: '#1A1A1A', fontWeight: 600 }}>Extended Availability</h3>
          {showEmergency && (
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={state.emergencyHours} onChange={e => setState(s => ({ ...s, emergencyHours: e.target.checked }))} style={{ accentColor: '#00A9AC', marginTop: '2px' }} />
              <div>
                <p style={{ color: '#1A1A1A', fontWeight: 500 }}>Offer emergency / after-hours service?</p>
                <p style={{ color: '#9CA3AF', fontSize: '0.8125rem', marginTop: '2px' }}>Enables after-hours surcharge configuration and emergency booking slots</p>
              </div>
            </label>
          )}
          {showWeekend && (
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={state.weekendService} onChange={e => setState(s => ({ ...s, weekendService: e.target.checked }))} style={{ accentColor: '#00A9AC', marginTop: '2px' }} />
              <div>
                <p style={{ color: '#1A1A1A', fontWeight: 500 }}>Offer weekend service?</p>
                <p style={{ color: '#9CA3AF', fontSize: '0.8125rem', marginTop: '2px' }}>Adds Saturday/Sunday slots to your booking calendar</p>
              </div>
            </label>
          )}
        </div>
      )}

      <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <h3 style={{ color: '#1A1A1A', fontWeight: 600, marginBottom: '12px' }}>Holiday Calendar</h3>
        <div className="space-y-2 mb-4">
          {FEDERAL_HOLIDAYS.map(h => {
            const checked = state.holidays.includes(h);
            return (
              <label key={h} className="flex items-center gap-3 py-2 px-3 rounded-[6px] cursor-pointer" style={{ background: checked ? '#E6F7F7' : '#F9FAFB', border: `1px solid ${checked ? '#FCA5A5' : '#E5E7EB'}` }}>
                <input type="checkbox" checked={checked} onChange={() => setState(s => ({ ...s, holidays: checked ? s.holidays.filter(v => v !== h) : [...s.holidays, h] }))} style={{ accentColor: '#00A9AC' }} />
                <span style={{ color: '#1A1A1A', fontSize: '0.875rem', fontWeight: checked ? 500 : 400 }}>{h}</span>
              </label>
            );
          })}
        </div>
        <div className="flex gap-2 border-t pt-4" style={{ borderColor: '#E5E7EB' }}>
          <input value={customHoliday} onChange={e => setCustomHoliday(e.target.value)} style={{ ...inp, flex: 1 }} placeholder="Add custom holiday..." />
          <button onClick={() => { if (customHoliday.trim()) { setState(s => ({ ...s, holidays: [...s.holidays, customHoliday.trim()] })); setCustomHoliday(''); } }} className="flex items-center gap-1 px-3 py-2 rounded-[6px] text-white text-sm font-semibold" style={{ background: '#00A9AC', whiteSpace: 'nowrap' }}>
            <Plus size={13} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step 5: Bank Account Creation ───────────────────────────────────────────

// FNB brand colours
const FNB_GREEN  = '#007A4C';
const FNB_LIGHT  = '#E8F5EF';
const FNB_BORDER = '#A8D5BC';

const SA_BANKS = [
  { name: 'First National Bank (FNB)', branchCode: '250655' },
  { name: 'Absa Bank',                 branchCode: '632005' },
  { name: 'Capitec Bank',              branchCode: '470010' },
  { name: 'Nedbank',                   branchCode: '198765' },
  { name: 'Standard Bank',             branchCode: '051001' },
  { name: 'African Bank',              branchCode: '430000' },
  { name: 'Bidvest Bank',              branchCode: '462005' },
  { name: 'Discovery Bank',            branchCode: '679000' },
  { name: 'Investec Bank',             branchCode: '580105' },
  { name: 'TymeBank',                  branchCode: '678910' },
];

/** Inline FNB wordmark — lowercase "fnb" in FNB green, bold serif-ish */
function FNBLogo({ size = 36 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 8,
      background: FNB_GREEN,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span style={{
        color: '#fff', fontWeight: 900, fontSize: size * 0.38,
        fontFamily: 'Georgia, "Times New Roman", serif',
        letterSpacing: '-0.02em', lineHeight: 1,
      }}>fnb</span>
    </div>
  );
}

function StepBankAccount({ state, setState }: { state: WizardState; setState: React.Dispatch<React.SetStateAction<WizardState>> }) {
  const filled = !state.bankSkipped && state.bankAccountName && state.bankName && state.bankAccountNumber && state.bankBranchCode;
  const isFNB  = state.bankName === 'First National Bank (FNB)';

  function selectBank(name: string) {
    const bank = SA_BANKS.find(b => b.name === name);
    setState(s => ({ ...s, bankName: name, bankBranchCode: bank?.branchCode ?? '' }));
  }

  return (
    <div className="space-y-5">

      {/* FNB Partner Hero */}
      <div className="rounded-[12px] overflow-hidden" style={{ border: `2px solid ${FNB_BORDER}` }}>
        {/* Header bar */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ background: FNB_GREEN }}>
          <div className="flex items-center gap-3">
            <FNBLogo size={40} />
            <div>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: '1.0625rem', lineHeight: 1.2 }}>
                First National Bank
              </p>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem', marginTop: 2 }}>
                Proud Banking Partner of FB Business Connect
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.35)' }}>
            SARB-Regulated
          </span>
        </div>

        {/* Partnership details */}
        <div className="px-6 py-5" style={{ background: FNB_LIGHT }}>
          <p style={{ color: '#1A1A1A', fontSize: '0.9375rem', lineHeight: 1.65, marginBottom: 16 }}>
            FB Business Connect has partnered with <strong style={{ color: FNB_GREEN }}>First National Bank (FNB)</strong> — South Africa's most innovative bank — to give your business a fully integrated banking experience. Open an FNB Business Account and your payouts, cards, and reconciliation all live in one place.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: '🏦', title: 'FNB Business Account',  desc: 'Cheque, savings or transmission account with dedicated branch code 250655.' },
              { icon: '💳', title: 'FNB Business Card',     desc: 'Visa-powered cards for technicians with real-time spend controls.' },
              { icon: '⚡', title: 'Instant EFT Payouts',   desc: "Payout batches settle same-day via FNB's RTC infrastructure." },
            ].map(f => (
              <div key={f.title} className="rounded-[8px] p-3.5" style={{ background: '#fff', border: `1px solid ${FNB_BORDER}` }}>
                <div style={{ fontSize: '1.25rem', marginBottom: 6 }}>{f.icon}</div>
                <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.875rem', marginBottom: 3 }}>{f.title}</p>
                <p style={{ color: '#6B7280', fontSize: '0.8125rem', lineHeight: 1.45 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {!state.bankSkipped ? (
        <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          {/* Section header */}
          <div className="flex items-center gap-3 mb-5">
            <FNBLogo size={32} />
            <div>
              <h3 style={{ color: '#1A1A1A', fontWeight: 700, fontSize: '1rem' }}>Link Your FNB Business Account</h3>
              <p style={{ color: '#6B7280', fontSize: '0.8125rem' }}>Enter your existing FNB details or open a new account at fnb.co.za</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Account Holder Name</label>
              <input value={state.bankAccountName} onChange={e => setState(s => ({ ...s, bankAccountName: e.target.value }))} style={{ ...inp, marginTop: 6, display: 'block' }} placeholder="Registered business name" />
            </div>
            <div>
              <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Bank</label>
              <select value={state.bankName} onChange={e => selectBank(e.target.value)}
                style={{ ...inp, marginTop: 6, display: 'block', appearance: 'none', cursor: 'pointer',
                  borderColor: isFNB ? FNB_GREEN : '#E5E7EB',
                  background: isFNB ? FNB_LIGHT : '#fff',
                }}>
                <option value="">— Select bank —</option>
                {SA_BANKS.map(b => (
                  <option key={b.name} value={b.name}>
                    {b.name === 'First National Bank (FNB)' ? '⭐ ' + b.name + ' (Recommended)' : b.name}
                  </option>
                ))}
              </select>
              {isFNB && (
                <div className="flex items-center gap-1.5 mt-2">
                  <CheckCircle2 size={13} style={{ color: FNB_GREEN }} />
                  <span style={{ color: FNB_GREEN, fontSize: '0.75rem', fontWeight: 600 }}>FNB — our preferred banking partner</span>
                </div>
              )}
            </div>
            <div>
              <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Account Type</label>
              <select value={state.bankAccountType} onChange={e => setState(s => ({ ...s, bankAccountType: e.target.value }))} style={{ ...inp, marginTop: 6, display: 'block', appearance: 'none', cursor: 'pointer' }}>
                {['Cheque / Current', 'Business Savings', 'Transmission'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Account Number</label>
              <div className="relative mt-1.5">
                <input type="password" value={state.bankAccountNumber} onChange={e => setState(s => ({ ...s, bankAccountNumber: e.target.value.replace(/\D/g, '').slice(0, 16) }))} style={{ ...inp, display: 'block' }} placeholder="••••••••••••" />
                <Lock size={12} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
              </div>
            </div>
            <div>
              <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Branch Code</label>
              <input value={state.bankBranchCode} onChange={e => setState(s => ({ ...s, bankBranchCode: e.target.value.replace(/\D/g, '').slice(0, 6) }))} style={{ ...inp, marginTop: 6, display: 'block' }} placeholder="6-digit code" maxLength={6} />
              {isFNB
                ? <p style={{ fontSize: '0.75rem', color: FNB_GREEN, marginTop: 4, fontWeight: 600 }}>✓ FNB universal branch code: 250655</p>
                : <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: 4 }}>Auto-filled when you select a bank above</p>
              }
            </div>
            <div className="sm:col-span-2">
              <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>CIPC Registration Number <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(required for verification)</span></label>
              <input value={state.cipcNumber} onChange={e => setState(s => ({ ...s, cipcNumber: e.target.value }))} style={{ ...inp, marginTop: 6, display: 'block' }} placeholder="e.g. 2019/123456/07" />
            </div>
          </div>

          {filled && (
            <div className="mt-4 flex items-center gap-2 p-3 rounded-[8px]" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <CheckCircle2 size={16} style={{ color: '#27AE60' }} />
              <span style={{ color: '#15803D', fontWeight: 600, fontSize: '0.9375rem' }}>Account details saved — pending FNB verification</span>
            </div>
          )}

          {/* Don't have an FNB account yet */}
          {!isFNB && !state.bankName && (
            <div className="mt-4 flex items-center gap-3 p-4 rounded-[8px]" style={{ background: FNB_LIGHT, border: `1px solid ${FNB_BORDER}` }}>
              <FNBLogo size={28} />
              <div className="flex-1">
                <p style={{ color: FNB_GREEN, fontWeight: 700, fontSize: '0.875rem' }}>Don't have an FNB Business Account yet?</p>
                <p style={{ color: '#6B7280', fontSize: '0.8125rem', marginTop: 2 }}>Open one online in under 10 minutes at fnb.co.za/business — it's our recommended partner for instant EFT payouts.</p>
              </div>
            </div>
          )}

          <div className="mt-4 p-3 rounded-[8px]" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
            <p style={{ color: '#92400E', fontSize: '0.8125rem' }}>
              <strong>FICA Notice:</strong> In terms of the Financial Intelligence Centre Act (FICA), we are required to verify your business identity and bank account before processing payouts. This is a once-off process.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[8px] p-6 text-center" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '2px dashed #E5E7EB' }}>
          <p style={{ color: '#6B7280', fontSize: '0.9375rem' }}>Bank account setup skipped. You can link your account later from <strong>Banking → Account Overview</strong>.</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={() => setState(s => ({ ...s, bankSkipped: !s.bankSkipped }))}
          style={{ color: '#9CA3AF', fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {state.bankSkipped ? '← Add bank account' : 'Skip for now'}
        </button>
        <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>You can always update this in Settings → Banking</p>
      </div>
    </div>
  );
}

// ─── Step 6: Payout Setup ─────────────────────────────────────────────────────

function Step5({ state, setState }: { state: WizardState; setState: React.Dispatch<React.SetStateAction<WizardState>> }) {
  const [loading, setLoading] = useState(false);
  const connect = async () => { setLoading(true); await new Promise(r => setTimeout(r, 1800)); setLoading(false); setState(s => ({ ...s, stripeConnected: true })); };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        {state.stripeConnected ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#F0FDF4', border: '2px solid #27AE60' }}>
              <CheckCircle2 size={32} style={{ color: '#27AE60' }} />
            </div>
            <h3 style={{ fontFamily: 'Sora, sans-serif', color: '#1A1A1A', fontWeight: 700, fontSize: '1.125rem' }}>Stripe Connected!</h3>
            <p className="mt-2" style={{ color: '#6B7280' }}>Payouts within 2 business days directly to your bank.</p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-[6px]" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <span style={{ fontSize: '1.125rem' }}>🏦</span>
              <span style={{ color: '#15803D', fontWeight: 600, fontSize: '0.875rem' }}>••••1234 — Chase Business Checking</span>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-[8px] flex items-center justify-center" style={{ background: '#635BFF', color: '#fff' }}>
                <CreditCard size={22} />
              </div>
              <div>
                <h3 style={{ color: '#1A1A1A', fontWeight: 700, fontSize: '1.0625rem' }}>Connect Stripe</h3>
                <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>Required before customers can pay on your storefront</p>
              </div>
            </div>
            <p style={{ color: '#6B7280', fontSize: '0.9375rem', marginBottom: '16px', lineHeight: 1.6 }}>
              Your customers pay through your storefront. FB Business Connect deposits the money directly into your bank account, minus a small platform fee.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[['2.9% + R 5.50', 'Per transaction (card)'], ['0.5%', 'Platform fee (Starter)'], ['2 business days', 'Standard payout speed'], ['R 0', 'Setup cost']].map(([v, l]) => (
                <div key={l} className="p-3 rounded-[6px]" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                  <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.0625rem' }}>{v}</p>
                  <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '2px' }}>{l}</p>
                </div>
              ))}
            </div>
            <div className="p-3 rounded-[6px] mb-5" style={{ background: '#E6F7F7', border: '1px solid #FCA5A5' }}>
              <p style={{ color: '#DC2626', fontSize: '0.8125rem', fontWeight: 600 }}>⚠️ Required before storefront can be published</p>
            </div>
            <button onClick={connect} disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 rounded-[6px] text-white transition-colors" style={{ background: loading ? '#9CA3AF' : '#635BFF', fontWeight: 600 }}>
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Connecting...</> : <><ExternalLink size={16} />Connect with Stripe</>}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Step 6: Catalog Setup ───────────────────────────────────────────────────

const CATALOG_CONFIG: Record<string, { question: string; options: [string, string, string, string][] }> = {
  hvac: {
    question: 'How do you source your parts and equipment?',
    options: [
      ['distributor', '🏭', 'Wholesale supplier accounts (Carrier, Trane, etc.)', 'Link supplier accounts for live parts pricing and availability'],
      ['local', '📦', 'I buy and stock parts locally', 'Track your own inventory — add parts manually or via CSV'],
      ['both', '🔀', 'Both wholesale and local stock', 'Combination of supplier feeds and your own warehouse'],
    ],
  },
  electrical: {
    question: 'How do you source your electrical parts and materials?',
    options: [
      ['distributor', '🏭', 'Electrical supply house accounts', 'Link accounts for live parts pricing'],
      ['local', '📦', 'I buy and stock materials locally', 'Manual inventory tracking for your parts stock'],
      ['both', '🔀', 'Both supply house and local stock', 'Combination approach'],
    ],
  },
  plumbing: {
    question: 'How do you source your plumbing parts and materials?',
    options: [
      ['distributor', '🏭', 'Plumbing supply house accounts', 'Link accounts for live parts pricing'],
      ['local', '📦', 'I buy and stock parts locally', 'Manual inventory tracking for your parts stock'],
      ['both', '🔀', 'Both supply house and local stock', 'Combination approach'],
    ],
  },
};

const SERVICE_ONLY_INDUSTRIES = ['cleaning', 'pest_control'];

function Step6({ state, setState }: { state: WizardState; setState: React.Dispatch<React.SetStateAction<WizardState>> }) {
  const [connecting, setConnecting] = useState<string | null>(null);
  const isTire = state.industryPack?.startsWith('tires');
  const isServiceOnly = SERVICE_ONLY_INDUSTRIES.includes(state.industryPack || '');
  const catalogCfg = CATALOG_CONFIG[state.industryPack || ''];

  const connectDist = async (id: string) => {
    setConnecting(id);
    await new Promise(r => setTimeout(r, 1400));
    setConnecting(null);
    setState(s => ({ ...s, connectedDistributors: [...s.connectedDistributors, id] }));
  };

  // ── Service-only industries (Cleaning, Pest Control) ────────────────────
  if (isServiceOnly) {
    const cfg = {
      cleaning: { icon: '🧹', title: 'Service Catalog', note: 'Cleaning is a service-only business — no physical inventory tracking is needed.', detail: "You'll define your cleaning services (Standard, Deep Clean, Move-Out, etc.) in the next step. Each service can have its own price, duration, and add-ons." },
      pest_control: { icon: '🐛', title: 'Service & Chemical Catalog', note: 'Pest control services are configured in the next step.', detail: "You'll define your treatments (General Pest, Termite, Rodent Control, etc.) with per-service pricing. Chemical products used are logged per job for compliance." },
    }[state.industryPack!]!;

    // Auto-set catalogSource for service-only
    if (state.catalogSource !== 'services') {
      setState(s => ({ ...s, catalogSource: 'services' as any }));
    }

    return (
      <div className="space-y-5">
        <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div className="flex items-center gap-3 mb-4">
            <span style={{ fontSize: '2rem' }}>{cfg.icon}</span>
            <div>
              <h3 style={{ color: '#1A1A1A', fontWeight: 700, fontSize: '1.0625rem' }}>{cfg.title}</h3>
              <p style={{ color: '#27AE60', fontSize: '0.8125rem', fontWeight: 600, marginTop: '2px' }}>✓ No inventory setup required</p>
            </div>
          </div>
          <p style={{ color: '#6B7280', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '16px' }}>{cfg.detail}</p>
          <div className="rounded-[8px] p-4" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <p style={{ color: '#15803D', fontWeight: 600, fontSize: '0.875rem' }}>What happens next</p>
            <ul className="mt-2 space-y-1">
              {['Step 7 — You\'ll confirm your pre-seeded service types', 'Step 8 — Set your pricing, tax rate, and trip fee policy', 'Your services go live when you publish'].map(t => (
                <li key={t} style={{ color: '#6B7280', fontSize: '0.8125rem' }}>→ {t}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // ── Tires ────────────────────────────────────────────────────────────────
  if (isTire) {
    return (
      <div className="space-y-5">
        <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h3 style={{ color: '#1A1A1A', fontWeight: 600, marginBottom: '4px' }}>Where do you source your tire inventory?</h3>
          <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '16px' }}>At least one source is required before storefront can be published.</p>
          {[['distributor', '🚛', 'From distributors (ATD, TireHub, etc.)', 'Auto-sync catalog and live pricing every 60 minutes'], ['local', '📦', 'I stock my own tires locally', 'Add tires manually or import via CSV'], ['both', '🔀', 'Both (distributor + local stock)', 'Combination of distributor feeds and your own inventory']].map(([val, icon, label, desc]) => (
            <label key={val} className="flex items-start gap-3 p-4 rounded-[8px] cursor-pointer mb-3" style={{ border: `2px solid ${state.catalogSource === val ? '#00A9AC' : '#E5E7EB'}`, background: state.catalogSource === val ? '#E6F7F7' : '#fff' }}>
              <input type="radio" name="src" value={val} checked={state.catalogSource === val} onChange={() => setState(s => ({ ...s, catalogSource: val as any }))} style={{ accentColor: '#00A9AC', marginTop: '2px' }} />
              <div><p style={{ color: '#1A1A1A', fontWeight: 600 }}>{icon} {label}</p><p style={{ color: '#6B7280', fontSize: '0.8125rem', marginTop: '3px' }}>{desc}</p></div>
            </label>
          ))}
        </div>
        {(state.catalogSource === 'distributor' || state.catalogSource === 'both') && (
          <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h3 style={{ color: '#1A1A1A', fontWeight: 600, marginBottom: '12px' }}>Connect Your Distributors</h3>
            <div className="space-y-3">
              {DISTRIBUTORS.map(dist => {
                const connected = state.connectedDistributors.includes(dist.id);
                return (
                  <div key={dist.id} className="flex items-center justify-between p-4 rounded-[8px]" style={{ border: connected ? '1.5px solid #27AE60' : '1.5px solid #E5E7EB', background: connected ? '#F0FDF4' : '#fff' }}>
                    <div className="flex items-center gap-3">
                      <span style={{ fontSize: '1.5rem' }}>{dist.logo}</span>
                      <div>
                        <p style={{ color: '#1A1A1A', fontWeight: 600, fontSize: '0.9375rem' }}>{dist.name}</p>
                        {connected && <p style={{ color: '#27AE60', fontSize: '0.8125rem' }}>✓ Connected — syncing every 60 min</p>}
                      </div>
                    </div>
                    {connected ? (
                      <span className="px-3 py-1 rounded-[4px]" style={{ background: '#DCFCE7', color: '#15803D', fontSize: '0.8125rem', fontWeight: 600 }}>Active</span>
                    ) : (
                      <button onClick={() => connectDist(dist.id)} disabled={connecting === dist.id} className="flex items-center gap-1.5 px-4 py-2 rounded-[6px] text-white text-sm font-semibold" style={{ background: connecting === dist.id ? '#9CA3AF' : '#00A9AC', whiteSpace: 'nowrap' }}>
                        {connecting === dist.id ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Connecting...</> : 'Connect'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Parts-using trades (HVAC, Electrical, Plumbing) ──────────────────────
  if (catalogCfg) {
    return (
      <div className="space-y-5">
        <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h3 style={{ color: '#1A1A1A', fontWeight: 600, marginBottom: '4px' }}>{catalogCfg.question}</h3>
          <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '16px' }}>At least one source is required before your storefront can be published.</p>
          {catalogCfg.options.map(([val, icon, label, desc]) => (
            <label key={val} className="flex items-start gap-3 p-4 rounded-[8px] cursor-pointer mb-3" style={{ border: `2px solid ${state.catalogSource === val ? '#00A9AC' : '#E5E7EB'}`, background: state.catalogSource === val ? '#E6F7F7' : '#fff' }}>
              <input type="radio" name="cat" value={val} checked={state.catalogSource === val} onChange={() => setState(s => ({ ...s, catalogSource: val as any }))} style={{ accentColor: '#00A9AC', marginTop: '2px' }} />
              <div>
                <p style={{ color: '#1A1A1A', fontWeight: 600 }}>{icon} {label}</p>
                <p style={{ color: '#6B7280', fontSize: '0.8125rem', marginTop: '3px' }}>{desc}</p>
              </div>
            </label>
          ))}
        </div>
        {state.catalogSource && state.catalogSource !== 'local' && (
          <div className="rounded-[8px] p-4" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <p style={{ color: '#15803D', fontWeight: 600, fontSize: '0.875rem' }}>Supplier connections</p>
            <p style={{ color: '#6B7280', fontSize: '0.8125rem', marginTop: '4px' }}>
              You can connect specific supplier accounts (e.g., Ferguson, Wesco, Grainger) from Settings → Integrations after publishing.
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── Generic fallback ─────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <h3 style={{ color: '#1A1A1A', fontWeight: 600, marginBottom: '4px' }}>What do you use in your work?</h3>
        <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '16px' }}>This determines whether you need inventory management.</p>
        {[['parts', '🔩', 'Physical parts / materials', 'Enables inventory tracking, parts ordering, and parts-based pricing'], ['services', '🔧', 'Services only (no physical parts)', 'Service catalog only — no inventory management needed'], ['both', '🔀', 'Both parts and services', 'Full catalog with inventory and service management']].map(([val, icon, label, desc]) => (
          <label key={val} className="flex items-start gap-3 p-4 rounded-[8px] cursor-pointer mb-3" style={{ border: `2px solid ${state.catalogSource === val ? '#00A9AC' : '#E5E7EB'}`, background: state.catalogSource === val ? '#E6F7F7' : '#fff' }}>
            <input type="radio" name="cat" value={val} checked={state.catalogSource === val} onChange={() => setState(s => ({ ...s, catalogSource: val as any }))} style={{ accentColor: '#00A9AC', marginTop: '2px' }} />
            <div><p style={{ color: '#1A1A1A', fontWeight: 600 }}>{icon} {label}</p><p style={{ color: '#6B7280', fontSize: '0.8125rem', marginTop: '3px' }}>{desc}</p></div>
          </label>
        ))}
      </div>
    </div>
  );
}

// ─── Step 7: Service Types ───────────────────────────────────────────────────

function Step7({ state, setState }: { state: WizardState; setState: React.Dispatch<React.SetStateAction<WizardState>> }) {
  const [newSvc, setNewSvc] = useState({ name: '', duration: '60', price: '0', pattern: 'No-Parts' as 'Parts-Install' | 'No-Parts' });
  const [addingNew, setAddingNew] = useState(false);
  const industryCard = INDUSTRY_CARDS.find(c => c.id === state.industryPack);

  const toggle = (id: string) => setState(s => ({ ...s, serviceTypes: s.serviceTypes.map(t => t.id === id ? { ...t, checked: !t.checked } : t) }));
  const updatePrice = (id: string, price: number) => setState(s => ({ ...s, serviceTypes: s.serviceTypes.map(t => t.id === id ? { ...t, price } : t) }));
  const updateDuration = (id: string, duration: number) => setState(s => ({ ...s, serviceTypes: s.serviceTypes.map(t => t.id === id ? { ...t, duration } : t) }));

  const addCustom = () => {
    if (!newSvc.name) return;
    setState(s => ({ ...s, serviceTypes: [...s.serviceTypes, { id: `custom-${Date.now()}`, name: newSvc.name, duration: parseInt(newSvc.duration), price: parseFloat(newSvc.price), pattern: newSvc.pattern, checked: true }] }));
    setNewSvc({ name: '', duration: '60', price: '0', pattern: 'No-Parts' });
    setAddingNew(false);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-[8px] overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: '#E5E7EB', background: '#E6F7F7' }}>
          {industryCard && <span style={{ fontSize: '1.25rem' }}>{industryCard.icon}</span>}
          <div>
            <h3 style={{ color: '#00A9AC', fontWeight: 700 }}>Pre-seeded for {state.industryLabel}</h3>
            <p style={{ color: '#6B7280', fontSize: '0.8125rem' }}>Check the services you offer. Edit prices and durations inline.</p>
          </div>
        </div>

        {state.serviceTypes.length === 0 ? (
          <div className="p-8 text-center">
            <p style={{ color: '#9CA3AF' }}>No pre-seeded services for this industry. Add yours below.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#F3F4F6' }}>
            <div className="px-5 py-2 grid grid-cols-12 gap-2" style={{ background: '#F9FAFB' }}>
              <div className="col-span-1" />
              <div className="col-span-4" style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Service</div>
              <div className="col-span-2 text-center" style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration</div>
              <div className="col-span-2 text-center" style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price</div>
              <div className="col-span-3" style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pattern</div>
            </div>
            {state.serviceTypes.map(svc => (
              <div key={svc.id} className="px-5 py-3 grid grid-cols-12 gap-2 items-center" style={{ background: svc.checked ? '#fff' : '#FAFAFA', opacity: svc.checked ? 1 : 0.55 }}>
                <div className="col-span-1">
                  <input type="checkbox" checked={svc.checked} onChange={() => toggle(svc.id)} style={{ accentColor: '#00A9AC', width: '16px', height: '16px' }} />
                </div>
                <div className="col-span-4" style={{ color: '#1A1A1A', fontSize: '0.875rem', fontWeight: svc.checked ? 500 : 400 }}>{svc.name}</div>
                <div className="col-span-2 text-center">
                  <input type="number" value={svc.duration} onChange={e => updateDuration(svc.id, parseInt(e.target.value) || 0)} style={{ ...inp, width: '60px', fontSize: '0.875rem', padding: '4px 8px', textAlign: 'center' }} min="5" step="5" />
                  <span style={{ color: '#9CA3AF', fontSize: '0.6875rem', display: 'block', marginTop: '2px' }}>min</span>
                </div>
                <div className="col-span-2 text-center">
                  <div className="relative inline-block">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>R</span>
                    <input type="number" value={svc.price} onChange={e => updatePrice(svc.id, parseFloat(e.target.value) || 0)} style={{ ...inp, width: '70px', fontSize: '0.875rem', padding: '4px 6px 4px 16px' }} min="0" />
                  </div>
                </div>
                <div className="col-span-3">
                  <span className="px-2 py-0.5 rounded-[4px] text-xs font-semibold" style={{ background: svc.pattern === 'Parts-Install' ? '#EFF6FF' : '#F0FDF4', color: svc.pattern === 'Parts-Install' ? '#1D4ED8' : '#15803D' }}>
                    {svc.pattern}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="p-5 border-t" style={{ borderColor: '#E5E7EB' }}>
          {addingNew ? (
            <div className="p-4 rounded-[8px]" style={{ background: '#F9FAFB', border: '1.5px dashed #E5E7EB' }}>
              <p style={{ color: '#6B7280', fontWeight: 600, fontSize: '0.875rem', marginBottom: '10px' }}>New Service Type</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div className="sm:col-span-2">
                  <input value={newSvc.name} onChange={e => setNewSvc(v => ({ ...v, name: e.target.value }))} style={inp} placeholder="Service name" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" value={newSvc.duration} onChange={e => setNewSvc(v => ({ ...v, duration: e.target.value }))} style={inp} placeholder="Duration (min)" />
                  <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }}>R</span><input type="number" value={newSvc.price} onChange={e => setNewSvc(v => ({ ...v, price: e.target.value }))} style={{ ...inp, paddingLeft: '24px' }} placeholder="Price" /></div>
                </div>
                <select value={newSvc.pattern} onChange={e => setNewSvc(v => ({ ...v, pattern: e.target.value as any }))} style={{ ...inp, appearance: 'none', cursor: 'pointer' }}>
                  <option value="No-Parts">No-Parts</option>
                  <option value="Parts-Install">Parts-Install</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={addCustom} disabled={!newSvc.name} className="px-4 py-2 rounded-[6px] text-white text-sm font-semibold" style={{ background: newSvc.name ? '#00A9AC' : '#9CA3AF' }}>Add Service</button>
                <button onClick={() => setAddingNew(false)} className="px-4 py-2 rounded-[6px] text-sm" style={{ color: '#6B7280', border: '1px solid #E5E7EB' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAddingNew(true)} className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#00A9AC' }}>
              <Plus size={14} /> Add another service type
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step 8: Pricing & Fees ──────────────────────────────────────────────────

function Step8({ state, setState }: { state: WizardState; setState: React.Dispatch<React.SetStateAction<WizardState>> }) {
  const isMobile = state.operationsType === 'mobile' || state.operationsType === 'both';
  const isTire = state.industryPack?.startsWith('tires');
  const disposalFeeLabel: string | null =
    isTire ? 'Tire disposal fee per tire' :
    state.industryPack === 'hvac' ? 'Refrigerant disposal fee (per job)' :
    state.industryPack === 'pest_control' ? 'Chemical disposal / hazmat fee (per job)' :
    null;

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <h3 style={{ color: '#1A1A1A', fontWeight: 600, marginBottom: '16px' }}>Tax & Disposal</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Default Tax Rate (%)</label>
            <input type="number" value={state.taxRate} onChange={e => setState(s => ({ ...s, taxRate: e.target.value }))} style={{ ...inp, marginTop: '6px', display: 'block', width: '120px' }} step="0.01" />
          </div>
          {disposalFeeLabel && (
            <div>
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input type="checkbox" checked={state.disposalFeeEnabled} onChange={e => setState(s => ({ ...s, disposalFeeEnabled: e.target.checked }))} style={{ accentColor: '#00A9AC' }} />
                <span style={{ color: '#1A1A1A', fontWeight: 500, fontSize: '0.9375rem' }}>{disposalFeeLabel}</span>
              </label>
              {state.disposalFeeEnabled && (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }}>R</span>
                  <input type="number" value={state.disposalFeeAmount} onChange={e => setState(s => ({ ...s, disposalFeeAmount: e.target.value }))} style={{ ...inp, paddingLeft: '24px', width: '120px' }} min="0" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isMobile && (
        <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h3 style={{ color: '#1A1A1A', fontWeight: 600, marginBottom: '4px' }}>Trip / Call-Out Fee</h3>
          <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '16px' }}>Charge a fee when dispatch costs aren't covered by the cart.</p>
          <div className="space-y-3">
            {[['true', '✓ Yes — charge a trip fee'], ['false', '✗ No — included in my service pricing']].map(([val, label]) => (
              <label key={val} className="flex items-center gap-3 p-3.5 rounded-[8px] cursor-pointer" style={{ border: `2px solid ${String(state.calloutFeeEnabled) === val ? '#00A9AC' : '#E5E7EB'}`, background: String(state.calloutFeeEnabled) === val ? '#E6F7F7' : '#fff' }}>
                <input type="radio" name="callout" value={val} checked={String(state.calloutFeeEnabled) === val} onChange={() => setState(s => ({ ...s, calloutFeeEnabled: val === 'true' }))} style={{ accentColor: '#00A9AC' }} />
                <span style={{ color: '#1A1A1A', fontWeight: String(state.calloutFeeEnabled) === val ? 600 : 400 }}>{label}</span>
              </label>
            ))}
          </div>
          {state.calloutFeeEnabled && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Trip fee amount</label>
                <div className="relative mt-1.5"><span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }}>R</span><input type="number" value={state.calloutFeeAmount} onChange={e => setState(s => ({ ...s, calloutFeeAmount: e.target.value }))} style={{ ...inp, paddingLeft: '24px' }} min="0" /></div>
              </div>
              <div>
                <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Apply when cart is under</label>
                <div className="relative mt-1.5"><span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }}>R</span><input type="number" value={state.calloutFeeThreshold} onChange={e => setState(s => ({ ...s, calloutFeeThreshold: e.target.value }))} style={{ ...inp, paddingLeft: '24px' }} min="0" /></div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <h3 style={{ color: '#1A1A1A', fontWeight: 600, marginBottom: '4px' }}>When do you collect payment?</h3>
        <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '16px' }}>This is your default. You can configure per service type later.</p>
        <div className="space-y-2">
          {[['full', 'Full payment at booking', 'Simplest — customer pays everything upfront'], ['deposit', 'Deposit at booking, balance at completion', 'Set a deposit percentage; balance due when job is done'], ['completion', 'Full payment at completion only', 'No charge at booking; customer pays on the day']].map(([val, label, desc]) => (
            <label key={val} className="flex items-start gap-3 p-4 rounded-[8px] cursor-pointer" style={{ border: `2px solid ${state.depositPolicy === val ? '#00A9AC' : '#E5E7EB'}`, background: state.depositPolicy === val ? '#E6F7F7' : '#fff' }}>
              <input type="radio" name="dep" value={val} checked={state.depositPolicy === val} onChange={() => setState(s => ({ ...s, depositPolicy: val as any }))} style={{ accentColor: '#00A9AC', marginTop: '2px' }} />
              <div>
                <p style={{ color: '#1A1A1A', fontWeight: 600 }}>{label}</p>
                <p style={{ color: '#6B7280', fontSize: '0.8125rem', marginTop: '2px' }}>{desc}</p>
              </div>
            </label>
          ))}
        </div>
        {state.depositPolicy === 'deposit' && (
          <div className="mt-3">
            <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Deposit percentage</label>
            <div className="flex items-center gap-2 mt-1.5">
              <input type="range" min="10" max="90" step="5" value={parseInt(state.depositPercent)} onChange={e => setState(s => ({ ...s, depositPercent: e.target.value }))} style={{ flex: 1, accentColor: '#00A9AC' }} />
              <span style={{ color: '#00A9AC', fontWeight: 700, fontSize: '1.125rem', fontFamily: 'Sora, sans-serif', minWidth: '50px' }}>{state.depositPercent}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step 9: Team Setup ──────────────────────────────────────────────────────

function Step9({ state, setState }: { state: WizardState; setState: React.Dispatch<React.SetStateAction<WizardState>> }) {
  const addMember = () => {
    if (!state.techInput.name || !state.techInput.email.includes('@')) return;
    setState(s => ({ ...s, teamMembers: [...s.teamMembers, { id: Date.now().toString(), ...s.techInput }], techInput: { name: '', email: '', role: 'Technician' } }));
  };

  const roles = ['Manager', 'Dispatcher', 'Technician', 'Service Writer', 'Marketing', 'Bookkeeper'];

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <h3 style={{ color: '#1A1A1A', fontWeight: 600, marginBottom: '4px' }}>Invite Your Team</h3>
        <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '16px' }}>Team members receive an invitation email with their own onboarding link.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <input value={state.techInput.name} onChange={e => setState(s => ({ ...s, techInput: { ...s.techInput, name: e.target.value } }))} style={inp} placeholder="Full name" />
          <input type="email" value={state.techInput.email} onChange={e => setState(s => ({ ...s, techInput: { ...s.techInput, email: e.target.value } }))} style={inp} placeholder="Email address" />
          <select value={state.techInput.role} onChange={e => setState(s => ({ ...s, techInput: { ...s.techInput, role: e.target.value } }))} style={{ ...inp, appearance: 'none', cursor: 'pointer' }}>
            {roles.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <button onClick={addMember} className="flex items-center gap-2 px-4 py-2.5 rounded-[6px] text-white text-sm font-semibold" style={{ background: '#00A9AC' }}>
          <Plus size={14} /> Send Invite
        </button>

        {state.teamMembers.length > 0 && (
          <div className="mt-5 space-y-2">
            {state.teamMembers.map(m => (
              <div key={m.id} className="flex items-center justify-between px-4 py-3 rounded-[6px]" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#E6F7F7', color: '#00A9AC', fontWeight: 700, fontSize: '0.875rem' }}>{m.name[0].toUpperCase()}</div>
                  <div>
                    <p style={{ color: '#1A1A1A', fontWeight: 600, fontSize: '0.875rem' }}>{m.name}</p>
                    <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>{m.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded-[4px] text-xs font-semibold" style={{ background: m.role === 'Technician' ? '#EFF6FF' : '#F3F4F6', color: m.role === 'Technician' ? '#1D4ED8' : '#6B7280' }}>{m.role}</span>
                  <span style={{ color: '#F39C12', fontSize: '0.75rem', fontWeight: 500 }}>Invite pending</span>
                  <button onClick={() => setState(s => ({ ...s, teamMembers: s.teamMembers.filter(t => t.id !== m.id) }))}><X size={14} style={{ color: '#9CA3AF' }} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {state.teamMembers.length === 0 && (
          <div className="mt-4 p-4 rounded-[6px] text-center" style={{ border: '1.5px dashed #E5E7EB' }}>
            <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Optional — you can invite staff anytime from Settings → Team</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step 10: Storefront Branding ────────────────────────────────────────────

function Step10({ state, setState, slug }: { state: WizardState; setState: React.Dispatch<React.SetStateAction<WizardState>>; slug: string }) {
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');

  const copyUrl = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const isTire = state.industryPack?.startsWith('tires');

  const PreviewPanel = () => (
    <div className="sticky top-6">
      <div className="flex items-center justify-between mb-3">
        <p style={{ color: '#6B7280', fontSize: '0.875rem', fontWeight: 600 }}>Live Preview</p>
        <div className="flex gap-1">
          {(['mobile', 'desktop'] as const).map(m => (
            <button key={m} onClick={() => setPreviewMode(m)} className="px-2.5 py-1 rounded text-xs font-semibold" style={{ background: previewMode === m ? '#1A1A1A' : '#F3F4F6', color: previewMode === m ? '#fff' : '#6B7280' }}>
              {m === 'mobile' ? '📱' : '🖥'}
            </button>
          ))}
        </div>
      </div>
      <div className={`rounded-[12px] overflow-hidden border-4 ${previewMode === 'mobile' ? 'w-[260px] mx-auto' : 'w-full'}`} style={{ borderColor: '#1A1A1A' }}>
        {/* Storefront preview */}
        <div style={{ background: '#fff' }}>
          {/* Nav */}
          <div className="px-4 py-3 flex items-center justify-between" style={{ background: '#fff', borderBottom: `3px solid ${state.brandColor}` }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded flex items-center justify-center text-white font-bold text-xs" style={{ background: state.brandColor }}>
                {(state.displayName || 'A')[0].toUpperCase()}
              </div>
              <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '0.75rem', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{state.displayName || 'Your Business'}</span>
            </div>
            <button className="px-2.5 py-1 rounded text-white text-xs font-bold" style={{ background: state.brandColor }}>Book Now</button>
          </div>
          {/* Hero */}
          <div className="px-4 py-6 text-center" style={{ background: `linear-gradient(135deg, ${state.brandColor}18, ${state.brandColor}08)` }}>
            <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, color: '#1A1A1A', fontSize: previewMode === 'mobile' ? '0.9375rem' : '1.25rem', lineHeight: 1.3 }}>
              {state.tagline || 'Your Trusted Experts'}
            </p>
            <p style={{ color: '#6B7280', fontSize: '0.6875rem', marginTop: '6px' }}>{state.serviceAreaText || 'Serving your local area'}</p>
            <button className="mt-4 px-5 py-2 rounded-full text-white text-xs font-bold" style={{ background: state.brandColor }}>
              {isTire ? 'Shop Tires' : state.industryPack === 'hvac' ? 'Schedule Service' : state.industryPack === 'plumbing' ? 'Book a Plumber' : state.industryPack === 'electrical' ? 'Get a Quote' : state.industryPack === 'cleaning' ? 'Book a Cleaning' : state.industryPack === 'pest_control' ? 'Schedule Treatment' : 'Book Now'}
            </button>
          </div>
          {/* Sample cards */}
          <div className="px-3 py-4">
            <p style={{ color: '#1A1A1A', fontWeight: 700, fontSize: '0.75rem', marginBottom: '8px' }}>{isTire ? 'Featured Tires' : 'Our Services'}</p>
            <div className="grid grid-cols-2 gap-2">
              {(isTire ? [['🔵', 'Michelin Defender 2', 'R 3,499/tyre'], ['🟡', 'Goodyear Assurance', 'R 2,999/tyre']] : state.industryPack === 'hvac' ? [['❄️', 'AC Tune-Up', 'R 2,699'], ['🔥', 'Furnace Install', 'R 27,500']] : state.industryPack === 'electrical' ? [['💡', 'Outlet Install', 'R 3,699'], ['⚡', 'EV Charger', 'R 12,999']] : state.industryPack === 'plumbing' ? [['🚿', 'Drain Cleaning', 'R 2,699'], ['🚽', 'Toilet Replace', 'R 6,499']] : state.industryPack === 'cleaning' ? [['✨', 'Deep Cleaning', 'R 5,499'], ['🏠', 'Move-Out Clean', 'R 7,499']] : state.industryPack === 'pest_control' ? [['🐛', 'Pest Treatment', 'R 2,699'], ['🐭', 'Rodent Control', 'R 4,599']] : [['🔧', 'Full Service', 'R 2,699'], ['⚡', 'Emergency Visit', 'R 1,799']]).map(([icon, name, price]) => (
                <div key={name} className="p-2.5 rounded-[6px]" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                  <span style={{ fontSize: '1.25rem' }}>{icon}</span>
                  <p style={{ color: '#1A1A1A', fontWeight: 600, fontSize: '0.6875rem', marginTop: '4px', lineHeight: 1.3 }}>{name}</p>
                  <p style={{ color: state.brandColor, fontWeight: 700, fontSize: '0.75rem', marginTop: '2px' }}>{price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 px-3 py-2.5 rounded-[6px]" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
        <Globe size={13} style={{ color: '#9CA3AF', shrink: 0 }} />
        <span style={{ color: '#00A9AC', fontWeight: 600, fontSize: '0.8125rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{slug}.fb-business-connect.app</span>
        <button onClick={copyUrl} style={{ color: '#9CA3AF' }}>
          {copied ? <CheckCircle2 size={14} style={{ color: '#27AE60' }} /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
      <div className="space-y-5">
        <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h3 style={{ color: '#1A1A1A', fontWeight: 600, marginBottom: '16px' }}>Brand Identity</h3>
          <div className="space-y-4">
            <div>
              <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Primary Brand Color</label>
              <div className="flex items-center gap-3 mt-1.5">
                <input type="color" value={state.brandColor} onChange={e => setState(s => ({ ...s, brandColor: e.target.value }))} className="w-12 h-10 rounded-[6px] cursor-pointer" style={{ border: '1.5px solid #E5E7EB', padding: '2px' }} />
                <input value={state.brandColor} onChange={e => setState(s => ({ ...s, brandColor: e.target.value }))} style={{ ...inp, width: '120px', fontFamily: 'monospace' }} placeholder="#00A9AC" />
                <div className="flex gap-1.5">
                  {['#00A9AC', '#1D4ED8', '#059669', '#7C3AED', '#D97706'].map(c => (
                    <button key={c} onClick={() => setState(s => ({ ...s, brandColor: c }))} className="w-7 h-7 rounded-full border-2 transition-all" style={{ background: c, borderColor: state.brandColor === c ? '#1A1A1A' : 'transparent' }} />
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Logo</label>
              <div className="mt-1.5 flex items-center gap-3">
                <div className="w-16 h-16 rounded-[8px] flex items-center justify-center text-white font-bold text-xl" style={{ background: state.brandColor }}>{(state.displayName || 'A')[0].toUpperCase()}</div>
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-[6px] cursor-pointer" style={{ border: '1.5px solid #E5E7EB', color: '#6B7280', fontSize: '0.875rem', fontWeight: 500, background: '#fff' }}>
                  <Upload size={15} /> Upload Logo
                  <input type="file" accept="image/*" className="hidden" />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h3 style={{ color: '#1A1A1A', fontWeight: 600, marginBottom: '16px' }}>Storefront Copy</h3>
          <div className="space-y-4">
            <div>
              <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Tagline / Headline</label>
              <input value={state.tagline} onChange={e => setState(s => ({ ...s, tagline: e.target.value }))} style={{ ...inp, marginTop: '6px', display: 'block' }} placeholder="Your trusted tire experts" />
            </div>
            <div>
              <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Business Description</label>
              <textarea value={state.businessDescription} onChange={e => setState(s => ({ ...s, businessDescription: e.target.value }))} rows={3} style={{ ...inp, resize: 'vertical', display: 'block', marginTop: '6px' }} placeholder="Tell customers about your business..." />
            </div>
            <div>
              <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Service Area Summary</label>
              <input value={state.serviceAreaText} onChange={e => setState(s => ({ ...s, serviceAreaText: e.target.value }))} style={{ ...inp, marginTop: '6px', display: 'block' }} placeholder="Serving the greater Johannesburg, GP area" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[8px] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
          <div className="flex items-center justify-between mb-2">
            <h3 style={{ color: '#1A1A1A', fontWeight: 600 }}>Your Storefront URL</h3>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-[6px]" style={{ background: '#E6F7F7', border: '1px solid #FCA5A5' }}>
            <Globe size={16} style={{ color: '#00A9AC', shrink: 0 }} />
            <span style={{ color: '#00A9AC', fontWeight: 700, fontFamily: 'Sora, sans-serif', fontSize: '1rem', flex: 1 }}>{slug}.fb-business-connect.app</span>
            <button onClick={copyUrl} className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold" style={{ border: '1px solid #FCA5A5', color: '#00A9AC', background: '#fff' }}>
              {copied ? <CheckCircle2 size={12} style={{ color: '#27AE60' }} /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="mt-2" style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
            Connect your own domain (e.g., www.yourbusiness.com) after publishing.{' '}
            <span style={{ background: '#F3F4F6', color: '#6B7280', padding: '1px 5px', borderRadius: '4px', fontSize: '0.6875rem', fontWeight: 600 }}>Pro / Enterprise</span>
          </p>
        </div>
      </div>

      <div className="hidden lg:block">
        <PreviewPanel />
      </div>
    </div>
  );
}

// ─── Step 11: Review & Publish ────────────────────────────────────────────────

function Step11({ state, canPublish, slug, onPublish, onComplete }: {
  state: WizardState; canPublish: boolean; slug: string;
  onPublish: () => void; onComplete: () => void;
}) {
  const [publishing, setPublishing] = useState(false);
  const handlePublish = async () => {
    if (!canPublish) return;
    setPublishing(true);
    await new Promise(r => setTimeout(r, 2000));
    setPublishing(false);
    onPublish();
  };

  const checklist = [
    { label: 'Industry selected', done: !!state.industryPack },
    { label: 'Business profile complete', done: !!(state.legalName && state.address) },
    { label: 'Service area defined', done: state.serviceZips.length > 0 || !!state.serviceRadius },
    { label: 'Business hours set', done: true },
    { label: 'Payout account connected', done: state.stripeConnected, required: true },
    { label: 'Catalog / services set up', done: state.connectedDistributors.length > 0 || !!state.catalogSource, required: true },
    { label: 'Service types configured', done: state.serviceTypes.some(s => s.checked) },
    { label: 'Pricing set', done: parseFloat(state.taxRate) > 0 },
    { label: 'Storefront branded', done: !!(state.tagline && state.brandColor) },
  ];
  const optional = [
    { label: 'Team members invited', done: state.teamMembers.length > 0 },
    { label: 'Custom domain connected', badge: 'Pro/Enterprise', done: false },
    { label: 'Marketing campaigns set up', done: false },
  ];

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <h3 style={{ color: '#1A1A1A', fontWeight: 700, marginBottom: '16px', fontFamily: 'Sora, sans-serif' }}>Pre-Launch Checklist</h3>
        <div className="space-y-2.5 mb-5">
          {checklist.map(item => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#F3F4F6' }}>
              <div className="flex items-center gap-3">
                {item.done ? <CheckCircle2 size={17} style={{ color: '#27AE60' }} /> : <Circle size={17} style={{ color: item.required ? '#DC2626' : '#D1D5DB' }} />}
                <span style={{ color: '#1A1A1A', fontSize: '0.9375rem' }}>{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.required && !item.done && <span className="px-2 py-0.5 rounded" style={{ background: '#E6F7F7', color: '#DC2626', fontSize: '0.6875rem', fontWeight: 600 }}>Required</span>}
                <span style={{ color: item.done ? '#27AE60' : '#9CA3AF', fontSize: '0.8125rem', fontWeight: 500 }}>{item.done ? 'Complete' : 'Incomplete'}</span>
              </div>
            </div>
          ))}
        </div>

        <h4 style={{ color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Optional — Can be done after publishing</h4>
        <div className="space-y-2">
          {optional.map(item => (
            <div key={item.label} className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-3">
                <Circle size={15} style={{ color: '#D1D5DB' }} />
                <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>{item.label}</span>
                {item.badge && <span className="px-1.5 py-0.5 rounded" style={{ background: '#F3F4F6', color: '#9CA3AF', fontSize: '0.6rem', fontWeight: 600 }}>{item.badge}</span>}
              </div>
            </div>
          ))}
        </div>

        {!canPublish && (
          <div className="mt-5 rounded-[8px] p-4 flex items-start gap-3" style={{ background: '#E6F7F7', border: '1px solid #FCA5A5' }}>
            <AlertCircle size={16} style={{ color: '#DC2626', marginTop: '2px' }} />
            <p style={{ color: '#DC2626', fontSize: '0.875rem' }}>Complete the required steps before publishing: {!state.stripeConnected && 'Payout setup'}{!state.stripeConnected && !state.catalogSource && ' + '}{!state.catalogSource && 'Catalog / inventory setup'}.</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[8px] p-6 text-center" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <p style={{ color: '#1A1A1A', fontWeight: 700, fontSize: '1.125rem', fontFamily: 'Sora, sans-serif', marginBottom: '8px' }}>Your storefront is ready. Let's go live.</p>
        <p style={{ color: '#6B7280', fontSize: '0.9375rem', marginBottom: '24px' }}>
          Publishing at: <span style={{ color: '#00A9AC', fontWeight: 700 }}>{slug}.fb-business-connect.app</span>
        </p>
        <button
          onClick={handlePublish}
          disabled={!canPublish || publishing}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-[8px] text-white transition-colors"
          style={{ background: !canPublish ? '#E5E7EB' : publishing ? '#9CA3AF' : '#00A9AC', fontWeight: 800, fontSize: '1.125rem', cursor: !canPublish ? 'not-allowed' : 'pointer', fontFamily: 'Sora, sans-serif' }}
          onMouseEnter={e => { if (canPublish && !publishing) e.currentTarget.style.background = '#007F82'; }}
          onMouseLeave={e => { if (canPublish && !publishing) e.currentTarget.style.background = '#00A9AC'; }}
        >
          {publishing ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Publishing...</> : <><Rocket size={20} />Publish Storefront</>}
        </button>
      </div>
    </div>
  );
}

// ─── Publish Success ──────────────────────────────────────────────────────────

function PublishSuccess({ slug, state, onComplete }: { slug: string; state: WizardState; onComplete: () => void }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    let count = 0;
    const burst = () => {
      const colors = ['#00A9AC', '#FA9D1E', '#ffffff', '#00BFC3', '#FFD08A'];
      const rand = (min: number, max: number) => Math.random() * (max - min) + min;
      // @ts-ignore
      if (window.confetti) {
        // @ts-ignore
        window.confetti({ particleCount: 80, spread: 100, origin: { x: rand(0.2, 0.8), y: 0.5 }, colors });
      }
      count++;
      if (count < 4) setTimeout(burst, 500);
    };
    setTimeout(burst, 200);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16" style={{ fontFamily: 'Inter, sans-serif', background: 'linear-gradient(160deg, #0f0f0f 0%, #1a0605 60%, #0f0f0f 100%)' }}>
      <div className="max-w-lg w-full text-center">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(255,255,255,0.1)', border: '3px solid #27AE60' }}>
          <CheckCircle2 size={48} style={{ color: '#27AE60' }} />
        </div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', color: '#fff', fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2 }}>
          🎉 You're Live!
        </h1>
        <p className="mt-4" style={{ color: '#9CA3AF', fontSize: '1rem', lineHeight: 1.6 }}>
          Your {state.industryLabel} storefront is now published and accepting {state.industryPack?.startsWith('tires') ? 'bookings and orders' : ['cleaning', 'pest_control'].includes(state.industryPack || '') ? 'recurring appointments' : 'service bookings'}.
        </p>

        <div className="mt-6 px-6 py-4 rounded-[10px] inline-block" style={{ background: 'rgba(192,57,43,0.2)', border: '2px solid #00A9AC' }}>
          <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginBottom: '4px' }}>Your storefront is live at</p>
          <p style={{ color: '#fff', fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '1.375rem', letterSpacing: '0.02em' }}>{slug}.fb-business-connect.app</p>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {[['📋', 'Copy Link'], ['💬', 'Share via WhatsApp'], ['👁', 'Preview Storefront']].map(([icon, label]) => (
            <button key={label} className="flex items-center gap-2 px-4 py-2.5 rounded-[6px] text-sm font-semibold transition-colors" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}>
              <span>{icon}</span> {label}
            </button>
          ))}
        </div>

        <div className="mt-8 p-5 rounded-[10px]" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>What's Next</p>
          <div className="space-y-3 text-left">
            {[['👥', 'Invite your team', 'Add technicians and managers to get everyone set up'], ['🔗', 'Connect Google Business', 'Boost local search visibility instantly'], ['📢', 'Set up your first campaign', 'Reach existing customers with a welcome promotion']].map(([icon, title, desc]) => (
              <div key={title} className="flex items-start gap-3">
                <span style={{ fontSize: '1.125rem' }}>{icon}</span>
                <div>
                  <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.875rem' }}>{title}</p>
                  <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '2px' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={onComplete} className="mt-8 px-8 py-4 rounded-[8px] text-white font-bold text-base transition-colors" style={{ background: '#00A9AC', fontFamily: 'Sora, sans-serif' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#007F82')}
          onMouseLeave={e => (e.currentTarget.style.background = '#00A9AC')}
        >
          Go to Dashboard →
        </button>
      </div>
    </div>
  );
}

import { VISITS as BOOKING_VISITS, TECHNICIANS } from '../booking/mockData';
import type {
  DispatchVisit, Invoice, TruckInventoryItem, TechLocation,
  MidJobAuth, Recommendation, DamageClaim, TimeEntry, CommissionEntry, VisitPhoto,
} from './types';

export { TECHNICIANS };

// ─── Today's dispatch visits (June 14 Sunday + enrich existing) ───────────────
// The base visits come from booking/mockData — today = 2026-06-14
// We extend with additional same-day visits for a full dispatch board

const NOW_HOUR = 10; // simulate current time as 10:15 AM

const EXTRA_VISITS = [
  {
    id: 'dv-001', shopId: 'shop-1', customerId: 'cust-2', customerName: 'Maria Reyes',
    customerPhone: '+27 12 555 0278', customerEmail: 'maria.reyes@email.com',
    serviceTypeId: 'st-3', serviceTypeName: 'Tire Rotation',
    scheduledStart: '2026-06-14T08:30:00', scheduledEnd: '2026-06-14T09:00:00',
    technicianId: 'tech-2', technicianName: 'Sarah Chen',
    serviceAddress: '45 Long Street, Cape Town, WC 8001', operationsType: 'inshop' as const,
    vehicle: { year: '2021', make: 'Toyota', model: 'Camry', trim: 'SE', licensePlate: 'TX-DEF456' },
    partsRequired: [], partsStatus: 'not_required' as const, visitState: 'completed' as const,
    addons: [], notes: '', paymentMethod: 'stripe_terminal' as const,
    totalPrice: 21.59, laborPrice: 19.99, partsPrice: 0, taxAmount: 1.60, createdAt: '2026-06-13T10:00:00',
  },
  {
    id: 'dv-002', shopId: 'shop-1', customerId: 'cust-3', customerName: 'Fleet Dispatch – Unit 7',
    customerPhone: '+27 21 555 0391', customerEmail: 'dispatch@fleetco.com',
    serviceTypeId: 'st-8', serviceTypeName: 'Mobile Flat Repair',
    scheduledStart: '2026-06-14T09:00:00', scheduledEnd: '2026-06-14T09:45:00',
    technicianId: 'tech-3', technicianName: 'Carlos Rivera',
    serviceAddress: '220 Pretoria Road, Midrand, GP 1685', operationsType: 'mobile' as const,
    vehicle: { year: '2021', make: 'Ram', model: '1500', trim: 'Work', licensePlate: 'TX-FLT007' },
    partsRequired: [{ sku: 'PATCH-KIT', name: 'Tire Plug/Patch Kit', qty: 1, supplier: 'local' as const, supplierName: 'Truck Stock', unitPrice: 8.99 }],
    partsStatus: 'ready' as const, visitState: 'en_route' as const,
    addons: [], notes: 'Unit 7 stranded on service road.',
    paymentMethod: undefined, totalPrice: 75.59, laborPrice: 59.99, partsPrice: 8.99, taxAmount: 6.61, createdAt: '2026-06-14T08:45:00',
  },
  {
    id: 'dv-003', shopId: 'shop-1', customerId: 'cust-2', customerName: 'Brenda Walsh',
    customerPhone: '+27 11 555 0811', customerEmail: 'bwalsh@email.com',
    serviceTypeId: 'st-6', serviceTypeName: 'TPMS Sensor Replacement',
    scheduledStart: '2026-06-14T09:30:00', scheduledEnd: '2026-06-14T10:00:00',
    technicianId: 'tech-2', technicianName: 'Sarah Chen',
    serviceAddress: '14 Jan Smuts Ave, Rosebank, GP 2196', operationsType: 'inshop' as const,
    vehicle: { year: '2020', make: 'Chevrolet', model: 'Silverado', trim: 'LT', licensePlate: 'TX-GHI890' },
    partsRequired: [{ sku: 'TPMS-GM-2020', name: 'GM TPMS Sensor 2020', qty: 2, supplier: 'local' as const, supplierName: 'TirePlus Local', unitPrice: 69.99, etaDate: '2026-06-14' }],
    partsStatus: 'ordered' as const, visitState: 'parts_pending' as const,
    addons: [], notes: 'Two rear sensors failing intermittently.',
    paymentMethod: undefined, totalPrice: 201.57, laborPrice: 49.99, partsPrice: 139.98, taxAmount: 11.60, createdAt: '2026-06-13T14:00:00',
  },
  {
    id: 'dv-004', shopId: 'shop-1', customerId: 'cust-1', customerName: 'James Calloway',
    customerPhone: '+27 11 555 0142', customerEmail: 'james.calloway@email.com',
    serviceTypeId: 'st-3', serviceTypeName: 'Tire Rotation',
    scheduledStart: '2026-06-14T11:30:00', scheduledEnd: '2026-06-14T12:00:00',
    technicianId: 'tech-1', technicianName: 'Mike Torres',
    serviceAddress: '12 Sandton Drive, Sandton, GP 2196', operationsType: 'mobile' as const,
    vehicle: { year: '2019', make: 'Honda', model: 'Accord', trim: 'EX', licensePlate: 'TX-XYZ789' },
    partsRequired: [], partsStatus: 'not_required' as const, visitState: 'scheduled' as const,
    addons: [], notes: 'Follow-up after earlier visit.',
    paymentMethod: undefined, totalPrice: 21.59, laborPrice: 19.99, partsPrice: 0, taxAmount: 1.60, createdAt: '2026-06-14T09:00:00',
  },
  {
    id: 'dv-005', shopId: 'shop-1', customerId: 'cust-3', customerName: 'FleetCo – Unit 3',
    customerPhone: '+27 21 555 0391', customerEmail: 'dispatch@fleetco.com',
    serviceTypeId: 'st-1', serviceTypeName: '4-Tire Mount & Balance',
    scheduledStart: '2026-06-14T11:00:00', scheduledEnd: '2026-06-14T12:00:00',
    technicianId: 'tech-3', technicianName: 'Carlos Rivera',
    serviceAddress: '88 Commissioner Street, Johannesburg, GP 2001', operationsType: 'inshop' as const,
    vehicle: { year: '2022', make: 'Ford', model: 'Transit', trim: 'Base', licensePlate: 'TX-FLT003' },
    partsRequired: [{ sku: 'MI-LT225-75R16C', name: 'Michelin Agilis CrossClimate LT225/75R16', qty: 4, supplier: 'national' as const, supplierName: 'NTW National', unitPrice: 189.99 }],
    partsStatus: 'arrived' as const, visitState: 'parts_ready' as const,
    addons: [{ id: 'ao-3', name: 'Old Tire Disposal', durationMinutes: 0, price: 3.99, qty: 4 }],
    notes: 'Fleet preventive replacement. All 4 tires showing wear.',
    paymentMethod: undefined, totalPrice: 876.86, laborPrice: 89.99, partsPrice: 759.96, taxAmount: 58.94, createdAt: '2026-06-13T11:00:00',
  },
  {
    id: 'dv-006', shopId: 'shop-1', customerId: 'cust-1', customerName: 'Ray Hernandez',
    customerPhone: '+27 21 555 0601', customerEmail: 'ray.h@email.com',
    serviceTypeId: 'st-1', serviceTypeName: '4-Tire Mount & Balance',
    scheduledStart: '2026-06-14T13:00:00', scheduledEnd: '2026-06-14T14:00:00',
    technicianId: 'tech-1', technicianName: 'Mike Torres',
    serviceAddress: '5 Fredman Drive, Sandton, GP 2196', operationsType: 'mobile' as const,
    vehicle: { year: '2023', make: 'Tesla', model: 'Model Y', trim: 'Long Range', licensePlate: 'TX-EV001' },
    partsRequired: [{ sku: 'MI-255-45R19', name: 'Michelin Pilot Sport 4S 255/45R19', qty: 4, supplier: 'local' as const, supplierName: 'TirePlus Local', unitPrice: 289.99 }],
    partsStatus: 'ready' as const, visitState: 'scheduled' as const,
    addons: [
      { id: 'ao-1', name: 'Nitrogen Fill', durationMinutes: 5, price: 15.99, qty: 1 },
      { id: 'ao-2', name: 'Road Hazard Warranty', durationMinutes: 0, price: 49.99, qty: 4 },
    ],
    notes: 'Tesla – no lift required. Use jack adapters.',
    paymentMethod: undefined, totalPrice: 1459.88, laborPrice: 89.99, partsPrice: 1159.96, taxAmount: 96.35, createdAt: '2026-06-12T15:00:00',
  },
  {
    id: 'dv-007', shopId: 'shop-1', customerId: 'cust-2', customerName: 'Patricia Owens',
    customerPhone: '+27 11 555 0945', customerEmail: 'p.owens@email.com',
    serviceTypeId: 'st-4', serviceTypeName: 'Tire Balance Only',
    scheduledStart: '2026-06-14T13:30:00', scheduledEnd: '2026-06-14T14:00:00',
    technicianId: 'tech-2', technicianName: 'Sarah Chen',
    serviceAddress: '123 Main Road, Johannesburg, GP 2001', operationsType: 'inshop' as const,
    vehicle: { year: '2018', make: 'BMW', model: '3 Series', trim: '330i', licensePlate: 'TX-JKL321' },
    partsRequired: [], partsStatus: 'not_required' as const, visitState: 'scheduled' as const,
    addons: [], notes: 'Vibration over 70 mph.',
    paymentMethod: undefined, totalPrice: 16.19, laborPrice: 14.99, partsPrice: 0, taxAmount: 1.20, createdAt: '2026-06-13T17:00:00',
  },
  {
    id: 'dv-008', shopId: 'shop-1', customerId: 'cust-3', customerName: 'Marcus Webb',
    customerPhone: '+27 12 555 0773', customerEmail: 'marcus.w@email.com',
    serviceTypeId: 'st-8', serviceTypeName: 'Mobile Flat Repair',
    scheduledStart: '2026-06-14T15:00:00', scheduledEnd: '2026-06-14T15:45:00',
    technicianId: 'tech-3', technicianName: 'Carlos Rivera',
    serviceAddress: '62 Somerset Road, Green Point, WC 8005', operationsType: 'mobile' as const,
    vehicle: { year: '2020', make: 'Jeep', model: 'Wrangler', trim: 'Sport', licensePlate: 'TX-MNO654' },
    partsRequired: [{ sku: 'PATCH-KIT', name: 'Tire Plug/Patch Kit', qty: 1, supplier: 'local' as const, supplierName: 'Truck Stock', unitPrice: 8.99 }],
    partsStatus: 'ready' as const, visitState: 'scheduled' as const,
    addons: [], notes: 'Nail in driver rear. In parking lot.',
    paymentMethod: undefined, totalPrice: 75.59, laborPrice: 59.99, partsPrice: 8.99, taxAmount: 6.61, createdAt: '2026-06-14T09:30:00',
  },
];

// All today's dispatch visits (merge existing today's + new ones)
const EXISTING_TODAY = BOOKING_VISITS.filter(v => v.scheduledStart.startsWith('2026-06-14'));

export const DISPATCH_VISITS: DispatchVisit[] = [
  ...EXISTING_TODAY.map(v => ({ ...v, atRisk: false, mapX: 40, mapY: 35 })),
  ...EXTRA_VISITS.map((v, i) => {
    const atRisk = v.visitState === 'parts_pending';
    const positions: [number, number][] = [[60,45],[25,70],[75,30],[45,60],[80,50],[35,25],[55,75],[20,55],[65,40]];
    const [mx, my] = positions[i % positions.length];
    return { ...v, atRisk, mapX: mx, mapY: my };
  }),
].sort((a, b) => a.scheduledStart.localeCompare(b.scheduledStart));

// ─── Tech GPS Locations ───────────────────────────────────────────────────────
export const TECH_LOCATIONS: TechLocation[] = [
  {
    technicianId: 'tech-1', technicianName: 'Mike Torres',
    lat: 32.8141, lng: -96.9475, capturedAt: '2026-06-14T10:08:00',
    onClock: true, currentVisitId: 'v-001', color: '#00A9AC',
  },
  {
    technicianId: 'tech-2', technicianName: 'Sarah Chen',
    lat: 32.7767, lng: -96.7970, capturedAt: '2026-06-14T10:10:00',
    onClock: true, currentVisitId: 'dv-003', color: '#2980B9',
  },
  {
    technicianId: 'tech-3', technicianName: 'Carlos Rivera',
    lat: 32.8320, lng: -96.9850, capturedAt: '2026-06-14T10:12:00',
    onClock: true, currentVisitId: 'dv-002', color: '#27AE60',
  },
];

// ─── Invoices ─────────────────────────────────────────────────────────────────
export const INVOICES: Invoice[] = [
  {
    id: 'inv-001', shopId: 'shop-1', visitId: 'v-005', customerId: 'cust-2',
    customerName: 'Maria Reyes', customerEmail: 'maria.reyes@email.com',
    status: 'order',
    lines: [
      { id: 'l-1', description: '4-Tire Mount & Balance', qty: 1, unitPrice: 89.99, category: 'labor', taxable: true },
      { id: 'l-2', description: 'Bridgestone Turanza QuietTrack 225/55R17', qty: 4, unitPrice: 149.99, category: 'parts', taxable: true },
      { id: 'l-3', description: 'Nitrogen Fill', qty: 1, unitPrice: 15.99, category: 'addon', taxable: true },
      { id: 'l-4', description: 'Old Tire Disposal ×4', qty: 4, unitPrice: 3.99, category: 'addon', taxable: false },
    ],
    subtotal: 659.91, taxRate: 0.08, taxAmount: 54.00, tipAmount: 0, total: 713.91,
    paidAmount: 713.91, balance: 0, paymentMethod: 'stripe_terminal',
    editHistory: [],
    publicToken: 'tok_abc123',
    createdAt: '2026-06-05T12:00:00', paidAt: '2026-06-05T12:05:00', sentAt: '2026-06-05T12:06:00',
  },
  {
    id: 'inv-002', shopId: 'shop-1', visitId: 'v-001', customerId: 'cust-1',
    customerName: 'James Calloway', customerEmail: 'james.calloway@email.com',
    status: 'invoice',
    lines: [
      { id: 'l-5', description: '4-Tire Mount & Balance', qty: 1, unitPrice: 89.99, category: 'labor', taxable: true },
      { id: 'l-6', description: 'Goodyear Wrangler AT 265/70R17', qty: 4, unitPrice: 189.99, category: 'parts', taxable: true },
      { id: 'l-7', description: 'Old Tire Disposal ×4', qty: 4, unitPrice: 3.99, category: 'addon', taxable: false },
    ],
    subtotal: 849.91, taxRate: 0.08, taxAmount: 72.00, tipAmount: 0, total: 921.91,
    paidAmount: 0, balance: 921.91, paymentMethod: undefined,
    editHistory: [],
    publicToken: 'tok_def456',
    createdAt: '2026-06-10T14:22:00',
  },
  {
    id: 'est-001', shopId: 'shop-1', visitId: undefined, customerId: 'cust-3',
    customerName: 'Terrence Okafor', customerEmail: 'tokafor@fleetco.com',
    status: 'estimate',
    lines: [
      { id: 'l-8', description: 'Wheel Alignment – 4-wheel', qty: 1, unitPrice: 119.99, category: 'labor', taxable: true },
      { id: 'l-9', description: 'Alignment Check fee', qty: 1, unitPrice: 29.99, category: 'labor', taxable: true },
    ],
    subtotal: 149.98, taxRate: 0.08, taxAmount: 12.00, tipAmount: 0, total: 161.98,
    paidAmount: 0, balance: 161.98, paymentMethod: undefined,
    editHistory: [],
    publicToken: 'tok_ghi789',
    createdAt: '2026-06-13T16:00:00',
  },
];

// ─── Visit Photos (mock) ──────────────────────────────────────────────────────
export const VISIT_PHOTOS: VisitPhoto[] = [
  { id: 'ph-1', visitId: 'v-001', photoType: 'pre_install', url: '#', thumbnail: '📸', sizeKB: 1240, serverTimestamp: '2026-06-14T10:02:00', offlineQueued: false },
  { id: 'ph-2', visitId: 'v-001', photoType: 'pre_install', url: '#', thumbnail: '📸', sizeKB: 1180, serverTimestamp: '2026-06-14T10:03:00', offlineQueued: false },
  { id: 'ph-3', visitId: 'v-001', photoType: 'damage_pre', url: '#', thumbnail: '📸', sizeKB: 980, serverTimestamp: '2026-06-14T10:04:00', offlineQueued: true },
];

// ─── Truck Inventory ──────────────────────────────────────────────────────────
export const TRUCK_INVENTORY: TruckInventoryItem[] = [
  { id: 'ti-1', shopId: 'shop-1', technicianId: 'tech-1', date: '2026-06-14', sku: 'GY-265-70R17', partName: 'Goodyear Wrangler AT 265/70R17', qtyLoaded: 4, qtyUsed: 4, qtyRemaining: 0, visitId: 'v-001' },
  { id: 'ti-2', shopId: 'shop-1', technicianId: 'tech-1', date: '2026-06-14', sku: 'PATCH-KIT', partName: 'Tire Plug/Patch Kit', qtyLoaded: 5, qtyUsed: 0, qtyRemaining: 5 },
  { id: 'ti-3', shopId: 'shop-1', technicianId: 'tech-1', date: '2026-06-14', sku: 'MI-255-45R19', partName: 'Michelin Pilot Sport 4S 255/45R19', qtyLoaded: 4, qtyUsed: 0, qtyRemaining: 4 },
  { id: 'ti-4', shopId: 'shop-1', technicianId: 'tech-3', date: '2026-06-14', sku: 'PATCH-KIT', partName: 'Tire Plug/Patch Kit', qtyLoaded: 6, qtyUsed: 1, qtyRemaining: 5, visitId: 'dv-002' },
  { id: 'ti-5', shopId: 'shop-1', technicianId: 'tech-3', date: '2026-06-14', sku: 'MI-LT225-75R16C', partName: 'Michelin Agilis CrossClimate LT225/75R16', qtyLoaded: 4, qtyUsed: 0, qtyRemaining: 4 },
  { id: 'ti-6', shopId: 'shop-1', technicianId: 'tech-2', date: '2026-06-14', sku: 'TPMS-GM-2020', partName: 'GM TPMS Sensor 2020', qtyLoaded: 4, qtyUsed: 0, qtyRemaining: 4 },
];

// ─── Mid-Job Authorizations ───────────────────────────────────────────────────
export const MID_JOB_AUTHS: MidJobAuth[] = [
  {
    id: 'mja-1', visitId: 'v-001', visitSummary: 'James Calloway – 4-Tire M&B (F-150)',
    customerName: 'James Calloway', customerPhone: '+27 11 555 0142',
    proposedBy: 'Mike Torres',
    description: 'Found corrosion on left front wheel hub. Recommend hub cleaning + anti-seize before install.',
    photos: ['📸', '📸'], rootCause: 'Salt/moisture corrosion from winter roads',
    price: 45.00, status: 'pending', publicToken: 'auth_xyz123',
    requestedAt: '2026-06-14T10:18:00', timeoutMinutes: 15,
  },
  {
    id: 'mja-2', visitId: 'v-005', visitSummary: 'Maria Reyes – 4-Tire M&B (Camry)',
    customerName: 'Maria Reyes', customerPhone: '+27 12 555 0278',
    proposedBy: 'Mike Torres',
    description: 'Valve stem on rear right severely cracked. Recommend replacing all 4.',
    photos: ['📸'], rootCause: 'Age-related rubber degradation (~5 years old)',
    price: 23.96, status: 'approved', publicToken: 'auth_abc456',
    requestedAt: '2026-06-05T11:22:00', respondedAt: '2026-06-05T11:28:00', timeoutMinutes: 15,
  },
];

// ─── Recommendations ──────────────────────────────────────────────────────────
export const RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'rec-1', shopId: 'shop-1', visitId: 'v-005', customerId: 'cust-2',
    customerName: 'Maria Reyes', type: 'Wheel Alignment',
    notes: 'Left front pulling slightly. Recommend 4-wheel alignment within 60 days.',
    followUpDate: '2026-08-05', status: 'pending', photoIds: [],
    createdAt: '2026-06-05T12:00:00',
  },
  {
    id: 'rec-2', shopId: 'shop-1', visitId: 'v-006', customerId: 'cust-3',
    customerName: 'Terrence Okafor', type: 'Full Tire Replacement',
    notes: 'Fleet Unit 2 showing sidewall cracking on all 4. Recommend full set within 30 days.',
    followUpDate: '2026-07-01', status: 'booked', photoIds: ['ph-1'],
    createdAt: '2026-06-01T08:30:00',
  },
  {
    id: 'rec-3', shopId: 'shop-1', visitId: 'v-001', customerId: 'cust-1',
    customerName: 'James Calloway', type: 'TPMS Sensor Replacement',
    notes: 'Right front TPMS sensor battery reading low. Will likely fail in 3-6 months.',
    followUpDate: '2026-09-14', status: 'pending', photoIds: [],
    createdAt: '2026-06-14T10:05:00',
  },
];

// ─── Damage Claims ────────────────────────────────────────────────────────────
export const DAMAGE_CLAIMS: DamageClaim[] = [
  {
    id: 'claim-1', shopId: 'shop-1', visitId: 'v-001',
    visitSummary: 'James Calloway – 4-Tire M&B – June 14',
    customerId: 'cust-1', customerName: 'James Calloway',
    category: 'Wheel Damage', description: 'Customer reports small scratch on rear passenger rim after service.',
    photos: ['📸', '📸'], preferredResolution: 'Repair or replace wheel',
    status: 'received', internalNotes: '',
    createdAt: '2026-06-14T13:00:00', updatedAt: '2026-06-14T13:00:00',
  },
  {
    id: 'claim-2', shopId: 'shop-1', visitId: 'v-005',
    visitSummary: 'Maria Reyes – 4-Tire M&B – June 5',
    customerId: 'cust-2', customerName: 'Maria Reyes',
    category: 'TPMS Warning Light', description: 'TPMS light came on 2 days after install. Customer says it was not on before.',
    photos: ['📸'], preferredResolution: 'Inspect and reset at no charge',
    status: 'resolved', internalNotes: 'Sensors needed re-pairing after cold weather. Resolved via remote TPMS reset.',
    createdAt: '2026-06-07T10:00:00', updatedAt: '2026-06-08T14:00:00',
  },
];

// ─── Time Entries ─────────────────────────────────────────────────────────────
export const TIME_ENTRIES: TimeEntry[] = [
  {
    id: 'te-1', technicianId: 'tech-1', technicianName: 'Mike Torres',
    visitId: 'v-001', visitSummary: 'James Calloway – 4-Tire M&B',
    clockIn: '2026-06-14T09:30:00', clockOut: undefined,
    breakMinutes: 0, totalMinutes: undefined, geofenceTriggered: true,
  },
  {
    id: 'te-2', technicianId: 'tech-3', technicianName: 'Carlos Rivera',
    visitId: 'dv-002', visitSummary: 'Fleet Unit 7 – Mobile Flat Repair',
    clockIn: '2026-06-14T08:45:00', clockOut: undefined,
    breakMinutes: 0, totalMinutes: undefined, geofenceTriggered: false,
  },
  {
    id: 'te-3', technicianId: 'tech-2', technicianName: 'Sarah Chen',
    visitId: 'dv-001', visitSummary: 'Maria Reyes – Tire Rotation',
    clockIn: '2026-06-14T08:20:00', clockOut: '2026-06-14T09:05:00',
    breakMinutes: 0, totalMinutes: 45, geofenceTriggered: true,
  },
  {
    id: 'te-4', technicianId: 'tech-1', technicianName: 'Mike Torres',
    clockIn: '2026-06-05T10:50:00', clockOut: '2026-06-05T12:10:00',
    visitId: 'v-005', visitSummary: 'Maria Reyes – 4-Tire M&B',
    breakMinutes: 0, totalMinutes: 80, geofenceTriggered: true,
  },
];

// ─── Commissions ──────────────────────────────────────────────────────────────
export const COMMISSION_ENTRIES: CommissionEntry[] = [
  { id: 'cm-1', shopId: 'shop-1', visitId: 'v-005', visitSummary: 'Reyes – 4-Tire M&B', userId: 'tech-1', userName: 'Mike Torres', role: 'Technician', amount: 42.84, period: '2026-06', ruleId: 'rule-1', createdAt: '2026-06-05T12:05:00' },
  { id: 'cm-2', shopId: 'shop-1', visitId: 'v-005', visitSummary: 'Reyes – 4-Tire M&B', userId: 'tech-4', userName: 'Derek Smith', role: 'Service Writer', amount: 28.56, period: '2026-06', ruleId: 'rule-2', createdAt: '2026-06-05T12:05:00' },
  { id: 'cm-3', shopId: 'shop-1', visitId: 'v-006', visitSummary: 'Okafor – Rotation', userId: 'tech-3', userName: 'Carlos Rivera', role: 'Technician', amount: 1.30, period: '2026-06', ruleId: 'rule-1', createdAt: '2026-06-01T08:30:00' },
  { id: 'cm-4', shopId: 'shop-1', visitId: 'v-001', visitSummary: 'Calloway – 4-Tire M&B', userId: 'tech-1', userName: 'Mike Torres', role: 'Technician', amount: 55.31, period: '2026-06', ruleId: 'rule-1', createdAt: '2026-06-14T11:00:00' },
];

export const { NOW_HOUR_FOR_DISPATCH } = { NOW_HOUR_FOR_DISPATCH: NOW_HOUR };

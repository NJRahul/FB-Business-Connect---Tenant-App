import type {
  ServiceType, AddonService, Technician, Visit, JobTemplate,
  CustomerRecord, BookableSlot, DayAvailability,
} from './types';

// ─── Service Types ────────────────────────────────────────────────────────────

export const SERVICE_TYPES: ServiceType[] = [
  {
    id: 'st-1', name: '4-Tire Mount & Balance', durationMinutes: 60, price: 89.99,
    requiresParts: true, onlineBookable: true, skillRequired: 'Tire Technician',
    pattern: 'Parts-Install', slotModel: 'precise',
    vehicleDurationOverrides: [{ attribute: 'dual-rear-wheel', durationMinutes: 90 }],
    addonIds: ['ao-1', 'ao-2', 'ao-3', 'ao-4'], description: 'Full 4-tire install with mounting and balancing.',
  },
  {
    id: 'st-2', name: 'Single Tire Mount & Balance', durationMinutes: 20, price: 24.99,
    requiresParts: true, onlineBookable: true, skillRequired: 'Tire Technician',
    pattern: 'Parts-Install', slotModel: 'precise',
    vehicleDurationOverrides: [], addonIds: ['ao-1', 'ao-3'],
    description: 'Mount and balance a single tire.',
  },
  {
    id: 'st-3', name: 'Tire Rotation', durationMinutes: 30, price: 19.99,
    requiresParts: false, onlineBookable: true, skillRequired: 'Tire Technician',
    pattern: 'No-Parts', slotModel: 'time-slot',
    vehicleDurationOverrides: [], addonIds: ['ao-4'],
    description: 'Rotate all 4 tires to even wear.',
  },
  {
    id: 'st-4', name: 'Tire Balance Only', durationMinutes: 20, price: 14.99,
    requiresParts: false, onlineBookable: true, skillRequired: 'Tire Technician',
    pattern: 'No-Parts', slotModel: 'time-slot',
    vehicleDurationOverrides: [], addonIds: [],
    description: 'Balance all 4 tires on the vehicle.',
  },
  {
    id: 'st-5', name: 'TPMS Reset', durationMinutes: 15, price: 9.99,
    requiresParts: false, onlineBookable: true, skillRequired: 'TPMS Specialist',
    pattern: 'No-Parts', slotModel: 'time-slot',
    vehicleDurationOverrides: [], addonIds: [],
    description: 'Reset tire pressure monitoring system after tire change.',
  },
  {
    id: 'st-6', name: 'TPMS Sensor Replacement', durationMinutes: 30, price: 49.99,
    requiresParts: true, onlineBookable: true, skillRequired: 'TPMS Specialist',
    pattern: 'Parts-Install', slotModel: 'precise',
    vehicleDurationOverrides: [], addonIds: ['ao-4'],
    description: 'Replace one or more TPMS sensors.',
  },
  {
    id: 'st-7', name: 'Flat Tire Repair', durationMinutes: 30, price: 29.99,
    requiresParts: true, onlineBookable: true, skillRequired: 'Tire Technician',
    pattern: 'Parts-Install', slotModel: 'time-slot',
    vehicleDurationOverrides: [], addonIds: ['ao-3'],
    description: 'Plug or patch a repairable flat tire.',
  },
  {
    id: 'st-8', name: 'Mobile Flat Repair', durationMinutes: 45, price: 59.99,
    requiresParts: true, onlineBookable: true, skillRequired: 'Tire Technician',
    pattern: 'Parts-Install', slotModel: 'precise',
    vehicleDurationOverrides: [], addonIds: [],
    description: 'Mobile on-site flat tire repair at customer location.',
  },
];

// ─── Add-on Services ─────────────────────────────────────────────────────────

export const ADDON_SERVICES: AddonService[] = [
  { id: 'ao-1', name: 'Nitrogen Fill', durationMinutes: 5, price: 15.99, description: 'Inflate all tires with nitrogen for better pressure retention.', perUnit: false },
  { id: 'ao-2', name: 'Road Hazard Warranty', durationMinutes: 0, price: 49.99, description: 'Per-tire warranty covering road hazard damage for 1 year.', perUnit: true },
  { id: 'ao-3', name: 'Old Tire Disposal', durationMinutes: 0, price: 3.99, description: 'Eco-certified disposal of old tires.', perUnit: true },
  { id: 'ao-4', name: 'Valve Stem Replacement', durationMinutes: 5, price: 5.99, description: 'Replace all valve stems with new rubber stems.', perUnit: true },
];

// ─── Technicians ──────────────────────────────────────────────────────────────

export const TECHNICIANS: Technician[] = [
  {
    id: 'tech-1', name: 'Mike Torres', email: 'mike@fb-business-connect.app', phone: '+27 11 201 1111',
    skills: ['Tire Technician', 'TPMS Specialist'],
    customerFacing: true,
    serviceArea: ['75001', '75002', '75006', '75010', '75019'],
    color: '#C0392B',
    availability: [
      { dayOfWeek: 1, startTime: '08:00', endTime: '17:00', lunchStart: '12:00', lunchEnd: '13:00' },
      { dayOfWeek: 2, startTime: '08:00', endTime: '17:00', lunchStart: '12:00', lunchEnd: '13:00' },
      { dayOfWeek: 3, startTime: '08:00', endTime: '17:00', lunchStart: '12:00', lunchEnd: '13:00' },
      { dayOfWeek: 4, startTime: '08:00', endTime: '17:00', lunchStart: '12:00', lunchEnd: '13:00' },
      { dayOfWeek: 5, startTime: '08:00', endTime: '15:00' },
    ],
    timeOff: [
      { id: 'to-1', dateFrom: '2026-06-22', dateTo: '2026-06-24', reason: 'Vacation' },
    ],
    buffers: [
      { serviceTypeId: 'st-8', travelBefore: 20, cleanupAfter: 10 },
      { serviceTypeId: 'st-1', travelBefore: 0, cleanupAfter: 15 },
    ],
  },
  {
    id: 'tech-2', name: 'Sarah Chen', email: 'sarah@fb-business-connect.app', phone: '+27 11 201 2222',
    skills: ['Tire Technician', 'TPMS Specialist', 'Alignment Tech'],
    customerFacing: true,
    serviceArea: ['75001', '75002', '75006', '75010'],
    color: '#2980B9',
    availability: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', lunchStart: '13:00', lunchEnd: '14:00' },
      { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', lunchStart: '13:00', lunchEnd: '14:00' },
      { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', lunchStart: '13:00', lunchEnd: '14:00' },
      { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', lunchStart: '13:00', lunchEnd: '14:00' },
      { dayOfWeek: 6, startTime: '09:00', endTime: '14:00' },
    ],
    timeOff: [],
    buffers: [
      { serviceTypeId: 'st-8', travelBefore: 20, cleanupAfter: 10 },
    ],
  },
  {
    id: 'tech-3', name: 'Carlos Rivera', email: 'carlos@fb-business-connect.app', phone: '+27 11 201 3333',
    skills: ['Tire Technician'],
    customerFacing: true,
    serviceArea: ['75001', '75002', '75006', '75010', '75019', '75038'],
    color: '#27AE60',
    availability: [
      { dayOfWeek: 2, startTime: '07:00', endTime: '16:00', lunchStart: '11:30', lunchEnd: '12:30' },
      { dayOfWeek: 3, startTime: '07:00', endTime: '16:00', lunchStart: '11:30', lunchEnd: '12:30' },
      { dayOfWeek: 4, startTime: '07:00', endTime: '16:00', lunchStart: '11:30', lunchEnd: '12:30' },
      { dayOfWeek: 5, startTime: '07:00', endTime: '16:00', lunchStart: '11:30', lunchEnd: '12:30' },
      { dayOfWeek: 6, startTime: '08:00', endTime: '13:00' },
    ],
    timeOff: [],
    buffers: [
      { serviceTypeId: 'st-8', travelBefore: 25, cleanupAfter: 10 },
      { serviceTypeId: 'st-1', travelBefore: 0, cleanupAfter: 10 },
    ],
  },
  {
    id: 'tech-4', name: 'Derek Smith', email: 'derek@fb-business-connect.app', phone: '+27 11 201 4444',
    skills: ['Dispatcher'],
    customerFacing: false,
    serviceArea: [],
    color: '#8E44AD',
    availability: [
      { dayOfWeek: 1, startTime: '08:00', endTime: '17:00' },
      { dayOfWeek: 2, startTime: '08:00', endTime: '17:00' },
      { dayOfWeek: 3, startTime: '08:00', endTime: '17:00' },
      { dayOfWeek: 4, startTime: '08:00', endTime: '17:00' },
      { dayOfWeek: 5, startTime: '08:00', endTime: '17:00' },
    ],
    timeOff: [],
    buffers: [],
  },
];

// ─── Job Templates ────────────────────────────────────────────────────────────

export const JOB_TEMPLATES: JobTemplate[] = [
  {
    id: 'jt-1', name: '4-Tire Install with M&B', icon: '🛞',
    serviceTypeId: 'st-1', serviceTypeName: '4-Tire Mount & Balance',
    description: 'Full 4-tire replacement with mount, balance, and disposal. Most common job.',
    parts: [{ sku: 'TIRE-BLANK', name: '(Select tire size)', qty: 4, supplier: 'local', supplierName: 'TirePlus Local', unitPrice: 0 }],
    laborMinutes: 60, price: 89.99,
    recommendedAddonIds: ['ao-1', 'ao-2', 'ao-3'],
  },
  {
    id: 'jt-2', name: 'Single Tire Replacement', icon: '🔧',
    serviceTypeId: 'st-2', serviceTypeName: 'Single Tire Mount & Balance',
    description: 'Replace one tire — spare, blowout, or mismatched set.',
    parts: [{ sku: 'TIRE-BLANK', name: '(Select tire size)', qty: 1, supplier: 'local', supplierName: 'TirePlus Local', unitPrice: 0 }],
    laborMinutes: 20, price: 24.99,
    recommendedAddonIds: ['ao-3'],
  },
  {
    id: 'jt-3', name: 'Rotation', icon: '🔄',
    serviceTypeId: 'st-3', serviceTypeName: 'Tire Rotation',
    description: 'Standard rotation — no parts needed.',
    parts: [],
    laborMinutes: 30, price: 19.99,
    recommendedAddonIds: ['ao-4'],
  },
  {
    id: 'jt-4', name: 'TPMS Reset', icon: '📡',
    serviceTypeId: 'st-5', serviceTypeName: 'TPMS Reset',
    description: 'Reset TPMS after new tires or sensor battery swap.',
    parts: [],
    laborMinutes: 15, price: 9.99,
    recommendedAddonIds: [],
  },
  {
    id: 'jt-5', name: 'Mobile Flat Repair', icon: '🚐',
    serviceTypeId: 'st-8', serviceTypeName: 'Mobile Flat Repair',
    description: 'On-site mobile flat repair — we come to the customer.',
    parts: [{ sku: 'PATCH-KIT', name: 'Tire Plug/Patch Kit', qty: 1, supplier: 'local', supplierName: 'TirePlus Local', unitPrice: 8.99 }],
    laborMinutes: 45, price: 59.99,
    recommendedAddonIds: [],
  },
];

// ─── Customer Records ─────────────────────────────────────────────────────────

export const CUSTOMERS: CustomerRecord[] = [
  {
    id: 'cust-1', name: 'James Calloway', email: 'james.calloway@email.com', phone: '+27 11 555 0142',
    address: '12 Sandton Drive, Sandton, GP 2196',
    vehicles: [
      { year: '2022', make: 'Ford', model: 'F-150', trim: 'XLT', licensePlate: 'TX-ABC123' },
      { year: '2019', make: 'Honda', model: 'Accord', trim: 'EX', licensePlate: 'TX-XYZ789' },
    ],
    memberSince: '2024-03-15', totalVisits: 7, totalSpent: 1248.50,
  },
  {
    id: 'cust-2', name: 'Maria Reyes', email: 'maria.reyes@email.com', phone: '+27 12 555 0278',
    address: '45 Long Street, Cape Town, WC 8001',
    vehicles: [
      { year: '2021', make: 'Toyota', model: 'Camry', trim: 'SE', licensePlate: 'TX-DEF456' },
    ],
    memberSince: '2025-01-08', totalVisits: 3, totalSpent: 349.97,
  },
  {
    id: 'cust-3', name: 'Terrence Okafor', email: 'tokafor@fleetco.com', phone: '+27 21 555 0391',
    address: '88 Commissioner Street, Johannesburg, GP 2001',
    vehicles: [
      { year: '2023', make: 'Ram', model: '2500', trim: 'Tradesman', licensePlate: 'TX-FLT001', attribute: 'dual-rear-wheel' },
      { year: '2023', make: 'Ram', model: '2500', trim: 'Tradesman', licensePlate: 'TX-FLT002', attribute: 'dual-rear-wheel' },
    ],
    memberSince: '2024-09-01', totalVisits: 12, totalSpent: 4820.00,
  },
];

// ─── Visits ───────────────────────────────────────────────────────────────────
// Today: 2026-06-14 (Sun). Upcoming Mon = 06-15

export const VISITS: Visit[] = [
  // ── Today (in-progress) ──
  {
    id: 'v-001', shopId: 'shop-1', customerId: 'cust-1', customerName: 'James Calloway',
    customerPhone: '+27 11 555 0142', customerEmail: 'james.calloway@email.com',
    serviceTypeId: 'st-1', serviceTypeName: '4-Tire Mount & Balance',
    scheduledStart: '2026-06-14T10:00:00', scheduledEnd: '2026-06-14T11:00:00',
    technicianId: 'tech-1', technicianName: 'Mike Torres',
    serviceAddress: '12 Sandton Drive, Sandton, GP 2196', operationsType: 'mobile',
    vehicle: { year: '2022', make: 'Ford', model: 'F-150', trim: 'XLT', licensePlate: 'TX-ABC123' },
    partsRequired: [{ sku: 'GY-265-70R17', name: 'Goodyear Wrangler AT 265/70R17', qty: 4, supplier: 'local', supplierName: 'TirePlus Local', etaDate: '2026-06-13', unitPrice: 189.99 }],
    partsStatus: 'ready', visitState: 'in_progress',
    addons: [{ id: 'ao-3', name: 'Old Tire Disposal', durationMinutes: 0, price: 3.99, qty: 4 }],
    notes: 'Customer will be home all day. Gate code: 1234.',
    paymentMethod: undefined, totalPrice: 921.91, laborPrice: 89.99, partsPrice: 759.96, taxAmount: 72.96,
    createdAt: '2026-06-10T14:22:00',
  },
  // ── Upcoming Mon June 15 ──
  {
    id: 'v-002', shopId: 'shop-1', customerId: 'cust-2', customerName: 'Maria Reyes',
    customerPhone: '+27 12 555 0278', customerEmail: 'maria.reyes@email.com',
    serviceTypeId: 'st-3', serviceTypeName: 'Tire Rotation',
    scheduledStart: '2026-06-15T09:00:00', scheduledEnd: '2026-06-15T09:30:00',
    technicianId: 'tech-2', technicianName: 'Sarah Chen',
    serviceAddress: '123 Main Road, Johannesburg, GP 2001', operationsType: 'inshop',
    vehicle: { year: '2021', make: 'Toyota', model: 'Camry', trim: 'SE', licensePlate: 'TX-DEF456' },
    partsRequired: [], partsStatus: 'not_required', visitState: 'scheduled',
    addons: [], notes: '',
    paymentMethod: undefined, totalPrice: 21.59, laborPrice: 19.99, partsPrice: 0, taxAmount: 1.60,
    createdAt: '2026-06-12T09:45:00',
  },
  {
    id: 'v-003', shopId: 'shop-1', customerId: 'cust-3', customerName: 'Terrence Okafor',
    customerPhone: '+27 21 555 0391', customerEmail: 'tokafor@fleetco.com',
    serviceTypeId: 'st-1', serviceTypeName: '4-Tire Mount & Balance',
    scheduledStart: '2026-06-15T10:00:00', scheduledEnd: '2026-06-15T11:30:00',
    technicianId: 'tech-1', technicianName: 'Mike Torres',
    serviceAddress: '88 Commissioner Street, Johannesburg, GP 2001', operationsType: 'inshop',
    vehicle: { year: '2023', make: 'Ram', model: '2500', trim: 'Tradesman', licensePlate: 'TX-FLT001', attribute: 'dual-rear-wheel' },
    partsRequired: [{ sku: 'MI-265-70R17E', name: 'Michelin Defender LTX M/S 265/70R17', qty: 4, supplier: 'national', supplierName: 'NTW National', etaDate: '2026-06-14', unitPrice: 229.99 }],
    partsStatus: 'arrived', visitState: 'parts_ready',
    addons: [
      { id: 'ao-3', name: 'Old Tire Disposal', durationMinutes: 0, price: 3.99, qty: 4 },
      { id: 'ao-4', name: 'Valve Stem Replacement', durationMinutes: 5, price: 5.99, qty: 4 },
    ],
    notes: 'Fleet account. Invoice to FleetCo Inc. PO# 88472.',
    paymentMethod: undefined, totalPrice: 1083.88, laborPrice: 89.99, partsPrice: 919.96, taxAmount: 73.93,
    createdAt: '2026-06-11T11:00:00',
  },
  // ── Parts Pending ──
  {
    id: 'v-004', shopId: 'shop-1', customerId: 'cust-1', customerName: 'James Calloway',
    customerPhone: '+27 11 555 0142', customerEmail: 'james.calloway@email.com',
    serviceTypeId: 'st-6', serviceTypeName: 'TPMS Sensor Replacement',
    scheduledStart: '2026-06-17T14:00:00', scheduledEnd: '2026-06-17T14:30:00',
    technicianId: 'tech-2', technicianName: 'Sarah Chen',
    serviceAddress: '12 Sandton Drive, Sandton, GP 2196', operationsType: 'mobile',
    vehicle: { year: '2022', make: 'Ford', model: 'F-150', trim: 'XLT', licensePlate: 'TX-ABC123' },
    partsRequired: [{ sku: 'TPMS-F150-22', name: 'OEM TPMS Sensor Ford F-150 2022', qty: 1, supplier: 'special', supplierName: 'Ford Parts Direct', etaDate: '2026-06-16', unitPrice: 89.99 }],
    partsStatus: 'ordered', visitState: 'parts_pending',
    addons: [], notes: 'Left rear sensor failed. Customer reported TPMS warning.',
    paymentMethod: undefined, totalPrice: 151.48, laborPrice: 49.99, partsPrice: 89.99, taxAmount: 11.50,
    createdAt: '2026-06-13T16:30:00',
  },
  // ── Completed visits ──
  {
    id: 'v-005', shopId: 'shop-1', customerId: 'cust-2', customerName: 'Maria Reyes',
    customerPhone: '+27 12 555 0278', customerEmail: 'maria.reyes@email.com',
    serviceTypeId: 'st-1', serviceTypeName: '4-Tire Mount & Balance',
    scheduledStart: '2026-06-05T11:00:00', scheduledEnd: '2026-06-05T12:00:00',
    technicianId: 'tech-1', technicianName: 'Mike Torres',
    serviceAddress: '45 Long Street, Cape Town, WC 8001', operationsType: 'inshop',
    vehicle: { year: '2021', make: 'Toyota', model: 'Camry', trim: 'SE', licensePlate: 'TX-DEF456' },
    partsRequired: [{ sku: 'BS-225-55R17', name: 'Bridgestone Turanza QuietTrack 225/55R17', qty: 4, supplier: 'local', supplierName: 'TirePlus Local', etaDate: '2026-06-04', unitPrice: 149.99 }],
    partsStatus: 'ready', visitState: 'completed',
    addons: [
      { id: 'ao-1', name: 'Nitrogen Fill', durationMinutes: 5, price: 15.99, qty: 1 },
      { id: 'ao-3', name: 'Old Tire Disposal', durationMinutes: 0, price: 3.99, qty: 4 },
    ],
    notes: '', paymentMethod: 'stripe_terminal',
    totalPrice: 713.91, laborPrice: 89.99, partsPrice: 599.96, taxAmount: 54.96,
    createdAt: '2026-06-01T08:00:00',
  },
  {
    id: 'v-006', shopId: 'shop-1', customerId: 'cust-3', customerName: 'Terrence Okafor',
    customerPhone: '+27 21 555 0391', customerEmail: 'tokafor@fleetco.com',
    serviceTypeId: 'st-3', serviceTypeName: 'Tire Rotation',
    scheduledStart: '2026-06-01T08:00:00', scheduledEnd: '2026-06-01T08:30:00',
    technicianId: 'tech-3', technicianName: 'Carlos Rivera',
    serviceAddress: '88 Commissioner Street, Johannesburg, GP 2001', operationsType: 'inshop',
    vehicle: { year: '2023', make: 'Ram', model: '2500', trim: 'Tradesman', licensePlate: 'TX-FLT002' },
    partsRequired: [], partsStatus: 'not_required', visitState: 'completed',
    addons: [], notes: '', paymentMethod: 'paid_offline',
    totalPrice: 21.59, laborPrice: 19.99, partsPrice: 0, taxAmount: 1.60,
    createdAt: '2026-05-28T10:00:00',
  },
  // ── Upcoming later this month ──
  {
    id: 'v-007', shopId: 'shop-1', customerId: 'cust-2', customerName: 'Maria Reyes',
    customerPhone: '+27 12 555 0278', customerEmail: 'maria.reyes@email.com',
    serviceTypeId: 'st-5', serviceTypeName: 'TPMS Reset',
    scheduledStart: '2026-06-18T13:00:00', scheduledEnd: '2026-06-18T13:15:00',
    technicianId: 'tech-2', technicianName: 'Sarah Chen',
    serviceAddress: '45 Long Street, Cape Town, WC 8001', operationsType: 'inshop',
    vehicle: { year: '2021', make: 'Toyota', model: 'Camry', trim: 'SE', licensePlate: 'TX-DEF456' },
    partsRequired: [], partsStatus: 'not_required', visitState: 'scheduled',
    addons: [], notes: 'Follow-up after tire install on 6/5.',
    paymentMethod: undefined, totalPrice: 10.79, laborPrice: 9.99, partsPrice: 0, taxAmount: 0.80,
    createdAt: '2026-06-05T12:10:00',
  },
  // ── Cancelled ──
  {
    id: 'v-008', shopId: 'shop-1', customerId: 'cust-1', customerName: 'James Calloway',
    customerPhone: '+27 11 555 0142', customerEmail: 'james.calloway@email.com',
    serviceTypeId: 'st-7', serviceTypeName: 'Flat Tire Repair',
    scheduledStart: '2026-06-08T15:00:00', scheduledEnd: '2026-06-08T15:30:00',
    technicianId: 'tech-3', technicianName: 'Carlos Rivera',
    serviceAddress: '12 Sandton Drive, Sandton, GP 2196', operationsType: 'mobile',
    vehicle: { year: '2019', make: 'Honda', model: 'Accord', trim: 'EX', licensePlate: 'TX-XYZ789' },
    partsRequired: [], partsStatus: 'not_required', visitState: 'cancelled',
    addons: [], notes: 'Customer cancelled — got roadside assistance instead.',
    paymentMethod: undefined, totalPrice: 0, laborPrice: 29.99, partsPrice: 0, taxAmount: 0,
    createdAt: '2026-06-07T18:00:00',
  },
];

// ─── Slot Computation ─────────────────────────────────────────────────────────

function addDays(base: Date, n: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function dayOfWeek(dateStr: string): number {
  return new Date(dateStr + 'T12:00:00').getDay();
}

// Returns array of { date, hasSlots, slotCount, partsReady, bookingCount }
export function computeDayAvailability(
  serviceTypeId: string,
  referenceDate: Date = new Date('2026-06-14'),
): DayAvailability[] {
  const st = SERVICE_TYPES.find(s => s.id === serviceTypeId)!;
  const result: DayAvailability[] = [];

  for (let i = 0; i < 30; i++) {
    const d = addDays(referenceDate, i);
    const dateStr = toDateStr(d);
    const dow = dayOfWeek(dateStr) as 0 | 1 | 2 | 3 | 4 | 5 | 6;

    const availTechs = TECHNICIANS.filter(t => {
      if (!t.customerFacing) return false;
      if (!t.skills.includes(st.skillRequired)) return false;
      const avail = t.availability.find(a => a.dayOfWeek === dow);
      if (!avail) return false;
      const onTimeOff = t.timeOff.some(to => dateStr >= to.dateFrom && dateStr <= to.dateTo);
      return !onTimeOff;
    });

    const bookingsOnDay = VISITS.filter(v =>
      v.scheduledStart.startsWith(dateStr) &&
      !['cancelled', 'no_show'].includes(v.visitState),
    );

    const hasSlots = availTechs.length > 0;
    const slotCount = availTechs.length > 0 ? Math.max(0, availTechs.length * 4 - bookingsOnDay.length) : 0;

    // Parts ETA: if requiresParts, earliest slot is 2 days out
    const partsReady = !st.requiresParts || i >= 2;

    result.push({ date: dateStr, hasSlots: hasSlots && slotCount > 0, slotCount, partsReady, bookingCount: bookingsOnDay.length });
  }

  return result;
}

// Returns time slots for a given day and service type
export function computeDaySlots(
  dateStr: string,
  serviceTypeId: string,
): BookableSlot[] {
  const st = SERVICE_TYPES.find(s => s.id === serviceTypeId)!;
  const dow = dayOfWeek(dateStr) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
  const slots: BookableSlot[] = [];

  const availTechs = TECHNICIANS.filter(t => {
    if (!t.customerFacing) return false;
    if (!t.skills.includes(st.skillRequired)) return false;
    const avail = t.availability.find(a => a.dayOfWeek === dow);
    if (!avail) return false;
    const onTimeOff = t.timeOff.some(to => dateStr >= to.dateFrom && dateStr <= to.dateTo);
    return !onTimeOff;
  });

  for (const tech of availTechs) {
    const avail = tech.availability.find(a => a.dayOfWeek === dow)!;
    const [sh, sm] = avail.startTime.split(':').map(Number);
    const [eh, em] = avail.endTime.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;

    const lunchStart = avail.lunchStart ? (() => { const [h, m] = avail.lunchStart!.split(':').map(Number); return h * 60 + m; })() : null;
    const lunchEnd = avail.lunchEnd ? (() => { const [h, m] = avail.lunchEnd!.split(':').map(Number); return h * 60 + m; })() : null;

    const techBookings = VISITS.filter(v =>
      v.technicianId === tech.id &&
      v.scheduledStart.startsWith(dateStr) &&
      !['cancelled', 'no_show'].includes(v.visitState),
    );

    for (let slotStart = startMin; slotStart + st.durationMinutes <= endMin; slotStart += 30) {
      const slotEnd = slotStart + st.durationMinutes;

      // Skip lunch
      if (lunchStart !== null && lunchEnd !== null) {
        if (slotStart < lunchEnd && slotEnd > lunchStart) continue;
      }

      // Check if any existing booking overlaps
      const buffer = tech.buffers.find(b => b.serviceTypeId === serviceTypeId);
      const bufferBefore = buffer?.travelBefore ?? 0;
      const bufferAfter = buffer?.cleanupAfter ?? 0;
      const effectiveStart = slotStart - bufferBefore;
      const effectiveEnd = slotEnd + bufferAfter;

      const overlaps = techBookings.some(b => {
        const bs = new Date(b.scheduledStart);
        const be = new Date(b.scheduledEnd);
        const bStartMin = bs.getHours() * 60 + bs.getMinutes();
        const bEndMin = be.getHours() * 60 + be.getMinutes();
        return effectiveStart < bEndMin && effectiveEnd > bStartMin;
      });

      const toHHMM = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
      const windowLabel = slotStart < 12 * 60 ? 'Morning' : slotStart < 15 * 60 ? 'Afternoon' : 'Evening';

      slots.push({
        slotStart: `${dateStr}T${toHHMM(slotStart)}:00`,
        slotEnd: `${dateStr}T${toHHMM(slotEnd)}:00`,
        technicianId: tech.id,
        technicianName: tech.name,
        available: !overlaps,
        partsBlocked: st.requiresParts && dateStr < '2026-06-16',
        windowLabel,
        windowType: st.slotModel,
      });
    }
  }

  // Deduplicate by time (keep first available per time slot)
  const seen = new Set<string>();
  return slots.filter(s => {
    const key = s.slotStart;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => a.slotStart.localeCompare(b.slotStart));
}

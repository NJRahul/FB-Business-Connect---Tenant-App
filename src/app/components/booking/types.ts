export type VisitState =
  | 'scheduled'
  | 'parts_pending'
  | 'parts_ready'
  | 'en_route'
  | 'on_site'
  | 'in_progress'
  | 'completed'
  | 'no_show'
  | 'cancelled';

export type PartsStatus =
  | 'not_required'
  | 'pending_order'
  | 'ordered'
  | 'in_transit'
  | 'arrived'
  | 'ready';

export type SlotModel = 'precise' | 'time-slot';
export type SegmentAccess = 'retail' | 'fleet' | 'mixed';
export type PaymentMethod = 'stripe_terminal' | 'tap_to_pay' | 'card_manual' | 'paid_offline';
export type OperationsType = 'mobile' | 'inshop';

export interface ServiceType {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  requiresParts: boolean;
  onlineBookable: boolean;
  skillRequired: string;
  pattern: 'Parts-Install' | 'No-Parts';
  vehicleDurationOverrides: VehicleDurationOverride[];
  addonIds: string[];
  slotModel: SlotModel;
  description: string;
}

export interface VehicleDurationOverride {
  attribute: string;
  durationMinutes: number;
}

export interface AddonService {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  description: string;
  perUnit: boolean;
}

export interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  customerFacing: boolean;
  serviceArea: string[];
  availability: TechnicianAvailability[];
  timeOff: TechnicianTimeOff[];
  buffers: TechBuffer[];
  color: string;
}

export interface TechnicianAvailability {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startTime: string;
  endTime: string;
  lunchStart?: string;
  lunchEnd?: string;
}

export interface TechnicianTimeOff {
  id: string;
  dateFrom: string;
  dateTo: string;
  reason: string;
}

export interface TechBuffer {
  serviceTypeId: string;
  travelBefore: number;
  cleanupAfter: number;
}

export interface Vehicle {
  year: string;
  make: string;
  model: string;
  trim?: string;
  licensePlate?: string;
  attribute?: string;
}

export interface PartItem {
  sku: string;
  name: string;
  qty: number;
  supplier: 'local' | 'national' | 'special';
  supplierName: string;
  etaDate?: string;
  unitPrice: number;
}

export interface VisitAddon {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  qty: number;
}

export interface Visit {
  id: string;
  shopId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceTypeId: string;
  serviceTypeName: string;
  scheduledStart: string;
  scheduledEnd: string;
  technicianId: string;
  technicianName: string;
  serviceAddress: string;
  operationsType: OperationsType;
  vehicle: Vehicle;
  partsRequired: PartItem[];
  partsStatus: PartsStatus;
  visitState: VisitState;
  addons: VisitAddon[];
  notes: string;
  overrideLog?: string;
  paymentMethod?: PaymentMethod;
  totalPrice: number;
  laborPrice: number;
  partsPrice: number;
  taxAmount: number;
  createdAt: string;
}

export interface BookableSlot {
  slotStart: string;
  slotEnd: string;
  technicianId: string;
  technicianName: string;
  available: boolean;
  partsEtaDate?: string;
  partsBlocked: boolean;
  windowLabel?: string;
  windowType: SlotModel;
  capacity?: number;
  remaining?: number;
}

export interface DayAvailability {
  date: string;
  hasSlots: boolean;
  slotCount: number;
  partsReady: boolean;
  bookingCount: number;
}

export interface JobTemplate {
  id: string;
  name: string;
  serviceTypeId: string;
  serviceTypeName: string;
  parts: PartItem[];
  laborMinutes: number;
  price: number;
  recommendedAddonIds: string[];
  vehicleFilters?: string;
  description: string;
  icon: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  vehicles: Vehicle[];
  memberSince: string;
  totalVisits: number;
  totalSpent: number;
}

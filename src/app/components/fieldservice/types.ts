import type { Visit, VisitState } from '../booking/types';
export type { Visit, VisitState };

// ─── Invoice / Estimate Lifecycle ────────────────────────────────────────────
export type InvoiceStatus = 'estimate' | 'invoice' | 'order' | 'refunded' | 'void';

export interface InvoiceLine {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  category: 'labor' | 'parts' | 'addon' | 'discount' | 'tip';
  taxable: boolean;
}

export interface InvoiceEdit {
  at: string;
  by: string;
  field: string;
  from: string;
  to: string;
}

export interface Invoice {
  id: string;
  shopId: string;
  visitId?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  status: InvoiceStatus;
  lines: InvoiceLine[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  tipAmount: number;
  total: number;
  paidAmount: number;
  balance: number;
  paymentMethod?: string;
  editHistory: InvoiceEdit[];
  publicToken?: string;
  createdAt: string;
  paidAt?: string;
  sentAt?: string;
}

// ─── Field Visit Attachments ─────────────────────────────────────────────────
export type PhotoType = 'pre_install' | 'post_install' | 'damage_pre' | 'damage_post' | 'other';

export interface VisitPhoto {
  id: string;
  visitId: string;
  photoType: PhotoType;
  url: string;        // simulated blob URL
  thumbnail: string;  // emoji placeholder in demo
  sizeKB: number;
  exifJson?: string;
  serverTimestamp: string;
  offlineQueued: boolean;
}

export interface VisitSignature {
  id: string;
  visitId: string;
  signedBy: string;
  svgData: string;    // base64-encoded SVG path data
  capturedAt: string;
}

// ─── Truck Inventory ─────────────────────────────────────────────────────────
export interface TruckInventoryItem {
  id: string;
  shopId: string;
  technicianId: string;
  date: string;
  sku: string;
  partName: string;
  qtyLoaded: number;
  qtyUsed: number;
  qtyRemaining: number;
  visitId?: string;   // which visit consumed it
}

// ─── GPS Tracking ─────────────────────────────────────────────────────────────
export interface TechLocation {
  technicianId: string;
  technicianName: string;
  lat: number;
  lng: number;
  capturedAt: string;
  onClock: boolean;
  currentVisitId?: string;
  color: string;
}

// ─── Mid-Job Authorization ────────────────────────────────────────────────────
export type AuthStatus = 'pending' | 'approved' | 'declined' | 'timeout' | 'bypassed';

export interface MidJobAuth {
  id: string;
  visitId: string;
  visitSummary: string;
  customerName: string;
  customerPhone: string;
  proposedBy: string;
  description: string;
  photos: string[];   // emoji placeholders in demo
  rootCause: string;
  price: number;
  status: AuthStatus;
  publicToken: string;
  requestedAt: string;
  respondedAt?: string;
  timeoutMinutes: number;
}

// ─── Recommendations ─────────────────────────────────────────────────────────
export type RecoStatus = 'pending' | 'booked' | 'declined' | 'no_response';

export interface Recommendation {
  id: string;
  shopId: string;
  visitId: string;
  customerId: string;
  customerName: string;
  type: string;
  notes: string;
  followUpDate: string;
  status: RecoStatus;
  photoIds: string[];
  createdAt: string;
}

// ─── Damage Claims ────────────────────────────────────────────────────────────
export type ClaimStatus =
  | 'received'
  | 'under_investigation'
  | 'awaiting_customer_info'
  | 'awaiting_parts'
  | 'resolved'
  | 'denied';

export interface DamageClaim {
  id: string;
  shopId: string;
  visitId: string;
  visitSummary: string;
  customerId: string;
  customerName: string;
  category: string;
  description: string;
  photos: string[];
  preferredResolution: string;
  status: ClaimStatus;
  internalNotes: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Time Tracking ────────────────────────────────────────────────────────────
export interface TimeEntry {
  id: string;
  technicianId: string;
  technicianName: string;
  visitId?: string;
  visitSummary?: string;
  clockIn: string;
  clockOut?: string;
  breakMinutes: number;
  totalMinutes?: number;
  geofenceTriggered: boolean;
  overrideLog?: string;
}

// ─── Commissions ─────────────────────────────────────────────────────────────
export interface CommissionRule {
  id: string;
  name: string;
  type: 'pct_revenue' | 'fixed_per_service' | 'pct_margin' | 'category_override';
  value: number;       // percentage (0–100) or fixed dollar
  category?: string;   // for category_override
}

export interface CommissionEntry {
  id: string;
  shopId: string;
  visitId: string;
  visitSummary: string;
  userId: string;
  userName: string;
  role: string;
  amount: number;
  period: string;  // e.g., "2026-06"
  ruleId: string;
  createdAt: string;
}

// ─── Dispatch board helper ────────────────────────────────────────────────────
export interface DispatchVisit extends Visit {
  atRisk: boolean;
  lateMinutes?: number;
  mapX?: number;  // normalized 0-100 for map view
  mapY?: number;
}

export type RecallSource = 'nhtsa_dot' | 'manufacturer' | 'distributor' | 'internal';
export type RecallSeverity = 'critical' | 'warning' | 'info';
export type RecallStatus = 'active' | 'resolved' | 'withdrawn';
export type MatchCertainty = 'confirmed' | 'uncertain';
export type MatchStatus = 'uncontacted' | 'notified' | 'acknowledged' | 'scheduled' | 'resolved' | 'declined';
export type OutreachChannel = 'sms' | 'email' | 'phone';

export interface AffectedDOTRange {
  plantCode?: string;
  weekFrom: string; // WWYY, e.g. "2415" = week 24 of 2015
  weekTo: string;
}

export interface AffectedVehicle {
  yearFrom: number;
  yearTo: number;
  make: string;
  model: string;
  trim: string;
}

export interface Recall {
  id: string;
  shopId: string | null; // null = platform-published
  source: RecallSource;
  title: string;
  description: string;
  severity: RecallSeverity;
  status: RecallStatus;
  affectedSkus: string[];
  affectedLots: string[];
  affectedDotRanges: AffectedDOTRange[];
  affectedVehicles: AffectedVehicle[];
  recommendedAction: string;
  effectiveFrom: string;
  effectiveTo?: string;
  publishedBy?: string;
  nhtsaCampaignId?: string;
  createdAt: string;
  affectedCustomerCount: number;
}

export interface RecallCustomerMatch {
  id: string;
  recallId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicle: string;
  productSold: string;
  sku: string;
  installDate: string;
  lastVisit: string;
  contactPreference: 'sms' | 'email' | 'both';
  matchCertainty: MatchCertainty;
  status: MatchStatus;
  notifiedAt?: string;
  resolvedAt?: string;
}

export interface RecallOutreachLog {
  id: string;
  recallId: string;
  customerId: string;
  customerName: string;
  channel: OutreachChannel;
  sentAt: string;
  deliveryStatus: 'delivered' | 'failed' | 'pending';
}

export interface NHTSAPendingRecall {
  id: string;
  nhtsaCampaignId: string;
  title: string;
  description: string;
  severity: RecallSeverity;
  affectedVehicles: AffectedVehicle[];
  affectedComponents: string[];
  receivedAt: string;
  estimatedAffected: number;
}

export interface CustomerInstall {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicle: string;
  vehicleYear: number;
  vehicleMake: string;
  vehicleModel: string;
  sku: string;
  productName: string;
  dotCode?: string;
  lotNumber?: string;
  saleDate: string;
  lastVisit: string;
  contactPreference: 'sms' | 'email' | 'both';
}

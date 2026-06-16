// ── Shared ────────────────────────────────────────────────────────────────────
export type WheelPosition = 'FL' | 'FR' | 'RL' | 'RR' | 'RL2' | 'RR2';

// ── T1: TPMS ─────────────────────────────────────────────────────────────────
export type TpmsAction = 'rebuild_only' | 'sensor_replaced' | 'skipped';
export type TpmsRelearnOutcome = 'success' | 'failed' | 'retry_needed' | 'pending';

export interface TpmsServiceConfig {
  rebuildEnabled: boolean;
  rebuildPricePerWheel: number;
  rebuildTimeMinutes: number;
  replacementEnabled: boolean;
  replacementPricePerWheel: number;
  replacementTimeMinutes: number;
}

export interface TpmsWheelRecord {
  position: WheelPosition;
  action: TpmsAction;
  skipReason?: string;
  sensorSkuId?: string;
  sensorSkuName?: string;
  relearn: TpmsRelearnOutcome;
  upsoldToReplacement: boolean;
}

export interface TpmsVisitRecord {
  id: string;
  visitId: string;
  customerName: string;
  vehicleLabel: string;
  techName: string;
  createdAt: string;
  wheels: TpmsWheelRecord[];
}

// ── T2 + T3: Tire Registration + DOT ─────────────────────────────────────────
export type RegistrationStatus = 'pending' | 'in_batch' | 'submitted' | 'confirmed' | 'failed';
export type BatchStatus = 'pending' | 'submitted_by_shop' | 'confirmed';

export interface TireRegistration {
  id: string;
  visitId: string;
  customerId: string;
  customerName: string;
  skuId: string;
  skuName: string;
  manufacturer: string;
  dotCode: string;
  saleDate: string;
  consentGiven: boolean;
  status: RegistrationStatus;
  batchId: string | null;
  failureReason?: string;
}

export interface RegistrationBatch {
  id: string;
  manufacturer: string;
  tiresCount: number;
  status: BatchStatus;
  fileUrl: string | null;
  createdAt: string;
  submittedAt: string | null;
  confirmedAt: string | null;
}

// ── T4: Road Hazard Warranty ─────────────────────────────────────────────────
export type CoverageType = 'free_replacement' | 'prorated' | 'mileage_based';
export type WarrantyStatus = 'active' | 'expired' | 'claimed' | 'voided';
export type ClaimStatus = 'open' | 'under_review' | 'approved' | 'denied' | 'resolved';

export interface RoadHazardConfig {
  durationMonths: number;
  coverageType: CoverageType;
  price: number;
  priceAsPercentOfTire: boolean;
  coveredScenarios: string[];
  exclusions: string[];
  recommendationLevel: 'required' | 'recommended' | 'optional';
}

export interface RoadHazardWarranty {
  id: string;
  visitId: string;
  customerId: string;
  customerName: string;
  skuId: string;
  skuName: string;
  dotCode: string;
  purchaseDate: string;
  expirationDate: string;
  coverageType: CoverageType;
  status: WarrantyStatus;
  pricePaid: number;
}

export interface WarrantyClaim {
  id: string;
  warrantyId: string;
  customerId: string;
  customerName: string;
  skuName: string;
  milesAtClaim: number;
  treadDepthMm: number;
  eventDescription: string;
  photoCount: number;
  status: ClaimStatus;
  submittedAt: string;
  resolvedAt: string | null;
}

// ── T6: Tire Position ─────────────────────────────────────────────────────────
export interface TirePositionRecord {
  id: string;
  visitId: string;
  position: WheelPosition;
  skuId: string;
  skuName: string;
  dotCode: string;
  treadDepthMm: number;
}

// ── T7: Take-off Handling ────────────────────────────────────────────────────
export type TakeOffDisposition = 'disposal' | 'customer_retained' | 'shop_resale';

export interface TakeOffRecord {
  id: string;
  visitId: string;
  position: WheelPosition;
  disposition: TakeOffDisposition;
  treadDepthMm: number;
  conditionRating: 1 | 2 | 3 | 4 | 5;
  dotYear: string;
  suggestedResalePrice?: number;
  disposalFeeCharged?: number;
}

// ── T8: Swap & Store ─────────────────────────────────────────────────────────
export interface SwapStoreTire {
  position: WheelPosition;
  skuId: string;
  skuName: string;
  dotCode: string;
  treadDepthMm: number;
}

export interface SwapStoreEntry {
  id: string;
  customerId: string;
  customerName: string;
  vehicleId: string;
  vehicleLabel: string;
  storageBay: string;
  storedAt: string;
  retrieveBy: string;
  tires: SwapStoreTire[];
}

// ── T9: Warranty Claim (tire-specific) ───────────────────────────────────────
// Uses WarrantyClaim above; extra stats:
export interface ClaimStats {
  openClaims: number;
  avgResolutionDays: number;
  topClaimedSku: string;
  claimRateByTech: { techName: string; rate: number }[];
}

// ── T11: Rebates ──────────────────────────────────────────────────────────────
export type RebateType = 'mail_in' | 'instant' | 'promo_code';

export interface Rebate {
  id: string;
  manufacturer: string;
  name: string;
  startDate: string;
  endDate: string;
  eligibleSkus: string[];
  eligibleCategories: string[];
  amount: number;
  amountType: 'fixed' | 'percent';
  rebateType: RebateType;
  termsUrl: string;
  platformPublished: boolean;
  active: boolean;
  logoColor: string;
}

export interface RebateAttribution {
  id: string;
  rebateId: string;
  rebateName: string;
  orderId: string;
  customerName: string;
  amount: number;
  claimedAt: string | null;
}

// ── T10: Registration Reporting ───────────────────────────────────────────────
export interface RegistrationRateRow {
  dimension: string;
  total: number;
  registered: number;
  rate: number;
  failureReasons: { reason: string; count: number }[];
}

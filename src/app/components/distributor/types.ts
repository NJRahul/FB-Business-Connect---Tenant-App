// ─── Connector Tiers ─────────────────────────────────────────────────────────
export type ConnectorTier = 'A' | 'B' | 'C';
export type ConnectorStatus = 'active' | 'degraded' | 'disconnected' | 'syncing';
export type ConnectorType = 'atd' | 'tirehub' | 'csv_feed' | 'xlsx_feed' | 'url_feed' | 'manual';

export interface Distributor {
  id: string;
  name: string;
  tier: ConnectorTier;
  connectorType: ConnectorType;
  status: ConnectorStatus;
  lastSyncAt?: string;
  nextSyncAt?: string;
  errorCount: number;
  logoEmoji: string;
  description: string;
  supportedFeatures: string[];
  referenceDoc: string; // inline summary of API auth, rate limits, quirks
}

// ─── Tenant Connection ────────────────────────────────────────────────────────
export interface TenantDistributor {
  id: string;
  shopId: string;
  distributorId: string;
  active: boolean;
  apiKeyMasked?: string;     // last 4 chars visible
  accountNumber?: string;
  feedUrl?: string;
  feedSchedule: 'daily' | 'weekly' | 'manual';
  safetyBufferDays: number;
  lastOrderAt?: string;
  totalOrdersPlaced: number;
  connectedAt: string;
}

// ─── API Logs ─────────────────────────────────────────────────────────────────
export interface DistributorApiLog {
  id: string;
  shopId: string;
  distributorId: string;
  distributorName: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH';
  requestSummary: string;
  responseStatus: number;
  latencyMs: number;
  error?: string;
  idempotencyKey?: string;
  createdAt: string;
}

// ─── Webhooks ─────────────────────────────────────────────────────────────────
export type WebhookStatus = 'processed' | 'duplicate' | 'rejected' | 'failed';

export interface DistributorWebhook {
  id: string;
  distributorId: string;
  distributorName: string;
  eventId: string;
  eventType: string;
  payloadSummary: string;
  status: WebhookStatus;
  idempotencyKey: string;
  signatureValid: boolean;
  processedAt?: string;
  createdAt: string;
  autoAction?: string;
}

// ─── Supplier Performance ─────────────────────────────────────────────────────
export interface SupplierPerformance {
  id: string;
  shopId: string;
  distributorId: string;
  distributorName: string;
  period: string;            // 'YYYY-MM'
  onTimeCount: number;
  lateCount: number;
  avgDeviationDays: number;
  sparkline: number[];       // last 6 months on-time %
}

// ─── SKU Catalog ──────────────────────────────────────────────────────────────
export interface SkuRecord {
  id: string;
  shopId: string;
  distributorId: string;
  distributorName: string;
  tier: ConnectorTier;
  sku: string;
  partName: string;
  brand: string;
  size: string;
  category: string;
  unitPrice: number;
  listPrice: number;
  stockQty: number;
  inStock: boolean;
  etaDays?: number;
  lastPricedAt?: string;
  lastInventoryAt?: string;
  reorderThreshold?: number;  // Tier C only
}

// ─── Feed Import ──────────────────────────────────────────────────────────────
export interface ValidationFailure {
  row: number;
  sku: string;
  field: string;
  issue: string;
}

export interface FeedImport {
  id: string;
  shopId: string;
  distributorId: string;
  fileName: string;
  importedAt: string;
  rowsTotal: number;
  rowsImported: number;
  rowsFailed: number;
  failures: ValidationFailure[];
  status: 'success' | 'partial' | 'failed';
}

// ─── Manual Orders (Tier B task queue) ───────────────────────────────────────
export type ManualOrderStatus = 'pending_action' | 'confirmed' | 'in_transit' | 'arrived' | 'cancelled';

export interface ManualOrder {
  id: string;
  shopId: string;
  distributorId: string;
  distributorName: string;
  visitId: string;
  visitSummary: string;
  sku: string;
  partName: string;
  qty: number;
  unitPrice: number;
  status: ManualOrderStatus;
  etaDate?: string;
  confirmedAt?: string;
  notes: string;
  createdAt: string;
}

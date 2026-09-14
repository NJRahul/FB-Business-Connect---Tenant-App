import type {
  Distributor, TenantDistributor, DistributorApiLog,
  DistributorWebhook, SupplierPerformance, SkuRecord,
  FeedImport, ManualOrder,
} from './types';

// ─── Distributors ─────────────────────────────────────────────────────────────
export const DISTRIBUTORS: Distributor[] = [
  {
    id: 'dist-atd',
    name: 'ATD (American Tire Distributors)',
    tier: 'A',
    connectorType: 'atd',
    status: 'active',
    lastSyncAt: '2026-06-14T09:45:00',
    nextSyncAt: '2026-06-14T10:45:00',
    errorCount: 0,
    logoEmoji: '🔵',
    description: 'Largest wholesale tire distributor in North America. Full catalog + real-time pricing and inventory via REST API.',
    supportedFeatures: ['Catalog sync', 'Real-time inventory', 'Real-time pricing', 'Order placement', 'Order status', 'Freight ETA', 'Webhooks'],
    referenceDoc: `# ATD Connector Reference\n\n**Auth:** OAuth 2.0 client credentials (client_id + client_secret). Token TTL = 3600s; refresh automatically.\n**Rate Limits:** 120 req/min catalog, 60 req/min inventory, 30 req/min orders. Back-off: exponential with jitter starting at 1s.\n**Idempotency:** POST /orders requires X-Idempotency-Key header (UUID). ATD deduplicates within 24h.\n**Known Quirks:** Inventory endpoint returns 200 with \`available: false\` even on auth failure — always check \`error\` field. Pricing endpoint occasionally returns stale prices for 15–30s after a catalog update — treat as cache TTL 60s.\n**Degraded Mode:** Mark degraded after 5 consecutive 5xx or timeout > 30s. Cache TTL during degraded = 4h.\n**Webhook Auth:** HMAC-SHA256 signed payload; secret in dashboard. Header: \`X-ATD-Signature: sha256=<hex>\`.`,
  },
  {
    id: 'dist-tirehub',
    name: 'TireHub',
    tier: 'A',
    connectorType: 'tirehub',
    status: 'degraded',
    lastSyncAt: '2026-06-14T08:12:00',
    nextSyncAt: '2026-06-14T10:12:00',
    errorCount: 14,
    logoEmoji: '🟡',
    description: 'Goodyear/Bridgestone joint venture distributor. Same-day delivery in most markets. REST API with OpenAPI 3.0 spec.',
    supportedFeatures: ['Catalog sync', 'Real-time inventory', 'Real-time pricing', 'Order placement', 'Order status', 'Freight ETA'],
    referenceDoc: `# TireHub Connector Reference\n\n**Auth:** API Key in header \`TH-API-Key: <key>\`. Keys rotate every 90 days; rotation reminder sent 14 days prior.\n**Rate Limits:** 200 req/min flat. No endpoint-level limits.\n**Idempotency:** POST /orders/create requires \`idempotency_key\` in body. TTL 48h.\n**Known Quirks:** /inventory/bulk endpoint returns results in random order — always key by SKU, not array index. Price API returns USD with 4 decimal places; truncate to 2 before storage.\n**Degraded Mode:** 5 consecutive failures (any 5xx or network timeout) triggers degraded. Auto-recover on first successful health-check ping (GET /ping).\n**Webhook Auth:** Shared secret via \`X-TireHub-Token\` header (plain, not HMAC). Less secure — validate source IP whitelist additionally.`,
  },
  {
    id: 'dist-ntw',
    name: 'NTW (National Tire Wholesale)',
    tier: 'B',
    connectorType: 'url_feed',
    status: 'active',
    lastSyncAt: '2026-06-14T02:00:00',
    nextSyncAt: '2026-06-15T02:00:00',
    errorCount: 0,
    logoEmoji: '🟢',
    description: 'Regional distributor with daily catalog feed (CSV). Orders placed manually via NTW dealer portal.',
    supportedFeatures: ['Daily CSV catalog feed', 'Manual order placement', 'Order status via email'],
    referenceDoc: `# NTW Connector Reference\n\n**Feed Format:** CSV with header row. Required columns: SKU, Description, Brand, Size, Category, YourCost, ListPrice, StockQty, LeadTimeDays. Extra columns are ignored.\n**Feed URL:** Authenticated via ?token=<dealer_token> query param. Token expires annually.\n**Schedule:** Feed refreshed nightly at 2:00 AM CT. Pull no more than once per hour (rate-limited at source).\n**Validation Rules:** SKU must match /^[A-Z0-9\\-]{5,20}$/. YourCost must be > 0. StockQty must be integer ≥ 0.\n**Manual Orders:** Log in at ntw-dealer.com > place order > enter order ID and expected ETA in FB Business Connect task queue.`,
  },
  {
    id: 'dist-local',
    name: 'Local Stock',
    tier: 'C',
    connectorType: 'manual',
    status: 'active',
    lastSyncAt: '2026-06-14T09:00:00',
    errorCount: 0,
    logoEmoji: '🔴',
    description: 'On-hand inventory managed manually. Immediate availability, no ETA. Decremented on sale.',
    supportedFeatures: ['Manual SKU entry', 'Immediate availability', 'Reorder reminders', 'Stock decrement on sale'],
    referenceDoc: `# Local Stock Reference\n\nNo API integration. Staff adds SKUs manually.\n\n**Stock Logic:** Items assumed in-stock. Qty decremented when a visit with that part is marked completed.\n**Reorder Threshold:** Per-SKU configurable. Alert fires when qtyRemaining ≤ threshold.\n**ETA:** No ETA — all slots book immediately. Safety buffer = 0 by default.\n**Pricing:** Manual entry. No automatic price updates.`,
  },
];

// ─── Tenant Distributor Connections ───────────────────────────────────────────
export const TENANT_DISTRIBUTORS: TenantDistributor[] = [
  {
    id: 'td-1', shopId: 'shop-1', distributorId: 'dist-atd',
    active: true, apiKeyMasked: '••••3F8A', accountNumber: 'ATD-TX-44821',
    feedSchedule: 'daily', safetyBufferDays: 1,
    lastOrderAt: '2026-06-13T15:22:00', totalOrdersPlaced: 247, connectedAt: '2025-01-10T00:00:00',
  },
  {
    id: 'td-2', shopId: 'shop-1', distributorId: 'dist-tirehub',
    active: true, apiKeyMasked: '••••B291', accountNumber: 'TH-2049381',
    feedSchedule: 'daily', safetyBufferDays: 1,
    lastOrderAt: '2026-06-12T11:05:00', totalOrdersPlaced: 89, connectedAt: '2025-04-01T00:00:00',
  },
  {
    id: 'td-3', shopId: 'shop-1', distributorId: 'dist-ntw',
    active: true, accountNumber: 'NTW-DLR-90234',
    feedUrl: 'https://feed.ntw-dealer.com/catalog?token=••••7D2E',
    feedSchedule: 'daily', safetyBufferDays: 2,
    lastOrderAt: '2026-06-10T09:30:00', totalOrdersPlaced: 31, connectedAt: '2025-06-01T00:00:00',
  },
  {
    id: 'td-4', shopId: 'shop-1', distributorId: 'dist-local',
    active: true, feedSchedule: 'manual', safetyBufferDays: 0,
    lastOrderAt: undefined, totalOrdersPlaced: 0, connectedAt: '2025-01-10T00:00:00',
  },
];

// ─── API Logs ─────────────────────────────────────────────────────────────────
const MINS_AGO = (m: number) => new Date(Date.now() - m * 60000).toISOString();

export const API_LOGS: DistributorApiLog[] = [
  { id: 'log-001', shopId: 'shop-1', distributorId: 'dist-atd', distributorName: 'ATD', endpoint: '/v2/inventory/lookup', method: 'GET', requestSummary: 'SKU: MI-255-45R19', responseStatus: 200, latencyMs: 142, createdAt: MINS_AGO(2) },
  { id: 'log-002', shopId: 'shop-1', distributorId: 'dist-atd', distributorName: 'ATD', endpoint: '/v2/pricing', method: 'GET', requestSummary: 'SKU: MI-255-45R19, ZIP: 75001', responseStatus: 200, latencyMs: 88, createdAt: MINS_AGO(3) },
  { id: 'log-003', shopId: 'shop-1', distributorId: 'dist-tirehub', distributorName: 'TireHub', endpoint: '/inventory/bulk', method: 'POST', requestSummary: '12 SKUs', responseStatus: 503, latencyMs: 30012, error: 'Service Unavailable', createdAt: MINS_AGO(6) },
  { id: 'log-004', shopId: 'shop-1', distributorId: 'dist-tirehub', distributorName: 'TireHub', endpoint: '/ping', method: 'GET', requestSummary: 'Health check', responseStatus: 503, latencyMs: 2100, error: 'Connection timeout', createdAt: MINS_AGO(8) },
  { id: 'log-005', shopId: 'shop-1', distributorId: 'dist-tirehub', distributorName: 'TireHub', endpoint: '/ping', method: 'GET', requestSummary: 'Health check', responseStatus: 503, latencyMs: 1980, error: 'Connection timeout', createdAt: MINS_AGO(10) },
  { id: 'log-006', shopId: 'shop-1', distributorId: 'dist-atd', distributorName: 'ATD', endpoint: '/v2/orders', method: 'POST', requestSummary: 'Order #ORD-20260614-001, idempotency: idem_a1b2c3', responseStatus: 201, latencyMs: 312, idempotencyKey: 'idem_a1b2c3', createdAt: MINS_AGO(18) },
  { id: 'log-007', shopId: 'shop-1', distributorId: 'dist-atd', distributorName: 'ATD', endpoint: '/v2/orders/ORD-20260614-001/status', method: 'GET', requestSummary: 'Order status poll', responseStatus: 200, latencyMs: 95, createdAt: MINS_AGO(15) },
  { id: 'log-008', shopId: 'shop-1', distributorId: 'dist-atd', distributorName: 'ATD', endpoint: '/v2/catalog/delta', method: 'GET', requestSummary: 'Delta since 2026-06-13T09:45:00Z', responseStatus: 200, latencyMs: 2340, createdAt: MINS_AGO(35) },
  { id: 'log-009', shopId: 'shop-1', distributorId: 'dist-tirehub', distributorName: 'TireHub', endpoint: '/orders/create', method: 'POST', requestSummary: 'Order idempotency: th_xyz789', responseStatus: 503, latencyMs: 15000, error: 'Upstream service error', idempotencyKey: 'th_xyz789', createdAt: MINS_AGO(25) },
  { id: 'log-010', shopId: 'shop-1', distributorId: 'dist-atd', distributorName: 'ATD', endpoint: '/v2/pricing', method: 'GET', requestSummary: 'SKU: BS-225-55R17, ZIP: 75201', responseStatus: 200, latencyMs: 103, createdAt: MINS_AGO(42) },
  { id: 'log-011', shopId: 'shop-1', distributorId: 'dist-atd', distributorName: 'ATD', endpoint: '/v2/inventory/lookup', method: 'GET', requestSummary: 'SKU: GY-265-70R17', responseStatus: 200, latencyMs: 127, createdAt: MINS_AGO(48) },
  { id: 'log-012', shopId: 'shop-1', distributorId: 'dist-tirehub', distributorName: 'TireHub', endpoint: '/catalog/full', method: 'GET', requestSummary: 'Full catalog sync', responseStatus: 200, latencyMs: 8900, createdAt: MINS_AGO(240) },
];

// ─── Webhooks ─────────────────────────────────────────────────────────────────
export const WEBHOOKS: DistributorWebhook[] = [
  {
    id: 'wh-001', distributorId: 'dist-atd', distributorName: 'ATD',
    eventId: 'evt_atd_ship_001', eventType: 'order.shipped',
    payloadSummary: 'Order ORD-20260614-001 shipped — tracking #1Z999AA10123456784, ETA June 15',
    status: 'processed', idempotencyKey: 'evt_atd_ship_001',
    signatureValid: true,
    processedAt: MINS_AGO(12), createdAt: MINS_AGO(12),
    autoAction: 'Updated visit v-003 freight ETA to 2026-06-15',
  },
  {
    id: 'wh-002', distributorId: 'dist-atd', distributorName: 'ATD',
    eventId: 'evt_atd_arrive_001', eventType: 'order.arrived',
    payloadSummary: 'Order ORD-20260613-007 arrived at warehouse — SKU: TPMS-GM-2020 × 2',
    status: 'processed', idempotencyKey: 'evt_atd_arrive_001',
    signatureValid: true,
    processedAt: MINS_AGO(62), createdAt: MINS_AGO(62),
    autoAction: 'Transitioned visit dv-003 parts_pending → parts_ready. Notified dispatcher + customer.',
  },
  {
    id: 'wh-003', distributorId: 'dist-atd', distributorName: 'ATD',
    eventId: 'evt_atd_ship_001', eventType: 'order.shipped',
    payloadSummary: 'DUPLICATE — Order ORD-20260614-001 shipped (retry from ATD)',
    status: 'duplicate', idempotencyKey: 'evt_atd_ship_001',
    signatureValid: true,
    processedAt: MINS_AGO(11), createdAt: MINS_AGO(11),
  },
  {
    id: 'wh-004', distributorId: 'dist-tirehub', distributorName: 'TireHub',
    eventId: 'evt_th_price_001', eventType: 'catalog.price_update',
    payloadSummary: '843 SKUs price updated',
    status: 'rejected', idempotencyKey: 'evt_th_price_001',
    signatureValid: false,
    createdAt: MINS_AGO(90),
    autoAction: 'Rejected — HMAC signature mismatch. HTTP 401 returned.',
  },
  {
    id: 'wh-005', distributorId: 'dist-atd', distributorName: 'ATD',
    eventId: 'evt_atd_eta_001', eventType: 'order.eta_updated',
    payloadSummary: 'Order ORD-20260612-003 ETA updated from June 14 → June 16 (supply delay)',
    status: 'processed', idempotencyKey: 'evt_atd_eta_001',
    signatureValid: true,
    processedAt: MINS_AGO(180), createdAt: MINS_AGO(180),
    autoAction: 'Updated booking slot safety date. Notified customer via SMS.',
  },
  {
    id: 'wh-006', distributorId: 'dist-tirehub', distributorName: 'TireHub',
    eventId: 'evt_th_arrive_002', eventType: 'order.arrived',
    payloadSummary: 'Order TH-ORD-2026-4481 arrived — BS-225-55R17 × 4',
    status: 'failed', idempotencyKey: 'evt_th_arrive_002',
    signatureValid: true,
    createdAt: MINS_AGO(300),
    autoAction: 'Processing error — visit lookup failed (visit may have been cancelled).',
  },
];

// ─── Supplier Performance ─────────────────────────────────────────────────────
export const PERFORMANCE: SupplierPerformance[] = [
  {
    id: 'perf-1', shopId: 'shop-1', distributorId: 'dist-atd', distributorName: 'ATD',
    period: '2026-06', onTimeCount: 28, lateCount: 3, avgDeviationDays: 0.3,
    sparkline: [88, 91, 89, 93, 90, 90],
  },
  {
    id: 'perf-2', shopId: 'shop-1', distributorId: 'dist-tirehub', distributorName: 'TireHub',
    period: '2026-06', onTimeCount: 14, lateCount: 7, avgDeviationDays: 1.2,
    sparkline: [78, 72, 75, 68, 66, 67],
  },
  {
    id: 'perf-3', shopId: 'shop-1', distributorId: 'dist-ntw', distributorName: 'NTW',
    period: '2026-06', onTimeCount: 8, lateCount: 4, avgDeviationDays: 0.8,
    sparkline: [70, 74, 75, 71, 66, 67],
  },
];

// ─── SKU Catalog ──────────────────────────────────────────────────────────────
export const SKU_CATALOG: SkuRecord[] = [
  // Tier A — ATD
  { id: 'sku-1',  shopId: 'shop-1', distributorId: 'dist-atd',    distributorName: 'ATD',         tier: 'A', sku: 'MI-255-45R19',    partName: 'Michelin Pilot Sport 4S 255/45R19',           brand: 'Michelin',    size: '255/45R19', category: 'passenger', unitPrice: 289.99, listPrice: 349.99, stockQty: 24, inStock: true,  etaDays: 1, lastPricedAt: MINS_AGO(3),   lastInventoryAt: MINS_AGO(2) },
  { id: 'sku-2',  shopId: 'shop-1', distributorId: 'dist-atd',    distributorName: 'ATD',         tier: 'A', sku: 'MI-225-55R17',    partName: 'Michelin Defender T+H 225/55R17',             brand: 'Michelin',    size: '225/55R17', category: 'passenger', unitPrice: 149.99, listPrice: 189.99, stockQty: 36, inStock: true,  etaDays: 1, lastPricedAt: MINS_AGO(42),  lastInventoryAt: MINS_AGO(2) },
  { id: 'sku-3',  shopId: 'shop-1', distributorId: 'dist-atd',    distributorName: 'ATD',         tier: 'A', sku: 'GY-265-70R17',    partName: 'Goodyear Wrangler AT Adventure 265/70R17',    brand: 'Goodyear',    size: '265/70R17', category: 'light_truck', unitPrice: 189.99, listPrice: 229.99, stockQty: 12, inStock: true,  etaDays: 1, lastPricedAt: MINS_AGO(48),  lastInventoryAt: MINS_AGO(2) },
  { id: 'sku-4',  shopId: 'shop-1', distributorId: 'dist-atd',    distributorName: 'ATD',         tier: 'A', sku: 'PI-235-40R18',    partName: 'Pirelli P Zero 235/40R18',                    brand: 'Pirelli',     size: '235/40R18', category: 'performance', unitPrice: 219.99, listPrice: 269.99, stockQty: 0,  inStock: false, etaDays: 3, lastPricedAt: MINS_AGO(60),  lastInventoryAt: MINS_AGO(2) },
  { id: 'sku-5',  shopId: 'shop-1', distributorId: 'dist-atd',    distributorName: 'ATD',         tier: 'A', sku: 'TPMS-GM-2020',    partName: 'GM TPMS Sensor 2020+ (315MHz)',               brand: 'Schrader',    size: 'N/A',       category: 'tpms',        unitPrice: 69.99,  listPrice: 89.99,  stockQty: 8,  inStock: true,  etaDays: 1, lastPricedAt: MINS_AGO(3),   lastInventoryAt: MINS_AGO(2) },
  { id: 'sku-6',  shopId: 'shop-1', distributorId: 'dist-atd',    distributorName: 'ATD',         tier: 'A', sku: 'CO-225-45R17',    partName: 'Continental PureContact LS 225/45R17',        brand: 'Continental', size: '225/45R17', category: 'passenger', unitPrice: 134.99, listPrice: 164.99, stockQty: 20, inStock: true,  etaDays: 1, lastPricedAt: MINS_AGO(3),   lastInventoryAt: MINS_AGO(2) },

  // Tier A — TireHub
  { id: 'sku-7',  shopId: 'shop-1', distributorId: 'dist-tirehub', distributorName: 'TireHub',    tier: 'A', sku: 'BS-225-55R17',    partName: 'Bridgestone Turanza QuietTrack 225/55R17',    brand: 'Bridgestone', size: '225/55R17', category: 'passenger', unitPrice: 149.99, listPrice: 184.99, stockQty: 18, inStock: true,  etaDays: 1, lastPricedAt: MINS_AGO(120), lastInventoryAt: MINS_AGO(120) },
  { id: 'sku-8',  shopId: 'shop-1', distributorId: 'dist-tirehub', distributorName: 'TireHub',    tier: 'A', sku: 'GY-225-65R17',    partName: 'Goodyear Assurance WeatherReady 225/65R17',   brand: 'Goodyear',    size: '225/65R17', category: 'passenger', unitPrice: 169.99, listPrice: 209.99, stockQty: 9,  inStock: true,  etaDays: 1, lastPricedAt: MINS_AGO(120), lastInventoryAt: MINS_AGO(120) },
  { id: 'sku-9',  shopId: 'shop-1', distributorId: 'dist-tirehub', distributorName: 'TireHub',    tier: 'A', sku: 'BS-275-40R20',    partName: 'Bridgestone Potenza Sport 275/40R20',         brand: 'Bridgestone', size: '275/40R20', category: 'performance', unitPrice: 279.99, listPrice: 329.99, stockQty: 0,  inStock: false, etaDays: 2, lastPricedAt: MINS_AGO(120), lastInventoryAt: MINS_AGO(120) },

  // Tier B — NTW
  { id: 'sku-10', shopId: 'shop-1', distributorId: 'dist-ntw',    distributorName: 'NTW',        tier: 'B', sku: 'MI-LT225-75R16C', partName: 'Michelin Agilis CrossClimate LT225/75R16 C',  brand: 'Michelin',    size: 'LT225/75R16C', category: 'light_truck', unitPrice: 189.99, listPrice: 229.99, stockQty: 16, inStock: true, etaDays: 2, lastPricedAt: MINS_AGO(480), lastInventoryAt: MINS_AGO(480) },
  { id: 'sku-11', shopId: 'shop-1', distributorId: 'dist-ntw',    distributorName: 'NTW',        tier: 'B', sku: 'FI-215-60R16',    partName: 'Firestone Destination LE3 215/60R16',         brand: 'Firestone',   size: '215/60R16', category: 'passenger', unitPrice: 99.99,  listPrice: 124.99, stockQty: 22, inStock: true, etaDays: 2, lastPricedAt: MINS_AGO(480), lastInventoryAt: MINS_AGO(480) },
  { id: 'sku-12', shopId: 'shop-1', distributorId: 'dist-ntw',    distributorName: 'NTW',        tier: 'B', sku: 'CO-245-40R19',    partName: 'Continental ExtremeContact Sport 02 245/40R19', brand: 'Continental', size: '245/40R19', category: 'performance', unitPrice: 224.99, listPrice: 264.99, stockQty: 5, inStock: true, etaDays: 3, lastPricedAt: MINS_AGO(480), lastInventoryAt: MINS_AGO(480) },

  // Tier C — Local
  { id: 'sku-13', shopId: 'shop-1', distributorId: 'dist-local',  distributorName: 'Local Stock', tier: 'C', sku: 'PATCH-KIT',       partName: 'Tire Plug/Patch Kit (mushroom plug)',          brand: 'Generic',     size: 'N/A',       category: 'supplies',    unitPrice: 8.99,   listPrice: 14.99,  stockQty: 42, inStock: true,  reorderThreshold: 10, lastInventoryAt: MINS_AGO(60) },
  { id: 'sku-14', shopId: 'shop-1', distributorId: 'dist-local',  distributorName: 'Local Stock', tier: 'C', sku: 'VALVE-STEM-STD',  partName: 'Standard Rubber Valve Stem',                  brand: 'Generic',     size: 'N/A',       category: 'supplies',    unitPrice: 1.99,   listPrice: 3.99,   stockQty: 8,  inStock: true,  reorderThreshold: 20, lastInventoryAt: MINS_AGO(60) },
  { id: 'sku-15', shopId: 'shop-1', distributorId: 'dist-local',  distributorName: 'Local Stock', tier: 'C', sku: 'BAL-WEIGHT-STD',  partName: 'Clip-On Balance Weights (1 oz)',               brand: 'Plombco',     size: 'N/A',       category: 'supplies',    unitPrice: 0.35,   listPrice: 0.75,   stockQty: 200, inStock: true, reorderThreshold: 50, lastInventoryAt: MINS_AGO(60) },
];

// ─── Feed Import History ──────────────────────────────────────────────────────
export const FEED_IMPORTS: FeedImport[] = [
  {
    id: 'fi-1', shopId: 'shop-1', distributorId: 'dist-ntw',
    fileName: 'ntw_catalog_2026-06-14.csv', importedAt: '2026-06-14T02:03:11',
    rowsTotal: 4218, rowsImported: 4215, rowsFailed: 3,
    status: 'partial',
    failures: [
      { row: 812,  sku: 'INVALID-SKU!', field: 'sku',       issue: 'SKU contains invalid characters (must match /^[A-Z0-9\\-]{5,20}$/)' },
      { row: 1540, sku: 'FI-195-65R15', field: 'YourCost',  issue: 'YourCost is 0.00 — must be > 0' },
      { row: 3311, sku: 'CO-205-55R16', field: 'StockQty',  issue: 'StockQty is "N/A" — must be integer ≥ 0' },
    ],
  },
  {
    id: 'fi-2', shopId: 'shop-1', distributorId: 'dist-ntw',
    fileName: 'ntw_catalog_2026-06-13.csv', importedAt: '2026-06-13T02:01:44',
    rowsTotal: 4201, rowsImported: 4201, rowsFailed: 0,
    status: 'success', failures: [],
  },
];

// ─── Manual Orders (Tier B) ───────────────────────────────────────────────────
export const MANUAL_ORDERS: ManualOrder[] = [
  {
    id: 'mo-1', shopId: 'shop-1', distributorId: 'dist-ntw', distributorName: 'NTW',
    visitId: 'dv-005', visitSummary: 'FleetCo – Unit 3 · 4-Tire Mount & Balance',
    sku: 'MI-LT225-75R16C', partName: 'Michelin Agilis CrossClimate LT225/75R16 C',
    qty: 4, unitPrice: 189.99,
    status: 'confirmed', etaDate: '2026-06-15',
    confirmedAt: '2026-06-13T10:30:00', notes: 'NTW Order #NTW-78234. Confirmed with rep Angela M.',
    createdAt: '2026-06-13T09:00:00',
  },
  {
    id: 'mo-2', shopId: 'shop-1', distributorId: 'dist-ntw', distributorName: 'NTW',
    visitId: 'v-007', visitSummary: 'Walk-in · Custom Performance Fitment',
    sku: 'CO-245-40R19', partName: 'Continental ExtremeContact Sport 02 245/40R19',
    qty: 4, unitPrice: 224.99,
    status: 'pending_action', etaDate: undefined,
    notes: '', createdAt: '2026-06-14T08:45:00',
  },
];

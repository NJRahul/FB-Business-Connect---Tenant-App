import type {
  DailyRevenue, ServiceRevenue, RefundRecord, ReconciliationRow,
  TechnicianStat, KPIMetric, FunnelStep, AbandonedCart,
  CustomerStat, CohortRow, LocationPnL, CampaignStat,
  LiveVisit, AtRiskVisit, ConnectorHealth, ApiMetric,
} from './types';

// ─── Deterministic PRNG ───────────────────────────────────────────────────────
const rng = (s: number) => { const x = Math.sin(s + 1) * 10000; return x - Math.floor(x); };

// ─── Daily Revenue (90 days: 2026-03-16 → 2026-06-13) ────────────────────────
const DOW_BASE = [3200, 3800, 4100, 4500, 4900, 2600, 1200]; // Mon–Sun in dollars

export const DAILY_REVENUE: DailyRevenue[] = Array.from({ length: 90 }, (_, i) => {
  const d = new Date(2026, 2, 16 + i); // Mar 16 + i
  const dow = (d.getDay() + 6) % 7;
  const trend = 1 + i * 0.0009;
  const noise = 0.82 + rng(i) * 0.36;
  const gross = Math.round(DOW_BASE[dow] * trend * noise * 100);
  const laborR = 0.56 + rng(i + 90) * 0.12;
  return {
    date: d.toISOString().slice(0, 10),
    gross,
    labor: Math.round(gross * laborR),
    parts: Math.round(gross * (1 - laborR) * 0.88),
    refunds: rng(i + 180) < 0.07 ? Math.round(gross * 0.1) : 0,
  };
});

// ─── Revenue by Service Type ──────────────────────────────────────────────────
export const REVENUE_BY_SERVICE: ServiceRevenue[] = [
  { serviceType: '4-Tire Mount & Balance', revenue: 4_820_00, jobCount: 54, avgTicket: 89_26, laborSplit: 0.55, partsSplit: 0.45 },
  { serviceType: 'Flat Tire Repair',       revenue: 2_140_00, jobCount: 71, avgTicket: 30_14, laborSplit: 0.82, partsSplit: 0.18 },
  { serviceType: 'Tire Rotation',          revenue: 1_890_00, jobCount: 94, avgTicket: 20_10, laborSplit: 0.95, partsSplit: 0.05 },
  { serviceType: 'TPMS Sensor Replace',    revenue: 3_360_00, jobCount: 67, avgTicket: 50_14, laborSplit: 0.48, partsSplit: 0.52 },
  { serviceType: 'Single Tire Mount',      revenue: 2_670_00, jobCount: 107,avgTicket: 24_95, laborSplit: 0.72, partsSplit: 0.28 },
  { serviceType: 'Mobile Flat Repair',     revenue: 1_560_00, jobCount: 26, avgTicket: 60_00, laborSplit: 0.88, partsSplit: 0.12 },
];

// ─── Refunds ──────────────────────────────────────────────────────────────────
export const REFUNDS: RefundRecord[] = [
  { id: 'ref-001', date: '2026-06-10', customerName: 'Linda Cho',      service: '4-Tire Mount & Balance', amount: 89_99, reason: 'Wrong tire size ordered', techName: 'Mike Torres' },
  { id: 'ref-002', date: '2026-06-08', customerName: 'Tom Anderson',   service: 'TPMS Sensor Replace',    amount: 49_99, reason: 'Sensor faulty within 7 days', techName: 'Sarah Chen' },
  { id: 'ref-003', date: '2026-06-05', customerName: 'Rachel Green',   service: 'Flat Tire Repair',       amount: 29_99, reason: 'Could not be repaired, not charged', techName: 'Carlos Rivera' },
  { id: 'ref-004', date: '2026-05-28', customerName: 'James Patel',    service: 'Tire Rotation',          amount: 19_99, reason: 'Customer dissatisfied — manager discretion', techName: 'Derek Smith' },
  { id: 'ref-005', date: '2026-05-20', customerName: 'Maria Santos',   service: 'Mobile Flat Repair',     amount: 59_99, reason: 'Tech arrived outside agreed window', techName: 'Mike Torres' },
];

// ─── Month-End Reconciliation ─────────────────────────────────────────────────
export const RECONCILIATION: ReconciliationRow[] = [
  { date: '2026-06-01–10', description: 'Jun 1–10 payout',   shopRevenue: 87_420_00, stripePayout: 87_420_00, platformFee: 43_71_00, stripeFee: 2_564_00, matched: true  },
  { date: '2026-06-11–13', description: 'Jun 11–13 payout',  shopRevenue: 62_190_00, stripePayout: 62_190_00, platformFee: 31_10_00, stripeFee: 1_824_00, matched: true  },
  { date: '2026-06-14',    description: 'Jun 14 — pending',  shopRevenue: 18_340_00, stripePayout: 0,         platformFee: 0,        stripeFee: 0,        matched: false },
];

// ─── Technician Stats ─────────────────────────────────────────────────────────
export const TECH_STATS: TechnicianStat[] = [
  { techId: 'tech-1', name: 'Mike Torres',   initials: 'MT', visitsCompleted: 62, revenue: 3_284_00, laborRevenue: 2_050_00, avgRating: 4.7, followUpConvRate: 0.38, onTimeRate: 0.91, utilization: 0.88, rankChange: 0 },
  { techId: 'tech-2', name: 'Sarah Chen',    initials: 'SC', visitsCompleted: 57, revenue: 2_941_00, laborRevenue: 1_830_00, avgRating: 4.9, followUpConvRate: 0.44, onTimeRate: 0.96, utilization: 0.85, rankChange: 2 },
  { techId: 'tech-3', name: 'Carlos Rivera', initials: 'CR', visitsCompleted: 49, revenue: 2_520_00, laborRevenue: 1_560_00, avgRating: 4.5, followUpConvRate: 0.29, onTimeRate: 0.88, utilization: 0.79, rankChange: -1 },
  { techId: 'tech-4', name: 'Derek Smith',   initials: 'DS', visitsCompleted: 41, revenue: 1_870_00, laborRevenue: 1_120_00, avgRating: 4.4, followUpConvRate: 0.22, onTimeRate: 0.83, utilization: 0.72, rankChange: -1 },
];

// ─── KPI Metrics (13 weeks, oldest first) ─────────────────────────────────────
const genKpi = (base: number, variance: number, trend = 0): number[] =>
  Array.from({ length: 13 }, (_, i) => parseFloat((base + trend * i + (rng(i * 7 + base * 3) - 0.5) * variance * 2).toFixed(1)));

export const KPI_METRICS: KPIMetric[] = [
  { key: 'honor_rate',   label: 'Booking Honor Rate',       unit: '%',   current: 88.4, benchmark: 90,   goodDirection: 'up',   history13w: genKpi(86, 2.5, 0.2) },
  { key: 'noshow_rate',  label: 'No-Show Rate',             unit: '%',   current: 5.8,  benchmark: 5,    goodDirection: 'down', history13w: genKpi(6.5, 1.2, -0.05) },
  { key: 'cancel_rate',  label: 'Cancellation Rate',        unit: '%',   current: 7.2,  benchmark: 8,    goodDirection: 'down', history13w: genKpi(7.8, 1.5, -0.05) },
  { key: 'parts_eta',    label: 'Parts ETA Accuracy (MAD)', unit: ' days', current: 1.4, benchmark: 1.5, goodDirection: 'down', history13w: genKpi(1.8, 0.3, -0.03) },
  { key: 'completion',   label: 'Avg Time to Completion',   unit: ' hrs', current: 1.2, benchmark: 1.0,  goodDirection: 'down', history13w: genKpi(1.4, 0.15, -0.01) },
  { key: 'csat',         label: 'Customer CSAT',            unit: ' ★',  current: 4.7,  benchmark: 4.5,  goodDirection: 'up',   history13w: genKpi(4.4, 0.2, 0.02) },
  { key: 'utilization',  label: 'Tech Utilization',         unit: '%',   current: 81.0, benchmark: 85,   goodDirection: 'up',   history13w: genKpi(78, 3, 0.25) },
  { key: 'reschedule',   label: 'Reschedule Rate',          unit: '%',   current: 9.1,  benchmark: 10,   goodDirection: 'down', history13w: genKpi(10.2, 1.8, -0.09) },
];

// ─── Funnel ───────────────────────────────────────────────────────────────────
export const FUNNEL_STEPS: FunnelStep[] = [
  { event: 'catalog_view',     label: 'Catalog View',     count: 2847 },
  { event: 'product_view',     label: 'Product View',     count: 1203 },
  { event: 'add_to_cart',      label: 'Add to Cart',      count: 487  },
  { event: 'slot_selection',   label: 'Slot Selected',    count: 312  },
  { event: 'checkout_start',   label: 'Checkout Start',   count: 289  },
  { event: 'abandoned',        label: 'Abandoned',        count: 67   },
  { event: 'completed',        label: 'Checkout Complete',count: 222  },
];

export const ABANDONED_CARTS: AbandonedCart[] = [
  { id: 'ac-001', customerName: 'Brian Hall',     vehicle: '2020 Chevy Malibu', service: '4-Tire Mount & Balance', cartValue: 35980, dropStep: 'slot_selection',   hoursSinceDropOff: 2.5,  recoveryTriggered: false },
  { id: 'ac-002', customerName: 'Natasha Ivanova',vehicle: '2019 BMW 3-Series', service: 'TPMS Sensor Replace',    cartValue: 19996, dropStep: 'checkout_start',   hoursSinceDropOff: 6.1,  recoveryTriggered: true  },
  { id: 'ac-003', customerName: 'Kevin Brown',    vehicle: '2021 Kia Sorento',  service: 'Flat Tire Repair',       cartValue: 2999,  dropStep: 'add_to_cart',      hoursSinceDropOff: 18.3, recoveryTriggered: false },
  { id: 'ac-004', customerName: 'Diana Prince',   vehicle: '2022 Tesla Model 3',service: 'Tire Rotation',          cartValue: 1999,  dropStep: 'slot_selection',   hoursSinceDropOff: 1.2,  recoveryTriggered: false },
  { id: 'ac-005', customerName: 'Omar Sharif',    vehicle: '2018 Ford Ranger',  service: 'Single Tire Mount',      cartValue: 9980,  dropStep: 'checkout_start',   hoursSinceDropOff: 3.7,  recoveryTriggered: true  },
];

// ─── Customer Analytics ───────────────────────────────────────────────────────
export const CUSTOMER_STATS: CustomerStat[] = [
  { customerId: 'c-101', name: 'Maria Santos',    ltv: 1_840_00, aov: 73_60, visitCount: 25, lastVisit: '2026-06-14', daysSinceLast: 0,  emailOptIn: true,  smsOptIn: true,  engagementRate: 0.72, tags: ['loyal', 'high-ltv'] },
  { customerId: 'c-102', name: 'James Patel',     ltv: 2_240_00, aov: 93_33, visitCount: 24, lastVisit: '2026-06-13', daysSinceLast: 1,  emailOptIn: true,  smsOptIn: false, engagementRate: 0.61, tags: ['loyal'] },
  { customerId: 'c-103', name: 'Linda Cho',       ltv: 3_120_00, aov: 120_00,visitCount: 26, lastVisit: '2026-06-12', daysSinceLast: 2,  emailOptIn: true,  smsOptIn: true,  engagementRate: 0.88, tags: ['high-ltv', 'referrer'] },
  { customerId: 'c-104', name: 'Derek Wu',        ltv: 980_00,   aov: 65_33, visitCount: 15, lastVisit: '2026-05-28', daysSinceLast: 17, emailOptIn: false, smsOptIn: true,  engagementRate: 0.34, tags: [] },
  { customerId: 'c-105', name: 'Aisha Thompson',  ltv: 540_00,   aov: 54_00, visitCount: 10, lastVisit: '2026-04-30', daysSinceLast: 45, emailOptIn: true,  smsOptIn: false, engagementRate: 0.28, tags: ['at-risk'] },
  { customerId: 'c-106', name: 'Carlos Rivera',   ltv: 1_180_00, aov: 78_67, visitCount: 15, lastVisit: '2026-06-10', daysSinceLast: 4,  emailOptIn: true,  smsOptIn: true,  engagementRate: 0.55, tags: [] },
  { customerId: 'c-107', name: 'Sarah Kim',       ltv: 1_560_00, aov: 86_67, visitCount: 18, lastVisit: '2026-06-01', daysSinceLast: 13, emailOptIn: true,  smsOptIn: true,  engagementRate: 0.79, tags: ['id-me-verified'] },
  { customerId: 'c-108', name: 'Tom Anderson',    ltv: 760_00,   aov: 43_00, visitCount: 18, lastVisit: '2026-03-15', daysSinceLast: 91, emailOptIn: true,  smsOptIn: false, engagementRate: 0.18, tags: ['churned'] },
  { customerId: 'c-109', name: 'Rachel Green',    ltv: 2_080_00, aov: 104_00,visitCount: 20, lastVisit: '2026-06-14', daysSinceLast: 0,  emailOptIn: true,  smsOptIn: true,  engagementRate: 0.83, tags: ['high-ltv', 'loyal'] },
  { customerId: 'c-110', name: 'Brian Hall',      ltv: 680_00,   aov: 56_67, visitCount: 12, lastVisit: '2026-05-14', daysSinceLast: 31, emailOptIn: false, smsOptIn: true,  engagementRate: 0.41, tags: ['at-risk'] },
];

export const COHORT_DATA: CohortRow[] = [
  { cohortMonth: '2026-01', cohortSize: 38, retention: [100, 52, 38, 30, 24, 19], revenuePerHead: [89, 72, 68, 65, 58, 55] },
  { cohortMonth: '2026-02', cohortSize: 44, retention: [100, 55, 41, 33, 27, 0],  revenuePerHead: [94, 76, 71, 68, 61, 0]  },
  { cohortMonth: '2026-03', cohortSize: 51, retention: [100, 57, 43, 35, 0, 0],   revenuePerHead: [97, 79, 74, 70, 0, 0]   },
  { cohortMonth: '2026-04', cohortSize: 58, retention: [100, 60, 46, 0, 0, 0],    revenuePerHead: [101, 82, 77, 0, 0, 0]   },
  { cohortMonth: '2026-05', cohortSize: 63, retention: [100, 62, 0, 0, 0, 0],     revenuePerHead: [104, 85, 0, 0, 0, 0]    },
  { cohortMonth: '2026-06', cohortSize: 29, retention: [100, 0, 0, 0, 0, 0],      revenuePerHead: [106, 0, 0, 0, 0, 0]     },
];

// ─── Location P&L ─────────────────────────────────────────────────────────────
export const LOCATION_PNL: LocationPnL[] = [
  { locationId: 'loc-1', name: 'Main — Downtown',  revenue: 189_400_00, cogs: 62_200_00, refunds: 2_840_00, discounts: 3_600_00, laborCost: 48_200_00, grossMargin: 72_560_00 },
  { locationId: 'loc-2', name: 'North — Fremont',  revenue: 141_200_00, cogs: 46_800_00, refunds: 1_940_00, discounts: 2_400_00, laborCost: 36_800_00, grossMargin: 53_260_00 },
  { locationId: 'loc-3', name: 'East — Pleasanton',revenue: 97_600_00,  cogs: 31_400_00, refunds: 1_120_00, discounts: 1_800_00, laborCost: 24_600_00, grossMargin: 38_680_00 },
];

// ─── Campaign Stats ───────────────────────────────────────────────────────────
export const CAMPAIGN_STATS: CampaignStat[] = [
  { id: 'c-001', name: 'Post-Visit Review Ask',       channel: 'email', status: 'sending',   sentDate: '2026-06-14', recipients: 1840, opens: 884,  clicks: 312, attributedBookings: 0,  attributedRevenue: 0,         optOuts: 12, trend: [52, 48, 61, 58, 74, 71, 80] },
  { id: 'c-002', name: 'Rotation Reminder — Q2',      channel: 'sms',   status: 'sent',      sentDate: '2026-06-01', recipients: 2140, opens: 0,    clicks: 0,   attributedBookings: 94, attributedRevenue: 1_880_00,  optOuts: 28, trend: [0, 0, 0, 310, 280, 190, 0] },
  { id: 'c-003', name: 'ID.me Military Discount',     channel: 'email', status: 'sent',      sentDate: '2026-05-25', recipients: 420,  opens: 278,  clicks: 134, attributedBookings: 41, attributedRevenue: 3_688_00,  optOuts: 4,  trend: [0, 0, 68, 52, 34, 21, 12] },
  { id: 'c-004', name: 'Seasonal Tire Swap',          channel: 'email', status: 'sent',      sentDate: '2026-05-10', recipients: 3280, opens: 1428, clicks: 541, attributedBookings: 163,attributedRevenue: 14_670_00, optOuts: 41, trend: [0, 210, 180, 98, 54, 30, 0] },
  { id: 'c-005', name: 'Win-Back — 60+ Day Silent',   channel: 'sms',   status: 'scheduled', sentDate: '2026-06-18', recipients: 0,    opens: 0,    clicks: 0,   attributedBookings: 0,  attributedRevenue: 0,         optOuts: 0,  trend: [0, 0, 0, 0, 0, 0, 0] },
];

// ─── Live Visits (current) ────────────────────────────────────────────────────
export const LIVE_VISITS: LiveVisit[] = [
  { id: 'lv-001', customerName: 'Maria Santos',   techName: 'Mike Torres',   service: '4-Tire Mount & Balance', state: 'in_progress', startedAt: '2026-06-14T10:15:00Z', vehicle: '2019 Honda Accord',    revenue: 89_99 },
  { id: 'lv-002', customerName: 'Rachel Green',   techName: 'Sarah Chen',    service: 'TPMS Sensor Replace',    state: 'on_site',     startedAt: '2026-06-14T11:30:00Z', vehicle: '2021 Toyota Camry',    revenue: 49_99 },
  { id: 'lv-003', customerName: 'Kevin Brown',    techName: 'Carlos Rivera', service: 'Mobile Flat Repair',     state: 'en_route',    startedAt: '2026-06-14T12:00:00Z', vehicle: '2021 Kia Sorento',     revenue: 59_99 },
  { id: 'lv-004', customerName: 'James Patel',    techName: 'Derek Smith',   service: 'Tire Rotation',          state: 'in_progress', startedAt: '2026-06-14T11:00:00Z', vehicle: '2021 Toyota Camry',    revenue: 19_99 },
];

export const AT_RISK_VISITS: AtRiskVisit[] = [
  { visitId: 'v-301', customerName: 'Priya Nair',    service: 'TPMS Sensor Replace', scheduledFor: '2026-06-15 10:00', partName: 'TPMS Sensor Kit', partEta: '2026-06-16', riskReason: 'Part ETA after appointment date' },
  { visitId: 'v-302', customerName: 'David Lee',     service: '4-Tire Mount & Balance', scheduledFor: '2026-06-15 14:00', partName: 'Tire 225/55R17', partEta: '2026-06-15', riskReason: 'Same-day delivery — risk of delay' },
];

// ─── Platform Observability ───────────────────────────────────────────────────
export const CONNECTOR_HEALTH: ConnectorHealth[] = [
  { name: 'ATD API',           status: 'healthy',  uptimePct: 99.8, p50ms: 142,  p95ms: 380,  p99ms: 820,  lastChecked: '2026-06-14T13:55:00Z' },
  { name: 'TireHub API',       status: 'healthy',  uptimePct: 99.5, p50ms: 198,  p95ms: 520,  p99ms: 1100, lastChecked: '2026-06-14T13:55:00Z' },
  { name: 'Stripe Payments',   status: 'healthy',  uptimePct: 99.99,p50ms: 88,   p95ms: 210,  p99ms: 480,  lastChecked: '2026-06-14T13:55:00Z' },
  { name: 'Twilio SMS',        status: 'degraded', uptimePct: 97.2, p50ms: 340,  p95ms: 1800, p99ms: 4200, lastChecked: '2026-06-14T13:55:00Z' },
  { name: 'Resend Email',      status: 'healthy',  uptimePct: 99.9, p50ms: 112,  p95ms: 290,  p99ms: 610,  lastChecked: '2026-06-14T13:55:00Z' },
];

export const API_METRICS: ApiMetric[] = Array.from({ length: 14 }, (_, i) => ({
  hour: `${String(i).padStart(2, '0')}:00`,
  requests: Math.round(120 + rng(i * 13) * 380),
  errors:   Math.round(rng(i * 7) * 8),
  p50ms:    Math.round(80 + rng(i * 3) * 60),
  p95ms:    Math.round(200 + rng(i * 11) * 180),
}));

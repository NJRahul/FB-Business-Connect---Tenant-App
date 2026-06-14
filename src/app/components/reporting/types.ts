export type ReportPeriod = '7d' | '30d' | '90d' | 'custom';

// ─── Revenue ──────────────────────────────────────────────────────────────────
export interface DailyRevenue {
  date: string;   // YYYY-MM-DD
  gross: number;  // cents
  labor: number;
  parts: number;
  refunds: number;
}

export interface ServiceRevenue {
  serviceType: string;
  revenue: number;
  jobCount: number;
  avgTicket: number;
  laborSplit: number;
  partsSplit: number;
}

export interface RefundRecord {
  id: string;
  date: string;
  customerName: string;
  service: string;
  amount: number;
  reason: string;
  techName: string;
}

export interface ReconciliationRow {
  date: string;
  description: string;
  shopRevenue: number;
  stripePayout: number;
  platformFee: number;
  stripeFee: number;
  matched: boolean;
}

// ─── Technician Stats ─────────────────────────────────────────────────────────
export interface TechnicianStat {
  techId: string;
  name: string;
  initials: string;
  visitsCompleted: number;
  revenue: number;
  laborRevenue: number;
  avgRating: number;
  followUpConvRate: number; // 0–1
  onTimeRate: number;       // 0–1
  utilization: number;      // 0–1
  rankChange: number;       // + = moved up, - = moved down
}

// ─── KPIs ─────────────────────────────────────────────────────────────────────
export interface KPIMetric {
  key: string;
  label: string;
  unit: string;            // '%', 'days', 'hrs', '★', etc.
  current: number;
  benchmark?: number;
  goodDirection: 'up' | 'down';
  history13w: number[];    // 13 weekly values oldest→newest
}

// ─── Funnel ───────────────────────────────────────────────────────────────────
export interface FunnelStep {
  event: string;
  label: string;
  count: number;
}

export interface AbandonedCart {
  id: string;
  customerName: string;
  vehicle: string;
  service: string;
  cartValue: number;
  dropStep: string;
  hoursSinceDropOff: number;
  recoveryTriggered: boolean;
}

// ─── Customer Analytics ───────────────────────────────────────────────────────
export interface CustomerStat {
  customerId: string;
  name: string;
  ltv: number;
  aov: number;
  visitCount: number;
  lastVisit: string;
  daysSinceLast: number;
  emailOptIn: boolean;
  smsOptIn: boolean;
  engagementRate: number; // 0–1
  tags: string[];
}

export interface CohortRow {
  cohortMonth: string;  // YYYY-MM
  cohortSize: number;
  retention: number[];  // % retained at month 0–5
  revenuePerHead: number[];
}

// ─── Location P&L ────────────────────────────────────────────────────────────
export interface LocationPnL {
  locationId: string;
  name: string;
  revenue: number;
  cogs: number;
  refunds: number;
  discounts: number;
  laborCost: number;
  grossMargin: number;
}

// ─── Marketing ───────────────────────────────────────────────────────────────
export interface CampaignStat {
  id: string;
  name: string;
  channel: 'email' | 'sms';
  status: string;
  sentDate: string;
  recipients: number;
  opens: number;
  clicks: number;
  attributedBookings: number;
  attributedRevenue: number;
  optOuts: number;
  trend: number[]; // 7-day delivery
}

// ─── Live Ops ─────────────────────────────────────────────────────────────────
export interface LiveVisit {
  id: string;
  customerName: string;
  techName: string;
  service: string;
  state: 'en_route' | 'on_site' | 'in_progress';
  startedAt: string;
  vehicle: string;
  revenue: number;
}

export interface AtRiskVisit {
  visitId: string;
  customerName: string;
  service: string;
  scheduledFor: string;
  partName: string;
  partEta: string;
  riskReason: string;
}

// ─── Platform Observability ───────────────────────────────────────────────────
export interface ConnectorHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  uptimePct: number;
  p50ms: number;
  p95ms: number;
  p99ms: number;
  lastChecked: string;
}

export interface ApiMetric {
  hour: string;   // HH:00
  requests: number;
  errors: number;
  p50ms: number;
  p95ms: number;
}

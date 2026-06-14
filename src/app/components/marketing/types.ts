// ─── Customer Database ────────────────────────────────────────────────────────
export interface CustomerVehicle {
  year: string;
  make: string;
  model: string;
  trim?: string;
  licensePlate?: string;
}

export type IdMeCategory = 'military_active' | 'veteran' | 'first_responder' | 'nurse' | 'teacher';
export type IdMeStatus = 'verified' | 'expired' | 'pending' | 'none';

export interface MarketingCustomer {
  id: string;
  shopId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addresses: string[];
  vehicles: CustomerVehicle[];
  ltv: number;
  lastVisitDate?: string;
  visitCount: number;
  tags: string[];
  emailOptIn: boolean;
  smsOptIn: boolean;
  referralCode: string;
  referredBy?: string;
  idMeStatus: IdMeStatus;
  idMeCategory?: IdMeCategory;
  idMeVerifiedAt?: string;
  createdAt: string;
}

// ─── Consent Log ─────────────────────────────────────────────────────────────
export type ConsentEvent = 'opt_in' | 'opt_out' | 'stop_keyword' | 'unsubscribe_link' | 'manual_suppression';
export type ConsentChannel = 'email' | 'sms';

export interface ConsentLog {
  id: string;
  shopId: string;
  customerId: string;
  customerName: string;
  channel: ConsentChannel;
  eventType: ConsentEvent;
  source: string;
  createdAt: string;
}

// ─── Segments ─────────────────────────────────────────────────────────────────
export type FilterOperator = 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'in' | 'not_in' | 'within_days' | 'older_than_days';

export interface SegmentFilter {
  id: string;
  field: string;
  fieldLabel: string;
  operator: FilterOperator;
  value: string | number;
  valueLabel?: string;
}

export interface Segment {
  id: string;
  shopId: string;
  name: string;
  description: string;
  filters: SegmentFilter[];
  memberCount: number;
  lastComputedAt: string;
  isTemplate: boolean;
  createdAt: string;
}

// ─── Campaigns ────────────────────────────────────────────────────────────────
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
export type CampaignChannel = 'email' | 'sms';

export interface CampaignContent {
  subject?: string;
  preheader?: string;
  body: string;
  smsText?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  promoCode?: string;
}

export type StopWhenCondition = 'books_appointment' | 'submits_review' | 'replies_to_sms' | 'unsubscribes';
export type StartWhenTrigger = 'estimate_sent' | 'job_paid' | 'warranty_expiring_30d' | 'visit_completed_no_rebooking' | 'manual';

export interface Campaign {
  id: string;
  shopId: string;
  segmentId: string;
  segmentName: string;
  name: string;
  channels: CampaignChannel[];
  status: CampaignStatus;
  content: CampaignContent;
  scheduledAt?: string;
  sentAt?: string;
  attributionWindowDays: number;
  stopWhenConditions: StopWhenCondition[];
  startWhenTrigger: StartWhenTrigger;
  sent: number;
  delivered: number;
  opens: number;
  clicks: number;
  bookings: number;
  revenue: number;
  unsubscribes: number;
  createdAt: string;
}

export interface CampaignEvent {
  id: string;
  campaignId: string;
  customerId: string;
  customerName: string;
  eventType: 'sent' | 'delivered' | 'opened' | 'clicked' | 'unsubscribed' | 'stop_when_triggered' | 'booked';
  occurredAt: string;
}

// ─── Reviews ──────────────────────────────────────────────────────────────────
export type ReviewSource = 'platform' | 'gbp';

export interface Review {
  id: string;
  shopId: string;
  visitId?: string;
  customerId: string;
  customerName: string;
  rating: number;
  feedbackText: string;
  published: boolean;
  source: ReviewSource;
  locationName?: string;
  staffResponse?: string;
  responsePublishedAt?: string;
  createdAt: string;
}

export interface ReviewRequest {
  id: string;
  shopId: string;
  visitId: string;
  customerId: string;
  customerName: string;
  sentAt: string;
  channel: ConsentChannel;
  completed: boolean;
}

// ─── Referrals ────────────────────────────────────────────────────────────────
export type RewardType = 'fixed_credit' | 'pct_discount' | 'free_service';

export interface ReferralCode {
  id: string;
  shopId: string;
  customerId: string;
  customerName: string;
  code: string;
  rewardType: RewardType;
  rewardValue: number;
  uses: number;
  conversions: number;
  rewardsEarned: number;
  rewardsAvailable: number;
  createdAt: string;
}

export interface ReferralActivity {
  id: string;
  referralCodeId: string;
  referrerName: string;
  newCustomerName: string;
  status: 'clicked' | 'signed_up' | 'purchased';
  rewardGranted: boolean;
  occurredAt: string;
}

// ─── GBP / LSA ────────────────────────────────────────────────────────────────
export interface GBPConnection {
  id: string;
  shopId: string;
  locationId: string;
  locationName: string;
  gbpLocationId: string;
  connected: boolean;
  lastSyncAt?: string;
  tokenExpiresAt?: string;
  reviewCount: number;
  avgRating: number;
}

export interface LSAConnection {
  id: string;
  shopId: string;
  locationId: string;
  locationName: string;
  connected: boolean;
  leads: number;
  booked: number;
  costPerLead: number;
  costPerBookedJob: number;
  attributedRevenue: number;
  lastSyncAt?: string;
}

// ─── Social Media ─────────────────────────────────────────────────────────────
export type SocialPlatform = 'facebook' | 'instagram';
export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

export interface SocialPost {
  id: string;
  shopId: string;
  platforms: SocialPlatform[];
  caption: string;
  imageEmoji?: string;
  scheduledAt?: string;
  publishedAt?: string;
  status: PostStatus;
  reach?: number;
  engagement?: number;
  clicks?: number;
}

// ─── Analytics Config ─────────────────────────────────────────────────────────
export interface AnalyticsConfig {
  ga4MeasurementId?: string;
  metaPixelId?: string;
  googleAdsConversionId?: string;
  tagManagerId?: string;
  cookieConsentEnabled: boolean;
  metaConversionsApiEnabled: boolean;
}

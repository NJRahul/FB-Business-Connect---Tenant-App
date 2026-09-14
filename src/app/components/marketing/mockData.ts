import type {
  MarketingCustomer, Segment, Campaign, Review, ReviewRequest,
  ReferralCode, ReferralActivity, ConsentLog, GBPConnection,
  LSAConnection, SocialPost, AnalyticsConfig,
} from './types';

// ─── Customers ────────────────────────────────────────────────────────────────
export const CUSTOMERS: MarketingCustomer[] = [
  {
    id: 'mc-1', shopId: 'shop-1', firstName: 'James', lastName: 'Calloway',
    email: 'james.calloway@email.com', phone: '(214) 555-0142',
    addresses: ['412 Maple St, Irving, TX 75038'],
    vehicles: [{ year: '2019', make: 'Honda', model: 'Accord', trim: 'EX' }, { year: '2021', make: 'Ford', model: 'Explorer', trim: 'XLT' }],
    ltv: 1842.50, lastVisitDate: '2026-06-14', visitCount: 9,
    tags: ['high-value', 'fleet-adjacent', 'all-season'],
    emailOptIn: true, smsOptIn: true,
    referralCode: 'JAMES-X4K9', referredBy: undefined,
    idMeStatus: 'none', createdAt: '2024-03-10T00:00:00',
  },
  {
    id: 'mc-2', shopId: 'shop-1', firstName: 'Maria', lastName: 'Reyes',
    email: 'maria.reyes@email.com', phone: '(469) 555-0278',
    addresses: ['8821 Oak Ave, Dallas, TX 75001'],
    vehicles: [{ year: '2021', make: 'Toyota', model: 'Camry', trim: 'SE' }],
    ltv: 654.30, lastVisitDate: '2026-06-14', visitCount: 4,
    tags: ['regular', 'all-season'],
    emailOptIn: true, smsOptIn: false,
    referralCode: 'MARIA-B2Q7', referredBy: 'JAMES-X4K9',
    idMeStatus: 'verified', idMeCategory: 'nurse', idMeVerifiedAt: '2025-11-15T00:00:00',
    createdAt: '2024-09-01T00:00:00',
  },
  {
    id: 'mc-3', shopId: 'shop-1', firstName: 'Robert', lastName: 'Kim',
    email: 'robert.kim@email.com', phone: '(972) 555-0501',
    addresses: ['2200 Commerce Dr, Carrollton, TX 75006'],
    vehicles: [{ year: '2022', make: 'BMW', model: '5 Series', trim: '530i' }],
    ltv: 2910.00, lastVisitDate: '2025-12-08', visitCount: 14,
    tags: ['high-value', 'performance', 'lapsed'],
    emailOptIn: true, smsOptIn: true,
    referralCode: 'ROBERT-P5M2', referredBy: undefined,
    idMeStatus: 'verified', idMeCategory: 'veteran', idMeVerifiedAt: '2025-06-01T00:00:00',
    createdAt: '2023-08-15T00:00:00',
  },
  {
    id: 'mc-4', shopId: 'shop-1', firstName: 'Patricia', lastName: 'Owens',
    email: 'p.owens@email.com', phone: '(214) 555-0945',
    addresses: ['123 Main St, Dallas, TX 75001'],
    vehicles: [{ year: '2018', make: 'BMW', model: '3 Series', trim: '330i' }],
    ltv: 389.20, lastVisitDate: '2026-06-14', visitCount: 3,
    tags: ['new-customer'],
    emailOptIn: false, smsOptIn: false,
    referralCode: 'PATRI-N8J1', referredBy: undefined,
    idMeStatus: 'none', createdAt: '2026-05-20T00:00:00',
  },
  {
    id: 'mc-5', shopId: 'shop-1', firstName: 'Marcus', lastName: 'Webb',
    email: 'marcus.w@email.com', phone: '(469) 555-0773',
    addresses: ['6200 Gaston Ave, Dallas, TX 75214'],
    vehicles: [{ year: '2020', make: 'Jeep', model: 'Wrangler', trim: 'Sport' }],
    ltv: 731.40, lastVisitDate: '2025-08-22', visitCount: 6,
    tags: ['lapsed', 'truck-suv'],
    emailOptIn: true, smsOptIn: true,
    referralCode: 'MARCU-K3F6', referredBy: undefined,
    idMeStatus: 'verified', idMeCategory: 'military_active', idMeVerifiedAt: '2025-09-10T00:00:00',
    createdAt: '2023-11-01T00:00:00',
  },
  {
    id: 'mc-6', shopId: 'shop-1', firstName: 'Sandra', lastName: 'Torres',
    email: 'sandra.t@email.com', phone: '(972) 555-0234',
    addresses: ['900 Prudential Dr, Dallas, TX 75201'],
    vehicles: [{ year: '2023', make: 'Toyota', model: 'Highlander', trim: 'Limited' }],
    ltv: 1205.80, lastVisitDate: '2025-11-30', visitCount: 8,
    tags: ['high-value', 'suv', 'all-season'],
    emailOptIn: true, smsOptIn: true,
    referralCode: 'SANDR-W9L4', referredBy: undefined,
    idMeStatus: 'verified', idMeCategory: 'teacher', idMeVerifiedAt: '2025-08-20T00:00:00',
    createdAt: '2023-04-01T00:00:00',
  },
];

// ─── Segments ─────────────────────────────────────────────────────────────────
export const SEGMENTS: Segment[] = [
  {
    id: 'seg-1', shopId: 'shop-1', name: 'All Customers', description: 'Every customer in the database',
    filters: [], memberCount: 6, lastComputedAt: '2026-06-14T10:00:00', isTemplate: true, createdAt: '2026-01-01T00:00:00',
  },
  {
    id: 'seg-2', shopId: 'shop-1', name: 'Lapsed 12+ Months', description: 'Customers who haven\'t visited in over a year',
    filters: [{ id: 'f1', field: 'lastVisitDate', fieldLabel: 'Last Visit', operator: 'older_than_days', value: 365, valueLabel: '365 days' }],
    memberCount: 2, lastComputedAt: '2026-06-14T10:00:00', isTemplate: true, createdAt: '2026-01-01T00:00:00',
  },
  {
    id: 'seg-3', shopId: 'shop-1', name: 'Bought All-Season Tires (24 mo)', description: 'Customers who purchased all-season tires in the last 24 months',
    filters: [
      { id: 'f1', field: 'tags', fieldLabel: 'Tags', operator: 'contains', value: 'all-season', valueLabel: 'all-season' },
      { id: 'f2', field: 'lastVisitDate', fieldLabel: 'Last Visit', operator: 'within_days', value: 730, valueLabel: '730 days' },
    ],
    memberCount: 3, lastComputedAt: '2026-06-14T10:00:00', isTemplate: true, createdAt: '2026-01-01T00:00:00',
  },
  {
    id: 'seg-4', shopId: 'shop-1', name: 'High-Value (LTV > $1,000)', description: 'Customers with lifetime value over $1,000',
    filters: [{ id: 'f1', field: 'ltv', fieldLabel: 'Lifetime Value', operator: 'gt', value: 1000, valueLabel: '$1,000' }],
    memberCount: 3, lastComputedAt: '2026-06-14T10:00:00', isTemplate: true, createdAt: '2026-01-01T00:00:00',
  },
  {
    id: 'seg-5', shopId: 'shop-1', name: 'Email Opted-In', description: 'Customers who have consented to email marketing',
    filters: [{ id: 'f1', field: 'emailOptIn', fieldLabel: 'Email Opt-In', operator: 'eq', value: true, valueLabel: 'Yes' }],
    memberCount: 5, lastComputedAt: '2026-06-14T10:00:00', isTemplate: true, createdAt: '2026-01-01T00:00:00',
  },
  {
    id: 'seg-6', shopId: 'shop-1', name: 'Winter Tire Targets', description: 'Truck/SUV owners who haven\'t visited in 6+ months',
    filters: [
      { id: 'f1', field: 'tags', fieldLabel: 'Tags', operator: 'contains', value: 'truck-suv', valueLabel: 'truck-suv' },
      { id: 'f2', field: 'lastVisitDate', fieldLabel: 'Last Visit', operator: 'older_than_days', value: 180, valueLabel: '6 months' },
    ],
    memberCount: 1, lastComputedAt: '2026-06-14T10:00:00', isTemplate: false, createdAt: '2026-06-10T00:00:00',
  },
];

// ─── Campaigns ────────────────────────────────────────────────────────────────
export const CAMPAIGNS: Campaign[] = [
  {
    id: 'cmp-1', shopId: 'shop-1', segmentId: 'seg-2', segmentName: 'Lapsed 12+ Months',
    name: 'Win-Back: Lapsed Customers June 2026', channels: ['email', 'sms'],
    status: 'sent', scheduledAt: '2026-06-01T09:00:00', sentAt: '2026-06-01T09:04:12',
    content: {
      subject: 'We miss you, {{first_name}}! Here\'s 15% off your next visit',
      preheader: 'It\'s been a while. Come back and save.',
      body: `Hi {{first_name}},\n\nWe noticed it's been over a year since your last visit in {{last_service}}. Your {{last_vehicle}} is probably ready for some attention!\n\nUse code {{promo_code}} for 15% off your next service — valid through June 30.\n\n[Book Now]\n\nSee you soon,\nThe FB Business Connect Team`,
      smsText: 'Hi {{first_name}}! It\'s been a while. Save 15% on your next tire service — use code {{promo_code}}. Book: [link] STOP to opt out.',
      ctaLabel: 'Book My Appointment', ctaUrl: 'https://shop.fb-business-connect.app/book?utm_campaign=cmp-1&utm_source=email',
      promoCode: 'WINBACK15',
    },
    attributionWindowDays: 30,
    stopWhenConditions: ['books_appointment', 'unsubscribes'],
    startWhenTrigger: 'manual',
    sent: 2, delivered: 2, opens: 1, clicks: 1, bookings: 0, revenue: 0, unsubscribes: 0,
    createdAt: '2026-05-28T00:00:00',
  },
  {
    id: 'cmp-2', shopId: 'shop-1', segmentId: 'seg-3', segmentName: 'Bought All-Season Tires (24 mo)',
    name: 'Winter Tire Reminder — Fall 2026', channels: ['email'],
    status: 'scheduled', scheduledAt: '2026-09-15T09:00:00',
    content: {
      subject: '{{first_name}}, is your {{last_vehicle}} ready for winter?',
      preheader: 'All-season tires aren\'t always enough. Here\'s what to know.',
      body: `Hi {{first_name}},\n\nYou purchased all-season tires for your {{last_vehicle}} in {{last_service}}. As temperatures drop, it's worth considering a winter tire upgrade for added safety and traction.\n\nCheck our winter tire inventory — we'll get you scheduled before the rush.\n\n[View Winter Tires]\n\nStay safe,\nThe FB Business Connect Team`,
      ctaLabel: 'View Winter Tires', ctaUrl: 'https://shop.fb-business-connect.app/winter?utm_campaign=cmp-2',
    },
    attributionWindowDays: 45,
    stopWhenConditions: ['books_appointment'],
    startWhenTrigger: 'manual',
    sent: 0, delivered: 0, opens: 0, clicks: 0, bookings: 0, revenue: 0, unsubscribes: 0,
    createdAt: '2026-06-12T00:00:00',
  },
  {
    id: 'cmp-3', shopId: 'shop-1', segmentId: 'seg-4', segmentName: 'High-Value (LTV > $1,000)',
    name: 'VIP Appreciation — June 2026', channels: ['email', 'sms'],
    status: 'sent', sentAt: '2026-06-05T09:00:00',
    content: {
      subject: 'Thank you, {{first_name}} — a special gift inside',
      preheader: 'You\'re one of our most valued customers.',
      body: `Hi {{first_name}},\n\nAs one of our VIP customers with over $1,000 in service history, we want to say thank you.\n\nYou've received a complimentary tire rotation on your next visit — no charge, no strings attached.\n\nJust mention "VIP THANKS" when you book.\n\nWith appreciation,\nThe FB Business Connect Team`,
      smsText: '{{first_name}}, you\'re a FB Business Connect VIP! Enjoy a FREE tire rotation on your next visit — just say "VIP THANKS" when booking. [link] STOP to opt out.',
      ctaLabel: 'Book Free Rotation', ctaUrl: 'https://shop.fb-business-connect.app/book?utm_campaign=cmp-3',
    },
    attributionWindowDays: 30,
    stopWhenConditions: ['books_appointment', 'unsubscribes'],
    startWhenTrigger: 'manual',
    sent: 3, delivered: 3, opens: 2, clicks: 2, bookings: 1, revenue: 1842.50, unsubscribes: 0,
    createdAt: '2026-06-01T00:00:00',
  },
  {
    id: 'cmp-4', shopId: 'shop-1', segmentId: 'seg-1', segmentName: 'All Customers',
    name: 'Post-Visit Review Request (Auto)', channels: ['email', 'sms'],
    status: 'sending',
    content: {
      subject: '{{first_name}}, how was your experience?',
      preheader: 'Leave us a quick review — it takes 30 seconds.',
      body: `Hi {{first_name}},\n\nThank you for your recent visit! We hope everything went smoothly.\n\nWould you mind leaving us a quick review? It only takes 30 seconds and helps other drivers find us.\n\n[Leave a Review]\n\nThanks so much,\nThe FB Business Connect Team`,
      smsText: 'Hi {{first_name}}, thanks for visiting! Leave us a quick review: [link] STOP to opt out.',
      ctaLabel: 'Leave a Review', ctaUrl: 'https://shop.fb-business-connect.app/review?utm_campaign=cmp-4',
    },
    attributionWindowDays: 7,
    stopWhenConditions: ['submits_review'],
    startWhenTrigger: 'visit_completed_no_rebooking',
    sent: 6, delivered: 6, opens: 4, clicks: 3, bookings: 0, revenue: 0, unsubscribes: 0,
    createdAt: '2026-01-01T00:00:00',
  },
];

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const REVIEWS: Review[] = [
  {
    id: 'rev-1', shopId: 'shop-1', visitId: 'v-001', customerId: 'mc-1',
    customerName: 'James Calloway', rating: 5,
    feedbackText: 'Mike was fantastic — showed up exactly on time, finished early, and left my driveway cleaner than he found it. Will 100% be back.',
    published: true, source: 'platform',
    staffResponse: 'Thank you, James! Mike takes a lot of pride in his work. See you next time!',
    responsePublishedAt: '2026-06-14T14:00:00', createdAt: '2026-06-14T12:30:00',
  },
  {
    id: 'rev-2', shopId: 'shop-1', visitId: 'dv-001', customerId: 'mc-2',
    customerName: 'Maria Reyes', rating: 4,
    feedbackText: 'Quick service, very professional. Only reason it\'s not 5 stars is the wait time on parts was a bit longer than expected.',
    published: true, source: 'platform',
    staffResponse: undefined, createdAt: '2026-06-14T11:15:00',
  },
  {
    id: 'rev-3', shopId: 'shop-1', customerId: 'mc-3',
    customerName: 'Robert Kim', rating: 5,
    feedbackText: 'Best tire shop in Dallas. Prices are fair and they actually explain what they\'re doing. Have been coming here for 3 years.',
    published: true, source: 'gbp', locationName: 'Dallas - Main',
    staffResponse: undefined, createdAt: '2026-06-13T09:00:00',
  },
  {
    id: 'rev-4', shopId: 'shop-1', customerId: 'mc-5',
    customerName: 'Marcus Webb', rating: 3,
    feedbackText: 'Service was fine but communication could be better. Nobody told me parts were delayed until I called.',
    published: false, source: 'platform',
    staffResponse: undefined, createdAt: '2026-06-12T18:00:00',
  },
  {
    id: 'rev-5', shopId: 'shop-1', customerId: 'mc-6',
    customerName: 'Sandra Torres', rating: 5,
    feedbackText: 'Carlos went above and beyond. Spotted an issue with my brake pads while changing tires and gave me a fair quote on the spot. Very trustworthy.',
    published: true, source: 'gbp', locationName: 'Dallas - Main',
    staffResponse: 'So glad Carlos could help, Sandra! Your safety is our priority. See you again soon.',
    responsePublishedAt: '2026-06-12T09:30:00', createdAt: '2026-06-11T16:00:00',
  },
];

export const REVIEW_REQUESTS: ReviewRequest[] = [
  { id: 'rr-1', shopId: 'shop-1', visitId: 'v-001', customerId: 'mc-1', customerName: 'James Calloway', sentAt: '2026-06-14T10:30:00', channel: 'email', completed: true },
  { id: 'rr-2', shopId: 'shop-1', visitId: 'dv-001', customerId: 'mc-2', customerName: 'Maria Reyes', sentAt: '2026-06-14T10:30:00', channel: 'sms', completed: true },
  { id: 'rr-3', shopId: 'shop-1', visitId: 'dv-005', customerId: 'mc-3', customerName: 'Robert Kim', sentAt: '2026-06-14T11:00:00', channel: 'email', completed: false },
];

// ─── Referrals ────────────────────────────────────────────────────────────────
export const REFERRAL_CODES: ReferralCode[] = [
  { id: 'rc-1', shopId: 'shop-1', customerId: 'mc-1', customerName: 'James Calloway', code: 'JAMES-X4K9', rewardType: 'fixed_credit', rewardValue: 25, uses: 3, conversions: 1, rewardsEarned: 25, rewardsAvailable: 25, createdAt: '2024-03-10T00:00:00' },
  { id: 'rc-2', shopId: 'shop-1', customerId: 'mc-3', customerName: 'Robert Kim',     code: 'ROBERT-P5M2', rewardType: 'fixed_credit', rewardValue: 25, uses: 0, conversions: 0, rewardsEarned: 0, rewardsAvailable: 0, createdAt: '2023-08-15T00:00:00' },
  { id: 'rc-3', shopId: 'shop-1', customerId: 'mc-6', customerName: 'Sandra Torres',  code: 'SANDR-W9L4', rewardType: 'pct_discount', rewardValue: 10, uses: 2, conversions: 2, rewardsEarned: 50, rewardsAvailable: 25, createdAt: '2023-04-01T00:00:00' },
];

export const REFERRAL_ACTIVITY: ReferralActivity[] = [
  { id: 'ra-1', referralCodeId: 'rc-1', referrerName: 'James Calloway', newCustomerName: 'Maria Reyes',    status: 'purchased', rewardGranted: true,  occurredAt: '2024-09-01T00:00:00' },
  { id: 'ra-2', referralCodeId: 'rc-1', referrerName: 'James Calloway', newCustomerName: 'Tyler Brooks',   status: 'signed_up', rewardGranted: false, occurredAt: '2026-06-10T00:00:00' },
  { id: 'ra-3', referralCodeId: 'rc-1', referrerName: 'James Calloway', newCustomerName: 'Linda Schultz',  status: 'clicked',   rewardGranted: false, occurredAt: '2026-06-13T00:00:00' },
  { id: 'ra-4', referralCodeId: 'rc-3', referrerName: 'Sandra Torres',  newCustomerName: 'Paul Martinez',  status: 'purchased', rewardGranted: true,  occurredAt: '2025-01-15T00:00:00' },
  { id: 'ra-5', referralCodeId: 'rc-3', referrerName: 'Sandra Torres',  newCustomerName: 'Diana Chen',     status: 'purchased', rewardGranted: true,  occurredAt: '2025-08-20T00:00:00' },
];

// ─── Consent Log ─────────────────────────────────────────────────────────────
export const CONSENT_LOGS: ConsentLog[] = [
  { id: 'cl-1', shopId: 'shop-1', customerId: 'mc-4', customerName: 'Patricia Owens', channel: 'email', eventType: 'opt_out', source: 'Account preferences page', createdAt: '2026-05-25T14:00:00' },
  { id: 'cl-2', shopId: 'shop-1', customerId: 'mc-4', customerName: 'Patricia Owens', channel: 'sms',   eventType: 'opt_out', source: 'Account preferences page', createdAt: '2026-05-25T14:01:00' },
  { id: 'cl-1b', shopId: 'shop-1', customerId: 'mc-5', customerName: 'Marcus Webb',   channel: 'sms',   eventType: 'opt_in',  source: 'Booking confirmation page', createdAt: '2023-11-01T09:00:00' },
  { id: 'cl-3', shopId: 'shop-1', customerId: 'mc-2', customerName: 'Maria Reyes',    channel: 'sms',   eventType: 'opt_out', source: 'STOP keyword received from +14695550278', createdAt: '2026-06-10T11:30:00' },
  { id: 'cl-4', shopId: 'shop-1', customerId: 'mc-1', customerName: 'James Calloway', channel: 'email', eventType: 'opt_in',  source: 'Account creation', createdAt: '2024-03-10T00:00:00' },
  { id: 'cl-5', shopId: 'shop-1', customerId: 'mc-1', customerName: 'James Calloway', channel: 'sms',   eventType: 'opt_in',  source: 'Account creation', createdAt: '2024-03-10T00:00:00' },
];

// ─── GBP Connections ──────────────────────────────────────────────────────────
export const GBP_CONNECTIONS: GBPConnection[] = [
  {
    id: 'gbp-1', shopId: 'shop-1', locationId: 'loc-1', locationName: 'Dallas - Main',
    gbpLocationId: 'accounts/123/locations/456', connected: true,
    lastSyncAt: '2026-06-14T08:00:00', tokenExpiresAt: '2026-09-14T00:00:00',
    reviewCount: 127, avgRating: 4.7,
  },
  {
    id: 'gbp-2', shopId: 'shop-1', locationId: 'loc-2', locationName: 'Irving - North',
    gbpLocationId: '', connected: false, reviewCount: 0, avgRating: 0,
  },
];

// ─── LSA Connections ──────────────────────────────────────────────────────────
export const LSA_CONNECTIONS: LSAConnection[] = [
  {
    id: 'lsa-1', shopId: 'shop-1', locationId: 'loc-1', locationName: 'Dallas - Main',
    connected: true, leads: 34, booked: 22, costPerLead: 28.50, costPerBookedJob: 44.04,
    attributedRevenue: 8820.00, lastSyncAt: '2026-06-14T09:30:00',
  },
];

// ─── Social Posts ─────────────────────────────────────────────────────────────
export const SOCIAL_POSTS: SocialPost[] = [
  {
    id: 'sp-1', shopId: 'shop-1', platforms: ['facebook', 'instagram'],
    caption: '🔧 Summer is hard on tires. Heat buildup = faster wear and higher blowout risk. Come in for a free visual inspection — no appointment needed at most times!',
    imageEmoji: '🌞', status: 'published', publishedAt: '2026-06-10T10:00:00',
    reach: 2840, engagement: 187, clicks: 63,
  },
  {
    id: 'sp-2', shopId: 'shop-1', platforms: ['facebook'],
    caption: 'Did you know? Your tire pressure drops about 1 PSI for every 10°F drop in temperature. Winter is coming — let us check yours before it becomes a problem.',
    imageEmoji: '❄️', status: 'scheduled', scheduledAt: '2026-09-01T09:00:00',
  },
  {
    id: 'sp-3', shopId: 'shop-1', platforms: ['facebook', 'instagram'],
    caption: 'Fleet managers — we handle fleets of all sizes with priority scheduling and net-30 billing. Call us or fill out our fleet inquiry form.',
    imageEmoji: '🚛', status: 'draft',
  },
];

// ─── Analytics Config ─────────────────────────────────────────────────────────
export const ANALYTICS_CONFIG: AnalyticsConfig = {
  ga4MeasurementId: 'G-XXXXX1234',
  metaPixelId: '1234567890123',
  googleAdsConversionId: 'AW-987654321/AbCdEfGhIjKlMnOp',
  tagManagerId: 'GTM-XXXXXX',
  cookieConsentEnabled: true,
  metaConversionsApiEnabled: true,
};

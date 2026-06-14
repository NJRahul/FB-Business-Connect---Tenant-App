import type { TenantBranding, CustomDomain, CustomEmailSender } from './types';

export const INITIAL_BRANDING: TenantBranding = {
  logoLightUrl: null,
  logoDarkUrl: null,
  faviconUrl: null,
  primaryColor: '#C0392B',
  secondaryColor: '#1A1A1A',
  accentColor: '#F39C12',
  customCss: `/* Custom CSS — scoped to your storefront only */\n\n.hero-banner {\n  /* Customize the hero section */\n}\n\n.book-cta-button {\n  /* Override the booking CTA */\n  border-radius: 4px;\n}\n`,
  tagline: 'Fast, mobile tire service — we come to you',
  aboutText: 'Acme Tires has been serving the Greater Bay Area since 2018. Our certified technicians bring the shop to your driveway.',
  footerText: '© 2026 Acme Tires. All rights reserved.',
  tosUrl: 'https://acmetires.com/tos',
  privacyUrl: 'https://acmetires.com/privacy',
  poweredByHidden: true,
};

export const CUSTOM_DOMAIN: CustomDomain = {
  id: 'dom_1',
  domain: 'www.acmetires.com',
  verificationStatus: 'verified',
  sslExpiresAt: '2026-09-14',
  sslDaysRemaining: 92,
  dnsRecords: [
    {
      type: 'CNAME',
      host: 'www',
      value: 'acmetires.proxy.tdforge.io',
      ttl: 3600,
      required: true,
      verified: true,
    },
    {
      type: 'TXT',
      host: '@',
      value: 'tdforge-verify=xk8z2pq9m4r7wj5c',
      ttl: 300,
      required: true,
      verified: true,
    },
  ],
  createdAt: '2026-03-01',
};

export const CUSTOM_EMAIL_SENDER: CustomEmailSender = {
  id: 'email_1',
  domain: 'acmetires.com',
  fromName: 'Acme Tires',
  dkimStatus: 'pass',
  spfStatus: 'pass',
  dmarcStatus: 'fail',
  active: false,
  createdAt: '2026-05-10',
  dkimRecord: {
    type: 'TXT',
    host: 'tdforge._domainkey.acmetires.com',
    value: 'v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC2xk9P+...',
    status: 'pass',
  },
  spfRecord: {
    type: 'TXT',
    host: 'acmetires.com',
    value: 'v=spf1 include:_spf.tdforge.io ~all',
    status: 'pass',
  },
  dmarcRecord: {
    type: 'TXT',
    host: '_dmarc.acmetires.com',
    value: 'v=DMARC1; p=quarantine; rua=mailto:dmarc@tdforge.io; pct=100',
    status: 'fail',
  },
  bounceRate: 0.012,
  spamRate: 0.002,
};

export const TOUCHPOINTS = [
  { area: 'Storefront',              pages: ['Homepage', 'Service catalog', 'Booking flow', 'Checkout', 'Confirmation'], icon: '🌐' },
  { area: 'Customer Account Portal', pages: ['Order history', 'Upcoming visits', 'Profile settings'], icon: '👤' },
  { area: 'Customer Emails',         pages: ['Booking confirmation', 'Reminder', 'Follow-up', 'Invoice receipt'], icon: '✉️' },
  { area: 'SMS Messages',            pages: ['Appointment reminder', 'Technician en-route', 'Post-visit follow-up'], icon: '💬' },
  { area: 'PDF Invoices',            pages: ['Logo header', 'Brand colors', 'Footer contact info'], icon: '🧾' },
  { area: 'Technician Arrival',      pages: ['Arrival notification', 'On-site confirmation SMS'], icon: '🔧' },
];

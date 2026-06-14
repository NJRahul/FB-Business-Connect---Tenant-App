export type VerificationStatus = 'pending' | 'verified' | 'failed';
export type DnsRecordStatus = 'pass' | 'fail' | 'pending';
export type BrandingPlanTier = 'starter' | 'pro' | 'enterprise';

export interface TenantBranding {
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  customCss: string;
  tagline: string;
  aboutText: string;
  footerText: string;
  tosUrl: string;
  privacyUrl: string;
  poweredByHidden: boolean;
}

export interface DnsRecord {
  type: 'A' | 'CNAME' | 'TXT' | 'MX';
  host: string;
  value: string;
  ttl: number;
  required: boolean;
  verified: boolean;
}

export interface CustomDomain {
  id: string;
  domain: string;
  verificationStatus: VerificationStatus;
  sslExpiresAt: string | null;
  sslDaysRemaining: number | null;
  dnsRecords: DnsRecord[];
  createdAt: string;
}

export interface EmailDnsRecord {
  type: 'TXT' | 'CNAME' | 'MX';
  host: string;
  value: string;
  status: DnsRecordStatus;
}

export interface CustomEmailSender {
  id: string;
  domain: string;
  fromName: string;
  dkimStatus: DnsRecordStatus;
  spfStatus: DnsRecordStatus;
  dmarcStatus: DnsRecordStatus;
  active: boolean;
  createdAt: string;
  dkimRecord: EmailDnsRecord;
  spfRecord: EmailDnsRecord;
  dmarcRecord: EmailDnsRecord;
  bounceRate: number;
  spamRate: number;
}

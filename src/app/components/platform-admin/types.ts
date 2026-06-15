export type PlatformAdminRole = 'super_admin' | 'admin' | 'viewer';
export type LifecycleState = 'provisioning' | 'active' | 'trial' | 'suspended' | 'archived' | 'deleted';
export type PlanTier = 'starter' | 'pro' | 'enterprise';
export type StripeConnectStatus = 'connected' | 'pending' | 'disconnected' | 'restricted';
export type FlagScopeType = 'global' | 'plan_tier' | 'tenant';
export type AnnouncementStatus = 'scheduled' | 'active' | 'expired';
export type ToolName = 'replay_webhook' | 'reprocess_queue' | 'catalog_sync' | 'disconnect_stripe';

export interface PlatformAdmin {
  id: string;
  email: string;
  name: string;
  role: PlatformAdminRole;
  mfaEnabled: boolean;
  createdAt: string;
}

export interface Tenant {
  id: string;
  businessName: string;
  ownerName: string;
  ownerEmail: string;
  subdomain: string;
  planTier: PlanTier;
  lifecycleState: LifecycleState;
  stripeConnectStatus: StripeConnectStatus;
  trialEndsAt?: string;
  createdAt: string;
  lastActivityAt: string;
  mrrCents: number;
  locationCount: number;
  technicianCount: number;
  suspendedReason?: string;
  trialExtensions: TrialExtension[];
}

export interface TrialExtension {
  id: string;
  days: number;
  reason: string;
  approvedBy: string;
  createdAt: string;
  requiresEngineeringLead: boolean;
}

export interface CrossTenantAccessLog {
  id: string;
  adminId: string;
  adminEmail: string;
  adminName: string;
  targetShopId: string;
  targetShopName: string;
  action: string;
  writtenReason: string;
  recordKind: string;
  sessionId: string;
  durationSeconds: number;
  createdAt: string;
  piiAccessed: boolean;
}

export interface FeatureFlag {
  id: string;
  key: string;
  description: string;
  scopeType: FlagScopeType;
  scopeId?: string;
  scopeLabel?: string;
  enabled: boolean;
  createdBy: string;
  updatedAt: string;
}

export interface PlatformAnnouncement {
  id: string;
  title: string;
  body: string;
  visibleFrom: string;
  visibleUntil: string;
  createdBy: string;
  createdAt: string;
  status: AnnouncementStatus;
}

export interface Credential {
  id: string;
  key: string;
  provider: string;
  description: string;
  lastRotatedAt: string;
  lastAccessedAt?: string;
  maskedValue: string;
  tenantId?: string;
  tenantName?: string;
}

export interface CredentialAccessLog {
  id: string;
  adminId: string;
  adminEmail: string;
  adminName: string;
  credentialKey: string;
  reason: string;
  createdAt: string;
}

export interface OperationalToolLog {
  id: string;
  adminId: string;
  adminEmail: string;
  toolName: ToolName;
  targetShopId?: string;
  targetShopName?: string;
  targetEntity?: string;
  outcome: 'success' | 'failed' | 'pending';
  createdAt: string;
}

export interface StatusService {
  name: string;
  uptime99d: number;
  currentStatus: 'operational' | 'degraded' | 'outage';
  latencyMs: number;
}

export interface IncidentUpdate {
  message: string;
  at: string;
}

export interface Incident {
  id: string;
  title: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  severity: 'minor' | 'major' | 'critical';
  affectedServices: string[];
  createdAt: string;
  resolvedAt?: string;
  updates: IncidentUpdate[];
}

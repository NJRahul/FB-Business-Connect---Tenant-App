// ─── Core Enums ───────────────────────────────────────────────────────────────
export type NotificationCategory = 'transactional-customer' | 'transactional-staff' | 'marketing' | 'system';
export type NotificationChannel   = 'email' | 'sms' | 'in-app' | 'push';
export type NotificationStatus    = 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed' | 'bounced';

// ─── Notification Log ─────────────────────────────────────────────────────────
export interface NotificationLog {
  id: string;
  shopId: string;
  recipientId?: string;
  recipientName: string;
  recipientContact: string;
  channel: NotificationChannel;
  category: NotificationCategory;
  templateId: string;
  templateName: string;
  status: NotificationStatus;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  error?: string;
  retryCount: number;
  isTransactional: boolean;
}

// ─── Templates ────────────────────────────────────────────────────────────────
export type TemplateType =
  | 'booking-confirmed' | 'booking-reminder-24h' | 'booking-reminder-1h'
  | 'eta-update' | 'invoice' | 'refund' | 'cancellation'
  | 'parts-arrived' | 'new-booking-staff' | 'reassignment' | 'morning-summary'
  | 'security-alert' | 'platform-announcement'
  | 'follow-up-maintenance' | 'follow-up-rotation' | 'follow-up-seasonal' | 'follow-up-vehicle'
  | 'waitlist-offer' | 'quick-reply';

export interface NotificationTemplate {
  id: string;
  shopId: string;
  type: TemplateType;
  category: NotificationCategory;
  channel: NotificationChannel;
  name: string;
  subject?: string;
  body: string;
  smsText?: string;
  locale: string;
  isDefault: boolean;
  isCustom: boolean;
  createdBy?: string;
  createdAt: string;
}

// ─── Waitlist ─────────────────────────────────────────────────────────────────
export type WaitlistStatus = 'active' | 'offered' | 'claimed' | 'expired' | 'removed';

export interface WaitlistEntry {
  id: string;
  shopId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  serviceType: string;
  vehicleDesc: string;
  earliestDate: string;
  latestDate: string;
  createdAt: string;
  status: WaitlistStatus;
  queuePosition: number;
  offersToday: number;
}

export interface WaitlistOffer {
  id: string;
  waitlistEntryId: string;
  customerName: string;
  serviceType: string;
  slotDate: string;
  slotTime: string;
  token: string;
  offeredAt: string;
  expiresAt: string;
  claimedAt?: string;
  status: 'pending' | 'claimed' | 'declined' | 'expired';
}

// ─── Follow-Up Queue ──────────────────────────────────────────────────────────
export type FollowUpCategory = 'maintenance' | 'rotation' | 'seasonal' | 'vehicle-specific';
export type FollowUpStatus   = 'queued' | 'sent' | 'cancelled';

export interface FollowUpQueue {
  id: string;
  shopId: string;
  visitId: string;
  customerId: string;
  customerName: string;
  customerChannel: NotificationChannel;
  techId: string;
  techName: string;
  templateName: string;
  category: FollowUpCategory;
  note?: string;
  scheduledFor: string;
  sentAt?: string;
  status: FollowUpStatus;
  attributedRevenue: number;
  createdAt: string;
}

// ─── SMS Inbox ────────────────────────────────────────────────────────────────
export type SmsDirection = 'inbound' | 'outbound';

export interface SmsAttachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'file';
  emoji: string;
  size: number;
}

export interface SmsMessage {
  id: string;
  conversationId: string;
  shopId: string;
  direction: SmsDirection;
  body: string;
  attachments: SmsAttachment[];
  sentAt: string;
  readAt?: string;
  senderId?: string;
  senderName?: string;
}

export interface SmsConversation {
  id: string;
  shopId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  lastMessageAt: string;
  lastMessageBody: string;
  unreadCount: number;
}

// ─── Reminder Config ──────────────────────────────────────────────────────────
export interface ReminderConfig {
  id: string;
  shopId: string;
  locationId?: string;
  serviceTypeId: string;
  serviceTypeName: string;
  intervals: number[];
  prepInstructions: string;
  enabled: boolean;
}

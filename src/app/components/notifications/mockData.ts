import type {
  NotificationLog, NotificationTemplate, WaitlistEntry, WaitlistOffer,
  FollowUpQueue, SmsConversation, SmsMessage, ReminderConfig,
} from './types';

// ─── Notification Logs ────────────────────────────────────────────────────────
export const NOTIFICATION_LOGS: NotificationLog[] = [
  { id: 'nl-001', shopId: 'shop-1', recipientId: 'cust-101', recipientName: 'Maria Santos', recipientContact: 'maria@email.com', channel: 'email', category: 'transactional-customer', templateId: 'tpl-bc', templateName: 'Booking Confirmed', status: 'opened', sentAt: '2026-06-14T08:02:00Z', deliveredAt: '2026-06-14T08:02:04Z', openedAt: '2026-06-14T08:15:00Z', retryCount: 0, isTransactional: true },
  { id: 'nl-002', shopId: 'shop-1', recipientId: 'cust-102', recipientName: 'James Patel', recipientContact: '+14155550101', channel: 'sms', category: 'transactional-customer', templateId: 'tpl-br24', templateName: 'Booking Reminder 24h', status: 'delivered', sentAt: '2026-06-13T10:00:00Z', deliveredAt: '2026-06-13T10:00:08Z', retryCount: 0, isTransactional: true },
  { id: 'nl-003', shopId: 'shop-1', recipientId: 'cust-103', recipientName: 'Linda Cho', recipientContact: 'linda@email.com', channel: 'email', category: 'transactional-customer', templateId: 'tpl-inv', templateName: 'Invoice', status: 'clicked', sentAt: '2026-06-14T14:30:00Z', deliveredAt: '2026-06-14T14:30:05Z', openedAt: '2026-06-14T14:45:00Z', clickedAt: '2026-06-14T14:46:00Z', retryCount: 0, isTransactional: true },
  { id: 'nl-004', shopId: 'shop-1', recipientId: 'cust-104', recipientName: 'Derek Wu', recipientContact: '+14155550202', channel: 'sms', category: 'transactional-customer', templateId: 'tpl-eta', templateName: 'ETA Update', status: 'sent', sentAt: '2026-06-14T09:45:00Z', retryCount: 0, isTransactional: true },
  { id: 'nl-005', shopId: 'shop-1', recipientId: 'cust-105', recipientName: 'Aisha Thompson', recipientContact: 'aisha@email.com', channel: 'email', category: 'transactional-customer', templateId: 'tpl-bc', templateName: 'Booking Confirmed', status: 'bounced', sentAt: '2026-06-14T07:00:00Z', error: 'Mailbox does not exist', retryCount: 3, isTransactional: true },
  { id: 'nl-006', shopId: 'shop-1', recipientId: 'cust-106', recipientName: 'Carlos Rivera', recipientContact: '+14155550303', channel: 'sms', category: 'transactional-customer', templateId: 'tpl-canc', templateName: 'Cancellation', status: 'failed', sentAt: '2026-06-14T11:00:00Z', error: 'Invalid phone number', retryCount: 3, isTransactional: true },
  { id: 'nl-007', shopId: 'shop-1', recipientId: 'cust-107', recipientName: 'Sarah Kim', recipientContact: 'sarah@email.com', channel: 'email', category: 'transactional-customer', templateId: 'tpl-ref', templateName: 'Refund Processed', status: 'delivered', sentAt: '2026-06-13T16:00:00Z', deliveredAt: '2026-06-13T16:00:06Z', retryCount: 0, isTransactional: true },
  { id: 'nl-008', shopId: 'shop-1', recipientId: 'tech-201', recipientName: 'Mike Russo', recipientContact: 'mike@shop.com', channel: 'email', category: 'transactional-staff', templateId: 'tpl-nb', templateName: 'New Booking Staff', status: 'opened', sentAt: '2026-06-14T08:05:00Z', deliveredAt: '2026-06-14T08:05:03Z', openedAt: '2026-06-14T08:08:00Z', retryCount: 0, isTransactional: true },
  { id: 'nl-009', shopId: 'shop-1', recipientId: 'tech-202', recipientName: 'Elena Torres', recipientContact: '+14155550404', channel: 'sms', category: 'transactional-staff', templateId: 'tpl-reassign', templateName: 'Reassignment', status: 'delivered', sentAt: '2026-06-14T10:30:00Z', deliveredAt: '2026-06-14T10:30:07Z', retryCount: 0, isTransactional: true },
  { id: 'nl-010', shopId: 'shop-1', recipientId: 'tech-201', recipientName: 'Mike Russo', recipientContact: 'mike@shop.com', channel: 'email', category: 'transactional-staff', templateId: 'tpl-ms', templateName: 'Morning Summary', status: 'opened', sentAt: '2026-06-14T07:00:00Z', deliveredAt: '2026-06-14T07:00:04Z', openedAt: '2026-06-14T07:14:00Z', retryCount: 0, isTransactional: true },
  { id: 'nl-011', shopId: 'shop-1', recipientId: 'cust-108', recipientName: 'Tom Anderson', recipientContact: 'tom@email.com', channel: 'email', category: 'marketing', templateId: 'tpl-fu-maint', templateName: 'Follow-Up: Maintenance', status: 'clicked', sentAt: '2026-06-12T09:00:00Z', deliveredAt: '2026-06-12T09:00:05Z', openedAt: '2026-06-12T11:00:00Z', clickedAt: '2026-06-12T11:03:00Z', retryCount: 0, isTransactional: false },
  { id: 'nl-012', shopId: 'shop-1', recipientId: 'cust-109', recipientName: 'Rachel Green', recipientContact: '+14155550505', channel: 'sms', category: 'marketing', templateId: 'tpl-wl-offer', templateName: 'Waitlist Offer', status: 'delivered', sentAt: '2026-06-14T13:00:00Z', deliveredAt: '2026-06-14T13:00:09Z', retryCount: 0, isTransactional: false },
  { id: 'nl-013', shopId: 'shop-1', recipientId: 'cust-110', recipientName: 'Brian Hall', recipientContact: 'brian@email.com', channel: 'email', category: 'marketing', templateId: 'tpl-fu-rot', templateName: 'Follow-Up: Rotation', status: 'sent', sentAt: '2026-06-14T10:00:00Z', retryCount: 0, isTransactional: false },
  { id: 'nl-014', shopId: 'shop-1', recipientName: 'All Staff', recipientContact: 'staff@shop.com', channel: 'email', category: 'system', templateId: 'tpl-sec', templateName: 'Security Alert', status: 'delivered', sentAt: '2026-06-13T22:00:00Z', deliveredAt: '2026-06-13T22:00:05Z', retryCount: 0, isTransactional: true },
  { id: 'nl-015', shopId: 'shop-1', recipientId: 'cust-101', recipientName: 'Maria Santos', recipientContact: '+14155550111', channel: 'sms', category: 'transactional-customer', templateId: 'tpl-br1', templateName: 'Booking Reminder 1h', status: 'delivered', sentAt: '2026-06-14T11:00:00Z', deliveredAt: '2026-06-14T11:00:06Z', retryCount: 0, isTransactional: true },
  { id: 'nl-016', shopId: 'shop-1', recipientId: 'cust-111', recipientName: 'Priya Nair', recipientContact: 'priya@email.com', channel: 'email', category: 'transactional-customer', templateId: 'tpl-parts', templateName: 'Parts Arrived', status: 'opened', sentAt: '2026-06-13T14:00:00Z', deliveredAt: '2026-06-13T14:00:04Z', openedAt: '2026-06-13T14:20:00Z', retryCount: 0, isTransactional: true },
  { id: 'nl-017', shopId: 'shop-1', recipientId: 'cust-112', recipientName: 'Kevin Brown', recipientContact: '+14155550606', channel: 'sms', category: 'transactional-customer', templateId: 'tpl-eta', templateName: 'ETA Update', status: 'failed', sentAt: '2026-06-14T12:15:00Z', error: 'Twilio error: carrier rejected', retryCount: 2, isTransactional: true },
  { id: 'nl-018', shopId: 'shop-1', recipientId: 'cust-113', recipientName: 'Diana Prince', recipientContact: 'diana@email.com', channel: 'email', category: 'marketing', templateId: 'tpl-fu-seas', templateName: 'Follow-Up: Seasonal', status: 'opened', sentAt: '2026-06-10T09:00:00Z', deliveredAt: '2026-06-10T09:00:05Z', openedAt: '2026-06-10T10:30:00Z', retryCount: 0, isTransactional: false },
  { id: 'nl-019', shopId: 'shop-1', recipientId: 'cust-114', recipientName: 'Omar Sharif', recipientContact: '+14155550707', channel: 'sms', category: 'marketing', templateId: 'tpl-wl-offer', templateName: 'Waitlist Offer', status: 'sent', sentAt: '2026-06-14T13:30:00Z', retryCount: 0, isTransactional: false },
  { id: 'nl-020', shopId: 'shop-1', recipientId: 'tech-203', recipientName: 'Jake Wilson', recipientContact: '+14155550808', channel: 'push', category: 'transactional-staff', templateId: 'tpl-nb', templateName: 'New Booking Staff', status: 'delivered', sentAt: '2026-06-14T08:06:00Z', deliveredAt: '2026-06-14T08:06:02Z', retryCount: 0, isTransactional: true },
  { id: 'nl-021', shopId: 'shop-1', recipientId: 'cust-115', recipientName: 'Fatima Al-Hassan', recipientContact: 'fatima@email.com', channel: 'email', category: 'transactional-customer', templateId: 'tpl-inv', templateName: 'Invoice', status: 'pending', retryCount: 0, isTransactional: true },
  { id: 'nl-022', shopId: 'shop-1', recipientId: 'cust-116', recipientName: 'Chris Martinez', recipientContact: '+14155550909', channel: 'sms', category: 'transactional-customer', templateId: 'tpl-canc', templateName: 'Cancellation', status: 'delivered', sentAt: '2026-06-14T09:00:00Z', deliveredAt: '2026-06-14T09:00:07Z', retryCount: 0, isTransactional: true },
  { id: 'nl-023', shopId: 'shop-1', recipientId: 'cust-117', recipientName: 'Natasha Ivanova', recipientContact: 'natasha@email.com', channel: 'in-app', category: 'system', templateId: 'tpl-ann', templateName: 'Platform Announcement', status: 'delivered', sentAt: '2026-06-14T08:00:00Z', deliveredAt: '2026-06-14T08:00:01Z', retryCount: 0, isTransactional: false },
  { id: 'nl-024', shopId: 'shop-1', recipientId: 'cust-118', recipientName: 'David Lee', recipientContact: 'david@email.com', channel: 'email', category: 'transactional-customer', templateId: 'tpl-ref', templateName: 'Refund Processed', status: 'delivered', sentAt: '2026-06-13T15:00:00Z', deliveredAt: '2026-06-13T15:00:06Z', retryCount: 0, isTransactional: true },
  { id: 'nl-025', shopId: 'shop-1', recipientId: 'cust-119', recipientName: 'Yuki Tanaka', recipientContact: '+14155551010', channel: 'sms', category: 'transactional-customer', templateId: 'tpl-br24', templateName: 'Booking Reminder 24h', status: 'bounced', error: 'Number not in service', retryCount: 3, isTransactional: true },
  { id: 'nl-026', shopId: 'shop-1', recipientId: 'cust-120', recipientName: 'Marcus Johnson', recipientContact: 'marcus@email.com', channel: 'email', category: 'marketing', templateId: 'tpl-fu-veh', templateName: 'Follow-Up: Vehicle Specific', status: 'clicked', sentAt: '2026-06-11T09:00:00Z', deliveredAt: '2026-06-11T09:00:05Z', openedAt: '2026-06-11T10:00:00Z', clickedAt: '2026-06-11T10:02:00Z', retryCount: 0, isTransactional: false },
  { id: 'nl-027', shopId: 'shop-1', recipientId: 'cust-121', recipientName: 'Angela Davis', recipientContact: 'angela@email.com', channel: 'email', category: 'transactional-customer', templateId: 'tpl-parts', templateName: 'Parts Arrived', status: 'sent', sentAt: '2026-06-14T13:45:00Z', retryCount: 0, isTransactional: true },
];

// ─── Templates ────────────────────────────────────────────────────────────────
export const TEMPLATES: NotificationTemplate[] = [
  {
    id: 'tpl-bc', shopId: 'shop-1', type: 'booking-confirmed', category: 'transactional-customer',
    channel: 'email', name: 'Booking Confirmed', subject: 'Your appointment at {{shop_name}} is confirmed',
    body: 'Hi {{customer_name}},\n\nYour appointment has been confirmed!\n\nDate: {{appointment_date}}\nTime: {{appointment_time}}\nService: {{service_type}}\nLocation: {{location_name}}\n\nSee you soon!\n— {{shop_name}} Team',
    smsText: 'Hi {{customer_name}}, your appt at {{shop_name}} is confirmed for {{appointment_date}} at {{appointment_time}}. Questions? Reply to this message.',
    locale: 'en', isDefault: true, isCustom: false, createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tpl-br24', shopId: 'shop-1', type: 'booking-reminder-24h', category: 'transactional-customer',
    channel: 'email', name: 'Booking Reminder 24h', subject: 'Reminder: Your appointment tomorrow at {{shop_name}}',
    body: 'Hi {{customer_name}},\n\nJust a reminder — you have an appointment tomorrow!\n\nDate: {{appointment_date}}\nTime: {{appointment_time}}\nService: {{service_type}}\n\nPlease arrive 5 minutes early.',
    smsText: 'Reminder: Your appt at {{shop_name}} is tomorrow at {{appointment_time}}. Reply STOP to opt out.',
    locale: 'en', isDefault: true, isCustom: false, createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tpl-br1', shopId: 'shop-1', type: 'booking-reminder-1h', category: 'transactional-customer',
    channel: 'sms', name: 'Booking Reminder 1h',
    body: 'Your appointment at {{shop_name}} is in 1 hour ({{appointment_time}}). Address: {{location_address}}.',
    smsText: 'Your appt at {{shop_name}} is in 1 hour ({{appointment_time}}). {{location_address}}',
    locale: 'en', isDefault: true, isCustom: false, createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tpl-eta', shopId: 'shop-1', type: 'eta-update', category: 'transactional-customer',
    channel: 'sms', name: 'ETA Update',
    body: 'Update from {{shop_name}}: {{tech_name}} is {{eta_minutes}} minutes away. Track here: {{tracking_link}}',
    smsText: '{{tech_name}} from {{shop_name}} is ~{{eta_minutes}} min away. Track: {{tracking_link}}',
    locale: 'en', isDefault: true, isCustom: false, createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tpl-inv', shopId: 'shop-1', type: 'invoice', category: 'transactional-customer',
    channel: 'email', name: 'Invoice', subject: 'Your invoice from {{shop_name}} — ${{total}}',
    body: 'Hi {{customer_name}},\n\nThank you for your business! Your invoice is ready.\n\nTotal: ${{total}}\nServices: {{service_list}}\n\nView & Pay: {{invoice_link}}\n\nQuestions? Reply to this email.',
    smsText: 'Your invoice from {{shop_name}} is ${{total}}. View & pay: {{invoice_link}}',
    locale: 'en', isDefault: true, isCustom: false, createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tpl-ref', shopId: 'shop-1', type: 'refund', category: 'transactional-customer',
    channel: 'email', name: 'Refund Processed', subject: 'Your refund of ${{amount}} has been processed',
    body: 'Hi {{customer_name}},\n\nYour refund of ${{amount}} has been processed and will appear in 3–5 business days.\n\nRefund ID: {{refund_id}}\n\n— {{shop_name}} Team',
    locale: 'en', isDefault: true, isCustom: false, createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tpl-canc', shopId: 'shop-1', type: 'cancellation', category: 'transactional-customer',
    channel: 'sms', name: 'Cancellation',
    body: 'Your appointment at {{shop_name}} on {{appointment_date}} has been cancelled. Book again: {{booking_link}}',
    smsText: 'Your appt at {{shop_name}} on {{appointment_date}} is cancelled. Rebook: {{booking_link}}',
    locale: 'en', isDefault: true, isCustom: false, createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tpl-parts', shopId: 'shop-1', type: 'parts-arrived', category: 'transactional-customer',
    channel: 'email', name: 'Parts Arrived', subject: 'Great news — parts for your {{vehicle}} have arrived!',
    body: 'Hi {{customer_name}},\n\nThe parts needed for your {{vehicle}} have arrived at {{shop_name}}. We\'ll be in touch shortly to schedule your service.\n\nPart(s): {{parts_list}}\n\n— {{shop_name}} Team',
    locale: 'en', isDefault: true, isCustom: false, createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tpl-nb', shopId: 'shop-1', type: 'new-booking-staff', category: 'transactional-staff',
    channel: 'email', name: 'New Booking (Staff)', subject: 'New booking: {{customer_name}} — {{service_type}}',
    body: 'A new appointment has been booked.\n\nCustomer: {{customer_name}}\nService: {{service_type}}\nDate: {{appointment_date}} at {{appointment_time}}\nAssigned tech: {{tech_name}}\n\nView in TDForge: {{booking_link}}',
    locale: 'en', isDefault: true, isCustom: false, createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tpl-reassign', shopId: 'shop-1', type: 'reassignment', category: 'transactional-staff',
    channel: 'sms', name: 'Reassignment',
    body: 'You\'ve been assigned a job: {{customer_name}} — {{service_type}} on {{appointment_date}} at {{appointment_time}}. View: {{booking_link}}',
    smsText: 'New job assigned: {{customer_name}}, {{service_type}}, {{appointment_date}} {{appointment_time}}. {{booking_link}}',
    locale: 'en', isDefault: true, isCustom: false, createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tpl-ms', shopId: 'shop-1', type: 'morning-summary', category: 'transactional-staff',
    channel: 'email', name: 'Morning Summary', subject: "{{tech_name}}'s schedule for {{date}}",
    body: "Good morning {{tech_name}},\n\nHere's your schedule for today ({{date}}):\n\n{{job_list}}\n\nTotal jobs: {{job_count}}\nFirst job: {{first_job_time}}\n\n— {{shop_name}}",
    locale: 'en', isDefault: true, isCustom: false, createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tpl-wl-offer', shopId: 'shop-1', type: 'waitlist-offer', category: 'marketing',
    channel: 'sms', name: 'Waitlist Offer',
    body: '{{shop_name}}: A slot opened up! {{service_type}} on {{slot_date}} at {{slot_time}}. Claim within 30 min: {{claim_link}} — Offer expires {{expires_at}}.',
    smsText: 'Slot available! {{service_type}} on {{slot_date}} at {{slot_time}}. Claim in 30 min: {{claim_link}}',
    locale: 'en', isDefault: true, isCustom: false, createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tpl-fu-maint', shopId: 'shop-1', type: 'follow-up-maintenance', category: 'marketing',
    channel: 'email', name: 'Follow-Up: Maintenance', subject: "It's time for your {{vehicle}}'s next maintenance",
    body: "Hi {{customer_name}},\n\nBased on your last visit on {{last_visit_date}}, it's time to schedule your next maintenance for your {{vehicle}}.\n\n{{tech_note}}\n\nBook now: {{booking_link}}\n\n— {{tech_name}}, {{shop_name}}",
    locale: 'en', isDefault: true, isCustom: false, createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tpl-fu-rot', shopId: 'shop-1', type: 'follow-up-rotation', category: 'marketing',
    channel: 'email', name: 'Follow-Up: Tire Rotation', subject: "Time to rotate your {{vehicle}}'s tires",
    body: "Hi {{customer_name}},\n\nYour {{vehicle}} is due for a tire rotation. Regular rotations extend tire life and improve safety.\n\n{{tech_note}}\n\nSchedule now: {{booking_link}}\n\n— {{tech_name}}, {{shop_name}}",
    locale: 'en', isDefault: true, isCustom: false, createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tpl-fu-seas', shopId: 'shop-1', type: 'follow-up-seasonal', category: 'marketing',
    channel: 'email', name: 'Follow-Up: Seasonal', subject: 'Get your {{vehicle}} ready for the season',
    body: "Hi {{customer_name}},\n\nSeason change is coming up — make sure your {{vehicle}} is ready.\n\n{{tech_note}}\n\nBook a seasonal check: {{booking_link}}\n\n— {{tech_name}}, {{shop_name}}",
    locale: 'en', isDefault: true, isCustom: false, createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tpl-fu-veh', shopId: 'shop-1', type: 'follow-up-vehicle', category: 'marketing',
    channel: 'email', name: 'Follow-Up: Vehicle Specific', subject: 'Service recommendation for your {{vehicle}}',
    body: "Hi {{customer_name}},\n\nOur tech {{tech_name}} noticed something specific to your {{vehicle}} during your last visit.\n\n{{tech_note}}\n\nSchedule now: {{booking_link}}\n\n— {{shop_name}}",
    locale: 'en', isDefault: true, isCustom: false, createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tpl-sec', shopId: 'shop-1', type: 'security-alert', category: 'system',
    channel: 'email', name: 'Security Alert', subject: 'Security alert for your TDForge account',
    body: 'A new sign-in was detected on your TDForge account from {{location}} at {{time}}.\n\nDevice: {{device}}\n\nIf this was you, no action is needed. If not, reset your password immediately: {{reset_link}}',
    locale: 'en', isDefault: true, isCustom: false, createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tpl-ann', shopId: 'shop-1', type: 'platform-announcement', category: 'system',
    channel: 'in-app', name: 'Platform Announcement',
    body: '{{announcement_title}}: {{announcement_body}} Learn more: {{link}}',
    locale: 'en', isDefault: true, isCustom: false, createdAt: '2026-01-01T00:00:00Z',
  },
];

// ─── Waitlist ─────────────────────────────────────────────────────────────────
export const WAITLIST_ENTRIES: WaitlistEntry[] = [
  { id: 'wl-001', shopId: 'shop-1', customerId: 'cust-201', customerName: 'Rachel Green', customerPhone: '+14155550505', serviceType: 'Oil Change', vehicleDesc: '2019 Honda Accord', earliestDate: '2026-06-15', latestDate: '2026-06-20', createdAt: '2026-06-10T09:00:00Z', status: 'offered', queuePosition: 1, offersToday: 1 },
  { id: 'wl-002', shopId: 'shop-1', customerId: 'cust-202', customerName: 'Omar Sharif', customerPhone: '+14155550707', serviceType: 'Tire Rotation', vehicleDesc: '2021 Toyota Camry', earliestDate: '2026-06-14', latestDate: '2026-06-18', createdAt: '2026-06-11T10:00:00Z', status: 'active', queuePosition: 2, offersToday: 0 },
  { id: 'wl-003', shopId: 'shop-1', customerId: 'cust-203', customerName: 'Leila Nakamura', customerPhone: '+14155551111', serviceType: 'Brake Service', vehicleDesc: '2018 Ford F-150', earliestDate: '2026-06-16', latestDate: '2026-06-22', createdAt: '2026-06-12T11:00:00Z', status: 'active', queuePosition: 3, offersToday: 0 },
  { id: 'wl-004', shopId: 'shop-1', customerId: 'cust-204', customerName: 'Tyler Brooks', customerPhone: '+14155551212', serviceType: 'Oil Change', vehicleDesc: '2020 Chevrolet Malibu', earliestDate: '2026-06-15', latestDate: '2026-06-19', createdAt: '2026-06-13T08:00:00Z', status: 'claimed', queuePosition: 0, offersToday: 1 },
  { id: 'wl-005', shopId: 'shop-1', customerId: 'cust-205', customerName: 'Hannah Scott', customerPhone: '+14155551313', serviceType: 'Wheel Alignment', vehicleDesc: '2022 Subaru Outback', earliestDate: '2026-06-17', latestDate: '2026-06-25', createdAt: '2026-06-13T14:00:00Z', status: 'active', queuePosition: 4, offersToday: 0 },
  { id: 'wl-006', shopId: 'shop-1', customerId: 'cust-206', customerName: 'Dmitri Volkov', customerPhone: '+14155551414', serviceType: 'Tire Rotation', vehicleDesc: '2017 Nissan Sentra', earliestDate: '2026-06-14', latestDate: '2026-06-16', createdAt: '2026-06-09T15:00:00Z', status: 'expired', queuePosition: 0, offersToday: 2 },
];

export const WAITLIST_OFFERS: WaitlistOffer[] = [
  { id: 'wlo-001', waitlistEntryId: 'wl-001', customerName: 'Rachel Green', serviceType: 'Oil Change', slotDate: '2026-06-16', slotTime: '10:00 AM', token: 'tk_rc_xk29z', offeredAt: '2026-06-14T13:00:00Z', expiresAt: '2026-06-14T13:30:00Z', status: 'pending' },
  { id: 'wlo-002', waitlistEntryId: 'wl-004', customerName: 'Tyler Brooks', serviceType: 'Oil Change', slotDate: '2026-06-15', slotTime: '2:00 PM', token: 'tk_tb_m8np1', offeredAt: '2026-06-14T09:00:00Z', expiresAt: '2026-06-14T09:30:00Z', claimedAt: '2026-06-14T09:18:00Z', status: 'claimed' },
  { id: 'wlo-003', waitlistEntryId: 'wl-006', customerName: 'Dmitri Volkov', serviceType: 'Tire Rotation', slotDate: '2026-06-14', slotTime: '3:30 PM', token: 'tk_dv_q7rs2', offeredAt: '2026-06-13T10:00:00Z', expiresAt: '2026-06-13T10:30:00Z', status: 'expired' },
];

// ─── Follow-Up Queue ──────────────────────────────────────────────────────────
export const FOLLOW_UP_QUEUE: FollowUpQueue[] = [
  { id: 'fu-001', shopId: 'shop-1', visitId: 'visit-301', customerId: 'cust-108', customerName: 'Tom Anderson', customerChannel: 'email', techId: 'tech-201', techName: 'Mike Russo', templateName: 'Follow-Up: Maintenance', category: 'maintenance', note: 'Tom mentioned he was hearing a clicking sound from the front left. Worth following up to confirm it stopped after the oil change.', scheduledFor: '2026-06-21T09:00:00Z', status: 'queued', attributedRevenue: 0, createdAt: '2026-06-14T08:00:00Z' },
  { id: 'fu-002', shopId: 'shop-1', visitId: 'visit-302', customerId: 'cust-120', customerName: 'Marcus Johnson', customerChannel: 'email', techId: 'tech-202', techName: 'Elena Torres', templateName: 'Follow-Up: Vehicle Specific', category: 'vehicle-specific', note: '2018 RAM 1500 — battery is borderline at 390 CCA. Recommend replacement before winter.', scheduledFor: '2026-06-28T09:00:00Z', sentAt: '2026-06-14T09:00:00Z', status: 'sent', attributedRevenue: 0, createdAt: '2026-06-07T10:00:00Z' },
  { id: 'fu-003', shopId: 'shop-1', visitId: 'visit-303', customerId: 'cust-113', customerName: 'Diana Prince', customerChannel: 'email', techId: 'tech-201', techName: 'Mike Russo', templateName: 'Follow-Up: Seasonal', category: 'seasonal', note: '', scheduledFor: '2026-07-01T09:00:00Z', status: 'queued', attributedRevenue: 0, createdAt: '2026-06-10T11:00:00Z' },
  { id: 'fu-004', shopId: 'shop-1', visitId: 'visit-304', customerId: 'cust-110', customerName: 'Brian Hall', customerChannel: 'sms', techId: 'tech-203', techName: 'Jake Wilson', templateName: 'Follow-Up: Tire Rotation', category: 'rotation', note: 'Tires showing uneven wear on the rear left. Recommended rotation every 5k miles.', scheduledFor: '2026-07-14T09:00:00Z', status: 'queued', attributedRevenue: 0, createdAt: '2026-06-14T10:00:00Z' },
  { id: 'fu-005', shopId: 'shop-1', visitId: 'visit-305', customerId: 'cust-118', customerName: 'David Lee', customerChannel: 'email', techId: 'tech-202', techName: 'Elena Torres', templateName: 'Follow-Up: Maintenance', category: 'maintenance', note: 'Air filter was dirty — asked customer to come back in 3 months.', scheduledFor: '2026-09-14T09:00:00Z', sentAt: '2026-06-14T10:30:00Z', status: 'sent', attributedRevenue: 189, createdAt: '2026-06-14T09:30:00Z' },
  { id: 'fu-006', shopId: 'shop-1', visitId: 'visit-306', customerId: 'cust-111', customerName: 'Priya Nair', customerChannel: 'email', techId: 'tech-201', techName: 'Mike Russo', templateName: 'Follow-Up: Vehicle Specific', category: 'vehicle-specific', note: '', scheduledFor: '2026-07-07T09:00:00Z', status: 'cancelled', attributedRevenue: 0, createdAt: '2026-06-13T14:00:00Z' },
  { id: 'fu-007', shopId: 'shop-1', visitId: 'visit-307', customerId: 'cust-121', customerName: 'Angela Davis', customerChannel: 'email', techId: 'tech-203', techName: 'Jake Wilson', templateName: 'Follow-Up: Maintenance', category: 'maintenance', note: 'Serpentine belt showing cracks. Gave her a quote — she said she\'ll think about it.', scheduledFor: '2026-06-28T09:00:00Z', status: 'queued', attributedRevenue: 0, createdAt: '2026-06-14T13:00:00Z' },
];

// ─── SMS Conversations ─────────────────────────────────────────────────────────
export const SMS_CONVERSATIONS: SmsConversation[] = [
  { id: 'conv-001', shopId: 'shop-1', customerId: 'cust-101', customerName: 'Maria Santos', customerPhone: '+14155550111', lastMessageAt: '2026-06-14T13:45:00Z', lastMessageBody: 'Thanks! See you then.', unreadCount: 0 },
  { id: 'conv-002', shopId: 'shop-1', customerId: 'cust-102', customerName: 'James Patel', customerPhone: '+14155550101', lastMessageAt: '2026-06-14T11:30:00Z', lastMessageBody: 'Can I reschedule to 3pm instead?', unreadCount: 2 },
  { id: 'conv-003', shopId: 'shop-1', customerId: 'cust-112', customerName: 'Kevin Brown', customerPhone: '+14155550606', lastMessageAt: '2026-06-14T10:15:00Z', lastMessageBody: "Got it, I'll be there.", unreadCount: 0 },
  { id: 'conv-004', shopId: 'shop-1', customerId: 'cust-116', customerName: 'Chris Martinez', customerPhone: '+14155550909', lastMessageAt: '2026-06-14T09:30:00Z', lastMessageBody: 'Is the part still under warranty?', unreadCount: 1 },
];

export const SMS_MESSAGES: SmsMessage[] = [
  // conv-001 — Maria Santos
  { id: 'msg-001', conversationId: 'conv-001', shopId: 'shop-1', direction: 'outbound', body: 'Hi Maria, just confirming your Oil Change appointment tomorrow at 10:00 AM. Let us know if anything changes!', attachments: [], sentAt: '2026-06-13T14:00:00Z', readAt: '2026-06-13T14:05:00Z', senderName: 'TDForge Auto' },
  { id: 'msg-002', conversationId: 'conv-001', shopId: 'shop-1', direction: 'inbound', body: 'Hi! Yes that works. Will you need me to drop off the keys?', attachments: [], sentAt: '2026-06-13T14:12:00Z' },
  { id: 'msg-003', conversationId: 'conv-001', shopId: 'shop-1', direction: 'outbound', body: 'Yes, you can drop the keys at the front desk. The service usually takes about an hour.', attachments: [], sentAt: '2026-06-13T14:20:00Z', readAt: '2026-06-13T14:22:00Z', senderName: 'Mike Russo' },
  { id: 'msg-004', conversationId: 'conv-001', shopId: 'shop-1', direction: 'inbound', body: 'Perfect. And can I wait there or should I plan to come back?', attachments: [], sentAt: '2026-06-13T14:25:00Z' },
  { id: 'msg-005', conversationId: 'conv-001', shopId: 'shop-1', direction: 'outbound', body: 'We have a comfortable waiting area with Wi-Fi! You\'re welcome to stay.', attachments: [], sentAt: '2026-06-13T14:28:00Z', readAt: '2026-06-13T14:30:00Z', senderName: 'Mike Russo' },
  { id: 'msg-006', conversationId: 'conv-001', shopId: 'shop-1', direction: 'outbound', body: 'Hi Maria, your appointment is in 1 hour (10:00 AM). Address: 123 Auto Dr.', attachments: [], sentAt: '2026-06-14T09:00:00Z', readAt: '2026-06-14T09:05:00Z', senderName: 'TDForge Auto' },
  { id: 'msg-007', conversationId: 'conv-001', shopId: 'shop-1', direction: 'inbound', body: "On my way! Traffic isn't too bad.", attachments: [], sentAt: '2026-06-14T09:40:00Z' },
  { id: 'msg-008', conversationId: 'conv-001', shopId: 'shop-1', direction: 'outbound', body: "Great, see you soon! We'll be ready for you.", attachments: [], sentAt: '2026-06-14T09:42:00Z', readAt: '2026-06-14T13:44:00Z', senderName: 'Mike Russo' },
  { id: 'msg-009', conversationId: 'conv-001', shopId: 'shop-1', direction: 'inbound', body: 'Thanks! See you then.', attachments: [], sentAt: '2026-06-14T13:45:00Z' },

  // conv-002 — James Patel (2 unread)
  { id: 'msg-010', conversationId: 'conv-002', shopId: 'shop-1', direction: 'outbound', body: 'Hi James, reminder: your Tire Rotation is tomorrow at 2:00 PM. Reply STOP to opt out.', attachments: [], sentAt: '2026-06-13T10:00:00Z', readAt: '2026-06-13T10:05:00Z', senderName: 'TDForge Auto' },
  { id: 'msg-011', conversationId: 'conv-002', shopId: 'shop-1', direction: 'inbound', body: 'Hey can I push it back? Something came up.', attachments: [], sentAt: '2026-06-14T10:00:00Z' },
  { id: 'msg-012', conversationId: 'conv-002', shopId: 'shop-1', direction: 'inbound', body: 'Can I reschedule to 3pm instead?', attachments: [], sentAt: '2026-06-14T11:30:00Z' },

  // conv-003 — Kevin Brown
  { id: 'msg-013', conversationId: 'conv-003', shopId: 'shop-1', direction: 'outbound', body: 'Kevin, tech Mike is about 15 minutes away for your appointment. Any questions?', attachments: [], sentAt: '2026-06-14T09:45:00Z', readAt: '2026-06-14T09:48:00Z', senderName: 'TDForge Auto' },
  { id: 'msg-014', conversationId: 'conv-003', shopId: 'shop-1', direction: 'inbound', body: 'Thanks for the heads up.', attachments: [], sentAt: '2026-06-14T09:50:00Z' },
  { id: 'msg-015', conversationId: 'conv-003', shopId: 'shop-1', direction: 'outbound', body: 'Here is a photo of the brake pad we replaced — your old one was at 2mm.', attachments: [{ id: 'att-001', name: 'brake_pad_before.jpg', type: 'image', emoji: '📷', size: 284000 }], sentAt: '2026-06-14T10:10:00Z', readAt: '2026-06-14T10:12:00Z', senderName: 'Elena Torres' },
  { id: 'msg-016', conversationId: 'conv-003', shopId: 'shop-1', direction: 'inbound', body: "Got it, I'll be there.", attachments: [], sentAt: '2026-06-14T10:15:00Z' },

  // conv-004 — Chris Martinez (1 unread)
  { id: 'msg-017', conversationId: 'conv-004', shopId: 'shop-1', direction: 'outbound', body: 'Hi Chris, your appointment has been cancelled per your request. Rebook anytime: https://tdforge.app/book', attachments: [], sentAt: '2026-06-14T09:00:00Z', readAt: '2026-06-14T09:05:00Z', senderName: 'TDForge Auto' },
  { id: 'msg-018', conversationId: 'conv-004', shopId: 'shop-1', direction: 'outbound', body: 'Chris, the replacement catalytic converter has arrived. Give us a call to schedule installation.', attachments: [], sentAt: '2026-06-14T09:20:00Z', readAt: '2026-06-14T09:25:00Z', senderName: 'Jake Wilson' },
  { id: 'msg-019', conversationId: 'conv-004', shopId: 'shop-1', direction: 'inbound', body: 'Is the part still under warranty?', attachments: [], sentAt: '2026-06-14T09:30:00Z' },
];

// ─── Reminder Configs ─────────────────────────────────────────────────────────
export const REMINDER_CONFIGS: ReminderConfig[] = [
  { id: 'rc-001', shopId: 'shop-1', serviceTypeId: 'svc-oil', serviceTypeName: 'Oil Change', intervals: [24, 2], prepInstructions: 'No special preparation needed. We recommend arriving with at least a quarter tank of fuel.', enabled: true },
  { id: 'rc-002', shopId: 'shop-1', serviceTypeId: 'svc-tire', serviceTypeName: 'Tire Rotation', intervals: [24, 1], prepInstructions: 'Ensure tires are visible and free of obstructions. Let us know if you have any TPMS concerns.', enabled: true },
  { id: 'rc-003', shopId: 'shop-1', serviceTypeId: 'svc-align', serviceTypeName: 'Wheel Alignment', intervals: [48, 2], prepInstructions: 'Drive normally on the way in — avoid curbs or rough terrain. Note any pulling direction to tell the tech.', enabled: true },
  { id: 'rc-004', shopId: 'shop-1', serviceTypeId: 'svc-brake', serviceTypeName: 'Brake Service', intervals: [48, 24, 2], prepInstructions: 'Avoid hard braking on the way to your appointment. The vehicle may need to cool down before inspection.', enabled: true },
  { id: 'rc-005', shopId: 'shop-1', serviceTypeId: 'svc-trans', serviceTypeName: 'Transmission Service', intervals: [48, 24], prepInstructions: 'No preparation required. Please note any slipping, hesitation, or unusual sounds you\'ve noticed.', enabled: false },
];

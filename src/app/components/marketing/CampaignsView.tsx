'use client';
import React, { useState } from 'react';
import {
  Send, Plus, Eye, Mail, MessageSquare, ChevronDown, ChevronUp,
  X, AlertTriangle, CheckCircle, Calendar, Clock, Zap, BarChart2,
} from 'lucide-react';
import { CAMPAIGNS, SEGMENTS } from './mockData';
import type { Campaign, CampaignStatus, CampaignChannel, StopWhenCondition, StartWhenTrigger } from './types';

const STATUS_CFG: Record<CampaignStatus, { bg: string; color: string; border: string; label: string }> = {
  draft:     { bg: '#F9FAFB', color: '#6B7280', border: '#E5E7EB', label: 'Draft' },
  scheduled: { bg: '#EFF6FF', color: '#1D4ED8', border: '#93C5FD', label: 'Scheduled' },
  sending:   { bg: '#D1FAE5', color: '#065F46', border: '#10B981', label: 'Sending' },
  sent:      { bg: '#F3F4F6', color: '#4B5563', border: '#9CA3AF', label: 'Sent' },
  paused:    { bg: '#FEF3C7', color: '#B45309', border: '#F59E0B', label: 'Paused' },
  cancelled: { bg: '#FEE2E2', color: '#991B1B', border: '#EF4444', label: 'Cancelled' },
};

const TOKENS = ['{{first_name}}', '{{last_vehicle}}', '{{last_service}}', '{{promo_code}}'];

const STOP_WHEN_OPTIONS: { value: StopWhenCondition; label: string }[] = [
  { value: 'books_appointment', label: 'Customer books an appointment' },
  { value: 'submits_review', label: 'Customer submits a review' },
  { value: 'replies_to_sms', label: 'Customer replies to SMS' },
  { value: 'unsubscribes', label: 'Customer unsubscribes' },
];

const START_WHEN_OPTIONS: { value: StartWhenTrigger; label: string }[] = [
  { value: 'manual', label: 'Manual (send now / schedule)' },
  { value: 'estimate_sent', label: 'When estimate is sent to customer' },
  { value: 'job_paid', label: 'When job is paid' },
  { value: 'warranty_expiring_30d', label: 'When warranty expires in 30 days' },
  { value: 'visit_completed_no_rebooking', label: 'When visit completed without rebooking' },
];

const TEMPLATES = [
  { name: 'Winter Tire Reminder', subject: 'Is your {{last_vehicle}} ready for winter?', body: 'Hi {{first_name}},\n\nWith temperatures dropping, now is the perfect time to switch to winter tires. Book now before slots fill up!\n\n[Book Now]', smsText: 'Hi {{first_name}}, time to think about winter tires for your {{last_vehicle}}! Book now: [link] STOP to opt out.' },
  { name: 'Anniversary of Last Visit', subject: 'It\'s been a year, {{first_name}}!', body: 'Hi {{first_name}},\n\nWe\'ve noticed it\'s been a while since your last visit. Your {{last_vehicle}} might be overdue for some attention!\n\n[Schedule Service]', smsText: 'Hey {{first_name}}, one year since your last visit! Time to check on your {{last_vehicle}}. Book: [link] STOP opt out.' },
  { name: 'Promo Offer', subject: 'Exclusive offer just for you, {{first_name}}', body: 'Hi {{first_name}},\n\nFor a limited time, enjoy a special discount on your next service. Use code {{promo_code}} at checkout.\n\n[Claim Offer]', smsText: 'Special offer for you {{first_name}}! Use {{promo_code}} for your next service. Book: [link] STOP to opt out.' },
  { name: 'Service Due', subject: '{{first_name}}, your {{last_vehicle}} may be due for service', body: 'Hi {{first_name}},\n\nBased on your last service in {{last_service}}, your vehicle may be ready for its next scheduled maintenance.\n\n[Book Service]', smsText: 'Hi {{first_name}}, your {{last_vehicle}} may be due for service. Schedule now: [link] STOP to opt out.' },
];

function validateSmsLength(text: string): { ok: boolean; charCount: number; segmentCount: number } {
  const substituted = text.replace(/\{\{[^}]+\}\}/g, '[...]').replace(/\[link\]/g, 'https://fb-business-connect.app/xxx');
  const charCount = substituted.length;
  const segmentCount = Math.ceil(charCount / 160);
  return { ok: charCount <= 480, charCount, segmentCount };
}

function CampaignComposer({ onSave, onCancel }: { onSave: (c: Campaign) => void; onCancel: () => void }) {
  const [step, setStep] = useState<'target' | 'content' | 'schedule' | 'review'>('target');
  const [segmentId, setSegmentId] = useState(SEGMENTS[0].id);
  const [channels, setChannels] = useState<CampaignChannel[]>(['email']);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [smsText, setSmsText] = useState('');
  const [ctaLabel, setCtaLabel] = useState('Book Now');
  const [promoCode, setPromoCode] = useState('');
  const [scheduleNow, setScheduleNow] = useState(true);
  const [scheduledAt, setScheduledAt] = useState('');
  const [stopWhen, setStopWhen] = useState<StopWhenCondition[]>(['books_appointment', 'unsubscribes']);
  const [startWhen, setStartWhen] = useState<StartWhenTrigger>('manual');
  const [attributionDays, setAttributionDays] = useState(30);
  const [preview, setPreview] = useState<'email' | 'sms'>('email');
  const [sending, setSending] = useState(false);

  const seg = SEGMENTS.find(s => s.id === segmentId)!;
  const smsValid = validateSmsLength(smsText);
  const emailEnabled = channels.includes('email');
  const smsEnabled = channels.includes('sms');

  const applyTemplate = (t: typeof TEMPLATES[0]) => {
    setSubject(t.subject);
    setBody(t.body);
    setSmsText(t.smsText);
  };

  const previewBody = (text: string) =>
    text.replace(/\{\{first_name\}\}/g, 'James').replace(/\{\{last_vehicle\}\}/g, '2019 Honda Accord').replace(/\{\{last_service\}\}/g, 'March 2026').replace(/\{\{promo_code\}\}/g, promoCode || 'SAVE15');

  const handleSend = () => {
    setSending(true);
    setTimeout(() => {
      onSave({
        id: `cmp-${Date.now()}`, shopId: 'shop-1',
        segmentId, segmentName: seg.name, name: name || `Campaign ${new Date().toLocaleDateString()}`,
        channels, status: scheduleNow ? 'sending' : 'scheduled',
        content: { subject, body, smsText, ctaLabel, promoCode },
        scheduledAt: scheduleNow ? new Date().toISOString() : scheduledAt,
        sentAt: scheduleNow ? new Date().toISOString() : undefined,
        attributionWindowDays: attributionDays,
        stopWhenConditions: stopWhen, startWhenTrigger: startWhen,
        sent: scheduleNow ? seg.memberCount : 0,
        delivered: 0, opens: 0, clicks: 0, bookings: 0, revenue: 0, unsubscribes: 0,
        createdAt: new Date().toISOString(),
      });
      setSending(false);
    }, 1200);
  };

  const STEPS = ['target', 'content', 'schedule', 'review'] as const;

  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, overflow: 'hidden' }}>
      {/* Step bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', background: '#F9FAFB' }}>
        {STEPS.map((s, i) => (
          <div key={s} onClick={() => setStep(s)} style={{ flex: 1, padding: '12px 0', textAlign: 'center', fontSize: 13, fontWeight: step === s ? 700 : 500, color: step === s ? '#C0392B' : STEPS.indexOf(step) > i ? '#059669' : '#9CA3AF', borderBottom: step === s ? '2px solid #C0392B' : '2px solid transparent', cursor: 'pointer', textTransform: 'capitalize' }}>
            {STEPS.indexOf(step) > i ? '✓ ' : `${i + 1}. `}{s}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: step === 'content' ? '1fr 1fr' : '1fr', minHeight: 400 }}>
        {/* Left: editor */}
        <div style={{ padding: 20, borderRight: step === 'content' ? '1px solid #E5E7EB' : 'none' }}>
          {step === 'target' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Campaign Name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Win-Back June 2026"
                  style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Target Segment</label>
                <select value={segmentId} onChange={e => setSegmentId(e.target.value)}
                  style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}>
                  {SEGMENTS.map(s => <option key={s.id} value={s.id}>{s.name} ({s.memberCount})</option>)}
                </select>
              </div>
              <div style={{ background: '#FDEDEC', border: '1px solid #F5B7B1', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 32, fontWeight: 800, color: '#C0392B' }}>{seg.memberCount}</div>
                <div>
                  <div style={{ fontWeight: 700, color: '#1A1A1A' }}>customers will receive this campaign</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Only opted-in customers per channel will receive messages</div>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 8 }}>Channels</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {(['email', 'sms'] as const).map(ch => (
                    <div key={ch} onClick={() => setChannels(prev => prev.includes(ch) ? prev.filter(x => x !== ch) : [...prev, ch])}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', border: `2px solid ${channels.includes(ch) ? '#C0392B' : '#E5E7EB'}`, borderRadius: 10, cursor: 'pointer', background: channels.includes(ch) ? '#FDEDEC' : '#fff' }}>
                      {ch === 'email' ? <Mail size={16} color={channels.includes(ch) ? '#C0392B' : '#9CA3AF'} /> : <MessageSquare size={16} color={channels.includes(ch) ? '#C0392B' : '#9CA3AF'} />}
                      <span style={{ fontWeight: 600, color: channels.includes(ch) ? '#C0392B' : '#6B7280', textTransform: 'capitalize' }}>{ch}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 8 }}>Behavior Trigger</label>
                <select value={startWhen} onChange={e => setStartWhen(e.target.value as StartWhenTrigger)}
                  style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}>
                  {START_WHEN_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          )}

          {step === 'content' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Template quick-pick */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 6 }}>Quick Template</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {TEMPLATES.map(t => (
                    <button key={t.name} onClick={() => applyTemplate(t)}
                      style={{ padding: '8px 10px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12, cursor: 'pointer', background: '#F9FAFB', color: '#374151', textAlign: 'left' }}>
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Token reference */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {TOKENS.map(t => (
                  <span key={t} style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #93C5FD', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontFamily: 'monospace' }}>{t}</span>
                ))}
              </div>

              {emailEnabled && (
                <>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Subject Line</label>
                    <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. {{first_name}}, we miss you!"
                      style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Email Body</label>
                    <textarea value={body} onChange={e => setBody(e.target.value)} rows={8}
                      placeholder="Hi {{first_name}},..."
                      style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>CTA Label</label>
                      <input value={ctaLabel} onChange={e => setCtaLabel(e.target.value)}
                        style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Promo Code</label>
                      <input value={promoCode} onChange={e => setPromoCode(e.target.value)} placeholder="e.g. SAVE15"
                        style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                </>
              )}

              {smsEnabled && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>SMS Text</label>
                  <textarea value={smsText} onChange={e => setSmsText(e.target.value)} rows={4}
                    placeholder="Hi {{first_name}}, ... STOP to opt out."
                    style={{ width: '100%', border: `1px solid ${!smsValid.ok ? '#EF4444' : '#E5E7EB'}`, borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box', resize: 'none', fontFamily: 'inherit' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: '#9CA3AF' }}>Must include STOP keyword per TCPA</span>
                    <span style={{ fontSize: 11, color: smsValid.ok ? '#6B7280' : '#DC2626', fontWeight: 600 }}>
                      {smsValid.charCount} chars · {smsValid.segmentCount} SMS segment{smsValid.segmentCount > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div style={{ marginTop: 6, background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 7, padding: '8px 12px', fontSize: 12, color: '#92400E' }}>
                    ⚠ TCPA: SMS marketing is never sent between 9 PM and 8 AM in the recipient's local time.
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'schedule' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 8 }}>Send Timing</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[{ v: true, label: 'Send Now', icon: <Zap size={14} /> }, { v: false, label: 'Schedule', icon: <Calendar size={14} /> }].map(opt => (
                    <div key={String(opt.v)} onClick={() => setScheduleNow(opt.v)}
                      style={{ flex: 1, padding: '12px 16px', border: `2px solid ${scheduleNow === opt.v ? '#C0392B' : '#E5E7EB'}`, borderRadius: 10, cursor: 'pointer', background: scheduleNow === opt.v ? '#FDEDEC' : '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: scheduleNow === opt.v ? '#C0392B' : '#9CA3AF' }}>{opt.icon}</span>
                      <span style={{ fontWeight: 700, color: scheduleNow === opt.v ? '#C0392B' : '#6B7280' }}>{opt.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              {!scheduleNow && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Schedule Date & Time</label>
                  <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
                    style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              )}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 8 }}>Stop When (exit conditions)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {STOP_WHEN_OPTIONS.map(o => (
                    <label key={o.value} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: '#374151' }}>
                      <input type="checkbox" checked={stopWhen.includes(o.value)} onChange={e => setStopWhen(prev => e.target.checked ? [...prev, o.value] : prev.filter(x => x !== o.value))} />
                      {o.label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Attribution Window</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="number" min={1} max={90} value={attributionDays} onChange={e => setAttributionDays(Number(e.target.value))}
                    style={{ width: 80, border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none' }} />
                  <span style={{ fontSize: 13, color: '#6B7280' }}>days from click to booking counts as attributed</span>
                </div>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 15, color: '#1A1A1A' }}>Pre-Send Validation</div>
              {[
                { ok: seg.memberCount > 0, label: `Segment has ${seg.memberCount} customers` },
                { ok: channels.length > 0, label: 'At least one channel selected' },
                { ok: !emailEnabled || subject.length > 0, label: 'Email subject is set' },
                { ok: !emailEnabled || body.length > 0, label: 'Email body is set' },
                { ok: !smsEnabled || smsText.includes('STOP'), label: 'SMS includes STOP keyword (TCPA)' },
                { ok: !smsEnabled || smsValid.ok, label: `SMS length ≤ 480 chars (${smsValid.charCount} chars, ${smsValid.segmentCount} segments)` },
              ].map((check, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: check.ok ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${check.ok ? '#86EFAC' : '#FCA5A5'}`, borderRadius: 8 }}>
                  {check.ok ? <CheckCircle size={16} color="#22C55E" /> : <AlertTriangle size={16} color="#EF4444" />}
                  <span style={{ fontSize: 13, color: check.ok ? '#15803D' : '#DC2626', fontWeight: check.ok ? 400 : 600 }}>{check.label}</span>
                </div>
              ))}
              <div style={{ background: '#FDEDEC', border: '1px solid #F5B7B1', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontWeight: 700, color: '#1A1A1A', marginBottom: 6 }}>Ready to send to</div>
                <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 32, fontWeight: 800, color: '#C0392B' }}>
                  {seg.memberCount} customers
                </div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
                  via {channels.join(' + ')} · {attributionDays}-day attribution window
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: preview (content step only) */}
        {step === 'content' && (
          <div style={{ padding: 20, background: '#F9FAFB' }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {(['email', 'sms'] as const).map(ch => (
                <button key={ch} onClick={() => setPreview(ch)} disabled={!channels.includes(ch)}
                  style={{ padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: preview === ch ? 700 : 400, cursor: channels.includes(ch) ? 'pointer' : 'not-allowed', border: preview === ch ? '1.5px solid #C0392B' : '1px solid #E5E7EB', background: preview === ch ? '#FDEDEC' : '#fff', color: preview === ch ? '#C0392B' : channels.includes(ch) ? '#6B7280' : '#D1D5DB', textTransform: 'capitalize' }}>
                  {ch} Preview
                </button>
              ))}
            </div>
            {preview === 'email' && (
              <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ background: '#1A1A1A', padding: '12px 16px' }}>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>From: no-reply@fb-business-connect.app</div>
                  <div style={{ color: '#fff', fontWeight: 700, marginTop: 4 }}>{previewBody(subject) || '(no subject)'}</div>
                </div>
                <div style={{ padding: 16 }}>
                  <pre style={{ fontSize: 13, color: '#374151', whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.7, margin: 0 }}>{previewBody(body) || '(no body)'}</pre>
                  {ctaLabel && (
                    <div style={{ marginTop: 16, textAlign: 'center' }}>
                      <span style={{ display: 'inline-block', background: '#C0392B', color: '#fff', borderRadius: 8, padding: '10px 24px', fontWeight: 700, fontSize: 14 }}>{ctaLabel}</span>
                    </div>
                  )}
                  <div style={{ marginTop: 20, borderTop: '1px solid #E5E7EB', paddingTop: 12, fontSize: 11, color: '#9CA3AF', textAlign: 'center' }}>
                    You received this email because you're a customer of [Shop Name].<br />
                    <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Unsubscribe</span> · <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Manage Preferences</span>
                  </div>
                </div>
              </div>
            )}
            {preview === 'sms' && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 20, width: 260, padding: '20px 16px' }}>
                  <div style={{ background: '#E5E7EB', borderRadius: '12px 12px 12px 4px', padding: '10px 14px', fontSize: 13, color: '#1A1A1A', lineHeight: 1.6 }}>
                    {previewBody(smsText) || '(no SMS text)'}
                  </div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'right', marginTop: 6 }}>Delivered</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div style={{ padding: '14px 20px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onCancel} style={{ padding: '9px 18px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, cursor: 'pointer', background: '#fff' }}>Cancel</button>
        <div style={{ display: 'flex', gap: 10 }}>
          {step !== 'target' && (
            <button onClick={() => setStep(STEPS[STEPS.indexOf(step) - 1])}
              style={{ padding: '9px 18px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, cursor: 'pointer', background: '#fff' }}>← Back</button>
          )}
          {step !== 'review' ? (
            <button onClick={() => setStep(STEPS[STEPS.indexOf(step) + 1])}
              style={{ padding: '9px 18px', background: '#C0392B', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Continue →</button>
          ) : (
            <button onClick={handleSend} disabled={sending}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 20px', background: sending ? '#E5E7EB' : '#C0392B', color: sending ? '#9CA3AF' : '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer' }}>
              <Send size={14} /> {sending ? 'Sending...' : `Send to ${seg.memberCount} customers`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function AttributionTable({ campaigns }: { campaigns: Campaign[] }) {
  const sent = campaigns.filter(c => c.status === 'sent' || c.status === 'sending');
  if (sent.length === 0) return null;

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 15, color: '#1A1A1A', marginBottom: 14 }}>Attribution Report</div>
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#1A1A1A' }}>
              {['Campaign', 'Sent', 'Opens', 'Clicks', 'Bookings', 'Revenue', 'Unsubs'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sent.map((c, i) => (
              <tr key={c.id} style={{ borderTop: i > 0 ? '1px solid #E5E7EB' : 'none' }}>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ fontWeight: 600, color: '#1A1A1A' }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{c.channels.join(' + ')} · {c.segmentName}</div>
                </td>
                <td style={{ padding: '12px 14px', color: '#374151' }}>{c.sent.toLocaleString()}</td>
                <td style={{ padding: '12px 14px', color: '#374151' }}>
                  {c.opens} <span style={{ fontSize: 11, color: '#9CA3AF' }}>({c.sent > 0 ? Math.round((c.opens / c.sent) * 100) : 0}%)</span>
                </td>
                <td style={{ padding: '12px 14px', color: '#374151' }}>
                  {c.clicks} <span style={{ fontSize: 11, color: '#9CA3AF' }}>({c.sent > 0 ? Math.round((c.clicks / c.sent) * 100) : 0}%)</span>
                </td>
                <td style={{ padding: '12px 14px', color: '#374151', fontWeight: 600 }}>{c.bookings}</td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 15, color: c.revenue > 0 ? '#C0392B' : '#6B7280' }}>
                    ${c.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </td>
                <td style={{ padding: '12px 14px', color: c.unsubscribes > 0 ? '#DC2626' : '#9CA3AF' }}>{c.unsubscribes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CampaignsView() {
  const [campaigns, setCampaigns] = useState(CAMPAIGNS);
  const [composing, setComposing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<CampaignStatus | 'all'>('all');

  const filtered = campaigns.filter(c => filterStatus === 'all' || c.status === filterStatus);

  return (
    <div style={{ padding: '20px 0', fontFamily: 'Inter, sans-serif' }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Sent', value: campaigns.reduce((s, c) => s + c.sent, 0).toLocaleString(), color: '#2980B9', bg: '#EBF5FB' },
          { label: 'Total Opens', value: campaigns.reduce((s, c) => s + c.opens, 0).toLocaleString(), color: '#27AE60', bg: '#D1FAE5' },
          { label: 'Total Clicks', value: campaigns.reduce((s, c) => s + c.clicks, 0).toLocaleString(), color: '#7C3AED', bg: '#EDE9FE' },
          { label: 'Attributed Bookings', value: campaigns.reduce((s, c) => s + c.bookings, 0), color: '#D97706', bg: '#FEF3C7' },
          { label: 'Attributed Revenue', value: `$${campaigns.reduce((s, c) => s + c.revenue, 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}`, color: '#C0392B', bg: '#FDEDEC' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {composing ? (
        <CampaignComposer
          onSave={c => { setCampaigns(prev => [c, ...prev]); setComposing(false); }}
          onCancel={() => setComposing(false)}
        />
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['all', 'draft', 'scheduled', 'sending', 'sent'] as const).map(f => (
                <button key={f} onClick={() => setFilterStatus(f)}
                  style={{ padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: filterStatus === f ? 700 : 400, cursor: 'pointer', border: filterStatus === f ? '1.5px solid #C0392B' : '1px solid #E5E7EB', background: filterStatus === f ? '#FDEDEC' : '#fff', color: filterStatus === f ? '#C0392B' : '#6B7280', textTransform: 'capitalize' }}>
                  {f === 'all' ? 'All' : STATUS_CFG[f]?.label ?? f}
                </button>
              ))}
            </div>
            <button onClick={() => setComposing(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', background: '#C0392B', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              <Plus size={14} /> New Campaign
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(c => {
              const cfg = STATUS_CFG[c.status];
              return (
                <div key={c.id} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: '#1A1A1A' }}>{c.name}</span>
                        <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>{cfg.label}</span>
                        {c.channels.map(ch => <span key={ch} style={{ background: ch === 'email' ? '#EFF6FF' : '#F0FDF4', color: ch === 'email' ? '#1D4ED8' : '#15803D', borderRadius: 5, padding: '1px 7px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>{ch}</span>)}
                      </div>
                      <div style={{ fontSize: 12, color: '#6B7280' }}>
                        {c.segmentName} · {c.sent.toLocaleString()} sent
                        {c.scheduledAt && !c.sentAt && <span> · Scheduled {c.scheduledAt.slice(0, 10)}</span>}
                        {c.sentAt && <span> · Sent {c.sentAt.slice(0, 10)}</span>}
                      </div>
                    </div>
                    {(c.status === 'sent' || c.status === 'sending') && (
                      <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
                        {[
                          { label: 'Opens', value: c.sent > 0 ? `${Math.round((c.opens / c.sent) * 100)}%` : '—' },
                          { label: 'Clicks', value: c.sent > 0 ? `${Math.round((c.clicks / c.sent) * 100)}%` : '—' },
                          { label: 'Revenue', value: `$${c.revenue.toLocaleString('en-US', { minimumFractionDigits: 0 })}`, red: true },
                        ].map(m => (
                          <div key={m.label} style={{ textAlign: 'right' }}>
                            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 800, color: (m as { red?: boolean }).red ? '#C0392B' : '#1A1A1A' }}>{m.value}</div>
                            <div style={{ fontSize: 11, color: '#9CA3AF' }}>{m.label}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '32px 0', color: '#9CA3AF' }}>No campaigns match this filter.</div>}
          </div>

          <AttributionTable campaigns={campaigns} />
        </>
      )}
    </div>
  );
}

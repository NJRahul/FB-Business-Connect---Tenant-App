import React, { useState } from 'react';
import { Edit2, Eye, Lock, Mail, MessageSquare, Bell, Smartphone, ChevronDown, ChevronUp, X, Check, AlertTriangle } from 'lucide-react';
import { TEMPLATES } from './mockData';
import type { NotificationTemplate, NotificationCategory, NotificationChannel } from './types';

const CHANNEL_ICON: Record<NotificationChannel, React.ElementType> = {
  email: Mail, sms: MessageSquare, 'in-app': Bell, push: Smartphone,
};

const CATEGORY_LABEL: Record<NotificationCategory, string> = {
  'transactional-customer': 'Customer',
  'transactional-staff': 'Staff',
  marketing: 'Marketing',
  system: 'System',
};
const CATEGORY_COLOR: Record<NotificationCategory, { color: string; bg: string }> = {
  'transactional-customer': { color: '#2563EB', bg: '#EFF6FF' },
  'transactional-staff':    { color: '#7E22CE', bg: '#FDF4FF' },
  marketing:                { color: '#C0392B', bg: '#FDEDEC' },
  system:                   { color: '#6B7280', bg: '#F3F4F6' },
};

const TOKENS = [
  '{{customer_name}}','{{shop_name}}','{{appointment_date}}','{{appointment_time}}',
  '{{service_type}}','{{tech_name}}','{{location_name}}','{{location_address}}',
  '{{invoice_link}}','{{booking_link}}','{{tracking_link}}','{{total}}',
  '{{amount}}','{{refund_id}}','{{vehicle}}','{{parts_list}}','{{slot_date}}',
  '{{slot_time}}','{{claim_link}}','{{expires_at}}','{{tech_note}}','{{last_visit_date}}',
  '{{job_list}}','{{job_count}}','{{first_job_time}}','{{date}}','{{eta_minutes}}',
];

function validateTokens(body: string): string[] {
  const found = body.match(/\{\{[^}]+\}\}/g) ?? [];
  return found.filter(t => !TOKENS.includes(t));
}

function smsCharCount(text: string): { chars: number; segments: number } {
  const chars = text.length;
  const segments = chars <= 160 ? 1 : Math.ceil(chars / 153);
  return { chars, segments };
}

interface EditModalProps {
  template: NotificationTemplate;
  onClose: () => void;
}

function EditModal({ template, onClose }: EditModalProps) {
  const [subject, setSubject] = useState(template.subject ?? '');
  const [body, setBody]       = useState(template.body);
  const [smsText, setSmsText] = useState(template.smsText ?? '');
  const [saved, setSaved]     = useState(false);

  const bodyErrors  = validateTokens(body);
  const smsErrors   = validateTokens(smsText);
  const smsCount    = smsCharCount(smsText);
  const canSave     = bodyErrors.length === 0 && smsErrors.length === 0;

  function handleSave() {
    if (!canSave) return;
    setSaved(true);
    setTimeout(onClose, 800);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 12, width: 680, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #E5E7EB' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#1A1A1A' }}>{template.name}</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>Edit template · {template.locale.toUpperCase()}</div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#6B7280' }}><X size={20} /></button>
        </div>

        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Token reference */}
          <div style={{ padding: '10px 14px', background: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>AVAILABLE TOKENS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {TOKENS.slice(0, 12).map(t => (
                <code key={t} style={{ fontSize: 10, background: '#EFF6FF', color: '#2563EB', padding: '2px 5px', borderRadius: 4, fontFamily: 'monospace' }}>{t}</code>
              ))}
              <code style={{ fontSize: 10, color: '#9CA3AF', padding: '2px 5px' }}>+{TOKENS.length - 12} more</code>
            </div>
          </div>

          {/* Subject (email only) */}
          {template.channel === 'email' && (
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Subject line</label>
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                placeholder="Subject line…"
              />
            </div>
          )}

          {/* Body */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              {template.channel === 'email' ? 'Email body' : 'Message body'}
            </label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={8}
              style={{ width: '100%', padding: '10px 12px', border: `1px solid ${bodyErrors.length ? '#FCA5A5' : '#D1D5DB'}`, borderRadius: 8, fontSize: 13, fontFamily: 'monospace', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
            />
            {bodyErrors.length > 0 && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}>
                <AlertTriangle size={12} color="#DC2626" />
                <span style={{ fontSize: 11, color: '#DC2626' }}>Unknown tokens: {bodyErrors.join(', ')}</span>
              </div>
            )}
          </div>

          {/* SMS text */}
          {(template.smsText !== undefined || template.channel === 'sms') && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>SMS short text</label>
                <span style={{ fontSize: 11, color: smsCount.chars > 160 ? '#D97706' : '#6B7280' }}>
                  {smsCount.chars} chars · {smsCount.segments} segment{smsCount.segments > 1 ? 's' : ''}
                </span>
              </div>
              <textarea
                value={smsText}
                onChange={e => setSmsText(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '10px 12px', border: `1px solid ${smsErrors.length ? '#FCA5A5' : '#D1D5DB'}`, borderRadius: 8, fontSize: 13, fontFamily: 'monospace', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
              />
              {smsErrors.length > 0 && (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}>
                  <AlertTriangle size={12} color="#DC2626" />
                  <span style={{ fontSize: 11, color: '#DC2626' }}>Unknown tokens: {smsErrors.join(', ')}</span>
                </div>
              )}
              {smsCount.chars > 160 && smsErrors.length === 0 && (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}>
                  <AlertTriangle size={12} color="#D97706" />
                  <span style={{ fontSize: 11, color: '#D97706' }}>Message spans {smsCount.segments} SMS segments — carriers may charge extra</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #D1D5DB', background: '#fff', color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          <button
            onClick={handleSave}
            disabled={!canSave || saved}
            style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: saved ? '#15803D' : canSave ? '#C0392B' : '#D1D5DB', color: '#fff', fontWeight: 600, fontSize: 13, cursor: canSave && !saved ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {saved ? <><Check size={14} /> Saved</> : 'Save Template'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TemplateRow({ template, onEdit }: { template: NotificationTemplate; onEdit: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const cc = CATEGORY_COLOR[template.category];
  const Icon = CHANNEL_ICON[template.channel];

  return (
    <>
      <tr style={{ borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }} onClick={() => setExpanded(v => !v)}>
        <td style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {expanded ? <ChevronUp size={14} color="#9CA3AF" /> : <ChevronDown size={14} color="#9CA3AF" />}
            <span style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>{template.name}</span>
          </div>
        </td>
        <td style={{ padding: '12px 16px' }}>
          <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: cc.bg, color: cc.color }}>
            {CATEGORY_LABEL[template.category]}
          </span>
        </td>
        <td style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Icon size={13} color="#6B7280" />
            <span style={{ fontSize: 12, color: '#6B7280', textTransform: 'capitalize' }}>{template.channel}</span>
          </div>
        </td>
        <td style={{ padding: '12px 16px' }}>
          {template.isDefault
            ? <span style={{ fontSize: 11, color: '#6B7280' }}>Default</span>
            : <span style={{ fontSize: 11, color: '#15803D', fontWeight: 600 }}>Custom</span>
          }
        </td>
        <td style={{ padding: '12px 16px' }}>
          <button
            onClick={e => { e.stopPropagation(); onEdit(); }}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6, border: '1px solid #D1D5DB', background: '#fff', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            <Edit2 size={11} /> Edit
          </button>
        </td>
      </tr>
      {expanded && (
        <tr style={{ background: '#F9FAFB' }}>
          <td colSpan={5} style={{ padding: '0 16px 16px 40px' }}>
            {template.subject && (
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#6B7280' }}>SUBJECT: </span>
                <span style={{ fontSize: 12, color: '#374151' }}>{template.subject}</span>
              </div>
            )}
            <pre style={{ margin: 0, fontSize: 12, color: '#374151', fontFamily: 'monospace', whiteSpace: 'pre-wrap', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 6, padding: '10px 14px', lineHeight: 1.6 }}>
              {template.body}
            </pre>
            {template.smsText && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 4 }}>SMS TEXT:</div>
                <pre style={{ margin: 0, fontSize: 12, color: '#374151', fontFamily: 'monospace', whiteSpace: 'pre-wrap', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 6, padding: '8px 12px' }}>
                  {template.smsText}
                </pre>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

export function TemplatesView() {
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [activeCategory, setActiveCategory] = useState<NotificationCategory | 'all'>('all');

  const categories: { id: NotificationCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Templates' },
    { id: 'transactional-customer', label: 'Customer Transactional' },
    { id: 'transactional-staff', label: 'Staff Transactional' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'system', label: 'System' },
  ];

  const filtered = activeCategory === 'all' ? TEMPLATES : TEMPLATES.filter(t => t.category === activeCategory);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Pro gate banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 8, background: '#FFFBEB', border: '1px solid #FDE68A' }}>
        <Lock size={14} color="#D97706" />
        <span style={{ fontSize: 13, color: '#92400E' }}>
          <strong>Pro / Enterprise:</strong> Custom template overrides are available on Pro and Enterprise plans. Default templates are read-only on Starter.
        </span>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #E5E7EB' }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              padding: '9px 16px', border: 'none', background: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 12, color: activeCategory === cat.id ? '#C0392B' : '#6B7280',
              borderBottom: activeCategory === cat.id ? '2px solid #C0392B' : '2px solid transparent',
              marginBottom: -2,
            }}
          >
            {cat.label}
            <span style={{ marginLeft: 5, fontSize: 11, fontWeight: 600, color: '#9CA3AF' }}>
              {(activeCategory === cat.id || cat.id === 'all' ? filtered : TEMPLATES.filter(t => t.category === cat.id)).length}
            </span>
          </button>
        ))}
      </div>

      {/* Templates table */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              {['Template Name', 'Category', 'Channel', 'Type', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <TemplateRow key={t.id} template={t} onEdit={() => setEditingTemplate(t)} />
            ))}
          </tbody>
        </table>
      </div>

      {editingTemplate && (
        <EditModal template={editingTemplate} onClose={() => setEditingTemplate(null)} />
      )}
    </div>
  );
}

'use client';
import React, { useState } from 'react';
import { Search, Mail, MessageSquare, Shield, Star, Edit2, Merge, ChevronDown, ChevronUp, X, Check } from 'lucide-react';
import { CUSTOMERS, CONSENT_LOGS } from './mockData';
import type { MarketingCustomer, IdMeCategory } from './types';

const ID_ME_LABELS: Record<IdMeCategory, { label: string; color: string; bg: string }> = {
  military_active: { label: 'Active Military', color: '#1D4ED8', bg: '#EFF6FF' },
  veteran:         { label: 'Veteran',          color: '#7C3AED', bg: '#EDE9FE' },
  first_responder: { label: 'First Responder',  color: '#DC2626', bg: '#FEE2E2' },
  nurse:           { label: 'Healthcare',       color: '#059669', bg: '#D1FAE5' },
  teacher:         { label: 'Educator',         color: '#D97706', bg: '#FEF3C7' },
};

function OptBadge({ value, channel }: { value: boolean; channel: 'email' | 'sms' }) {
  const Icon = channel === 'email' ? Mail : MessageSquare;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: value ? '#D1FAE5' : '#F3F4F6', color: value ? '#065F46' : '#6B7280', border: `1px solid ${value ? '#10B981' : '#E5E7EB'}`, borderRadius: 6, padding: '2px 7px', fontSize: 11, fontWeight: 600 }}>
      <Icon size={11} /> {channel === 'email' ? 'Email' : 'SMS'}
    </span>
  );
}

interface CustomerDetailProps {
  customer: MarketingCustomer;
  onClose: () => void;
  onToggleOptIn: (channel: 'email' | 'sms') => void;
}

function CustomerDetail({ customer, onClose, onToggleOptIn }: CustomerDetailProps) {
  const logs = CONSENT_LOGS.filter(l => l.customerId === customer.id).slice(0, 5);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 600, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 17, color: '#1A1A1A', margin: 0 }}>{customer.firstName} {customer.lastName}</h3>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{customer.email} · {customer.phone}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="#6B7280" /></button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
            {[
              { label: 'Lifetime Value', value: `R ${customer.ltv.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: '#00A9AC' },
              { label: 'Total Visits', value: customer.visitCount, color: '#2980B9' },
              { label: 'Last Visit', value: customer.lastVisitDate ?? '—', color: '#1A1A1A' },
              { label: 'Member Since', value: customer.createdAt.slice(0, 7), color: '#1A1A1A' },
            ].map(s => (
              <div key={s.label} style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>{s.label}</div>
                <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 800, color: s.color, marginTop: 4 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Vehicles */}
          {customer.vehicles.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Vehicles</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {customer.vehicles.map((v, i) => (
                  <div key={i} style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: '7px 12px', fontSize: 13 }}>
                    <strong>{v.year} {v.make} {v.model}</strong>{v.trim ? ` ${v.trim}` : ''}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {customer.tags.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Tags</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {customer.tags.map(t => (
                  <span key={t} style={{ background: '#E6F7F7', color: '#00A9AC', border: '1px solid #80D4D5', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Opt-in / Compliance */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Marketing Consent</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {(['email', 'sms'] as const).map(ch => (
                <div key={ch} style={{ flex: 1, background: customer[ch === 'email' ? 'emailOptIn' : 'smsOptIn'] ? '#D1FAE5' : '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#1A1A1A', textTransform: 'uppercase' }}>{ch}</div>
                    <div style={{ fontSize: 12, color: customer[ch === 'email' ? 'emailOptIn' : 'smsOptIn'] ? '#059669' : '#DC2626', fontWeight: 600, marginTop: 2 }}>
                      {customer[ch === 'email' ? 'emailOptIn' : 'smsOptIn'] ? 'Opted In' : 'Opted Out'}
                    </div>
                  </div>
                  <button onClick={() => onToggleOptIn(ch)}
                    style={{ padding: '5px 10px', border: '1px solid #E5E7EB', borderRadius: 7, fontSize: 12, cursor: 'pointer', background: '#fff', color: '#374151' }}>
                    {customer[ch === 'email' ? 'emailOptIn' : 'smsOptIn'] ? 'Suppress' : 'Re-enable'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ID.me */}
          {customer.idMeStatus !== 'none' && customer.idMeCategory && (
            <div style={{ marginBottom: 16, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>ID.me Verification</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Shield size={18} color="#2563EB" />
                <div>
                  <span style={{ ...ID_ME_LABELS[customer.idMeCategory], borderRadius: 7, padding: '3px 10px', fontSize: 13, fontWeight: 700 }}>
                    {ID_ME_LABELS[customer.idMeCategory].label} — Verified
                  </span>
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>
                    Verified {customer.idMeVerifiedAt?.slice(0, 10)} · Discount auto-applied at checkout
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Consent audit trail */}
          {logs.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Consent Audit Trail</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {logs.map(l => (
                  <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', background: '#F9FAFB', borderRadius: 7, fontSize: 12 }}>
                    <span style={{ fontFamily: 'monospace', color: '#9CA3AF', fontSize: 11 }}>{l.createdAt.slice(0, 16)}</span>
                    <span style={{ background: l.eventType.includes('opt_in') ? '#D1FAE5' : '#FEE2E2', color: l.eventType.includes('opt_in') ? '#065F46' : '#005F62', borderRadius: 5, padding: '1px 7px', fontWeight: 700 }}>{l.eventType}</span>
                    <span style={{ color: '#374151', textTransform: 'capitalize' }}>{l.channel}</span>
                    <span style={{ color: '#9CA3AF' }}>{l.source}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CustomersView() {
  const [customers, setCustomers] = useState(CUSTOMERS);
  const [query, setQuery] = useState('');
  const [filterOpt, setFilterOpt] = useState<'all' | 'email' | 'sms' | 'none'>('all');
  const [selected, setSelected] = useState<MarketingCustomer | null>(null);
  const [sortBy, setSortBy] = useState<'ltv' | 'lastVisit' | 'name'>('ltv');

  const filtered = customers
    .filter(c => {
      if (query && !`${c.firstName} ${c.lastName} ${c.email} ${c.phone}`.toLowerCase().includes(query.toLowerCase())) return false;
      if (filterOpt === 'email' && !c.emailOptIn) return false;
      if (filterOpt === 'sms' && !c.smsOptIn) return false;
      if (filterOpt === 'none' && (c.emailOptIn || c.smsOptIn)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'ltv') return b.ltv - a.ltv;
      if (sortBy === 'lastVisit') return (b.lastVisitDate ?? '').localeCompare(a.lastVisitDate ?? '');
      return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
    });

  const toggleOptIn = (id: string, channel: 'email' | 'sms') => {
    const field = channel === 'email' ? 'emailOptIn' : 'smsOptIn';
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, [field]: !c[field as keyof typeof c] } : c));
    setSelected(prev => prev && prev.id === id ? { ...prev, [field]: !prev[field as keyof typeof prev] } : prev);
  };

  const emailOptCount = customers.filter(c => c.emailOptIn).length;
  const smsOptCount = customers.filter(c => c.smsOptIn).length;

  return (
    <div style={{ padding: '20px 0', fontFamily: 'Inter, sans-serif' }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Customers', value: customers.length, color: '#2980B9', bg: '#EBF5FB' },
          { label: 'Email Opted-In', value: emailOptCount, color: '#27AE60', bg: '#D1FAE5' },
          { label: 'SMS Opted-In', value: smsOptCount, color: '#7C3AED', bg: '#EDE9FE' },
          { label: 'Total LTV', value: `R ${customers.reduce((s, c) => s + c.ltv, 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}`, color: '#00A9AC', bg: '#E6F7F7' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name, email, phone..."
            style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px 8px 32px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <select value={filterOpt} onChange={e => setFilterOpt(e.target.value as typeof filterOpt)}
          style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', background: '#fff' }}>
          <option value="all">All Opt-In Status</option>
          <option value="email">Email Opted-In</option>
          <option value="sms">SMS Opted-In</option>
          <option value="none">No Consent</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
          style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', background: '#fff' }}>
          <option value="ltv">Sort: Highest LTV</option>
          <option value="lastVisit">Sort: Most Recent Visit</option>
          <option value="name">Sort: Name A–Z</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              {['Customer', 'Contact', 'Vehicles', 'LTV', 'Last Visit', 'Opt-In', 'ID.me', ''].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ padding: '32px 0', textAlign: 'center', color: '#9CA3AF' }}>No customers match your filters.</td></tr>
            )}
            {filtered.map((c, i) => (
              <tr key={c.id} style={{ borderTop: i > 0 ? '1px solid #E5E7EB' : 'none' }}>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E6F7F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#00A9AC', flexShrink: 0 }}>
                      {c.firstName[0]}{c.lastName[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#1A1A1A' }}>{c.firstName} {c.lastName}</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF' }}>{c.visitCount} visits</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 14px', color: '#6B7280' }}>
                  <div>{c.email}</div>
                  <div style={{ fontSize: 12 }}>{c.phone}</div>
                </td>
                <td style={{ padding: '12px 14px', color: '#6B7280', fontSize: 12 }}>
                  {c.vehicles.slice(0, 2).map((v, j) => <div key={j}>{v.year} {v.make} {v.model}</div>)}
                  {c.vehicles.length > 2 && <div style={{ color: '#9CA3AF' }}>+{c.vehicles.length - 2} more</div>}
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 15, color: c.ltv >= 1000 ? '#00A9AC' : '#1A1A1A' }}>
                    ${c.ltv.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </span>
                </td>
                <td style={{ padding: '12px 14px', color: '#6B7280', fontSize: 12 }}>{c.lastVisitDate ?? '—'}</td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', gap: 4, flexDirection: 'column' }}>
                    <OptBadge value={c.emailOptIn} channel="email" />
                    <OptBadge value={c.smsOptIn} channel="sms" />
                  </div>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  {c.idMeStatus === 'verified' && c.idMeCategory ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...ID_ME_LABELS[c.idMeCategory], borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                      <Shield size={11} /> {ID_ME_LABELS[c.idMeCategory].label}
                    </span>
                  ) : <span style={{ color: '#D1D5DB', fontSize: 12 }}>—</span>}
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <button onClick={() => setSelected(c)}
                    style={{ padding: '5px 12px', border: '1px solid #E5E7EB', borderRadius: 7, fontSize: 12, cursor: 'pointer', background: '#fff', color: '#374151', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Edit2 size={11} /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <CustomerDetail
          customer={selected}
          onClose={() => setSelected(null)}
          onToggleOptIn={ch => toggleOptIn(selected.id, ch)}
        />
      )}
    </div>
  );
}

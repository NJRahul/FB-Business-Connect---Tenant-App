import React, { useState, useEffect } from 'react';
import { Clock, Plus, X, Check, AlertTriangle, Users } from 'lucide-react';
import { WAITLIST_ENTRIES, WAITLIST_OFFERS } from './mockData';
import type { WaitlistEntry, WaitlistStatus } from './types';

const STATUS_META: Record<WaitlistStatus, { label: string; color: string; bg: string }> = {
  active:  { label: 'Active',   color: '#2563EB', bg: '#EFF6FF' },
  offered: { label: 'Offered',  color: '#D97706', bg: '#FEF3C7' },
  claimed: { label: 'Claimed',  color: '#15803D', bg: '#F0FDF4' },
  expired: { label: 'Expired',  color: '#9CA3AF', bg: '#F3F4F6' },
  removed: { label: 'Removed',  color: '#DC2626', bg: '#FEF2F2' },
};

function Countdown({ expiresAt }: { expiresAt: string }) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    function update() {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setRemaining('Expired'); return; }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setRemaining(`${mins}:${String(secs).padStart(2, '0')}`);
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const isUrgent = new Date(expiresAt).getTime() - Date.now() < 5 * 60 * 1000;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <Clock size={11} color={isUrgent ? '#DC2626' : '#D97706'} />
      <span style={{ fontSize: 12, fontWeight: 700, color: isUrgent ? '#DC2626' : '#D97706', fontFamily: 'monospace' }}>{remaining}</span>
    </div>
  );
}

interface AddModalProps {
  onClose: () => void;
}

function AddModal({ onClose }: AddModalProps) {
  const [form, setForm] = useState({
    customerName: '', customerPhone: '', serviceType: '', vehicleDesc: '',
    earliestDate: '', latestDate: '',
  });
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(onClose, 800);
  }

  const canSave = Object.values(form).every(v => v.trim() !== '');

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 12, width: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#1A1A1A' }}>Add to Waitlist</div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={18} color="#6B7280" /></button>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Customer name',  key: 'customerName',  type: 'text',  placeholder: 'Full name' },
            { label: 'Phone number',   key: 'customerPhone', type: 'tel',   placeholder: '+1 +27 XX XXX XXXX' },
            { label: 'Service type',   key: 'serviceType',   type: 'text',  placeholder: 'e.g. Oil Change, Brake Service' },
            { label: 'Vehicle',        key: 'vehicleDesc',   type: 'text',  placeholder: 'e.g. 2020 Honda Civic' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{f.label}</label>
              <input
                type={f.type}
                value={form[f.key as keyof typeof form]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Earliest available date', key: 'earliestDate' },
              { label: 'Latest acceptable date',  key: 'latestDate' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{f.label}</label>
                <input
                  type="date"
                  value={form[f.key as keyof typeof form]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #D1D5DB', background: '#fff', color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          <button
            onClick={handleSave}
            disabled={!canSave || saved}
            style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: saved ? '#15803D' : canSave ? '#C0392B' : '#D1D5DB', color: '#fff', fontWeight: 600, fontSize: 13, cursor: canSave && !saved ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {saved ? <><Check size={14} /> Added</> : 'Add to Waitlist'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function WaitlistView() {
  const [showModal, setShowModal] = useState(false);

  const activeEntries = WAITLIST_ENTRIES.filter(e => ['active','offered'].includes(e.status));
  const pendingOffers = WAITLIST_OFFERS.filter(o => o.status === 'pending');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'In Queue',       value: WAITLIST_ENTRIES.filter(e => e.status === 'active').length,  color: '#2563EB' },
          { label: 'Offers Pending', value: pendingOffers.length,                                        color: '#D97706' },
          { label: 'Claimed Today',  value: WAITLIST_ENTRIES.filter(e => e.status === 'claimed').length, color: '#15803D' },
          { label: 'Expired Today',  value: WAITLIST_ENTRIES.filter(e => e.status === 'expired').length, color: '#9CA3AF' },
        ].map(s => (
          <div key={s.label} style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 20px', background: '#fff' }}>
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 28, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Active offers with countdown */}
      {pendingOffers.length > 0 && (
        <div style={{ border: '1px solid #FDE68A', borderRadius: 10, background: '#FFFBEB', overflow: 'hidden' }}>
          <div style={{ padding: '12px 18px', borderBottom: '1px solid #FDE68A', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={14} color="#D97706" />
            <div style={{ fontWeight: 700, fontSize: 13, color: '#92400E' }}>Live Offers — 30-minute claim window</div>
          </div>
          {pendingOffers.map(offer => (
            <div key={offer.id} style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #FDE68A99' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#1A1A1A' }}>{offer.customerName}</div>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                  {offer.serviceType} · {offer.slotDate} at {offer.slotTime}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Countdown expiresAt={offer.expiresAt} />
                <span style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace' }}>
                  Token: {offer.token}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Waitlist table */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #F3F4F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={16} color="#C0392B" />
            <span style={{ fontWeight: 700, fontSize: 14, color: '#1A1A1A' }}>Waitlist Queue</span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: 'none', background: '#C0392B', color: '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}
          >
            <Plus size={13} /> Add to Waitlist
          </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              {['#', 'Customer', 'Service', 'Vehicle', 'Date Range', 'Offers Today', 'Status'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {WAITLIST_ENTRIES.map((entry, i) => {
              const sm = STATUS_META[entry.status];
              return (
                <tr key={entry.id} style={{ background: i % 2 === 0 ? '#fff' : '#F9FAFB', borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 16, color: entry.status === 'active' || entry.status === 'offered' ? '#C0392B' : '#D1D5DB' }}>
                    {entry.queuePosition > 0 ? `#${entry.queuePosition}` : '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>{entry.customerName}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{entry.customerPhone}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151' }}>{entry.serviceType}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#6B7280' }}>{entry.vehicleDesc}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#6B7280' }}>
                    {entry.earliestDate} → {entry.latestDate}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: entry.offersToday >= 2 ? '#D97706' : '#6B7280' }}>
                      {entry.offersToday}/2
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: sm.bg, color: sm.color }}>
                      {sm.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Rules info */}
      <div style={{ padding: '14px 18px', background: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB' }}>
        <div style={{ fontWeight: 700, fontSize: 12, color: '#374151', marginBottom: 8 }}>Waitlist Rules</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            'FIFO queue — customers offered slots in the order they joined',
            'Max 2 offers per customer per day to prevent spam',
            '30-minute claim window — offer expires automatically if not claimed',
            'Only one pending offer at a time — next customer in queue is skipped until slot is resolved',
            'Customer can remove themselves from the waitlist at any time',
            'On decline or expiry, slot is re-offered to the next eligible customer',
          ].map(r => (
            <div key={r} style={{ display: 'flex', gap: 8, fontSize: 12, color: '#6B7280' }}>
              <span style={{ color: '#C0392B', flexShrink: 0 }}>•</span>
              <span>{r}</span>
            </div>
          ))}
        </div>
      </div>

      {showModal && <AddModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

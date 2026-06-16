import React, { useState } from 'react';
import { FileCheck, Download, CheckCircle, Clock, AlertTriangle, XCircle, Package, Camera, Plus } from 'lucide-react';
import { TIRE_REGISTRATIONS, REGISTRATION_BATCHES } from './mockData';
import type { TireRegistration, RegistrationBatch, RegistrationStatus, BatchStatus } from './types';

function RegStatusBadge({ status }: { status: RegistrationStatus }) {
  const map: Record<RegistrationStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    pending:    { label: 'Pending',    color: '#6B7280', bg: '#F3F4F6', icon: <Clock size={10} /> },
    in_batch:   { label: 'In Batch',  color: '#2563EB', bg: '#EFF6FF', icon: <Package size={10} /> },
    submitted:  { label: 'Submitted', color: '#D97706', bg: '#FFFBEB', icon: <Clock size={10} /> },
    confirmed:  { label: 'Confirmed', color: '#16A34A', bg: '#F0FDF4', icon: <CheckCircle size={10} /> },
    failed:     { label: 'Failed',    color: '#DC2626', bg: '#FEF2F2', icon: <XCircle size={10} /> },
  };
  const s = map[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 99, background: s.bg, color: s.color, fontSize: 11, fontWeight: 600 }}>
      {s.icon}{s.label}
    </span>
  );
}

function BatchStatusBadge({ status }: { status: BatchStatus }) {
  const map: Record<BatchStatus, { label: string; color: string; bg: string }> = {
    pending:          { label: 'Pending Export',   color: '#6B7280', bg: '#F3F4F6' },
    submitted_by_shop:{ label: 'Submitted',        color: '#D97706', bg: '#FFFBEB' },
    confirmed:        { label: 'Confirmed',         color: '#16A34A', bg: '#F0FDF4' },
  };
  const s = map[status];
  return <span style={{ padding: '2px 8px', borderRadius: 99, background: s.bg, color: s.color, fontSize: 11, fontWeight: 600 }}>{s.label}</span>;
}

function DotCaptureModal({ onClose }: { onClose: () => void }) {
  const [dot, setDot] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');

  const DOT_PATTERN = /^DOT [A-Z0-9]{2,4} [A-Z0-9]{4} \d{4}$/;
  const valid = DOT_PATTERN.test(dot);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 14, width: 420, maxWidth: '100%', overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Capture DOT Date Code</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: '#9CA3AF', cursor: 'pointer' }}>×</button>
        </div>
        {step === 'enter' ? (
          <div style={{ padding: 20 }}>
            <div style={{ border: '2px dashed #E5E7EB', borderRadius: 10, padding: 20, textAlign: 'center', marginBottom: 16, background: '#F9FAFB' }}>
              <Camera size={28} color="#9CA3AF" style={{ display: 'block', margin: '0 auto 8px' }} />
              <div style={{ fontSize: 13, color: '#6B7280' }}>Tap to scan sidewall (OCR-assisted)</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>PWA camera access required</div>
            </div>
            <div style={{ marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#374151' }}>Or enter manually</div>
            <input
              value={dot}
              onChange={e => setDot(e.target.value.toUpperCase())}
              placeholder="DOT M38V LJMR 1824"
              style={{ width: '100%', padding: '9px 12px', border: `1px solid ${dot && !valid ? '#FCA5A5' : '#D1D5DB'}`, borderRadius: 7, fontSize: 13, boxSizing: 'border-box', fontFamily: 'monospace' }}
            />
            {dot && !valid && <div style={{ fontSize: 11, color: '#DC2626', marginTop: 4 }}>Format: DOT XX## XXXX WWYR (e.g. DOT M38V LJMR 1824)</div>}
            {valid && <div style={{ fontSize: 11, color: '#16A34A', marginTop: 4 }}>✓ Valid DOT format — Week 18, Year 2024</div>}
            <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={onClose} style={{ padding: '8px 16px', border: '1px solid #E5E7EB', borderRadius: 7, background: '#fff', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => valid && setStep('confirm')} style={{ padding: '8px 16px', background: valid ? '#C0392B' : '#E5E7EB', color: valid ? '#fff' : '#9CA3AF', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: valid ? 'pointer' : 'default' }}>Continue</button>
            </div>
          </div>
        ) : (
          <div style={{ padding: 20 }}>
            <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Captured DOT Code</div>
              <div style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>{dot}</div>
            </div>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
              <input type="checkbox" style={{ marginTop: 2 }} />
              <span>Customer consents to manufacturer registration and data sharing per warranty terms.</span>
            </label>
            <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setStep('enter')} style={{ padding: '8px 16px', border: '1px solid #E5E7EB', borderRadius: 7, background: '#fff', fontSize: 13, cursor: 'pointer' }}>Back</button>
              <button onClick={onClose} style={{ padding: '8px 16px', background: '#C0392B', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Save Registration</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BatchCard({ batch }: { batch: RegistrationBatch }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#1A1A1A' }}>{batch.manufacturer}</div>
        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{batch.tiresCount} tires · Created {batch.createdAt}</div>
        {batch.submittedAt && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>Submitted {batch.submittedAt}</div>}
        {batch.confirmedAt && <div style={{ fontSize: 11, color: '#16A34A', marginTop: 1 }}>Confirmed {batch.confirmedAt}</div>}
      </div>
      <BatchStatusBadge status={batch.status} />
      {batch.status === 'pending' && (
        <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: '#1A1A1A', color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          <Download size={13} /> Export CSV
        </button>
      )}
      {batch.fileUrl && batch.status !== 'pending' && (
        <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 7, fontSize: 12, cursor: 'pointer' }}>
          <Download size={13} /> Download
        </button>
      )}
    </div>
  );
}

export function RegistrationView() {
  const [subtab, setSubtab] = useState<'list' | 'batches'>('list');
  const [dotModal, setDotModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'failed'>('all');

  const filtered = TIRE_REGISTRATIONS.filter(r => {
    if (filter === 'pending') return r.status === 'pending' || r.status === 'in_batch';
    if (filter === 'failed') return r.status === 'failed';
    return true;
  });

  const confirmed = TIRE_REGISTRATIONS.filter(r => r.status === 'confirmed').length;
  const pending = TIRE_REGISTRATIONS.filter(r => r.status === 'pending').length;
  const failed = TIRE_REGISTRATIONS.filter(r => r.status === 'failed').length;

  return (
    <div>
      {dotModal && <DotCaptureModal onClose={() => setDotModal(false)} />}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Registrations', value: TIRE_REGISTRATIONS.length, color: '#1A1A1A' },
          { label: 'Confirmed', value: confirmed, color: '#16A34A' },
          { label: 'Pending / In Batch', value: TIRE_REGISTRATIONS.filter(r => r.status === 'pending' || r.status === 'in_batch').length, color: '#2563EB' },
          { label: 'Failed', value: failed, color: '#DC2626' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 9, padding: '14px 16px' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #E5E7EB', marginBottom: 20, alignItems: 'flex-end' }}>
        {(['list', 'batches'] as const).map(t => (
          <button key={t} onClick={() => setSubtab(t)} style={{ padding: '8px 18px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: subtab === t ? '#C0392B' : '#6B7280', borderBottom: subtab === t ? '2px solid #C0392B' : '2px solid transparent', marginBottom: -2, textTransform: 'capitalize' }}>
            {t === 'list' ? 'Tire Registrations' : 'Batch Export'}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, paddingBottom: 8 }}>
          <button onClick={() => setDotModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#C0392B', color: '#fff', border: 'none', borderRadius: 7, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
            <Camera size={13} /> Capture DOT
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#1A1A1A', color: '#fff', border: 'none', borderRadius: 7, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
            <Plus size={13} /> Add Registration
          </button>
        </div>
      </div>

      {subtab === 'list' && (
        <div>
          {/* Filter */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {(['all', 'pending', 'failed'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid', borderColor: filter === f ? '#C0392B' : '#E5E7EB', background: filter === f ? '#FEF2F2' : '#fff', color: filter === f ? '#C0392B' : '#6B7280', fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
                {f}
              </button>
            ))}
          </div>

          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  {['Customer', 'SKU', 'Manufacturer', 'DOT Code', 'Sale Date', 'Consent', 'Status', 'Batch'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <td style={{ padding: '11px 14px', fontWeight: 500, color: '#1A1A1A' }}>{r.customerName}</td>
                    <td style={{ padding: '11px 14px', color: '#374151', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.skuName}</td>
                    <td style={{ padding: '11px 14px', color: '#374151' }}>{r.manufacturer}</td>
                    <td style={{ padding: '11px 14px', fontFamily: 'monospace', fontSize: 11, color: '#374151' }}>{r.dotCode}</td>
                    <td style={{ padding: '11px 14px', color: '#6B7280' }}>{r.saleDate}</td>
                    <td style={{ padding: '11px 14px' }}>
                      {r.consentGiven
                        ? <CheckCircle size={14} color="#16A34A" />
                        : <XCircle size={14} color="#9CA3AF" />}
                    </td>
                    <td style={{ padding: '11px 14px' }}><RegStatusBadge status={r.status} /></td>
                    <td style={{ padding: '11px 14px', color: '#6B7280', fontSize: 11 }}>{r.batchId || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {failed > 0 && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8, fontSize: 12, color: '#DC2626', display: 'flex', gap: 8 }}>
              <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              {failed} registration(s) failed. Review DOT code format or resend consent requests before next batch export.
            </div>
          )}
        </div>
      )}

      {subtab === 'batches' && (
        <div>
          <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 14 }}>
            Batch export generates a manufacturer-formatted CSV for mail-in submission. Mark as Submitted after sending; confirm when manufacturer acknowledges receipt.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {REGISTRATION_BATCHES.map(b => <BatchCard key={b.id} batch={b} />)}
          </div>
          <div style={{ marginTop: 14 }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#1A1A1A', color: '#fff', border: 'none', borderRadius: 7, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              <FileCheck size={14} /> Create New Batch
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Download, FileText, ChevronDown, ChevronUp, CheckCircle, Clock, AlertTriangle, X } from 'lucide-react';
import { INVOICES } from './mockData';
import type { InvoiceStatus, Invoice } from './types';

const STATUS_META: Record<InvoiceStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  paid:    { label: 'Paid',    color: '#15803D', bg: '#F0FDF4', icon: CheckCircle },
  pending: { label: 'Pending', color: '#D97706', bg: '#FEF3C7', icon: Clock },
  failed:  { label: 'Failed',  color: '#DC2626', bg: '#F0FBFB', icon: AlertTriangle },
  void:    { label: 'Void',    color: '#9CA3AF', bg: '#F3F4F6', icon: X },
};

function fmtMoney(cents: number) {
  return `R ${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtPeriod(start: string, end: string) {
  const s = new Date(start).toLocaleDateString([], { month: 'short', day: 'numeric' });
  const e = new Date(end).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  return `${s} – ${e}`;
}

function DownloadButton({ invoice }: { invoice: Invoice }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');

  function handleClick() {
    setState('loading');
    setTimeout(() => {
      setState('done');
      setTimeout(() => setState('idle'), 2000);
    }, 1200);
  }

  return (
    <button
      onClick={e => { e.stopPropagation(); handleClick(); }}
      disabled={state === 'loading'}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '5px 10px', borderRadius: 7, border: '1px solid #D1D5DB',
        background: state === 'done' ? '#F0FDF4' : '#fff',
        color: state === 'done' ? '#15803D' : '#374151',
        fontSize: 12, fontWeight: 600, cursor: state === 'loading' ? 'default' : 'pointer',
      }}
    >
      {state === 'loading' ? (
        <><span style={{ width: 11, height: 11, border: '2px solid #D1D5DB', borderTopColor: '#6B7280', borderRadius: 99, display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Preparing…</>
      ) : state === 'done' ? (
        <><CheckCircle size={11} /> Downloaded</>
      ) : (
        <><Download size={11} /> PDF</>
      )}
    </button>
  );
}

export function InvoicesView() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const totalPaid = INVOICES.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const taxPaid   = INVOICES.filter(i => i.status === 'paid').reduce((s, i) => s + i.tax, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { label: 'Total Billed (YTD)',  value: fmtMoney(totalPaid), sub: `${INVOICES.filter(i => i.status === 'paid').length} invoices paid`, color: '#1A1A1A' },
          { label: 'VAT Collected (YTD)', value: fmtMoney(taxPaid),   sub: 'Via Stripe Tax — South African VAT (15%)',                        color: '#6B7280' },
          { label: 'Next Invoice',        value: fmtMoney(INVOICES[0].amount), sub: `Due ${fmtDate(INVOICES[0].currentPeriodEnd || INVOICES[0].createdAt)}`, color: '#2563EB' },
        ].map(s => (
          <div key={s.label} style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 20px', background: '#fff' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 24, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Tax info banner */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', borderRadius: 8, background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
        <FileText size={14} color="#2563EB" style={{ marginTop: 2, flexShrink: 0 }} />
        <div style={{ fontSize: 12, color: '#1E40AF' }}>
          <strong>Tax &amp; compliance:</strong> FB Business Connect uses Stripe Tax to calculate and collect South African VAT (15%) automatically. VAT returns are submitted per SARS requirements via Stripe. Your Tax Reference Number and business address on file are used for all tax documents.
        </div>
      </div>

      {/* Invoice table */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, background: '#fff', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', fontWeight: 700, fontSize: 14, color: '#1A1A1A' }}>
          Invoice History
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              {['', 'Invoice #', 'Billing Period', 'Created', 'Subtotal', 'Tax', 'Total', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', borderBottom: '1px solid #E5E7EB', textTransform: 'uppercase', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {INVOICES.map((inv, i) => {
              const sm = STATUS_META[inv.status];
              const SIcon = sm.icon;
              const isExpanded = expandedId === inv.id;
              return (
                <React.Fragment key={inv.id}>
                  <tr
                    style={{ background: isExpanded ? '#F9FAFB' : i % 2 === 0 ? '#fff' : '#FAFAFA', borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }}
                    onClick={() => setExpandedId(isExpanded ? null : inv.id)}
                  >
                    <td style={{ padding: '11px 14px', width: 20 }}>
                      {isExpanded ? <ChevronUp size={14} color="#9CA3AF" /> : <ChevronDown size={14} color="#9CA3AF" />}
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 600, color: '#374151', fontFamily: 'monospace' }}>{inv.number}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>{fmtPeriod(inv.periodStart, inv.periodEnd)}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: '#9CA3AF', whiteSpace: 'nowrap' }}>{fmtDate(inv.createdAt)}</td>
                    <td style={{ padding: '11px 14px', fontSize: 13, color: '#374151' }}>{fmtMoney(inv.subtotal)}</td>
                    <td style={{ padding: '11px 14px', fontSize: 13, color: '#9CA3AF' }}>{inv.tax > 0 ? fmtMoney(inv.tax) : '—'}</td>
                    <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>{fmtMoney(inv.amount)}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content', padding: '3px 9px', borderRadius: 99, background: sm.bg, color: sm.color, fontSize: 11, fontWeight: 700 }}>
                        <SIcon size={10} /> {sm.label}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <DownloadButton invoice={inv} />
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr style={{ background: '#F9FAFB' }}>
                      <td colSpan={9} style={{ padding: '0 14px 16px 40px' }}>
                        <div style={{ marginTop: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Line Items</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {inv.lineItems.map(li => (
                              <div key={li.description} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#fff', borderRadius: 6, border: '1px solid #E5E7EB' }}>
                                <span style={{ fontSize: 13, color: '#374151' }}>{li.description}</span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>{fmtMoney(li.amount)}</span>
                              </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#F9FAFB', borderRadius: 6, border: '1px solid #E5E7EB', borderTop: '2px solid #E5E7EB' }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>Total</span>
                              <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>{fmtMoney(inv.amount)}</span>
                            </div>
                          </div>
                          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                            <DownloadButton invoice={inv} />
                            <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 7, border: '1px solid #D1D5DB', background: '#fff', color: '#6B7280', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                              <FileText size={11} /> View on Stripe
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 1099-K notice */}
      <div style={{ padding: '14px 18px', borderRadius: 8, background: '#F9FAFB', border: '1px solid #E5E7EB', fontSize: 12, color: '#6B7280' }}>
        <strong style={{ color: '#374151' }}>SARS VAT Returns:</strong> If your Stripe Connect account is VAT-registered, Stripe will provide transaction reports to support your VAT201 submissions to SARS. Tax documents are available in your Stripe Dashboard under Tax Documents.
      </div>
    </div>
  );
}

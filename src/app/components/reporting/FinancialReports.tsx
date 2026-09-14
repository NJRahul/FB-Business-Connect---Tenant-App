import React, { useState } from 'react';
import { Download, FileText, CheckCircle, XCircle } from 'lucide-react';
import { DAILY_REVENUE, REVENUE_BY_SERVICE, REFUNDS, RECONCILIATION, TECH_STATS } from './mockData';
import type { ReportPeriod } from './types';

function fmtMoney(cents: number) {
  return `R ${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtK(cents: number) {
  const d = cents / 100;
  return d >= 1000 ? `R ${(d / 1000).toFixed(1)}k` : `R ${d.toFixed(0)}`;
}

function LineChart({ data, color = '#C0392B', h = 120 }: { data: { label: string; value: number }[]; color?: string; h?: number }) {
  const w = 500;
  if (data.length < 2) return null;
  const values = data.map(d => d.value);
  const mn = Math.min(...values), mx = Math.max(...values), rng = mx - mn || 1;
  const xStep = w / (data.length - 1);
  const toY = (v: number) => h - ((v - mn) / rng) * (h - 16) - 4;
  const pts = data.map((d, i) => `${i * xStep},${toY(d.value)}`).join(' ');
  const fill = `0,${h} ${pts} ${(data.length - 1) * xStep},${h}`;

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(p => mn + p * rng);

  return (
    <div style={{ position: 'relative' }}>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block', height: h }}>
        {gridLines.map((v, i) => (
          <line key={i} x1={0} x2={w} y1={toY(v)} y2={toY(v)} stroke="#F3F4F6" strokeWidth="1" />
        ))}
        <polygon points={fill} fill={color} fillOpacity="0.08" />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        {data.filter((_, i) => i % Math.ceil(data.length / 7) === 0 || i === data.length - 1).map(d => (
          <span key={d.label} style={{ fontSize: 10, color: '#9CA3AF' }}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data, color = '#C0392B', h = 80 }: { data: { label: string; value: number }[]; color?: string; h?: number }) {
  const mx = Math.max(...data.map(d => d.value)) || 1;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: h }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: 2 }}>
          <div style={{ width: '100%', background: color, borderRadius: 2, height: `${(d.value / mx) * (h - 16)}px`, opacity: 0.85 }} />
          <span style={{ fontSize: 9, color: '#9CA3AF', textAlign: 'center' }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function ExportBtn({ label, type }: { label: string; type: 'csv' | 'pdf' }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');
  function go() {
    if (state !== 'idle') return;
    setState('loading');
    setTimeout(() => { setState('done'); setTimeout(() => setState('idle'), 2000); }, 1000);
  }
  return (
    <button onClick={go} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 6, border: '1px solid #E5E7EB', background: state === 'done' ? '#F0FDF4' : '#fff', color: state === 'done' ? '#15803D' : '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
      {state === 'loading' ? <Download size={12} style={{ animation: 'spin 1s linear infinite' }} /> : state === 'done' ? <CheckCircle size={12} /> : <Download size={12} />}
      {state === 'done' ? 'Downloaded' : label}
    </button>
  );
}

const PERIOD_OPTS: { label: string; value: ReportPeriod }[] = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
];

export function FinancialReports() {
  const [period, setPeriod] = useState<ReportPeriod>('30d');

  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const slice = DAILY_REVENUE.slice(-days);

  const gross   = slice.reduce((s, d) => s + d.gross, 0);
  const labor   = slice.reduce((s, d) => s + d.labor, 0);
  const parts   = slice.reduce((s, d) => s + d.parts, 0);
  const refunds = slice.reduce((s, d) => s + d.refunds, 0);
  const net     = gross - refunds;

  const prevSlice = DAILY_REVENUE.slice(-days * 2, -days);
  const prevGross = prevSlice.reduce((s, d) => s + d.gross, 0);
  const trend     = prevGross > 0 ? ((gross - prevGross) / prevGross) * 100 : 0;

  const chartData = slice.map(d => ({ label: d.date.slice(5), value: d.gross / 100 }));

  const laborPct = gross > 0 ? (labor / gross) * 100 : 0;
  const partsPct = gross > 0 ? (parts / gross) * 100 : 0;

  const byTech = TECH_STATS.map(t => ({ name: t.name.split(' ')[0], initials: t.initials, rev: t.revenue })).sort((a, b) => b.rev - a.rev);
  const maxTechRev = Math.max(...byTech.map(t => t.rev));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Period + export controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 4, background: '#F3F4F6', borderRadius: 8, padding: 3 }}>
          {PERIOD_OPTS.map(o => (
            <button key={o.value} onClick={() => setPeriod(o.value)} style={{ padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: period === o.value ? '#fff' : 'transparent', color: period === o.value ? '#C0392B' : '#6B7280', boxShadow: period === o.value ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>
              {o.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <ExportBtn label="Export CSV" type="csv" />
          <ExportBtn label="Export PDF" type="pdf" />
        </div>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: 'Gross Revenue', value: fmtMoney(gross), sub: trend >= 0 ? `▲ ${Math.abs(trend).toFixed(1)}% vs prior period` : `▼ ${Math.abs(trend).toFixed(1)}% vs prior period`, subColor: trend >= 0 ? '#15803D' : '#DC2626' },
          { label: 'Net Revenue', value: fmtMoney(net), sub: `After ${fmtMoney(refunds)} refunds`, subColor: '#6B7280' },
          { label: 'Labor Revenue', value: fmtMoney(labor), sub: `${laborPct.toFixed(1)}% of gross`, subColor: '#2563EB' },
          { label: 'Parts Revenue', value: fmtMoney(parts), sub: `${partsPct.toFixed(1)}% of gross`, subColor: '#7E22CE' },
        ].map(k => (
          <div key={k.label} style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 18px', background: '#fff' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 22, color: '#1A1A1A' }}>{k.value}</div>
            <div style={{ fontSize: 11, color: k.subColor, marginTop: 4 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Revenue line chart */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', padding: '18px 20px' }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: '#1A1A1A', marginBottom: 16 }}>Daily Gross Revenue</div>
        <LineChart data={chartData} />
      </div>

      {/* Labor vs Parts split + by service */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Labor / Parts split */}
        <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', padding: '18px 20px' }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#1A1A1A', marginBottom: 14 }}>Labor vs Parts</div>
          <div style={{ display: 'flex', height: 12, borderRadius: 99, overflow: 'hidden', marginBottom: 12 }}>
            <div style={{ flex: labor, background: '#2563EB' }} />
            <div style={{ flex: parts, background: '#7E22CE' }} />
            <div style={{ flex: Math.max(0, gross - labor - parts), background: '#E5E7EB' }} />
          </div>
          {[
            { label: 'Labor', value: labor, color: '#2563EB', pct: laborPct },
            { label: 'Parts', value: parts, color: '#7E22CE', pct: partsPct },
            { label: 'Other', value: gross - labor - parts, color: '#9CA3AF', pct: 100 - laborPct - partsPct },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: r.color }} />
                <span style={{ fontSize: 13, color: '#374151' }}>{r.label}</span>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>{r.pct.toFixed(1)}%</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', minWidth: 80, textAlign: 'right' }}>{fmtMoney(r.value)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue by tech */}
        <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', padding: '18px 20px' }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#1A1A1A', marginBottom: 14 }}>Revenue by Technician</div>
          {byTech.map(t => (
            <div key={t.initials} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 99, background: '#FDEDEC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#C0392B', flexShrink: 0 }}>{t.initials}</div>
              <div style={{ width: 80, fontSize: 12, color: '#374151', flexShrink: 0 }}>{t.name}</div>
              <div style={{ flex: 1, height: 8, background: '#F3F4F6', borderRadius: 99 }}>
                <div style={{ height: '100%', borderRadius: 99, background: '#C0392B', width: `${(t.rev / maxTechRev) * 100}%` }} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A', minWidth: 70, textAlign: 'right' }}>{fmtK(t.rev * 100)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue by service */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', fontWeight: 700, fontSize: 13, color: '#1A1A1A' }}>Revenue by Service Type</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              {['Service', 'Jobs', 'Avg Ticket', 'Labor Split', 'Parts Split', 'Total Revenue'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.03em', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...REVENUE_BY_SERVICE].sort((a, b) => b.revenue - a.revenue).map((r, i) => (
              <tr key={r.serviceType} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA', borderBottom: '1px solid #F3F4F6' }}>
                <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>{r.serviceType}</td>
                <td style={{ padding: '11px 16px', fontSize: 13, color: '#6B7280' }}>{r.jobCount}</td>
                <td style={{ padding: '11px 16px', fontSize: 13, color: '#374151' }}>{fmtMoney(r.avgTicket * 100)}</td>
                <td style={{ padding: '11px 16px', fontSize: 12, color: '#2563EB' }}>{(r.laborSplit * 100).toFixed(0)}%</td>
                <td style={{ padding: '11px 16px', fontSize: 12, color: '#7E22CE' }}>{(r.partsSplit * 100).toFixed(0)}%</td>
                <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>{fmtMoney(r.revenue * 100)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Refunds */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#1A1A1A' }}>Refunds</div>
          <span style={{ fontSize: 12, color: '#DC2626', fontWeight: 600 }}>{REFUNDS.length} total · {fmtMoney(REFUNDS.reduce((s, r) => s + r.amount, 0) * 100)}</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              {['Date', 'Customer', 'Service', 'Tech', 'Reason', 'Amount'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.03em', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {REFUNDS.map((r, i) => (
              <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA', borderBottom: '1px solid #F3F4F6' }}>
                <td style={{ padding: '11px 16px', fontSize: 12, color: '#9CA3AF' }}>{r.date}</td>
                <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>{r.customerName}</td>
                <td style={{ padding: '11px 16px', fontSize: 13, color: '#374151' }}>{r.service}</td>
                <td style={{ padding: '11px 16px', fontSize: 13, color: '#6B7280' }}>{r.techName}</td>
                <td style={{ padding: '11px 16px', fontSize: 12, color: '#6B7280' }}>{r.reason}</td>
                <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 700, color: '#DC2626' }}>({fmtMoney(r.amount * 100)})</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reconciliation */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', fontWeight: 700, fontSize: 13, color: '#1A1A1A', display: 'flex', alignItems: 'center', gap: 10 }}>
          <FileText size={14} />
          Month-End Reconciliation
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              {['Period', 'Description', 'Shop Revenue', 'Stripe Payout', 'Platform Fee', 'Stripe Fee', 'Match'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.03em', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RECONCILIATION.map((r, i) => (
              <tr key={r.date} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA', borderBottom: '1px solid #F3F4F6' }}>
                <td style={{ padding: '11px 16px', fontSize: 12, color: '#9CA3AF' }}>{r.date}</td>
                <td style={{ padding: '11px 16px', fontSize: 13, color: '#374151' }}>{r.description}</td>
                <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>{fmtMoney(r.shopRevenue)}</td>
                <td style={{ padding: '11px 16px', fontSize: 13, color: '#374151' }}>{fmtMoney(r.stripePayout)}</td>
                <td style={{ padding: '11px 16px', fontSize: 12, color: '#C0392B' }}>{fmtMoney(r.platformFee)}</td>
                <td style={{ padding: '11px 16px', fontSize: 12, color: '#6B7280' }}>{fmtMoney(r.stripeFee)}</td>
                <td style={{ padding: '11px 16px' }}>
                  {r.matched
                    ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#15803D', fontSize: 12, fontWeight: 600 }}><CheckCircle size={13} /> Matched</span>
                    : <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#D97706', fontSize: 12, fontWeight: 600 }}><XCircle size={13} /> Pending</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { TrendingUp, Mail, MessageSquare, ChevronDown, ChevronRight } from 'lucide-react';
import { CAMPAIGN_STATS } from './mockData';

function fmtMoney(n: number) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function pct(num: number, den: number) {
  return den > 0 ? `${((num / den) * 100).toFixed(1)}%` : '—';
}

function TrendSparkline({ values, color = '#C0392B' }: { values: number[]; color?: string }) {
  const w = 80, h = 28;
  if (values.length < 2) return null;
  const mn = Math.min(...values), mx = Math.max(...values), rng = mx - mn || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - mn) / rng) * (h - 4) - 2}`).join(' ');
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function StatusPill({ status }: { status: string }) {
  const MAP: Record<string, { bg: string; color: string }> = {
    draft:     { bg: '#F3F4F6', color: '#6B7280' },
    scheduled: { bg: '#FEF3C7', color: '#D97706' },
    sending:   { bg: '#EFF6FF', color: '#2563EB' },
    sent:      { bg: '#F0FDF4', color: '#15803D' },
    paused:    { bg: '#FEF3C7', color: '#D97706' },
    cancelled: { bg: '#FEF2F2', color: '#DC2626' },
  };
  const s = MAP[status] ?? MAP.draft;
  return (
    <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color }}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function DeliveryDetails({ campaign }: { campaign: typeof CAMPAIGN_STATS[0] }) {
  const recipients = [
    { name: 'James Wilson', email: 'j.wilson@email.com', status: 'opened', time: '10m ago' },
    { name: 'Priya Nair',   email: 'priya.n@email.com',  status: 'clicked', time: '22m ago' },
    { name: 'Sarah Miller', email: 's.miller@email.com', status: 'delivered', time: '1h ago' },
    { name: 'Tom Brandt',   email: 't.brandt@email.com', status: 'bounced', time: '2h ago' },
    { name: 'Ana Lopez',    email: 'ana.l@email.com',    status: 'unsubscribed', time: '3h ago' },
  ];
  const statusColors: Record<string, { bg: string; color: string }> = {
    opened:       { bg: '#EFF6FF', color: '#2563EB' },
    clicked:      { bg: '#F0FDF4', color: '#15803D' },
    delivered:    { bg: '#F3F4F6', color: '#6B7280' },
    bounced:      { bg: '#FEF2F2', color: '#DC2626' },
    unsubscribed: { bg: '#FEF3C7', color: '#D97706' },
  };
  return (
    <div style={{ padding: '0 16px 14px', background: '#FAFAFA', borderTop: '1px solid #F3F4F6' }}>
      <div style={{ paddingTop: 14, fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
        Per-Recipient Delivery Status (sample)
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['Name', 'Email/Phone', 'Status', 'Time'].map(h => (
              <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {recipients.map((r, i) => {
            const sc = statusColors[r.status] ?? statusColors.delivered;
            return (
              <tr key={i} style={{ borderTop: '1px solid #E5E7EB' }}>
                <td style={{ padding: '8px 10px', fontSize: 12, fontWeight: 500, color: '#1A1A1A' }}>{r.name}</td>
                <td style={{ padding: '8px 10px', fontSize: 11, color: '#9CA3AF' }}>{r.email}</td>
                <td style={{ padding: '8px 10px' }}>
                  <span style={{ padding: '1px 7px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: sc.bg, color: sc.color }}>
                    {r.status}
                  </span>
                </td>
                <td style={{ padding: '8px 10px', fontSize: 11, color: '#9CA3AF' }}>{r.time}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function MarketingReports() {
  const [channelFilter, setChannelFilter] = useState<'all' | 'email' | 'sms'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = CAMPAIGN_STATS.filter(c => channelFilter === 'all' || c.channel === channelFilter);

  const totalSent       = CAMPAIGN_STATS.reduce((s, c) => s + c.recipients, 0);
  const totalOpens      = CAMPAIGN_STATS.reduce((s, c) => s + c.opens, 0);
  const totalClicks     = CAMPAIGN_STATS.reduce((s, c) => s + c.clicks, 0);
  const totalBookings   = CAMPAIGN_STATS.reduce((s, c) => s + c.attributedBookings, 0);
  const totalRevenue    = CAMPAIGN_STATS.reduce((s, c) => s + c.attributedRevenue, 0);
  const totalOptOuts    = CAMPAIGN_STATS.reduce((s, c) => s + c.optOuts, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {[
          { label: 'Total Recipients', value: totalSent.toLocaleString(), sub: `${CAMPAIGN_STATS.length} campaigns` },
          { label: 'Avg Open Rate', value: pct(totalOpens, totalSent), sub: `${totalOpens.toLocaleString()} opens` },
          { label: 'Avg Click Rate', value: pct(totalClicks, totalSent), sub: `${totalClicks.toLocaleString()} clicks` },
          { label: 'Attributed Bookings', value: totalBookings.toString(), sub: `${pct(totalBookings, totalSent)} booking rate` },
          { label: 'Attributed Revenue', value: fmtMoney(totalRevenue), sub: `${fmtMoney(Math.round(totalRevenue / Math.max(totalBookings, 1)))} avg per booking` },
          { label: 'Opt-Outs', value: totalOptOuts.toString(), sub: `${pct(totalOptOuts, totalSent)} opt-out rate` },
        ].map(k => (
          <div key={k.label} style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '14px 18px', background: '#fff' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 24, color: '#1A1A1A' }}>{k.value}</div>
            <div style={{ fontSize: 11, color: '#6B7280', marginTop: 3 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Channel filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#6B7280' }}>Channel:</span>
        {(['all', 'email', 'sms'] as const).map(c => (
          <button key={c} onClick={() => setChannelFilter(c)} style={{ padding: '5px 12px', borderRadius: 99, border: '1px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: channelFilter === c ? '#C0392B' : '#fff', color: channelFilter === c ? '#fff' : '#6B7280', borderColor: channelFilter === c ? '#C0392B' : '#E5E7EB' }}>
            {c === 'all' ? 'All' : c === 'email' ? 'Email' : 'SMS'}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6B7280' }}><Mail size={12} /> {CAMPAIGN_STATS.filter(c => c.channel === 'email').length} email</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6B7280' }}><MessageSquare size={12} /> {CAMPAIGN_STATS.filter(c => c.channel === 'sms').length} SMS</div>
        </div>
      </div>

      {/* Campaign table */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', fontWeight: 700, fontSize: 13, color: '#1A1A1A' }}>Campaign Performance</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              {['', 'Campaign', 'Channel', 'Status', 'Sent', 'Open %', 'Click %', 'Bookings', 'Revenue', '7-Day Trend'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.03em', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => {
              const isOpen = expanded === c.id;
              return (
                <React.Fragment key={c.id}>
                  <tr
                    onClick={() => setExpanded(isOpen ? null : c.id)}
                    style={{ background: isOpen ? '#FFFBEB' : i % 2 === 0 ? '#fff' : '#FAFAFA', borderBottom: isOpen ? 'none' : '1px solid #F3F4F6', cursor: 'pointer' }}
                  >
                    <td style={{ padding: '10px 14px', width: 24 }}>
                      {isOpen ? <ChevronDown size={13} color="#9CA3AF" /> : <ChevronRight size={13} color="#9CA3AF" />}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>{c.name}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: c.channel === 'email' ? '#2563EB' : '#7E22CE' }}>
                        {c.channel === 'email' ? <Mail size={12} /> : <MessageSquare size={12} />}
                        {c.channel.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px' }}><StatusPill status={c.status} /></td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#6B7280' }}>{c.recipients.toLocaleString()}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#374151' }}>{pct(c.opens, c.recipients)}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#374151' }}>{pct(c.clicks, c.recipients)}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#374151' }}>{c.attributedBookings}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, color: c.attributedRevenue > 0 ? '#15803D' : '#9CA3AF' }}>
                      {c.attributedRevenue > 0 ? fmtMoney(c.attributedRevenue) : '—'}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <TrendSparkline values={c.trend} color={c.channel === 'email' ? '#2563EB' : '#7E22CE'} />
                    </td>
                  </tr>
                  {isOpen && (
                    <tr>
                      <td colSpan={10} style={{ padding: 0, borderBottom: '1px solid #E5E7EB' }}>
                        <DeliveryDetails campaign={c} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Opt-out notice */}
      <div style={{ padding: '12px 16px', borderRadius: 8, background: '#FFFBEB', border: '1px solid #FDE68A', fontSize: 12, color: '#92400E', display: 'flex', alignItems: 'center', gap: 8 }}>
        <TrendingUp size={14} />
        <span>Opt-out rate {pct(totalOptOuts, totalSent)} — below 0.5% industry threshold. TCPA compliance check: all campaigns sent during permitted hours.</span>
      </div>
    </div>
  );
}

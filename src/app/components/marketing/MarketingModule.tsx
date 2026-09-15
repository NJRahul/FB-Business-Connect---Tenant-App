import React, { useState, Component } from 'react';
import {
  Users, Filter, Megaphone, Star, Gift, Plug, LayoutDashboard,
  CheckCircle, AlertTriangle,
} from 'lucide-react';

class ErrorBoundary extends Component<{ children: React.ReactNode }, { error: string | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, margin: 24 }}>
          <div style={{ fontWeight: 700, color: '#DC2626', marginBottom: 8 }}>Render error</div>
          <pre style={{ fontSize: 12, color: '#991B1B', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{this.state.error}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
import { CustomersView } from './CustomersView';
import { SegmentsView } from './SegmentsView';
import { CampaignsView } from './CampaignsView';
import ReviewsView from './ReviewsView';
import ReferralsView from './ReferralsView';
import IntegrationsView from './IntegrationsView';
import { CUSTOMERS, SEGMENTS, CAMPAIGNS, REVIEWS, REFERRAL_CODES, GBP_CONNECTIONS, LSA_CONNECTIONS } from './mockData';

const TABS = [
  { id: 'overview',      label: 'Overview',      icon: LayoutDashboard },
  { id: 'customers',     label: 'Customers',      icon: Users },
  { id: 'segments',      label: 'Segments',       icon: Filter },
  { id: 'campaigns',     label: 'Campaigns',      icon: Megaphone },
  { id: 'reviews',       label: 'Reviews',        icon: Star },
  { id: 'referrals',     label: 'Referrals',      icon: Gift },
  { id: 'integrations',  label: 'Integrations',   icon: Plug },
] as const;
type Tab = typeof TABS[number]['id'];

function OverviewDashboard() {
  const totalCustomers = CUSTOMERS.length;
  const emailOptIn = CUSTOMERS.filter(c => c.emailOptIn).length;
  const smsOptIn = CUSTOMERS.filter(c => c.smsOptIn).length;
  const totalLtv = CUSTOMERS.reduce((s, c) => s + c.ltv, 0);
  const activeCampaigns = CAMPAIGNS.filter(c => c.status === 'sending' || c.status === 'scheduled').length;
  const sentCampaigns = CAMPAIGNS.filter(c => c.status === 'sent');
  const totalRevenue = sentCampaigns.reduce((s, c) => s + c.revenue, 0);
  const avgRating = REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length;
  const pendingResponses = REVIEWS.filter(r => !r.staffResponse).length;
  const gbpConnected = GBP_CONNECTIONS.filter(g => g.connected).length;
  const lsaConnected = LSA_CONNECTIONS.filter(l => l.connected).length;
  const lsaRevenue = LSA_CONNECTIONS.reduce((s, l) => s + l.attributedRevenue, 0);

  const alerts: { msg: string; level: 'warn' | 'info' }[] = [];
  if (pendingResponses > 0) alerts.push({ msg: `${pendingResponses} review${pendingResponses > 1 ? 's' : ''} awaiting staff response`, level: 'warn' });
  if (CAMPAIGNS.some(c => c.status === 'sending')) alerts.push({ msg: 'Post-visit review campaign is actively sending', level: 'info' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Alert banners */}
      {alerts.map(a => (
        <div key={a.msg} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', borderRadius: 8,
          background: a.level === 'warn' ? '#FFFBEB' : '#EFF6FF',
          border: `1px solid ${a.level === 'warn' ? '#FDE68A' : '#BFDBFE'}`,
          color: a.level === 'warn' ? '#92400E' : '#1E40AF',
        }}>
          {a.level === 'warn' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
          <span style={{ fontSize: 13, fontWeight: 500 }}>{a.msg}</span>
        </div>
      ))}

      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'Total Customers', value: totalCustomers, sub: `${emailOptIn} email · ${smsOptIn} SMS opted-in` },
          { label: 'Customer LTV', value: `R ${totalLtv.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, sub: 'combined lifetime value' },
          { label: 'Active Campaigns', value: activeCampaigns, sub: `${sentCampaigns.length} sent · R ${totalRevenue.toLocaleString()} attributed` },
          { label: 'Avg Review Rating', value: avgRating.toFixed(1) + ' ★', sub: `${REVIEWS.length} total reviews` },
        ].map(s => (
          <div key={s.label} style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 20px', background: '#fff' }}>
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 26, color: '#1A1A1A' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Module cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          {
            icon: Users, title: 'Customer Database',
            lines: [`${totalCustomers} customers`, `${CUSTOMERS.filter(c => c.idMeStatus === 'verified').length} ID.me verified`],
            color: '#2563EB', bg: '#EFF6FF',
          },
          {
            icon: Filter, title: 'Segments',
            lines: [`${SEGMENTS.length} segments`, `${SEGMENTS.filter(s => s.isTemplate).length} templates · ${SEGMENTS.filter(s => !s.isTemplate).length} custom`],
            color: '#7E22CE', bg: '#FDF4FF',
          },
          {
            icon: Megaphone, title: 'Campaigns',
            lines: [`${activeCampaigns} active`, `R ${totalRevenue.toLocaleString()} attributed revenue`],
            color: '#00A9AC', bg: '#E6F7F7',
          },
          {
            icon: Star, title: 'Reviews',
            lines: [`${avgRating.toFixed(1)} avg · ${REVIEWS.length} reviews`, `${pendingResponses} pending response`],
            color: '#D97706', bg: '#FEF3C7',
          },
          {
            icon: Gift, title: 'Referrals',
            lines: [`${REFERRAL_CODES.length} active codes`, `${REFERRAL_CODES.reduce((s, r) => s + r.conversions, 0)} total conversions`],
            color: '#15803D', bg: '#F0FDF4',
          },
          {
            icon: Plug, title: 'Integrations',
            lines: [`${gbpConnected} GBP · ${lsaConnected} LSA connected`, `R ${lsaRevenue.toLocaleString()} LSA attributed revenue`],
            color: '#0F766E', bg: '#F0FDFA',
          },
        ].map(m => (
          <div key={m.title} style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '18px 20px', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <m.icon size={18} color={m.color} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1A1A1A' }}>{m.title}</div>
            </div>
            {m.lines.map(l => (
              <div key={l} style={{ fontSize: 13, color: '#6B7280', marginBottom: 3 }}>{l}</div>
            ))}
          </div>
        ))}
      </div>

      {/* Recent campaigns */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', fontWeight: 700, fontSize: 14, color: '#1A1A1A' }}>Recent Campaigns</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              {['Name', 'Status', 'Sent', 'Opens', 'Bookings', 'Revenue'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CAMPAIGNS.slice(0, 4).map((c, i) => {
              const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
                draft:     { color: '#6B7280', bg: '#F3F4F6' },
                scheduled: { color: '#D97706', bg: '#FEF3C7' },
                sending:   { color: '#2563EB', bg: '#EFF6FF' },
                sent:      { color: '#15803D', bg: '#F0FDF4' },
                paused:    { color: '#D97706', bg: '#FEF3C7' },
                cancelled: { color: '#DC2626', bg: '#FEF2F2' },
              };
              const sc = STATUS_COLORS[c.status] ?? { color: '#6B7280', bg: '#F3F4F6' };
              return (
                <tr key={c.id} style={{ background: i % 2 === 0 ? '#fff' : '#F9FAFB' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#1A1A1A', fontWeight: 500 }}>{c.name}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: sc.bg, color: sc.color }}>
                      {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#6B7280' }}>{c.sent}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#6B7280' }}>
                    {c.sent > 0 ? `${Math.round(c.opens / c.sent * 100)}%` : '—'}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#6B7280' }}>{c.bookings}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: c.revenue > 0 ? '#15803D' : '#9CA3AF' }}>
                    {c.revenue > 0 ? `R ${c.revenue.toLocaleString()}` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function MarketingModule() {
  const [tab, setTab] = useState<Tab>('overview');

  const badgeCounts: Record<string, number> = {
    reviews: REVIEWS.filter(r => !r.staffResponse).length,
    campaigns: CAMPAIGNS.filter(c => c.status === 'sending' || c.status === 'scheduled').length,
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1A1A1A' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 26, color: '#1A1A1A' }}>
          Marketing
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6B7280' }}>
          Campaigns, segments, reviews, referrals, and integrations for shop-1
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #E5E7EB', marginBottom: 28 }}>
        {TABS.map(t => {
          const badge = badgeCounts[t.id];
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: 13,
                color: tab === t.id ? '#00A9AC' : '#6B7280',
                borderBottom: tab === t.id ? '2px solid #00A9AC' : '2px solid transparent',
                marginBottom: -2, position: 'relative',
              }}
            >
              <t.icon size={15} />
              {t.label}
              {(badge ?? 0) > 0 && (
                <span style={{
                  minWidth: 18, height: 18, borderRadius: 99, background: '#00A9AC', color: '#fff',
                  fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 5px',
                }}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <ErrorBoundary key={tab}>
        {tab === 'overview'     && <OverviewDashboard />}
        {tab === 'customers'    && <CustomersView />}
        {tab === 'segments'     && <SegmentsView />}
        {tab === 'campaigns'    && <CampaignsView />}
        {tab === 'reviews'      && <ReviewsView />}
        {tab === 'referrals'    && <ReferralsView />}
        {tab === 'integrations' && <IntegrationsView />}
      </ErrorBoundary>
    </div>
  );
}

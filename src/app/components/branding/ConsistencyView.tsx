import React from 'react';
import { CheckCircle, Zap, Package } from 'lucide-react';
import { TOUCHPOINTS } from './mockData';

export function ConsistencyView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Touchpoints grid */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', fontWeight: 700, fontSize: 13, color: '#1A1A1A' }}>
          Brand Touchpoints
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
          {TOUCHPOINTS.map((tp, i) => (
            <div key={tp.area} style={{ padding: '16px 18px', borderRight: i % 3 !== 2 ? '1px solid #F3F4F6' : 'none', borderBottom: i < TOUCHPOINTS.length - 3 ? '1px solid #F3F4F6' : 'none' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{tp.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#1A1A1A', marginBottom: 8 }}>{tp.area}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {tp.pages.map(p => (
                  <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6B7280' }}>
                    <CheckCircle size={11} color="#15803D" />
                    {p}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Branding elements per touchpoint */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', fontWeight: 700, fontSize: 13, color: '#1A1A1A' }}>
          What Brand Elements Appear Where
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              {['Touchpoint', 'Logo', 'Primary Color', 'Footer Copy', 'Sender Name', '"Powered by" (Starter only)'].map(h => (
                <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.03em', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Storefront',       logo: true,  color: true,  footer: true,  sender: false, powered: true  },
              { name: 'Customer Emails',  logo: true,  color: true,  footer: false, sender: true,  powered: true  },
              { name: 'SMS Messages',     logo: false, color: false, footer: false, sender: true,  powered: false },
              { name: 'PDF Invoices',     logo: true,  color: true,  footer: true,  sender: false, powered: false },
              { name: 'Account Portal',   logo: true,  color: true,  footer: true,  sender: false, powered: true  },
              { name: 'Tech Arrival SMS', logo: false, color: false, footer: false, sender: true,  powered: false },
            ].map((row, i) => {
              const tick = (v: boolean) => v
                ? <CheckCircle size={14} color="#15803D" />
                : <span style={{ fontSize: 12, color: '#D1D5DB' }}>—</span>;
              return (
                <tr key={row.name} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA', borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>{row.name}</td>
                  <td style={{ padding: '11px 14px' }}>{tick(row.logo)}</td>
                  <td style={{ padding: '11px 14px' }}>{tick(row.color)}</td>
                  <td style={{ padding: '11px 14px' }}>{tick(row.footer)}</td>
                  <td style={{ padding: '11px 14px' }}>{tick(row.sender)}</td>
                  <td style={{ padding: '11px 14px' }}>{tick(row.powered)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Frontend bundle delivery */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', fontWeight: 700, fontSize: 13, color: '#1A1A1A', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Package size={14} />
          Frontend Bundle Delivery
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          {[
            {
              title: 'Multi-Tenant Runtime (not build-time)',
              desc: 'A single shared bundle serves all tenants. Branding (colors, logo, copy) is fetched at runtime via a lightweight tenant config API call. No per-tenant builds exist.',
              icon: '⚡',
              color: '#2563EB',
              bg: '#EFF6FF',
            },
            {
              title: 'Route-Based Code Splitting',
              desc: 'Each industry pack (bookings, field-service, storefront) ships as its own JS chunk. The shell loads only the chunks for packs the tenant has enabled.',
              icon: '🔀',
              color: '#7E22CE',
              bg: '#FDF4FF',
            },
            {
              title: 'Per-Pack Chunk Size Limit',
              desc: 'Each pack chunk must stay ≤100 KB gzipped. CI runs a bundle-size check on every PR and fails the build if any pack chunk regresses over the limit.',
              icon: '📦',
              color: '#D97706',
              bg: '#FEF3C7',
            },
            {
              title: 'CSS Sandboxing',
              desc: 'Custom CSS entered by the shop admin is scoped to the storefront only. A unique per-tenant CSS class prefix prevents bleed into the admin UI or other tenants.',
              icon: '🛡️',
              color: '#15803D',
              bg: '#F0FDF4',
            },
          ].map((item, i) => (
            <div key={item.title} style={{ padding: '18px 20px', borderRight: i % 2 === 0 ? '1px solid #F3F4F6' : 'none', borderBottom: i < 2 ? '1px solid #F3F4F6' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                  {item.icon}
                </div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#1A1A1A' }}>{item.title}</div>
              </div>
              <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bundle health */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', padding: '18px 20px' }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: '#1A1A1A', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={14} />
          Current Pack Chunk Sizes
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { name: 'Storefront shell',    gzip: 22, limit: 100, enabled: true  },
            { name: 'Booking / Schedule',  gzip: 67, limit: 100, enabled: true  },
            { name: 'Field Service PWA',   gzip: 84, limit: 100, enabled: true  },
            { name: 'Distributor catalog', gzip: 51, limit: 100, enabled: true  },
            { name: 'Marketing widgets',   gzip: 38, limit: 100, enabled: false },
          ].map(chunk => {
            const pct = (chunk.gzip / chunk.limit) * 100;
            const color = pct >= 90 ? '#DC2626' : pct >= 75 ? '#D97706' : '#15803D';
            return (
              <div key={chunk.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 160, fontSize: 12, fontWeight: 500, color: chunk.enabled ? '#374151' : '#9CA3AF', flexShrink: 0 }}>{chunk.name}</div>
                <div style={{ flex: 1, height: 8, background: '#F3F4F6', borderRadius: 99 }}>
                  <div style={{ height: '100%', borderRadius: 99, background: chunk.enabled ? color : '#D1D5DB', width: `${pct}%`, transition: 'width 0.5s' }} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: chunk.enabled ? color : '#9CA3AF', minWidth: 70, textAlign: 'right' }}>
                  {chunk.gzip} KB / {chunk.limit} KB
                </div>
                <div style={{ fontSize: 11, color: chunk.enabled ? '#15803D' : '#9CA3AF', minWidth: 60 }}>
                  {chunk.enabled ? '● Enabled' : '○ Disabled'}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 12, fontSize: 11, color: '#9CA3AF' }}>
          CI fails on any chunk exceeding 100 KB gzipped. Sizes measured at last production deploy.
        </div>
      </div>
    </div>
  );
}

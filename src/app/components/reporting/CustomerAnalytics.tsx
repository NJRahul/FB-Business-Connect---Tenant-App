import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { CUSTOMER_STATS, COHORT_DATA } from './mockData';

function fmtMoney(n: number) {
  return `R ${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function TagPill({ tag }: { tag: string }) {
  const MAP: Record<string, { bg: string; color: string }> = {
    'vip':        { bg: '#FEF3C7', color: '#D97706' },
    'at-risk':    { bg: '#F0FBFB', color: '#DC2626' },
    'loyal':      { bg: '#F0FDF4', color: '#15803D' },
    'new':        { bg: '#EFF6FF', color: '#2563EB' },
    'lapsed':     { bg: '#F3F4F6', color: '#6B7280' },
    'fleet':      { bg: '#FDF4FF', color: '#7E22CE' },
    'military':   { bg: '#ECFDF5', color: '#0F766E' },
    'id.me':      { bg: '#ECFDF5', color: '#0F766E' },
  };
  const s = MAP[tag] ?? { bg: '#F3F4F6', color: '#6B7280' };
  return (
    <span style={{ padding: '1px 7px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: s.bg, color: s.color }}>
      {tag}
    </span>
  );
}

function heatColor(pct: number) {
  if (pct >= 80) return { bg: '#15803D', color: '#fff' };
  if (pct >= 60) return { bg: '#4ADE80', color: '#14532D' };
  if (pct >= 40) return { bg: '#BEF264', color: '#365314' };
  if (pct >= 20) return { bg: '#FEF08A', color: '#713F12' };
  if (pct > 0)  return { bg: '#80D4D5', color: '#7F1D1D' };
  return { bg: '#F3F4F6', color: '#9CA3AF' };
}

function CohortHeatmap() {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', minWidth: 500 }}>
        <thead>
          <tr>
            <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', minWidth: 100 }}>Cohort</th>
            <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#6B7280' }}>Size</th>
            {['M0', 'M1', 'M2', 'M3', 'M4', 'M5'].map(m => (
              <th key={m} style={{ padding: '8px 12px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#6B7280' }}>{m}</th>
            ))}
            <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: '#6B7280' }}>Rev/Head</th>
          </tr>
        </thead>
        <tbody>
          {COHORT_DATA.map(row => (
            <tr key={row.cohortMonth}>
              <td style={{ padding: '8px 12px', fontSize: 12, fontWeight: 500, color: '#374151' }}>{row.cohortMonth}</td>
              <td style={{ padding: '8px 12px', textAlign: 'center', fontSize: 12, color: '#6B7280' }}>{row.cohortSize}</td>
              {row.retention.map((r, i) => {
                const hc = heatColor(r);
                return (
                  <td key={i} style={{ padding: '6px 8px', textAlign: 'center' }}>
                    <span style={{ display: 'inline-block', minWidth: 42, padding: '3px 6px', borderRadius: 5, fontSize: 11, fontWeight: 700, background: hc.bg, color: hc.color }}>
                      {r > 0 ? `${r}%` : '—'}
                    </span>
                  </td>
                );
              })}
              <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>{fmtMoney(row.revenuePerHead[row.revenuePerHead.length - 1])}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'flex', gap: 10, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: '#6B7280', marginRight: 4 }}>Retention:</span>
        {[
          { label: '80%+', ...heatColor(90) },
          { label: '60–79%', ...heatColor(70) },
          { label: '40–59%', ...heatColor(50) },
          { label: '20–39%', ...heatColor(30) },
          { label: '1–19%',  ...heatColor(10) },
          { label: '0%',     ...heatColor(0) },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: 3, background: l.bg }} />
            <span style={{ fontSize: 10, color: '#6B7280' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CustomerAnalytics() {
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [sort, setSort] = useState<'ltv' | 'aov' | 'visits' | 'days'>('ltv');
  const currentPlan = 'pro';

  const allTags = Array.from(new Set(CUSTOMER_STATS.flatMap(c => c.tags)));

  const filtered = CUSTOMER_STATS
    .filter(c => {
      const q = search.toLowerCase();
      return (!q || c.name.toLowerCase().includes(q)) && (!tagFilter || c.tags.includes(tagFilter));
    })
    .sort((a, b) => {
      if (sort === 'ltv')   return b.ltv - a.ltv;
      if (sort === 'aov')   return b.aov - a.aov;
      if (sort === 'visits') return b.visitCount - a.visitCount;
      return b.daysSinceLast - a.daysSinceLast;
    });

  const cohortLocked = currentPlan === 'starter';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: 'Total Customers', value: CUSTOMER_STATS.length.toString() },
          { label: 'Avg LTV', value: fmtMoney(CUSTOMER_STATS.reduce((s, c) => s + c.ltv, 0) / CUSTOMER_STATS.length) },
          { label: 'Avg AOV', value: fmtMoney(CUSTOMER_STATS.reduce((s, c) => s + c.aov, 0) / CUSTOMER_STATS.length) },
          { label: 'Email Opt-In', value: `${CUSTOMER_STATS.filter(c => c.emailOptIn).length} / ${CUSTOMER_STATS.length}` },
        ].map(k => (
          <div key={k.label} style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '14px 18px', background: '#fff' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 26, color: '#1A1A1A' }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search customers…"
          style={{ padding: '7px 12px', borderRadius: 7, border: '1px solid #E5E7EB', fontSize: 13, color: '#1A1A1A', minWidth: 200, outline: 'none' }}
        />
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          <button onClick={() => setTagFilter(null)} style={{ padding: '4px 10px', borderRadius: 99, border: '1px solid', fontSize: 11, fontWeight: 600, cursor: 'pointer', background: !tagFilter ? '#00A9AC' : '#fff', color: !tagFilter ? '#fff' : '#6B7280', borderColor: !tagFilter ? '#00A9AC' : '#E5E7EB' }}>All</button>
          {allTags.map(t => (
            <button key={t} onClick={() => setTagFilter(tagFilter === t ? null : t)} style={{ padding: '4px 10px', borderRadius: 99, border: '1px solid', fontSize: 11, fontWeight: 600, cursor: 'pointer', background: tagFilter === t ? '#00A9AC' : '#fff', color: tagFilter === t ? '#fff' : '#6B7280', borderColor: tagFilter === t ? '#00A9AC' : '#E5E7EB' }}>{t}</button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: '#6B7280' }}>Sort:</span>
          {(['ltv', 'aov', 'visits', 'days'] as const).map(s => (
            <button key={s} onClick={() => setSort(s)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid', fontSize: 11, fontWeight: 600, cursor: 'pointer', background: sort === s ? '#1A1A1A' : '#fff', color: sort === s ? '#fff' : '#6B7280', borderColor: sort === s ? '#1A1A1A' : '#E5E7EB' }}>
              {s === 'ltv' ? 'LTV' : s === 'aov' ? 'AOV' : s === 'visits' ? 'Visits' : 'Recency'}
            </button>
          ))}
        </div>
      </div>

      {/* Customer table */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              {['Customer', 'LTV', 'AOV', 'Visits', 'Last Visit', 'Engagement', 'Tags', 'Channels'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.03em', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => {
              const engPct = Math.round(c.engagementRate * 100);
              return (
                <tr key={c.customerId} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA', borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>{c.name}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>{fmtMoney(c.ltv)}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#374151' }}>{fmtMoney(c.aov)}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#6B7280' }}>{c.visitCount}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: c.daysSinceLast > 90 ? '#DC2626' : '#6B7280' }}>
                    {c.lastVisit} <span style={{ color: '#9CA3AF' }}>({c.daysSinceLast}d)</span>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 60, height: 5, background: '#F3F4F6', borderRadius: 99 }}>
                        <div style={{ height: '100%', borderRadius: 99, background: engPct >= 70 ? '#15803D' : engPct >= 40 ? '#D97706' : '#DC2626', width: `${engPct}%` }} />
                      </div>
                      <span style={{ fontSize: 11, color: '#6B7280' }}>{engPct}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {c.tags.map(t => <TagPill key={t} tag={t} />)}
                    </div>
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 11 }}>
                    <span style={{ color: c.emailOptIn ? '#15803D' : '#9CA3AF' }}>✉ </span>
                    <span style={{ color: c.smsOptIn ? '#15803D' : '#9CA3AF' }}>✆</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cohort analysis */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#1A1A1A' }}>Cohort Retention Analysis</div>
          {cohortLocked && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#D97706', background: '#FEF3C7', padding: '3px 10px', borderRadius: 99 }}>
              <Lock size={11} /> Pro / Enterprise
            </span>
          )}
        </div>
        <div style={{ padding: '16px 20px', position: 'relative' }}>
          {cohortLocked && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, borderRadius: 8 }}>
              <div style={{ textAlign: 'center' }}>
                <Lock size={24} color="#D97706" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1A1A1A' }}>Cohort Analysis — Pro Plan</div>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>Upgrade to track month-over-month customer retention</div>
              </div>
            </div>
          )}
          <CohortHeatmap />
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, Camera, FileText, Settings, Plus } from 'lucide-react';
import { ROAD_HAZARD_CONFIG, ROAD_HAZARD_WARRANTIES, WARRANTY_CLAIMS, CLAIM_STATS } from './mockData';
import type { WarrantyStatus, ClaimStatus, CoverageType } from './types';

function WarrantyStatusBadge({ status }: { status: WarrantyStatus }) {
  const map: Record<WarrantyStatus, { label: string; color: string; bg: string }> = {
    active:  { label: 'Active',   color: '#16A34A', bg: '#F0FDF4' },
    expired: { label: 'Expired',  color: '#9CA3AF', bg: '#F3F4F6' },
    claimed: { label: 'Claimed',  color: '#2563EB', bg: '#EFF6FF' },
    voided:  { label: 'Voided',   color: '#DC2626', bg: '#FEF2F2' },
  };
  const s = map[status];
  return <span style={{ padding: '2px 8px', borderRadius: 99, background: s.bg, color: s.color, fontSize: 11, fontWeight: 600 }}>{s.label}</span>;
}

function ClaimStatusBadge({ status }: { status: ClaimStatus }) {
  const map: Record<ClaimStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    open:         { label: 'Open',         color: '#2563EB', bg: '#EFF6FF', icon: <Clock size={10} /> },
    under_review: { label: 'Under Review', color: '#D97706', bg: '#FFFBEB', icon: <AlertTriangle size={10} /> },
    approved:     { label: 'Approved',     color: '#16A34A', bg: '#F0FDF4', icon: <CheckCircle size={10} /> },
    denied:       { label: 'Denied',       color: '#DC2626', bg: '#FEF2F2', icon: <XCircle size={10} /> },
    resolved:     { label: 'Resolved',     color: '#6B7280', bg: '#F3F4F6', icon: <CheckCircle size={10} /> },
  };
  const s = map[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 99, background: s.bg, color: s.color, fontSize: 11, fontWeight: 600 }}>
      {s.icon}{s.label}
    </span>
  );
}

function CoverageLabel({ type }: { type: CoverageType }) {
  const map: Record<CoverageType, string> = {
    free_replacement: 'Free Replacement',
    prorated:         'Prorated',
    mileage_based:    'Mileage-Based',
  };
  return <>{map[type]}</>;
}

function ConfigTab() {
  const [cfg, setCfg] = useState(ROAD_HAZARD_CONFIG);
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: 18 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#1A1A1A', marginBottom: 14 }}>Warranty Terms</div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: '#6B7280', display: 'block', marginBottom: 4 }}>Duration (months)</label>
            <input type="number" value={cfg.durationMonths} onChange={e => setCfg(c => ({ ...c, durationMonths: +e.target.value }))} style={{ width: '100%', padding: '7px 10px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: '#6B7280', display: 'block', marginBottom: 4 }}>Coverage Type</label>
            <select value={cfg.coverageType} onChange={e => setCfg(c => ({ ...c, coverageType: e.target.value as CoverageType }))} style={{ width: '100%', padding: '7px 10px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }}>
              <option value="free_replacement">Free Replacement</option>
              <option value="prorated">Prorated</option>
              <option value="mileage_based">Mileage-Based</option>
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: '#6B7280', display: 'block', marginBottom: 4 }}>Price ($)</label>
            <input type="number" value={cfg.price} onChange={e => setCfg(c => ({ ...c, price: +e.target.value }))} style={{ width: '100%', padding: '7px 10px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
            <input type="checkbox" checked={cfg.priceAsPercentOfTire} onChange={e => setCfg(c => ({ ...c, priceAsPercentOfTire: e.target.checked }))} />
            Price as % of tire sale price
          </label>
        </div>
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: 18 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#1A1A1A', marginBottom: 10 }}>Covered Scenarios</div>
          {cfg.coveredScenarios.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: 13, color: '#374151' }}>
              <CheckCircle size={12} color="#16A34A" /> {s}
            </div>
          ))}
          <div style={{ fontWeight: 600, fontSize: 13, color: '#1A1A1A', marginTop: 14, marginBottom: 8 }}>Exclusions</div>
          {cfg.exclusions.map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: 13, color: '#374151' }}>
              <XCircle size={12} color="#DC2626" /> {e}
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: '#6B7280', display: 'block', marginBottom: 6 }}>Recommendation Level</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['required', 'recommended', 'optional'] as const).map(lvl => (
            <button key={lvl} onClick={() => setCfg(c => ({ ...c, recommendationLevel: lvl }))} style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid', borderColor: cfg.recommendationLevel === lvl ? '#C0392B' : '#E5E7EB', background: cfg.recommendationLevel === lvl ? '#FEF2F2' : '#fff', color: cfg.recommendationLevel === lvl ? '#C0392B' : '#6B7280', fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
              {lvl}
            </button>
          ))}
        </div>
      </div>
      <button onClick={save} style={{ padding: '8px 20px', background: '#C0392B', color: '#fff', border: 'none', borderRadius: 7, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
        {saved ? '✓ Saved' : 'Save Configuration'}
      </button>
    </div>
  );
}

function WarrantiesTab() {
  return (
    <div>
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              {['Customer', 'SKU', 'DOT', 'Coverage', 'Expires', 'Paid', 'Status'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROAD_HAZARD_WARRANTIES.map((w, i) => (
              <tr key={w.id} style={{ borderBottom: i < ROAD_HAZARD_WARRANTIES.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                <td style={{ padding: '11px 14px', fontWeight: 500, color: '#1A1A1A' }}>{w.customerName}</td>
                <td style={{ padding: '11px 14px', color: '#374151' }}>{w.skuName}</td>
                <td style={{ padding: '11px 14px', fontFamily: 'monospace', fontSize: 11, color: '#6B7280' }}>{w.dotCode.split(' ').slice(-1)[0]}</td>
                <td style={{ padding: '11px 14px', color: '#374151' }}><CoverageLabel type={w.coverageType} /></td>
                <td style={{ padding: '11px 14px', color: '#6B7280' }}>{w.expirationDate}</td>
                <td style={{ padding: '11px 14px', color: '#374151' }}>${w.pricePaid.toFixed(2)}</td>
                <td style={{ padding: '11px 14px' }}><WarrantyStatusBadge status={w.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ClaimsTab() {
  return (
    <div>
      {/* Claim stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 9, padding: '14px 16px' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#DC2626' }}>{CLAIM_STATS.openClaims}</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>Open Claims</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 9, padding: '14px 16px' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A' }}>{CLAIM_STATS.avgResolutionDays}d</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>Avg Resolution</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 9, padding: '14px 16px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>{CLAIM_STATS.topClaimedSku}</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>Top Claimed SKU</div>
        </div>
      </div>

      {/* Claim rate by tech */}
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: '#1A1A1A', marginBottom: 12 }}>Claim Rate by Technician (%)</div>
        {CLAIM_STATS.claimRateByTech.map(r => (
          <div key={r.techName} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 70, fontSize: 12, color: '#374151', flexShrink: 0 }}>{r.techName}</div>
            <div style={{ flex: 1, background: '#F3F4F6', borderRadius: 99, height: 8, overflow: 'hidden' }}>
              <div style={{ width: `${(r.rate / 5) * 100}%`, background: r.rate > 3 ? '#DC2626' : '#C0392B', height: '100%', borderRadius: 99 }} />
            </div>
            <div style={{ width: 36, fontSize: 12, color: '#6B7280', textAlign: 'right' }}>{r.rate}%</div>
          </div>
        ))}
      </div>

      {/* Claims table */}
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              {['Customer', 'SKU', 'Miles', 'Tread (mm)', 'Event', 'Photos', 'Status', 'Submitted'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {WARRANTY_CLAIMS.map((c, i) => (
              <tr key={c.id} style={{ borderBottom: i < WARRANTY_CLAIMS.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                <td style={{ padding: '11px 14px', fontWeight: 500, color: '#1A1A1A' }}>{c.customerName}</td>
                <td style={{ padding: '11px 14px', color: '#374151' }}>{c.skuName}</td>
                <td style={{ padding: '11px 14px', color: '#6B7280' }}>{c.milesAtClaim.toLocaleString()}</td>
                <td style={{ padding: '11px 14px', color: '#6B7280' }}>{c.treadDepthMm}</td>
                <td style={{ padding: '11px 14px', color: '#374151', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.eventDescription}</td>
                <td style={{ padding: '11px 14px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#6B7280', fontSize: 12 }}>
                    <Camera size={12} />{c.photoCount}
                  </span>
                </td>
                <td style={{ padding: '11px 14px' }}><ClaimStatusBadge status={c.status} /></td>
                <td style={{ padding: '11px 14px', color: '#6B7280' }}>{new Date(c.submittedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function WarrantiesView() {
  const [subtab, setSubtab] = useState<'warranties' | 'claims' | 'config'>('warranties');
  const openClaims = WARRANTY_CLAIMS.filter(c => c.status === 'open' || c.status === 'under_review').length;

  return (
    <div>
      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #E5E7EB', marginBottom: 20, alignItems: 'flex-end' }}>
        <button onClick={() => setSubtab('warranties')} style={{ padding: '8px 18px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: subtab === 'warranties' ? '#C0392B' : '#6B7280', borderBottom: subtab === 'warranties' ? '2px solid #C0392B' : '2px solid transparent', marginBottom: -2 }}>
          Warranties
        </button>
        <button onClick={() => setSubtab('claims')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: subtab === 'claims' ? '#C0392B' : '#6B7280', borderBottom: subtab === 'claims' ? '2px solid #C0392B' : '2px solid transparent', marginBottom: -2 }}>
          Claims
          {openClaims > 0 && <span style={{ background: '#DC2626', color: '#fff', borderRadius: 99, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>{openClaims}</span>}
        </button>
        <button onClick={() => setSubtab('config')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: subtab === 'config' ? '#C0392B' : '#6B7280', borderBottom: subtab === 'config' ? '2px solid #C0392B' : '2px solid transparent', marginBottom: -2 }}>
          <Settings size={13} /> Config
        </button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, paddingBottom: 8 }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#C0392B', color: '#fff', border: 'none', borderRadius: 7, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
            <Plus size={13} /> Issue Warranty
          </button>
          {subtab === 'claims' && (
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#1A1A1A', color: '#fff', border: 'none', borderRadius: 7, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
              <FileText size={13} /> File Claim
            </button>
          )}
        </div>
      </div>

      {subtab === 'warranties' && <WarrantiesTab />}
      {subtab === 'claims' && <ClaimsTab />}
      {subtab === 'config' && <ConfigTab />}
    </div>
  );
}

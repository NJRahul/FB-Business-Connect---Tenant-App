import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Clock, Plus, Settings, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { TPMS_VISITS, TPMS_CONFIG } from './mockData';
import type { TpmsVisitRecord, TpmsWheelRecord, TpmsRelearnOutcome, TpmsAction } from './types';

const POSITION_LABEL: Record<string, string> = { FL: 'Front Left', FR: 'Front Right', RL: 'Rear Left', RR: 'Rear Right', RL2: 'Rear Left 2', RR2: 'Rear Right 2' };

function RelearnBadge({ outcome }: { outcome: TpmsRelearnOutcome }) {
  const map: Record<TpmsRelearnOutcome, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    success:      { label: 'Relearn OK',     color: '#16A34A', bg: '#F0FDF4', icon: <CheckCircle size={11} /> },
    failed:       { label: 'Failed',          color: '#DC2626', bg: '#FEF2F2', icon: <XCircle size={11} /> },
    retry_needed: { label: 'Retry Needed',    color: '#D97706', bg: '#FFFBEB', icon: <AlertTriangle size={11} /> },
    pending:      { label: 'Pending',         color: '#6B7280', bg: '#F3F4F6', icon: <Clock size={11} /> },
  };
  const s = map[outcome];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 7px', borderRadius: 99, background: s.bg, color: s.color, fontSize: 11, fontWeight: 600 }}>
      {s.icon}{s.label}
    </span>
  );
}

function ActionBadge({ action }: { action: TpmsAction }) {
  const map: Record<TpmsAction, { label: string; color: string }> = {
    rebuild_only:     { label: 'Rebuild',         color: '#2563EB' },
    sensor_replaced:  { label: 'Sensor Replaced', color: '#7C3AED' },
    skipped:          { label: 'Skipped',          color: '#9CA3AF' },
  };
  const s = map[action];
  return <span style={{ fontSize: 11, fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</span>;
}

function WheelGrid({ wheels }: { wheels: TpmsWheelRecord[] }) {
  const byPos: Record<string, TpmsWheelRecord> = {};
  wheels.forEach(w => { byPos[w.position] = w; });
  const layout = [['FL', 'FR'], ['RL', 'RR']];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {layout.flatMap(row => row.map(pos => {
        const w = byPos[pos];
        if (!w) return null;
        const borderColor = w.action === 'sensor_replaced' ? '#7C3AED' : w.action === 'skipped' ? '#E5E7EB' : '#2563EB';
        const bgColor = w.relearn === 'failed' ? '#FEF2F2' : w.relearn === 'retry_needed' ? '#FFFBEB' : '#F9FAFB';
        return (
          <div key={pos} style={{ border: `2px solid ${borderColor}`, borderRadius: 8, padding: '10px 12px', background: bgColor }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', marginBottom: 4 }}>{POSITION_LABEL[pos]}</div>
            <ActionBadge action={w.action} />
            {w.skipReason && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 3 }}>{w.skipReason}</div>}
            {w.sensorSkuName && <div style={{ fontSize: 11, color: '#7C3AED', marginTop: 3 }}>{w.sensorSkuName}</div>}
            {w.upsoldToReplacement && <div style={{ fontSize: 10, color: '#059669', marginTop: 3, fontWeight: 600 }}>↑ Upsold to replacement</div>}
            <div style={{ marginTop: 6 }}><RelearnBadge outcome={w.relearn} /></div>
          </div>
        );
      }))}
    </div>
  );
}

function VisitCard({ visit }: { visit: TpmsVisitRecord }) {
  const [open, setOpen] = useState(false);
  const upsolds = visit.wheels.filter(w => w.upsoldToReplacement).length;
  const issues = visit.wheels.filter(w => w.relearn === 'failed' || w.relearn === 'retry_needed').length;

  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer' }}
        onClick={() => setOpen(o => !o)}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#1A1A1A' }}>{visit.customerName}</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{visit.vehicleLabel} · Tech: {visit.techName} · {new Date(visit.createdAt).toLocaleDateString()}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {upsolds > 0 && <span style={{ fontSize: 11, fontWeight: 600, color: '#7C3AED', background: '#F5F3FF', padding: '2px 8px', borderRadius: 99 }}>{upsolds} upsold</span>}
          {issues > 0 && <span style={{ fontSize: 11, fontWeight: 600, color: '#D97706', background: '#FFFBEB', padding: '2px 8px', borderRadius: 99 }}>{issues} relearn issue</span>}
          {open ? <ChevronUp size={16} color="#9CA3AF" /> : <ChevronDown size={16} color="#9CA3AF" />}
        </div>
      </div>
      {open && (
        <div style={{ borderTop: '1px solid #E5E7EB', padding: '14px 16px' }}>
          <WheelGrid wheels={visit.wheels} />
        </div>
      )}
    </div>
  );
}

function ConfigPanel() {
  const [cfg, setCfg] = useState(TPMS_CONFIG);
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: 20 }}>
      <div style={{ fontWeight: 600, fontSize: 14, color: '#1A1A1A', marginBottom: 16 }}>Service Configuration</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ padding: '14px 16px', background: '#F0F7FF', borderRadius: 8, border: '1px solid #BFDBFE' }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#1D4ED8', marginBottom: 10 }}>Rebuild Service</div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 13, color: '#374151' }}>
            <input type="checkbox" checked={cfg.rebuildEnabled} onChange={e => setCfg(c => ({ ...c, rebuildEnabled: e.target.checked }))} />
            Enabled
          </label>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Price / wheel ($)</div>
            <input type="number" value={cfg.rebuildPricePerWheel} onChange={e => setCfg(c => ({ ...c, rebuildPricePerWheel: +e.target.value }))} style={{ width: '100%', padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13 }} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Time / wheel (min)</div>
            <input type="number" value={cfg.rebuildTimeMinutes} onChange={e => setCfg(c => ({ ...c, rebuildTimeMinutes: +e.target.value }))} style={{ width: '100%', padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13 }} />
          </div>
        </div>
        <div style={{ padding: '14px 16px', background: '#F5F3FF', borderRadius: 8, border: '1px solid #DDD6FE' }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#6D28D9', marginBottom: 10 }}>Sensor Replacement</div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 13, color: '#374151' }}>
            <input type="checkbox" checked={cfg.replacementEnabled} onChange={e => setCfg(c => ({ ...c, replacementEnabled: e.target.checked }))} />
            Enabled
          </label>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Price / wheel ($)</div>
            <input type="number" value={cfg.replacementPricePerWheel} onChange={e => setCfg(c => ({ ...c, replacementPricePerWheel: +e.target.value }))} style={{ width: '100%', padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13 }} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Time / wheel (min)</div>
            <input type="number" value={cfg.replacementTimeMinutes} onChange={e => setCfg(c => ({ ...c, replacementTimeMinutes: +e.target.value }))} style={{ width: '100%', padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13 }} />
          </div>
        </div>
      </div>
      <button onClick={save} style={{ marginTop: 14, padding: '8px 20px', background: '#00A9AC', color: '#fff', border: 'none', borderRadius: 7, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
        {saved ? '✓ Saved' : 'Save Config'}
      </button>
    </div>
  );
}

export function TpmsView() {
  const [subtab, setSubtab] = useState<'visits' | 'config'>('visits');

  const upsoldTotal = TPMS_VISITS.flatMap(v => v.wheels).filter(w => w.upsoldToReplacement).length;
  const issueTotal = TPMS_VISITS.flatMap(v => v.wheels).filter(w => w.relearn === 'failed' || w.relearn === 'retry_needed').length;

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Visits', value: TPMS_VISITS.length },
          { label: 'Wheels Serviced', value: TPMS_VISITS.flatMap(v => v.wheels).filter(w => w.action !== 'skipped').length },
          { label: 'Upsold to Replace', value: upsoldTotal, accent: '#7C3AED' },
          { label: 'Relearn Issues', value: issueTotal, accent: '#D97706' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 9, padding: '14px 16px' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.accent || '#1A1A1A' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #E5E7EB', marginBottom: 20 }}>
        {(['visits', 'config'] as const).map(t => (
          <button key={t} onClick={() => setSubtab(t)} style={{ padding: '8px 18px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: subtab === t ? '#00A9AC' : '#6B7280', borderBottom: subtab === t ? '2px solid #00A9AC' : '2px solid transparent', marginBottom: -2, textTransform: 'capitalize' }}>
            {t === 'config' ? <><Settings size={13} style={{ display: 'inline', marginRight: 5 }} />Config</> : 'Visit Records'}
          </button>
        ))}
        <button style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: '#00A9AC', color: '#fff', border: 'none', borderRadius: 7, fontWeight: 600, fontSize: 12, cursor: 'pointer', marginBottom: 6 }}>
          <Plus size={13} /> New TPMS Visit
        </button>
      </div>

      {subtab === 'visits' && (
        <div>
          {TPMS_VISITS.map(v => <VisitCard key={v.id} visit={v} />)}
        </div>
      )}
      {subtab === 'config' && <ConfigPanel />}

      {/* Relearn reminder */}
      <div style={{ marginTop: 16, padding: '10px 14px', background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: 8, fontSize: 12, color: '#92400E', display: 'flex', gap: 8, alignItems: 'center' }}>
        <RefreshCw size={13} />
        Relearn procedure is required after every sensor replacement. Vehicles with "Retry Needed" status should be rescheduled before customer departure.
      </div>
    </div>
  );
}

import { useState, useRef } from 'react';
import { Plus, Search, ChevronRight, X, Shield, AlertTriangle, Info, Check } from 'lucide-react';
import type { Recall, RecallSeverity, RecallStatus, RecallSource, AffectedDOTRange, AffectedVehicle } from './types';

export const SEVERITY_CONFIG: Record<RecallSeverity, { label: string; bg: string; color: string; dot: string }> = {
  critical: { label: 'Critical',  bg: '#F0FBFB', color: '#B91C1C', dot: '#DC2626' },
  warning:  { label: 'Warning',   bg: '#FFFBEB', color: '#B45309', dot: '#D97706' },
  info:     { label: 'Advisory',  bg: '#EFF6FF', color: '#1D4ED8', dot: '#3B82F6' },
};

export const STATUS_CONFIG: Record<RecallStatus, { label: string; bg: string; color: string }> = {
  active:   { label: 'Active',    bg: '#F0FBFB', color: '#B91C1C' },
  resolved: { label: 'Resolved',  bg: '#F0FDF4', color: '#15803D' },
  withdrawn:{ label: 'Withdrawn', bg: '#F9FAFB', color: '#6B7280' },
};

export const SOURCE_CONFIG: Record<RecallSource, { label: string; bg: string; color: string }> = {
  nhtsa_dot:    { label: 'NHTSA',        bg: '#EFF6FF', color: '#1E40AF' },
  manufacturer: { label: 'Manufacturer', bg: '#FFF7ED', color: '#C2410C' },
  distributor:  { label: 'Distributor',  bg: '#F5F3FF', color: '#6D28D9' },
  internal:     { label: 'Internal',     bg: '#F9FAFB', color: '#374151' },
};

interface Props {
  recalls: Recall[];
  onSelect: (recall: Recall) => void;
  onAdd: (recall: Recall) => void;
}

export function RecallRegistryView({ recalls, onSelect, onAdd }: Props) {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<RecallSeverity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<RecallStatus | 'all'>('all');
  const [showNewForm, setShowNewForm] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  function showToast(msg: string) { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); }

  const filtered = recalls.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.title.toLowerCase().includes(q) || r.affectedSkus.some(s => s.toLowerCase().includes(q));
    const matchSeverity = severityFilter === 'all' || r.severity === severityFilter;
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchSeverity && matchStatus;
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.125rem', color: '#1A1A1A' }}>Recall Registry</h2>
          <p style={{ fontSize: '0.825rem', color: '#6B7280', marginTop: 2 }}>
            Platform-published and shop-specific product recalls and safety advisories.
          </p>
        </div>
        <button onClick={() => setShowNewForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-[8px] text-sm font-semibold"
          style={{ background: '#00A9AC', color: '#fff' }}>
          <Plus size={14} /> New Recall
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 min-w-48" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
          <Search size={14} color="#9CA3AF" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search recalls or SKU…"
            className="outline-none text-sm w-full" style={{ color: '#1A1A1A', background: 'transparent' }} />
        </div>
        <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value as RecallSeverity | 'all')}
          className="px-3 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #E5E7EB', color: '#374151', background: '#fff' }}>
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="warning">Warning</option>
          <option value="info">Advisory</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as RecallStatus | 'all')}
          className="px-3 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #E5E7EB', color: '#374151', background: '#fff' }}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="resolved">Resolved</option>
          <option value="withdrawn">Withdrawn</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E5E7EB', background: '#fff' }}>
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              {['Severity', 'Recall / Title', 'Source', 'Affected', 'Status', 'Effective', ''].map(h => (
                <th key={h} className="text-left px-4 py-3"
                  style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((recall, i) => {
              const sev = SEVERITY_CONFIG[recall.severity];
              const sta = STATUS_CONFIG[recall.status];
              const src = SOURCE_CONFIG[recall.source];
              const isPlatform = recall.shopId === null;
              return (
                <tr key={recall.id} onClick={() => onSelect(recall)}
                  className="cursor-pointer transition-colors"
                  style={{ borderTop: i > 0 ? '1px solid #F3F4F6' : undefined }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#FAFAFA')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: sev.dot }} />
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: sev.bg, color: sev.color }}>
                        {sev.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4" style={{ maxWidth: 340 }}>
                    <div className="flex items-start gap-2">
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1A1A1A', lineHeight: 1.4 }}>{recall.title}</p>
                        <p style={{ fontSize: '0.775rem', color: '#9CA3AF', marginTop: 2, lineHeight: 1.4 }}>
                          {recall.description.slice(0, 90)}{recall.description.length > 90 ? '…' : ''}
                        </p>
                        {isPlatform ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mt-1.5" style={{ background: '#EEF2FF', color: '#3730A3' }}>
                            <Shield size={9} /> Platform Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mt-1.5" style={{ background: '#F9FAFB', color: '#6B7280', border: '1px solid #E5E7EB' }}>
                            Shop Added
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: src.bg, color: src.color }}>
                      {src.label}
                    </span>
                    {recall.nhtsaCampaignId && (
                      <p style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: 4, fontFamily: 'monospace' }}>#{recall.nhtsaCampaignId}</p>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A1A1A' }}>{recall.affectedCustomerCount}</p>
                    <p style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>customers</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: sta.bg, color: sta.color }}>
                      {sta.label}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p style={{ fontSize: '0.775rem', color: '#6B7280' }}>{recall.effectiveFrom}</p>
                    {recall.effectiveTo && <p style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>to {recall.effectiveTo}</p>}
                  </td>
                  <td className="px-4 py-4">
                    <ChevronRight size={16} color="#D1D5DB" />
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center" style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
                  No recalls match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New Recall Modal */}
      {showNewForm && (
        <NewRecallModal onClose={() => setShowNewForm(false)} onCreate={r => { onAdd(r); setShowNewForm(false); showToast(`Recall "${r.title}" created and published.`); }} />
      )}

      {toastMsg && (
        <div className="fixed bottom-6 right-6 px-4 py-3 rounded-xl text-sm font-medium z-50 flex items-center gap-2"
          style={{ background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
          <Check size={14} /> {toastMsg}
        </div>
      )}
    </div>
  );
}

function ChipInput({ label, chips, onAdd, onRemove, placeholder }: {
  label: string; chips: string[]; onAdd: (v: string) => void; onRemove: (v: string) => void; placeholder?: string;
}) {
  const [val, setVal] = useState('');
  function commit() { const t = val.trim(); if (t && !chips.includes(t)) { onAdd(t); } setVal(''); }
  return (
    <div>
      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>{label}</label>
      <div className="flex flex-wrap gap-1.5 mt-1 p-2 rounded-lg min-h-10" style={{ border: '1px solid #E5E7EB', background: '#fff' }}>
        {chips.map(c => (
          <span key={c} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: '#E6F7F7', color: '#00A9AC' }}>
            {c} <button onClick={() => onRemove(c)}><X size={10} /></button>
          </span>
        ))}
        <input value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit(); } }}
          onBlur={commit}
          placeholder={chips.length === 0 ? (placeholder || 'Type and press Enter') : ''}
          className="outline-none text-sm flex-1 min-w-24" style={{ background: 'transparent', color: '#1A1A1A' }} />
      </div>
    </div>
  );
}

function NewRecallModal({ onClose, onCreate }: { onClose: () => void; onCreate: (r: Recall) => void }) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [source, setSource] = useState<RecallSource>('manufacturer');
  const [severity, setSeverity] = useState<RecallSeverity>('critical');
  const [description, setDescription] = useState('');
  const [recommendedAction, setRecommendedAction] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().split('T')[0]);
  const [effectiveTo, setEffectiveTo] = useState('');
  const [skus, setSkus] = useState<string[]>([]);
  const [lots, setLots] = useState<string[]>([]);
  const [dotRanges, setDotRanges] = useState<AffectedDOTRange[]>([{ weekFrom: '', weekTo: '', plantCode: '' }]);
  const [vehicles, setVehicles] = useState<AffectedVehicle[]>([{ yearFrom: 2018, yearTo: 2024, make: '', model: '', trim: 'All' }]);

  function addDotRange() { setDotRanges(d => [...d, { weekFrom: '', weekTo: '', plantCode: '' }]); }
  function removeDotRange(i: number) { setDotRanges(d => d.filter((_, j) => j !== i)); }
  function updateDotRange(i: number, field: keyof AffectedDOTRange, val: string) {
    setDotRanges(d => d.map((r, j) => j === i ? { ...r, [field]: val } : r));
  }
  function addVehicle() { setVehicles(v => [...v, { yearFrom: 2018, yearTo: 2024, make: '', model: '', trim: 'All' }]); }
  function removeVehicle(i: number) { setVehicles(v => v.filter((_, j) => j !== i)); }
  function updateVehicle(i: number, field: keyof AffectedVehicle, val: string | number) {
    setVehicles(v => v.map((r, j) => j === i ? { ...r, [field]: val } : r));
  }

  function submit() {
    const recall: Recall = {
      id: `rcl_${Date.now()}`,
      shopId: 'shop_001',
      source, title, description, severity, status: 'active',
      affectedSkus: skus, affectedLots: lots,
      affectedDotRanges: dotRanges.filter(d => d.weekFrom && d.weekTo),
      affectedVehicles: vehicles.filter(v => v.make && v.model),
      recommendedAction, effectiveFrom, effectiveTo: effectiveTo || undefined,
      createdAt: new Date().toISOString(), affectedCustomerCount: 0,
    };
    onCreate(recall);
  }

  const canNext1 = title.trim() && description.trim() && recommendedAction.trim();
  const canSubmit = canNext1 && (skus.length > 0 || lots.length > 0 || dotRanges.some(d => d.weekFrom) || vehicles.some(v => v.make));

  const inputStyle = { border: '1px solid #E5E7EB', color: '#1A1A1A', background: '#fff' };
  const labelStyle = { fontSize: '0.8rem', fontWeight: 600, color: '#374151' } as React.CSSProperties;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="w-full max-w-2xl rounded-2xl mx-4 flex flex-col" style={{ background: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#E5E7EB' }}>
          <div>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#1A1A1A' }}>New Recall Entry</h3>
            <p style={{ fontSize: '0.775rem', color: '#9CA3AF', marginTop: 2 }}>Step {step} of 3 — {step === 1 ? 'Basic Info' : step === 2 ? 'Affected Products' : 'Affected Vehicles'}</p>
          </div>
          <button onClick={onClose} style={{ color: '#9CA3AF' }}><X size={18} /></button>
        </div>

        {/* Step indicator */}
        <div className="flex px-6 py-3 gap-2" style={{ borderBottom: '1px solid #F3F4F6' }}>
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: step >= s ? '#00A9AC' : '#E5E7EB', color: step >= s ? '#fff' : '#9CA3AF' }}>
                {s}
              </div>
              {s < 3 && <div className="w-8 h-0.5" style={{ background: step > s ? '#00A9AC' : '#E5E7EB' }} />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div>
                <label style={labelStyle}>Recall Title *</label>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Michelin Defender T+H — Tread Separation Risk"
                  className="w-full mt-1 px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={inputStyle} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>Source</label>
                  <select value={source} onChange={e => setSource(e.target.value as RecallSource)}
                    className="w-full mt-1 px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle}>
                    <option value="manufacturer">Manufacturer</option>
                    <option value="nhtsa_dot">NHTSA / DOT</option>
                    <option value="distributor">Distributor</option>
                    <option value="internal">Internal Finding</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Severity</label>
                  <select value={severity} onChange={e => setSeverity(e.target.value as RecallSeverity)}
                    className="w-full mt-1 px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle}>
                    <option value="critical">Critical — Immediate Safety Risk</option>
                    <option value="warning">Warning — Potential Safety Risk</option>
                    <option value="info">Advisory — Performance Concern</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Description *</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                  placeholder="Describe the defect, root cause, and risk to customers…"
                  className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none resize-none"
                  style={{ ...inputStyle, fontFamily: 'Inter, sans-serif' }} />
              </div>
              <div>
                <label style={labelStyle}>Recommended Action *</label>
                <textarea value={recommendedAction} onChange={e => setRecommendedAction(e.target.value)} rows={2}
                  placeholder="What should shop staff do? Contact manufacturer, schedule replacement, etc."
                  className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none resize-none"
                  style={{ ...inputStyle, fontFamily: 'Inter, sans-serif' }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>Effective From *</label>
                  <input type="date" value={effectiveFrom} onChange={e => setEffectiveFrom(e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Effective To (optional)</label>
                  <input type="date" value={effectiveTo} onChange={e => setEffectiveTo(e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-5">
              <ChipInput label="Affected SKUs" chips={skus} onAdd={s => setSkus(v => [...v, s])} onRemove={s => setSkus(v => v.filter(x => x !== s))} placeholder="e.g. MIC-DTH-22565R17" />
              <ChipInput label="Affected Lot Numbers" chips={lots} onAdd={s => setLots(v => [...v, s])} onRemove={s => setLots(v => v.filter(x => x !== s))} placeholder="e.g. LOT-2024-Q3-A" />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label style={labelStyle}>DOT Code Ranges</label>
                  <button onClick={addDotRange} className="text-xs px-2 py-1 rounded" style={{ color: '#00A9AC', background: '#E6F7F7' }}>+ Add Range</button>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: 8 }}>Format: WWYY (week + 2-digit year). E.g. "2415" = week 24 of 2015.</p>
                {dotRanges.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <input value={r.plantCode || ''} onChange={e => updateDotRange(i, 'plantCode', e.target.value)} maxLength={4}
                      placeholder="Plant (opt)" className="px-3 py-2 rounded-lg text-sm outline-none w-28" style={inputStyle} />
                    <input value={r.weekFrom} onChange={e => updateDotRange(i, 'weekFrom', e.target.value)} maxLength={4}
                      placeholder="From WWYY" className="px-3 py-2 rounded-lg text-sm outline-none w-32" style={inputStyle} />
                    <span style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>—</span>
                    <input value={r.weekTo} onChange={e => updateDotRange(i, 'weekTo', e.target.value)} maxLength={4}
                      placeholder="To WWYY" className="px-3 py-2 rounded-lg text-sm outline-none w-32" style={inputStyle} />
                    {dotRanges.length > 1 && (
                      <button onClick={() => removeDotRange(i)} style={{ color: '#9CA3AF' }}><X size={14} /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p style={labelStyle}>Affected Vehicles (YMMT)</p>
                <button onClick={addVehicle} className="text-xs px-2 py-1 rounded" style={{ color: '#00A9AC', background: '#E6F7F7' }}>+ Add Vehicle</button>
              </div>
              <p style={{ fontSize: '0.775rem', color: '#9CA3AF' }}>Leave blank if recall applies to all vehicles (product/lot-based). Add vehicle entries if the recall is vehicle-specific.</p>
              {vehicles.map((v, i) => (
                <div key={i} className="p-4 rounded-xl flex flex-col gap-3" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                  <div className="flex items-center justify-between">
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>Vehicle {i + 1}</p>
                    {vehicles.length > 1 && <button onClick={() => removeVehicle(i)} style={{ color: '#9CA3AF' }}><X size={14} /></button>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Year From</label>
                      <input type="number" value={v.yearFrom} onChange={e => updateVehicle(i, 'yearFrom', parseInt(e.target.value))}
                        className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none" style={{ ...inputStyle, background: '#fff' }} />
                    </div>
                    <div>
                      <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Year To</label>
                      <input type="number" value={v.yearTo} onChange={e => updateVehicle(i, 'yearTo', parseInt(e.target.value))}
                        className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none" style={{ ...inputStyle, background: '#fff' }} />
                    </div>
                    <div>
                      <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Make *</label>
                      <input value={v.make} onChange={e => updateVehicle(i, 'make', e.target.value)} placeholder="e.g. Ford"
                        className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none" style={{ ...inputStyle, background: '#fff' }} />
                    </div>
                    <div>
                      <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Model *</label>
                      <input value={v.model} onChange={e => updateVehicle(i, 'model', e.target.value)} placeholder="e.g. F-150"
                        className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none" style={{ ...inputStyle, background: '#fff' }} />
                    </div>
                    <div className="col-span-2">
                      <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Trim</label>
                      <input value={v.trim} onChange={e => updateVehicle(i, 'trim', e.target.value)} placeholder="All"
                        className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none" style={{ ...inputStyle, background: '#fff' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: '#E5E7EB' }}>
          <button onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
            className="px-4 py-2 rounded-lg text-sm" style={{ background: '#F9FAFB', color: '#6B7280', border: '1px solid #E5E7EB' }}>
            {step === 1 ? 'Cancel' : '← Back'}
          </button>
          {step < 3 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={step === 1 && !canNext1}
              className="px-5 py-2 rounded-lg text-sm font-semibold"
              style={{ background: '#00A9AC', color: '#fff', opacity: step === 1 && !canNext1 ? 0.4 : 1 }}>
              Next →
            </button>
          ) : (
            <button onClick={submit} disabled={!canSubmit}
              className="px-5 py-2 rounded-lg text-sm font-semibold"
              style={{ background: '#00A9AC', color: '#fff', opacity: !canSubmit ? 0.4 : 1 }}>
              Publish Recall
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

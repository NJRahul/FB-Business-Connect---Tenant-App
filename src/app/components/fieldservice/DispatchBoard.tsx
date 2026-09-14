import { useState, useRef } from 'react';
import {
  Map, Grid3X3, Filter, RefreshCw, AlertTriangle, Package,
  Clock, CheckCircle2, Truck, Wrench, Circle, MapPin, ChevronDown,
} from 'lucide-react';
import { DISPATCH_VISITS, TECHNICIANS, TECH_LOCATIONS } from './mockData';
import type { DispatchVisit } from './types';
import type { VisitState } from '../booking/types';

// ─── Config ───────────────────────────────────────────────────────────────────
const DAY_START_H = 7;  // 7 AM
const DAY_END_H = 19;   // 7 PM
const PX_PER_MIN = 2;   // 2px per minute → 120px/hr
const ROW_H = 80;       // px per technician row
const LABEL_W = 160;    // px for left label column
const TOTAL_W = (DAY_END_H - DAY_START_H) * 60 * PX_PER_MIN; // 1440px

function minutesFromDayStart(iso: string): number {
  const d = new Date(iso);
  return (d.getHours() - DAY_START_H) * 60 + d.getMinutes();
}

const STATE_STYLE: Record<VisitState, { bg: string; border: string; text: string; label: string }> = {
  scheduled:    { bg: '#EFF6FF', border: '#3B82F6', text: '#1D4ED8', label: 'Scheduled' },
  parts_pending:{ bg: '#FFF7ED', border: '#F59E0B', text: '#B45309', label: 'Parts Pending' },
  parts_ready:  { bg: '#F0FDF4', border: '#22C55E', text: '#15803D', label: 'Parts Ready' },
  en_route:     { bg: '#F5F3FF', border: '#8B5CF6', text: '#6D28D9', label: 'En Route' },
  on_site:      { bg: '#F5F3FF', border: '#7C3AED', text: '#5B21B6', label: 'On Site' },
  in_progress:  { bg: '#FDEDEC', border: '#C0392B', text: '#C0392B', label: 'In Progress' },
  completed:    { bg: '#F0FDF4', border: '#27AE60', text: '#15803D', label: 'Completed' },
  no_show:      { bg: '#F9FAFB', border: '#9CA3AF', text: '#6B7280', label: 'No Show' },
  cancelled:    { bg: '#F9FAFB', border: '#D1D5DB', text: '#9CA3AF', label: 'Cancelled' },
};

function stateIcon(s: VisitState) {
  const m: Partial<Record<VisitState, React.ReactNode>> = {
    scheduled: <Clock size={10} />, parts_pending: <Package size={10} />,
    parts_ready: <CheckCircle2 size={10} />, en_route: <Truck size={10} />,
    in_progress: <Wrench size={10} />, completed: <CheckCircle2 size={10} />,
  };
  return m[s] ?? <Circle size={10} />;
}

// ─── Visit Card ───────────────────────────────────────────────────────────────
function VisitCard({ visit, onClick, onDragStart }: {
  visit: DispatchVisit;
  onClick: (v: DispatchVisit) => void;
  onDragStart: (id: string) => void;
}) {
  const s = STATE_STYLE[visit.visitState];
  const startMin = minutesFromDayStart(visit.scheduledStart);
  const endMin = minutesFromDayStart(visit.scheduledEnd);
  const dur = endMin - startMin;
  const left = Math.max(0, startMin) * PX_PER_MIN;
  const width = Math.max(60, dur * PX_PER_MIN - 4);

  return (
    <div
      draggable
      onDragStart={() => onDragStart(visit.id)}
      onClick={() => onClick(visit)}
      className="absolute top-1.5 rounded-[5px] cursor-grab overflow-hidden select-none"
      style={{
        left, width,
        height: ROW_H - 12,
        background: s.bg,
        border: `1.5px solid ${s.border}`,
      }}
    >
      <div className="px-1.5 py-1 h-full flex flex-col justify-between overflow-hidden relative">
        {visit.atRisk && (
          <div className="absolute top-1.5 right-1.5">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#C0392B' }} />
          </div>
        )}
        <div>
          <p className="truncate" style={{ fontSize: '0.6875rem', fontWeight: 700, color: s.text, lineHeight: 1.2 }}>
            {visit.customerName.split('–')[0].trim()}
          </p>
          <p className="truncate" style={{ fontSize: '0.5625rem', color: '#6B7280', lineHeight: 1.2 }}>{visit.serviceTypeName}</p>
        </div>
        <div className="flex items-center gap-1">
          <span style={{ color: s.text, lineHeight: 1 }}>{stateIcon(visit.visitState)}</span>
          <span style={{ fontSize: '0.5625rem', color: s.text, fontWeight: 600 }}>{s.label}</span>
          {visit.partsRequired.length > 0 && (
            <Package size={9} style={{ color: '#F59E0B', marginLeft: '2px' }} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Detail Side Panel ────────────────────────────────────────────────────────
function DetailPanel({ visit, onClose, onReassign }: {
  visit: DispatchVisit;
  onClose: () => void;
  onReassign: (visitId: string, techId: string) => void;
}) {
  const s = STATE_STYLE[visit.visitState];
  const [showReassign, setShowReassign] = useState(false);
  const [targetTech, setTargetTech] = useState('');
  const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <div className="w-72 shrink-0 bg-white border-l flex flex-col overflow-y-auto" style={{ borderColor: '#E5E7EB' }}>
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #E5E7EB', background: '#1A1A1A' }}>
        <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#fff', fontSize: '0.875rem' }}>Visit Detail</span>
        <button onClick={onClose} style={{ color: '#9CA3AF', fontSize: '1.25rem', lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
      </div>
      <div className="p-4 flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>{s.label}</span>
          {visit.atRisk && <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: '#FDEDEC', color: '#C0392B' }}>⚠ At Risk</span>}
        </div>
        <h4 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', marginBottom: '2px' }}>{visit.customerName}</h4>
        <p style={{ color: '#9CA3AF', fontSize: '0.8125rem', marginBottom: '12px' }}>{visit.serviceTypeName}</p>
        {[
          { label: 'Time', value: `${fmtTime(visit.scheduledStart)} – ${fmtTime(visit.scheduledEnd)}` },
          { label: 'Technician', value: visit.technicianName },
          { label: 'Address', value: visit.serviceAddress },
          { label: 'Vehicle', value: `${visit.vehicle.year} ${visit.vehicle.make} ${visit.vehicle.model}` },
          { label: 'Total', value: `R ${visit.totalPrice.toFixed(2)}` },
        ].map(r => (
          <div key={r.label} className="flex justify-between py-2" style={{ borderBottom: '1px solid #F3F4F6' }}>
            <span style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>{r.label}</span>
            <span style={{ color: '#1A1A1A', fontSize: '0.8125rem', fontWeight: 500, textAlign: 'right', maxWidth: '160px' }}>{r.value}</span>
          </div>
        ))}
        {visit.partsRequired.length > 0 && (
          <div className="mt-3 p-2.5 rounded-[6px]" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
            <p style={{ color: '#92400E', fontSize: '0.75rem', fontWeight: 600 }}>Parts: {visit.partsStatus.replace(/_/g, ' ')}</p>
            {visit.partsRequired.map((p, i) => (
              <p key={i} style={{ color: '#B45309', fontSize: '0.75rem' }}>• {p.name} ×{p.qty}</p>
            ))}
          </div>
        )}
        {/* Reassign */}
        {!['completed', 'cancelled'].includes(visit.visitState) && (
          <div className="mt-4">
            {!showReassign ? (
              <button
                onClick={() => setShowReassign(true)}
                className="w-full py-2 rounded-[6px] text-sm font-semibold"
                style={{ border: '1.5px solid #E5E7EB', color: '#6B7280' }}
              >
                Reassign Technician
              </button>
            ) : (
              <div>
                <select
                  value={targetTech}
                  onChange={e => setTargetTech(e.target.value)}
                  className="w-full px-3 py-2 rounded-[6px] text-sm mb-2"
                  style={{ border: '1.5px solid #E5E7EB', outline: 'none' }}
                >
                  <option value="">Select technician…</option>
                  {TECHNICIANS.filter(t => t.customerFacing && t.id !== visit.technicianId).map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button onClick={() => setShowReassign(false)} className="flex-1 py-2 rounded-[6px] text-sm" style={{ border: '1.5px solid #E5E7EB', color: '#6B7280' }}>Cancel</button>
                  <button
                    disabled={!targetTech}
                    onClick={() => { if (targetTech) { onReassign(visit.id, targetTech); setShowReassign(false); } }}
                    className="flex-1 py-2 rounded-[6px] text-sm text-white font-semibold"
                    style={{ background: targetTech ? '#C0392B' : '#D1D5DB' }}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Map View ─────────────────────────────────────────────────────────────────
function MapView({ visits, onSelect }: { visits: DispatchVisit[]; onSelect: (v: DispatchVisit) => void }) {
  return (
    <div className="relative flex-1 rounded-[8px] overflow-hidden" style={{ background: '#E8EAE6', minHeight: '480px', border: '1px solid #D1D5DB' }}>
      {/* Simulated road grid */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.3 }}>
        {Array.from({ length: 8 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={`${(i + 1) * 12.5}%`} x2="100%" y2={`${(i + 1) * 12.5}%`} stroke="#9CA3AF" strokeWidth="1" />
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <line key={`v${i}`} x1={`${(i + 1) * 10}%`} y1="0" x2={`${(i + 1) * 10}%`} y2="100%" stroke="#9CA3AF" strokeWidth="1" />
        ))}
        {/* Arterials */}
        <line x1="0" y1="35%" x2="100%" y2="38%" stroke="#9CA3AF" strokeWidth="3" />
        <line x1="0" y1="65%" x2="100%" y2="62%" stroke="#9CA3AF" strokeWidth="3" />
        <line x1="30%" y1="0" x2="28%" y2="100%" stroke="#9CA3AF" strokeWidth="3" />
        <line x1="70%" y1="0" x2="72%" y2="100%" stroke="#9CA3AF" strokeWidth="3" />
      </svg>

      {/* Visit pins */}
      {visits.filter(v => v.mapX !== undefined).map(v => {
        const s = STATE_STYLE[v.visitState];
        const pinColor = v.atRisk ? '#C0392B' : v.visitState === 'completed' ? '#27AE60' : s.border;
        return (
          <button
            key={v.id}
            onClick={() => onSelect(v)}
            className="absolute transform -translate-x-1/2 -translate-y-full"
            style={{ left: `${v.mapX}%`, top: `${v.mapY}%`, zIndex: v.atRisk ? 10 : 5 }}
            title={`${v.customerName} – ${v.serviceTypeName}`}
          >
            <MapPin
              size={v.atRisk ? 28 : 22}
              style={{ color: pinColor, filter: v.atRisk ? 'drop-shadow(0 0 4px rgba(192,57,43,0.7))' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}
              fill={pinColor}
            />
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white rounded px-1 text-xs font-bold whitespace-nowrap shadow" style={{ color: '#1A1A1A', fontSize: '0.5625rem' }}>
              {v.customerName.split(' ')[0]}
            </span>
          </button>
        );
      })}

      {/* Technician dots */}
      {TECH_LOCATIONS.map(loc => (
        <div
          key={loc.technicianId}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${loc.technicianId === 'tech-1' ? 42 : loc.technicianId === 'tech-2' ? 50 : 30}%`, top: `${loc.technicianId === 'tech-1' ? 50 : loc.technicianId === 'tech-2' ? 45 : 65}%`, zIndex: 20 }}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs border-2 border-white shadow-md" style={{ background: loc.color }}>
            {loc.technicianName.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white rounded px-1 shadow whitespace-nowrap" style={{ fontSize: '0.5625rem', color: '#1A1A1A', fontWeight: 600 }}>
            {loc.technicianName.split(' ')[0]}
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-white rounded-[6px] p-2.5 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
        <p style={{ fontSize: '0.625rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: '4px' }}>Legend</p>
        {[
          { color: '#3B82F6', label: 'Scheduled' },
          { color: '#F59E0B', label: 'Parts Pending' },
          { color: '#C0392B', label: 'At Risk / Live' },
          { color: '#27AE60', label: 'Completed' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5 mb-0.5">
            <MapPin size={12} style={{ color: l.color }} fill={l.color} />
            <span style={{ fontSize: '0.6875rem', color: '#6B7280' }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Tech tracker */}
      <div className="absolute bottom-3 right-3 bg-white rounded-[6px] p-2.5 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
        <p style={{ fontSize: '0.625rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: '4px' }}>Live Techs</p>
        {TECH_LOCATIONS.map(loc => (
          <div key={loc.technicianId} className="flex items-center gap-1.5 mb-1">
            <div className="w-4 h-4 rounded-full flex items-center justify-center text-white font-bold" style={{ background: loc.color, fontSize: '0.5rem' }}>
              {loc.technicianName.split(' ').map(n => n[0]).join('')}
            </div>
            <span style={{ fontSize: '0.6875rem', color: '#1A1A1A' }}>{loc.technicianName.split(' ')[0]}</span>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#27AE60' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main DispatchBoard ───────────────────────────────────────────────────────
export function DispatchBoard() {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [visits, setVisits] = useState<DispatchVisit[]>(DISPATCH_VISITS);
  const [selectedVisit, setSelectedVisit] = useState<DispatchVisit | null>(null);
  const [filterTech, setFilterTech] = useState('all');
  const [filterState, setFilterState] = useState('all');
  const [dragId, setDragId] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [showConflict, setShowConflict] = useState<{ visitId: string; techId: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const techs = TECHNICIANS.filter(t => t.customerFacing);
  const hours = Array.from({ length: DAY_END_H - DAY_START_H }, (_, i) => DAY_START_H + i);

  const filteredVisits = visits.filter(v => {
    if (filterTech !== 'all' && v.technicianId !== filterTech) return false;
    if (filterState !== 'all' && v.visitState !== filterState) return false;
    if (!v.scheduledStart.startsWith('2026-06-14')) return false;
    return true;
  });

  const visitsForTech = (techId: string) => filteredVisits.filter(v => v.technicianId === techId);

  const handleDrop = (e: React.DragEvent, techId: string) => {
    e.preventDefault();
    if (!dragId) return;
    const visit = visits.find(v => v.id === dragId);
    if (!visit) return;
    if (visit.technicianId === techId) { setDragId(null); return; }
    // Check for conflict (simplified)
    const techVisits = visits.filter(v => v.technicianId === techId && v.id !== dragId && v.scheduledStart.startsWith('2026-06-14'));
    const hasConflict = techVisits.some(tv => {
      const ts = new Date(tv.scheduledStart).getTime();
      const te = new Date(tv.scheduledEnd).getTime();
      const vs = new Date(visit.scheduledStart).getTime();
      const ve = new Date(visit.scheduledEnd).getTime();
      return vs < te && ve > ts;
    });
    if (hasConflict) {
      setShowConflict({ visitId: dragId, techId });
    } else {
      reassign(dragId, techId);
    }
    setDragId(null);
  };

  const reassign = (visitId: string, techId: string) => {
    const tech = TECHNICIANS.find(t => t.id === techId);
    if (!tech) return;
    setVisits(vs => vs.map(v => v.id === visitId ? { ...v, technicianId: techId, technicianName: tech.name } : v));
    setSelectedVisit(sv => sv?.id === visitId ? { ...sv, technicianId: techId, technicianName: tech.name } : sv);
  };

  const nowLineLeft = ((10.25 - DAY_START_H) * 60 * PX_PER_MIN); // 10:15 AM current time

  const atRiskCount = visits.filter(v => v.atRisk && v.scheduledStart.startsWith('2026-06-14')).length;

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Dispatch header bar */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ background: '#1A1A1A', borderRadius: '8px 8px 0 0' }}>
        <div className="flex items-center gap-3">
          <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#fff', fontSize: '0.9375rem' }}>Dispatch Board</span>
          <span style={{ color: '#6B7280', fontSize: '0.8125rem' }}>Sun, June 14 · 10:15 AM</span>
          {atRiskCount > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: '#C0392B', color: '#fff' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              {atRiskCount} at risk
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Filters */}
          <select value={filterTech} onChange={e => setFilterTech(e.target.value)} className="px-2 py-1 rounded text-xs" style={{ background: '#2D2D2D', color: '#E5E7EB', border: '1px solid #374151', outline: 'none' }}>
            <option value="all">All Techs</option>
            {techs.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select value={filterState} onChange={e => setFilterState(e.target.value)} className="px-2 py-1 rounded text-xs" style={{ background: '#2D2D2D', color: '#E5E7EB', border: '1px solid #374151', outline: 'none' }}>
            <option value="all">All States</option>
            {(['scheduled','parts_pending','parts_ready','en_route','in_progress','completed'] as const).map(s => (
              <option key={s} value={s}>{STATE_STYLE[s].label}</option>
            ))}
          </select>
          {/* View toggle */}
          <div className="flex rounded overflow-hidden" style={{ border: '1px solid #374151' }}>
            <button onClick={() => setViewMode('grid')} className="px-2.5 py-1 flex items-center gap-1 text-xs" style={{ background: viewMode === 'grid' ? '#C0392B' : '#2D2D2D', color: '#fff' }}>
              <Grid3X3 size={12} /> Grid
            </button>
            <button onClick={() => setViewMode('map')} className="px-2.5 py-1 flex items-center gap-1 text-xs" style={{ background: viewMode === 'map' ? '#C0392B' : '#2D2D2D', color: '#fff' }}>
              <Map size={12} /> Map
            </button>
          </div>
          <button onClick={() => setLastRefresh(new Date())} className="p-1.5 rounded" style={{ color: '#9CA3AF' }} title="Refresh">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Main board */}
        <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
          {viewMode === 'map' ? (
            <div className="p-3 flex-1">
              <MapView visits={filteredVisits} onSelect={setSelectedVisit} />
            </div>
          ) : (
            /* Time-grid view */
            <div className="overflow-auto flex-1" ref={scrollRef}>
              <div style={{ minWidth: LABEL_W + TOTAL_W + 'px' }}>
                {/* Hour header */}
                <div className="flex sticky top-0 z-20" style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  <div className="shrink-0" style={{ width: LABEL_W, borderRight: '1px solid #E5E7EB' }} />
                  <div className="relative" style={{ width: TOTAL_W }}>
                    <div className="flex">
                      {hours.map(h => (
                        <div key={h} style={{ width: 60 * PX_PER_MIN, borderRight: '1px solid #E5E7EB', flexShrink: 0 }}>
                          <span style={{ fontSize: '0.6875rem', color: '#9CA3AF', padding: '4px 6px', display: 'block' }}>
                            {h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Technician rows */}
                {techs.map((tech, rowIdx) => (
                  <div
                    key={tech.id}
                    className="flex"
                    style={{ height: ROW_H, background: rowIdx % 2 === 0 ? '#fff' : '#FAFAFA', borderBottom: '1px solid #F3F4F6' }}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => handleDrop(e, tech.id)}
                  >
                    {/* Tech label */}
                    <div className="shrink-0 flex items-center gap-2 px-3" style={{ width: LABEL_W, borderRight: '1px solid #E5E7EB' }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: tech.color }}>
                        {tech.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tech.name}</p>
                        <p style={{ fontSize: '0.625rem', color: '#9CA3AF' }}>{visitsForTech(tech.id).length} visits</p>
                      </div>
                    </div>

                    {/* Time row */}
                    <div className="flex-1 relative" style={{ width: TOTAL_W }}>
                      {/* Hour grid lines */}
                      {hours.map(h => (
                        <div key={h} className="absolute top-0 bottom-0" style={{ left: (h - DAY_START_H) * 60 * PX_PER_MIN, width: 1, background: '#F3F4F6' }} />
                      ))}
                      {/* Now line */}
                      <div className="absolute top-0 bottom-0 z-10" style={{ left: nowLineLeft, width: 2, background: '#C0392B' }}>
                        <div className="w-2 h-2 rounded-full -ml-0.5 -mt-1" style={{ background: '#C0392B' }} />
                      </div>
                      {/* Visit cards */}
                      {visitsForTech(tech.id).map(v => (
                        <VisitCard key={v.id} visit={v} onClick={setSelectedVisit} onDragStart={setDragId} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selectedVisit && (
          <DetailPanel
            visit={visits.find(v => v.id === selectedVisit.id) ?? selectedVisit}
            onClose={() => setSelectedVisit(null)}
            onReassign={(visitId, techId) => {
              const tech = TECHNICIANS.find(t => t.id === techId);
              if (!tech) return;
              reassign(visitId, techId);
            }}
          />
        )}
      </div>

      {/* Conflict confirmation dialog */}
      {showConflict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-[10px] p-6 w-80" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} style={{ color: '#F59E0B' }} />
              <h4 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A' }}>Scheduling Conflict</h4>
            </div>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '16px' }}>
              This technician already has a booking during that time slot. Reassigning may cause a conflict.
            </p>
            <div className="p-2.5 rounded-[6px] mb-4" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
              <p style={{ color: '#92400E', fontSize: '0.8125rem' }}>Parts-aware validation: confirm parts are available for reassigned tech before proceeding.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowConflict(null)} className="flex-1 py-2 rounded-[6px] text-sm" style={{ border: '1.5px solid #E5E7EB', color: '#6B7280' }}>Cancel</button>
              <button
                onClick={() => { reassign(showConflict.visitId, showConflict.techId); setShowConflict(null); }}
                className="flex-1 py-2 rounded-[6px] text-sm text-white font-semibold"
                style={{ background: '#C0392B' }}
              >
                Override & Reassign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

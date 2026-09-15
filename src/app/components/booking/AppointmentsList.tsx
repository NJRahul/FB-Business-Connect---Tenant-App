import { useState, useMemo } from 'react';
import {
  X, ChevronRight, MapPin, Phone, Car, Package,
  Clock, User, AlertTriangle, CheckCircle2, Circle,
  CalendarClock, Truck, Wrench, BanIcon, MessageSquare,
} from 'lucide-react';
import { VISITS as INIT_VISITS } from './mockData';
import type { Visit, VisitState } from './types';

const STATE_LABEL: Record<VisitState, string> = {
  scheduled: 'Scheduled',
  parts_pending: 'Parts Pending',
  parts_ready: 'Parts Ready',
  en_route: 'En Route',
  on_site: 'On Site',
  in_progress: 'In Progress',
  completed: 'Completed',
  no_show: 'No Show',
  cancelled: 'Cancelled',
};

const STATE_COLOR: Record<VisitState, { bg: string; color: string }> = {
  scheduled: { bg: '#EFF6FF', color: '#1D4ED8' },
  parts_pending: { bg: '#FFF7ED', color: '#C2410C' },
  parts_ready: { bg: '#F0FDF4', color: '#15803D' },
  en_route: { bg: '#F5F3FF', color: '#6D28D9' },
  on_site: { bg: '#F5F3FF', color: '#6D28D9' },
  in_progress: { bg: '#E6F7F7', color: '#00A9AC' },
  completed: { bg: '#F0FDF4', color: '#15803D' },
  no_show: { bg: '#F9FAFB', color: '#6B7280' },
  cancelled: { bg: '#F9FAFB', color: '#9CA3AF' },
};

const STATE_NEXT: Record<VisitState, VisitState | null> = {
  scheduled: 'parts_pending',
  parts_pending: 'parts_ready',
  parts_ready: 'en_route',
  en_route: 'on_site',
  on_site: 'in_progress',
  in_progress: 'completed',
  completed: null,
  no_show: null,
  cancelled: null,
};

const STATE_NEXT_LABEL: Record<VisitState, string> = {
  scheduled: 'Mark Parts Pending',
  parts_pending: 'Mark Parts Ready',
  parts_ready: 'Mark En Route',
  en_route: 'Mark On Site',
  on_site: 'Start Service',
  in_progress: 'Mark Complete',
  completed: '',
  no_show: '',
  cancelled: '',
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}
function fmtMoney(n: number) { return `R ${n.toFixed(2)}`; }

type FilterTab = 'all' | 'today' | 'upcoming' | 'active' | 'completed' | 'cancelled';

function StateBadge({ state }: { state: VisitState }) {
  const s = STATE_COLOR[state];
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: s.bg, color: s.color }}>
      {STATE_LABEL[state]}
    </span>
  );
}

interface DetailModalProps {
  visit: Visit;
  onClose: () => void;
  onStateChange: (id: string, next: VisitState) => void;
}

function VisitDetailModal({ visit, onClose, onStateChange }: DetailModalProps) {
  const next = STATE_NEXT[visit.visitState];
  const [showReschedule, setShowReschedule] = useState(false);

  const STEPS: VisitState[] = ['scheduled', 'parts_pending', 'parts_ready', 'en_route', 'on_site', 'in_progress', 'completed'];
  const stepIdx = STEPS.indexOf(visit.visitState);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div
        className="relative w-full max-w-2xl rounded-[12px] overflow-hidden flex flex-col"
        style={{ background: '#fff', maxHeight: '90vh', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #E5E7EB' }}>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span style={{ color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 600 }}>#{visit.id.toUpperCase()}</span>
              <StateBadge state={visit.visitState} />
            </div>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.125rem' }}>
              {visit.customerName}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-[6px] hover:bg-gray-100">
            <X size={18} style={{ color: '#6B7280' }} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {/* State progress rail */}
          {!['cancelled', 'no_show'].includes(visit.visitState) && (
            <div className="mb-6">
              <div className="flex items-center">
                {STEPS.map((s, i) => {
                  const done = i < stepIdx;
                  const active = i === stepIdx;
                  return (
                    <div key={s} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center gap-0.5">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{
                            background: done ? '#27AE60' : active ? '#00A9AC' : '#E5E7EB',
                            color: done || active ? '#fff' : '#9CA3AF',
                          }}
                        >
                          {done ? <CheckCircle2 size={12} /> : active ? <Circle size={8} style={{ fill: '#fff' }} /> : <span style={{ fontSize: '0.5rem', fontWeight: 700 }}>{i + 1}</span>}
                        </div>
                        <span style={{ fontSize: '0.5rem', color: active ? '#00A9AC' : done ? '#27AE60' : '#9CA3AF', whiteSpace: 'nowrap', fontWeight: active ? 700 : 400 }}>
                          {STATE_LABEL[s].split(' ')[0]}
                        </span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className="flex-1 h-0.5 mx-1 mb-3" style={{ background: done ? '#27AE60' : '#E5E7EB' }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Two-column info grid */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Service</p>
              <p style={{ color: '#1A1A1A', fontWeight: 600, fontSize: '0.9375rem' }}>{visit.serviceTypeName}</p>
              <p style={{ color: '#6B7280', fontSize: '0.8125rem', marginTop: '2px' }}>
                {fmtDate(visit.scheduledStart)} · {fmtTime(visit.scheduledStart)} – {fmtTime(visit.scheduledEnd)}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Technician</p>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: '#E6F7F7', color: '#00A9AC', fontWeight: 700, fontSize: '0.75rem' }}>
                  {visit.technicianName[0]}
                </div>
                <p style={{ color: '#1A1A1A', fontWeight: 600, fontSize: '0.9375rem' }}>{visit.technicianName}</p>
              </div>
            </div>
            <div>
              <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Vehicle</p>
              <div className="flex items-center gap-1.5">
                <Car size={14} style={{ color: '#9CA3AF' }} />
                <p style={{ color: '#1A1A1A', fontSize: '0.875rem' }}>
                  {visit.vehicle.year} {visit.vehicle.make} {visit.vehicle.model} {visit.vehicle.trim || ''}
                </p>
              </div>
              {visit.vehicle.licensePlate && (
                <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '2px' }}>{visit.vehicle.licensePlate}</p>
              )}
            </div>
            <div>
              <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Contact</p>
              <div className="flex items-center gap-1.5">
                <Phone size={13} style={{ color: '#9CA3AF' }} />
                <p style={{ color: '#1A1A1A', fontSize: '0.875rem' }}>{visit.customerPhone}</p>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <MapPin size={13} style={{ color: '#9CA3AF' }} />
                <p style={{ color: '#6B7280', fontSize: '0.8125rem' }}>{visit.serviceAddress}</p>
              </div>
            </div>
          </div>

          {/* Parts */}
          {visit.partsRequired.length > 0 && (
            <div className="mb-4">
              <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Parts</p>
              <div className="space-y-2">
                {visit.partsRequired.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-[6px]" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                    <div className="flex items-center gap-2">
                      <Package size={14} style={{ color: '#9CA3AF' }} />
                      <div>
                        <p style={{ color: '#1A1A1A', fontSize: '0.875rem', fontWeight: 500 }}>{p.name}</p>
                        <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>Qty: {p.qty} · {p.supplierName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {p.etaDate && (
                        <p style={{ color: '#F39C12', fontSize: '0.75rem', fontWeight: 600 }}>ETA {p.etaDate}</p>
                      )}
                      <p style={{ color: '#6B7280', fontSize: '0.75rem' }}>{fmtMoney(p.unitPrice * p.qty)}</p>
                    </div>
                  </div>
                ))}
              </div>
              {visit.partsStatus === 'ordered' && (
                <div className="mt-2 flex items-center gap-2 p-2.5 rounded-[6px]" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
                  <AlertTriangle size={13} style={{ color: '#F39C12', flexShrink: 0 }} />
                  <p style={{ color: '#92400E', fontSize: '0.8125rem' }}>Parts ordered — awaiting distributor confirmation. Auto-transitions to Parts Ready on arrival webhook.</p>
                </div>
              )}
            </div>
          )}

          {/* Add-ons */}
          {visit.addons.length > 0 && (
            <div className="mb-4">
              <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Add-ons</p>
              <div className="flex flex-wrap gap-2">
                {visit.addons.map((a, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full text-sm" style={{ background: '#E6F7F7', color: '#00A9AC' }}>
                    {a.name} {a.qty > 1 ? `×${a.qty}` : ''} — {fmtMoney(a.price * a.qty)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {visit.notes && (
            <div className="mb-4 p-3 rounded-[6px]" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
              <div className="flex items-start gap-2">
                <MessageSquare size={13} style={{ color: '#9CA3AF', marginTop: '2px' }} />
                <p style={{ color: '#6B7280', fontSize: '0.8125rem', lineHeight: 1.5 }}>{visit.notes}</p>
              </div>
            </div>
          )}

          {/* Price summary */}
          <div className="p-4 rounded-[8px]" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
            <div className="space-y-1.5">
              {[
                { label: 'Labor', value: visit.laborPrice },
                { label: 'Parts', value: visit.partsPrice },
                ...(visit.addons.length > 0 ? [{ label: 'Add-ons', value: visit.addons.reduce((s, a) => s + a.price * a.qty, 0) }] : []),
                { label: 'Tax (8%)', value: visit.taxAmount },
              ].map(r => (
                <div key={r.label} className="flex justify-between">
                  <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>{r.label}</span>
                  <span style={{ color: '#1A1A1A', fontSize: '0.875rem' }}>{fmtMoney(r.value)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2" style={{ borderTop: '1px solid #E5E7EB' }}>
                <span style={{ color: '#1A1A1A', fontWeight: 700, fontSize: '0.9375rem' }}>Total</span>
                <span style={{ color: '#00A9AC', fontWeight: 700, fontSize: '1rem' }}>{fmtMoney(visit.totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        {!['completed', 'cancelled', 'no_show'].includes(visit.visitState) && (
          <div className="px-6 py-4 flex items-center justify-between gap-3" style={{ borderTop: '1px solid #E5E7EB' }}>
            <div className="flex gap-2">
              <button
                onClick={() => setShowReschedule(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-[6px] text-sm"
                style={{ border: '1.5px solid #E5E7EB', color: '#6B7280', background: '#fff' }}
              >
                <CalendarClock size={14} /> Reschedule
              </button>
              <button
                onClick={() => onStateChange(visit.id, 'cancelled')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-[6px] text-sm"
                style={{ border: '1.5px solid #80D4D5', color: '#DC2626', background: '#F0FBFB' }}
              >
                <BanIcon size={14} /> Cancel
              </button>
            </div>
            {next && (
              <button
                onClick={() => onStateChange(visit.id, next)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-[6px] text-white font-semibold text-sm"
                style={{ background: '#00A9AC' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#007F82')}
                onMouseLeave={e => (e.currentTarget.style.background = '#00A9AC')}
              >
                {STATE_NEXT_LABEL[visit.visitState]} <ChevronRight size={14} />
              </button>
            )}
          </div>
        )}

        {/* Reschedule modal overlay */}
        {showReschedule && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '12px' }}>
            <div className="bg-white rounded-[10px] p-6 w-80" style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
              <h4 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', marginBottom: '12px' }}>Reschedule Visit</h4>
              <div className="p-3 rounded-[6px] mb-3" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
                <div className="flex items-start gap-2">
                  <AlertTriangle size={14} style={{ color: '#F39C12', marginTop: '1px' }} />
                  <p style={{ color: '#92400E', fontSize: '0.8125rem' }}>
                    Parts ETA will be recomputed. Customer will be notified within 60 seconds.
                  </p>
                </div>
              </div>
              <p style={{ color: '#6B7280', fontSize: '0.8125rem', marginBottom: '16px' }}>
                Select a new date and time to reschedule. Staff override available if needed.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowReschedule(false)}
                  className="flex-1 py-2 rounded-[6px] text-sm"
                  style={{ border: '1.5px solid #E5E7EB', color: '#6B7280' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowReschedule(false)}
                  className="flex-1 py-2 rounded-[6px] text-sm text-white font-semibold"
                  style={{ background: '#00A9AC' }}
                >
                  Pick New Slot
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function AppointmentsList() {
  const [visits, setVisits] = useState<Visit[]>(INIT_VISITS);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('upcoming');
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [search, setSearch] = useState('');
  const TODAY = '2026-06-14';

  const filtered = useMemo(() => {
    let v = visits;
    if (search) {
      const q = search.toLowerCase();
      v = v.filter(x =>
        x.customerName.toLowerCase().includes(q) ||
        x.serviceTypeName.toLowerCase().includes(q) ||
        x.id.includes(q),
      );
    }
    switch (activeFilter) {
      case 'today': return v.filter(x => x.scheduledStart.startsWith(TODAY));
      case 'upcoming': return v.filter(x => x.scheduledStart >= TODAY && !['completed', 'cancelled', 'no_show'].includes(x.visitState));
      case 'active': return v.filter(x => ['en_route', 'on_site', 'in_progress', 'parts_ready'].includes(x.visitState));
      case 'completed': return v.filter(x => x.visitState === 'completed');
      case 'cancelled': return v.filter(x => ['cancelled', 'no_show'].includes(x.visitState));
      default: return v;
    }
  }, [visits, activeFilter, search]);

  const sorted = useMemo(() =>
    [...filtered].sort((a, b) => a.scheduledStart.localeCompare(b.scheduledStart)),
    [filtered],
  );

  const handleStateChange = (id: string, next: VisitState) => {
    setVisits(vs => vs.map(v => v.id === id ? { ...v, visitState: next } : v));
    setSelectedVisit(sv => sv?.id === id ? { ...sv, visitState: next } : sv);
  };

  const FILTERS: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'today', label: 'Today' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const stateIcon = (s: VisitState) => {
    const icons: Partial<Record<VisitState, React.ReactNode>> = {
      scheduled: <CalendarClock size={14} />,
      parts_pending: <Package size={14} />,
      parts_ready: <CheckCircle2 size={14} />,
      en_route: <Truck size={14} />,
      on_site: <MapPin size={14} />,
      in_progress: <Wrench size={14} />,
      completed: <CheckCircle2 size={14} />,
      cancelled: <BanIcon size={14} />,
    };
    return icons[s] ?? <Circle size={14} />;
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Filter bar + search */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-1">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className="px-3 py-1.5 rounded-[6px] text-sm font-medium transition-colors"
              style={{
                background: activeFilter === f.id ? '#00A9AC' : '#F3F4F6',
                color: activeFilter === f.id ? '#fff' : '#6B7280',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search customer, service…"
          className="px-3 py-1.5 rounded-[6px] text-sm"
          style={{ border: '1.5px solid #E5E7EB', color: '#1A1A1A', background: '#fff', outline: 'none', width: '220px' }}
        />
      </div>

      {/* Visit cards */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: '#F3F4F6' }}>
            <CalendarClock size={22} style={{ color: '#D1D5DB' }} />
          </div>
          <p style={{ color: '#9CA3AF', fontSize: '0.9375rem' }}>No appointments found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map(v => (
            <button
              key={v.id}
              onClick={() => setSelectedVisit(v)}
              className="w-full text-left bg-white rounded-[8px] p-4 flex items-center gap-4 transition-all"
              style={{
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                border: v.visitState === 'in_progress' ? '1.5px solid #00A9AC' : '1px solid #E5E7EB',
                borderLeft: ['in_progress', 'en_route', 'on_site'].includes(v.visitState) ? '4px solid #00A9AC' : undefined,
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)')}
            >
              {/* State icon */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: STATE_COLOR[v.visitState].bg, color: STATE_COLOR[v.visitState].color }}
              >
                {stateIcon(v.visitState)}
              </div>

              {/* Main info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.9375rem' }}>{v.customerName}</span>
                  <StateBadge state={v.visitState} />
                  {v.partsRequired.length > 0 && (
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded" style={{ background: '#F0FDF4', color: '#15803D', fontSize: '0.6875rem', fontWeight: 600 }}>
                      <Package size={10} /> Parts
                    </span>
                  )}
                </div>
                <p style={{ color: '#6B7280', fontSize: '0.8125rem', marginTop: '2px' }}>
                  {v.serviceTypeName}
                  {v.vehicle.year ? ` · ${v.vehicle.year} ${v.vehicle.make} ${v.vehicle.model}` : ''}
                </p>
              </div>

              {/* Right side */}
              <div className="text-right shrink-0">
                <p style={{ color: '#1A1A1A', fontWeight: 600, fontSize: '0.875rem' }}>
                  {fmtDate(v.scheduledStart)}
                </p>
                <p style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>
                  {fmtTime(v.scheduledStart)} · {v.technicianName.split(' ')[0]}
                </p>
                <p style={{ color: '#00A9AC', fontWeight: 600, fontSize: '0.875rem', marginTop: '2px' }}>
                  {fmtMoney(v.totalPrice)}
                </p>
              </div>

              <ChevronRight size={16} style={{ color: '#D1D5DB', flexShrink: 0 }} />
            </button>
          ))}
        </div>
      )}

      {selectedVisit && (
        <VisitDetailModal
          visit={visits.find(v => v.id === selectedVisit.id) ?? selectedVisit}
          onClose={() => setSelectedVisit(null)}
          onStateChange={handleStateChange}
        />
      )}
    </div>
  );
}

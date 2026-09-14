import { useState } from 'react';
import {
  Plus, Pencil, Trash2, Clock, DollarSign, CheckCircle2,
  Circle, X, ChevronDown, ChevronUp, Shield, Globe, Lock,
} from 'lucide-react';
import { SERVICE_TYPES as INIT_TYPES, TECHNICIANS as INIT_TECHS } from './mockData';
import type { ServiceType, Technician } from './types';

const SKILLS = ['Tire Technician', 'TPMS Specialist', 'Alignment Tech', 'Dispatcher'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type SetupTab = 'services' | 'technicians' | 'calendar';

function fmtMoney(n: number) { return `R ${n.toFixed(2)}`; }

// ─── Service Type Card ────────────────────────────────────────────────────────

function ServiceTypeCard({ st, onEdit, onDelete }: { st: ServiceType; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="bg-white rounded-[8px] p-4 flex items-start justify-between gap-4" style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.9375rem' }}>{st.name}</span>
          <span className="px-1.5 py-0.5 rounded text-xs font-semibold" style={{ background: st.requiresParts ? '#FDEDEC' : '#F0FDF4', color: st.requiresParts ? '#C0392B' : '#15803D' }}>
            {st.requiresParts ? 'Parts-Install' : 'No-Parts'}
          </span>
          {st.onlineBookable && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-semibold" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
              <Globe size={9} /> Online
            </span>
          )}
          {!st.onlineBookable && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-semibold" style={{ background: '#F9FAFB', color: '#9CA3AF' }}>
              <Lock size={9} /> Internal only
            </span>
          )}
        </div>
        <p style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>{st.description}</p>
        <div className="flex items-center gap-4 mt-2 flex-wrap">
          <span className="flex items-center gap-1" style={{ color: '#6B7280', fontSize: '0.8125rem' }}>
            <Clock size={12} /> {st.durationMinutes} min
          </span>
          <span className="flex items-center gap-1" style={{ color: '#6B7280', fontSize: '0.8125rem' }}>
            <DollarSign size={12} /> {fmtMoney(st.price)} labor
          </span>
          <span className="flex items-center gap-1" style={{ color: '#6B7280', fontSize: '0.8125rem' }}>
            <Shield size={12} /> {st.skillRequired}
          </span>
          <span className="px-1.5 py-0.5 rounded text-xs" style={{ background: '#F3F4F6', color: '#6B7280' }}>
            {st.slotModel === 'precise' ? 'Precise-slot' : 'Time-window'}
          </span>
        </div>
        {st.vehicleDurationOverrides.length > 0 && (
          <p style={{ color: '#F39C12', fontSize: '0.75rem', marginTop: '4px' }}>
            ⚠ Duration varies: {st.vehicleDurationOverrides.map(o => `${o.attribute} → ${o.durationMinutes}min`).join(', ')}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={onEdit} className="p-1.5 rounded-[6px] hover:bg-gray-100" style={{ color: '#6B7280' }}>
          <Pencil size={14} />
        </button>
        <button onClick={onDelete} className="p-1.5 rounded-[6px] hover:bg-red-50" style={{ color: '#EF4444' }}>
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Service Type Form ────────────────────────────────────────────────────────

function ServiceTypeForm({ initial, onSave, onCancel }: {
  initial?: Partial<ServiceType>;
  onSave: (st: ServiceType) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<ServiceType>({
    id: initial?.id ?? `st-${Date.now()}`,
    name: initial?.name ?? '',
    durationMinutes: initial?.durationMinutes ?? 30,
    price: initial?.price ?? 0,
    requiresParts: initial?.requiresParts ?? false,
    onlineBookable: initial?.onlineBookable ?? true,
    skillRequired: initial?.skillRequired ?? 'Tire Technician',
    pattern: initial?.pattern ?? 'No-Parts',
    vehicleDurationOverrides: initial?.vehicleDurationOverrides ?? [],
    addonIds: initial?.addonIds ?? [],
    slotModel: initial?.slotModel ?? 'time-slot',
    description: initial?.description ?? '',
  });

  const set = <K extends keyof ServiceType>(k: K, v: ServiceType[K]) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="bg-white rounded-[10px] p-5" style={{ border: '2px solid #C0392B', boxShadow: '0 4px 16px rgba(192,57,43,0.12)' }}>
      <div className="flex items-center justify-between mb-4">
        <h4 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A' }}>
          {initial?.id ? 'Edit Service Type' : 'New Service Type'}
        </h4>
        <button onClick={onCancel} className="p-1 rounded hover:bg-gray-100"><X size={16} style={{ color: '#9CA3AF' }} /></button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="col-span-2">
          <span style={lbl}>Service Name</span>
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g., Tire Rotation" style={inp} className="w-full" />
        </label>
        <label>
          <span style={lbl}>Duration (minutes)</span>
          <input type="number" value={form.durationMinutes} onChange={e => set('durationMinutes', +e.target.value)} style={inp} className="w-full" />
        </label>
        <label>
          <span style={lbl}>Labor Price ($)</span>
          <input type="number" step="0.01" value={form.price} onChange={e => set('price', +e.target.value)} style={inp} className="w-full" />
        </label>
        <label>
          <span style={lbl}>Skill Required</span>
          <select value={form.skillRequired} onChange={e => set('skillRequired', e.target.value)} style={inp} className="w-full">
            {SKILLS.map(s => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label>
          <span style={lbl}>Slot Model</span>
          <select value={form.slotModel} onChange={e => set('slotModel', e.target.value as 'precise' | 'time-slot')} style={inp} className="w-full">
            <option value="precise">Precise-slot (exact time)</option>
            <option value="time-slot">Time-window (Morning/Afternoon)</option>
          </select>
        </label>
        <label className="col-span-2">
          <span style={lbl}>Description</span>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} style={{ ...inp, resize: 'none' }} className="w-full" />
        </label>
        <div className="col-span-2 flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.requiresParts} onChange={e => { set('requiresParts', e.target.checked); set('pattern', e.target.checked ? 'Parts-Install' : 'No-Parts'); }} />
            <span style={{ fontSize: '0.875rem', color: '#1A1A1A' }}>Requires Parts (Parts-Install)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.onlineBookable} onChange={e => set('onlineBookable', e.target.checked)} />
            <span style={{ fontSize: '0.875rem', color: '#1A1A1A' }}>Customer-facing (online bookable)</span>
          </label>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button onClick={onCancel} className="flex-1 py-2 rounded-[6px] text-sm" style={{ border: '1.5px solid #E5E7EB', color: '#6B7280' }}>Cancel</button>
        <button
          onClick={() => { if (form.name) onSave(form); }}
          className="flex-1 py-2.5 rounded-[6px] text-sm text-white font-semibold"
          style={{ background: '#C0392B' }}
        >
          Save Service Type
        </button>
      </div>
    </div>
  );
}

// ─── Technician Card ─────────────────────────────────────────────────────────

function TechnicianCard({ tech, onEdit }: { tech: Technician; onEdit: () => void }) {
  const [expanded, setExpanded] = useState(false);

  const workDays = tech.availability.map(a => DAYS[a.dayOfWeek]).join(', ');

  return (
    <div className="bg-white rounded-[8px] overflow-hidden" style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white font-bold" style={{ background: tech.color }}>
          {tech.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.9375rem' }}>{tech.name}</span>
            {tech.customerFacing ? (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-semibold" style={{ background: '#F0FDF4', color: '#15803D' }}>
                <Globe size={9} /> Customer-facing
              </span>
            ) : (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-semibold" style={{ background: '#F9FAFB', color: '#9CA3AF' }}>
                <Lock size={9} /> Internal only
              </span>
            )}
          </div>
          <p style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>{tech.email}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {tech.skills.map(s => (
              <span key={s} className="px-1.5 py-0.5 rounded text-xs font-semibold" style={{ background: '#FDEDEC', color: '#C0392B' }}>{s}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onEdit} className="p-1.5 rounded hover:bg-gray-100" style={{ color: '#6B7280' }}>
            <Pencil size={14} />
          </button>
          <button onClick={() => setExpanded(x => !x)} className="p-1.5 rounded hover:bg-gray-100" style={{ color: '#9CA3AF' }}>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4" style={{ borderTop: '1px solid #F3F4F6' }}>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Schedule</p>
              <div className="space-y-1">
                {DAY_FULL.map((day, dow) => {
                  const avail = tech.availability.find(a => a.dayOfWeek === dow);
                  return (
                    <div key={day} className="flex items-center justify-between text-sm">
                      <span style={{ color: avail ? '#1A1A1A' : '#D1D5DB', width: '90px' }}>{day}</span>
                      {avail ? (
                        <span style={{ color: '#27AE60', fontSize: '0.8125rem' }}>{avail.startTime}–{avail.endTime}</span>
                      ) : (
                        <span style={{ color: '#D1D5DB', fontSize: '0.8125rem' }}>Off</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Service Area (ZIPs)</p>
              <div className="flex flex-wrap gap-1">
                {tech.serviceArea.length > 0
                  ? tech.serviceArea.map(z => <span key={z} className="px-2 py-0.5 rounded text-xs" style={{ background: '#F3F4F6', color: '#6B7280' }}>{z}</span>)
                  : <span style={{ color: '#D1D5DB', fontSize: '0.8125rem' }}>All areas</span>
                }
              </div>
              {tech.timeOff.length > 0 && (
                <>
                  <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '12px', marginBottom: '6px' }}>Upcoming Time Off</p>
                  {tech.timeOff.map(t => (
                    <div key={t.id} className="p-2 rounded-[6px] mb-1" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
                      <p style={{ fontWeight: 600, color: '#92400E', fontSize: '0.8125rem' }}>{t.dateFrom} → {t.dateTo}</p>
                      <p style={{ color: '#B45309', fontSize: '0.75rem' }}>{t.reason}</p>
                    </div>
                  ))}
                </>
              )}
              {tech.buffers.length > 0 && (
                <>
                  <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '12px', marginBottom: '6px' }}>Job Buffers</p>
                  {tech.buffers.map((b, i) => (
                    <p key={i} style={{ color: '#6B7280', fontSize: '0.8125rem' }}>
                      {b.serviceTypeId}: +{b.travelBefore}min before, +{b.cleanupAfter}min after
                    </p>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Location Calendar ────────────────────────────────────────────────────────

const LOCATION_HOURS: Record<number, { open: string; close: string; closed: boolean }> = {
  0: { open: '', close: '', closed: true },
  1: { open: '08:00', close: '18:00', closed: false },
  2: { open: '08:00', close: '18:00', closed: false },
  3: { open: '08:00', close: '18:00', closed: false },
  4: { open: '08:00', close: '18:00', closed: false },
  5: { open: '08:00', close: '18:00', closed: false },
  6: { open: '09:00', close: '14:00', closed: false },
};

function LocationCalendar() {
  const [hours, setHours] = useState(LOCATION_HOURS);
  const [saved, setSaved] = useState(false);

  const setDay = (dow: number, key: 'open' | 'close' | 'closed', val: string | boolean) =>
    setHours(h => ({ ...h, [dow]: { ...h[dow], [key]: val } }));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1rem' }}>Location Hours</h4>
          <p style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>Changes propagate to slot computation within 60 seconds.</p>
        </div>
        <button
          onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[6px] text-sm text-white font-semibold"
          style={{ background: saved ? '#27AE60' : '#C0392B' }}
        >
          {saved ? <><CheckCircle2 size={14} /> Saved</> : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white rounded-[10px] overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
        {DAY_FULL.map((day, dow) => {
          const h = hours[dow];
          return (
            <div key={day} className="flex items-center gap-4 px-5 py-3" style={{ borderBottom: dow < 6 ? '1px solid #F3F4F6' : 'none' }}>
              <span style={{ width: '90px', color: h.closed ? '#D1D5DB' : '#1A1A1A', fontWeight: 500, fontSize: '0.875rem' }}>{day}</span>
              <label className="flex items-center gap-2 cursor-pointer shrink-0">
                <div
                  className="w-9 h-5 rounded-full relative transition-colors cursor-pointer"
                  style={{ background: !h.closed ? '#C0392B' : '#D1D5DB' }}
                  onClick={() => setDay(dow, 'closed', !h.closed)}
                >
                  <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all" style={{ left: !h.closed ? '18px' : '2px' }} />
                </div>
                <span style={{ fontSize: '0.8125rem', color: '#6B7280', width: '32px' }}>{h.closed ? 'Off' : 'Open'}</span>
              </label>
              {!h.closed && (
                <div className="flex items-center gap-2">
                  <input type="time" value={h.open} onChange={e => setDay(dow, 'open', e.target.value)} style={{ ...inp, width: '110px', fontSize: '0.875rem' }} />
                  <span style={{ color: '#9CA3AF' }}>–</span>
                  <input type="time" value={h.close} onChange={e => setDay(dow, 'close', e.target.value)} style={{ ...inp, width: '110px', fontSize: '0.875rem' }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Time-slot window config */}
      <div className="mt-6">
        <h4 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1rem', marginBottom: '12px' }}>Time-Slot Windows</h4>
        <div className="space-y-2">
          {[
            { label: 'Morning', time: '8:00 AM – 11:00 AM', maxJobs: 4, segment: 'mixed' },
            { label: 'Afternoon', time: '12:00 PM – 3:00 PM', maxJobs: 4, segment: 'retail' },
            { label: 'Evening', time: '3:00 PM – 6:00 PM', maxJobs: 2, segment: 'retail' },
          ].map(w => (
            <div key={w.label} className="bg-white p-4 rounded-[8px] flex items-center justify-between" style={{ border: '1px solid #E5E7EB' }}>
              <div>
                <p style={{ fontWeight: 600, color: '#1A1A1A' }}>{w.label}</p>
                <p style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>{w.time} · max {w.maxJobs} jobs</p>
              </div>
              <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: w.segment === 'mixed' ? '#F0FDF4' : '#EFF6FF', color: w.segment === 'mixed' ? '#15803D' : '#1D4ED8' }}>
                {w.segment}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const lbl: React.CSSProperties = { display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', marginBottom: '4px' };
const inp: React.CSSProperties = { border: '1.5px solid #E5E7EB', borderRadius: '6px', padding: '8px 12px', fontSize: '0.875rem', outline: 'none', color: '#1A1A1A', fontFamily: 'Inter, sans-serif', background: '#fff' };

// ─── Main ServiceSetup ────────────────────────────────────────────────────────

export function ServiceSetup() {
  const [tab, setTab] = useState<SetupTab>('services');
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>(INIT_TYPES);
  const [techs] = useState<Technician[]>(INIT_TECHS);
  const [addingService, setAddingService] = useState(false);
  const [editingService, setEditingService] = useState<ServiceType | null>(null);

  const TABS: { id: SetupTab; label: string }[] = [
    { id: 'services', label: 'Service Types' },
    { id: 'technicians', label: 'Technicians' },
    { id: 'calendar', label: 'Location Calendar' },
  ];

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex gap-1 mb-6 p-1 rounded-[8px] w-fit" style={{ background: '#F3F4F6' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-4 py-2 rounded-[6px] text-sm font-medium transition-colors"
            style={{ background: tab === t.id ? '#fff' : 'transparent', color: tab === t.id ? '#1A1A1A' : '#6B7280', boxShadow: tab === t.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Services tab ── */}
      {tab === 'services' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.125rem' }}>Service Types</h3>
              <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>{serviceTypes.length} services configured</p>
            </div>
            <button
              onClick={() => { setAddingService(true); setEditingService(null); }}
              className="flex items-center gap-2 px-4 py-2 rounded-[6px] text-white text-sm font-semibold"
              style={{ background: '#C0392B' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#A93226')}
              onMouseLeave={e => (e.currentTarget.style.background = '#C0392B')}
            >
              <Plus size={15} /> Add Service
            </button>
          </div>

          {(addingService || editingService) && (
            <div className="mb-4">
              <ServiceTypeForm
                initial={editingService ?? {}}
                onSave={st => {
                  if (editingService) {
                    setServiceTypes(ts => ts.map(t => t.id === st.id ? st : t));
                  } else {
                    setServiceTypes(ts => [...ts, st]);
                  }
                  setAddingService(false);
                  setEditingService(null);
                }}
                onCancel={() => { setAddingService(false); setEditingService(null); }}
              />
            </div>
          )}

          <div className="space-y-2">
            {serviceTypes.map(st => (
              <ServiceTypeCard
                key={st.id}
                st={st}
                onEdit={() => { setEditingService(st); setAddingService(false); }}
                onDelete={() => setServiceTypes(ts => ts.filter(t => t.id !== st.id))}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Technicians tab ── */}
      {tab === 'technicians' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.125rem' }}>Technicians</h3>
              <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
                {techs.filter(t => t.customerFacing).length} customer-facing · {techs.filter(t => !t.customerFacing).length} internal
              </p>
            </div>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-[6px] text-white text-sm font-semibold"
              style={{ background: '#C0392B' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#A93226')}
              onMouseLeave={e => (e.currentTarget.style.background = '#C0392B')}
            >
              <Plus size={15} /> Add Technician
            </button>
          </div>
          <div className="space-y-2">
            {techs.map(t => (
              <TechnicianCard key={t.id} tech={t} onEdit={() => {}} />
            ))}
          </div>

          {/* Availability legend */}
          <div className="mt-6 p-4 rounded-[8px]" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
            <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.875rem', marginBottom: '8px' }}>Weekly Coverage</p>
            <div className="grid grid-cols-7 gap-1">
              {DAY_FULL.map((day, dow) => {
                const working = techs.filter(t => t.customerFacing && t.availability.some(a => a.dayOfWeek === dow));
                return (
                  <div key={day} className="text-center">
                    <div className="text-xs mb-1" style={{ color: '#9CA3AF', fontWeight: 600 }}>{DAYS[dow]}</div>
                    <div className="w-full rounded-[4px] flex items-center justify-center py-1.5" style={{ background: working.length > 0 ? '#F0FDF4' : '#F9FAFB', border: '1px solid #E5E7EB' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: working.length > 0 ? '#15803D' : '#D1D5DB' }}>{working.length}</span>
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>techs</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Calendar tab ── */}
      {tab === 'calendar' && <LocationCalendar />}
    </div>
  );
}

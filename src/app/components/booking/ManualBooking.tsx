import { useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, Search, Plus, Check,
  AlertTriangle, Package, Clock, CreditCard, Smartphone,
  DollarSign, CheckCircle2, Car, User,
} from 'lucide-react';
import { SERVICE_TYPES, ADDON_SERVICES, CUSTOMERS, JOB_TEMPLATES, computeDayAvailability, computeDaySlots } from './mockData';
import type { BookableSlot, AddonService, JobTemplate } from './types';

const TODAY = '2026-06-14';
const REF = new Date(TODAY + 'T12:00:00');
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function toDateStr(d: Date) { return d.toISOString().slice(0, 10); }
function fmtTime(iso: string) { return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }); }
function fmtMoney(n: number) { return `R ${n.toFixed(2)}`; }

type Step = 1 | 2 | 3 | 4 | 5 | 6;
const STEP_LABELS = ['Customer', 'Vehicle', 'Service', 'Add-ons', 'Date & Time', 'Payment'];

interface BookingState {
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  vehicleYear: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleTrim: string;
  vehiclePlate: string;
  serviceTypeId: string;
  templateId: string;
  selectedAddons: Record<string, number>; // addonId → qty
  selectedSlot: BookableSlot | null;
  selectedDate: string;
  paymentMethod: string;
  overrideConstraints: boolean;
  overrideReason: string;
  notes: string;
}

const INIT: BookingState = {
  customerId: '', customerName: '', customerPhone: '', customerEmail: '',
  vehicleYear: '', vehicleMake: '', vehicleModel: '', vehicleTrim: '', vehiclePlate: '',
  serviceTypeId: 'st-1', templateId: '',
  selectedAddons: {}, selectedSlot: null, selectedDate: '',
  paymentMethod: 'stripe_terminal', overrideConstraints: false, overrideReason: '', notes: '',
};

interface Props {
  onComplete?: () => void;
}

export function ManualBooking({ onComplete }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [booking, setBooking] = useState<BookingState>(INIT);
  const [custSearch, setCustSearch] = useState('');
  const [showOverridePrompt, setShowOverridePrompt] = useState(false);
  const [viewMonth, setViewMonth] = useState({ year: 2026, month: 5 });
  const [confirmed, setConfirmed] = useState(false);

  const set = <K extends keyof BookingState>(k: K, v: BookingState[K]) =>
    setBooking(b => ({ ...b, [k]: v }));

  const st = SERVICE_TYPES.find(s => s.id === booking.serviceTypeId)!;

  const availability = useMemo(() =>
    computeDayAvailability(booking.serviceTypeId, REF),
    [booking.serviceTypeId],
  );
  const availMap = useMemo(() => {
    const m: Record<string, boolean> = {};
    availability.forEach(a => { m[a.date] = a.hasSlots && a.partsReady; });
    return m;
  }, [availability]);

  const daySlots = useMemo(() =>
    booking.selectedDate ? computeDaySlots(booking.selectedDate, booking.serviceTypeId) : [],
    [booking.selectedDate, booking.serviceTypeId],
  );

  const selectedAddonsDetail: (AddonService & { qty: number })[] = useMemo(() => {
    const addons = st?.addonIds?.map(id => ADDON_SERVICES.find(a => a.id === id)).filter(Boolean) as AddonService[] ?? [];
    return addons.filter(a => (booking.selectedAddons[a.id] ?? 0) > 0).map(a => ({ ...a, qty: booking.selectedAddons[a.id] }));
  }, [booking.selectedAddons, st]);

  const totalAddonDuration = selectedAddonsDetail.reduce((s, a) => s + a.durationMinutes * (a.perUnit ? a.qty : 1), 0);
  const totalAddonPrice = selectedAddonsDetail.reduce((s, a) => s + a.price * a.qty, 0);
  const laborPrice = st?.price ?? 0;
  const subtotal = laborPrice + totalAddonPrice;
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const filteredCustomers = useMemo(() =>
    CUSTOMERS.filter(c =>
      !custSearch ||
      c.name.toLowerCase().includes(custSearch.toLowerCase()) ||
      c.phone.includes(custSearch) ||
      c.email.toLowerCase().includes(custSearch.toLowerCase()),
    ),
    [custSearch],
  );

  // Calendar grid
  const firstDay = new Date(viewMonth.year, viewMonth.month, 1).getDay();
  const daysInMonth = new Date(viewMonth.year, viewMonth.month + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => toDateStr(new Date(viewMonth.year, viewMonth.month, i + 1))),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const applyTemplate = (tpl: JobTemplate) => {
    set('serviceTypeId', tpl.serviceTypeId);
    set('templateId', tpl.id);
    const defaults: Record<string, number> = {};
    tpl.recommendedAddonIds.forEach(id => { defaults[id] = 1; });
    set('selectedAddons', defaults);
  };

  if (confirmed) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: '#F0FDF4' }}>
          <CheckCircle2 size={32} style={{ color: '#27AE60' }} />
        </div>
        <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.375rem', marginBottom: '8px' }}>
          Booking Confirmed!
        </h3>
        <p style={{ color: '#6B7280', fontSize: '0.9375rem', maxWidth: '400px', marginBottom: '8px' }}>
          {booking.customerName} · {st.name}
        </p>
        {booking.selectedSlot && (
          <p style={{ color: '#C0392B', fontWeight: 600, marginBottom: '24px' }}>
            {booking.selectedDate} at {fmtTime(booking.selectedSlot.slotStart)} · {booking.selectedSlot.technicianName}
          </p>
        )}
        {booking.overrideConstraints && (
          <div className="mb-6 p-3 rounded-[6px]" style={{ background: '#FFF7ED', border: '1px solid #FED7AA', maxWidth: '400px' }}>
            <p style={{ color: '#92400E', fontSize: '0.8125rem' }}>⚠ Override logged: {booking.overrideReason}</p>
          </div>
        )}
        <button
          onClick={() => { setStep(1); setBooking(INIT); setConfirmed(false); if (onComplete) onComplete(); }}
          className="px-6 py-2.5 rounded-[6px] text-white font-semibold"
          style={{ background: '#C0392B' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#A93226')}
          onMouseLeave={e => (e.currentTarget.style.background = '#C0392B')}
        >
          Book Another
        </button>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {STEP_LABELS.map((label, i) => {
          const n = (i + 1) as Step;
          const done = step > n;
          const active = step === n;
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: done ? '#27AE60' : active ? '#C0392B' : '#E5E7EB', color: done || active ? '#fff' : '#9CA3AF' }}
                >
                  {done ? <Check size={14} /> : <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{n}</span>}
                </div>
                <span style={{ fontSize: '0.625rem', color: active ? '#C0392B' : done ? '#27AE60' : '#9CA3AF', fontWeight: active ? 700 : 400, whiteSpace: 'nowrap' }}>
                  {label}
                </span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className="flex-1 h-0.5 mx-1 mb-4" style={{ background: done ? '#27AE60' : '#E5E7EB' }} />
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-[10px] p-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>

        {/* ── Step 1: Customer ── */}
        {step === 1 && (
          <div>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.125rem', marginBottom: '16px' }}>Find or Create Customer</h3>
            <div className="relative mb-4">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
              <input
                value={custSearch}
                onChange={e => setCustSearch(e.target.value)}
                placeholder="Search by name, phone, or email…"
                className="w-full pl-9 pr-4 py-2.5 rounded-[6px] text-sm"
                style={{ border: '1.5px solid #E5E7EB', outline: 'none', color: '#1A1A1A' }}
              />
            </div>
            <div className="space-y-2 mb-4">
              {filteredCustomers.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    set('customerId', c.id);
                    set('customerName', c.name);
                    set('customerPhone', c.phone);
                    set('customerEmail', c.email);
                  }}
                  className="w-full text-left p-3 rounded-[8px] flex items-center gap-3 transition-all"
                  style={{
                    border: booking.customerId === c.id ? '2px solid #C0392B' : '1.5px solid #E5E7EB',
                    background: booking.customerId === c.id ? '#FDEDEC' : '#fff',
                  }}
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: '#FDEDEC', color: '#C0392B', fontWeight: 700 }}>
                    {c.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.9375rem' }}>{c.name}</p>
                    <p style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>{c.phone} · {c.totalVisits} visits · {c.vehicles.length} vehicles</p>
                  </div>
                  {booking.customerId === c.id && <CheckCircle2 size={18} style={{ color: '#C0392B', flexShrink: 0 }} />}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                set('customerId', 'new');
                set('customerName', '');
                set('customerPhone', '');
                set('customerEmail', '');
              }}
              className="flex items-center gap-2 w-full p-3 rounded-[8px] text-sm"
              style={{
                border: booking.customerId === 'new' ? '2px solid #C0392B' : '1.5px dashed #D1D5DB',
                background: booking.customerId === 'new' ? '#FDEDEC' : '#F9FAFB',
                color: booking.customerId === 'new' ? '#C0392B' : '#9CA3AF',
              }}
            >
              <Plus size={15} /> Create New Customer
            </button>
            {booking.customerId === 'new' && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                {[
                  { label: 'Full Name', key: 'customerName' as const, placeholder: 'Jane Smith' },
                  { label: 'Phone', key: 'customerPhone' as const, placeholder: '+27 XX XXX XXXX' },
                  { label: 'Email', key: 'customerEmail' as const, placeholder: 'jane@email.com' },
                ].map(f => (
                  <label key={f.key} className={f.key === 'customerEmail' ? 'col-span-2' : ''}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '4px' }}>{f.label}</span>
                    <input
                      value={(booking as Record<string, string>)[f.key] ?? ''}
                      onChange={e => set(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2 rounded-[6px] text-sm"
                      style={{ border: '1.5px solid #E5E7EB', outline: 'none', color: '#1A1A1A' }}
                    />
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Vehicle ── */}
        {step === 2 && (
          <div>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.125rem', marginBottom: '16px' }}>Vehicle Details</h3>
            {booking.customerId && booking.customerId !== 'new' && (
              <div className="mb-4">
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Existing Vehicles</p>
                <div className="space-y-2">
                  {(CUSTOMERS.find(c => c.id === booking.customerId)?.vehicles ?? []).map((v, i) => {
                    const match = booking.vehicleYear === v.year && booking.vehicleMake === v.make && booking.vehicleModel === v.model;
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          set('vehicleYear', v.year); set('vehicleMake', v.make);
                          set('vehicleModel', v.model); set('vehicleTrim', v.trim ?? '');
                          set('vehiclePlate', v.licensePlate ?? '');
                        }}
                        className="w-full text-left p-3 rounded-[8px] flex items-center gap-3"
                        style={{ border: match ? '2px solid #C0392B' : '1.5px solid #E5E7EB', background: match ? '#FDEDEC' : '#fff' }}
                      >
                        <Car size={16} style={{ color: match ? '#C0392B' : '#9CA3AF', flexShrink: 0 }} />
                        <div>
                          <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.9375rem' }}>
                            {v.year} {v.make} {v.model} {v.trim ?? ''}
                          </p>
                          <p style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>{v.licensePlate ?? ''} {v.attribute ? `· ${v.attribute}` : ''}</p>
                        </div>
                        {match && <CheckCircle2 size={16} style={{ color: '#C0392B', marginLeft: 'auto' }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Or Enter Manually</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Year', key: 'vehicleYear' as const, placeholder: '2022' },
                { label: 'Make', key: 'vehicleMake' as const, placeholder: 'Ford' },
                { label: 'Model', key: 'vehicleModel' as const, placeholder: 'F-150' },
                { label: 'Trim (optional)', key: 'vehicleTrim' as const, placeholder: 'XLT' },
                { label: 'License Plate (optional)', key: 'vehiclePlate' as const, placeholder: 'TX-ABC123' },
              ].map(f => (
                <label key={f.key} className={f.key === 'vehiclePlate' ? 'col-span-2' : ''}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '4px' }}>{f.label}</span>
                  <input
                    value={(booking as Record<string, string>)[f.key] ?? ''}
                    onChange={e => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2 rounded-[6px] text-sm"
                    style={{ border: '1.5px solid #E5E7EB', outline: 'none', color: '#1A1A1A' }}
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 3: Service + Template ── */}
        {step === 3 && (
          <div>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.125rem', marginBottom: '4px' }}>Select Service</h3>
            <p style={{ color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '16px' }}>Use a template for one-action pre-fill, or pick manually.</p>

            {/* Job templates */}
            <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Quick Templates</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
              {JOB_TEMPLATES.map(tpl => (
                <button
                  key={tpl.id}
                  onClick={() => applyTemplate(tpl)}
                  className="p-3 rounded-[8px] text-left transition-all"
                  style={{
                    border: booking.templateId === tpl.id ? '2px solid #C0392B' : '1.5px solid #E5E7EB',
                    background: booking.templateId === tpl.id ? '#FDEDEC' : '#fff',
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{tpl.icon}</span>
                  <p style={{ fontWeight: 600, color: booking.templateId === tpl.id ? '#C0392B' : '#1A1A1A', fontSize: '0.8125rem', marginTop: '6px' }}>{tpl.name}</p>
                  <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>{fmtMoney(tpl.price)}</p>
                </button>
              ))}
            </div>

            {/* All service types */}
            <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>All Services</p>
            <div className="space-y-2">
              {SERVICE_TYPES.map(s => (
                <button
                  key={s.id}
                  onClick={() => { set('serviceTypeId', s.id); set('templateId', ''); }}
                  className="w-full text-left p-3 rounded-[8px] flex items-center justify-between"
                  style={{
                    border: booking.serviceTypeId === s.id && !booking.templateId ? '2px solid #C0392B' : '1.5px solid #E5E7EB',
                    background: booking.serviceTypeId === s.id && !booking.templateId ? '#FDEDEC' : '#fff',
                  }}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontWeight: 600, color: booking.serviceTypeId === s.id && !booking.templateId ? '#C0392B' : '#1A1A1A', fontSize: '0.9375rem' }}>{s.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-xs font-semibold" style={{ background: s.requiresParts ? '#FDEDEC' : '#F0FDF4', color: s.requiresParts ? '#C0392B' : '#15803D' }}>
                        {s.requiresParts ? 'Parts-Install' : 'No-Parts'}
                      </span>
                    </div>
                    <p style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>{s.durationMinutes} min · {s.skillRequired}</p>
                  </div>
                  <span style={{ fontWeight: 700, color: '#C0392B' }}>{fmtMoney(s.price)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 4: Add-ons ── */}
        {step === 4 && (
          <div>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.125rem', marginBottom: '4px' }}>Add-on Services</h3>
            <p style={{ color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '16px' }}>Optional — selecting updates duration and price in real time.</p>

            {(st?.addonIds?.map(id => ADDON_SERVICES.find(a => a.id === id)).filter(Boolean) as AddonService[]).map(a => {
              const qty = booking.selectedAddons[a.id] ?? 0;
              const selected = qty > 0;
              return (
                <button
                  key={a.id}
                  onClick={() => set('selectedAddons', { ...booking.selectedAddons, [a.id]: selected ? 0 : 1 })}
                  className="w-full text-left p-4 rounded-[8px] mb-2 flex items-center justify-between transition-all"
                  style={{ border: selected ? '2px solid #C0392B' : '1.5px solid #E5E7EB', background: selected ? '#FDEDEC' : '#fff' }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center mt-0.5 shrink-0"
                      style={{ background: selected ? '#C0392B' : '#fff', border: selected ? 'none' : '1.5px solid #D1D5DB' }}
                    >
                      {selected && <Check size={12} color="#fff" />}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.9375rem' }}>{a.name}</p>
                      <p style={{ color: '#6B7280', fontSize: '0.8125rem', marginTop: '2px' }}>{a.description}</p>
                      {a.durationMinutes > 0 && (
                        <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '2px' }}>+{a.durationMinutes} min</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p style={{ fontWeight: 700, color: '#C0392B' }}>{fmtMoney(a.price)}{a.perUnit ? '/unit' : ''}</p>
                    {selected && a.perUnit && (
                      <div className="flex items-center gap-2 mt-1 justify-end">
                        <button
                          onClick={e => { e.stopPropagation(); set('selectedAddons', { ...booking.selectedAddons, [a.id]: Math.max(1, qty - 1) }); }}
                          className="w-6 h-6 rounded flex items-center justify-center"
                          style={{ background: '#F3F4F6', fontSize: '1rem', color: '#6B7280' }}
                        >−</button>
                        <span style={{ fontWeight: 700, color: '#1A1A1A', minWidth: '20px', textAlign: 'center' }}>{qty}</span>
                        <button
                          onClick={e => { e.stopPropagation(); set('selectedAddons', { ...booking.selectedAddons, [a.id]: qty + 1 }); }}
                          className="w-6 h-6 rounded flex items-center justify-center"
                          style={{ background: '#F3F4F6', fontSize: '1rem', color: '#6B7280' }}
                        >+</button>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}

            {/* Live price summary */}
            <div className="mt-4 p-4 rounded-[8px]" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
              <div className="flex justify-between mb-1">
                <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>Base service ({st?.durationMinutes ?? 0} min)</span>
                <span style={{ color: '#1A1A1A', fontSize: '0.875rem' }}>{fmtMoney(laborPrice)}</span>
              </div>
              {selectedAddonsDetail.map(a => (
                <div key={a.id} className="flex justify-between mb-1">
                  <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>{a.name} {a.qty > 1 ? `×${a.qty}` : ''}{a.durationMinutes > 0 ? ` (+${a.durationMinutes * (a.perUnit ? a.qty : 1)} min)` : ''}</span>
                  <span style={{ color: '#1A1A1A', fontSize: '0.875rem' }}>{fmtMoney(a.price * a.qty)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 mt-1" style={{ borderTop: '1px solid #E5E7EB' }}>
                <span style={{ fontWeight: 700, color: '#1A1A1A' }}>Total duration</span>
                <span style={{ fontWeight: 700, color: '#C0392B' }}>{(st?.durationMinutes ?? 0) + totalAddonDuration} min</span>
              </div>
              <div className="flex justify-between mt-0.5">
                <span style={{ fontWeight: 700, color: '#1A1A1A' }}>Estimated total (incl. tax)</span>
                <span style={{ fontWeight: 700, color: '#C0392B' }}>{fmtMoney(total)}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 5: Date & Time ── */}
        {step === 5 && (
          <div>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.125rem', marginBottom: '4px' }}>Pick Date & Time</h3>
            {st?.requiresParts && (
              <div className="flex items-start gap-2 p-3 rounded-[6px] mb-4" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
                <AlertTriangle size={14} style={{ color: '#F39C12', marginTop: '1px', flexShrink: 0 }} />
                <p style={{ color: '#92400E', fontSize: '0.8125rem', lineHeight: 1.4 }}>
                  <strong>Parts-Install service.</strong> Parts ETA ~2 business days. Earliest available slot is June 16. Slots before that date are parts-blocked unless staff override is used.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Mini calendar */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <button onClick={() => setViewMonth(v => v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 })} className="p-1.5 rounded hover:bg-gray-100">
                    <ChevronLeft size={16} style={{ color: '#6B7280' }} />
                  </button>
                  <span style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>{MONTHS[viewMonth.month]} {viewMonth.year}</span>
                  <button onClick={() => setViewMonth(v => v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 })} className="p-1.5 rounded hover:bg-gray-100">
                    <ChevronRight size={16} style={{ color: '#6B7280' }} />
                  </button>
                </div>
                <div className="grid grid-cols-7 mb-1">
                  {WEEKDAYS.map(d => (
                    <div key={d} className="text-center" style={{ fontSize: '0.5625rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-0.5">
                  {cells.map((dateStr, idx) => {
                    if (!dateStr) return <div key={idx} />;
                    const avail = availMap[dateStr] && dateStr >= TODAY;
                    const isSel = dateStr === booking.selectedDate;
                    const isPast = dateStr < TODAY;
                    return (
                      <button
                        key={dateStr}
                        disabled={!avail}
                        onClick={() => { set('selectedDate', dateStr); set('selectedSlot', null); }}
                        className="aspect-square rounded-[4px] flex items-center justify-center text-xs transition-all"
                        style={{
                          background: isSel ? '#C0392B' : avail ? '#FDEDEC' : 'transparent',
                          color: isSel ? '#fff' : avail ? '#C0392B' : isPast ? '#D1D5DB' : '#9CA3AF',
                          fontWeight: isSel ? 700 : 400,
                          cursor: avail ? 'pointer' : 'not-allowed',
                          border: isSel ? '1.5px solid #C0392B' : 'none',
                          opacity: isPast ? 0.4 : 1,
                        }}
                      >
                        {new Date(dateStr + 'T12:00:00').getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slot chips */}
              <div>
                {!booking.selectedDate ? (
                  <div className="flex items-center justify-center h-full" style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
                    ← Select a date
                  </div>
                ) : (
                  <>
                    <p style={{ fontWeight: 600, color: '#1A1A1A', marginBottom: '10px', fontSize: '0.9375rem' }}>
                      {new Date(booking.selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </p>
                    {daySlots.length === 0 ? (
                      <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>No slots available on this day.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {daySlots.map((slot, i) => {
                          const blocked = slot.partsBlocked || !slot.available;
                          const isSel = booking.selectedSlot?.slotStart === slot.slotStart;
                          return (
                            <button
                              key={i}
                              disabled={blocked}
                              onClick={() => set('selectedSlot', slot)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-sm transition-all"
                              style={{
                                background: isSel ? '#C0392B' : blocked ? '#F9FAFB' : '#fff',
                                border: isSel ? '1.5px solid #C0392B' : '1.5px solid #E5E7EB',
                                color: isSel ? '#fff' : blocked ? '#D1D5DB' : '#1A1A1A',
                                cursor: blocked ? 'not-allowed' : 'pointer',
                              }}
                            >
                              <Clock size={11} /> {fmtTime(slot.slotStart)}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {booking.selectedSlot && (
                      <div className="mt-4 p-3 rounded-[6px]" style={{ background: '#FDEDEC', border: '1px solid #F5B7B1' }}>
                        <p style={{ fontWeight: 600, color: '#C0392B', fontSize: '0.875rem' }}>
                          {fmtTime(booking.selectedSlot.slotStart)} · {booking.selectedSlot.technicianName}
                        </p>
                        <p style={{ color: '#6B7280', fontSize: '0.8125rem' }}>
                          {(st?.durationMinutes ?? 0) + totalAddonDuration} min total (labor + add-ons)
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Override prompt */}
            <div className="mt-4">
              <button
                onClick={() => setShowOverridePrompt(!showOverridePrompt)}
                className="flex items-center gap-1.5 text-sm"
                style={{ color: '#9CA3AF' }}
              >
                <AlertTriangle size={13} /> Dispatcher override (ignore parts/availability constraints)
              </button>
              {showOverridePrompt && (
                <div className="mt-2 p-3 rounded-[6px]" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
                  <p style={{ color: '#92400E', fontSize: '0.8125rem', marginBottom: '8px' }}>
                    ⚠ Overriding constraints. This action will be logged with reason.
                  </p>
                  <input
                    value={booking.overrideReason}
                    onChange={e => set('overrideReason', e.target.value)}
                    placeholder="Enter override reason (required)…"
                    className="w-full px-3 py-2 rounded-[6px] text-sm mb-2"
                    style={{ border: '1.5px solid #FCA5A5', outline: 'none' }}
                  />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={booking.overrideConstraints}
                      onChange={e => set('overrideConstraints', e.target.checked)}
                    />
                    <span style={{ fontSize: '0.8125rem', color: '#92400E' }}>I confirm this override and accept responsibility</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Step 6: Payment ── */}
        {step === 6 && (
          <div>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.125rem', marginBottom: '16px' }}>Payment Method</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { id: 'stripe_terminal', label: 'Stripe Terminal', icon: CreditCard, desc: 'In-shop card reader' },
                { id: 'tap_to_pay', label: 'Tap to Pay', icon: Smartphone, desc: 'iPhone / Android' },
                { id: 'card_manual', label: 'Manual Card Entry', icon: CreditCard, desc: 'Type card number' },
                { id: 'paid_offline', label: 'Mark as Paid Offline', icon: DollarSign, desc: 'Cash, check, etc.' },
              ].map(pm => {
                const Icon = pm.icon;
                const sel = booking.paymentMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    onClick={() => set('paymentMethod', pm.id)}
                    className="p-4 rounded-[8px] text-left transition-all"
                    style={{ border: sel ? '2px solid #C0392B' : '1.5px solid #E5E7EB', background: sel ? '#FDEDEC' : '#fff' }}
                  >
                    <Icon size={20} style={{ color: sel ? '#C0392B' : '#9CA3AF', marginBottom: '6px' }} />
                    <p style={{ fontWeight: 600, color: sel ? '#C0392B' : '#1A1A1A', fontSize: '0.9375rem' }}>{pm.label}</p>
                    <p style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>{pm.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Booking summary */}
            <div className="rounded-[8px] p-4 mb-4" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
              <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem', marginBottom: '10px' }}>Booking Summary</p>
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <User size={13} style={{ color: '#9CA3AF', marginTop: '2px' }} />
                  <span style={{ color: '#1A1A1A', fontSize: '0.875rem' }}>{booking.customerName || '—'}</span>
                </div>
                <div className="flex gap-2">
                  <Car size={13} style={{ color: '#9CA3AF', marginTop: '2px' }} />
                  <span style={{ color: '#1A1A1A', fontSize: '0.875rem' }}>{[booking.vehicleYear, booking.vehicleMake, booking.vehicleModel].filter(Boolean).join(' ') || '—'}</span>
                </div>
                <div className="flex gap-2">
                  <Package size={13} style={{ color: '#9CA3AF', marginTop: '2px' }} />
                  <span style={{ color: '#1A1A1A', fontSize: '0.875rem' }}>{st?.name}</span>
                </div>
                {booking.selectedSlot && (
                  <div className="flex gap-2">
                    <Clock size={13} style={{ color: '#9CA3AF', marginTop: '2px' }} />
                    <span style={{ color: '#1A1A1A', fontSize: '0.875rem' }}>
                      {booking.selectedDate} at {fmtTime(booking.selectedSlot.slotStart)} · {booking.selectedSlot.technicianName}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 mt-1" style={{ borderTop: '1px solid #E5E7EB' }}>
                  <span style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>Total (labor only)</span>
                  <span style={{ fontWeight: 700, color: '#C0392B', fontSize: '1rem' }}>{fmtMoney(total)}</span>
                </div>
              </div>
            </div>

            <textarea
              value={booking.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Staff notes for this booking (optional)…"
              rows={2}
              className="w-full px-3 py-2 rounded-[6px] text-sm resize-none"
              style={{ border: '1.5px solid #E5E7EB', outline: 'none', color: '#1A1A1A' }}
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-5">
        <button
          onClick={() => step > 1 && setStep(s => (s - 1) as Step)}
          disabled={step === 1}
          className="flex items-center gap-2 px-4 py-2 rounded-[6px]"
          style={{ border: '1.5px solid #E5E7EB', color: step === 1 ? '#D1D5DB' : '#6B7280', background: '#fff', cursor: step === 1 ? 'default' : 'pointer' }}
        >
          <ChevronLeft size={16} /> Back
        </button>
        {step < 6 ? (
          <button
            onClick={() => setStep(s => (s + 1) as Step)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-[6px] text-white font-semibold"
            style={{ background: '#C0392B' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#A93226')}
            onMouseLeave={e => (e.currentTarget.style.background = '#C0392B')}
          >
            Continue <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={() => setConfirmed(true)}
            disabled={!booking.selectedSlot && !booking.overrideConstraints}
            className="flex items-center gap-2 px-5 py-2.5 rounded-[6px] text-white font-semibold"
            style={{
              background: booking.selectedSlot || booking.overrideConstraints ? '#C0392B' : '#D1D5DB',
              cursor: booking.selectedSlot || booking.overrideConstraints ? 'pointer' : 'not-allowed',
            }}
          >
            Confirm Booking <CheckCircle2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

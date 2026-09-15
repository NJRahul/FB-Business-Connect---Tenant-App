import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, User, AlertTriangle, CheckCircle } from 'lucide-react';
import { SERVICE_TYPES, computeDayAvailability, computeDaySlots } from './mockData';
import type { BookableSlot, DayAvailability } from './types';

const TODAY = '2026-06-14';
const REF = new Date(TODAY + 'T12:00:00');

function addDays(base: Date, n: number): Date {
  const d = new Date(base); d.setDate(d.getDate() + n); return d;
}
function toDateStr(d: Date) { return d.toISOString().slice(0, 10); }
function fmt(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface Props {
  onSlotBooked?: (slot: BookableSlot, serviceTypeId: string) => void;
}

export function BookingCalendar({ onSlotBooked }: Props) {
  const [serviceTypeId, setServiceTypeId] = useState('st-1');
  const [viewMonth, setViewMonth] = useState({ year: 2026, month: 5 }); // 0-indexed month
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<BookableSlot | null>(null);

  const availability = useMemo(() => computeDayAvailability(serviceTypeId, REF), [serviceTypeId]);
  const availMap = useMemo(() => {
    const m: Record<string, DayAvailability> = {};
    availability.forEach(a => { m[a.date] = a; });
    return m;
  }, [availability]);

  const daySlots = useMemo(() =>
    selectedDate ? computeDaySlots(selectedDate, serviceTypeId) : [],
    [selectedDate, serviceTypeId],
  );

  // Build calendar grid
  const firstDay = new Date(viewMonth.year, viewMonth.month, 1).getDay();
  const daysInMonth = new Date(viewMonth.year, viewMonth.month + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(viewMonth.year, viewMonth.month, i + 1);
      return toDateStr(d);
    }),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => setViewMonth(v => v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 });
  const nextMonth = () => setViewMonth(v => v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 });

  const st = SERVICE_TYPES.find(s => s.id === serviceTypeId)!;

  const timeWindowGroups = useMemo(() => {
    if (!daySlots.length) return {};
    const groups: Record<string, BookableSlot[]> = {};
    daySlots.forEach(s => {
      const lbl = s.windowLabel ?? 'Other';
      if (!groups[lbl]) groups[lbl] = [];
      groups[lbl].push(s);
    });
    return groups;
  }, [daySlots]);

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Service type selector */}
      <div className="flex flex-wrap gap-2 mb-5">
        {SERVICE_TYPES.filter(s => s.onlineBookable).map(s => (
          <button
            key={s.id}
            onClick={() => { setServiceTypeId(s.id); setSelectedDate(null); setSelectedSlot(null); }}
            className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={{
              background: serviceTypeId === s.id ? '#00A9AC' : '#F3F4F6',
              color: serviceTypeId === s.id ? '#fff' : '#6B7280',
              border: serviceTypeId === s.id ? '1.5px solid #00A9AC' : '1.5px solid transparent',
            }}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Month calendar */}
        <div className="bg-white rounded-[10px] p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1.5 rounded-[6px] hover:bg-gray-100">
              <ChevronLeft size={18} style={{ color: '#6B7280' }} />
            </button>
            <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1rem' }}>
              {MONTHS[viewMonth.month]} {viewMonth.year}
            </span>
            <button onClick={nextMonth} className="p-1.5 rounded-[6px] hover:bg-gray-100">
              <ChevronRight size={18} style={{ color: '#6B7280' }} />
            </button>
          </div>

          {/* Day-of-week header */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center py-1" style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d}</div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((dateStr, idx) => {
              if (!dateStr) return <div key={idx} />;
              const av = availMap[dateStr];
              const isToday = dateStr === TODAY;
              const isPast = dateStr < TODAY;
              const isSelected = dateStr === selectedDate;
              const hasSlots = av?.hasSlots && av?.partsReady;

              return (
                <button
                  key={dateStr}
                  disabled={!hasSlots || isPast}
                  onClick={() => { setSelectedDate(dateStr); setSelectedSlot(null); }}
                  className="relative flex flex-col items-center justify-center rounded-[6px] aspect-square transition-all"
                  style={{
                    background: isSelected ? '#00A9AC' : isToday ? '#E6F7F7' : hasSlots && !isPast ? '#FFF' : 'transparent',
                    border: isSelected ? '2px solid #00A9AC' : isToday ? '1.5px solid #FCA5A5' : hasSlots && !isPast ? '1.5px solid #E5E7EB' : 'none',
                    cursor: hasSlots && !isPast ? 'pointer' : 'default',
                    opacity: isPast ? 0.35 : 1,
                  }}
                  onMouseEnter={e => { if (hasSlots && !isPast && !isSelected) e.currentTarget.style.borderColor = '#00A9AC'; }}
                  onMouseLeave={e => { if (hasSlots && !isPast && !isSelected) e.currentTarget.style.borderColor = '#E5E7EB'; }}
                >
                  <span style={{
                    fontSize: '0.8125rem', fontWeight: isSelected || isToday ? 700 : 400,
                    color: isSelected ? '#fff' : isToday ? '#00A9AC' : isPast ? '#9CA3AF' : '#1A1A1A',
                  }}>
                    {new Date(dateStr + 'T12:00:00').getDate()}
                  </span>
                  {hasSlots && !isPast && !isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full" style={{ background: '#00A9AC' }} />
                  )}
                  {av && av.bookingCount > 0 && !isSelected && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: '#F3F4F6', fontSize: '0.5rem', color: '#6B7280', fontWeight: 700 }}>
                      {av.bookingCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4" style={{ borderTop: '1px solid #E5E7EB' }}>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: '#00A9AC' }} />
              <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Slots available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: '#F3F4F6' }}>
                <span style={{ fontSize: '0.5rem', color: '#6B7280', fontWeight: 700 }}>2</span>
              </span>
              <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Booked</span>
            </div>
            {st.requiresParts && (
              <div className="flex items-center gap-1.5">
                <AlertTriangle size={12} style={{ color: '#F39C12' }} />
                <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Parts ETA: ~2 days</span>
              </div>
            )}
          </div>
        </div>

        {/* Day view / slot picker */}
        <div className="bg-white rounded-[10px] p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
          {!selectedDate ? (
            <div className="h-full flex flex-col items-center justify-center py-12">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ background: '#E6F7F7' }}>
                <Clock size={24} style={{ color: '#00A9AC' }} />
              </div>
              <p style={{ color: '#1A1A1A', fontWeight: 600, fontSize: '1rem' }}>Select a date</p>
              <p style={{ color: '#9CA3AF', fontSize: '0.875rem', marginTop: '4px', textAlign: 'center' }}>
                Pick a highlighted day on the calendar to see available time slots.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1rem' }}>
                    {fmt(selectedDate)}
                  </p>
                  <p style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>
                    {st.name} · {st.durationMinutes} min
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDate(null)}
                  style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}
                >
                  ← Back
                </button>
              </div>

              {/* Parts warning */}
              {st.requiresParts && selectedDate < '2026-06-16' && (
                <div className="rounded-[6px] p-3 mb-4 flex items-start gap-2" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
                  <AlertTriangle size={15} style={{ color: '#F39C12', marginTop: '1px', flexShrink: 0 }} />
                  <p style={{ color: '#92400E', fontSize: '0.8125rem', lineHeight: 1.4 }}>
                    Parts ETA is June 16. Slots before that date may not have parts ready.
                    Select June 16 or later to guarantee parts availability.
                  </p>
                </div>
              )}

              {/* Time-slot mode: windows */}
              {st.slotModel === 'time-slot' ? (
                <div className="space-y-3">
                  {Object.entries(timeWindowGroups).map(([label, slots]) => {
                    const available = slots.filter(s => s.available).length;
                    const total = slots.length;
                    const isSelected = selectedSlot?.windowLabel === label;
                    return (
                      <button
                        key={label}
                        disabled={available === 0}
                        onClick={() => {
                          const first = slots.find(s => s.available);
                          if (first) setSelectedSlot({ ...first, windowLabel: label });
                        }}
                        className="w-full text-left p-4 rounded-[8px] transition-all"
                        style={{
                          border: isSelected ? '2px solid #00A9AC' : '1.5px solid #E5E7EB',
                          background: isSelected ? '#E6F7F7' : available === 0 ? '#F9FAFB' : '#fff',
                          opacity: available === 0 ? 0.5 : 1,
                          cursor: available === 0 ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p style={{ fontWeight: 600, color: isSelected ? '#00A9AC' : '#1A1A1A', fontSize: '1rem' }}>{label}</p>
                            <p style={{ color: '#9CA3AF', fontSize: '0.8125rem', marginTop: '2px' }}>
                              {fmtTime(slots[0].slotStart)} – {fmtTime(slots[slots.length - 1].slotEnd)}
                            </p>
                          </div>
                          <div className="text-right">
                            {available > 0 ? (
                              <span className="px-2 py-0.5 rounded" style={{ background: isSelected ? '#00A9AC' : '#E6F7F7', color: isSelected ? '#fff' : '#00A9AC', fontSize: '0.75rem', fontWeight: 700 }}>
                                {available === 1 ? '1 spot left' : `${available} spots`}
                              </span>
                            ) : (
                              <span style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>Full</span>
                            )}
                            <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '2px' }}>
                              {total} slots total
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="mt-3 flex items-center gap-1.5" style={{ color: '#00A9AC' }}>
                            <CheckCircle size={14} />
                            <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                              We'll text 30 min before your tech arrives
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Precise-slot mode: time chips */
                <div>
                  {daySlots.length === 0 ? (
                    <p style={{ color: '#9CA3AF', fontSize: '0.875rem', textAlign: 'center', padding: '24px 0' }}>
                      No available slots on this day.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {daySlots.map((slot, i) => {
                        const isSelected = selectedSlot?.slotStart === slot.slotStart;
                        const blocked = slot.partsBlocked || !slot.available;
                        return (
                          <button
                            key={i}
                            disabled={blocked}
                            onClick={() => setSelectedSlot(slot)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-sm transition-all"
                            style={{
                              background: isSelected ? '#00A9AC' : blocked ? '#F9FAFB' : '#fff',
                              border: isSelected ? '1.5px solid #00A9AC' : blocked ? '1.5px solid #E5E7EB' : '1.5px solid #E5E7EB',
                              color: isSelected ? '#fff' : blocked ? '#D1D5DB' : '#1A1A1A',
                              cursor: blocked ? 'not-allowed' : 'pointer',
                            }}
                            onMouseEnter={e => { if (!blocked && !isSelected) { e.currentTarget.style.borderColor = '#00A9AC'; e.currentTarget.style.color = '#00A9AC'; } }}
                            onMouseLeave={e => { if (!blocked && !isSelected) { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#1A1A1A'; } }}
                          >
                            <Clock size={12} />
                            {fmtTime(slot.slotStart)}
                            {!slot.available && <span style={{ fontSize: '0.625rem', marginLeft: '2px', color: '#9CA3AF' }}>Booked</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Selected slot summary + confirm */}
              {selectedSlot && (
                <div className="mt-5 p-4 rounded-[8px]" style={{ background: '#E6F7F7', border: '1.5px solid #FCA5A5' }}>
                  <p style={{ fontWeight: 600, color: '#00A9AC', fontSize: '0.9375rem' }}>
                    {st.slotModel === 'time-slot' ? `${selectedSlot.windowLabel} window selected` : `${fmtTime(selectedSlot.slotStart)} selected`}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <User size={13} style={{ color: '#9CA3AF' }} />
                    <span style={{ fontSize: '0.8125rem', color: '#6B7280' }}>{selectedSlot.technicianName}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock size={13} style={{ color: '#9CA3AF' }} />
                    <span style={{ fontSize: '0.8125rem', color: '#6B7280' }}>
                      {st.durationMinutes} min · {fmt(selectedDate)}
                    </span>
                  </div>
                  {onSlotBooked && (
                    <button
                      onClick={() => onSlotBooked(selectedSlot, serviceTypeId)}
                      className="mt-3 w-full py-2.5 rounded-[6px] text-white font-semibold text-sm"
                      style={{ background: '#00A9AC' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#007F82')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#00A9AC')}
                    >
                      Book This Slot
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

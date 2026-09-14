import { useState } from 'react';
import {
  CalendarClock, History, Car, FileText, Shield, CreditCard,
  MessageSquare, Bell, Download, ChevronRight, Package, CheckCircle2,
  AlertTriangle, Clock, MapPin, X,
} from 'lucide-react';
import { VISITS, CUSTOMERS } from './mockData';
import type { Visit } from './types';

function fmtDate(iso: string) { return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }); }
function fmtTime(iso: string) { return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }); }
function fmtMoney(n: number) { return `R ${n.toFixed(2)}`; }

type HubSection = 'appointments' | 'history' | 'vehicles' | 'invoices' | 'warranties' | 'account';

const HUB_NAV: { id: HubSection; label: string; icon: typeof CalendarClock }[] = [
  { id: 'appointments', label: 'Appointments', icon: CalendarClock },
  { id: 'history', label: 'Service History', icon: History },
  { id: 'vehicles', label: 'My Vehicles', icon: Car },
  { id: 'invoices', label: 'Invoices', icon: FileText },
  { id: 'warranties', label: 'Warranties', icon: Shield },
  { id: 'account', label: 'Account', icon: CreditCard },
];

const DEMO_CUSTOMER = CUSTOMERS[0];
const UPCOMING = VISITS.filter(v =>
  v.customerId === DEMO_CUSTOMER.id &&
  !['completed', 'cancelled', 'no_show'].includes(v.visitState) &&
  v.scheduledStart >= '2026-06-14',
);
const PAST = VISITS.filter(v =>
  v.customerId === DEMO_CUSTOMER.id &&
  v.visitState === 'completed',
);

// ─── Appointment Card ─────────────────────────────────────────────────────────

function AppointmentCard({ visit, onReschedule, onCancel }: {
  visit: Visit;
  onReschedule: () => void;
  onCancel: () => void;
}) {
  const isActive = ['in_progress', 'en_route', 'on_site'].includes(visit.visitState);

  return (
    <div
      className="bg-white rounded-[10px] p-5"
      style={{
        border: '1px solid #E5E7EB',
        borderLeft: isActive ? '4px solid #C0392B' : '1px solid #E5E7EB',
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1rem' }}>{visit.serviceTypeName}</p>
          <p style={{ color: '#9CA3AF', fontSize: '0.8125rem', marginTop: '2px' }}>
            {visit.vehicle.year} {visit.vehicle.make} {visit.vehicle.model}
          </p>
        </div>
        {isActive && (
          <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ background: '#FDEDEC', color: '#C0392B', whiteSpace: 'nowrap' }}>
            🔴 Live
          </span>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <CalendarClock size={14} style={{ color: '#9CA3AF', flexShrink: 0 }} />
          <span style={{ color: '#1A1A1A', fontSize: '0.875rem' }}>
            {fmtDate(visit.scheduledStart)} at {fmtTime(visit.scheduledStart)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={14} style={{ color: '#9CA3AF', flexShrink: 0 }} />
          <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>{visit.serviceAddress}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} style={{ color: '#9CA3AF', flexShrink: 0 }} />
          <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>{visit.technicianName}</span>
        </div>
      </div>

      {visit.partsStatus === 'ordered' && (
        <div className="flex items-start gap-2 p-2.5 rounded-[6px] mb-3" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
          <Package size={13} style={{ color: '#F39C12', marginTop: '1px' }} />
          <p style={{ color: '#92400E', fontSize: '0.8125rem' }}>
            Your parts are on their way — ETA {visit.partsRequired[0]?.etaDate}. We'll confirm once arrived.
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={onReschedule}
          className="flex-1 py-2 rounded-[6px] text-sm font-medium"
          style={{ border: '1.5px solid #E5E7EB', color: '#6B7280', background: '#fff' }}
        >
          Reschedule
        </button>
        <button
          onClick={onCancel}
          className="flex-1 py-2 rounded-[6px] text-sm font-medium"
          style={{ border: '1.5px solid #FCA5A5', color: '#DC2626', background: '#FEF2F2' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Reschedule Modal ─────────────────────────────────────────────────────────

function RescheduleModal({ visit, onClose }: { visit: Visit; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-white rounded-[12px] p-6 w-full max-w-sm" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A' }}>Reschedule Appointment</h3>
          <button onClick={onClose}><X size={16} style={{ color: '#9CA3AF' }} /></button>
        </div>
        <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '16px' }}>
          {visit.serviceTypeName} · {fmtDate(visit.scheduledStart)}
        </p>
        <div className="p-3 rounded-[6px] mb-4" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
          <div className="flex items-start gap-2">
            <AlertTriangle size={14} style={{ color: '#F39C12', marginTop: '1px' }} />
            <p style={{ color: '#92400E', fontSize: '0.8125rem' }}>
              Rescheduling is available up to 24 hours before your appointment.
              {visit.partsRequired.length > 0 && ' Parts ETA will be recomputed for the new date.'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 rounded-[6px] text-sm" style={{ border: '1.5px solid #E5E7EB', color: '#6B7280' }}>Go Back</button>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-[6px] text-sm text-white font-semibold" style={{ background: '#C0392B' }}>
            Choose New Time
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── History Item ─────────────────────────────────────────────────────────────

function HistoryItem({ visit }: { visit: Visit }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-[8px] overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
      <button
        onClick={() => setOpen(x => !x)}
        className="w-full text-left p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: '#F0FDF4' }}>
            <CheckCircle2 size={16} style={{ color: '#27AE60' }} />
          </div>
          <div>
            <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.9375rem' }}>{visit.serviceTypeName}</p>
            <p style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>{fmtDate(visit.scheduledStart)} · {visit.technicianName}</p>
          </div>
        </div>
        <div className="text-right">
          <p style={{ fontWeight: 700, color: '#C0392B', fontSize: '0.875rem' }}>{fmtMoney(visit.totalPrice)}</p>
          <ChevronRight size={14} style={{ color: '#D1D5DB', marginLeft: 'auto', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4" style={{ borderTop: '1px solid #F3F4F6' }}>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '4px' }}>Vehicle</p>
              <p style={{ color: '#1A1A1A', fontSize: '0.875rem' }}>{visit.vehicle.year} {visit.vehicle.make} {visit.vehicle.model}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '4px' }}>Location</p>
              <p style={{ color: '#1A1A1A', fontSize: '0.875rem' }}>{visit.operationsType === 'mobile' ? 'Mobile – at your location' : 'In-Shop'}</p>
            </div>
          </div>
          {visit.addons.length > 0 && (
            <div className="mt-3">
              <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '4px' }}>Add-ons</p>
              <div className="flex flex-wrap gap-1">
                {visit.addons.map((a, i) => (
                  <span key={i} className="px-2 py-0.5 rounded text-xs" style={{ background: '#FDEDEC', color: '#C0392B' }}>{a.name}</span>
                ))}
              </div>
            </div>
          )}
          <button
            className="mt-3 flex items-center gap-1.5 text-sm"
            style={{ color: '#C0392B', fontWeight: 600 }}
          >
            <Download size={13} /> Download Invoice (PDF)
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main CustomerHub ─────────────────────────────────────────────────────────

export function CustomerHub() {
  const [section, setSection] = useState<HubSection>('appointments');
  const [rescheduleVisit, setRescheduleVisit] = useState<Visit | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Banner */}
      <div className="mb-5 p-3 rounded-[8px] flex items-center gap-2" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
        <span style={{ fontSize: '0.8125rem', color: '#1D4ED8' }}>
          👤 Previewing customer portal as <strong>{DEMO_CUSTOMER.name}</strong> — this is what your customers see at their self-service hub.
        </span>
      </div>

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <aside className="hidden md:flex flex-col w-48 shrink-0">
          <div className="bg-white rounded-[10px] p-3 mb-3" style={{ border: '1px solid #E5E7EB' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ background: '#FDEDEC', color: '#C0392B', fontWeight: 700, fontSize: '1rem' }}>
              {DEMO_CUSTOMER.name[0]}
            </div>
            <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>{DEMO_CUSTOMER.name}</p>
            <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>Member since {new Date(DEMO_CUSTOMER.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
            <div className="flex gap-3 mt-2">
              <div>
                <p style={{ fontWeight: 700, color: '#C0392B', fontSize: '0.875rem' }}>{DEMO_CUSTOMER.totalVisits}</p>
                <p style={{ color: '#9CA3AF', fontSize: '0.6875rem' }}>Visits</p>
              </div>
              <div>
                <p style={{ fontWeight: 700, color: '#C0392B', fontSize: '0.875rem' }}>{fmtMoney(DEMO_CUSTOMER.totalSpent)}</p>
                <p style={{ color: '#9CA3AF', fontSize: '0.6875rem' }}>Spent</p>
              </div>
            </div>
          </div>

          <nav className="space-y-0.5">
            {HUB_NAV.map(item => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSection(item.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-left text-sm transition-colors"
                  style={{ background: active ? '#FDEDEC' : 'transparent', color: active ? '#C0392B' : '#6B7280', fontWeight: active ? 600 : 400 }}
                >
                  <Icon size={15} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">

          {/* ── Appointments ── */}
          {section === 'appointments' && (
            <div>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.125rem', marginBottom: '16px' }}>
                Upcoming Appointments
              </h3>
              {UPCOMING.length === 0 ? (
                <div className="text-center py-10" style={{ color: '#9CA3AF' }}>
                  <CalendarClock size={28} style={{ margin: '0 auto 8px', color: '#D1D5DB' }} />
                  <p>No upcoming appointments</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {UPCOMING.map(v => (
                    <AppointmentCard
                      key={v.id}
                      visit={v}
                      onReschedule={() => setRescheduleVisit(v)}
                      onCancel={() => setCancellingId(v.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Service History ── */}
          {section === 'history' && (
            <div>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.125rem', marginBottom: '16px' }}>
                Service History
              </h3>
              {PAST.length === 0 ? (
                <p style={{ color: '#9CA3AF' }}>No past services.</p>
              ) : (
                <div className="space-y-2">
                  {PAST.map(v => <HistoryItem key={v.id} visit={v} />)}
                </div>
              )}
            </div>
          )}

          {/* ── Vehicles ── */}
          {section === 'vehicles' && (
            <div>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.125rem', marginBottom: '16px' }}>My Vehicles</h3>
              <div className="space-y-3">
                {DEMO_CUSTOMER.vehicles.map((v, i) => (
                  <div key={i} className="bg-white rounded-[10px] p-5" style={{ border: '1px solid #E5E7EB' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#FDEDEC' }}>
                        <Car size={18} style={{ color: '#C0392B' }} />
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '1rem' }}>
                          {v.year} {v.make} {v.model} {v.trim ?? ''}
                        </p>
                        <p style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>{v.licensePlate ?? 'No plate on file'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Services', value: PAST.filter(x => x.vehicle.licensePlate === v.licensePlate).length.toString() },
                        { label: 'Last Service', value: PAST.length > 0 ? new Date(PAST[0].scheduledStart).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—' },
                        { label: 'Active Warranties', value: '1' },
                      ].map(stat => (
                        <div key={stat.label} className="p-3 rounded-[6px]" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                          <p style={{ color: '#9CA3AF', fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase' }}>{stat.label}</p>
                          <p style={{ color: '#C0392B', fontWeight: 700, fontSize: '1rem', marginTop: '2px' }}>{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Invoices ── */}
          {section === 'invoices' && (
            <div>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.125rem', marginBottom: '16px' }}>Invoices & Receipts</h3>
              <div className="space-y-2">
                {PAST.map(v => (
                  <div key={v.id} className="bg-white rounded-[8px] p-4 flex items-center justify-between" style={{ border: '1px solid #E5E7EB' }}>
                    <div className="flex items-center gap-3">
                      <FileText size={18} style={{ color: '#9CA3AF' }} />
                      <div>
                        <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.9375rem' }}>{v.serviceTypeName}</p>
                        <p style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>{fmtDate(v.scheduledStart)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span style={{ fontWeight: 700, color: '#C0392B' }}>{fmtMoney(v.totalPrice)}</span>
                      <button className="flex items-center gap-1 text-sm" style={{ color: '#1D4ED8' }}>
                        <Download size={13} /> PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Warranties ── */}
          {section === 'warranties' && (
            <div>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.125rem', marginBottom: '16px' }}>Active Warranties</h3>
              <div className="bg-white rounded-[10px] p-5" style={{ border: '1px solid #E5E7EB' }}>
                <div className="flex items-start gap-3">
                  <Shield size={20} style={{ color: '#27AE60', marginTop: '2px' }} />
                  <div>
                    <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '1rem' }}>Road Hazard Warranty</p>
                    <p style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>Bridgestone Turanza QuietTrack 225/55R17 ×4</p>
                    <p style={{ color: '#27AE60', fontWeight: 600, fontSize: '0.8125rem', marginTop: '4px' }}>Active · Expires June 5, 2027</p>
                    <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '2px' }}>Covers road hazard damage (punctures, cuts, impact breaks) on all 4 tires.</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 p-3 rounded-[6px]" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                <p style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>No other warranties on file. Warranties are attached after service completion.</p>
              </div>
            </div>
          )}

          {/* ── Account ── */}
          {section === 'account' && (
            <div>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.125rem', marginBottom: '16px' }}>Account Settings</h3>
              <div className="space-y-3">
                {/* Profile */}
                <div className="bg-white rounded-[10px] p-5" style={{ border: '1px solid #E5E7EB' }}>
                  <p style={{ fontWeight: 700, color: '#1A1A1A', marginBottom: '12px' }}>Profile</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[{ l: 'Name', v: DEMO_CUSTOMER.name }, { l: 'Email', v: DEMO_CUSTOMER.email }, { l: 'Phone', v: DEMO_CUSTOMER.phone }, { l: 'Address', v: DEMO_CUSTOMER.address }].map(f => (
                      <div key={f.l} className={f.l === 'Address' ? 'col-span-2' : ''}>
                        <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '2px' }}>{f.l}</p>
                        <p style={{ color: '#1A1A1A', fontSize: '0.875rem' }}>{f.v}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notification prefs */}
                <div className="bg-white rounded-[10px] p-5" style={{ border: '1px solid #E5E7EB' }}>
                  <p style={{ fontWeight: 700, color: '#1A1A1A', marginBottom: '12px' }}>Notifications</p>
                  <div className="space-y-3">
                    {[
                      { label: 'Appointment reminders (SMS)', on: true },
                      { label: 'Tech en-route alert (30 min)', on: true },
                      { label: 'Parts arrival notification', on: true },
                      { label: 'Promotional offers', on: false },
                    ].map(n => (
                      <div key={n.label} className="flex items-center justify-between">
                        <span style={{ color: '#1A1A1A', fontSize: '0.875rem' }}>{n.label}</span>
                        <div
                          className="w-9 h-5 rounded-full relative cursor-pointer"
                          style={{ background: n.on ? '#C0392B' : '#D1D5DB' }}
                        >
                          <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow" style={{ left: n.on ? '18px' : '2px' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Data export */}
                <div className="bg-white rounded-[10px] p-5" style={{ border: '1px solid #E5E7EB' }}>
                  <p style={{ fontWeight: 700, color: '#1A1A1A', marginBottom: '4px' }}>Data & Privacy</p>
                  <p style={{ color: '#9CA3AF', fontSize: '0.8125rem', marginBottom: '12px' }}>Export a full copy of your account data at any time.</p>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-[6px] text-sm font-semibold" style={{ border: '1.5px solid #E5E7EB', color: '#6B7280' }}>
                    <Download size={14} /> Request Data Export
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {rescheduleVisit && (
        <RescheduleModal visit={rescheduleVisit} onClose={() => setRescheduleVisit(null)} />
      )}

      {cancellingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-[12px] p-6 w-80" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h4 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', marginBottom: '8px' }}>Cancel Appointment?</h4>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '16px' }}>
              Cancelling within 24h of your appointment may incur a fee per shop policy.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setCancellingId(null)} className="flex-1 py-2 rounded-[6px] text-sm" style={{ border: '1.5px solid #E5E7EB', color: '#6B7280' }}>Keep It</button>
              <button onClick={() => setCancellingId(null)} className="flex-1 py-2.5 rounded-[6px] text-sm font-semibold" style={{ background: '#DC2626', color: '#fff' }}>Confirm Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

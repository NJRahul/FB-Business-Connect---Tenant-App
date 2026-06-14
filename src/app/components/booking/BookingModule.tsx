import { useState } from 'react';
import {
  Activity, CalendarDays, ClipboardList, Plus, Settings2,
  Layers, UserCircle, Package, Clock, TrendingUp, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import { BookingCalendar } from './BookingCalendar';
import { AppointmentsList } from './AppointmentsList';
import { ManualBooking } from './ManualBooking';
import { ServiceSetup } from './ServiceSetup';
import { JobTemplates } from './JobTemplates';
import { CustomerHub } from './CustomerHub';
import { VISITS } from './mockData';

type BookingTab = 'overview' | 'calendar' | 'appointments' | 'book' | 'setup' | 'templates' | 'hub';

const TABS: { id: BookingTab; label: string; icon: typeof Activity }[] = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'appointments', label: 'Appointments', icon: ClipboardList },
  { id: 'book', label: 'Book Now', icon: Plus },
  { id: 'setup', label: 'Service Setup', icon: Settings2 },
  { id: 'templates', label: 'Templates', icon: Layers },
  { id: 'hub', label: 'Customer Hub', icon: UserCircle },
];

function fmtMoney(n: number) { return `$${n.toFixed(2)}`; }

const TODAY = '2026-06-14';

function OverviewDashboard({ onNavigate }: { onNavigate: (t: BookingTab) => void }) {
  const todayVisits = VISITS.filter(v => v.scheduledStart.startsWith(TODAY) && !['cancelled', 'no_show'].includes(v.visitState));
  const upcoming = VISITS.filter(v => v.scheduledStart > TODAY && !['cancelled', 'no_show', 'completed'].includes(v.visitState));
  const partsPending = VISITS.filter(v => v.visitState === 'parts_pending');
  const inProgress = VISITS.filter(v => ['in_progress', 'en_route', 'on_site'].includes(v.visitState));
  const todayRevenue = todayVisits.reduce((s, v) => s + v.totalPrice, 0);

  return (
    <div>
      <div className="mb-6">
        <h2 style={{ fontFamily: 'Sora, sans-serif', color: '#1A1A1A', fontSize: '1.375rem', fontWeight: 700 }}>
          Booking & Scheduling
        </h2>
        <p style={{ color: '#6B7280', fontSize: '0.9375rem', marginTop: '4px' }}>
          Sunday, June 14, 2026 · Parts-Aware Scheduling active
        </p>
      </div>

      {/* Live alert */}
      {inProgress.length > 0 && (
        <div className="rounded-[8px] p-4 mb-5 flex items-center gap-3" style={{ background: '#FDEDEC', border: '1.5px solid #F5B7B1' }}>
          <div className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse" style={{ background: '#C0392B' }} />
          <div>
            <p style={{ color: '#C0392B', fontWeight: 700, fontSize: '0.9375rem' }}>
              {inProgress.length} visit{inProgress.length > 1 ? 's' : ''} in progress right now
            </p>
            <p style={{ color: '#6B7280', fontSize: '0.8125rem' }}>
              {inProgress.map(v => `${v.customerName} · ${v.serviceTypeName}`).join(' | ')}
            </p>
          </div>
          <button
            onClick={() => onNavigate('appointments')}
            className="ml-auto px-3 py-1.5 rounded-[6px] text-sm font-semibold"
            style={{ background: '#C0392B', color: '#fff' }}
          >
            View
          </button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Today's Visits", value: todayVisits.length.toString(), sub: 'Scheduled & active', icon: CalendarDays, color: '#C0392B', action: () => onNavigate('appointments') },
          { label: "Today's Revenue", value: fmtMoney(todayRevenue), sub: 'Across all jobs', icon: TrendingUp, color: '#27AE60', action: null },
          { label: 'Parts Pending', value: partsPending.length.toString(), sub: 'Awaiting arrival', icon: Package, color: '#F39C12', action: () => onNavigate('appointments') },
          { label: 'This Week', value: (todayVisits.length + upcoming.filter(v => v.scheduledStart <= '2026-06-20').length).toString(), sub: 'Jobs through Sunday', icon: Clock, color: '#2980B9', action: null },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.label}
              onClick={stat.action ?? undefined}
              className="bg-white rounded-[8px] p-4 text-left transition-all"
              style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', cursor: stat.action ? 'pointer' : 'default' }}
              onMouseEnter={e => { if (stat.action) e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { if (stat.action) e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.07)'; }}
            >
              <div className="flex items-center justify-between mb-2">
                <p style={{ color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
                <div className="w-7 h-7 rounded-[6px] flex items-center justify-center" style={{ background: stat.color + '20' }}>
                  <Icon size={14} style={{ color: stat.color }} />
                </div>
              </div>
              <p style={{ color: stat.color, fontWeight: 700, fontSize: '1.5rem', fontFamily: 'Sora, sans-serif' }}>{stat.value}</p>
              <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '2px' }}>{stat.sub}</p>
            </button>
          );
        })}
      </div>

      {/* Today's schedule */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
        <div className="bg-white rounded-[10px] p-5" style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1rem' }}>Today's Schedule</h3>
            <button onClick={() => onNavigate('appointments')} style={{ color: '#C0392B', fontSize: '0.8125rem', fontWeight: 600 }}>See all →</button>
          </div>
          {todayVisits.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays size={24} style={{ color: '#D1D5DB', margin: '0 auto 8px' }} />
              <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>No visits scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayVisits.map(v => {
                const isActive = ['in_progress', 'en_route', 'on_site'].includes(v.visitState);
                return (
                  <div
                    key={v.id}
                    className="flex items-center gap-3 p-3 rounded-[6px]"
                    style={{
                      background: isActive ? '#FDEDEC' : '#F9FAFB',
                      borderLeft: isActive ? '3px solid #C0392B' : '3px solid #E5E7EB',
                    }}
                  >
                    <div className="text-right shrink-0 w-14">
                      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1A1A1A' }}>
                        {new Date(v.scheduledStart).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {v.customerName}
                      </p>
                      <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>{v.serviceTypeName} · {v.technicianName.split(' ')[0]}</p>
                    </div>
                    {isActive && (
                      <span className="px-1.5 py-0.5 rounded text-xs font-bold shrink-0" style={{ background: '#C0392B', color: '#fff' }}>LIVE</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Parts status */}
        <div className="bg-white rounded-[10px] p-5" style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1rem' }}>Parts Status</h3>
            <span style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>Auto-updates on webhook</span>
          </div>
          <div className="space-y-3">
            {VISITS.filter(v => v.partsRequired.length > 0 && !['completed', 'cancelled'].includes(v.visitState)).slice(0, 4).map(v => {
              const p = v.partsRequired[0];
              const colors: Record<string, { bg: string; color: string; label: string }> = {
                ordered: { bg: '#FFF7ED', color: '#C2410C', label: 'Ordered' },
                in_transit: { bg: '#EFF6FF', color: '#1D4ED8', label: 'In Transit' },
                arrived: { bg: '#F0FDF4', color: '#15803D', label: 'Arrived' },
                ready: { bg: '#F0FDF4', color: '#15803D', label: 'Ready' },
                not_required: { bg: '#F9FAFB', color: '#9CA3AF', label: '—' },
                pending_order: { bg: '#FFF7ED', color: '#C2410C', label: 'Pending' },
              };
              const c = colors[v.partsStatus] ?? colors.ordered;
              return (
                <div key={v.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: '#FDEDEC' }}>
                    <Package size={14} style={{ color: '#C0392B' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name}
                    </p>
                    <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>{v.customerName} · {p.supplierName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: c.bg, color: c.color }}>{c.label}</span>
                    {p.etaDate && <p style={{ color: '#9CA3AF', fontSize: '0.6875rem', marginTop: '1px' }}>ETA {p.etaDate}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: 'Book Now', desc: 'Create a booking for a customer calling in', icon: Plus, action: () => onNavigate('book'), cta: 'Open Booking Form' },
          { title: 'View Calendar', desc: 'See available slots and parts-aware scheduling', icon: CalendarDays, action: () => onNavigate('calendar'), cta: 'Open Calendar' },
          { title: 'Service Setup', desc: 'Configure service types, techs, and location hours', icon: Settings2, action: () => onNavigate('setup'), cta: 'Configure' },
        ].map(item => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="bg-white rounded-[8px] p-5" style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
              <div className="w-10 h-10 rounded-[8px] flex items-center justify-center mb-3" style={{ background: '#FDEDEC' }}>
                <Icon size={18} style={{ color: '#C0392B' }} />
              </div>
              <h4 style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '1rem' }}>{item.title}</h4>
              <p style={{ color: '#9CA3AF', fontSize: '0.8125rem', marginTop: '4px', lineHeight: 1.5 }}>{item.desc}</p>
              <button
                onClick={item.action}
                className="mt-4 px-4 py-2 rounded-[6px] text-white text-sm font-semibold"
                style={{ background: '#C0392B' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#A93226')}
                onMouseLeave={e => (e.currentTarget.style.background = '#C0392B')}
              >
                {item.cta}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function BookingModule() {
  const [activeTab, setActiveTab] = useState<BookingTab>('overview');

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Tab navigation */}
      <div className="flex overflow-x-auto gap-0.5 mb-6 pb-1" style={{ borderBottom: '1px solid #E5E7EB' }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-t-[6px] text-sm font-medium whitespace-nowrap transition-colors shrink-0"
              style={{
                color: active ? '#C0392B' : '#6B7280',
                borderBottom: active ? '2px solid #C0392B' : '2px solid transparent',
                background: active ? '#FDEDEC' : 'transparent',
                marginBottom: '-1px',
              }}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && <OverviewDashboard onNavigate={setActiveTab} />}
      {activeTab === 'calendar' && <BookingCalendar />}
      {activeTab === 'appointments' && <AppointmentsList />}
      {activeTab === 'book' && <ManualBooking onComplete={() => setActiveTab('appointments')} />}
      {activeTab === 'setup' && <ServiceSetup />}
      {activeTab === 'templates' && <JobTemplates onUseTemplate={() => setActiveTab('book')} />}
      {activeTab === 'hub' && <CustomerHub />}
    </div>
  );
}

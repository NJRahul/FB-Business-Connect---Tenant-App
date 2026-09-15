import { Plus, Calendar, Clock, Car, ChevronRight, RepeatIcon } from 'lucide-react';
import type { FleetSession, FleetSessionStatus } from './types';
import { MOCK_FLEET_SESSIONS } from './mockData';

const STATUS_CONFIG: Record<FleetSessionStatus, { label: string; bg: string; color: string }> = {
  scheduled:   { label: 'Scheduled',   bg: '#EFF6FF', color: '#1D4ED8' },
  in_progress: { label: 'In Progress', bg: '#ECFDF5', color: '#065F46' },
  closed:      { label: 'Closed',      bg: '#F9FAFB', color: '#6B7280' },
  invoiced:    { label: 'Invoiced',    bg: '#F0FDF4', color: '#15803D' },
};

interface Props {
  onSelectSession: (sessionId: string) => void;
}

export function FleetSessionsView({ onSelectSession }: Props) {
  const sessions = MOCK_FLEET_SESSIONS;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.125rem', color: '#1A1A1A' }}>Fleet Sessions</h2>
          <p style={{ fontSize: '0.825rem', color: '#6B7280', marginTop: 2 }}>Scheduled multi-vehicle service blocks</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-[8px] text-sm font-semibold" style={{ background: '#00A9AC', color: '#fff' }}>
          <Plus size={14} /> Schedule Session
        </button>
      </div>

      {/* Dispatch calendar strip */}
      <div className="rounded-xl p-4 flex items-center gap-4 overflow-x-auto" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#C2410C', textTransform: 'uppercase', letterSpacing: '0.06em', shrink: 0 }}>On Dispatch Board</p>
        {sessions.filter(s => s.status === 'in_progress' || s.status === 'scheduled').map(s => (
          <div key={s.id} onClick={() => s.status === 'in_progress' && onSelectSession(s.id)}
            className="shrink-0 rounded-lg px-4 py-2.5 cursor-pointer"
            style={{ background: s.status === 'in_progress' ? '#00A9AC' : '#fff', border: '1px solid #FED7AA', minWidth: 200 }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: s.status === 'in_progress' ? '#fff' : '#1A1A1A' }}>{s.fleetAccountName}</p>
            <p style={{ fontSize: '0.7rem', color: s.status === 'in_progress' ? '#FECACA' : '#9CA3AF', marginTop: 2 }}>
              {new Date(s.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(s.scheduledEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p style={{ fontSize: '0.7rem', color: s.status === 'in_progress' ? '#80D4D5' : '#9CA3AF' }}>{s.locationName}</p>
          </div>
        ))}
      </div>

      {/* Sessions list */}
      <div className="flex flex-col gap-3">
        {sessions.map(s => {
          const sc = STATUS_CONFIG[s.status];
          return (
            <div key={s.id} onClick={() => (s.status === 'in_progress' || s.status === 'scheduled') && onSelectSession(s.id)}
              className={`rounded-xl p-5 flex items-center justify-between gap-4 ${s.status === 'in_progress' || s.status === 'scheduled' ? 'cursor-pointer' : ''}`}
              style={{ background: '#fff', border: '1px solid #E5E7EB' }}
              onMouseEnter={e => { if (s.status === 'in_progress' || s.status === 'scheduled') e.currentTarget.style.background = '#F9FAFB'; }}
              onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: s.status === 'in_progress' ? '#E6F7F7' : '#F9FAFB' }}>
                  <Calendar size={18} color={s.status === 'in_progress' ? '#00A9AC' : '#9CA3AF'} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A1A1A' }}>{s.fleetAccountName}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                    {s.isRecurring && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
                        <RepeatIcon size={10} className="inline mr-1" />Recurring
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <p style={{ fontSize: '0.775rem', color: '#6B7280' }}>
                      <Clock size={11} className="inline mr-1" />
                      {new Date(s.scheduledStart).toLocaleDateString()} {new Date(s.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p style={{ fontSize: '0.775rem', color: '#6B7280' }}>{s.locationName} · {s.technicianName}</p>
                    {s.vehicleWork.length > 0 && (
                      <p style={{ fontSize: '0.775rem', color: '#6B7280' }}>
                        <Car size={11} className="inline mr-1" />
                        {s.vehicleWork.length} vehicle{s.vehicleWork.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  {s.isRecurring && s.recurringPattern && (
                    <p style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: 2 }}>{s.recurringPattern}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {s.consolidatedInvoiceId && (
                  <span style={{ fontSize: '0.8rem', color: '#15803D', fontWeight: 500 }}>{s.consolidatedInvoiceId}</span>
                )}
                {(s.status === 'in_progress' || s.status === 'scheduled') && (
                  <ChevronRight size={16} style={{ color: '#D1D5DB' }} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

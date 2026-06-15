import { CheckCircle2, AlertTriangle, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { StatusService, Incident } from './types';
import { MOCK_STATUS_SERVICES, MOCK_INCIDENTS } from './mockData';

function StatusDot({ status }: { status: StatusService['currentStatus'] }) {
  const map = {
    operational: '#4ADE80',
    degraded: '#FBBF24',
    outage: '#EF4444',
  };
  return (
    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: map[status] }} />
  );
}

function UptimeBar({ uptime }: { uptime: number }) {
  const color = uptime >= 99.9 ? '#4ADE80' : uptime >= 99 ? '#FBBF24' : '#EF4444';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#1F2937' }}>
        <div className="h-full rounded-full" style={{ width: `${uptime}%`, background: color }} />
      </div>
      <span style={{ fontSize: '0.75rem', color, fontVariantNumeric: 'tabular-nums', minWidth: 44, textAlign: 'right' }}>
        {uptime.toFixed(2)}%
      </span>
    </div>
  );
}

function IncidentCard({ incident }: { incident: Incident }) {
  const [expanded, setExpanded] = useState(false);
  const severityColor = { minor: '#FBBF24', major: '#FB923C', critical: '#EF4444' }[incident.severity];
  const statusLabel = { investigating: 'Investigating', identified: 'Identified', monitoring: 'Monitoring', resolved: 'Resolved' }[incident.status];

  return (
    <div className="rounded-xl p-4" style={{ background: '#111827', border: `1px solid ${incident.status === 'resolved' ? '#1F2937' : '#3D2E0A'}` }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold" style={{ background: `${severityColor}18`, color: severityColor }}>
              {incident.severity}
            </span>
            <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold"
              style={{ background: incident.status === 'resolved' ? '#052E16' : '#1C1917', color: incident.status === 'resolved' ? '#4ADE80' : '#FBBF24' }}>
              {statusLabel}
            </span>
          </div>
          <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#F9FAFB' }}>{incident.title}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span style={{ fontSize: '0.775rem', color: '#4B5563' }}>{new Date(incident.createdAt).toLocaleString()}</span>
            {incident.resolvedAt && (
              <span style={{ fontSize: '0.775rem', color: '#4B5563' }}>Resolved {new Date(incident.resolvedAt).toLocaleString()}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {incident.affectedServices.map(s => (
              <span key={s} className="px-2 py-0.5 rounded text-xs" style={{ background: '#1F2937', color: '#6B7280' }}>{s}</span>
            ))}
          </div>
        </div>
        <button onClick={() => setExpanded(v => !v)} style={{ color: '#4B5563' }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 border-t pt-4" style={{ borderColor: '#1F2937' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            Incident Updates
          </p>
          <div className="flex flex-col gap-3">
            {incident.updates.map((u, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: '#DC2626' }} />
                  {i < incident.updates.length - 1 && <div className="w-px flex-1" style={{ background: '#1F2937' }} />}
                </div>
                <div className="pb-2">
                  <p style={{ fontSize: '0.8rem', color: '#D1D5DB', lineHeight: 1.5 }}>{u.message}</p>
                  <p style={{ fontSize: '0.75rem', color: '#4B5563', marginTop: 2 }}>{new Date(u.at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function StatusPageView() {
  const activeIncidents = MOCK_INCIDENTS.filter(i => i.status !== 'resolved');
  const resolvedIncidents = MOCK_INCIDENTS.filter(i => i.status === 'resolved');
  const allOperational = MOCK_STATUS_SERVICES.every(s => s.currentStatus === 'operational');

  return (
    <div className="flex flex-col gap-6" style={{ color: '#F9FAFB' }}>
      <div>
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.25rem' }}>Platform Status</h2>
        <p style={{ fontSize: '0.825rem', color: '#6B7280', marginTop: 2 }}>
          Real-time system status and incident history.
        </p>
      </div>

      {/* Overall status banner */}
      <div className="flex items-center gap-3 rounded-xl px-5 py-4"
        style={{ background: allOperational ? '#052E16' : '#1C1917', border: `1px solid ${allOperational ? '#14532D' : '#3D2E0A'}` }}>
        {allOperational
          ? <CheckCircle2 size={20} color="#4ADE80" />
          : <AlertTriangle size={20} color="#FBBF24" />}
        <div>
          <p style={{ fontWeight: 700, fontSize: '1rem', color: allOperational ? '#4ADE80' : '#FBBF24' }}>
            {allOperational ? 'All Systems Operational' : 'Partial Disruption in Progress'}
          </p>
          <p style={{ fontSize: '0.8rem', color: allOperational ? '#166534' : '#78350F', marginTop: 1 }}>
            Last checked: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Active incidents */}
      {activeIncidents.length > 0 && (
        <div>
          <h3 style={{ fontWeight: 600, fontSize: '0.875rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            Active Incidents
          </h3>
          <div className="flex flex-col gap-3">
            {activeIncidents.map(i => <IncidentCard key={i.id} incident={i} />)}
          </div>
        </div>
      )}

      {/* Service status table */}
      <div>
        <h3 style={{ fontWeight: 600, fontSize: '0.875rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
          Service Status (99-Day Uptime)
        </h3>
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #1F2937' }}>
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0D1526', borderBottom: '1px solid #1F2937' }}>
                {['Service', 'Status', 'Latency', '99-Day Uptime'].map(h => (
                  <th key={h} className="text-left px-4 py-3"
                    style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4B5563', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_STATUS_SERVICES.map((s, i) => (
                <tr key={s.name} style={{ borderBottom: '1px solid #1F2937', background: i % 2 === 0 ? '#111827' : '#0F1623' }}>
                  <td className="px-4 py-3" style={{ fontWeight: 600, fontSize: '0.875rem', color: '#D1D5DB' }}>{s.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StatusDot status={s.currentStatus} />
                      <span style={{ fontSize: '0.825rem', color: s.currentStatus === 'operational' ? '#4ADE80' : s.currentStatus === 'degraded' ? '#FBBF24' : '#EF4444' }}>
                        {s.currentStatus.charAt(0).toUpperCase() + s.currentStatus.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ fontSize: '0.825rem', color: s.latencyMs > 500 ? '#FBBF24' : '#6B7280', fontVariantNumeric: 'tabular-nums' }}>
                      {s.latencyMs}ms
                    </span>
                  </td>
                  <td className="px-4 py-3 pr-8">
                    <UptimeBar uptime={s.uptime99d} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolved incidents */}
      {resolvedIncidents.length > 0 && (
        <div>
          <h3 style={{ fontWeight: 600, fontSize: '0.875rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            Past Incidents
          </h3>
          <div className="flex flex-col gap-3">
            {resolvedIncidents.map(i => <IncidentCard key={i.id} incident={i} />)}
          </div>
        </div>
      )}
    </div>
  );
}

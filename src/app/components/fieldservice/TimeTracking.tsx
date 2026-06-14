'use client';
import React, { useState } from 'react';
import { Clock, Download, Plus, LogIn, LogOut, Coffee, X } from 'lucide-react';
import { TIME_ENTRIES } from './mockData';
import type { TimeEntry } from './types';

const TECHS = [
  { id: 'tech-1', name: 'Mike Torres', color: '#C0392B' },
  { id: 'tech-2', name: 'Sarah Chen', color: '#2980B9' },
  { id: 'tech-3', name: 'Carlos Rivera', color: '#27AE60' },
  { id: 'tech-4', name: 'Derek Smith', color: '#8B5CF6' },
];

function formatDuration(mins?: number): string {
  if (!mins) return '—';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatTime(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function calcTotal(entry: TimeEntry): number {
  if (entry.totalMinutes !== undefined) return entry.totalMinutes;
  if (!entry.clockOut) return 0;
  const diff = (new Date(entry.clockOut).getTime() - new Date(entry.clockIn).getTime()) / 60000;
  return Math.max(0, Math.round(diff - entry.breakMinutes));
}

function exportCSV(entries: TimeEntry[]) {
  const rows = [
    ['ID', 'Technician', 'Visit', 'Clock In', 'Clock Out', 'Break (min)', 'Net Hours', 'Geofence Triggered', 'Override Log'],
    ...entries.map(e => [
      e.id,
      e.technicianName,
      e.visitSummary ?? '',
      e.clockIn,
      e.clockOut ?? '',
      String(e.breakMinutes),
      (calcTotal(e) / 60).toFixed(2),
      e.geofenceTriggered ? 'Yes' : 'No',
      e.overrideLog ?? '',
    ]),
  ];
  const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `time-tracking-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

interface ClockInModalProps {
  onClose: () => void;
  onCreate: (entry: TimeEntry) => void;
}

function ClockInModal({ onClose, onCreate }: ClockInModalProps) {
  const [techId, setTechId] = useState('tech-1');
  const [geofence, setGeofence] = useState(true);

  const handleSubmit = () => {
    const tech = TECHS.find(t => t.id === techId)!;
    onCreate({
      id: `te-${Date.now()}`,
      technicianId: techId,
      technicianName: tech.name,
      clockIn: new Date().toISOString(),
      breakMinutes: 0,
      geofenceTriggered: geofence,
    });
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 380, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 16 }}>Manual Clock-In</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="#6B7280" /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Technician</label>
            <select value={techId} onChange={e => setTechId(e.target.value)}
              style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}>
              {TECHS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" id="gf" checked={geofence} onChange={e => setGeofence(e.target.checked)} />
            <label htmlFor="gf" style={{ fontSize: 14, color: '#374151' }}>Geofence triggered (at shop location)</label>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px 0', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, cursor: 'pointer', background: '#fff' }}>Cancel</button>
          <button onClick={handleSubmit} style={{ flex: 2, padding: '10px 0', background: '#27AE60', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Clock In Now
          </button>
        </div>
      </div>
    </div>
  );
}

interface TimeEntryRowProps {
  entry: TimeEntry;
  onClockOut: (id: string) => void;
  onAddBreak: (id: string, mins: number) => void;
}

function TimeEntryRow({ entry, onClockOut, onAddBreak }: TimeEntryRowProps) {
  const tech = TECHS.find(t => t.id === entry.technicianId);
  const netMins = calcTotal(entry);
  const isRunning = !entry.clockOut;

  return (
    <tr style={{ borderTop: '1px solid #E5E7EB' }}>
      <td style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: tech?.color ?? '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {entry.technicianName.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#1A1A1A' }}>{entry.technicianName}</div>
            {entry.visitSummary && <div style={{ fontSize: 12, color: '#6B7280' }}>{entry.visitSummary}</div>}
          </div>
        </div>
      </td>
      <td style={{ padding: '12px 14px', fontSize: 13, color: '#374151' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {entry.geofenceTriggered
            ? <span style={{ background: '#D1FAE5', color: '#065F46', border: '1px solid #10B981', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>Geofence</span>
            : <span style={{ background: '#F3F4F6', color: '#4B5563', border: '1px solid #9CA3AF', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>Manual</span>
          }
        </div>
      </td>
      <td style={{ padding: '12px 14px', fontSize: 13, color: '#374151', fontFamily: 'monospace' }}>{formatTime(entry.clockIn)}</td>
      <td style={{ padding: '12px 14px', fontSize: 13, color: '#374151', fontFamily: 'monospace' }}>
        {isRunning
          ? <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#27AE60', fontWeight: 600, fontFamily: 'inherit' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#27AE60', animation: 'pulse 1.5s infinite', display: 'inline-block' }} />
              On Clock
            </span>
          : formatTime(entry.clockOut)
        }
      </td>
      <td style={{ padding: '12px 14px', fontSize: 13, color: '#6B7280' }}>{entry.breakMinutes}m</td>
      <td style={{ padding: '12px 14px' }}>
        <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 14, color: isRunning ? '#F39C12' : '#1A1A1A' }}>
          {isRunning ? '...' : formatDuration(netMins)}
        </span>
      </td>
      <td style={{ padding: '12px 14px' }}>
        {entry.overrideLog && (
          <span style={{ background: '#FEF3C7', color: '#B45309', border: '1px solid #F59E0B', borderRadius: 6, padding: '2px 8px', fontSize: 11 }}>Override</span>
        )}
      </td>
      <td style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {isRunning && (
            <>
              <button
                onClick={() => onAddBreak(entry.id, 30)}
                title="Add 30-min break"
                style={{ padding: '5px 10px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 12, cursor: 'pointer', background: '#fff', display: 'flex', alignItems: 'center', gap: 4, color: '#6B7280' }}>
                <Coffee size={12} /> +30m
              </button>
              <button
                onClick={() => onClockOut(entry.id)}
                style={{ padding: '5px 10px', border: '1px solid #EF4444', borderRadius: 6, fontSize: 12, cursor: 'pointer', background: '#FEE2E2', color: '#DC2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <LogOut size={12} /> Out
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

export function TimeTracking() {
  const [entries, setEntries] = useState<TimeEntry[]>(TIME_ENTRIES);
  const [showClockIn, setShowClockIn] = useState(false);
  const [filterTech, setFilterTech] = useState('all');
  const [showRunningOnly, setShowRunningOnly] = useState(false);

  const handleClockOut = (id: string) => {
    setEntries(prev => prev.map(e => {
      if (e.id !== id) return e;
      const now = new Date().toISOString();
      const diff = (new Date(now).getTime() - new Date(e.clockIn).getTime()) / 60000;
      const total = Math.max(0, Math.round(diff - e.breakMinutes));
      return { ...e, clockOut: now, totalMinutes: total };
    }));
  };

  const handleAddBreak = (id: string, mins: number) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, breakMinutes: e.breakMinutes + mins } : e));
  };

  const filtered = entries.filter(e => {
    if (filterTech !== 'all' && e.technicianId !== filterTech) return false;
    if (showRunningOnly && e.clockOut) return false;
    return true;
  });

  const totalNetMins = entries.filter(e => e.clockOut).reduce((s, e) => s + calcTotal(e), 0);
  const runningCount = entries.filter(e => !e.clockOut).length;

  return (
    <div style={{ padding: '20px 0', fontFamily: 'Inter, sans-serif' }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'On Clock Now', value: runningCount, color: '#27AE60', bg: '#D1FAE5' },
          { label: 'Total Entries Today', value: entries.length, color: '#2980B9', bg: '#EBF5FB' },
          { label: 'Total Net Hours', value: `${(totalNetMins / 60).toFixed(1)}h`, color: '#1A1A1A', bg: '#F9FAFB' },
          { label: 'Geofence Auto-Ins', value: entries.filter(e => e.geofenceTriggered).length, color: '#7C3AED', bg: '#EDE9FE' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select value={filterTech} onChange={e => setFilterTech(e.target.value)}
            style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: '7px 12px', fontSize: 13, outline: 'none', background: '#fff' }}>
            <option value="all">All Technicians</option>
            {TECHS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
            <input type="checkbox" checked={showRunningOnly} onChange={e => setShowRunningOnly(e.target.checked)} />
            Active only
          </label>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => exportCSV(entries)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: '#fff', color: '#374151' }}>
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => setShowClockIn(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', background: '#27AE60', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <LogIn size={14} /> Manual Clock-In
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              {['Technician', 'Method', 'Clock In', 'Clock Out', 'Break', 'Net Time', 'Flags', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#6B7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ padding: '32px 0', textAlign: 'center', color: '#9CA3AF' }}>No time entries found.</td></tr>
            )}
            {filtered.map(e => (
              <TimeEntryRow key={e.id} entry={e} onClockOut={handleClockOut} onAddBreak={handleAddBreak} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Per-tech summary */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 15, color: '#1A1A1A', marginBottom: 12 }}>Daily Summary by Technician</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {TECHS.map(tech => {
            const techEntries = entries.filter(e => e.technicianId === tech.id);
            const netMins = techEntries.filter(e => e.clockOut).reduce((s, e) => s + calcTotal(e), 0);
            const running = techEntries.some(e => !e.clockOut);
            return (
              <div key={tech.id} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: tech.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
                    {tech.name.charAt(0)}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#1A1A1A' }}>{tech.name}</div>
                  {running && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#27AE60' }} />}
                </div>
                <div style={{ fontSize: 22, fontFamily: 'Sora, sans-serif', fontWeight: 800, color: tech.color }}>
                  {netMins > 0 ? formatDuration(netMins) : running ? '...' : '0h'}
                </div>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{techEntries.length} entries</div>
              </div>
            );
          })}
        </div>
      </div>

      {showClockIn && <ClockInModal onClose={() => setShowClockIn(false)} onCreate={e => setEntries(prev => [e, ...prev])} />}
    </div>
  );
}

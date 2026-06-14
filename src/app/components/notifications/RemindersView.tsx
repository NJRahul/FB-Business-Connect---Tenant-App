import React, { useState } from 'react';
import { Clock, Plus, X, Toggle, ChevronDown, ChevronUp, Check, AlertCircle } from 'lucide-react';
import { REMINDER_CONFIGS } from './mockData';
import type { ReminderConfig } from './types';

const PRESET_INTERVALS = [1, 2, 4, 6, 12, 24, 48, 72];

function IntervalChips({
  intervals,
  onChange,
}: {
  intervals: number[];
  onChange: (v: number[]) => void;
}) {
  const [custom, setCustom] = useState('');

  function toggle(h: number) {
    if (intervals.includes(h)) {
      onChange(intervals.filter(x => x !== h).sort((a, b) => b - a));
    } else {
      onChange([...intervals, h].sort((a, b) => b - a));
    }
  }

  function addCustom() {
    const h = parseInt(custom, 10);
    if (!isNaN(h) && h > 0 && !intervals.includes(h)) {
      onChange([...intervals, h].sort((a, b) => b - a));
    }
    setCustom('');
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
      {PRESET_INTERVALS.map(h => (
        <button
          key={h}
          onClick={() => toggle(h)}
          style={{
            padding: '5px 12px', borderRadius: 99, border: '1.5px solid',
            borderColor: intervals.includes(h) ? '#C0392B' : '#D1D5DB',
            background: intervals.includes(h) ? '#FDEDEC' : '#fff',
            color: intervals.includes(h) ? '#C0392B' : '#6B7280',
            fontWeight: 600, fontSize: 12, cursor: 'pointer',
          }}
        >
          {h}h
        </button>
      ))}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <input
          type="number"
          value={custom}
          onChange={e => setCustom(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addCustom()}
          placeholder="custom h"
          style={{ width: 72, padding: '5px 8px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 12, outline: 'none' }}
        />
        <button
          onClick={addCustom}
          style={{ padding: '5px 8px', borderRadius: 8, border: '1px solid #D1D5DB', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <Plus size={13} color="#6B7280" />
        </button>
      </div>
      {intervals.filter(h => !PRESET_INTERVALS.includes(h)).map(h => (
        <div key={h} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 99, background: '#FDEDEC', border: '1.5px solid #C0392B' }}>
          <span style={{ fontSize: 12, color: '#C0392B', fontWeight: 600 }}>{h}h</span>
          <button onClick={() => toggle(h)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <X size={10} color="#C0392B" />
          </button>
        </div>
      ))}
    </div>
  );
}

function ServiceConfigRow({ config: initial }: { config: ReminderConfig }) {
  const [config, setConfig] = useState(initial);
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(false);

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
      {/* Header row */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setExpanded(v => !v)}
      >
        {/* Toggle */}
        <div
          onClick={e => { e.stopPropagation(); setConfig(c => ({ ...c, enabled: !c.enabled })); }}
          style={{
            width: 36, height: 20, borderRadius: 99, position: 'relative', cursor: 'pointer', flexShrink: 0,
            background: config.enabled ? '#C0392B' : '#D1D5DB', transition: 'background 0.2s',
          }}
        >
          <div style={{
            position: 'absolute', top: 2, left: config.enabled ? 18 : 2, width: 16, height: 16,
            borderRadius: 99, background: '#fff', transition: 'left 0.2s',
          }} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1A1A1A' }}>{config.serviceTypeName}</div>
          <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
            {config.intervals.length > 0
              ? `Reminders at: ${config.intervals.map(h => `${h}h`).join(', ')} before`
              : 'No reminders configured'
            }
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          {config.intervals.map(h => (
            <span key={h} style={{ padding: '2px 8px', borderRadius: 99, background: config.enabled ? '#FDEDEC' : '#F3F4F6', color: config.enabled ? '#C0392B' : '#9CA3AF', fontSize: 11, fontWeight: 600 }}>
              {h}h
            </span>
          ))}
        </div>

        {expanded ? <ChevronUp size={16} color="#9CA3AF" /> : <ChevronDown size={16} color="#9CA3AF" />}
      </div>

      {/* Expanded body */}
      {expanded && (
        <div style={{ padding: '0 18px 18px', borderTop: '1px solid #F3F4F6' }}>
          <div style={{ marginTop: 16, marginBottom: 10, fontSize: 12, fontWeight: 600, color: '#374151' }}>
            Reminder intervals (hours before appointment)
          </div>
          <IntervalChips
            intervals={config.intervals}
            onChange={v => setConfig(c => ({ ...c, intervals: v }))}
          />

          <div style={{ marginTop: 16, marginBottom: 8, fontSize: 12, fontWeight: 600, color: '#374151' }}>
            Service preparation instructions
          </div>
          <textarea
            value={config.prepInstructions}
            onChange={e => setConfig(c => ({ ...c, prepInstructions: e.target.value }))}
            rows={3}
            placeholder="Instructions sent to customer with their reminder…"
            style={{ width: '100%', padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 13, resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <button
              onClick={save}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: saved ? '#15803D' : '#C0392B', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
            >
              {saved ? <><Check size={14} /> Saved</> : 'Save Config'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

type ReminderTab = 'appointment' | 'pre-arrival';

export function RemindersView() {
  const [tab, setTab] = useState<ReminderTab>('appointment');
  const [globalIntervals, setGlobalIntervals] = useState<number[]>([24, 1]);
  const [morningEnabled, setMorningEnabled] = useState(true);
  const [morningSuppressCompleted, setMorningSuppressCompleted] = useState(true);
  const [saved, setSaved] = useState(false);

  function saveGlobal() {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Sub-tab bar */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #E5E7EB' }}>
        {([
          { id: 'appointment' as ReminderTab, label: 'Appointment Reminders' },
          { id: 'pre-arrival' as ReminderTab, label: 'Pre-Arrival Config' },
        ]).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 13,
              color: tab === t.id ? '#C0392B' : '#6B7280',
              borderBottom: tab === t.id ? '2px solid #C0392B' : '2px solid transparent',
              marginBottom: -2,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'appointment' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Global reminder timing */}
          <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', padding: '18px 20px' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1A1A1A', marginBottom: 4 }}>Global Reminder Timing</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>
              Default schedule for all service types. Individual service types can override these defaults in the Pre-Arrival tab.
            </div>
            <div style={{ marginBottom: 12, fontSize: 12, fontWeight: 600, color: '#374151' }}>
              Send reminders at (hours before appointment)
            </div>
            <IntervalChips intervals={globalIntervals} onChange={setGlobalIntervals} />

            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Morning summary for technicians</div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>Send each tech a daily schedule email at 7:00 AM</div>
                </div>
                <div
                  onClick={() => setMorningEnabled(v => !v)}
                  style={{ width: 36, height: 20, borderRadius: 99, position: 'relative', cursor: 'pointer', background: morningEnabled ? '#C0392B' : '#D1D5DB', transition: 'background 0.2s', flexShrink: 0 }}
                >
                  <div style={{ position: 'absolute', top: 2, left: morningEnabled ? 18 : 2, width: 16, height: 16, borderRadius: 99, background: '#fff', transition: 'left 0.2s' }} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Suppress cancelled / completed</div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>Do not send reminders for appointments already cancelled or completed</div>
                </div>
                <div
                  onClick={() => setMorningSuppressCompleted(v => !v)}
                  style={{ width: 36, height: 20, borderRadius: 99, position: 'relative', cursor: 'pointer', background: morningSuppressCompleted ? '#C0392B' : '#D1D5DB', transition: 'background 0.2s', flexShrink: 0 }}
                >
                  <div style={{ position: 'absolute', top: 2, left: morningSuppressCompleted ? 18 : 2, width: 16, height: 16, borderRadius: 99, background: '#fff', transition: 'left 0.2s' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button
                onClick={saveGlobal}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: saved ? '#15803D' : '#C0392B', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
              >
                {saved ? <><Check size={14} /> Saved</> : 'Save Global Settings'}
              </button>
            </div>
          </div>

          {/* Info */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 14px', background: '#EFF6FF', borderRadius: 8, border: '1px solid #BFDBFE' }}>
            <AlertCircle size={14} color="#2563EB" style={{ marginTop: 1, flexShrink: 0 }} />
            <div style={{ fontSize: 12, color: '#1E40AF' }}>
              Reminders are sent via the customer's preferred channel (Email or SMS based on consent). Channel fallback: if SMS fails on a transactional reminder, a fallback email is sent automatically.
            </div>
          </div>
        </div>
      )}

      {tab === 'pre-arrival' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 13, color: '#6B7280' }}>
            Configure per-service-type reminder timing and preparation instructions. Settings here override the global defaults.
          </div>
          {REMINDER_CONFIGS.map(cfg => (
            <ServiceConfigRow key={cfg.id} config={cfg} />
          ))}
        </div>
      )}
    </div>
  );
}

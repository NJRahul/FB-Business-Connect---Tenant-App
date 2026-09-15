'use client';
import React, { useState, useEffect } from 'react';
import { Plus, X, Users, RefreshCw, ChevronRight, Trash2, Copy } from 'lucide-react';
import { SEGMENTS, CUSTOMERS } from './mockData';
import type { Segment, SegmentFilter, FilterOperator } from './types';

const FILTER_FIELDS = [
  { value: 'lastVisitDate', label: 'Last Visit Date' },
  { value: 'ltv', label: 'Lifetime Value ($)' },
  { value: 'visitCount', label: 'Visit Count' },
  { value: 'emailOptIn', label: 'Email Opt-In' },
  { value: 'smsOptIn', label: 'SMS Opt-In' },
  { value: 'tags', label: 'Tags' },
  { value: 'idMeStatus', label: 'ID.me Status' },
  { value: 'idMeCategory', label: 'ID.me Category' },
  { value: 'vehicleMake', label: 'Vehicle Make' },
  { value: 'vehicleYear', label: 'Vehicle Year' },
];

const OPERATORS_FOR: Record<string, { value: FilterOperator; label: string }[]> = {
  lastVisitDate: [
    { value: 'within_days', label: 'within last X days' },
    { value: 'older_than_days', label: 'older than X days' },
  ],
  ltv: [
    { value: 'gt', label: '>' },
    { value: 'lt', label: '<' },
    { value: 'gte', label: '>=' },
    { value: 'lte', label: '<=' },
    { value: 'eq', label: '=' },
  ],
  visitCount: [
    { value: 'gt', label: '>' },
    { value: 'lt', label: '<' },
    { value: 'gte', label: '>=' },
    { value: 'lte', label: '<=' },
  ],
  emailOptIn: [{ value: 'eq', label: 'is' }],
  smsOptIn:   [{ value: 'eq', label: 'is' }],
  tags:       [{ value: 'contains', label: 'contains' }, { value: 'not_in', label: 'does not contain' }],
  idMeStatus: [{ value: 'eq', label: 'is' }],
  idMeCategory: [{ value: 'eq', label: 'is' }],
  vehicleMake:  [{ value: 'contains', label: 'contains' }],
  vehicleYear:  [{ value: 'eq', label: '=' }, { value: 'gte', label: '>=' }],
};

function computeCount(filters: SegmentFilter[]): number {
  if (filters.length === 0) return CUSTOMERS.length;
  return CUSTOMERS.filter(c => {
    return filters.every(f => {
      const val = f.value;
      switch (f.field) {
        case 'ltv': {
          const n = Number(val);
          if (f.operator === 'gt')  return c.ltv > n;
          if (f.operator === 'lt')  return c.ltv < n;
          if (f.operator === 'gte') return c.ltv >= n;
          if (f.operator === 'lte') return c.ltv <= n;
          return c.ltv === n;
        }
        case 'visitCount': {
          const n = Number(val);
          if (f.operator === 'gt')  return c.visitCount > n;
          if (f.operator === 'lt')  return c.visitCount < n;
          if (f.operator === 'gte') return c.visitCount >= n;
          if (f.operator === 'lte') return c.visitCount <= n;
          return true;
        }
        case 'lastVisitDate': {
          if (!c.lastVisitDate) return false;
          const ageDays = Math.round((Date.now() - new Date(c.lastVisitDate).getTime()) / 86400000);
          if (f.operator === 'within_days')    return ageDays <= Number(val);
          if (f.operator === 'older_than_days') return ageDays > Number(val);
          return true;
        }
        case 'emailOptIn': return c.emailOptIn === (val === 'true' || val === true);
        case 'smsOptIn':   return c.smsOptIn   === (val === 'true' || val === true);
        case 'tags':       return f.operator === 'contains' ? c.tags.includes(String(val)) : !c.tags.includes(String(val));
        case 'idMeStatus': return c.idMeStatus === String(val);
        case 'idMeCategory': return c.idMeCategory === String(val);
        default: return true;
      }
    });
  }).length;
}

function FilterChip({ filter, onRemove }: { filter: SegmentFilter; onRemove: () => void }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#E6F7F7', border: '1px solid #80D4D5', borderRadius: 8, padding: '5px 10px', fontSize: 13, fontWeight: 600, color: '#00A9AC' }}>
      <span style={{ color: '#6B7280', fontWeight: 400 }}>{filter.fieldLabel}</span>
      <span>{filter.operator.replace(/_/g, ' ')}</span>
      <span style={{ fontFamily: 'monospace' }}>{String(filter.value)}</span>
      <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#00A9AC', padding: 0, display: 'flex', alignItems: 'center' }}>
        <X size={13} />
      </button>
    </div>
  );
}

function AddFilterPopover({ onAdd, onClose }: { onAdd: (f: SegmentFilter) => void; onClose: () => void }) {
  const [field, setField] = useState('ltv');
  const [operator, setOperator] = useState<FilterOperator>('gt');
  const [value, setValue] = useState('');

  const ops = OPERATORS_FOR[field] ?? [{ value: 'eq' as FilterOperator, label: '=' }];

  const handleAdd = () => {
    if (!value && !['emailOptIn', 'smsOptIn'].includes(field)) return;
    const fieldMeta = FILTER_FIELDS.find(f => f.value === field)!;
    const finalValue = field === 'emailOptIn' || field === 'smsOptIn' ? value === 'true' : value;
    onAdd({ id: `f-${Date.now()}`, field, fieldLabel: fieldMeta.label, operator, value: finalValue as string | number });
    onClose();
  };

  return (
    <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 30, marginTop: 8, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 16, boxShadow: '0 8px 30px rgba(0,0,0,0.15)', width: 340 }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: '#1A1A1A', marginBottom: 12 }}>Add Filter</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Field</label>
          <select value={field} onChange={e => { setField(e.target.value); setOperator(OPERATORS_FOR[e.target.value]?.[0]?.value ?? 'eq'); setValue(''); }}
            style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 7, padding: '7px 10px', fontSize: 13, outline: 'none' }}>
            {FILTER_FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Condition</label>
          <select value={operator} onChange={e => setOperator(e.target.value as FilterOperator)}
            style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 7, padding: '7px 10px', fontSize: 13, outline: 'none' }}>
            {ops.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Value</label>
          {(field === 'emailOptIn' || field === 'smsOptIn') ? (
            <select value={value} onChange={e => setValue(e.target.value)}
              style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 7, padding: '7px 10px', fontSize: 13, outline: 'none' }}>
              <option value="true">Yes (opted in)</option>
              <option value="false">No (not opted in)</option>
            </select>
          ) : field === 'idMeStatus' ? (
            <select value={value} onChange={e => setValue(e.target.value)}
              style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 7, padding: '7px 10px', fontSize: 13, outline: 'none' }}>
              {['verified', 'expired', 'pending', 'none'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          ) : (
            <input value={value} onChange={e => setValue(e.target.value)} placeholder={field === 'ltv' ? '1000' : field === 'lastVisitDate' ? '365' : 'value...'}
              style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 7, padding: '7px 10px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          )}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button onClick={onClose} style={{ flex: 1, padding: '8px 0', border: '1px solid #E5E7EB', borderRadius: 7, fontSize: 13, cursor: 'pointer', background: '#fff' }}>Cancel</button>
        <button onClick={handleAdd} style={{ flex: 2, padding: '8px 0', background: '#00A9AC', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Add Filter</button>
      </div>
    </div>
  );
}

function SegmentBuilder({ initial, onSave, onCancel }: { initial?: Segment; onSave: (s: Segment) => void; onCancel: () => void }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [filters, setFilters] = useState<SegmentFilter[]>(initial?.filters ?? []);
  const [showAddFilter, setShowAddFilter] = useState(false);
  const [computing, setComputing] = useState(false);
  const [count, setCount] = useState(initial?.memberCount ?? CUSTOMERS.length);

  useEffect(() => {
    setComputing(true);
    const t = setTimeout(() => { setCount(computeCount(filters)); setComputing(false); }, 400);
    return () => clearTimeout(t);
  }, [filters]);

  const handleSave = () => {
    if (!name) return;
    onSave({
      id: initial?.id ?? `seg-${Date.now()}`,
      shopId: 'shop-1', name, description, filters,
      memberCount: count, lastComputedAt: new Date().toISOString(),
      isTemplate: false, createdAt: initial?.createdAt ?? new Date().toISOString(),
    });
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 20 }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: '2 1 200px' }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Segment Name *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Lapsed High-Value Customers"
            style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div style={{ flex: '3 1 280px' }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Description</label>
          <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description..."
            style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>Filters (all must match)</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          {filters.length === 0 && <span style={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' }}>No filters — matches all customers</span>}
          {filters.map(f => (
            <FilterChip key={f.id} filter={f} onRemove={() => setFilters(prev => prev.filter(x => x.id !== f.id))} />
          ))}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowAddFilter(s => !s)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: '#00A9AC', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              <Plus size={14} /> Add Filter
            </button>
            {showAddFilter && <AddFilterPopover onAdd={f => setFilters(prev => [...prev, f])} onClose={() => setShowAddFilter(false)} />}
          </div>
        </div>
      </div>

      {/* Segment size preview */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: '#E6F7F7', border: '1px solid #80D4D5', borderRadius: 10, marginBottom: 16 }}>
        <Users size={20} color="#00A9AC" />
        <div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 24, fontWeight: 800, color: '#00A9AC', display: 'flex', alignItems: 'center', gap: 8 }}>
            {computing ? <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> : count}
            <span style={{ fontSize: 14, fontWeight: 400, color: '#6B7280' }}>customers match</span>
          </div>
          <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>Recomputes within 60 seconds of any data change</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel} style={{ padding: '10px 20px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, cursor: 'pointer', background: '#fff' }}>Cancel</button>
        <button onClick={handleSave} disabled={!name}
          style={{ padding: '10px 20px', background: name ? '#00A9AC' : '#E5E7EB', color: name ? '#fff' : '#9CA3AF', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: name ? 'pointer' : 'not-allowed' }}>
          Save Segment
        </button>
      </div>
    </div>
  );
}

export function SegmentsView() {
  const [segments, setSegments] = useState(SEGMENTS);
  const [building, setBuilding] = useState(false);
  const [editingSeg, setEditingSeg] = useState<Segment | null>(null);

  const handleSave = (seg: Segment) => {
    setSegments(prev => {
      const idx = prev.findIndex(s => s.id === seg.id);
      return idx >= 0 ? prev.map(s => s.id === seg.id ? seg : s) : [seg, ...prev];
    });
    setBuilding(false);
    setEditingSeg(null);
  };

  return (
    <div style={{ padding: '20px 0', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 16, color: '#1A1A1A' }}>Segments</div>
          <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Reusable customer lists for campaigns. Membership recomputes ≤60 seconds from any data change.</div>
        </div>
        <button onClick={() => { setBuilding(true); setEditingSeg(null); }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', background: '#00A9AC', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          <Plus size={14} /> New Segment
        </button>
      </div>

      {/* Builder */}
      {(building || editingSeg) && (
        <div style={{ marginBottom: 20 }}>
          <SegmentBuilder
            initial={editingSeg ?? undefined}
            onSave={handleSave}
            onCancel={() => { setBuilding(false); setEditingSeg(null); }}
          />
        </div>
      )}

      {/* Template header */}
      <div style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Pre-Built Templates</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        {segments.filter(s => s.isTemplate).map(seg => (
          <div key={seg.id} style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ width: 36, height: 36, background: '#E6F7F7', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Users size={16} color="#00A9AC" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1A1A1A' }}>{seg.name}</div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 1 }}>{seg.description}</div>
              {seg.filters.length > 0 && (
                <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                  {seg.filters.map(f => (
                    <span key={f.id} style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 6, padding: '2px 8px', fontSize: 11, color: '#6B7280' }}>
                      {f.fieldLabel} {f.operator.replace(/_/g, ' ')} {String(f.value)}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 800, color: '#00A9AC', flexShrink: 0 }}>{seg.memberCount}</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', flexShrink: 0 }}>customers</div>
            <button onClick={() => { setEditingSeg(seg); setBuilding(false); }}
              style={{ padding: '6px 12px', border: '1px solid #E5E7EB', borderRadius: 7, fontSize: 12, cursor: 'pointer', background: '#fff', color: '#374151', flexShrink: 0 }}>
              Clone & Edit
            </button>
          </div>
        ))}
      </div>

      {/* Custom segments */}
      {segments.filter(s => !s.isTemplate).length > 0 && (
        <>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Your Segments</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {segments.filter(s => !s.isTemplate).map(seg => (
              <div key={seg.id} style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ width: 36, height: 36, background: '#EBF5FB', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Users size={16} color="#2980B9" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1A1A1A' }}>{seg.name}</div>
                  {seg.filters.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                      {seg.filters.map(f => (
                        <span key={f.id} style={{ background: '#E6F7F7', border: '1px solid #80D4D5', borderRadius: 6, padding: '2px 8px', fontSize: 11, color: '#00A9AC' }}>
                          {f.fieldLabel} {f.operator.replace(/_/g, ' ')} {String(f.value)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 800, color: '#2980B9', flexShrink: 0 }}>{seg.memberCount}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>customers</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => { setEditingSeg(seg); setBuilding(false); }}
                    style={{ padding: '5px 10px', border: '1px solid #E5E7EB', borderRadius: 7, fontSize: 12, cursor: 'pointer', background: '#fff' }}>Edit</button>
                  <button onClick={() => setSegments(prev => prev.filter(s => s.id !== seg.id))}
                    style={{ padding: '5px 8px', border: '1px solid #80D4D5', borderRadius: 7, cursor: 'pointer', background: '#F0FBFB' }}>
                    <Trash2 size={12} color="#DC2626" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

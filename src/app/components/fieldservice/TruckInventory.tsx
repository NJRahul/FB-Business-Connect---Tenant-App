'use client';
import React, { useState } from 'react';
import { Package, AlertTriangle, CheckCircle, Plus, Truck, ChevronDown, ChevronUp, X } from 'lucide-react';
import { TRUCK_INVENTORY, DISPATCH_VISITS } from './mockData';
import type { TruckInventoryItem } from './types';

const TECHS = [
  { id: 'tech-1', name: 'Mike Torres', color: '#00A9AC' },
  { id: 'tech-2', name: 'Sarah Chen', color: '#2980B9' },
  { id: 'tech-3', name: 'Carlos Rivera', color: '#27AE60' },
];

function getTechVisits(techId: string) {
  return DISPATCH_VISITS.filter(v => v.technicianId === techId);
}

function requiredParts(techId: string): { sku: string; partName: string; qtyNeeded: number }[] {
  const visits = getTechVisits(techId);
  const map: Record<string, { sku: string; partName: string; qtyNeeded: number }> = {};
  visits.forEach(v => {
    if (v.parts) {
      v.parts.forEach(p => {
        if (!map[p.sku]) map[p.sku] = { sku: p.sku, partName: p.partName, qtyNeeded: 0 };
        map[p.sku].qtyNeeded += p.quantity;
      });
    }
  });
  return Object.values(map);
}

interface AddItemModalProps {
  techId: string;
  techName: string;
  onClose: () => void;
  onAdd: (item: Omit<TruckInventoryItem, 'id' | 'shopId' | 'date' | 'qtyUsed' | 'qtyRemaining'>) => void;
}

function AddItemModal({ techId, techName, onClose, onAdd }: AddItemModalProps) {
  const [sku, setSku] = useState('');
  const [partName, setPartName] = useState('');
  const [qty, setQty] = useState(1);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 12, width: 400, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 16 }}>Add to {techName}'s Truck</h3>
          <button onClick={onClose}><X size={18} color="#6B7280" /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>SKU</label>
            <input value={sku} onChange={e => setSku(e.target.value)} placeholder="e.g. TR-225-45R17"
              style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Part Name</label>
            <input value={partName} onChange={e => setPartName(e.target.value)} placeholder="e.g. Michelin Pilot Sport 4S 225/45R17"
              style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Qty Loaded</label>
            <input type="number" min={1} value={qty} onChange={e => setQty(Number(e.target.value))}
              style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px 0', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, cursor: 'pointer', background: '#fff' }}>Cancel</button>
          <button
            onClick={() => { if (sku && partName && qty > 0) { onAdd({ technicianId: techId, sku, partName, qtyLoaded: qty }); onClose(); } }}
            style={{ flex: 1, padding: '10px 0', background: '#00A9AC', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >Add Item</button>
        </div>
      </div>
    </div>
  );
}

interface TechTruckCardProps {
  tech: typeof TECHS[0];
  items: TruckInventoryItem[];
  onAddItem: () => void;
}

function TechTruckCard({ tech, items, onAddItem }: TechTruckCardProps) {
  const [expanded, setExpanded] = useState(true);
  const required = requiredParts(tech.id);

  const discrepancies = required.filter(req => {
    const loaded = items.find(i => i.sku === req.sku);
    return !loaded || loaded.qtyLoaded < req.qtyNeeded;
  });

  const totalLoaded = items.reduce((s, i) => s + i.qtyLoaded, 0);
  const totalUsed = items.reduce((s, i) => s + i.qtyUsed, 0);
  const totalRemaining = items.reduce((s, i) => s + i.qtyRemaining, 0);

  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
      <div
        onClick={() => setExpanded(e => !e)}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer', borderBottom: expanded ? '1px solid #E5E7EB' : 'none' }}
      >
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: tech.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Truck size={18} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 15, color: '#1A1A1A' }}>{tech.name}</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
            {totalLoaded} loaded · {totalUsed} used · {totalRemaining} remaining
          </div>
        </div>
        {discrepancies.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 8, padding: '4px 10px' }}>
            <AlertTriangle size={14} color="#D97706" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#B45309' }}>{discrepancies.length} discrepancy</span>
          </div>
        )}
        {discrepancies.length === 0 && items.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#D1FAE5', border: '1px solid #10B981', borderRadius: 8, padding: '4px 10px' }}>
            <CheckCircle size={14} color="#059669" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#065F46' }}>All clear</span>
          </div>
        )}
        {expanded ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
      </div>

      {expanded && (
        <div style={{ padding: '14px 16px' }}>
          {discrepancies.length > 0 && (
            <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 8, padding: '10px 14px', marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#92400E', marginBottom: 6 }}>Inventory Discrepancies</div>
              {discrepancies.map(d => {
                const loaded = items.find(i => i.sku === d.sku);
                return (
                  <div key={d.sku} style={{ fontSize: 13, color: '#78350F', display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>{d.partName}</span>
                    <span>Need {d.qtyNeeded}, loaded {loaded?.qtyLoaded ?? 0}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Required parts from visits */}
          {required.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Required for Today's Jobs</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {required.map(req => {
                  const loaded = items.find(i => i.sku === req.sku);
                  const ok = loaded && loaded.qtyLoaded >= req.qtyNeeded;
                  return (
                    <div key={req.sku} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: ok ? '#F0FDF4' : '#FFF7ED', border: `1px solid ${ok ? '#86EFAC' : '#FED7AA'}`, borderRadius: 8 }}>
                      {ok ? <CheckCircle size={14} color="#22C55E" /> : <AlertTriangle size={14} color="#F97316" />}
                      <span style={{ flex: 1, fontSize: 13, color: '#1A1A1A' }}>{req.partName}</span>
                      <span style={{ fontSize: 12, color: ok ? '#15803D' : '#C2410C', fontWeight: 600 }}>
                        {loaded?.qtyLoaded ?? 0}/{req.qtyNeeded}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Loaded inventory table */}
          {items.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Truck Inventory</div>
              <div style={{ border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#F9FAFB' }}>
                      {['SKU', 'Part', 'Loaded', 'Used', 'Remaining'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#6B7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={item.id} style={{ borderTop: idx > 0 ? '1px solid #E5E7EB' : 'none' }}>
                        <td style={{ padding: '8px 12px', color: '#6B7280', fontFamily: 'monospace', fontSize: 12 }}>{item.sku}</td>
                        <td style={{ padding: '8px 12px', color: '#1A1A1A' }}>{item.partName}</td>
                        <td style={{ padding: '8px 12px', color: '#1A1A1A', fontWeight: 600 }}>{item.qtyLoaded}</td>
                        <td style={{ padding: '8px 12px', color: '#6B7280' }}>{item.qtyUsed}</td>
                        <td style={{ padding: '8px 12px' }}>
                          <span style={{
                            background: item.qtyRemaining === 0 ? '#FEE2E2' : item.qtyRemaining <= 1 ? '#FEF3C7' : '#D1FAE5',
                            color: item.qtyRemaining === 0 ? '#DC2626' : item.qtyRemaining <= 1 ? '#D97706' : '#059669',
                            borderRadius: 6, padding: '2px 8px', fontWeight: 700, fontSize: 12
                          }}>{item.qtyRemaining}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {items.length === 0 && required.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#9CA3AF', fontSize: 14 }}>No visits requiring parts today.</div>
          )}

          <button
            onClick={onAddItem}
            style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', border: '1px dashed #00A9AC', borderRadius: 8, color: '#00A9AC', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'transparent' }}
          >
            <Plus size={14} /> Add Item to Truck
          </button>
        </div>
      )}
    </div>
  );
}

export function TruckInventory() {
  const [items, setItems] = useState<TruckInventoryItem[]>(TRUCK_INVENTORY);
  const [addingFor, setAddingFor] = useState<typeof TECHS[0] | null>(null);

  const handleAdd = (item: Omit<TruckInventoryItem, 'id' | 'shopId' | 'date' | 'qtyUsed' | 'qtyRemaining'>) => {
    const newItem: TruckInventoryItem = {
      ...item,
      id: `ti-${Date.now()}`,
      shopId: 'shop-1',
      date: '2026-06-14',
      qtyUsed: 0,
      qtyRemaining: item.qtyLoaded,
    };
    setItems(prev => [...prev, newItem]);
  };

  const totalLoaded = items.reduce((s, i) => s + i.qtyLoaded, 0);
  const totalUsed = items.reduce((s, i) => s + i.qtyUsed, 0);

  return (
    <div style={{ padding: '20px 0', fontFamily: 'Inter, sans-serif' }}>
      {/* Header stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Parts Loaded', value: totalLoaded, color: '#2980B9', bg: '#EBF5FB' },
          { label: 'Parts Used Today', value: totalUsed, color: '#27AE60', bg: '#EAFAF1' },
          { label: 'Remaining on Trucks', value: items.reduce((s, i) => s + i.qtyRemaining, 0), color: '#6B7280', bg: '#F9FAFB' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px 20px' }}>
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Per-tech cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {TECHS.map(tech => (
          <TechTruckCard
            key={tech.id}
            tech={tech}
            items={items.filter(i => i.technicianId === tech.id)}
            onAddItem={() => setAddingFor(tech)}
          />
        ))}
      </div>

      {addingFor && (
        <AddItemModal
          techId={addingFor.id}
          techName={addingFor.name}
          onClose={() => setAddingFor(null)}
          onAdd={handleAdd}
        />
      )}
    </div>
  );
}

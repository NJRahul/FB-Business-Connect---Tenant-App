'use client';
import React, { useState } from 'react';
import { Search, Upload, Plus, AlertTriangle, CheckCircle, X, RefreshCw, Package } from 'lucide-react';
import { SKU_CATALOG, FEED_IMPORTS, MANUAL_ORDERS, DISTRIBUTORS } from './mockData';
import type { SkuRecord, ManualOrder, ManualOrderStatus, ConnectorTier } from './types';

const TIER_CFG: Record<ConnectorTier, { label: string; bg: string; color: string; border: string }> = {
  A: { label: 'Tier A · Live API', bg: '#EFF6FF', color: '#1D4ED8', border: '#93C5FD' },
  B: { label: 'Tier B · Feed',     bg: '#F0FDF4', color: '#15803D', border: '#86EFAC' },
  C: { label: 'Tier C · Manual',   bg: '#FDF4FF', color: '#7E22CE', border: '#C084FC' },
};

const ORDER_STATUS_CFG: Record<ManualOrderStatus, { bg: string; color: string; label: string }> = {
  pending_action: { bg: '#FEF3C7', color: '#B45309', label: 'Action Required' },
  confirmed:      { bg: '#DBEAFE', color: '#1D4ED8', label: 'Confirmed' },
  in_transit:     { bg: '#EDE9FE', color: '#5B21B6', label: 'In Transit' },
  arrived:        { bg: '#D1FAE5', color: '#065F46', label: 'Arrived' },
  cancelled:      { bg: '#F3F4F6', color: '#4B5563', label: 'Cancelled' },
};

function StockBadge({ sku }: { sku: SkuRecord }) {
  if (sku.tier === 'C') {
    const low = sku.reorderThreshold !== undefined && sku.stockQty <= sku.reorderThreshold;
    return (
      <span style={{ background: low ? '#FEF3C7' : '#D1FAE5', color: low ? '#B45309' : '#065F46', border: `1px solid ${low ? '#F59E0B' : '#10B981'}`, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
        {low ? '⚠ Low: ' : ''}{sku.stockQty} on hand
      </span>
    );
  }
  if (!sku.inStock) return <span style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>Out of Stock</span>;
  return <span style={{ background: '#D1FAE5', color: '#065F46', border: '1px solid #10B981', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>In Stock ({sku.stockQty})</span>;
}

function AddSkuModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ sku: '', partName: '', brand: '', size: '', category: 'passenger', unitPrice: '', listPrice: '', stockQty: '', reorderThreshold: '' });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 520, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 16 }}>Add Local SKU (Tier C)</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="#6B7280" /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            { label: 'SKU *', key: 'sku', placeholder: 'e.g. VALVE-STEM-STD' },
            { label: 'Brand *', key: 'brand', placeholder: 'e.g. Schrader' },
            { label: 'Part Name *', key: 'partName', placeholder: 'e.g. Standard Rubber Valve Stem', span: true },
            { label: 'Size / Spec', key: 'size', placeholder: 'e.g. 225/45R17 or N/A' },
            { label: 'Category', key: 'category', type: 'select' },
            { label: 'Your Cost ($) *', key: 'unitPrice', placeholder: '0.00' },
            { label: 'List Price ($)', key: 'listPrice', placeholder: '0.00' },
            { label: 'Qty On Hand *', key: 'stockQty', placeholder: '0' },
            { label: 'Reorder Threshold', key: 'reorderThreshold', placeholder: 'Alert when qty ≤ X' },
          ].map(f => (
            <div key={f.key} style={{ gridColumn: (f as { span?: boolean }).span ? 'span 2' : 'span 1' }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>{f.label}</label>
              {f.type === 'select' ? (
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}>
                  {['passenger', 'light_truck', 'performance', 'tpms', 'supplies', 'other'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              ) : (
                <input
                  value={(form as Record<string, string>)[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
              )}
            </div>
          ))}
        </div>
        <div style={{ background: '#FDF4FF', border: '1px solid #C084FC', borderRadius: 8, padding: '10px 14px', marginTop: 16 }}>
          <div style={{ fontSize: 12, color: '#7E22CE' }}><strong>Tier C:</strong> Item will be treated as immediately available. Qty decrements automatically when a visit using this part is marked completed.</div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px 0', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, cursor: 'pointer', background: '#fff' }}>Cancel</button>
          <button onClick={onClose} style={{ flex: 2, padding: '10px 0', background: '#00A9AC', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Add SKU</button>
        </div>
      </div>
    </div>
  );
}

function ManualOrderRow({ order, onUpdate }: { order: ManualOrder; onUpdate: (id: string, patch: Partial<ManualOrder>) => void }) {
  const cfg = ORDER_STATUS_CFG[order.status];
  const [eta, setEta] = useState(order.etaDate ?? '');
  const [notes, setNotes] = useState(order.notes);

  return (
    <div style={{ background: order.status === 'pending_action' ? '#FFFBEB' : '#fff', border: `1px solid ${order.status === 'pending_action' ? '#F59E0B' : '#E5E7EB'}`, borderRadius: 10, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#1A1A1A' }}>{order.distributorName}</span>
            <span style={{ background: cfg.bg, color: cfg.color, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>{cfg.label}</span>
            {order.status === 'pending_action' && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#B45309' }}><AlertTriangle size={12} /> Staff action required</span>
            )}
          </div>
          <div style={{ fontSize: 13, color: '#374151', marginTop: 2 }}>{order.partName} × {order.qty}</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 1 }}>{order.visitSummary}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 800, color: '#1A1A1A' }}>${(order.unitPrice * order.qty).toFixed(2)}</div>
          <div style={{ fontSize: 11, color: '#9CA3AF' }}>{order.qty} × ${order.unitPrice.toFixed(2)}</div>
        </div>
      </div>

      {order.status === 'pending_action' && (
        <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 8, padding: '10px 14px', marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#92400E', marginBottom: 8 }}>Place this order manually at the distributor portal, then enter the details below:</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Confirmed ETA Date</label>
              <input type="date" value={eta} onChange={e => setEta(e.target.value)} min="2026-06-14"
                style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 10px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 2 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Order Notes</label>
              <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. NTW Order #NTW-12345, rep: John"
                style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 10px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <button onClick={() => onUpdate(order.id, { status: 'confirmed', etaDate: eta, notes, confirmedAt: new Date().toISOString() })}
              disabled={!eta}
              style={{ padding: '6px 14px', background: !eta ? '#E5E7EB' : '#27AE60', color: !eta ? '#9CA3AF' : '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: !eta ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
              Confirm Order
            </button>
          </div>
        </div>
      )}

      {order.status !== 'pending_action' && (
        <div style={{ fontSize: 12, color: '#6B7280' }}>
          {order.etaDate && <span>ETA: <strong>{order.etaDate}</strong> · </span>}
          {order.confirmedAt && <span>Confirmed: {new Date(order.confirmedAt).toLocaleString()} · </span>}
          {order.notes && <span>{order.notes}</span>}
        </div>
      )}
    </div>
  );
}

export function CatalogView() {
  const [query, setQuery] = useState('');
  const [filterDist, setFilterDist] = useState('all');
  const [filterTier, setFilterTier] = useState<ConnectorTier | 'all'>('all');
  const [filterStock, setFilterStock] = useState<'all' | 'in_stock' | 'out'>('all');
  const [tab, setTab] = useState<'catalog' | 'feed_imports' | 'manual_orders'>('catalog');
  const [showAddSku, setShowAddSku] = useState(false);
  const [orders, setOrders] = useState(MANUAL_ORDERS);

  const filtered = SKU_CATALOG.filter(s => {
    if (filterDist !== 'all' && s.distributorId !== filterDist) return false;
    if (filterTier !== 'all' && s.tier !== filterTier) return false;
    if (filterStock === 'in_stock' && !s.inStock && s.tier !== 'C') return false;
    if (filterStock === 'out' && s.inStock) return false;
    if (query && !s.partName.toLowerCase().includes(query.toLowerCase()) && !s.sku.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const pendingOrders = orders.filter(o => o.status === 'pending_action').length;

  return (
    <div style={{ padding: '20px 0', fontFamily: 'Inter, sans-serif' }}>
      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#F9FAFB', padding: 4, borderRadius: 10, border: '1px solid #E5E7EB', width: 'fit-content' }}>
        {[
          ['catalog', 'SKU Catalog', SKU_CATALOG.length],
          ['feed_imports', 'Feed Imports', FEED_IMPORTS.length],
          ['manual_orders', `Manual Orders${pendingOrders > 0 ? ` (${pendingOrders})` : ''}`, orders.length],
        ].map(([id, label, count]) => (
          <button key={id} onClick={() => setTab(id as typeof tab)}
            style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: tab === id ? 700 : 500, cursor: 'pointer', border: 'none', background: tab === id ? '#fff' : 'transparent', color: tab === id ? '#00A9AC' : '#6B7280', boxShadow: tab === id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', whiteSpace: 'nowrap' }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'catalog' && (
        <>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 220px' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search SKU or part name..."
                style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px 8px 32px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <select value={filterDist} onChange={e => setFilterDist(e.target.value)}
              style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', background: '#fff' }}>
              <option value="all">All Distributors</option>
              {DISTRIBUTORS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <select value={filterTier} onChange={e => setFilterTier(e.target.value as ConnectorTier | 'all')}
              style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', background: '#fff' }}>
              <option value="all">All Tiers</option>
              <option value="A">Tier A – Live API</option>
              <option value="B">Tier B – Feed</option>
              <option value="C">Tier C – Manual</option>
            </select>
            <select value={filterStock} onChange={e => setFilterStock(e.target.value as typeof filterStock)}
              style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', background: '#fff' }}>
              <option value="all">All Stock</option>
              <option value="in_stock">In Stock</option>
              <option value="out">Out of Stock</option>
            </select>
            <button onClick={() => setShowAddSku(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#00A9AC', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <Plus size={13} /> Add Local SKU
            </button>
          </div>

          {/* Catalog table */}
          <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  {['SKU', 'Part Name', 'Brand', 'Size', 'Source', 'Your Cost', 'Stock', 'ETA', 'Prices As Of'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={9} style={{ padding: '32px 0', textAlign: 'center', color: '#9CA3AF' }}>No SKUs match your filters.</td></tr>
                )}
                {filtered.map((sku, i) => {
                  const tier = TIER_CFG[sku.tier];
                  const timeDiff = sku.lastPricedAt ? Math.round((Date.now() - new Date(sku.lastPricedAt).getTime()) / 60000) : null;
                  const stale = timeDiff !== null && timeDiff > 60;
                  return (
                    <tr key={sku.id} style={{ borderTop: i > 0 ? '1px solid #E5E7EB' : 'none', background: !sku.inStock && sku.tier !== 'C' ? '#FFF7F7' : 'transparent' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 12, color: '#374151' }}>{sku.sku}</td>
                      <td style={{ padding: '10px 12px', color: '#1A1A1A', fontWeight: 500, maxWidth: 220 }}>{sku.partName}</td>
                      <td style={{ padding: '10px 12px', color: '#6B7280' }}>{sku.brand}</td>
                      <td style={{ padding: '10px 12px', color: '#6B7280', whiteSpace: 'nowrap' }}>{sku.size}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <span style={{ background: tier.bg, color: tier.color, border: `1px solid ${tier.border}`, borderRadius: 5, padding: '1px 7px', fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>{tier.label}</span>
                          <span style={{ fontSize: 11, color: '#9CA3AF' }}>{sku.distributorName}</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', whiteSpace: 'nowrap' }}>
                        ${sku.unitPrice.toFixed(2)}
                        {stale && <span title="Price may be stale" style={{ marginLeft: 6, fontSize: 10, color: '#D97706' }}>⚠</span>}
                      </td>
                      <td style={{ padding: '10px 12px' }}><StockBadge sku={sku} /></td>
                      <td style={{ padding: '10px 12px', color: '#6B7280', whiteSpace: 'nowrap' }}>
                        {sku.tier === 'C' ? '—' : sku.inStock ? `+${sku.etaDays}d` : `${sku.etaDays}d`}
                      </td>
                      <td style={{ padding: '10px 12px', color: stale ? '#D97706' : '#9CA3AF', fontSize: 12, whiteSpace: 'nowrap' }}>
                        {timeDiff !== null ? (timeDiff < 1 ? 'just now' : timeDiff < 60 ? `${timeDiff}m ago` : `${Math.floor(timeDiff / 60)}h ago`) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: '#9CA3AF' }}>
            Showing {filtered.length} of {SKU_CATALOG.length} SKUs · ⚠ = price older than 1h (check Tier A connector status)
          </div>
        </>
      )}

      {tab === 'feed_imports' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: '#6B7280' }}>Tier B catalog feed import history</div>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: '#fff' }}>
              <Upload size={13} /> Upload CSV/XLSX
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FEED_IMPORTS.map(fi => (
              <div key={fi.id} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: fi.status === 'success' ? '#D1FAE5' : '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {fi.status === 'success' ? <CheckCircle size={16} color="#059669" /> : <AlertTriangle size={16} color="#D97706" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#1A1A1A' }}>{fi.fileName}</div>
                    <div style={{ fontSize: 12, color: '#6B7280', marginTop: 1 }}>
                      {new Date(fi.importedAt).toLocaleString()} · {fi.rowsImported.toLocaleString()} imported · {fi.rowsFailed} failed
                    </div>
                  </div>
                  <span style={{ background: fi.status === 'success' ? '#D1FAE5' : '#FEF3C7', color: fi.status === 'success' ? '#065F46' : '#B45309', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                    {fi.status === 'success' ? 'Success' : 'Partial'}
                  </span>
                </div>
                {fi.failures.length > 0 && (
                  <div style={{ borderTop: '1px solid #E5E7EB', padding: '12px 16px', background: '#FFFBEB' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#92400E', marginBottom: 8 }}>Validation Failures — Review Required</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                      <thead><tr style={{ background: '#FEF3C7' }}>
                        {['Row', 'SKU', 'Field', 'Issue'].map(h => <th key={h} style={{ padding: '5px 10px', textAlign: 'left', color: '#B45309', fontWeight: 600 }}>{h}</th>)}
                      </tr></thead>
                      <tbody>{fi.failures.map((f, i) => (
                        <tr key={i} style={{ borderTop: '1px solid #FDE68A' }}>
                          <td style={{ padding: '5px 10px', color: '#78350F' }}>#{f.row}</td>
                          <td style={{ padding: '5px 10px', fontFamily: 'monospace', color: '#78350F' }}>{f.sku}</td>
                          <td style={{ padding: '5px 10px', fontWeight: 600, color: '#92400E' }}>{f.field}</td>
                          <td style={{ padding: '5px 10px', color: '#78350F' }}>{f.issue}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'manual_orders' && (
        <div>
          <div style={{ marginBottom: 16 }}>
            {pendingOrders > 0 && (
              <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 10, padding: '12px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={16} color="#D97706" />
                <span style={{ fontSize: 14, color: '#92400E', fontWeight: 600 }}>{pendingOrders} order{pendingOrders > 1 ? 's' : ''} require manual placement at the distributor portal.</span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {orders.map(o => (
              <ManualOrderRow key={o.id} order={o} onUpdate={(id, patch) => setOrders(prev => prev.map(x => x.id === id ? { ...x, ...patch } : x))} />
            ))}
          </div>
        </div>
      )}

      {showAddSku && <AddSkuModal onClose={() => setShowAddSku(false)} />}
    </div>
  );
}

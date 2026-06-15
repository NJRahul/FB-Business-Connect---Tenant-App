import { useState } from 'react';
import { Search, Download, Users, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import type { CustomerInstall } from './types';
import { MOCK_CUSTOMER_INSTALLS } from './mockData';

interface QueryFilters {
  sku: string;
  dotFrom: string;
  dotTo: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYearFrom: string;
  vehicleYearTo: string;
  saleDateFrom: string;
  saleDateTo: string;
}

const UNIQUE_MAKES = Array.from(new Set(MOCK_CUSTOMER_INSTALLS.map(i => i.vehicleMake))).sort();
const UNIQUE_SKUS = Array.from(new Set(MOCK_CUSTOMER_INSTALLS.map(i => i.sku).filter(Boolean))).sort();

function parseDOTWeek(code: string): number {
  if (!code || code.length < 4) return 0;
  const ww = parseInt(code.slice(0, 2));
  const yy = parseInt(code.slice(2, 4));
  return yy * 100 + ww;
}

function dotInRange(dotCode: string | undefined, from: string, to: string): boolean {
  if (!dotCode) return false;
  const last4 = dotCode.slice(-4);
  const val = parseDOTWeek(last4);
  const f = parseDOTWeek(from);
  const t = parseDOTWeek(to);
  if (!f || !t) return true;
  return val >= f && val <= t;
}

function filterInstalls(installs: CustomerInstall[], filters: QueryFilters) {
  return installs.filter(inst => {
    if (filters.sku && inst.sku !== filters.sku) return false;
    if (filters.dotFrom || filters.dotTo) {
      if (!dotInRange(inst.dotCode, filters.dotFrom, filters.dotTo)) return false;
    }
    if (filters.vehicleMake && inst.vehicleMake !== filters.vehicleMake) return false;
    if (filters.vehicleModel && !inst.vehicleModel.toLowerCase().includes(filters.vehicleModel.toLowerCase())) return false;
    if (filters.vehicleYearFrom && inst.vehicleYear < parseInt(filters.vehicleYearFrom)) return false;
    if (filters.vehicleYearTo && inst.vehicleYear > parseInt(filters.vehicleYearTo)) return false;
    if (filters.saleDateFrom && inst.saleDate < filters.saleDateFrom) return false;
    if (filters.saleDateTo && inst.saleDate > filters.saleDateTo) return false;
    return true;
  });
}

function exportCSV(rows: CustomerInstall[], label: string) {
  const header = 'Customer,Email,Phone,Vehicle,SKU,Product,DOT Code,Lot,Sale Date,Last Visit,Contact Pref';
  const lines = rows.map(r =>
    [r.customerName, r.customerEmail, r.customerPhone, r.vehicle, r.sku, r.productName, r.dotCode || '', r.lotNumber || '', r.saleDate, r.lastVisit, r.contactPreference]
      .map(v => `"${v}"`).join(',')
  );
  const csv = [header, ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `recall-affected-${label}-${new Date().toISOString().split('T')[0]}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

export function AffectedCustomersView() {
  const [filters, setFilters] = useState<QueryFilters>({
    sku: '', dotFrom: '', dotTo: '', vehicleMake: '', vehicleModel: '',
    vehicleYearFrom: '', vehicleYearTo: '', saleDateFrom: '', saleDateTo: '',
  });
  const [hasQueried, setHasQueried] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  function showToast(msg: string) { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3500); }

  function update(field: keyof QueryFilters, val: string) {
    setFilters(f => ({ ...f, [field]: val }));
  }

  function runQuery() { setHasQueried(true); }
  function reset() { setFilters({ sku: '', dotFrom: '', dotTo: '', vehicleMake: '', vehicleModel: '', vehicleYearFrom: '', vehicleYearTo: '', saleDateFrom: '', saleDateTo: '' }); setHasQueried(false); }

  const hasAnyFilter = Object.values(filters).some(v => v.trim() !== '');

  const allResults = hasQueried ? filterInstalls(MOCK_CUSTOMER_INSTALLS, filters) : [];
  const confirmed = allResults.filter(i => i.dotCode);
  const uncertain = allResults.filter(i => !i.dotCode);

  const inputCls = "w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none";
  const inputStyle = { border: '1px solid #E5E7EB', color: '#374151', background: '#fff' };
  const labelStyle: React.CSSProperties = { fontSize: '0.775rem', fontWeight: 600, color: '#374151' };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.125rem', color: '#1A1A1A' }}>Affected Customer Query</h2>
        <p style={{ fontSize: '0.825rem', color: '#6B7280', marginTop: 2 }}>
          Identify customers who may be affected by a recall based on purchase history, DOT code, or vehicle.
        </p>
      </div>

      <div className="flex gap-5">
        {/* Filter Panel */}
        <aside className="shrink-0 w-64 flex flex-col gap-4">
          <div className="rounded-xl p-4 flex flex-col gap-4" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
            <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '0.875rem', color: '#1A1A1A' }}>Query Filters</p>

            <div>
              <label style={labelStyle}>SKU</label>
              <select value={filters.sku} onChange={e => update('sku', e.target.value)} className={inputCls} style={inputStyle}>
                <option value="">All SKUs</option>
                {UNIQUE_SKUS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>DOT Code Range</label>
              <p style={{ fontSize: '0.7rem', color: '#9CA3AF', marginBottom: 4 }}>Format: WWYY (e.g. 2415)</p>
              <div className="flex gap-2 items-center">
                <input value={filters.dotFrom} onChange={e => update('dotFrom', e.target.value)} maxLength={4}
                  placeholder="From" className={inputCls} style={inputStyle} />
                <span style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>–</span>
                <input value={filters.dotTo} onChange={e => update('dotTo', e.target.value)} maxLength={4}
                  placeholder="To" className={inputCls} style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Vehicle Make</label>
              <select value={filters.vehicleMake} onChange={e => update('vehicleMake', e.target.value)} className={inputCls} style={inputStyle}>
                <option value="">Any Make</option>
                {UNIQUE_MAKES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Vehicle Model</label>
              <input value={filters.vehicleModel} onChange={e => update('vehicleModel', e.target.value)} placeholder="e.g. F-150"
                className={inputCls} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Vehicle Year Range</label>
              <div className="flex gap-2 items-center">
                <input type="number" value={filters.vehicleYearFrom} onChange={e => update('vehicleYearFrom', e.target.value)}
                  placeholder="From" className={inputCls} style={inputStyle} />
                <span style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>–</span>
                <input type="number" value={filters.vehicleYearTo} onChange={e => update('vehicleYearTo', e.target.value)}
                  placeholder="To" className={inputCls} style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Sale Date Range</label>
              <input type="date" value={filters.saleDateFrom} onChange={e => update('saleDateFrom', e.target.value)}
                className={inputCls} style={{ ...inputStyle, marginBottom: 6 }} />
              <input type="date" value={filters.saleDateTo} onChange={e => update('saleDateTo', e.target.value)}
                className={inputCls} style={inputStyle} />
            </div>

            <div className="flex flex-col gap-2">
              <button onClick={runQuery}
                className="w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                style={{ background: '#C0392B', color: '#fff', opacity: hasAnyFilter ? 1 : 0.6 }}>
                <Search size={13} /> Run Query
              </button>
              {hasQueried && (
                <button onClick={reset} className="w-full py-2 rounded-lg text-sm"
                  style={{ background: '#F9FAFB', color: '#6B7280', border: '1px solid #E5E7EB' }}>
                  Clear Results
                </button>
              )}
            </div>
          </div>

          {/* Info box */}
          <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
            <Info size={13} color="#1D4ED8" className="shrink-0 mt-0.5" />
            <p style={{ fontSize: '0.75rem', color: '#1E40AF', lineHeight: 1.5 }}>
              Customers without a captured DOT code appear as <strong>uncertain matches</strong>. They purchased the same SKU but their tire's specific production week can't be confirmed.
            </p>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {!hasQueried && (
            <div className="rounded-xl p-10 flex flex-col items-center justify-center gap-3 text-center" style={{ border: '2px dashed #E5E7EB', background: '#FAFAFA' }}>
              <Users size={32} color="#D1D5DB" />
              <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#9CA3AF' }}>Set filters and run a query</p>
              <p style={{ fontSize: '0.825rem', color: '#D1D5DB', maxWidth: 280 }}>
                Results will show all customers matching the selected product, DOT code range, or vehicle criteria.
              </p>
            </div>
          )}

          {hasQueried && (
            <div className="flex flex-col gap-4">
              {/* Action bar */}
              <div className="flex items-center justify-between">
                <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                  <strong style={{ color: '#1A1A1A' }}>{allResults.length}</strong> customers found
                  ({confirmed.length} confirmed · {uncertain.length} uncertain)
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => exportCSV(allResults, 'all')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
                    style={{ background: '#F9FAFB', color: '#374151', border: '1px solid #E5E7EB' }}
                    disabled={allResults.length === 0}>
                    <Download size={13} /> Export CSV
                  </button>
                  <button
                    onClick={() => showToast('Recall segment created. Find it in Marketing → Campaigns → Segments.')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold"
                    style={{ background: '#C0392B', color: '#fff', opacity: allResults.length === 0 ? 0.4 : 1 }}
                    disabled={allResults.length === 0}>
                    <Users size={13} /> Create Campaign Segment
                  </button>
                </div>
              </div>

              {allResults.length === 0 && (
                <div className="rounded-xl p-8 text-center" style={{ border: '1px solid #E5E7EB', background: '#fff' }}>
                  <CheckCircle2 size={24} color="#15803D" className="mx-auto mb-2" />
                  <p style={{ fontWeight: 600, color: '#15803D' }}>No customers match these criteria.</p>
                  <p style={{ fontSize: '0.825rem', color: '#9CA3AF', marginTop: 4 }}>No affected customers found in this shop's purchase history.</p>
                </div>
              )}

              {/* Confirmed matches */}
              {confirmed.length > 0 && (
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E5E7EB', background: '#fff' }}>
                  <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid #F3F4F6', background: '#F0FDF4' }}>
                    <CheckCircle2 size={14} color="#15803D" />
                    <p style={{ fontSize: '0.825rem', fontWeight: 600, color: '#15803D' }}>Confirmed Matches ({confirmed.length}) — DOT code verified</p>
                    <button onClick={() => exportCSV(confirmed, 'confirmed')} className="ml-auto flex items-center gap-1 text-xs px-2 py-1 rounded" style={{ color: '#15803D', background: '#DCFCE7' }}>
                      <Download size={10} /> CSV
                    </button>
                  </div>
                  <CustomerTable rows={confirmed} />
                </div>
              )}

              {/* Uncertain matches */}
              {uncertain.length > 0 && (
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #FDE68A', background: '#fff' }}>
                  <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid #FDE68A', background: '#FFFBEB' }}>
                    <AlertCircle size={14} color="#B45309" />
                    <p style={{ fontSize: '0.825rem', fontWeight: 600, color: '#B45309' }}>Uncertain Matches ({uncertain.length}) — DOT code not captured at install</p>
                    <button onClick={() => exportCSV(uncertain, 'uncertain')} className="ml-auto flex items-center gap-1 text-xs px-2 py-1 rounded" style={{ color: '#B45309', background: '#FEF3C7' }}>
                      <Download size={10} /> CSV
                    </button>
                  </div>
                  <CustomerTable rows={uncertain} uncertain />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {toastMsg && (
        <div className="fixed bottom-6 right-6 px-4 py-3 rounded-xl text-sm font-medium z-50 flex items-center gap-2"
          style={{ background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
          <CheckCircle2 size={14} /> {toastMsg}
        </div>
      )}
    </div>
  );
}

function CustomerTable({ rows, uncertain }: { rows: CustomerInstall[]; uncertain?: boolean }) {
  return (
    <table className="w-full" style={{ borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #F3F4F6' }}>
          {['Customer', 'Contact', 'Vehicle', 'Product / SKU', 'DOT Code', 'Sale Date', 'Pref'].map(h => (
            <th key={h} className="text-left px-4 py-2.5" style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.id} style={{ borderTop: i > 0 ? '1px solid #F3F4F6' : undefined, background: uncertain ? '#FFFBEB20' : undefined }}>
            <td className="px-4 py-3">
              <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1A1A1A' }}>{r.customerName}</p>
            </td>
            <td className="px-4 py-3">
              <p style={{ fontSize: '0.775rem', color: '#6B7280' }}>{r.customerEmail}</p>
              <p style={{ fontSize: '0.775rem', color: '#6B7280' }}>{r.customerPhone}</p>
            </td>
            <td className="px-4 py-3">
              <p style={{ fontSize: '0.825rem', color: '#374151' }}>{r.vehicle}</p>
            </td>
            <td className="px-4 py-3">
              <p style={{ fontSize: '0.8rem', color: '#374151' }}>{r.productName}</p>
              <p style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#9CA3AF' }}>{r.sku}</p>
            </td>
            <td className="px-4 py-3">
              {r.dotCode ? (
                <p style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#374151' }}>{r.dotCode}</p>
              ) : (
                <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#FEF3C7', color: '#B45309' }}>Not captured</span>
              )}
            </td>
            <td className="px-4 py-3">
              <p style={{ fontSize: '0.8rem', color: '#374151' }}>{r.saleDate}</p>
            </td>
            <td className="px-4 py-3">
              <span style={{ fontSize: '0.775rem', color: '#6B7280' }}>{r.contactPreference}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

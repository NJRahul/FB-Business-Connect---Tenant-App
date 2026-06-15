import { useState, useMemo } from 'react';
import { Search, ShieldAlert, FileText } from 'lucide-react';
import { MOCK_ACCESS_LOGS } from './mockData';

export function AuditLogView() {
  const [adminFilter, setAdminFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [query, setQuery] = useState('');

  const admins = useMemo(() => [...new Set(MOCK_ACCESS_LOGS.map(l => l.adminEmail))], []);
  const actions = useMemo(() => [...new Set(MOCK_ACCESS_LOGS.map(l => l.action))], []);

  const filtered = useMemo(() => {
    return MOCK_ACCESS_LOGS.filter(l => {
      const matchAdmin = !adminFilter || l.adminEmail === adminFilter;
      const matchAction = !actionFilter || l.action === actionFilter;
      const matchDate = (!dateFrom || new Date(l.createdAt) >= new Date(dateFrom))
        && (!dateTo || new Date(l.createdAt) <= new Date(dateTo + 'T23:59:59Z'));
      const q = query.toLowerCase();
      const matchQ = !q || l.targetShopName.toLowerCase().includes(q)
        || l.adminName.toLowerCase().includes(q) || l.writtenReason.toLowerCase().includes(q);
      return matchAdmin && matchAction && matchDate && matchQ;
    });
  }, [adminFilter, actionFilter, dateFrom, dateTo, query]);

  return (
    <div className="flex flex-col h-full gap-6" style={{ color: '#F9FAFB' }}>
      <div>
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.25rem' }}>Cross-Tenant Audit Log</h2>
        <p style={{ fontSize: '0.825rem', color: '#6B7280', marginTop: 2 }}>
          Complete record of every platform admin access to tenant data.
        </p>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Accesses', value: MOCK_ACCESS_LOGS.length },
          { label: 'PII Accessed', value: MOCK_ACCESS_LOGS.filter(l => l.piiAccessed).length },
          { label: 'Unique Tenants', value: new Set(MOCK_ACCESS_LOGS.map(l => l.targetShopId)).size },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: '#111827', border: '1px solid #1F2937' }}>
            <p style={{ fontSize: '0.75rem', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{s.label}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F9FAFB', marginTop: 4 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#4B5563' }} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search tenant, admin, reason…"
            className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: '#1F2937', border: '1px solid #374151', color: '#F9FAFB', fontFamily: 'Inter, sans-serif' }}
            onFocus={e => (e.target.style.borderColor = '#DC2626')}
            onBlur={e => (e.target.style.borderColor = '#374151')} />
        </div>
        <select value={adminFilter} onChange={e => setAdminFilter(e.target.value)}
          className="px-3 py-2.5 rounded-lg text-sm outline-none"
          style={{ background: '#1F2937', border: '1px solid #374151', color: '#D1D5DB' }}>
          <option value="">All Admins</option>
          {admins.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}
          className="px-3 py-2.5 rounded-lg text-sm outline-none"
          style={{ background: '#1F2937', border: '1px solid #374151', color: '#D1D5DB' }}>
          <option value="">All Actions</option>
          {actions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
          className="px-3 py-2.5 rounded-lg text-sm outline-none"
          style={{ background: '#1F2937', border: '1px solid #374151', color: '#D1D5DB', colorScheme: 'dark' }} />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
          className="px-3 py-2.5 rounded-lg text-sm outline-none"
          style={{ background: '#1F2937', border: '1px solid #374151', color: '#D1D5DB', colorScheme: 'dark' }} />
      </div>

      {/* Log table */}
      <div className="rounded-xl overflow-hidden flex-1" style={{ border: '1px solid #1F2937' }}>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0D1526', borderBottom: '1px solid #1F2937' }}>
                {['Timestamp', 'Admin', 'Target Tenant', 'Action', 'Record Kind', 'Duration', 'PII', 'Reason'].map(h => (
                  <th key={h} className="text-left px-4 py-3 whitespace-nowrap"
                    style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4B5563', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12" style={{ color: '#4B5563', fontSize: '0.875rem' }}>
                    <FileText size={24} color="#1F2937" className="mx-auto mb-2" />
                    No log entries match the selected filters.
                  </td>
                </tr>
              ) : filtered.map((l, i) => (
                <tr key={l.id} style={{ borderBottom: '1px solid #1F2937', background: i % 2 === 0 ? '#111827' : '#0F1623' }}>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ fontSize: '0.775rem', color: '#6B7280' }}>
                    {new Date(l.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <p style={{ fontSize: '0.825rem', fontWeight: 600, color: '#D1D5DB', whiteSpace: 'nowrap' }}>{l.adminName}</p>
                    <p style={{ fontSize: '0.75rem', color: '#4B5563' }}>{l.adminEmail}</p>
                  </td>
                  <td className="px-4 py-3" style={{ fontSize: '0.825rem', color: '#D1D5DB', whiteSpace: 'nowrap' }}>{l.targetShopName}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono"
                      style={{ background: '#0C1A2E', color: '#60A5FA' }}>
                      {l.action}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ fontFamily: 'monospace', fontSize: '0.775rem', color: '#9CA3AF' }}>{l.recordKind}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ fontSize: '0.825rem', color: '#6B7280' }}>
                    {l.durationSeconds}s
                  </td>
                  <td className="px-4 py-3">
                    {l.piiAccessed ? (
                      <div className="flex items-center gap-1">
                        <ShieldAlert size={12} color="#F87171" />
                        <span style={{ fontSize: '0.75rem', color: '#F87171' }}>Yes</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#374151' }}>No</span>
                    )}
                  </td>
                  <td className="px-4 py-3" style={{ fontSize: '0.8rem', color: '#9CA3AF', maxWidth: 240 }}>
                    <p className="line-clamp-2">{l.writtenReason}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

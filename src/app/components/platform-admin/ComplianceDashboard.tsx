import { ShieldCheck, AlertTriangle, Clock, Users, FileText, Download } from 'lucide-react';
import { MOCK_ACCESS_LOGS } from './mockData';

export function ComplianceDashboard() {
  const piiLogs = MOCK_ACCESS_LOGS.filter(l => l.piiAccessed);
  const longSessions = MOCK_ACCESS_LOGS.filter(l => l.durationSeconds > 300);
  const allAdmins = [...new Set(MOCK_ACCESS_LOGS.map(l => l.adminEmail))];
  const tenants = [...new Set(MOCK_ACCESS_LOGS.map(l => l.targetShopName))];

  // Simulated quarterly stats
  const quarterStats = {
    totalAccesses: 142,
    piiAccesses: 18,
    longsessions: 4,
    notificationsSent: 2,
    uniqueAdmins: 3,
  };

  return (
    <div className="flex flex-col gap-6" style={{ color: '#F9FAFB' }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.25rem' }}>Compliance Dashboard</h2>
          <p style={{ fontSize: '0.825rem', color: '#6B7280', marginTop: 2 }}>
            Quarterly access review · Q2 2026 (Apr – Jun)
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: '#1F2937', color: '#9CA3AF', border: '1px solid #374151' }}>
          <Download size={14} /> Export PDF
        </button>
      </div>

      {/* Quarterly summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total Accesses', value: quarterStats.totalAccesses, icon: FileText, color: '#60A5FA' },
          { label: 'PII Accesses', value: quarterStats.piiAccesses, icon: ShieldCheck, color: '#F87171' },
          { label: 'Long Sessions (>5m)', value: quarterStats.longsessions, icon: Clock, color: '#FBBF24' },
          { label: 'Notifications Sent', value: quarterStats.notificationsSent, icon: AlertTriangle, color: '#A78BFA' },
          { label: 'Unique Admins', value: quarterStats.uniqueAdmins, icon: Users, color: '#4ADE80' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: '#111827', border: '1px solid #1F2937' }}>
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={14} color={s.color} />
              <p style={{ fontSize: '0.7rem', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{s.label}</p>
            </div>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F9FAFB' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Policy requirements */}
      <div className="rounded-xl p-5" style={{ background: '#111827', border: '1px solid #1F2937' }}>
        <h3 style={{ fontWeight: 600, fontSize: '0.9rem', color: '#F9FAFB', marginBottom: 16 }}>Policy Requirements</h3>
        {[
          {
            label: 'Written reason required for all cross-tenant access',
            met: true,
            detail: `${MOCK_ACCESS_LOGS.filter(l => l.writtenReason).length}/${MOCK_ACCESS_LOGS.length} accesses have written reason`,
          },
          {
            label: 'PII access >5 minutes triggers shop owner notification within 24h',
            met: piiLogs.filter(l => l.durationSeconds > 300).length === 0,
            detail: piiLogs.filter(l => l.durationSeconds > 300).length === 0
              ? 'No PII sessions exceeded 5 minutes this quarter'
              : `${piiLogs.filter(l => l.durationSeconds > 300).length} session(s) exceeded threshold`,
          },
          {
            label: 'All accesses logged with session ID and record kind',
            met: MOCK_ACCESS_LOGS.every(l => l.sessionId && l.recordKind),
            detail: 'All log entries contain session ID and record kind',
          },
          {
            label: 'MFA enabled for all active platform admins',
            met: true,
            detail: 'All 3 active platform admins have MFA enabled',
          },
          {
            label: 'Quarterly compliance review completed',
            met: false,
            detail: 'Review due June 30, 2026 — not yet signed off',
          },
        ].map(r => (
          <div key={r.label} className="flex items-start gap-3 py-3" style={{ borderBottom: '1px solid #1F2937' }}>
            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: r.met ? '#052E16' : '#1C0A0A' }}>
              {r.met
                ? <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#4ADE80" strokeWidth="1.8" strokeLinecap="round"/></svg>
                : <AlertTriangle size={10} color="#F87171" />}
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: r.met ? '#D1D5DB' : '#80D4D5', fontWeight: 500 }}>{r.label}</p>
              <p style={{ fontSize: '0.775rem', color: '#4B5563', marginTop: 2 }}>{r.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* PII access detail */}
      <div className="rounded-xl p-5" style={{ background: '#111827', border: '1px solid #1F2937' }}>
        <h3 style={{ fontWeight: 600, fontSize: '0.9rem', color: '#F9FAFB', marginBottom: 4 }}>PII Accesses This Quarter</h3>
        <p style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: 16 }}>
          Sessions where PII-bearing tables were accessed. Sessions &gt;5 minutes trigger a shop owner notification.
        </p>
        {piiLogs.length === 0 ? (
          <p style={{ color: '#4B5563', fontSize: '0.875rem' }}>No PII accesses recorded.</p>
        ) : piiLogs.map(l => (
          <div key={l.id} className="flex items-start justify-between py-3" style={{ borderBottom: '1px solid #1F2937' }}>
            <div>
              <p style={{ fontSize: '0.825rem', color: '#D1D5DB' }}>
                <span style={{ fontWeight: 600 }}>{l.adminName}</span> accessed <span style={{ fontWeight: 600 }}>{l.targetShopName}</span>
              </p>
              <p style={{ fontSize: '0.775rem', color: '#6B7280', marginTop: 2 }}>{l.writtenReason}</p>
              <p style={{ fontSize: '0.75rem', color: '#4B5563', marginTop: 1 }}>{new Date(l.createdAt).toLocaleString()}</p>
            </div>
            <div className="text-right ml-4 shrink-0">
              <p style={{ fontSize: '0.8rem', color: l.durationSeconds > 300 ? '#F87171' : '#6B7280' }}>{l.durationSeconds}s</p>
              {l.durationSeconds > 300 && (
                <span className="text-xs px-2 py-0.5 rounded mt-1 inline-block" style={{ background: '#1C0A0A', color: '#F87171' }}>
                  Notified
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Notification record */}
      <div className="rounded-xl p-5" style={{ background: '#111827', border: '1px solid #1F2937' }}>
        <h3 style={{ fontWeight: 600, fontSize: '0.9rem', color: '#F9FAFB', marginBottom: 12 }}>
          Shop Owner Notifications Sent
        </h3>
        <p style={{ fontSize: '0.825rem', color: '#6B7280', marginBottom: 16 }}>
          When PII-bearing tables are accessed for &gt;5 minutes, the shop admin receives an email within 24 hours identifying the platform staff member and providing a contact path.
        </p>
        {quarterStats.notificationsSent === 0 ? (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg" style={{ background: '#052E16' }}>
            <ShieldCheck size={14} color="#4ADE80" />
            <p style={{ fontSize: '0.825rem', color: '#4ADE80' }}>No notifications required this quarter.</p>
          </div>
        ) : (
          <p style={{ fontSize: '0.825rem', color: '#D1D5DB' }}>
            {quarterStats.notificationsSent} notification(s) sent. See email delivery logs for details.
          </p>
        )}
      </div>
    </div>
  );
}

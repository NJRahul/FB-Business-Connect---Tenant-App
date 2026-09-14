import { ExternalLink, Activity, Zap, GitBranch, AlertTriangle, BookOpen, Code2, Terminal, TestTube, BookMarked, RefreshCw } from 'lucide-react';
import { USAGE_STATS } from './mockData';

function fmtNum(n: number) {
  return n.toLocaleString('en-US');
}

function UsageBar({ used, limit, label, color }: { used: number; limit: number; label: string; color: string }) {
  const pct = Math.min((used / limit) * 100, 100);
  const warn = pct >= 80;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span style={{ color: '#374151', fontSize: '0.875rem', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: warn ? '#D97706' : '#1A1A1A' }}>
          {fmtNum(used)} / {fmtNum(limit)}
        </span>
      </div>
      <div className="h-2 rounded-full" style={{ background: '#F3F4F6' }}>
        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: warn ? '#F39C12' : color }} />
      </div>
      <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '3px' }}>
        {fmtNum(limit - used)} remaining this billing period
      </p>
    </div>
  );
}

export function UsageView() {
  const s = USAGE_STATS;
  const webhookSuccessRate = Math.round(((s.webhookDeliveries - s.webhookFailures) / s.webhookDeliveries) * 100);

  const devPortalLinks = [
    { label: 'Interactive API Explorer',     icon: Terminal,  href: '#', desc: 'Try endpoints in the browser with live responses' },
    { label: 'JavaScript / Python SDKs',     icon: Code2,     href: '#', desc: 'Starter kits with auto-pagination and retry logic' },
    { label: 'Webhook Tester',               icon: TestTube,  href: '#', desc: 'Send test events to any registered endpoint' },
    { label: 'Zapier Integration Guide',     icon: Zap,       href: '#', desc: 'Step-by-step walkthrough for connecting Zapier' },
    { label: 'Workflow Cookbook',            icon: BookMarked,href: '#', desc: 'Proven automation recipes across industry verticals' },
    { label: 'Changelog',                    icon: RefreshCw, href: '#', desc: 'API version history, deprecations, and new features' },
  ];

  return (
    <div>
      {/* Dev portal banner */}
      <div className="mb-6 rounded-[12px] p-5" style={{ background: '#0D1117', border: '1px solid #1e2938' }}>
        <div className="flex items-center justify-between">
          <div>
            <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, color: '#e6edf3', fontSize: '1.125rem' }}>
              developers.fb-business-connect.com
            </p>
            <p style={{ color: '#8b9cb3', fontSize: '0.875rem', marginTop: '4px' }}>
              Full API reference, SDKs, interactive explorer, webhook tester, and workflow cookbook.
            </p>
          </div>
          <a
            href="#"
            className="flex items-center gap-2 px-4 py-2.5 rounded-[8px] text-sm font-semibold"
            style={{ background: '#C0392B', color: '#fff' }}
          >
            <ExternalLink size={14} /> Open Developer Portal
          </a>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          {devPortalLinks.map(link => {
            const Icon = link.icon;
            return (
              <a
                key={link.label}
                href={link.href}
                className="flex items-start gap-2.5 p-3 rounded-[8px] group"
                style={{ background: '#1e2938', border: '1px solid #2d3748' }}
              >
                <div className="w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0 mt-0.5" style={{ background: '#C0392B20' }}>
                  <Icon size={14} style={{ color: '#C0392B' }} />
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: '#e6edf3', fontSize: '0.8125rem' }}>{link.label}</p>
                  <p style={{ color: '#8b9cb3', fontSize: '0.75rem', marginTop: '2px' }}>{link.desc}</p>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Usage stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* API usage */}
        <div className="bg-white rounded-[10px] p-5" style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} style={{ color: '#C0392B' }} />
            <h3 style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>API Requests</h3>
          </div>
          <UsageBar used={s.apiCallsThisPeriod} limit={s.apiCallsLimit} label="Requests this period" color="#C0392B" />

          <div className="mt-4 pt-4" style={{ borderTop: '1px solid #F3F4F6' }}>
            <p style={{ fontWeight: 700, color: '#374151', fontSize: '0.8125rem', marginBottom: '8px' }}>Top Endpoints</p>
            <div className="space-y-2">
              {s.topEndpoints.map(ep => {
                const pct = Math.round((ep.calls / s.apiCallsThisPeriod) * 100);
                return (
                  <div key={ep.path}>
                    <div className="flex items-center justify-between mb-0.5">
                      <code style={{ fontFamily: 'monospace', color: '#374151', fontSize: '0.75rem' }}>{ep.path}</code>
                      <span style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 600 }}>{fmtNum(ep.calls)}</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: '#F3F4F6' }}>
                      <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: '#FDEDEC' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Webhook + workflow stats */}
        <div className="space-y-4">
          <div className="bg-white rounded-[10px] p-5" style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} style={{ color: '#1D4ED8' }} />
              <h3 style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>Webhook Deliveries</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total sent', value: fmtNum(s.webhookDeliveries), color: '#1D4ED8' },
                { label: 'Failures', value: fmtNum(s.webhookFailures), color: '#DC2626' },
                { label: 'Success rate', value: `${webhookSuccessRate}%`, color: '#16A34A' },
              ].map(stat => (
                <div key={stat.label} className="text-center p-3 rounded-[8px]" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                  <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '1.25rem', color: stat.color }}>{stat.value}</p>
                  <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '2px' }}>{stat.label}</p>
                </div>
              ))}
            </div>
            {s.webhookFailures > 0 && (
              <div className="mt-3 flex items-center gap-2 p-2 rounded-[6px]" style={{ background: '#FEF2F2', border: '1px solid #FCA5A5' }}>
                <AlertTriangle size={13} style={{ color: '#DC2626', flexShrink: 0 }} />
                <p style={{ color: '#991B1B', fontSize: '0.8125rem' }}>
                  {s.webhookFailures} deliveries failed after max retries. Review the Webhooks tab.
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-[10px] p-5" style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-2 mb-3">
              <GitBranch size={16} style={{ color: '#7E22CE' }} />
              <h3 style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>Workflow Executions</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total executions', value: fmtNum(s.workflowExecutions), color: '#7E22CE' },
                { label: 'This period', value: '442', color: '#374151' },
              ].map(stat => (
                <div key={stat.label} className="text-center p-3 rounded-[8px]" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                  <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '1.25rem', color: stat.color }}>{stat.value}</p>
                  <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '2px' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick reset panel */}
      <div className="bg-white rounded-[10px] p-5" style={{ border: '1px solid #E5E7EB' }}>
        <h3 style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem', marginBottom: '12px' }}>Credential Management</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'Reset API Key', desc: 'Immediately revoke an existing token and issue a new one.', action: 'Reset Token', danger: true },
            { label: 'Rotate Webhook Secret', desc: 'Issue a new signing secret for all endpoints or a specific one.', action: 'Rotate Secret', danger: false },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between gap-3 p-4 rounded-[8px]" style={{ border: '1px solid #E5E7EB', background: '#F9FAFB' }}>
              <div>
                <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.875rem' }}>{item.label}</p>
                <p style={{ color: '#6B7280', fontSize: '0.8125rem', marginTop: '2px' }}>{item.desc}</p>
              </div>
              <button
                className="px-3 py-1.5 rounded-[6px] text-sm font-semibold shrink-0"
                style={{ border: `1.5px solid ${item.danger ? '#FCA5A5' : '#E5E7EB'}`, color: item.danger ? '#DC2626' : '#374151', background: item.danger ? '#FEF2F2' : '#fff' }}
              >
                {item.action}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

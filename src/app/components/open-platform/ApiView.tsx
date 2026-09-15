import { useState } from 'react';
import {
  Key, Plus, Trash2, Copy, Check, ChevronRight, Eye, EyeOff,
  ExternalLink, Shield, AlertTriangle, Clock,
} from 'lucide-react';
import { API_TOKENS, OAUTH_CLIENTS, API_ENDPOINTS } from './mockData';
import type { ApiToken, ApiEndpoint } from './types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const METHOD_COLOR: Record<string, { bg: string; color: string }> = {
  GET:    { bg: '#DCFCE7', color: '#15803D' },
  POST:   { bg: '#EFF6FF', color: '#1D4ED8' },
  PUT:    { bg: '#FEF3C7', color: '#D97706' },
  PATCH:  { bg: '#FDF4FF', color: '#7E22CE' },
  DELETE: { bg: '#F0FBFB', color: '#DC2626' },
};

function MethodBadge({ method }: { method: string }) {
  const c = METHOD_COLOR[method] ?? { bg: '#F3F4F6', color: '#6B7280' };
  return (
    <span className="px-2 py-0.5 rounded text-xs font-bold font-mono" style={{ background: c.bg, color: c.color, minWidth: 52, textAlign: 'center', display: 'inline-block' }}>
      {method}
    </span>
  );
}

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtRelative(iso: string | null) {
  if (!iso) return 'Never';
  const d = new Date(iso);
  const now = new Date('2026-06-16T10:00:00Z');
  const diffH = Math.floor((now.getTime() - d.getTime()) / 3600000);
  if (diffH < 1) return 'Just now';
  if (diffH < 24) return `${diffH}h ago`;
  if (diffH < 48) return 'Yesterday';
  return fmtDate(iso);
}

// ─── Code Block ───────────────────────────────────────────────────────────────

type Lang = 'curl' | 'js' | 'python';

const EXAMPLES: Record<string, Record<Lang, string>> = {
  'GET /v1/customers': {
    curl: `curl https://api.fb-business-connect.com/v1/customers \\
  -H "Authorization: Bearer <token>" \\
  -G \\
  --data-urlencode "limit=25" \\
  --data-urlencode "cursor=curs_abc123"`,
    js: `const resp = await fetch(
  'https://api.fb-business-connect.com/v1/customers?limit=25',
  { headers: { Authorization: 'Bearer <token>' } }
);
const { data, next_cursor } = await resp.json();`,
    python: `import httpx
r = httpx.get(
    "https://api.fb-business-connect.com/v1/customers",
    headers={"Authorization": "Bearer <token>"},
    params={"limit": 25}
)
data = r.json()["data"]`,
  },
  'POST /v1/bookings': {
    curl: `curl -X POST https://api.fb-business-connect.com/v1/bookings \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: idem_$(uuidgen)" \\
  -d '{
    "customer_id": "cust_abc123",
    "vehicle_id": "veh_xyz789",
    "service_type_id": "st-3",
    "scheduled_start": "2026-07-01T09:00:00Z"
  }'`,
    js: `const resp = await fetch(
  'https://api.fb-business-connect.com/v1/bookings',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer <token>',
      'Content-Type': 'application/json',
      'Idempotency-Key': crypto.randomUUID(),
    },
    body: JSON.stringify({
      customer_id: 'cust_abc123',
      vehicle_id: 'veh_xyz789',
      service_type_id: 'st-3',
      scheduled_start: '2026-07-01T09:00:00Z',
    }),
  }
);
const booking = await resp.json();`,
    python: `import httpx, uuid
r = httpx.post(
    "https://api.fb-business-connect.com/v1/bookings",
    headers={
        "Authorization": "Bearer <token>",
        "Idempotency-Key": str(uuid.uuid4()),
    },
    json={
        "customer_id": "cust_abc123",
        "vehicle_id": "veh_xyz789",
        "service_type_id": "st-3",
        "scheduled_start": "2026-07-01T09:00:00Z",
    }
)
booking = r.json()`,
  },
};

function CodeBlock({ endpoint }: { endpoint: ApiEndpoint }) {
  const [lang, setLang] = useState<Lang>('curl');
  const [copied, setCopied] = useState(false);
  const key = `${endpoint.method} ${endpoint.path}`;
  const fallbackKey = Object.keys(EXAMPLES)[0];
  const code = EXAMPLES[key]?.[lang] ?? EXAMPLES[fallbackKey][lang];

  function copy() {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-1">
          {(['curl', 'js', 'python'] as Lang[]).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className="px-3 py-1 rounded text-xs font-bold"
              style={{ background: lang === l ? '#00A9AC' : '#1e2938', color: lang === l ? '#fff' : '#8b9cb3' }}
            >
              {l === 'curl' ? 'cURL' : l === 'js' ? 'JavaScript' : 'Python'}
            </button>
          ))}
        </div>
        <button onClick={copy} className="flex items-center gap-1 text-xs" style={{ color: copied ? '#27AE60' : '#8b9cb3' }}>
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre
        className="rounded-[8px] p-4 overflow-x-auto text-xs leading-relaxed"
        style={{ background: '#0D1117', color: '#e6edf3', fontFamily: '"Fira Code", "Cascadia Code", monospace', whiteSpace: 'pre', tabSize: 2 }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ─── Response Schema ──────────────────────────────────────────────────────────

function ResponseSchema({ endpoint }: { endpoint: ApiEndpoint }) {
  const isCollection = endpoint.method === 'GET' && !endpoint.path.includes(':id');
  const resource = endpoint.resource.toLowerCase().slice(0, -1);

  const obj = `{
  "id": "string",
  "object": "${resource}",
  "created_at": "ISO 8601",
  "updated_at": "ISO 8601",
  ...resource fields
}`;

  const schema = isCollection
    ? `{
  "object": "list",
  "data": [ /* ${resource} objects */ ],
  "has_more": true,
  "next_cursor": "curs_xyz",
  "total_count": 142
}`
    : obj;

  return (
    <pre
      className="rounded-[8px] p-4 overflow-x-auto text-xs"
      style={{ background: '#0D1117', color: '#8b9cb3', fontFamily: 'monospace', whiteSpace: 'pre' }}
    >
      <code style={{ color: '#e6edf3' }}>{schema}</code>
    </pre>
  );
}

// ─── Endpoint Detail ──────────────────────────────────────────────────────────

function EndpointDetail({ endpoint }: { endpoint: ApiEndpoint }) {
  const rateLimitInfo = [
    { tier: 'Pro', limit: '1,000 req / hour' },
    { tier: 'Enterprise', limit: '5,000 req / hour' },
  ];

  const errors = [
    { code: 400, label: 'bad_request', desc: 'Invalid or missing fields in the request body.' },
    { code: 401, label: 'unauthorized', desc: 'Missing or invalid API token.' },
    { code: 403, label: 'forbidden', desc: 'Token lacks required scope for this operation.' },
    { code: 404, label: 'not_found', desc: 'Resource does not exist within your tenant.' },
    { code: 429, label: 'rate_limited', desc: 'Rate limit exceeded. See Retry-After header.' },
    { code: 500, label: 'server_error', desc: 'Unexpected server error. Retry with backoff.' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <MethodBadge method={endpoint.method} />
        <code style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1A1A1A', fontSize: '1.0625rem' }}>
          {endpoint.path}
        </code>
      </div>
      <p style={{ color: '#6B7280', fontSize: '0.9375rem', lineHeight: 1.6 }}>
        {endpoint.summary}. All responses are JSON. Tenant isolation is enforced at the token level — a token scoped to Tenant A cannot access Tenant B data regardless of payload.
      </p>

      {/* Auth */}
      <div>
        <h4 style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.875rem', marginBottom: '8px' }}>Authentication</h4>
        <div className="p-3 rounded-[8px] text-sm" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
          <p style={{ color: '#374151' }}>
            <strong>Bearer token:</strong> <code style={{ fontFamily: 'monospace', background: '#F3F4F6', padding: '1px 6px', borderRadius: 4 }}>Authorization: Bearer fb-business-connect_live_sk_****</code>
          </p>
          <p style={{ color: '#374151', marginTop: 6 }}>
            <strong>OAuth 2.0 client-credentials</strong> also accepted. Token must include scope <code style={{ fontFamily: 'monospace', background: '#F3F4F6', padding: '1px 6px', borderRadius: 4 }}>{endpoint.resource.toLowerCase().slice(0, -1)}s:{endpoint.method === 'GET' ? 'read' : 'write'}</code>.
          </p>
        </div>
      </div>

      {/* Rate limits */}
      <div>
        <h4 style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.875rem', marginBottom: '8px' }}>Rate Limits</h4>
        <div className="flex gap-3">
          {rateLimitInfo.map(r => (
            <div key={r.tier} className="flex-1 p-3 rounded-[8px]" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
              <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.8125rem' }}>{r.tier}</p>
              <p style={{ color: '#00A9AC', fontWeight: 600, fontFamily: 'monospace', fontSize: '0.875rem' }}>{r.limit}</p>
            </div>
          ))}
        </div>
        <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '6px' }}>
          On exceeding the limit: HTTP 429 with <code style={{ fontFamily: 'monospace' }}>Retry-After: &lt;seconds&gt;</code> header.
        </p>
      </div>

      {/* Pagination (GET collection) */}
      {endpoint.method === 'GET' && !endpoint.path.includes(':id') && (
        <div>
          <h4 style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.875rem', marginBottom: '8px' }}>Pagination</h4>
          <div className="p-3 rounded-[8px] text-sm" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
            {[
              { param: 'limit', desc: 'Max records to return (default 25, max 100)' },
              { param: 'cursor', desc: 'Opaque cursor from previous response next_cursor field' },
              { param: 'created_after', desc: 'ISO 8601 date — only return records created after' },
            ].map(p => (
              <div key={p.param} className="flex gap-2 mb-1">
                <code style={{ fontFamily: 'monospace', color: '#00A9AC', minWidth: '120px', flexShrink: 0 }}>{p.param}</code>
                <span style={{ color: '#374151' }}>{p.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Code example */}
      <div>
        <h4 style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.875rem', marginBottom: '8px' }}>Example Request</h4>
        <CodeBlock endpoint={endpoint} />
      </div>

      {/* Response */}
      <div>
        <h4 style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.875rem', marginBottom: '8px' }}>Response Schema</h4>
        <ResponseSchema endpoint={endpoint} />
      </div>

      {/* Error codes */}
      <div>
        <h4 style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.875rem', marginBottom: '8px' }}>Error Codes</h4>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
              {['HTTP', 'Code', 'Description'].map(h => (
                <th key={h} className="py-2 text-left" style={{ color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {errors.map(e => (
              <tr key={e.code} style={{ borderBottom: '1px solid #F3F4F6' }}>
                <td className="py-2">
                  <span style={{ fontWeight: 700, color: e.code < 500 ? '#D97706' : '#DC2626', fontFamily: 'monospace' }}>{e.code}</span>
                </td>
                <td className="py-2">
                  <code style={{ fontFamily: 'monospace', color: '#374151', fontSize: '0.8125rem' }}>{e.label}</code>
                </td>
                <td className="py-2" style={{ color: '#6B7280' }}>{e.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Versioning */}
      <div className="p-3 rounded-[8px] flex items-start gap-2" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
        <AlertTriangle size={14} style={{ color: '#F39C12', marginTop: '2px', flexShrink: 0 }} />
        <p style={{ color: '#92400E', fontSize: '0.8125rem' }}>
          <strong>Versioning:</strong> This endpoint is on <code style={{ fontFamily: 'monospace' }}>/v1/</code>. When <code style={{ fontFamily: 'monospace' }}>/v2/</code> ships, <code style={{ fontFamily: 'monospace' }}>/v1/</code> will remain available for 12 months with deprecation notices sent to all tenants with active v1 usage.
        </p>
      </div>
    </div>
  );
}

// ─── API Keys Tab ─────────────────────────────────────────────────────────────

function ScopeChip({ scope }: { scope: string }) {
  const [res, op] = scope.split(':');
  return (
    <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold" style={{ background: op === 'write' ? '#E6F7F7' : '#F0F9FF', color: op === 'write' ? '#00A9AC' : '#0369A1' }}>
      {scope}
    </span>
  );
}

function TokenRow({ token, onRevoke }: { token: ApiToken; onRevoke: () => void }) {
  const [revealed, setRevealed] = useState(false);
  const revoked = !!token.revokedAt;

  return (
    <div className="bg-white rounded-[10px] p-4" style={{ border: `1px solid ${revoked ? '#F3F4F6' : '#E5E7EB'}`, opacity: revoked ? 0.65 : 1 }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>{token.name}</p>
            {revoked && (
              <span className="px-1.5 py-0.5 rounded text-xs font-bold" style={{ background: '#F3F4F6', color: '#9CA3AF' }}>Revoked</span>
            )}
          </div>
          <div className="flex items-center gap-2 mb-3">
            <code className="px-2 py-0.5 rounded text-xs" style={{ background: '#0D1117', color: '#e6edf3', fontFamily: 'monospace' }}>
              {revealed ? token.preview.replace('****', 'a8f3c2d1') : token.preview}
            </code>
            {!revoked && (
              <button onClick={() => setRevealed(r => !r)} style={{ color: '#9CA3AF' }}>
                {revealed ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {token.scopes.map(s => <ScopeChip key={s} scope={s} />)}
          </div>
        </div>
        <div className="text-right shrink-0 space-y-1">
          <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
            <Clock size={11} style={{ display: 'inline', marginRight: 3 }} />
            Last used: <span style={{ color: '#374151', fontWeight: 500 }}>{fmtRelative(token.lastUsedAt)}</span>
          </p>
          <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
            Created {fmtDate(token.createdAt)}
          </p>
          {!revoked && (
            <button
              onClick={onRevoke}
              className="flex items-center gap-1 text-xs font-semibold mt-2"
              style={{ color: '#DC2626' }}
            >
              <Trash2 size={12} /> Revoke
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateTokenModal({ onClose }: { onClose: () => void }) {
  const ALL_SCOPES = [
    'customers:read', 'customers:write',
    'vehicles:read', 'vehicles:write',
    'bookings:read', 'bookings:write',
    'visits:read', 'visits:write',
    'invoices:read', 'invoices:write',
    'products:read', 'products:write',
    'services:read', 'services:write',
    'inspections:read', 'inspections:write',
    'fleet:read', 'fleet:write',
    'communications:read', 'communications:write',
  ] as const;

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [name, setName] = useState('');
  const [created, setCreated] = useState(false);
  const newToken = 'fb-business-connect_live_sk_9a2f8c4d1e7b3f6a0d5c2e8b4f7a1d';

  function toggle(s: string) {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(s) ? n.delete(s) : n.add(s);
      return n;
    });
  }

  if (created) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
        <div className="bg-white rounded-[14px] p-6 w-full max-w-md" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: '#DCFCE7' }}>
            <Check size={22} style={{ color: '#16A34A' }} />
          </div>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.125rem', marginBottom: '8px' }}>
            Token Created
          </h3>
          <p style={{ color: '#DC2626', fontWeight: 600, fontSize: '0.875rem', marginBottom: '12px' }}>
            Copy this token now — it won't be shown again.
          </p>
          <div className="flex items-center gap-2 p-3 rounded-[8px] mb-4" style={{ background: '#0D1117' }}>
            <code style={{ flex: 1, fontFamily: 'monospace', color: '#e6edf3', fontSize: '0.8125rem', wordBreak: 'break-all' }}>
              {newToken}
            </code>
            <button style={{ color: '#8b9cb3', flexShrink: 0 }}><Copy size={14} /></button>
          </div>
          <button onClick={onClose} className="w-full py-2.5 rounded-[8px] text-sm font-semibold text-white" style={{ background: '#00A9AC' }}>
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-white rounded-[14px] p-6 w-full max-w-lg flex flex-col" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.18)', maxHeight: '85vh' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.0625rem' }}>New API Token</h3>
          <button onClick={onClose} style={{ color: '#9CA3AF' }}>✕</button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          <div>
            <label className="block mb-1" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>Token Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Production Integration"
              className="w-full px-3 py-2 rounded-[6px] text-sm"
              style={{ border: '1.5px solid #E5E7EB', outline: 'none', color: '#1A1A1A' }}
            />
          </div>

          <div>
            <label className="block mb-2" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>Scopes</label>
            <div className="grid grid-cols-2 gap-1.5">
              {ALL_SCOPES.map(s => {
                const [, op] = s.split(':');
                return (
                  <label key={s} className="flex items-center gap-2 p-2 rounded-[6px] cursor-pointer" style={{ border: selected.has(s) ? `1.5px solid ${op === 'write' ? '#00A9AC' : '#1D4ED8'}` : '1.5px solid #E5E7EB', background: selected.has(s) ? (op === 'write' ? '#E6F7F7' : '#EFF6FF') : '#fff' }}>
                    <input type="checkbox" checked={selected.has(s)} onChange={() => toggle(s)} className="accent-red-600" />
                    <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#374151' }}>{s}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-[8px] text-sm font-semibold" style={{ border: '1.5px solid #E5E7EB', color: '#6B7280' }}>Cancel</button>
          <button onClick={() => setCreated(true)} className="flex-1 py-2.5 rounded-[8px] text-sm font-semibold text-white" style={{ background: name && selected.size > 0 ? '#00A9AC' : '#F3F4F6', color: name && selected.size > 0 ? '#fff' : '#D1D5DB' }}>
            Generate Token
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ApiView ─────────────────────────────────────────────────────────────

type ApiTab = 'reference' | 'keys' | 'oauth';

export function ApiView() {
  const [apiTab, setApiTab] = useState<ApiTab>('reference');
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint>(API_ENDPOINTS[0]);
  const [tokens, setTokens] = useState(API_TOKENS);
  const [showCreate, setShowCreate] = useState(false);

  const grouped = API_ENDPOINTS.reduce<Record<string, ApiEndpoint[]>>((acc, ep) => {
    if (!acc[ep.resource]) acc[ep.resource] = [];
    acc[ep.resource].push(ep);
    return acc;
  }, {});

  function revoke(id: string) {
    setTokens(prev => prev.map(t => t.id === id ? { ...t, revokedAt: '2026-06-16T10:00:00Z' } : t));
  }

  return (
    <div>
      {/* Sub-tab bar */}
      <div className="flex gap-1 mb-5 p-1 rounded-[8px] w-fit" style={{ background: '#F3F4F6' }}>
        {[
          { id: 'reference' as ApiTab, label: 'API Reference' },
          { id: 'keys' as ApiTab, label: 'API Tokens' },
          { id: 'oauth' as ApiTab, label: 'OAuth Clients' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setApiTab(t.id)}
            className="px-4 py-1.5 rounded-[6px] text-sm font-semibold transition-all"
            style={{ background: apiTab === t.id ? '#fff' : 'transparent', color: apiTab === t.id ? '#1A1A1A' : '#6B7280', boxShadow: apiTab === t.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* API Reference */}
      {apiTab === 'reference' && (
        <div className="flex gap-4" style={{ minHeight: '70vh' }}>
          {/* Left sidebar */}
          <aside
            className="shrink-0 rounded-[10px] overflow-y-auto"
            style={{ width: '220px', border: '1px solid #E5E7EB', background: '#0D1117' }}
          >
            <div className="p-3 sticky top-0" style={{ background: '#0D1117', borderBottom: '1px solid #1e2938' }}>
              <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#e6edf3', fontSize: '0.875rem' }}>API v1 Reference</p>
              <p style={{ color: '#8b9cb3', fontSize: '0.6875rem', marginTop: '2px' }}>api.fb-business-connect.com</p>
            </div>
            <nav className="p-2">
              {Object.entries(grouped).map(([resource, eps]) => (
                <div key={resource} className="mb-2">
                  <p style={{ color: '#8b9cb3', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 8px' }}>
                    {resource}
                  </p>
                  {eps.map(ep => (
                    <button
                      key={ep.path + ep.method}
                      onClick={() => setSelectedEndpoint(ep)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-[4px] text-left"
                      style={{
                        background: selectedEndpoint === ep ? '#1e2938' : 'transparent',
                      }}
                    >
                      <span
                        className="text-xs font-bold font-mono"
                        style={{ color: METHOD_COLOR[ep.method]?.color ?? '#6B7280', minWidth: 38 }}
                      >
                        {ep.method}
                      </span>
                      <span style={{ color: selectedEndpoint === ep ? '#e6edf3' : '#8b9cb3', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ep.path.replace('/v1/', '')}
                      </span>
                    </button>
                  ))}
                </div>
              ))}

              <div className="mt-3 pt-3" style={{ borderTop: '1px solid #1e2938' }}>
                <a
                  href="#"
                  className="flex items-center gap-1.5 px-2 py-1.5 text-xs"
                  style={{ color: '#8b9cb3' }}
                >
                  <ExternalLink size={11} />
                  Full docs at developers.fb-business-connect.com
                </a>
              </div>
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0 bg-white rounded-[10px] p-6" style={{ border: '1px solid #E5E7EB' }}>
            <EndpointDetail endpoint={selectedEndpoint} />
          </div>
        </div>
      )}

      {/* API Tokens */}
      {apiTab === 'keys' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.0625rem' }}>API Tokens</h3>
              <p style={{ color: '#6B7280', fontSize: '0.8125rem', marginTop: '2px' }}>Personal access tokens scoped by operation, revocable at any time.</p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-[8px] text-sm font-semibold text-white"
              style={{ background: '#00A9AC' }}
            >
              <Plus size={14} /> New Token
            </button>
          </div>

          <div className="space-y-3">
            {tokens.map(t => (
              <TokenRow key={t.id} token={t} onRevoke={() => revoke(t.id)} />
            ))}
          </div>

          <div className="mt-4 p-3 rounded-[8px] flex items-start gap-2" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
            <Shield size={14} style={{ color: '#F39C12', marginTop: '2px', flexShrink: 0 }} />
            <p style={{ color: '#92400E', fontSize: '0.8125rem' }}>
              Tokens are scoped to this tenant. A token cannot access data from another tenant regardless of what IDs are passed in the request body.
            </p>
          </div>

          {showCreate && <CreateTokenModal onClose={() => setShowCreate(false)} />}
        </div>
      )}

      {/* OAuth Clients */}
      {apiTab === 'oauth' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.0625rem' }}>OAuth 2.0 Clients</h3>
              <p style={{ color: '#6B7280', fontSize: '0.8125rem', marginTop: '2px' }}>Server-to-server client-credentials flow. Clients are scoped per tenant.</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-[8px] text-sm font-semibold text-white" style={{ background: '#00A9AC' }}>
              <Plus size={14} /> New Client
            </button>
          </div>

          <div className="bg-white rounded-[10px] overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  {['Client Name', 'Client ID', 'Scopes', 'Last Used', 'Created', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left" style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {OAUTH_CLIENTS.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td className="px-4 py-3">
                      <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.875rem' }}>{c.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <code style={{ fontFamily: 'monospace', color: '#6B7280', fontSize: '0.75rem' }}>{c.clientId}</code>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.scopes.slice(0, 3).map(s => <ScopeChip key={s} scope={s} />)}
                        {c.scopes.length > 3 && <span style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>+{c.scopes.length - 3} more</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: '#6B7280', fontSize: '0.875rem' }}>{fmtRelative(c.lastUsedAt)}</td>
                    <td className="px-4 py-3" style={{ color: '#6B7280', fontSize: '0.875rem' }}>{fmtDate(c.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button className="text-xs font-semibold flex items-center gap-1" style={{ color: '#DC2626' }}>
                        <Trash2 size={12} /> Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3 rounded-[8px] text-sm" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
            <p style={{ color: '#374151' }}>
              <strong>Token URL:</strong>{' '}
              <code style={{ fontFamily: 'monospace', background: '#0D1117', color: '#e6edf3', padding: '2px 8px', borderRadius: 4 }}>
                POST https://auth.fb-business-connect.com/oauth/token
              </code>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, Copy, Shield, AlertTriangle, Lock, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import { CUSTOM_DOMAIN } from './mockData';
import type { BrandingPlanTier, CustomDomain, VerificationStatus } from './types';

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function VerificationBadge({ status }: { status: VerificationStatus }) {
  const MAP = {
    pending:  { bg: '#FEF3C7', color: '#D97706', icon: Clock,         label: 'Pending verification' },
    verified: { bg: '#F0FDF4', color: '#15803D', icon: CheckCircle,   label: 'Verified' },
    failed:   { bg: '#F0FBFB', color: '#DC2626', icon: XCircle,       label: 'Verification failed' },
  };
  const m = MAP[status];
  const Icon = m.icon;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700, background: m.bg, color: m.color }}>
      <Icon size={12} />
      {m.label}
    </span>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }
  return (
    <button onClick={copy} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 5, border: '1px solid #E5E7EB', background: copied ? '#F0FDF4' : '#fff', color: copied ? '#15803D' : '#6B7280', fontSize: 11, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
      {copied ? <CheckCircle size={11} /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function SslBadge({ daysRemaining }: { daysRemaining: number | null }) {
  if (daysRemaining === null) return <span style={{ fontSize: 12, color: '#9CA3AF' }}>—</span>;
  const urgent = daysRemaining <= 7;
  const warning = daysRemaining <= 30;
  const bg    = urgent ? '#F0FBFB' : warning ? '#FFFBEB' : '#F0FDF4';
  const color = urgent ? '#DC2626' : warning ? '#D97706' : '#15803D';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700, background: bg, color }}>
      <Shield size={12} />
      {urgent ? `⚠ Expires in ${daysRemaining}d — renewing…` : warning ? `Renews in ${daysRemaining}d` : `Secured — ${daysRemaining}d remaining`}
    </span>
  );
}

function TroubleshootingGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
      <button onClick={() => setOpen(v => !v)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F9FAFB', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>Troubleshooting — DNS not verifying?</span>
        {open ? <ChevronDown size={14} color="#9CA3AF" /> : <ChevronRight size={14} color="#9CA3AF" />}
      </button>
      {open && (
        <div style={{ padding: '14px', fontSize: 12, color: '#374151', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { n: 1, t: 'DNS propagation takes 5 minutes – 48 hours. Click "Verify Now" after making changes.' },
            { n: 2, t: 'Use a DNS checker (dnschecker.org) to confirm your records are visible globally.' },
            { n: 3, t: 'Make sure you added the CNAME on the "www" subdomain, not the root "@" record.' },
            { n: 4, t: 'If your DNS provider auto-appends your domain, omit it from the host field (e.g. use "www" not "www.acmetires.com").' },
            { n: 5, t: 'Contact your DNS provider if records have not propagated after 48 hours.' },
          ].map(s => (
            <div key={s.n} style={{ display: 'flex', gap: 10 }}>
              <span style={{ width: 18, height: 18, borderRadius: 99, background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{s.n}</span>
              <span>{s.t}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DomainConfigured({ domain, plan }: { domain: CustomDomain; plan: BrandingPlanTier }) {
  const [verifying, setVerifying] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const [released, setReleased] = useState(false);

  function verify() {
    setVerifying(true);
    setTimeout(() => setVerifying(false), 1500);
  }

  function release() {
    if (!window.confirm(`Release ${domain.domain}? Your storefront will immediately fall back to acmetires.fb-business-connect.app.`)) return;
    setReleasing(true);
    setTimeout(() => { setReleasing(false); setReleased(true); }, 900);
  }

  if (released) {
    return (
      <div style={{ padding: '20px', border: '1px solid #E5E7EB', borderRadius: 10, background: '#F9FAFB', textAlign: 'center', color: '#6B7280', fontSize: 14 }}>
        <CheckCircle size={24} color="#15803D" style={{ margin: '0 auto 10px', display: 'block' }} />
        <div style={{ fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>Domain released</div>
        Storefront is now serving from <strong>acmetires.fb-business-connect.app</strong>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Domain status card */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>{domain.domain}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 3 }}>Added {fmtDate(domain.createdAt)}</div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <VerificationBadge status={domain.verificationStatus} />
            <button onClick={verify} disabled={verifying} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, border: '1px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              <RefreshCw size={12} style={{ animation: verifying ? 'spin 0.8s linear infinite' : 'none' }} />
              {verifying ? 'Checking…' : 'Verify Now'}
            </button>
          </div>
        </div>

        {/* SSL */}
        <div style={{ padding: '12px 14px', borderRadius: 8, background: '#F9FAFB', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 2 }}>SSL Certificate</div>
            {domain.sslExpiresAt && <div style={{ fontSize: 11, color: '#9CA3AF' }}>Expires {fmtDate(domain.sslExpiresAt)}</div>}
          </div>
          <SslBadge daysRemaining={domain.sslDaysRemaining} />
        </div>
      </div>

      {/* DNS records */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', fontWeight: 700, fontSize: 13, color: '#1A1A1A' }}>
          Required DNS Records
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              {['Type', 'Host', 'Value', 'TTL', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.03em', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {domain.dnsRecords.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                <td style={{ padding: '11px 14px' }}>
                  <span style={{ padding: '2px 7px', borderRadius: 4, background: '#EDE9FE', color: '#7C3AED', fontSize: 11, fontWeight: 700 }}>{r.type}</span>
                </td>
                <td style={{ padding: '11px 14px', fontFamily: 'monospace', fontSize: 12, color: '#374151' }}>{r.host}</td>
                <td style={{ padding: '11px 14px', maxWidth: 220 }}>
                  <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#1A1A1A', wordBreak: 'break-all' }}>{r.value}</div>
                </td>
                <td style={{ padding: '11px 14px', fontSize: 12, color: '#9CA3AF' }}>{r.ttl}s</td>
                <td style={{ padding: '11px 14px' }}>
                  {r.verified
                    ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#15803D', fontSize: 12, fontWeight: 600 }}><CheckCircle size={13} /> Verified</span>
                    : <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#D97706', fontSize: 12, fontWeight: 600 }}><Clock size={13} /> Pending</span>}
                </td>
                <td style={{ padding: '11px 14px' }}>
                  <CopyButton value={r.value} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TroubleshootingGuide />

      {/* SSL renewal policy */}
      <div style={{ padding: '12px 16px', borderRadius: 8, background: '#EFF6FF', border: '1px solid #BFDBFE', fontSize: 12, color: '#1E40AF' }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>SSL Auto-Renewal Policy</div>
        SSL is automatically renewed 30 days before expiry. If auto-renewal fails: alerts at 14 and 7 days, email to shop admin at 3 days. Storefront falls back to <strong>acmetires.fb-business-connect.app</strong> 24 hours before expiry to stay online.
      </div>

      {/* Release */}
      <div style={{ border: '1px solid #80D4D5', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#1A1A1A' }}>Release Custom Domain</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>Storefront immediately falls back to acmetires.fb-business-connect.app. You can re-add the domain anytime.</div>
        </div>
        <button onClick={release} disabled={releasing} style={{ flexShrink: 0, padding: '8px 16px', borderRadius: 7, border: '1px solid #80D4D5', background: '#F0FBFB', color: '#DC2626', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          {releasing ? 'Releasing…' : 'Release Domain'}
        </button>
      </div>
    </div>
  );
}

function AddDomainForm({ onAdd }: { onAdd: (domain: string) => void }) {
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function submit() {
    if (!value.trim()) return;
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); onAdd(value.trim()); }, 800);
  }

  return (
    <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', padding: '24px 24px' }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: '#1A1A1A', marginBottom: 6 }}>Connect a Custom Domain</div>
      <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 18 }}>
        Point your domain to FB Business Connect and we'll provision SSL automatically. Your subdomain stays active as fallback.
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="www.yourshop.com"
          onKeyDown={e => e.key === 'Enter' && submit()}
          style={{ flex: 1, padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#1A1A1A', outline: 'none' }}
        />
        <button onClick={submit} disabled={submitting || !value.trim()} style={{ padding: '10px 20px', borderRadius: 8, background: '#00A9AC', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          {submitting ? 'Adding…' : 'Add Domain'}
        </button>
      </div>
      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {['A record or CNAME — your choice depending on provider', 'Auto-provisioned SSL via Let\'s Encrypt (managed)', 'Subdomain always remains as a live fallback'].map(l => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#6B7280' }}>
            <CheckCircle size={12} color="#15803D" /> {l}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CustomDomainView({ plan }: { plan: BrandingPlanTier }) {
  const [domain, setDomain] = useState<CustomDomain | null>(CUSTOM_DOMAIN);

  if (plan === 'starter') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', gap: 16, border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff' }}>
        <Lock size={32} color="#D97706" />
        <div style={{ fontWeight: 700, fontSize: 18, color: '#1A1A1A' }}>Custom Domain — Pro Plan</div>
        <div style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', maxWidth: 420 }}>
          Connect your own domain (www.yourshop.com) to your FB Business Connect storefront. Automatic SSL, subdomain fallback, and DNS guidance included.
        </div>
        <button style={{ padding: '10px 24px', borderRadius: 8, background: '#00A9AC', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
          Upgrade to Pro
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {domain
        ? <DomainConfigured domain={domain} plan={plan} />
        : <AddDomainForm onAdd={d => {
            setDomain({
              id: 'dom_new',
              domain: d,
              verificationStatus: 'pending',
              sslExpiresAt: null,
              sslDaysRemaining: null,
              dnsRecords: [
                { type: 'CNAME', host: 'www', value: `${d.replace(/^www\./, '').replace(/\./g, '-')}.proxy.fb-business-connect.io`, ttl: 3600, required: true, verified: false },
                { type: 'TXT', host: '@', value: `fb-business-connect-verify=${Math.random().toString(36).slice(2, 14)}`, ttl: 300, required: true, verified: false },
              ],
              createdAt: new Date().toISOString().slice(0, 10),
            });
          }} />
      }
    </div>
  );
}

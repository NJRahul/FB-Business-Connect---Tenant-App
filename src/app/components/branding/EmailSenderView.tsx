import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, Copy, RefreshCw, Lock, AlertTriangle, Shield } from 'lucide-react';
import { CUSTOM_EMAIL_SENDER } from './mockData';
import type { BrandingPlanTier, CustomEmailSender, DnsRecordStatus, EmailDnsRecord } from './types';

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

function RecordStatusIcon({ status }: { status: DnsRecordStatus }) {
  if (status === 'pass')    return <CheckCircle size={16} color="#15803D" />;
  if (status === 'fail')    return <XCircle size={16} color="#DC2626" />;
  return <Clock size={16} color="#D97706" />;
}

function RecordRow({ label, record, onVerify }: { label: string; record: EmailDnsRecord; onVerify: () => void }) {
  const [verifying, setVerifying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [localStatus, setLocalStatus] = useState<DnsRecordStatus>(record.status);

  function handleVerify() {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setLocalStatus(prev => prev === 'fail' ? 'fail' : 'pass');
      onVerify();
    }, 1400);
  }

  const statusLabel = localStatus === 'pass' ? 'Pass' : localStatus === 'fail' ? 'Failed' : 'Pending';
  const statusColor = localStatus === 'pass' ? '#15803D' : localStatus === 'fail' ? '#DC2626' : '#D97706';
  const statusBg    = localStatus === 'pass' ? '#F0FDF4' : localStatus === 'fail' ? '#F0FBFB' : '#FFFBEB';

  return (
    <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
      {/* Summary row */}
      <div
        onClick={() => setExpanded(v => !v)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', cursor: 'pointer', background: '#fff' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <RecordStatusIcon status={localStatus} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>{label}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace', marginTop: 2 }}>{record.type} record · {record.host}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: statusBg, color: statusColor }}>{statusLabel}</span>
          <button
            onClick={e => { e.stopPropagation(); handleVerify(); }}
            disabled={verifying}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
          >
            <RefreshCw size={11} style={{ animation: verifying ? 'spin 0.8s linear infinite' : 'none' }} />
            {verifying ? 'Checking…' : 'Verify Now'}
          </button>
        </div>
      </div>

      {/* Expanded DNS record detail */}
      {expanded && (
        <div style={{ padding: '14px 18px', background: '#F9FAFB', borderTop: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>DNS Record to Add</div>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 8 }}>
            {[
              { label: 'Type', value: record.type },
              { label: 'Host', value: record.host },
              { label: 'Value', value: record.value },
            ].map(row => (
              <React.Fragment key={row.label}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', paddingTop: 4 }}>{row.label}</div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1, fontFamily: 'monospace', fontSize: 11, color: '#1A1A1A', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 10px', wordBreak: 'break-all', lineHeight: 1.5 }}>{row.value}</div>
                  <CopyButton value={row.value} />
                </div>
              </React.Fragment>
            ))}
          </div>

          {localStatus === 'fail' && (
            <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 7, background: '#F0FBFB', border: '1px solid #80D4D5', fontSize: 12, color: '#005F62' }}>
              Record not found or incorrect. Verify the value above matches exactly, including any trailing periods your DNS provider may require.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmailSenderConfigured({ sender }: { sender: CustomEmailSender }) {
  const allPass = sender.dkimStatus === 'pass' && sender.spfStatus === 'pass' && sender.dmarcStatus === 'pass';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Status header */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Configured Sender</div>
            <div style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>bookings@{sender.domain}</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>From name: {sender.fromName}</div>
          </div>
          {allPass ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 99, background: '#F0FDF4', color: '#15803D', fontSize: 13, fontWeight: 700 }}>
              <Shield size={14} /> Active — all records passing
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 99, background: '#FFFBEB', color: '#D97706', fontSize: 13, fontWeight: 700 }}>
              <AlertTriangle size={14} /> Inactive — fix failing records below
            </span>
          )}
        </div>

        {!allPass && (
          <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 8, background: '#FFFBEB', border: '1px solid #FDE68A', fontSize: 12, color: '#92400E' }}>
            Emails will not send from <strong>{sender.domain}</strong> until all three DNS records pass verification. Your default FB Business Connect sender remains active in the meantime.
          </div>
        )}
      </div>

      {/* DNS records */}
      <div style={{ fontWeight: 700, fontSize: 13, color: '#1A1A1A' }}>DNS Records</div>
      <RecordRow label="DKIM" record={sender.dkimRecord} onVerify={() => {}} />
      <RecordRow label="SPF" record={sender.spfRecord} onVerify={() => {}} />
      <RecordRow label="DMARC" record={sender.dmarcRecord} onVerify={() => {}} />

      {/* Reputation monitoring */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', padding: '18px 20px' }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: '#1A1A1A', marginBottom: 14 }}>Sender Reputation Monitoring</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            {
              label: 'Bounce Rate',
              value: `${(sender.bounceRate * 100).toFixed(1)}%`,
              threshold: '5%',
              ok: sender.bounceRate < 0.05,
              sub: 'Alert threshold: 5%',
            },
            {
              label: 'Spam Complaint Rate',
              value: `${(sender.spamRate * 100).toFixed(2)}%`,
              threshold: '0.08%',
              ok: sender.spamRate < 0.0008,
              sub: 'Alert threshold: 0.08%',
            },
          ].map(m => (
            <div key={m.label} style={{ padding: '14px 16px', borderRadius: 8, border: '1px solid #E5E7EB', background: m.ok ? '#F0FDF4' : '#F0FBFB' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 26, color: m.ok ? '#15803D' : '#DC2626' }}>{m.value}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{m.sub}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: '#6B7280' }}>
          Monitoring runs hourly. If bounce rate or spam rate exceed thresholds, sending will be paused automatically and you'll receive an email alert.
        </div>
      </div>

      {/* What DKIM/SPF/DMARC do */}
      <div style={{ padding: '14px 16px', borderRadius: 8, background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
        <div style={{ fontWeight: 700, fontSize: 12, color: '#374151', marginBottom: 8 }}>Why these records matter</div>
        {[
          { label: 'DKIM', desc: 'Cryptographic signature proving emails genuinely came from your domain. Required by Gmail and Yahoo for bulk senders.' },
          { label: 'SPF', desc: 'Authorizes FB Business Connect\'s mail servers to send on your behalf. Prevents spoofing.' },
          { label: 'DMARC', desc: 'Policy record that tells receiving servers what to do when DKIM or SPF fail. Required for inbox delivery at scale.' },
        ].map(r => (
          <div key={r.label} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
            <span style={{ padding: '1px 7px', borderRadius: 4, background: '#EDE9FE', color: '#7C3AED', fontSize: 10, fontWeight: 700, height: 18, flexShrink: 0 }}>{r.label}</span>
            <span style={{ fontSize: 12, color: '#6B7280' }}>{r.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddEmailSenderForm({ onAdd }: { onAdd: (domain: string, fromName: string) => void }) {
  const [domain, setDomain] = useState('');
  const [fromName, setFromName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function submit() {
    if (!domain.trim() || !fromName.trim()) return;
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); onAdd(domain.trim(), fromName.trim()); }, 800);
  }

  return (
    <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', padding: '24px' }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: '#1A1A1A', marginBottom: 6 }}>Configure Custom Email Sender</div>
      <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 18 }}>
        Send booking confirmations, reminders, and follow-ups from your own domain. All DNS records must pass before emails send.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Sender Domain</label>
          <input value={domain} onChange={e => setDomain(e.target.value)} placeholder="yourshop.com" style={{ width: '100%', padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: 7, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 3 }}>Emails will send as bookings@yourshop.com</div>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>From Name</label>
          <input value={fromName} onChange={e => setFromName(e.target.value)} placeholder="Acme Tires" style={{ width: '100%', padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: 7, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <button onClick={submit} disabled={submitting || !domain.trim() || !fromName.trim()} style={{ padding: '10px 20px', borderRadius: 8, background: '#00A9AC', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}>
          {submitting ? 'Setting up…' : 'Configure Sender'}
        </button>
      </div>
    </div>
  );
}

export function EmailSenderView({ plan }: { plan: BrandingPlanTier }) {
  const [sender, setSender] = useState<CustomEmailSender | null>(CUSTOM_EMAIL_SENDER);

  if (plan === 'starter') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', gap: 16, border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff' }}>
        <Lock size={32} color="#7C3AED" />
        <div style={{ fontWeight: 700, fontSize: 18, color: '#1A1A1A' }}>Custom Email Sender — Pro Plan</div>
        <div style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', maxWidth: 420 }}>
          Send emails from your own domain (bookings@yourshop.com). Includes DKIM, SPF, and DMARC setup with guided DNS configuration.
        </div>
        <button style={{ padding: '10px 24px', borderRadius: 8, background: '#00A9AC', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
          Upgrade to Pro
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {sender
        ? <EmailSenderConfigured sender={sender} />
        : <AddEmailSenderForm onAdd={(d, name) => setSender({
            ...CUSTOM_EMAIL_SENDER,
            id: 'email_new',
            domain: d,
            fromName: name,
            dkimStatus: 'pending',
            spfStatus: 'pending',
            dmarcStatus: 'pending',
            active: false,
            dkimRecord: { ...CUSTOM_EMAIL_SENDER.dkimRecord, host: `fb-business-connect._domainkey.${d}`, status: 'pending' },
            spfRecord: { ...CUSTOM_EMAIL_SENDER.spfRecord, host: d, status: 'pending' },
            dmarcRecord: { ...CUSTOM_EMAIL_SENDER.dmarcRecord, host: `_dmarc.${d}`, status: 'pending' },
          })}
        />
      }
    </div>
  );
}

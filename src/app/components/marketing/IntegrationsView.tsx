import { useState } from 'react';
import { Facebook, Instagram, Mail, CheckCircle, XCircle, RefreshCw, ExternalLink, AlertTriangle, Tag, Send, Image, Calendar, BarChart2, MapPin, DollarSign, Globe, Eye, EyeOff } from 'lucide-react';
import { SOCIAL_POSTS, GBP_CONNECTIONS, LSA_CONNECTIONS, ANALYTICS_CONFIG } from './mockData';
import type { SocialPlatform, PostStatus } from './types';

// ─── Social Media ──────────────────────────────────────────────────────────────

const POST_STATUS_CFG: Record<PostStatus, { label: string; color: string; bg: string }> = {
  draft:     { label: 'Draft', color: '#6B7280', bg: '#F3F4F6' },
  scheduled: { label: 'Scheduled', color: '#D97706', bg: '#FEF3C7' },
  published: { label: 'Published', color: '#15803D', bg: '#F0FDF4' },
  failed:    { label: 'Failed', color: '#DC2626', bg: '#FEF2F2' },
};

const PLATFORM_CFG: Record<SocialPlatform, { label: string; color: string; bg: string }> = {
  facebook:  { label: 'Facebook', color: '#1877F2', bg: '#EFF6FF' },
  instagram: { label: 'Instagram', color: '#7C3AED', bg: '#F5F3FF' },
};

function SocialSection() {
  const [composing, setComposing] = useState(false);
  const [caption, setCaption] = useState('');
  const [platforms, setPlatforms] = useState<SocialPlatform[]>(['facebook', 'instagram']);
  const [scheduleMode, setScheduleMode] = useState<'now' | 'later'>('now');
  const [scheduleAt, setScheduleAt] = useState('');
  const [sent, setSent] = useState(false);

  function togglePlatform(p: SocialPlatform) {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  }

  function handlePost() {
    setSent(true);
    setTimeout(() => { setSent(false); setComposing(false); setCaption(''); }, 2000);
  }

  const totalReach = SOCIAL_POSTS.filter(p => p.status === 'published').reduce((s, p) => s + (p.reach ?? 0), 0);
  const totalEngage = SOCIAL_POSTS.filter(p => p.status === 'published').reduce((s, p) => s + (p.engagement ?? 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { label: 'Total Reach', value: totalReach.toLocaleString(), sub: 'published posts' },
          { label: 'Engagements', value: totalEngage.toLocaleString(), sub: 'likes + comments + shares' },
          { label: 'Scheduled', value: SOCIAL_POSTS.filter(p => p.status === 'scheduled').length, sub: 'upcoming posts' },
        ].map(s => (
          <div key={s.label} style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '14px 18px', background: '#fff' }}>
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 26, color: '#1A1A1A' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Compose button */}
      {!composing && (
        <button
          onClick={() => setComposing(true)}
          style={{
            padding: '10px 20px', borderRadius: 8, border: '2px dashed #E5E7EB',
            background: '#F9FAFB', color: '#6B7280', cursor: 'pointer', fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <Send size={15} /> Create New Post
        </button>
      )}

      {/* Composer */}
      {composing && (
        <div style={{ border: '1px solid #00A9AC', borderRadius: 10, background: '#fff', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#1A1A1A' }}>New Social Post</div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 6 }}>Platforms</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['facebook', 'instagram'] as SocialPlatform[]).map(p => {
                const cfg = PLATFORM_CFG[p];
                const active = platforms.includes(p);
                return (
                  <button key={p} onClick={() => togglePlatform(p)} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
                    borderRadius: 7, border: `1.5px solid ${active ? cfg.color : '#E5E7EB'}`,
                    background: active ? cfg.bg : '#fff', color: active ? cfg.color : '#6B7280',
                    cursor: 'pointer', fontWeight: 600, fontSize: 13,
                  }}>
                    {p === 'facebook' ? <Facebook size={14} /> : <Instagram size={14} />} {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 6 }}>Caption</label>
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Write your post caption here…"
              rows={4}
              style={{
                width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '10px 12px',
                fontSize: 13, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif',
              }}
            />
            <div style={{ textAlign: 'right', fontSize: 11, color: caption.length > 2000 ? '#DC2626' : '#9CA3AF' }}>{caption.length} / 2,000</div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 6 }}>Schedule</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              {(['now', 'later'] as const).map(m => (
                <button key={m} onClick={() => setScheduleMode(m)} style={{
                  padding: '6px 14px', borderRadius: 7,
                  border: `1.5px solid ${scheduleMode === m ? '#00A9AC' : '#E5E7EB'}`,
                  background: scheduleMode === m ? '#E6F7F7' : '#fff',
                  color: scheduleMode === m ? '#00A9AC' : '#6B7280',
                  cursor: 'pointer', fontSize: 13, fontWeight: 600,
                }}>
                  {m === 'now' ? 'Post Now' : 'Schedule'}
                </button>
              ))}
            </div>
            {scheduleMode === 'later' && (
              <input
                type="datetime-local" value={scheduleAt}
                onChange={e => setScheduleAt(e.target.value)}
                style={{ border: '1px solid #E5E7EB', borderRadius: 7, padding: '8px 12px', fontSize: 13 }}
              />
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setComposing(false)} style={{ padding: '9px 16px', borderRadius: 7, border: '1px solid #E5E7EB', background: '#fff', color: '#6B7280', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
            <button
              onClick={handlePost}
              disabled={!caption.trim() || platforms.length === 0}
              style={{
                padding: '9px 18px', borderRadius: 7, border: 'none',
                background: sent ? '#27AE60' : (caption.trim() && platforms.length > 0 ? '#00A9AC' : '#E5E7EB'),
                color: caption.trim() && platforms.length > 0 ? '#fff' : '#9CA3AF',
                cursor: caption.trim() && platforms.length > 0 ? 'pointer' : 'not-allowed',
                fontWeight: 600, fontSize: 13,
              }}
            >
              {sent ? 'Posted!' : scheduleMode === 'now' ? 'Publish Now' : 'Schedule Post'}
            </button>
          </div>
        </div>
      )}

      {/* Post list */}
      {SOCIAL_POSTS.map(post => {
        const cfg = POST_STATUS_CFG[post.status];
        return (
          <div key={post.id} style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 28, lineHeight: 1 }}>{post.imageEmoji ?? '📸'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: '#1A1A1A', lineHeight: 1.5 }}>{post.caption}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    {post.platforms.map(p => {
                      const pc = PLATFORM_CFG[p];
                      return <span key={p} style={{ padding: '1px 7px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: pc.bg, color: pc.color }}>{pc.label}</span>;
                    })}
                    <span style={{ padding: '1px 7px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                    {post.scheduledAt && <span style={{ fontSize: 11, color: '#9CA3AF', alignSelf: 'center' }}>{new Date(post.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                    {post.publishedAt && <span style={{ fontSize: 11, color: '#9CA3AF', alignSelf: 'center' }}>Published {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                  </div>
                </div>
              </div>
              {post.status === 'published' && post.reach && (
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>Reach</div>
                  <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 18, color: '#1A1A1A' }}>{post.reach.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>{post.engagement} engagements · {post.clicks} clicks</div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Email Provider ────────────────────────────────────────────────────────────

function EmailProviderSection() {
  const [mcConnected, setMcConnected] = useState(false);
  const [klvConnected, setKlvConnected] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);

  function handleConnect(id: string, setter: (v: boolean) => void) {
    setConnecting(id);
    setTimeout(() => { setter(true); setConnecting(null); }, 1800);
  }

  const providers = [
    { id: 'mailchimp', name: 'Mailchimp', connected: mcConnected, setConnected: setMcConnected, color: '#FFE01B', textColor: '#1A1A1A', desc: 'One-way sync: export opted-in customers and segments to Mailchimp lists.' },
    { id: 'klaviyo', name: 'Klaviyo', connected: klvConnected, setConnected: setKlvConnected, color: '#1C1C1C', textColor: '#fff', desc: 'One-way sync: push opted-in customers and event data to Klaviyo profiles.' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ padding: '12px 16px', borderRadius: 8, background: '#FFFBEB', border: '1px solid #FDE68A', fontSize: 13, color: '#92400E' }}>
        Email provider sync is one-way. Customer and segment data flows from FB Business Connect into your provider — not in reverse. Consent status is always managed in FB Business Connect.
      </div>
      {providers.map(p => (
        <div key={p.id} style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mail size={20} color={p.textColor} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1A1A1A' }}>{p.name}</div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{p.desc}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {p.connected && (
              <span style={{ fontSize: 11, fontWeight: 600, color: '#27AE60', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle size={13} /> Synced
              </span>
            )}
            <button
              onClick={() => p.connected ? p.setConnected(false) : handleConnect(p.id, p.setConnected)}
              style={{
                padding: '8px 16px', borderRadius: 7, border: '1px solid #E5E7EB',
                background: p.connected ? '#fff' : '#00A9AC', color: p.connected ? '#6B7280' : '#fff',
                cursor: 'pointer', fontWeight: 600, fontSize: 13,
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {connecting === p.id ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Connecting…</> : p.connected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── GBP ──────────────────────────────────────────────────────────────────────

function GBPSection() {
  const [connecting, setConnecting] = useState<string | null>(null);

  function handleConnect(id: string) {
    setConnecting(id);
    setTimeout(() => setConnecting(null), 2000);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {GBP_CONNECTIONS.map(gbp => (
        <div key={gbp.id} style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: '#FAFAFA', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={18} color="#EA4335" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1A1A1A' }}>{gbp.locationName}</div>
                {gbp.gbpLocationId && <div style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace', marginTop: 2 }}>{gbp.gbpLocationId}</div>}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {gbp.connected ? (
                <span style={{ fontSize: 11, fontWeight: 600, color: '#27AE60', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle size={13} /> Connected
                </span>
              ) : (
                <span style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <XCircle size={13} /> Not Connected
                </span>
              )}
              <button
                onClick={() => handleConnect(gbp.id)}
                style={{
                  padding: '7px 14px', borderRadius: 7, border: '1px solid #E5E7EB',
                  background: gbp.connected ? '#fff' : '#00A9AC', color: gbp.connected ? '#6B7280' : '#fff',
                  cursor: 'pointer', fontWeight: 600, fontSize: 13,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {connecting === gbp.id ? <><RefreshCw size={13} /> Connecting…</> : gbp.connected ? 'Manage' : 'Connect with Google'}
              </button>
            </div>
          </div>

          {gbp.connected && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid #F3F4F6' }}>
              {[
                { label: 'Reviews', value: gbp.reviewCount },
                { label: 'Avg Rating', value: gbp.avgRating.toFixed(1) + ' ★' },
                { label: 'Token Expires', value: gbp.tokenExpiresAt ? new Date(gbp.tokenExpiresAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—' },
                { label: 'Last Sync', value: gbp.lastSyncAt ? new Date(gbp.lastSyncAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>{s.label}</div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#1A1A1A' }}>{s.value}</div>
                </div>
              ))}
            </div>
          )}

          {gbp.connected && (
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              {['Pull Latest Reviews', 'Sync Business Hours', 'Post Update'].map(action => (
                <button key={action} style={{
                  padding: '6px 12px', borderRadius: 6, border: '1px solid #E5E7EB',
                  background: '#F9FAFB', color: '#374151', cursor: 'pointer', fontSize: 12, fontWeight: 500,
                }}>
                  {action}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── LSA ──────────────────────────────────────────────────────────────────────

function LSASection() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {LSA_CONNECTIONS.map(lsa => (
        <div key={lsa.id} style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={18} color="#D97706" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1A1A1A' }}>{lsa.locationName}</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>Google Local Services Ads</div>
              </div>
            </div>
            {lsa.connected ? (
              <span style={{ fontSize: 12, fontWeight: 600, color: '#27AE60', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle size={14} /> Connected · Synced {lsa.lastSyncAt ? new Date(lsa.lastSyncAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : ''}
              </span>
            ) : (
              <button style={{ padding: '7px 14px', borderRadius: 7, border: 'none', background: '#00A9AC', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                Connect LSA
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
            {[
              { label: 'Total Leads', value: lsa.leads },
              { label: 'Booked', value: lsa.booked },
              { label: 'Cost / Lead', value: `R ${lsa.costPerLead.toFixed(2)}` },
              { label: 'Cost / Booked Job', value: `R ${lsa.costPerBookedJob.toFixed(2)}` },
              { label: 'Attributed Revenue', value: `R ${lsa.attributedRevenue.toLocaleString()}` },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center', padding: '12px 0', border: '1px solid #F3F4F6', borderRadius: 8, background: '#F9FAFB' }}>
                <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 20, color: '#1A1A1A' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Web Analytics ─────────────────────────────────────────────────────────────

function WebAnalyticsSection() {
  const [config, setConfig] = useState({ ...ANALYTICS_CONFIG });
  const [showIds, setShowIds] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const fields: { key: keyof typeof config; label: string; placeholder: string }[] = [
    { key: 'ga4MeasurementId', label: 'GA4 Measurement ID', placeholder: 'G-XXXXXXXXXX' },
    { key: 'metaPixelId', label: 'Meta Pixel ID', placeholder: '123456789' },
    { key: 'googleAdsConversionId', label: 'Google Ads Conversion ID', placeholder: 'AW-XXXXXXXXX/AbCd...' },
    { key: 'tagManagerId', label: 'Google Tag Manager ID', placeholder: 'GTM-XXXXXXX' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ID fields */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#1A1A1A' }}>Tracking IDs</div>
          <button
            onClick={() => setShowIds(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontSize: 12, color: '#6B7280' }}
          >
            {showIds ? <EyeOff size={13} /> : <Eye size={13} />} {showIds ? 'Hide' : 'Show'}
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {fields.map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 6 }}>{f.label}</label>
              <input
                type={showIds ? 'text' : 'password'}
                value={(config[f.key] as string) ?? ''}
                onChange={e => setConfig(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', fontSize: 13, boxSizing: 'border-box', fontFamily: 'monospace' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Toggle settings */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#1A1A1A', marginBottom: 4 }}>Privacy & Consent Settings</div>

        {[
          { key: 'cookieConsentEnabled', label: 'Cookie Consent Banner', desc: 'Show GDPR/CCPA consent banner before loading tracking scripts' },
          { key: 'metaConversionsApiEnabled', label: 'Meta Conversions API', desc: 'Send server-side conversion events to Meta for improved attribution' },
        ].map(s => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#F9FAFB', borderRadius: 8 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#1A1A1A' }}>{s.label}</div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{s.desc}</div>
            </div>
            <button
              onClick={() => setConfig(prev => ({ ...prev, [s.key]: !(prev as any)[s.key] }))}
              style={{
                width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer',
                background: (config as any)[s.key] ? '#00A9AC' : '#D1D5DB',
                position: 'relative', transition: 'background 0.2s', flexShrink: 0,
              }}
            >
              <span style={{
                position: 'absolute', top: 3, left: (config as any)[s.key] ? 23 : 3,
                width: 18, height: 18, borderRadius: '50%', background: '#fff',
                transition: 'left 0.2s', display: 'block',
              }} />
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSave}
          style={{
            padding: '10px 22px', borderRadius: 8, border: 'none',
            background: saved ? '#27AE60' : '#00A9AC', color: '#fff',
            fontWeight: 600, fontSize: 14, cursor: 'pointer',
          }}
        >
          {saved ? 'Saved!' : 'Save Analytics Settings'}
        </button>
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'social', label: 'Social Media', icon: Instagram },
  { id: 'email', label: 'Email Providers', icon: Mail },
  { id: 'gbp', label: 'Google Business', icon: MapPin },
  { id: 'lsa', label: 'Local Services Ads', icon: DollarSign },
  { id: 'analytics', label: 'Web Analytics', icon: Globe },
] as const;
type SectionId = typeof SECTIONS[number]['id'];

export default function IntegrationsView() {
  const [active, setActive] = useState<SectionId>('social');

  return (
    <div style={{ display: 'flex', gap: 0, minHeight: 500 }}>
      {/* Left nav */}
      <div style={{ width: 200, flexShrink: 0, borderRight: '1px solid #E5E7EB', paddingRight: 0 }}>
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '12px 16px', border: 'none',
              background: active === s.id ? '#E6F7F7' : 'transparent',
              color: active === s.id ? '#00A9AC' : '#6B7280',
              fontWeight: active === s.id ? 700 : 500, fontSize: 13,
              cursor: 'pointer', textAlign: 'left',
              borderRight: active === s.id ? '3px solid #00A9AC' : '3px solid transparent',
            }}
          >
            <s.icon size={15} /> {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingLeft: 24 }}>
        {active === 'social' && <SocialSection />}
        {active === 'email' && <EmailProviderSection />}
        {active === 'gbp' && <GBPSection />}
        {active === 'lsa' && <LSASection />}
        {active === 'analytics' && <WebAnalyticsSection />}
      </div>
    </div>
  );
}

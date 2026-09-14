import React, { useState, useRef } from 'react';
import { Upload, Eye, EyeOff, CheckCircle, Lock, Image } from 'lucide-react';
import { INITIAL_BRANDING } from './mockData';
import type { TenantBranding, BrandingPlanTier } from './types';

function hexIsValid(h: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(h);
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [hex, setHex] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleHexChange(v: string) {
    setHex(v);
    if (hexIsValid(v)) onChange(v);
  }

  function handleColorInput(v: string) {
    setHex(v);
    onChange(v);
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', width: 100, flexShrink: 0 }}>{label}</div>
      <div
        onClick={() => inputRef.current?.click()}
        style={{ width: 36, height: 36, borderRadius: 8, background: hexIsValid(hex) ? hex : value, border: '2px solid #E5E7EB', cursor: 'pointer', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}
      />
      <input ref={inputRef} type="color" value={hexIsValid(hex) ? hex : value} onChange={e => handleColorInput(e.target.value)} style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }} />
      <input
        value={hex}
        onChange={e => handleHexChange(e.target.value)}
        placeholder="#000000"
        maxLength={7}
        style={{ width: 100, padding: '7px 10px', border: '1px solid #E5E7EB', borderRadius: 7, fontFamily: 'monospace', fontSize: 13, color: '#1A1A1A', outline: 'none' }}
      />
    </div>
  );
}

function LogoDropZone({ label, bg, value, onUpload }: { label: string; bg: string; value: string | null; onUpload: (url: string) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    onUpload(url);
  }

  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{label}</div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        style={{
          height: 90, borderRadius: 10, background: dragging ? '#F0F9FF' : bg, border: `2px dashed ${dragging ? '#2563EB' : '#D1D5DB'}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', transition: 'all 0.15s',
        }}
      >
        {value ? (
          <img src={value} alt="logo" style={{ maxHeight: 60, maxWidth: '100%', objectFit: 'contain' }} />
        ) : (
          <>
            <Image size={20} color="#9CA3AF" />
            <span style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center' }}>Click or drag to upload<br />PNG, SVG, WebP</span>
          </>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
      {value && (
        <button onClick={() => onUpload('')} style={{ marginTop: 4, fontSize: 11, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Remove</button>
      )}
    </div>
  );
}

function StorefrontPreview({ b }: { b: TenantBranding }) {
  return (
    <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #E5E7EB', fontSize: 12 }}>
      {/* Browser chrome */}
      <div style={{ background: '#F3F4F6', padding: '6px 10px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {['#FC5959', '#FBBC04', '#34C759'].map(c => <div key={c} style={{ width: 8, height: 8, borderRadius: 99, background: c }} />)}
        </div>
        <div style={{ flex: 1, background: '#fff', borderRadius: 4, padding: '3px 8px', fontSize: 10, color: '#9CA3AF', textAlign: 'center' }}>
          www.acmetires.com
        </div>
      </div>

      {/* Storefront header */}
      <div style={{ background: b.primaryColor, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {b.logoDarkUrl
            ? <img src={b.logoDarkUrl} style={{ height: 22, objectFit: 'contain' }} alt="" />
            : <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 14, color: '#fff' }}>Acme Tires</div>
          }
        </div>
        <div style={{ display: 'flex', gap: 10, fontSize: 10, color: 'rgba(255,255,255,0.85)' }}>
          <span>Services</span><span>About</span><span>Contact</span>
        </div>
      </div>

      {/* Hero section */}
      <div style={{ background: b.secondaryColor, padding: '16px 14px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 4 }}>
          {b.tagline || 'Your tagline goes here'}
        </div>
        <button style={{ marginTop: 6, padding: '6px 16px', borderRadius: 6, background: b.primaryColor, color: '#fff', border: 'none', fontSize: 11, fontWeight: 700, cursor: 'default' }}>
          Book Now
        </button>
      </div>

      {/* Body */}
      <div style={{ background: '#fff', padding: '10px 14px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: b.primaryColor, marginBottom: 4 }}>Our Services</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['Tire Install', 'Rotation', 'TPMS'].map(s => (
            <div key={s} style={{ flex: 1, padding: '6px 4px', borderRadius: 6, border: `1px solid ${b.primaryColor}22`, textAlign: 'center', fontSize: 9, color: '#374151' }}>{s}</div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#F9FAFB', borderTop: '1px solid #E5E7EB', padding: '8px 14px', fontSize: 9, color: '#9CA3AF', textAlign: 'center' }}>
        {b.footerText || '© 2026 Your Business'}
        {!b.poweredByHidden && <span style={{ color: b.accentColor }}> · Powered by FB Business Connect</span>}
      </div>
    </div>
  );
}

function EmailPreview({ b }: { b: TenantBranding }) {
  return (
    <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #E5E7EB', marginTop: 14 }}>
      <div style={{ background: '#F3F4F6', padding: '6px 10px', fontSize: 10, color: '#6B7280', display: 'flex', gap: 8 }}>
        <span style={{ fontWeight: 600 }}>From:</span>
        <span>bookings@{b.tosUrl ? new URL(b.tosUrl).hostname.replace('www.', '') : 'yourshop.com'}</span>
      </div>
      <div style={{ background: b.primaryColor, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        {b.logoLightUrl
          ? <img src={b.logoLightUrl} style={{ height: 20, objectFit: 'contain' }} alt="" />
          : <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 13, color: '#fff' }}>Acme Tires</div>
        }
      </div>
      <div style={{ background: '#fff', padding: '10px 14px', fontSize: 11, color: '#374151' }}>
        <div style={{ fontWeight: 700, marginBottom: 4, color: '#1A1A1A' }}>Your booking is confirmed! 🎉</div>
        <div style={{ color: '#6B7280' }}>Hi James, your tire installation is scheduled for Jun 14, 2026 at 9:00 AM.</div>
        <div style={{ marginTop: 8 }}>
          <button style={{ padding: '5px 12px', borderRadius: 6, background: b.primaryColor, color: '#fff', border: 'none', fontSize: 10, fontWeight: 700, cursor: 'default' }}>
            View Booking
          </button>
        </div>
      </div>
      {!b.poweredByHidden && (
        <div style={{ background: '#F9FAFB', padding: '5px 14px', fontSize: 9, color: '#9CA3AF', textAlign: 'center' }}>
          Powered by FB Business Connect
        </div>
      )}
    </div>
  );
}

export function VisualBrandingView({ plan }: { plan: BrandingPlanTier }) {
  const [branding, setBranding] = useState<TenantBranding>(INITIAL_BRANDING);
  const [saved, setSaved] = useState(false);
  const [previewTab, setPreviewTab] = useState<'storefront' | 'email'>('storefront');
  const [cssVisible, setCssVisible] = useState(false);

  function update<K extends keyof TenantBranding>(key: K, val: TenantBranding[K]) {
    setSaved(false);
    setBranding(b => ({ ...b, [key]: val }));
  }

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const poweredByLocked = plan === 'starter';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>

      {/* LEFT: Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Logo upload */}
        <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', padding: '18px 20px' }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#1A1A1A', marginBottom: 14 }}>Logo & Favicon</div>
          <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
            <LogoDropZone
              label="Logo — Light (on dark bg)"
              bg="#1A1A1A"
              value={branding.logoLightUrl}
              onUpload={v => update('logoLightUrl', v || null)}
            />
            <LogoDropZone
              label="Logo — Dark (on light bg)"
              bg="#F9FAFB"
              value={branding.logoDarkUrl}
              onUpload={v => update('logoDarkUrl', v || null)}
            />
          </div>
          <div style={{ display: 'flex', gap: 14 }}>
            <div style={{ width: 160 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Favicon (32×32)</div>
              <div
                style={{ width: 64, height: 64, borderRadius: 10, border: '2px dashed #D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#F9FAFB' }}
                onClick={() => {}}
              >
                {branding.faviconUrl
                  ? <img src={branding.faviconUrl} style={{ width: 32, height: 32 }} alt="" />
                  : <Upload size={18} color="#9CA3AF" />
                }
              </div>
            </div>
            <div style={{ flex: 1, padding: '10px 14px', borderRadius: 8, background: '#F9FAFB', border: '1px solid #E5E7EB', fontSize: 11, color: '#6B7280', lineHeight: 1.6 }}>
              <span style={{ fontWeight: 600, color: '#374151' }}>Logo renders on:</span> Storefront header, customer emails, PDF invoice header, SMS sender display name, customer account portal.
            </div>
          </div>
        </div>

        {/* Colors */}
        <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', padding: '18px 20px' }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#1A1A1A', marginBottom: 14 }}>Brand Colors</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <ColorPicker label="Primary" value={branding.primaryColor} onChange={v => update('primaryColor', v)} />
            <ColorPicker label="Secondary" value={branding.secondaryColor} onChange={v => update('secondaryColor', v)} />
            <ColorPicker label="Accent" value={branding.accentColor} onChange={v => update('accentColor', v)} />
          </div>
          <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 7, background: '#F9FAFB', border: '1px solid #E5E7EB', fontSize: 11, color: '#6B7280' }}>
            Colors propagate to storefront buttons, email CTAs, invoice accents, and tech arrival messages.
          </div>
        </div>

        {/* Storefront copy */}
        <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', padding: '18px 20px' }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#1A1A1A', marginBottom: 14 }}>Storefront Copy</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {([
              { key: 'tagline',    label: 'Tagline',     type: 'input',    placeholder: 'Fast, mobile tire service — we come to you' },
              { key: 'aboutText',  label: 'About Page',  type: 'textarea', placeholder: 'Tell customers about your business…' },
              { key: 'footerText', label: 'Footer Text', type: 'input',    placeholder: '© 2026 Your Business. All rights reserved.' },
              { key: 'tosUrl',     label: 'Terms of Service URL', type: 'input', placeholder: 'https://yourshop.com/tos' },
              { key: 'privacyUrl', label: 'Privacy Policy URL',  type: 'input', placeholder: 'https://yourshop.com/privacy' },
            ] as const).map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea
                    value={branding[f.key]}
                    onChange={e => update(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    rows={3}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #E5E7EB', borderRadius: 7, fontSize: 13, color: '#1A1A1A', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                  />
                ) : (
                  <input
                    value={branding[f.key]}
                    onChange={e => update(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #E5E7EB', borderRadius: 7, fontSize: 13, color: '#1A1A1A', outline: 'none', boxSizing: 'border-box' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Custom CSS */}
        <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#1A1A1A' }}>Custom CSS</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Scoped to your storefront only — cannot affect admin UI</div>
            </div>
            <button onClick={() => setCssVisible(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', color: '#6B7280', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              {cssVisible ? <EyeOff size={12} /> : <Eye size={12} />}
              {cssVisible ? 'Collapse' : 'Edit CSS'}
            </button>
          </div>
          {cssVisible && (
            <textarea
              value={branding.customCss}
              onChange={e => update('customCss', e.target.value)}
              spellCheck={false}
              rows={10}
              style={{ width: '100%', padding: '12px', border: '1px solid #333', borderRadius: 8, fontFamily: 'monospace', fontSize: 12, color: '#E5E7EB', background: '#0F0F0F', resize: 'vertical', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6 }}
            />
          )}
        </div>

        {/* Powered by FB Business Connect */}
        <div style={{ border: `1px solid ${poweredByLocked ? '#FDE68A' : '#E5E7EB'}`, borderRadius: 10, background: poweredByLocked ? '#FFFBEB' : '#fff', padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#1A1A1A' }}>"Powered by FB Business Connect" Footer</div>
                {poweredByLocked && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#D97706', background: '#FEF3C7', padding: '2px 8px', borderRadius: 99 }}>
                    <Lock size={10} /> Starter plan
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>
                {poweredByLocked ? 'Required on Starter plan. Upgrade to Pro to hide.' : 'Hidden on Pro and Enterprise plans.'}
              </div>
            </div>
            <div
              onClick={() => !poweredByLocked && update('poweredByHidden', !branding.poweredByHidden)}
              style={{
                width: 44, height: 24, borderRadius: 99, cursor: poweredByLocked ? 'not-allowed' : 'pointer',
                background: branding.poweredByHidden && !poweredByLocked ? '#15803D' : '#D1D5DB',
                position: 'relative', transition: 'background 0.2s',
                opacity: poweredByLocked ? 0.5 : 1,
              }}
            >
              <div style={{ position: 'absolute', top: 3, left: branding.poweredByHidden && !poweredByLocked ? 23 : 3, width: 18, height: 18, borderRadius: 99, background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </div>
          </div>
        </div>

        {/* Subdomain info */}
        <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', padding: '18px 20px' }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#1A1A1A', marginBottom: 10 }}>Your Subdomain</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, padding: '10px 14px', borderRadius: 8, background: '#F9FAFB', border: '1px solid #E5E7EB', fontFamily: 'monospace', fontSize: 13, color: '#374151' }}>
              acmetires.fb-business-connect.app
            </div>
            <span style={{ padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: '#F0FDF4', color: '#15803D' }}>Active</span>
          </div>
          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 8 }}>
            Provisioned at signup. Always active as fallback — even when a custom domain is configured.
          </div>
        </div>

        {/* Save */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={save}
            style={{ padding: '10px 28px', borderRadius: 8, background: saved ? '#15803D' : '#C0392B', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.2s' }}
          >
            {saved && <CheckCircle size={16} />}
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* RIGHT: Live preview */}
      <div style={{ position: 'sticky', top: 20, display: 'flex', flexDirection: 'column', gap: 0 }}>
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #E5E7EB', marginBottom: 0 }}>
          {(['storefront', 'email'] as const).map(t => (
            <button key={t} onClick={() => setPreviewTab(t)} style={{ padding: '8px 16px', border: 'none', background: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: previewTab === t ? '#C0392B' : '#6B7280', borderBottom: previewTab === t ? '2px solid #C0392B' : '2px solid transparent', marginBottom: -1 }}>
              {t === 'storefront' ? '🌐 Storefront' : '✉️ Email'}
            </button>
          ))}
        </div>
        <div style={{ padding: '14px 0 0' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Live Preview</div>
          {previewTab === 'storefront' ? <StorefrontPreview b={branding} /> : <EmailPreview b={branding} />}
        </div>

        {/* Color chips */}
        <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { label: 'Primary', color: branding.primaryColor },
            { label: 'Secondary', color: branding.secondaryColor },
            { label: 'Accent', color: branding.accentColor },
          ].map(c => (
            <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 6, background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: c.color }} />
              <span style={{ fontSize: 11, color: '#6B7280' }}>{c.label}</span>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#374151' }}>{c.color}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';
import React, { useState } from 'react';
import {
  CheckCircle, AlertTriangle, WifiOff, RefreshCw, Settings, ChevronDown, ChevronUp,
  Plus, X, Link, Book, Zap, Clock, ShoppingBag, Upload,
} from 'lucide-react';
import { DISTRIBUTORS, TENANT_DISTRIBUTORS } from './mockData';
import type { Distributor, TenantDistributor, ConnectorTier } from './types';

const TIER_CFG: Record<ConnectorTier, { label: string; bg: string; color: string; border: string; desc: string }> = {
  A: { label: 'Tier A', bg: '#EFF6FF', color: '#1D4ED8', border: '#93C5FD', desc: 'Full live API' },
  B: { label: 'Tier B', bg: '#F0FDF4', color: '#15803D', border: '#86EFAC', desc: 'Catalog feed + manual orders' },
  C: { label: 'Tier C', bg: '#FDF4FF', color: '#7E22CE', border: '#C084FC', desc: 'Manual local inventory' },
};

const STATUS_CFG = {
  active:       { icon: <CheckCircle size={14} />, color: '#059669', bg: '#D1FAE5', border: '#10B981', label: 'Active' },
  degraded:     { icon: <AlertTriangle size={14} />, color: '#D97706', bg: '#FEF3C7', border: '#F59E0B', label: 'Degraded' },
  disconnected: { icon: <WifiOff size={14} />, color: '#6B7280', bg: '#F3F4F6', border: '#9CA3AF', label: 'Disconnected' },
  syncing:      { icon: <RefreshCw size={14} />, color: '#2563EB', bg: '#DBEAFE', border: '#60A5FA', label: 'Syncing' },
};

function minutesAgo(iso?: string): string {
  if (!iso) return 'Never';
  const diff = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  const h = Math.floor(diff / 60);
  return `${h}h ${diff % 60}m ago`;
}

function RefDocModal({ dist, onClose }: { dist: Distributor; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#1A1A1A', borderRadius: 12, width: '100%', maxWidth: 640, maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Book size={16} color="#C0392B" />
            <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 15, color: '#fff' }}>{dist.name} — Reference Doc</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}><X size={18} /></button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          <pre style={{ color: '#E5E7EB', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'monospace', margin: 0 }}>
            {dist.referenceDoc}
          </pre>
        </div>
      </div>
    </div>
  );
}

function ConnectModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [tier, setTier] = useState<ConnectorTier>('A');
  const [distId, setDistId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [feedUrl, setFeedUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'ok' | 'fail' | null>(null);

  const handleTest = () => {
    setTesting(true);
    setTestResult(null);
    setTimeout(() => { setTesting(false); setTestResult('ok'); }, 1800);
  };

  const availableDists = DISTRIBUTORS.filter(d => !TENANT_DISTRIBUTORS.find(td => td.distributorId === d.id));

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 480, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 16 }}>Add Distributor Connection</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="#6B7280" /></button>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #E5E7EB' }}>
          {['Select Tier', 'Configure', 'Test & Save'].map((s, i) => (
            <div key={s} style={{ flex: 1, padding: '10px 0', textAlign: 'center', fontSize: 12, fontWeight: step === i + 1 ? 700 : 400, color: step === i + 1 ? '#C0392B' : step > i + 1 ? '#059669' : '#9CA3AF', borderBottom: step === i + 1 ? '2px solid #C0392B' : '2px solid transparent' }}>
              {step > i + 1 ? '✓ ' : ''}{s}
            </div>
          ))}
        </div>

        <div style={{ padding: 20 }}>
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>Choose the integration tier for this distributor.</p>
              {(['A', 'B', 'C'] as ConnectorTier[]).map(t => {
                const cfg = TIER_CFG[t];
                return (
                  <div key={t} onClick={() => setTier(t)}
                    style={{ padding: '14px 16px', border: `2px solid ${tier === t ? '#C0392B' : '#E5E7EB'}`, borderRadius: 10, cursor: 'pointer', background: tier === t ? '#FDEDEC' : '#fff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 700 }}>{cfg.label}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{cfg.desc}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
                      {t === 'A' && 'Live inventory, real-time pricing, automatic order placement.'}
                      {t === 'B' && 'Daily catalog feed with manual order task queue.'}
                      {t === 'C' && 'Staff-managed on-hand inventory with reorder alerts.'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {availableDists.length === 0 ? (
                <p style={{ color: '#6B7280', fontSize: 14 }}>All available distributors are already connected.</p>
              ) : (
                <>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Distributor</label>
                    <select value={distId} onChange={e => setDistId(e.target.value)}
                      style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}>
                      <option value="">Select distributor...</option>
                      {availableDists.filter(d => d.tier === tier).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  {tier === 'A' && (
                    <>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>API Key</label>
                        <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Enter API key..."
                          style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Account Number</label>
                        <input type="text" placeholder="e.g. ATD-TX-12345"
                          style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                    </>
                  )}
                  {tier === 'B' && (
                    <>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Feed URL</label>
                        <input type="url" value={feedUrl} onChange={e => setFeedUrl(e.target.value)} placeholder="https://feed.distributor.com/catalog?token=..."
                          style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Sync Schedule</label>
                        <select style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}>
                          <option value="daily">Daily (2:00 AM)</option>
                          <option value="weekly">Weekly (Monday 2:00 AM)</option>
                          <option value="manual">Manual only</option>
                        </select>
                      </div>
                    </>
                  )}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Safety Buffer (days)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input type="number" min={0} max={14} defaultValue={1}
                        style={{ width: 80, border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none' }} />
                      <span style={{ fontSize: 13, color: '#6B7280' }}>days added to supplier ETA for booking availability</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: 13, color: '#6B7280' }}>Test the connection before saving.</p>
              {testResult === 'ok' && (
                <div style={{ background: '#D1FAE5', border: '1px solid #10B981', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle size={16} color="#059669" />
                  <span style={{ fontSize: 14, color: '#065F46', fontWeight: 600 }}>Connection successful — credentials verified</span>
                </div>
              )}
              {testResult === 'fail' && (
                <div style={{ background: '#FEE2E2', border: '1px solid #EF4444', borderRadius: 8, padding: '12px 16px' }}>
                  <div style={{ fontSize: 14, color: '#991B1B', fontWeight: 600 }}>Connection failed</div>
                  <div style={{ fontSize: 13, color: '#DC2626', marginTop: 4 }}>Invalid API credentials. Check your key and try again.</div>
                </div>
              )}
              <button onClick={handleTest} disabled={testing}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 0', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, cursor: testing ? 'not-allowed' : 'pointer', background: '#F9FAFB', color: '#374151' }}>
                {testing ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Testing...</> : <><Zap size={14} /> Test Connection</>}
              </button>
            </div>
          )}
        </div>

        <div style={{ padding: '14px 20px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px 0', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, cursor: 'pointer', background: '#fff' }}>
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          {step < 3 ? (
            <button onClick={() => setStep(s => s + 1)}
              style={{ flex: 2, padding: '10px 0', background: '#C0392B', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Continue →
            </button>
          ) : (
            <button onClick={onClose} disabled={testResult !== 'ok'}
              style={{ flex: 2, padding: '10px 0', background: testResult === 'ok' ? '#C0392B' : '#E5E7EB', color: testResult === 'ok' ? '#fff' : '#9CA3AF', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: testResult === 'ok' ? 'pointer' : 'not-allowed' }}>
              Save Connection
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface ConnectorCardProps {
  dist: Distributor;
  tenant: TenantDistributor | undefined;
  onViewRef: () => void;
}

function ConnectorCard({ dist, tenant, onViewRef }: ConnectorCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'ok' | 'fail' | null>(null);
  const tier = TIER_CFG[dist.tier];
  const status = STATUS_CFG[dist.status];

  const handleTest = () => {
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setTesting(false);
      setTestResult(dist.status === 'degraded' ? 'fail' : 'ok');
    }, 1600);
  };

  return (
    <div style={{ background: '#fff', border: `1px solid ${dist.status === 'degraded' ? '#FCA5A5' : '#E5E7EB'}`, borderRadius: 12, overflow: 'hidden' }}>
      {/* Degraded warning stripe */}
      {dist.status === 'degraded' && (
        <div style={{ background: '#FEF3C7', borderBottom: '1px solid #F59E0B', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={14} color="#D97706" />
          <span style={{ fontSize: 13, color: '#92400E', fontWeight: 600 }}>
            {dist.name} connector is degraded — showing cached data. Prices may have changed.
          </span>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 48, height: 48, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
          {dist.logoEmoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 15, color: '#1A1A1A' }}>{dist.name}</span>
            <span style={{ background: tier.bg, color: tier.color, border: `1px solid ${tier.border}`, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>{tier.label}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: status.bg, color: status.color, border: `1px solid ${status.border}`, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
              {status.icon} {status.label}
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>{dist.description}</div>
        </div>
        <button onClick={() => setExpanded(e => !e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', flexShrink: 0 }}>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Summary row */}
      {tenant && (
        <div style={{ paddingInline: 16, paddingBottom: 14, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12, color: '#6B7280' }}>
            <span style={{ fontWeight: 600 }}>Last sync: </span>
            {minutesAgo(dist.lastSyncAt)}
          </div>
          {dist.tier === 'A' && (
            <div style={{ fontSize: 12, color: '#6B7280' }}>
              <span style={{ fontWeight: 600 }}>Account: </span>{tenant.accountNumber}
            </div>
          )}
          {dist.tier === 'B' && tenant.feedUrl && (
            <div style={{ fontSize: 12, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 280 }}>
              <span style={{ fontWeight: 600 }}>Feed: </span>{tenant.feedUrl}
            </div>
          )}
          <div style={{ fontSize: 12, color: '#6B7280' }}>
            <span style={{ fontWeight: 600 }}>Orders: </span>{tenant.totalOrdersPlaced}
          </div>
          {dist.errorCount > 0 && (
            <div style={{ fontSize: 12, color: '#DC2626', fontWeight: 600 }}>{dist.errorCount} errors since last sync</div>
          )}
        </div>
      )}

      {/* Expanded detail */}
      {expanded && (
        <div style={{ borderTop: '1px solid #E5E7EB', padding: '16px' }}>
          {/* Features */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Supported Features</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {dist.supportedFeatures.map(f => (
                <span key={f} style={{ background: '#F0FDF4', color: '#15803D', border: '1px solid #86EFAC', borderRadius: 6, padding: '3px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle size={11} /> {f}
                </span>
              ))}
            </div>
          </div>

          {/* Test result */}
          {testResult === 'ok' && (
            <div style={{ background: '#D1FAE5', border: '1px solid #10B981', borderRadius: 8, padding: '10px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={14} color="#059669" />
              <span style={{ fontSize: 13, color: '#065F46', fontWeight: 600 }}>Connection test passed (latency: 112ms)</span>
            </div>
          )}
          {testResult === 'fail' && (
            <div style={{ background: '#FEE2E2', border: '1px solid #EF4444', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: '#991B1B', fontWeight: 600 }}>Test failed — distributor unreachable</div>
              <div style={{ fontSize: 12, color: '#DC2626', marginTop: 2 }}>503 Service Unavailable (timeout 30s)</div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {dist.tier === 'A' && (
              <button onClick={handleTest} disabled={testing}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, cursor: testing ? 'not-allowed' : 'pointer', background: '#fff', color: '#374151' }}>
                <RefreshCw size={13} style={{ animation: testing ? 'spin 1s linear infinite' : 'none' }} />
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
            )}
            {dist.tier === 'B' && (
              <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: '#fff', color: '#374151' }}>
                <RefreshCw size={13} /> Sync Now
              </button>
            )}
            <button onClick={onViewRef}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: '#fff', color: '#374151' }}>
              <Book size={13} /> Reference Doc
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: '#fff', color: '#374151' }}>
              <Settings size={13} /> Configure
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ConnectorsView() {
  const [showAdd, setShowAdd] = useState(false);
  const [refDoc, setRefDoc] = useState<Distributor | null>(null);

  const degraded = DISTRIBUTORS.filter(d => d.status === 'degraded');

  return (
    <div style={{ padding: '20px 0', fontFamily: 'Inter, sans-serif' }}>
      {/* Global degraded banner */}
      {degraded.length > 0 && (
        <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertTriangle size={18} color="#D97706" />
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 700, color: '#92400E' }}>
              {degraded.map(d => d.name).join(', ')} connector{degraded.length > 1 ? 's are' : ' is'} degraded — showing cached data. Prices may have changed.
            </span>
            <div style={{ fontSize: 12, color: '#B45309', marginTop: 2 }}>
              Booking slots for items sourced exclusively from this distributor have been disabled until service recovers.
            </div>
          </div>
          <button style={{ padding: '6px 14px', background: '#D97706', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>View Logs</button>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Connected', value: DISTRIBUTORS.length, color: '#2980B9', bg: '#EBF5FB' },
          { label: 'Active', value: DISTRIBUTORS.filter(d => d.status === 'active').length, color: '#059669', bg: '#D1FAE5' },
          { label: 'Degraded', value: degraded.length, color: '#D97706', bg: '#FEF3C7' },
          { label: 'Total API Calls Today', value: '1,247', color: '#6B7280', bg: '#F9FAFB' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tier legend */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        {(['A', 'B', 'C'] as const).map(t => {
          const cfg = TIER_CFG[t];
          return (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 8, padding: '6px 12px' }}>
              <span style={{ fontWeight: 700, fontSize: 12, color: cfg.color }}>{cfg.label}</span>
              <span style={{ fontSize: 12, color: cfg.color }}>{cfg.desc}</span>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <button onClick={() => setShowAdd(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#C0392B', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} /> Add Distributor
        </button>
      </div>

      {/* Connector cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {DISTRIBUTORS.map(dist => (
          <ConnectorCard
            key={dist.id}
            dist={dist}
            tenant={TENANT_DISTRIBUTORS.find(td => td.distributorId === dist.id)}
            onViewRef={() => setRefDoc(dist)}
          />
        ))}
      </div>

      {showAdd && <ConnectModal onClose={() => setShowAdd(false)} />}
      {refDoc && <RefDocModal dist={refDoc} onClose={() => setRefDoc(null)} />}
    </div>
  );
}

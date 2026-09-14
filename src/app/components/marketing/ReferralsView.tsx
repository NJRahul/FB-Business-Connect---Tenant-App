import { useState } from 'react';
import { Copy, CheckCircle, Shield, Gift, TrendingUp, Users, ExternalLink } from 'lucide-react';
import { REFERRAL_CODES, REFERRAL_ACTIVITY, CUSTOMERS } from './mockData';
import type { RewardType, IdMeCategory } from './types';

const REWARD_LABELS: Record<RewardType, string> = {
  fixed_credit: 'Fixed Credit ($)',
  pct_discount: 'Discount (%)',
  free_service: 'Free Service',
};

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  clicked:    { label: 'Link Clicked', color: '#2563EB', bg: '#EFF6FF' },
  signed_up:  { label: 'Signed Up', color: '#7E22CE', bg: '#FDF4FF' },
  purchased:  { label: 'Purchased', color: '#15803D', bg: '#F0FDF4' },
};

const IDME_CFG: Record<IdMeCategory, { label: string; color: string; bg: string }> = {
  military_active: { label: 'Active Military', color: '#1D4ED8', bg: '#DBEAFE' },
  veteran:         { label: 'Veteran', color: '#7E22CE', bg: '#F3E8FF' },
  first_responder: { label: 'First Responder', color: '#B91C1C', bg: '#FEE2E2' },
  nurse:           { label: 'Nurse', color: '#15803D', bg: '#DCFCE7' },
  teacher:         { label: 'Teacher', color: '#B45309', bg: '#FEF3C7' },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handle() {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={handle}
      style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px',
        borderRadius: 8, border: 'none', cursor: 'pointer',
        background: copied ? '#27AE60' : '#C0392B', color: '#fff',
        fontWeight: 700, fontSize: 14, transition: 'background 0.2s',
      }}
    >
      {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
      {copied ? 'Copied!' : 'Copy Code'}
    </button>
  );
}

function ReferralCodeCard({ codeId }: { codeId: string }) {
  const rc = REFERRAL_CODES.find(r => r.id === codeId)!;
  const activity = REFERRAL_ACTIVITY.filter(a => a.referralCodeId === codeId);

  const conversionRate = rc.uses > 0 ? Math.round((rc.conversions / rc.uses) * 100) : 0;

  return (
    <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
      {/* Code display */}
      <div style={{ background: '#FDEDEC', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>Referral Code for {rc.customerName}</div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 32, letterSpacing: 2, color: '#C0392B' }}>{rc.code}</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
            Reward: {rc.rewardType === 'fixed_credit' ? `R ${rc.rewardValue} credit` : rc.rewardType === 'pct_discount' ? `${rc.rewardValue}% off` : 'Free service'}
          </div>
        </div>
        <CopyButton text={rc.code} />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid #F3F4F6' }}>
        {[
          { label: 'Link Uses', value: rc.uses },
          { label: 'Conversions', value: rc.conversions },
          { label: 'Rewards Earned', value: `R ${rc.rewardsEarned}` },
          { label: 'Available', value: `R ${rc.rewardsAvailable}` },
        ].map(s => (
          <div key={s.label} style={{ padding: '14px 20px', borderRight: '1px solid #F3F4F6', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 22, color: '#1A1A1A' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Activity */}
      {activity.length > 0 && (
        <div style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 10 }}>Recent Activity</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {activity.map(a => {
              const cfg = STATUS_CFG[a.status];
              return (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#F9FAFB', borderRadius: 7 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                    <span style={{ fontSize: 13, color: '#1A1A1A' }}>{a.newCustomerName}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {a.rewardGranted && (
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#27AE60', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <CheckCircle size={11} /> Reward granted
                      </span>
                    )}
                    <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                      {new Date(a.occurredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function IdMeSection() {
  const verifiedCustomers = CUSTOMERS.filter(c => c.idMeStatus === 'verified' && c.idMeCategory);
  const [discount, setDiscount] = useState(10);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1A1A1A' }}>ID.me Verified Customers</div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>Auto-apply discount at booking when ID.me status is verified</div>
          </div>
        </div>
        <span style={{
          padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700,
          background: '#DBEAFE', color: '#1D4ED8',
        }}>
          {verifiedCustomers.length} Verified
        </span>
      </div>

      {/* Discount config */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6', background: '#F9FAFB', display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 13, color: '#6B7280' }}>Auto-apply discount for verified members:</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="number" min={0} max={50} value={discount}
            onChange={e => setDiscount(Number(e.target.value))}
            style={{ width: 60, border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 10px', fontSize: 14, fontWeight: 600, textAlign: 'center' }}
          />
          <span style={{ fontSize: 13, color: '#1A1A1A' }}>% off all services</span>
        </div>
        <button
          onClick={handleSave}
          style={{
            padding: '7px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
            background: saved ? '#27AE60' : '#C0392B', color: '#fff',
            fontSize: 13, fontWeight: 600,
          }}
        >
          {saved ? 'Saved!' : 'Save'}
        </button>
        <span style={{ fontSize: 12, color: '#6B7280' }}>Discount persists until ID.me verification expires.</span>
      </div>

      {/* Verified customer list */}
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {verifiedCustomers.map(c => {
          const cfg = IDME_CFG[c.idMeCategory!];
          return (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F9FAFB', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: '#FDEDEC',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#C0392B', fontSize: 13,
                }}>
                  {c.firstName[0]}{c.lastName[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#1A1A1A' }}>{c.firstName} {c.lastName}</div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>{c.email}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Shield size={11} /> {cfg.label}
                </span>
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>
                  Verified {c.idMeVerifiedAt ? new Date(c.idMeVerifiedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProgramSettings() {
  const [rewardType, setRewardType] = useState<RewardType>('fixed_credit');
  const [rewardValue, setRewardValue] = useState(25);
  const [newCustomerReward, setNewCustomerReward] = useState(15);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', padding: '20px 24px' }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: '#1A1A1A', marginBottom: 16 }}>Referral Program Settings</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 6 }}>Referrer Reward Type</label>
          <select
            value={rewardType}
            onChange={e => setRewardType(e.target.value as RewardType)}
            style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', fontSize: 14 }}
          >
            {Object.entries(REWARD_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 6 }}>
            Referrer Reward Value {rewardType === 'pct_discount' ? '(%)' : '($)'}
          </label>
          <input
            type="number" min={0} value={rewardValue}
            onChange={e => setRewardValue(Number(e.target.value))}
            style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', fontSize: 14, boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 6 }}>New Customer Credit ($)</label>
          <input
            type="number" min={0} value={newCustomerReward}
            onChange={e => setNewCustomerReward(Number(e.target.value))}
            style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', fontSize: 14, boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            onClick={handleSave}
            style={{
              width: '100%', padding: '10px 18px', borderRadius: 7, border: 'none',
              background: saved ? '#27AE60' : '#C0392B', color: '#fff',
              fontWeight: 600, fontSize: 14, cursor: 'pointer',
            }}
          >
            {saved ? 'Saved!' : 'Save Program Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}

const TABS = [
  { id: 'codes', label: 'Referral Codes' },
  { id: 'idme', label: 'ID.me Verification' },
  { id: 'settings', label: 'Program Settings' },
] as const;
type Tab = typeof TABS[number]['id'];

export default function ReferralsView() {
  const [tab, setTab] = useState<Tab>('codes');

  const totalConversions = REFERRAL_CODES.reduce((s, r) => s + r.conversions, 0);
  const totalRewards = REFERRAL_CODES.reduce((s, r) => s + r.rewardsEarned, 0);
  const idMeVerified = CUSTOMERS.filter(c => c.idMeStatus === 'verified').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'Active Codes', value: REFERRAL_CODES.length, icon: Gift, sub: 'customers enrolled' },
          { label: 'Total Conversions', value: totalConversions, icon: TrendingUp, sub: 'purchased after referral' },
          { label: 'Rewards Issued', value: `R ${totalRewards}`, icon: CheckCircle, sub: 'all time' },
          { label: 'ID.me Verified', value: idMeVerified, icon: Shield, sub: 'discount-eligible members' },
        ].map(s => (
          <div key={s.label} style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 20px', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#6B7280' }}>{s.label}</span>
              <s.icon size={16} color="#C0392B" />
            </div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 28, color: '#1A1A1A' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #E5E7EB' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: 14,
            color: tab === t.id ? '#C0392B' : '#6B7280',
            borderBottom: tab === t.id ? '2px solid #C0392B' : '2px solid transparent',
            marginBottom: -2,
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'codes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {REFERRAL_CODES.map(rc => <ReferralCodeCard key={rc.id} codeId={rc.id} />)}
        </div>
      )}

      {tab === 'idme' && <IdMeSection />}

      {tab === 'settings' && <ProgramSettings />}
    </div>
  );
}

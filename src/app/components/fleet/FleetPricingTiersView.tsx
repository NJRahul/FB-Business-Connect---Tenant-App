import { useState } from 'react';
import { Plus, Tag, CheckCircle2, X, Pencil } from 'lucide-react';
import type { PricingTier, DiscountType } from './types';
import { MOCK_PRICING_TIERS, MOCK_FLEET_ACCOUNTS } from './mockData';

export function FleetPricingTiersView() {
  const [tiers, setTiers] = useState<PricingTier[]>(MOCK_PRICING_TIERS);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [description, setDescription] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  function showToast(msg: string) { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); }

  function createTier() {
    if (!name || !discountValue) return;
    const tier: PricingTier = {
      id: `tier_${Date.now()}`, shopId: 'shop_001', name,
      discountType, discountValue: parseFloat(discountValue), description,
    };
    setTiers(t => [...t, tier]);
    setShowCreate(false);
    setName(''); setDiscountValue(''); setDescription('');
    showToast(`Pricing tier "${tier.name}" created.`);
  }

  function accountsOnTier(tierId: string) {
    return MOCK_FLEET_ACCOUNTS.filter(a => a.pricingTierId === tierId).map(a => a.businessName);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.125rem', color: '#1A1A1A' }}>Pricing Tiers</h2>
          <p style={{ fontSize: '0.825rem', color: '#6B7280', marginTop: 2 }}>
            Named discount tiers applied as a baseline. Fleet accounts can also have individual pricing menus.
          </p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-[8px] text-sm font-semibold"
          style={{ background: '#C0392B', color: '#fff' }}>
          <Plus size={14} /> New Tier
        </button>
      </div>

      {/* Precedence note */}
      <div className="rounded-xl px-4 py-3 flex items-start gap-2" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
        <Tag size={14} color="#1D4ED8" className="mt-0.5 shrink-0" />
        <p style={{ fontSize: '0.825rem', color: '#1E40AF', lineHeight: 1.5 }}>
          <strong>Precedence:</strong> Per-SKU override › Per-fleet pre-agreed menu › Volume tier › Named tier › Retail.
          Tiers apply to all line items not covered by a fleet-specific menu.
        </p>
      </div>

      {/* Tier cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {tiers.map(tier => {
          const onTier = accountsOnTier(tier.id);
          return (
            <div key={tier.id} className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#FDEDEC' }}>
                  <Tag size={17} color="#C0392B" />
                </div>
                <button style={{ color: '#9CA3AF' }}><Pencil size={14} /></button>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A1A1A', marginBottom: 4 }}>{tier.name}</h3>
              <p style={{ fontSize: '0.825rem', color: '#6B7280', marginBottom: 12, lineHeight: 1.5 }}>{tier.description}</p>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-bold" style={{ color: '#C0392B' }}>
                  {tier.discountType === 'percentage' ? `${tier.discountValue}%` : `$${tier.discountValue}`}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                  {tier.discountType === 'percentage' ? 'off retail' : 'flat discount'}
                </span>
              </div>
              <div className="pt-3" style={{ borderTop: '1px solid #F3F4F6' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                  Accounts on this tier
                </p>
                {onTier.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: '#D1D5DB' }}>None assigned</p>
                ) : onTier.map(name => (
                  <p key={name} style={{ fontSize: '0.8rem', color: '#374151' }}>{name}</p>
                ))}
              </div>
            </div>
          );
        })}

        {/* Create new tier card */}
        {!showCreate && (
          <button onClick={() => setShowCreate(true)}
            className="rounded-xl p-5 flex flex-col items-center justify-center gap-2"
            style={{ border: '1px dashed #E5E7EB', background: '#FAFAFA', minHeight: 200 }}>
            <Plus size={24} color="#D1D5DB" />
            <p style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>Create New Tier</p>
          </button>
        )}
      </div>

      {/* Create tier form */}
      {showCreate && (
        <div className="rounded-xl p-5" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
          <div className="flex items-center justify-between mb-4">
            <h4 style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1A1A1A' }}>New Pricing Tier</h4>
            <button onClick={() => setShowCreate(false)} style={{ color: '#9CA3AF' }}><X size={16} /></button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>Tier Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Tier 4: 20% off retail"
                className="w-full mt-1 px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ border: '1px solid #E5E7EB', color: '#1A1A1A', background: '#fff' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>Discount Type</label>
              <select value={discountType} onChange={e => setDiscountType(e.target.value as DiscountType)}
                className="w-full mt-1 px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ border: '1px solid #E5E7EB', color: '#374151', background: '#fff' }}>
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount ($)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>Discount Value *</label>
              <input type="number" value={discountValue} onChange={e => setDiscountValue(e.target.value)} placeholder={discountType === 'percentage' ? '10' : '25.00'}
                className="w-full mt-1 px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ border: '1px solid #E5E7EB', color: '#1A1A1A', background: '#fff' }} />
            </div>
            <div className="col-span-2">
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>Description</label>
              <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description for internal reference"
                className="w-full mt-1 px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ border: '1px solid #E5E7EB', color: '#1A1A1A', background: '#fff' }} />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg text-sm" style={{ background: '#fff', color: '#6B7280', border: '1px solid #E5E7EB' }}>Cancel</button>
            <button onClick={createTier} disabled={!name || !discountValue}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: '#C0392B', color: '#fff', opacity: name && discountValue ? 1 : 0.4 }}>
              Create Tier
            </button>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-6 right-6 px-4 py-3 rounded-xl text-sm font-medium z-50 flex items-center gap-2"
          style={{ background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
          <CheckCircle2 size={14} /> {toastMsg}
        </div>
      )}
    </div>
  );
}

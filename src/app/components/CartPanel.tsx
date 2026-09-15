import { useState } from 'react';
import { X, Trash2, Tag, AlertTriangle, ChevronDown, ChevronUp, Clock, Info, Star, Lock } from 'lucide-react';

export type CartQty = 1 | 2 | 4;

export interface CartItem {
  id: string;
  brand: string;
  model: string;
  size: string;
  qty: CartQty;
  unitPrice: number;
  supplier: string;
  isLocal: boolean;
  etaDays?: number;
  emoji: string;
}

interface CartPanelProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQty: (id: string, qty: CartQty) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

const VALID_PROMOS: Record<string, { discount: number; type: 'percent' | 'fixed'; minCart: number; expiresAt: string }> = {
  SAVE20: { discount: 20, type: 'percent', minCart: 400, expiresAt: '2026-12-31' },
  TDFORGE50: { discount: 50, type: 'fixed', minCart: 300, expiresAt: '2026-09-01' },
  EXPIRED: { discount: 15, type: 'percent', minCart: 0, expiresAt: '2025-01-01' },
};

const GBB_PACKAGES = [
  {
    id: 'good',
    name: 'Good',
    label: 'Basic',
    price: 649,
    inclusions: ['Economy brand tires', 'Install + balance', '1-yr road hazard'],
    highlight: 'Lowest price',
    recommended: false,
    color: '#6B7280',
  },
  {
    id: 'better',
    name: 'Better',
    label: 'Enhanced',
    price: 899,
    inclusions: ['Mid-range brand tires', 'Install + balance', 'Free rotation (1)', '2-yr road hazard'],
    highlight: 'Most popular',
    recommended: false,
    color: '#2563EB',
  },
  {
    id: 'best',
    name: 'Best',
    label: 'Premium',
    price: 1199,
    inclusions: ['Premium brand tires', 'Install + balance + alignment', 'Free rotations (24 mo)', '3-yr road hazard', 'Nitrogen fill'],
    highlight: 'Best value long-term',
    recommended: true,
    color: '#00A9AC',
  },
];

const FINANCING = [
  { id: 'affirm', name: 'Affirm', logo: '🔵', monthly: '~$67/mo at 0% for 18 mo', badge: '0% APR' },
  { id: 'snap', name: 'Snap Finance', logo: '🟢', monthly: 'As low as R 750/wk', badge: 'Instant approval' },
  { id: 'synchrony', name: 'Synchrony', logo: '🔴', monthly: 'No interest for 12 mo', badge: '12-mo deferred' },
];

const INSTALL_FEE_PER_TIRE = 25;
const DISPOSAL_FEE_PER_TIRE = 5;
const TAX_RATE = 0.0825;
const CALLOUT_THRESHOLD = 800;

const inputStyle: React.CSSProperties = {
  border: '1.5px solid #E5E7EB',
  borderRadius: '6px',
  padding: '8px 12px',
  fontSize: '0.9375rem',
  color: '#1A1A1A',
  outline: 'none',
  background: '#fff',
  width: '100%',
};

export function CartPanel({ open, onClose, items, onUpdateQty, onRemove, onCheckout }: CartPanelProps) {
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number; type: 'percent' | 'fixed' } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [showGBB, setShowGBB] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [showFinancing, setShowFinancing] = useState(false);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideAmount, setOverrideAmount] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideSubmitted, setOverrideSubmitted] = useState(false);
  const [validating, setValidating] = useState(false);

  const totalTires = items.reduce((a, i) => a + i.qty, 0);
  const tiresSubtotal = items.reduce((a, i) => a + i.qty * i.unitPrice, 0);
  const installFee = totalTires * INSTALL_FEE_PER_TIRE;
  const disposalFee = totalTires * DISPOSAL_FEE_PER_TIRE;

  let promoDiscount = 0;
  if (appliedPromo) {
    promoDiscount = appliedPromo.type === 'percent'
      ? (tiresSubtotal * appliedPromo.discount) / 100
      : appliedPromo.discount;
  }

  let managerDiscount = overrideSubmitted && overrideAmount ? parseFloat(overrideAmount) : 0;
  const pretaxTotal = tiresSubtotal + installFee + disposalFee - promoDiscount - managerDiscount;
  const tax = pretaxTotal * TAX_RATE;
  const grandTotal = pretaxTotal + tax;
  const calloutFeeApplies = tiresSubtotal >= CALLOUT_THRESHOLD;

  const handlePromoApply = async () => {
    setPromoError('');
    setPromoLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setPromoLoading(false);

    const promo = VALID_PROMOS[promoInput.toUpperCase()];
    if (!promo) { setPromoError('Code not found.'); return; }
    if (new Date(promo.expiresAt) < new Date()) { setPromoError('This code has expired.'); return; }
    if (tiresSubtotal < promo.minCart) { setPromoError(`Minimum cart value of R ${promo.minCart} required.`); return; }

    setAppliedPromo({ code: promoInput.toUpperCase(), discount: promo.discount, type: promo.type });
    setPromoInput('');
  };

  const handleCheckout = async () => {
    setValidating(true);
    await new Promise(r => setTimeout(r, 1100));
    setValidating(false);
    onCheckout();
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col bg-white transition-transform duration-300"
        style={{
          width: 'min(480px, 100vw)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          boxShadow: '-4px 0 32px rgba(0,0,0,0.14)',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex items-center gap-2.5">
            <h2 style={{ fontFamily: 'Sora, sans-serif', color: '#1A1A1A', fontWeight: 700, fontSize: '1.125rem' }}>Your Cart</h2>
            {items.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-white" style={{ background: '#00A9AC', fontSize: '0.75rem', fontWeight: 700 }}>
                {items.length}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-[6px]" style={{ color: '#9CA3AF' }}>
            <X size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <span style={{ fontSize: '3rem' }}>🛒</span>
            <p className="mt-4" style={{ color: '#1A1A1A', fontWeight: 600, fontSize: '1.0625rem' }}>Your cart is empty</p>
            <p className="mt-2" style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Add tires from the catalog to get started</p>
            <button onClick={onClose} className="mt-5 px-5 py-2.5 rounded-[6px] text-white" style={{ background: '#00A9AC', fontWeight: 600 }}>
              Browse Catalog
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Good-Better-Best */}
            <div className="border-b" style={{ borderColor: '#E5E7EB' }}>
              <button
                onClick={() => setShowGBB(v => !v)}
                className="w-full flex items-center justify-between px-5 py-3.5"
                style={{ color: '#1A1A1A', background: '#E6F7F7' }}
              >
                <div className="flex items-center gap-2">
                  <Star size={15} style={{ color: '#00A9AC' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#00A9AC' }}>Good–Better–Best Packages</span>
                </div>
                {showGBB ? <ChevronUp size={16} style={{ color: '#00A9AC' }} /> : <ChevronDown size={16} style={{ color: '#00A9AC' }} />}
              </button>
              {showGBB && (
                <div className="px-5 pb-4 pt-2 grid grid-cols-3 gap-2">
                  {GBB_PACKAGES.map(pkg => (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg.id === selectedPackage ? null : pkg.id)}
                      className="relative rounded-[8px] p-3 text-left transition-all"
                      style={{
                        border: `2px solid ${selectedPackage === pkg.id ? pkg.color : '#E5E7EB'}`,
                        background: selectedPackage === pkg.id ? (pkg.recommended ? '#E6F7F7' : '#F9FAFB') : '#fff',
                      }}
                    >
                      {pkg.recommended && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-white whitespace-nowrap" style={{ background: '#00A9AC', fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                          REC.
                        </span>
                      )}
                      <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: pkg.color, fontSize: '0.875rem' }}>{pkg.name}</p>
                      <p style={{ color: '#1A1A1A', fontWeight: 700, fontSize: '1rem', marginTop: '2px' }}>${pkg.price}</p>
                      <p style={{ color: '#9CA3AF', fontSize: '0.6rem', marginTop: '4px', lineHeight: 1.4 }}>
                        {pkg.inclusions.slice(0, 2).join(' · ')}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart items */}
            <div className="px-5 py-4 space-y-4 border-b" style={{ borderColor: '#E5E7EB' }}>
              {items.map(item => (
                <div key={item.id} className="flex gap-3">
                  {/* Tire icon */}
                  <div className="w-14 h-14 rounded-[8px] flex items-center justify-center shrink-0 text-2xl" style={{ background: '#F3F4F6', border: '1px solid #E5E7EB' }}>
                    {item.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <div className="min-w-0">
                        <p style={{ color: '#1A1A1A', fontWeight: 600, fontSize: '0.9375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.brand} {item.model}
                        </p>
                        <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '2px' }}>{item.size}</p>
                        {!item.isLocal && item.etaDays && (
                          <div className="flex items-center gap-1 mt-1">
                            <Clock size={11} style={{ color: '#F39C12' }} />
                            <span style={{ color: '#F39C12', fontSize: '0.6875rem', fontWeight: 500 }}>
                              Ships in ~{item.etaDays} days from {item.supplier}
                            </span>
                          </div>
                        )}
                        {item.isLocal && (
                          <span style={{ color: '#27AE60', fontSize: '0.6875rem', fontWeight: 500 }}>✓ In stock locally</span>
                        )}
                      </div>
                      <button onClick={() => onRemove(item.id)} className="shrink-0 p-1" style={{ color: '#80D4D5' }}>
                        <Trash2 size={15} style={{ color: '#00A9AC', opacity: 0.6 }} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2.5">
                      {/* Qty selector */}
                      <div className="flex gap-1">
                        {([1, 2, 4] as CartQty[]).map(q => (
                          <button
                            key={q}
                            onClick={() => onUpdateQty(item.id, q)}
                            className="w-8 h-8 rounded-full text-sm font-semibold transition-all"
                            style={{
                              background: item.qty === q ? '#00A9AC' : '#F3F4F6',
                              color: item.qty === q ? '#fff' : '#6B7280',
                            }}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                      <div className="text-right">
                        <p style={{ color: '#1A1A1A', fontWeight: 700, fontSize: '0.9375rem' }}>
                          ${(item.qty * item.unitPrice).toFixed(2)}
                        </p>
                        <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>${item.unitPrice.toFixed(2)} each</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Call-out fee banner */}
            {calloutFeeApplies && (
              <div className="mx-5 mt-4 rounded-[8px] p-3 flex items-start gap-2.5" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
                <AlertTriangle size={15} style={{ color: '#F39C12', marginTop: '2px', shrink: 0 }} />
                <div>
                  <p style={{ color: '#92400E', fontWeight: 600, fontSize: '0.8125rem' }}>Mobile Service Trip Charge: R 1,350.00</p>
                  <p style={{ color: '#92400E', fontSize: '0.75rem', marginTop: '2px', lineHeight: 1.4 }}>
                    A trip charge applies for mobile installation. This covers travel within your service area. This fee cannot be removed.
                  </p>
                </div>
              </div>
            )}

            {/* Promo code */}
            <div className="px-5 py-4 border-b" style={{ borderColor: '#E5E7EB' }}>
              {appliedPromo ? (
                <div className="flex items-center justify-between px-3 py-2 rounded-[6px]" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                  <div className="flex items-center gap-2">
                    <Tag size={14} style={{ color: '#27AE60' }} />
                    <span style={{ color: '#15803D', fontWeight: 600, fontSize: '0.875rem' }}>{appliedPromo.code}</span>
                    <span style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                      ({appliedPromo.type === 'percent' ? `${appliedPromo.discount}% off` : `R ${appliedPromo.discount} off`})
                    </span>
                  </div>
                  <button onClick={() => setAppliedPromo(null)} style={{ color: '#9CA3AF' }}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={promoInput}
                    onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handlePromoApply()}
                    style={{ ...inputStyle, flex: 1 }}
                    placeholder="Promo / discount code"
                  />
                  <button
                    onClick={handlePromoApply}
                    disabled={promoLoading || !promoInput.trim()}
                    className="px-3 py-2 rounded-[6px] text-white transition-colors shrink-0"
                    style={{ background: promoLoading || !promoInput.trim() ? '#9CA3AF' : '#00A9AC', fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap' }}
                  >
                    {promoLoading ? '...' : 'Apply'}
                  </button>
                </div>
              )}
              {promoError && (
                <p className="mt-1.5 flex items-center gap-1.5" style={{ color: '#00BFC3', fontSize: '0.75rem' }}>
                  <Info size={12} />{promoError}
                </p>
              )}

              {/* Manager override */}
              <div className="mt-3">
                <button
                  onClick={() => setOverrideOpen(v => !v)}
                  className="flex items-center gap-1.5"
                  style={{ color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 500 }}
                >
                  <Lock size={11} />
                  Manager override discount
                  {overrideOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
                {overrideOpen && !overrideSubmitted && (
                  <div className="mt-2 p-3 rounded-[6px]" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                    <p style={{ color: '#6B7280', fontSize: '0.75rem', marginBottom: '8px' }}>
                      Manager/Admin approval logged to audit trail
                    </p>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="number"
                        value={overrideAmount}
                        onChange={e => setOverrideAmount(e.target.value)}
                        style={{ ...inputStyle, width: '90px', flex: 'none' }}
                        placeholder="R 0.00"
                      />
                      <input
                        value={overrideReason}
                        onChange={e => setOverrideReason(e.target.value)}
                        style={{ ...inputStyle, flex: 1 }}
                        placeholder="Reason (required)"
                      />
                    </div>
                    <button
                      onClick={() => { if (overrideAmount && overrideReason) { setOverrideSubmitted(true); setOverrideOpen(false); } }}
                      disabled={!overrideAmount || !overrideReason}
                      className="w-full py-1.5 rounded text-white text-sm font-semibold"
                      style={{ background: !overrideAmount || !overrideReason ? '#9CA3AF' : '#00A9AC' }}
                    >
                      Apply Override
                    </button>
                  </div>
                )}
                {overrideSubmitted && (
                  <div className="mt-2 flex items-center justify-between px-3 py-2 rounded-[6px]" style={{ background: '#F0FBFB', border: '1px solid #FECACA' }}>
                    <span style={{ color: '#B91C1C', fontSize: '0.75rem', fontWeight: 600 }}>
                      Override: -${parseFloat(overrideAmount).toFixed(2)} · {overrideReason}
                    </span>
                    <button onClick={() => { setOverrideSubmitted(false); setOverrideAmount(''); setOverrideReason(''); }} style={{ color: '#9CA3AF' }}>
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Price breakdown */}
            <div className="px-5 py-4 space-y-2 border-b" style={{ borderColor: '#E5E7EB' }}>
              {[
                { label: `Tires subtotal (${totalTires} tires)`, amount: tiresSubtotal, color: '#1A1A1A' },
                { label: `Install fee (R ${INSTALL_FEE_PER_TIRE}/tire)`, amount: installFee, color: '#6B7280' },
                { label: `Disposal fee (R ${DISPOSAL_FEE_PER_TIRE}/tire)`, amount: disposalFee, color: '#6B7280' },
                ...(calloutFeeApplies ? [{ label: 'Trip charge', amount: 75, color: '#F39C12' }] : []),
                ...(appliedPromo ? [{ label: `Promo (${appliedPromo.code})`, amount: -promoDiscount, color: '#27AE60' }] : []),
                ...(overrideSubmitted && managerDiscount > 0 ? [{ label: 'Manager discount', amount: -managerDiscount, color: '#00BFC3' }] : []),
                { label: `Tax (${(TAX_RATE * 100).toFixed(2)}%)`, amount: tax, color: '#6B7280' },
              ].map(row => (
                <div key={row.label} className="flex justify-between">
                  <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>{row.label}</span>
                  <span style={{ color: row.color, fontSize: '0.875rem', fontWeight: row.color === '#1A1A1A' ? 500 : 400 }}>
                    {row.amount < 0 ? '-' : ''}${Math.abs(row.amount).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t" style={{ borderColor: '#E5E7EB' }}>
                <span style={{ color: '#1A1A1A', fontWeight: 700, fontSize: '1rem' }}>Total</span>
                <span style={{ color: '#00A9AC', fontWeight: 800, fontSize: '1.125rem', fontFamily: 'Sora, sans-serif' }}>
                  ${(grandTotal + (calloutFeeApplies ? 75 : 0)).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Financing teaser */}
            {grandTotal >= 500 && (
              <div className="px-5 py-3 border-b" style={{ borderColor: '#E5E7EB' }}>
                <button
                  onClick={() => setShowFinancing(v => !v)}
                  className="w-full flex items-center justify-between"
                  style={{ color: '#6B7280' }}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1A1A1A' }}>
                      💳 Financing options available
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>As low as R 750/wk</span>
                  </div>
                  {showFinancing ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {showFinancing && (
                  <div className="mt-3 grid grid-cols-1 gap-2">
                    {FINANCING.map(f => (
                      <div key={f.id} className="flex items-center justify-between p-3 rounded-[8px]" style={{ border: '1.5px solid #E5E7EB', background: '#F9FAFB' }}>
                        <div className="flex items-center gap-2.5">
                          <span style={{ fontSize: '1.25rem' }}>{f.logo}</span>
                          <div>
                            <p style={{ color: '#1A1A1A', fontWeight: 600, fontSize: '0.875rem' }}>{f.name}</p>
                            <p style={{ color: '#6B7280', fontSize: '0.75rem' }}>{f.monthly}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-[4px]" style={{ background: '#E6F7F7', color: '#00A9AC', fontSize: '0.6875rem', fontWeight: 600 }}>{f.badge}</span>
                          <button className="px-3 py-1.5 rounded-[6px] text-sm font-semibold" style={{ border: '1.5px solid #00A9AC', color: '#00A9AC', background: '#fff' }}>
                            Apply
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Checkout button */}
        {items.length > 0 && (
          <div className="p-5 border-t shrink-0" style={{ borderColor: '#E5E7EB' }}>
            <button
              onClick={handleCheckout}
              disabled={validating}
              className="w-full py-3.5 rounded-[6px] text-white flex items-center justify-center gap-2 transition-colors"
              style={{ background: validating ? '#9CA3AF' : '#00A9AC', fontWeight: 700, fontSize: '1rem' }}
              onMouseEnter={e => { if (!validating) e.currentTarget.style.background = '#007F82'; }}
              onMouseLeave={e => { if (!validating) e.currentTarget.style.background = '#00A9AC'; }}
            >
              {validating ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying prices & availability...
                </>
              ) : (
                `Proceed to Checkout — R ${(grandTotal + (calloutFeeApplies ? 75 : 0)).toFixed(2)}`
              )}
            </button>
            <p className="mt-2 text-center" style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
              🔒 Secure checkout · No account required
            </p>
          </div>
        )}
      </div>
    </>
  );
}

import { useState } from 'react';
import { ShoppingCart, Plus, Star, Filter, Search } from 'lucide-react';
import { CartPanel, type CartItem, type CartQty } from './CartPanel';
import { CheckoutFlow, type OrderResult } from './CheckoutFlow';
import { OrderConfirmation } from './OrderConfirmation';

type PageView = 'catalog' | 'checkout' | 'confirmation';

const CATALOG_ITEMS: Omit<CartItem, 'qty'>[] = [
  { id: '1', brand: 'Michelin', model: 'Defender 2', size: '225/65R17', unitPrice: 189.99, supplier: 'National Tire Dist.', isLocal: true, emoji: '🔵' },
  { id: '2', brand: 'Goodyear', model: 'Assurance WeatherReady', size: '215/55R17', unitPrice: 164.99, supplier: 'ATD', isLocal: false, etaDays: 2, emoji: '🟡' },
  { id: '3', brand: 'Continental', model: 'TrueContact Tour', size: '235/60R18', unitPrice: 172.99, supplier: 'TBC Wholesale', isLocal: true, emoji: '⚫' },
  { id: '4', brand: 'Firestone', model: 'Destination LE3', size: '265/70R17', unitPrice: 148.99, supplier: 'ATD', isLocal: false, etaDays: 3, emoji: '🔴' },
  { id: '5', brand: 'BFGoodrich', model: 'Advantage Control', size: '205/55R16', unitPrice: 128.99, supplier: 'National Tire Dist.', isLocal: true, emoji: '🟤' },
  { id: '6', brand: 'Pirelli', model: 'Cinturato P7', size: '245/45R18', unitPrice: 194.99, supplier: 'TBC Wholesale', isLocal: false, etaDays: 1, emoji: '🟠' },
];

export function CartCheckoutPage() {
  const [view, setView] = useState<PageView>('catalog');
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { ...CATALOG_ITEMS[0], qty: 4 },
    { ...CATALOG_ITEMS[1], qty: 4 },
  ]);
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const totalTires = cartItems.reduce((a, i) => a + i.qty, 0);
  const grandTotal = cartItems.reduce((a, i) => a + i.qty * i.unitPrice, 0)
    + cartItems.reduce((a, i) => a + i.qty, 0) * 30; // install + disposal per tire

  const addToCart = (item: Omit<CartItem, 'qty'>) => {
    const existing = cartItems.find(c => c.id === item.id);
    if (existing) {
      setCartItems(prev => prev.map(c => c.id === item.id ? { ...c, qty: Math.min(c.qty === 4 ? 4 : c.qty === 2 ? 4 : 2, 4) as CartQty } : c));
    } else {
      setCartItems(prev => [...prev, { ...item, qty: 4 as CartQty }]);
    }
    setCartOpen(true);
  };

  const updateQty = (id: string, qty: CartQty) => {
    setCartItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  };

  const removeItem = (id: string) => {
    setCartItems(prev => prev.filter(i => i.id !== id));
  };

  const filteredCatalog = CATALOG_ITEMS.filter(item =>
    `${item.brand} ${item.model} ${item.size}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (view === 'checkout') {
    return (
      <CheckoutFlow
        items={cartItems}
        grandTotal={grandTotal}
        onComplete={result => { setOrder(result); setView('confirmation'); setCartItems([]); }}
        onBack={() => setView('catalog')}
      />
    );
  }

  if (view === 'confirmation' && order) {
    return (
      <OrderConfirmation
        order={order}
        onNewOrder={() => { setView('catalog'); setOrder(null); }}
      />
    );
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', color: '#1A1A1A', fontSize: '1.5rem', fontWeight: 700 }}>Storefront Demo</h1>
          <p style={{ color: '#6B7280', fontSize: '0.9375rem', marginTop: '4px' }}>Cart · Checkout · Payment flow preview</p>
        </div>
        <button
          onClick={() => setCartOpen(true)}
          className="relative flex items-center gap-2.5 px-4 py-2.5 rounded-[6px] text-white transition-colors"
          style={{ background: '#C0392B', fontWeight: 600 }}
          onMouseEnter={e => (e.currentTarget.style.background = '#A93226')}
          onMouseLeave={e => (e.currentTarget.style.background = '#C0392B')}
        >
          <ShoppingCart size={18} />
          Cart
          {cartItems.length > 0 && (
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#fff', color: '#C0392B' }}>
              {cartItems.length}
            </span>
          )}
        </button>
      </div>

      {/* Feature tags */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[
          '🛒 Slide-over cart panel',
          '⭐ Good-Better-Best packages',
          '💳 Multi-payment methods',
          '⏱ 15-min soft hold',
          '🏷 Promo codes',
          '📦 Split tender',
          '💰 Deposit options',
          '🚨 Call-out fee',
        ].map(tag => (
          <span key={tag} className="px-2.5 py-1 rounded-full text-sm" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', color: '#6B7280' }}>
            {tag}
          </span>
        ))}
      </div>

      {/* Search and filter */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-[6px] outline-none"
            style={{ border: '1.5px solid #E5E7EB', fontSize: '0.9375rem', color: '#1A1A1A', background: '#fff' }}
            placeholder="Search tires..."
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-[6px]" style={{ border: '1.5px solid #E5E7EB', color: '#6B7280', background: '#fff' }}>
          <Filter size={16} /> Filter
        </button>
      </div>

      {/* Catalog grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {filteredCatalog.map(item => {
          const inCart = cartItems.find(c => c.id === item.id);
          const allInPrice = item.unitPrice * 4 + 4 * 30; // 4 tires + install + disposal
          return (
            <div key={item.id} className="bg-white rounded-[8px] overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
              {/* Tire image placeholder */}
              <div className="h-32 flex items-center justify-center" style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <span style={{ fontSize: '4rem' }}>{item.emoji}</span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <p style={{ color: '#C0392B', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.brand}</p>
                    <p style={{ color: '#1A1A1A', fontWeight: 700, fontSize: '1rem', marginTop: '2px' }}>{item.model}</p>
                    <p style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>{item.size}</p>
                  </div>
                  <span
                    className="shrink-0 px-2 py-0.5 rounded-[4px] text-xs font-semibold"
                    style={{
                      background: item.isLocal ? '#F0FDF4' : '#FFF7ED',
                      color: item.isLocal ? '#15803D' : '#92400E',
                    }}
                  >
                    {item.isLocal ? 'In Stock' : `~${item.etaDays}d`}
                  </span>
                </div>

                <div className="flex items-end justify-between mt-3">
                  <div>
                    <p style={{ color: '#1A1A1A', fontWeight: 800, fontSize: '1.125rem', fontFamily: 'Sora, sans-serif' }}>
                      ${item.unitPrice.toFixed(2)}
                      <span style={{ color: '#9CA3AF', fontWeight: 400, fontSize: '0.75rem' }}>/ea</span>
                    </p>
                    <p style={{ color: '#6B7280', fontSize: '0.75rem', marginTop: '2px' }}>
                      All-in for 4: <strong style={{ color: '#1A1A1A' }}>${allInPrice.toFixed(2)}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => addToCart(item)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-[6px] text-white text-sm font-semibold transition-colors"
                    style={{ background: inCart ? '#27AE60' : '#C0392B' }}
                    onMouseEnter={e => (e.currentTarget.style.background = inCart ? '#1e8449' : '#A93226')}
                    onMouseLeave={e => (e.currentTarget.style.background = inCart ? '#27AE60' : '#C0392B')}
                  >
                    {inCart ? (
                      <><Star size={13} fill="white" /> In Cart</>
                    ) : (
                      <><Plus size={13} /> Add 4</>
                    )}
                  </button>
                </div>

                {!item.isLocal && (
                  <p style={{ color: '#9CA3AF', fontSize: '0.6875rem', marginTop: '8px' }}>
                    Supplier: {item.supplier}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart panel */}
      <CartPanel
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQty={updateQty}
        onRemove={removeItem}
        onCheckout={() => { setCartOpen(false); setView('checkout'); }}
      />

      {/* Floating cart button if items in cart */}
      {cartItems.length > 0 && !cartOpen && (
        <div className="fixed bottom-6 right-6 z-30">
          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-3 px-5 py-3.5 rounded-full text-white shadow-lg"
            style={{ background: '#C0392B', fontWeight: 700, boxShadow: '0 4px 24px rgba(192,57,43,0.4)' }}
          >
            <ShoppingCart size={20} />
            <span>{totalTires} tire{totalTires !== 1 ? 's' : ''} in cart</span>
            <span className="px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.25)', fontSize: '0.9375rem', fontFamily: 'Sora, sans-serif', fontWeight: 800 }}>
              ${grandTotal.toFixed(2)}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

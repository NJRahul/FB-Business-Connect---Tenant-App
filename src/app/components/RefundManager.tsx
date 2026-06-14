import { useState } from 'react';
import { Search, CheckCircle2, AlertTriangle, DollarSign, X, Clock, User } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  total: number;
  paid: number;
  date: string;
  slot: string;
  status: 'paid' | 'partially-refunded' | 'refunded' | 'pending';
  items: { name: string; qty: number; price: number }[];
  paymentMethod: string;
  refunds: Refund[];
}

interface Refund {
  id: string;
  amount: number;
  reason: string;
  initiatedBy: string;
  createdAt: string;
  type: 'full' | 'partial';
}

const SAMPLE_ORDERS: Order[] = [
  {
    id: '1',
    orderNumber: 'TDF-A7K2P1',
    customer: 'Maria Rodriguez',
    email: 'maria@email.com',
    total: 875.44,
    paid: 875.44,
    date: '2026-06-10',
    slot: 'Jun 14, 2026 at 10:00 AM',
    status: 'paid',
    items: [
      { name: 'Michelin Defender 2 225/65R17', qty: 4, price: 189.99 },
    ],
    paymentMethod: 'Credit Card (Visa ••4242)',
    refunds: [],
  },
  {
    id: '2',
    orderNumber: 'TDF-B3M8Q4',
    customer: 'James Chen',
    email: 'james@email.com',
    total: 692.12,
    paid: 692.12,
    date: '2026-06-08',
    slot: 'Jun 12, 2026 at 1:00 PM',
    status: 'partially-refunded',
    items: [
      { name: 'Goodyear WeatherReady 215/55R17', qty: 4, price: 164.99 },
    ],
    paymentMethod: 'Apple Pay',
    refunds: [{ id: 'r1', amount: 50, reason: 'Pricing adjustment — coupon applied post-purchase', initiatedBy: 'Sarah (Manager)', createdAt: '2026-06-09', type: 'partial' }],
  },
  {
    id: '3',
    orderNumber: 'TDF-C9X5R7',
    customer: 'David Thompson',
    email: 'david@email.com',
    total: 543.88,
    paid: 543.88,
    date: '2026-06-05',
    slot: 'Jun 09, 2026 at 8:00 AM',
    status: 'refunded',
    items: [
      { name: 'Continental TrueContact 235/60R18', qty: 2, price: 172.99 },
    ],
    paymentMethod: 'Affirm',
    refunds: [{ id: 'r2', amount: 543.88, reason: 'Customer cancelled appointment 48h in advance', initiatedBy: 'Mike (Shop Admin)', createdAt: '2026-06-06', type: 'full' }],
  },
];

const inputStyle: React.CSSProperties = {
  border: '1.5px solid #E5E7EB',
  borderRadius: '6px',
  padding: '8px 12px',
  fontSize: '0.9375rem',
  color: '#1A1A1A',
  outline: 'none',
  background: '#fff',
};

const STATUS_CFG = {
  paid: { label: 'Paid', color: '#27AE60', bg: '#F0FDF4' },
  'partially-refunded': { label: 'Partial Refund', color: '#F39C12', bg: '#FFF7ED' },
  refunded: { label: 'Refunded', color: '#6B7280', bg: '#F9FAFB' },
  pending: { label: 'Pending', color: '#3B82F6', bg: '#EFF6FF' },
};

const REFUND_REASONS = [
  'Customer cancellation',
  'Appointment rescheduled — credit applied',
  'Pricing error — correction',
  'Item out of stock / not available',
  'Customer dissatisfaction — goodwill',
  'Duplicate charge',
  'Other (explain below)',
];

export function RefundManager() {
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState<Order[]>(SAMPLE_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [refundModal, setRefundModal] = useState(false);
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [releaseSlot, setReleaseSlot] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const filtered = orders.filter(o =>
    o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
    o.customer.toLowerCase().includes(search.toLowerCase()) ||
    o.email.toLowerCase().includes(search.toLowerCase())
  );

  const availableRefund = selectedOrder
    ? selectedOrder.paid - selectedOrder.refunds.reduce((a, r) => a + r.amount, 0)
    : 0;

  const handleRefund = async () => {
    if (!selectedOrder) return;
    const amount = refundType === 'full' ? availableRefund : parseFloat(refundAmount);
    if (!amount || !refundReason) return;

    setProcessing(true);
    await new Promise(r => setTimeout(r, 1500));

    const newRefund: Refund = {
      id: Date.now().toString(),
      amount,
      reason: refundReason === 'Other (explain below)' ? customReason : refundReason,
      initiatedBy: 'You (Shop Admin)',
      createdAt: new Date().toISOString().split('T')[0],
      type: refundType,
    };

    const newTotal = selectedOrder.paid - selectedOrder.refunds.reduce((a, r) => a + r.amount, 0) - amount;
    const newStatus: Order['status'] = newTotal <= 0 ? 'refunded' : 'partially-refunded';

    const updated = {
      ...selectedOrder,
      status: newStatus,
      refunds: [...selectedOrder.refunds, newRefund],
    };

    setOrders(prev => prev.map(o => o.id === selectedOrder.id ? updated : o));
    setSelectedOrder(updated);
    setProcessing(false);
    setRefundModal(false);
    setRefundType('full');
    setRefundAmount('');
    setRefundReason('');
    setCustomReason('');
    setSuccessMsg(`Refund of $${amount.toFixed(2)} processed. Customer notified via email${selectedOrder ? ' + SMS' : ''}.`);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="mb-6">
        <h1 style={{ fontFamily: 'Sora, sans-serif', color: '#1A1A1A', fontSize: '1.5rem', fontWeight: 700 }}>Order Management & Refunds</h1>
        <p style={{ color: '#6B7280', fontSize: '0.9375rem', marginTop: '4px' }}>Process refunds, adjustments, and manage order lifecycle</p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-[8px] mb-5" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <CheckCircle2 size={18} style={{ color: '#27AE60' }} />
          <p style={{ color: '#15803D', fontWeight: 500 }}>{successMsg}</p>
          <button onClick={() => setSuccessMsg('')} className="ml-auto"><X size={16} style={{ color: '#9CA3AF' }} /></button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-5">
        {/* Orders list */}
        <div>
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: '36px', width: '100%' }}
              placeholder="Search by order #, customer name, or email..."
            />
          </div>

          <div className="space-y-2">
            {filtered.map(order => {
              const cfg = STATUS_CFG[order.status];
              const totalRefunded = order.refunds.reduce((a, r) => a + r.amount, 0);
              const isSelected = selectedOrder?.id === order.id;
              return (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrder(isSelected ? null : order)}
                  className="w-full bg-white rounded-[8px] p-4 text-left transition-all"
                  style={{
                    boxShadow: isSelected ? '0 0 0 2px #C0392B' : '0 1px 3px rgba(0,0,0,0.06)',
                    border: isSelected ? '1.5px solid #C0392B' : '1.5px solid transparent',
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#C0392B', fontSize: '0.9375rem' }}>{order.orderNumber}</span>
                        <span className="px-2 py-0.5 rounded-[4px] text-xs font-semibold" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                      </div>
                      <p style={{ color: '#1A1A1A', fontWeight: 500, fontSize: '0.875rem', marginTop: '4px' }}>{order.customer}</p>
                      <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>{order.date} · {order.slot}</p>
                      <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '2px' }}>
                        {order.items.map(i => `${i.name} × ${i.qty}`).join(', ')}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p style={{ color: '#1A1A1A', fontWeight: 700, fontSize: '1rem', fontFamily: 'Sora, sans-serif' }}>${order.total.toFixed(2)}</p>
                      {totalRefunded > 0 && (
                        <p style={{ color: '#E74C3C', fontSize: '0.75rem', fontWeight: 500 }}>-${totalRefunded.toFixed(2)} refunded</p>
                      )}
                      <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '2px' }}>{order.paymentMethod}</p>
                    </div>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-12" style={{ color: '#9CA3AF' }}>
                <Search size={28} style={{ margin: '0 auto 8px' }} />
                <p>No orders found</p>
              </div>
            )}
          </div>
        </div>

        {/* Order detail + refund panel */}
        {selectedOrder && (
          <div className="space-y-4">
            {/* Order details */}
            <div className="bg-white rounded-[8px] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 style={{ fontFamily: 'Sora, sans-serif', color: '#1A1A1A', fontWeight: 700, fontSize: '1.0625rem' }}>
                  {selectedOrder.orderNumber}
                </h3>
                <span className="px-2.5 py-1 rounded-[4px] text-sm font-semibold" style={{ background: STATUS_CFG[selectedOrder.status].bg, color: STATUS_CFG[selectedOrder.status].color }}>
                  {STATUS_CFG[selectedOrder.status].label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Customer', value: selectedOrder.customer, icon: User },
                  { label: 'Appointment', value: selectedOrder.slot, icon: Clock },
                  { label: 'Amount Paid', value: `$${selectedOrder.paid.toFixed(2)}`, icon: DollarSign },
                  { label: 'Payment', value: selectedOrder.paymentMethod, icon: CheckCircle2 },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon size={12} style={{ color: '#9CA3AF' }} />
                        <p style={{ color: '#9CA3AF', fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</p>
                      </div>
                      <p style={{ color: '#1A1A1A', fontSize: '0.875rem', fontWeight: 500 }}>{item.value}</p>
                    </div>
                  );
                })}
              </div>

              {/* Items */}
              <div className="border-t pt-3" style={{ borderColor: '#E5E7EB' }}>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between py-1.5">
                    <span style={{ color: '#6B7280', fontSize: '0.8125rem' }}>{item.name} × {item.qty}</span>
                    <span style={{ color: '#1A1A1A', fontWeight: 500, fontSize: '0.8125rem' }}>${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Refund history */}
              {selectedOrder.refunds.length > 0 && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: '#E5E7EB' }}>
                  <p style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Refund History</p>
                  {selectedOrder.refunds.map(r => (
                    <div key={r.id} className="mb-2 p-3 rounded-[6px]" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                      <div className="flex justify-between mb-1">
                        <span style={{ color: '#B91C1C', fontWeight: 700, fontSize: '0.9375rem' }}>-${r.amount.toFixed(2)}</span>
                        <span style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>{r.createdAt}</span>
                      </div>
                      <p style={{ color: '#6B7280', fontSize: '0.8125rem' }}><strong>Reason:</strong> {r.reason}</p>
                      <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '2px' }}>By: {r.initiatedBy}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Available refund */}
              {availableRefund > 0 && (
                <div className="mt-4 p-3 rounded-[6px] flex items-center justify-between" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                  <div>
                    <p style={{ color: '#6B7280', fontSize: '0.8125rem' }}>Available for refund</p>
                    <p style={{ color: '#1A1A1A', fontWeight: 700, fontSize: '1.0625rem', fontFamily: 'Sora, sans-serif' }}>${availableRefund.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => setRefundModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-[6px] text-white transition-colors"
                    style={{ background: '#C0392B', fontWeight: 600, fontSize: '0.875rem' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#A93226')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#C0392B')}
                  >
                    <DollarSign size={15} /> Issue Refund
                  </button>
                </div>
              )}
              {availableRefund <= 0 && (
                <div className="mt-4 p-3 rounded-[6px]" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                  <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>This order has been fully refunded.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Refund modal */}
      {refundModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-[8px] p-6 max-w-md w-full" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 style={{ fontFamily: 'Sora, sans-serif', color: '#1A1A1A', fontWeight: 700, fontSize: '1.125rem' }}>
                Issue Refund
              </h3>
              <button onClick={() => setRefundModal(false)}><X size={20} style={{ color: '#9CA3AF' }} /></button>
            </div>

            <div className="rounded-[8px] p-3 mb-4" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
              <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>Refunding order</p>
              <p style={{ color: '#1A1A1A', fontWeight: 600 }}>{selectedOrder.orderNumber} — {selectedOrder.customer}</p>
              <p style={{ color: '#6B7280', fontSize: '0.8125rem' }}>Max refundable: <strong style={{ color: '#1A1A1A' }}>${availableRefund.toFixed(2)}</strong></p>
            </div>

            {/* Refund type */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {(['full', 'partial'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => { setRefundType(t); if (t === 'full') setRefundAmount(availableRefund.toString()); else setRefundAmount(''); }}
                  className="py-2.5 rounded-[8px] font-semibold transition-all"
                  style={{ border: refundType === t ? '2px solid #C0392B' : '2px solid #E5E7EB', background: refundType === t ? '#FDEDEC' : '#fff', color: refundType === t ? '#C0392B' : '#6B7280', fontSize: '0.9375rem' }}
                >
                  {t === 'full' ? `Full — $${availableRefund.toFixed(2)}` : 'Partial amount'}
                </button>
              ))}
            </div>

            {refundType === 'partial' && (
              <div className="mb-4">
                <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Refund Amount</label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }}>$</span>
                  <input
                    type="number"
                    value={refundAmount}
                    onChange={e => setRefundAmount(e.target.value)}
                    max={availableRefund}
                    style={{ ...inputStyle, paddingLeft: '24px', width: '100%' }}
                    placeholder="0.00"
                  />
                </div>
                {parseFloat(refundAmount) > availableRefund && (
                  <p style={{ color: '#E74C3C', fontSize: '0.75rem', marginTop: '4px' }}>
                    Exceeds available refund amount
                  </p>
                )}
              </div>
            )}

            {/* Reason */}
            <div className="mb-4">
              <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Reason (required)</label>
              <select
                value={refundReason}
                onChange={e => setRefundReason(e.target.value)}
                style={{ ...inputStyle, marginTop: '6px', display: 'block', appearance: 'none', cursor: 'pointer', width: '100%' }}
              >
                <option value="">— Select a reason —</option>
                {REFUND_REASONS.map(r => <option key={r}>{r}</option>)}
              </select>
              {refundReason === 'Other (explain below)' && (
                <textarea
                  value={customReason}
                  onChange={e => setCustomReason(e.target.value)}
                  rows={2}
                  style={{ ...inputStyle, marginTop: '8px', display: 'block', resize: 'vertical', width: '100%' }}
                  placeholder="Describe the reason..."
                />
              )}
            </div>

            {/* Slot release */}
            <label className="flex items-center gap-2.5 mb-5 cursor-pointer">
              <input type="checkbox" checked={releaseSlot} onChange={e => setReleaseSlot(e.target.checked)} style={{ accentColor: '#C0392B' }} />
              <div>
                <p style={{ color: '#1A1A1A', fontSize: '0.875rem', fontWeight: 500 }}>Release appointment slot on refund</p>
                <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>Slot becomes available for other customers</p>
              </div>
            </label>

            <div className="rounded-[8px] p-3 mb-4 flex items-start gap-2" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
              <AlertTriangle size={14} style={{ color: '#F39C12', marginTop: '2px' }} />
              <p style={{ color: '#92400E', fontSize: '0.8125rem' }}>
                This refund will be processed via Stripe and logged to the audit trail. Customer will be notified by email + SMS within 60 seconds.
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setRefundModal(false)} className="flex-1 py-2.5 rounded-[6px]" style={{ border: '1.5px solid #E5E7EB', color: '#6B7280', fontWeight: 600, background: '#fff' }}>
                Cancel
              </button>
              <button
                onClick={handleRefund}
                disabled={processing || !refundReason || (refundReason === 'Other (explain below)' && !customReason) || (refundType === 'partial' && (!refundAmount || parseFloat(refundAmount) > availableRefund))}
                className="flex-1 py-2.5 rounded-[6px] text-white flex items-center justify-center gap-2 transition-colors"
                style={{ background: processing ? '#9CA3AF' : '#C0392B', fontWeight: 600 }}
              >
                {processing ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                ) : 'Confirm Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

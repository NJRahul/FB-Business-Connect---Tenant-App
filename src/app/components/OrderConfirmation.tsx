import { useState } from 'react';
import { CheckCircle2, Calendar, Download, Mail, MessageSquare, Bell, ExternalLink, RotateCcw } from 'lucide-react';
import type { OrderResult } from './CheckoutFlow';

interface OrderConfirmationProps {
  order: OrderResult;
  onNewOrder: () => void;
}

const METHOD_LABELS: Record<string, string> = {
  card: 'Credit/Debit Card',
  'apple-pay': 'Apple Pay',
  'google-pay': 'Google Pay',
  paypal: 'PayPal',
  venmo: 'Venmo',
  affirm: 'Affirm',
  snap: 'Snap Finance',
  synchrony: 'Synchrony',
};

const DEPOSIT_LABELS: Record<string, string> = {
  full: 'Full payment collected',
  deposit25: '25% deposit — balance due at visit',
  'book-now-pay-later': 'Book now, pay later — balance due at visit',
};

export function OrderConfirmation({ order, onNewOrder }: OrderConfirmationProps) {
  const [icsDownloaded, setIcsDownloaded] = useState(false);
  const [notifSent, setNotifSent] = useState(false);

  const handleIcsDownload = () => {
    // Simulate ICS download
    setIcsDownloaded(true);
  };

  const handleNotify = () => {
    setNotifSent(true);
  };

  const tiresTotal = order.items.reduce((a, i) => a + i.qty * i.unitPrice, 0);
  const totalTires = order.items.reduce((a, i) => a + i.qty, 0);
  const installFee = totalTires * 25;
  const disposalFee = totalTires * 5;

  return (
    <div className="min-h-screen" style={{ background: '#F9FAFB', fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Success banner */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#F0FDF4', border: '3px solid #27AE60' }}>
            <CheckCircle2 size={38} style={{ color: '#27AE60' }} />
          </div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', color: '#1A1A1A', fontSize: '1.75rem', fontWeight: 800 }}>
            Booking Confirmed!
          </h1>
          <p className="mt-2" style={{ color: '#6B7280', fontSize: '1rem' }}>
            Your appointment is locked in. We'll see you soon!
          </p>
          <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full" style={{ background: '#FDEDEC', border: '1px solid #F5B7B1' }}>
            <span style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>Order</span>
            <span style={{ color: '#C0392B', fontWeight: 800, fontSize: '1rem', fontFamily: 'Sora, sans-serif', letterSpacing: '0.05em' }}>{order.orderNumber}</span>
          </div>
        </div>

        {/* Notifications sent */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {[
            { icon: Mail, label: 'Confirmation email', sub: `Sent to ${order.contact.email}`, color: '#27AE60', sent: true },
            { icon: MessageSquare, label: 'SMS confirmation', sub: order.contact.smsConsent ? `Sent to ${order.contact.phone}` : 'SMS not enabled', color: order.contact.smsConsent ? '#27AE60' : '#9CA3AF', sent: order.contact.smsConsent },
            { icon: Bell, label: 'Shop notified', sub: 'Dispatcher alerted', color: '#27AE60', sent: true },
          ].map(n => {
            const Icon = n.icon;
            return (
              <div key={n.label} className="flex items-center gap-3 p-3.5 rounded-[8px]" style={{ background: '#fff', border: `1px solid ${n.sent ? '#E5E7EB' : '#F3F4F6'}` }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: n.sent ? '#F0FDF4' : '#F9FAFB' }}>
                  <Icon size={16} style={{ color: n.color }} />
                </div>
                <div>
                  <p style={{ color: '#1A1A1A', fontWeight: 600, fontSize: '0.8125rem' }}>{n.label}</p>
                  <p style={{ color: '#9CA3AF', fontSize: '0.6875rem', marginTop: '2px' }}>{n.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Appointment details */}
        <div className="bg-white rounded-[8px] p-6 mb-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontFamily: 'Sora, sans-serif', color: '#1A1A1A', fontWeight: 700, fontSize: '1.125rem', marginBottom: '16px' }}>
            📅 Appointment Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <p style={{ color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date & Time</p>
              <p style={{ color: '#1A1A1A', fontWeight: 700, fontSize: '1.0625rem', marginTop: '4px' }}>{order.slot.displayDate}</p>
              <p style={{ color: '#C0392B', fontWeight: 600, fontSize: '0.9375rem' }}>{order.slot.time}</p>
            </div>
            <div>
              <p style={{ color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Install Address</p>
              <p style={{ color: '#1A1A1A', fontWeight: 500, fontSize: '0.9375rem', marginTop: '4px' }}>{order.vehicle.address || '123 Main St'}</p>
              <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>{order.vehicle.city || 'Johannesburg'}, {order.vehicle.state} {order.vehicle.zip || ''2000''}</p>
            </div>
            <div>
              <p style={{ color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vehicle</p>
              <p style={{ color: '#1A1A1A', fontWeight: 500, fontSize: '0.9375rem', marginTop: '4px' }}>
                {order.vehicle.year} {order.vehicle.make} {order.vehicle.model} {order.vehicle.trim}
              </p>
            </div>
            <div>
              <p style={{ color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</p>
              <p style={{ color: '#1A1A1A', fontWeight: 500, fontSize: '0.9375rem', marginTop: '4px' }}>{order.contact.fullName}</p>
              <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>{order.contact.email}</p>
            </div>
          </div>

          <button
            onClick={handleIcsDownload}
            className="flex items-center gap-2 px-4 py-2.5 rounded-[6px] transition-colors"
            style={{
              border: icsDownloaded ? '1.5px solid #27AE60' : '1.5px solid #E5E7EB',
              background: icsDownloaded ? '#F0FDF4' : '#fff',
              color: icsDownloaded ? '#15803D' : '#6B7280',
              fontWeight: 500,
              fontSize: '0.875rem',
            }}
          >
            {icsDownloaded ? <CheckCircle2 size={15} /> : <Download size={15} />}
            {icsDownloaded ? 'Calendar invite downloaded' : 'Add to Calendar (.ics)'}
          </button>
        </div>

        {/* Order items */}
        <div className="bg-white rounded-[8px] p-6 mb-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontFamily: 'Sora, sans-serif', color: '#1A1A1A', fontWeight: 700, fontSize: '1.125rem', marginBottom: '16px' }}>
            🛞 Items Ordered
          </h2>
          <div className="space-y-3 mb-4">
            {order.items.map(item => (
              <div key={item.id} className="flex items-center justify-between gap-3 py-2 border-b" style={{ borderColor: '#F3F4F6' }}>
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: '1.5rem' }}>{item.emoji}</span>
                  <div>
                    <p style={{ color: '#1A1A1A', fontWeight: 600, fontSize: '0.9375rem' }}>{item.brand} {item.model}</p>
                    <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>{item.size} · Qty: {item.qty}</p>
                  </div>
                </div>
                <span style={{ color: '#1A1A1A', fontWeight: 600 }}>${(item.qty * item.unitPrice).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Price breakdown */}
          <div className="space-y-1.5">
            {[
              { label: `Tires (${totalTires} tires)`, amount: tiresTotal },
              { label: 'Install fee', amount: installFee },
              { label: 'Disposal fee', amount: disposalFee },
            ].map(row => (
              <div key={row.label} className="flex justify-between">
                <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>{row.label}</span>
                <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>${row.amount.toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between pt-2 border-t" style={{ borderColor: '#E5E7EB' }}>
              <span style={{ color: '#1A1A1A', fontWeight: 700 }}>
                {order.depositMode === 'full' ? 'Total Paid' : 'Deposit Paid'}
              </span>
              <span style={{ color: '#C0392B', fontWeight: 800, fontSize: '1.125rem', fontFamily: 'Sora, sans-serif' }}>
                ${order.total.toFixed(2)}
              </span>
            </div>
            {order.depositMode !== 'full' && (
              <div className="flex justify-between">
                <span style={{ color: '#F39C12', fontSize: '0.875rem', fontWeight: 500 }}>Balance due at visit</span>
                <span style={{ color: '#F39C12', fontWeight: 600, fontSize: '0.875rem' }}>
                  ${(tiresTotal + installFee + disposalFee - order.total).toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Payment method(s) */}
          <div className="mt-4 pt-4 border-t" style={{ borderColor: '#E5E7EB' }}>
            <p style={{ color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Payment</p>
            {order.paymentMethods.map(tender => (
              <div key={tender.id} className="flex items-center justify-between">
                <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>{METHOD_LABELS[tender.method] || tender.method}</span>
                <span style={{ color: '#1A1A1A', fontWeight: 600, fontSize: '0.875rem' }}>${tender.amount.toFixed(2)}</span>
              </div>
            ))}
            <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '8px' }}>
              {DEPOSIT_LABELS[order.depositMode]}
            </p>
          </div>
        </div>

        {/* Next steps */}
        <div className="bg-white rounded-[8px] p-6 mb-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontFamily: 'Sora, sans-serif', color: '#1A1A1A', fontWeight: 700, fontSize: '1.125rem', marginBottom: '12px' }}>
            What's Next
          </h2>
          <div className="space-y-3">
            {[
              { step: '1', text: 'We\'ll confirm your slot within 2 hours', icon: '📞' },
              { step: '2', text: 'Your tires will be ordered/staged before your appointment', icon: '📦' },
              { step: '3', text: 'Our technician arrives at your address at your scheduled time', icon: '🔧' },
              { step: '4', text: order.depositMode !== 'full' ? 'Pay the remaining balance via the link we\'ll send you' : 'All done — enjoy your new tires!', icon: order.depositMode !== 'full' ? '💳' : '✅' },
            ].map(item => (
              <div key={item.step} className="flex items-start gap-3">
                <span style={{ fontSize: '1.25rem', shrink: 0 }}>{item.icon}</span>
                <p style={{ color: '#6B7280', fontSize: '0.875rem', lineHeight: 1.5, paddingTop: '2px' }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onNewOrder}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[6px] transition-colors"
            style={{ border: '1.5px solid #E5E7EB', color: '#6B7280', fontWeight: 600, background: '#fff' }}
          >
            <RotateCcw size={16} /> Place Another Order
          </button>
          <a
            href="#"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[6px] text-white transition-colors"
            style={{ background: '#C0392B', fontWeight: 600 }}
          >
            <ExternalLink size={16} /> Visit Your Storefront
          </a>
        </div>
      </div>
    </div>
  );
}

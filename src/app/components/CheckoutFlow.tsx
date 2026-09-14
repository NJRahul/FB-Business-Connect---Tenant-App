import { useState, useEffect } from 'react';
import { CheckCircle2, ChevronRight, ChevronLeft, Clock, CreditCard, Smartphone, Car, User, MapPin, AlertTriangle, Plus, X, Info } from 'lucide-react';
import type { CartItem } from './CartPanel';

interface CheckoutFlowProps {
  items: CartItem[];
  grandTotal: number;
  onComplete: (order: OrderResult) => void;
  onBack: () => void;
}

export interface OrderResult {
  orderNumber: string;
  items: CartItem[];
  total: number;
  contact: ContactInfo;
  vehicle: VehicleInfo;
  slot: SlotInfo;
  paymentMethods: TenderLine[];
  depositMode: DepositMode;
}

interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
  smsConsent: boolean;
}

interface VehicleInfo {
  year: string;
  make: string;
  model: string;
  trim: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

interface SlotInfo {
  date: string;
  time: string;
  displayDate: string;
}

type DepositMode = 'full' | 'deposit25' | 'book-now-pay-later';

type PaymentMethodId = 'card' | 'apple-pay' | 'google-pay' | 'paypal' | 'venmo' | 'affirm' | 'snap' | 'synchrony';

interface TenderLine {
  id: string;
  method: PaymentMethodId;
  amount: number;
  label: string;
}

type CheckoutStep = 1 | 2 | 3 | 4;

const MAKES = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Dodge', 'BMW', 'Hyundai', 'Kia', 'Nissan', 'Subaru', 'Jeep', 'GMC'];
const MODELS: Record<string, string[]> = {
  Toyota: ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Tacoma', '4Runner'],
  Honda: ['Accord', 'Civic', 'CR-V', 'Pilot', 'Odyssey', 'HR-V'],
  Ford: ['F-150', 'Mustang', 'Explorer', 'Escape', 'Edge', 'Bronco'],
  Chevrolet: ['Silverado', 'Malibu', 'Equinox', 'Traverse', 'Tahoe'],
  BMW: ['3 Series', '5 Series', 'X3', 'X5', '7 Series'],
  default: ['Sedan', 'SUV', 'Truck', 'Van', 'Coupe'],
};
const TRIMS = ['Base', 'SE', 'XLE', 'Limited', 'Sport', 'Premier', 'Platinum'];
const US_STATES = ['GP','WC','KZN','EC','FS','LP','MP','NC','NW'];

const AVAILABLE_DATES = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i + 1);
  return d;
}).filter(d => d.getDay() !== 0); // no Sundays

const TIME_SLOTS = ['8:00 AM', '10:00 AM', '1:00 PM', '3:00 PM'];
const SLOT_AVAILABILITY: Record<number, Record<string, boolean>> = {
  0: { '8:00 AM': true, '10:00 AM': false, '1:00 PM': true, '3:00 PM': true },
  1: { '8:00 AM': false, '10:00 AM': true, '1:00 PM': true, '3:00 PM': false },
  2: { '8:00 AM': true, '10:00 AM': true, '1:00 PM': false, '3:00 PM': true },
  3: { '8:00 AM': true, '10:00 AM': false, '1:00 PM': true, '3:00 PM': false },
  4: { '8:00 AM': false, '10:00 AM': true, '1:00 PM': false, '3:00 PM': true },
};

const PAYMENT_METHODS: { id: PaymentMethodId; label: string; icon: string; category: 'digital' | 'wallet' | 'finance' }[] = [
  { id: 'card', label: 'Credit / Debit Card', icon: '💳', category: 'digital' },
  { id: 'apple-pay', label: 'Apple Pay', icon: '🍎', category: 'wallet' },
  { id: 'google-pay', label: 'Google Pay', icon: '🅖', category: 'wallet' },
  { id: 'paypal', label: 'PayPal', icon: '🅟', category: 'wallet' },
  { id: 'venmo', label: 'Venmo', icon: '💙', category: 'wallet' },
  { id: 'affirm', label: 'Affirm', icon: '🔵', category: 'finance' },
  { id: 'snap', label: 'Snap Finance', icon: '🟢', category: 'finance' },
  { id: 'synchrony', label: 'Synchrony', icon: '🔴', category: 'finance' },
];

const DEPOSIT_OPTIONS = [
  { id: 'full' as DepositMode, label: 'Full Payment', desc: 'Pay the full amount now', multiplier: 1 },
  { id: 'deposit25' as DepositMode, label: '25% Deposit', desc: 'Pay 25% now, remainder at visit', multiplier: 0.25 },
  { id: 'book-now-pay-later' as DepositMode, label: 'Book Now, Pay Later', desc: 'R 0 now — full amount due at visit', multiplier: 0 },
];

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

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function CheckoutFlow({ items, grandTotal, onComplete, onBack }: CheckoutFlowProps) {
  const [step, setStep] = useState<CheckoutStep>(1);
  const [contact, setContact] = useState<ContactInfo>({ fullName: '', email: '', phone: '', smsConsent: false });
  const [vehicle, setVehicle] = useState<VehicleInfo>({ year: '2022', make: 'Toyota', model: 'RAV4', trim: 'XLE', address: '', city: '', state: 'GP', zip: '' });
  const [slot, setSlot] = useState<SlotInfo | null>(null);
  const [selectedDateIdx, setSelectedDateIdx] = useState<number | null>(null);
  const [holdSeconds, setHoldSeconds] = useState<number | null>(null);
  const [holdExpired, setHoldExpired] = useState(false);
  const [depositMode, setDepositMode] = useState<DepositMode>('full');
  const [primaryMethod, setPrimaryMethod] = useState<PaymentMethodId>('card');
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [tenders, setTenders] = useState<TenderLine[]>([{ id: '1', method: 'card', amount: grandTotal, label: 'Card' }]);
  const [cardFields, setCardFields] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [processing, setProcessing] = useState(false);
  const [taxZip, setTaxZip] = useState('');
  const [taxEstimate, setTaxEstimate] = useState<number | null>(null);

  // Soft-hold countdown
  useEffect(() => {
    if (slot === null) return;
    setHoldSeconds(15 * 60);
    setHoldExpired(false);
    const interval = setInterval(() => {
      setHoldSeconds(s => {
        if (s === null || s <= 1) {
          clearInterval(interval);
          setHoldExpired(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [slot]);

  // Tax estimate on ZIP change
  useEffect(() => {
    if (vehicle.zip.length === 4) {
      setTaxEstimate(grandTotal * 0.0825);
    } else {
      setTaxEstimate(null);
    }
  }, [vehicle.zip, grandTotal]);

  const formatHoldTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const selectSlot = (dateIdx: number, time: string) => {
    const d = AVAILABLE_DATES[dateIdx];
    setSlot({ date: d.toISOString(), time, displayDate: formatDate(d) });
    setSelectedDateIdx(dateIdx);
  };

  const dueNow = depositMode === 'full' ? grandTotal : depositMode === 'deposit25' ? grandTotal * 0.25 : 0;

  const updateTenderAmount = (id: string, amount: number) => {
    setTenders(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, amount } : t);
      if (updated.length === 2) {
        const other = updated.find(t => t.id !== id)!;
        return updated.map(t => t.id === other.id ? { ...t, amount: Math.max(0, dueNow - amount) } : t);
      }
      return updated;
    });
  };

  const addTender = () => {
    if (tenders.length >= 2) return;
    const remaining = dueNow - (tenders[0]?.amount || 0);
    setTenders(prev => [...prev, { id: '2', method: 'affirm', amount: Math.max(0, remaining), label: 'Affirm' }]);
  };

  const handlePay = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2000));
    setProcessing(false);
    const orderNumber = `TDF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    onComplete({
      orderNumber,
      items,
      total: dueNow,
      contact,
      vehicle,
      slot: slot!,
      paymentMethods: tenders,
      depositMode,
    });
  };

  const STEPS = [
    { n: 1 as CheckoutStep, label: 'Contact', icon: User },
    { n: 2 as CheckoutStep, label: 'Vehicle & Address', icon: Car },
    { n: 3 as CheckoutStep, label: 'Install Slot', icon: Clock },
    { n: 4 as CheckoutStep, label: 'Payment', icon: CreditCard },
  ];

  const canProceedStep1 = contact.fullName && contact.email.includes('@') && contact.phone.length >= 10;
  const canProceedStep2 = vehicle.year && vehicle.make && vehicle.model && vehicle.address && vehicle.city && vehicle.zip.length === 4;
  const canProceedStep3 = slot !== null && !holdExpired;
  const canPay = (primaryMethod !== 'card' || (cardFields.number.length >= 16 && cardFields.expiry && cardFields.cvv && cardFields.name));

  const OrderSummary = () => (
    <div className="bg-white rounded-[8px] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
      <h3 style={{ fontFamily: 'Sora, sans-serif', color: '#1A1A1A', fontWeight: 700, fontSize: '1rem', marginBottom: '12px' }}>Order Summary</h3>
      <div className="space-y-2 mb-3">
        {items.map(item => (
          <div key={item.id} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span style={{ fontSize: '1.125rem' }}>{item.emoji}</span>
              <div className="min-w-0">
                <p style={{ color: '#1A1A1A', fontSize: '0.8125rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.brand} {item.model}
                </p>
                <p style={{ color: '#9CA3AF', fontSize: '0.6875rem' }}>{item.size} × {item.qty}</p>
              </div>
            </div>
            <span style={{ color: '#1A1A1A', fontWeight: 600, fontSize: '0.875rem', shrink: 0 }}>${(item.qty * item.unitPrice).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="border-t pt-3 space-y-1" style={{ borderColor: '#E5E7EB' }}>
        <div className="flex justify-between">
          <span style={{ color: '#6B7280', fontSize: '0.8125rem' }}>Subtotal</span>
          <span style={{ color: '#1A1A1A', fontSize: '0.8125rem' }}>${grandTotal.toFixed(2)}</span>
        </div>
        {taxEstimate && (
          <div className="flex justify-between">
            <span style={{ color: '#6B7280', fontSize: '0.8125rem' }}>Tax (est.)</span>
            <span style={{ color: '#6B7280', fontSize: '0.8125rem' }}>${taxEstimate.toFixed(2)}</span>
          </div>
        )}
        {depositMode !== 'full' && (
          <div className="flex justify-between pt-1 border-t" style={{ borderColor: '#F3F4F6' }}>
            <span style={{ color: '#6B7280', fontSize: '0.8125rem' }}>Due at visit</span>
            <span style={{ color: '#6B7280', fontSize: '0.8125rem' }}>${(grandTotal - dueNow).toFixed(2)}</span>
          </div>
        )}
      </div>
      <div className="flex justify-between mt-3 pt-3 border-t" style={{ borderColor: '#E5E7EB' }}>
        <span style={{ color: '#1A1A1A', fontWeight: 700 }}>Due now</span>
        <span style={{ color: '#C0392B', fontWeight: 800, fontFamily: 'Sora, sans-serif', fontSize: '1.125rem' }}>${dueNow.toFixed(2)}</span>
      </div>
      {slot && (
        <div className="mt-3 p-3 rounded-[6px]" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <p style={{ color: '#15803D', fontSize: '0.75rem', fontWeight: 600 }}>📅 Install Appointment</p>
          <p style={{ color: '#15803D', fontSize: '0.875rem', marginTop: '2px' }}>{slot.displayDate} at {slot.time}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#F9FAFB', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="bg-white border-b px-5 py-3.5" style={{ borderColor: '#E5E7EB' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <button onClick={onBack} className="flex items-center gap-1.5" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
            <ChevronLeft size={16} /> Cart
          </button>
          <div className="flex items-center gap-1 sm:gap-3">
            {STEPS.map((s, i) => {
              const isDone = step > s.n;
              const isCurrent = step === s.n;
              const Icon = s.icon;
              return (
                <div key={s.n} className="flex items-center gap-1 sm:gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: isDone ? '#27AE60' : isCurrent ? '#C0392B' : '#E5E7EB', color: isDone || isCurrent ? '#fff' : '#9CA3AF', fontSize: '0.6875rem', fontWeight: 700 }}>
                      {isDone ? '✓' : s.n}
                    </span>
                    <span className="hidden sm:inline" style={{ color: isCurrent ? '#C0392B' : isDone ? '#27AE60' : '#9CA3AF', fontSize: '0.8125rem', fontWeight: isCurrent ? 600 : 400, whiteSpace: 'nowrap' }}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && <ChevronRight size={14} style={{ color: '#D1D5DB' }} className="hidden sm:block" />}
                </div>
              );
            })}
          </div>
          <div style={{ width: '60px' }} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        {/* Form column */}
        <div>
          {/* Step 1: Contact */}
          {step === 1 && (
            <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#FDEDEC' }}>
                  <User size={18} style={{ color: '#C0392B' }} />
                </div>
                <h2 style={{ fontFamily: 'Sora, sans-serif', color: '#1A1A1A', fontWeight: 700, fontSize: '1.125rem' }}>Contact Information</h2>
              </div>
              <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '20px' }}>
                Guest checkout — no account required.
              </p>
              <div className="space-y-4">
                <div>
                  <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Full Name</label>
                  <input value={contact.fullName} onChange={e => setContact(c => ({ ...c, fullName: e.target.value }))} style={{ ...inputStyle, marginTop: '6px', display: 'block' }} placeholder="John Smith" />
                </div>
                <div>
                  <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Email Address</label>
                  <input type="email" value={contact.email} onChange={e => setContact(c => ({ ...c, email: e.target.value }))} style={{ ...inputStyle, marginTop: '6px', display: 'block' }} placeholder="john@example.com" />
                </div>
                <div>
                  <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Phone Number</label>
                  <input type="tel" value={contact.phone} onChange={e => setContact(c => ({ ...c, phone: e.target.value }))} style={{ ...inputStyle, marginTop: '6px', display: 'block' }} placeholder="+27 11 555 0100" />
                </div>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={contact.smsConsent} onChange={e => setContact(c => ({ ...c, smsConsent: e.target.checked }))} style={{ accentColor: '#C0392B', marginTop: '2px' }} />
                  <span style={{ color: '#6B7280', fontSize: '0.875rem', lineHeight: 1.5 }}>
                    I agree to receive booking confirmations and updates via SMS. Message & data rates may apply.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Vehicle & Address */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#FDEDEC' }}>
                    <Car size={18} style={{ color: '#C0392B' }} />
                  </div>
                  <h2 style={{ fontFamily: 'Sora, sans-serif', color: '#1A1A1A', fontWeight: 700, fontSize: '1.125rem' }}>Your Vehicle</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Year</label>
                    <select value={vehicle.year} onChange={e => setVehicle(v => ({ ...v, year: e.target.value }))} style={{ ...inputStyle, marginTop: '6px', display: 'block', appearance: 'none', cursor: 'pointer' }}>
                      {Array.from({ length: 22 }, (_, i) => 2026 - i).map(y => <option key={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Make</label>
                    <select value={vehicle.make} onChange={e => setVehicle(v => ({ ...v, make: e.target.value, model: '' }))} style={{ ...inputStyle, marginTop: '6px', display: 'block', appearance: 'none', cursor: 'pointer' }}>
                      {MAKES.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Model</label>
                    <select value={vehicle.model} onChange={e => setVehicle(v => ({ ...v, model: e.target.value }))} style={{ ...inputStyle, marginTop: '6px', display: 'block', appearance: 'none', cursor: 'pointer' }}>
                      {(MODELS[vehicle.make] || MODELS.default).map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Trim</label>
                    <select value={vehicle.trim} onChange={e => setVehicle(v => ({ ...v, trim: e.target.value }))} style={{ ...inputStyle, marginTop: '6px', display: 'block', appearance: 'none', cursor: 'pointer' }}>
                      {TRIMS.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#FDEDEC' }}>
                    <MapPin size={18} style={{ color: '#C0392B' }} />
                  </div>
                  <h2 style={{ fontFamily: 'Sora, sans-serif', color: '#1A1A1A', fontWeight: 700, fontSize: '1.125rem' }}>Install Address</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Street Address</label>
                    <input value={vehicle.address} onChange={e => setVehicle(v => ({ ...v, address: e.target.value }))} style={{ ...inputStyle, marginTop: '6px', display: 'block' }} placeholder="123 Main St" />
                  </div>
                  <div>
                    <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>City</label>
                    <input value={vehicle.city} onChange={e => setVehicle(v => ({ ...v, city: e.target.value }))} style={{ ...inputStyle, marginTop: '6px', display: 'block' }} placeholder="Johannesburg" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>State</label>
                      <select value={vehicle.state} onChange={e => setVehicle(v => ({ ...v, state: e.target.value }))} style={{ ...inputStyle, marginTop: '6px', display: 'block', appearance: 'none', cursor: 'pointer' }}>
                        {US_STATES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>ZIP</label>
                      <input value={vehicle.zip} onChange={e => setVehicle(v => ({ ...v, zip: e.target.value.replace(/\D/g, '').slice(0, 4) }))} style={{ ...inputStyle, marginTop: '6px', display: 'block' }} placeholder="2000" maxLength={5} />
                    </div>
                  </div>
                </div>
                {vehicle.zip.length === 4 && (
                  <p className="mt-3 flex items-center gap-1.5" style={{ color: '#27AE60', fontSize: '0.8125rem', fontWeight: 500 }}>
                    <CheckCircle2 size={14} />
                    ZIP {vehicle.zip} is in our service area · Tax: ~8.25%
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Install Slot */}
          {step === 3 && (
            <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#FDEDEC' }}>
                    <Clock size={18} style={{ color: '#C0392B' }} />
                  </div>
                  <h2 style={{ fontFamily: 'Sora, sans-serif', color: '#1A1A1A', fontWeight: 700, fontSize: '1.125rem' }}>Choose Install Slot</h2>
                </div>
                {slot && holdSeconds !== null && !holdExpired && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px]" style={{ background: holdSeconds < 120 ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${holdSeconds < 120 ? '#FECACA' : '#BBF7D0'}` }}>
                    <Clock size={13} style={{ color: holdSeconds < 120 ? '#E74C3C' : '#27AE60' }} />
                    <span style={{ color: holdSeconds < 120 ? '#E74C3C' : '#27AE60', fontWeight: 700, fontSize: '0.875rem', fontVariantNumeric: 'tabular-nums' }}>
                      {formatHoldTime(holdSeconds)}
                    </span>
                    <span style={{ color: '#6B7280', fontSize: '0.75rem' }}>hold</span>
                  </div>
                )}
              </div>

              {holdExpired && (
                <div className="mb-4 p-4 rounded-[8px] flex items-start gap-3" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                  <AlertTriangle size={16} style={{ color: '#E74C3C', marginTop: '2px' }} />
                  <div>
                    <p style={{ color: '#B91C1C', fontWeight: 600, fontSize: '0.9375rem' }}>Your hold expired</p>
                    <p style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>
                      The slot was released. Please select a new time.
                    </p>
                  </div>
                </div>
              )}

              {slot && !holdExpired && (
                <div className="mb-4 p-3 rounded-[8px] flex items-center gap-2.5" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                  <CheckCircle2 size={16} style={{ color: '#27AE60' }} />
                  <p style={{ color: '#15803D', fontWeight: 600, fontSize: '0.9375rem' }}>
                    Slot held: {slot.displayDate} at {slot.time}
                  </p>
                </div>
              )}

              <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '16px' }}>
                Select a date and time. A 15-minute soft hold will be placed while you complete payment.
              </p>

              {/* Date picker */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-5">
                {AVAILABLE_DATES.slice(0, 10).map((date, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setSelectedDateIdx(idx); setSlot(null); }}
                    className="rounded-[8px] p-2 text-center transition-all"
                    style={{
                      border: selectedDateIdx === idx ? '2px solid #C0392B' : '2px solid #E5E7EB',
                      background: selectedDateIdx === idx ? '#FDEDEC' : '#fff',
                    }}
                  >
                    <p style={{ color: '#9CA3AF', fontSize: '0.625rem', textTransform: 'uppercase', fontWeight: 600 }}>
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p style={{ color: selectedDateIdx === idx ? '#C0392B' : '#1A1A1A', fontWeight: 700, fontSize: '1.0625rem', fontFamily: 'Sora, sans-serif', marginTop: '2px' }}>
                      {date.getDate()}
                    </p>
                    <p style={{ color: '#9CA3AF', fontSize: '0.625rem' }}>
                      {date.toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                  </button>
                ))}
              </div>

              {/* Time slots */}
              {selectedDateIdx !== null && (
                <div>
                  <p style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '8px' }}>Available times:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {TIME_SLOTS.map(time => {
                      const available = (SLOT_AVAILABILITY[selectedDateIdx % 5]?.[time]) ?? true;
                      const selected = slot?.time === time && slot?.displayDate === formatDate(AVAILABLE_DATES[selectedDateIdx]);
                      return (
                        <button
                          key={time}
                          disabled={!available}
                          onClick={() => selectSlot(selectedDateIdx, time)}
                          className="py-2.5 rounded-[8px] text-sm font-semibold transition-all"
                          style={{
                            border: selected ? '2px solid #C0392B' : available ? '2px solid #E5E7EB' : '2px solid #F3F4F6',
                            background: selected ? '#FDEDEC' : available ? '#fff' : '#F9FAFB',
                            color: selected ? '#C0392B' : available ? '#1A1A1A' : '#D1D5DB',
                            cursor: available ? 'pointer' : 'not-allowed',
                          }}
                        >
                          {available ? time : `${time} — Full`}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-3 flex items-center gap-1.5" style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
                    <Info size={12} />
                    Unavailable slots are booked by other customers
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Payment */}
          {step === 4 && (
            <div className="space-y-4">
              {/* Deposit options */}
              <div className="bg-white rounded-[8px] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontFamily: 'Sora, sans-serif', color: '#1A1A1A', fontWeight: 700, marginBottom: '12px', fontSize: '1rem' }}>Payment Policy</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {DEPOSIT_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => { setDepositMode(opt.id); setTenders([{ id: '1', method: primaryMethod, amount: grandTotal * opt.multiplier, label: PAYMENT_METHODS.find(p => p.id === primaryMethod)?.label || 'Card' }]); setSplitEnabled(false); }}
                      className="p-4 rounded-[8px] text-left transition-all"
                      style={{ border: depositMode === opt.id ? '2px solid #C0392B' : '2px solid #E5E7EB', background: depositMode === opt.id ? '#FDEDEC' : '#fff' }}
                    >
                      <p style={{ fontWeight: 700, color: depositMode === opt.id ? '#C0392B' : '#1A1A1A', fontSize: '0.9375rem' }}>{opt.label}</p>
                      <p style={{ color: '#6B7280', fontSize: '0.75rem', marginTop: '4px', lineHeight: 1.4 }}>{opt.desc}</p>
                      <p style={{ color: depositMode === opt.id ? '#C0392B' : '#1A1A1A', fontWeight: 700, fontSize: '1rem', marginTop: '8px', fontFamily: 'Sora, sans-serif' }}>
                        ${(grandTotal * opt.multiplier).toFixed(2)} now
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment methods */}
              {dueNow > 0 && (
                <div className="bg-white rounded-[8px] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 style={{ fontFamily: 'Sora, sans-serif', color: '#1A1A1A', fontWeight: 700, fontSize: '1rem' }}>Payment Method</h3>
                    {!splitEnabled && (
                      <button onClick={() => { setSplitEnabled(true); addTender(); }} style={{ color: '#C0392B', fontSize: '0.8125rem', fontWeight: 600 }}>
                        + Split payment
                      </button>
                    )}
                  </div>

                  {/* Category tabs */}
                  <div className="space-y-4">
                    {/* Card payment */}
                    <div>
                      <button
                        onClick={() => setPrimaryMethod('card')}
                        className="w-full flex items-center justify-between p-3.5 rounded-[8px] transition-all"
                        style={{ border: primaryMethod === 'card' ? '2px solid #C0392B' : '2px solid #E5E7EB', background: primaryMethod === 'card' ? '#FDEDEC' : '#F9FAFB' }}
                      >
                        <div className="flex items-center gap-2.5">
                          <span style={{ fontSize: '1.25rem' }}>💳</span>
                          <span style={{ color: '#1A1A1A', fontWeight: 600, fontSize: '0.9375rem' }}>Credit / Debit Card</span>
                        </div>
                        <div className="flex gap-1">
                          {['VISA', 'MC', 'AMEX'].map(c => (
                            <span key={c} className="px-1.5 py-0.5 rounded text-xs font-bold" style={{ background: '#E5E7EB', color: '#6B7280' }}>{c}</span>
                          ))}
                        </div>
                      </button>
                      {primaryMethod === 'card' && (
                        <div className="mt-3 p-4 rounded-[8px] space-y-3" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                          <p className="flex items-center gap-1.5" style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
                            🔒 Powered by Stripe — card data never touches our servers
                          </p>
                          <div>
                            <label style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 600 }}>Card Number</label>
                            <input
                              value={cardFields.number}
                              onChange={e => setCardFields(f => ({ ...f, number: e.target.value.replace(/\D/g, '').slice(0, 16) }))}
                              style={{ ...inputStyle, marginTop: '4px', display: 'block', fontFamily: 'monospace', letterSpacing: '0.1em' }}
                              placeholder="1234 5678 9012 3456"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-1">
                              <label style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 600 }}>Expiry</label>
                              <input value={cardFields.expiry} onChange={e => setCardFields(f => ({ ...f, expiry: e.target.value }))} style={{ ...inputStyle, marginTop: '4px', display: 'block' }} placeholder="MM/YY" maxLength={5} />
                            </div>
                            <div className="col-span-1">
                              <label style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 600 }}>CVV</label>
                              <input type="password" value={cardFields.cvv} onChange={e => setCardFields(f => ({ ...f, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))} style={{ ...inputStyle, marginTop: '4px', display: 'block' }} placeholder="•••" />
                            </div>
                            <div className="col-span-1">
                              <label style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 600 }}>ZIP</label>
                              <input value={cardFields.name} onChange={e => setCardFields(f => ({ ...f, name: e.target.value }))} style={{ ...inputStyle, marginTop: '4px', display: 'block' }} placeholder="2000" maxLength={5} />
                            </div>
                          </div>
                          <div>
                            <label style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 600 }}>Name on Card</label>
                            <input value={cardFields.name} onChange={e => setCardFields(f => ({ ...f, name: e.target.value }))} style={{ ...inputStyle, marginTop: '4px', display: 'block' }} placeholder="John Smith" />
                          </div>
                          <p style={{ color: '#9CA3AF', fontSize: '0.6875rem' }}>3-D Secure authentication handled inline — no page redirect</p>
                        </div>
                      )}
                    </div>

                    {/* Digital wallets */}
                    <div className="grid grid-cols-2 gap-2">
                      {(['apple-pay', 'google-pay'] as PaymentMethodId[]).map(id => {
                        const m = PAYMENT_METHODS.find(p => p.id === id)!;
                        return (
                          <button
                            key={id}
                            onClick={() => setPrimaryMethod(id)}
                            className="flex items-center justify-center gap-2 p-3.5 rounded-[8px] font-semibold transition-all"
                            style={{
                              border: primaryMethod === id ? '2px solid #C0392B' : '2px solid #E5E7EB',
                              background: id === 'apple-pay' ? (primaryMethod === id ? '#1A1A1A' : '#1A1A1A') : primaryMethod === id ? '#4285F4' : '#fff',
                              color: '#fff',
                            }}
                          >
                            <Smartphone size={16} />
                            {m.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* PayPal / Venmo */}
                    <div className="grid grid-cols-2 gap-2">
                      {(['paypal', 'venmo'] as PaymentMethodId[]).map(id => {
                        const m = PAYMENT_METHODS.find(p => p.id === id)!;
                        return (
                          <button
                            key={id}
                            onClick={() => setPrimaryMethod(id)}
                            className="flex items-center justify-center gap-2 p-3 rounded-[8px] font-semibold transition-all"
                            style={{
                              border: primaryMethod === id ? '2px solid #C0392B' : '2px solid #E5E7EB',
                              background: id === 'paypal' ? '#0070BA' : '#3D95CE',
                              color: '#fff',
                            }}
                          >
                            <span>{m.icon}</span>
                            {m.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Financing */}
                    <div>
                      <p style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Consumer Financing</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {(['affirm', 'snap', 'synchrony'] as PaymentMethodId[]).map(id => {
                          const m = PAYMENT_METHODS.find(p => p.id === id)!;
                          return (
                            <button
                              key={id}
                              onClick={() => setPrimaryMethod(id)}
                              className="p-3 rounded-[8px] text-left transition-all"
                              style={{ border: primaryMethod === id ? '2px solid #C0392B' : '2px solid #E5E7EB', background: primaryMethod === id ? '#FDEDEC' : '#fff' }}
                            >
                              <span style={{ fontSize: '1.25rem' }}>{m.icon}</span>
                              <p style={{ color: primaryMethod === id ? '#C0392B' : '#1A1A1A', fontWeight: 600, fontSize: '0.875rem', marginTop: '4px' }}>{m.label}</p>
                              <p style={{ color: '#9CA3AF', fontSize: '0.6875rem', marginTop: '2px' }}>Apply now →</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Split tender */}
                    {splitEnabled && (
                      <div className="p-4 rounded-[8px]" style={{ background: '#F9FAFB', border: '1.5px solid #E5E7EB' }}>
                        <div className="flex items-center justify-between mb-3">
                          <p style={{ color: '#1A1A1A', fontWeight: 600, fontSize: '0.9375rem' }}>Split Payment</p>
                          <button onClick={() => { setSplitEnabled(false); setTenders([{ id: '1', method: primaryMethod, amount: dueNow, label: PAYMENT_METHODS.find(p => p.id === primaryMethod)?.label || '' }]); }} style={{ color: '#9CA3AF' }}>
                            <X size={16} />
                          </button>
                        </div>
                        {tenders.map((tender, i) => (
                          <div key={tender.id} className="flex items-center gap-2 mb-2">
                            <select
                              value={tender.method}
                              onChange={e => setTenders(prev => prev.map(t => t.id === tender.id ? { ...t, method: e.target.value as PaymentMethodId, label: PAYMENT_METHODS.find(p => p.id === e.target.value)?.label || '' } : t))}
                              style={{ ...inputStyle, flex: 1, appearance: 'none', cursor: 'pointer' }}
                            >
                              {PAYMENT_METHODS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                            </select>
                            <span style={{ color: '#6B7280', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>$</span>
                            <input
                              type="number"
                              value={tender.amount}
                              onChange={e => updateTenderAmount(tender.id, parseFloat(e.target.value) || 0)}
                              style={{ ...inputStyle, width: '90px', flex: 'none' }}
                            />
                          </div>
                        ))}
                        <div className="flex justify-between mt-2 pt-2 border-t" style={{ borderColor: '#E5E7EB' }}>
                          <span style={{ color: '#6B7280', fontSize: '0.8125rem' }}>Total allocated</span>
                          <span style={{ color: tenders.reduce((a, t) => a + t.amount, 0) === dueNow ? '#27AE60' : '#E74C3C', fontWeight: 600, fontSize: '0.8125rem' }}>
                            ${tenders.reduce((a, t) => a + t.amount, 0).toFixed(2)} / ${dueNow.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Pay Now */}
              <button
                onClick={handlePay}
                disabled={processing || !canPay || (dueNow > 0 && splitEnabled && tenders.reduce((a, t) => a + t.amount, 0) !== dueNow)}
                className="w-full py-4 rounded-[6px] text-white flex items-center justify-center gap-2 transition-colors"
                style={{
                  background: processing || !canPay ? '#9CA3AF' : '#C0392B',
                  fontWeight: 700,
                  fontSize: '1.0625rem',
                  cursor: processing || !canPay ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={e => { if (!processing && canPay) e.currentTarget.style.background = '#A93226'; }}
                onMouseLeave={e => { if (!processing && canPay) e.currentTarget.style.background = '#C0392B'; }}
              >
                {processing ? (
                  <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing payment...</>
                ) : dueNow === 0 ? (
                  '📅 Confirm Booking — R 0 Due Now'
                ) : (
                  `🔒 Pay Now — R ${dueNow.toFixed(2)}`
                )}
              </button>
              <p className="text-center" style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '8px' }}>
                By paying you agree to our Terms of Service. Payments processed securely by Stripe.
              </p>
            </div>
          )}

          {/* Navigation */}
          {step < 4 && (
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => step > 1 ? setStep(s => (s - 1) as CheckoutStep) : onBack()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-[6px]"
                style={{ border: '1.5px solid #E5E7EB', color: '#6B7280', fontWeight: 500, background: '#fff' }}
              >
                <ChevronLeft size={16} /> Back
              </button>
              <button
                onClick={() => setStep(s => (s + 1) as CheckoutStep)}
                disabled={
                  (step === 1 && !canProceedStep1) ||
                  (step === 2 && !canProceedStep2) ||
                  (step === 3 && !canProceedStep3)
                }
                className="flex items-center gap-2 px-6 py-2.5 rounded-[6px] text-white transition-colors"
                style={{
                  background: (step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2) || (step === 3 && !canProceedStep3) ? '#9CA3AF' : '#C0392B',
                  fontWeight: 600,
                }}
                onMouseEnter={e => { const d = (step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2) || (step === 3 && !canProceedStep3); if (!d) e.currentTarget.style.background = '#A93226'; }}
                onMouseLeave={e => { const d = (step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2) || (step === 3 && !canProceedStep3); if (!d) e.currentTarget.style.background = '#C0392B'; }}
              >
                Continue <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Sticky order summary */}
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
}

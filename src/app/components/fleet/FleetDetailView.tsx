import { useState, useRef } from 'react';
import {
  ArrowLeft, Building2, Car, Tag, FileText, BarChart2, Activity,
  Plus, Upload, Download, CheckCircle2, AlertTriangle, X, Loader2,
  CreditCard, Clock, ChevronDown, ChevronUp, Pencil, Trash2,
} from 'lucide-react';
import type { FleetAccount, FleetVehicle, AgingBucket, InvoiceStatus } from './types';
import { MOCK_FLEET_INVOICES, MOCK_PRICING_MENUS, MOCK_PRICING_TIERS } from './mockData';

type Tab = 'overview' | 'vehicles' | 'pricing' | 'invoices' | 'statement' | 'activity';

function cents(c: number) {
  return `$${(c / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function pct(retail: number, agreed: number) {
  return `${Math.round((1 - agreed / retail) * 100)}% off`;
}

const AGING_CONFIG: Record<AgingBucket, { label: string; color: string; bg: string }> = {
  current:  { label: 'Current',   color: '#15803D', bg: '#F0FDF4' },
  '1_30':   { label: '1–30 days', color: '#B45309', bg: '#FFF7ED' },
  '31_60':  { label: '31–60 days',color: '#C2410C', bg: '#FFF3CD' },
  '61_90':  { label: '61–90 days',color: '#B91C1C', bg: '#FEF2F2' },
  '90_plus':{ label: '90+ days',  color: '#7F1D1D', bg: '#FEE2E2' },
};

const INV_STATUS: Record<InvoiceStatus, { label: string; color: string; bg: string }> = {
  draft:   { label: 'Draft',   color: '#6B7280', bg: '#F9FAFB' },
  open:    { label: 'Open',    color: '#2563EB', bg: '#EFF6FF' },
  paid:    { label: 'Paid',    color: '#15803D', bg: '#F0FDF4' },
  overdue: { label: 'Overdue', color: '#B91C1C', bg: '#FEF2F2' },
  voided:  { label: 'Voided',  color: '#6B7280', bg: '#F9FAFB' },
};

const TERMS_LABEL: Record<string, string> = {
  net_15: 'Net 15', net_30: 'Net 30', net_45: 'Net 45', net_60: 'Net 60', immediate: 'Immediate',
};

interface Props {
  account: FleetAccount;
  onBack: () => void;
  onOpenSession: (accountId: string) => void;
}

export function FleetDetailView({ account, onBack, onOpenSession }: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const [acct, setAcct] = useState<FleetAccount>(account);
  const [toastMsg, setToastMsg] = useState('');
  const [expandedInv, setExpandedInv] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Vehicle form state
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [vYear, setVYear] = useState('');
  const [vMake, setVMake] = useState('');
  const [vModel, setVModel] = useState('');
  const [vTrim, setVTrim] = useState('');
  const [vVin, setVVin] = useState('');
  const [vPlate, setVPlate] = useState('');
  const [vState, setVState] = useState('NC');

  const invoices = MOCK_FLEET_INVOICES.filter(i => i.fleetAccountId === account.id);
  const pricingMenu = MOCK_PRICING_MENUS.find(m => m.fleetAccountId === account.id);
  const pricingTier = MOCK_PRICING_TIERS.find(t => t.id === acct.pricingTierId);

  function showToast(msg: string) { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); }

  function addVehicle() {
    if (!vYear || !vMake || !vModel) return;
    const v: FleetVehicle = {
      id: `veh_${Date.now()}`, fleetAccountId: acct.id,
      year: parseInt(vYear), make: vMake, model: vModel, trim: vTrim,
      vin: vVin, plate: vPlate, plateState: vState,
    };
    setAcct(a => ({ ...a, vehicles: [...a.vehicles, v] }));
    setShowAddVehicle(false);
    setVYear(''); setVMake(''); setVModel(''); setVTrim(''); setVVin(''); setVPlate('');
    showToast(`${vYear} ${vMake} ${vModel} added to fleet.`);
  }

  function handleCSV(e: React.ChangeEvent<HTMLInputElement>) {
    // Simulate parsing CSV
    const file = e.target.files?.[0];
    if (!file) return;
    setTimeout(() => {
      const newVehicles: FleetVehicle[] = [
        { id: `veh_csv_1`, fleetAccountId: acct.id, year: 2023, make: 'Ford', model: 'Transit', trim: 'Cargo 250', vin: 'CSV-VIN-001', plate: 'CSV-001', plateState: 'NC' },
        { id: `veh_csv_2`, fleetAccountId: acct.id, year: 2023, make: 'Ford', model: 'Transit', trim: 'Cargo 250', vin: 'CSV-VIN-002', plate: 'CSV-002', plateState: 'NC' },
      ];
      setAcct(a => ({ ...a, vehicles: [...a.vehicles, ...newVehicles] }));
      showToast(`Imported 2 vehicles from ${file.name}`);
    }, 800);
    e.target.value = '';
  }

  function removeVehicle(id: string) {
    setAcct(a => ({ ...a, vehicles: a.vehicles.filter(v => v.id !== id) }));
    showToast('Vehicle removed from fleet.');
  }

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'vehicles', label: `Vehicles (${acct.vehicles.length})`, icon: Car },
    { id: 'pricing', label: 'Pricing', icon: Tag },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'statement', label: 'Statement', icon: BarChart2 },
    { id: 'activity', label: 'Activity', icon: Activity },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg"
          style={{ color: '#6B7280', background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#FDEDEC' }}>
            <Building2 size={18} color="#C0392B" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.125rem', color: '#1A1A1A' }}>{acct.businessName}</h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: acct.status === 'active' ? '#F0FDF4' : '#FFF1F2', color: acct.status === 'active' ? '#15803D' : '#BE123C' }}>
                {acct.status}
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{acct.billingContact.email} · {TERMS_LABEL[acct.paymentTerms]}</p>
          </div>
        </div>
        <button onClick={() => onOpenSession(acct.id)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ background: '#C0392B', color: '#fff' }}>
          <Plus size={14} /> Start Fleet Session
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 border-b" style={{ borderColor: '#E5E7EB' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors"
            style={{
              color: tab === t.id ? '#C0392B' : '#6B7280',
              borderBottom: tab === t.id ? '2px solid #C0392B' : '2px solid transparent',
            }}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <div className="flex flex-col gap-5">
          {/* Aging buckets */}
          <div className="grid grid-cols-5 gap-3">
            {(Object.entries(AGING_CONFIG) as [AgingBucket, typeof AGING_CONFIG[AgingBucket]][]).map(([bucket, cfg]) => (
              <div key={bucket} className="rounded-xl p-4" style={{ background: cfg.bg, border: `1px solid ${cfg.color}22` }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cfg.label}</p>
                <p style={{ fontSize: '1.125rem', fontWeight: 700, color: cfg.color, marginTop: 4 }}>{cents(acct.aging[bucket] || 0)}</p>
              </div>
            ))}
          </div>

          {/* Key info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
              <h3 style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1A1A1A', marginBottom: 14 }}>Account Details</h3>
              {[
                { label: 'Tax Ref. No.', value: acct.ein || '—' },
                { label: 'Payment Terms', value: TERMS_LABEL[acct.paymentTerms] },
                { label: 'Credit Limit', value: cents(acct.creditLimitCents) },
                { label: 'Outstanding', value: cents(acct.outstandingBalanceCents) },
                { label: 'Pricing Tier', value: pricingTier?.name || 'Retail' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2" style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <p style={{ fontSize: '0.825rem', color: '#6B7280' }}>{label}</p>
                  <p style={{ fontSize: '0.825rem', fontWeight: 500, color: '#111827' }}>{value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
              <h3 style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1A1A1A', marginBottom: 14 }}>Contacts</h3>
              <div className="mb-4">
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Billing Contact</p>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A1A1A' }}>{acct.billingContact.name}</p>
                <p style={{ fontSize: '0.825rem', color: '#6B7280' }}>{acct.billingContact.email}</p>
                <p style={{ fontSize: '0.825rem', color: '#6B7280' }}>{acct.billingContact.phone}</p>
              </div>
              <div className="pt-4 border-t" style={{ borderColor: '#F3F4F6' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>AP Contact</p>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A1A1A' }}>{acct.apContact.name}</p>
                <p style={{ fontSize: '0.825rem', color: '#6B7280' }}>{acct.apContact.email}</p>
              </div>
            </div>
          </div>

          {/* Authorized buyers */}
          <div className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1A1A1A' }}>Authorized Buyers</h3>
              <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg" style={{ background: '#FDEDEC', color: '#C0392B' }}>
                <Plus size={12} /> Add Buyer
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {acct.authorizedBuyers.map(b => (
                <div key={b.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg" style={{ background: '#F9FAFB' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1A1A1A' }}>{b.name}</p>
                    <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{b.email} · {b.role.replace('_', ' ')}</p>
                  </div>
                  <div className="text-right">
                    {b.spendLimitPerTransaction && (
                      <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>Per txn: {cents(b.spendLimitPerTransaction)}</p>
                    )}
                    <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                      Vehicles: {b.vehicleScope === 'all' ? 'All' : `${(b.vehicleScope as string[]).length} vehicles`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Credit utilization */}
          <div className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
            <div className="flex items-center justify-between mb-2">
              <h3 style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1A1A1A' }}>Credit Utilization</h3>
              <span style={{ fontSize: '0.825rem', color: '#6B7280' }}>
                {cents(acct.outstandingBalanceCents)} / {cents(acct.creditLimitCents)}
              </span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
              <div className="h-full rounded-full transition-all" style={{
                width: `${Math.min(100, (acct.outstandingBalanceCents / acct.creditLimitCents) * 100)}%`,
                background: acct.outstandingBalanceCents / acct.creditLimitCents > 0.8 ? '#EF4444' : '#C0392B',
              }} />
            </div>
            <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: 4 }}>
              {Math.round((acct.outstandingBalanceCents / acct.creditLimitCents) * 100)}% utilized
              {acct.outstandingBalanceCents > acct.creditLimitCents * 0.8 && (
                <span style={{ color: '#B91C1C', marginLeft: 8 }}>⚠ Near credit limit</span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* ── VEHICLES ── */}
      {tab === 'vehicles' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p style={{ fontSize: '0.825rem', color: '#6B7280' }}>{acct.vehicles.length} vehicles in fleet</p>
            <div className="flex gap-2">
              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleCSV} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm"
                style={{ background: '#F9FAFB', color: '#374151', border: '1px solid #E5E7EB' }}>
                <Upload size={13} /> Import CSV
              </button>
              <button onClick={() => setShowAddVehicle(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium"
                style={{ background: '#C0392B', color: '#fff' }}>
                <Plus size={13} /> Add Vehicle
              </button>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  {['Vehicle', 'VIN', 'Plate', 'Last Service', 'Mileage', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3"
                      style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {acct.vehicles.map((v, i) => (
                  <tr key={v.id} style={{ borderBottom: '1px solid #F3F4F6', background: '#fff' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                    <td className="px-4 py-3">
                      <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1A1A1A' }}>{v.year} {v.make} {v.model}</p>
                      <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{v.trim}</p>
                    </td>
                    <td className="px-4 py-3" style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#6B7280' }}>{v.vin || '—'}</td>
                    <td className="px-4 py-3">
                      <span style={{ fontWeight: 600, fontSize: '0.825rem', color: '#374151' }}>{v.plate}</span>
                      <span style={{ fontSize: '0.75rem', color: '#9CA3AF', marginLeft: 4 }}>{v.plateState}</span>
                    </td>
                    <td className="px-4 py-3" style={{ fontSize: '0.825rem', color: v.lastServiceDate ? '#374151' : '#9CA3AF' }}>
                      {v.lastServiceDate ? new Date(v.lastServiceDate).toLocaleDateString() : 'No record'}
                    </td>
                    <td className="px-4 py-3" style={{ fontSize: '0.825rem', color: '#374151', fontVariantNumeric: 'tabular-nums' }}>
                      {v.mileage ? `${v.mileage.toLocaleString()} mi` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => removeVehicle(v.id)} style={{ color: '#EF4444' }}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {acct.vehicles.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-10" style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>No vehicles. Import CSV or add manually.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Add vehicle form */}
          {showAddVehicle && (
            <div className="rounded-xl p-5" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
              <div className="flex items-center justify-between mb-4">
                <h4 style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1A1A1A' }}>Add Vehicle</h4>
                <button onClick={() => setShowAddVehicle(false)} style={{ color: '#9CA3AF' }}><X size={16} /></button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Year *', value: vYear, set: setVYear, ph: '2023' },
                  { label: 'Make *', value: vMake, set: setVMake, ph: 'Ford' },
                  { label: 'Model *', value: vModel, set: setVModel, ph: 'Transit' },
                  { label: 'Trim', value: vTrim, set: setVTrim, ph: 'Cargo 350' },
                  { label: 'VIN', value: vVin, set: setVVin, ph: '1FTBW2CM…' },
                  { label: 'Plate', value: vPlate, set: setVPlate, ph: 'ABC-123' },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>{f.label}</label>
                    <input value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                      className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ border: '1px solid #E5E7EB', color: '#1A1A1A', background: '#fff' }} />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowAddVehicle(false)}
                  className="px-4 py-2 rounded-lg text-sm" style={{ background: '#fff', color: '#6B7280', border: '1px solid #E5E7EB' }}>Cancel</button>
                <button onClick={addVehicle} disabled={!vYear || !vMake || !vModel}
                  className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ background: '#C0392B', color: '#fff', opacity: vYear && vMake && vModel ? 1 : 0.4 }}>
                  Add Vehicle
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── PRICING ── */}
      {tab === 'pricing' && (
        <div className="flex flex-col gap-5">
          {/* Tier assignment */}
          <div className="rounded-xl p-5 flex items-center justify-between" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1A1A1A' }}>Assigned Pricing Tier</p>
              <p style={{ fontSize: '0.825rem', color: '#6B7280', marginTop: 2 }}>
                {pricingTier ? `${pricingTier.name} — ${pricingTier.discountValue}% off retail` : 'No tier assigned (retail pricing)'}
              </p>
            </div>
            <button className="px-3 py-1.5 rounded-lg text-sm" style={{ background: '#FDEDEC', color: '#C0392B' }}>Change Tier</button>
          </div>

          {pricingMenu ? (
            <>
              {/* Menu header */}
              <div className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
                <div className="flex items-center justify-between mb-1">
                  <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A1A1A' }}>{pricingMenu.name}</h3>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm" style={{ background: '#F9FAFB', color: '#374151', border: '1px solid #E5E7EB' }}>
                    <Download size={13} /> Export PDF
                  </button>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                  Effective {new Date(pricingMenu.effectiveFrom).toLocaleDateString()} – {new Date(pricingMenu.effectiveTo).toLocaleDateString()}
                </p>
              </div>

              {/* Agreed pricing table */}
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
                <div className="px-4 py-3" style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pre-Agreed Pricing Menu</p>
                </div>
                <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #E5E7EB' }}>
                      {['Type', 'SKU / Code', 'Description', 'Retail Price', 'Agreed Price', 'Discount', 'Unit'].map(h => (
                        <th key={h} className="text-left px-4 py-2.5"
                          style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pricingMenu.lines.map(line => (
                      <tr key={line.id} style={{ borderBottom: '1px solid #F3F4F6' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                        onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                            background: line.type === 'product' ? '#EFF6FF' : line.type === 'service' ? '#F0FDF4' : '#FFF7ED',
                            color: line.type === 'product' ? '#1D4ED8' : line.type === 'service' ? '#15803D' : '#C2410C',
                          }}>
                            {line.type}
                          </span>
                        </td>
                        <td className="px-4 py-3" style={{ fontFamily: 'monospace', fontSize: '0.775rem', color: '#6B7280' }}>{line.sku || '—'}</td>
                        <td className="px-4 py-3" style={{ fontSize: '0.825rem', color: '#1A1A1A', fontWeight: 500 }}>{line.description}</td>
                        <td className="px-4 py-3" style={{ fontSize: '0.825rem', color: '#9CA3AF', textDecoration: 'line-through', fontVariantNumeric: 'tabular-nums' }}>
                          ${line.retailPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-3" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#C0392B', fontVariantNumeric: 'tabular-nums' }}>
                          ${line.agreedPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: '#F0FDF4', color: '#15803D' }}>
                            {pct(line.retailPrice, line.agreedPrice)}
                          </span>
                        </td>
                        <td className="px-4 py-3" style={{ fontSize: '0.8rem', color: '#6B7280' }}>{line.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Volume tiers */}
              <div className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
                <h4 style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1A1A1A', marginBottom: 12 }}>Quantity-Based Volume Tiers</h4>
                <div className="flex flex-col gap-2">
                  {pricingMenu.volumeTiers.map((tier, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-2.5 rounded-lg"
                      style={{ background: tier.discountPct > 0 ? '#F0FDF4' : '#F9FAFB' }}>
                      <p style={{ fontSize: '0.825rem', color: '#374151' }}>{tier.label}</p>
                      {tier.discountPct > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: '#F0FDF4', color: '#15803D' }}>
                          Additional {tier.discountPct}% off agreed price
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: 10 }}>
                  Precedence: per-SKU override › pre-agreed menu › volume tier › pricing tier › retail
                </p>
              </div>
            </>
          ) : (
            <div className="rounded-xl p-10 text-center" style={{ background: '#F9FAFB', border: '1px dashed #D1D5DB' }}>
              <Tag size={28} color="#D1D5DB" className="mx-auto mb-3" />
              <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: 12 }}>No pre-agreed pricing menu for this fleet.</p>
              <button className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: '#C0392B', color: '#fff' }}>
                Create Pricing Menu
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── INVOICES ── */}
      {tab === 'invoices' && (
        <div className="flex flex-col gap-4">
          {invoices.map(inv => {
            const st = INV_STATUS[inv.status];
            const expanded = expandedInv === inv.id;
            return (
              <div key={inv.id} className="rounded-xl overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
                <div className="px-5 py-4 flex items-center justify-between cursor-pointer"
                  style={{ background: '#fff' }} onClick={() => setExpandedInv(expanded ? null : inv.id)}>
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A1A1A' }}>{inv.invoiceNumber}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        {inv.poNumber && <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>PO: {inv.poNumber}</p>}
                        <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Due {new Date(inv.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p style={{ fontWeight: 700, fontSize: '1rem', color: '#1A1A1A' }}>{cents(inv.totalCents)}</p>
                      {inv.paidCents > 0 && inv.paidCents < inv.totalCents && (
                        <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>Paid: {cents(inv.paidCents)}</p>
                      )}
                    </div>
                    {expanded ? <ChevronUp size={16} style={{ color: '#9CA3AF' }} /> : <ChevronDown size={16} style={{ color: '#9CA3AF' }} />}
                  </div>
                </div>
                {expanded && (
                  <div style={{ borderTop: '1px solid #F3F4F6', background: '#FAFAFA' }}>
                    <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                          {['Vehicle', 'Description', 'Qty', 'Unit Price', 'Total'].map(h => (
                            <th key={h} className="text-left px-4 py-2"
                              style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {inv.lines.map((l, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                            <td className="px-4 py-2.5" style={{ fontSize: '0.775rem', color: '#6B7280' }}>{l.vehicleLabel || '—'}</td>
                            <td className="px-4 py-2.5" style={{ fontSize: '0.825rem', color: '#1A1A1A' }}>{l.description}</td>
                            <td className="px-4 py-2.5" style={{ fontSize: '0.825rem', color: '#374151', textAlign: 'center' }}>{l.qty}</td>
                            <td className="px-4 py-2.5" style={{ fontSize: '0.825rem', color: '#374151', fontVariantNumeric: 'tabular-nums' }}>{cents(l.unitPrice)}</td>
                            <td className="px-4 py-2.5" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A1A1A', fontVariantNumeric: 'tabular-nums' }}>{cents(l.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="px-5 py-3 flex justify-between items-center" style={{ borderTop: '1px solid #E5E7EB' }}>
                      <div className="flex gap-3">
                        <button className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg" style={{ background: '#F9FAFB', color: '#374151', border: '1px solid #E5E7EB' }}>
                          <Download size={13} /> Download PDF
                        </button>
                        {inv.status === 'open' || inv.status === 'overdue' ? (
                          <button className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg" style={{ background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' }}>
                            Record Payment
                          </button>
                        ) : null}
                      </div>
                      <div className="text-right">
                        <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Subtotal: {cents(inv.subtotalCents)}</p>
                        <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Tax: {cents(inv.taxCents)}</p>
                        <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1A1A1A' }}>Total: {cents(inv.totalCents)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {invoices.length === 0 && (
            <div className="text-center py-12" style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>No invoices yet.</div>
          )}
        </div>
      )}

      {/* ── STATEMENT ── */}
      {tab === 'statement' && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between rounded-xl p-5" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A1A1A' }}>Monthly Statement — June 2026</h3>
              <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: 2 }}>Auto-delivered to {acct.apContact.email} on last business day of month</p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg" style={{ background: '#F9FAFB', color: '#374151', border: '1px solid #E5E7EB' }}>
                <Download size={13} /> CSV
              </button>
              <button className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg" style={{ background: '#C0392B', color: '#fff' }}>
                <Download size={13} /> PDF
              </button>
            </div>
          </div>

          {/* Statement summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Opening Balance', value: cents(acct.outstandingBalanceCents - 30456) },
              { label: 'New Charges', value: cents(126999 + 55292) },
              { label: 'Payments Received', value: cents(30456) },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-4" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
                <p style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{s.label}</p>
                <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1A1A1A', marginTop: 4 }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Closing balance + aging */}
          <div className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
            <div className="flex items-center justify-between mb-4">
              <h4 style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1A1A1A' }}>Closing Balance</h4>
              <span style={{ fontWeight: 700, fontSize: '1.125rem', color: '#C0392B' }}>{cents(acct.outstandingBalanceCents)}</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {(Object.entries(AGING_CONFIG) as [AgingBucket, typeof AGING_CONFIG[AgingBucket]][]).map(([bucket, cfg]) => (
                <div key={bucket} className="rounded-lg p-3 text-center" style={{ background: cfg.bg }}>
                  <p style={{ fontSize: '0.65rem', fontWeight: 600, color: cfg.color, textTransform: 'uppercase' }}>{cfg.label}</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: 700, color: cfg.color, marginTop: 2 }}>{cents(acct.aging[bucket] || 0)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Per-vehicle breakdown */}
          <div className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
            <h4 style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1A1A1A', marginBottom: 12 }}>Per-Vehicle Breakdown</h4>
            <div className="flex flex-col gap-2">
              {acct.vehicles.filter(v => v.lastServiceDate).map(v => (
                <div key={v.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg" style={{ background: '#F9FAFB' }}>
                  <div>
                    <p style={{ fontSize: '0.825rem', fontWeight: 600, color: '#1A1A1A' }}>{v.year} {v.make} {v.model} — {v.plate}</p>
                    <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Last service: {v.lastServiceDate ? new Date(v.lastServiceDate).toLocaleDateString() : 'None'}</p>
                  </div>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#374151' }}>{cents(Math.floor(Math.random() * 80000) + 10000)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ACTIVITY ── */}
      {tab === 'activity' && (
        <div className="flex flex-col gap-3">
          {[
            { date: '2026-06-15', event: 'Fleet session started — 2 vehicles in queue', actor: 'Marcus Webb', type: 'session' },
            { date: '2026-06-14', event: 'Invoice INV-2026-0541 issued via session close', actor: 'System', type: 'invoice' },
            { date: '2026-06-14', event: 'Approval request from Carlos Mendez ($845.00)', actor: 'Carlos Mendez', type: 'approval' },
            { date: '2026-06-01', event: 'Invoice INV-2026-0489 marked paid — ACH $304.56', actor: 'Shop Admin', type: 'payment' },
            { date: '2026-04-01', event: 'Invoice INV-2026-0422 issued — Net 30 due 2026-05-01', actor: 'System', type: 'invoice' },
          ].map((e, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ background: '#fff', border: '1px solid #F3F4F6' }}>
              <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ background: e.type === 'session' ? '#60A5FA' : e.type === 'payment' ? '#4ADE80' : e.type === 'approval' ? '#FBBF24' : '#C0392B' }} />
              <div className="flex-1">
                <p style={{ fontSize: '0.825rem', color: '#1A1A1A' }}>{e.event}</p>
                <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: 1 }}>{new Date(e.date).toLocaleDateString()} · {e.actor}</p>
              </div>
            </div>
          ))}
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

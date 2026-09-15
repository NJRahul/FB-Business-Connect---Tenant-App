import { useState } from 'react';
import { Settings, DollarSign, Upload, Activity, Wrench, Bell, ChevronDown, Menu, X, Globe, CheckCircle2, AlertTriangle, ShoppingCart, RotateCcw, CalendarDays, HardHat, Truck, Megaphone, BarChart2, Paintbrush, Car, ShieldAlert, ClipboardList, Repeat2, Code2, CircleDot, Landmark, ShieldCheck } from 'lucide-react';
import { SettingsPage } from './SettingsPage';
import { PlanManagement } from './PlanManagement';
import { DataImportPage } from './DataImportPage';
import { LifecycleManagement } from './LifecycleManagement';
import { CartCheckoutPage } from './CartCheckoutPage';
import { RefundManager } from './RefundManager';
import { BookingModule } from './booking/BookingModule';
import { FieldServiceModule } from './fieldservice/FieldServiceModule';
import { DistributorModule } from './distributor/DistributorModule';
import MarketingModule from './marketing/MarketingModule';
import NotificationsModule from './notifications/NotificationsModule';
import { BillingModule } from './billing/BillingModule';
import ReportingModule from './reporting/ReportingModule';
import BrandingModule from './branding/BrandingModule';
import FleetModule from './fleet/FleetModule';
import RecallModule from './recall/RecallModule';
import { InspectionModule } from './inspection/InspectionModule';
import { RecurringPlansModule } from './recurring-plans/RecurringPlansModule';
import { OpenPlatformModule } from './open-platform/OpenPlatformModule';
import { TiresModule } from './tires/TiresModule';
import { BankingModule } from './banking/BankingModule';
import { InsuranceModule } from './insurance/InsuranceModule';

type PlanTier = 'starter' | 'pro' | 'enterprise';
type DashboardSection = 'home' | 'settings' | 'plan' | 'billing' | 'import' | 'lifecycle' | 'storefront' | 'orders' | 'bookings' | 'fieldservice' | 'distributors' | 'marketing' | 'notifications' | 'reporting' | 'branding' | 'fleet' | 'recall' | 'inspection' | 'recurring-plans' | 'open-platform' | 'tires' | 'banking' | 'insurance';

interface TenantData {
  businessName: string;
  ownerName: string;
  email: string;
  planTier: PlanTier;
}

interface DashboardProps {
  tenant: TenantData;
  onPlatformAdmin?: () => void;
}

const NAV_ITEMS: { id: DashboardSection; label: string; icon: typeof Settings; group?: string }[] = [
  { id: 'home', label: 'Overview', icon: Activity },
  { id: 'bookings', label: 'Bookings & Schedule', icon: CalendarDays, group: 'operations' },
  { id: 'fieldservice',  label: 'Field Service',  icon: HardHat, group: 'operations' },
  { id: 'distributors', label: 'Distributors',   icon: Truck,      group: 'operations' },
  { id: 'fleet',        label: 'Fleet & B2B',    icon: Car,        group: 'operations' },
  { id: 'recall',      label: 'Recall & Compliance', icon: ShieldAlert,   group: 'operations' },
  { id: 'inspection',  label: 'Inspections',         icon: ClipboardList, group: 'operations' },
  { id: 'tires',            label: 'Tires Industry Pack',        icon: CircleDot, group: 'operations' },
  { id: 'recurring-plans', label: 'Service Plans & Memberships', icon: Repeat2, group: 'operations' },
  { id: 'open-platform',  label: 'Open Platform',              icon: Code2,   group: 'operations' },
  { id: 'marketing',       label: 'Marketing',       icon: Megaphone,  group: 'operations' },
  { id: 'notifications',  label: 'Notifications',   icon: Bell,       group: 'operations' },
  { id: 'reporting',      label: 'Reporting',        icon: BarChart2,   group: 'operations' },
  { id: 'branding',       label: 'Branding',          icon: Paintbrush,  group: 'operations' },
  { id: 'storefront', label: 'Cart & Checkout', icon: ShoppingCart, group: 'commerce' },
  { id: 'orders', label: 'Order Management', icon: RotateCcw, group: 'commerce' },
  { id: 'banking',   label: 'Business Banking', icon: Landmark,    group: 'admin' },
  { id: 'insurance', label: 'Insurance',        icon: ShieldCheck, group: 'admin' },
  { id: 'settings', label: 'Settings',     icon: Settings,    group: 'admin' },
  { id: 'billing',  label: 'Billing & Plan', icon: DollarSign, group: 'admin' },
  { id: 'import', label: 'Data Import', icon: Upload, group: 'admin' },
  { id: 'lifecycle', label: 'Lifecycle', icon: Activity, group: 'admin' },
];

const PLAN_COLOR: Record<PlanTier, string> = {
  starter: '#6B7280',
  pro: '#00A9AC',
  enterprise: '#1A1A1A',
};

export function Dashboard({ tenant, onPlatformAdmin }: DashboardProps) {
  const [section, setSection] = useState<DashboardSection>('home');
  const [plan, setPlan] = useState<PlanTier>(tenant.planTier);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const slug = tenant.businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 20) || 'yourshop';

  return (
    <div className="flex" style={{ height: '100vh', overflow: 'hidden', fontFamily: 'Inter, sans-serif', background: '#F9FAFB' }}>
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 xl:w-64 bg-white border-r shrink-0" style={{ borderColor: '#E5E7EB', height: '100vh', overflowY: 'auto' }}>
        <div className="p-4 border-b flex items-center gap-2.5" style={{ borderColor: '#E5E7EB' }}>
          <div className="w-8 h-8 rounded-[6px] flex items-center justify-center shrink-0" style={{ background: '#00A9AC' }}>
            <Wrench size={16} color="#fff" />
          </div>
          <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.0625rem' }}>FB Business Connect</span>
        </div>

        {/* Tenant info */}
        <div className="p-4 border-b" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: '#E6F7F7', color: '#00A9AC', fontWeight: 700, fontSize: '0.875rem' }}>
              {(tenant.businessName || 'T')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p style={{ color: '#1A1A1A', fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {tenant.businessName || 'Your Shop'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="px-1.5 py-0.5 rounded" style={{ background: plan === 'pro' ? '#E6F7F7' : '#F3F4F6', color: PLAN_COLOR[plan], fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {plan}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-left transition-colors"
                style={{
                  background: active ? '#E6F7F7' : 'transparent',
                  color: active ? '#00A9AC' : '#6B7280',
                  fontWeight: active ? 600 : 400,
                  fontSize: '0.9375rem',
                }}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Storefront link */}
        <div className="p-4 border-t" style={{ borderColor: '#E5E7EB' }}>
          <a
            href="#"
            className="flex items-center gap-2 px-3 py-2 rounded-[6px] w-full"
            style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}
          >
            <Globe size={14} style={{ color: '#9CA3AF' }} />
            <span style={{ color: '#6B7280', fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {slug}.fb-business-connect.app
            </span>
          </a>
          {onPlatformAdmin && (
            <button
              onClick={onPlatformAdmin}
              className="mt-2 w-full flex items-center gap-2 px-3 py-1.5 rounded-[6px] text-xs"
              style={{ color: '#9CA3AF', background: 'transparent', border: '1px solid #F3F4F6' }}
              title="Platform Admin Console"
            >
              <span style={{ fontSize: '0.65rem', color: '#D1D5DB', fontWeight: 600, letterSpacing: '0.08em' }}>⬡ Platform Admin</span>
            </button>
          )}
        </div>
      </aside>

      {/* Mobile nav overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileNavOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white flex flex-col" style={{ boxShadow: '4px 0 20px rgba(0,0,0,0.15)' }}>
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#E5E7EB' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[6px] flex items-center justify-center" style={{ background: '#00A9AC' }}>
                  <Wrench size={16} color="#fff" />
                </div>
                <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A' }}>FB Business Connect</span>
              </div>
              <button onClick={() => setMobileNavOpen(false)}>
                <X size={20} style={{ color: '#9CA3AF' }} />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-0.5">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                const active = section === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setSection(item.id); setMobileNavOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-left"
                    style={{ background: active ? '#E6F7F7' : 'transparent', color: active ? '#00A9AC' : '#6B7280', fontWeight: active ? 600 : 400 }}
                  >
                    <Icon size={16} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0" style={{ height: '100vh', overflow: 'hidden' }}>
        {/* Top bar */}
        <header className="bg-white border-b px-4 lg:px-6 py-3 flex items-center justify-between gap-3" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 rounded-[6px]"
              style={{ color: '#6B7280' }}
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 style={{ fontFamily: 'Sora, sans-serif', color: '#1A1A1A', fontWeight: 700, fontSize: '1.0625rem' }}>
                {NAV_ITEMS.find(i => i.id === section)?.label || 'Dashboard'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-[6px] relative" style={{ color: '#6B7280', background: '#F9FAFB' }}>
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: '#00A9AC' }} />
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-[6px]" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#E6F7F7', color: '#00A9AC', fontWeight: 700, fontSize: '0.75rem' }}>
                {(tenant.ownerName || tenant.businessName || 'U')[0].toUpperCase()}
              </div>
              <span style={{ color: '#1A1A1A', fontSize: '0.875rem', fontWeight: 500, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {tenant.ownerName || tenant.email}
              </span>
              <ChevronDown size={14} style={{ color: '#9CA3AF' }} />
            </button>
          </div>
        </header>

        {/* Content area */}
        {section === 'inspection' ? (
          <div className="flex-1 overflow-hidden">
            <InspectionModule />
          </div>
        ) : (
          <main className="flex-1 p-4 lg:p-6 xl:p-8 overflow-auto">
            {section === 'home' && <OverviewSection tenant={tenant} plan={plan} onNavigate={setSection} />}
            {section === 'bookings' && <BookingModule />}
            {section === 'fieldservice' && <FieldServiceModule />}
            {section === 'distributors' && <DistributorModule />}
            {section === 'marketing'       && <MarketingModule />}
            {section === 'notifications'   && <NotificationsModule />}
            {section === 'reporting'       && <ReportingModule />}
            {section === 'branding'        && <BrandingModule currentPlan={plan} />}
            {section === 'billing'         && <BillingModule currentPlan={plan} onPlanChange={p => setPlan(p)} />}
            {section === 'storefront' && <CartCheckoutPage />}
            {section === 'orders' && <RefundManager />}
            {section === 'settings' && <SettingsPage planTier={plan} />}
            {section === 'plan' && <PlanManagement currentPlan={plan} onPlanChange={p => setPlan(p)} />}
            {section === 'import' && <DataImportPage />}
            {section === 'lifecycle' && <LifecycleManagement />}
            {section === 'fleet'     && <FleetModule />}
            {section === 'recall'    && <RecallModule />}
            {section === 'tires'           && <TiresModule />}
            {section === 'recurring-plans' && <RecurringPlansModule />}
            {section === 'open-platform'   && <OpenPlatformModule />}
            {section === 'banking'         && <BankingModule tenant={tenant} />}
            {section === 'insurance'       && <InsuranceModule tenant={tenant} />}
          </main>
        )}
      </div>
    </div>
  );
}

function OverviewSection({ tenant, plan, onNavigate }: { tenant: TenantData; plan: PlanTier; onNavigate: (s: DashboardSection) => void }) {
  const slug = tenant.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 20) || 'yourshop';

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="mb-6">
        <h1 style={{ fontFamily: 'Sora, sans-serif', color: '#1A1A1A', fontSize: '1.5rem', fontWeight: 700 }}>
          Welcome back, {tenant.ownerName || tenant.businessName}! 👋
        </h1>
        <p style={{ color: '#6B7280', marginTop: '4px', fontSize: '0.9375rem' }}>
          Your storefront is live at <span style={{ color: '#00A9AC', fontWeight: 600 }}>{slug}.fb-business-connect.app</span>
        </p>
      </div>

      {/* Status bar */}
      <div className="rounded-[8px] p-4 mb-6 flex items-center gap-3" style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0' }}>
        <CheckCircle2 size={20} style={{ color: '#27AE60', shrink: 0 }} />
        <div>
          <p style={{ color: '#15803D', fontWeight: 600, fontSize: '0.9375rem' }}>Storefront is live</p>
          <p style={{ color: '#6B7280', fontSize: '0.8125rem' }}>Email verified · Stripe connected · Distributor syncing</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Customers', value: '0', sub: 'Import to get started', color: '#00A9AC', action: () => onNavigate('import') },
          { label: 'Active SKUs', value: '1,247', sub: 'From your distributor', color: '#27AE60', action: null },
          { label: 'Plan', value: plan.charAt(0).toUpperCase() + plan.slice(1), sub: 'Active subscription', color: PLAN_COLOR[plan], action: () => onNavigate('billing') },
          { label: 'Lifecycle', value: 'Active', sub: 'Storefront visible', color: '#27AE60', action: () => onNavigate('lifecycle') },
        ].map(stat => (
          <button
            key={stat.label}
            onClick={stat.action || undefined}
            className={`bg-white rounded-[8px] p-4 text-left ${stat.action ? 'cursor-pointer hover:shadow-md' : ''} transition-all`}
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}
          >
            <p style={{ color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
            <p style={{ color: stat.color, fontWeight: 700, fontSize: '1.375rem', fontFamily: 'Sora, sans-serif', marginTop: '4px' }}>{stat.value}</p>
            <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '2px' }}>{stat.sub}</p>
          </button>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: 'Bookings & Schedule', desc: 'Manage appointments, parts-aware scheduling, and technician availability', icon: '📅', action: () => onNavigate('bookings'), cta: 'Open Scheduling' },
          { title: 'Field Service Operations', desc: 'Dispatch board, technician PWA, invoicing, truck inventory, and GPS tracking', icon: '🔧', action: () => onNavigate('fieldservice'), cta: 'Open Field Service' },
          { title: 'Distributor Integration', desc: 'Live API (ATD, TireHub), catalog feeds, webhook events, and supplier performance', icon: '🚚', action: () => onNavigate('distributors'), cta: 'Open Distributors' },
          { title: 'Cart & Checkout', desc: 'Preview the customer-facing cart, checkout, and payment flow', icon: '🛒', action: () => onNavigate('storefront'), cta: 'Open Storefront' },
          { title: 'Marketing & Campaigns', desc: 'Segments, email/SMS campaigns, reviews, referrals, GBP, LSA, and web analytics', icon: '📣', action: () => onNavigate('marketing'), cta: 'Open Marketing' },
          { title: 'Notifications',   desc: 'Delivery engine, templates, reminders, waitlist, follow-ups, and two-way SMS inbox', icon: '🔔', action: () => onNavigate('notifications'), cta: 'Open Notifications' },
          { title: 'Billing & Plan', desc: 'Subscription, SMS usage, Stripe Connect payouts, invoices, and capability gates', icon: '💳', action: () => onNavigate('billing'),       cta: 'Open Billing' },
          { title: 'Reporting & Analytics', desc: 'Live ops, revenue trends, KPIs, customer cohorts, funnel, leaderboard, and platform observability', icon: '📊', action: () => onNavigate('reporting'), cta: 'Open Reporting' },
          { title: 'White-Label Branding', desc: 'Logo, colors, custom domain + SSL, email sender DKIM/SPF/DMARC, and brand consistency across all touchpoints', icon: '🎨', action: () => onNavigate('branding'), cta: 'Open Branding' },
          { title: 'Import Customer Data', desc: 'Upload your existing customer list from CSV or XLSX', icon: '📋', action: () => onNavigate('import'), cta: 'Start Import' },
          { title: 'Service Plans & Memberships', desc: 'Recurring membership plans, per-vehicle enrollment, entitlement consumption, and subscription P&L', icon: '🔄', action: () => onNavigate('recurring-plans'), cta: 'Open Plans' },
          { title: 'Open Platform', desc: 'REST API, webhooks, Zapier, visual workflow automation, and developer portal', icon: '🔌', action: () => onNavigate('open-platform'), cta: 'Open Platform' },
        ].map(item => (
          <div key={item.title} className="bg-white rounded-[8px] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
            <span style={{ fontSize: '1.75rem' }}>{item.icon}</span>
            <h3 style={{ color: '#1A1A1A', fontWeight: 600, marginTop: '12px', fontSize: '1rem' }}>{item.title}</h3>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px', lineHeight: 1.5 }}>{item.desc}</p>
            <button
              onClick={item.action}
              className="mt-4 px-4 py-2 rounded-[6px] text-white transition-colors text-sm font-semibold"
              style={{ background: '#00A9AC' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#007F82')}
              onMouseLeave={e => (e.currentTarget.style.background = '#00A9AC')}
            >
              {item.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Incomplete items notice */}
      <div className="mt-6 rounded-[8px] p-4 flex items-start gap-3" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
        <AlertTriangle size={18} style={{ color: '#F39C12', marginTop: '2px', shrink: 0 }} />
        <div>
          <p style={{ color: '#92400E', fontWeight: 600, fontSize: '0.9375rem' }}>A few things to complete</p>
          <ul className="mt-2 space-y-1">
            {['Import your customer database to send campaigns', 'Invite your technicians and staff to the platform', 'Review and adjust pricing from your distributor catalog'].map(item => (
              <li key={item} style={{ color: '#92400E', fontSize: '0.875rem' }}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

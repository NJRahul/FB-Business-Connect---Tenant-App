import { useState } from 'react';
import { Zap, CheckCircle2, ExternalLink, ChevronRight, ArrowRight } from 'lucide-react';

const TRIGGERS = [
  { id: 'zt-1', name: 'New Booking',         desc: 'Fires when a booking is created.',                event: 'booking.created' },
  { id: 'zt-2', name: 'New Customer',         desc: 'Fires when a customer record is created.',        event: 'customer.created' },
  { id: 'zt-3', name: 'Visit Completed',      desc: 'Fires when a service visit is marked complete.',  event: 'visit.completed' },
  { id: 'zt-4', name: 'Invoice Paid',         desc: 'Fires when an invoice is paid.',                  event: 'invoice.paid' },
  { id: 'zt-5', name: 'Recommendation Approved', desc: 'Fires when a customer approves a recommendation.', event: 'recommendation.approved' },
  { id: 'zt-6', name: 'Inspection Completed', desc: 'Fires when an inspection report is finalized.',   event: 'inspection.completed' },
  { id: 'zt-7', name: 'Fleet Session Closed', desc: 'Fires when a fleet billing session closes.',      event: 'fleet.session_closed' },
  { id: 'zt-8', name: 'Plan Enrolled',        desc: 'Fires when a customer enrolls in a service plan.',event: 'plan.enrolled' },
  { id: 'zt-9', name: 'Plan Renewed',         desc: 'Fires when a membership auto-renews.',            event: 'plan.renewed' },
  { id: 'zt-10', name: 'Campaign Result',     desc: 'Fires when a campaign finishes sending.',         event: 'campaign.completed' },
];

const ACTIONS = [
  { id: 'za-1', name: 'Create Customer',       desc: 'Add a new customer to TDForge.',            scope: 'customers:write' },
  { id: 'za-2', name: 'Create Vehicle',        desc: 'Register a vehicle on a customer record.',  scope: 'vehicles:write' },
  { id: 'za-3', name: 'Create Booking',        desc: 'Schedule a service appointment.',           scope: 'bookings:write' },
  { id: 'za-4', name: 'Send SMS/Email via Campaign', desc: 'Trigger a campaign message to a customer.', scope: 'communications:write' },
  { id: 'za-5', name: 'Update Customer Fields', desc: 'Update notes, tags, or custom fields.',    scope: 'customers:write' },
  { id: 'za-6', name: 'Add Note to Customer',  desc: 'Append a note to the customer timeline.',   scope: 'customers:write' },
  { id: 'za-7', name: 'Create Estimate',       desc: 'Draft a service estimate for a customer.',  scope: 'visits:write' },
  { id: 'za-8', name: 'Add Recommendation',    desc: 'Add a service recommendation to a vehicle.',scope: 'vehicles:write' },
];

const EXAMPLE_ZAPS = [
  {
    from: 'TDForge: Visit Completed',
    to: 'HubSpot: Update Contact',
    desc: 'Keep CRM in sync — update last service date and spend after every visit.',
  },
  {
    from: 'TDForge: Inspection Completed',
    to: 'Slack: Send Message',
    desc: 'Alert the service team in Slack when a critical inspection finding is filed.',
  },
  {
    from: 'Google Forms: New Response',
    to: 'TDForge: Create Booking',
    desc: 'Let customers book via a Google Form and automatically create the appointment.',
  },
  {
    from: 'TDForge: Plan Enrolled',
    to: 'QuickBooks: Create Invoice',
    desc: 'Mirror membership enrollments into QuickBooks for accounting.',
  },
];

export function ZapierView() {
  const [connected] = useState(true);
  const [activeTab, setActiveTab] = useState<'triggers' | 'actions' | 'examples'>('triggers');

  return (
    <div>
      {/* Connection status */}
      <div className="flex items-center justify-between mb-5 p-4 rounded-[10px]" style={{ background: connected ? '#F0FDF4' : '#FFF7ED', border: `1px solid ${connected ? '#BBF7D0' : '#FED7AA'}` }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#FF4A00' }}>
            <Zap size={18} color="#fff" fill="#fff" />
          </div>
          <div>
            <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>Zapier Integration</p>
            <p style={{ color: connected ? '#16A34A' : '#D97706', fontSize: '0.8125rem', fontWeight: 600 }}>
              {connected ? '✓ Connected — OAuth 2.0 authorized' : 'Not connected — click to install'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {connected && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: '#DCFCE7', color: '#16A34A' }}>
              All Tiers
            </span>
          )}
          <a
            href="#"
            className="flex items-center gap-2 px-4 py-2 rounded-[8px] text-sm font-semibold text-white"
            style={{ background: '#FF4A00' }}
          >
            <ExternalLink size={13} />
            {connected ? 'Manage in Zapier' : 'Connect Zapier'}
          </a>
        </div>
      </div>

      {/* About */}
      <div className="mb-5 p-4 rounded-[10px]" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
        <p style={{ color: '#374151', fontSize: '0.9375rem', lineHeight: 1.7 }}>
          TDForge is published in the <strong>Zapier public app directory</strong> — no private invite required. Authenticate with your TDForge account via OAuth 2.0, and each Zap is scoped to your permissions within your shop. Zapier triggers use the same webhook infrastructure as your registered endpoints.
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-[8px] w-fit" style={{ background: '#F3F4F6' }}>
        {(['triggers', 'actions', 'examples'] as const).map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className="px-4 py-1.5 rounded-[6px] text-sm font-semibold"
            style={{ background: activeTab === t ? '#fff' : 'transparent', color: activeTab === t ? '#1A1A1A' : '#6B7280', boxShadow: activeTab === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'triggers' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TRIGGERS.map(t => (
            <div key={t.id} className="bg-white rounded-[10px] p-4" style={{ border: '1px solid #E5E7EB' }}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-[6px] flex items-center justify-center shrink-0 mt-0.5" style={{ background: '#FFF7ED' }}>
                  <Zap size={14} style={{ color: '#FF4A00' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>{t.name}</p>
                  <p style={{ color: '#6B7280', fontSize: '0.8125rem', marginTop: '2px' }}>{t.desc}</p>
                  <code style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#C0392B', marginTop: '6px', display: 'block' }}>{t.event}</code>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'actions' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ACTIONS.map(a => (
            <div key={a.id} className="bg-white rounded-[10px] p-4" style={{ border: '1px solid #E5E7EB' }}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-[6px] flex items-center justify-center shrink-0 mt-0.5" style={{ background: '#FDEDEC' }}>
                  <ArrowRight size={14} style={{ color: '#C0392B' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>{a.name}</p>
                  <p style={{ color: '#6B7280', fontSize: '0.8125rem', marginTop: '2px' }}>{a.desc}</p>
                  <code style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#1D4ED8', marginTop: '6px', display: 'block' }}>{a.scope}</code>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'examples' && (
        <div className="space-y-3">
          {EXAMPLE_ZAPS.map((z, i) => (
            <div key={i} className="bg-white rounded-[10px] p-4 flex items-center gap-4" style={{ border: '1px solid #E5E7EB' }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: '#FFF7ED', color: '#FF4A00', whiteSpace: 'nowrap' }}>
                    {z.from}
                  </span>
                  <ChevronRight size={14} style={{ color: '#D1D5DB', flexShrink: 0 }} />
                  <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: '#F0FDF4', color: '#16A34A', whiteSpace: 'nowrap' }}>
                    {z.to}
                  </span>
                </div>
                <p style={{ color: '#6B7280', fontSize: '0.8125rem' }}>{z.desc}</p>
              </div>
              <button className="flex items-center gap-1 text-xs font-semibold shrink-0" style={{ color: '#FF4A00' }}>
                <ExternalLink size={12} /> Use this Zap
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Auth note */}
      <div className="mt-5 p-3 rounded-[8px] flex items-start gap-2" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
        <CheckCircle2 size={14} style={{ color: '#1D4ED8', marginTop: '2px', flexShrink: 0 }} />
        <p style={{ color: '#1E40AF', fontSize: '0.8125rem' }}>
          <strong>OAuth 2.0 with tenant approval at install.</strong> Each Zap is scoped to the authorizing user's permissions. Revoking the Zapier OAuth client from Settings immediately disconnects all Zaps.
        </p>
      </div>
    </div>
  );
}

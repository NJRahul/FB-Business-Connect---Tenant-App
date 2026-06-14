import { useState } from 'react';
import {
  Building2, MapPin, Clock, Globe, Calendar, Plus, X, CheckCircle2,
  AlertCircle, Lock, ChevronDown
} from 'lucide-react';

type PlanTier = 'starter' | 'pro' | 'enterprise';

interface SettingsPageProps {
  planTier: PlanTier;
}

type SettingsTab = 'profile' | 'service-area' | 'hours' | 'timezone' | 'holidays';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const US_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
];

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

const DEFAULT_HOURS: Record<string, { open: string; close: string; closed: boolean }> = {
  Monday: { open: '08:00', close: '17:00', closed: false },
  Tuesday: { open: '08:00', close: '17:00', closed: false },
  Wednesday: { open: '08:00', close: '17:00', closed: false },
  Thursday: { open: '08:00', close: '17:00', closed: false },
  Friday: { open: '08:00', close: '17:00', closed: false },
  Saturday: { open: '09:00', close: '15:00', closed: false },
  Sunday: { open: '00:00', close: '00:00', closed: true },
};

const FEDERAL_HOLIDAYS = [
  "New Year's Day — Jan 1",
  "Martin Luther King Jr. Day — Jan 20",
  "Presidents' Day — Feb 17",
  "Memorial Day — May 26",
  "Juneteenth — Jun 19",
  "Independence Day — Jul 4",
  "Labor Day — Sep 1",
  "Columbus Day — Oct 13",
  "Veterans Day — Nov 11",
  "Thanksgiving Day — Nov 27",
  "Christmas Day — Dec 25",
];

const inputStyle = {
  border: '1.5px solid #E5E7EB',
  borderRadius: '6px',
  padding: '8px 12px',
  fontSize: '0.9375rem',
  color: '#1A1A1A',
  width: '100%',
  outline: 'none',
  background: '#fff',
};

export function SettingsPage({ planTier }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const [profile, setProfile] = useState({
    businessName: 'Acme Tire & Auto',
    ownerName: 'John Smith',
    legalEntity: 'LLC',
    ein: '',
    address: '123 Main St',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    phone: '(512) 555-0100',
    supportEmail: 'support@acmetire.com',
  });

  const [serviceZips, setServiceZips] = useState<string[]>(['78701', '78702', '78703', '78704', '78705']);
  const [zipInput, setZipInput] = useState('');
  const [hours, setHours] = useState(DEFAULT_HOURS);
  const [timezone, setTimezone] = useState('America/Chicago');
  const [holidays, setHolidays] = useState<string[]>(FEDERAL_HOLIDAYS.slice(0, 5));
  const [customHoliday, setCustomHoliday] = useState('');

  const handleSave = async () => {
    setSaveStatus('saving');
    await new Promise(r => setTimeout(r, 900));
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  const tabs: { id: SettingsTab; label: string; icon: typeof Building2 }[] = [
    { id: 'profile', label: 'Business Profile', icon: Building2 },
    { id: 'service-area', label: 'Service Area', icon: MapPin },
    { id: 'hours', label: 'Business Hours', icon: Clock },
    { id: 'timezone', label: 'Time Zone', icon: Globe },
    { id: 'holidays', label: 'Holidays', icon: Calendar },
  ];

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="mb-6">
        <h1 style={{ fontFamily: 'Sora, sans-serif', color: '#1A1A1A', fontSize: '1.5rem', fontWeight: 700 }}>Settings</h1>
        <p style={{ color: '#6B7280', fontSize: '0.9375rem', marginTop: '4px' }}>Manage your business configuration and preferences</p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 mb-6 border-b overflow-x-auto" style={{ borderColor: '#E5E7EB' }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-3 whitespace-nowrap border-b-2 transition-colors"
              style={{
                borderColor: active ? '#C0392B' : 'transparent',
                color: active ? '#C0392B' : '#6B7280',
                fontWeight: active ? 600 : 400,
                fontSize: '0.9375rem',
                marginBottom: '-1px',
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="max-w-2xl">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <h3 style={{ color: '#1A1A1A', fontWeight: 600, marginBottom: '16px' }}>Business Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Business Name</label>
                  <input
                    value={profile.businessName}
                    onChange={e => setProfile(p => ({ ...p, businessName: e.target.value }))}
                    style={{ ...inputStyle, marginTop: '6px', display: 'block' }}
                  />
                </div>
                <div>
                  <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Legal Entity</label>
                  <select
                    value={profile.legalEntity}
                    onChange={e => setProfile(p => ({ ...p, legalEntity: e.target.value }))}
                    style={{ ...inputStyle, marginTop: '6px', display: 'block', appearance: 'none', cursor: 'pointer' }}
                  >
                    {['Sole Proprietorship', 'LLC', 'S-Corp', 'C-Corp', 'Partnership'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>EIN (Encrypted)</label>
                  <div className="relative mt-1.5">
                    <input
                      type="password"
                      value={profile.ein}
                      onChange={e => setProfile(p => ({ ...p, ein: e.target.value }))}
                      style={{ ...inputStyle, display: 'block' }}
                      placeholder="XX-XXXXXXX"
                    />
                    <Lock size={12} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Street Address</label>
                  <input
                    value={profile.address}
                    onChange={e => setProfile(p => ({ ...p, address: e.target.value }))}
                    style={{ ...inputStyle, marginTop: '6px', display: 'block' }}
                  />
                </div>
                <div>
                  <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>City</label>
                  <input
                    value={profile.city}
                    onChange={e => setProfile(p => ({ ...p, city: e.target.value }))}
                    style={{ ...inputStyle, marginTop: '6px', display: 'block' }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>State</label>
                    <select
                      value={profile.state}
                      onChange={e => setProfile(p => ({ ...p, state: e.target.value }))}
                      style={{ ...inputStyle, marginTop: '6px', display: 'block', appearance: 'none', cursor: 'pointer' }}
                    >
                      {US_STATES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>ZIP</label>
                    <input
                      value={profile.zip}
                      onChange={e => setProfile(p => ({ ...p, zip: e.target.value }))}
                      style={{ ...inputStyle, marginTop: '6px', display: 'block' }}
                      maxLength={5}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Phone</label>
                  <input
                    value={profile.phone}
                    onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                    style={{ ...inputStyle, marginTop: '6px', display: 'block' }}
                  />
                </div>
                <div>
                  <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Support Email</label>
                  <input
                    value={profile.supportEmail}
                    onChange={e => setProfile(p => ({ ...p, supportEmail: e.target.value }))}
                    style={{ ...inputStyle, marginTop: '6px', display: 'block' }}
                  />
                </div>
              </div>
            </div>

            {/* Per-location hours — Pro/Enterprise only */}
            <div className="rounded-[8px] p-5" style={{ background: planTier === 'starter' ? '#F9FAFB' : '#fff', border: '1.5px solid #E5E7EB', position: 'relative', opacity: planTier === 'starter' ? 0.75 : 1 }}>
              <div className="flex items-center justify-between mb-2">
                <h3 style={{ color: '#1A1A1A', fontWeight: 600 }}>Per-Location Hours</h3>
                {planTier === 'starter' && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-[4px]" style={{ background: '#F3F4F6', color: '#6B7280', fontSize: '0.75rem', fontWeight: 600 }}>
                    <Lock size={11} />
                    Available on Pro / Enterprise
                  </span>
                )}
              </div>
              <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                Set different business hours for each physical location independently.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'service-area' && (
          <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h3 style={{ color: '#1A1A1A', fontWeight: 600, marginBottom: '4px' }}>Service Area ZIP Codes</h3>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '20px' }}>
              Customers outside your service area see a contact prompt instead of booking.
            </p>
            <div className="flex gap-2 mb-4">
              <input
                value={zipInput}
                onChange={e => setZipInput(e.target.value.replace(/\D/g, '').slice(0, 5))}
                onKeyDown={e => {
                  if (e.key === 'Enter' && zipInput.length === 5 && !serviceZips.includes(zipInput)) {
                    setServiceZips(z => [...z, zipInput]);
                    setZipInput('');
                  }
                }}
                style={{ ...inputStyle, width: '140px', flex: 'none' }}
                placeholder="ZIP code"
              />
              <button
                onClick={() => {
                  if (zipInput.length === 5 && !serviceZips.includes(zipInput)) {
                    setServiceZips(z => [...z, zipInput]);
                    setZipInput('');
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-[6px] text-white"
                style={{ background: '#C0392B', fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap' }}
              >
                <Plus size={14} /> Add ZIP
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {serviceZips.map(zip => (
                <span key={zip} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px]" style={{ background: '#FDEDEC', color: '#C0392B', fontWeight: 600, fontSize: '0.875rem' }}>
                  <MapPin size={12} />
                  {zip}
                  <button onClick={() => setServiceZips(z => z.filter(v => v !== zip))}>
                    <X size={12} style={{ color: '#F5B7B1' }} />
                  </button>
                </span>
              ))}
            </div>
            <p className="mt-4" style={{ color: '#27AE60', fontSize: '0.8125rem', fontWeight: 500 }}>
              ✓ Serving {serviceZips.length} ZIP codes
            </p>
          </div>
        )}

        {activeTab === 'hours' && (
          <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h3 style={{ color: '#1A1A1A', fontWeight: 600, marginBottom: '16px' }}>Business Hours</h3>
            <div className="space-y-3">
              {DAYS.map(day => {
                const h = hours[day];
                return (
                  <div key={day} className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                    <div className="w-24 shrink-0">
                      <span style={{ color: '#1A1A1A', fontWeight: 500, fontSize: '0.9375rem' }}>{day.slice(0, 3)}</span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={!h.closed}
                        onChange={e => setHours(prev => ({ ...prev, [day]: { ...h, closed: !e.target.checked } }))}
                        className="w-4 h-4"
                        style={{ accentColor: '#C0392B' }}
                      />
                      <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>Open</span>
                    </label>
                    {!h.closed ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="time"
                          value={h.open}
                          onChange={e => setHours(prev => ({ ...prev, [day]: { ...h, open: e.target.value } }))}
                          style={{ ...inputStyle, width: 'auto', padding: '6px 10px', fontSize: '0.875rem' }}
                        />
                        <span style={{ color: '#9CA3AF' }}>–</span>
                        <input
                          type="time"
                          value={h.close}
                          onChange={e => setHours(prev => ({ ...prev, [day]: { ...h, close: e.target.value } }))}
                          style={{ ...inputStyle, width: 'auto', padding: '6px 10px', fontSize: '0.875rem' }}
                        />
                      </div>
                    ) : (
                      <span style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Closed</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'timezone' && (
          <div className="space-y-4">
            <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <h3 style={{ color: '#1A1A1A', fontWeight: 600, marginBottom: '4px' }}>Time Zone</h3>
              <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '20px' }}>
                Used for business hours display, booking slots, and scheduled campaigns.
              </p>
              <div className="space-y-2">
                {US_TIMEZONES.map(tz => (
                  <label
                    key={tz.value}
                    className="flex items-center gap-3 p-4 rounded-[8px] cursor-pointer transition-colors"
                    style={{
                      border: timezone === tz.value ? '2px solid #C0392B' : '2px solid #E5E7EB',
                      background: timezone === tz.value ? '#FDEDEC' : '#fff',
                    }}
                  >
                    <input
                      type="radio"
                      name="timezone"
                      value={tz.value}
                      checked={timezone === tz.value}
                      onChange={() => setTimezone(tz.value)}
                      style={{ accentColor: '#C0392B' }}
                    />
                    <div>
                      <p style={{ color: '#1A1A1A', fontWeight: timezone === tz.value ? 600 : 400, fontSize: '0.9375rem' }}>
                        {tz.label}
                      </p>
                      <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '2px' }}>{tz.value}</p>
                    </div>
                    {timezone === tz.value && (
                      <CheckCircle2 size={18} style={{ color: '#C0392B', marginLeft: 'auto' }} />
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'holidays' && (
          <div className="space-y-4">
            <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <h3 style={{ color: '#1A1A1A', fontWeight: 600, marginBottom: '4px' }}>Holiday Calendar</h3>
              <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '20px' }}>
                Selected holidays will close your booking calendar. Customers will see a "closed" message.
              </p>
              <div className="space-y-2 mb-5">
                {FEDERAL_HOLIDAYS.map(h => {
                  const checked = holidays.includes(h);
                  return (
                    <label
                      key={h}
                      className="flex items-center gap-3 py-2.5 px-4 rounded-[6px] cursor-pointer transition-colors"
                      style={{ background: checked ? '#FDEDEC' : '#F9FAFB', border: `1px solid ${checked ? '#F5B7B1' : '#E5E7EB'}` }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => setHolidays(prev => checked ? prev.filter(v => v !== h) : [...prev, h])}
                        style={{ accentColor: '#C0392B' }}
                      />
                      <span style={{ color: '#1A1A1A', fontSize: '0.9375rem', fontWeight: checked ? 500 : 400 }}>{h}</span>
                    </label>
                  );
                })}
              </div>

              <div className="border-t pt-4" style={{ borderColor: '#E5E7EB' }}>
                <label style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 600 }}>Add Custom Holiday</label>
                <div className="flex gap-2 mt-2">
                  <input
                    value={customHoliday}
                    onChange={e => setCustomHoliday(e.target.value)}
                    style={{ ...inputStyle, flex: 1 }}
                    placeholder="e.g., Local Festival — Aug 15"
                  />
                  <button
                    onClick={() => {
                      if (customHoliday.trim()) {
                        setHolidays(prev => [...prev, customHoliday.trim()]);
                        setCustomHoliday('');
                      }
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-[6px] text-white"
                    style={{ background: '#C0392B', fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap' }}
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save button */}
        <div className="flex items-center justify-between mt-6">
          <div>
            {saveStatus === 'saved' && (
              <div className="flex items-center gap-2" style={{ color: '#27AE60' }}>
                <CheckCircle2 size={16} />
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Changes saved</span>
              </div>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="flex items-center gap-2 px-6 py-2.5 rounded-[6px] text-white transition-colors"
            style={{ background: saveStatus === 'saving' ? '#9CA3AF' : '#C0392B', fontWeight: 600, fontSize: '0.9375rem' }}
            onMouseEnter={e => { if (saveStatus !== 'saving') e.currentTarget.style.background = '#A93226'; }}
            onMouseLeave={e => { if (saveStatus !== 'saving') e.currentTarget.style.background = '#C0392B'; }}
          >
            {saveStatus === 'saving' ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
            ) : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

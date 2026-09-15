import { useState } from 'react';
import { Building2, ShieldCheck, CreditCard, ArrowRight, Mail, CheckCircle2, Clock } from 'lucide-react';
import { PartnerBankDisclosure } from './PartnerBankDisclosure';
import { FEE_SCHEDULE } from './mockData';

interface Props {
  hasEIN: boolean;
  isUS: boolean;
  onGetStarted: () => void;
  onSkipToDemo?: () => void;
}

export function BankingIntro({ hasEIN, isUS, onGetStarted, onSkipToDemo }: Props) {
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  const eligible = hasEIN && isUS;

  if (!eligible) {
    return (
      <div className="flex flex-col" style={{ minHeight: '100%' }}>
        <div className="flex-1 flex items-center justify-center p-8">
          <div style={{ maxWidth: 480, width: '100%' }}>
            <div className="rounded-[10px] p-8 text-center" style={{ background: '#fff', border: '1.5px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#F3F4F6' }}>
                <Clock size={28} style={{ color: '#6B7280' }} />
              </div>
              <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.25rem', fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>
                Not available in your region yet
              </h2>
              <p style={{ color: '#6B7280', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: 24 }}>
                {!isUS
                  ? 'FB Business Connect Banking is currently available to South Africa-based businesses only.'
                  : 'A CIPC Registration Number is required to open a business bank account.'}
                {' '}Join the waitlist and we'll notify you when it's ready.
              </p>
              {waitlistSubmitted ? (
                <div className="flex items-center gap-2 justify-center p-3 rounded-[8px]" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                  <CheckCircle2 size={18} style={{ color: '#27AE60' }} />
                  <span style={{ color: '#15803D', fontWeight: 600, fontSize: '0.9375rem' }}>You're on the list!</span>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={waitlistEmail}
                    onChange={e => setWaitlistEmail(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-[6px] text-sm"
                    style={{ border: '1px solid #E5E7EB', fontSize: '0.9375rem', outline: 'none' }}
                  />
                  <button
                    onClick={() => waitlistEmail && setWaitlistSubmitted(true)}
                    className="px-4 py-2 rounded-[6px] font-semibold text-sm"
                    style={{ background: '#1A1A1A', color: '#fff' }}
                  >
                    Join waitlist
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <PartnerBankDisclosure />
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ minHeight: '100%' }}>
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div style={{ maxWidth: 760, margin: '0 auto' }}>

          {/* Hero */}
          <div className="rounded-[12px] p-8 mb-6 text-center" style={{ background: '#1A1A1A', color: '#fff' }}>
            <div className="w-16 h-16 rounded-[12px] flex items-center justify-center mx-auto mb-4" style={{ background: '#00A9AC' }}>
              <Building2 size={32} color="#fff" />
            </div>
            <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.75rem', fontWeight: 700, marginBottom: 8 }}>
              FB Business Connect Business Banking
            </h1>
            <p style={{ color: '#9CA3AF', fontSize: '1rem', lineHeight: 1.65, maxWidth: 520, margin: '0 auto' }}>
              A business bank account built into your shop platform. Receive payouts directly, spend with controlled technician cards, and reconcile everything automatically.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              { icon: Building2,   title: 'SARB-Regulated Account', desc: 'Business cheque account with branch code & account number, covered under the Deposit Insurance Scheme (DIS).' },
              { icon: CreditCard,  title: 'Technician Cards',      desc: 'Issue virtual and physical cards per tech or truck with configurable spend controls.' },
              { icon: ShieldCheck, title: 'Auto-Reconciliation',   desc: 'Card spend matched to visit IDs, purchase orders, and invoices automatically.' },
            ].map(f => (
              <div key={f.title} className="rounded-[10px] p-5" style={{ background: '#fff', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div className="w-10 h-10 rounded-[8px] flex items-center justify-center mb-3" style={{ background: '#F3F4F6' }}>
                  <f.icon size={20} style={{ color: '#1A1A1A' }} />
                </div>
                <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem', marginBottom: 4 }}>{f.title}</p>
                <p style={{ color: '#6B7280', fontSize: '0.8125rem', lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Fee schedule */}
          <div className="rounded-[10px] mb-6 overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
            <div className="px-5 py-3 border-b" style={{ borderColor: '#E5E7EB', background: '#F9FAFB' }}>
              <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>Fee schedule</p>
            </div>
            <div className="divide-y" style={{ borderColor: '#F3F4F6' }}>
              {FEE_SCHEDULE.map(row => (
                <div key={row.feature} className="flex items-center justify-between px-5 py-3" style={{ background: '#fff' }}>
                  <span style={{ color: '#1A1A1A', fontSize: '0.9375rem' }}>{row.feature}</span>
                  <span style={{ fontWeight: 600, color: row.fee === 'Free' || row.fee === 'Included' ? '#27AE60' : '#1A1A1A', fontSize: '0.9375rem' }}>
                    {row.fee}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* What you'll need */}
          <div className="rounded-[10px] p-5 mb-6" style={{ background: '#FFF8F8', border: '1px solid #FECACA' }}>
            <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem', marginBottom: 10 }}>What you'll need for the application</p>
            <div className="space-y-2">
              {[
                'CIPC Registration Number',
                'Legal business name and entity type',
                'Business registration province and date',
                'Physical business address (no PO boxes)',
                'Name, date of birth, and SA ID Number for all owners with ≥25% stake',
                'Estimated monthly revenue',
              ].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 size={15} style={{ color: '#27AE60', flexShrink: 0 }} />
                  <span style={{ color: '#374151', fontSize: '0.9375rem' }}>{item}</span>
                </div>
              ))}
            </div>
            <p style={{ marginTop: 10, color: '#6B7280', fontSize: '0.8125rem' }}>
              SA ID Numbers are collected securely via our partner's encrypted form — they are never stored on FB Business Connect servers.
            </p>
          </div>

          {/* Estimated time */}
          <div className="flex items-center gap-3 p-4 rounded-[8px] mb-8" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
            <Mail size={18} style={{ color: '#6B7280' }} />
            <p style={{ color: '#6B7280', fontSize: '0.9375rem' }}>
              Most applications are reviewed within <strong style={{ color: '#1A1A1A' }}>1–3 business days</strong>. You'll receive an email notification on every status change.
            </p>
          </div>

          <button
            onClick={onGetStarted}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[8px] font-semibold text-base"
            style={{ background: '#00A9AC', color: '#fff', fontSize: '1rem' }}
          >
            Get started <ArrowRight size={18} />
          </button>

          {onSkipToDemo && (
            <div className="text-center mt-4">
              <button
                onClick={onSkipToDemo}
                style={{ color: '#9CA3AF', fontSize: '0.8125rem', textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none' }}
              >
                Skip to pre-approved demo account →
              </button>
            </div>
          )}
        </div>
      </div>
      <PartnerBankDisclosure />
    </div>
  );
}

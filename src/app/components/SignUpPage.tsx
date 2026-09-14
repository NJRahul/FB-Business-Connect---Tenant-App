import { useState } from 'react';
import { Eye, EyeOff, CheckCircle2, Mail, Wrench, Building2, User, Lock, ChevronRight, Star, Shield, Zap } from 'lucide-react';

type PlanTier = 'starter' | 'pro' | 'enterprise';

interface SignUpForm {
  businessName: string;
  ownerName: string;
  email: string;
  password: string;
  planTier: PlanTier;
}

interface SignUpPageProps {
  onSuccess: (data: SignUpForm) => void;
  onPlatformAdmin?: () => void;
}

const plans = [
  {
    id: 'starter' as PlanTier,
    name: 'Starter',
    price: '$49',
    period: '/mo',
    description: 'Perfect for single-location shops',
    features: ['1 location', '500 customer records', 'Basic tire catalog', 'Email support', 'Standard storefront'],
    icon: Zap,
    color: '#6B7280',
  },
  {
    id: 'pro' as PlanTier,
    name: 'Pro',
    price: '$149',
    period: '/mo',
    description: 'For growing multi-location businesses',
    features: ['Up to 5 locations', 'Unlimited customers', 'Custom pricing & markup', 'Multi-location routing', 'SMS + email campaigns', 'Phone & email support'],
    icon: Star,
    color: '#C0392B',
    popular: true,
  },
  {
    id: 'enterprise' as PlanTier,
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large chains and franchises',
    features: ['Unlimited locations', 'SAML SSO', 'Custom integrations', 'API access', 'Dedicated account manager', 'SLA guarantee'],
    icon: Shield,
    color: '#1A1A1A',
  },
];

const RESERVED_SUBDOMAINS = ['admin', 'api', 'www', 'support', 'billing', 'status'];

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 20);
  return RESERVED_SUBDOMAINS.includes(base) ? `${base}shop` : base;
}

export function SignUpPage({ onSuccess, onPlatformAdmin }: SignUpPageProps) {
  const [form, setForm] = useState<SignUpForm>({
    businessName: '',
    ownerName: '',
    email: '',
    password: '',
    planTier: 'pro',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<SignUpForm>>({});
  const [isLoading, setIsLoading] = useState(false);

  const slug = form.businessName ? generateSlug(form.businessName) : 'yourshop';

  const validate = (): boolean => {
    const e: Partial<SignUpForm> = {};
    if (!form.businessName.trim()) e.businessName = 'Required';
    if (!form.ownerName.trim()) e.ownerName = 'Required';
    if (!form.email.includes('@')) e.email = 'Valid email required';
    if (form.password.length < 10) e.password = 'Minimum 10 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setIsLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #FDEDEC 0%, #fff 60%, #F9FAFB 100%)' }}>
        <div className="bg-white rounded-[8px] shadow-lg p-10 max-w-md w-full text-center" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: '#FDEDEC' }}>
            <Mail size={32} style={{ color: '#C0392B' }} />
          </div>
          <h2 style={{ fontFamily: 'Sora, sans-serif', color: '#1A1A1A' }}>Check your email</h2>
          <p className="mt-3 mb-2" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>
            We sent a verification link to
          </p>
          <p className="mb-6" style={{ color: '#1A1A1A', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
            {form.email}
          </p>
          <div className="rounded-[8px] p-4 mb-6" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
            <p style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem' }}>
              Your shop will be available at:
            </p>
            <p className="mt-1" style={{ color: '#C0392B', fontFamily: 'Sora, sans-serif', fontWeight: 600 }}>
              {slug}.fb-business-connect.app
            </p>
            <p className="mt-2" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem' }}>
              Storefront publishing is locked until your email is verified.
            </p>
          </div>
          <button
            onClick={() => onSuccess(form)}
            className="w-full py-3 rounded-[6px] text-white transition-colors"
            style={{ background: '#C0392B', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
            onMouseEnter={e => (e.currentTarget.style.background = '#A93226')}
            onMouseLeave={e => (e.currentTarget.style.background = '#C0392B')}
          >
            Continue to Setup
          </button>
          <p className="mt-4" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', fontSize: '0.8125rem' }}>
            Didn't receive it?{' '}
            <button className="underline" style={{ color: '#C0392B' }}>Resend email</button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] flex-col justify-between p-10 xl:p-14" style={{ background: 'linear-gradient(160deg, #1A1A1A 0%, #2D0A08 100%)' }}>
        <div>
          <div className="flex items-center gap-3 mb-14">
            <div className="w-10 h-10 rounded-[8px] flex items-center justify-center" style={{ background: '#C0392B' }}>
              <Wrench size={20} color="#fff" />
            </div>
            <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#fff', fontSize: '1.375rem' }}>FB Business Connect</span>
          </div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', color: '#fff', fontSize: '2rem', lineHeight: 1.25, fontWeight: 700 }}>
            The complete platform for tire service shops
          </h1>
          <p className="mt-4" style={{ color: '#9CA3AF', fontSize: '1rem', lineHeight: 1.6 }}>
            Launch your online storefront, manage inventory from distributors, book services, and grow your customer base — all in one place.
          </p>
          <div className="mt-10 space-y-4">
            {[
              { icon: '🏪', title: 'Multi-Tenant Storefronts', desc: 'Your own branded shop at yourshop.fb-business-connect.app' },
              { icon: '📦', title: 'Live Distributor Inventory', desc: 'Sync stock from major tire distributors every 60 min' },
              { icon: '💳', title: 'Stripe Connect Payouts', desc: 'Fast, automated payouts to your bank account' },
              { icon: '📱', title: 'SMS & Email Campaigns', desc: 'Reach customers with targeted promotions' },
            ].map(f => (
              <div key={f.title} className="flex gap-3 items-start">
                <span className="text-xl mt-0.5">{f.icon}</span>
                <div>
                  <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.9375rem' }}>{f.title}</p>
                  <p style={{ color: '#9CA3AF', fontSize: '0.8125rem', marginTop: '2px' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[8px] p-5" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ color: '#fff', fontSize: '0.9375rem', fontStyle: 'italic', lineHeight: 1.6 }}>
            "FB Business Connect cut our booking admin time by 70%. Our techs see their schedule on their phones, customers book online 24/7."
          </p>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#C0392B', color: '#fff', fontWeight: 700, fontSize: '0.875rem' }}>
              MR
            </div>
            <div>
              <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.875rem' }}>Mike Rodriguez</p>
              <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>Rodriguez Tire — 4 locations, TX</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-start justify-center overflow-y-auto p-6 lg:p-10 xl:p-14" style={{ background: '#F9FAFB' }}>
        <div className="w-full max-w-[620px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-[8px] flex items-center justify-center" style={{ background: '#C0392B' }}>
              <Wrench size={18} color="#fff" />
            </div>
            <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.25rem' }}>FB Business Connect</span>
          </div>

          <div className="bg-white rounded-[8px] p-8" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', color: '#1A1A1A', fontSize: '1.5rem', fontWeight: 700 }}>
              Create your account
            </h2>
            <p style={{ color: '#6B7280', marginTop: '4px', fontSize: '0.9375rem' }}>
              Get your tire shop online in minutes.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {/* Business Name */}
              <div>
                <label style={{ color: '#1A1A1A', fontWeight: 600, fontSize: '0.875rem' }}>Business Name</label>
                <div className="relative mt-1.5">
                  <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
                  <input
                    type="text"
                    placeholder="Acme Tire & Auto"
                    value={form.businessName}
                    onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
                    className="w-full pl-9 pr-4 py-2.5 rounded-[6px] outline-none transition-all"
                    style={{
                      border: errors.businessName ? '1.5px solid #E74C3C' : '1.5px solid #E5E7EB',
                      fontSize: '0.9375rem',
                      color: '#1A1A1A',
                    }}
                    onFocus={e => { if (!errors.businessName) e.currentTarget.style.borderColor = '#C0392B'; }}
                    onBlur={e => { if (!errors.businessName) e.currentTarget.style.borderColor = '#E5E7EB'; }}
                  />
                </div>
                {form.businessName && !errors.businessName && (
                  <p style={{ color: '#6B7280', fontSize: '0.75rem', marginTop: '4px' }}>
                    Your URL: <span style={{ color: '#C0392B', fontWeight: 600 }}>{slug}.fb-business-connect.app</span>
                  </p>
                )}
                {errors.businessName && <p style={{ color: '#E74C3C', fontSize: '0.75rem', marginTop: '4px' }}>{errors.businessName}</p>}
              </div>

              {/* Owner Name */}
              <div>
                <label style={{ color: '#1A1A1A', fontWeight: 600, fontSize: '0.875rem' }}>Owner Name</label>
                <div className="relative mt-1.5">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
                  <input
                    type="text"
                    placeholder="John Smith"
                    value={form.ownerName}
                    onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))}
                    className="w-full pl-9 pr-4 py-2.5 rounded-[6px] outline-none transition-all"
                    style={{
                      border: errors.ownerName ? '1.5px solid #E74C3C' : '1.5px solid #E5E7EB',
                      fontSize: '0.9375rem',
                      color: '#1A1A1A',
                    }}
                    onFocus={e => { if (!errors.ownerName) e.currentTarget.style.borderColor = '#C0392B'; }}
                    onBlur={e => { if (!errors.ownerName) e.currentTarget.style.borderColor = '#E5E7EB'; }}
                  />
                </div>
                {errors.ownerName && <p style={{ color: '#E74C3C', fontSize: '0.75rem', marginTop: '4px' }}>{errors.ownerName}</p>}
              </div>

              {/* Email */}
              <div>
                <label style={{ color: '#1A1A1A', fontWeight: 600, fontSize: '0.875rem' }}>Work Email</label>
                <div className="relative mt-1.5">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
                  <input
                    type="email"
                    placeholder="john@acmetire.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full pl-9 pr-4 py-2.5 rounded-[6px] outline-none transition-all"
                    style={{
                      border: errors.email ? '1.5px solid #E74C3C' : '1.5px solid #E5E7EB',
                      fontSize: '0.9375rem',
                      color: '#1A1A1A',
                    }}
                    onFocus={e => { if (!errors.email) e.currentTarget.style.borderColor = '#C0392B'; }}
                    onBlur={e => { if (!errors.email) e.currentTarget.style.borderColor = '#E5E7EB'; }}
                  />
                </div>
                {errors.email && <p style={{ color: '#E74C3C', fontSize: '0.75rem', marginTop: '4px' }}>{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label style={{ color: '#1A1A1A', fontWeight: 600, fontSize: '0.875rem' }}>Password</label>
                <div className="relative mt-1.5">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 10 characters"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full pl-9 pr-10 py-2.5 rounded-[6px] outline-none transition-all"
                    style={{
                      border: errors.password ? '1.5px solid #E74C3C' : '1.5px solid #E5E7EB',
                      fontSize: '0.9375rem',
                      color: '#1A1A1A',
                    }}
                    onFocus={e => { if (!errors.password) e.currentTarget.style.borderColor = '#C0392B'; }}
                    onBlur={e => { if (!errors.password) e.currentTarget.style.borderColor = '#E5E7EB'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: '#9CA3AF' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-2 flex gap-1.5">
                    {[form.password.length >= 10, /[A-Z]/.test(form.password), /[0-9]/.test(form.password), /[^A-Za-z0-9]/.test(form.password)].map((ok, i) => (
                      <div key={i} className="flex-1 h-1 rounded-full" style={{ background: ok ? '#27AE60' : '#E5E7EB' }} />
                    ))}
                  </div>
                )}
                {errors.password && <p style={{ color: '#E74C3C', fontSize: '0.75rem', marginTop: '4px' }}>{errors.password}</p>}
                <p style={{ color: '#6B7280', fontSize: '0.75rem', marginTop: '4px' }}>
                  Min 10 chars, or 12+ chars with mixed case, numbers & symbols
                </p>
              </div>

              {/* Plan Selector */}
              <div>
                <label style={{ color: '#1A1A1A', fontWeight: 600, fontSize: '0.875rem' }}>Choose Your Plan</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                  {plans.map(plan => {
                    const Icon = plan.icon;
                    const selected = form.planTier === plan.id;
                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, planTier: plan.id }))}
                        className="relative rounded-[8px] p-4 text-left transition-all"
                        style={{
                          border: selected ? `2px solid ${plan.color}` : '2px solid #E5E7EB',
                          background: selected ? (plan.id === 'pro' ? '#FDEDEC' : '#F9FAFB') : '#fff',
                        }}
                      >
                        {plan.popular && (
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-white" style={{ background: '#C0392B', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                            MOST POPULAR
                          </span>
                        )}
                        <div className="flex items-center justify-between mb-2">
                          <Icon size={16} style={{ color: plan.color }} />
                          {selected && <CheckCircle2 size={14} style={{ color: plan.color }} />}
                        </div>
                        <p style={{ fontWeight: 700, color: plan.color, fontFamily: 'Sora, sans-serif', fontSize: '0.9375rem' }}>{plan.name}</p>
                        <p style={{ color: '#1A1A1A', fontWeight: 700, fontSize: '1.0625rem', marginTop: '2px' }}>
                          {plan.price}<span style={{ color: '#6B7280', fontWeight: 400, fontSize: '0.75rem' }}>{plan.period}</span>
                        </p>
                        <p style={{ color: '#6B7280', fontSize: '0.6875rem', marginTop: '4px', lineHeight: 1.4 }}>{plan.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-[6px] text-white flex items-center justify-center gap-2 transition-colors mt-2"
                style={{ background: isLoading ? '#E5E7EB' : '#C0392B', fontWeight: 600, fontSize: '0.9375rem' }}
                onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background = '#A93226'; }}
                onMouseLeave={e => { if (!isLoading) e.currentTarget.style.background = '#C0392B'; }}
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating your account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-5 text-center" style={{ color: '#6B7280', fontSize: '0.8125rem' }}>
              By creating an account you agree to our{' '}
              <a href="#" style={{ color: '#C0392B' }}>Terms of Service</a>
              {' '}and{' '}
              <a href="#" style={{ color: '#C0392B' }}>Privacy Policy</a>
            </p>
          </div>

          <p className="mt-4 text-center" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
            Already have an account?{' '}
            <button style={{ color: '#C0392B', fontWeight: 600 }}>Sign in</button>
          </p>
          {onPlatformAdmin && (
            <p className="mt-3 text-center">
              <button onClick={onPlatformAdmin} style={{ fontSize: '0.7rem', color: '#D1D5DB', letterSpacing: '0.06em' }}>
                ⬡ Platform Admin
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

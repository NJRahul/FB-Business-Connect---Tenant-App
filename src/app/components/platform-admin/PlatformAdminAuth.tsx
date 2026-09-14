import { useState } from 'react';
import { Shield, Eye, EyeOff, Loader2, ShieldAlert } from 'lucide-react';

interface Props {
  onAuthenticated: () => void;
}

type AuthStep = 'credentials' | 'mfa';

export function PlatformAdminAuth({ onAuthenticated }: Props) {
  const [step, setStep] = useState<AuthStep>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Email and password are required.'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Accept ops@fb-business-connect.com / any password for demo
      if (email === 'ops@fb-business-connect.com') {
        setStep('mfa');
      } else {
        setError('Invalid credentials. Use ops@fb-business-connect.com for demo.');
      }
    }, 900);
  }

  function handleMfa(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (mfaCode.length !== 6) { setError('Enter the 6-digit code from your authenticator.'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (mfaCode === '123456') {
        onAuthenticated();
      } else {
        setError('Incorrect code. (Demo: use 123456)');
      }
    }, 700);
  }

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#0A0F1E', fontFamily: 'Inter, sans-serif' }}>
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#DC2626' }}>
            <Shield size={28} color="#fff" />
          </div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: '#F9FAFB', letterSpacing: '-0.02em' }}>
            Platform Admin
          </h1>
          <p style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: 4 }}>
            FB Business Connect Internal Operations Console
          </p>
        </div>

        {/* MFA warning banner */}
        <div className="flex items-center gap-2 rounded-lg px-4 py-3 mb-6" style={{ background: '#1F1010', border: '1px solid #3F1515' }}>
          <ShieldAlert size={15} color="#DC2626" />
          <span style={{ fontSize: '0.8rem', color: '#FCA5A5' }}>
            MFA required on every session. Audit-logged.
          </span>
        </div>

        {/* Form card */}
        <div className="rounded-2xl p-8" style={{ background: '#111827', border: '1px solid #1F2937' }}>
          {step === 'credentials' ? (
            <form onSubmit={handleCredentials} className="flex flex-col gap-5">
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Admin Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ops@fb-business-connect.com"
                  autoComplete="username"
                  className="w-full mt-1.5 px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                  style={{
                    background: '#0D1526', border: '1px solid #1F2937', color: '#F9FAFB',
                    fontFamily: 'Inter, sans-serif',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#DC2626')}
                  onBlur={e => (e.target.style.borderColor = '#1F2937')}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Password
                </label>
                <div className="relative mt-1.5">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none pr-10"
                    style={{
                      background: '#0D1526', border: '1px solid #1F2937', color: '#F9FAFB',
                      fontFamily: 'Inter, sans-serif',
                    }}
                    onFocus={e => (e.target.style.borderColor = '#DC2626')}
                    onBlur={e => (e.target.style.borderColor = '#1F2937')}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#6B7280' }}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              {error && <p style={{ fontSize: '0.8rem', color: '#EF4444' }}>{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-opacity"
                style={{ background: '#DC2626', color: '#fff', opacity: loading ? 0.7 : 1 }}>
                {loading ? <Loader2 size={15} className="animate-spin" /> : null}
                {loading ? 'Verifying…' : 'Continue'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleMfa} className="flex flex-col gap-5">
              <div className="text-center mb-2">
                <p style={{ fontSize: '0.9rem', color: '#D1D5DB', fontWeight: 500 }}>Two-Factor Authentication</p>
                <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: 4 }}>
                  Enter the 6-digit code from your authenticator app.
                </p>
                <p style={{ fontSize: '0.75rem', color: '#4B5563', marginTop: 4 }}>(Demo code: 123456)</p>
              </div>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={mfaCode}
                onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                autoFocus
                className="w-full px-4 py-3 rounded-lg text-center text-2xl tracking-widest font-mono outline-none"
                style={{
                  background: '#0D1526', border: '1px solid #1F2937', color: '#F9FAFB',
                  letterSpacing: '0.4em',
                }}
                onFocus={e => (e.target.style.borderColor = '#DC2626')}
                onBlur={e => (e.target.style.borderColor = '#1F2937')}
              />
              {error && <p style={{ fontSize: '0.8rem', color: '#EF4444' }}>{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                style={{ background: '#DC2626', color: '#fff', opacity: loading ? 0.7 : 1 }}>
                {loading ? <Loader2 size={15} className="animate-spin" /> : null}
                {loading ? 'Verifying…' : 'Authenticate'}
              </button>
              <button type="button" onClick={() => { setStep('credentials'); setMfaCode(''); setError(''); }}
                style={{ fontSize: '0.8rem', color: '#6B7280', textAlign: 'center' }}>
                ← Back to login
              </button>
            </form>
          )}
        </div>

        <p style={{ fontSize: '0.75rem', color: '#374151', textAlign: 'center', marginTop: 20 }}>
          All access is monitored and audit-logged. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
}

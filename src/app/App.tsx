import { useState } from 'react';
import { SignUpPage } from './components/SignUpPage';
import { OnboardingWizard } from './components/OnboardingWizard';
import { Dashboard } from './components/Dashboard';
import { PlatformAdminAuth } from './components/platform-admin/PlatformAdminAuth';
import { PlatformAdminConsole } from './components/platform-admin/PlatformAdminConsole';

type PlanTier = 'starter' | 'pro' | 'enterprise';
type AppView = 'signup' | 'onboarding' | 'dashboard' | 'platform-auth' | 'platform-admin';

interface TenantData {
  businessName: string;
  ownerName: string;
  email: string;
  planTier: PlanTier;
}

export default function App() {
  const [view, setView] = useState<AppView>('signup');
  const [tenant, setTenant] = useState<TenantData>({
    businessName: '',
    ownerName: '',
    email: '',
    planTier: 'pro',
  });

  return (
    <div className="size-full" style={{ fontFamily: 'Inter, sans-serif' }}>
      {view === 'signup' && (
        <SignUpPage
          onSuccess={data => {
            setTenant(data);
            setView('onboarding');
          }}
          onPlatformAdmin={() => setView('platform-auth')}
        />
      )}
      {view === 'onboarding' && (
        <OnboardingWizard
          tenant={tenant}
          onComplete={() => setView('dashboard')}
        />
      )}
      {view === 'dashboard' && (
        <Dashboard tenant={tenant} onPlatformAdmin={() => setView('platform-auth')} />
      )}
      {view === 'platform-auth' && (
        <PlatformAdminAuth onAuthenticated={() => setView('platform-admin')} />
      )}
      {view === 'platform-admin' && (
        <PlatformAdminConsole onExit={() => setView(tenant.businessName ? 'dashboard' : 'signup')} />
      )}
    </div>
  );
}

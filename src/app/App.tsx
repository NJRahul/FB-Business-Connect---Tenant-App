import { useState } from 'react';
import { SignUpPage } from './components/SignUpPage';
import { OnboardingWizard } from './components/OnboardingWizard';
import { Dashboard } from './components/Dashboard';

type PlanTier = 'starter' | 'pro' | 'enterprise';
type AppView = 'signup' | 'onboarding' | 'dashboard';

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
        />
      )}
      {view === 'onboarding' && (
        <OnboardingWizard
          tenant={tenant}
          onComplete={() => setView('dashboard')}
        />
      )}
      {view === 'dashboard' && (
        <Dashboard tenant={tenant} />
      )}
    </div>
  );
}

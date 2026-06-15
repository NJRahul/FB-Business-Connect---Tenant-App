import { useState } from 'react';
import { Building2, Calendar, Tag, ShoppingCart, CheckCircle2, Zap, X, UserCheck } from 'lucide-react';
import type { FleetAccount } from './types';
import { MOCK_FLEET_ACCOUNTS } from './mockData';
import { FleetAccountsView } from './FleetAccountsView';
import { FleetDetailView } from './FleetDetailView';
import { FleetSessionView } from './FleetSessionView';
import { FleetSessionsView } from './FleetSessionsView';
import { FleetPricingTiersView } from './FleetPricingTiersView';
import { FleetQuickReorderView } from './FleetQuickReorderView';
import { FleetApprovalsView } from './FleetApprovalsView';

type Tab = 'accounts' | 'sessions' | 'pricing' | 'reorder' | 'approvals';

interface ActAsState {
  accountId: string;
  accountName: string;
  staffName: string;
}

export default function FleetModule() {
  const [tab, setTab] = useState<Tab>('accounts');
  const [selectedAccount, setSelectedAccount] = useState<FleetAccount | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [actAs, setActAs] = useState<ActAsState | null>(null);

  // Act-as-customer selector modal
  const [showActAs, setShowActAs] = useState(false);
  const [actAsAccountId, setActAsAccountId] = useState('');

  function startActAs() {
    const acct = MOCK_FLEET_ACCOUNTS.find(a => a.id === actAsAccountId);
    if (!acct) return;
    setActAs({ accountId: acct.id, accountName: acct.businessName, staffName: 'Service Writer (You)' });
    setShowActAs(false);
  }

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'accounts',  label: 'Fleet Accounts', icon: Building2 },
    { id: 'sessions',  label: 'Fleet Sessions', icon: Calendar },
    { id: 'pricing',   label: 'Pricing Tiers',  icon: Tag },
    { id: 'reorder',   label: 'Quick Re-Order', icon: ShoppingCart },
    { id: 'approvals', label: 'Approvals',       icon: CheckCircle2 },
  ];

  function handleOpenSession(accountId: string) {
    // Find an existing in-progress session for this account, or the first scheduled one
    const existing = MOCK_FLEET_ACCOUNTS.find(a => a.id === accountId);
    setActiveSessionId('ses_001'); // demo: always open the in-progress session
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', minHeight: '100%' }}>
      {/* Act-as-customer banner */}
      {actAs && (
        <div className="flex items-center justify-between px-4 py-2.5 mb-4 rounded-xl"
          style={{ background: '#C0392B', color: '#fff' }}>
          <div className="flex items-center gap-2">
            <Zap size={15} />
            <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Acting as: {actAs.accountName}</span>
            <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>— Storefront showing fleet pricing · Orders tagged to fleet account</span>
          </div>
          <button onClick={() => setActAs(null)} className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}>
            <X size={13} /> Exit Act-As Mode
          </button>
        </div>
      )}

      {/* Session view (full-page) */}
      {activeSessionId && !actAs ? (
        <FleetSessionView sessionId={activeSessionId} onBack={() => setActiveSessionId(null)} />
      ) : selectedAccount && !actAs ? (
        <FleetDetailView account={selectedAccount} onBack={() => setSelectedAccount(null)} onOpenSession={handleOpenSession} />
      ) : (
        <>
          {/* Module header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.25rem', color: '#1A1A1A' }}>Fleet & B2B Accounts</h1>
              <p style={{ fontSize: '0.825rem', color: '#6B7280', marginTop: 2 }}>
                Manage fleet accounts, pre-agreed pricing, net-terms billing, and fleet sessions.
              </p>
            </div>
            <button onClick={() => setShowActAs(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-[8px] text-sm font-medium"
              style={{ background: '#FFF7ED', color: '#C2410C', border: '1px solid #FED7AA' }}>
              <UserCheck size={14} /> Act as Fleet Customer
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-0.5 border-b mb-5" style={{ borderColor: '#E5E7EB' }}>
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

          {/* Tab content */}
          {tab === 'accounts' && <FleetAccountsView onSelect={acct => setSelectedAccount(acct)} />}
          {tab === 'sessions' && <FleetSessionsView onSelectSession={id => setActiveSessionId(id)} />}
          {tab === 'pricing' && <FleetPricingTiersView />}
          {tab === 'reorder' && <FleetQuickReorderView />}
          {tab === 'approvals' && <FleetApprovalsView />}
        </>
      )}

      {/* Act-as selector modal */}
      {showActAs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 mx-4" style={{ background: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#1A1A1A' }}>Act as Fleet Customer</h3>
              <button onClick={() => setShowActAs(false)} style={{ color: '#9CA3AF' }}><X size={18} /></button>
            </div>
            <div className="flex items-start gap-2 rounded-xl p-3 mb-5" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
              <Zap size={14} color="#C2410C" className="mt-0.5 shrink-0" />
              <p style={{ fontSize: '0.8rem', color: '#9A3412', lineHeight: 1.5 }}>
                You'll view the storefront from the fleet's perspective with agreed pricing. All orders will be tagged with the fleet account and your staff identity. This session is audit-logged.
              </p>
            </div>
            <div className="mb-5">
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>Select Fleet Account</label>
              <select value={actAsAccountId} onChange={e => setActAsAccountId(e.target.value)}
                className="w-full mt-1 px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ border: '1px solid #E5E7EB', color: '#374151', background: '#F9FAFB' }}>
                <option value="">Choose a fleet account…</option>
                {MOCK_FLEET_ACCOUNTS.filter(a => a.status === 'active').map(a => (
                  <option key={a.id} value={a.id}>{a.businessName}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowActAs(false)}
                className="flex-1 py-2.5 rounded-lg text-sm" style={{ background: '#F9FAFB', color: '#6B7280', border: '1px solid #E5E7EB' }}>Cancel</button>
              <button onClick={startActAs} disabled={!actAsAccountId}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                style={{ background: '#C0392B', color: '#fff', opacity: actAsAccountId ? 1 : 0.4 }}>
                <Zap size={14} /> Enter Act-As Mode
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

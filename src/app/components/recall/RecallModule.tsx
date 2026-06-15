import { useState } from 'react';
import { ShieldAlert, Users, Rss } from 'lucide-react';
import type { Recall, NHTSAPendingRecall } from './types';
import { MOCK_RECALLS, MOCK_NHTSA_QUEUE } from './mockData';
import { RecallRegistryView } from './RecallRegistryView';
import { RecallDetailView } from './RecallDetailView';
import { AffectedCustomersView } from './AffectedCustomersView';
import { NHTSAFeedView } from './NHTSAFeedView';

type Tab = 'registry' | 'affected' | 'nhtsa';

export default function RecallModule() {
  const [tab, setTab] = useState<Tab>('registry');
  const [recalls, setRecalls] = useState<Recall[]>(MOCK_RECALLS);
  const [nhtsaQueue, setNhtsaQueue] = useState<NHTSAPendingRecall[]>(MOCK_NHTSA_QUEUE);
  const [selectedRecall, setSelectedRecall] = useState<Recall | null>(null);

  function handlePublishNHTSA(item: NHTSAPendingRecall) {
    const recall: Recall = {
      id: `rcl_nhtsa_${Date.now()}`,
      shopId: null,
      source: 'nhtsa_dot',
      title: `NHTSA #${item.nhtsaCampaignId} — ${item.title}`,
      description: item.description,
      severity: item.severity,
      status: 'active',
      affectedSkus: [],
      affectedLots: [],
      affectedDotRanges: [],
      affectedVehicles: item.affectedVehicles,
      recommendedAction: `Notify affected customers who own ${item.affectedVehicles.map(v => `${v.yearFrom}–${v.yearTo} ${v.make} ${v.model}`).join(', ')}. Refer them to the nearest ${item.affectedVehicles[0]?.make || ''} dealer for free recall repair under NHTSA campaign ${item.nhtsaCampaignId}.`,
      effectiveFrom: new Date().toISOString().split('T')[0],
      publishedBy: 'Platform Admin',
      nhtsaCampaignId: item.nhtsaCampaignId,
      createdAt: new Date().toISOString(),
      affectedCustomerCount: item.estimatedAffected,
    };
    setRecalls(r => [recall, ...r]);
    setNhtsaQueue(q => q.filter(n => n.id !== item.id));
    setTab('registry');
  }

  const TABS: { id: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'registry', label: 'Recall Registry',       icon: ShieldAlert },
    { id: 'affected', label: 'Affected Customers',     icon: Users       },
    { id: 'nhtsa',    label: 'NHTSA Feed',             icon: Rss, badge: nhtsaQueue.length },
  ];

  if (selectedRecall) {
    return (
      <div style={{ fontFamily: 'Inter, sans-serif' }}>
        <RecallDetailView recall={selectedRecall} onBack={() => setSelectedRecall(null)} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', minHeight: '100%' }}>
      {/* Module header */}
      <div className="mb-5">
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.25rem', color: '#1A1A1A' }}>Recall & Compliance Monitoring</h1>
        <p style={{ fontSize: '0.825rem', color: '#6B7280', marginTop: 2 }}>
          Track product recalls, identify affected customers, and manage safety outreach. Recall notifications bypass marketing opt-in requirements.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 border-b mb-5" style={{ borderColor: '#E5E7EB' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors relative"
            style={{
              color: tab === t.id ? '#C0392B' : '#6B7280',
              borderBottom: tab === t.id ? '2px solid #C0392B' : '2px solid transparent',
            }}>
            <t.icon size={14} /> {t.label}
            {t.badge ? (
              <span className="ml-1 text-xs font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: '#C0392B', color: '#fff', fontSize: '0.65rem' }}>
                {t.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {tab === 'registry' && (
        <RecallRegistryView
          recalls={recalls}
          onSelect={r => setSelectedRecall(r)}
          onAdd={r => setRecalls(prev => [r, ...prev])}
        />
      )}
      {tab === 'affected' && <AffectedCustomersView />}
      {tab === 'nhtsa'    && <NHTSAFeedView queue={nhtsaQueue} onPublish={handlePublishNHTSA} />}
    </div>
  );
}

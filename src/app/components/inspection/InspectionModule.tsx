import { useState } from 'react';
import { ClipboardList, Wrench, FileText, BarChart2 } from 'lucide-react';
import { InspectionTemplatesView } from './InspectionTemplatesView';
import { TechInspectionView } from './TechInspectionView';
import { CustomerReportView } from './CustomerReportView';
import { InspectionAnalyticsView } from './InspectionAnalyticsView';
import { MOCK_TEMPLATES } from './mockData';
import type { InspectionTemplate } from './types';

type InspectionTab = 'templates' | 'tech' | 'customer' | 'analytics';

const TABS: { id: InspectionTab; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'templates',  label: 'Templates',        icon: <ClipboardList className="w-4 h-4" />, description: 'Define inspection checklists' },
  { id: 'tech',       label: 'Tech Inspection',  icon: <Wrench className="w-4 h-4" />,        description: 'Capture items & photos' },
  { id: 'customer',   label: 'Customer Report',  icon: <FileText className="w-4 h-4" />,      description: 'Review & approve services' },
  { id: 'analytics',  label: 'Analytics',        icon: <BarChart2 className="w-4 h-4" />,     description: 'Performance & attach rates' },
];

export function InspectionModule() {
  const [tab, setTab] = useState<InspectionTab>('templates');
  const [templates, setTemplates] = useState<InspectionTemplate[]>(MOCK_TEMPLATES);

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="bg-white border-b border-gray-200 px-6 flex-shrink-0">
        <div className="flex gap-0">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {tab === 'templates' && (
        <div className="flex-1 overflow-auto p-6 xl:p-8">
          <InspectionTemplatesView templates={templates} onUpdate={setTemplates} />
        </div>
      )}
      {tab === 'tech' && (
        <div className="flex-1 overflow-hidden">
          <div className="h-full max-w-sm mx-auto border-x border-gray-200 shadow-sm">
            <TechInspectionView />
          </div>
        </div>
      )}
      {tab === 'customer' && (
        <div className="flex-1 overflow-auto">
          <div className="max-w-lg mx-auto">
            <CustomerReportView />
          </div>
        </div>
      )}
      {tab === 'analytics' && (
        <div className="flex-1 overflow-auto">
          <InspectionAnalyticsView />
        </div>
      )}
    </div>
  );
}

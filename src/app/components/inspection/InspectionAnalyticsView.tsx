import { Download, TrendingUp, ClipboardList, DollarSign, Clock, Users } from 'lucide-react';
import { MOCK_TECHNICIAN_STATS, MOCK_TEMPLATE_PERF } from './mockData';

function StatCard({ icon, label, value, sub, highlight }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; highlight?: boolean;
}) {
  return (
    <div className={`bg-white rounded-2xl border p-5 ${highlight ? 'border-red-100' : 'border-gray-100'}`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${highlight ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500'}`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 mt-0.5">{label}</div>
      {sub && <div className={`text-xs mt-1 ${highlight ? 'text-red-600' : 'text-gray-400'}`}>{sub}</div>}
    </div>
  );
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function exportCSV() {
  const header = 'Technician,Inspections,Avg Time (min),Avg Recommendations,Attach Rate (%),Revenue ($)\n';
  const rows = MOCK_TECHNICIAN_STATS.map(t =>
    `${t.technicianName},${t.inspectionsCount},${t.avgTimeMinutes},${t.avgRecommendationCount},${t.attachRate},${(t.revenueCents / 100).toFixed(2)}`
  ).join('\n');
  const blob = new Blob([header + rows], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'inspection-analytics.csv'; a.click();
  URL.revokeObjectURL(url);
}

export function InspectionAnalyticsView() {
  const stats = MOCK_TECHNICIAN_STATS;
  const templatePerf = MOCK_TEMPLATE_PERF;

  const totalInspections = stats.reduce((s, t) => s + t.inspectionsCount, 0);
  const totalRevenue = stats.reduce((s, t) => s + t.revenueCents, 0);
  const avgAttachRate = Math.round(stats.reduce((s, t) => s + t.attachRate, 0) / stats.length);
  const avgTime = Math.round(stats.reduce((s, t) => s + t.avgTimeMinutes, 0) / stats.length);

  const maxInspections = Math.max(...stats.map(t => t.inspectionsCount));
  const maxRevenue = Math.max(...stats.map(t => t.revenueCents));
  const maxAttach = 100;

  const TECH_COLORS = ['bg-red-500', 'bg-blue-500', 'bg-purple-500'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Inspection Analytics</h2>
          <p className="text-sm text-gray-500 mt-0.5">Last 30 days · All technicians · All templates</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 hover:border-gray-300 rounded-xl px-4 py-2 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<ClipboardList className="w-5 h-5" />} label="Total Inspections" value={String(totalInspections)} sub="Last 30 days" />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Avg Attach Rate" value={`${avgAttachRate}%`} sub="Recommendations approved" highlight />
        <StatCard icon={<DollarSign className="w-5 h-5" />} label="Inspection Revenue" value={`R ${(totalRevenue / 100).toLocaleString()}`} sub="Approved services" highlight />
        <StatCard icon={<Clock className="w-5 h-5" />} label="Avg Inspection Time" value={`${avgTime}m`} sub="Per inspection" />
      </div>

      {/* Technician Performance */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="font-semibold text-gray-900 text-sm">Technician Performance</span>
          </div>
        </div>

        <div className="px-6 py-4 space-y-6">
          {/* Inspections count bar chart */}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Inspections Completed</div>
            <div className="space-y-3">
              {stats.map((t, i) => (
                <div key={t.technicianId} className="flex items-center gap-3">
                  <div className="w-28 text-sm text-gray-700 truncate flex-shrink-0">{t.technicianName}</div>
                  <Bar value={t.inspectionsCount} max={maxInspections} color={TECH_COLORS[i]} />
                  <div className="w-8 text-sm font-semibold text-gray-900 text-right flex-shrink-0">{t.inspectionsCount}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Attach rate bar chart */}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Attach Rate (%)</div>
            <div className="space-y-3">
              {stats.map((t, i) => (
                <div key={t.technicianId} className="flex items-center gap-3">
                  <div className="w-28 text-sm text-gray-700 truncate flex-shrink-0">{t.technicianName}</div>
                  <Bar value={t.attachRate} max={maxAttach} color={
                    t.attachRate >= 65 ? 'bg-green-500' : t.attachRate >= 50 ? 'bg-amber-500' : 'bg-red-400'
                  } />
                  <div className={`w-8 text-sm font-semibold text-right flex-shrink-0 ${
                    t.attachRate >= 65 ? 'text-green-600' : t.attachRate >= 50 ? 'text-amber-600' : 'text-red-600'
                  }`}>{t.attachRate}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue bar chart */}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Revenue Generated</div>
            <div className="space-y-3">
              {stats.map((t, i) => (
                <div key={t.technicianId} className="flex items-center gap-3">
                  <div className="w-28 text-sm text-gray-700 truncate flex-shrink-0">{t.technicianName}</div>
                  <Bar value={t.revenueCents} max={maxRevenue} color={TECH_COLORS[i]} />
                  <div className="w-16 text-sm font-semibold text-gray-900 text-right flex-shrink-0">
                    ${(t.revenueCents / 100 / 1000).toFixed(1)}k
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Technician detail table */}
        <div className="border-t border-gray-50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                {['Technician', 'Inspections', 'Avg Time', 'Avg Recs', 'Attach Rate', 'Revenue'].map(h => (
                  <th key={h} className="text-left text-xs text-gray-400 font-medium px-6 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.map((t, i) => (
                <tr key={t.technicianId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${TECH_COLORS[i]}`} />
                      <span className="font-medium text-gray-800">{t.technicianName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-gray-600">{t.inspectionsCount}</td>
                  <td className="px-6 py-3 text-gray-600">{t.avgTimeMinutes}m</td>
                  <td className="px-6 py-3 text-gray-600">{t.avgRecommendationCount}</td>
                  <td className="px-6 py-3">
                    <span className={`font-semibold ${t.attachRate >= 65 ? 'text-green-600' : t.attachRate >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                      {t.attachRate}%
                    </span>
                  </td>
                  <td className="px-6 py-3 font-semibold text-gray-900">${(t.revenueCents / 100).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Template Performance */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-gray-900 text-sm">Template Performance</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-50">
              {['Template', 'Uses', 'Attach Rate', 'Top Critical Item', 'Avg Revenue'].map(h => (
                <th key={h} className="text-left text-xs text-gray-400 font-medium px-6 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {templatePerf.map(tp => (
              <tr key={tp.templateId} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-3 font-medium text-gray-800">{tp.templateName}</td>
                <td className="px-6 py-3 text-gray-600">{tp.usageCount}</td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${tp.avgAttachRate}%` }} />
                    </div>
                    <span className="font-semibold text-gray-700">{tp.avgAttachRate}%</span>
                  </div>
                </td>
                <td className="px-6 py-3 text-gray-600">{tp.topCriticalItem}</td>
                <td className="px-6 py-3 font-semibold text-gray-900">${(tp.avgRevenueCents / 100).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

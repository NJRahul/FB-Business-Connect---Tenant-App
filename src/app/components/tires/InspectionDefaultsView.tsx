import React, { useState } from 'react';
import { ClipboardCheck, Smartphone, Monitor, Plus, GripVertical, Eye, BarChart2, CheckCircle, TrendingUp } from 'lucide-react';

interface TemplateItem {
  id: string;
  label: string;
  type: 'pass_fail' | 'measurement' | 'photo' | 'text';
  required: boolean;
  order: number;
}

const IN_SHOP_ITEMS: TemplateItem[] = [
  { id: 'is-1', label: 'Tread Depth (FL)', type: 'measurement', required: true, order: 1 },
  { id: 'is-2', label: 'Tread Depth (FR)', type: 'measurement', required: true, order: 2 },
  { id: 'is-3', label: 'Tread Depth (RL)', type: 'measurement', required: true, order: 3 },
  { id: 'is-4', label: 'Tread Depth (RR)', type: 'measurement', required: true, order: 4 },
  { id: 'is-5', label: 'TPMS Sensor Status', type: 'pass_fail', required: true, order: 5 },
  { id: 'is-6', label: 'Sidewall Condition (all)', type: 'pass_fail', required: true, order: 6 },
  { id: 'is-7', label: 'Wheel / Rim Damage', type: 'pass_fail', required: true, order: 7 },
  { id: 'is-8', label: 'Lug Nut Torque (ft-lbs)', type: 'measurement', required: true, order: 8 },
  { id: 'is-9', label: 'Brake Pad Depth (FL)', type: 'measurement', required: false, order: 9 },
  { id: 'is-10', label: 'Brake Pad Depth (FR)', type: 'measurement', required: false, order: 10 },
  { id: 'is-11', label: 'Rotation Recommendation', type: 'pass_fail', required: false, order: 11 },
  { id: 'is-12', label: 'Tire Age (from DOT year)', type: 'text', required: false, order: 12 },
  { id: 'is-13', label: 'Photo Evidence (any concern)', type: 'photo', required: false, order: 13 },
  { id: 'is-14', label: 'Tech Sign-off', type: 'pass_fail', required: true, order: 14 },
];

const MOBILE_ITEMS: TemplateItem[] = [
  { id: 'mo-1', label: 'Tread Depth (all 4 or 2 driven)', type: 'measurement', required: true, order: 1 },
  { id: 'mo-2', label: 'TPMS Warning Light Active?', type: 'pass_fail', required: true, order: 2 },
  { id: 'mo-3', label: 'Visible Damage / Nail?', type: 'pass_fail', required: true, order: 3 },
  { id: 'mo-4', label: 'Photo of Any Concern', type: 'photo', required: false, order: 4 },
  { id: 'mo-5', label: 'Tech Sign-off', type: 'pass_fail', required: true, order: 5 },
];

const TECH_ADOPTION = [
  { techName: 'Jake R.', inShopRate: 96, mobileRate: 100 },
  { techName: 'Sam T.', inShopRate: 82, mobileRate: 91 },
  { techName: 'Luis M.', inShopRate: 88, mobileRate: 97 },
  { techName: 'Priya K.', inShopRate: 100, mobileRate: 100 },
];

const TYPE_COLORS: Record<TemplateItem['type'], string> = {
  pass_fail:   '#2563EB',
  measurement: '#7C3AED',
  photo:       '#D97706',
  text:        '#6B7280',
};

const TYPE_LABELS: Record<TemplateItem['type'], string> = {
  pass_fail:   'Pass/Fail',
  measurement: 'Measurement',
  photo:       'Photo',
  text:        'Text',
};

function TypeBadge({ type }: { type: TemplateItem['type'] }) {
  return (
    <span style={{ padding: '1px 7px', borderRadius: 99, background: TYPE_COLORS[type] + '18', color: TYPE_COLORS[type], fontSize: 10, fontWeight: 700 }}>
      {TYPE_LABELS[type]}
    </span>
  );
}

function TemplateEditor({ items, title }: { items: TemplateItem[]; title: string }) {
  const [list, setList] = useState(items);
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const toggleRequired = (id: string) => setList(l => l.map(i => i.id === id ? { ...i, required: !i.required } : i));

  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#1A1A1A' }}>{title}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 12, cursor: 'pointer', color: '#374151' }}>
            <Plus size={11} /> Add Item
          </button>
          <button onClick={save} style={{ padding: '5px 12px', background: '#C0392B', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            {saved ? '✓ Saved' : 'Save Template'}
          </button>
        </div>
      </div>
      <div>
        {list.map((item, i) => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: i < list.length - 1 ? '1px solid #F3F4F6' : 'none', background: '#fff' }}>
            <GripVertical size={14} color="#D1D5DB" style={{ cursor: 'grab', flexShrink: 0 }} />
            <div style={{ width: 22, height: 22, borderRadius: 99, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#6B7280', flexShrink: 0 }}>{item.order}</div>
            <div style={{ flex: 1, fontSize: 13, color: '#1A1A1A' }}>{item.label}</div>
            <TypeBadge type={item.type} />
            <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#6B7280', cursor: 'pointer', flexShrink: 0 }}>
              <input type="checkbox" checked={item.required} onChange={() => toggleRequired(item.id)} style={{ width: 13, height: 13 }} />
              Required
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdoptionAnalytics() {
  const avgInShop = Math.round(TECH_ADOPTION.reduce((a, t) => a + t.inShopRate, 0) / TECH_ADOPTION.length);
  const avgMobile = Math.round(TECH_ADOPTION.reduce((a, t) => a + t.mobileRate, 0) / TECH_ADOPTION.length);

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 9, padding: '14px 16px' }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: avgInShop >= 90 ? '#16A34A' : '#D97706' }}>{avgInShop}%</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>In-Shop Completion</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 9, padding: '14px 16px' }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: avgMobile >= 90 ? '#16A34A' : '#D97706' }}>{avgMobile}%</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>Mobile Completion</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 9, padding: '14px 16px' }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#1A1A1A' }}>{IN_SHOP_ITEMS.length + MOBILE_ITEMS.length}</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>Total Template Items</div>
        </div>
      </div>

      {/* Per-tech breakdown */}
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 18px' }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#1A1A1A', marginBottom: 14 }}>Completion by Technician</div>
        <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 1fr', gap: 8, marginBottom: 8 }}>
          <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase' }}>Tech</div>
          <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5 }}><Monitor size={10} />In-Shop</div>
          <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5 }}><Smartphone size={10} />Mobile</div>
        </div>
        {TECH_ADOPTION.map(t => (
          <div key={t.techName} style={{ display: 'grid', gridTemplateColumns: '130px 1fr 1fr', gap: 8, alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{t.techName}</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ flex: 1, background: '#F3F4F6', borderRadius: 99, height: 7, overflow: 'hidden' }}>
                  <div style={{ width: `${t.inShopRate}%`, background: t.inShopRate >= 90 ? '#16A34A' : '#D97706', height: '100%', borderRadius: 99 }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: t.inShopRate >= 90 ? '#16A34A' : '#D97706', minWidth: 32 }}>{t.inShopRate}%</span>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ flex: 1, background: '#F3F4F6', borderRadius: 99, height: 7, overflow: 'hidden' }}>
                  <div style={{ width: `${t.mobileRate}%`, background: t.mobileRate >= 90 ? '#16A34A' : '#D97706', height: '100%', borderRadius: 99 }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: t.mobileRate >= 90 ? '#16A34A' : '#D97706', minWidth: 32 }}>{t.mobileRate}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14, padding: '10px 14px', background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 8, fontSize: 12, color: '#15803D', display: 'flex', gap: 8 }}>
        <TrendingUp size={14} style={{ flexShrink: 0, marginTop: 1 }} />
        Sam T. is below 85% on in-shop inspections. Consider a follow-up coaching session on required fields.
      </div>
    </div>
  );
}

const SUBTABS = [
  { id: 'inshop', label: 'In-Shop Template', icon: Monitor },
  { id: 'mobile', label: 'Mobile Template', icon: Smartphone },
  { id: 'analytics', label: 'Adoption Analytics', icon: BarChart2 },
] as const;
type InspSubtab = typeof SUBTABS[number]['id'];

export function InspectionDefaultsView() {
  const [subtab, setSubtab] = useState<InspSubtab>('inshop');

  return (
    <div>
      {/* Banner */}
      <div style={{ padding: '10px 16px', background: '#F0F7FF', border: '1px solid #BFDBFE', borderRadius: 8, fontSize: 13, color: '#1D4ED8', marginBottom: 18, display: 'flex', gap: 8 }}>
        <ClipboardCheck size={15} style={{ flexShrink: 0, marginTop: 1 }} />
        These templates set the default inspection checklist for all tire service visits. The <strong>In-Shop</strong> template is comprehensive; the <strong>Mobile</strong> template is a narrower scope for field technicians.
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #E5E7EB', marginBottom: 20 }}>
        {SUBTABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setSubtab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: subtab === t.id ? '#C0392B' : '#6B7280', borderBottom: subtab === t.id ? '2px solid #C0392B' : '2px solid transparent', marginBottom: -2 }}>
              <Icon size={13} />{t.label}
            </button>
          );
        })}
      </div>

      {subtab === 'inshop'    && <TemplateEditor items={IN_SHOP_ITEMS} title={`In-Shop Tire Inspection — ${IN_SHOP_ITEMS.length} items`} />}
      {subtab === 'mobile'    && <TemplateEditor items={MOBILE_ITEMS}  title={`Mobile Tire Inspection — ${MOBILE_ITEMS.length} items`} />}
      {subtab === 'analytics' && <AdoptionAnalytics />}
    </div>
  );
}

import { useState } from 'react';
import { Plus, Pencil, Trash2, Zap, Package, Clock, DollarSign, X, Check } from 'lucide-react';
import { JOB_TEMPLATES, ADDON_SERVICES } from './mockData';
import type { JobTemplate } from './types';

function fmtMoney(n: number) { return `R ${n.toFixed(2)}`; }

interface Props {
  onUseTemplate?: (template: JobTemplate) => void;
}

export function JobTemplates({ onUseTemplate }: Props) {
  const [templates, setTemplates] = useState<JobTemplate[]>(JOB_TEMPLATES);
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const deleteTemplate = (id: string) => setTemplates(ts => ts.filter(t => t.id !== id));

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.125rem' }}>Job Templates</h3>
          <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Pre-fill bookings in one action. Tire-pack defaults included.</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-[6px] text-white text-sm font-semibold"
          style={{ background: '#00A9AC' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#007F82')}
          onMouseLeave={e => (e.currentTarget.style.background = '#00A9AC')}
        >
          <Plus size={15} /> New Template
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {templates.map(tpl => {
          const isSelected = selected === tpl.id;
          return (
            <div
              key={tpl.id}
              className="bg-white rounded-[10px] p-5 flex flex-col"
              style={{
                border: isSelected ? '2px solid #00A9AC' : '1px solid #E5E7EB',
                boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <span style={{ fontSize: '2rem' }}>{tpl.icon}</span>
                <div className="flex gap-1">
                  <button onClick={() => deleteTemplate(tpl.id)} className="p-1 rounded hover:bg-red-50" style={{ color: '#EF4444' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <h4 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1rem', marginBottom: '4px' }}>
                {tpl.name}
              </h4>
              <p style={{ color: '#9CA3AF', fontSize: '0.8125rem', lineHeight: 1.5, flex: 1, marginBottom: '12px' }}>
                {tpl.description}
              </p>

              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-1.5">
                  <Clock size={13} style={{ color: '#9CA3AF' }} />
                  <span style={{ color: '#6B7280', fontSize: '0.8125rem' }}>{tpl.laborMinutes} min labor</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <DollarSign size={13} style={{ color: '#9CA3AF' }} />
                  <span style={{ color: '#6B7280', fontSize: '0.8125rem' }}>{fmtMoney(tpl.price)} labor</span>
                </div>
                {tpl.parts.length > 0 && (
                  <div className="flex items-start gap-1.5">
                    <Package size={13} style={{ color: '#9CA3AF', marginTop: '2px' }} />
                    <div>
                      {tpl.parts.map((p, i) => (
                        <p key={i} style={{ color: '#6B7280', fontSize: '0.8125rem' }}>{p.qty}× {p.name}</p>
                      ))}
                    </div>
                  </div>
                )}
                {tpl.recommendedAddonIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {tpl.recommendedAddonIds.map(id => {
                      const ao = ADDON_SERVICES.find(a => a.id === id);
                      return ao ? (
                        <span key={id} className="px-1.5 py-0.5 rounded text-xs" style={{ background: '#E6F7F7', color: '#00A9AC' }}>+{ao.name}</span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setSelected(tpl.id);
                  if (onUseTemplate) onUseTemplate(tpl);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[6px] text-sm font-semibold transition-all"
                style={{
                  background: isSelected ? '#27AE60' : '#00A9AC',
                  color: '#fff',
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#007F82'; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = '#00A9AC'; }}
              >
                {isSelected ? <><Check size={14} /> Applied</> : <><Zap size={14} /> Use Template</>}
              </button>
            </div>
          );
        })}
      </div>

      {/* Tips */}
      <div className="mt-8 p-4 rounded-[8px]" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
        <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.875rem', marginBottom: '4px' }}>How templates work</p>
        <ul className="space-y-1">
          {[
            'Templates pre-fill the booking form with service, parts, and recommended add-ons.',
            'Staff can customize any field after selecting a template — the template is unchanged.',
            'Parts SKUs in templates are placeholders; update them for each specific booking.',
          ].map(t => (
            <li key={t} style={{ color: '#6B7280', fontSize: '0.8125rem' }}>• {t}</li>
          ))}
        </ul>
      </div>

      {/* New template modal */}
      {adding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-[12px] p-6 w-full max-w-md" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div className="flex items-center justify-between mb-4">
              <h4 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A' }}>New Job Template</h4>
              <button onClick={() => setAdding(false)}><X size={16} style={{ color: '#9CA3AF' }} /></button>
            </div>
            <p style={{ color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '16px' }}>
              Templates are for tire-shop jobs. Fill in the details and save.
            </p>
            <div className="space-y-3">
              {[
                { label: 'Template Name', placeholder: 'e.g., Flat Repair + Rebalance' },
                { label: 'Icon (emoji)', placeholder: '🔧' },
                { label: 'Description', placeholder: 'Short description of the job' },
              ].map(f => (
                <label key={f.label}>
                  <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>{f.label}</span>
                  <input placeholder={f.placeholder} className="w-full px-3 py-2 rounded-[6px] text-sm" style={{ border: '1.5px solid #E5E7EB', outline: 'none' }} />
                </label>
              ))}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setAdding(false)} className="flex-1 py-2 rounded-[6px] text-sm" style={{ border: '1.5px solid #E5E7EB', color: '#6B7280' }}>Cancel</button>
              <button onClick={() => setAdding(false)} className="flex-1 py-2.5 rounded-[6px] text-sm text-white font-semibold" style={{ background: '#00A9AC' }}>Save Template</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

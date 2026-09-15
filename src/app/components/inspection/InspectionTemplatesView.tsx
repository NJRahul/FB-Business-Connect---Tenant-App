import { useState } from 'react';
import { Plus, GripVertical, ChevronDown, ChevronRight, Settings, Copy, ArrowLeft, Check, X, Camera, Mic } from 'lucide-react';
import type { InspectionTemplate, TemplateItemConfig, PhotoRequirement, ItemStatus } from './types';
import { MOCK_TEMPLATES } from './mockData';

const cents = (c: number) => c ? `R ${(c / 100).toFixed(2)}` : '—';

function ServiceTypeBadge({ type }: { type: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    'Full Inspection': { bg: '#E6F7F7', color: '#00A9AC' },
    'Tire Service':    { bg: '#EFF6FF', color: '#1D4ED8' },
    'Oil Change':      { bg: '#F0FDF4', color: '#15803D' },
  };
  const c = colors[type] ?? { bg: '#F9FAFB', color: '#6B7280' };
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: c.bg, color: c.color }}>{type}</span>;
}

interface Props {
  templates: InspectionTemplate[];
  onUpdate: (templates: InspectionTemplate[]) => void;
}

export function InspectionTemplatesView({ templates, onUpdate }: Props) {
  const [editing, setEditing] = useState<InspectionTemplate | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  function showToast(msg: string) { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); }

  function cloneTemplate(t: InspectionTemplate) {
    const copy: InspectionTemplate = { ...t, id: `tmpl_${Date.now()}`, name: `${t.name} (Copy)`, version: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isDefault: false };
    onUpdate([...templates, copy]);
    showToast(`"${copy.name}" created as a copy.`);
  }

  if (editing) {
    return <TemplateBuilder template={editing}
      onSave={t => { onUpdate(templates.map(x => x.id === t.id ? t : x)); setEditing(null); showToast(`"${t.name}" saved.`); }}
      onCancel={() => setEditing(null)} />;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.125rem', color: '#1A1A1A' }}>Inspection Templates</h2>
          <p style={{ fontSize: '0.825rem', color: '#6B7280', marginTop: 2 }}>
            Define checklists per service type. Assign to service visits; tech selects at visit start.
          </p>
        </div>
        <button onClick={() => {
          const blank: InspectionTemplate = { id: `tmpl_${Date.now()}`, shopId: 'shop_001', name: 'New Template', serviceType: 'Full Inspection', categories: ['General'], items: [], isDefault: false, version: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
          onUpdate([...templates, blank]);
          setEditing(blank);
        }} className="flex items-center gap-2 px-4 py-2 rounded-[8px] text-sm font-semibold" style={{ background: '#00A9AC', color: '#fff' }}>
          <Plus size={14} /> New Template
        </button>
      </div>

      {/* Template Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {templates.map(t => {
          const critCount = t.items.filter(i => i.photoRequirement === 'required').length;
          const cats = t.categories.length;
          return (
            <div key={t.id} className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
              <div className="px-4 py-4" style={{ borderBottom: '1px solid #F3F4F6' }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A1A1A' }}>{t.name}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <ServiceTypeBadge type={t.serviceType} />
                      {t.isDefault && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#EEF2FF', color: '#3730A3' }}>Default</span>}
                      <span className="text-xs" style={{ color: '#9CA3AF' }}>v{t.version}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3">
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { label: 'Items', value: t.items.length },
                    { label: 'Categories', value: cats },
                    { label: 'Photo Required', value: critCount },
                  ].map(s => (
                    <div key={s.label} className="text-center py-2 rounded-lg" style={{ background: '#F9FAFB' }}>
                      <p style={{ fontWeight: 700, fontSize: '1.125rem', color: '#1A1A1A' }}>{s.value}</p>
                      <p style={{ fontSize: '0.65rem', color: '#9CA3AF', marginTop: 1 }}>{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(t)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium" style={{ background: '#00A9AC', color: '#fff' }}>
                    <Settings size={12} /> Edit
                  </button>
                  <button onClick={() => cloneTemplate(t)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm" style={{ background: '#F9FAFB', color: '#6B7280', border: '1px solid #E5E7EB' }}>
                    <Copy size={12} /> Clone
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {toastMsg && (
        <div className="fixed bottom-6 right-6 px-4 py-3 rounded-xl text-sm font-medium z-50 flex items-center gap-2"
          style={{ background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
          <Check size={14} /> {toastMsg}
        </div>
      )}
    </div>
  );
}

function TemplateBuilder({ template, onSave, onCancel }: {
  template: InspectionTemplate; onSave: (t: InspectionTemplate) => void; onCancel: () => void;
}) {
  const [name, setName] = useState(template.name);
  const [serviceType, setServiceType] = useState(template.serviceType);
  const [items, setItems] = useState<TemplateItemConfig[]>(template.items);
  const [categories, setCategories] = useState<string[]>(template.categories.length ? template.categories : ['General']);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(items[0]?.id ?? null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const selectedItem = items.find(i => i.id === selectedItemId) ?? null;

  function toggleCollapse(cat: string) { setCollapsed(s => { const n = new Set(s); n.has(cat) ? n.delete(cat) : n.add(cat); return n; }); }

  function addItem(cat: string) {
    const newItem: TemplateItemConfig = {
      id: `item_${Date.now()}`, key: `item_${Date.now()}`,
      name: 'New Item', category: cat, description: '', instructions: '',
      photoRequirement: 'optional', minPhotos: 0, allowVoiceNote: false,
      statusOptions: ['good', 'attention', 'critical', 'na'],
      recommendedActions: {}, priceCents: 0,
    };
    setItems(prev => [...prev, newItem]);
    setSelectedItemId(newItem.id);
  }

  function addCategory() {
    const name = `Category ${categories.length + 1}`;
    setCategories(c => [...c, name]);
  }

  function updateItem(id: string, patch: Partial<TemplateItemConfig>) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));
  }

  function removeItem(id: string) {
    setItems(prev => prev.filter(i => i.id !== id));
    if (selectedItemId === id) setSelectedItemId(items.find(i => i.id !== id)?.id ?? null);
  }

  function handleDragStart(idx: number) { setDragIndex(idx); }
  function handleDragOver(e: React.DragEvent, idx: number) { e.preventDefault(); setDragOverIndex(idx); }
  function handleDrop(idx: number) {
    if (dragIndex === null || dragIndex === idx) return;
    const next = [...items];
    const [removed] = next.splice(dragIndex, 1);
    next.splice(idx, 0, removed);
    setItems(next);
    setDragIndex(null); setDragOverIndex(null);
  }
  function handleDragEnd() { setDragIndex(null); setDragOverIndex(null); }

  const inputCls = "w-full px-3 py-2 rounded-lg text-sm outline-none";
  const inputStyle = { border: '1px solid #E5E7EB', color: '#1A1A1A', background: '#fff' };
  const labelStyle: React.CSSProperties = { fontSize: '0.775rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 };

  return (
    <div className="flex flex-col gap-0" style={{ height: 'calc(100vh - 160px)' }}>
      {/* Builder header */}
      <div className="flex items-center justify-between pb-4 mb-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="flex items-center gap-1.5 text-sm" style={{ color: '#6B7280' }}>
            <ArrowLeft size={14} /> Back
          </button>
          <div className="w-px h-4" style={{ background: '#E5E7EB' }} />
          <input value={name} onChange={e => setName(e.target.value)}
            className="text-sm font-semibold outline-none px-2 py-1 rounded-lg"
            style={{ fontFamily: 'Sora, sans-serif', fontSize: '1rem', color: '#1A1A1A', background: 'transparent', border: '1px solid transparent' }}
            onFocus={e => (e.target.style.border = '1px solid #E5E7EB')}
            onBlur={e => (e.target.style.border = '1px solid transparent')} />
          <select value={serviceType} onChange={e => setServiceType(e.target.value)}
            className="text-sm outline-none px-2 py-1 rounded-lg" style={{ border: '1px solid #E5E7EB', color: '#374151', background: '#fff' }}>
            {['Full Inspection', 'Tire Service', 'Oil Change', 'Alignment', 'Custom'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={() => onSave({ ...template, name, serviceType, items, categories, version: template.version + 1, updatedAt: new Date().toISOString() })}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ background: '#00A9AC', color: '#fff' }}>
          <Check size={13} /> Save Template
        </button>
      </div>

      <div className="flex gap-4 flex-1 overflow-hidden">
        {/* Left: item list */}
        <div className="w-72 shrink-0 flex flex-col overflow-hidden rounded-xl" style={{ border: '1px solid #E5E7EB', background: '#fff' }}>
          <div className="px-3 py-2.5 flex items-center justify-between" style={{ borderBottom: '1px solid #F3F4F6', background: '#F9FAFB' }}>
            <p style={{ fontSize: '0.775rem', fontWeight: 600, color: '#374151' }}>{items.length} Items</p>
            <button onClick={addCategory} className="text-xs px-2 py-0.5 rounded" style={{ color: '#00A9AC', background: '#E6F7F7' }}>+ Category</button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {categories.map(cat => {
              const catItems = items.filter(i => i.category === cat);
              const isCollapsed = collapsed.has(cat);
              return (
                <div key={cat}>
                  <button onClick={() => toggleCollapse(cat)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left"
                    style={{ background: '#F9FAFB', borderBottom: '1px solid #F3F4F6' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cat}</span>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>{catItems.length}</span>
                      {isCollapsed ? <ChevronRight size={12} color="#9CA3AF" /> : <ChevronDown size={12} color="#9CA3AF" />}
                    </div>
                  </button>
                  {!isCollapsed && (
                    <>
                      {catItems.map((item, ci) => {
                        const globalIdx = items.indexOf(item);
                        const isSelected = selectedItemId === item.id;
                        const isDragOver = dragOverIndex === globalIdx;
                        return (
                          <div key={item.id}
                            draggable
                            onDragStart={() => handleDragStart(globalIdx)}
                            onDragOver={e => handleDragOver(e, globalIdx)}
                            onDrop={() => handleDrop(globalIdx)}
                            onDragEnd={handleDragEnd}
                            onClick={() => setSelectedItemId(item.id)}
                            className="flex items-center gap-2 px-3 py-2.5 cursor-pointer"
                            style={{
                              background: isSelected ? '#E6F7F7' : isDragOver ? '#F5F5F5' : 'transparent',
                              borderBottom: '1px solid #F9FAFB',
                              borderTop: isDragOver ? '2px solid #00A9AC' : undefined,
                            }}>
                            <GripVertical size={12} color="#D1D5DB" style={{ cursor: 'grab', shrink: 0 }} />
                            <div className="flex-1 min-w-0">
                              <p style={{ fontSize: '0.8rem', fontWeight: isSelected ? 600 : 400, color: isSelected ? '#00A9AC' : '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {item.photoRequirement === 'required' && <Camera size={9} color="#9CA3AF" />}
                                {item.allowVoiceNote && <Mic size={9} color="#9CA3AF" />}
                                {item.priceCents > 0 && <span style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>{cents(item.priceCents)}</span>}
                              </div>
                            </div>
                            <button onClick={e => { e.stopPropagation(); removeItem(item.id); }} style={{ color: '#D1D5DB', shrink: 0 }}>
                              <X size={11} />
                            </button>
                          </div>
                        );
                      })}
                      <button onClick={() => addItem(cat)}
                        className="w-full flex items-center gap-1.5 px-4 py-2 text-left"
                        style={{ color: '#9CA3AF', fontSize: '0.775rem', borderBottom: '1px solid #F3F4F6' }}>
                        <Plus size={11} /> Add item
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: item config */}
        <div className="flex-1 overflow-y-auto rounded-xl" style={{ border: '1px solid #E5E7EB', background: '#fff' }}>
          {!selectedItem ? (
            <div className="flex items-center justify-center h-full text-center p-8">
              <div>
                <Settings size={32} color="#D1D5DB" className="mx-auto mb-3" />
                <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Select an item to configure</p>
              </div>
            </div>
          ) : (
            <div className="p-5 flex flex-col gap-5">
              <div>
                <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#1A1A1A', marginBottom: 16 }}>Item Configuration</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label style={labelStyle}>Item Name *</label>
                    <input value={selectedItem.name} onChange={e => updateItem(selectedItem.id, { name: e.target.value })} className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Category</label>
                    <select value={selectedItem.category} onChange={e => updateItem(selectedItem.id, { category: e.target.value })} className={inputCls} style={inputStyle}>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Price Implication</label>
                    <input type="number" value={selectedItem.priceCents / 100} onChange={e => updateItem(selectedItem.id, { priceCents: Math.round(parseFloat(e.target.value || '0') * 100) })}
                      placeholder="0.00" step="0.01" className={inputCls} style={inputStyle} />
                  </div>
                  <div className="col-span-2">
                    <label style={labelStyle}>Description (visible to customer)</label>
                    <input value={selectedItem.description} onChange={e => updateItem(selectedItem.id, { description: e.target.value })} className={inputCls} style={inputStyle} placeholder="What does this inspection item check?" />
                  </div>
                  <div className="col-span-2">
                    <label style={labelStyle}>Tech Instructions (internal only)</label>
                    <textarea value={selectedItem.instructions} onChange={e => updateItem(selectedItem.id, { instructions: e.target.value })}
                      rows={2} className={`${inputCls} resize-none`} style={{ ...inputStyle, fontFamily: 'Inter, sans-serif' }} placeholder="Step-by-step instructions for the technician" />
                  </div>
                </div>
              </div>

              {/* Photo & Voice */}
              <div className="rounded-xl p-4 flex flex-col gap-4" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                <p style={{ fontWeight: 600, fontSize: '0.825rem', color: '#374151' }}>Capture Requirements</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={labelStyle}>Photo Requirement</label>
                    <select value={selectedItem.photoRequirement} onChange={e => updateItem(selectedItem.id, { photoRequirement: e.target.value as PhotoRequirement })} className={inputCls} style={{ ...inputStyle, background: '#fff' }}>
                      <option value="none">None</option>
                      <option value="optional">Optional</option>
                      <option value="required">Required</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Min. Photos {selectedItem.photoRequirement !== 'required' && <span style={{ color: '#D1D5DB' }}>(N/A)</span>}</label>
                    <input type="number" min={1} max={10} value={selectedItem.minPhotos}
                      disabled={selectedItem.photoRequirement !== 'required'}
                      onChange={e => updateItem(selectedItem.id, { minPhotos: parseInt(e.target.value) || 1 })}
                      className={inputCls} style={{ ...inputStyle, background: '#fff', opacity: selectedItem.photoRequirement !== 'required' ? 0.4 : 1 }} />
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div onClick={() => updateItem(selectedItem.id, { allowVoiceNote: !selectedItem.allowVoiceNote })}
                    className="w-10 h-5 rounded-full relative transition-colors" style={{ background: selectedItem.allowVoiceNote ? '#00A9AC' : '#E5E7EB' }}>
                    <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform" style={{ left: selectedItem.allowVoiceNote ? 'calc(100% - 18px)' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </div>
                  <span style={{ fontSize: '0.825rem', color: '#374151' }}>Allow voice notes on this item</span>
                </label>
              </div>

              {/* Recommended Actions */}
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.825rem', color: '#374151', marginBottom: 12 }}>Recommended Actions per Status</p>
                <div className="flex flex-col gap-3">
                  {(['attention', 'critical'] as ItemStatus[]).map(status => {
                    const colors: Record<string, { bg: string; color: string }> = { attention: { bg: '#FFFBEB', color: '#B45309' }, critical: { bg: '#FEF2F2', color: '#B91C1C' } };
                    const c = colors[status];
                    return (
                      <div key={status}>
                        <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: c.bg, color: c.color }}>{status === 'attention' ? 'Attention' : 'Critical'}</span>
                          Recommended action
                        </label>
                        <input value={selectedItem.recommendedActions[status] || ''}
                          onChange={e => updateItem(selectedItem.id, { recommendedActions: { ...selectedItem.recommendedActions, [status]: e.target.value } })}
                          placeholder={`What to recommend when status is ${status}…`}
                          className={inputCls} style={inputStyle} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

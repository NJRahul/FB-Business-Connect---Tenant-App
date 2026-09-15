'use client';
import React, { useState } from 'react';
import { DollarSign, Plus, Edit2, Trash2, X, Lock, ChevronDown } from 'lucide-react';
import { COMMISSION_ENTRIES } from './mockData';
import type { CommissionEntry, CommissionRule } from './types';

const DEFAULT_RULES: CommissionRule[] = [
  { id: 'rule-1', name: 'Base Revenue Share', type: 'pct_revenue', value: 10 },
  { id: 'rule-2', name: 'Upsell Bonus', type: 'category_override', value: 15, category: 'addon' },
  { id: 'rule-3', name: 'Parts Margin Share', type: 'pct_margin', value: 8 },
];

const RULE_TYPE_LABELS: Record<CommissionRule['type'], string> = {
  pct_revenue:       '% of Revenue',
  fixed_per_service: 'Fixed per Service',
  pct_margin:        '% of Margin',
  category_override: 'Category Override',
};

const PERIODS = ['2026-06', '2026-05', '2026-04'];

function RuleCard({ rule, onEdit, onDelete }: { rule: CommissionRule; onEdit: (r: CommissionRule) => void; onDelete: (id: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10 }}>
      <div style={{ width: 36, height: 36, background: '#E6F7F7', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <DollarSign size={16} color="#00A9AC" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#1A1A1A' }}>{rule.name}</div>
        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 1 }}>
          {RULE_TYPE_LABELS[rule.type]}
          {rule.category && <span style={{ marginLeft: 6, background: '#EDE9FE', color: '#7C3AED', borderRadius: 5, padding: '1px 7px', fontSize: 11 }}>{rule.category}</span>}
        </div>
      </div>
      <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 800, color: '#00A9AC' }}>
        {rule.type === 'fixed_per_service' ? `R ${rule.value}` : `${rule.value}%`}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => onEdit(rule)} style={{ padding: '6px', border: '1px solid #E5E7EB', borderRadius: 6, cursor: 'pointer', background: '#fff' }}>
          <Edit2 size={14} color="#6B7280" />
        </button>
        <button onClick={() => onDelete(rule.id)} style={{ padding: '6px', border: '1px solid #80D4D5', borderRadius: 6, cursor: 'pointer', background: '#F0FBFB' }}>
          <Trash2 size={14} color="#DC2626" />
        </button>
      </div>
    </div>
  );
}

interface RuleModalProps {
  rule?: CommissionRule;
  onClose: () => void;
  onSave: (rule: CommissionRule) => void;
}

function RuleModal({ rule, onClose, onSave }: RuleModalProps) {
  const [form, setForm] = useState<CommissionRule>(rule ?? {
    id: `rule-${Date.now()}`,
    name: '',
    type: 'pct_revenue',
    value: 10,
    category: undefined,
  });

  const handleSave = () => {
    if (!form.name) return;
    onSave(form);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 420, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 16 }}>{rule ? 'Edit Rule' : 'New Commission Rule'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="#6B7280" /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Rule Name</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Summer Bonus"
              style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Type</label>
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as CommissionRule['type'] }))}
              style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}>
              {Object.entries(RULE_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          {form.type === 'category_override' && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Category</label>
              <select value={form.category ?? ''} onChange={e => setForm(p => ({ ...p, category: e.target.value || undefined }))}
                style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}>
                <option value="">Select category...</option>
                {['labor', 'parts', 'addon', 'discount', 'tip'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>
              {form.type === 'fixed_per_service' ? 'Amount ($)' : 'Percentage (%)'}
            </label>
            <input type="number" min={0} max={100} step={0.5} value={form.value} onChange={e => setForm(p => ({ ...p, value: Number(e.target.value) }))}
              style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px 0', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, cursor: 'pointer', background: '#fff' }}>Cancel</button>
          <button onClick={handleSave} style={{ flex: 2, padding: '10px 0', background: '#00A9AC', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Save Rule</button>
        </div>
      </div>
    </div>
  );
}

export function CommissionTracking({ enabled = true }: { enabled?: boolean }) {
  const [rules, setRules] = useState<CommissionRule[]>(DEFAULT_RULES);
  const [entries] = useState<CommissionEntry[]>(COMMISSION_ENTRIES);
  const [editingRule, setEditingRule] = useState<CommissionRule | undefined>();
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [period, setPeriod] = useState('2026-06');
  const [expandTech, setExpandTech] = useState<string | null>(null);

  if (!enabled) {
    return (
      <div style={{ padding: '60px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 56, height: 56, background: '#F3F4F6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Lock size={24} color="#9CA3AF" />
        </div>
        <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 700, color: '#1A1A1A' }}>Commission Tracking</div>
        <div style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', maxWidth: 320 }}>
          Commission tracking is available on Pro and Enterprise plans. Upgrade to enable per-technician commission rules and payout reports.
        </div>
        <button style={{ padding: '10px 24px', background: '#00A9AC', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Upgrade Plan
        </button>
      </div>
    );
  }

  const filteredEntries = entries.filter(e => e.period === period);

  const byTech = filteredEntries.reduce<Record<string, { name: string; role: string; amount: number; entries: CommissionEntry[] }>>((acc, e) => {
    if (!acc[e.userId]) acc[e.userId] = { name: e.userName, role: e.role, amount: 0, entries: [] };
    acc[e.userId].amount += e.amount;
    acc[e.userId].entries.push(e);
    return acc;
  }, {});

  const totalPayout = Object.values(byTech).reduce((s, t) => s + t.amount, 0);

  const handleSaveRule = (rule: CommissionRule) => {
    setRules(prev => {
      const idx = prev.findIndex(r => r.id === rule.id);
      return idx >= 0 ? prev.map(r => r.id === rule.id ? rule : r) : [...prev, rule];
    });
  };

  return (
    <div style={{ padding: '20px 0', fontFamily: 'Inter, sans-serif' }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Payout This Period', value: `R ${totalPayout.toFixed(2)}`, color: '#00A9AC', bg: '#E6F7F7' },
          { label: 'Active Rules', value: rules.length, color: '#2980B9', bg: '#EBF5FB' },
          { label: 'Technicians Earning', value: Object.keys(byTech).length, color: '#27AE60', bg: '#D1FAE5' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Rules panel */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 15, color: '#1A1A1A' }}>Commission Rules</div>
            <button onClick={() => { setEditingRule(undefined); setShowRuleModal(true); }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: '#00A9AC', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <Plus size={13} /> Add Rule
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rules.map(rule => (
              <RuleCard key={rule.id} rule={rule} onEdit={r => { setEditingRule(r); setShowRuleModal(true); }} onDelete={id => setRules(prev => prev.filter(r => r.id !== id))} />
            ))}
            {rules.length === 0 && <div style={{ textAlign: 'center', padding: '20px 0', color: '#9CA3AF', fontSize: 14 }}>No rules defined. Add one to start tracking commissions.</div>}
          </div>
        </div>

        {/* Earnings panel */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 15, color: '#1A1A1A' }}>Earnings by Technician</div>
            <select value={period} onChange={e => setPeriod(e.target.value)}
              style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 10px', fontSize: 13, outline: 'none', background: '#fff' }}>
              {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(byTech).map(([id, tech]) => (
              <div key={id} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
                <div
                  onClick={() => setExpandTech(expandTech === id ? null : id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', cursor: 'pointer' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#1A1A1A' }}>{tech.name}</div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>{tech.role} · {tech.entries.length} jobs</div>
                  </div>
                  <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 800, color: '#00A9AC' }}>${tech.amount.toFixed(2)}</div>
                  <ChevronDown size={16} color="#6B7280" style={{ transform: expandTech === id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </div>
                {expandTech === id && (
                  <div style={{ borderTop: '1px solid #E5E7EB', padding: '10px 14px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: '#F9FAFB' }}>
                          {['Visit', 'Rule', 'Amount'].map(h => (
                            <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tech.entries.map(e => (
                          <tr key={e.id} style={{ borderTop: '1px solid #E5E7EB' }}>
                            <td style={{ padding: '6px 10px', color: '#374151' }}>{e.visitSummary}</td>
                            <td style={{ padding: '6px 10px', color: '#6B7280' }}>
                              {rules.find(r => r.id === e.ruleId)?.name ?? e.ruleId}
                            </td>
                            <td style={{ padding: '6px 10px', fontWeight: 600, color: '#00A9AC' }}>${e.amount.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
            {Object.keys(byTech).length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#9CA3AF', fontSize: 14 }}>No commission entries for this period.</div>
            )}
          </div>
        </div>
      </div>

      {showRuleModal && (
        <RuleModal
          rule={editingRule}
          onClose={() => { setShowRuleModal(false); setEditingRule(undefined); }}
          onSave={handleSaveRule}
        />
      )}
    </div>
  );
}

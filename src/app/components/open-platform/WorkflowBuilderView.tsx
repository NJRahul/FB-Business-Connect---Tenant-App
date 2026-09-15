import { useState } from 'react';
import {
  Plus, Zap, Filter, ArrowDown, Play, Pause, Trash2,
  CheckCircle2, XCircle, AlertTriangle, ChevronDown, Eye,
  RotateCcw, GripVertical, Bell,
} from 'lucide-react';
import { WORKFLOWS, WORKFLOW_EXECUTIONS } from './mockData';
import type { Workflow, WorkflowAction, WorkflowCondition, WorkflowTrigger, WorkflowActionType } from './types';

// ─── Label maps ───────────────────────────────────────────────────────────────

const TRIGGER_LABELS: Record<WorkflowTrigger, string> = {
  'booking.created':             'Booking created',
  'booking.rescheduled':         'Booking rescheduled',
  'booking.cancelled':           'Booking cancelled',
  'visit.completed':             'Visit completed',
  'invoice.paid':                'Invoice paid',
  'inspection.completed':        'Inspection completed',
  'inspection.critical_findings':'Inspection: critical findings',
  'recommendation.deferred_60d': 'Recommendation deferred 60+ days',
  'customer.no_visit_180d':      'Customer: no visit 180+ days',
  'fleet.credit_limit_80pct':    'Fleet: credit limit ≥ 80%',
  'warranty.expires_30d':        'Warranty expires in 30 days',
  'plan.enrolled':               'Member enrolled in plan',
  'plan.renewed':                'Membership auto-renewed',
};

const ACTION_LABELS: Record<WorkflowActionType, { label: string; icon: string; color: string }> = {
  send_email:         { label: 'Send Email',              icon: '✉️', color: '#1D4ED8' },
  send_sms:           { label: 'Send SMS',                icon: '💬', color: '#7E22CE' },
  add_to_segment:     { label: 'Add to Segment',          icon: '🏷️', color: '#0369A1' },
  create_task:        { label: 'Create Staff Task',        icon: '✅', color: '#D97706' },
  send_slack:         { label: 'Send Slack / Teams',       icon: '📣', color: '#16A34A' },
  send_webhook:       { label: 'Send Webhook',             icon: '🔗', color: '#374151' },
  create_discount:    { label: 'Create Discount Code',     icon: '🎟️', color: '#00A9AC' },
  add_tag:            { label: 'Add Tag',                  icon: '🔖', color: '#9CA3AF' },
  schedule_trigger:   { label: 'Schedule Future Trigger',  icon: '⏰', color: '#F59E0B' },
  send_campaign_step: { label: 'Send Campaign Step',       icon: '📧', color: '#EA580C' },
  route_notification: { label: 'Route Notification',       icon: '📡', color: '#0D9488' },
};

const CONDITION_FIELDS = [
  'customer.ltv', 'customer.visit_count', 'customer.last_visit_days',
  'visit.total', 'visit.service_type',
  'inspection.critical_count', 'inspection.findings_count',
  'fleet.credit_used_pct', 'campaign.source',
  'plan.tier', 'order.total',
];

const CONDITION_OPERATORS = ['>', '<', '>=', '<=', '=', '!=', 'contains', 'is_empty'];

// ─── TriggerCard ─────────────────────────────────────────────────────────────

function TriggerCard({ trigger, onChange }: { trigger: WorkflowTrigger; onChange: (t: WorkflowTrigger) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-[12px] p-5 relative" style={{ border: '2px solid #00A9AC', background: '#fff', boxShadow: '0 2px 12px rgba(192,57,43,0.12)' }}>
      <div className="absolute -top-3 left-4 flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold" style={{ background: '#00A9AC', color: '#fff' }}>
        <Zap size={11} fill="#fff" /> TRIGGER
      </div>
      <p style={{ color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
        When this event fires…
      </p>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-[8px] text-left"
        style={{ border: '1.5px solid #E5E7EB', background: '#F9FAFB' }}
      >
        <span style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>
          {TRIGGER_LABELS[trigger]}
        </span>
        <ChevronDown size={15} style={{ color: '#9CA3AF', flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {open && (
        <div className="mt-1 rounded-[8px] overflow-y-auto" style={{ border: '1px solid #E5E7EB', maxHeight: '200px' }}>
          {(Object.keys(TRIGGER_LABELS) as WorkflowTrigger[]).map(t => (
            <button
              key={t}
              onClick={() => { onChange(t); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm"
              style={{ background: t === trigger ? '#E6F7F7' : 'transparent', color: t === trigger ? '#00A9AC' : '#374151', borderBottom: '1px solid #F3F4F6' }}
            >
              {TRIGGER_LABELS[t]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ConditionCard ────────────────────────────────────────────────────────────

function ConditionCard({ condition, index, total, onChange, onRemove }: {
  condition: WorkflowCondition;
  index: number;
  total: number;
  onChange: (c: WorkflowCondition) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-[10px] p-4" style={{ border: '1.5px solid #E5E7EB', background: '#fff' }}>
      <div className="flex items-center gap-2 mb-3">
        {index > 0 && (
          <button
            onClick={() => onChange({ ...condition, logic: condition.logic === 'AND' ? 'OR' : 'AND' })}
            className="px-2 py-0.5 rounded text-xs font-bold"
            style={{ background: condition.logic === 'AND' ? '#EFF6FF' : '#FDF4FF', color: condition.logic === 'AND' ? '#1D4ED8' : '#7E22CE' }}
          >
            {condition.logic}
          </button>
        )}
        <Filter size={12} style={{ color: '#9CA3AF' }} />
        <span style={{ fontWeight: 600, color: '#374151', fontSize: '0.8125rem' }}>Condition {index + 1}</span>
        <button onClick={onRemove} className="ml-auto" style={{ color: '#DC2626' }}>
          <Trash2 size={13} />
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <select
          value={condition.field}
          onChange={e => onChange({ ...condition, field: e.target.value })}
          className="px-2 py-1.5 rounded-[6px] text-sm flex-1"
          style={{ border: '1.5px solid #E5E7EB', outline: 'none', color: '#374151', minWidth: '130px' }}
        >
          {CONDITION_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select
          value={condition.operator}
          onChange={e => onChange({ ...condition, operator: e.target.value })}
          className="px-2 py-1.5 rounded-[6px] text-sm"
          style={{ border: '1.5px solid #E5E7EB', outline: 'none', color: '#374151', width: '90px' }}
        >
          {CONDITION_OPERATORS.map(op => <option key={op} value={op}>{op}</option>)}
        </select>
        <input
          value={condition.value}
          onChange={e => onChange({ ...condition, value: e.target.value })}
          className="px-2 py-1.5 rounded-[6px] text-sm flex-1"
          style={{ border: '1.5px solid #E5E7EB', outline: 'none', color: '#374151', minWidth: '80px' }}
          placeholder="Value"
        />
      </div>
    </div>
  );
}

// ─── ActionCard ───────────────────────────────────────────────────────────────

function ActionCard({ action, index, onChange, onRemove }: {
  action: WorkflowAction;
  index: number;
  onChange: (a: WorkflowAction) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const meta = ACTION_LABELS[action.type];

  return (
    <div className="rounded-[10px] p-4" style={{ border: '1.5px solid #E5E7EB', background: '#fff' }}>
      <div className="flex items-center gap-2 mb-3">
        <GripVertical size={14} style={{ color: '#D1D5DB', cursor: 'grab' }} />
        <span style={{ fontSize: '1rem' }}>{meta.icon}</span>
        <span style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.875rem' }}>{meta.label}</span>
        <span style={{ fontSize: '0.75rem', color: '#9CA3AF', marginLeft: '2px' }}>Action {index + 1}</span>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setOpen(o => !o)} style={{ color: '#9CA3AF' }}>
            <ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          <button onClick={onRemove} style={{ color: '#DC2626' }}><Trash2 size={13} /></button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 mb-2">
        <select
          value={action.type}
          onChange={e => onChange({ ...action, type: e.target.value as WorkflowActionType })}
          className="flex-1 px-2 py-1.5 rounded-[6px] text-sm"
          style={{ border: '1.5px solid #E5E7EB', outline: 'none', color: '#374151' }}
        >
          {(Object.keys(ACTION_LABELS) as WorkflowActionType[]).map(t => (
            <option key={t} value={t}>{ACTION_LABELS[t].label}</option>
          ))}
        </select>
      </div>

      {open && (
        <div className="space-y-2 mt-2">
          {Object.entries(action.config).map(([k, v]) => (
            <div key={k} className="flex gap-2 items-center">
              <span style={{ color: '#9CA3AF', fontSize: '0.75rem', minWidth: '80px' }}>{k}</span>
              <input
                defaultValue={v}
                onChange={e => onChange({ ...action, config: { ...action.config, [k]: e.target.value } })}
                className="flex-1 px-2 py-1 rounded-[6px] text-sm"
                style={{ border: '1px solid #E5E7EB', outline: 'none', color: '#374151' }}
              />
            </div>
          ))}
          {Object.keys(action.config).length === 0 && (
            <p style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>No additional configuration for this action.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Canvas ───────────────────────────────────────────────────────────────────

function WorkflowCanvas({ workflow, onChange }: { workflow: Workflow; onChange: (w: Workflow) => void }) {
  function addCondition() {
    const newCond: WorkflowCondition = {
      id: `c${Date.now()}`,
      logic: 'AND',
      field: 'customer.ltv',
      operator: '>',
      value: '0',
    };
    onChange({ ...workflow, conditions: [...workflow.conditions, newCond] });
  }

  function updateCondition(i: number, c: WorkflowCondition) {
    const conds = [...workflow.conditions];
    conds[i] = c;
    onChange({ ...workflow, conditions: conds });
  }

  function removeCondition(i: number) {
    onChange({ ...workflow, conditions: workflow.conditions.filter((_, idx) => idx !== i) });
  }

  function addAction() {
    const newAction: WorkflowAction = {
      id: `a${Date.now()}`,
      type: 'send_email',
      config: { template: '', delay: '0' },
    };
    onChange({ ...workflow, actions: [...workflow.actions, newAction] });
  }

  function updateAction(i: number, a: WorkflowAction) {
    const acts = [...workflow.actions];
    acts[i] = a;
    onChange({ ...workflow, actions: acts });
  }

  function removeAction(i: number) {
    onChange({ ...workflow, actions: workflow.actions.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      {/* Trigger */}
      <TriggerCard
        trigger={workflow.triggerType}
        onChange={t => onChange({ ...workflow, triggerType: t })}
      />

      {/* Connector */}
      <div className="flex items-center justify-center gap-2">
        <div className="w-px h-6" style={{ background: '#E5E7EB' }} />
        <ArrowDown size={14} style={{ color: '#D1D5DB' }} />
      </div>

      {/* Conditions block */}
      <div className="rounded-[12px] p-4" style={{ border: '1.5px dashed #E5E7EB', background: '#FAFAFA' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Filter size={14} style={{ color: '#7E22CE' }} />
            <span style={{ fontWeight: 700, color: '#374151', fontSize: '0.875rem' }}>Conditions</span>
            <span style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>
              {workflow.conditions.length === 0 ? '(always run)' : `${workflow.conditions.length} filter${workflow.conditions.length > 1 ? 's' : ''}`}
            </span>
          </div>
          <button onClick={addCondition} className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#7E22CE' }}>
            <Plus size={12} /> Add condition
          </button>
        </div>
        {workflow.conditions.length === 0 ? (
          <p style={{ color: '#D1D5DB', fontSize: '0.8125rem', textAlign: 'center', padding: '8px 0' }}>
            No conditions — workflow runs for every matching trigger event.
          </p>
        ) : (
          <div className="space-y-2">
            {workflow.conditions.map((c, i) => (
              <ConditionCard
                key={c.id}
                condition={c}
                index={i}
                total={workflow.conditions.length}
                onChange={cond => updateCondition(i, cond)}
                onRemove={() => removeCondition(i)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Connector */}
      <div className="flex items-center justify-center gap-2">
        <div className="w-px h-6" style={{ background: '#E5E7EB' }} />
        <ArrowDown size={14} style={{ color: '#D1D5DB' }} />
      </div>

      {/* Actions block */}
      <div className="rounded-[12px] p-4" style={{ border: '1.5px solid #E5E7EB', background: '#fff' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Play size={14} style={{ color: '#00A9AC' }} />
            <span style={{ fontWeight: 700, color: '#374151', fontSize: '0.875rem' }}>Actions</span>
            <span style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>{workflow.actions.length} action{workflow.actions.length !== 1 ? 's' : ''}</span>
          </div>
          <button onClick={addAction} className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#00A9AC' }}>
            <Plus size={12} /> Add action
          </button>
        </div>
        {workflow.actions.length === 0 ? (
          <div className="text-center py-4">
            <p style={{ color: '#D1D5DB', fontSize: '0.875rem' }}>No actions yet — add one above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {workflow.actions.map((a, i) => (
              <ActionCard
                key={a.id}
                action={a}
                index={i}
                onChange={act => updateAction(i, act)}
                onRemove={() => removeAction(i)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Execution Log ────────────────────────────────────────────────────────────

function ExecutionLog() {
  const [replayedIds, setReplayedIds] = useState<Set<string>>(new Set());

  function fmtTime(iso: string) {
    return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  }

  return (
    <div>
      <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.0625rem', marginBottom: '12px' }}>
        Execution Log
      </h3>
      <div className="bg-white rounded-[10px] overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              {['Workflow', 'Trigger Event', 'Conditions', 'Actions', 'Status', 'Time', ''].map(h => (
                <th key={h} className="px-4 py-2.5 text-left" style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {WORKFLOW_EXECUTIONS.map(ex => {
              const successCount = ex.actionsLog.filter(a => a.status === 'success').length;
              const failCount = ex.actionsLog.filter(a => a.status === 'failed').length;
              const replayed = replayedIds.has(ex.id);

              return (
                <tr key={ex.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td className="px-4 py-3">
                    <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.875rem' }}>{ex.workflowName}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p style={{ color: '#6B7280', fontSize: '0.8125rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.triggerEvent}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-xs font-semibold" style={{
                      background: ex.conditionsMatched ? '#DCFCE7' : '#F3F4F6',
                      color: ex.conditionsMatched ? '#16A34A' : '#9CA3AF',
                    }}>
                      {ex.conditionsMatched ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                      {ex.conditionsMatched ? 'Matched' : 'Not matched'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {ex.actionsLog.length === 0 ? (
                      <span style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>—</span>
                    ) : (
                      <div className="flex items-center gap-1">
                        {ex.actionsLog.map((a, i) => (
                          <span
                            key={i}
                            title={`${ACTION_LABELS[a.type]?.label}: ${a.detail}`}
                            className="w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: a.status === 'success' ? '#DCFCE7' : '#FEF2F2' }}
                          >
                            {a.status === 'success'
                              ? <CheckCircle2 size={12} style={{ color: '#16A34A' }} />
                              : <XCircle size={12} style={{ color: '#DC2626' }} />
                            }
                          </span>
                        ))}
                        {failCount > 0 && (
                          <span style={{ color: '#DC2626', fontSize: '0.75rem', fontWeight: 600 }}>({failCount} failed)</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        background: ex.status === 'success' ? '#DCFCE7' : ex.status === 'partial' ? '#FEF3C7' : '#FEF2F2',
                        color: ex.status === 'success' ? '#16A34A' : ex.status === 'partial' ? '#D97706' : '#DC2626',
                      }}
                    >
                      {ex.status === 'success' ? 'Success' : ex.status === 'partial' ? 'Partial' : 'Failed'}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: '#9CA3AF', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                    {fmtTime(ex.startedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setReplayedIds(s => new Set([...s, ex.id]))}
                      className="flex items-center gap-1 text-xs font-semibold"
                      style={{ color: replayed ? '#16A34A' : '#00A9AC' }}
                    >
                      {replayed ? <CheckCircle2 size={12} /> : <RotateCcw size={12} />}
                      {replayed ? 'Replayed' : 'Replay'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Workflow List ────────────────────────────────────────────────────────────

function WorkflowList({ onEdit }: { onEdit: (w: Workflow) => void }) {
  const [workflows, setWorkflows] = useState(WORKFLOWS);

  function toggleStatus(id: string) {
    setWorkflows(prev => prev.map(w => {
      if (w.id !== id) return w;
      return { ...w, status: w.status === 'active' ? 'paused' : 'active' };
    }));
  }

  return (
    <div className="space-y-3">
      {workflows.map(w => {
        const isFromCampaign = w.source === 'campaign';
        return (
          <div key={w.id} className="bg-white rounded-[10px] p-4" style={{ border: '1.5px solid #E5E7EB', opacity: w.status === 'paused' ? 0.7 : 1 }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>{w.name}</p>
                  <span
                    className="px-1.5 py-0.5 rounded text-xs font-bold"
                    style={{ background: w.status === 'active' ? '#DCFCE7' : '#F3F4F6', color: w.status === 'active' ? '#16A34A' : '#9CA3AF' }}
                  >
                    {w.status.charAt(0).toUpperCase() + w.status.slice(1)}
                  </span>
                  {isFromCampaign && (
                    <span className="px-1.5 py-0.5 rounded text-xs font-bold" style={{ background: '#FEF3C7', color: '#D97706' }}>
                      From Campaign
                    </span>
                  )}
                </div>
                <p style={{ color: '#6B7280', fontSize: '0.8125rem', marginBottom: '8px' }}>
                  Trigger: <strong style={{ color: '#374151' }}>{TRIGGER_LABELS[w.triggerType]}</strong>
                  {' · '}
                  {w.conditions.length} condition{w.conditions.length !== 1 ? 's' : ''}
                  {' · '}
                  {w.actions.length} action{w.actions.length !== 1 ? 's' : ''}
                </p>
                <div className="flex items-center gap-3 text-xs" style={{ color: '#9CA3AF' }}>
                  <span>{w.executionCount.toLocaleString()} executions</span>
                  {w.lastExecutedAt && (
                    <span>Last: {new Date(w.lastExecutedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onEdit(w)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-[6px] text-xs font-semibold"
                  style={{ border: '1.5px solid #E5E7EB', color: '#374151' }}
                >
                  <Eye size={12} /> Edit
                </button>
                <button
                  onClick={() => toggleStatus(w.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-[6px] text-xs font-semibold"
                  style={{ border: '1.5px solid #E5E7EB', color: w.status === 'active' ? '#D97706' : '#16A34A' }}
                >
                  {w.status === 'active' ? <Pause size={12} /> : <Play size={12} />}
                  {w.status === 'active' ? 'Pause' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

export function WorkflowBuilderView() {
  const [view, setView] = useState<'list' | 'builder' | 'log'>('list');
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow>(WORKFLOWS[0]);
  const [testPreviewOpen, setTestPreviewOpen] = useState(false);

  function handleEdit(w: Workflow) {
    setEditingWorkflow(w);
    setView('builder');
  }

  function createNew() {
    setEditingWorkflow({
      id: `wf-new-${Date.now()}`,
      name: 'New Workflow',
      triggerType: 'visit.completed',
      conditions: [],
      actions: [],
      status: 'draft',
      source: 'builder',
      executionCount: 0,
      lastExecutedAt: null,
      createdAt: new Date().toISOString(),
    });
    setView('builder');
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.125rem' }}>Workflow Automation</h2>
          <p style={{ color: '#6B7280', fontSize: '0.8125rem', marginTop: '2px' }}>
            Visual "when X happens, do Y" builder. Includes all webhook triggers plus internal-only conditions.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 p-1 rounded-[8px]" style={{ background: '#F3F4F6' }}>
            {[
              { id: 'list' as const, label: 'All Workflows' },
              { id: 'builder' as const, label: 'Builder' },
              { id: 'log' as const, label: 'Execution Log' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setView(t.id)}
                className="px-3 py-1.5 rounded-[6px] text-xs font-semibold"
                style={{ background: view === t.id ? '#fff' : 'transparent', color: view === t.id ? '#1A1A1A' : '#6B7280', boxShadow: view === t.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
              >
                {t.label}
              </button>
            ))}
          </div>
          {view !== 'builder' && (
            <button onClick={createNew} className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] text-sm font-semibold text-white" style={{ background: '#00A9AC' }}>
              <Plus size={14} /> New Workflow
            </button>
          )}
        </div>
      </div>

      {/* Loop detection notice */}
      <div className="mb-4 p-3 rounded-[8px] flex items-start gap-2" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
        <AlertTriangle size={14} style={{ color: '#F39C12', marginTop: '2px', flexShrink: 0 }} />
        <p style={{ color: '#92400E', fontSize: '0.8125rem' }}>
          <strong>Loop detection active.</strong> The engine prevents Workflow A → event → Workflow B → event → Workflow A cycles. If a loop is detected, execution is halted and surfaced in this log.
        </p>
      </div>

      {view === 'list' && (
        <>
          <div className="mb-3 flex items-center justify-between">
            <p style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>
              Unified view — includes workflows created here and campaign triggers compiled from the Marketing module.
            </p>
          </div>
          <WorkflowList onEdit={handleEdit} />
        </>
      )}

      {view === 'builder' && (
        <div className="flex gap-4">
          <div className="flex-1 min-w-0">
            {/* Builder header */}
            <div className="flex items-center gap-3 mb-4 p-3 rounded-[10px]" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
              <input
                value={editingWorkflow.name}
                onChange={e => setEditingWorkflow(w => ({ ...w, name: e.target.value }))}
                className="flex-1 px-3 py-1.5 rounded-[6px] text-sm font-bold"
                style={{ border: '1.5px solid #E5E7EB', outline: 'none', color: '#1A1A1A', fontFamily: 'Sora, sans-serif', fontSize: '0.9375rem' }}
              />
              <button
                onClick={() => setTestPreviewOpen(o => !o)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-sm font-semibold"
                style={{ border: '1.5px solid #E5E7EB', color: '#374151' }}
              >
                <Eye size={13} /> Test Preview
              </button>
              <button
                onClick={() => setView('list')}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-[6px] text-sm font-semibold text-white"
                style={{ background: '#00A9AC' }}
              >
                Save
              </button>
            </div>

            <WorkflowCanvas
              workflow={editingWorkflow}
              onChange={setEditingWorkflow}
            />
          </div>

          {/* Test preview panel */}
          {testPreviewOpen && (
            <div className="w-72 shrink-0 rounded-[12px] p-4" style={{ border: '1.5px solid #E5E7EB', background: '#FAFAFA', alignSelf: 'flex-start', position: 'sticky', top: 0 }}>
              <div className="flex items-center justify-between mb-3">
                <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.875rem' }}>Test Preview</p>
                <button onClick={() => setTestPreviewOpen(false)} style={{ color: '#9CA3AF' }}>✕</button>
              </div>
              <p style={{ color: '#6B7280', fontSize: '0.8125rem', marginBottom: '12px' }}>
                Simulate this workflow against your historical data. No emails or actions fire.
              </p>
              <div className="p-3 rounded-[8px] mb-3" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
                <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.875rem' }}>Match estimate</p>
                <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, color: '#00A9AC', fontSize: '1.5rem' }}>47</p>
                <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>customers would have matched in the last 90 days</p>
              </div>
              <div className="space-y-2 mb-3">
                {['Sarah Chen — visit.completed 2026-06-16', 'Marcus Johnson — visit.completed 2026-06-14', 'Diana Ruiz — visit.completed 2026-06-12'].map((s, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-[6px]" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
                    <CheckCircle2 size={12} style={{ color: '#27AE60', flexShrink: 0 }} />
                    <span style={{ color: '#374151', fontSize: '0.75rem' }}>{s}</span>
                  </div>
                ))}
                <p style={{ color: '#9CA3AF', fontSize: '0.75rem', textAlign: 'center' }}>+ 44 more matches</p>
              </div>
              <button className="w-full py-2 rounded-[8px] text-sm font-semibold text-white" style={{ background: '#00A9AC' }}>
                Run Full Preview
              </button>
            </div>
          )}
        </div>
      )}

      {view === 'log' && <ExecutionLog />}
    </div>
  );
}

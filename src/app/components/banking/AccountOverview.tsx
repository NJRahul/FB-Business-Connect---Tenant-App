import { useState } from 'react';
import { RefreshCw, Eye, EyeOff, Plus, X, ArrowRight, GripVertical, ToggleLeft, ToggleRight, Lock } from 'lucide-react';
import { formatCents } from '../../../lib/banking/types';
import type { BankingAccount, BankingVault, BankingVaultRule, AllocationType } from '../../../lib/banking/types';
import { MOCK_VAULT_RULES } from './mockData';

// ─── MFA Modal ────────────────────────────────────────────────────────────────

function MFAModal({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  function submit() {
    if (code === '123456') { onConfirm(); }
    else { setError(true); setCode(''); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-white rounded-[12px] p-6 shadow-xl" style={{ width: 360 }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#FEF2F2' }}>
            <Lock size={18} style={{ color: '#C0392B' }} />
          </div>
          <div>
            <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '1rem' }}>MFA Required</p>
            <p style={{ color: '#6B7280', fontSize: '0.8125rem' }}>Enter the 6-digit code from your authenticator app.</p>
          </div>
        </div>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setError(false); }}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="000000"
          autoFocus
          className="w-full text-center py-3 rounded-[8px] text-xl font-mono tracking-[0.3em]"
          style={{ border: `1.5px solid ${error ? '#C0392B' : '#E5E7EB'}`, outline: 'none', letterSpacing: '0.4em' }}
        />
        {error && <p style={{ color: '#C0392B', fontSize: '0.8125rem', marginTop: 6, textAlign: 'center' }}>Invalid code. (Demo: use 123456)</p>}
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-[8px] font-semibold" style={{ background: '#F3F4F6', color: '#374151' }}>Cancel</button>
          <button onClick={submit} className="flex-1 py-2.5 rounded-[8px] font-semibold" style={{ background: '#C0392B', color: '#fff' }}>Verify</button>
        </div>
      </div>
    </div>
  );
}

// ─── Vault card ───────────────────────────────────────────────────────────────

function VaultCard({ vault, selected, onClick }: { vault: BankingVault; selected: boolean; onClick: () => void }) {
  const pct = vault.target_balance ? Math.min(100, (vault.balance_cached / vault.target_balance) * 100) : null;
  const r = 22;
  const circ = 2 * Math.PI * r;
  const offset = pct !== null ? circ - (pct / 100) * circ : 0;

  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 rounded-[10px] p-4 text-left transition-all"
      style={{
        width: 180,
        border: `1.5px solid ${selected ? '#1A1A1A' : '#E5E7EB'}`,
        background: selected ? '#1A1A1A' : '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      {pct !== null && (
        <div className="flex justify-center mb-3">
          <svg width={54} height={54} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={27} cy={27} r={r} fill="none" stroke={selected ? '#333' : '#E5E7EB'} strokeWidth={4} />
            <circle cx={27} cy={27} r={r} fill="none" stroke={selected ? '#fff' : '#C0392B'} strokeWidth={4}
              strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
          </svg>
        </div>
      )}
      <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: selected ? '#fff' : '#1A1A1A', marginBottom: 2 }}>{vault.name}</p>
      <p style={{ fontFeatureSettings: '"tnum"', fontVariantNumeric: 'tabular-nums', fontSize: '1.125rem', fontWeight: 700, color: selected ? '#fff' : '#1A1A1A' }}>
        {formatCents(vault.balance_cached)}
      </p>
      {vault.target_balance && (
        <p style={{ fontSize: '0.75rem', color: selected ? '#9CA3AF' : '#6B7280', marginTop: 2 }}>
          of {formatCents(vault.target_balance)} target
        </p>
      )}
    </button>
  );
}

// ─── Allocation rule row ──────────────────────────────────────────────────────

function RuleRow({
  rule, vaultOptions, onToggle, onDelete, onUpdate,
}: {
  rule: BankingVaultRule;
  vaultOptions: { value: string; label: string }[];
  onToggle: () => void;
  onDelete: () => void;
  onUpdate: (patch: Partial<BankingVaultRule>) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-[8px]" style={{ border: '1px solid #E5E7EB', background: '#fff' }}>
      <GripVertical size={16} style={{ color: '#D1D5DB', cursor: 'grab', flexShrink: 0 }} />
      <div className="flex-1 flex items-center gap-2 flex-wrap">
        <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>On deposit →</span>
        <select
          value={rule.allocation_type}
          onChange={e => onUpdate({ allocation_type: e.target.value as AllocationType })}
          className="px-2 py-1 rounded-[6px] text-sm"
          style={{ border: '1px solid #E5E7EB', background: '#F9FAFB' }}
        >
          <option value="percentage">%</option>
          <option value="fixed">fixed $</option>
        </select>
        <input
          type="number"
          value={rule.allocation_value}
          onChange={e => onUpdate({ allocation_value: parseFloat(e.target.value) || 0 })}
          className="w-16 px-2 py-1 rounded-[6px] text-sm text-center"
          style={{ border: '1px solid #E5E7EB', fontFeatureSettings: '"tnum"' }}
        />
        <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>→</span>
        <select
          value={rule.vault_id}
          onChange={e => onUpdate({ vault_id: e.target.value, vault_name: vaultOptions.find(v => v.value === e.target.value)?.label ?? '' })}
          className="px-2 py-1 rounded-[6px] text-sm"
          style={{ border: '1px solid #E5E7EB', background: '#F9FAFB' }}
        >
          {vaultOptions.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
        </select>
      </div>
      <button onClick={onToggle} style={{ color: rule.active ? '#27AE60' : '#D1D5DB', flexShrink: 0 }}>
        {rule.active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
      </button>
      <button onClick={onDelete} style={{ color: '#D1D5DB', flexShrink: 0 }}>
        <X size={16} />
      </button>
    </div>
  );
}

// ─── Vault transfer modal ─────────────────────────────────────────────────────

function VaultTransferModal({ vaults, onClose, onTransfer }: {
  vaults: BankingVault[];
  onClose: () => void;
  onTransfer: (fromId: string, toId: string, cents: number) => void;
}) {
  const [from, setFrom] = useState(vaults[0]?.id ?? '');
  const [to, setTo] = useState(vaults[1]?.id ?? '');
  const [amount, setAmount] = useState('');

  const fromVault = vaults.find(v => v.id === from);
  const amountCents = Math.round(parseFloat(amount || '0') * 100);
  const insufficient = fromVault && amountCents > fromVault.balance_cached;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-white rounded-[12px] p-6 shadow-xl" style={{ width: 400 }}>
        <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A', fontSize: '1.125rem', marginBottom: 20 }}>Transfer between vaults</p>
        <div className="space-y-4">
          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>From</label>
            <select value={from} onChange={e => setFrom(e.target.value)} className="w-full px-3 py-2 rounded-[6px]" style={{ border: '1px solid #E5E7EB' }}>
              {vaults.map(v => <option key={v.id} value={v.id}>{v.name} ({formatCents(v.balance_cached)})</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>To</label>
            <select value={to} onChange={e => setTo(e.target.value)} className="w-full px-3 py-2 rounded-[6px]" style={{ border: '1px solid #E5E7EB' }}>
              {vaults.filter(v => v.id !== from).map(v => <option key={v.id} value={v.id}>{v.name} ({formatCents(v.balance_cached)})</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Amount</label>
            <div className="relative">
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>$</span>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full px-3 py-2 rounded-[6px]" style={{ paddingLeft: 24, border: `1px solid ${insufficient ? '#C0392B' : '#E5E7EB'}`, outline: 'none' }} />
            </div>
            {insufficient && <p style={{ color: '#C0392B', fontSize: '0.8125rem', marginTop: 4 }}>Insufficient balance. Available: {formatCents(fromVault!.balance_cached)}</p>}
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-[8px] font-semibold" style={{ background: '#F3F4F6', color: '#374151' }}>Cancel</button>
          <button
            onClick={() => !insufficient && amountCents > 0 && onTransfer(from, to, amountCents)}
            disabled={insufficient || amountCents <= 0}
            className="flex-1 py-2.5 rounded-[8px] font-semibold"
            style={{ background: !insufficient && amountCents > 0 ? '#1A1A1A' : '#E5E7EB', color: !insufficient && amountCents > 0 ? '#fff' : '#9CA3AF' }}
          >
            Transfer instantly
          </button>
        </div>
        <p style={{ color: '#9CA3AF', fontSize: '0.75rem', textAlign: 'center', marginTop: 8 }}>Vault transfers are instant and free.</p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  account: BankingAccount;
  vaults: BankingVault[];
}

export function AccountOverview({ account, vaults: initialVaults }: Props) {
  const [vaults, setVaults] = useState(initialVaults);
  const [rules, setRules] = useState<BankingVaultRule[]>(MOCK_VAULT_RULES);
  const [selectedVault, setSelectedVault] = useState<string | null>(null);
  const [showMFA, setShowMFA] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncedAt, setSyncedAt] = useState(new Date(account.synced_at));

  const totalBalance = vaults.reduce((s, v) => s + v.balance_cached, 0);
  const vaultOptions = vaults.map(v => ({ value: v.id, label: v.name }));

  async function handleSync() {
    setSyncing(true);
    await new Promise(r => setTimeout(r, 800));
    setSyncedAt(new Date());
    setSyncing(false);
  }

  function handleTransfer(fromId: string, toId: string, cents: number) {
    setVaults(prev => prev.map(v => {
      if (v.id === fromId) return { ...v, balance_cached: v.balance_cached - cents };
      if (v.id === toId)   return { ...v, balance_cached: v.balance_cached + cents };
      return v;
    }));
    setShowTransfer(false);
  }

  function addRule() {
    const v = vaults.find(v => !v.is_default) ?? vaults[0];
    setRules(prev => [...prev, {
      id: `vr${Date.now()}`, shop_id: 'shop1', vault_id: v.id, vault_name: v.name,
      trigger: 'inbound_deposit', allocation_type: 'percentage', allocation_value: 0,
      priority: prev.length + 1, active: true,
    }]);
  }

  function addVault() {
    if (vaults.length >= 10) return;
    setVaults(prev => [...prev, {
      id: `v${Date.now()}`, shop_id: 'shop1', account_id: account.id,
      name: 'New Vault', balance_cached: 0, currency: 'ZAR',
      is_default: false, sort_order: prev.length,
    }]);
  }

  const minutesAgo = Math.floor((Date.now() - syncedAt.getTime()) / 60000);

  // Live worked example for rule builder
  const exampleDeposit = 100000; // $1,000
  const exampleRemaining = rules.filter(r => r.active).reduce((remain, rule) => {
    if (rule.allocation_type === 'percentage') return remain - Math.round((rule.allocation_value / 100) * exampleDeposit);
    return remain - rule.allocation_value;
  }, exampleDeposit);

  return (
    <div>
      {/* Balance hero */}
      <div className="rounded-[12px] p-6 mb-6" style={{ background: '#1A1A1A', color: '#fff' }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Available balance</p>
            <p style={{ fontFeatureSettings: '"tnum"', fontVariantNumeric: 'tabular-nums', fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {formatCents(totalBalance)}
            </p>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: 6 }}>
              <span style={{ color: '#9CA3AF' }}>Pending: </span>
              <span style={{ fontFeatureSettings: '"tnum"', fontVariantNumeric: 'tabular-nums' }}>
                {formatCents(account.balance_pending_cached)}
              </span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={handleSync}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-sm"
              style={{ background: '#2A2A2A', color: '#9CA3AF' }}
            >
              <RefreshCw size={13} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
              Sync
            </button>
            <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>
              Synced {minutesAgo === 0 ? 'just now' : `${minutesAgo}m ago`}
            </p>
          </div>
        </div>

        {/* Account number reveal */}
        <div className="flex items-center gap-4 pt-4" style={{ borderTop: '1px solid #2A2A2A' }}>
          <div>
            <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: 2 }}>Routing</p>
            <p style={{ fontFeatureSettings: '"tnum"', color: '#fff', fontWeight: 600, letterSpacing: '0.05em' }}>
              0110{account.routing_last4}
            </p>
          </div>
          <div style={{ width: 1, height: 32, background: '#2A2A2A' }} />
          <div>
            <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: 2 }}>Account</p>
            {revealed ? (
              <p style={{ fontFeatureSettings: '"tnum"', color: '#fff', fontWeight: 600, letterSpacing: '0.08em' }}>
                •••• •••• {account.account_last4}
              </p>
            ) : (
              <p style={{ color: '#6B7280', letterSpacing: '0.1em' }}>•••• •••• ••••</p>
            )}
          </div>
          <button
            onClick={() => revealed ? setRevealed(false) : setShowMFA(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-sm ml-auto"
            style={{ background: '#2A2A2A', color: '#9CA3AF' }}
          >
            {revealed ? <EyeOff size={13} /> : <Eye size={13} />}
            {revealed ? 'Hide' : 'Reveal'}
          </button>
        </div>
      </div>

      {/* Vault chips */}
      <div className="mb-2 flex items-center justify-between">
        <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '1rem' }}>Vaults</p>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowTransfer(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-sm font-semibold" style={{ background: '#F3F4F6', color: '#374151' }}>
            <ArrowRight size={14} /> Transfer
          </button>
          {vaults.length < 10 && (
            <button onClick={addVault} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-sm font-semibold" style={{ background: '#F3F4F6', color: '#374151' }}>
              <Plus size={14} /> Add vault
            </button>
          )}
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-3 mb-6" style={{ scrollbarWidth: 'thin' }}>
        {vaults.map(v => (
          <VaultCard key={v.id} vault={v} selected={selectedVault === v.id} onClick={() => setSelectedVault(selectedVault === v.id ? null : v.id)} />
        ))}
      </div>

      {/* Allocation rules */}
      <div className="rounded-[10px] overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
        <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: '#E5E7EB', background: '#F9FAFB' }}>
          <div>
            <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>Deposit allocation rules</p>
            <p style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>Rules run in priority order on every inbound deposit. Remainder goes to Operating.</p>
          </div>
          <button onClick={addRule} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-sm font-semibold" style={{ background: '#1A1A1A', color: '#fff' }}>
            <Plus size={14} /> Add rule
          </button>
        </div>
        <div className="p-4 space-y-2">
          {rules.length === 0 && (
            <p style={{ color: '#9CA3AF', fontSize: '0.9375rem', textAlign: 'center', padding: '16px 0' }}>No rules — all deposits go to Operating.</p>
          )}
          {rules.map(rule => (
            <RuleRow
              key={rule.id}
              rule={rule}
              vaultOptions={vaultOptions}
              onToggle={() => setRules(prev => prev.map(r => r.id === rule.id ? { ...r, active: !r.active } : r))}
              onDelete={() => setRules(prev => prev.filter(r => r.id !== rule.id))}
              onUpdate={patch => setRules(prev => prev.map(r => r.id === rule.id ? { ...r, ...patch } : r))}
            />
          ))}
        </div>

        {/* Live example */}
        <div className="border-t px-5 py-4" style={{ borderColor: '#E5E7EB', background: '#F9FAFB' }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#6B7280', marginBottom: 8 }}>Live example — R 1,000 deposit</p>
          <div className="space-y-1">
            {rules.filter(r => r.active).map(rule => {
              const amt = rule.allocation_type === 'percentage'
                ? Math.round((rule.allocation_value / 100) * exampleDeposit)
                : rule.allocation_value;
              return (
                <div key={rule.id} className="flex justify-between text-sm">
                  <span style={{ color: '#374151' }}>→ {rule.vault_name}</span>
                  <span style={{ fontFeatureSettings: '"tnum"', color: '#1A1A1A', fontWeight: 600 }}>{formatCents(amt)}</span>
                </div>
              );
            })}
            <div className="flex justify-between text-sm pt-2" style={{ borderTop: '1px solid #E5E7EB', marginTop: 4 }}>
              <span style={{ color: '#374151', fontWeight: 600 }}>→ Operating (remainder)</span>
              <span style={{ fontFeatureSettings: '"tnum"', color: '#27AE60', fontWeight: 700 }}>{formatCents(Math.max(0, exampleRemaining))}</span>
            </div>
          </div>
        </div>
      </div>

      {showMFA && <MFAModal onConfirm={() => { setRevealed(true); setShowMFA(false); }} onClose={() => setShowMFA(false)} />}
      {showTransfer && <VaultTransferModal vaults={vaults} onClose={() => setShowTransfer(false)} onTransfer={handleTransfer} />}
    </div>
  );
}

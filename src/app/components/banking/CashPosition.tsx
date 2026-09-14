import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { AlertTriangle, Bell, BellOff, Calendar, TrendingDown, TrendingUp } from 'lucide-react';
import { formatCents } from '../../../lib/banking/types';
import type { BankingAccount, BankingVault } from '../../../lib/banking/types';
import { MOCK_CASHFLOW_30D, MOCK_UPCOMING_OBLIGATIONS } from './mockData';

const VAULT_COLORS = ['#1A1A1A', '#C0392B', '#27AE60', '#F39C12', '#2980B9', '#8E44AD'];

interface AlertRule {
  id: string;
  label: string;
  enabled: boolean;
  threshold?: number;
}

interface Props {
  account: BankingAccount;
  vaults: BankingVault[];
}

export function CashPosition({ account, vaults }: Props) {
  const [alerts, setAlerts] = useState<AlertRule[]>([
    { id: 'low_balance',    label: 'Low balance (below $500)',      enabled: true,  threshold: 50000 },
    { id: 'large_txn',      label: 'Large transaction (over $2,500)', enabled: true, threshold: 250000 },
    { id: 'failed_transfer',label: 'Failed or returned transfer',    enabled: true  },
    { id: 'shortfall',      label: 'Projected shortfall before scheduled debit', enabled: false },
    { id: 'card_decline',   label: 'Card decline',                  enabled: true  },
  ]);

  function toggleAlert(id: string) {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  }

  const totalAvailable = vaults.reduce((s, v) => s + v.balance_cached, 0);

  // 30d chart — convert cents to dollars for display
  const chartData = MOCK_CASHFLOW_30D.map(d => ({
    date: d.date.slice(5), // MM-DD
    inflow: d.inflow / 100,
    outflow: d.outflow / 100,
  }));

  const totalInflow30d  = MOCK_CASHFLOW_30D.reduce((s, d) => s + d.inflow, 0);
  const totalOutflow30d = MOCK_CASHFLOW_30D.reduce((s, d) => s + d.outflow, 0);

  // Pie data
  const pieData = vaults.map((v, i) => ({
    name: v.name,
    value: v.balance_cached,
    color: VAULT_COLORS[i % VAULT_COLORS.length],
  }));

  return (
    <div className="space-y-6">

      {/* Summary widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Available',    value: totalAvailable,              sub: 'Across all vaults', color: '#1A1A1A', trend: null },
          { label: 'Pending',      value: account.balance_pending_cached, sub: 'Clearing in 1–2 days', color: '#6B7280', trend: null },
          { label: '30d Inflow',   value: totalInflow30d,              sub: 'Last 30 days',      color: '#27AE60', trend: 'up' },
          { label: '30d Outflow',  value: totalOutflow30d,             sub: 'Last 30 days',      color: '#C0392B', trend: 'down' },
        ].map(w => (
          <div key={w.label} className="rounded-[10px] p-4" style={{ background: '#fff', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between mb-1">
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{w.label}</p>
              {w.trend === 'up'   && <TrendingUp  size={14} style={{ color: '#27AE60' }} />}
              {w.trend === 'down' && <TrendingDown size={14} style={{ color: '#C0392B' }} />}
            </div>
            <p style={{ fontFeatureSettings: '"tnum"', fontVariantNumeric: 'tabular-nums', fontSize: '1.375rem', fontWeight: 700, color: w.color }}>
              {formatCents(w.value)}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: 2 }}>{w.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Vault breakdown donut */}
        <div className="rounded-[10px] p-5 col-span-1" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
          <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem', marginBottom: 16 }}>Vault breakdown</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(value: number) => formatCents(value)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span style={{ fontSize: '0.8125rem', color: '#374151' }}>{d.name}</span>
                </div>
                <span style={{ fontSize: '0.8125rem', fontFeatureSettings: '"tnum"', color: '#1A1A1A', fontWeight: 600 }}>
                  {formatCents(d.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 30-day inflow vs outflow */}
        <div className="rounded-[10px] p-5 col-span-2" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
          <div className="flex items-center justify-between mb-4">
            <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>30-day cash flow</p>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#27AE60' }} /> Inflow</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#C0392B' }} /> Outflow</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={6} barGap={2}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} tickFormatter={v => `R ${(v/1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(val: number) => [`R ${val.toFixed(2)}`, '']}
                contentStyle={{ fontSize: 12, border: '1px solid #E5E7EB', borderRadius: 6 }}
              />
              <Bar dataKey="inflow"  fill="#27AE60" radius={[2,2,0,0]} />
              <Bar dataKey="outflow" fill="#C0392B" radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Upcoming obligations */}
      <div className="rounded-[10px] overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: '#E5E7EB', background: '#F9FAFB' }}>
          <div className="flex items-center gap-2">
            <Calendar size={16} style={{ color: '#6B7280' }} />
            <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>Upcoming obligations</p>
          </div>
        </div>
        <div className="divide-y" style={{ borderColor: '#F3F4F6' }}>
          {MOCK_UPCOMING_OBLIGATIONS.map(ob => {
            const daysOut = Math.ceil((new Date(ob.due).getTime() - Date.now()) / 86400000);
            const canCover = ob.amount <= totalAvailable;
            return (
              <div key={ob.id} className="flex items-center justify-between px-5 py-3.5" style={{ background: '#fff' }}>
                <div className="flex items-center gap-3">
                  {!canCover && <AlertTriangle size={15} style={{ color: '#F39C12', flexShrink: 0 }} />}
                  <div>
                    <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.9375rem' }}>{ob.label}</p>
                    <p style={{ fontSize: '0.8125rem', color: '#9CA3AF' }}>Due {ob.due} · {daysOut} days</p>
                  </div>
                </div>
                <div className="text-right">
                  <p style={{ fontFeatureSettings: '"tnum"', fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>
                    {formatCents(ob.amount)}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: canCover ? '#27AE60' : '#F39C12', fontWeight: 600 }}>
                    {canCover ? '✓ Covered' : '⚠ Shortfall risk'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alert rules */}
      <div className="rounded-[10px] overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: '#E5E7EB', background: '#F9FAFB' }}>
          <div className="flex items-center gap-2">
            <Bell size={16} style={{ color: '#6B7280' }} />
            <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.9375rem' }}>Alert settings</p>
          </div>
        </div>
        <div className="divide-y" style={{ borderColor: '#F3F4F6' }}>
          {alerts.map(a => (
            <div key={a.id} className="flex items-center justify-between px-5 py-3" style={{ background: '#fff' }}>
              <span style={{ color: '#1A1A1A', fontSize: '0.9375rem' }}>{a.label}</span>
              <button
                onClick={() => toggleAlert(a.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-sm font-semibold"
                style={{ background: a.enabled ? '#F0FDF4' : '#F3F4F6', color: a.enabled ? '#27AE60' : '#9CA3AF', border: `1px solid ${a.enabled ? '#BBF7D0' : '#E5E7EB'}` }}
              >
                {a.enabled ? <Bell size={13} /> : <BellOff size={13} />}
                {a.enabled ? 'On' : 'Off'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { ShoppingCart, Plus, CheckCircle2, X, RefreshCw, Loader2 } from 'lucide-react';
import type { ReorderList } from './types';
import { MOCK_REORDER_LISTS, MOCK_FLEET_ACCOUNTS } from './mockData';

function cents(c: number) {
  return `R ${(c / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function FleetQuickReorderView() {
  const [lists, setLists] = useState<ReorderList[]>(MOCK_REORDER_LISTS);
  const [ordering, setOrdering] = useState<string | null>(null);
  const [ordered, setOrdered] = useState<Set<string>>(new Set());
  const [toastMsg, setToastMsg] = useState('');

  function showToast(msg: string) { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3500); }

  function placeOrder(list: ReorderList) {
    setOrdering(list.id);
    setTimeout(() => {
      setOrdering(null);
      setOrdered(s => new Set([...s, list.id]));
      showToast(`"${list.name}" submitted at fleet pricing. Net-terms invoice will be generated.`);
    }, 1200);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.125rem', color: '#1A1A1A' }}>Quick Re-Order Lists</h2>
          <p style={{ fontSize: '0.825rem', color: '#6B7280', marginTop: 2 }}>
            Named recurring-order lists for fleet accounts. All items priced at the fleet's pre-agreed menu.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-[8px] text-sm font-semibold" style={{ background: '#C0392B', color: '#fff' }}>
          <Plus size={14} /> New List
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {lists.map(list => {
          const account = MOCK_FLEET_ACCOUNTS.find(a => a.id === list.fleetAccountId);
          const totalCents = list.lines.reduce((sum, l) => sum + l.agreedPrice * l.defaultQty, 0);
          const isOrdering = ordering === list.id;
          const wasOrdered = ordered.has(list.id);

          return (
            <div key={list.id} className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #F3F4F6' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#FDEDEC' }}>
                    <ShoppingCart size={16} color="#C0392B" />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A1A1A' }}>{list.name}</p>
                    <p style={{ fontSize: '0.775rem', color: '#9CA3AF', marginTop: 1 }}>
                      {account?.businessName} · {list.lines.length} items · Fleet price: <span style={{ color: '#C0392B', fontWeight: 600 }}>{cents(totalCents)}</span>
                    </p>
                    {list.lastOrderedAt && (
                      <p style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>Last ordered: {new Date(list.lastOrderedAt).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
                <button onClick={() => placeOrder(list)} disabled={isOrdering || wasOrdered}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    background: wasOrdered ? '#F0FDF4' : '#C0392B',
                    color: wasOrdered ? '#15803D' : '#fff',
                    border: wasOrdered ? '1px solid #BBF7D0' : 'none',
                    opacity: isOrdering ? 0.7 : 1,
                  }}>
                  {isOrdering && <Loader2 size={13} className="animate-spin" />}
                  {wasOrdered && <CheckCircle2 size={13} />}
                  {isOrdering ? 'Submitting…' : wasOrdered ? 'Ordered' : 'Submit Order'}
                </button>
              </div>

              {/* Line items */}
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#FAFAFA' }}>
                    {['SKU', 'Description', 'Default Qty', 'Agreed Price', 'Line Total'].map(h => (
                      <th key={h} className="text-left px-4 py-2"
                        style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {list.lines.map((line, i) => (
                    <tr key={i} style={{ borderTop: '1px solid #F3F4F6' }}>
                      <td className="px-4 py-2.5" style={{ fontFamily: 'monospace', fontSize: '0.775rem', color: '#6B7280' }}>{line.sku}</td>
                      <td className="px-4 py-2.5" style={{ fontSize: '0.825rem', color: '#1A1A1A' }}>{line.description}</td>
                      <td className="px-4 py-2.5 text-center" style={{ fontSize: '0.825rem', color: '#374151' }}>{line.defaultQty}</td>
                      <td className="px-4 py-2.5" style={{ fontSize: '0.825rem', color: '#374151', fontVariantNumeric: 'tabular-nums' }}>{cents(line.agreedPrice)}</td>
                      <td className="px-4 py-2.5" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A1A1A', fontVariantNumeric: 'tabular-nums' }}>
                        {cents(line.agreedPrice * line.defaultQty)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      {toastMsg && (
        <div className="fixed bottom-6 right-6 px-4 py-3 rounded-xl text-sm font-medium z-50 flex items-center gap-2"
          style={{ background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
          <CheckCircle2 size={14} /> {toastMsg}
        </div>
      )}
    </div>
  );
}

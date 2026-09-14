import { useState } from 'react';
import { CheckCircle2, X, Clock, ShieldCheck, XCircle, Loader2 } from 'lucide-react';
import type { ApprovalRequest } from './types';
import { MOCK_APPROVALS } from './mockData';

function cents(c: number) {
  return `R ${(c / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function FleetApprovalsView() {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(MOCK_APPROVALS);
  const [actionModal, setActionModal] = useState<{ req: ApprovalRequest; type: 'approve' | 'reject' } | null>(null);
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  function showToast(msg: string) { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); }

  function handleAction() {
    if (!actionModal) return;
    setProcessing(true);
    setTimeout(() => {
      setApprovals(a => a.map(r => r.id === actionModal.req.id
        ? { ...r, status: actionModal.type === 'approve' ? 'approved' : 'rejected', approver: 'Shop Admin', reason: reason || undefined }
        : r));
      setProcessing(false);
      setActionModal(null);
      setReason('');
      showToast(actionModal.type === 'approve' ? 'Purchase approved. Buyer notified.' : 'Purchase rejected. Buyer notified with reason.');
    }, 700);
  }

  const pending = approvals.filter(a => a.status === 'pending');
  const resolved = approvals.filter(a => a.status !== 'pending');

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.125rem', color: '#1A1A1A' }}>Approval Workflows</h2>
        <p style={{ fontSize: '0.825rem', color: '#6B7280', marginTop: 2 }}>
          Purchases above a fleet's approval threshold require sign-off before proceeding to checkout.
        </p>
      </div>

      {/* Pending */}
      <div>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
          Pending ({pending.length})
        </p>
        {pending.length === 0 ? (
          <div className="rounded-xl p-8 text-center" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <ShieldCheck size={24} color="#15803D" className="mx-auto mb-2" />
            <p style={{ color: '#15803D', fontSize: '0.875rem', fontWeight: 500 }}>No pending approvals.</p>
          </div>
        ) : pending.map(req => (
          <ApprovalCard key={req.id} req={req}
            onApprove={() => { setActionModal({ req, type: 'approve' }); setReason(''); }}
            onReject={() => { setActionModal({ req, type: 'reject' }); setReason(''); }} />
        ))}
      </div>

      {/* Resolved */}
      {resolved.length > 0 && (
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
            Recent Decisions
          </p>
          {resolved.map(req => <ApprovalCard key={req.id} req={req} />)}
        </div>
      )}

      {/* Action modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 mx-4" style={{ background: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1A1A1A' }}>
                {actionModal.type === 'approve' ? 'Approve Purchase' : 'Reject Purchase'}
              </h3>
              <button onClick={() => setActionModal(null)} style={{ color: '#9CA3AF' }}><X size={18} /></button>
            </div>
            <div className="rounded-xl p-4 mb-4" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
              <p style={{ fontSize: '0.825rem', fontWeight: 600, color: '#1A1A1A' }}>{actionModal.req.fleetAccountName}</p>
              <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: 2 }}>Buyer: {actionModal.req.buyerName}</p>
              <p style={{ fontSize: '1rem', fontWeight: 700, color: '#C0392B', marginTop: 4 }}>{cents(actionModal.req.totalCents)}</p>
              {actionModal.req.poNumber && <p style={{ fontSize: '0.775rem', color: '#9CA3AF', marginTop: 2 }}>PO: {actionModal.req.poNumber}</p>}
            </div>
            {actionModal.type === 'reject' && (
              <div className="mb-4">
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>Rejection Reason *</label>
                <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2}
                  placeholder="Explain why the purchase is being rejected…"
                  className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none resize-none"
                  style={{ border: '1px solid #E5E7EB', color: '#1A1A1A', fontFamily: 'Inter, sans-serif' }} />
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setActionModal(null)} className="flex-1 py-2 rounded-lg text-sm"
                style={{ background: '#F9FAFB', color: '#6B7280', border: '1px solid #E5E7EB' }}>Cancel</button>
              <button onClick={handleAction}
                disabled={actionModal.type === 'reject' && !reason.trim() || processing}
                className="flex-1 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                style={{
                  background: actionModal.type === 'approve' ? '#15803D' : '#BE123C',
                  color: '#fff',
                  opacity: (actionModal.type === 'reject' && !reason.trim()) || processing ? 0.4 : 1,
                }}>
                {processing ? <Loader2 size={14} className="animate-spin" /> : null}
                {processing ? '…' : actionModal.type === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-6 right-6 px-4 py-3 rounded-xl text-sm font-medium z-50 flex items-center gap-2"
          style={{ background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
          <CheckCircle2 size={14} /> {toastMsg}
        </div>
      )}
    </div>
  );
}

function ApprovalCard({ req, onApprove, onReject }: {
  req: ApprovalRequest;
  onApprove?: () => void;
  onReject?: () => void;
}) {
  return (
    <div className="rounded-xl p-5 mb-3" style={{ background: '#fff', border: `1px solid ${req.status === 'pending' ? '#FED7AA' : '#E5E7EB'}` }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: req.status === 'pending' ? '#FFF7ED' : req.status === 'approved' ? '#F0FDF4' : '#FFF1F2' }}>
            {req.status === 'pending' && <Clock size={15} color="#C2410C" />}
            {req.status === 'approved' && <CheckCircle2 size={15} color="#15803D" />}
            {req.status === 'rejected' && <XCircle size={15} color="#BE123C" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1A1A1A' }}>{req.fleetAccountName}</p>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{
                  background: req.status === 'pending' ? '#FFF7ED' : req.status === 'approved' ? '#F0FDF4' : '#FFF1F2',
                  color: req.status === 'pending' ? '#C2410C' : req.status === 'approved' ? '#15803D' : '#BE123C',
                }}>
                {req.status}
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: 2 }}>Requested by {req.buyerName} · {new Date(req.createdAt).toLocaleString()}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {req.items.map((item, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded" style={{ background: '#F9FAFB', color: '#374151' }}>{item}</span>
              ))}
            </div>
            {req.reason && <p style={{ fontSize: '0.8rem', color: '#B91C1C', marginTop: 6 }}>Rejection reason: {req.reason}</p>}
            {req.approver && req.status === 'approved' && <p style={{ fontSize: '0.775rem', color: '#6B7280', marginTop: 4 }}>Approved by {req.approver}</p>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <p style={{ fontWeight: 700, fontSize: '1rem', color: '#1A1A1A' }}>{cents(req.totalCents)}</p>
          {req.poNumber && <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>PO: {req.poNumber}</p>}
          {req.status === 'pending' && onApprove && onReject && (
            <div className="flex gap-2 mt-1">
              <button onClick={onReject} className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: '#FFF1F2', color: '#BE123C', border: '1px solid #FECDD3' }}>Reject</button>
              <button onClick={onApprove} className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' }}>Approve</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

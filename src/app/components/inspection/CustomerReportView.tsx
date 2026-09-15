import { useState, useRef, useEffect } from 'react';
import {
  CheckCircle, AlertTriangle, XCircle, MinusCircle, Camera, Mic,
  ChevronDown, ChevronUp, Check, ThumbsUp, ThumbsDown, Clock, Pen,
  Shield, Star, ArrowRight, Download
} from 'lucide-react';
import { MOCK_COMPLETED_INSPECTION } from './mockData';
import type { ItemRecord, RecommendationDecision } from './types';

type Phase = 'review' | 'decisions' | 'signature' | 'confirmed';

const STATUS_CONFIG = {
  good:      { label: 'Good',      icon: <CheckCircle className="w-4 h-4" />,  bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200', dot: 'bg-green-500' },
  attention: { label: 'Attention', icon: <AlertTriangle className="w-4 h-4" />, bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200', dot: 'bg-amber-500' },
  critical:  { label: 'Critical',  icon: <XCircle className="w-4 h-4" />,      bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',   dot: 'bg-red-500' },
  na:        { label: 'N/A',       icon: <MinusCircle className="w-4 h-4" />,  bg: 'bg-gray-50',   text: 'text-gray-500',   border: 'border-gray-200',  dot: 'bg-gray-400' },
  pending:   { label: 'Pending',   icon: null, bg: 'bg-gray-50', text: 'text-gray-400', border: 'border-gray-100', dot: 'bg-gray-300' },
};

const PHOTO_COLORS = ['#2563EB', '#16A34A', '#D97706', '#7C3AED', '#0891B2'];

interface DecisionState {
  [recId: string]: { decision: RecommendationDecision | null; reason: string };
}

function StatusBadge({ status }: { status: keyof typeof STATUS_CONFIG }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function SignaturePad({ onSign }: { onSign: (signed: boolean) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSig, setHasSig] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    setIsDrawing(true);
    lastPos.current = getPos(e, canvas);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current!.x, lastPos.current!.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#00A9AC';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
    setHasSig(true);
    onSign(true);
  }

  function endDraw() {
    setIsDrawing(false);
    lastPos.current = null;
  }

  function clear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSig(false);
    onSign(false);
  }

  return (
    <div>
      <div className="border-2 border-dashed border-red-300 rounded-xl overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={600}
          height={180}
          className="w-full h-44 cursor-crosshair block"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-red-600 font-medium">Sign above to authorize the selected services</p>
        {hasSig && (
          <button onClick={clear} className="text-xs text-gray-400 hover:text-gray-600 underline">Clear</button>
        )}
      </div>
    </div>
  );
}

export function CustomerReportView() {
  const inspection = MOCK_COMPLETED_INSPECTION;
  const [phase, setPhase] = useState<Phase>('review');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [decisions, setDecisions] = useState<DecisionState>({});
  const [hasSigned, setHasSigned] = useState(false);

  const recommendations = inspection.items.filter(i => i.recommendation);
  const approvedRecs = recommendations.filter(i => decisions[i.recommendation!.id]?.decision === 'approved');
  const approvedTotal = approvedRecs.reduce((sum, i) => sum + i.recommendation!.priceCents, 0);

  const categories = Array.from(new Set(inspection.items.map(i => i.category)));

  function toggleExpand(id: string) {
    setExpandedItems(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function setDecision(recId: string, decision: RecommendationDecision | null) {
    setDecisions(prev => ({ ...prev, [recId]: { ...prev[recId], decision, reason: prev[recId]?.reason || '' } }));
  }

  function setReason(recId: string, reason: string) {
    setDecisions(prev => ({ ...prev, [recId]: { ...prev[recId], reason } }));
  }

  const decisionsMade = recommendations.every(i => decisions[i.recommendation!.id]?.decision != null);
  const hasApproved = approvedRecs.length > 0;

  // Review phase
  if (phase === 'review') {
    return (
      <div className="min-h-full bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 pt-6 pb-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">FB Business Connect Inspection Report</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">{inspection.vehicle}</h1>
            <p className="text-sm text-gray-500 mt-0.5">Plate {inspection.licensePlate} · Inspected by {inspection.technicianName}</p>
            <div className="flex items-center gap-3 mt-3">
              {[
                { label: 'Items inspected', val: inspection.items.length },
                { label: 'Attention needed', val: inspection.items.filter(i => i.status === 'attention' || i.status === 'critical').length, highlight: true },
                { label: 'Recommendations', val: recommendations.length },
              ].map(s => (
                <div key={s.label} className="flex flex-col items-center bg-gray-50 rounded-xl px-4 py-2 flex-1">
                  <span className={`text-2xl font-bold ${s.highlight ? 'text-red-600' : 'text-gray-900'}`}>{s.val}</span>
                  <span className="text-xs text-gray-500 text-center">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Items by category */}
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-2">
          {categories.map(cat => {
            const catItems = inspection.items.filter(i => i.category === cat);
            const hasIssues = catItems.some(i => i.status === 'attention' || i.status === 'critical');
            return (
              <div key={cat} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
                  <span className="font-semibold text-sm text-gray-700">{cat}</span>
                  {hasIssues && <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />}
                </div>
                <div className="divide-y divide-gray-50">
                  {catItems.map(item => {
                    const isExpanded = expandedItems.has(item.id);
                    const hasDetail = item.photoCount > 0 || item.hasVoiceNote || item.recommendation;
                    return (
                      <div key={item.id}>
                        <button
                          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                          onClick={() => hasDetail && toggleExpand(item.id)}
                        >
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_CONFIG[item.status].dot}`} />
                          <span className="flex-1 text-sm text-gray-800">{item.itemName}</span>
                          <StatusBadge status={item.status} />
                          {hasDetail && (
                            isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          )}
                        </button>
                        {isExpanded && (
                          <div className="px-4 pb-3 space-y-3">
                            {item.observations && (
                              <p className="text-sm text-gray-600 ml-5">{item.observations}</p>
                            )}
                            {item.photoCount > 0 && (
                              <div className="flex gap-2 ml-5">
                                {Array.from({ length: item.photoCount }).map((_, i) => (
                                  <div
                                    key={i}
                                    className="w-16 h-16 rounded-lg flex items-center justify-center"
                                    style={{ background: PHOTO_COLORS[i % PHOTO_COLORS.length] }}
                                  >
                                    <Camera className="w-5 h-5 text-white/60" />
                                  </div>
                                ))}
                              </div>
                            )}
                            {item.hasVoiceNote && item.transcript && (
                              <div className="ml-5 bg-purple-50 border border-purple-100 rounded-xl p-3 flex gap-2">
                                <Mic className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-purple-800 italic">"{item.transcript}"</p>
                              </div>
                            )}
                            {item.recommendation && (
                              <div className={`ml-5 rounded-xl p-3 border ${item.status === 'critical' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className={`text-xs font-semibold mb-1 ${item.status === 'critical' ? 'text-red-700' : 'text-amber-700'}`}>
                                      Recommended Service
                                    </div>
                                    <div className="text-sm font-medium text-gray-800">{item.recommendation.itemName}</div>
                                    <div className="text-xs text-gray-600 mt-0.5">{item.recommendation.description}</div>
                                  </div>
                                  <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                                    ${(item.recommendation.priceCents / 100).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        {recommendations.length > 0 && (
          <div className="max-w-2xl mx-auto px-4 pb-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="text-sm font-semibold text-gray-800 mb-1">
                {recommendations.length} service recommendation{recommendations.length > 1 ? 's' : ''} from your technician
              </div>
              <p className="text-xs text-gray-500 mb-3">Review each recommendation and choose to approve, decline, or defer for a future visit.</p>
              <button
                onClick={() => setPhase('decisions')}
                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                Review Recommendations
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Decisions phase
  if (phase === 'decisions') {
    return (
      <div className="min-h-full bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto">
            <button onClick={() => setPhase('review')} className="text-xs text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1">
              ← Back to report
            </button>
            <h2 className="text-lg font-bold text-gray-900">Service Recommendations</h2>
            <p className="text-xs text-gray-500 mt-0.5">Approve, decline, or defer each item. Your selections are sent to your technician.</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
          {recommendations.map(item => {
            const rec = item.recommendation!;
            const state = decisions[rec.id];
            const dec = state?.decision;
            return (
              <div key={rec.id} className={`bg-white rounded-2xl border-2 overflow-hidden transition-colors ${
                dec === 'approved' ? 'border-red-200' : dec === 'declined' ? 'border-gray-200' : dec === 'deferred' ? 'border-blue-200' : 'border-gray-100'
              }`}>
                <div className="px-4 pt-4 pb-3">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{rec.itemName}</div>
                      <StatusBadge status={item.status} />
                    </div>
                    <span className="text-base font-bold text-gray-900">${(rec.priceCents / 100).toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{rec.description}</p>
                </div>

                {/* Decision toggles */}
                <div className="grid grid-cols-3 gap-0 border-t border-gray-100">
                  {([
                    { id: 'approved', label: 'Approve', icon: <ThumbsUp className="w-4 h-4" />, active: 'bg-red-600 text-white', inactive: 'text-gray-500 hover:bg-red-50 hover:text-red-600' },
                    { id: 'declined', label: 'Decline', icon: <ThumbsDown className="w-4 h-4" />, active: 'bg-gray-600 text-white', inactive: 'text-gray-500 hover:bg-gray-50 hover:text-gray-700' },
                    { id: 'deferred', label: 'Defer',   icon: <Clock className="w-4 h-4" />,      active: 'bg-blue-600 text-white', inactive: 'text-gray-500 hover:bg-blue-50 hover:text-blue-600' },
                  ] as const).map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setDecision(rec.id, dec === opt.id ? null : opt.id)}
                      className={`flex flex-col items-center gap-1 py-3 text-xs font-semibold border-r last:border-r-0 border-gray-100 transition-colors ${
                        dec === opt.id ? opt.active : opt.inactive
                      }`}
                    >
                      {opt.icon}
                      {opt.label}
                    </button>
                  ))}
                </div>

                {dec === 'declined' && (
                  <div className="px-4 py-3 border-t border-gray-100">
                    <input
                      placeholder="Reason for declining (optional)"
                      value={state?.reason || ''}
                      onChange={e => setReason(rec.id, e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    />
                  </div>
                )}
                {dec === 'deferred' && (
                  <div className="px-4 py-2 border-t border-blue-100 bg-blue-50">
                    <p className="text-xs text-blue-700">This item will be added to your scheduled follow-up queue.</p>
                  </div>
                )}
              </div>
            );
          })}

          {/* Summary */}
          {decisionsMade && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="text-sm font-semibold text-gray-800 mb-3">Your Selections</div>
              {[
                { label: 'Approved', items: recommendations.filter(i => decisions[i.recommendation!.id]?.decision === 'approved'), color: 'text-red-700' },
                { label: 'Declined', items: recommendations.filter(i => decisions[i.recommendation!.id]?.decision === 'declined'), color: 'text-gray-600' },
                { label: 'Deferred', items: recommendations.filter(i => decisions[i.recommendation!.id]?.decision === 'deferred'), color: 'text-blue-700' },
              ].map(group => group.items.length > 0 && (
                <div key={group.label} className="mb-2">
                  <div className={`text-xs font-semibold ${group.color} mb-1`}>{group.label}</div>
                  {group.items.map(i => (
                    <div key={i.id} className="flex justify-between text-xs text-gray-600 py-0.5">
                      <span>{i.recommendation!.itemName}</span>
                      <span>${(i.recommendation!.priceCents / 100).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ))}
              {approvedTotal > 0 && (
                <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-100 pt-2 mt-2">
                  <span>Approved total</span>
                  <span>${(approvedTotal / 100).toFixed(2)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="max-w-2xl mx-auto px-4 pb-8">
          <button
            onClick={() => setPhase(hasApproved ? 'signature' : 'confirmed')}
            disabled={!decisionsMade}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            {hasApproved ? 'Continue to Sign' : 'Confirm Selections'}
            <ArrowRight className="w-4 h-4" />
          </button>
          {!decisionsMade && (
            <p className="text-xs text-center text-gray-400 mt-2">Please make a decision on all {recommendations.length} items to continue.</p>
          )}
        </div>
      </div>
    );
  }

  // Signature phase
  if (phase === 'signature') {
    return (
      <div className="min-h-full bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="max-w-2xl mx-auto">
            <button onClick={() => setPhase('decisions')} className="text-xs text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1">
              ← Back to decisions
            </button>
            <h2 className="text-lg font-bold text-gray-900">Authorize Services</h2>
            <p className="text-xs text-gray-500 mt-0.5">Your signature authorizes the shop to perform the approved services.</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
          {/* Approved items summary */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Check className="w-4 h-4 text-red-600" />
              Approved Services
            </div>
            {approvedRecs.map(item => (
              <div key={item.id} className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-gray-700">{item.recommendation!.itemName}</span>
                <span className="font-semibold text-gray-900">${(item.recommendation!.priceCents / 100).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 mt-1">
              <span>Total</span>
              <span>${(approvedTotal / 100).toFixed(2)}</span>
            </div>
          </div>

          {/* Audit disclosure */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
            <span className="font-semibold">Authorization disclosure:</span> Your signature, timestamp, IP address, and device fingerprint will be recorded as part of a legally binding service authorization. This authorizes the shop to perform and invoice the services listed above.
          </div>

          {/* Signature pad */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Pen className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-800">Signature</span>
            </div>
            <SignaturePad onSign={setHasSigned} />
          </div>

          {/* Legal footer */}
          <p className="text-xs text-gray-400 text-center">
            By signing, I authorize FB Business Connect Shop to perform the services listed above.<br />
            Signed: {inspection.customerName} · {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="max-w-2xl mx-auto px-4 pb-8">
          <button
            onClick={() => setPhase('confirmed')}
            disabled={!hasSigned}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            Confirm Authorization
            <Check className="w-4 h-4" />
          </button>
          {!hasSigned && <p className="text-xs text-center text-gray-400 mt-2">Please sign above to confirm.</p>}
        </div>
      </div>
    );
  }

  // Confirmed phase
  return (
    <div className="min-h-full bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-sm w-full text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">You're all set!</h2>
        <p className="text-gray-500 text-sm mb-6">
          Your selections have been sent to {inspection.technicianName}. They'll begin work on your approved services shortly.
        </p>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-left mb-6">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Summary</div>
          {[
            { label: 'Approved', val: recommendations.filter(i => decisions[i.recommendation!.id]?.decision === 'approved').length, color: 'text-red-600' },
            { label: 'Declined', val: recommendations.filter(i => decisions[i.recommendation!.id]?.decision === 'declined').length, color: 'text-gray-600' },
            { label: 'Deferred', val: recommendations.filter(i => decisions[i.recommendation!.id]?.decision === 'deferred').length, color: 'text-blue-600' },
          ].map(s => (
            <div key={s.label} className="flex justify-between text-sm py-1">
              <span className="text-gray-600">{s.label}</span>
              <span className={`font-semibold ${s.color}`}>{s.val} item{s.val !== 1 ? 's' : ''}</span>
            </div>
          ))}
          {approvedTotal > 0 && (
            <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-100 pt-2 mt-1">
              <span>Authorized amount</span>
              <span>${(approvedTotal / 100).toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <Shield className="w-3.5 h-3.5" />
          <span>Audit trail recorded · {new Date().toLocaleTimeString()}</span>
        </div>

        <button className="mt-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mx-auto transition-colors">
          <Download className="w-4 h-4" />
          Download PDF Report
        </button>
      </div>
    </div>
  );
}

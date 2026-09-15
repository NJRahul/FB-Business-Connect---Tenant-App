import { useState, useRef, useEffect } from 'react';
import {
  ChevronRight, ChevronLeft, Camera, PenLine, Phone, MessageSquare,
  Wifi, WifiOff, CheckCircle2, Clock, MapPin, AlertTriangle, Package,
  Trash2, Upload, ThumbsUp, Navigation, X,
} from 'lucide-react';
import { DISPATCH_VISITS, TECHNICIANS, VISIT_PHOTOS } from './mockData';
import type { DispatchVisit } from './types';
import type { VisitState } from '../booking/types';

const TECH_ID = 'tech-1'; // Simulating logged-in tech
const TODAY_VISITS = DISPATCH_VISITS
  .filter(v => v.technicianId === TECH_ID && v.scheduledStart.startsWith('2026-06-14') && !['cancelled','no_show'].includes(v.visitState))
  .sort((a, b) => a.scheduledStart.localeCompare(b.scheduledStart));

const NEXT_STATE: Partial<Record<VisitState, VisitState>> = {
  scheduled: 'en_route', parts_ready: 'en_route',
  en_route: 'on_site', on_site: 'in_progress', in_progress: 'completed',
};
const NEXT_LABEL: Partial<Record<VisitState, string>> = {
  scheduled: 'On the Way', parts_ready: 'On the Way',
  en_route: 'I\'ve Arrived', on_site: 'Start Service', in_progress: 'Mark Complete',
};
const NEXT_COLOR: Partial<Record<VisitState, string>> = {
  scheduled: '#00A9AC', parts_ready: '#00A9AC',
  en_route: '#7C3AED', on_site: '#2980B9', in_progress: '#27AE60',
};

function fmtTime(iso: string) { return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }); }
function fmtMoney(n: number) { return `R ${n.toFixed(2)}`; }

// ─── Signature Pad ────────────────────────────────────────────────────────────
function SignaturePad({ onSave, onClose }: { onSave: (data: string) => void; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasStrokes, setHasStrokes] = useState(false);

  const getPos = (e: React.MouseEvent | React.TouchEvent, rect: DOMRect) => {
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    const pos = getPos(e, rect);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return;
    e.preventDefault();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    const pos = getPos(e, rect);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#00A9AC';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
    setHasStrokes(true);
  };

  const endDraw = () => setDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasStrokes(false);
  };

  const save = () => {
    if (!hasStrokes) return;
    const canvas = canvasRef.current!;
    onSave(canvas.toDataURL('image/png'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-sm bg-white rounded-t-[16px] p-5" style={{ boxShadow: '0 -20px 60px rgba(0,0,0,0.3)' }}>
        <div className="flex items-center justify-between mb-3">
          <h4 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#1A1A1A' }}>Customer Signature</h4>
          <button onClick={onClose}><X size={18} style={{ color: '#9CA3AF' }} /></button>
        </div>
        <p style={{ color: '#00A9AC', fontSize: '0.8125rem', fontWeight: 600, textAlign: 'center', marginBottom: '8px' }}>
          Sign below to confirm service completion
        </p>
        <canvas
          ref={canvasRef}
          width={360}
          height={150}
          className="w-full rounded-[8px] touch-none"
          style={{ border: '2px solid #E5E7EB', background: '#F9FAFB', cursor: 'crosshair' }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        <div className="flex gap-2 mt-3">
          <button onClick={clear} className="flex-1 py-2.5 rounded-[8px] text-sm font-medium" style={{ border: '1.5px solid #E5E7EB', color: '#6B7280' }}>
            Clear
          </button>
          <button
            onClick={save}
            disabled={!hasStrokes}
            className="flex-2 py-2.5 px-6 rounded-[8px] text-sm font-bold text-white"
            style={{ background: hasStrokes ? '#27AE60' : '#D1D5DB', flex: 2 }}
          >
            Confirm Signature
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Photo Capture Panel ──────────────────────────────────────────────────────
function PhotoPanel({ visitId, visitRequiresParts, onClose }: { visitId: string; visitRequiresParts: boolean; onClose: () => void }) {
  const EXISTING = VISIT_PHOTOS.filter(p => p.visitId === visitId);
  const [photos, setPhotos] = useState(EXISTING);
  const [uploading, setUploading] = useState(false);

  const REQUIRED = visitRequiresParts ? 4 : 0;
  const capturedCount = photos.length;
  const met = capturedCount >= REQUIRED;

  const simulateCapture = (type: 'pre_install' | 'post_install' | 'damage_pre') => {
    const sizes = [980, 1240, 1100, 1350];
    const newPhoto = {
      id: `ph-sim-${Date.now()}`,
      visitId,
      photoType: type,
      url: '#',
      thumbnail: ['📸', '🖼️', '📷', '🔍'][Math.floor(Math.random() * 4)],
      sizeKB: sizes[Math.floor(Math.random() * sizes.length)],
      serverTimestamp: new Date().toISOString(),
      offlineQueued: false,
    };
    setPhotos(p => [...p, newPhoto]);
  };

  const offlineCount = photos.filter(p => p.offlineQueued).length;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#111827' }}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Camera size={18} style={{ color: '#00A9AC' }} />
          <span style={{ color: '#fff', fontWeight: 700, fontFamily: 'Sora, sans-serif' }}>Visit Photos</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: met ? '#27AE60' : '#00A9AC', color: '#fff' }}>
            {capturedCount}{REQUIRED > 0 ? `/${REQUIRED}` : ''} captured
          </span>
        </div>
        <button onClick={onClose}><X size={20} style={{ color: '#9CA3AF' }} /></button>
      </div>

      {!met && REQUIRED > 0 && (
        <div className="mx-4 mb-3 p-2.5 rounded-[6px] flex items-center gap-2" style={{ background: '#7F1D1D' }}>
          <AlertTriangle size={14} style={{ color: '#FCA5A5' }} />
          <p style={{ color: '#FCA5A5', fontSize: '0.8125rem' }}>
            Parts-Install requires minimum {REQUIRED} photos. {REQUIRED - capturedCount} more needed.
          </p>
        </div>
      )}

      {offlineCount > 0 && (
        <div className="mx-4 mb-2 p-2 rounded-[6px] flex items-center justify-between" style={{ background: '#78350F' }}>
          <span style={{ color: '#FDE68A', fontSize: '0.8125rem' }}>⚠ {offlineCount} photos queued offline</span>
          <button onClick={() => setUploading(true)} style={{ color: '#FDE68A', fontSize: '0.75rem', fontWeight: 600 }}>Upload now</button>
        </div>
      )}

      {/* Photo grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {photos.map((p, i) => (
            <div key={p.id} className="aspect-square rounded-[8px] flex items-center justify-center relative" style={{ background: '#1F2937' }}>
              <span style={{ fontSize: '2rem' }}>{p.thumbnail}</span>
              <div className="absolute bottom-1 left-1 right-1">
                <span className="block truncate text-center px-1 py-0.5 rounded text-xs" style={{ background: 'rgba(0,0,0,0.6)', color: '#D1D5DB', fontSize: '0.5rem' }}>
                  {p.photoType.replace(/_/g, ' ')} · {p.sizeKB}KB
                </span>
              </div>
              {p.offlineQueued && (
                <div className="absolute top-1 right-1 w-3 h-3 rounded-full" style={{ background: '#F59E0B' }} />
              )}
              <button
                onClick={() => setPhotos(ps => ps.filter(x => x.id !== p.id))}
                className="absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.5)' }}
              >
                <Trash2 size={10} style={{ color: '#F87171' }} />
              </button>
            </div>
          ))}
        </div>

        {/* Capture buttons */}
        <p style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Add Photo</p>
        <div className="space-y-2">
          {[
            { type: 'pre_install' as const, label: 'Pre-Install', icon: '📸', required: true },
            { type: 'post_install' as const, label: 'Post-Install', icon: '✅', required: true },
            { type: 'damage_pre' as const, label: 'Pre-Existing Damage', icon: '⚠️', required: false },
          ].map(opt => (
            <button
              key={opt.type}
              onClick={() => simulateCapture(opt.type)}
              className="w-full flex items-center gap-3 p-3 rounded-[8px]"
              style={{ background: '#1F2937', border: '1px solid #374151' }}
            >
              <span style={{ fontSize: '1.25rem' }}>{opt.icon}</span>
              <div className="flex-1 text-left">
                <p style={{ color: '#F9FAFB', fontWeight: 600, fontSize: '0.875rem' }}>{opt.label}</p>
                <p style={{ color: '#6B7280', fontSize: '0.75rem' }}>Compress to ≤2MB · EXIF stripped</p>
              </div>
              <Camera size={16} style={{ color: '#00A9AC' }} />
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 pt-0">
        <button
          onClick={onClose}
          className="w-full py-3 rounded-[8px] text-white font-bold text-base"
          style={{ background: met || REQUIRED === 0 ? '#27AE60' : '#374151' }}
        >
          {met || REQUIRED === 0 ? '✓ Done' : `Need ${REQUIRED - capturedCount} more photos`}
        </button>
      </div>
    </div>
  );
}

// ─── Visit Card (PWA) ─────────────────────────────────────────────────────────
function PWAVisitCard({ visit, isCurrent, onStateChange }: {
  visit: DispatchVisit;
  isCurrent: boolean;
  onStateChange: (id: string, next: VisitState) => void;
}) {
  const [showPhotos, setShowPhotos] = useState(false);
  const [showSig, setShowSig] = useState(false);
  const [sigSaved, setSigSaved] = useState(false);
  const [note, setNote] = useState('');
  const [reco, setReco] = useState('');
  const [expanded, setExpanded] = useState(isCurrent);

  const nextState = NEXT_STATE[visit.visitState];
  const nextLabel = NEXT_LABEL[visit.visitState];
  const nextColor = NEXT_COLOR[visit.visitState];
  const photoCount = VISIT_PHOTOS.filter(p => p.visitId === visit.id).length;
  const requiredPhotos = visit.partsRequired.length > 0 ? 4 : 0;

  const stateColors: Partial<Record<VisitState, string>> = {
    scheduled: '#3B82F6', en_route: '#8B5CF6', on_site: '#2980B9',
    in_progress: '#00A9AC', completed: '#27AE60', parts_ready: '#22C55E', parts_pending: '#F59E0B',
  };
  const dotColor = stateColors[visit.visitState] ?? '#9CA3AF';

  return (
    <div
      className="rounded-[12px] overflow-hidden mb-3"
      style={{
        background: isCurrent ? '#1A1A1A' : '#111827',
        border: isCurrent ? '1.5px solid #00A9AC' : '1px solid #1F2937',
        boxShadow: isCurrent ? '0 0 0 3px rgba(192,57,43,0.2)' : 'none',
      }}
    >
      {/* Header */}
      <button className="w-full text-left px-4 py-3 flex items-center gap-3" onClick={() => setExpanded(x => !x)}>
        <div className="w-3 h-3 rounded-full shrink-0" style={{ background: dotColor }} />
        <div className="flex-1 min-w-0">
          <p style={{ color: '#F9FAFB', fontWeight: 700, fontSize: '0.9375rem' }}>{visit.customerName}</p>
          <p style={{ color: '#6B7280', fontSize: '0.8125rem' }}>{visit.serviceTypeName} · {fmtTime(visit.scheduledStart)}</p>
        </div>
        {visit.visitState === 'completed' && <CheckCircle2 size={18} style={{ color: '#27AE60', flexShrink: 0 }} />}
        {isCurrent && <span className="px-1.5 py-0.5 rounded text-xs font-bold shrink-0" style={{ background: '#00A9AC', color: '#fff' }}>NOW</span>}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4">
          {/* Info row */}
          <div className="flex items-start gap-2 mb-3">
            <MapPin size={14} style={{ color: '#6B7280', marginTop: '2px', flexShrink: 0 }} />
            <span style={{ color: '#D1D5DB', fontSize: '0.8125rem', lineHeight: 1.4 }}>{visit.serviceAddress}</span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={13} style={{ color: '#6B7280' }} />
            <span style={{ color: '#D1D5DB', fontSize: '0.8125rem' }}>
              {fmtTime(visit.scheduledStart)} – {fmtTime(visit.scheduledEnd)} · {fmtMoney(visit.totalPrice)}
            </span>
          </div>

          {visit.partsRequired.length > 0 && (
            <div className="flex items-center gap-2 mb-3 p-2 rounded-[6px]" style={{ background: '#78350F' }}>
              <Package size={13} style={{ color: '#FDE68A' }} />
              <span style={{ color: '#FDE68A', fontSize: '0.8125rem' }}>{visit.partsRequired[0].name}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 mb-3">
            <a
              href={`tel:${visit.customerPhone}`}
              className="flex-1 py-2.5 rounded-[8px] flex items-center justify-center gap-1.5 text-sm font-semibold"
              style={{ background: '#1F2937', color: '#D1D5DB', border: '1px solid #374151' }}
            >
              <Phone size={14} /> Call
            </a>
            <button
              className="flex-1 py-2.5 rounded-[8px] flex items-center justify-center gap-1.5 text-sm font-semibold"
              style={{ background: '#1F2937', color: '#D1D5DB', border: '1px solid #374151' }}
            >
              <MessageSquare size={14} /> Text
            </button>
            <button
              className="flex-1 py-2.5 rounded-[8px] flex items-center justify-center gap-1.5 text-sm font-semibold"
              style={{ background: '#1F2937', color: '#D1D5DB', border: '1px solid #374151' }}
            >
              <Navigation size={14} /> Nav
            </button>
          </div>

          {/* Photos */}
          {!['scheduled', 'parts_pending'].includes(visit.visitState) && (
            <button
              onClick={() => setShowPhotos(true)}
              className="w-full py-2.5 rounded-[8px] flex items-center justify-between px-4 mb-2"
              style={{ background: '#1F2937', border: '1px solid #374151' }}
            >
              <div className="flex items-center gap-2">
                <Camera size={16} style={{ color: '#00A9AC' }} />
                <span style={{ color: '#D1D5DB', fontSize: '0.875rem', fontWeight: 600 }}>Photos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: photoCount >= requiredPhotos ? '#27AE60' : '#DC2626', color: '#fff' }}>
                  {photoCount}{requiredPhotos > 0 ? `/${requiredPhotos}` : ''}
                </span>
                {photoCount < requiredPhotos && <AlertTriangle size={13} style={{ color: '#F59E0B' }} />}
              </div>
            </button>
          )}

          {/* Signature */}
          {visit.visitState === 'in_progress' && (
            <button
              onClick={() => setShowSig(true)}
              className="w-full py-2.5 rounded-[8px] flex items-center justify-between px-4 mb-2"
              style={{ background: '#1F2937', border: '1px solid #374151' }}
            >
              <div className="flex items-center gap-2">
                <PenLine size={16} style={{ color: sigSaved ? '#27AE60' : '#00A9AC' }} />
                <span style={{ color: '#D1D5DB', fontSize: '0.875rem', fontWeight: 600 }}>Customer Signature</span>
              </div>
              {sigSaved ? <CheckCircle2 size={16} style={{ color: '#27AE60' }} /> : <span style={{ color: '#6B7280', fontSize: '0.75rem' }}>Required</span>}
            </button>
          )}

          {/* Notes */}
          {!['scheduled', 'parts_pending'].includes(visit.visitState) && (
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Visit notes (findings, observations)…"
              rows={2}
              className="w-full px-3 py-2 rounded-[8px] text-sm resize-none mb-2"
              style={{ background: '#1F2937', border: '1px solid #374151', color: '#D1D5DB', outline: 'none', fontFamily: 'Inter, sans-serif' }}
            />
          )}

          {/* Recommendations */}
          {visit.visitState === 'in_progress' && (
            <div className="mb-3">
              <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginBottom: '6px' }}>Flag Recommendation</p>
              <div className="flex flex-wrap gap-1.5">
                {['Alignment', 'Wheel Balancing', 'TPMS Sensor', 'Tire Rotation', 'Full Replacement'].map(r => (
                  <button
                    key={r}
                    onClick={() => setReco(reco === r ? '' : r)}
                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ background: reco === r ? '#00A9AC' : '#1F2937', color: reco === r ? '#fff' : '#9CA3AF', border: `1px solid ${reco === r ? '#00A9AC' : '#374151'}` }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main state transition button */}
          {nextState && nextLabel && nextColor && (
            <button
              onClick={() => onStateChange(visit.id, nextState)}
              className="w-full py-3.5 rounded-[10px] text-white font-bold text-base flex items-center justify-center gap-2"
              style={{ background: nextColor, fontSize: '1rem' }}
            >
              {nextLabel} <ChevronRight size={18} />
            </button>
          )}

          {visit.visitState === 'in_progress' && (
            <button
              className="w-full mt-2 py-2 rounded-[8px] text-sm font-medium"
              style={{ background: '#1F2937', color: '#D1D5DB', border: '1px solid #374151' }}
            >
              Running Late — Send Revised ETA
            </button>
          )}
        </div>
      )}

      {showPhotos && <PhotoPanel visitId={visit.id} visitRequiresParts={visit.partsRequired.length > 0} onClose={() => setShowPhotos(false)} />}
      {showSig && <SignaturePad onSave={(data) => { setSigSaved(true); setShowSig(false); }} onClose={() => setShowSig(false)} />}
    </div>
  );
}

// ─── Main TechnicianPWA ───────────────────────────────────────────────────────
export function TechnicianPWA() {
  const [visits, setVisits] = useState<DispatchVisit[]>(TODAY_VISITS);
  const [online, setOnline] = useState(true);
  const [pendingActions, setPendingActions] = useState(0);
  const tech = TECHNICIANS.find(t => t.id === TECH_ID)!;

  const activeVisit = visits.find(v => ['en_route','on_site','in_progress'].includes(v.visitState))
    ?? visits.find(v => ['scheduled','parts_ready'].includes(v.visitState));

  const handleStateChange = (id: string, next: VisitState) => {
    if (!online) {
      setPendingActions(n => n + 1);
    }
    setVisits(vs => vs.map(v => v.id === id ? { ...v, visitState: next } : v));
  };

  const completedCount = visits.filter(v => v.visitState === 'completed').length;
  const totalRevenue = visits.filter(v => v.visitState === 'completed').reduce((s, v) => s + v.totalPrice, 0);

  return (
    <div className="max-w-sm mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* PWA Header */}
      <div className="px-4 py-3 mb-4 rounded-[10px]" style={{ background: '#111827' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: '#00A9AC' }}>
              {tech.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <p style={{ color: '#F9FAFB', fontWeight: 700, fontSize: '0.9375rem' }}>{tech.name}</p>
              <p style={{ color: '#6B7280', fontSize: '0.75rem' }}>Field Technician · On Clock</p>
            </div>
          </div>
          <button
            onClick={() => { setOnline(o => !o); if (!online && pendingActions > 0) setPendingActions(0); }}
            className="flex items-center gap-1 px-2 py-1 rounded-full"
            style={{ background: online ? '#064E3B' : '#7F1D1D' }}
          >
            {online ? <Wifi size={13} style={{ color: '#34D399' }} /> : <WifiOff size={13} style={{ color: '#FCA5A5' }} />}
            <span style={{ color: online ? '#34D399' : '#FCA5A5', fontSize: '0.75rem', fontWeight: 600 }}>{online ? 'Online' : 'Offline'}</span>
          </button>
        </div>
        {!online && pendingActions > 0 && (
          <div className="p-2 rounded-[6px] flex items-center justify-between" style={{ background: '#78350F', marginTop: '8px' }}>
            <span style={{ color: '#FDE68A', fontSize: '0.8125rem' }}>⚠ {pendingActions} actions queued in IndexedDB</span>
            <button onClick={() => { setOnline(true); setPendingActions(0); }} style={{ color: '#FDE68A', fontSize: '0.75rem', fontWeight: 700 }}>Sync</button>
          </div>
        )}
        <div className="flex gap-4 mt-3 pt-3" style={{ borderTop: '1px solid #1F2937' }}>
          <div>
            <p style={{ color: '#27AE60', fontWeight: 700, fontSize: '1rem', fontFamily: 'Sora, sans-serif' }}>{completedCount}/{visits.length}</p>
            <p style={{ color: '#6B7280', fontSize: '0.6875rem' }}>Jobs done</p>
          </div>
          <div>
            <p style={{ color: '#27AE60', fontWeight: 700, fontSize: '1rem', fontFamily: 'Sora, sans-serif' }}>{totalRevenue > 0 ? `R ${totalRevenue.toFixed(0)}` : 'R 0'}</p>
            <p style={{ color: '#6B7280', fontSize: '0.6875rem' }}>Revenue</p>
          </div>
          <div>
            <p style={{ color: '#00A9AC', fontWeight: 700, fontSize: '1rem', fontFamily: 'Sora, sans-serif' }}>{visits.filter(v => !['completed','cancelled'].includes(v.visitState)).length}</p>
            <p style={{ color: '#6B7280', fontSize: '0.6875rem' }}>Remaining</p>
          </div>
        </div>
      </div>

      {/* Visit list */}
      <div>
        {visits.map(v => (
          <PWAVisitCard
            key={v.id}
            visit={v}
            isCurrent={v.id === activeVisit?.id}
            onStateChange={handleStateChange}
          />
        ))}
      </div>

      {visits.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle2 size={36} style={{ color: '#27AE60', margin: '0 auto 8px' }} />
          <p style={{ color: '#F9FAFB', fontWeight: 700, fontSize: '1rem' }}>All done for the day!</p>
          <p style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>Great work, {tech.name.split(' ')[0]}.</p>
        </div>
      )}

      <p className="text-center mt-4 pb-4" style={{ color: '#374151', fontSize: '0.6875rem' }}>
        ● GPS active · Location retained 30 days · <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Privacy settings</span>
      </p>
    </div>
  );
}

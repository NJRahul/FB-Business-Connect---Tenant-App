import { useState } from 'react';
import {
  ChevronLeft, ChevronRight, Camera, Mic, MicOff, Check, AlertTriangle,
  XCircle, MinusCircle, List, X, Plus, ChevronDown, ChevronUp, ClipboardCheck
} from 'lucide-react';
import { MOCK_INPROGRESS_INSPECTION, MOCK_TEMPLATES } from './mockData';
import type { ItemRecord, ItemStatus } from './types';

const STATUS_CONFIG: Record<ItemStatus, { label: string; bg: string; text: string; ring: string; icon: React.ReactNode }> = {
  good:      { label: 'Good',      bg: 'bg-green-500',  text: 'text-white', ring: 'ring-green-400',  icon: <Check className="w-7 h-7" /> },
  attention: { label: 'Attention', bg: 'bg-amber-500',  text: 'text-white', ring: 'ring-amber-400',  icon: <AlertTriangle className="w-7 h-7" /> },
  critical:  { label: 'Critical',  bg: 'bg-red-600',    text: 'text-white', ring: 'ring-red-400',    icon: <XCircle className="w-7 h-7" /> },
  na:        { label: 'N/A',       bg: 'bg-gray-400',   text: 'text-white', ring: 'ring-gray-300',   icon: <MinusCircle className="w-7 h-7" /> },
  pending:   { label: 'Pending',   bg: 'bg-gray-200',   text: 'text-gray-500', ring: 'ring-gray-200', icon: null },
};

const PHOTO_PLACEHOLDER_COLORS = ['#2563EB', '#16A34A', '#D97706', '#7C3AED', '#0891B2'];

export function TechInspectionView() {
  const template = MOCK_TEMPLATES.find(t => t.id === MOCK_INPROGRESS_INSPECTION.templateId)!;
  const [items, setItems] = useState<ItemRecord[]>(MOCK_INPROGRESS_INSPECTION.items);
  const [currentIndex, setCurrentIndex] = useState(6);
  const [showJumpList, setShowJumpList] = useState(false);
  const [showVoiceRecording, setShowVoiceRecording] = useState(false);
  const [recordingItem, setRecordingItem] = useState<string | null>(null);
  const [showComplete, setShowComplete] = useState(false);
  const [showPhotoError, setShowPhotoError] = useState(false);

  const inspection = MOCK_INPROGRESS_INSPECTION;
  const currentItem = items[currentIndex];
  const templateItemConfig = template.items.find(ti => ti.id === currentItem.templateItemId);

  const completedCount = items.filter(i => i.status !== 'pending').length;
  const totalCount = items.length;
  const allDone = completedCount === totalCount;
  const progress = (completedCount / totalCount) * 100;

  function setStatus(status: ItemStatus) {
    if (status !== 'good' && status !== 'na' && templateItemConfig?.photoRequirement === 'required') {
      const minPhotos = templateItemConfig.minPhotos;
      if (currentItem.photoCount < minPhotos) {
        setShowPhotoError(true);
        setTimeout(() => setShowPhotoError(false), 3000);
        return;
      }
    }
    setItems(prev => prev.map((it, idx) => idx === currentIndex ? { ...it, status } : it));
  }

  function setObservations(obs: string) {
    setItems(prev => prev.map((it, idx) => idx === currentIndex ? { ...it, observations: obs } : it));
  }

  function addPhoto() {
    setItems(prev => prev.map((it, idx) => idx === currentIndex ? { ...it, photoCount: it.photoCount + 1 } : it));
  }

  function toggleVoiceNote() {
    if (recordingItem === currentItem.id) {
      setRecordingItem(null);
      setItems(prev => prev.map((it, idx) => idx === currentIndex ? { ...it, hasVoiceNote: true } : it));
    } else {
      setRecordingItem(currentItem.id);
    }
  }

  function goToItem(index: number) {
    setCurrentIndex(index);
    setShowJumpList(false);
  }

  function goNext() {
    if (currentIndex < items.length - 1) setCurrentIndex(i => i + 1);
  }
  function goPrev() {
    if (currentIndex > 0) setCurrentIndex(i => i - 1);
  }

  const isCurrentDone = currentItem.status !== 'pending';
  const photosMet = !templateItemConfig?.photoRequirement
    ? true
    : templateItemConfig.photoRequirement === 'none'
    ? true
    : templateItemConfig.photoRequirement === 'optional'
    ? true
    : currentItem.photoCount >= (templateItemConfig.minPhotos || 1);

  const canAdvance = isCurrentDone && photosMet;

  if (showComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-8">
        <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mb-6">
          <ClipboardCheck className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Inspection Complete</h2>
        <p className="text-gray-400 text-center mb-1">{inspection.vehicle} · {inspection.licensePlate}</p>
        <p className="text-gray-400 text-center mb-8">{inspection.customerName}</p>
        <div className="bg-gray-800 rounded-xl p-6 w-full max-w-sm mb-6">
          <div className="flex justify-between text-sm mb-2"><span className="text-gray-400">Items inspected</span><span className="font-semibold">{totalCount}</span></div>
          <div className="flex justify-between text-sm mb-2"><span className="text-gray-400">Items flagged</span><span className="font-semibold text-amber-400">{items.filter(i => i.status === 'attention' || i.status === 'critical').length}</span></div>
          <div className="flex justify-between text-sm mb-2"><span className="text-gray-400">Recommendations</span><span className="font-semibold">{items.filter(i => i.recommendation).length}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-400">Technician</span><span className="font-semibold">{inspection.technicianName}</span></div>
        </div>
        <p className="text-gray-400 text-sm text-center">Report will be sent to {inspection.customerPhone} via SMS.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="font-semibold text-sm">{inspection.vehicle} · <span className="text-gray-400 font-mono text-xs">{inspection.licensePlate}</span></div>
            <div className="text-gray-400 text-xs mt-0.5">{inspection.customerName} · {inspection.technicianName}</div>
          </div>
          <button
            onClick={() => setShowJumpList(!showJumpList)}
            className="flex items-center gap-1.5 text-xs text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg px-3 py-1.5 transition-colors"
          >
            <List className="w-3.5 h-3.5" />
            <span>{completedCount}/{totalCount}</span>
          </button>
        </div>
        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap">{completedCount} of {totalCount} complete</span>
        </div>
      </div>

      {/* Jump list overlay */}
      {showJumpList && (
        <div className="absolute inset-0 z-50 bg-gray-900/95 overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 sticky top-0 bg-gray-900">
            <span className="font-semibold text-sm">Jump to Item</span>
            <button onClick={() => setShowJumpList(false)} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          {(() => {
            const cats = Array.from(new Set(items.map(i => i.category)));
            return cats.map(cat => (
              <div key={cat} className="px-4 py-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{cat}</div>
                {items.filter(i => i.category === cat).map(item => {
                  const idx = items.indexOf(item);
                  const cfg = STATUS_CONFIG[item.status];
                  return (
                    <button
                      key={item.id}
                      onClick={() => goToItem(idx)}
                      className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-lg mb-1 transition-colors ${idx === currentIndex ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${item.status === 'pending' ? 'bg-gray-700 text-gray-500' : cfg.bg}`}>
                        {item.status === 'pending' ? (idx + 1) : <Check className="w-3 h-3" />}
                      </div>
                      <span className="text-sm text-left flex-1">{item.itemName}</span>
                      {item.status !== 'pending' && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ));
          })()}
        </div>
      )}

      {/* Current item */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* Item header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500 uppercase tracking-wider">{currentItem.category}</span>
            <span className="text-xs text-gray-600">·</span>
            <span className="text-xs text-gray-500">Item {currentIndex + 1} of {totalCount}</span>
          </div>
          <h2 className="text-xl font-bold leading-tight">{currentItem.itemName}</h2>
          {templateItemConfig && (
            <p className="text-gray-400 text-sm mt-1">{templateItemConfig.description}</p>
          )}
        </div>

        {/* Instructions */}
        {templateItemConfig?.instructions && (
          <div className="bg-blue-900/40 border border-blue-700/50 rounded-xl p-3">
            <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">Instructions</div>
            <p className="text-sm text-blue-200">{templateItemConfig.instructions}</p>
          </div>
        )}

        {/* Status buttons */}
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Status</div>
          <div className="grid grid-cols-2 gap-3">
            {(['good', 'attention', 'critical', 'na'] as ItemStatus[]).map(s => {
              const cfg = STATUS_CONFIG[s];
              const isSelected = currentItem.status === s;
              return (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`
                    flex flex-col items-center justify-center gap-2 py-5 rounded-2xl font-bold text-lg transition-all
                    ${isSelected
                      ? `${cfg.bg} ${cfg.text} ring-4 ${cfg.ring} scale-[1.02] shadow-lg`
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }
                  `}
                >
                  {cfg.icon}
                  <span className="text-base">{cfg.label}</span>
                </button>
              );
            })}
          </div>
          {showPhotoError && (
            <div className="mt-2 text-xs text-red-400 bg-red-900/30 border border-red-700/50 rounded-lg px-3 py-2">
              {templateItemConfig?.minPhotos} photo{(templateItemConfig?.minPhotos || 0) > 1 ? 's' : ''} required before marking this status.
            </div>
          )}
        </div>

        {/* Photos */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Photos
              {templateItemConfig?.photoRequirement === 'required' && (
                <span className="ml-2 text-red-400 normal-case font-normal">· {templateItemConfig.minPhotos} required</span>
              )}
              {templateItemConfig?.photoRequirement === 'optional' && (
                <span className="ml-2 text-gray-500 normal-case font-normal">· optional</span>
              )}
            </div>
            {templateItemConfig?.photoRequirement !== 'none' && (
              <button
                onClick={addPhoto}
                className="flex items-center gap-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg px-3 py-1.5 transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                Add Photo
              </button>
            )}
          </div>
          {currentItem.photoCount > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: currentItem.photoCount }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl flex items-center justify-center text-white text-xs font-semibold"
                  style={{ background: PHOTO_PLACEHOLDER_COLORS[i % PHOTO_PLACEHOLDER_COLORS.length] }}
                >
                  <Camera className="w-5 h-5 opacity-60" />
                </div>
              ))}
              {templateItemConfig?.photoRequirement === 'required' && currentItem.photoCount < (templateItemConfig.minPhotos || 0) && (
                <div className="aspect-square rounded-xl border-2 border-dashed border-red-700/50 flex items-center justify-center text-red-500 text-xs">
                  {(templateItemConfig.minPhotos || 0) - currentItem.photoCount} more needed
                </div>
              )}
            </div>
          ) : templateItemConfig?.photoRequirement === 'none' ? (
            <div className="text-xs text-gray-600 italic">No photos required for this item.</div>
          ) : (
            <div className="border-2 border-dashed border-gray-700 rounded-xl py-6 flex flex-col items-center justify-center gap-2 text-gray-600">
              <Camera className="w-7 h-7" />
              <span className="text-xs">No photos yet</span>
            </div>
          )}
        </div>

        {/* Voice note */}
        {templateItemConfig?.allowVoiceNote && (
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Voice Note</div>
            {currentItem.hasVoiceNote && recordingItem !== currentItem.id ? (
              <div className="bg-gray-800 rounded-xl p-3 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mic className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex-1">
                  {currentItem.transcript ? (
                    <>
                      <div className="text-xs text-purple-400 mb-1">Transcript</div>
                      <p className="text-sm text-gray-300 italic">"{currentItem.transcript}"</p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400">Voice note recorded</p>
                  )}
                </div>
              </div>
            ) : recordingItem === currentItem.id ? (
              <div className="bg-red-900/40 border border-red-700/50 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center animate-pulse">
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-red-400">Recording...</div>
                  <div className="text-xs text-gray-400 mt-0.5">Tap stop when done</div>
                </div>
                <button onClick={toggleVoiceNote} className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1">
                  <MicOff className="w-3.5 h-3.5" /> Stop
                </button>
              </div>
            ) : (
              <button
                onClick={toggleVoiceNote}
                className="w-full flex items-center gap-3 bg-gray-800 hover:bg-gray-700 rounded-xl p-3 text-left transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                  <Mic className="w-4 h-4 text-gray-400" />
                </div>
                <span className="text-sm text-gray-400">Record voice note</span>
              </button>
            )}
          </div>
        )}

        {/* Observations */}
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Observations</div>
          <textarea
            value={currentItem.observations}
            onChange={e => setObservations(e.target.value)}
            placeholder="Type your observations here..."
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
          />
        </div>

        {/* Ad-hoc item add */}
        <div>
          <button className="w-full flex items-center gap-2 text-xs text-gray-600 hover:text-gray-400 transition-colors py-2">
            <Plus className="w-3.5 h-3.5" />
            Add ad-hoc item
          </button>
        </div>

        <div className="h-4" />
      </div>

      {/* Navigation footer */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-3 flex-shrink-0">
        {allDone && (
          <button
            onClick={() => setShowComplete(true)}
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 font-semibold mb-3 flex items-center justify-center gap-2 transition-colors"
          >
            <ClipboardCheck className="w-5 h-5" />
            Complete Inspection
          </button>
        )}
        <div className="flex gap-3">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl py-3 text-sm font-semibold transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <button
            onClick={goNext}
            disabled={currentIndex === items.length - 1}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-colors ${
              canAdvance
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
            } disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

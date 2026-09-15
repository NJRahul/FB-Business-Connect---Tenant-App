import { useState } from 'react';
import { ArrowLeft, Plus, Camera, FileText, CheckCircle2, AlertTriangle, X, Car, Loader2, Zap } from 'lucide-react';
import type { FleetSession, FleetSessionVehicleWork } from './types';
import { MOCK_FLEET_SESSIONS, MOCK_FLEET_ACCOUNTS } from './mockData';

function cents(c: number) {
  return `R ${(c / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface Props {
  sessionId: string;
  onBack: () => void;
}

export function FleetSessionView({ sessionId, onBack }: Props) {
  const [session, setSession] = useState<FleetSession>(
    MOCK_FLEET_SESSIONS.find(s => s.id === sessionId) || MOCK_FLEET_SESSIONS[0]
  );
  const account = MOCK_FLEET_ACCOUNTS.find(a => a.id === session.fleetAccountId);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    session.vehicleWork[0]?.vehicleId || null
  );
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closing, setClosing] = useState(false);
  const [closed, setClosed] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Add service / part state
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServiceQty, setNewServiceQty] = useState('1');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newPartSku, setNewPartSku] = useState('');
  const [newPartDesc, setNewPartDesc] = useState('');
  const [newPartQty, setNewPartQty] = useState('1');
  const [newPartPrice, setNewPartPrice] = useState('');
  const [findingsText, setFindingsText] = useState('');

  function showToast(msg: string) { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); }

  const selectedWork = session.vehicleWork.find(w => w.vehicleId === selectedVehicleId);

  const totalCents = session.vehicleWork.reduce((sum, w) => {
    const s = w.services.reduce((a, s) => a + s.qty * s.unitPrice, 0);
    const p = w.parts.reduce((a, p) => a + p.qty * p.unitPrice, 0);
    return sum + s + p;
  }, 0);

  function addVehicleToSession(vehicleId: string, vehicleLabel: string) {
    if (session.vehicleWork.some(w => w.vehicleId === vehicleId)) {
      showToast('Vehicle already in session.'); return;
    }
    const newWork: FleetSessionVehicleWork = {
      vehicleId, vehicleLabel, services: [], parts: [], findings: '', photoCount: 0, subtotalCents: 0,
    };
    setSession(s => ({ ...s, vehicleWork: [...s.vehicleWork, newWork] }));
    setSelectedVehicleId(vehicleId);
    setShowAddVehicle(false);
    showToast(`${vehicleLabel} added to session.`);
  }

  function addService() {
    if (!newServiceDesc || !newServicePrice || !selectedVehicleId) return;
    const service = { description: newServiceDesc, qty: parseInt(newServiceQty) || 1, unitPrice: Math.round(parseFloat(newServicePrice) * 100) };
    setSession(s => ({
      ...s, vehicleWork: s.vehicleWork.map(w => w.vehicleId === selectedVehicleId
        ? { ...w, services: [...w.services, service], subtotalCents: w.subtotalCents + service.qty * service.unitPrice }
        : w),
    }));
    setNewServiceDesc(''); setNewServiceQty('1'); setNewServicePrice('');
    showToast('Service added.');
  }

  function addPart() {
    if (!newPartDesc || !newPartPrice || !selectedVehicleId) return;
    const part = { sku: newPartSku, description: newPartDesc, qty: parseInt(newPartQty) || 1, unitPrice: Math.round(parseFloat(newPartPrice) * 100) };
    setSession(s => ({
      ...s, vehicleWork: s.vehicleWork.map(w => w.vehicleId === selectedVehicleId
        ? { ...w, parts: [...w.parts, part], subtotalCents: w.subtotalCents + part.qty * part.unitPrice }
        : w),
    }));
    setNewPartSku(''); setNewPartDesc(''); setNewPartQty('1'); setNewPartPrice('');
    showToast('Part added.');
  }

  function saveFindings() {
    if (!selectedVehicleId) return;
    setSession(s => ({
      ...s, vehicleWork: s.vehicleWork.map(w => w.vehicleId === selectedVehicleId
        ? { ...w, findings: findingsText } : w),
    }));
    showToast('Findings saved.');
  }

  function handleClose() {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setShowCloseModal(false);
      setClosed(true);
      setSession(s => ({ ...s, status: 'invoiced', consolidatedInvoiceId: 'inv_new' }));
      showToast('Session closed. Consolidated invoice INV-2026-0542 generated and sent to AP contact.');
    }, 1500);
  }

  const vehiclesInAccount = account?.vehicles || [];
  const vehiclesNotInSession = vehiclesInAccount.filter(v => !session.vehicleWork.some(w => w.vehicleId === v.id));

  if (closed) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <CheckCircle2 size={52} color="#15803D" />
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.25rem', color: '#1A1A1A' }}>Session Closed</h2>
        <p style={{ color: '#6B7280', fontSize: '0.875rem', textAlign: 'center', maxWidth: 360 }}>
          Consolidated invoice <strong>INV-2026-0542</strong> generated for {cents(totalCents)} (fleet pricing applied).<br />
          Sent to AP contact: {account?.apContact.email}
        </p>
        <button onClick={onBack} className="px-6 py-2.5 rounded-lg text-sm font-semibold" style={{ background: '#00A9AC', color: '#fff' }}>
          Back to Fleet Accounts
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ minHeight: '80vh' }}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg"
          style={{ color: '#6B7280', background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.125rem', color: '#1A1A1A' }}>
              Fleet Session — {session.fleetAccountName}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: session.status === 'in_progress' ? '#EFF6FF' : '#F0FDF4', color: session.status === 'in_progress' ? '#1D4ED8' : '#15803D' }}>
              {session.status.replace('_', ' ')}
            </span>
          </div>
          <p style={{ fontSize: '0.775rem', color: '#9CA3AF', marginTop: 1 }}>
            {session.locationName} · {session.technicianName} · {new Date(session.scheduledStart).toLocaleString()}
            {session.isRecurring && <span style={{ color: '#6B7280', marginLeft: 8 }}>↻ {session.recurringPattern}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right mr-2">
            <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Session Total</p>
            <p style={{ fontWeight: 700, fontSize: '1.125rem', color: '#1A1A1A' }}>{cents(totalCents)}</p>
          </div>
          <button onClick={() => setShowCloseModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold"
            style={{ background: '#00A9AC', color: '#fff' }}>
            Close Session & Generate Invoice
          </button>
        </div>
      </div>

      {/* Split view */}
      <div className="flex gap-4 flex-1">
        {/* LEFT — Vehicle list */}
        <div className="w-72 shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Vehicles ({session.vehicleWork.length})
            </p>
            <button onClick={() => setShowAddVehicle(true)}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg"
              style={{ background: '#E6F7F7', color: '#00A9AC' }}>
              <Plus size={11} /> Add Vehicle
            </button>
          </div>

          {session.vehicleWork.map(w => {
            const vehSubtotal = w.services.reduce((a, s) => a + s.qty * s.unitPrice, 0) + w.parts.reduce((a, p) => a + p.qty * p.unitPrice, 0);
            const isSelected = w.vehicleId === selectedVehicleId;
            return (
              <div key={w.vehicleId}
                onClick={() => { setSelectedVehicleId(w.vehicleId); setFindingsText(w.findings); }}
                className="rounded-xl p-4 cursor-pointer transition-all"
                style={{
                  border: `2px solid ${isSelected ? '#00A9AC' : '#E5E7EB'}`,
                  background: isSelected ? '#E6F7F7' : '#fff',
                }}>
                <div className="flex items-center justify-between mb-1.5">
                  <p style={{ fontWeight: 600, fontSize: '0.825rem', color: isSelected ? '#00A9AC' : '#1A1A1A' }}>{w.vehicleLabel}</p>
                  {isSelected && <div className="w-2 h-2 rounded-full" style={{ background: '#00A9AC' }} />}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>{w.services.length} svc</span>
                    <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>{w.parts.length} parts</span>
                    {w.photoCount > 0 && <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>📷 {w.photoCount}</span>}
                  </div>
                  <p style={{ fontWeight: 600, fontSize: '0.8rem', color: '#374151' }}>{cents(vehSubtotal)}</p>
                </div>
                {w.findings && (
                  <p style={{ fontSize: '0.7rem', color: '#F59E0B', marginTop: 4 }}>⚠ Findings noted</p>
                )}
              </div>
            );
          })}

          {session.vehicleWork.length === 0 && (
            <div className="rounded-xl p-6 text-center" style={{ border: '1px dashed #E5E7EB' }}>
              <Car size={20} color="#D1D5DB" className="mx-auto mb-2" />
              <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Add vehicles to start</p>
            </div>
          )}

          {/* Add vehicle dropdown */}
          {showAddVehicle && (
            <div className="rounded-xl p-4" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
              <div className="flex items-center justify-between mb-3">
                <p style={{ fontSize: '0.825rem', fontWeight: 600, color: '#1A1A1A' }}>Add Vehicle</p>
                <button onClick={() => setShowAddVehicle(false)} style={{ color: '#9CA3AF' }}><X size={14} /></button>
              </div>
              {vehiclesNotInSession.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>All fleet vehicles are in this session.</p>
              ) : vehiclesNotInSession.map(v => (
                <button key={v.id} onClick={() => addVehicleToSession(v.id, `${v.year} ${v.make} ${v.model} · ${v.plate}`)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors"
                  style={{ background: '#fff', border: '1px solid #E5E7EB', color: '#1A1A1A' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#E6F7F7')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                  <span style={{ fontWeight: 500 }}>{v.year} {v.make} {v.model}</span>
                  <span style={{ color: '#9CA3AF', marginLeft: 6 }}>{v.plate}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Working invoice */}
        <div className="flex-1 flex flex-col gap-4">
          {!selectedWork ? (
            <div className="rounded-xl p-12 text-center" style={{ background: '#F9FAFB', border: '1px dashed #E5E7EB' }}>
              <Car size={28} color="#D1D5DB" className="mx-auto mb-3" />
              <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Select a vehicle on the left to start adding services and parts.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1A1A1A' }}>{selectedWork.vehicleLabel}</h3>
                <span style={{ fontSize: '0.825rem', color: '#00A9AC', fontWeight: 600 }}>
                  Fleet pricing applied
                </span>
              </div>

              {/* Services */}
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
                <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Services</p>
                  <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{selectedWork.services.length} items</p>
                </div>
                {selectedWork.services.map((s, i) => (
                  <div key={i} className="flex items-center px-4 py-2.5 justify-between" style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <p style={{ fontSize: '0.825rem', color: '#1A1A1A' }}>{s.description}</p>
                    <div className="flex items-center gap-4">
                      <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>×{s.qty} @ {cents(s.unitPrice)}</p>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1A1A1A', minWidth: 64, textAlign: 'right' }}>{cents(s.qty * s.unitPrice)}</p>
                    </div>
                  </div>
                ))}
                {/* Add service row */}
                <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: '#FAFAFA' }}>
                  <input value={newServiceDesc} onChange={e => setNewServiceDesc(e.target.value)} placeholder="Service description…"
                    className="flex-1 px-2.5 py-1.5 rounded-lg text-sm outline-none"
                    style={{ border: '1px solid #E5E7EB', color: '#1A1A1A', background: '#fff' }} />
                  <input type="number" value={newServiceQty} onChange={e => setNewServiceQty(e.target.value)} placeholder="Qty"
                    className="w-14 px-2 py-1.5 rounded-lg text-sm outline-none text-center"
                    style={{ border: '1px solid #E5E7EB', color: '#1A1A1A', background: '#fff' }} />
                  <input type="number" value={newServicePrice} onChange={e => setNewServicePrice(e.target.value)} placeholder="Price"
                    className="w-20 px-2 py-1.5 rounded-lg text-sm outline-none"
                    style={{ border: '1px solid #E5E7EB', color: '#1A1A1A', background: '#fff' }} />
                  <button onClick={addService} disabled={!newServiceDesc || !newServicePrice}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{ background: '#00A9AC', color: '#fff', opacity: newServiceDesc && newServicePrice ? 1 : 0.4 }}>
                    Add
                  </button>
                </div>
              </div>

              {/* Parts */}
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
                <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Parts</p>
                  <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{selectedWork.parts.length} items</p>
                </div>
                {selectedWork.parts.map((p, i) => (
                  <div key={i} className="flex items-center px-4 py-2.5 justify-between" style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <div>
                      <p style={{ fontSize: '0.825rem', color: '#1A1A1A' }}>{p.description}</p>
                      {p.sku && <p style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: '#9CA3AF' }}>{p.sku}</p>}
                    </div>
                    <div className="flex items-center gap-4">
                      <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>×{p.qty} @ {cents(p.unitPrice)}</p>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1A1A1A', minWidth: 64, textAlign: 'right' }}>{cents(p.qty * p.unitPrice)}</p>
                    </div>
                  </div>
                ))}
                {/* Add part row */}
                <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: '#FAFAFA' }}>
                  <input value={newPartSku} onChange={e => setNewPartSku(e.target.value)} placeholder="SKU"
                    className="w-24 px-2 py-1.5 rounded-lg text-sm outline-none font-mono"
                    style={{ border: '1px solid #E5E7EB', color: '#6B7280', background: '#fff', fontSize: '0.75rem' }} />
                  <input value={newPartDesc} onChange={e => setNewPartDesc(e.target.value)} placeholder="Part description…"
                    className="flex-1 px-2.5 py-1.5 rounded-lg text-sm outline-none"
                    style={{ border: '1px solid #E5E7EB', color: '#1A1A1A', background: '#fff' }} />
                  <input type="number" value={newPartQty} onChange={e => setNewPartQty(e.target.value)} placeholder="Qty"
                    className="w-14 px-2 py-1.5 rounded-lg text-sm outline-none text-center"
                    style={{ border: '1px solid #E5E7EB', color: '#1A1A1A', background: '#fff' }} />
                  <input type="number" value={newPartPrice} onChange={e => setNewPartPrice(e.target.value)} placeholder="Price"
                    className="w-20 px-2 py-1.5 rounded-lg text-sm outline-none"
                    style={{ border: '1px solid #E5E7EB', color: '#1A1A1A', background: '#fff' }} />
                  <button onClick={addPart} disabled={!newPartDesc || !newPartPrice}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{ background: '#374151', color: '#fff', opacity: newPartDesc && newPartPrice ? 1 : 0.4 }}>
                    Add
                  </button>
                </div>
              </div>

              {/* Findings + photos */}
              <div className="rounded-xl p-4" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
                <div className="flex items-center justify-between mb-2">
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>Technician Findings</p>
                  <button className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg" style={{ background: '#F9FAFB', color: '#374151', border: '1px solid #E5E7EB' }}>
                    <Camera size={11} /> Add Photo
                  </button>
                </div>
                <textarea value={findingsText} onChange={e => setFindingsText(e.target.value)}
                  onBlur={saveFindings}
                  placeholder="Note findings, recommendations, or observations for this vehicle…"
                  rows={2} className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                  style={{ border: '1px solid #E5E7EB', color: '#1A1A1A', fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }} />
                {selectedWork.photoCount > 0 && (
                  <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: 4 }}>📷 {selectedWork.photoCount} photos attached</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Close session modal */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 mx-4" style={{ background: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#1A1A1A', marginBottom: 16 }}>Close Session & Generate Invoice</h3>
            <div className="rounded-xl p-4 mb-4" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
              <p style={{ fontSize: '0.825rem', color: '#9A3412', fontWeight: 600 }}>Consolidated Invoice Summary</p>
              <div className="mt-2 flex flex-col gap-1">
                {session.vehicleWork.map(w => {
                  const sub = w.services.reduce((a, s) => a + s.qty * s.unitPrice, 0) + w.parts.reduce((a, p) => a + p.qty * p.unitPrice, 0);
                  return (
                    <div key={w.vehicleId} className="flex justify-between">
                      <p style={{ fontSize: '0.8rem', color: '#7C3AED' }}>{w.vehicleLabel}</p>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1A1A1A' }}>{cents(sub)}</p>
                    </div>
                  );
                })}
                <div className="flex justify-between pt-2 mt-1" style={{ borderTop: '1px solid #FED7AA' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1A1A1A' }}>Total</p>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#00A9AC' }}>{cents(totalCents)}</p>
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.825rem', color: '#6B7280', marginBottom: 20 }}>
              Invoice will be posted at fleet pricing and delivered to {account?.apContact.email} via email. Net-terms billing will apply ({account?.paymentTerms}).
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowCloseModal(false)}
                className="flex-1 py-2.5 rounded-lg text-sm" style={{ background: '#F9FAFB', color: '#6B7280', border: '1px solid #E5E7EB' }}>Cancel</button>
              <button onClick={handleClose} disabled={closing}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                style={{ background: '#00A9AC', color: '#fff', opacity: closing ? 0.7 : 1 }}>
                {closing ? <Loader2 size={14} className="animate-spin" /> : null}
                {closing ? 'Generating…' : 'Close & Invoice'}
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

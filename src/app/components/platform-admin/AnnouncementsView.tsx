import { useState } from 'react';
import { Plus, Megaphone, CheckCircle2, Clock, X } from 'lucide-react';
import type { PlatformAnnouncement, AnnouncementStatus } from './types';
import { MOCK_ANNOUNCEMENTS } from './mockData';

const STATUS_BADGE: Record<AnnouncementStatus, { label: string; bg: string; color: string }> = {
  scheduled: { label: 'Scheduled', bg: '#0C1A2E', color: '#60A5FA' },
  active:    { label: 'Active',    bg: '#052E16', color: '#4ADE80' },
  expired:   { label: 'Expired',  bg: '#1F2937', color: '#6B7280' },
};

function StatusBadge({ status }: { status: AnnouncementStatus }) {
  const s = STATUS_BADGE[status];
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

export function AnnouncementsView() {
  const [announcements, setAnnouncements] = useState<PlatformAnnouncement[]>(MOCK_ANNOUNCEMENTS);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [visibleFrom, setVisibleFrom] = useState('');
  const [visibleUntil, setVisibleUntil] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  }

  function calcStatus(from: string, until: string): AnnouncementStatus {
    const now = Date.now();
    const f = new Date(from).getTime();
    const u = new Date(until).getTime();
    if (now < f) return 'scheduled';
    if (now > u) return 'expired';
    return 'active';
  }

  function createAnnouncement() {
    if (!title.trim() || !body.trim() || !visibleFrom || !visibleUntil) return;
    const ann: PlatformAnnouncement = {
      id: `ann_${Date.now()}`, title: title.trim(), body: body.trim(),
      visibleFrom, visibleUntil, createdBy: 'Alex Rivera',
      createdAt: new Date().toISOString(), status: calcStatus(visibleFrom, visibleUntil),
    };
    setAnnouncements(a => [ann, ...a]);
    setShowCreate(false);
    setTitle(''); setBody(''); setVisibleFrom(''); setVisibleUntil('');
    showToast('Announcement published. Visible to all shop admins.');
  }

  function remove(id: string) {
    setAnnouncements(a => a.filter(x => x.id !== id));
    showToast('Announcement removed.');
  }

  return (
    <div className="flex flex-col h-full" style={{ color: '#F9FAFB' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.25rem' }}>System Announcements</h2>
          <p style={{ fontSize: '0.825rem', color: '#6B7280', marginTop: 2 }}>
            Announcements appear in the shop admin banner for all tenants.
          </p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ background: '#DC2626', color: '#fff' }}>
          <Plus size={14} /> New Announcement
        </button>
      </div>

      {/* Announcement cards */}
      <div className="flex flex-col gap-4">
        {announcements.length === 0 && (
          <div className="rounded-xl p-10 text-center" style={{ background: '#111827', border: '1px solid #1F2937' }}>
            <Megaphone size={28} color="#4B5563" className="mx-auto mb-3" />
            <p style={{ color: '#6B7280' }}>No announcements yet.</p>
          </div>
        )}
        {announcements.map(ann => (
          <div key={ann.id} className="rounded-xl p-5" style={{ background: '#111827', border: '1px solid #1F2937' }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: ann.status === 'active' ? '#052E16' : '#1F2937' }}>
                  <Megaphone size={16} color={ann.status === 'active' ? '#4ADE80' : '#6B7280'} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#F9FAFB' }}>{ann.title}</p>
                    <StatusBadge status={ann.status} />
                  </div>
                  <p style={{ fontSize: '0.825rem', color: '#9CA3AF', lineHeight: 1.6 }}>{ann.body}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="flex items-center gap-1 text-xs" style={{ color: '#4B5563' }}>
                      <Clock size={11} />
                      {new Date(ann.visibleFrom).toLocaleDateString()} – {new Date(ann.visibleUntil).toLocaleDateString()}
                    </span>
                    <span className="text-xs" style={{ color: '#4B5563' }}>By {ann.createdBy}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => remove(ann.id)} style={{ color: '#4B5563', flexShrink: 0 }}>
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Simulated shop banner preview */}
      {announcements.some(a => a.status === 'active') && (
        <div className="mt-6">
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Shop Admin Preview (live)
          </p>
          {announcements.filter(a => a.status === 'active').map(ann => (
            <div key={ann.id} className="flex items-center gap-3 px-4 py-3 rounded-lg"
              style={{ background: '#0C1A2E', border: '1px solid #1D3557' }}>
              <Megaphone size={14} color="#60A5FA" />
              <p style={{ fontSize: '0.825rem', color: '#BFDBFE' }}><strong>{ann.title}:</strong> {ann.body}</p>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-lg rounded-2xl p-6 mx-4" style={{ background: '#111827', border: '1px solid #1F2937' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 style={{ fontWeight: 700, color: '#F9FAFB', fontSize: '1rem' }}>New Announcement</h3>
              <button onClick={() => setShowCreate(false)} style={{ color: '#6B7280' }}><X size={18} /></button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 600 }}>Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Scheduled Maintenance Saturday 2 AM"
                  className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: '#0D1526', border: '1px solid #1F2937', color: '#F9FAFB' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 600 }}>Body</label>
                <textarea value={body} onChange={e => setBody(e.target.value)} rows={3}
                  placeholder="Describe the announcement in detail…"
                  className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none resize-none"
                  style={{ background: '#0D1526', border: '1px solid #1F2937', color: '#F9FAFB', fontFamily: 'Inter, sans-serif' }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 600 }}>Visible From</label>
                  <input type="datetime-local" value={visibleFrom} onChange={e => setVisibleFrom(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: '#0D1526', border: '1px solid #1F2937', color: '#F9FAFB', colorScheme: 'dark' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 600 }}>Visible Until</label>
                  <input type="datetime-local" value={visibleUntil} onChange={e => setVisibleUntil(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: '#0D1526', border: '1px solid #1F2937', color: '#F9FAFB', colorScheme: 'dark' }} />
                </div>
              </div>
              <div className="flex gap-3 mt-1">
                <button onClick={() => setShowCreate(false)}
                  className="flex-1 py-2 rounded-lg text-sm" style={{ background: '#1F2937', color: '#9CA3AF' }}>Cancel</button>
                <button onClick={createAnnouncement}
                  disabled={!title.trim() || !body.trim() || !visibleFrom || !visibleUntil}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: '#DC2626', color: '#fff', opacity: title && body && visibleFrom && visibleUntil ? 1 : 0.4 }}>
                  Publish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-6 right-6 px-4 py-3 rounded-xl text-sm font-medium z-50"
          style={{ background: '#052E16', color: '#4ADE80', border: '1px solid #14532D' }}>
          <CheckCircle2 size={14} className="inline mr-2" />{toastMsg}
        </div>
      )}
    </div>
  );
}

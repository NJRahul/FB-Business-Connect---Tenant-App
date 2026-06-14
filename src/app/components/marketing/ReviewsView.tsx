import { useState } from 'react';
import { Star, MessageSquare, ExternalLink, Send, Eye, EyeOff, Clock, CheckCircle } from 'lucide-react';
import { REVIEWS, REVIEW_REQUESTS } from './mockData';
import type { Review } from './types';

const StarDisplay = ({ rating, size = 16 }: { rating: number; size?: number }) => (
  <span style={{ display: 'inline-flex', gap: 2 }}>
    {[1, 2, 3, 4, 5].map(s => (
      <Star key={s} size={size} fill={s <= rating ? '#F59E0B' : 'none'} color={s <= rating ? '#F59E0B' : '#D1D5DB'} />
    ))}
  </span>
);

const SOURCE_CFG: Record<string, { label: string; color: string; bg: string }> = {
  platform: { label: 'Platform', color: '#2563EB', bg: '#EFF6FF' },
  gbp:      { label: 'Google Business', color: '#15803D', bg: '#F0FDF4' },
};

function ReviewCard({ review }: { review: Review }) {
  const [response, setResponse] = useState(review.staffResponse ?? '');
  const [published, setPublished] = useState(review.published);
  const [visible, setVisible] = useState(review.published);
  const [saved, setSaved] = useState(false);

  const src = SOURCE_CFG[review.source];

  function handlePublishResponse() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{
      border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff',
      padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', background: '#FDEDEC',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#C0392B', fontSize: 15,
          }}>
            {review.customerName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#1A1A1A', fontSize: 14 }}>{review.customerName}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <StarDisplay rating={review.rating} size={14} />
              <span style={{ fontSize: 12, color: '#6B7280' }}>
                {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600,
            background: src.bg, color: src.color,
          }}>
            {src.label}
            {review.locationName && ` · ${review.locationName}`}
          </span>
          <button
            onClick={() => setVisible(v => !v)}
            title={visible ? 'Hide from storefront' : 'Show on storefront'}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
              borderRadius: 6, border: '1px solid #E5E7EB', background: visible ? '#F0FDF4' : '#F9FAFB',
              color: visible ? '#15803D' : '#6B7280', cursor: 'pointer', fontSize: 12, fontWeight: 500,
            }}
          >
            {visible ? <Eye size={13} /> : <EyeOff size={13} />}
            {visible ? 'Published' : 'Hidden'}
          </button>
        </div>
      </div>

      {/* Review text */}
      <p style={{ margin: 0, color: '#374151', fontSize: 14, lineHeight: 1.6 }}>
        {review.feedbackText}
      </p>

      {/* Staff response section */}
      <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <MessageSquare size={14} color="#6B7280" />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#6B7280' }}>Staff Response</span>
          {review.responsePublishedAt && (
            <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 4 }}>
              · Published {new Date(review.responsePublishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
        <textarea
          value={response}
          onChange={e => setResponse(e.target.value)}
          placeholder="Write a response that will be displayed publicly alongside this review…"
          rows={3}
          style={{
            width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '10px 12px',
            fontSize: 13, color: '#1A1A1A', resize: 'vertical', boxSizing: 'border-box',
            fontFamily: 'Inter, sans-serif', outline: 'none', lineHeight: 1.5,
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button
            onClick={handlePublishResponse}
            disabled={!response.trim()}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
              borderRadius: 7, border: 'none', cursor: response.trim() ? 'pointer' : 'not-allowed',
              background: saved ? '#27AE60' : (response.trim() ? '#C0392B' : '#E5E7EB'),
              color: response.trim() ? '#fff' : '#9CA3AF', fontSize: 13, fontWeight: 600,
              transition: 'background 0.2s',
            }}
          >
            {saved ? <CheckCircle size={14} /> : <Send size={14} />}
            {saved ? 'Response Published' : 'Publish Response'}
          </button>
        </div>
      </div>
    </div>
  );
}

function RequestsTable() {
  return (
    <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#F9FAFB' }}>
            {['Customer', 'Sent', 'Channel', 'Status'].map(h => (
              <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {REVIEW_REQUESTS.map((rr, i) => (
            <tr key={rr.id} style={{ background: i % 2 === 0 ? '#fff' : '#F9FAFB' }}>
              <td style={{ padding: '12px 16px', fontSize: 14, color: '#1A1A1A', fontWeight: 500 }}>{rr.customerName}</td>
              <td style={{ padding: '12px 16px', fontSize: 13, color: '#6B7280' }}>
                {new Date(rr.sentAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </td>
              <td style={{ padding: '12px 16px' }}>
                <span style={{
                  padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                  background: rr.channel === 'email' ? '#EFF6FF' : '#F0FDF4',
                  color: rr.channel === 'email' ? '#2563EB' : '#15803D',
                }}>
                  {rr.channel === 'email' ? 'Email' : 'SMS'}
                </span>
              </td>
              <td style={{ padding: '12px 16px' }}>
                {rr.completed ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#27AE60' }}>
                    <CheckCircle size={13} /> Review received
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 500, color: '#9CA3AF' }}>
                    <Clock size={13} /> Awaiting response
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const TABS = [
  { id: 'reviews', label: 'Reviews' },
  { id: 'requests', label: 'Review Requests' },
] as const;
type Tab = typeof TABS[number]['id'];

export default function ReviewsView() {
  const [tab, setTab] = useState<Tab>('reviews');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterSource, setFilterSource] = useState<'all' | 'platform' | 'gbp'>('all');

  const avgRating = REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length;
  const byRating = [5, 4, 3, 2, 1].map(r => ({ r, n: REVIEWS.filter(rv => rv.rating === r).length }));

  const filtered = REVIEWS.filter(r =>
    (filterRating === null || r.rating === filterRating) &&
    (filterSource === 'all' || r.source === filterSource)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'Total Reviews', value: REVIEWS.length, sub: 'all time' },
          { label: 'Average Rating', value: avgRating.toFixed(1), sub: 'out of 5.0', star: true },
          { label: 'Response Rate', value: `${Math.round(REVIEWS.filter(r => r.staffResponse).length / REVIEWS.length * 100)}%`, sub: 'staff responded' },
          { label: 'Published', value: REVIEWS.filter(r => r.published).length, sub: 'on storefront' },
        ].map(s => (
          <div key={s.label} style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 20px', background: '#fff' }}>
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>{s.label}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 28, color: '#1A1A1A' }}>{s.value}</span>
              {s.star && <Star size={20} fill="#F59E0B" color="#F59E0B" />}
            </div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Rating breakdown */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 20px', background: '#fff' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 12 }}>Rating Breakdown</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {byRating.map(({ r, n }) => (
            <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: '#6B7280', width: 30 }}>{r}★</span>
              <div style={{ flex: 1, height: 8, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#F59E0B', borderRadius: 4, width: `${(n / REVIEWS.length) * 100}%`, transition: 'width 0.3s' }} />
              </div>
              <span style={{ fontSize: 12, color: '#6B7280', width: 20, textAlign: 'right' }}>{n}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #E5E7EB' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: 14,
            color: tab === t.id ? '#C0392B' : '#6B7280',
            borderBottom: tab === t.id ? '2px solid #C0392B' : '2px solid transparent',
            marginBottom: -2,
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'reviews' && (
        <>
          {/* Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{ fontSize: 13, color: '#6B7280', alignSelf: 'center' }}>Rating:</span>
              {[null, 5, 4, 3, 2, 1].map(r => (
                <button
                  key={r ?? 'all'}
                  onClick={() => setFilterRating(r)}
                  style={{
                    padding: '4px 10px', borderRadius: 6, border: '1px solid #E5E7EB',
                    background: filterRating === r ? '#FDEDEC' : '#fff',
                    color: filterRating === r ? '#C0392B' : '#6B7280',
                    cursor: 'pointer', fontSize: 12, fontWeight: 500,
                  }}
                >
                  {r === null ? 'All' : `${r}★`}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, marginLeft: 16 }}>
              <span style={{ fontSize: 13, color: '#6B7280', alignSelf: 'center' }}>Source:</span>
              {([['all', 'All'], ['platform', 'Platform'], ['gbp', 'Google']] as const).map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => setFilterSource(v)}
                  style={{
                    padding: '4px 10px', borderRadius: 6, border: '1px solid #E5E7EB',
                    background: filterSource === v ? '#FDEDEC' : '#fff',
                    color: filterSource === v ? '#C0392B' : '#6B7280',
                    cursor: 'pointer', fontSize: 12, fontWeight: 500,
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF', fontSize: 14 }}>No reviews match your filters.</div>
            ) : filtered.map(r => <ReviewCard key={r.id} review={r} />)}
          </div>
        </>
      )}

      {tab === 'requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>
              Review requests are sent automatically within 24 hours of a completed visit. Customers who submit a review are removed from the campaign immediately.
            </p>
          </div>
          <RequestsTable />
        </div>
      )}
    </div>
  );
}

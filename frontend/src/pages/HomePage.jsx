import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:3000/api';

const CATEGORIES = [
  {
    name: 'Âm nhạc Đỉnh cao',
    bg: 'linear-gradient(160deg, #1e1b4b 0%, #312e81 60%, #0f0f2e 100%)',
    overlay: 'rgba(99,102,241,0.15)',
  },
  {
    name: 'Nghệ thuật',
    bg: 'linear-gradient(160deg, #450a0a 0%, #7f1d1d 60%, #1c0505 100%)',
    overlay: 'rgba(239,68,68,0.15)',
  },
  {
    name: 'Thể thao',
    bg: 'linear-gradient(160deg, #0c4a6e 0%, #075985 60%, #0a2744 100%)',
    overlay: 'rgba(6,182,212,0.15)',
  },
];

const CATEGORY_BADGES = ['HOÀ NHẠC', 'ROCK / INDIE', 'HÀI ĐỘC THOẠI', 'SỰ KIỆN', 'EDM', 'POP'];

function getEventBadge(event, idx) {
  if (event.title?.toLowerCase().includes('nhạc') || event.title?.toLowerCase().includes('hòa')) return 'HOÀ NHẠC';
  if (event.title?.toLowerCase().includes('rock') || event.title?.toLowerCase().includes('band')) return 'ROCK / INDIE';
  if (event.title?.toLowerCase().includes('edm') || event.title?.toLowerCase().includes('dj')) return 'EDM';
  if (event.title?.toLowerCase().includes('hài') || event.title?.toLowerCase().includes('comedy')) return 'HÀI ĐỘC THOẠI';
  return CATEGORY_BADGES[idx % CATEGORY_BADGES.length];
}

function EventCard({ event, idx, onClick }) {
  const d = new Date(event.start_time);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const minPrice = event.zones?.length > 0 ? Math.min(...event.zones.map(z => Number(z.price))) : 0;
  const badge = getEventBadge(event, idx);

  const gradients = [
    'linear-gradient(135deg, #1e1b4b, #312e81)',
    'linear-gradient(135deg, #3b0764, #7e22ce)',
    'linear-gradient(135deg, #0c4a6e, #0369a1)',
    'linear-gradient(135deg, #14532d, #166534)',
    'linear-gradient(135deg, #450a0a, #991b1b)',
  ];

  return (
    <div className="event-card" onClick={onClick}>
      <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.target.style.display = 'none'; e.target.parentNode.style.background = gradients[idx % gradients.length]; }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: gradients[idx % gradients.length] }} />
        )}
        {/* Date badge */}
        <div style={{
          position: 'absolute', top: 10, right: 10,
          background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)',
          borderRadius: 8, padding: '0.3rem 0.5rem',
          textAlign: 'center', minWidth: 42,
        }}>
          <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em' }}>TH {month}</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.1, color: '#fff' }}>{day}</div>
        </div>
        {/* Category badge */}
        <div style={{ position: 'absolute', bottom: 10, left: 10 }}>
          <span className="badge badge-purple" style={{ fontSize: '0.63rem' }}>{badge}</span>
        </div>
      </div>

      <div style={{ padding: '0.875rem' }}>
        <h3 style={{ fontSize: '0.975rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {event.title}
        </h3>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '0.75rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            {d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} – {d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
            {event.location}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 1 }}>Từ</div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
              {minPrice > 0 ? `${minPrice.toLocaleString('vi-VN')}đ` : 'Miễn phí'}
            </div>
          </div>
          <button className="btn btn-outline" style={{ fontSize: '0.78rem', padding: '0.35rem 0.875rem' }}>
            Mua vé
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroSearch, setHeroSearch] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const q = searchParams.get('q') || '';

  useEffect(() => {
    axios.get(`${API}/events`)
      .then(res => setEvents(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = q
    ? events.filter(ev => ev.title?.toLowerCase().includes(q.toLowerCase()) || ev.location?.toLowerCase().includes(q.toLowerCase()))
    : events;

  const featured = events.find(e => e.status === 'PUBLISHED') || events[0];

  const goToEvent = (id) => navigate(`/event/${id}/queue`);

  const handleHeroSearch = (e) => {
    if (e.key === 'Enter' && heroSearch.trim()) {
      navigate(`/?q=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  return (
    <div>
      {/* ── Hero ── */}
      <div style={{
        position: 'relative', minHeight: '60vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end', padding: '2.5rem 3rem',
        background: featured?.image_url ? undefined : 'linear-gradient(160deg, #0f0a2e 0%, #1a0533 45%, #050514 100%)',
        overflow: 'hidden',
      }}>
        {featured?.image_url && (
          <>
            <img src={featured.image_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,20,1) 0%, rgba(10,10,20,0.65) 50%, rgba(10,10,20,0.15) 100%)' }} />
          </>
        )}
        {/* Ambient glow */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 20% 60%, rgba(124,58,237,0.2) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 40%, rgba(6,182,212,0.12) 0%, transparent 60%)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 680 }}>
          <span className="badge badge-purple" style={{ marginBottom: '1rem', fontSize: '0.68rem' }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            SỰ KIỆN NỔI BẬT
          </span>

          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 3rem)', fontWeight: 900, marginBottom: '0.875rem', textShadow: '0 2px 24px rgba(0,0,0,0.6)', lineHeight: 1.1 }}>
            {featured?.title || 'NEON DREAMS FESTIVAL 2024'}
          </h1>

          {featured && (
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.78)', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                {new Date(featured.start_time).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                {featured.location}
              </span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}
              onClick={() => featured && goToEvent(featured.id)}>
              Mua vé ngay
            </button>
            <button className="btn btn-ghost" style={{ width: 40, height: 40, padding: 0, borderRadius: '50%' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search overlay */}
        <div className="hero-search" style={{
          position: 'absolute', bottom: '2rem', right: '3rem', zIndex: 1,
          display: 'flex', gap: '0.625rem',
          background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
          padding: '0.75rem', width: 420,
        }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <svg style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Tìm nghệ sĩ, sự kiện..."
              value={heroSearch}
              onChange={e => setHeroSearch(e.target.value)}
              onKeyDown={handleHeroSearch}
              style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, padding: '0.5rem 0.75rem 0.5rem 2.2rem', color: 'white', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit' }}
            />
          </div>
          <button className="btn btn-ghost" style={{ padding: '0.45rem 0.875rem', fontSize: '0.78rem', gap: '0.35rem' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
            Bộ lọc
          </button>
          <button className="btn btn-ghost" style={{ padding: '0.45rem 0.875rem', fontSize: '0.78rem', gap: '0.35rem' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            Thời gian
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>

        {/* Categories */}
        {!q && (
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.25rem' }}>Khám phá theo Thể loại</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {CATEGORIES.map(cat => (
                <div
                  key={cat.name}
                  style={{
                    height: 140, borderRadius: 12, background: cat.bg,
                    display: 'flex', alignItems: 'flex-end', padding: '1rem',
                    cursor: 'pointer', border: '1px solid var(--border)',
                    position: 'relative', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ position: 'absolute', inset: 0, background: cat.overlay }} />
                  <span style={{ fontWeight: 700, fontSize: '1rem', textShadow: '0 1px 8px rgba(0,0,0,0.8)', position: 'relative', zIndex: 1 }}>
                    {cat.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Events */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>
              {q ? `Kết quả tìm kiếm cho "${q}"` : 'Sắp diễn ra'}
            </h2>
            {!q && (
              <button className="btn btn-ghost" style={{ fontSize: '0.85rem', color: 'var(--purple-light)', padding: '0.3rem 0.75rem' }}>
                Xem tất cả →
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
              <div className="spinner" />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
              {q ? `Không tìm thấy sự kiện nào cho "${q}"` : 'Chưa có sự kiện nào được công bố.'}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {filtered.map((ev, i) => (
                <EventCard key={ev.id} event={ev} idx={i} onClick={() => goToEvent(ev.id)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

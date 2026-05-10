import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

import { API_BASE } from '../config';

const API = API_BASE;

const CATEGORY_GRADIENTS = [
  { bg: 'linear-gradient(160deg, #1e1b4b 0%, #312e81 60%, #0f0f2e 100%)', overlay: 'rgba(99,102,241,0.15)' },
  { bg: 'linear-gradient(160deg, #450a0a 0%, #7f1d1d 60%, #1c0505 100%)', overlay: 'rgba(239,68,68,0.15)' },
  { bg: 'linear-gradient(160deg, #0c4a6e 0%, #075985 60%, #0a2744 100%)', overlay: 'rgba(6,182,212,0.15)' },
  { bg: 'linear-gradient(160deg, #14532d 0%, #166534 60%, #052010 100%)', overlay: 'rgba(34,197,94,0.15)' },
  { bg: 'linear-gradient(160deg, #431407 0%, #9a3412 60%, #1c0905 100%)', overlay: 'rgba(249,115,22,0.15)' },
  { bg: 'linear-gradient(160deg, #1e1b4b 0%, #5b21b6 60%, #2e1065 100%)', overlay: 'rgba(167,139,250,0.2)' },
];

function EventCard({ event, idx, onClick }) {
  const d = new Date(event.start_time);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const minPrice = event.zones?.length > 0 ? Math.min(...event.zones.map(z => Number(z.price))) : 0;
  const badge = event.categories?.name || 'Sá»° KIá»†N';

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
        <div style={{
          position: 'absolute', top: 10, right: 10,
          background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)',
          borderRadius: 8, padding: '0.3rem 0.5rem',
          textAlign: 'center', minWidth: 42,
        }}>
          <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em' }}>TH {month}</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.1, color: '#fff' }}>{day}</div>
        </div>
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
            {d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
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
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroSearch, setHeroSearch] = useState('');
  const [heroIdx, setHeroIdx] = useState(0);
  const [filterCategory, setFilterCategory] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const filterRef = useRef(null);

  const q = searchParams.get('q') || '';

  useEffect(() => {
    Promise.allSettled([
      axios.get(`${API}/events`),
      axios.get(`${API}/categories`),
    ]).then(([evRes, catRes]) => {
      if (evRes.status === 'fulfilled') setEvents(evRes.value.data.data || []);
      if (catRes.status === 'fulfilled') setCategories(catRes.value.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  // Auto-advance hero carousel every 5s
  const featuredEvents = events.filter(e => e.status === 'PUBLISHED');
  useEffect(() => {
    if (featuredEvents.length <= 1) return;
    const timer = setInterval(() => setHeroIdx(i => (i + 1) % featuredEvents.length), 5000);
    return () => clearInterval(timer);
  }, [featuredEvents.length]);

  // Close filter menu on outside click
  useEffect(() => {
    const handler = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilterMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const featured = featuredEvents[heroIdx] || events[0];

  const filtered = events.filter(ev => {
    const matchQ = q ? (ev.title?.toLowerCase().includes(q.toLowerCase()) || ev.location?.toLowerCase().includes(q.toLowerCase())) : true;
    const matchCat = filterCategory ? ev.category_id === filterCategory : true;
    return matchQ && matchCat;
  });

  const goToEvent = (id) => navigate(`/event/${id}/queue`);

  const handleHeroSearch = (e) => {
    if (e.key === 'Enter' && heroSearch.trim()) {
      navigate(`/?q=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  return (
    <div>
      {/* â”€â”€ Hero Carousel â”€â”€ */}
      <div style={{
        position: 'relative', minHeight: '60vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end', padding: '2.5rem 3rem',
        background: 'linear-gradient(160deg, #0f0a2e 0%, #1a0533 45%, #050514 100%)',
        overflow: 'hidden',
      }}>
        {/* Background image with crossfade */}
        {featuredEvents.map((ev, i) => (
          ev.image_url && (
            <img key={ev.id} src={ev.image_url} alt="" style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', opacity: i === heroIdx ? 0.35 : 0,
              transition: 'opacity 0.8s ease',
            }} />
          )
        ))}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,20,1) 0%, rgba(10,10,20,0.65) 50%, rgba(10,10,20,0.15) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 20% 60%, rgba(124,58,237,0.2) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 40%, rgba(6,182,212,0.12) 0%, transparent 60%)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 680 }}>
          <span className="badge badge-purple" style={{ marginBottom: '1rem', fontSize: '0.68rem' }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            SỰ KIỆN NỔI BẬT {featuredEvents.length > 1 ? `${heroIdx + 1}/${featuredEvents.length}` : ''}
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
              {featured.categories?.name && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                  {featured.categories.name}
                </span>
              )}
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

        {/* Carousel dots — bottom center */}
        {featuredEvents.length > 1 && (
          <div style={{ position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.4rem', zIndex: 2 }}>
            {featuredEvents.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIdx(i)}
                style={{
                  width: i === heroIdx ? 24 : 8, height: 8, borderRadius: 4,
                  background: i === heroIdx ? '#fff' : 'rgba(255,255,255,0.35)',
                  border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0,
                }}
              />
            ))}
          </div>
        )}

        {/* Prev/Next arrows — vertically centered on hero edges */}
        {featuredEvents.length > 1 && (
          <>
            <button
              onClick={() => setHeroIdx(i => (i - 1 + featuredEvents.length) % featuredEvents.length)}
              style={{ position: 'absolute', left: '1.25rem', top: '38%', transform: 'translateY(-50%)', zIndex: 2, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: 48, height: 48, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.5)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.4)'}
            >‹</button>
            <button
              onClick={() => setHeroIdx(i => (i + 1) % featuredEvents.length)}
              style={{ position: 'absolute', right: '1.25rem', top: '38%', transform: 'translateY(-50%)', zIndex: 2, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: 48, height: 48, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.5)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.4)'}
            >›</button>
          </>
        )}

        {/* Search overlay */}
        <div className="hero-search" style={{
          position: 'absolute', bottom: '2rem', right: '3rem', zIndex: 1,
          display: 'flex', gap: '0.625rem',
          background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
          padding: '0.75rem', width: 380,
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
          {/* Bá»™ lá»c â€” category dropdown */}
          <div ref={filterRef} style={{ position: 'relative' }}>
            <button
              className="btn btn-ghost"
              style={{ padding: '0.45rem 0.875rem', fontSize: '0.78rem', gap: '0.35rem', background: filterCategory ? 'rgba(124,58,237,0.25)' : undefined, borderColor: filterCategory ? 'rgba(124,58,237,0.5)' : undefined }}
              onClick={() => setShowFilterMenu(v => !v)}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
              {filterCategory ? (categories.find(c => c.id === filterCategory)?.name || 'Bộ lọc') : 'Bộ lọc'}
            </button>
            {showFilterMenu && (
              <div style={{ position: 'absolute', right: 0, bottom: '110%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, minWidth: 180, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 50 }}>
                <button
                  style={{ width: '100%', padding: '0.6rem 0.875rem', textAlign: 'left', background: !filterCategory ? 'rgba(124,58,237,0.15)' : 'transparent', border: 'none', color: '#fff', fontSize: '0.84rem', cursor: 'pointer' }}
                  onClick={() => { setFilterCategory(''); setShowFilterMenu(false); }}
                >Táº¥t cáº£ thá»ƒ loáº¡i</button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    style={{ width: '100%', padding: '0.6rem 0.875rem', textAlign: 'left', background: filterCategory === cat.id ? 'rgba(124,58,237,0.15)' : 'transparent', border: 'none', color: '#fff', fontSize: '0.84rem', cursor: 'pointer' }}
                    onClick={() => { setFilterCategory(cat.id); setShowFilterMenu(false); }}
                  >{cat.name}</button>
                ))}
                {categories.length === 0 && (
                  <div style={{ padding: '0.6rem 0.875rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>ChÆ°a cÃ³ thá»ƒ loáº¡i nÃ o</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* â”€â”€ Content â”€â”€ */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>

        {/* Categories */}
        {!q && categories.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.25rem' }}>Khám phá theo thể loại</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {categories.map((cat, i) => {
                const g = CATEGORY_GRADIENTS[i % CATEGORY_GRADIENTS.length];
                const isActive = filterCategory === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setFilterCategory(isActive ? '' : cat.id)}
                    style={{
                      height: 130, borderRadius: 12, background: g.bg,
                      display: 'flex', alignItems: 'flex-end', padding: '1rem',
                      cursor: 'pointer', border: `2px solid ${isActive ? 'rgba(255,255,255,0.5)' : 'var(--border)'}`,
                      position: 'relative', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s',
                      boxShadow: isActive ? '0 0 0 2px rgba(124,58,237,0.5)' : 'none',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = isActive ? '0 0 0 2px rgba(124,58,237,0.5)' : 'none'; }}
                  >
                    <div style={{ position: 'absolute', inset: 0, background: g.overlay }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem', textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}>
                        {cat.name}
                      </span>
                      {cat.description && (
                        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>{cat.description}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {filterCategory && (
              <div style={{ marginTop: '0.75rem' }}>
                <button className="btn btn-ghost" style={{ fontSize: '0.8rem' }} onClick={() => setFilterCategory('')}>
                  Thể loại: {categories.find(c => c.id === filterCategory)?.name}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Events */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>
              {q ? `Kết quả tìm kiếm cho "${q}"` : filterCategory ? `Thể Loại: ${categories.find(c => c.id === filterCategory)?.name}` : 'Sắp diễn ra'}
            </h2>
            {!q && !filterCategory && (
              <button className="btn btn-ghost" style={{ fontSize: '0.85rem', color: 'var(--purple-light)', padding: '0.3rem 0.75rem' }}>
                Xem tất cả 
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

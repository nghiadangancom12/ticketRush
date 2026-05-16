import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../config';

const ZONE_COLORS = ['#dc2626', '#6366f1', '#6b7280', '#f59e0b', '#10b981', '#3b82f6'];

export default function EventInfoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`${API_BASE}/events/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => setEvent(res.data.data))
      .catch(() => setEvent(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );

  if (!event || event.status === 'DELETED') return (
    <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
        <h2 style={{ marginBottom: '0.5rem' }}>Không tìm thấy sự kiện</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>Sự kiện không tồn tại hoặc đã bị xóa.</p>
        <button className="btn btn-outline" onClick={() => navigate('/')}>← Về trang chủ</button>
      </div>
    </div>
  );

  const startDate = new Date(event.start_time);
  const minPrice = event.zones?.length > 0 ? Math.min(...event.zones.map(z => Number(z.price))) : 0;
  const isClosed = event.status === 'CLOSED' || event.status === 'DRAFT';

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      {/* Banner */}
      <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: '1.75rem', position: 'relative', height: 320, background: 'linear-gradient(135deg, #1e1b4b, #312e81)' }}>
        {event.image_url && (
          <img
            src={event.image_url}
            alt={event.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,20,0.85) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', bottom: '1.25rem', left: '1.5rem', right: '1.5rem' }}>
          {event.categories?.name && (
            <span className="badge badge-purple" style={{ marginBottom: '0.5rem', display: 'inline-block', fontSize: '0.7rem' }}>
              {event.categories.name}
            </span>
          )}
          <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 900, lineHeight: 1.2, textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>
            {event.title}
          </h1>
        </div>
        {isClosed && (
          <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(239,68,68,0.5)', borderRadius: 8, padding: '0.3rem 0.75rem', fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>
            Đã kết thúc
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'start' }}>
        {/* Left column */}
        <div>
          {/* Meta info */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--purple-light)', width: 20, textAlign: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              </span>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: '0.15rem' }}>NGÀY GIỜ</div>
                <div style={{ fontWeight: 600 }}>
                  {startDate.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                  {' — '}
                  {startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
            <div style={{ height: 1, background: 'var(--border)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--cyan)', width: 20, textAlign: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              </span>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: '0.15rem' }}>ĐỊA ĐIỂM</div>
                <div style={{ fontWeight: 600 }}>{event.location}</div>
              </div>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>MÔ TẢ SỰ KIỆN</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {event.description}
              </p>
            </div>
          )}

          {/* Zones / Pricing */}
          {event.zones?.length > 0 && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>BẢNG GIÁ VÉ</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {event.zones.map((zone, i) => (
                  <div key={zone.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0.875rem', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: ZONE_COLORS[i % ZONE_COLORS.length], flexShrink: 0 }} />
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{zone.name}</span>
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--cyan)' }}>
                      {Number(zone.price) > 0 ? `${Number(zone.price).toLocaleString('vi-VN')}đ` : 'Miễn phí'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column — CTA */}
        <div style={{ minWidth: 220 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', position: 'sticky', top: '5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>GIÁ TỪ</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--cyan)', marginBottom: '1.25rem' }}>
              {minPrice > 0 ? `${minPrice.toLocaleString('vi-VN')}đ` : 'Miễn phí'}
            </div>

            {isClosed ? (
              <button className="btn btn-outline" disabled style={{ width: '100%', justifyContent: 'center', opacity: 0.5 }}>
                Sự kiện đã kết thúc
              </button>
            ) : (
              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '0.95rem' }}
                onClick={() => navigate(`/event/${id}/queue`)}
              >
                Mua vé ngay →
              </button>
            )}

            <p style={{ marginTop: '0.875rem', fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Hệ thống hàng chờ công bằng — vào theo thứ tự
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

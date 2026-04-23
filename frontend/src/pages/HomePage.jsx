import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:3000/api';

const STATUS_COLORS = { PUBLISHED: 'var(--success)', DRAFT: 'var(--warning)', CLOSED: 'var(--danger)' };
const STATUS_LABELS = { PUBLISHED: '🟢 Đang mở', DRAFT: '🟡 Bản nháp', CLOSED: '🔴 Đã đóng' };

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/events`)
      .then(res => { setEvents(res.data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="text-center mt-8">
      <div style={{ display: 'inline-block', width: 40, height: 40, border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p className="text-secondary mt-4">Đang tải sự kiện...</p>
    </div>
  );

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>Lịch Trình Sự Kiện</h1>
        <p className="text-secondary">Khám phá các sự kiện và đặt vé ngay hôm nay!</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {events.length === 0 ? (
          <div className="glass-panel text-center" style={{ gridColumn: '1/-1', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎭</div>
            <p className="text-secondary">Chưa có sự kiện nào.</p>
          </div>
        ) : (
          events.map(ev => (
            <div key={ev.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="flex justify-between items-center">
                <span style={{ fontSize: '0.75rem', color: STATUS_COLORS[ev.status], fontWeight: 600 }}>
                  {STATUS_LABELS[ev.status]}
                </span>
                <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
                  {new Date(ev.start_time).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <h3 style={{ fontSize: '1.15rem', lineHeight: 1.4 }}>{ev.title}</h3>
              {ev.description && (
                <p className="text-secondary" style={{ fontSize: '0.85rem', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {ev.description}
                </p>
              )}
              <div className="text-secondary" style={{ fontSize: '0.85rem' }}>
                📍 {ev.location}
              </div>
              <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                {/* All events go through /queue first */}
                <Link
                  to={`/event/${ev.id}/queue`}
                  className="btn btn-primary"
                  style={{ width: '100%', textAlign: 'center' }}
                >
                  🎟️ Tham Gia & Mua Vé
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

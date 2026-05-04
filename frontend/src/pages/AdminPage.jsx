import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:3000/api';
const token = () => localStorage.getItem('token');
const authHeader = () => ({ Authorization: `Bearer ${token()}` });

const ZONE_COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

/* ── Tiny SVG donut chart ── */
function DonutChart({ data, size = 160 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div style={{ width: size, height: size, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />;
  const r = 55; const cx = size / 2; const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let cumPct = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {data.map((seg, i) => {
        const pct = seg.value / total;
        const dash = pct * circumference;
        const gap = circumference - dash;
        const rotation = cumPct * 360 - 90;
        cumPct += pct;
        return (
          <circle key={i} r={r} cx={cx} cy={cy} fill="transparent"
            stroke={seg.color} strokeWidth={22}
            strokeDasharray={`${dash} ${gap}`}
            transform={`rotate(${rotation} ${cx} ${cy})`}
          />
        );
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fontSize="14" fontWeight="800" fontFamily="Inter, sans-serif">
        {data[0]?.label || ''}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="Inter, sans-serif">LỚN NHẤT</text>
    </svg>
  );
}

/* ── Bar chart ── */
function BarChart({ items, max }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {items.map(item => (
        <div key={item.label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '0.3rem' }}>
            <span>{item.label}</span>
            <span style={{ color: 'var(--text-secondary)' }}>{item.value.toLocaleString('vi-VN')} vé</span>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3 }}>
            <div style={{ height: '100%', width: `${Math.min(100, (item.value / max) * 100)}%`, background: item.color, borderRadius: 3, transition: 'width 0.6s ease' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Nav icon helpers ── */
const icons = {
  overview: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
  events: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  analytics: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
  tickets: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" /></svg>,
  settings: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
};

export default function AdminPage() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('overview');
  const [data, setData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Events view state
  const [selectedEventId, setSelectedEventId] = useState('');
  const [queueToggles, setQueueToggles] = useState({});
  const [queueLoading, setQueueLoading] = useState('');

  // Create event form
  const [showCreate, setShowCreate] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', location: '', start_time: '' });
  const [zones, setZones] = useState([{ id: 1, name: 'VIP', price: '2500000' }, { id: 2, name: 'GA A', price: '1500000' }, { id: 3, name: 'GA B', price: '900000' }]);
  const [activeZoneId, setActiveZoneId] = useState(1);
  const maxRows = 15; const maxCols = 30;
  const [grid, setGrid] = useState(Array.from({ length: maxRows }, () => Array(maxCols).fill(null)));
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!token()) { navigate('/auth'); return; }
    const fetchAll = async () => {
      try {
        const [dashRes, eventsRes] = await Promise.all([
          axios.get(`${API}/admin/dashboard`, { headers: authHeader() }),
          axios.get(`${API}/events`),
        ]);
        setData(dashRes.data.data);
        const evList = eventsRes.data.data || [];
        setEvents(evList);
        if (evList.length > 0) setSelectedEventId(evList[0].id);
      } catch (err) {
        if (err.response?.status === 403) setErrorMsg('Bạn không có quyền truy cập trang này.');
        else setErrorMsg('Lỗi tải dữ liệu. Vui lòng đăng nhập lại.');
      } finally { setLoading(false); }
    };
    fetchAll();
  }, [navigate]);

  const fetchAnalytics = async () => {
    if (analytics) return;
    try {
      const res = await axios.get(`${API}/admin/customer-analytics`, { headers: authHeader() });
      setAnalytics(res.data.data);
    } catch { setAnalytics({ genderDemographics: [], topSpenders: [] }); }
  };

  useEffect(() => { if (activeView === 'analytics') fetchAnalytics(); }, [activeView]);

  const handleQueueToggle = async (eventId, turnOn) => {
    setQueueLoading(eventId);
    try {
      await axios.post(`${API}/queue/admin/${eventId}/toggle`, { isActive: turnOn }, { headers: authHeader() });
      setQueueToggles(prev => ({ ...prev, [eventId]: turnOn }));
    } catch (err) { alert(err.response?.data?.message || 'Không thể thay đổi trạng thái hàng chờ.'); }
    finally { setQueueLoading(''); }
  };

  const toggleSeatOnGrid = (r, c) => {
    const g = grid.map(row => [...row]);
    g[r][c] = g[r][c] ? null : activeZoneId;
    setGrid(g);
  };

  const updateZoneInfo = (idx, field, val) => {
    const z = [...zones]; z[idx][field] = val; setZones(z);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault(); setCreating(true); setCreateMsg({ type: '', text: '' });
    try {
      const isoStartTime = new Date(newEvent.start_time).toISOString();
      const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const fz = zones.map(z => ({ ...z, seats: [] }));
      for (let r = 0; r < maxRows; r++) for (let c = 0; c < maxCols; c++) {
        const zId = grid[r][c];
        if (zId) { const zt = fz.find(z => z.id === zId); if (zt) zt.seats.push({ row_label: rowLabels[r] || `R${r}`, seat_number: c + 1 }); }
      }
      const validZones = fz.filter(z => z.seats.length > 0);
      if (validZones.length === 0) { setCreateMsg({ type: 'error', text: 'Bạn chưa vẽ ghế nào trên lưới!' }); return; }
      const res = await axios.post(`${API}/events`, { title: newEvent.title, description: newEvent.description, location: newEvent.location, start_time: isoStartTime, zones: validZones }, { headers: authHeader() });
      setCreateMsg({ type: 'success', text: res.data.message || 'Tạo sự kiện thành công!' });
      setNewEvent({ title: '', description: '', location: '', start_time: '' });
      setGrid(Array.from({ length: maxRows }, () => Array(maxCols).fill(null)));
      setShowCreate(false);
      const evRes = await axios.get(`${API}/events`);
      setEvents(evRes.data.data || []);
    } catch (err) { setCreateMsg({ type: 'error', text: err.response?.data?.message || 'Có lỗi khi tạo sự kiện.' }); }
    finally { setCreating(false); }
  };

  const userName = localStorage.getItem('userName') || 'Admin';
  const userInitials = userName.split(' ').map(w => w[0]).filter(Boolean).slice(-2).join('').toUpperCase();

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="spinner" />
    </div>
  );
  if (errorMsg) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '2rem' }}>
      <div style={{ textAlign: 'center', background: 'var(--bg-card)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 16, padding: '3rem 2rem', maxWidth: 400 }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔒</div>
        <p style={{ color: 'var(--danger)', marginBottom: '1.5rem' }}>{errorMsg}</p>
        <button className="btn btn-primary" onClick={() => navigate('/auth')}>Đăng nhập lại</button>
      </div>
    </div>
  );

  /* ─── OVERVIEW VIEW ─── */
  const OverviewView = () => (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Tổng quan</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Thống kê hoạt động của hệ thống</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Doanh thu', value: `${Number(data?.revenue || 0).toLocaleString('vi-VN')}đ`, color: 'var(--success)', icon: '💰' },
          { label: 'Khán giả', value: (data?.usersTotal || 0).toLocaleString(), color: 'var(--cyan)', icon: '👥' },
          { label: 'Tỷ lệ bán', value: `${data?.seats?.total ? ((data.seats.sold / data.seats.total) * 100).toFixed(1) : 0}%`, color: 'var(--purple-light)', icon: '🎫' },
          { label: 'Vé đã bán', value: `${(data?.seats?.sold || 0).toLocaleString()} / ${(data?.seats?.total || 0).toLocaleString()}`, color: 'var(--warning)', icon: '🎟' },
        ].map(stat => (
          <div key={stat.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.625rem' }}>{stat.icon}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: 500 }}>{stat.label.toUpperCase()}</div>
            <div style={{ fontSize: '1.375rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Trạng thái ghế ngồi</h3>
          {[
            { label: 'Còn trống', count: data?.seats?.available || 0, color: 'var(--success)' },
            { label: 'Đang giữ', count: data?.seats?.locked || 0, color: 'var(--warning)' },
            { label: 'Đã bán', count: data?.seats?.sold || 0, color: 'var(--purple-light)' },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: row.color }} />
                {row.label}
              </div>
              <span style={{ fontWeight: 700, color: row.color }}>{row.count.toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Sự kiện ({events.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {events.slice(0, 4).map(ev => (
              <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{ev.title}</span>
                <span className={`badge ${ev.status === 'PUBLISHED' ? 'badge-green' : ev.status === 'DRAFT' ? 'badge-yellow' : 'badge-gray'}`} style={{ flexShrink: 0, marginLeft: '0.5rem' }}>
                  {ev.status === 'PUBLISHED' ? 'Đang bán' : ev.status === 'DRAFT' ? 'Bản nháp' : 'Đã đóng'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  /* ─── EVENTS VIEW ─── */
  const EventsView = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.25rem', height: 'calc(100vh - 130px)' }}>
      {/* Left: event list */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Sự kiện của tôi</h3>
          <button className="btn btn-primary" style={{ fontSize: '0.72rem', padding: '0.3rem 0.625rem' }} onClick={() => setShowCreate(true)}>+ Thêm</button>
        </div>
        <div style={{ padding: '0.5rem', flex: 1, overflowY: 'auto' }}>
          {events.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem', padding: '2rem' }}>Chưa có sự kiện nào.</p>
          ) : events.map(ev => (
            <div
              key={ev.id}
              onClick={() => setSelectedEventId(ev.id)}
              style={{
                padding: '0.875rem', borderRadius: 8, cursor: 'pointer', marginBottom: '0.3rem',
                background: selectedEventId === ev.id ? 'rgba(124,58,237,0.12)' : 'transparent',
                border: `1px solid ${selectedEventId === ev.id ? 'rgba(124,58,237,0.3)' : 'transparent'}`,
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span className={`badge ${ev.status === 'PUBLISHED' ? 'badge-green' : ev.status === 'DRAFT' ? 'badge-yellow' : 'badge-gray'}`} style={{ fontSize: '0.6rem' }}>
                  {ev.status === 'PUBLISHED' ? 'Đang bán' : ev.status === 'DRAFT' ? 'Bản nháp' : 'Đã đóng'}
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  {new Date(ev.start_time).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' })}
                </span>
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{ev.title}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>📍 {ev.location}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: queue management */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'auto' }}>
        {selectedEventId ? (() => {
          const ev = events.find(e => e.id === selectedEventId);
          if (!ev) return null;
          const isActive = queueToggles[selectedEventId] ?? false;
          const isLoading = queueLoading === selectedEventId;
          return (
            <div style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{ev.title}</h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>📍 {ev.location} · {new Date(ev.start_time).toLocaleDateString('vi-VN')}</p>
              </div>

              {/* Queue toggle */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 10, padding: '1.125rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>Hàng Chờ Ảo (Virtual Queue)</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {isActive ? '🟡 Đang bật — khách phải xếp hàng trước khi mua' : '⚪ Đang tắt — khách mua tự do'}
                    </div>
                  </div>
                  <button
                    className={`btn ${isActive ? 'btn-outline' : 'btn-primary'}`}
                    style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}
                    disabled={isLoading}
                    onClick={() => handleQueueToggle(selectedEventId, !isActive)}
                  >
                    {isLoading ? '...' : isActive ? 'Tắt Queue' : 'Bật Queue'}
                  </button>
                </div>
              </div>

              {/* Zones info */}
              {ev.zones?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>Phân khu giá vé</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {ev.zones.map((z, i) => (
                      <div key={z.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0.875rem', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: ZONE_COLORS[i % ZONE_COLORS.length] }} />
                          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{z.name}</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{z.total_seats} ghế</span>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{Number(z.price).toLocaleString('vi-VN')}đ</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })() : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Chọn một sự kiện để quản lý
          </div>
        )}
      </div>
    </div>
  );

  /* ─── ANALYTICS VIEW ─── */
  const AnalyticsView = () => {
    const genderMap = { MALE: 'Nam', FEMALE: 'Nữ', OTHER: 'Khác' };
    const genderColors = { MALE: '#6366f1', FEMALE: '#ec4899', OTHER: '#94a3b8' };
    const genderData = (analytics?.genderDemographics || []).map(g => ({
      label: genderMap[g.gender] || g.gender,
      value: g._count._all,
      color: genderColors[g.gender] || '#6b7280',
    }));
    const totalGender = genderData.reduce((s, g) => s + g.value, 0);
    const maleCount = analytics?.genderDemographics?.find(g => g.gender === 'MALE')?._count._all || 0;
    const femaleCount = analytics?.genderDemographics?.find(g => g.gender === 'FEMALE')?._count._all || 0;
    const malePct = totalGender > 0 ? Math.round((maleCount / totalGender) * 100) : 0;
    const femalePct = totalGender > 0 ? Math.round((femaleCount / totalGender) * 100) : 0;

    const spenders = analytics?.topSpenders || [];
    const maxSpend = spenders.length > 0 ? Math.max(...spenders.map(s => Number(s.total_spent))) : 1;

    return (
      <div>
        <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Phân tích nhân khẩu học</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Thông tin chi tiết về đối tượng khán giả</p>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>TỔNG KHÁN GIẢ</div>
                <div style={{ fontSize: '2rem', fontWeight: 800 }}>{(data?.usersTotal || 0).toLocaleString()}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--success)', marginTop: '0.25rem' }}>↑ Dữ liệu thực</div>
              </div>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </div>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>DOANH THU</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{Number(data?.revenue || 0).toLocaleString('vi-VN')}đ</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--success)', marginTop: '0.25rem' }}>Từ {data?.seats?.sold || 0} vé đã bán</div>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>TỶ LỆ NAM / NỮ</div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{malePct}/{femalePct}</div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, marginTop: '0.625rem' }}>
              <div style={{ height: '100%', width: `${malePct}%`, background: 'linear-gradient(90deg, #6366f1, #ec4899)', borderRadius: 3 }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* Gender donut */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem' }}>Giới tính</h3>
            {genderData.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <DonutChart data={genderData} />
                <div style={{ flex: 1 }}>
                  {genderData.map(g => (
                    <div key={g.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem', fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: g.color }} />
                        {g.label}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700 }}>{g.value.toLocaleString()}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{totalGender > 0 ? Math.round((g.value / totalGender) * 100) : 0}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Chưa có dữ liệu</p>
            )}
          </div>

          {/* Top spenders */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem' }}>Top Khách Hàng VIP</h3>
            {spenders.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {spenders.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${ZONE_COLORS[i]}, ${ZONE_COLORS[(i + 1) % ZONE_COLORS.length]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>
                      {(s.full_name || s.email || '?').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>{s.full_name || s.email}</div>
                      <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginTop: '0.25rem' }}>
                        <div style={{ height: '100%', width: `${(Number(s.total_spent) / maxSpend) * 100}%`, background: ZONE_COLORS[i % ZONE_COLORS.length], borderRadius: 2 }} />
                      </div>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.84rem', flexShrink: 0 }}>{Number(s.total_spent).toLocaleString('vi-VN')}đ</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Chưa có dữ liệu</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ─── CREATE EVENT MODAL ─── */
  const CreateEventModal = () => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem', overflowY: 'auto' }}>
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 900, padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Tạo Sự Kiện Mới</h2>
          <button className="icon-btn" onClick={() => setShowCreate(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {createMsg.text && (
          <div className={`alert ${createMsg.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1rem' }}>{createMsg.text}</div>
        )}

        <form onSubmit={handleCreateEvent}>
          {/* Basic info */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}><label className="form-label">Tên sự kiện *</label><input type="text" className="form-input" required value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} /></div>
            <div className="form-group" style={{ margin: 0 }}><label className="form-label">Thời gian *</label><input type="datetime-local" className="form-input" required value={newEvent.start_time} onChange={e => setNewEvent({ ...newEvent, start_time: e.target.value })} /></div>
            <div className="form-group" style={{ margin: 0 }}><label className="form-label">Địa điểm *</label><input type="text" className="form-input" required value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} /></div>
            <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}><label className="form-label">Mô tả</label><input type="text" className="form-input" value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} /></div>
          </div>

          {/* Zone definition */}
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>1. Định nghĩa phân khu</h4>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {zones.map((z, idx) => (
              <div key={z.id} style={{ background: activeZoneId === z.id ? `${ZONE_COLORS[idx % ZONE_COLORS.length]}18` : 'rgba(255,255,255,0.04)', border: `2px solid ${activeZoneId === z.id ? ZONE_COLORS[idx % ZONE_COLORS.length] : 'transparent'}`, borderRadius: 10, padding: '0.875rem', flex: '1 1 160px', cursor: 'pointer' }} onClick={() => setActiveZoneId(z.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: ZONE_COLORS[idx % ZONE_COLORS.length] }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Zone {idx + 1}</span>
                  {activeZoneId === z.id && <span className="badge badge-purple" style={{ fontSize: '0.6rem', marginLeft: 'auto' }}>Đang chọn</span>}
                </div>
                <input type="text" className="form-input" value={z.name} onChange={e => updateZoneInfo(idx, 'name', e.target.value)} placeholder="Tên khu" style={{ fontSize: '0.8rem', marginBottom: '0.4rem' }} onClick={e => e.stopPropagation()} />
                <input type="number" className="form-input" value={z.price} onChange={e => updateZoneInfo(idx, 'price', e.target.value)} placeholder="Giá (VNĐ)" style={{ fontSize: '0.8rem' }} onClick={e => e.stopPropagation()} />
              </div>
            ))}
            <button type="button" className="btn btn-outline" style={{ alignSelf: 'center', fontSize: '0.8rem' }} onClick={() => setZones([...zones, { id: Date.now(), name: 'Zone Mới', price: '0' }])}>+ Thêm khu</button>
          </div>

          {/* Grid designer */}
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem' }}>2. Vẽ sơ đồ khán đài</h4>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Click để tạo ghế. Click lại để xóa (lối đi / sân khấu).</p>
          <div style={{ overflowX: 'auto', padding: '1rem', background: 'rgba(0,0,0,0.4)', borderRadius: 8, marginBottom: '1rem' }}>
            {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').slice(0, maxRows).map((rowChar, rIndex) => (
              <div key={rIndex} style={{ display: 'flex', gap: 3, marginBottom: 3, alignItems: 'center' }}>
                <span style={{ width: 14, fontSize: '9px', color: 'var(--text-muted)', textAlign: 'right', marginRight: 3 }}>{rowChar}</span>
                {grid[rIndex].map((cellVal, cIndex) => {
                  const zIdx = zones.findIndex(z => z.id === cellVal);
                  const bg = cellVal ? (ZONE_COLORS[zIdx % ZONE_COLORS.length] || '#6366f1') : '#1e1e30';
                  return <div key={cIndex} onMouseDown={() => toggleSeatOnGrid(rIndex, cIndex)} style={{ width: 20, height: 20, cursor: 'pointer', background: bg, borderRadius: 3, flexShrink: 0, transition: 'background 0.08s', border: '1px solid rgba(255,255,255,0.04)' }} title={cellVal ? zones.find(z => z.id === cellVal)?.name : 'Trống'} />;
                })}
              </div>
            ))}
          </div>

          {/* Zone legend */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {zones.map((z, idx) => (
              <div key={z.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: ZONE_COLORS[idx % ZONE_COLORS.length] }} />
                {z.name} — {Number(z.price).toLocaleString('vi-VN')}đ
              </div>
            ))}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: '0.95rem' }} disabled={creating}>
            {creating ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />Đang lưu...</> : 'Tạo Sự Kiện'}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* ── Sidebar ── */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.1rem' }}>TicketRush Pro</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Admin Panel</div>
        </div>

        {[
          { key: 'overview', label: 'Tổng quan', icon: icons.overview },
          { key: 'events', label: 'Sự kiện', icon: icons.events },
          { key: 'analytics', label: 'Phân tích', icon: icons.analytics },
          { key: 'tickets', label: 'Vé đã bán', icon: icons.tickets },
          { key: 'settings', label: 'Cài đặt', icon: icons.settings },
        ].map(item => (
          <button
            key={item.key}
            className={`admin-nav-item ${activeView === item.key ? 'active' : ''}`}
            onClick={() => setActiveView(item.key)}
          >
            {item.icon}
            <span className="admin-nav-label">{item.label}</span>
          </button>
        ))}

        {/* Sidebar footer */}
        <div className="admin-sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>
              {userInitials}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Quản trị viên</div>
            </div>
          </div>
          <button className="btn btn-ghost" style={{ width: '100%', fontSize: '0.78rem', marginTop: '0.625rem', justifyContent: 'center' }} onClick={() => navigate('/')}>
            ← Về trang chủ
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="admin-content">
        {activeView === 'overview' && <OverviewView />}
        {activeView === 'events' && <EventsView />}
        {activeView === 'analytics' && <AnalyticsView />}
        {(activeView === 'tickets' || activeView === 'settings') && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem' }}>{activeView === 'tickets' ? '🎟' : '⚙️'}</div>
            <p style={{ fontSize: '0.875rem' }}>Tính năng đang được phát triển</p>
          </div>
        )}
      </div>

      {showCreate && <CreateEventModal />}
    </div>
  );
}

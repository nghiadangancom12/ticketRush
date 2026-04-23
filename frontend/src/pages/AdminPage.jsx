import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:3000/api';
const token = () => localStorage.getItem('token');
const authHeader = () => ({ Authorization: `Bearer ${token()}` });

// Zone colors for the designer grid
const ZONE_COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

export default function AdminPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // ─── Event Creation ────────────────────────────────────────────────────────
  const [newEvent, setNewEvent] = useState({ title: '', description: '', location: '', start_time: '' });
  const [zones, setZones] = useState([{ id: 1, name: 'VIP', price: '100' }, { id: 2, name: 'Regular', price: '50' }]);
  const [activeZoneId, setActiveZoneId] = useState(1);
  const maxRows = 15;
  const maxCols = 30;
  const [grid, setGrid] = useState(Array.from({ length: maxRows }, () => Array(maxCols).fill(null)));
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState({ type: '', text: '' });

  // ─── Queue Management ──────────────────────────────────────────────────────
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [queueToggles, setQueueToggles] = useState({}); // { eventId: true/false }
  const [queueLoading, setQueueLoading] = useState('');

  // ─── Fetch dashboard + events ──────────────────────────────────────────────
  useEffect(() => {
    if (!token()) { navigate('/auth'); return; }

    const fetchAll = async () => {
      try {
        const [dashRes, eventsRes] = await Promise.all([
          axios.get(`${API}/admin/dashboard`, { headers: authHeader() }),
          axios.get(`${API}/events`)
        ]);
        setData(dashRes.data.data);
        setEvents(eventsRes.data.data || []);
        if (eventsRes.data.data?.length > 0) setSelectedEventId(eventsRes.data.data[0].id);
      } catch (err) {
        if (err.response?.status === 403) setErrorMsg('Bạn không có quyền truy cập Admin Dashboard.');
        else setErrorMsg('Lỗi tải dữ liệu. Vui lòng đăng nhập lại.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [navigate]);

  // ─── Grid Designer ─────────────────────────────────────────────────────────
  const toggleSeatOnGrid = (rIndex, cIndex) => {
    const newGrid = grid.map(row => [...row]);
    newGrid[rIndex][cIndex] = newGrid[rIndex][cIndex] ? null : activeZoneId;
    setGrid(newGrid);
  };

  // ─── Create Event ──────────────────────────────────────────────────────────
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateMsg({ type: '', text: '' });
    try {
      // FIX: Convert datetime-local string to full ISO-8601
      const isoStartTime = new Date(newEvent.start_time).toISOString();

      const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const formattedZones = zones.map(z => ({ ...z, seats: [] }));

      for (let r = 0; r < maxRows; r++) {
        for (let c = 0; c < maxCols; c++) {
          const zId = grid[r][c];
          if (zId) {
            const zt = formattedZones.find(z => z.id === zId);
            if (zt) zt.seats.push({ row_label: rowLabels[r] || `R${r}`, seat_number: c + 1 });
          }
        }
      }

      const validZones = formattedZones.filter(z => z.seats.length > 0);
      if (validZones.length === 0) {
        setCreateMsg({ type: 'error', text: 'Bạn chưa vẽ ghế nào trên lưới!' });
        return;
      }

      const res = await axios.post(`${API}/events`, {
        title: newEvent.title,
        description: newEvent.description,
        location: newEvent.location,
        start_time: isoStartTime,
        zones: validZones
      }, { headers: authHeader() });

      setCreateMsg({ type: 'success', text: `✅ ${res.data.message || 'Tạo sự kiện thành công!'}` });
      setNewEvent({ title: '', description: '', location: '', start_time: '' });
      setGrid(Array.from({ length: maxRows }, () => Array(maxCols).fill(null)));
      // Refresh events list for queue toggle
      const evRes = await axios.get(`${API}/events`);
      setEvents(evRes.data.data || []);
    } catch (err) {
      setCreateMsg({ type: 'error', text: err.response?.data?.message || 'Có lỗi khi tạo sự kiện.' });
    } finally {
      setCreating(false);
    }
  };

  // ─── Queue Toggle ──────────────────────────────────────────────────────────
  const handleQueueToggle = async (eventId, turnOn) => {
    setQueueLoading(eventId);
    try {
      await axios.post(`${API}/queue/admin/${eventId}/toggle`,
        { isActive: turnOn },
        { headers: authHeader() }
      );
      setQueueToggles(prev => ({ ...prev, [eventId]: turnOn }));
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể thay đổi trạng thái hàng chờ.');
    } finally {
      setQueueLoading('');
    }
  };

  const updateZoneInfo = (index, field, value) => {
    const newZones = [...zones];
    newZones[index][field] = value;
    setZones(newZones);
  };

  if (loading) return <div className="text-center mt-8">Đang tải dữ liệu...</div>;
  if (errorMsg) return <div className="text-center mt-8" style={{ color: 'var(--danger)' }}>{errorMsg}</div>;

  return (
    <div>
      <h1 className="text-gradient mb-8 text-center" style={{ fontSize: '2.5rem' }}>📊 Admin Dashboard</h1>

      {/* Stats */}
      <div className="flex gap-4 mb-8" style={{ flexWrap: 'wrap' }}>
        <div className="glass-panel flex-1 text-center">
          <h3 className="text-secondary" style={{ fontSize: '0.85rem' }}>DOANH THU</h3>
          <h2 style={{ fontSize: '2rem', color: 'var(--success)' }}>{Number(data?.revenue || 0).toLocaleString('vi-VN')}đ</h2>
        </div>
        <div className="glass-panel flex-1 text-center">
          <h3 className="text-secondary" style={{ fontSize: '0.85rem' }}>KHÁCH HÀNG</h3>
          <h2 style={{ fontSize: '2rem' }}>{data?.usersTotal || 0}</h2>
        </div>
        <div className="glass-panel flex-1 text-center">
          <h3 className="text-secondary" style={{ fontSize: '0.85rem' }}>TỶ LỆ BÁN</h3>
          <h2 style={{ fontSize: '2rem', color: 'var(--primary)' }}>
            {data?.seats?.total ? ((data.seats.sold / data.seats.total) * 100).toFixed(1) : 0}%
          </h2>
        </div>
        <div className="glass-panel flex-1 text-center">
          <h3 className="text-secondary" style={{ fontSize: '0.85rem' }}>TỔNG VÉ</h3>
          <h2 style={{ fontSize: '2rem' }}>{data?.seats?.sold || 0} / {data?.seats?.total || 0}</h2>
        </div>
      </div>

      {/* ── Queue Management Panel ── */}
      <div className="glass-panel mb-8">
        <h2 className="mb-4">🚦 Quản Lý Hàng Chờ Ảo (Virtual Queue)</h2>
        <p className="text-secondary mb-4" style={{ fontSize: '0.9rem' }}>
          Bật hàng chờ để buộc khách hàng xếp hàng theo thứ tự trước khi mua vé. Tắt để cho mua tự do.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {events.map(ev => {
            const isActive = queueToggles[ev.id] ?? false;
            const isLoading = queueLoading === ev.id;
            return (
              <div key={ev.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.04)', padding: '0.875rem 1rem',
                borderRadius: '8px', border: '1px solid var(--border-color)'
              }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{ev.title}</div>
                  <div className="text-secondary" style={{ fontSize: '0.8rem' }}>
                    📍 {ev.location} &nbsp;·&nbsp; 📅 {new Date(ev.start_time).toLocaleDateString('vi-VN')}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '0.8rem', color: isActive ? 'var(--warning)' : 'var(--text-secondary)' }}>
                    {isActive ? '🟡 Queue BẬT' : '⚪ Queue TẮT'}
                  </span>
                  <button
                    className={`btn ${isActive ? 'btn-outline' : 'btn-primary'}`}
                    style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                    disabled={isLoading}
                    onClick={() => handleQueueToggle(ev.id, !isActive)}
                  >
                    {isLoading ? '...' : isActive ? 'TẮT Queue' : 'BẬT Queue'}
                  </button>
                </div>
              </div>
            );
          })}
          {events.length === 0 && <p className="text-secondary">Chưa có sự kiện nào.</p>}
        </div>
      </div>

      {/* ── Create Event Panel ── */}
      <div className="glass-panel">
        <h2 className="mb-4">🎪 Tạo Sự Kiện Mới (Visual Seat Designer)</h2>

        {createMsg.text && (
          <div style={{
            color: createMsg.type === 'success' ? 'var(--success)' : 'var(--danger)',
            background: createMsg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${createMsg.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem'
          }}>
            {createMsg.text}
          </div>
        )}

        <form onSubmit={handleCreateEvent}>
          <div className="flex gap-4 mb-4" style={{ flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label className="form-label">Tên Sự Kiện</label>
              <input type="text" className="form-input" required value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="Tên sự kiện..." />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label className="form-label">Thời Gian Bắt Đầu</label>
              <input type="datetime-local" className="form-input" required value={newEvent.start_time} onChange={e => setNewEvent({ ...newEvent, start_time: e.target.value })} />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label className="form-label">Địa Điểm</label>
              <input type="text" className="form-input" required value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} placeholder="Sân vận động..." />
            </div>
          </div>
          <div className="mb-4">
            <label className="form-label">Mô Tả (không bắt buộc)</label>
            <input type="text" className="form-input" value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} placeholder="Mô tả ngắn về sự kiện..." />
          </div>

          {/* Zone definitions */}
          <h3 style={{ marginBottom: '0.75rem' }}>1. Định Nghĩa Phân Khu (Zones)</h3>
          <div className="flex gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
            {zones.map((z, idx) => (
              <div key={z.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', flex: '1 1 180px', border: activeZoneId === z.id ? `2px solid ${ZONE_COLORS[idx % ZONE_COLORS.length]}` : '2px solid transparent' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: ZONE_COLORS[idx % ZONE_COLORS.length] }} />
                  <input type="radio" checked={activeZoneId === z.id} onChange={() => setActiveZoneId(z.id)} />
                  <b style={{ fontSize: '0.85rem' }}>Chọn bút vẽ Zone này</b>
                </div>
                <input type="text" className="form-input mb-2" value={z.name} onChange={e => updateZoneInfo(idx, 'name', e.target.value)} placeholder="Tên khu" style={{ fontSize: '0.85rem' }} />
                <input type="number" className="form-input" value={z.price} onChange={e => updateZoneInfo(idx, 'price', e.target.value)} placeholder="Giá (VNĐ)" style={{ fontSize: '0.85rem' }} />
              </div>
            ))}
            <button type="button" className="btn btn-outline" style={{ alignSelf: 'center' }}
              onClick={() => setZones([...zones, { id: Date.now(), name: 'Zone Mới', price: '0' }])}>
              + Thêm Zone
            </button>
          </div>

          {/* Grid designer */}
          <h3 style={{ marginBottom: '0.5rem' }}>2. Vẽ Sơ Đồ Khán Đài</h3>
          <p className="text-secondary mb-2" style={{ fontSize: '0.85rem' }}>Click để tạo ghế. Click lại để xóa (tạo khoảng trống lối đi / sân khấu).</p>
          <div style={{ overflowX: 'auto', padding: '1rem', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', marginBottom: '1rem' }}>
            {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').slice(0, maxRows).map((rowChar, rIndex) => (
              <div key={rIndex} style={{ display: 'flex', gap: '3px', marginBottom: '3px', alignItems: 'center' }}>
                <span style={{ width: 16, fontSize: '10px', color: 'var(--text-secondary)', marginRight: 4, textAlign: 'right' }}>{rowChar}</span>
                {grid[rIndex].map((cellVal, cIndex) => {
                  const zoneIdx = zones.findIndex(z => z.id === cellVal);
                  const bg = cellVal ? (ZONE_COLORS[zoneIdx % ZONE_COLORS.length] || '#6366f1') : '#2a2d3e';
                  return (
                    <div key={cIndex} onMouseDown={() => toggleSeatOnGrid(rIndex, cIndex)}
                      style={{ width: 22, height: 22, cursor: 'pointer', background: bg, borderRadius: '3px', flexShrink: 0, transition: 'background 0.1s' }}
                      title={cellVal ? `${zones.find(z => z.id === cellVal)?.name} · Col ${cIndex + 1}` : 'Khoảng trống'} />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Zone legend */}
          <div className="flex gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
            {zones.map((z, idx) => (
              <div key={z.id} className="flex items-center gap-2" style={{ fontSize: '0.8rem' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: ZONE_COLORS[idx % ZONE_COLORS.length] }} />
                <span>{z.name} — {Number(z.price).toLocaleString('vi-VN')}đ</span>
              </div>
            ))}
          </div>

          <button type="submit" className="btn btn-primary" disabled={creating}
            style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}>
            {creating ? '⏳ Đang lưu vào DB...' : '🚀 Tạo Sự Kiện Mới'}
          </button>
        </form>
      </div>
    </div>
  );
}

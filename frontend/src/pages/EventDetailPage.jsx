import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

const API = 'http://localhost:3000/api';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notAllowed, setNotAllowed] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [holdLoading, setHoldLoading] = useState(false);

  const token = localStorage.getItem('token');

  // Flag đánh dấu user đang đi checkout — KHÔNG trả ghế khi unmount trong trường hợp này
  const isNavigatingToCheckout = useRef(false);

  const fetchEvent = async () => {
    try {
      const res = await axios.get(`${API}/events/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setEventData(res.data.data);
    } catch (err) {
      if (err.response?.status === 403) {
        // Queue is active and user is not allowed yet → redirect back to queue
        setNotAllowed(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) { navigate('/auth'); return; }
    fetchEvent();

    const socket = io('http://localhost:3000', { withCredentials: true });
    socket.on('connect', () => socket.emit('joinEventRoom', id));
    socket.on('seatStatusChanged', fetchEvent);

    // ─── Heartbeat: ping mỗi 15s để giữ session active ─────────────────
    // Nếu user tắt tab / bấm logo / mất mạng → không ping → Redis tự xóa sau 20s
    // Backend trả 410 Gone → frontend chuyển về trang hàng chờ
    const heartbeatInterval = setInterval(async () => {
      try {
        await axios.post(
          `http://localhost:3000/api/queue/${id}/heartbeat`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        if (err.response?.status === 410) {
          // Session hết hạn — người dùng bị đuổi ra khỏi phòng
          clearInterval(heartbeatInterval);
          navigate(`/event/${id}/queue`);
        }
        // Các lỗi khác (mất mạng tạm thời) → bỏ qua, tiếp tục thử
      }
    }, 15000);

    // Cleanup: khi user rời trang mà chưa thanh toán, trả ghế + giải phóng queue slot
    // Ngoại lệ: nếu đang đi vào trang Checkout thì KHÔNG trả ghế
    return () => {
      socket.disconnect();
      clearInterval(heartbeatInterval);
      if (!isNavigatingToCheckout.current) {
        const pendingEventId = localStorage.getItem('checkoutEventId');
        if (pendingEventId === id && token) {
          fetch(`http://localhost:3000/api/Booking/return`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ eventId: id }),
            keepalive: true
          }).catch(() => {});
        }
      }
    };
  }, [id]);


  // ─── Redirect if not allowed ───────────────────────────────────────────────
  if (notAllowed) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="glass-panel text-center" style={{ maxWidth: 420, padding: '3rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</div>
          <h2 className="mb-2">Chưa đến lượt</h2>
          <p className="text-secondary mb-4">Bạn cần tham gia hàng chờ trước khi vào phòng mua vé.</p>
          <button className="btn btn-primary" onClick={() => navigate(`/event/${id}/queue`)}>
            🔔 Tham Gia Hàng Chờ
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <div className="text-center mt-8">Đang tải sơ đồ ghế...</div>;
  if (!eventData) return <div className="text-center mt-8">Không tìm thấy sự kiện.</div>;

  // ─── Seat interaction ──────────────────────────────────────────────────────
  const toggleSeat = (seat) => {
    if (seat.status !== 'AVAILABLE') return;
    if (selectedSeats.find(s => s.id === seat.id)) {
      setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
      setErrorMsg('');
    } else {
      if (selectedSeats.length >= 4) { setErrorMsg('Bạn chỉ được chọn tối đa 4 ghế!'); return; }
      setSelectedSeats(prev => [...prev, seat]);
      setErrorMsg('');
    }
  };

  const handleHoldSeats = async () => {
    setHoldLoading(true); setErrorMsg('');
    try {
      await axios.post(`${API}/Booking/hold`,
        { seatIds: selectedSeats.map(s => s.id), eventId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.setItem('checkoutEventId', id);
      isNavigatingToCheckout.current = true; // Đánh dấu: đang đi checkout, KHAI không trả ghế
      navigate('/checkout');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi giữ ghế.');
      fetchEvent();
      setSelectedSeats([]);
    } finally {
      setHoldLoading(false);
    }
  };

  // ─── Build seat grid ───────────────────────────────────────────────────────
  const seatsByRow = {};
  eventData.zones?.forEach(zone => {
    zone.seats?.forEach(seat => {
      if (!seatsByRow[seat.row_label]) seatsByRow[seat.row_label] = [];
      seatsByRow[seat.row_label].push({ ...seat, zoneName: zone.name, price: zone.price });
    });
  });
  const allSeats = Object.values(seatsByRow).flat();
  const maxColNum = allSeats.length > 0 ? Math.max(...allSeats.map(s => s.seat_number)) : 0;

  return (
    <div>
      <h1 className="text-gradient mb-1" style={{ fontSize: '2.2rem' }}>{eventData.title}</h1>
      <p className="text-secondary mb-6">
        📍 {eventData.location}&nbsp;·&nbsp;📅 {new Date(eventData.start_time).toLocaleString('vi-VN')}
      </p>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* ── Seat Map ── */}
        <div style={{ flex: 2, minWidth: '60%' }}>
          <div className="glass-panel text-center">
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '0.75rem', borderRadius: '6px', marginBottom: '1.5rem', letterSpacing: '0.1em', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              🎭 SÂN KHẤU / MÀN HÌNH
            </div>
            <div className="seat-map-container">
              {Object.keys(seatsByRow).sort().map(rowLabel => {
                const seats = [...seatsByRow[rowLabel]].sort((a, b) => a.seat_number - b.seat_number);
                return (
                  <div key={rowLabel} style={{ display: 'flex', gap: '4px', marginBottom: '4px', alignItems: 'center' }}>
                    <div style={{ width: '2rem', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'right' }}>{rowLabel}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${maxColNum}, 32px)`, gap: '3px' }}>
                      {Array.from({ length: maxColNum }).map((_, cIdx) => {
                        const seat = seats.find(s => s.seat_number === cIdx + 1);
                        if (!seat) return <div key={cIdx} style={{ width: 32, height: 32 }} />;
                        const isSelected = selectedSeats.some(s => s.id === seat.id);
                        let cls = 'seat seat-avai';
                        if (isSelected) cls = 'seat seat-selected';
                        else if (seat.status === 'LOCKED') cls = 'seat seat-locked';
                        else if (seat.status === 'SOLD') cls = 'seat seat-sold';
                        return (
                          <div key={seat.id} className={cls}
                            style={{ width: 32, height: 32, margin: 0, fontSize: '10px' }}
                            onClick={() => toggleSeat(seat)}
                            title={`${seat.zoneName} — ${rowLabel}${seat.seat_number} — ${Number(seat.price).toLocaleString('vi-VN')}đ`}>
                            {seat.seat_number}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-4 mt-4" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
              {[['seat-avai', 'Còn trống'], ['seat-selected', 'Đã chọn'], ['seat-locked', 'Đang giữ'], ['seat-sold', 'Đã bán']].map(([cls, label]) => (
                <div key={cls} className="flex items-center gap-2">
                  <div className={`seat ${cls}`} style={{ width: 18, height: 18 }} />
                  {label}
                </div>
              ))}
            </div>
            {/* Zone prices */}
            <div className="flex justify-center gap-3 mt-2" style={{ fontSize: '0.8rem', flexWrap: 'wrap' }}>
              {eventData.zones?.map(z => (
                <span key={z.id} style={{ background: 'rgba(255,255,255,0.06)', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
                  {z.name} — {Number(z.price).toLocaleString('vi-VN')}đ
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div className="glass-panel sticky" style={{ top: '5rem' }}>
            <h2 className="mb-4">🛒 Ghế Đã Chọn ({selectedSeats.length}/4)</h2>
            {errorMsg && (
              <div style={{ color: 'var(--danger)', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '0.6rem 0.8rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                {errorMsg}
              </div>
            )}
            {selectedSeats.length === 0 ? (
              <p className="text-secondary" style={{ fontSize: '0.9rem' }}>Nhấp vào ghế xanh để chọn.</p>
            ) : (
              <div>
                <ul style={{ listStyle: 'none', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {selectedSeats.map(s => (
                    <li key={s.id} className="flex justify-between" style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.9rem' }}>
                      <span>{s.zoneName} — {s.row_label}{s.seat_number}</span>
                      <span style={{ color: 'var(--success)' }}>{Number(s.price).toLocaleString('vi-VN')}đ</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between font-bold mb-4" style={{ fontSize: '1.1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  <span>Tổng:</span>
                  <span className="text-primary">{selectedSeats.reduce((sum, s) => sum + Number(s.price), 0).toLocaleString('vi-VN')}đ</span>
                </div>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleHoldSeats} disabled={holdLoading}>
                  {holdLoading ? '⏳ Đang giữ chỗ...' : '🎟️ Giữ Chỗ & Thanh Toán'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

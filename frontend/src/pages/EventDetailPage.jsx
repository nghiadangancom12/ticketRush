import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

import { API_BASE, SOCKET_URL } from '../config';

const API = API_BASE;

const ZONE_PALETTE = ['#dc2626', '#6366f1', '#6b7280', '#f59e0b', '#10b981', '#3b82f6'];
const ZONE_BADGE_CLASSES = ['badge-red', 'badge-purple', 'badge-gray', 'badge-yellow', 'badge-green', 'badge-cyan'];

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notAllowed, setNotAllowed] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [countdown, setCountdown] = useState(null);
  const [showBackWarning, setShowBackWarning] = useState(false);

  const token = localStorage.getItem('token');
  const heartbeatRef = useRef(null);
  const countdownRef = useRef(null);
  const isQueueActiveRef = useRef(true);

  const expireAt = location.state?.expireAt
    || (Number(localStorage.getItem('seatSelectionExpiry')) || null);

  const fetchEvent = async () => {
    try {
      const res = await axios.get(`${API}/events/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setEventData(res.data.data);
    } catch (err) {
      if (err.response?.status === 403) setNotAllowed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) { navigate('/auth', { replace: true }); return; }
    fetchEvent();

    const socket = io(SOCKET_URL, { withCredentials: true });
    socket.on('connect', () => socket.emit('joinEventRoom', id));
    socket.on('seatStatusChanged', (payload) => {
      fetchEvent();

      if (!Array.isArray(payload?.seats)) return;

      if (payload.status === 'AVAILABLE' || payload.status === 'SOLD') {
        setSelectedSeats(prev => prev.filter(s => !payload.seats.includes(s.id)));
      } else if (payload.status === 'LOCKED') {
        // Ghế bị người khác lock trong khi user đang chọn locally → bỏ chọn + báo lỗi
        setSelectedSeats(prev => {
          const taken = prev.filter(s => payload.seats.includes(s.id));
          if (taken.length > 0) {
            const labels = taken.map(s => `${s.row_label}${s.seat_number}`).join(', ');
            setErrorMsg(`Ghế ${labels} vừa bị người khác đặt trước. Vui lòng chọn ghế khác.`);
            return prev.filter(s => !payload.seats.includes(s.id));
          }
          return prev;
        });
      }
    });

    return () => socket.disconnect();
  }, [id]);

  // Heartbeat giữ queue session (TTL Redis = 20s → ping mỗi 15s)
  useEffect(() => {
    if (!token) return;
    const ping = () =>
      axios.post(`${API}/queue/${id}/heartbeat`, {}, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          if (res.data.data?.noQueue) {
            isQueueActiveRef.current = false;
            clearInterval(countdownRef.current);
            setCountdown(null);
            localStorage.removeItem('seatSelectionExpiry');
          }
        })
        .catch(err => {
          if (err.response?.status === 410) {
            clearInterval(heartbeatRef.current);
            navigate(`/event/${id}/queue`);
          }
        });
    ping();
    heartbeatRef.current = setInterval(ping, 15000);
    return () => clearInterval(heartbeatRef.current);
  }, [id, token]);

  // Đếm ngược thời gian chọn ghế (60s từ khi được vào queue)
  useEffect(() => {
    if (!expireAt) return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((expireAt - Date.now()) / 1000));
      setCountdown(left);
      if (left === 0) {
        clearInterval(countdownRef.current);
        localStorage.removeItem('seatSelectionExpiry');
        navigate(`/event/${id}/queue`);
      }
    };
    tick();
    countdownRef.current = setInterval(tick, 1000);
    return () => clearInterval(countdownRef.current);
  }, [expireAt]);

  // Back button guard — cảnh báo mất lượt queue khi bấm back
  useEffect(() => {
    window.history.pushState(null, '');
    const handlePopState = () => {
      if (!isQueueActiveRef.current) {
        clearInterval(heartbeatRef.current);
        clearInterval(countdownRef.current);
        localStorage.removeItem('seatSelectionExpiry');
        navigate(`/event/${id}`, { replace: true });
        return;
      }
      setShowBackWarning(true);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const confirmBack = () => {
    setShowBackWarning(false);
    clearInterval(heartbeatRef.current);
    clearInterval(countdownRef.current);
    localStorage.removeItem('seatSelectionExpiry');
    navigate(`/event/${id}`, { replace: true });
  };

  // Chọn / bỏ chọn ghế — chỉ cập nhật local state, không gọi API
  const toggleSeat = (seat, zone) => {
    const alreadySelected = selectedSeats.some(s => s.id === seat.id);
    if (!alreadySelected && seat.status !== 'AVAILABLE') return;

    if (alreadySelected) {
      setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
      setErrorMsg('');
    } else {
      if (selectedSeats.length >= 4) { setErrorMsg('Bạn chỉ được chọn tối đa 4 ghế!'); return; }
      setSelectedSeats(prev => [...prev, { ...seat, zoneName: zone.name, price: zone.price }]);
      setErrorMsg('');
    }
  };

  const handleCheckout = () => {
    if (selectedSeats.length === 0) return;
    clearInterval(countdownRef.current);
    localStorage.setItem('checkoutEventId', id);
    navigate('/checkout', { state: { eventId: id, seats: selectedSeats } });
  };

  /* ── Not allowed ── */
  if (notAllowed) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 60px)', padding: '2rem' }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '3rem 2rem', maxWidth: 400, textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</div>
        <h2 style={{ marginBottom: '0.5rem' }}>Chưa đến lượt</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Bạn cần tham gia hàng chờ trước khi vào phòng chọn vé.
        </p>
        <button className="btn btn-primary" onClick={() => navigate(`/event/${id}/queue`)}>
          Tham Gia Hàng Chờ
        </button>
      </div>
    </div>
  );

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 60px)' }}>
      <div className="spinner" />
    </div>
  );

  if (!eventData) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
      Không tìm thấy sự kiện.
    </div>
  );

  const totalSelected = selectedSeats.reduce((s, seat) => s + Number(seat.price), 0);

  return (
    <>
    {showBackWarning && (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
      }}>
        <div style={{
          background: 'var(--bg-card)', border: '1px solid rgba(239,68,68,0.35)',
          borderRadius: 20, padding: '2.5rem 2rem', maxWidth: 420, width: '100%', textAlign: 'center',
        }} className="animate-fadeIn">
          <div style={{ fontSize: '2.75rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Bạn có chắc muốn quay lại?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '2rem' }}>
            Nếu quay lại, bạn sẽ{' '}
            <strong style={{ color: '#ef4444' }}>mất lượt hiện tại</strong> và phải{' '}
            <strong style={{ color: 'var(--warning)' }}>xếp hàng lại từ đầu</strong>.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="btn btn-outline"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => { setShowBackWarning(false); window.history.pushState(null, ''); }}
            >
              Ở lại
            </button>
            <button
              className="btn"
              style={{
                flex: 1, justifyContent: 'center',
                background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444',
              }}
              onClick={confirmBack}
            >
              Quay lại & Xếp hàng lại
            </button>
          </div>
        </div>
      </div>
    )}
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 1.5rem 6rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* ── Left: Event Info ── */}
        <div style={{ position: 'sticky', top: '1.5rem' }}>
          <div style={{
            borderRadius: 16, overflow: 'hidden', marginBottom: '1rem',
            background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
            aspectRatio: '4/3',
          }}>
            {eventData.image_url ? (
              <img src={eventData.image_url} alt={eventData.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>🎵</div>
            )}
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.25rem' }}>
            <span className="badge badge-purple" style={{ marginBottom: '0.625rem' }}>ÂM NHẠC</span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.875rem', lineHeight: 1.3 }}>{eventData.title}</h2>
            {eventData.description && (
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.6 }}>
                {eventData.description}
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.84rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                <div>
                  <div style={{ color: 'var(--text)', fontWeight: 600 }}>
                    {new Date(eventData.start_time).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <div style={{ fontSize: '0.78rem' }}>
                    {new Date(eventData.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                <svg style={{ marginTop: 2, flexShrink: 0 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                <div>
                  <div style={{ color: 'var(--text)', fontWeight: 600 }}>{eventData.location}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Seat Map ── */}
        <div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Sơ Đồ Chỗ Ngồi</h3>

            {/* Countdown banner */}
            {countdown !== null && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: countdown <= 15 ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.08)',
                border: `1px solid ${countdown <= 15 ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.15)'}`,
                borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.25rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={countdown <= 15 ? '#ef4444' : 'var(--warning)'} strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Thời gian chọn ghế còn lại
                </div>
                <span style={{
                  fontWeight: 800, fontSize: '1.05rem', fontVariantNumeric: 'tabular-nums',
                  color: countdown <= 15 ? '#ef4444' : 'var(--warning)',
                }}>
                  {countdown}s
                </span>
              </div>
            )}

            {/* Legend */}
            <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
              {[
                { label: 'Trống', style: { width: 14, height: 14, borderRadius: '50%', border: '2px solid #94a3b8', background: 'transparent', display: 'inline-block' } },
                { label: 'Đang chọn', style: { width: 14, height: 14, borderRadius: '50%', background: 'var(--cyan)', border: '2px solid var(--cyan)', display: 'inline-block' } },
                { label: 'Đang được giữ', style: { width: 14, height: 14, borderRadius: '50%', background: 'rgba(251,146,60,0.15)', border: '2px solid rgba(251,146,60,0.65)', display: 'inline-block' } },
                { label: 'Đã bán', style: { width: 14, height: 14, borderRadius: '50%', background: 'rgba(55,65,81,0.8)', border: '2px solid rgba(55,65,81,0.8)', opacity: 0.4, display: 'inline-block' } },
              ].map(({ label, style }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={style} />
                  {label}
                </div>
              ))}
            </div>

            {/* Zone price legend */}
            <div style={{ display: 'flex', gap: '0.625rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              {eventData.zones?.map((zone, zIdx) => (
                <button
                  key={zone.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.35rem 0.875rem', borderRadius: 100,
                    background: 'rgba(255,255,255,0.05)', border: `1px solid ${ZONE_PALETTE[zIdx % ZONE_PALETTE.length]}40`,
                    color: 'var(--text)', fontSize: '0.8rem', fontWeight: 600, cursor: 'default',
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: ZONE_PALETTE[zIdx % ZONE_PALETTE.length], display: 'inline-block', flexShrink: 0 }} />
                  {zone.name}: {Number(zone.price).toLocaleString('vi-VN')}đ
                </button>
              ))}
            </div>

            {/* Seat map canvas */}
            <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 12, padding: '1.5rem', overflow: 'auto' }}>
              {/* Stage */}
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '0.5rem 2rem', fontSize: '0.75rem', letterSpacing: '0.12em', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  SÂN KHẤU
                </div>
              </div>

              {/* Zones */}
              {eventData.zones?.map((zone, zIdx) => {
                const color = ZONE_PALETTE[zIdx % ZONE_PALETTE.length];
                const rowMap = {};
                zone.seats?.forEach(seat => {
                  if (!rowMap[seat.row_label]) rowMap[seat.row_label] = [];
                  rowMap[seat.row_label].push(seat);
                });
                const maxCol = zone.seats?.length > 0 ? Math.max(...zone.seats.map(s => s.seat_number)) : 0;

                return (
                  <div key={zone.id} style={{ marginBottom: '1.75rem' }}>
                    {Object.keys(rowMap).sort().map(rowLabel => {
                      const seats = [...rowMap[rowLabel]].sort((a, b) => a.seat_number - b.seat_number);
                      return (
                        <div key={rowLabel} style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 4, alignItems: 'center' }}>
                          {Array.from({ length: maxCol }).map((_, cIdx) => {
                            const seat = seats.find(s => s.seat_number === cIdx + 1);
                            if (!seat) return <div key={cIdx} style={{ width: 20, height: 20, flexShrink: 0 }} />;
                            const isSelected = selectedSeats.some(s => s.id === seat.id);
                            let extraCls = '';
                            let bgStyle = {};
                            if (isSelected) {
                              extraCls = 's-selected';
                            } else if (seat.status === 'LOCKED') {
                              extraCls = 's-locked';
                            } else if (seat.status === 'SOLD') {
                              extraCls = 's-sold';
                              bgStyle = { background: 'rgba(55,65,81,0.7)', borderColor: 'rgba(55,65,81,0.7)' };
                            } else {
                              bgStyle = { borderColor: color, background: 'transparent' };
                            }
                            return (
                              <div
                                key={seat.id}
                                className={`seat-circle ${extraCls}`}
                                style={bgStyle}
                                onClick={() => toggleSeat(seat, zone)}
                                title={
                                  seat.status === 'LOCKED'
                                    ? `${zone.name} — ${rowLabel}${seat.seat_number} — Đang được giữ`
                                    : seat.status === 'SOLD'
                                    ? `${zone.name} — ${rowLabel}${seat.seat_number} — Đã bán`
                                    : `${zone.name} — ${rowLabel}${seat.seat_number} — ${Number(zone.price).toLocaleString('vi-VN')}đ`
                                }
                              />
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {errorMsg && (
              <div className="alert alert-error" style={{ marginTop: '1rem' }}>{errorMsg}</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom checkout bar ── */}
      {selectedSeats.length > 0 && (
        <div className="checkout-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
            <div style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 8, padding: '0.5rem', display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--purple-light)" strokeWidth="2">
                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Đã chọn: {selectedSeats.map(s => `${s.zoneName}-${s.row_label}${s.seat_number}`).join(', ')}
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                {totalSelected.toLocaleString('vi-VN')}đ
                <span style={{ fontWeight: 400, fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '0.4rem' }}>
                  ({selectedSeats.length} vé)
                </span>
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.75rem', fontSize: '0.9rem', gap: '0.5rem' }}
            onClick={handleCheckout}
          >
            Thanh toán ngay
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      )}
    </div>
    </>
  );
}

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:3000/api';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { eventId: stateEventId, seats } = location.state || {};
  const eventId = stateEventId || localStorage.getItem('checkoutEventId');
  const token = localStorage.getItem('token');

  // 'holding' → đang gọi API hold | 'ready' → hold thành công | 'failed' → lỗi
  const [holdPhase, setHoldPhase] = useState('holding');
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const heartbeatRef = useRef(null);
  const countdownRef = useRef(null);
  const holdExpiryRef = useRef(null);
  const isCompletedRef = useRef(false); // ngăn double-release khi unmount

  // Bước 1: Gọi hold khi vào trang
  useEffect(() => {
    if (!token) { navigate('/auth'); return; }

    if (!eventId || !seats?.length) {
      setHoldPhase('failed');
      setErrorMsg('Không tìm thấy thông tin ghế. Vui lòng quay lại chọn ghế.');
      return;
    }

    const holdSeats = async () => {
      try {
        await axios.post(
          `${API}/Booking/hold`,
          { seatIds: seats.map(s => s.id), eventId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setHoldPhase('ready');
        holdExpiryRef.current = Date.now() + 60 * 1000;

        // Bắt đầu đếm ngược 60s
        countdownRef.current = setInterval(() => {
          const left = Math.max(0, Math.ceil((holdExpiryRef.current - Date.now()) / 1000));
          setCountdown(left);
          if (left === 0) {
            clearInterval(countdownRef.current);
            isCompletedRef.current = true; // ngăn unmount cleanup gọi return lần nữa
            axios
              .post(`${API}/Booking/return`, { eventId }, { headers: { Authorization: `Bearer ${token}` } })
              .catch(() => {});
            setHoldPhase('failed');
            setErrorMsg('Đã hết 60 giây giữ chỗ. Vui lòng quay lại chọn ghế.');
          }
        }, 1000);
      } catch (err) {
        setHoldPhase('failed');
        setErrorMsg(err.response?.data?.message || 'Không thể giữ ghế. Ghế có thể đã bị người khác đặt.');
      }
    };

    holdSeats();
    return () => clearInterval(countdownRef.current);
  }, []);

  // Bước 2: Heartbeat giữ queue session
  useEffect(() => {
    if (!eventId || !token) return;
    const ping = async () => {
      try {
        await axios.post(`${API}/queue/${eventId}/heartbeat`, {}, { headers: { Authorization: `Bearer ${token}` } });
      } catch (err) {
        if (err.response?.status === 410) {
          clearInterval(heartbeatRef.current);
          clearInterval(countdownRef.current);
          setHoldPhase('failed');
          setErrorMsg('Phiên giao dịch đã hết hạn. Vui lòng quay lại hàng chờ.');
        }
      }
    };
    ping();
    heartbeatRef.current = setInterval(ping, 12000);
    return () => clearInterval(heartbeatRef.current);
  }, [eventId, token]);

  // Cleanup: nhả ghế nếu rời trang mà chưa hoàn tất
  useEffect(() => {
    return () => {
      if (!isCompletedRef.current && eventId && token) {
        fetch(`${API}/Booking/return`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ eventId }),
          keepalive: true,
        }).catch(() => {});
      }
    };
  }, []);

  const handleCheckout = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await axios.post(
        `${API}/Booking/checkout`,
        { eventId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      isCompletedRef.current = true;
      clearInterval(heartbeatRef.current);
      clearInterval(countdownRef.current);
      setOrderInfo(res.data.data?.order);
      setSuccess(true);
      localStorage.removeItem('checkoutEventId');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi thanh toán.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    isCompletedRef.current = true;
    clearInterval(heartbeatRef.current);
    clearInterval(countdownRef.current);
    setCancelling(true);
    try {
      await axios.post(`${API}/Booking/return`, { eventId }, { headers: { Authorization: `Bearer ${token}` } });
    } catch {
      // Nếu lỗi vẫn navigate về, BullMQ sẽ tự nhả ghế sau timeout
    } finally {
      setCancelling(false);
      localStorage.removeItem('checkoutEventId');
      navigate(`/event/${eventId}`);
    }
  };

  const totalAmount = seats?.reduce((sum, s) => sum + Number(s.price), 0) || 0;

  /* ── Success screen ── */
  if (success) return (
    <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20, padding: '3rem 2.5rem', maxWidth: 480, width: '100%', textAlign: 'center' }} className="animate-fadeIn">
        <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2.5rem' }}>
          ✓
        </div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }} className="text-gradient">Thanh Toán Thành Công!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Vé của bạn đã được xác nhận. Chúng tôi sẽ gửi email kèm mã QR ngay.
        </p>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.875rem', marginBottom: '1.5rem', display: 'inline-block' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>MÃ ĐƠN HÀNG</div>
          <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700, color: 'var(--purple-light)', letterSpacing: '0.05em' }}>
            #{orderInfo?.id?.slice(0, 8)?.toUpperCase() || '--------'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => navigate('/me')}>Xem lịch sử đặt vé</button>
          <button className="btn btn-outline" onClick={() => navigate('/')}>Trang chủ</button>
        </div>
      </div>
    </div>
  );

  /* ── Holding phase: đang gọi API hold ── */
  if (holdPhase === 'holding') return (
    <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3, margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Đang giữ chỗ cho bạn...</p>
      </div>
    </div>
  );

  /* ── Failed phase: hold thất bại hoặc hết giờ ── */
  if (holdPhase === 'failed') return (
    <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '3rem 2.5rem', maxWidth: 440, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>Không thể giữ ghế</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          {errorMsg}
        </p>
        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => navigate(`/event/${eventId}`)}
        >
          ← Quay lại chọn ghế
        </button>
      </div>
    </div>
  );

  /* ── Ready phase: hold thành công, chờ confirm ── */
  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 480 }} className="animate-fadeIn">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, var(--purple), var(--cyan))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.5rem' }}>
            🎟
          </div>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '0.25rem' }}>Xác Nhận Thanh Toán</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Hệ thống mô phỏng — không cần nhập thông tin thẻ</p>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          {/* Countdown banner */}
          <div style={{
            background: countdown <= 15 ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.08)',
            borderBottom: `1px solid ${countdown <= 15 ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.15)'}`,
            padding: '0.875rem 1.25rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={countdown <= 15 ? '#ef4444' : 'var(--warning)'} strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
                Ghế được giữ trong <strong style={{ color: countdown <= 15 ? '#ef4444' : 'var(--warning)' }}>60 giây</strong>
              </p>
            </div>
            <span style={{
              fontWeight: 800, fontSize: '1.1rem', fontVariantNumeric: 'tabular-nums',
              color: countdown <= 15 ? '#ef4444' : 'var(--warning)',
              minWidth: 36, textAlign: 'right',
            }}>
              {countdown}s
            </span>
          </div>

          {/* Seat summary */}
          {seats?.length > 0 && (
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: '0.625rem' }}>GHẾ ĐÃ CHỌN</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {seats.map(seat => (
                  <div key={seat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text)' }}>
                      {seat.zoneName} — {seat.row_label}{seat.seat_number}
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--purple-light)' }}>
                      {Number(seat.price).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.625rem', paddingTop: '0.625rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 700 }}>
                <span>Tổng cộng</span>
                <span style={{ color: 'var(--cyan)' }}>{totalAmount.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
          )}

          <div style={{ padding: '1.25rem' }}>
            {errorMsg && (
              <div className="alert alert-error" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                {errorMsg}
              </div>
            )}

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.95rem', fontSize: '0.95rem', justifyContent: 'center', marginBottom: '0.75rem' }}
              onClick={handleCheckout}
              disabled={loading || cancelling}
            >
              {loading
                ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />Đang xử lý...</>
                : 'Xác Nhận Thanh Toán'}
            </button>

            <button
              className="btn btn-outline"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleCancel}
              disabled={loading || cancelling}
            >
              {cancelling
                ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />Đang trả ghế...</>
                : '← Huỷ & Quay Lại Chọn Ghế'}
            </button>

            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Huỷ sẽ nhả ghế ngay lập tức và cho người tiếp theo vào hàng chờ.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

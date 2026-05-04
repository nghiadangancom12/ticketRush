import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:3000/api';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const eventId = localStorage.getItem('checkoutEventId');
  const token = localStorage.getItem('token');
  const heartbeatRef = useRef(null);

  useEffect(() => {
    if (!eventId || !token) return;
    const ping = async () => {
      try {
        await axios.post(`${API}/queue/${eventId}/heartbeat`, {}, { headers: { Authorization: `Bearer ${token}` } });
      } catch (err) {
        if (err.response?.status === 410) {
          clearInterval(heartbeatRef.current);
          setErrorMsg('Phiên giao dịch đã hết hạn. Vui lòng quay lại hàng chờ.');
        }
      }
    };
    ping();
    heartbeatRef.current = setInterval(ping, 12000);
    return () => clearInterval(heartbeatRef.current);
  }, [eventId, token]);

  const handleCheckout = async () => {
    setLoading(true); setErrorMsg('');
    try {
      if (!token) { navigate('/auth'); return; }
      if (!eventId) { setErrorMsg('Không tìm thấy thông tin sự kiện. Vui lòng quay lại chọn ghế.'); return; }
      const res = await axios.post(`${API}/Booking/checkout`, { eventId }, { headers: { Authorization: `Bearer ${token}` } });
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
    if (!eventId || !token) { navigate('/'); return; }
    setCancelling(true);
    try {
      await axios.post(`${API}/Booking/return`, { eventId }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      console.warn('Lỗi trả ghế:', err.response?.data?.message);
    } finally {
      setCancelling(false);
      localStorage.removeItem('checkoutEventId');
      navigate(`/event/${eventId}/queue`);
    }
  };

  if (success) return (
    <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20, padding: '3rem 2.5rem', maxWidth: 480, width: '100%', textAlign: 'center' }} className="animate-fadeIn">
        {/* Success icon */}
        <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2.5rem' }}>
          ✓
        </div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }} className="text-gradient">Thanh Toán Thành Công!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Vé của bạn đã được xác nhận. Chúng tôi sẽ gửi email kèm mã QR ngay.
        </p>

        {/* Order ID */}
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
          {/* Info box */}
          <div style={{ background: 'rgba(245,158,11,0.08)', borderBottom: '1px solid rgba(245,158,11,0.15)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Ghế sẽ tự động được nhả sau <strong style={{ color: 'var(--warning)' }}>60 giây</strong> nếu bạn chưa hoàn tất.
            </p>
          </div>

          <div style={{ padding: '1.5rem' }}>
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

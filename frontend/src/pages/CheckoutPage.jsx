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

  // ─── Heartbeat: ping mỗi 12s để giữ queue session không hết hạn ────────────
  // Session TTL = 20s, nên ping 12s là an toàn. Dừng heartbeat khi unmount.
  useEffect(() => {
    if (!eventId || !token) return;

    const ping = async () => {
      try {
        await axios.post(
          `${API}/queue/${eventId}/heartbeat`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        if (err.response?.status === 410) {
          // Session hết hạn — điều hướng về hàng chờ
          clearInterval(heartbeatRef.current);
          setErrorMsg('⏰ Phiên giao dịch đã hết hạn. Vui lòng quay lại hàng chờ.');
        }
      }
    };

    // Ping ngay khi vào trang, sau đó mỗi 12 giây
    ping();
    heartbeatRef.current = setInterval(ping, 12000);

    return () => clearInterval(heartbeatRef.current);
  }, [eventId, token]);

  const handleCheckout = async () => {
    setLoading(true); setErrorMsg('');
    try {
      if (!token) { navigate('/auth'); return; }
      if (!eventId) { setErrorMsg('Không tìm thấy thông tin sự kiện. Vui lòng quay lại chọn ghế.'); return; }

      const res = await axios.post(`${API}/Booking/checkout`,
        { eventId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrderInfo(res.data.data?.order);
      setSuccess(true);
      localStorage.removeItem('checkoutEventId');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi thanh toán.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Người dùng bấm "Quay Lại" hoặc "Huỷ":
   * 1. Gọi POST /Booking/return → nhả ghế LOCKED về AVAILABLE
   *    + giải phóng slot Queue cho người tiếp theo
   * 2. Điều hướng về trang sự kiện để chọn ghế lại
   */
  const handleCancel = async () => {
    if (!eventId || !token) { navigate('/'); return; }
    setCancelling(true);
    try {
      await axios.post(`${API}/Booking/return`,
        { eventId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      // Không block navigation nếu return API lỗi
      console.warn('Lỗi trả ghế:', err.response?.data?.message);
    } finally {
      setCancelling(false);
      localStorage.removeItem('checkoutEventId');
      // Quay lại trang queue để chọn lại
      navigate(`/event/${eventId}/queue`);
    }
  };

  if (success) {
    return (
      <div className="flex justify-center mt-8">
        <div className="glass-panel text-center" style={{ maxWidth: 500, padding: '3rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
          <h2 className="text-gradient mb-2">Thanh Toán Thành Công!</h2>
          <p className="text-secondary mb-2">Vé của bạn đã được xác nhận. Chúng tôi sẽ gửi email kèm mã QR cho bạn ngay.</p>
          <p style={{ fontFamily: 'monospace', color: 'var(--primary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Mã đơn: #{orderInfo?.id?.slice(0, 8)?.toUpperCase()}
          </p>
          <div className="flex gap-4 justify-center">
            <button className="btn btn-primary" onClick={() => navigate('/me')}>Xem Lịch Sử Đặt Vé</button>
            <button className="btn btn-outline" onClick={() => navigate('/')}>Trang Chủ</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center mt-8">
      <div className="glass-panel" style={{ maxWidth: 480, width: '100%', padding: '2rem' }}>
        <h2 className="text-center mb-2">🎟️ Xác Nhận Thanh Toán</h2>
        <p className="text-secondary text-center mb-4" style={{ fontSize: '0.9rem' }}>
          Hệ thống mô phỏng — không cần nhập thông tin thẻ
        </p>

        {errorMsg && (
          <div style={{ color: 'var(--danger)', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem' }}>
            ❌ {errorMsg}
          </div>
        )}

        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', borderLeft: '3px solid var(--primary)' }}>
          <p className="text-secondary" style={{ fontSize: '0.85rem', margin: 0 }}>
            ⏱ Ghế sẽ tự động được nhả sau <strong style={{ color: 'var(--warning)' }}>60 giây</strong> nếu bạn chưa hoàn tất.
          </p>
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.875rem', fontSize: '1rem' }}
          onClick={handleCheckout}
          disabled={loading || cancelling}>
          {loading ? '⏳ Đang xử lý...' : '💳 XÁC NHẬN THANH TOÁN'}
        </button>

        {/* Huỷ → trả ghế + giải phóng queue slot */}
        <button
          className="btn btn-outline mt-4"
          style={{ width: '100%' }}
          onClick={handleCancel}
          disabled={loading || cancelling}>
          {cancelling ? '↩️ Đang trả ghế...' : '← Huỷ & Quay Lại Chọn Ghế'}
        </button>

        <p className="text-secondary text-center mt-4" style={{ fontSize: '0.75rem' }}>
          Huỷ sẽ nhả ghế ngay lập tức và cho người tiếp theo vào hàng chờ.
        </p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCheckout = async () => {
    setLoading(true);
    setErrorMsg('');
    const eventId = localStorage.getItem('checkoutEventId');

    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/auth');
      const res = await axios.post(`http://localhost:3000/api/seats/checkout`, 
        { eventId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrderInfo(res.data.order);
      setSuccess(true);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi thanh toán.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex justify-center mt-8">
        <div className="glass-panel text-center" style={{maxWidth: '500px', padding: '3rem'}}>
          <div style={{fontSize: '4rem', color: 'var(--success)', marginBottom: '1rem'}}>✅</div>
          <h2 className="text-gradient mb-2">Thanh Toán Thành Công!</h2>
          <p className="text-secondary mb-4">Mã đơn hàng của bạn: <strong>{orderInfo?.id}</strong></p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Quay Về Trang Chủ</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center mt-8">
      <div className="glass-panel" style={{maxWidth: '500px', width: '100%', padding: '2rem'}}>
        <h2 className="text-center mb-4">Xác Nhận & Thanh Toán</h2>
        
        {errorMsg && <div style={{color: 'var(--danger)', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px'}}>{errorMsg}</div>}
        
        <div className="mb-4 text-center">
          <p className="text-secondary">Bạn đang thanh toán cho ghế đã chọn. Nhấn Xác Nhận để hoàn tất (Không cần nhập thẻ tín dụng trên hệ thống mô phỏng này).</p>
        </div>

        <button 
          className="btn btn-primary" 
          style={{width: '100%'}} 
          onClick={handleCheckout}
          disabled={loading}
        >
          {loading ? 'Đang xử lý...' : 'XÁC NHẬN THANH TOÁN'}
        </button>
        
        <button 
          className="btn btn-outline mt-4" 
          style={{width: '100%'}} 
          onClick={() => navigate('/')}
        >
          Hủy Bỏ
        </button>
      </div>
    </div>
  );
}

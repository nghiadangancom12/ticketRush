import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:3000/api';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', passwordConfirm: '', full_name: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!isLogin && formData.password !== formData.passwordConfirm) {
      setErrorMsg('Mật khẩu xác nhận không khớp!');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        const res = await axios.post(`${API}/auth/login`, {
          email: formData.email, password: formData.password
        });
        const { user, accessToken } = res.data.data;
        localStorage.setItem('token', accessToken);
        localStorage.setItem('userId', user.id);
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userName', user.full_name);
        if (user.avatar_url) localStorage.setItem('avatarUrl', user.avatar_url);
        navigate('/');
      } else {
        await axios.post(`${API}/auth/register`, {
          email: formData.email,
          password: formData.password,
          passwordConfirm: formData.passwordConfirm,
          full_name: formData.full_name
        });
        setErrorMsg('');
        setIsLogin(true);
        setFormData(prev => ({ ...prev, password: '', passwordConfirm: '' }));
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center mt-8">
      <div className="glass-panel" style={{ maxWidth: 420, width: '100%' }}>
        <h2 className="text-center mb-2 text-gradient" style={{ fontSize: '1.8rem' }}>
          {isLogin ? '👋 Đăng Nhập' : '🚀 Tạo Tài Khoản'}
        </h2>
        <p className="text-secondary text-center mb-4" style={{ fontSize: '0.9rem' }}>
          {isLogin ? 'Chào mừng trở lại TicketRush!' : 'Đăng ký để bắt đầu mua vé sự kiện'}
        </p>

        {errorMsg && (
          <div style={{ color: 'var(--danger)', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
            ❌ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Họ và Tên</label>
              <input type="text" className="form-input" required value={formData.full_name} onChange={set('full_name')} placeholder="Nguyễn Văn A" />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" required value={formData.email} onChange={set('email')} placeholder="email@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input type="password" className="form-input" required minLength={6} value={formData.password} onChange={set('password')} placeholder="Tối thiểu 6 ký tự" />
          </div>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Xác nhận mật khẩu</label>
              <input type="password" className="form-input" required value={formData.passwordConfirm} onChange={set('passwordConfirm')} placeholder="Nhập lại mật khẩu" />
            </div>
          )}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem' }} disabled={loading}>
            {loading ? '⏳ Đang xử lý...' : (isLogin ? 'Đăng Nhập' : 'Tạo Tài Khoản')}
          </button>
        </form>

        <div className="text-center mt-4 text-secondary" style={{ fontSize: '0.9rem' }}>
          {isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
          <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}>
            {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
          </span>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:3000/api';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', passwordConfirm: '', full_name: '', date_of_birth: '', gender: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const switchMode = (mode) => {
    setIsLogin(mode);
    setIsForgot(false);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setErrorMsg(''); setSuccessMsg(''); setLoading(true);
    try {
      await axios.post(`${API}/auth/forgotPassword`, { email: formData.email });
      setSuccessMsg('Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư.');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(''); setSuccessMsg('');
    if (!isLogin && formData.password !== formData.passwordConfirm) {
      setErrorMsg('Mật khẩu xác nhận không khớp!');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        const res = await axios.post(`${API}/auth/login`, { email: formData.email, password: formData.password });
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
          full_name: formData.full_name,
          ...(formData.date_of_birth && { date_of_birth: formData.date_of_birth }),
          ...(formData.gender && { gender: formData.gender }),
        });
        setSuccessMsg('Đăng ký thành công! Vui lòng đăng nhập.');
        setIsLogin(true);
        setFormData(prev => ({ ...prev, password: '', passwordConfirm: '' }));
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
      background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(124,58,237,0.1) 0%, transparent 70%)',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }} className="animate-fadeIn">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.25rem' }}>TicketRush</div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {isLogin ? 'Chào mừng trở lại!' : 'Tham gia TicketRush ngay hôm nay'}
          </p>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          {/* Tabs */}
          {!isForgot && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--border)' }}>
              {[['login', 'Đăng nhập'], ['register', 'Đăng ký']].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => switchMode(key === 'login')}
                  style={{
                    padding: '0.875rem', border: 'none', background: 'none',
                    color: (isLogin === (key === 'login')) ? 'var(--text)' : 'var(--text-muted)',
                    fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit',
                    borderBottom: (isLogin === (key === 'login')) ? '2px solid var(--purple)' : '2px solid transparent',
                    marginBottom: -1, transition: 'all 0.2s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          {isForgot && (
            <div style={{ padding: '0.875rem 1.75rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button onClick={() => { setIsForgot(false); setErrorMsg(''); setSuccessMsg(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Quên mật khẩu</span>
            </div>
          )}

          <div style={{ padding: '1.75rem' }}>
            {errorMsg && (
              <div className="alert alert-error" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="alert alert-success" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                {successMsg}
              </div>
            )}

            {/* Forgot Password Form */}
            {isForgot ? (
              <form onSubmit={handleForgotPassword}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  Nhập email của bạn, chúng tôi sẽ gửi link đặt lại mật khẩu.
                </p>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" required value={formData.email} onChange={set('email')} placeholder="email@example.com" />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', fontSize: '0.95rem', justifyContent: 'center' }} disabled={loading}>
                  {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />Đang gửi...</> : 'Gửi email đặt lại'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="form-group">
                    <label className="form-label">Họ và Tên *</label>
                    <input type="text" className="form-input" required value={formData.full_name} onChange={set('full_name')} placeholder="Nguyễn Văn A" />
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" required value={formData.email} onChange={set('email')} placeholder="email@example.com" />
                </div>
                <div className="form-group" style={{ marginBottom: isLogin ? '0.25rem' : '1rem' }}>
                  <label className="form-label">Mật khẩu</label>
                  <input type="password" className="form-input" required minLength={6} value={formData.password} onChange={set('password')} placeholder="Tối thiểu 6 ký tự" />
                </div>
                {isLogin && (
                  <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
                    <span onClick={() => { setIsForgot(true); setErrorMsg(''); setSuccessMsg(''); }}
                      style={{ fontSize: '0.8rem', color: 'var(--purple-light)', cursor: 'pointer', fontWeight: 500 }}>
                      Quên mật khẩu?
                    </span>
                  </div>
                )}
                {!isLogin && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Xác nhận mật khẩu *</label>
                      <input type="password" className="form-input" required value={formData.passwordConfirm} onChange={set('passwordConfirm')} placeholder="Nhập lại mật khẩu" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Ngày sinh</label>
                        <input type="date" className="form-input" value={formData.date_of_birth} onChange={set('date_of_birth')} max={new Date().toISOString().split('T')[0]} />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Giới tính</label>
                        <select className="form-input" value={formData.gender} onChange={set('gender')}>
                          <option value="">— Chọn —</option>
                          <option value="MALE">Nam</option>
                          <option value="FEMALE">Nữ</option>
                          <option value="OTHER">Khác</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.875rem', fontSize: '0.95rem', marginTop: '0.5rem', justifyContent: 'center' }}
                  disabled={loading}
                >
                  {loading
                    ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />Đang xử lý...</>
                    : isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
                </button>
              </form>
            )}

            {!isForgot && (
              <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
                <span
                  style={{ color: 'var(--purple-light)', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => switchMode(!isLogin)}
                >
                  {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

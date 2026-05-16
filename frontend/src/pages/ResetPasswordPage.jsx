import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../config';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', passwordConfirm: '' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.passwordConfirm) {
      setErrorMsg('Mật khẩu xác nhận không khớp!');
      return;
    }
    setLoading(true); setErrorMsg('');
    try {
      await axios.patch(`${API_BASE}/auth/resetPassword/${token}`, {
        password: form.password,
        passwordConfirm: form.passwordConfirm,
      });
      setSuccess(true);
    } catch (err) {
      const errData = err.response?.data;
      const message = errData?.errors?.[0]?.message || errData?.message || 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(124,58,237,0.12) 0%, transparent 70%)' }}>
      <div style={{ width: '100%', maxWidth: 420 }} className="animate-fadeIn">
        {success ? (
          <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20, padding: '3rem 2.5rem', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem', fontWeight: 700 }}>
              ✓
            </div>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '0.5rem' }} className="text-gradient">
              Đặt lại mật khẩu thành công!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.6 }}>
              Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập ngay bây giờ.
            </p>
            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
              onClick={() => navigate('/auth', { replace: true })}
            >
              Đăng nhập ngay
            </button>
          </div>
        ) : (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '2.5rem' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, var(--purple), var(--cyan))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.4rem' }}>
                🔐
              </div>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '0.35rem' }}>Đặt lại mật khẩu</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Nhập mật khẩu mới cho tài khoản của bạn</p>
            </div>

            <form onSubmit={handleSubmit}>
              {errorMsg && (
                <div className="alert alert-error" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                  {errorMsg}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Mật khẩu mới</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Tối thiểu 6 ký tự"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required
                    autoComplete="new-password"
                    style={{ paddingRight: '2.75rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
                  >
                    {showPw
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    }
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Xác nhận mật khẩu mới</label>
                <input
                  type={showPw ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Nhập lại mật khẩu mới"
                  value={form.passwordConfirm}
                  onChange={e => setForm(f => ({ ...f, passwordConfirm: e.target.value }))}
                  required
                  autoComplete="new-password"
                />
                {form.passwordConfirm && form.password !== form.passwordConfirm && (
                  <p style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '0.35rem' }}>Mật khẩu không khớp</p>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', marginTop: '0.5rem' }}
                disabled={loading || !form.password || !form.passwordConfirm}
              >
                {loading
                  ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />Đang xử lý...</>
                  : 'Xác nhận đặt lại mật khẩu'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
              <button
                className="btn btn-ghost"
                style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
                onClick={() => navigate('/auth')}
              >
                ← Quay lại đăng nhập
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import HomePage from './pages/HomePage';
import QueuePage from './pages/QueuePage';
import EventInfoPage from './pages/EventInfoPage';
import EventDetailPage from './pages/EventDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import AuthPage from './pages/AuthPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { API_BASE } from './config';

function RateLimitOverlay() {
  const [remaining, setRemaining] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const handleRateLimit = (e) => {
      const secs = Math.max(1, e.detail?.seconds || 10);
      setRemaining(secs);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) { clearInterval(timerRef.current); return 0; }
          return prev - 1;
        });
      }, 1000);
    };
    window.addEventListener('rate-limited', handleRateLimit);
    return () => {
      window.removeEventListener('rate-limited', handleRateLimit);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (remaining === 0) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid rgba(245,158,11,0.35)',
        borderRadius: 20, padding: '2.5rem 2.5rem 2rem', maxWidth: 360, width: '100%', textAlign: 'center',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(245,158,11,0.12)', border: '2px solid rgba(245,158,11,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.25rem', fontSize: '1.75rem',
        }}>⏱</div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.4rem' }}>
          Thao tác quá nhanh
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Vui lòng thử lại sau
        </p>
        <div style={{
          fontSize: '4rem', fontWeight: 900, lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
          background: 'linear-gradient(135deg, var(--warning), #f97316)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          marginBottom: '0.25rem',
        }}>
          {remaining}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
          GIÂY
        </div>
        <div style={{ marginTop: '1.5rem', height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 99,
            background: 'linear-gradient(90deg, var(--warning), #f97316)',
            transition: 'width 1s linear',
            width: `${(remaining / (remaining + 1)) * 100}%`,
          }} />
        </div>
      </div>
    </div>
  );
}

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const name = localStorage.getItem('userName') || '';
  const role = localStorage.getItem('userRole') || '';
  const avatarUrl = localStorage.getItem('avatarUrl') || '';
  const initials = name ? name.split(' ').map(w => w[0]).filter(Boolean).slice(-2).join('').toUpperCase() : '?';

  const handleLogout = async () => {
    try { await fetch(`${API_BASE}/auth/logout`, { credentials: 'include' }); } catch { /* ignore */ }
    ['token', 'userId', 'userRole', 'userName', 'avatarUrl', 'checkoutEventId'].forEach(k => localStorage.removeItem(k));
    navigate('/auth');
  };

  // Admin page has its own full-page layout
  if (location.pathname === '/admin') return null;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">TicketRush</Link>

        <div className="navbar-actions">
          {token ? (
            <>

              <button
                className="icon-btn"
                title="Tài khoản"
                onClick={() => navigate('/me')}
                style={{ overflow: 'hidden', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', color: 'white', fontWeight: 700, fontSize: '0.8rem' }}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                ) : initials}
              </button>

              {role === 'ADMIN' && (
                <button
                  className="btn btn-ghost"
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                  onClick={() => navigate('/admin')}
                >
                  Admin
                </button>
              )}

              <button
                className="btn btn-outline"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.875rem' }}
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => navigate('/auth')}>
              Đăng nhập
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <RateLimitOverlay />
      <Navigation />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/me" element={<ProfilePage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/event/:id/queue" element={<QueuePage />} />
        <Route path="/event/:id/seats" element={<EventDetailPage />} />
        <Route path="/event/:id" element={<EventInfoPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

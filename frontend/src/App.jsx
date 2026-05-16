import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
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

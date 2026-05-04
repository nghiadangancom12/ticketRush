import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import QueuePage from './pages/QueuePage';
import EventDetailPage from './pages/EventDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import AuthPage from './pages/AuthPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');

  const token = localStorage.getItem('token');
  const name = localStorage.getItem('userName') || '';
  const role = localStorage.getItem('userRole') || '';
  const avatarUrl = localStorage.getItem('avatarUrl') || '';
  const initials = name ? name.split(' ').map(w => w[0]).filter(Boolean).slice(-2).join('').toUpperCase() : '?';

  const handleLogout = () => {
    ['token', 'userId', 'userRole', 'userName', 'avatarUrl', 'checkoutEventId'].forEach(k => localStorage.removeItem(k));
    navigate('/auth');
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/?q=${encodeURIComponent(search.trim())}`);
    }
  };

  // Admin page has its own full-page layout
  if (location.pathname === '/admin') return null;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">TicketRush</Link>

        <div className="navbar-search">
          <svg className="navbar-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm sự kiện, nghệ sĩ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>

        <div className="navbar-actions">
          {token ? (
            <>
              <button className="icon-btn" title="Thông báo">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </button>

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
        <Route path="/event/:id/queue" element={<QueuePage />} />
        <Route path="/event/:id" element={<EventDetailPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

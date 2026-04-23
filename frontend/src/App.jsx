import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import QueuePage from './pages/QueuePage';
import EventDetailPage from './pages/EventDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import AuthPage from './pages/AuthPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';

function Navigation() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const name = localStorage.getItem('userName') || '';
  const avatarUrl = localStorage.getItem('avatarUrl') || '';
  const role = localStorage.getItem('userRole') || '';
  const initials = name ? name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase() : '?';

  const handleLogout = () => {
    ['token', 'userId', 'userRole', 'userName', 'avatarUrl', 'checkoutEventId'].forEach(k => localStorage.removeItem(k));
    navigate('/auth');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand text-gradient">🎫 TicketRush</Link>
      <div className="flex gap-4 items-center">
        <Link to="/" className="btn btn-outline" style={{ color: 'white', fontSize: '0.9rem' }}>Sự Kiện</Link>
        {token ? (
          <>
            {role === 'ADMIN' && (
              <Link to="/admin" style={{ color: 'var(--warning)', fontSize: '0.9rem', fontWeight: 600 }}>
                👑 Dashboard
              </Link>
            )}
            <Link to="/me" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar"
                  style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                  onError={e => { e.target.style.display = 'none'; }} />
              ) : (
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', fontWeight: 700, color: '#fff',
                  border: '2px solid var(--primary)'
                }}>{initials}</div>
              )}
            </Link>
            <button className="btn btn-outline" onClick={handleLogout} style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
              Đăng Xuất
            </button>
          </>
        ) : (
          <Link to="/auth" className="btn btn-primary">Đăng Nhập</Link>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/me" element={<ProfilePage />} />
            {/* Step 1: Queue entry page */}
            <Route path="/event/:id/queue" element={<QueuePage />} />
            {/* Step 2: Booking/seat map (only after queue clears) */}
            <Route path="/event/:id" element={<EventDetailPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

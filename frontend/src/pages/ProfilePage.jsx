import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProfilePage.css';

const API = 'http://localhost:3000/api';
const GENDER_LABELS = { MALE: 'Nam', FEMALE: 'Nữ', OTHER: 'Khác' };

function AvatarDisplay({ name, avatarUrl, size = 80 }) {
  const initials = name ? name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase() : '?';
  if (avatarUrl) {
    return (
      <img src={avatarUrl} alt="avatar"
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }}
        onError={e => { e.target.style.display = 'none'; }} />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 700, color: '#fff',
      border: '3px solid var(--primary)', flexShrink: 0
    }}>{initials}</div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [lockedSeats, setLockedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [avatarInput, setAvatarInput] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });

  const token = localStorage.getItem('token');

  const fetchAll = async () => {
    try {
      // 1. Profile from /api/users/me
      const profileRes = await axios.get(`${API}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const p = profileRes.data.data;
      setProfile(p);
      setForm({ full_name: p.full_name || '', date_of_birth: p.date_of_birth ? p.date_of_birth.split('T')[0] : '', gender: p.gender || '' });
      setAvatarInput(p.avatar_url || '');
      if (p.avatar_url) localStorage.setItem('avatarUrl', p.avatar_url);

      // 2. Purchase history from /api/customers/purchaseHistory
      const histRes = await axios.get(`${API}/customers/purchaseHistory`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(histRes.data.data?.orders || []);
      setLockedSeats(histRes.data.data?.lockedSeats || []);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) { navigate('/auth'); return; }
    fetchAll();
  }, []);

  const handleSave = async () => {
    setSaving(true); setMsg({ type: '', text: '' });
    try {
      const res = await axios.patch(`${API}/users/me`, { ...form, avatar_url: avatarInput }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data.data);
      localStorage.setItem('avatarUrl', avatarInput);
      localStorage.setItem('userName', res.data.data.full_name);
      setEditing(false);
      setMsg({ type: 'success', text: '✅ Cập nhật thành công!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center mt-8">Đang tải hồ sơ...</div>;
  if (!profile) return null;

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header glass-panel">
        <div className="profile-avatar-wrap">
          <AvatarDisplay name={profile.full_name} avatarUrl={avatarInput || profile.avatar_url} size={100} />
          {editing && (
            <div className="avatar-edit-wrap">
              <input type="text" className="form-input" placeholder="URL ảnh đại diện..." value={avatarInput}
                onChange={e => setAvatarInput(e.target.value)} style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }} />
            </div>
          )}
        </div>
        <div className="profile-info">
          {editing ? (
            <input type="text" className="form-input" value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })}
              style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }} />
          ) : (
            <h2 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>{profile.full_name}</h2>
          )}
          <div className="profile-badges">
            <span className={`badge ${profile.role === 'ADMIN' ? 'badge-admin' : 'badge-customer'}`}>
              {profile.role === 'ADMIN' ? '👑 Admin' : '🎫 Customer'}
            </span>
            <span className="badge badge-neutral">{profile.email}</span>
          </div>
        </div>
        <div className="profile-actions">
          {editing ? (
            <>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : '💾 Lưu'}</button>
              <button className="btn btn-outline" onClick={() => { setEditing(false); setMsg({ type: '', text: '' }); }}>Huỷ</button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => setEditing(true)}>✏️ Chỉnh sửa</button>
          )}
        </div>
      </div>

      {msg.text && <div className={`alert-msg ${msg.type}`}>{msg.text}</div>}

      <div className="profile-grid">
        {/* Personal Info */}
        <div className="glass-panel">
          <h3 className="section-title">📋 Thông Tin Cá Nhân</h3>
          <div className="info-table">
            <div className="info-row">
              <span className="info-label">Ngày sinh</span>
              {editing ? (
                <input type="date" className="form-input" value={form.date_of_birth} onChange={e => setForm({ ...form, date_of_birth: e.target.value })} />
              ) : (
                <span>{profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</span>
              )}
            </div>
            <div className="info-row">
              <span className="info-label">Giới tính</span>
              {editing ? (
                <select className="form-input" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                  <option value="">-- Chọn --</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              ) : (
                <span>{GENDER_LABELS[profile.gender] || 'Chưa cập nhật'}</span>
              )}
            </div>
            <div className="info-row">
              <span className="info-label">Ngày tham gia</span>
              <span>{profile.created_at ? new Date(profile.created_at).toLocaleDateString('vi-VN') : '—'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Tổng đơn hàng</span>
              <span className="text-primary" style={{ fontWeight: 700 }}>{orders.length} đơn</span>
            </div>
          </div>
        </div>

        {/* Locked Seats */}
        <div className="glass-panel">
          <h3 className="section-title">⏳ Ghế Đang Giữ ({lockedSeats.length})</h3>
          {lockedSeats.length === 0 ? (
            <p className="text-secondary" style={{ fontSize: '0.9rem' }}>Bạn không đang giữ ghế nào.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {lockedSeats.map(seat => {
                const lockTime = new Date(seat.locked_at);
                const expireTime = new Date(lockTime.getTime() + 60000);
                const remaining = Math.max(0, Math.floor((expireTime - Date.now()) / 1000));
                return (
                  <div key={seat.id} className="locked-seat-card">
                    <div>
                      <strong>{seat.zones?.events?.title}</strong>
                      <div className="text-secondary" style={{ fontSize: '0.85rem' }}>
                        {seat.zones?.name} — Ghế {seat.row_label}{seat.seat_number}
                      </div>
                    </div>
                    <div className={`countdown ${remaining < 15 ? 'urgent' : ''}`}>
                      {remaining > 0 ? `⏱ ${remaining}s` : '⚠️ Hết hạn'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Order History */}
      <div className="glass-panel mt-4">
        <h3 className="section-title">🎫 Lịch Sử Đặt Vé ({orders.length})</h3>
        {orders.length === 0 ? (
          <p className="text-secondary">Bạn chưa có đơn hàng nào.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Mã đơn: <span style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{order.id.slice(0, 8).toUpperCase()}...</span>
                  </span>
                  <span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span>
                  <span style={{ fontWeight: 700, color: 'var(--success)' }}>{Number(order.total_amount).toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="order-tickets">
                  {order.tickets?.map(ticket => (
                    <div key={ticket.id} className="ticket-chip">
                      🪑 {ticket.seats?.zones?.name} — {ticket.seats?.row_label}{ticket.seats?.seat_number}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

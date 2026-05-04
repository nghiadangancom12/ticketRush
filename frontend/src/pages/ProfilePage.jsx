import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:3000/api';
const GENDER_LABELS = { MALE: 'Nam', FEMALE: 'Nữ', OTHER: 'Khác' };

function Avatar({ name, url, size = 72 }) {
  const initials = name ? name.split(' ').map(w => w[0]).filter(Boolean).slice(-2).join('').toUpperCase() : '?';
  return url
    ? <img src={url} alt="avatar" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(124,58,237,0.4)' }} onError={e => e.target.style.display = 'none'} />
    : <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.33, fontWeight: 700, color: '#fff', flexShrink: 0, border: '2px solid rgba(124,58,237,0.4)' }}>{initials}</div>;
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
      const [profileRes, histRes] = await Promise.all([
        axios.get(`${API}/users/me`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/customers/purchaseHistory`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const p = profileRes.data.data;
      setProfile(p);
      setForm({ full_name: p.full_name || '', date_of_birth: p.date_of_birth ? p.date_of_birth.split('T')[0] : '', gender: p.gender || '' });
      setAvatarInput(p.avatar_url || '');
      if (p.avatar_url) localStorage.setItem('avatarUrl', p.avatar_url);
      setOrders(histRes.data.data?.orders || []);
      setLockedSeats(histRes.data.data?.lockedSeats || []);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (!token) { navigate('/auth'); return; } fetchAll(); }, []);

  const handleSave = async () => {
    setSaving(true); setMsg({ type: '', text: '' });
    try {
      const res = await axios.patch(`${API}/users/me`, { ...form, avatar_url: avatarInput }, { headers: { Authorization: `Bearer ${token}` } });
      setProfile(res.data.data);
      localStorage.setItem('avatarUrl', avatarInput);
      localStorage.setItem('userName', form.full_name);
      setEditing(false);
      setMsg({ type: 'success', text: 'Cập nhật thành công!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Có lỗi khi lưu.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 60px)' }}>
      <div className="spinner" />
    </div>
  );

  const totalSpent = orders.filter(o => o.status === 'PAID').reduce((s, o) => s + Number(o.total_amount), 0);

  const orderStatusBadge = (status) => {
    if (status === 'PAID') return <span className="badge badge-green">Đã thanh toán</span>;
    if (status === 'CANCELLED') return <span className="badge badge-red">Đã huỷ</span>;
    return <span className="badge badge-yellow">Chờ thanh toán</span>;
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem 4rem' }} className="animate-fadeIn">

      {/* ── Profile Header ── */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.75rem', marginBottom: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <Avatar name={profile?.full_name} url={profile?.avatar_url} size={80} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{profile?.full_name}</h2>
            <span className={`badge ${profile?.role === 'ADMIN' ? 'badge-yellow' : 'badge-purple'}`}>
              {profile?.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng'}
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{profile?.email}</p>
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{orders.length}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Đơn hàng</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--success)' }}>{totalSpent.toLocaleString('vi-VN')}đ</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Đã chi tiêu</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }) : '—'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tham gia</div>
            </div>
          </div>
        </div>
        <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.45rem 0.875rem' }} onClick={() => { setEditing(!editing); setMsg({ type: '', text: '' }); }}>
          {editing ? 'Huỷ' : 'Chỉnh sửa'}
        </button>
      </div>

      {/* ── Edit Form ── */}
      {editing && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Chỉnh sửa thông tin</h3>
          {msg.text && <div className={`alert ${msg.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1rem' }}>{msg.text}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Họ và tên</label>
              <input className="form-input" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Ngày sinh</label>
              <input type="date" className="form-input" value={form.date_of_birth} onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Giới tính</label>
              <select className="form-input" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                <option value="">— Chọn —</option>
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
              <label className="form-label">URL ảnh đại diện</label>
              <input className="form-input" value={avatarInput} onChange={e => setAvatarInput(e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
            <button className="btn btn-outline" onClick={() => setEditing(false)}>Huỷ</button>
          </div>
        </div>
      )}

      {/* ── Locked seats ── */}
      {lockedSeats.length > 0 && (
        <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 16, padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.875rem', color: 'var(--warning)' }}>
            Ghế đang giữ chờ thanh toán ({lockedSeats.length})
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {lockedSeats.map(seat => (
              <span key={seat.id} style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '0.3rem 0.625rem', fontSize: '0.8rem', fontWeight: 600 }}>
                {seat.row_label}{seat.seat_number}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Order history ── */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Lịch sử đặt vé</h3>
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16 }}>
            Chưa có đơn hàng nào.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {orders.map(order => (
              <div key={order.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.125rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.625rem' }}>
                  <div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>
                      #{order.id?.slice(0, 8)?.toUpperCase()}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {new Date(order.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {orderStatusBadge(order.status)}
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--success)' }}>
                      {Number(order.total_amount).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
                {order.tickets?.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {order.tickets.map(ticket => (
                      <span key={ticket.id} style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 6, padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: 'var(--indigo)' }}>
                        {ticket.seats?.row_label}{ticket.seats?.seat_number}
                        {ticket.seats?.zones?.name && <span style={{ opacity: 0.7 }}> · {ticket.seats.zones.name}</span>}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

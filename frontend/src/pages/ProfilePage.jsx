import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';

import { API_BASE } from '../config';

const API = API_BASE;
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
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [selectedTicket, setSelectedTicket] = useState(null); // {ticket, order}
  const [changingPassword, setChangingPassword] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', newPasswordConfirm: '' });
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

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
      setAvatarPreview(p.avatar_url || '');
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
      // 1. Upload avatar file if a new one was selected
      if (avatarFile) {
        const formData = new FormData();
        formData.append('image', avatarFile);
        const avatarRes = await axios.patch(`${API}/users/me/avatar`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        const newUrl = avatarRes.data.data?.avatar_url || '';
        setAvatarPreview(newUrl);
        localStorage.setItem('avatarUrl', newUrl);
        setAvatarFile(null);
      }
      // 2. Update profile info
      const res = await axios.patch(`${API}/users/me`, { ...form }, { headers: { Authorization: `Bearer ${token}` } });
      setProfile(res.data.data);
      localStorage.setItem('userName', form.full_name);
      setEditing(false);
      setMsg({ type: 'success', text: 'Cập nhật thành công!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Có lỗi khi lưu.' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (pwForm.newPassword !== pwForm.newPasswordConfirm) {
      setPwMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp!' });
      return;
    }
    setPwSaving(true); setPwMsg({ type: '', text: '' });
    try {
      await axios.patch(
        `${API}/users/me/updatePassword`,
        { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword, newPasswordConfirm: pwForm.newPasswordConfirm },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPwSuccess(true);
      setPwForm({ currentPassword: '', newPassword: '', newPasswordConfirm: '' });
    } catch (err) {
      const errData = err.response?.data;
      const message = errData?.errors?.[0]?.message || errData?.message || 'Có lỗi xảy ra.';
      setPwMsg({ type: 'error', text: message });
    } finally {
      setPwSaving(false);
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
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.45rem 0.875rem' }} onClick={() => { setEditing(!editing); setMsg({ type: '', text: '' }); }}>
            {editing ? 'Huỷ' : 'Chỉnh sửa'}
          </button>
          <button
            className="btn btn-ghost"
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.875rem' }}
            onClick={() => { setChangingPassword(!changingPassword); setPwMsg({ type: '', text: '' }); setPwSuccess(false); setPwForm({ currentPassword: '', newPassword: '', newPasswordConfirm: '' }); }}
          >
            {changingPassword ? 'Huỷ' : 'Đổi mật khẩu'}
          </button>
        </div>
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
              <label className="form-label">Ảnh đại diện</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Avatar name={form.full_name} url={avatarPreview} size={52} />
                <input type="file" accept="image/*" className="form-input" style={{ flex: 1 }}
                  onChange={e => {
                    const f = e.target.files[0];
                    if (f) { setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)); }
                  }}
                />
              </div>
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

      {/* ── Change Password ── */}
      {changingPassword && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Đổi mật khẩu</h3>

          {pwSuccess ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.5rem', fontWeight: 700 }}>
                ✓
              </div>
              <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem' }}>Đổi mật khẩu thành công!</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>Mật khẩu của bạn đã được cập nhật.</p>
              <button className="btn btn-outline" style={{ fontSize: '0.85rem' }} onClick={() => { setChangingPassword(false); setPwSuccess(false); }}>Đóng</button>
            </div>
          ) : (
            <>
              {pwMsg.text && (
                <div className={`alert ${pwMsg.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1rem' }}>
                  {pwMsg.text}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', maxWidth: 400 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Nhập mật khẩu hiện tại"
                    value={pwForm.currentPassword}
                    onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                    autoComplete="current-password"
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Mật khẩu mới</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Tối thiểu 6 ký tự"
                    value={pwForm.newPassword}
                    onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                    autoComplete="new-password"
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Nhập lại mật khẩu mới"
                    value={pwForm.newPasswordConfirm}
                    onChange={e => setPwForm(f => ({ ...f, newPasswordConfirm: e.target.value }))}
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
                <button
                  className="btn btn-primary"
                  onClick={handleChangePassword}
                  disabled={pwSaving || !pwForm.currentPassword || !pwForm.newPassword || !pwForm.newPasswordConfirm}
                >
                  {pwSaving ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />Đang lưu...</> : 'Xác nhận đổi mật khẩu'}
                </button>
                <button className="btn btn-outline" onClick={() => { setChangingPassword(false); setPwMsg({ type: '', text: '' }); }}>Huỷ</button>
              </div>
            </>
          )}
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
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {order.tickets.map(ticket => (
                      <button
                        key={ticket.id}
                        onClick={() => setSelectedTicket({ ticket, order })}
                        style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 6, padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: 'var(--indigo)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        🎫 {ticket.seats?.row_label}{ticket.seats?.seat_number}
                        {ticket.seats?.zones?.name && <span style={{ opacity: 0.7 }}>· {ticket.seats.zones.name}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Ticket QR Modal ── */}
      {selectedTicket && (() => {
        const { ticket, order } = selectedTicket;
        const event = ticket.seats?.zones?.events;
        const zone = ticket.seats?.zones;
        const eventDate = event?.start_time ? new Date(event.start_time) : null;
        const dateStr = eventDate ? eventDate.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
        const timeStr = eventDate ? eventDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';

        return (
          <div
            onClick={() => setSelectedTicket(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          >
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 400 }}>
              {/* Top part — gradient event info */}
              <div style={{
                background: 'linear-gradient(160deg, #0f1729 0%, #1a1035 50%, #0c1a2e 100%)',
                borderRadius: '20px 20px 0 0',
                padding: '2rem 1.75rem 1.5rem',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* decorative circles */}
                <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(124,58,237,0.15)', filter: 'blur(30px)' }} />
                <div style={{ position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(6,182,212,0.12)', filter: 'blur(20px)' }} />

                {zone?.name && (
                  <div style={{ display: 'inline-block', background: 'rgba(124,58,237,0.35)', border: '1px solid rgba(124,58,237,0.5)', borderRadius: 6, padding: '0.2rem 0.6rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: '0.75rem', color: '#c4b5fd' }}>
                    {zone.name}
                  </div>
                )}

                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, lineHeight: 1.3, marginBottom: '1.25rem', color: '#fff' }}>
                  {event?.title || 'Sự kiện'}
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)' }}>
                    <span style={{ fontSize: '0.9rem', flexShrink: 0, marginTop: 1 }}>🕐</span>
                    <div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: 1, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 2 }}>Thời gian</div>
                      {timeStr} · {dateStr}
                    </div>
                  </div>
                  {event?.location && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)' }}>
                      <span style={{ fontSize: '0.9rem', flexShrink: 0, marginTop: 1 }}>📍</span>
                      <div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: 1, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 2 }}>Địa điểm</div>
                        {event.location}
                      </div>
                    </div>
                  )}
                </div>

                {/* Seat info row */}
                <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  {zone?.name && (
                    <div>
                      <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 }}>Khu vực</div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{zone.name}</div>
                    </div>
                  )}
                  {ticket.seats?.row_label && (
                    <div>
                      <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 }}>Hàng</div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{ticket.seats.row_label}</div>
                    </div>
                  )}
                  {ticket.seats?.seat_number && (
                    <div>
                      <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 }}>Ghế</div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{ticket.seats.seat_number}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tear line */}
              <div style={{ display: 'flex', alignItems: 'center', position: 'relative', background: '#111827' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg)', flexShrink: 0, marginLeft: -12 }} />
                <div style={{ flex: 1, borderTop: '2px dashed rgba(255,255,255,0.12)', margin: '0 4px' }} />
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg)', flexShrink: 0, marginRight: -12 }} />
              </div>

              {/* Bottom part — QR code */}
              <div style={{
                background: '#111827',
                borderRadius: '0 0 20px 20px',
                padding: '1.5rem 1.75rem 1.75rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.875rem',
              }}>
                <div style={{ background: '#fff', padding: 12, borderRadius: 12 }}>
                  <QRCodeCanvas
                    value={ticket.qr_code || ticket.id}
                    size={160}
                    level="H"
                    bgColor="#ffffff"
                    fgColor="#0f0f0f"
                  />
                </div>

                <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', fontWeight: 700, letterSpacing: 2, color: 'rgba(255,255,255,0.85)' }}>
                  {ticket.qr_code || ticket.id?.slice(0, 16)?.toUpperCase()}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                  <span>☀️</span> Tăng tối đa độ sáng màn hình khi quét
                </div>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, color: '#fff', fontSize: '0.875rem', cursor: 'pointer' }}
              >
                Đóng
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

const API = 'http://localhost:3000/api';

export default function QueuePage() {
  const { id: eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [status, setStatus] = useState('checking'); // checking | joining | in_queue | allowed | error
  const [position, setPosition] = useState(null);
  const [sessionExpireAt, setSessionExpireAt] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(null);

  const token = localStorage.getItem('token');
  const pollRef = useRef(null);
  const countdownRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    axios.get(`${API}/events`)
      .then(res => { const ev = (res.data.data || []).find(e => e.id === eventId); setEvent(ev || null); })
      .catch(() => {});
  }, [eventId]);

  const startCountdown = (expireAt) => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      const secs = Math.max(0, Math.floor((expireAt - Date.now()) / 1000));
      setCountdown(secs);
      if (secs === 0) clearInterval(countdownRef.current);
    }, 1000);
  };

  const stopPolling = () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } };

  const doJoin = async () => {
    if (!token) { navigate('/auth'); return; }
    const res = await axios.post(`${API}/queue/${eventId}/join`, {}, { headers: { Authorization: `Bearer ${token}` } });
    const d = res.data.data;
    if (d.status === 'allowed' || d.status === 'no_queue') {
      stopPolling(); setStatus('allowed');
      setTimeout(() => navigate(`/event/${eventId}`), 800);
    } else {
      setStatus('in_queue'); setPosition(d.position);
    }
    return d;
  };

  const startPolling = () => {
    if (pollRef.current) return;
    pollRef.current = setInterval(async () => {
      try {
        const d = await doJoin();
        if (d?.status === 'allowed' || d?.status === 'no_queue') stopPolling();
      } catch { /* ignore */ }
    }, 5000);
  };

  useEffect(() => {
    if (!token) { navigate('/auth'); return; }
    setStatus('joining');
    doJoin()
      .then(d => { if (d?.status === 'in_queue') startPolling(); })
      .catch(err => { setErrorMsg(err.response?.data?.message || 'Không thể kết nối hàng chờ.'); setStatus('error'); });

    const socket = io('http://localhost:3000', { withCredentials: true });
    socketRef.current = socket;
    socket.on('connect', () => socket.emit('join_queue', localStorage.getItem('userId')));
    socket.on('queue_turn', (data) => {
      stopPolling(); setStatus('allowed');
      if (data.expireAt) startCountdown(data.expireAt);
      setTimeout(() => navigate(`/event/${eventId}`), 1200);
    });

    return () => { socket.disconnect(); stopPolling(); if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [eventId]);

  const handleManualRefresh = async () => { setRefreshing(true); try { await doJoin(); } catch { /* ignore */ } setRefreshing(false); };
  const handleLeave = async () => {
    try { await axios.delete(`${API}/queue/${eventId}/leave`, { headers: { Authorization: `Bearer ${token}` } }); } catch { /* ignore */ }
    stopPolling(); navigate('/');
  };

  const Wrapper = ({ children }) => (
    <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(124,58,237,0.1) 0%, transparent 70%)' }}>
      {children}
    </div>
  );

  if (status === 'checking' || status === 'joining') return (
    <Wrapper>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '3rem 2.5rem', maxWidth: 400, width: '100%', textAlign: 'center' }} className="animate-fadeIn">
        <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, var(--purple), var(--cyan))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.5rem' }}>
          🎫
        </div>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Đang kết nối hàng chờ...</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{event?.title || 'Sự kiện'}</p>
        <div style={{ display: 'flex', justifyContent: 'center' }}><div className="spinner" /></div>
      </div>
    </Wrapper>
  );

  if (status === 'allowed') return (
    <Wrapper>
      <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20, padding: '3rem 2.5rem', maxWidth: 400, width: '100%', textAlign: 'center' }} className="animate-fadeIn">
        <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem' }}>
          ✓
        </div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }} className="text-gradient">Đến Lượt Bạn!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>Đang chuyển vào phòng chọn vé...</p>
        {countdown !== null && (
          <p style={{ color: 'var(--warning)', fontSize: '0.875rem' }}>
            Phiên còn: {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
          </p>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}><div className="spinner" style={{ borderTopColor: 'var(--success)' }} /></div>
      </div>
    </Wrapper>
  );

  if (status === 'error') return (
    <Wrapper>
      <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 20, padding: '3rem 2.5rem', maxWidth: 420, width: '100%', textAlign: 'center' }} className="animate-fadeIn">
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ marginBottom: '0.5rem' }}>Có lỗi xảy ra</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{errorMsg}</p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => { setStatus('joining'); doJoin().then(d => { if (d?.status === 'in_queue') startPolling(); }).catch(() => {}); }}>Thử lại</button>
          <button className="btn btn-outline" onClick={() => navigate('/')}>Về trang chủ</button>
        </div>
      </div>
    </Wrapper>
  );

  /* ── In Queue — Waiting Room ── */
  return (
    <Wrapper>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '2.5rem', maxWidth: 520, width: '100%', textAlign: 'center' }} className="animate-fadeIn">
        {/* Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Phòng Chờ</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{event?.title || eventId}</p>
        </div>

        {/* Position */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(6,182,212,0.08))',
          border: '1px solid rgba(124,58,237,0.25)', borderRadius: 16,
          padding: '2rem', marginBottom: '1.5rem',
        }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.5rem' }}>
            VỊ TRÍ HÀNG CHỜ
          </div>
          <div style={{ fontSize: '5.5rem', fontWeight: 900, lineHeight: 1, background: 'linear-gradient(135deg, var(--purple-light), var(--cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {position}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', animation: 'pulse 1.5s infinite' }} />
            Tự động kiểm tra mỗi 5 giây
          </div>
        </div>

        {/* Info */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 10, padding: '1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '0.4rem' }}>
            Bạn đang ở vị trí thứ <strong style={{ color: 'var(--text)' }}>{position}</strong> trong hàng đợi. Vui lòng không tải lại trang.
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Hệ thống sẽ tự động chuyển bạn vào phòng mua vé khi đến lượt.
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={handleManualRefresh} disabled={refreshing} style={{ minWidth: 160 }}>
            {refreshing
              ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />Đang kiểm tra...</>
              : 'Kiểm tra ngay'}
          </button>
          <button className="btn btn-outline" onClick={handleLeave}>Rời hàng chờ</button>
        </div>

        {/* Pulse dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: '2rem' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--purple)', animation: `pulse ${1.2 + i * 0.3}s ease-in-out infinite`, opacity: 0.4 + i * 0.3 }} />
          ))}
        </div>
      </div>
    </Wrapper>
  );
}

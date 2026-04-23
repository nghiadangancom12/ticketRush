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

  // ─── Fetch basic event info (public) ──────────────────────────────────────
  useEffect(() => {
    axios.get(`${API}/events`)
      .then(res => {
        const ev = (res.data.data || []).find(e => e.id === eventId);
        setEvent(ev || null);
      })
      .catch(() => {});
  }, [eventId]);

  // ─── Session countdown timer ───────────────────────────────────────────────
  const startCountdown = (expireAt) => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      const secs = Math.max(0, Math.floor((expireAt - Date.now()) / 1000));
      setCountdown(secs);
      if (secs === 0) clearInterval(countdownRef.current);
    }, 1000);
  };

  // ─── Poll queue status every 5 seconds ────────────────────────────────────
  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  const doJoin = async () => {
    if (!token) { navigate('/auth'); return; }
    try {
      const res = await axios.post(`${API}/queue/${eventId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = res.data.data;
      if (d.status === 'allowed' || d.status === 'no_queue') {
        stopPolling();
        setStatus('allowed');
        // Navigate into booking immediately
        setTimeout(() => navigate(`/event/${eventId}`), 800);
      } else {
        setStatus('in_queue');
        setPosition(d.position);
      }
      return d;
    } catch (err) {
      throw err;
    }
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

  // ─── Initial join on mount ─────────────────────────────────────────────────
  useEffect(() => {
    if (!token) { navigate('/auth'); return; }

    setStatus('joining');
    doJoin()
      .then(d => {
        if (d?.status === 'in_queue') startPolling();
      })
      .catch(err => {
        setErrorMsg(err.response?.data?.message || 'Không thể kết nối hàng chờ.');
        setStatus('error');
      });

    // Socket: listen for YOUR_TURN event pushed by QueueWorker
    const socket = io('http://localhost:3000', { withCredentials: true });
    socketRef.current = socket;
    socket.on('connect', () => {
      socket.emit('join_queue', localStorage.getItem('userId'));
    });
    socket.on('queue_turn', (data) => {
      stopPolling();
      setStatus('allowed');
      if (data.expireAt) startCountdown(data.expireAt);
      setTimeout(() => navigate(`/event/${eventId}`), 1200);
    });

    return () => {
      socket.disconnect();
      stopPolling();
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [eventId]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try { await doJoin(); } catch { /* ignore */ }
    setRefreshing(false);
  };

  const handleLeave = async () => {
    try {
      await axios.delete(`${API}/queue/${eventId}/leave`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch { /* ignore */ }
    stopPolling();
    navigate('/');
  };

  // ─── Render: Checking / Joining ────────────────────────────────────────────
  if (status === 'checking' || status === 'joining') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <div className="glass-panel text-center" style={{ maxWidth: 400, width: '100%', padding: '3rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎫</div>
          <h2 className="mb-2">Đang kết nối hàng chờ...</h2>
          <p className="text-secondary">{event?.title}</p>
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 40, height: 40, border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        </div>
      </div>
    );
  }

  // ─── Render: Allowed → transitioning ──────────────────────────────────────
  if (status === 'allowed') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <div className="glass-panel text-center" style={{ maxWidth: 400, width: '100%', padding: '3rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
          <h2 className="text-gradient mb-2">Đến Lượt Bạn!</h2>
          <p className="text-secondary mb-4">Đang chuyển vào phòng mua vé...</p>
          {countdown !== null && (
            <p style={{ color: 'var(--warning)', fontSize: '0.9rem' }}>
              ⏱ Phiên giao dịch còn: {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ─── Render: Error ─────────────────────────────────────────────────────────
  if (status === 'error') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <div className="glass-panel text-center" style={{ maxWidth: 420, width: '100%', padding: '3rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
          <h2 className="mb-2">Có lỗi xảy ra</h2>
          <p className="text-secondary mb-4">{errorMsg}</p>
          <div className="flex gap-3 justify-center">
            <button className="btn btn-primary" onClick={() => { setStatus('joining'); doJoin().then(d => { if (d?.status === 'in_queue') startPolling(); }).catch(() => {}); }}>
              Thử lại
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/')}>Về Trang Chủ</button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render: In Queue — Waiting Room ──────────────────────────────────────
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <div className="glass-panel text-center" style={{ maxWidth: 500, width: '100%', padding: '3rem 2rem' }}>
        {/* Animated icon */}
        <div style={{ fontSize: '4rem', marginBottom: '1rem', display: 'inline-block', animation: 'pulse 2s infinite' }}>🎫</div>

        <h2 className="text-gradient mb-1" style={{ fontSize: '1.8rem' }}>Phòng Chờ</h2>
        <p className="text-secondary mb-6" style={{ fontSize: '0.9rem' }}>{event?.title || eventId}</p>

        {/* Position badge */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(236,72,153,0.1))',
          border: '1px solid rgba(99,102,241,0.35)',
          borderRadius: '16px', padding: '2rem', marginBottom: '2rem'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>VỊ TRÍ HÀNG CHỜ</div>
          <div style={{ fontSize: '5rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>#{position}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
            🔄 Tự động kiểm tra mỗi 5 giây
          </div>
        </div>

        {/* Info box */}
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '1rem', marginBottom: '1.75rem', textAlign: 'left', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          <div>💡 <strong>Giữ nguyên trang này</strong> — hệ thống sẽ tự động đưa bạn vào phòng mua vé khi đến lượt.</div>
          <div style={{ marginTop: '0.4rem' }}>🔔 Thông báo cũng được gửi qua WebSocket real-time.</div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center" style={{ flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={handleManualRefresh} disabled={refreshing} style={{ minWidth: 160 }}>
            {refreshing ? '⏳ Đang kiểm tra...' : '🔄 Kiểm Tra Ngay'}
          </button>
          <button className="btn btn-outline" onClick={handleLeave} style={{ minWidth: 130 }}>
            ❌ Rời Hàng Chờ
          </button>
        </div>

        {/* Progress dots */}
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '6px' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--primary)', opacity: 0.3 + i * 0.35,
              animation: `pulse ${1 + i * 0.3}s infinite`
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:3000/api';
const token = () => localStorage.getItem('token');
const authHeader = () => ({ Authorization: `Bearer ${token()}` });

const ZONE_COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

/* ── Tiny SVG donut chart ── */
function DonutChart({ data, size = 160 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div style={{ width: size, height: size, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />;
  const r = 40; const cx = size / 2; const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let cumPct = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {data.map((seg, i) => {
        const pct = seg.value / total;
        const dash = pct * circumference;
        const gap = circumference - dash;
        const rotation = cumPct * 360 - 90;
        cumPct += pct;
        return (
          <circle key={i} r={r} cx={cx} cy={cy} fill="transparent"
            stroke={seg.color} strokeWidth={22}
            strokeDasharray={`${dash} ${gap}`}
            transform={`rotate(${rotation} ${cx} ${cy})`}
          />
        );
      })}
    </svg>
  );
}

/* ── Bar chart ── */
function BarChart({ items, max, unit = 'vé' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {items.map(item => (
        <div key={item.label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '0.3rem' }}>
            <span>{item.label}</span>
            <span style={{ color: 'var(--text-secondary)' }}>{item.value.toLocaleString('vi-VN')} {unit}</span>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3 }}>
            <div style={{ height: '100%', width: `${Math.min(100, (item.value / max) * 100)}%`, background: item.color, borderRadius: 3, transition: 'width 0.6s ease' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Nav icon helpers ── */
const icons = {
  overview: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
  events: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  analytics: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
  tickets: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" /></svg>,
  users: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
};

/* ─── MODULE-LEVEL: CategoriesView (stable ref → no focus loss) ─── */
function CategoriesView({ allCategories, newCatForm, setNewCatForm, addingCat, handleAddCategory, handleDeleteCategory }) {
  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Quản lý Thể loại</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Tạo và quản lý danh mục sự kiện</p>
      </div>

      {/* ── Add form ── */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Thêm thể loại mới</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '0.875rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Tên thể loại *</label>
            <input type="text" className="form-input" placeholder="VD: Âm nhạc"
              value={newCatForm.name}
              onChange={e => setNewCatForm({ ...newCatForm, name: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Mô tả</label>
            <input type="text" className="form-input" placeholder="VD: Các buổi hòa nhạc, liveshow..."
              value={newCatForm.description}
              onChange={e => setNewCatForm({ ...newCatForm, description: e.target.value })}
            />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" style={{ fontSize: '0.85rem', alignSelf: 'flex-end' }}
            onClick={handleAddCategory} disabled={addingCat || !newCatForm.name.trim()}>
            {addingCat ? 'Đang tạo...' : '+ Thêm thể loại'}
          </button>
        </div>
      </div>

      {/* ── Categories grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '1rem' }}>
        {allCategories.length === 0
          ? <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: '3rem', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)' }}>Chưa có thể loại nào.</div>
          : allCategories.map(cat => (
            <div key={cat.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              {cat.image_url
                ? <img src={cat.image_url} alt={cat.name} style={{ width: '100%', height: 120, objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: 120, background: 'linear-gradient(135deg,rgba(124,58,237,.3),rgba(6,182,212,.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>🏷</div>
              }
              <div style={{ padding: '0.875rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{cat.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', minHeight: '1.1em' }}>{cat.description || '—'}</div>
                <button className="btn" style={{ fontSize: '0.72rem', padding: '0.3rem 0.625rem', background: 'rgba(239,68,68,0.12)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.3)', width: '100%' }}
                  onClick={() => handleDeleteCategory(cat.id)}>Xóa thể loại</button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

/* ─── MODULE-LEVEL: CreateEventModal (stable ref → no focus loss) ─── */
function getRowLabel(i) {
  // 0→A, 1→B, …, 25→Z, 26→AA, 27→AB, …
  let label = '';
  let n = i;
  do {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return label;
}

function CreateEventModal({ newEvent, setNewEvent, allCategories, zones, setZones, activeZoneId, setActiveZoneId, grid, setGrid, maxRows, maxCols, onResizeGrid, creating, createMsg, onSubmit, onClose, updateZoneInfo }) {
  const [seatEraseMode, setSeatEraseMode] = useState(false);
  const [seatDrag, setSeatDrag] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [rowInput, setRowInput] = useState(String(maxRows));
  const [colInput, setColInput] = useState(String(maxCols));

  // Refs to avoid stale closures in mouse event handlers
  const isDraggingRef = useRef(false);
  const dragRef = useRef(null);
  const eraseRef = useRef(false);
  const activeZoneIdRef = useRef(activeZoneId);
  useEffect(() => { activeZoneIdRef.current = activeZoneId; }, [activeZoneId]);
  useEffect(() => { eraseRef.current = seatEraseMode; }, [seatEraseMode]);

  const handleMouseDown = (r, c) => {
    isDraggingRef.current = true;
    const d = { r0: r, c0: c, r1: r, c1: c };
    dragRef.current = d;
    setSeatDrag({ ...d });
  };
  const handleMouseEnter = (r, c) => {
    if (!isDraggingRef.current) return;
    const d = { ...dragRef.current, r1: r, c1: c };
    dragRef.current = d;
    setSeatDrag({ ...d });
  };
  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const d = dragRef.current;
    dragRef.current = null;
    setSeatDrag(null);
    if (!d) return;
    setGrid(prev => {
      const g = prev.map(row => [...row]);
      const minR = Math.min(d.r0, d.r1), maxR = Math.max(d.r0, d.r1);
      const minC = Math.min(d.c0, d.c1), maxC = Math.max(d.c0, d.c1);
      for (let r = minR; r <= maxR; r++)
        for (let c = minC; c <= maxC; c++)
          g[r][c] = eraseRef.current ? null : activeZoneIdRef.current;
      return g;
    });
  };

  const clearGrid = () => setGrid(Array.from({ length: maxRows }, () => Array(maxCols).fill(null)));

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem', overflowY: 'auto' }}>
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 900, padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Tạo Sự Kiện Mới</h2>
          <button className="icon-btn" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {createMsg.text && (
          <div className={`alert ${createMsg.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1rem' }}>{createMsg.text}</div>
        )}

        <form onSubmit={e => onSubmit(e, imageFile)}>
          {/* Basic info */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}><label className="form-label">Tên sự kiện *</label><input type="text" className="form-input" required value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} /></div>
            <div className="form-group" style={{ margin: 0 }}><label className="form-label">Thời gian *</label><input type="datetime-local" className="form-input" required value={newEvent.start_time} onChange={e => setNewEvent({ ...newEvent, start_time: e.target.value })} /></div>
            <div className="form-group" style={{ margin: 0 }}><label className="form-label">Địa điểm *</label><input type="text" className="form-input" required value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} /></div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Thể loại</label>
              <select className="form-input" value={newEvent.category_id || ''} onChange={e => setNewEvent({ ...newEvent, category_id: e.target.value || '' })}>
                <option value="">— Không chọn —</option>
                {allCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}><label className="form-label">Mô tả</label><input type="text" className="form-input" value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} /></div>
          </div>

          {/* Event image upload */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Ảnh sự kiện (tuỳ chọn)</h4>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', cursor: 'pointer' }}>
              {imagePreview
                ? <img src={imagePreview} alt="preview" style={{ width: 160, height: 90, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                : <div style={{ width: 160, height: 90, background: 'rgba(255,255,255,0.04)', border: '1px dashed var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', gap: '0.3rem' }}>🖼 Chưa chọn</div>
              }
              <span className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.4rem 0.875rem', pointerEvents: 'none' }}>Chọn ảnh</span>
              <input type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }}
              />
            </label>
          </div>

          {/* Zone definition */}
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>1. Định nghĩa phân khu</h4>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {zones.map((z, idx) => (
              <div key={z.id} style={{ background: activeZoneId === z.id ? `${ZONE_COLORS[idx % ZONE_COLORS.length]}18` : 'rgba(255,255,255,0.04)', border: `2px solid ${activeZoneId === z.id ? ZONE_COLORS[idx % ZONE_COLORS.length] : 'transparent'}`, borderRadius: 10, padding: '0.875rem', flex: '1 1 160px', cursor: 'pointer' }} onClick={() => setActiveZoneId(z.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: ZONE_COLORS[idx % ZONE_COLORS.length] }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Zone {idx + 1}</span>
                  {activeZoneId === z.id && <span className="badge badge-purple" style={{ fontSize: '0.6rem', marginLeft: 'auto' }}>Đang chọn</span>}
                </div>
                <input type="text" className="form-input" value={z.name} onChange={e => updateZoneInfo(idx, 'name', e.target.value)} placeholder="Tên khu" style={{ fontSize: '0.8rem', marginBottom: '0.4rem' }} onClick={e => e.stopPropagation()} />
                <input type="number" className="form-input" value={z.price} onChange={e => updateZoneInfo(idx, 'price', e.target.value)} placeholder="Giá (VNĐ)" style={{ fontSize: '0.8rem' }} onClick={e => e.stopPropagation()} />
              </div>
            ))}
            <button type="button" className="btn btn-outline" style={{ alignSelf: 'center', fontSize: '0.8rem' }} onClick={() => setZones([...zones, { id: Date.now(), name: 'Zone Mới', price: '0' }])}>+ Thêm khu</button>
          </div>

          {/* Drag seat grid */}
          {/* Grid size controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '0.75rem', padding: '0.625rem 0.875rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 8 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' }}>Kích thước bảng:</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Hàng</span>
              <input
                type="number"
                value={rowInput}
                onChange={e => {
                  setRowInput(e.target.value);
                  const n = parseInt(e.target.value, 10);
                  if (!isNaN(n) && n > 0) onResizeGrid(n, maxCols);
                }}
                onBlur={() => setRowInput(String(maxRows))}
                style={{ width: 80, textAlign: 'center' }}
                className="form-input"
              />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Cột</span>
              <input
                type="number"
                value={colInput}
                onChange={e => {
                  setColInput(e.target.value);
                  const n = parseInt(e.target.value, 10);
                  if (!isNaN(n) && n > 0) onResizeGrid(maxRows, n);
                }}
                onBlur={() => setColInput(String(maxCols))}
                style={{ width: 80, textAlign: 'center' }}
                className="form-input"
              />
            </label>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
              {maxRows} × {maxCols} = tối đa {maxRows * maxCols} ghế
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600 }}>2. Vẽ sơ đồ khán đài</h4>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button"
                style={{ fontSize: '0.72rem', padding: '0.25rem 0.625rem', borderRadius: 6, border: `1px solid ${seatEraseMode ? 'rgba(239,68,68,0.5)' : 'var(--border)'}`, background: seatEraseMode ? 'rgba(239,68,68,0.12)' : 'transparent', color: seatEraseMode ? 'var(--danger)' : 'var(--text-secondary)', cursor: 'pointer' }}
                onClick={() => setSeatEraseMode(prev => !prev)}>
                {seatEraseMode ? '🧹 Chế độ xóa' : '✏️ Chế độ vẽ'}
              </button>
              <button type="button" className="btn btn-outline" style={{ fontSize: '0.72rem', padding: '0.25rem 0.625rem' }} onClick={clearGrid}>Xóa tất cả</button>
            </div>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Kéo để tô vùng ghế (m×n). Nhả chuột để xác nhận. Chuyển sang chế độ xóa để tẩy.
          </p>
          <div
            style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '55vh', padding: '1rem', background: 'rgba(0,0,0,0.4)', borderRadius: 8, marginBottom: '1rem', userSelect: 'none', cursor: 'crosshair' }}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {Array.from({ length: maxRows }, (_, rIndex) => (
              <div key={rIndex} style={{ display: 'flex', gap: 3, marginBottom: 3, alignItems: 'center' }}>
                <span style={{ width: 24, fontSize: '9px', color: 'var(--text-muted)', textAlign: 'right', marginRight: 3, flexShrink: 0 }}>{getRowLabel(rIndex)}</span>
                {grid[rIndex].map((cellVal, cIndex) => {
                  const inSel = seatDrag &&
                    rIndex >= Math.min(seatDrag.r0, seatDrag.r1) && rIndex <= Math.max(seatDrag.r0, seatDrag.r1) &&
                    cIndex >= Math.min(seatDrag.c0, seatDrag.c1) && cIndex <= Math.max(seatDrag.c0, seatDrag.c1);
                  const zIdx = zones.findIndex(z => z.id === cellVal);
                  const activeZoneIdx = zones.findIndex(z => z.id === activeZoneId);
                  const bg = inSel
                    ? (seatEraseMode ? 'rgba(239,68,68,0.65)' : `${ZONE_COLORS[activeZoneIdx % ZONE_COLORS.length]}cc`)
                    : cellVal ? (ZONE_COLORS[zIdx % ZONE_COLORS.length] || '#6366f1') : '#1e1e30';
                  return (
                    <div
                      key={cIndex}
                      onMouseDown={() => handleMouseDown(rIndex, cIndex)}
                      onMouseEnter={() => handleMouseEnter(rIndex, cIndex)}
                      style={{ width: 20, height: 20, background: bg, borderRadius: 3, flexShrink: 0, border: `1px solid ${inSel ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.04)'}` }}
                      title={cellVal ? zones.find(z => z.id === cellVal)?.name : 'Trống'}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {zones.map((z, idx) => (
              <div key={z.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: ZONE_COLORS[idx % ZONE_COLORS.length] }} />
                {z.name} — {Number(z.price).toLocaleString('vi-VN')}đ
              </div>
            ))}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: '0.95rem' }} disabled={creating}>
            {creating ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />Đang lưu...</> : 'Tạo Sự Kiện'}
          </button>
        </form>
      </div>
    </div>
  );
}

function EventStatsModal({ eventTitle, stats, loading, error, onClose }) {
  const ticketData = stats ? [
    { label: 'Đã bán', value: stats.ticketsSold, color: '#7c3aed' },
    { label: 'Chưa bán', value: stats.ticketsUnsold, color: 'rgba(255,255,255,0.12)' },
  ] : [];

  const genderData = stats ? [
    { label: 'Nam', value: stats.audienceDemographics?.gender?.MALE ?? 0, color: '#6366f1' },
    { label: 'Nữ', value: stats.audienceDemographics?.gender?.FEMALE ?? 0, color: '#ec4899' },
  ].filter(g => g.value > 0) : [];

  const ageRanges = stats?.audienceDemographics?.ageRanges ?? {};
  const ageItems = Object.entries(ageRanges).map(([label, value]) => ({ label, value, color: '#06b6d4' }));
  const hasAgeData = ageItems.some(item => item.value > 0);
  const ageMax = Math.max(...ageItems.map(item => item.value), 1);

  const totalTickets = stats ? stats.ticketsSold + stats.ticketsUnsold : 0;
  const soldPct = totalTickets > 0 ? Math.round((stats.ticketsSold / totalTickets) * 100) : 0;

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem', position: 'relative' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.25rem' }}>Thống kê sự kiện</h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 500 }}>{eventTitle}</p>
          </div>
          <button className="icon-btn" onClick={onClose} style={{ flexShrink: 0, marginLeft: '1rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <div className="spinner" />
          </div>
        )}

        {!loading && error && (
          <div className="alert alert-error">{error}</div>
        )}

        {!loading && !error && stats && (
          <>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.375rem' }}>DOANH THU</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>
                {Number(stats.revenue).toLocaleString('vi-VN')}đ
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {stats.ticketsSold} vé đã bán · Tỷ lệ {soldPct}%
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>Tình trạng vé</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <DonutChart data={ticketData} size={120} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {ticketData.map(d => (
                      <div key={d.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                          {d.label}
                        </div>
                        <span style={{ fontWeight: 700 }}>{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>Giới tính</h4>
                {genderData.length > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <DonutChart data={genderData} size={120} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {genderData.map(d => (
                        <div key={d.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                            {d.label}
                          </div>
                          <span style={{ fontWeight: 700 }}>{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Chưa có dữ liệu</p>
                )}
              </div>
            </div>

            {hasAgeData && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>Phân bố độ tuổi</h4>
                <BarChart items={ageItems} max={ageMax} unit="người" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('overview');
  const [data, setData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [events, setEvents] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [categoryAnalytics, setCategoryAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Events view state
  const [selectedEventId, setSelectedEventId] = useState('');
  const [queueToggles, setQueueToggles] = useState({});
  const [queueLoading, setQueueLoading] = useState('');
  const [imageUploading, setImageUploading] = useState('');
  const [deletingEventId, setDeletingEventId] = useState('');

  // Event stats modal state
  const [statsModalEventId, setStatsModalEventId] = useState(null);
  const [eventStats, setEventStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState('');

  // Create event form
  const [showCreate, setShowCreate] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', location: '', start_time: '', category_id: '' });
  const [allCategories, setAllCategories] = useState([]);
  const [newCatForm, setNewCatForm] = useState({ name: '', description: '', imageFile: null, imagePreview: '' });
  const [addingCat, setAddingCat] = useState(false);
  const [zones, setZones] = useState([{ id: 1, name: 'VIP', price: '2500000' }, { id: 2, name: 'GA A', price: '1500000' }, { id: 3, name: 'GA B', price: '900000' }]);
  const [activeZoneId, setActiveZoneId] = useState(1);
  const [maxRows, setMaxRows] = useState(15);
  const [maxCols, setMaxCols] = useState(30);
  const [grid, setGrid] = useState(Array.from({ length: 15 }, () => Array(30).fill(null)));
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!token()) { navigate('/auth'); return; }
    const fetchAll = async () => {
      try {
        const [dashRes, eventsRes, catsRes] = await Promise.all([
          axios.get(`${API}/admin/dashboard`, { headers: authHeader() }),
          axios.get(`${API}/events`),
          axios.get(`${API}/categories`),
        ]);
        setData(dashRes.data.data);
        setAllCategories(catsRes.data.data?.data || catsRes.data.data || []);
        const evList = eventsRes.data.data || [];
        setEvents(evList);
        if (evList.length > 0) setSelectedEventId(evList[0].id);
      } catch (err) {
        if (err.response?.status === 403) setErrorMsg('Bạn không có quyền truy cập trang này.');
        else setErrorMsg('Lỗi tải dữ liệu. Vui lòng đăng nhập lại.');
      } finally { setLoading(false); }
    };
    fetchAll();
  }, [navigate]);

  const fetchAnalytics = async () => {
    if (analytics) return;
    try {
      const res = await axios.get(`${API}/admin/customer-analytics`, { headers: authHeader() });
      setAnalytics(res.data.data);
    } catch { setAnalytics({ genderDemographics: [], topSpenders: [] }); }
  };

  const fetchCategoryAnalytics = async () => {
    if (categoryAnalytics) return;
    try {
      const res = await axios.get(`${API}/admin/category-analytics?groupBy=both`, { headers: authHeader() });
      setCategoryAnalytics(res.data.data || []);
    } catch { setCategoryAnalytics([]); }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await axios.get(`${API}/orders?limit=50`, { headers: authHeader() });
      setOrders(res.data.data?.data || res.data.data?.orders || []);
    } catch { setOrders([]); } finally { setOrdersLoading(false); }
  };

  const fetchOrderDetail = async (orderId) => {
    setOrderDetailLoading(true);
    try {
      const res = await axios.get(`${API}/orders/${orderId}`, { headers: authHeader() });
      setSelectedOrder(res.data.data);
    } catch { setSelectedOrder(null); } finally { setOrderDetailLoading(false); }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await axios.get(`${API}/users`, { headers: authHeader() });
      setUsers(res.data.data?.data || res.data.data?.users || []);
    } catch { setUsers([]); } finally { setUsersLoading(false); }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Xác nhận xóa sự kiện này? Hành động không thể hoàn tác.')) return;
    setDeletingEventId(eventId);
    try {
      await axios.delete(`${API}/events/${eventId}`, { headers: authHeader() });
      const evRes = await axios.get(`${API}/events`);
      const evList = evRes.data.data || [];
      setEvents(evList);
      if (selectedEventId === eventId) setSelectedEventId(evList[0]?.id || '');
    } catch (err) { alert(err.response?.data?.message || 'Không thể xóa sự kiện.'); }
    finally { setDeletingEventId(''); }
  };

  const handleImageUpload = async (eventId, file, options = {}) => {
    const { silent = false } = options;
    if (!file) return;
    setImageUploading(eventId);
    try {
      const formData = new FormData();
      formData.append('image', file);
      await axios.patch(`${API}/events/${eventId}/image`, formData, {
        headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' },
      });
      const evRes = await axios.get(`${API}/events`);
      setEvents(evRes.data.data || []);
      if (!silent) alert('Upload ảnh thành công!');
      return true;
    } catch (err) {
      if (!silent) alert(err.response?.data?.message || 'Lỗi upload ảnh.');
      return false;
    }
    finally { setImageUploading(''); }
  };

  const handleGrantAdmin = async (userId) => {
    try {
      await axios.patch(`${API}/users/${userId}/grant-admin`, {}, { headers: authHeader() });
      fetchUsers();
    } catch (err) { alert(err.response?.data?.message || 'Lỗi.'); }
  };

  const handleRevokeAdmin = async (userId) => {
    try {
      await axios.patch(`${API}/users/${userId}/revoke-admin`, {}, { headers: authHeader() });
      fetchUsers();
    } catch (err) { alert(err.response?.data?.message || 'Lỗi.'); }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Xác nhận xóa user này?')) return;
    try {
      await axios.delete(`${API}/users/${userId}`, { headers: authHeader() });
      fetchUsers();
    } catch (err) { alert(err.response?.data?.message || 'Lỗi.'); }
  };

  useEffect(() => { if (activeView === 'analytics') { fetchAnalytics(); fetchCategoryAnalytics(); } }, [activeView]);
  useEffect(() => { if (activeView === 'tickets') fetchOrders(); }, [activeView]);
  useEffect(() => { if (activeView === 'users') fetchUsers(); }, [activeView]);

  const handleQueueToggle = async (eventId, turnOn) => {
    setQueueLoading(eventId);
    try {
      await axios.post(`${API}/queue/admin/${eventId}/toggle`, { isActive: turnOn }, { headers: authHeader() });
      setQueueToggles(prev => ({ ...prev, [eventId]: turnOn }));
    } catch (err) { alert(err.response?.data?.message || 'Không thể thay đổi trạng thái hàng chờ.'); }
    finally { setQueueLoading(''); }
  };

  const openEventStats = async (eventId) => {
    setStatsModalEventId(eventId);
    setEventStats(null);
    setStatsError('');
    setStatsLoading(true);
    try {
      const res = await axios.get(`${API}/admin/event-analytics?eventId=${eventId}`, { headers: authHeader() });
      setEventStats(res.data.data);
    } catch (err) {
      setStatsError(err.response?.data?.message || 'Không thể tải thống kê. Vui lòng thử lại.');
    } finally {
      setStatsLoading(false);
    }
  };

  const closeEventStats = () => {
    setStatsModalEventId(null);
    setEventStats(null);
    setStatsError('');
  };

  const updateZoneInfo = (idx, field, val) => {
    const z = [...zones]; z[idx][field] = val; setZones(z);
  };

  // Resize grid while preserving existing seat assignments
  const handleResizeGrid = (newRows, newCols) => {
    const r = newRows || 0;
    const c = newCols || 0;
    setGrid(prev =>
      Array.from({ length: r }, (_, ri) =>
        Array.from({ length: c }, (_, ci) => prev[ri]?.[ci] ?? null)
      )
    );
    setMaxRows(r);
    setMaxCols(c);
  };

  const handleAddCategory = async () => {
    if (!newCatForm.name.trim()) return;
    setAddingCat(true);
    try {
      const res = await axios.post(`${API}/categories`, {
        name: newCatForm.name.trim(),
        description: newCatForm.description.trim() || undefined,
      }, { headers: authHeader() });
      let created = res.data.data;
      if (newCatForm.imageFile) {
        const fd = new FormData();
        fd.append('image', newCatForm.imageFile);
        try {
          const imgRes = await axios.patch(`${API}/categories/${created.id}/image`, fd, {
            headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' },
          });
          created = imgRes.data.data || created;
        } catch { /* image upload non-critical */ }
      }
      setAllCategories(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCatForm({ name: '', description: '', imageFile: null, imagePreview: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi tạo thể loại');
    } finally { setAddingCat(false); }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Xóa thể loại này?')) return;
    try {
      await axios.delete(`${API}/categories/${id}`, { headers: authHeader() });
      setAllCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) { alert(err.response?.data?.message || 'Lỗi xóa thể loại'); }
  };

  const handleCreateEvent = async (e, imageFile) => {
    e.preventDefault(); setCreating(true); setCreateMsg({ type: '', text: '' });
    try {
      const isoStartTime = new Date(newEvent.start_time).toISOString();
      const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const fz = zones.map(z => ({ ...z, seats: [] }));
      for (let r = 0; r < maxRows; r++) for (let c = 0; c < maxCols; c++) {
        const zId = grid[r][c];
        if (zId) { const zt = fz.find(z => z.id === zId); if (zt) zt.seats.push({ row_label: getRowLabel(r), seat_number: c + 1 }); }
      }
      const validZones = fz.filter(z => z.seats.length > 0);
      if (validZones.length === 0) { setCreateMsg({ type: 'error', text: 'Bạn chưa vẽ ghế nào trên lưới!' }); return; }
      const res = await axios.post(`${API}/events`, { title: newEvent.title, description: newEvent.description, location: newEvent.location, start_time: isoStartTime, category_id: newEvent.category_id || undefined, zones: validZones }, { headers: authHeader() });
      const createdEventId = res.data?.data?.eventId || res.data?.data?.id;

      if (imageFile && createdEventId) {
        // Dùng chung flow upload với nút "Thay ảnh" để tránh lệch logic.
        await handleImageUpload(createdEventId, imageFile, { silent: true });
      }

      setCreateMsg({ type: 'success', text: res.data.message || 'Tạo sự kiện thành công!' });
      setNewEvent({ title: '', description: '', location: '', start_time: '', category_id: '' });
      setMaxRows(15);
      setMaxCols(30);
      setGrid(Array.from({ length: 15 }, () => Array(30).fill(null)));
      setShowCreate(false);
      const evRes = await axios.get(`${API}/events`);
      setEvents(evRes.data.data || []);
    } catch (err) { setCreateMsg({ type: 'error', text: err.response?.data?.message || 'Có lỗi khi tạo sự kiện.' }); }
    finally { setCreating(false); }
  };

  const userName = localStorage.getItem('userName') || 'Admin';
  const userInitials = userName.split(' ').map(w => w[0]).filter(Boolean).slice(-2).join('').toUpperCase();

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="spinner" />
    </div>
  );
  if (errorMsg) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '2rem' }}>
      <div style={{ textAlign: 'center', background: 'var(--bg-card)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 16, padding: '3rem 2rem', maxWidth: 400 }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔒</div>
        <p style={{ color: 'var(--danger)', marginBottom: '1.5rem' }}>{errorMsg}</p>
        <button className="btn btn-primary" onClick={() => navigate('/auth')}>Đăng nhập lại</button>
      </div>
    </div>
  );

  /* ─── OVERVIEW VIEW ─── */
  const OverviewView = () => (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Tổng quan</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Thống kê hoạt động của hệ thống</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Doanh thu', value: `${Number(data?.revenue || 0).toLocaleString('vi-VN')}đ`, color: 'var(--success)', icon: '💰' },
          { label: 'Khán giả', value: (data?.usersTotal || 0).toLocaleString(), color: 'var(--cyan)', icon: '👥' },
          { label: 'Tỷ lệ bán', value: `${data?.seats?.total ? ((data.seats.sold / data.seats.total) * 100).toFixed(1) : 0}%`, color: 'var(--purple-light)', icon: '🎫' },
          { label: 'Vé đã bán', value: `${(data?.seats?.sold || 0).toLocaleString()} / ${(data?.seats?.total || 0).toLocaleString()}`, color: 'var(--warning)', icon: '🎟' },
        ].map(stat => (
          <div key={stat.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.625rem' }}>{stat.icon}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: 500 }}>{stat.label.toUpperCase()}</div>
            <div style={{ fontSize: '1.375rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Trạng thái ghế ngồi</h3>
          {[
            { label: 'Còn trống', count: data?.seats?.available || 0, color: 'var(--success)' },
            { label: 'Đang giữ', count: data?.seats?.locked || 0, color: 'var(--warning)' },
            { label: 'Đã bán', count: data?.seats?.sold || 0, color: 'var(--purple-light)' },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: row.color }} />
                {row.label}
              </div>
              <span style={{ fontWeight: 700, color: row.color }}>{row.count.toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Sự kiện ({events.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {events.slice(0, 4).map(ev => (
              <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{ev.title}</span>
                <span className={`badge ${ev.status === 'PUBLISHED' ? 'badge-green' : ev.status === 'DRAFT' ? 'badge-yellow' : 'badge-gray'}`} style={{ flexShrink: 0, marginLeft: '0.5rem' }}>
                  {ev.status === 'PUBLISHED' ? 'Đang bán' : ev.status === 'DRAFT' ? 'Bản nháp' : 'Đã đóng'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  /* ─── EVENTS VIEW ─── */
  const EventsView = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.25rem', height: 'calc(100vh - 130px)' }}>
      {/* Left: event list */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Sự kiện của tôi</h3>
          <button className="btn btn-primary" style={{ fontSize: '0.72rem', padding: '0.3rem 0.625rem' }} onClick={() => setShowCreate(true)}>+ Thêm</button>
        </div>
        <div style={{ padding: '0.5rem', flex: 1, overflowY: 'auto' }}>
          {events.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem', padding: '2rem' }}>Chưa có sự kiện nào.</p>
          ) : events.map(ev => (
            <div
              key={ev.id}
              onClick={() => setSelectedEventId(ev.id)}
              style={{
                padding: '0.875rem', borderRadius: 8, cursor: 'pointer', marginBottom: '0.3rem',
                background: selectedEventId === ev.id ? 'rgba(124,58,237,0.12)' : 'transparent',
                border: `1px solid ${selectedEventId === ev.id ? 'rgba(124,58,237,0.3)' : 'transparent'}`,
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span className={`badge ${ev.status === 'PUBLISHED' ? 'badge-green' : ev.status === 'DRAFT' ? 'badge-yellow' : 'badge-gray'}`} style={{ fontSize: '0.6rem' }}>
                  {ev.status === 'PUBLISHED' ? 'Đang bán' : ev.status === 'DRAFT' ? 'Bản nháp' : 'Đã đóng'}
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  {new Date(ev.start_time).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' })}
                </span>
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{ev.title}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>📍 {ev.location}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: queue management */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'auto' }}>
        {selectedEventId ? (() => {
          const ev = events.find(e => e.id === selectedEventId);
          if (!ev) return null;
          const isActive = queueToggles[selectedEventId] ?? false;
          const isLoading = queueLoading === selectedEventId;
          return (
            <div style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{ev.title}</h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>📍 {ev.location} · {new Date(ev.start_time).toLocaleDateString('vi-VN')}</p>
              </div>

              {/* Queue toggle */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 10, padding: '1.125rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>Hàng Chờ Ảo (Virtual Queue)</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {isActive ? '🟡 Đang bật — khách phải xếp hàng trước khi mua' : '⚪ Đang tắt — khách mua tự do'}
                    </div>
                  </div>
                  <button
                    className={`btn ${isActive ? 'btn-outline' : 'btn-primary'}`}
                    style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}
                    disabled={isLoading}
                    onClick={() => handleQueueToggle(selectedEventId, !isActive)}
                  >
                    {isLoading ? '...' : isActive ? 'Tắt Queue' : 'Bật Queue'}
                  </button>
                </div>
              </div>

              {/* Zones info */}
              {ev.zones?.length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>Phân khu giá vé</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {ev.zones.map((z, i) => (
                      <div key={z.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0.875rem', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: ZONE_COLORS[i % ZONE_COLORS.length] }} />
                          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{z.name}</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{z.total_seats} ghế</span>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{Number(z.price).toLocaleString('vi-VN')}đ</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Image upload */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 10, padding: '1.125rem', marginBottom: '1.25rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Ảnh sự kiện</div>
                {ev.image_url && (
                  <img src={ev.image_url} alt="event" style={{ width: '100%', maxHeight: 140, objectFit: 'cover', borderRadius: 8, marginBottom: '0.75rem' }} />
                )}
                <label style={{ display: 'inline-block', cursor: 'pointer' }}>
                  <span className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.4rem 0.875rem', pointerEvents: 'none' }}>
                    {imageUploading === ev.id ? 'Đang upload...' : ev.image_url ? 'Thay ảnh' : 'Upload ảnh'}
                  </span>
                  <input
                    type="file" accept="image/*" style={{ display: 'none' }}
                    disabled={imageUploading === ev.id}
                    onChange={e => handleImageUpload(ev.id, e.target.files[0])}
                  />
                </label>
              </div>

              {/* Stats + Delete event */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-outline"
                  style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}
                  onClick={() => openEventStats(ev.id)}
                >
                  📊 Xem thống kê
                </button>
                <button
                  className="btn"
                  style={{ fontSize: '0.8rem', padding: '0.45rem 1rem', background: 'rgba(239,68,68,0.12)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.3)' }}
                  disabled={deletingEventId === ev.id}
                  onClick={() => handleDeleteEvent(ev.id)}
                >
                  {deletingEventId === ev.id ? 'Đang xóa...' : '🗑 Xóa sự kiện'}
                </button>
              </div>
            </div>
          );
        })() : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Chọn một sự kiện để quản lý
          </div>
        )}
      </div>
    </div>
  );

  /* ─── ANALYTICS VIEW ─── */
  const AnalyticsView = () => {
    const genderMap = { MALE: 'Nam', FEMALE: 'Nữ', OTHER: 'Khác' };
    const genderColors = { MALE: '#6366f1', FEMALE: '#ec4899', OTHER: '#94a3b8' };
    const rawGender = (analytics?.genderDemographics || []).map(g => ({
      label: genderMap[g.gender] || 'Khác',
      value: g._count._all,
      color: genderColors[g.gender] || '#94a3b8',
    }));
    const genderData = Object.values(
      rawGender.reduce((acc, g) => {
        if (acc[g.label]) acc[g.label] = { ...acc[g.label], value: acc[g.label].value + g.value };
        else acc[g.label] = g;
        return acc;
      }, {})
    );
    const totalGender = genderData.reduce((s, g) => s + g.value, 0);
    const maleCount = analytics?.genderDemographics?.find(g => g.gender === 'MALE')?._count._all || 0;
    const femaleCount = analytics?.genderDemographics?.find(g => g.gender === 'FEMALE')?._count._all || 0;
    const malePct = totalGender > 0 ? Math.round((maleCount / totalGender) * 100) : 0;
    const femalePct = totalGender > 0 ? Math.round((femaleCount / totalGender) * 100) : 0;

    const spenders = analytics?.topSpenders || [];
    const maxSpend = spenders.length > 0 ? Math.max(...spenders.map(s => Number(s.total_spent))) : 1;

    return (
      <>
        <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Phân tích nhân khẩu học</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Thông tin chi tiết về đối tượng khán giả</p>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>TỔNG KHÁN GIẢ</div>
                <div style={{ fontSize: '2rem', fontWeight: 800 }}>{(data?.usersTotal || 0).toLocaleString()}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--success)', marginTop: '0.25rem' }}>↑ Dữ liệu thực</div>
              </div>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </div>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>DOANH THU</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{Number(data?.revenue || 0).toLocaleString('vi-VN')}đ</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--success)', marginTop: '0.25rem' }}>Từ {data?.seats?.sold || 0} vé đã bán</div>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>TỶ LỆ NAM / NỮ</div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{malePct}/{femalePct}</div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, marginTop: '0.625rem' }}>
              <div style={{ height: '100%', width: `${malePct}%`, background: 'linear-gradient(90deg, #6366f1, #ec4899)', borderRadius: 3 }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* Gender donut */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem' }}>Giới tính</h3>
            {genderData.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <DonutChart data={genderData} />
                <div style={{ flex: 1 }}>
                  {genderData.map(g => (
                    <div key={g.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem', fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: g.color }} />
                        {g.label}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700 }}>{g.value.toLocaleString()}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{totalGender > 0 ? Math.round((g.value / totalGender) * 100) : 0}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Chưa có dữ liệu</p>
            )}
          </div>

          {/* Top spenders */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem' }}>Top Khách Hàng VIP</h3>
            {spenders.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {spenders.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${ZONE_COLORS[i]}, ${ZONE_COLORS[(i + 1) % ZONE_COLORS.length]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>
                      {(s.full_name || s.email || '?').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>{s.full_name || s.email}</div>
                      <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginTop: '0.25rem' }}>
                        <div style={{ height: '100%', width: `${(Number(s.total_spent) / maxSpend) * 100}%`, background: ZONE_COLORS[i % ZONE_COLORS.length], borderRadius: 2 }} />
                      </div>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.84rem', flexShrink: 0 }}>{Number(s.total_spent).toLocaleString('vi-VN')}đ</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Chưa có dữ liệu</p>
            )}
          </div>
        </div>

      {/* Category analytics */}
      {categoryAnalytics && categoryAnalytics.length > 0 && (
        <div style={{ marginTop: '1.25rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem' }}>Phân tích theo danh mục</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Danh mục</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Nhóm tuổi</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Giới tính</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Số lượng</th>
                </tr>
              </thead>
              <tbody>
                {categoryAnalytics.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>{row.category_name || '—'}</td>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)' }}>{row.age_group || '—'}</td>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)' }}>{row.gender === 'MALE' ? 'Nam' : row.gender === 'FEMALE' ? 'Nữ' : row.gender || 'Other'}</td>
                    <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 700 }}>{Number(row.user_count || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
    );
  };

  /* ─── ORDERS VIEW ─── */
  const OrdersView = () => (
    <div>
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Quản lý Đơn hàng</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Tất cả đơn đặt vé của hệ thống</p>
        </div>
        <button className="btn btn-outline" style={{ fontSize: '0.8rem' }} onClick={fetchOrders}>↻ Tải lại</button>
      </div>

      {ordersLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedOrder ? '1fr 380px' : '1fr', gap: '1.25rem' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Mã ĐH</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Tổng tiền</th>
                  <th style={{ textAlign: 'center', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Trạng thái</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Ngày đặt</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Không có đơn hàng nào</td></tr>
                ) : orders.map(order => (
                  <tr
                    key={order.id}
                    onClick={() => { setSelectedOrder(null); fetchOrderDetail(order.id); }}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.1s', background: selectedOrder?.id === order.id ? 'rgba(124,58,237,0.08)' : 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = selectedOrder?.id === order.id ? 'rgba(124,58,237,0.08)' : 'transparent'}
                  >
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>#{String(order.id).slice(-6)}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700 }}>{Number(order.total_amount || 0).toLocaleString('vi-VN')}đ</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <span className={`badge ${order.status === 'PAID' ? 'badge-green' : order.status === 'PENDING' ? 'badge-yellow' : 'badge-gray'}`}>
                        {order.status === 'PAID' ? 'Hoàn thành' : order.status === 'PENDING' ? 'Chờ xử lý' : order.status || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('vi-VN') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Order detail panel */}
          {(selectedOrder || orderDetailLoading) && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem', overflow: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Chi tiết đơn hàng</h3>
                <button className="icon-btn" onClick={() => setSelectedOrder(null)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
              {orderDetailLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><div className="spinner" /></div>
              ) : selectedOrder && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.84rem' }}>
                  <div><span style={{ color: 'var(--text-muted)' }}>Mã: </span><span style={{ fontFamily: 'monospace' }}>#{String(selectedOrder.id).slice(-8)}</span></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Khách: </span><strong>{selectedOrder.user?.full_name || selectedOrder.user?.email || '—'}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Sự kiện: </span>{selectedOrder.event?.title || '—'}</div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Tổng: </span><strong style={{ color: 'var(--success)' }}>{Number(selectedOrder.total_amount || 0).toLocaleString('vi-VN')}đ</strong></div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Trạng thái: </span>
                    <span className={`badge ${selectedOrder.status === 'PAID' ? 'badge-green' : selectedOrder.status === 'PENDING' ? 'badge-yellow' : 'badge-gray'}`}>
                      {selectedOrder.status === 'PAID' ? 'Hoàn thành' : selectedOrder.status === 'PENDING' ? 'Chờ xử lý' : selectedOrder.status}
                    </span>
                  </div>
                  {selectedOrder.tickets?.length > 0 && (
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Vé ({selectedOrder.tickets.length})</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        {selectedOrder.tickets.map((t, i) => (
                          <div key={i} style={{ padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 6, fontSize: '0.78rem' }}>
                            <span style={{ fontWeight: 600 }}>{t.seat?.zone?.name || '—'}</span>
                            {' · '}Hàng {t.seat?.row_label} - Ghế {t.seat?.seat_number}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  /* ─── USERS VIEW ─── */
  const UsersView = () => (
    <div>
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Quản lý Người dùng</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Danh sách tất cả tài khoản trong hệ thống</p>
        </div>
        <button className="btn btn-outline" style={{ fontSize: '0.8rem' }} onClick={fetchUsers}>↻ Tải lại</button>
      </div>

      {usersLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Người dùng</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Email</th>
                <th style={{ textAlign: 'center', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Vai trò</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Ngày tạo</th>
                <th style={{ textAlign: 'center', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Không có người dùng nào</td></tr>
              ) : users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 700, flexShrink: 0, overflow: 'hidden' }}>
                        {u.avatar_url ? <img src={u.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : (u.full_name || u.email || '?').charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 500 }}>{u.full_name || '—'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    <span className={`badge ${u.role === 'ADMIN' ? 'badge-purple' : 'badge-gray'}`}>
                      {u.role === 'ADMIN' ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {u.role === 'ADMIN' ? (
                        <button className="btn btn-outline" style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }} onClick={() => handleRevokeAdmin(u.id)}>Hạ quyền</button>
                      ) : (
                        <button className="btn btn-outline" style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }} onClick={() => handleGrantAdmin(u.id)}>Cấp admin</button>
                      )}
                      <button
                        className="btn"
                        style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem', background: 'rgba(239,68,68,0.12)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.3)' }}
                        onClick={() => handleDeleteUser(u.id)}
                      >Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* ── Sidebar ── */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.1rem' }}>TicketRush Pro</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Admin Panel</div>
        </div>

        {[
          { key: 'overview', label: 'Tổng quan', icon: icons.overview },
          { key: 'events', label: 'Sự kiện', icon: icons.events },
          { key: 'analytics', label: 'Phân tích', icon: icons.analytics },
          { key: 'tickets', label: 'Đơn hàng', icon: icons.tickets },
          { key: 'users', label: 'Người dùng', icon: icons.users },
          { key: 'categories', label: 'Thể loại', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg> },
        ].map(item => (
          <button
            key={item.key}
            className={`admin-nav-item ${activeView === item.key ? 'active' : ''}`}
            onClick={() => setActiveView(item.key)}
          >
            {item.icon}
            <span className="admin-nav-label">{item.label}</span>
          </button>
        ))}

        {/* Sidebar footer */}
        <div className="admin-sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>
              {userInitials}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Quản trị viên</div>
            </div>
          </div>
          <button className="btn btn-ghost" style={{ width: '100%', fontSize: '0.78rem', marginTop: '0.625rem', justifyContent: 'center' }} onClick={() => navigate('/')}>
            ← Về trang chủ
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="admin-content">
        {activeView === 'overview' && <OverviewView />}
        {activeView === 'events' && <EventsView />}
        {activeView === 'analytics' && <AnalyticsView />}
        {activeView === 'tickets' && <OrdersView />}
        {activeView === 'users' && <UsersView />}
        {activeView === 'categories' && (
          <CategoriesView
            allCategories={allCategories}
            newCatForm={newCatForm}
            setNewCatForm={setNewCatForm}
            addingCat={addingCat}
            handleAddCategory={handleAddCategory}
            handleDeleteCategory={handleDeleteCategory}
          />
        )}
      </div>

      {showCreate && (
        <CreateEventModal
          newEvent={newEvent} setNewEvent={setNewEvent}
          allCategories={allCategories}
          zones={zones} setZones={setZones}
          activeZoneId={activeZoneId} setActiveZoneId={setActiveZoneId}
          grid={grid} setGrid={setGrid}
          maxRows={maxRows} maxCols={maxCols} onResizeGrid={handleResizeGrid}
          creating={creating} createMsg={createMsg}
          onSubmit={handleCreateEvent}
          onClose={() => setShowCreate(false)}
          updateZoneInfo={updateZoneInfo}
        />
      )}

      {statsModalEventId && (() => {
        const ev = events.find(e => e.id === statsModalEventId);
        return (
          <EventStatsModal
            eventTitle={ev?.title || ''}
            stats={eventStats}
            loading={statsLoading}
            error={statsError}
            onClose={closeEventStats}
          />
        );
      })()}
    </div>
  );
}

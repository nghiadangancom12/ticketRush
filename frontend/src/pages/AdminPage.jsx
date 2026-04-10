import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

export default function AdminPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Event Form State
  const [newEvent, setNewEvent] = useState({
    title: '', description: '', location: '', start_time: ''
  });
  const [zones, setZones] = useState([{ id: 1, name: 'VIP', price: '100' }, { id: 2, name: 'Regular', price: '50' }]);
  const [activeZoneId, setActiveZoneId] = useState(1);
  
  // Lưới thiết kế: 15 rows x 30 cols
  const maxRows = 15;
  const maxCols = 30;
  const [grid, setGrid] = useState(
    Array.from({ length: maxRows }, () => Array(maxCols).fill(null))
  );

  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
      return;
    }

    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data.data); // Factory wrap
        setErrorMsg('');
      } catch (err) {
        if (err.response?.status === 403) {
          setErrorMsg('Rất tiếc, bạn không có quyền truy cập Admin Dashboard.');
        } else {
          setErrorMsg('Lỗi tải dữ liệu. Vui lòng đăng nhập lại.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const socket = io('http://localhost:3000');
    socket.on('seatUpdated', () => fetchData());
    return () => socket.disconnect();
  }, [navigate]);

  const toggleSeatOnGrid = (rIndex, cIndex) => {
    const newGrid = grid.map(row => [...row]);
    if (newGrid[rIndex][cIndex]) {
      // nếu có rồi thì xoá (khoảng trống)
      newGrid[rIndex][cIndex] = null;
    } else {
      // chưa có thì đánh dấu là seat thuộc zone hiện tại
      newGrid[rIndex][cIndex] = activeZoneId;
    }
    setGrid(newGrid);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      
      // Chuyển grid thành mảng zones chứa seats mapping
      const formattedZones = zones.map(z => ({
        ...z,
        seats: [] // sẽ nhét toạ độ vào đây
      }));

      // Map Grid ra thành RowLabels (A, B, C...) và SeatNumbers
      const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      
      for (let r = 0; r < maxRows; r++) {
        for (let c = 0; c < maxCols; c++) {
          const zId = grid[r][c];
          if (zId) {
            const zoneTarget = formattedZones.find(z => z.id === zId);
            if (zoneTarget) {
               zoneTarget.seats.push({
                 row_label: rowLabels[r] || `R${r}`, // A..Z
                 seat_number: c + 1
               });
            }
          }
        }
      }

      // Filter out zones with no seats
      const validZones = formattedZones.filter(z => z.seats.length > 0);
      if (validZones.length === 0) {
        alert("Bạn chưa vẽ ghế nào trên lưới!");
        setCreating(false);
        return;
      }

      const res = await axios.post('http://localhost:3000/api/events', {
        title: newEvent.title,
        description: newEvent.description,
        location: newEvent.location,
        start_time: newEvent.start_time,
        zones: validZones
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(res.data.message);
      // Reset form
      setNewEvent({ title: '', description: '', location: '', start_time: '' });
      setGrid(Array.from({ length: maxRows }, () => Array(maxCols).fill(null)));
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi tạo sự kiện');
    } finally {
      setCreating(false);
    }
  };

  const updateZoneInfo = (index, field, value) => {
    const newZones = [...zones];
    newZones[index][field] = value;
    setZones(newZones);
  }

  if (loading) return <div className="text-center mt-8">Đang tải biểu đồ...</div>;
  if (errorMsg) return <div className="text-center mt-8 text-danger">{errorMsg}</div>;

  return (
    <div>
      <h1 className="text-gradient mb-8 text-center" style={{fontSize: '2.5rem'}}>📊 Admin Dashboard</h1>
      <div className="flex justify-between gap-4 mb-4" style={{flexWrap: 'wrap'}}>
        <div className="glass-panel flex-1 text-center"><h3 className="text-secondary">Doanh Thu</h3><h2>${data.revenue.toLocaleString()}</h2></div>
        <div className="glass-panel flex-1 text-center"><h3 className="text-secondary">Khách Hàng</h3><h2>{data.usersTotal}</h2></div>
        <div className="glass-panel flex-1 text-center"><h3 className="text-secondary">Tỷ Lệ Bán</h3><h2>{data.seats.total ? ((data.seats.sold/data.seats.total)*100).toFixed(1) : 0}%</h2></div>
      </div>

      <div className="glass-panel mt-8 text-left">
        <h2 className="mb-4">Tạo Sự Kiện Mới (Visual Seat Designer)</h2>
        <form onSubmit={handleCreateEvent}>
          <div className="flex gap-4 mb-4">
            <div className="flex-1"><label className="form-label">Tên</label><input type="text" className="form-input" required value={newEvent.title} onChange={e=>setNewEvent({...newEvent, title:e.target.value})} /></div>
            <div className="flex-1"><label className="form-label">Thời Gian</label><input type="datetime-local" className="form-input" required value={newEvent.start_time} onChange={e=>setNewEvent({...newEvent, start_time:e.target.value})} /></div>
            <div className="flex-1"><label className="form-label">Địa Điểm</label><input type="text" className="form-input" required value={newEvent.location} onChange={e=>setNewEvent({...newEvent, location:e.target.value})} /></div>
          </div>
          
          <h3 className="mt-4 mb-2">1. Định nghĩa màu sắc Phân khu (Zones)</h3>
          <div className="flex gap-2 mb-4" style={{flexWrap: 'wrap'}}>
            {zones.map((z, idx) => (
              <div key={z.id} style={{background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', flex: 1, minWidth: '200px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                  <input type="radio" checked={activeZoneId === z.id} onChange={() => setActiveZoneId(z.id)} />
                  <b>Chọn bút vẽ Zone này</b>
                </div>
                <input type="text" className="form-input mb-2" value={z.name} onChange={e => updateZoneInfo(idx, 'name', e.target.value)} placeholder="Tên Khu" />
                <input type="number" className="form-input" value={z.price} onChange={e => updateZoneInfo(idx, 'price', e.target.value)} placeholder="Giá Tiền" />
              </div>
            ))}
            <button type="button" className="btn btn-outline" onClick={() => setZones([...zones, {id: Date.now(), name: 'New Zone', price: '0'}])}>+ Thêm Zone</button>
          </div>

          <h3 className="mt-4 mb-2">2. Vẽ Sơ Đồ Khán Đài</h3>
          <p className="text-secondary mb-2 text-sm">Click để tạo ghế. Kéo thả để tạo khoảng trống cho sân khấu hoặc lối đi.</p>
          
          <div style={{overflowX: 'auto', padding: '1rem', background: 'rgba(0,0,0,0.5)', borderRadius: '8px'}}>
            <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
              {grid.map((row, rIndex) => (
                <div key={`r-${rIndex}`} style={{display: 'flex', gap: '4px', whiteSpace: 'nowrap'}}>
                  {row.map((cellObj, cIndex) => {
                    const color = cellObj ? (cellObj === 1 ? 'var(--primary)' : cellObj === 2 ? '#ec4899' : '#10b981') : '#333';
                    return (
                      <div 
                        key={`c-${cIndex}`}
                        onMouseDown={() => toggleSeatOnGrid(rIndex, cIndex)}
                        style={{
                          width: '24px', height: '24px', cursor: 'pointer',
                          background: color, borderRadius: '4px', display: 'inline-block'
                        }}
                        title={cellObj ? `Ghế tại Cột ${cIndex + 1}` : 'Khoảng trống'}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4">
            <button type="submit" className="btn btn-primary" disabled={creating} style={{width: '100%', padding: '1rem', fontSize: '1.2rem'}}>
              {creating ? 'Đang Save Database...' : 'Tạo Sự Kiện Mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

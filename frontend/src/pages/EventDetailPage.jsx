import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [eventData, setEventData] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Factory data wrap
    axios.get(`http://localhost:3000/api/events/${id}`)
      .then(res => setEventData(res.data.data))
      .catch(err => console.error(err));

    const socket = io('http://localhost:3000');
    socket.on('seatUpdated', () => {
      axios.get(`http://localhost:3000/api/events/${id}`)
        .then(res => setEventData(res.data.data));
    });

    return () => socket.disconnect();
  }, [id]);

  if (!eventData) return <div className="text-center mt-8">Loading event data...</div>;

  const toggleSeatInfo = (seat) => {
    if (seat.status !== 'AVAILABLE') return;
    if (selectedSeats.find(s => s.id === seat.id)) {
      setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
      setErrorMsg('');
    } else {
      if (selectedSeats.length >= 4) {
        setErrorMsg('Bạn chỉ được chọn tối đa 4 ghế!');
        return;
      }
      setSelectedSeats(prev => [...prev, seat]);
      setErrorMsg('');
    }
  };

  const handleHoldSeats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorMsg('Bạn cần đăng nhập để giữ vé.');
        setTimeout(() => navigate('/auth'), 2000);
        return;
      }
      const seatIds = selectedSeats.map(s => s.id);
      
      const res = await axios.post(`http://localhost:3000/api/seats/hold`, {
        seatIds, eventId: id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Đã giữ vé thành công. Chuyển tới thanh toán!');
      localStorage.setItem('checkoutEventId', id);
      navigate('/checkout');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi giữ ghế.');
      axios.get(`http://localhost:3000/api/events/${id}`)
        .then(res => setEventData(res.data.data));
      setSelectedSeats([]);
    }
  };

  // Logic map Grid
  // Flatten tất cả seats của tất cả zones vào 1 object map theo row_label
  const seatsByRow = {};
  eventData.zones.forEach(zone => {
    zone.seats.forEach(seat => {
      if (!seatsByRow[seat.row_label]) seatsByRow[seat.row_label] = [];
      seatsByRow[seat.row_label].push({ ...seat, zoneName: zone.name, price: zone.price });
    });
  });

  return (
    <div>
      <h1 className="text-gradient mb-1" style={{fontSize: '2.5rem'}}>{eventData.title}</h1>
      <p className="text-secondary mb-4">{eventData.location} - {new Date(eventData.start_time).toLocaleString()}</p>
      
      <div style={{display: 'flex', gap: '2rem', flexWrap: 'wrap'}}>
        <div style={{flex: 2, minWidth: '60%'}}>
          <div className="glass-panel text-center mb-4">
            <div style={{background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '4px', marginBottom: '2rem'}}>
              STAGE / MÀN HÌNH SÂN KHẤU
            </div>
            
            <div className="seat-map-container" style={{overflowX: 'auto'}}>
              {(() => {
                // Calculate max column across all rows
                const allSeats = Object.values(seatsByRow).flat();
                const maxColNum = allSeats.length > 0 
                  ? Math.max(...allSeats.map(s => s.seat_number)) 
                  : 0;
                
                return Object.keys(seatsByRow).sort().map(rowLabel => {
                  const seats = seatsByRow[rowLabel];
                  seats.sort((a,b) => a.seat_number - b.seat_number);

                  return (
                    <div key={rowLabel} style={{display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center'}}>
                      <div style={{width: '2rem', fontWeight: 'bold'}}>{rowLabel}</div>
                      <div style={{
                        display: 'grid', 
                        gridTemplateColumns: `repeat(${maxColNum}, 36px)`, 
                        gap: '4px'
                      }}>
                        {Array.from({ length: maxColNum }).map((_, cIndex) => {
                          const colSlot = cIndex + 1;
                          const seatInSlot = seats.find(s => s.seat_number === colSlot);
                          
                          if (!seatInSlot) return <div key={colSlot} style={{width: '36px', height: '36px'}}></div>;
                          
                          const isSelected = selectedSeats.some(s => s.id === seatInSlot.id);
                          let statusClass = 'seat-avai';
                          if (isSelected) statusClass = 'seat-selected';
                          else if (seatInSlot.status === 'LOCKED') statusClass = 'seat-locked';
                          else if (seatInSlot.status === 'SOLD') statusClass = 'seat-sold';

                          return (
                            <div 
                              key={seatInSlot.id} 
                              className={`seat ${statusClass}`}
                              style={{width: '36px', height: '36px', margin: 0, fontSize: '11px'}}
                              onClick={() => toggleSeatInfo(seatInSlot)}
                              title={`${seatInSlot.zoneName} - ${rowLabel}${seatInSlot.seat_number}`}
                            >
                              {seatInSlot.seat_number}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            <div className="flex justify-center gap-4 mt-4 text-secondary text-sm">
              <div className="flex items-center gap-2"><div className="seat seat-avai" style={{width: '1.5rem', height: '1.5rem'}}></div> Trống</div>
              <div className="flex items-center gap-2"><div className="seat seat-locked" style={{width: '1.5rem', height: '1.5rem'}}></div> Đang giữ/Mới chọn</div>
              <div className="flex items-center gap-2"><div className="seat seat-sold" style={{width: '1.5rem', height: '1.5rem'}}></div> Đã bán</div>
            </div>
          </div>
        </div>
        
        {/* Right Panel (Tương tự code ban đầu) */}
        <div style={{flex: 1, minWidth: '300px'}}>
          <div className="glass-panel sticky" style={{top: '5rem'}}>
            <h2 className="mb-4">Ghế đã chọn (Tối đa 4)</h2>
            {errorMsg && <div style={{color: 'var(--danger)', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px'}}>{errorMsg}</div>}
            
            {selectedSeats.length === 0 ? (
              <p className="text-secondary">Chưa chọn ghế nào.</p>
            ) : (
              <div>
                <ul style={{listStyle: 'none', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                  {selectedSeats.map(s => (
                    <li key={s.id} className="flex justify-between" style={{background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px'}}>
                      <span>{s.zoneName} - {s.row_label}{s.seat_number}</span>
                      <span>${s.price}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between font-bold mb-4" style={{fontSize: '1.2rem'}}>
                  <span>Tổng tiền:</span>
                  <span className="text-primary">
                    ${selectedSeats.reduce((sum, s) => sum + Number(s.price), 0)}
                  </span>
                </div>
                <button className="btn btn-primary" style={{width: '100%'}} onClick={handleHoldSeats}>Giữ Chỗ & Thanh Toán</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

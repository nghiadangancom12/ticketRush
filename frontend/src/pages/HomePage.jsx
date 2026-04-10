import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:3000/api/events')
      .then(res => {
        // ResponseFactory trả về { status, message, data: [...] }
        setEvents(res.data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center mt-8">Loading events...</div>;

  return (
    <div>
      <h1 className="text-gradient text-center mb-4" style={{fontSize: '3rem'}}>Lịch Trình Sự Kiện</h1>
      <p className="text-center text-secondary mb-4">Khám phá các sự kiện và xí chỗ ngay hôm nay!</p>
      
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem'}}>
        {events.length === 0 ? (
          <div className="glass-panel text-center">Chưa có sự kiện nào.</div>
        ) : (
          events.map(ev => (
            <div key={ev.id} className="glass-panel" style={{display: 'flex', flexDirection: 'column'}}>
              <h3>{ev.title}</h3>
              <p className="text-secondary mb-2 flex-1">{ev.location} - {new Date(ev.start_time).toLocaleString()}</p>
              <Link to={`/event/${ev.id}`} className="btn btn-primary mt-auto" style={{width: '100%'}}>Xem Sơ Đồ & Mua Vé</Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

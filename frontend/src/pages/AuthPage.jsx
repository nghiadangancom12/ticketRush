import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', full_name: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (isLogin) {
        const res = await axios.post('http://localhost:3000/api/auth/login', {
          email: formData.email,
          password: formData.password
        });
        // ResponseFactory trả về { status, message, data: { user: {...}, accessToken } }
        const userData = res.data.data;
        localStorage.setItem('token', userData.accessToken);
        localStorage.setItem('userId', userData.user.id);
        localStorage.setItem('userRole', userData.user.role);
        localStorage.setItem('userName', userData.user.full_name);
        alert('Đăng nhập thành công!');
        navigate('/');
      } else {
        await axios.post('http://localhost:3000/api/auth/register', {
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name
        });
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        setIsLogin(true);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra.');
    }
  };

  return (
    <div className="flex justify-center mt-8">
      <div className="glass-panel" style={{maxWidth: '400px', width: '100%'}}>
        <h2 className="text-center mb-4">{isLogin ? 'Đăng Nhập' : 'Đăng Ký'}</h2>
        
        {errorMsg && <div style={{color: 'var(--danger)', marginBottom: '1rem'}}>{errorMsg}</div>}
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Họ Tên</label>
              <input 
                type="text" 
                className="form-input" 
                required 
                value={formData.full_name}
                onChange={e => setFormData({...formData, full_name: e.target.value})}
              />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-input" 
              required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input 
              type="password" 
              className="form-input" 
              required
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{width: '100%'}}>
            {isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
          </button>
        </form>

        <div className="text-center mt-4 text-secondary" style={{fontSize: '0.9rem'}}>
          {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
          <span 
            style={{color: 'var(--primary)', cursor: 'pointer'}} 
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Đăng ký ngay" : "Đăng nhập ngay"}
          </span>
        </div>
      </div>
    </div>
  );
}

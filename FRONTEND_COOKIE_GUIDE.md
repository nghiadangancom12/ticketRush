## 🎯 Frontend Guide: HttpOnly Cookies & CORS Setup

### 📌 Quan trọng: Frontend cần cấu hình gì?

Frontend (React/Vue/Angular) chỉ cần **1 thay đổi nhỏ** để hoạt động với HttpOnly Cookies:

---

## 🟢 Frontend Fetch Configuration

### ✅ Loại 1: Fetch API (Vanilla JS)

```javascript
// ✅ ĐÚNG: Gửi credentials (cookies) với request
fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',  // 🔑 QUAN TRỌNG: Cho phép gửi/nhận cookies
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
})
.then(res => res.json())
.then(data => console.log('✅ Login success! Cookie saved automatically'))
;

// Lần gọi sau, cookie sẽ tự động được gửi
fetch('http://localhost:3000/api/users/me', {
  method: 'GET',
  credentials: 'include'  // ✅ Browser sẽ tự động gửi cookie
})
.then(res => res.json())
.then(profile => console.log('✅ Profile:', profile))
;
```

**Giải thích:**
- `credentials: 'include'` → Cho phép browser gửi cookies (mặc định không gửi cross-domain)
- Cookie **không cần** tự thêm vào headers (browser tự động làm)
- HttpOnly cookies **không thể** truy cập từ JavaScript

---

### 🟣 Loại 2: Axios

```javascript
// ✅ ĐÚNG: Sử dụng axios với withCredentials
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true  // 🔑 QUAN TRỌNG: Cho phép gửi/nhận cookies
});

// Login
await API.post('/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});
// ✅ Cookie tự động được lưu

// Sau đó
const response = await API.get('/users/me');
// ✅ Cookie tự động được gửi
console.log(response.data);
```

**Cấu hình global:**
```javascript
// main.js hoặc api.js
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true  // ✅ Áp dụng cho tất cả requests
});

export default API;
```

---

### 🔵 Loại 3: React Query / TanStack Query

```javascript
import { useQuery, useMutation } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const response = await fetch(`http://localhost:3000/api${queryKey[0]}`, {
          credentials: 'include'  // ✅ Gửi cookies
        });
        return response.json();
      }
    }
  }
});

// Sử dụng
const { data: profile } = useQuery({
  queryKey: ['/users/me'],
  // credentials: 'include' đã được set ở defaultOptions
});
```

---

### 🟡 Loại 4: SWR (stale-while-revalidate)

```javascript
import useSWR from 'swr';

const fetcher = async (url) => {
  const res = await fetch(url, {
    credentials: 'include'  // ✅ Gửi cookies
  });
  return res.json();
};

// Sử dụng
const { data, error } = useSWR('http://localhost:3000/api/users/me', fetcher);
```

---

## 🧪 Test Frontend Cookie Integration

### Test 1: Kiểm tra Cookie được lưu

```javascript
// Mở DevTools → Application → Cookies
// Sau khi login, bạn sẽ thấy:
/**
 * Name: jwt
 * Value: eyJhbGc...
 * Domain: localhost
 * Path: /
 * HttpOnly: ✅ (JavaScript không thể truy cập)
 * Secure: ✅ (HTTPS only)
 * SameSite: None
 */
```

### Test 2: Kiểm tra Network Requests

```javascript
// 1. Mở DevTools → Network tab
// 2. Gọi login
// 3. Xem Response Headers:
//    Set-Cookie: jwt=eyJhbGc...; HttpOnly; Secure; SameSite=None
// 4. Gọi GET /api/users/me
// 5. Xem Request Headers:
//    Cookie: jwt=eyJhbGc...
```

### Test 3: Xác thực HttpOnly (Security)

```javascript
// ✅ ĐÚNG: Không thể truy cập từ JavaScript
console.log(document.cookie);  // Sẽ trống (HttpOnly được bảo vệ)

// ✅ ĐÚNG: Browser gửi tự động
// Xem Network → Request Headers → Cookie: jwt=...
```

---

## 🎯 React Setup (Chi tiết)

### Cách 1: Custom Hook với Fetch

```javascript
// hooks/useApi.js
export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = async (url, options = {}) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api${url}`, {
        credentials: 'include',  // 🔑 Bắt buộc
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { request, loading, error };
}

// pages/LoginPage.jsx
import { useApi } from '../hooks/useApi';

export default function LoginPage() {
  const { request, loading } = useApi();

  const handleLogin = async (email, password) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    // ✅ Cookie tự động được lưu
    console.log('Login success!');
  };

  return <button onClick={() => handleLogin('...', '...')}>Login</button>;
}
```

### Cách 2: Axios Interceptor

```javascript
// api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true  // ✅ Cho phép cookies
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    // Có thể thêm custom headers nếu cần
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - auto logout nếu 401
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Cookie hết hạn, logout
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;

// App.jsx
import API from './api';

async function App() {
  // Login
  await API.post('/auth/login', { email: '...', password: '...' });
  
  // ✅ Cookie đã được lưu tự động
  
  // Gọi endpoint protected
  const response = await API.get('/users/me');
  // ✅ Cookie tự động được gửi
  console.log(response.data);
}
```

---

## ⚠️ Common Mistakes Frontend

### ❌ Lỗi 1: Quên `credentials: 'include'`

```javascript
// ❌ SAI
fetch('http://localhost:3000/api/users/me')
// Cookie không được gửi!

// ✅ ĐÚNG
fetch('http://localhost:3000/api/users/me', {
  credentials: 'include'
})
```

### ❌ Lỗi 2: Cố gắng lấy HttpOnly cookie

```javascript
// ❌ SAI (không hoạt động)
const token = document.cookie;  // Sẽ trống
const token = localStorage.getItem('jwt');  // Đây là frontend cookies, không phải HttpOnly

// ✅ ĐÚNG
// Không cần lấy gì cả, browser tự động gửi
```

### ❌ Lỗi 3: Gửi Bearer token khi dùng cookies

```javascript
// ❌ KHÔNG CẦN (nếu dùng cookies)
fetch('...', {
  headers: {
    'Authorization': `Bearer ${token}`  // Không cần nếu cookies được setup đúng
  },
  credentials: 'include'
})

// ✅ ĐÚNG (chỉ cần credentials)
fetch('...', {
  credentials: 'include'
})
```

---

## 🔒 Security Best Practices (Frontend)

1. **Luôn** dùng `credentials: 'include'` khi gọi API cross-domain
2. **Không bao giờ** lưu token ở localStorage/sessionStorage nếu dùng HttpOnly
3. **Kiểm tra** Set-Cookie headers sau mỗi login
4. **Logout** sẽ tự động xóa cookie (server side)
5. **Test** trên multiple browsers để chắc chắn

---

## 📱 CORS Preflight Requests

Frontend sẽ tự động gửi preflight request (OPTIONS) trước POST/PUT:

```javascript
// Frontend sẽ tự động gửi:
OPTIONS /api/auth/login
Access-Control-Request-Headers: content-type

// Backend trả về:
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: POST
Access-Control-Allow-Headers: content-type

// Sau đó gửi actual request:
POST /api/auth/login
```

Backend (app.js) đã được cấu hình sẵn preflight handling.

---

## ✅ Checklist Frontend

- [ ] `credentials: 'include'` trong tất cả fetch/axios calls
- [ ] `withCredentials: true` nếu dùng axios
- [ ] Test login → xem Set-Cookie header
- [ ] Test GET endpoint → xem Cookie được gửi
- [ ] Kiểm tra DevTools → Application → Cookies
- [ ] Logout xóa cookie
- [ ] Error handling cho 401 responses

---

**Frontend setup hoàn tất! 🎉**

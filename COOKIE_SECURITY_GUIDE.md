## 🔐 HttpOnly Cookie Cross-Domain Configuration Guide

### 📋 Tổng Quan
Hướng dẫn cấu hình đầy đủ để sử dụng **HttpOnly Cookies** cho JWT token authentication giữa Frontend (React/Vue/Angular) và Backend (Node.js/Express) chạy ở **các domain khác nhau**.

---

## ✅ 3 YÊU CẦU BẮT BUỘC ĐÃ HOÀN THÀNH

### 1️⃣ Cấu hình CORS (Backend) ✅

**File:** `app.js`

**Vấn đề cũ:**
```javascript
app.use(cors());  // ❌ Chấp nhận tất cả origins, không cho phép credentials
```

**Cấu hình mới:**
```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,  // 🔑 BẮT BUỘC: Cho phép gửi/nhận cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());  // ✅ Parse cookies từ request
```

**Giải thích:**
- `origin: process.env.FRONTEND_URL` → Chỉ định Frontend URL cụ thể (VỚI port)
- `credentials: true` → **BẮT BUỘC** cho phép browser gửi/nhận cookies
- `allowedHeaders` → Danh sách headers được phép gửi
- `cookieParser()` → Express middleware để đọc cookies từ Request

**⚠️ Tuyệt đối KHÔNG dùng:**
```javascript
app.use(cors({ origin: '*' }));  // ❌ Nguy hiểm! Không cho phép credentials
```

---

### 2️⃣ Cấu hình Cookie (Backend) ✅

**File:** `modules/auth/authController.js`

**Vấn đề cũ:**
```javascript
const cookieOptions = {
  expires: new Date(...),
  httpOnly: true,
  sameSite: 'strict'  // ❌ Không hoạt động cho cross-domain
};
```

**Cấu hình mới:**
```javascript
const cookieOptions = {
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  httpOnly: true,      // ✅ Chống XSS: JS không thể truy cập
  sameSite: 'none',    // ✅ QUAN TRỌNG: Cho phép cross-domain cookies
  secure: true,        // ✅ QUAN TRỌNG: Chỉ qua HTTPS (bắt buộc với sameSite: 'none')
};

res.cookie('jwt', token, cookieOptions);
```

**Giải thích:**

| Attribute | Giá Trị | Lý Do |
|-----------|--------|------|
| **httpOnly** | `true` | Chống XSS attacks - JavaScript không thể truy cập qua `document.cookie` |
| **sameSite** | `'none'` | Cho phép cookie gửi trong cross-domain requests (Backend ≠ Frontend domain) |
| **secure** | `true` | Cookie chỉ gửi qua HTTPS, bảo vệ khỏi MITM attacks |
| **expires** | 24h | Thời hạn cookie |

**Bảng so sánh sameSite:**

```
sameSite: 'strict'  → Chỉ gửi cookie khi Frontend cùng domain (KHÔNG hoạt động cross-domain)
sameSite: 'lax'     → Gửi cookie cho GET requests cross-site (không POST)
sameSite: 'none'    → Gửi cookie cho TẤT CẢ requests cross-site (yêu cầu secure: true)
```

**⚠️ Lưu ý:**
- Khi `sameSite: 'none'` và `secure: true` → bắt buộc bốn điều kiện CÙNG LÚC
- Nếu một trong hai thiếu, cookie sẽ bị từ chối

---

### 3️⃣ Backend Xác thực từ Cookie ✅

**File:** `middlewares/auth.js`

**Vấn đề cũ:**
```javascript
// ❌ Chỉ lấy từ Authorization header
const token = req.headers['authorization'];
```

**Cấu hình mới:**
```javascript
const verifyToken = (req, res, next) => {
  let token = null;

  // 1️⃣ Kiểm tra Authorization Header trước
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  // 2️⃣ Nếu không có header, kiểm tra Cookie (từ cross-domain request)
  if (!token && req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(403).json({ message: 'No token provided!' });
  }

  // Xác thực token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized!' });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};
```

**Thứ tự ưu tiên:**
1. **Authorization Header** (Bearer token) - cho App/Mobile clients
2. **Cookie** (từ cross-domain request) - cho Web browsers

---

## 🔧 Các File Đã Sửa

```
✅ app.js
   - Thêm cookie-parser middleware
   - Cấu hình CORS với credentials: true
   - Chỉ định FRONTEND_URL cụ thể

✅ modules/auth/authController.js
   - Sửa _setTokenCookie: sameSite: 'none' + secure: true
   - Cập nhật logout cookie options

✅ middlewares/auth.js
   - Hỗ trợ lấy token từ cookies (ngoài header)
   - Thêm fallback logic

✅ server.js
   - Cấu hình Socket.IO CORS
   - Enable credentials

✅ package.json
   - ✅ Cài đặt: npm install cookie-parser

✅ swagger.yaml
   - Thêm cookieAuth security scheme
   - Ghi chép endpoint với cookie details
   - Update description cho /api/auth endpoints
```

---

## 🧪 Cách Test

### Phương pháp 1: Node.js Script (Tự động)
```bash
node test-http-only-cookies.js
```

**Test bao gồm:**
- ✅ CORS Headers verification
- ✅ Register user
- ✅ Login + nhận cookie
- ✅ Lấy profile dùng cookie
- ✅ Logout (clear cookie)

### Phương pháp 2: Swagger UI
```bash
npm start
# Truy cập: http://localhost:3000/api-docs
```

**Các bước:**
1. Click endpoint `/api/auth/login`
2. Nhập email/password → "Try it out"
3. Xem `Set-Cookie` header trong Response
4. Gọi `/api/users/me` → Browser tự động gửi cookie
5. Xem profile được trả về ✅

### Phương pháp 3: Frontend React/Vue (cURL equivalent)
```javascript
// Frontend sử dụng fetch với credentials
fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',  // 🔑 BẮT BUỘC: Cho phép gửi/nhận cookies
  body: JSON.stringify({ email: 'user@example.com', password: 'pass' })
})
.then(res => res.json())
.then(data => {
  console.log('✅ Login success, cookie saved automatically');
  
  // Lần gọi sau, cookie sẽ tự động được gửi
  return fetch('http://localhost:3000/api/users/me', {
    method: 'GET',
    credentials: 'include'  // ✅ Gửi cookie
  });
})
.then(res => res.json())
.then(profile => console.log('✅ Profile:', profile));
```

**Lưu ý Frontend:** Chỉ cần thêm `credentials: 'include'` vào fetch options!

---

## 🔍 Troubleshooting

### ❌ Cookie không được lưu?

**Nguyên nhân 1: CORS credentials không bật**
```javascript
// ❌ Sai
app.use(cors());

// ✅ Đúng
app.use(cors({ credentials: true, origin: 'http://localhost:5173' }));
```

**Nguyên nhân 2: Frontend không gửi credentials**
```javascript
// ❌ Sai
fetch('...', {})

// ✅ Đúng
fetch('...', { credentials: 'include' })
```

**Nguyên nhân 3: sameSite/secure không đặt đúng**
```javascript
// ❌ Sai (cross-domain)
res.cookie('jwt', token, { httpOnly: true, sameSite: 'strict' });

// ✅ Đúng (cross-domain)
res.cookie('jwt', token, { httpOnly: true, sameSite: 'none', secure: true });
```

### ❌ CORS error "Cannot read credentials mode"?

```javascript
// ❌ Sai
cors({ origin: '*', credentials: true })  // Không hợp lệ!

// ✅ Đúng
cors({ origin: 'http://localhost:5173', credentials: true })
```

### ❌ "Secure Cookies chỉ hoạt động trong HTTPS"?

**Development (localhost):** Browser cho phép exception
**Production:** Cần HTTPS thực tế hoặc ngif tạo certificate

---

## 🌐 Environment Setup

**`.env` file:**
```
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
JWT_SECRET=your_secret_key_here
JWT_COOKIE_EXPIRES_IN=1
NODE_ENV=development
```

**Production:**
```
FRONTEND_URL=https://app.ticketrush.com
BACKEND_URL=https://api.ticketrush.com
JWT_SECRET=production_secret_key
JWT_COOKIE_EXPIRES_IN=7
NODE_ENV=production
```

---

## 📚 Tài liệu tham khảo

- [MDN: HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [MDN: SameSite Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)
- [Express CORS Package](https://github.com/expressjs/cors)
- [OWASP: Session Management](https://owasp.org/www-community/attacks/csrf)

---

## 🎯 Kiểm Danh

```
✅ CORS configured với credentials: true
✅ Cookie attributes: httpOnly, sameSite: 'none', secure: true
✅ Auth middleware hỗ trợ lấy token từ cookies
✅ Socket.IO CORS configuration
✅ Test file với 5 scenarios
✅ Swagger documentation updated
✅ Frontend: fetch dengan credentials: 'include'
✅ Environment variables setup
```

---

## 💡 Best Practices

1. **Không bao giờ** lưu sensitive data ngoài cookies (HttpOnly)
2. **Luôn** bật HTTPS ở production (secure: true)
3. **Kiểm tra** Set-Cookie headers trong browser DevTools
4. **Test** cross-domain cookies trước deploy
5. **Rotate** token khi cần (invalidate old cookies)
6. **Monitor** cookie security headers

---

**Thay đổi hoàn tất! 🎉**

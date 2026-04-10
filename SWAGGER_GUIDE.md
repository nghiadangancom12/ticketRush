# 📚 Swagger UI - API Documentation Guide

## ✅ Swagger UI is now working!

Swagger UI cho phép bạn xem, thử nghiệm tất cả các API endpoint trực tiếp trong trình duyệt.

### 🌐 Cách Truy Cập

1. **Khởi động server:**
   ```bash
   npm start
   ```
   Server sẽ chạy trên `http://localhost:3000`

2. **Mở Swagger UI:**
   - Truy cập: `http://localhost:3000/api-docs`
   - Hoặc: `http://localhost:3000/api-docs/`

### 🔑 Sử Dụng JWT Token

1. **Đăng nhập để lấy token:**
   - Mở Swagger UI
   - Tìm endpoint `/api/auth/login` 
   - Click "Try it out"
   - Nhập email và password
   - Click "Execute"
   - Sao chép `accessToken` từ response

2. **Sử dụng token cho API khác:**
   - Click nút "Authorize" ở đầu trang (khóa 🔒)
   - Dán token vào: `Bearer <token_của_bạn>`
   - Click "Authorize"
   - Tất cả các endpoint có `🔒` giờ đã được xác thực

### 📋 Danh Sách Endpoints

#### 🔓 Không Cần Xác Thực
- `GET /api/events` - Lấy danh sách sự kiện
- `GET /api/events/{id}` - Chi tiết sự kiện
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập

#### 🔒 Cần Xác Thực (Tất cả user)
- `GET /api/users/me` - Lấy profile
- `PATCH /api/users/me` - Cập nhật profile
- `GET /api/customers/purchaseHistory` - Lịch sử mua hàng
- `POST /api/seats/hold` - Giữ ghế
- `POST /api/seats/checkout` - Thanh toán

#### 🔐 Chỉ Admin
- `POST /api/events` - Tạo sự kiện
- `PATCH /api/events/{id}/image` - Cập nhật ảnh sự kiện
- `PATCH /api/users/{userId}/grant-admin` - Cấp quyền admin
- `PATCH /api/users/{userId}/revoke-admin` - Hủy quyền admin
- `GET /api/admin/dashboard` - Thống kê
- `GET /api/admin/customer-analytics` - Phân tích khách

### 🧪 Ví Dụ Thử Nghiệm

1. **Đăng ký tài khoản:**
   ```json
   {
     "email": "test@example.com",
     "password": "Test@123",
     "full_name": "Test User"
   }
   ```

2. **Đăng nhập:**
   ```json
   {
     "email": "test@example.com",
     "password": "Test@123"
   }
   ```

3. **Cập nhật profile:**
   ```json
   {
     "avatar_url": "https://example.com/avatar.jpg",
     "full_name": "New Name"
   }
   ```

4. **Giữ ghế:**
   ```json
   {
     "eventId": "event-uuid-here",
     "seatIds": ["seat-uuid-1", "seat-uuid-2"]
   }
   ```

### 🛠️ Khắc Phục Sự Cố

**Q: Swagger UI hiện 404**
- Kiểm tra server có chạy: `npm start`
- Mở `http://localhost:3000` (nên thấy lỗi 404 cho `/`)
- Thử `http://localhost:3000/api-docs/` (với dấu `/` cuối)

**Q: "No server is available" trong Swagger**
- Kiểm tra `servers:` section trong `swagger.yaml`
- URL phải là `http://localhost:3000` (không `/api`)

**Q: Token không hoạt động**
- Đảm bảo format: `Bearer <token>`
- Token hết hạn sau 24 giờ
- Đăng nhập lại để lấy token mới

**Q: Endpoint thành 403 Forbidden**
- Kiểm tra bạn có cấp quyền admin không
- Admin có thể thực hiện: tạo sự kiện, cập nhật ảnh, cấp quyền
- User bình thường chỉ có thể: mua vé, xem profile

### 📝 Ghi Chú

- Swagger UI là interactive documentation - bạn có thể thử các API ngay từ đây
- Không cần Postman hay bất kỳ tool khác
- Tất cả các response body được tài liệu hóa
- Click "Schema" để xem mô tả chi tiết các fields

### 🔗 URLs

- **Swagger UI**: `http://localhost:3000/api-docs`
- **Swagger JSON**: `http://localhost:3000/api-docs/swagger.json`
- **Server API**: `http://localhost:3000/api`

---

Chúc bạn sử dụng Swagger UI vui vẻ! 🎉

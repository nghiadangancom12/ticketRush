# TicketRush - MCS Pattern Implementation

## ✅ Hoàn thành: Sắp xếp lại Modules theo MCS (Model-Controller-Service)

### 📁 Cấu trúc Module (Chuẩn MCS)

```
modules/
├── auth/
│   ├── authController.js
│   ├── authService.js
│   ├── authRoutes.js
│   └── auth.middleware.js
│
├── users/
│   ├── usersController.js      ✨ NEW
│   ├── userService.js          ✏️ REFACTORED (instance export)
│   ├── userRepository.js       ✏️ RENAMED (lowercase)
│   └── usersRoutes.js          ✨ NEW
│
├── customers/
│   ├── customerController.js
│   ├── customerService.js      ✏️ REFACTORED (no inheritance)
│   └── customerRoutes.js       ✨ NEW
│
├── admin/
│   ├── adminController.js
│   ├── adminService.js         ✏️ REFACTORED (no inheritance)
│   └── adminRoutes.js          ✨ NEW
│
├── events/
│   ├── eventController.js
│   ├── eventService.js
│   └── eventRoutes.js
│
├── seats/
│   ├── seatController.js
│   └── seatRoutes.js
│
└── errorHandling/
    ├── globalErrorHandler.js
    ├── catchAsync.js
    └── AppError.js
```

## 🔄 API Routes

### Authentication
- `POST   /api/auth/register`    - Đăng ký
- `POST   /api/auth/login`       - Đăng nhập

### User Management
- `GET    /api/users/me`         - Lấy thông tin profile (require auth)
- `PATCH  /api/users/me`         - Cập nhật profile (require auth)

### Customer
- `GET    /api/customers/me`     - Lấy profile + orders + locked seats (require auth)  
- `PATCH  /api/customers/me`     - Cập nhật profile customer (require auth)

### Admin
- `GET    /api/admin/dashboard`          - Dashboard stats (require admin)
- `GET    /api/admin/customer-analytics` - Customer analytics (require admin)

### Events
- `GET    /api/events`           - Danh sách events
- `GET    /api/events/:id`       - Chi tiết event
- `POST   /api/events`           - Tạo event (require admin)

### Seats
- `POST   /api/seats/hold`       - Giữ ghế (require auth)
- `POST   /api/seats/checkout`   - Checkout (require auth)

## 🎨 Frontend Profile Page (/me)

### Features
✅ **Avatar Management**
   - Upload avatar URL (lưu vào database)
   - Hiển thị fallback initials nếu không có avatar

✅ **Personal Information**
   - Tên đầy đủ (Full Name)
   - Ngày sinh (Date of Birth)
   - Giới tính (Gender: Nam, Nữ, Khác)
   - Email
   - Role (Admin/Customer)

✅ **Seats Management**
   - Danh sách ghế đang giữ (LOCKED)
   - Countdown timer (60s) cho mỗi ghế
   - Hiển thị sự kiện và vị trí ghế

✅ **Order History**
   - Danh sách tất cả đơn hàng
   - Trạng thái đơn hàng (PENDING/PAID/CANCELLED)
   - Tổng giá tiền
   - Chi tiết vé (zone, row, seat number)

### UI Components
- **Glass-panel** design với blur effect
- **Responsive grid** (2 cột trên desktop, 1 cột trên mobile)
- **Edit mode** - Toggle edit/save với validation
- **Alert messages** - Success/error notifications
- **Badge** - Role indicator (👑 Admin / 🎫 Customer)

## 🗄️ Database Schema Updates

### Users Table
```javascript
model users {
  id            String       @id
  email         String       @unique
  password      String
  full_name     String
  date_of_birth DateTime?
  gender        gender_enum?
  avatar_url    String?      ✨ NEW FIELD
  role          role_enum?
  created_at    DateTime?
  // ... relations
}
```

## 💾 How to Use

### 1. Start Backend Server
```bash
node server.js
```

### 2. Go to Profile Page
- Frontend: Navigate to `/me`
- URL: `http://localhost:5173/me`
- Requires authentication (login first)

### 3. Edit Profile
1. Click "✏️ Chỉnh sửa" button
2. Update fields:
   - Full name
   - Date of birth
   - Gender
   - Avatar URL (paste image URL)
3. Click "💾 Lưu" to save

### 4. View Locked Seats
- Shows all locked seats with expiry timer
- Auto-updates every second

### 5. View Order History
- Click on any order to see details
- Shows all tickets in that order
- Displays price and status

## 🔐 Authentication

### Token Usage
```javascript
// Include in requests:
headers: {
  Authorization: 'Bearer YOUR_JWT_TOKEN'
}
```

### Token stored in localStorage as 'token'
```javascript
localStorage.getItem('token')
localStorage.getItem('userId')
localStorage.setItem('avatarUrl', url) // Optional for client cache
```

## 🚀 Testing

Run test-endpoints.js to verify structure:
```bash
node test-endpoints.js
```

## 📋 Naming Conventions (MCS)

### Controllers: `xxxController.js`
- Methods: `getOne`, `getAll`, `create`, `update`, `delete`
- Export object: `module.exports = { getOne, getAll, ... }`

### Services: `xxxService.js`
- Methods: Business logic for entities
- Export: Instance (`module.exports = new XxxService()`)

### Repositories: `xxxRepository.js` (Optional, for data access)
- Methods: Direct database queries
- Export: Instance

### Routes: `xxxRoutes.js`
- Define HTTP methods and endpoints
- Apply middlewares (auth, validation, etc.)
- Export Express router

## 🎯 Next Steps

1. **Database Migration**: Run Prisma migration for avatar_url field
   ```bash
   npx prisma migrate dev --name add_avatar_url
   ```

2. **Testing**: Use Postman/Insomnia to test all endpoints

3. **Frontend Improvements**:
   - Add image upload dialog
   - Add form validation
   - Add loading skeletons

4. **Additional Features**:
   - Username change
   - Email verification
   - Password change
   - Profile picture crop/resize

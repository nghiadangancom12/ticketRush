# 🎟️ TicketRush

**TicketRush** là hệ thống đặt vé sự kiện trực tuyến với kiến trúc full-stack hiện đại, hỗ trợ đặt vé real-time, hàng đợi ảo (Virtual Queue), và thanh toán mượt mà.

---

## 🏗️ Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| **Backend** | Node.js, Express v5 |
| **Frontend** | React 19, Vite, React Router v7 |
| **Database** | PostgreSQL 16 (via Prisma ORM) |
| **Cache / Queue** | Redis 7, BullMQ |
| **Real-time** | Socket.IO |
| **Auth** | JWT (cookie-based) |
| **API Docs** | Swagger UI (`/api-docs`) |
| **Containerization** | Docker, Docker Compose |

---

## 📁 Cấu trúc thư mục

```
ticketRush/
├── app.js                  # Express app (middleware, routes)
├── server.js               # Entry point (HTTP server, Socket.IO, BullMQ)
├── config/                 # Kết nối database, Redis
├── modules/                # Các module nghiệp vụ (Clean Architecture)
│   ├── auth/               # Đăng nhập, đăng ký, JWT
│   ├── users/              # Quản lý người dùng
│   ├── events/             # Quản lý sự kiện
│   ├── Booking/            # Đặt vé, khóa ghế
│   ├── orders/             # Quản lý đơn hàng
│   ├── queue/              # Hàng đợi ảo (Virtual Queue)
│   ├── categories/         # Danh mục sự kiện
│   ├── customers/          # Thông tin khách hàng
│   ├── admin/              # Dashboard quản trị
│   ├── jobs/               # BullMQ Workers (email, nhả ghế)
│   └── errorHandling/      # Xử lý lỗi toàn cục
├── prisma/
│   ├── schema.prisma       # Schema database
│   ├── seed.js             # Dữ liệu mẫu
│   └── migrations/         # Lịch sử migrations
├── frontend/               # React app (Vite)
│   └── src/
│       └── pages/          # HomePage, EventDetailPage, CheckoutPage, AdminPage...
├── public/                 # Static files (ảnh upload)
├── swagger.yaml            # API documentation
├── docker-compose.yml      # Stack: Postgres + Redis + API + Workers
├── Dockerfile
└── .env.example            # Mẫu biến môi trường
```

---

## ⚙️ Yêu cầu hệ thống

Trước khi bắt đầu, hãy đảm bảo đã cài đặt:

| Phần mềm | Phiên bản tối thiểu |
|----------|---------------------|
| [Node.js](https://nodejs.org/) | v20+ |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | v24+ |
| [Git](https://git-scm.com/) | Bất kỳ |

> **Lưu ý:** PostgreSQL và Redis **không cần cài trực tiếp** — Docker sẽ lo phần đó.

---

## 🚀 Hướng dẫn chạy project (Local Development)

### Bước 1 — Clone repository

```bash
git clone https://github.com/<your-username>/ticketRush.git
cd ticketRush
```

---

### Bước 2 — Tạo file `.env`

Sao chép file mẫu và điền thông tin:

```bash
cp .env.example .env
```

Mở file `.env` và chỉnh sửa các giá trị sau (quan trọng nhất):

```env
# 🗄️ Database — khớp với docker-compose.yml
DATABASE_URL=postgresql://user:password@localhost:5432/ticketrush

# 🔴 Redis
REDIS_URL=redis://localhost:6379

# 🔑 JWT — thay bằng chuỗi bí mật của bạn
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_COOKIE_EXPIRES_IN=1

# 🌐 URLs (giữ nguyên khi chạy local)
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
NODE_ENV=development
```

> **Email (tùy chọn):** Nếu muốn gửi email xác nhận, điền thêm `EMAIL_USER` và `EMAIL_PASS` (Gmail App Password).

---

### Bước 3 — Khởi động Docker (Database + Redis)

```bash
docker compose up -d postgres redis
```

Kiểm tra container đã chạy:

```bash
docker compose ps
```

Chờ đến khi cột `Status` hiện `healthy` cho service `postgres`.

---

### Bước 4 — Cài dependencies & khởi tạo Database

```bash
# Cài dependencies cho backend
npm install

# Tạo bảng trong database (chạy migrations)
npx prisma migrate deploy

# (Tùy chọn) Seed dữ liệu mẫu vào database
npm run seed
```

> `npm run seed` sẽ tạo sẵn tài khoản admin, sự kiện mẫu, ghế ngồi, và danh mục để test.

---

### Bước 5 — Chạy Backend

```bash
# Chạy với nodemon (tự reload khi thay code)
nodemon server.js
```

Hoặc dùng script có sẵn:

```bash
npm run start:dev
```

Backend sẽ chạy tại: **http://localhost:3000**  
API Docs (Swagger): **http://localhost:3000/api-docs**

---

### Bước 6 — Chạy Frontend

Mở terminal mới:

```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:5173**

---

## 🔑 Tài khoản mặc định (sau khi seed)

Sau khi chạy `npm run seed`, bạn có thể đăng nhập bằng:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@ticketrush.com` | `Admin123!` |
| **Customer** | `customer@ticketrush.com` | `Customer123!` |

> Xem file `prisma/seed.js` để biết thêm tài khoản mẫu.

---

## 🐳 Chạy toàn bộ stack bằng Docker Compose

Nếu muốn chạy **tất cả services** (API + Workers + DB + Redis) bằng Docker:

```bash
# Build và khởi động toàn bộ stack
docker compose up -d --build

# Seed dữ liệu mẫu vào container
docker compose exec api npm run seed
```

| Service | URL |
|---------|-----|
| Backend API | http://localhost:3000 |
| API Docs | http://localhost:3000/api-docs |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

> **Frontend không có trong `docker-compose.yml`** — vẫn chạy thủ công bằng `npm run dev` trong thư mục `frontend/`.

---

## 🧪 Chạy Tests

```bash
# Unit tests (Jest)
npm test

# Load testing với k6 (cần cài k6 riêng: https://k6.io/docs/get-started/installation/)
npm run seed:k6              # Seed dữ liệu cho k6
npm run k6:stack:up          # Khởi động stack k6

npm run k6:seat              # Test tranh ghế đồng thời
npm run k6:queue             # Test hàng đợi ảo
npm run k6:mixed             # Test end-to-end hỗn hợp
npm run k6:stress            # Stress test
```

---

## 📡 API Endpoints chính

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/api/auth/signup` | Đăng ký tài khoản |
| `POST` | `/api/auth/login` | Đăng nhập |
| `GET` | `/api/events` | Danh sách sự kiện |
| `GET` | `/api/events/:id` | Chi tiết sự kiện |
| `POST` | `/api/booking` | Khóa ghế (đặt vé) |
| `POST` | `/api/orders` | Tạo đơn hàng |
| `GET` | `/api/users/me/tickets` | Vé của tôi |
| `GET` | `/api/queue/status` | Trạng thái hàng đợi |

📖 Xem đầy đủ tại: **http://localhost:3000/api-docs**

---

## 🔧 Các lệnh hữu ích

```bash
# Xem log database trực tiếp
npx prisma studio

# Reset database (xóa sạch + migrate lại)
npx prisma migrate reset

# Tạo migration mới khi thay đổi schema
npx prisma migrate dev --name <tên_migration>

# Xem log Docker
docker compose logs -f api

# Dừng toàn bộ Docker containers
docker compose down
```

---

## ❓ Xử lý lỗi thường gặp

### Lỗi: `Can't reach database server at localhost:5432`
→ Docker chưa chạy hoặc PostgreSQL chưa khởi động xong.  
Chạy: `docker compose up -d postgres` và chờ vài giây.

### Lỗi: `Redis connection refused`
→ Redis chưa chạy.  
Chạy: `docker compose up -d redis`

### Lỗi: `Environment variable not found: DATABASE_URL`
→ Bạn chưa tạo file `.env`.  
Chạy: `cp .env.example .env`

### Lỗi: `Table doesn't exist` / Prisma migration errors
→ Chạy lại migration:  
```bash
npx prisma migrate deploy
```

### Port 3000 hoặc 5173 đã bị chiếm
→ Kiểm tra và kill process đang dùng port:
```bash
# Windows
netstat -aon | findstr :3000
taskkill /PID <PID> /F
```

---

## 📄 License

MIT © TicketRush Team

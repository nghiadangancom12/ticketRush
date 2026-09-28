# 🎟️ TicketRush — Hệ Thống Phân Phối Vé Sự Kiện & Quản Lý Đặt Chỗ Thời Gian Thực

**TicketRush** là hệ thống phân phối vé sự kiện kiến trúc **Microservices (Database-per-Service)** được thiết kế chịu tải cực cao (Ticket Rush Flash Sale) với chiến lược **Proactive Read-Model CQRS**, **Virtual Queue (Lua Script)** và **Real-time Event-Driven Architecture**.

---

## 🏛️ Kiến Trúc Hệ Thống (Architecture Overview)

```
                       ┌──────────────────────────────┐
                       │  Kong API Gateway (:8000)    │
                       └──────────────┬───────────────┘
                                      │
         ┌───────────────┬────────────┼───────────────┬───────────────┐
         ▼               ▼            ▼               ▼               ▼
 ┌──────────────┐ ┌────────────┐ ┌───────────┐ ┌─────────────┐ ┌──────────────┐
 │ Auth Service │ │User Service│ │  Catalog  │ │ Booking Svc │ │ Queue Service│
 │   (:3010)    │ │  (:3020)   │ │  (:3030)  │ │   (:3040)   │ │   (:3001)    │
 └───────┬──────┘ └─────┬──────┘ └─────┬─────┘ └──────┬──────┘ └──────┬───────┘
         │              │              │              │               │
         ▼              ▼              ▼              ▼               │
  ┌──────────────┐ ┌──────────┐ ┌─────────────┐ ┌─────────────┐       │
  │   auth_db    │ │ auth_db  │ │ catalog_db  │ │ booking_db  │       │
  │   (:5433)    │ │ (:5433)  │ │   (:5434)   │ │   (:5435)   │       │
  └──────────────┘ └──────────┘ └─────────────┘ └──────┬──────┘       │
                                                       │              │
 ┌─────────────────────────────────────────────────────┼──────────────┴──────┐
 │                            Redis Server (:6379)                           │
 │  - CQRS Read Models (cache:seatmap, cache:events)                         │
 │  - Virtual Queue State (Sorted Sets + Lua Scripts)                        │
 │  - BullMQ Queues (email, seat-release)                                    │
 │  - Pub/Sub Channel Catalog                                                │
 └─────────────────────────┬─────────────────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┬────────────────┐
          ▼                ▼                ▼                ▼
   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
   │Worker Queue │  │Worker Email │  │Worker Release│  │ Worker Sync │
   └─────────────┘  └─────────────┘  └─────────────┘  └──────┬──────┘
                                                             │
                                                             ▼
                                                    ┌─────────────────┐
                                                    │  analytics_db   │
                                                    │     (:5436)     │
                                                    └─────────────────┘
```

---

## 📦 Cấu Trúc Microservices & Single Responsibility

| Service / Container | Port | Description | Dockerfile Path |
|---|---|---|---|
| **Kong API Gateway** | `:8000` / `:8001` | Routing, Rate-limiting, JWT Verify, CORS, WS Upgrade | Official `kong:3.6-alpine` |
| **Auth Service** | `:3010` | Đăng ký, đăng nhập, cấp và xác thực JWT token | [`services/auth-service/Dockerfile`](file:///c:/ticketRush/services/auth-service/Dockerfile) |
| **User Service** | `:3020` | Quản lý Profile cá nhân, API Composition lấy vé | [`services/user-service/Dockerfile`](file:///c:/ticketRush/services/user-service/Dockerfile) |
| **Event Catalog Service** | `:3030` | Catalog sự kiện, danh mục, CQRS Read/Write model | [`services/event-catalog-service/Dockerfile`](file:///c:/ticketRush/services/event-catalog-service/Dockerfile) |
| **Booking Service** | `:3040` | Giữ ghế (SP), Thanh toán, Trả ghế, CQRS Seatmap | [`services/booking-service/Dockerfile`](file:///c:/ticketRush/services/booking-service/Dockerfile) |
| **Virtual Queue Service** | `:3001` | Hàng chờ ảo (Virtual Queue) xử lý bằng Lua Script | [`services/queue-service/Dockerfile`](file:///c:/ticketRush/services/queue-service/Dockerfile) |
| **Socket Gateway** | `:3002` | Real-time WebSocket Gateway (Socket.io) | [`services/socket-gateway/Dockerfile`](file:///c:/ticketRush/services/socket-gateway/Dockerfile) |
| **Worker Analytics Sync** | Background | Đồng bộ dữ liệu sự kiện thanh toán về `analytics_db` | Integrated Worker |
| **Worker Seat Release** | Background | Tự động nhả ghế sau 60s timeout | BullMQ Worker |
| **Worker Email** | Background | Gửi email đính kèm QR Code vé điện tử | BullMQ Worker |

---

## 🗄️ Kiến Trúc Database-per-Service (4 PostgreSQL Instances)

1. **`auth_db` (Port `:5433`)**:
   - Bảng `users`: Thông tin định danh, mật khẩu băm, role.
2. **`catalog_db` (Port `:5434`)**:
   - Bảng `events`, `categories`, `zones`: Quản lý danh mục và thông tin sự kiện.
3. **`booking_db` (Port `:5435`)**:
   - Bảng `seats` (denormalized: `zone_name`, `zone_price`, `event_id`).
   - Bảng `orders` (snapshot: `event_title`, `category_name`, `user_email`).
   - Bảng `tickets`: QR code vé điện tử.
   - **Stored Procedure**: `hold_seats_procedure` chống race condition giữ ghế.
4. **`analytics_db` (Port `:5436`)**:
   - Bảng `analytics_order_summary`: Materialized view tổng hợp dữ liệu phục vụ Admin Dashboard qua Pub/Sub sync.

---

## 🚀 Hướng Dẫn Khởi Chạy (Step-by-Step Run Guide)

### 1. Chuẩn bị File Cấu Hình `.env`

Tạo file `.env` tại thư mục gốc dự án (hoặc copy từ `.env.example`):

```bash
cp .env.example .env
```

Nội dung cấu hình cơ bản cho Docker Local:

```env
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=ticketrush_super_secret_jwt_key_2026

# Database URLs cho Docker Compose
AUTH_DATABASE_URL=postgresql://user:password@postgres-auth:5432/auth_db
CATALOG_DATABASE_URL=postgresql://user:password@postgres-catalog:5432/catalog_db
BOOKING_DATABASE_URL=postgresql://user:password@postgres-booking:5432/booking_db
ANALYTICS_DATABASE_URL=postgresql://user:password@postgres-analytics:5432/analytics_db
REDIS_URL=redis://redis:6379
```

---

### 2. Chạy Hệ Thống Bằng Docker Compose

Khởi chạy toàn bộ 4 PostgreSQL Databases, Redis, Kong Gateway, 6 Microservices và 4 Workers bằng duy nhất 1 lệnh:

```bash
docker-compose up -d --build
```

Kiểm tra trạng thái chạy của tất cả các container:

```bash
docker-compose ps
```

---

### 3. Thực Thi Data Migration & Khởi Tạo Stored Procedure

Chạy script migration tự động để nạp schema cho cả 4 database và đăng ký Stored Procedure `hold_seats_procedure` trên `booking_db`:

```bash
node scripts/migrate-db-per-service.js
```

Hoặc nạp dữ liệu mẫu cho kiểm thử:

```bash
node prisma/seed.js
```

---

### 4. Chạy Kiểm Thử Tự Động (Integration Tests)

Thực thi bộ test tích hợp toàn diện kiến trúc Microservices & CQRS & Database-per-Service:

```bash
npx jest tests/microservices.test.js
```

---

## 📘 Tài Liệu OpenAPI / Swagger API Docs

Hệ thống đã tích hợp đầy đủ giao diện **Swagger UI** giúp trải nghiệm và test API trực quan.

### 🌐 Cách Truy Cập:

- **Swagger UI (Core Proxy)**: `http://localhost:3000/api-docs`
- **Kong Gateway Proxy**: `http://localhost:8000/api-docs`
- **File Cấu Hình OpenAPI Specs**: [swagger.yaml](file:///c:/ticketRush/swagger.yaml)

### 📌 Các API Groups Trong Swagger:

1. **Authentication (`/api/auth`)**:
   - `POST /api/auth/register` — Đăng ký tài khoản
   - `POST /api/auth/login` — Đăng nhập (nhận JWT Cookie / Bearer Token)
   - `GET /api/auth/verify` — Endpoint xác thực nội bộ giữa các service
2. **Events Catalog (`/api/events`)**:
   - `GET /api/events` — Lấy danh sách sự kiện từ Redis Read Model
   - `GET /api/events/:id/landing` — Lấy thông tin Landing Page sự kiện
   - `POST /api/events` — Admin tạo sự kiện & tự động provision seats sang `booking_db`
3. **Booking & Orders (`/api/booking`)**:
   - `GET /api/booking/event/:eventId/seats` — Đọc sơ đồ ghế từ Redis Read Model (CQRS)
   - `POST /api/booking/hold` — Giữ ghế thời gian thực bằng Stored Procedure
   - `POST /api/booking/checkout` — Thanh toán & xuất vé điện tử kèm QR
   - `POST /api/booking/return` — Trả ghế giải phóng lượt
   - `GET /api/booking/my-tickets` — API Composition chống IDOR
4. **Virtual Queue (`/api/queue`)**:
   - `POST /api/queue/:eventId/join` — Đăng ký xếp hàng mua vé
   - `POST /api/queue/:eventId/heartbeat` — Gửi nhịp tim duy trì vị trí hàng chờ
5. **Admin Analytics (`/api/admin`)**:
   - `GET /api/admin/dashboard` — Thống kê tổng quan từ `analytics_db`
   - `GET /api/admin/customer-analytics` — Thống kê nhân khẩu học người mua

---

## 🛠️ Lệnh Bảo Trì Thường Dùng (Useful Commands)

```bash
# Xem log thời gian thực của booking service
docker-compose logs -f booking-service

# Xem log của worker xử lý nhả ghế
docker-compose logs -f worker-seat-release

# Khai tử & dọn dẹp toàn bộ container + volumes
docker-compose down -v
```

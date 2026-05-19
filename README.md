# 🎟️ TicketRush

**TicketRush** là một hệ thống đặt vé sự kiện tốc độ cao (High Concurrency Ticketing System) được thiết kế để chịu tải lớn trong các đợt mở bán vé (Flash Sales). Dự án áp dụng kiến trúc Virtual Queue (Hàng đợi ảo) và Background Jobs để đảm bảo tính công bằng và hiệu suất.

## 🌟 Tính năng nổi bật
*   **Virtual Queue (Hàng đợi ảo):** Kiểm soát lưu lượng người dùng truy cập vào sự kiện, tránh sập hệ thống (Crash) khi có quá đông người dùng.
*   **Real-time Seat Selection:** Cập nhật trạng thái ghế ngồi (Trống, Đang giữ, Đã bán) theo thời gian thực sử dụng Socket.io và Redis Pub/Sub.
*   **Background Processing:** Xử lý việc giải phóng ghế (nếu user không thanh toán sau 5 phút) và gửi email tự động bằng **BullMQ** & **Redis**.
*   **Security:** Rate Limiting (chống dội bom), XSS Sanitization, HTTP Parameter Pollution protection (HPP).
*   **Quản lý sự kiện:** Dashboard cho Admin để tạo sự kiện, phân bổ loại vé và thống kê doanh thu.

## 🛠 Tech Stack
*   **Frontend:** React, Vite, React Router DOM, Socket.io-client.
*   **Backend:** Node.js, Express.js.
*   **Database:** PostgreSQL + Prisma ORM.
*   **Caching & Message Queue:** Redis, BullMQ.
*   **Testing:** Jest (Unit/Integration Test), k6 (Load Testing).

---

## 🚀 Hướng dẫn cài đặt & chạy dự án (Local Development)

### Yêu cầu hệ thống (Prerequisites)
Để chạy dự án, máy bạn cần cài đặt sẵn:
*   [Node.js](https://nodejs.org/) (Khuyên dùng v18+).
*   [Git](https://git-scm.com/).
*   *(Tùy chọn nhưng khuyên dùng)* [Docker Desktop](https://www.docker.com/products/docker-desktop/) để chạy Database và Redis nhanh nhất.

### Bước 1: Clone Repository
Mở Terminal/Command Prompt và chạy lệnh:
```bash
git clone https://github.com/nghiadangancom12/ticketRush.git
cd ticketRush
```

### Bước 2: Thiết lập Biến môi trường
Tạo một file `.env` ở thư mục gốc (root) của dự án. Bạn có thể copy từ file mẫu:
```bash
cp .env.example .env
```
*(Hãy đảm bảo điền đủ các thông tin PostgreSQL và Redis URL trong file `.env`)*.

---

### Bước 3: Chạy dự án 

Bạn có 2 cách để chạy dự án: Sử dụng **Docker** (Rất dễ dàng) hoặc chạy **Thủ công** từng bước.

#### Cách 1: Chạy toàn bộ bằng Docker Compose (Dành cho Backend)
Nếu máy bạn đã có Docker, hệ thống đã cấu hình sẵn file `docker-compose.yml` bao gồm Postgres, Redis, API Server và các Worker.

```bash
docker compose up -d --build
```
*Backend sẽ chạy ở `http://localhost:3000`.*

Sau đó, bạn cần chạy Frontend ở một terminal khác:
```bash
cd frontend
npm install
npm run dev
```

#### Cách 2: Chạy Thủ công (Manual Setup)

**1. Khởi động PostgreSQL & Redis**
Bạn có thể cài đặt trực tiếp trên máy hoặc dùng file Docker Compose nhỏ gọn:
```bash
docker run -d --name ticketrush-redis -p 6379:6379 redis:7-alpine
docker run -d --name ticketrush-postgres -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=ticketrush -p 5432:5432 postgres:16
```
*(Nhớ cập nhật lại biến `DATABASE_URL` và `REDIS_URL` trong file `.env` theo đúng thông tin trên).*

**2. Cài đặt và khởi chạy Backend**
```bash
# Cài đặt thư viện
npm install

# Khởi tạo Database Schema
npx prisma migrate dev --name init

# (Tùy chọn) Đổ dữ liệu mẫu vào DB để test
npm run seed

# Chạy Backend (Chế độ dev với Nodemon)
npm run start:dev
```
*Backend sẽ chạy ở `http://localhost:3000`.*

**3. Cài đặt và khởi chạy Frontend**
Mở một Terminal mới:
```bash
cd frontend
npm install
npm run dev
```
*Frontend sẽ chạy ở `http://localhost:5173`.*

---

## 📚 Tài liệu API (Swagger Docs)
Khi Backend đang chạy, bạn có thể xem tài liệu API đầy đủ tại:
👉 **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

## 🧪 Testing
Dự án được trang bị sẵn các script test mạnh mẽ:

**1. Unit/Integration Test (Jest):**
```bash
npm run test
```

**2. Load Testing (k6):** (Kiểm tra khả năng chịu tải và Race Condition)
```bash
# Bật môi trường giám sát k6 (Grafana + InfluxDB)
npm run k6:stack:up

# Chạy test: Tranh giành ghế ngồi (Race Condition)
npm run k6:seat

# Chạy test: Hàng đợi ảo (Queue)
npm run k6:queue

# Chạy test: Chịu tải toàn diện (Stress Test)
npm run k6:stress
```

## 👥 Phân quyền (Roles)
*   `ADMIN`: Có toàn quyền quản lý sự kiện, danh mục và quản lý User.
*   `CUSTOMER`: Tìm kiếm, xếp hàng đợi và mua vé.

*Chúc bạn trải nghiệm dự án vui vẻ!* 🚀

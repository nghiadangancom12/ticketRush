# Bước 1: Sử dụng Node.js bản Alpine để tối ưu dung lượng
FROM node:20-alpine

# Bước 2: Cài đặt các thư viện hệ thống cần thiết cho Prisma và bảo mật
# Alpine rất nhẹ nên đôi khi thiếu các thư viện cơ bản cho Prisma/Postgres
RUN apk add --no-cache openssl libc6-compat

# Bước 3: Tạo thư mục làm việc trong container
WORKDIR /app

# Bước 4: Copy file cấu hình thư viện trước
# Việc này giúp Docker "cache" lại các node_modules, 
# nếu bạn không sửa package.json thì lần build sau sẽ cực nhanh.
COPY package*.json ./

# Bước 5: Cài đặt TOÀN BỘ dependencies (Bao gồm cả devDependencies)
# Bắt buộc phải cài đủ để Bước 7 có công cụ Prisma CLI tiến hành generate
RUN npm install

# Bước 6: Copy toàn bộ mã nguồn vào container
COPY . .

# Bước 7: Generate Prisma Client (CỰC KỲ QUAN TRỌNG)
# Bước này để Prisma hiểu được Schema của bạn bên trong môi trường Docker
RUN npx prisma generate

# Bước 8: Mở cổng 3000 cho API Server
EXPOSE 3000

# Bước 9: Lệnh mặc định để khởi chạy Server
# Lưu ý: Lệnh này sẽ bị ghi đè bởi "command" trong docker-compose.yml 
# khi bạn chạy Worker thay vì chạy API.
CMD ["npm", "run", "start:prod"]
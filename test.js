// Nạp biến môi trường từ file .env
require('dotenv').config(); 
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

// Tạo kết nối PostgreSQL với Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Tạo adapter
const adapter = new PrismaPg(pool);

// Khởi tạo PrismaClient với adapter
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("--- Đang kết nối tới Database 'ticketRush' ---");
  try {
    // Thử lấy dữ liệu từ bảng zones
    const data = await prisma.zones.findFirst();
    
    if (data) {
      console.log('✅ KẾT NỐI THÀNH CÔNG!');
      console.log('Dữ liệu mẫu từ bảng zones:', data);
    } else {
      console.log('✅ Kết nối OK nhưng bảng "zones" đang trống.');
    }
  } catch (err) {
    console.error('❌ Lỗi truy vấn:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
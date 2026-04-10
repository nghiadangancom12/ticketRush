require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seed() {
  console.log('--- KHỞI TẠO DỮ LIỆU MẪU ---');

  try {
    // 1. Tạo hoặc cập nhật account Admin
    const email = 'admin@ticketrush.com';
    const password = await bcrypt.hash('admin123', 10);
    
    let adminUser = await prisma.users.findUnique({ where: { email } });
    if (!adminUser) {
      adminUser = await prisma.users.create({
        data: {
          email,
          password,
          full_name: 'Super Admin',
          role: 'ADMIN' // Quan trọng
        }
      });
      console.log('✅ Đã tạo tài khoản Admin: admin@ticketrush.com / admin123');
    } else {
      await prisma.users.update({
        where: { email },
        data: { role: 'ADMIN' }
      });
      console.log('✅ Tài khoản Admin cữ rã tồn tại: admin@ticketrush.com. Đã đảm bảo quyền ADMIN.');
    }

    // 2. Tạo một Event mẫu
    const event = await prisma.events.create({
      data: {
        title: 'Đêm Nhạc Hội Bùng Nổ',
        description: 'Sự kiện âm nhạc hoành tráng nhất năm',
        start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày sau
        location: 'Sân vận động Mỹ Đình',
        status: 'PUBLISHED',
        admin_id: adminUser.id
      }
    });

    console.log(`✅ Đã tạo sự kiện: ${event.title}`);

    // 3. Tạo Zone và Ma trận Seats cho Event này
    // Zone A: VIP - 2 hàng, mỗi hàng 5 ghế = 10 ghế
    const zoneA = await prisma.zones.create({
      data: {
        event_id: event.id,
        name: 'Khu VIP A',
        price: 150.00,
        total_seats: 10
      }
    });

    const seatsToCreate = [];
    const rows = ['A', 'B'];
    for (let r of rows) {
      for (let i = 1; i <= 5; i++) {
        seatsToCreate.push({
          zone_id: zoneA.id,
          row_label: r,
          seat_number: i,
          status: 'AVAILABLE'
        });
      }
    }

    // Zone B: STANDARD - 3 hàng, mỗi hàng 8 ghế = 24 ghế
    const zoneB = await prisma.zones.create({
      data: {
        event_id: event.id,
        name: 'Khu Standard B',
        price: 50.00,
        total_seats: 24
      }
    });

    const rowsB = ['C', 'D', 'E'];
    for (let r of rowsB) {
      for (let i = 1; i <= 8; i++) {
        seatsToCreate.push({
          zone_id: zoneB.id,
          row_label: r,
          seat_number: i,
          status: 'AVAILABLE'
        });
      }
    }

    // Insert tất cả Seats
    await prisma.seats.createMany({
      data: seatsToCreate
    });

    console.log(`✅ Đã tạo ${seatsToCreate.length} ghế ngồi cho sự kiện.`);
    console.log('--- KHỞI TẠO HOÀN TẤT ---');

  } catch (error) {
    console.error('❌ Lỗi seed data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();

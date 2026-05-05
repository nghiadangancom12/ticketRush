/**
 * TicketRush - Database Seed Script
 * Khởi tạo dữ liệu mẫu cho môi trường phát triển
 *
 * Chạy: node prisma/seed.js
 * Hoặc: npx prisma db seed (nếu đã cấu hình trong package.json)
 */

const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config();

// ─── Khởi tạo Prisma Client trực tiếp (không qua extension soft-delete) ───────
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── Hằng số ─────────────────────────────────────────────────────────────────
const SALT_ROUNDS = 12;
const HASH_PASSWORD = async (pw) => bcrypt.hash(pw, SALT_ROUNDS);

// ─── Màu log ──────────────────────────────────────────────────────────────────
const log = {
  info:    (msg) => console.log(`\x1b[36m[INFO]\x1b[0m  ${msg}`),
  success: (msg) => console.log(`\x1b[32m[OK]\x1b[0m    ${msg}`),
  warn:    (msg) => console.log(`\x1b[33m[WARN]\x1b[0m  ${msg}`),
  error:   (msg) => console.error(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
  section: (msg) => console.log(`\n\x1b[35m══════════════════════════════════\x1b[0m\n\x1b[1m  ${msg}\x1b[0m\n\x1b[35m══════════════════════════════════\x1b[0m`),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Tạo danh sách ghế cho một zone.
 * @param {string} zoneId  - UUID của zone
 * @param {number} total   - Tổng số ghế
 * @param {number} cols    - Số cột mỗi hàng (mặc định 10)
 */
function buildSeats(zoneId, total, cols = 10) {
  const seats = [];
  const rows = Math.ceil(total / cols);
  const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  let count = 0;
  for (let r = 0; r < rows && count < total; r++) {
    const rowLabel = ALPHA[r] || `R${r + 1}`;
    for (let c = 1; c <= cols && count < total; c++) {
      seats.push({
        zone_id:     zoneId,
        row_label:   rowLabel,
        seat_number: c,
        status:      'AVAILABLE',
      });
      count++;
    }
  }
  return seats;
}

// ─── Dữ liệu seed ─────────────────────────────────────────────────────────────

const USERS_DATA = [
  // Admins
  {
    email:         'admin@ticketrush.vn',
    full_name:     'Super Admin',
    password_raw:  'Admin@123456',
    role:          'ADMIN',
    gender:        'MALE',
    date_of_birth: new Date('1990-01-15'),
  },
  {
    email:         'nam@example.com',
    full_name:     'Nguyễn Văn Nam',
    password_raw:  'Admin@123456',
    role:          'ADMIN',
    gender:        'MALE',
    date_of_birth: new Date('1992-05-20'),
  },
  // Customers
  {
    email:         'nghia@example.com',
    full_name:     'Trần Thị Nghĩa',
    password_raw:  'Customer@123',
    role:          'CUSTOMER',
    gender:        'FEMALE',
    date_of_birth: new Date('1998-08-12'),
  },
  {
    email:         'linh.nguyen@example.com',
    full_name:     'Nguyễn Thị Linh',
    password_raw:  'Customer@123',
    role:          'CUSTOMER',
    gender:        'FEMALE',
    date_of_birth: new Date('1999-03-25'),
  },
  {
    email:         'hieu.tran@example.com',
    full_name:     'Trần Văn Hiếu',
    password_raw:  'Customer@123',
    role:          'CUSTOMER',
    gender:        'MALE',
    date_of_birth: new Date('1995-11-08'),
  },
  {
    email:         'mai.le@example.com',
    full_name:     'Lê Thị Mai',
    password_raw:  'Customer@123',
    role:          'CUSTOMER',
    gender:        'FEMALE',
    date_of_birth: new Date('2000-07-17'),
  },
  {
    email:         'tuan.pham@example.com',
    full_name:     'Phạm Văn Tuấn',
    password_raw:  'Customer@123',
    role:          'CUSTOMER',
    gender:        'MALE',
    date_of_birth: new Date('1997-04-02'),
  },
];

const CATEGORIES_DATA = [
  { name: 'Âm nhạc', description: 'Các buổi hòa nhạc, liveshow, festival âm nhạc' },
  { name: 'Hội thảo', description: 'Các buổi hội thảo, workshop, tech summit' },
  { name: 'Kịch nghệ', description: 'Nhạc kịch, kịch nói, show biểu diễn nghệ thuật' },
  { name: 'Thể thao', description: 'Các sự kiện thể thao, giải đấu, thế vận hội' },
  { name: 'Khác', description: 'Các sự kiện khác' },
];

/**
 * Cấu trúc sự kiện mẫu.
 * admin_id sẽ được gán sau khi tạo users.
 */
function getEventsData(adminId, categoriesMap) {
  return [
    // ── Sự kiện 1: Concert lớn ─────────────────────────────────────────────
    {
      title:       'Đêm Nhạc Hội Tụ 2025 – Live Concert',
      description: 'Đêm nhạc quy tụ hơn 20 nghệ sĩ hàng đầu Việt Nam, với màn trình diễn ánh sáng đẳng cấp quốc tế. Hứa hẹn là đêm nhạc hoành tráng nhất trong năm 2025.',
      image_url:   'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
      start_time:  new Date('2025-12-20T19:00:00+07:00'),
      location:    'Sân vận động Quốc gia Mỹ Đình, Hà Nội',
      status:      'PUBLISHED',
      admin_id:    adminId,
      category_id: categoriesMap['Âm nhạc'].id,
      zones: [
        { name: 'VIP',         price: 2_500_000, total_seats: 50  },
        { name: 'Hạng A',      price: 1_500_000, total_seats: 100 },
        { name: 'Hạng B',      price: 800_000,   total_seats: 200 },
        { name: 'Hạng C',      price: 350_000,   total_seats: 500 },
      ],
    },
    // ── Sự kiện 2: Festival âm nhạc điện tử ───────────────────────────────
    {
      title:       'VibeZone EDM Festival 2025',
      description: 'Lễ hội âm nhạc điện tử lớn nhất miền Nam với sự tham gia của các DJ quốc tế đình đám. 3 stage hoạt động liên tục từ 15h đến 2h sáng.',
      image_url:   'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
      start_time:  new Date('2025-11-15T15:00:00+07:00'),
      location:    'Dinh Thống Nhất, TP. Hồ Chí Minh',
      status:      'PUBLISHED',
      admin_id:    adminId,
      category_id: categoriesMap['Âm nhạc'].id,
      zones: [
        { name: 'VIP Lounge',    price: 3_000_000, total_seats: 30  },
        { name: 'Early Bird',    price: 500_000,   total_seats: 200 },
        { name: 'General',       price: 299_000,   total_seats: 800 },
      ],
    },
    // ── Sự kiện 3: Hội thảo tech ──────────────────────────────────────────
    {
      title:       'Vietnam Tech Summit 2025',
      description: 'Hội thảo công nghệ quốc tế lớn nhất Đông Nam Á, quy tụ hàng trăm diễn giả và chuyên gia hàng đầu thế giới về AI, Blockchain, và Cloud Computing.',
      image_url:   'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      start_time:  new Date('2025-10-10T09:00:00+07:00'),
      location:    'Trung tâm Hội nghị GEM Center, TP. Hồ Chí Minh',
      status:      'PUBLISHED',
      admin_id:    adminId,
      category_id: categoriesMap['Hội thảo'].id,
      zones: [
        { name: 'VIP Pass',      price: 5_000_000, total_seats: 20  },
        { name: 'Speaker Zone',  price: 2_000_000, total_seats: 50  },
        { name: 'Standard',      price: 800_000,   total_seats: 300 },
        { name: 'Online Viewer', price: 150_000,   total_seats: 1000 },
      ],
    },
    // ── Sự kiện 4: Show kịch nghệ ─────────────────────────────────────────
    {
      title:       'Vở Kịch "Biển Và Bờ" – Nhà Hát Kịch TP.HCM',
      description: 'Vở kịch tâm lý xã hội sâu sắc về hành trình tìm lại chính mình. Được đạo diễn bởi NSND Lê Văn Tĩnh với dàn diễn viên gạo cội.',
      image_url:   'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800',
      start_time:  new Date('2025-09-05T20:00:00+07:00'),
      location:    'Nhà Hát Kịch TP. Hồ Chí Minh, Q.1',
      status:      'PUBLISHED',
      admin_id:    adminId,
      category_id: categoriesMap['Kịch nghệ'].id,
      zones: [
        { name: 'Hàng ghế đầu', price: 600_000, total_seats: 30  },
        { name: 'Hàng ghế giữa', price: 400_000, total_seats: 80  },
        { name: 'Hàng ghế cuối', price: 200_000, total_seats: 90  },
      ],
    },
    // ── Sự kiện 5: DRAFT (chưa xuất bản) ─────────────────────────────────
    {
      title:       'Gala Dinner Cuối Năm 2025 (Draft)',
      description: 'Tiệc tất niên sang trọng dành riêng cho các đối tác chiến lược. Sự kiện đang trong giai đoạn lên kế hoạch.',
      image_url:   null,
      start_time:  new Date('2025-12-31T18:00:00+07:00'),
      location:    'Hotel Sofitel Legend Metropole, Hà Nội',
      status:      'DRAFT',
      admin_id:    adminId,
      category_id: categoriesMap['Khác'].id,
      zones: [
        { name: 'Bàn VIP',  price: 10_000_000, total_seats: 10 },
        { name: 'Bàn Thường', price: 3_000_000, total_seats: 30 },
      ],
    },
    // ── Sự kiện 6: CLOSED (đã đóng) ──────────────────────────────────────
    {
      title:       'Lễ Khai Mạc SEA Games 33 – Chuỗi Sự Kiện',
      description: 'Chuỗi sự kiện thể thao quốc tế – SEA Games 33. Vé đã hết, sự kiện đã kết thúc.',
      image_url:   'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
      start_time:  new Date('2025-05-01T10:00:00+07:00'),
      location:    'Sân vận động Hàng Đẫy, Hà Nội',
      status:      'CLOSED',
      admin_id:    adminId,
      category_id: categoriesMap['Thể thao'].id,
      zones: [
        { name: 'Khán đài A', price: 500_000, total_seats: 200 },
        { name: 'Khán đài B', price: 200_000, total_seats: 500 },
      ],
    },
  ];
}

// ─── Hàm seed chính ───────────────────────────────────────────────────────────

async function seed() {
  log.section('TicketRush – Bắt đầu Seed Database');

  // ── 1. Dọn dẹp dữ liệu cũ (theo thứ tự khóa ngoại) ──────────────────────
  log.info('Đang xóa dữ liệu cũ...');
  await prisma.tickets.deleteMany();
  await prisma.orders.deleteMany();
  await prisma.seats.deleteMany();
  await prisma.zones.deleteMany();
  await prisma.events.deleteMany();
  await prisma.categories.deleteMany();
  await prisma.users.deleteMany();
  log.success('Đã xóa sạch dữ liệu cũ.');

  // ── 1.5. Tạo Categories ───────────────────────────────────────────────────
  log.section('Tạo Categories');
  const categoriesMap = {};
  for (const c of CATEGORIES_DATA) {
    const category = await prisma.categories.create({
      data: c,
    });
    categoriesMap[c.name] = category;
  }
  log.success(`Đã tạo ${CATEGORIES_DATA.length} danh mục.`);

  // ── 2. Tạo Users ──────────────────────────────────────────────────────────
  log.section('Tạo Users');
  const createdUsers = [];

  for (const u of USERS_DATA) {
    const hashed = await HASH_PASSWORD(u.password_raw);
    const user = await prisma.users.create({
      data: {
        email:         u.email,
        full_name:     u.full_name,
        password:      hashed,
        role:          u.role,
        gender:        u.gender,
        date_of_birth: u.date_of_birth,
      },
    });
    createdUsers.push(user);
    log.success(`User: ${user.full_name} <${user.email}> [${user.role}]`);
  }

  const adminUser     = createdUsers.find((u) => u.email === 'admin@ticketrush.vn');
  const customers     = createdUsers.filter((u) => u.role === 'CUSTOMER');

  // ── 3. Tạo Events + Zones + Seats ─────────────────────────────────────────
  log.section('Tạo Events, Zones & Seats');
  const eventsData   = getEventsData(adminUser.id, categoriesMap);
  const createdEvents = [];

  for (const evData of eventsData) {
    const { zones: zonesData, ...eventFields } = evData;

    // Tạo event
    const event = await prisma.events.create({ data: eventFields });
    log.success(`Event: "${event.title}" [${event.status}]`);

    const createdZones = [];

    for (const zData of zonesData) {
      // Tạo zone
      const zone = await prisma.zones.create({
        data: {
          event_id:    event.id,
          name:        zData.name,
          price:       zData.price,
          total_seats: zData.total_seats,
        },
      });

      // Tạo ghế hàng loạt
      const seatsPayload = buildSeats(zone.id, zData.total_seats);
      await prisma.seats.createMany({ data: seatsPayload });

      createdZones.push(zone);
      log.info(`  └─ Zone "${zone.name}": ${zData.total_seats} ghế @ ${Number(zone.price).toLocaleString('vi-VN')}đ`);
    }

    createdEvents.push({ event, zones: createdZones });
  }

  // ── 4. Tạo Orders + Tickets mẫu ──────────────────────────────────────────
  log.section('Tạo Orders & Tickets mẫu');

  // Chỉ tạo order cho các sự kiện PUBLISHED
  const publishedEvents = createdEvents.filter((e) => e.event.status === 'PUBLISHED');

  let orderCount  = 0;
  let ticketCount = 0;

  for (let i = 0; i < customers.length; i++) {
    const customer = customers[i];
    // Mỗi customer mua vé ở 1-2 sự kiện
    const targetEvents = publishedEvents.slice(i % publishedEvents.length, (i % publishedEvents.length) + 2);

    for (const { event, zones } of targetEvents) {
      if (!zones.length) continue;

      // Chọn zone rẻ nhất
      const zone = zones.sort((a, b) => Number(a.price) - Number(b.price))[0];

      // Lấy 2 ghế AVAILABLE đầu tiên của zone đó
      const availableSeats = await prisma.seats.findMany({
        where:  { zone_id: zone.id, status: 'AVAILABLE' },
        take:   2,
        orderBy: [{ row_label: 'asc' }, { seat_number: 'asc' }],
      });

      if (availableSeats.length === 0) {
        log.warn(`  Không còn ghế trống ở zone "${zone.name}" – bỏ qua.`);
        continue;
      }

      const qty          = availableSeats.length;
      const totalAmount  = Number(zone.price) * qty;
      const isPaid       = i % 3 !== 2; // 2/3 orders có trạng thái PAID

      // Tạo order
      const order = await prisma.orders.create({
        data: {
          user_id:      customer.id,
          event_id:     event.id,
          total_amount: totalAmount,
          status:       isPaid ? 'PAID' : 'PENDING',
        },
      });
      orderCount++;

      // Tạo tickets & đánh dấu ghế là SOLD
      for (const seat of availableSeats) {
        const qrPayload = `TICKET-${order.id.slice(0, 8)}-${seat.id.slice(0, 8)}-${Date.now()}`;

        await prisma.tickets.create({
          data: {
            order_id: order.id,
            seat_id:  seat.id,
            qr_code:  qrPayload,
          },
        });

        // Cập nhật trạng thái ghế
        await prisma.seats.update({
          where: { id: seat.id },
          data:  { status: isPaid ? 'SOLD' : 'LOCKED', locked_by: customer.id },
        });

        ticketCount++;
      }

      log.success(
        `  Order: ${customer.full_name} → "${event.title}" | ${qty} vé | ${totalAmount.toLocaleString('vi-VN')}đ [${isPaid ? 'PAID' : 'PENDING'}]`
      );
    }
  }

  // ── 5. Tổng kết ──────────────────────────────────────────────────────────
  log.section('Kết Quả Seed');

  const summary = {
    users:      await prisma.users.count(),
    categories: await prisma.categories.count(),
    events:     await prisma.events.count(),
    zones:      await prisma.zones.count(),
    seats:      await prisma.seats.count(),
    orders:     await prisma.orders.count(),
    tickets:    await prisma.tickets.count(),
  };

  console.table(summary);

  console.log('\n\x1b[32m✅ Seed hoàn tất!\x1b[0m\n');
  console.log('\x1b[36m📋 Thông tin đăng nhập mẫu:\x1b[0m');
  console.log('┌──────────────────────────────────────┬──────────────────┐');
  console.log('│ Email                                │ Password         │');
  console.log('├──────────────────────────────────────┼──────────────────┤');
  for (const u of USERS_DATA) {
    const email = u.email.padEnd(36);
    const pass  = u.password_raw.padEnd(16);
    console.log(`│ ${email} │ ${pass} │`);
  }
  console.log('└──────────────────────────────────────┴──────────────────┘');
}

// ─── Chạy seed ────────────────────────────────────────────────────────────────
seed()
  .catch((err) => {
    log.error(err.message || err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

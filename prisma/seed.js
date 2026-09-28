/**
 * TicketRush — Multi-Database Seed Script for Database-per-Service Architecture
 * Seed dữ liệu mẫu đồng bộ qua 4 database: auth_db, catalog_db, booking_db, analytics_db
 * 
 * Chạy: node prisma/seed.js
 */

const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const { PrismaClient: PrismaAuth } = require('../generated/prisma-auth');
const { PrismaClient: PrismaCatalog } = require('../generated/prisma-catalog');
const { PrismaClient: PrismaBooking } = require('../generated/prisma-booking');
const { PrismaClient: PrismaAnalytics } = require('../generated/prisma-analytics');
const redis = require('../config/redis');

// Database URLs
const authUrl = process.env.AUTH_DATABASE_URL || 'postgresql://user:password@localhost:5433/auth_db';
const catalogUrl = process.env.CATALOG_DATABASE_URL || 'postgresql://user:password@localhost:5434/catalog_db';
const bookingUrl = process.env.BOOKING_DATABASE_URL || 'postgresql://user:password@localhost:5435/booking_db';
const analyticsUrl = process.env.ANALYTICS_DATABASE_URL || 'postgresql://user:password@localhost:5436/analytics_db';

const poolAuth = new Pool({ connectionString: authUrl });
const poolCatalog = new Pool({ connectionString: catalogUrl });
const poolBooking = new Pool({ connectionString: bookingUrl });
const poolAnalytics = new Pool({ connectionString: analyticsUrl });

const prismaAuth = new PrismaAuth({ adapter: new PrismaPg(poolAuth) });
const prismaCatalog = new PrismaCatalog({ adapter: new PrismaPg(poolCatalog) });
const prismaBooking = new PrismaBooking({ adapter: new PrismaPg(poolBooking) });
const prismaAnalytics = new PrismaAnalytics({ adapter: new PrismaPg(poolAnalytics) });

const SALT_ROUNDS = 10;
const HASH_PASSWORD = async (pw) => bcrypt.hash(pw, SALT_ROUNDS);

const log = {
  info:    (msg) => console.log(`\x1b[36m[INFO]\x1b[0m  ${msg}`),
  success: (msg) => console.log(`\x1b[32m[OK]\x1b[0m    ${msg}`),
  warn:    (msg) => console.log(`\x1b[33m[WARN]\x1b[0m  ${msg}`),
  error:   (msg) => console.error(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
  section: (msg) => console.log(`\n\x1b[35m══════════════════════════════════\x1b[0m\n\x1b[1m  ${msg}\x1b[0m\n\x1b[35m══════════════════════════════════\x1b[0m`),
};

function buildSeats(zoneId, zoneName, zonePrice, eventId, total, cols = 10) {
  const seats = [];
  const rows = Math.ceil(total / cols);
  const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  let count = 0;
  for (let r = 0; r < rows && count < total; r++) {
    const rowLabel = ALPHA[r] || `R${r + 1}`;
    for (let c = 1; c <= cols && count < total; c++) {
      seats.push({
        zone_id:     zoneId,
        zone_name:   zoneName,
        zone_price:  zonePrice,
        event_id:    eventId,
        row_label:   rowLabel,
        seat_number: c,
        status:      'AVAILABLE',
      });
      count++;
    }
  }
  return seats;
}

const USERS_DATA = [
  { email: 'admin@ticketrush.vn', full_name: 'Super Admin', password_raw: 'Admin@123456', role: 'ADMIN', gender: 'MALE', date_of_birth: new Date('1990-01-15') },
  { email: 'nam@example.com', full_name: 'Nguyễn Văn Nam', password_raw: 'Admin@123456', role: 'ADMIN', gender: 'MALE', date_of_birth: new Date('1992-05-20') },
  { email: 'nghia@example.com', full_name: 'Trần Thị Nghĩa', password_raw: 'Customer@123', role: 'CUSTOMER', gender: 'FEMALE', date_of_birth: new Date('1998-08-12') },
  { email: 'linh.nguyen@example.com', full_name: 'Nguyễn Thị Linh', password_raw: 'Customer@123', role: 'CUSTOMER', gender: 'FEMALE', date_of_birth: new Date('1999-03-25') },
  { email: 'hieu.tran@example.com', full_name: 'Trần Văn Hiếu', password_raw: 'Customer@123', role: 'CUSTOMER', gender: 'MALE', date_of_birth: new Date('1995-11-08') },
  { email: 'mai.le@example.com', full_name: 'Lê Thị Mai', password_raw: 'Customer@123', role: 'CUSTOMER', gender: 'FEMALE', date_of_birth: new Date('2000-07-17') },
  { email: 'tuan.pham@example.com', full_name: 'Phạm Văn Tuấn', password_raw: 'Customer@123', role: 'CUSTOMER', gender: 'MALE', date_of_birth: new Date('1997-04-02') },
];

const CATEGORIES_DATA = [
  { name: 'Âm nhạc', description: 'Các buổi hòa nhạc, liveshow, festival âm nhạc' },
  { name: 'Hội thảo', description: 'Các buổi hội thảo, workshop, tech summit' },
  { name: 'Kịch nghệ', description: 'Nhạc kịch, kịch nói, show biểu diễn nghệ thuật' },
  { name: 'Thể thao', description: 'Các sự kiện thể thao, giải đấu, thế vận hội' },
  { name: 'Triển lãm', description: 'Triển lãm nghệ thuật, bảo tàng, không gian văn hóa' },
  { name: 'Hài độc thoại', description: 'Các show hài độc thoại, stand-up comedy' },
  { name: 'Khác', description: 'Các sự kiện khác' },
];

function getEventsData(adminId, categoriesMap) {
  return [
    {
      title: 'Đêm Nhạc Hội Tụ 2025 – Live Concert',
      description: 'Đêm nhạc quy tụ hơn 20 nghệ sĩ hàng đầu Việt Nam, với màn trình diễn ánh sáng đẳng cấp quốc tế.',
      image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
      start_time: new Date('2025-12-20T19:00:00+07:00'),
      location: 'Sân vận động Quốc gia Mỹ Đình, Hà Nội',
      status: 'PUBLISHED',
      admin_id: adminId,
      category_id: categoriesMap['Âm nhạc'].id,
      category_name: 'Âm nhạc',
      zones: [
        { name: 'VIP', price: 2500000, total_seats: 50 },
        { name: 'Hạng A', price: 1500000, total_seats: 100 },
        { name: 'Hạng B', price: 800000, total_seats: 200 },
        { name: 'Hạng C', price: 3500000, total_seats: 500 },
      ],
    },
    {
      title: 'VibeZone EDM Festival 2025',
      description: 'Lễ hội âm nhạc điện tử lớn nhất miền Nam với sự tham gia của các DJ quốc tế đình đám.',
      image_url: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
      start_time: new Date('2025-11-15T15:00:00+07:00'),
      location: 'Dinh Thống Nhất, TP. Hồ Chí Minh',
      status: 'PUBLISHED',
      admin_id: adminId,
      category_id: categoriesMap['Âm nhạc'].id,
      category_name: 'Âm nhạc',
      zones: [
        { name: 'VIP Lounge', price: 3000000, total_seats: 30 },
        { name: 'Early Bird', price: 500000, total_seats: 200 },
        { name: 'General', price: 299000, total_seats: 800 },
      ],
    },
    {
      title: 'Vietnam Tech Summit 2025',
      description: 'Hội thảo công nghệ quốc tế lớn nhất Đông Nam Á về AI, Blockchain, và Cloud Computing.',
      image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      start_time: new Date('2025-10-10T09:00:00+07:00'),
      location: 'Trung tâm Hội nghị GEM Center, TP. Hồ Chí Minh',
      status: 'PUBLISHED',
      admin_id: adminId,
      category_id: categoriesMap['Hội thảo'].id,
      category_name: 'Hội thảo',
      zones: [
        { name: 'VIP Pass', price: 5000000, total_seats: 20 },
        { name: 'Speaker Zone', price: 2000000, total_seats: 50 },
        { name: 'Standard', price: 800000, total_seats: 300 },
      ],
    },
    {
      title: 'Triển Lãm Tranh: Mùa Thu Hà Nội',
      description: 'Không gian nghệ thuật trưng bày hơn 100 tác phẩm hội họa đương đại về Hà Nội.',
      image_url: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800',
      start_time: new Date('2025-08-10T08:00:00+07:00'),
      location: 'Bảo tàng Mỹ thuật Việt Nam, Hà Nội',
      status: 'PUBLISHED',
      admin_id: adminId,
      category_id: categoriesMap['Triển lãm'].id,
      category_name: 'Triển lãm',
      zones: [
        { name: 'Vé vào cửa', price: 150000, total_seats: 500 },
        { name: 'Vé hướng dẫn viên VIP', price: 500000, total_seats: 50 },
      ],
    },
    {
      title: 'Sài Gòn Tếu: Đêm Cười Mùa Hè',
      description: 'Đêm hài độc thoại với những danh hài nổi tiếng nhất, mang đến tiếng cười sảng khoái.',
      image_url: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800',
      start_time: new Date('2025-07-25T20:00:00+07:00'),
      location: 'Nhà hát Hòa Bình, TP. Hồ Chí Minh',
      status: 'PUBLISHED',
      admin_id: adminId,
      category_id: categoriesMap['Hài độc thoại'].id,
      category_name: 'Hài độc thoại',
      zones: [
        { name: 'VVIP (Bàn đầu)', price: 1200000, total_seats: 40 },
        { name: 'VIP', price: 800000, total_seats: 120 },
        { name: 'Standard', price: 400000, total_seats: 300 },
      ],
    },
  ];
}

async function seed() {
  log.section('TicketRush – Seed Data Cho 4 Database & Redis');

  log.info('Đang làm sạch 4 Databases...');
  await prismaAnalytics.analytics_order_summary.deleteMany();
  await prismaBooking.tickets.deleteMany();
  await prismaBooking.orders.deleteMany();
  await prismaBooking.seats.deleteMany();
  await prismaCatalog.zones.deleteMany();
  await prismaCatalog.events.deleteMany();
  await prismaCatalog.categories.deleteMany();
  await prismaAuth.users.deleteMany();
  try {
    await redis.del('cache:events:published');
  } catch (err) {}
  log.success('Đã xóa dữ liệu cũ trên 4 Databases.');

  // 1. Auth DB - Users
  log.section('1. Seed Auth DB (users)');
  const createdUsers = [];
  for (const u of USERS_DATA) {
    const hashed = await HASH_PASSWORD(u.password_raw);
    const user = await prismaAuth.users.create({
      data: {
        email: u.email,
        full_name: u.full_name,
        password: hashed,
        role: u.role,
        gender: u.gender,
        date_of_birth: u.date_of_birth,
      }
    });
    createdUsers.push(user);
    log.success(`User: ${user.full_name} <${user.email}> [${user.role}]`);
  }

  const adminUser = createdUsers.find(u => u.email === 'admin@ticketrush.vn');
  const customers = createdUsers.filter(u => u.role === 'CUSTOMER');

  // 2. Catalog DB - Categories & Events & Zones
  log.section('2. Seed Catalog DB (categories, events, zones)');
  const categoriesMap = {};
  for (const c of CATEGORIES_DATA) {
    const cat = await prismaCatalog.categories.create({ data: c });
    categoriesMap[c.name] = cat;
  }
  log.success(`Đã tạo ${CATEGORIES_DATA.length} danh mục.`);

  const eventsList = getEventsData(adminUser.id, categoriesMap);
  const createdEvents = [];

  for (const evData of eventsList) {
    const { zones: zonesData, category_name, ...eventFields } = evData;
    const event = await prismaCatalog.events.create({ data: eventFields });
    log.success(`Event Catalog: "${event.title}" [${event.status}]`);

    const createdZones = [];
    const allSeatsForBookingDb = [];

    for (const zData of zonesData) {
      const zone = await prismaCatalog.zones.create({
        data: {
          event_id: event.id,
          name: zData.name,
          price: zData.price,
          total_seats: zData.total_seats
        }
      });
      createdZones.push(zone);

      // Provision denormalized seats payload cho booking_db
      const seats = buildSeats(zone.id, zone.name, zone.price, event.id, zData.total_seats);
      allSeatsForBookingDb.push(...seats);
    }

    // Ghi seats denormalized sang booking_db
    if (allSeatsForBookingDb.length > 0) {
      await prismaBooking.seats.createMany({ data: allSeatsForBookingDb });
    }

    createdEvents.push({ event, zones: createdZones, category_name });
  }
  log.success(`Đã nạp ${createdEvents.length} sự kiện và ghế sang booking_db.`);

  // 3. Booking DB & Analytics DB - Orders, Tickets & Analytics Sync
  log.section('3. Seed Orders, Tickets & Analytics Summary');
  const publishedEvents = createdEvents.filter(e => e.event.status === 'PUBLISHED');

  for (let i = 0; i < customers.length; i++) {
    const customer = customers[i];
    const targetEvents = publishedEvents.slice(i % publishedEvents.length, (i % publishedEvents.length) + 2);

    for (const { event, zones, category_name } of targetEvents) {
      if (!zones.length) continue;
      const zone = zones[0];

      const availableSeats = await prismaBooking.seats.findMany({
        where: { event_id: event.id, zone_name: zone.name, status: 'AVAILABLE' },
        take: 2
      });

      if (availableSeats.length === 0) continue;

      const qty = availableSeats.length;
      const totalAmount = Number(zone.price) * qty;
      const isPaid = i % 3 !== 2;

      const order = await prismaBooking.orders.create({
        data: {
          user_id: customer.id,
          event_id: event.id,
          event_title: event.title,
          category_name,
          user_email: customer.email,
          total_amount: totalAmount,
          status: isPaid ? 'PAID' : 'PENDING'
        }
      });

      for (const seat of availableSeats) {
        const qrPayload = `TR-${order.id.slice(0, 4)}-${seat.id.slice(0, 4)}-${Date.now()}`;
        await prismaBooking.tickets.create({
          data: {
            order_id: order.id,
            seat_id: seat.id,
            qr_code: qrPayload
          }
        });

        await prismaBooking.seats.update({
          where: { id: seat.id },
          data: { status: isPaid ? 'SOLD' : 'LOCKED', locked_by: customer.id }
        });
      }

      // Sync sang Analytics DB
      await prismaAnalytics.analytics_order_summary.create({
        data: {
          order_id: order.id,
          user_id: customer.id,
          user_email: customer.email,
          user_gender: customer.gender,
          user_dob: customer.date_of_birth,
          event_id: event.id,
          event_title: event.title,
          category_name,
          total_amount: totalAmount,
          order_status: isPaid ? 'PAID' : 'PENDING',
          created_at: new Date()
        }
      });

      log.success(`Order: ${customer.full_name} → "${event.title}" | ${qty} vé | ${totalAmount.toLocaleString('vi-VN')}đ [${isPaid ? 'PAID' : 'PENDING'}]`);
    }
  }

  // Nạp chủ động Redis Read Model cho Event Catalog
  try {
    const allPublished = await prismaCatalog.events.findMany({
      where: { status: 'PUBLISHED' },
      include: { categories: true, zones: true }
    });
    await redis.set('cache:events:published', JSON.stringify(allPublished), 'EX', 300);
    log.success('Đã nạp chủ động Redis Read Model cache:events:published.');
  } catch (err) {}

  log.section('Kết Quả Seed Multi-Database');
  console.table({
    auth_users: await prismaAuth.users.count(),
    catalog_categories: await prismaCatalog.categories.count(),
    catalog_events: await prismaCatalog.events.count(),
    catalog_zones: await prismaCatalog.zones.count(),
    booking_seats: await prismaBooking.seats.count(),
    booking_orders: await prismaBooking.orders.count(),
    booking_tickets: await prismaBooking.tickets.count(),
    analytics_summaries: await prismaAnalytics.analytics_order_summary.count(),
  });

  console.log('\n\x1b[32m✅ Multi-Database Seed Hoàn Tất!\x1b[0m\n');
}

seed()
  .catch((err) => {
    log.error(err.message || err);
    process.exit(1);
  })
  .finally(async () => {
    await prismaAuth.$disconnect();
    await prismaCatalog.$disconnect();
    await prismaBooking.$disconnect();
    await prismaAnalytics.$disconnect();
    await poolAuth.end();
    await poolCatalog.end();
    await poolBooking.end();
    await poolAnalytics.end();
  });

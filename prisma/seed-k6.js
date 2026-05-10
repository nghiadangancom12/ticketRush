const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const FIXTURE_IDS = {
  eventId: '11111111-1111-1111-1111-111111111111',
  zoneId: '22222222-2222-2222-2222-222222222222',
  seatPrefix: '33333333-3333-3333-3333-3333333333'
};

const ADMIN_EMAIL = 'k6-admin@ticketrush.local';
const USER_COUNT = Number(process.env.K6_USER_COUNT || 250);
const PASSWORD = process.env.K6_USER_PASSWORD || 'K6!Pass123';
const TOKEN_FILE = path.resolve(__dirname, '../tests/k6/artifacts/k6-tokens.json');

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required for k6 token generation');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
}

async function resetData() {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "tickets",
      "orders",
      "seats",
      "zones",
      "events",
      "categories",
      "users"
    RESTART IDENTITY CASCADE
  `);
}

async function seedCore() {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const admin = await prisma.users.create({
    data: {
      email: ADMIN_EMAIL,
      full_name: 'K6 Admin',
      password: passwordHash,
      role: 'ADMIN'
    }
  });

  const users = [];
  for (let i = 1; i <= USER_COUNT; i++) {
    const user = await prisma.users.create({
      data: {
        email: `k6-user-${String(i).padStart(4, '0')}@ticketrush.local`,
        full_name: `K6 User ${i}`,
        password: passwordHash,
        role: 'CUSTOMER'
      }
    });
    users.push(user);
  }

  const category = await prisma.categories.create({
    data: {
      name: 'k6-category',
      description: 'Deterministic category for k6 simulations'
    }
  });

  const event = await prisma.events.create({
    data: {
      id: FIXTURE_IDS.eventId,
      title: 'K6 Rush Simulation Event',
      description: 'Purpose-built event for deterministic rush tests',
      start_time: new Date('2030-01-01T19:00:00.000Z'),
      location: 'Local Test Venue',
      status: 'PUBLISHED',
      admin_id: admin.id,
      category_id: category.id
    }
  });

  const zone = await prisma.zones.create({
    data: {
      id: FIXTURE_IDS.zoneId,
      event_id: event.id,
      name: 'K6-ZONE-A',
      price: 100,
      total_seats: 40
    }
  });

  const seats = Array.from({ length: 40 }, (_, idx) => {
    const n = idx + 1;
    return {
      id: `${FIXTURE_IDS.seatPrefix}${String(n).padStart(2, '0')}`,
      zone_id: zone.id,
      row_label: n <= 20 ? 'A' : 'B',
      seat_number: n <= 20 ? n : n - 20,
      status: 'AVAILABLE'
    };
  });

  await prisma.seats.createMany({ data: seats });

  return { admin, users, event, seats };
}

async function writeTokens({ admin, users, event, seats }) {
  const tokenUsers = [admin, ...users].map((u) => ({
    id: u.id,
    role: u.role,
    email: u.email,
    token: signToken(u)
  }));

  const payload = {
    generatedAt: new Date().toISOString(),
    password: PASSWORD,
    fixtures: {
      eventId: event.id,
      seatIds: seats.slice(0, 4).map((s) => s.id)
    },
    users: tokenUsers
  };

  fs.mkdirSync(path.dirname(TOKEN_FILE), { recursive: true });
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(payload, null, 2));
}

async function main() {
  console.log('[k6-seed] Resetting database ...');
  await resetData();

  console.log('[k6-seed] Creating deterministic fixtures ...');
  const fixtures = await seedCore();

  console.log('[k6-seed] Generating token pool ...');
  await writeTokens(fixtures);

  console.log(`[k6-seed] Done. Token file: ${TOKEN_FILE}`);
}

main()
  .catch((err) => {
    console.error('[k6-seed] Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

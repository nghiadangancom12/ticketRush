const { execSync } = require('child_process');
const { Pool } = require('pg');
require('dotenv').config();

console.log('🚀 === [TicketRush Database-per-Service Migration Script] ===\n');

// Helper exec command với env override
const run = (cmd, env = {}) => {
  console.log(`> ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit', env: { ...process.env, ...env } });
  } catch (err) {
    console.error(`❌ Command failed: ${cmd}`);
    process.exit(1);
  }
};

const authUrl = process.env.AUTH_DATABASE_URL || 'postgresql://user:password@localhost:5433/auth_db';
const catalogUrl = process.env.CATALOG_DATABASE_URL || 'postgresql://user:password@localhost:5434/catalog_db';
const bookingUrl = process.env.BOOKING_DATABASE_URL || 'postgresql://user:password@localhost:5435/booking_db';
const analyticsUrl = process.env.ANALYTICS_DATABASE_URL || 'postgresql://user:password@localhost:5436/analytics_db';

// 1. Generate Prisma Clients cho cả 4 Database Schemas
console.log('📦 1/4 Generating Prisma Clients cho 4 DB Schemas...');
run('npx prisma generate --schema=prisma/schema-auth.prisma');
run('npx prisma generate --schema=prisma/schema-catalog.prisma');
run('npx prisma generate --schema=prisma/schema-booking.prisma');
run('npx prisma generate --schema=prisma/schema-analytics.prisma');

// 2. Push Schema lên từng Database PostgreSQL độc lập
console.log('\n🗄️ 2/4 Synchronizing Schemas với 4 PostgreSQL Databases...');
run('npx prisma db push --schema=prisma/schema-auth.prisma --accept-data-loss', { DIRECT_URL: authUrl });
run('npx prisma db push --schema=prisma/schema-catalog.prisma --accept-data-loss', { DIRECT_URL: catalogUrl });
run('npx prisma db push --schema=prisma/schema-booking.prisma --accept-data-loss', { DIRECT_URL: bookingUrl });
run('npx prisma db push --schema=prisma/schema-analytics.prisma --accept-data-loss', { DIRECT_URL: analyticsUrl });

// 3. Khởi tạo Stored Procedure hold_seats_procedure trên booking_db
console.log('\n⚡ 3/4 Creating hold_seats_procedure on booking_db...');

if (bookingUrl) {
  const pool = new Pool({ connectionString: bookingUrl });

  const holdSeatsProcedureSql = `
    DROP FUNCTION IF EXISTS hold_seats_procedure(UUID, UUID, UUID[]);

    CREATE OR REPLACE FUNCTION hold_seats_procedure(
      p_user_id UUID,
      p_event_id UUID,
      p_seat_ids UUID[]
    )
    RETURNS TABLE (
      id UUID,
      status seat_status_enum,
      locked_by UUID,
      locked_at TIMESTAMptz
    ) AS $$
    BEGIN
      -- Lock rows FOR UPDATE
      PERFORM 1 FROM seats 
      WHERE seats.id = ANY(p_seat_ids) 
        AND seats.event_id = p_event_id
      FOR UPDATE;

      -- Check if all requested seats are AVAILABLE
      IF (SELECT COUNT(*) FROM seats 
          WHERE seats.id = ANY(p_seat_ids) 
            AND seats.event_id = p_event_id 
            AND seats.status = 'AVAILABLE') < array_length(p_seat_ids, 1) THEN
        RETURN;
      END IF;

      -- Update status to LOCKED
      RETURN QUERY
      UPDATE seats
      SET 
        status = 'LOCKED'::seat_status_enum,
        locked_by = p_user_id,
        locked_at = NOW()
      WHERE seats.id = ANY(p_seat_ids)
        AND seats.event_id = p_event_id
      RETURNING seats.id, seats.status, seats.locked_by, seats.locked_at;
    END;
    $$ LANGUAGE plpgsql;
  `;

  pool.query(holdSeatsProcedureSql)
    .then(() => {
      console.log('✅ Stored Procedure hold_seats_procedure đã được tạo thành công trên booking_db!');
      pool.end();
      console.log('\n🎉 === DATABASE-PER-SERVICE MIGRATION COMPLETED SUCCESSFULLY! ===');
    })
    .catch((err) => {
      console.error('❌ Lỗi khi tạo Stored Procedure:', err.message);
      pool.end();
    });
}

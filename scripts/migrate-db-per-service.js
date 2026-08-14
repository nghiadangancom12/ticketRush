const { execSync } = require('child_process');
const { Pool } = require('pg');
require('dotenv').config();

console.log('🚀 === [TicketRush Database-per-Service Migration Script] ===\n');

// Helper exec command
const run = (cmd) => {
  console.log(`> ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    console.error(`❌ Command failed: ${cmd}`);
    process.exit(1);
  }
};

// 1. Generate Prisma Clients cho cả 4 Database Schemas
console.log('📦 1/3 Generating Prisma Clients cho 4 DB Schemas...');
run('npx prisma generate --schema=prisma/schema-auth.prisma');
run('npx prisma generate --schema=prisma/schema-catalog.prisma');
run('npx prisma generate --schema=prisma/schema-booking.prisma');
run('npx prisma generate --schema=prisma/schema-analytics.prisma');

// 2. Push Schema lên từng Database PostgreSQL
console.log('\n🗄️ 2/3 Synchronizing Schemas với PostgreSQL Databases...');
if (process.env.AUTH_DATABASE_URL) {
  run('npx prisma db push --schema=prisma/schema-auth.prisma --accept-data-loss');
}
if (process.env.CATALOG_DATABASE_URL) {
  run('npx prisma db push --schema=prisma/schema-catalog.prisma --accept-data-loss');
}
if (process.env.BOOKING_DATABASE_URL) {
  run('npx prisma db push --schema=prisma/schema-booking.prisma --accept-data-loss');
}
if (process.env.ANALYTICS_DATABASE_URL) {
  run('npx prisma db push --schema=prisma/schema-analytics.prisma --accept-data-loss');
}

// 3. Khởi tạo Stored Procedure hold_seats_procedure trên booking_db
console.log('\n⚡ 3/3 Creating hold_seats_procedure on booking_db...');

const bookingDbUrl = process.env.BOOKING_DATABASE_URL || process.env.DATABASE_URL;

if (bookingDbUrl) {
  const pool = new Pool({ connectionString: bookingDbUrl });

  const holdSeatsProcedureSql = `
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
} else {
  console.log('⚠️ Không tìm thấy BOOKING_DATABASE_URL, bỏ qua tạo Stored Procedure.');
}

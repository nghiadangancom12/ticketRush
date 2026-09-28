const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../generated/prisma-booking');
require('dotenv').config();

class BookingDatabase {
  constructor() {
    if (!BookingDatabase.instance) {
      const bookingUrl = process.env.BOOKING_DATABASE_URL || 'postgresql://user:password@localhost:5435/booking_db';
      const pool = new Pool({ connectionString: bookingUrl });
      const adapter = new PrismaPg(pool);

      this.prisma = new PrismaClient({ adapter });
      BookingDatabase.instance = this;
    }
    return BookingDatabase.instance;
  }

  getInstance() {
    return this.prisma;
  }
}

const db = new BookingDatabase();
module.exports = db.getInstance();

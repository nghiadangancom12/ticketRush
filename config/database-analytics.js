const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../generated/prisma-analytics');
require('dotenv').config();

class AnalyticsDatabase {
  constructor() {
    if (!AnalyticsDatabase.instance) {
      const pool = new Pool({ connectionString: process.env.ANALYTICS_DATABASE_URL });
      const adapter = new PrismaPg(pool);

      this.prisma = new PrismaClient({ adapter });
      AnalyticsDatabase.instance = this;
    }
    return AnalyticsDatabase.instance;
  }

  getInstance() {
    return this.prisma;
  }
}

const db = new AnalyticsDatabase();
module.exports = db.getInstance();

const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();//co the thu xoa

class Database {
  constructor() {
    if (!Database.instance) {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const adapter = new PrismaPg(pool);
      // Singleton instance for PrismaClient
      this.prisma = new PrismaClient({ adapter });
      Database.instance = this;
    }
    return Database.instance;
  }

  getInstance() {
    return this.prisma;
  }
}

const db = new Database();
module.exports = db.getInstance();

const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// ─── Soft-Delete Models & Rules ──────────────────────────────────────────────
// users  → filter by deleted_at: null
// events → filter by status: { not: 'DELETED' }
// ─────────────────────────────────────────────────────────────────────────────
const SOFT_DELETE_FILTER = {
  users: (args) => {
    args.where = { deleted_at: null, ...args.where };
  },
  events: (args) => {
    args.where = { status: { not: 'DELETED' }, ...args.where };
  },
};

const FILTERED_OPERATIONS = new Set(['findMany', 'findFirst', 'findUnique', 'findFirstOrThrow', 'findUniqueOrThrow', 'count']);

class Database {
  constructor() {
    if (!Database.instance) {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const adapter = new PrismaPg(pool);

      const baseClient = new PrismaClient({ adapter });

      // ── Prisma Client Extension: Global Soft-Delete Filter ──────────────
      this.prisma = baseClient.$extends({
        query: {
          $allModels: {
            async $allOperations({ model, operation, args, query }) {
              // Only inject filter on READ operations
              if (FILTERED_OPERATIONS.has(operation)) {
                const applyFilter = SOFT_DELETE_FILTER[model];
                if (applyFilter) {
                  applyFilter(args);
                }
              }
              return query(args);
            },
          },
        },
      });

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


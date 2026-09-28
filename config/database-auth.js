const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../generated/prisma-auth');
require('dotenv').config();

// Soft-Delete Filter: users → filter by deleted_at: null
const SOFT_DELETE_FILTER = {
  users: (args) => {
    args.where = { deleted_at: null, ...args.where };
  },
};

const FILTERED_OPERATIONS = new Set(['findMany', 'findFirst', 'findUnique', 'findFirstOrThrow', 'findUniqueOrThrow', 'count']);

class AuthDatabase {
  constructor() {
    if (!AuthDatabase.instance) {
      const authUrl = process.env.AUTH_DATABASE_URL || 'postgresql://user:password@localhost:5433/auth_db';
      const pool = new Pool({ connectionString: authUrl });
      const adapter = new PrismaPg(pool);

      const baseClient = new PrismaClient({ adapter });

      this.prisma = baseClient.$extends({
        query: {
          $allModels: {
            async $allOperations({ model, operation, args, query }) {
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

      AuthDatabase.instance = this;
    }
    return AuthDatabase.instance;
  }

  getInstance() {
    return this.prisma;
  }
}

const db = new AuthDatabase();
module.exports = db.getInstance();

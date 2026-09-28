const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../generated/prisma-catalog');
require('dotenv').config();

// Soft-Delete Filter: events → filter by status: { not: 'DELETED' }
const SOFT_DELETE_FILTER = {
  events: (args) => {
    args.where = { status: { not: 'DELETED' }, ...args.where };
  },
};

const FILTERED_OPERATIONS = new Set(['findMany', 'findFirst', 'findUnique', 'findFirstOrThrow', 'findUniqueOrThrow', 'count']);

class CatalogDatabase {
  constructor() {
    if (!CatalogDatabase.instance) {
      const catalogUrl = process.env.CATALOG_DATABASE_URL || 'postgresql://user:password@localhost:5434/catalog_db';
      const pool = new Pool({ connectionString: catalogUrl });
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

      CatalogDatabase.instance = this;
    }
    return CatalogDatabase.instance;
  }

  getInstance() {
    return this.prisma;
  }
}

const db = new CatalogDatabase();
module.exports = db.getInstance();

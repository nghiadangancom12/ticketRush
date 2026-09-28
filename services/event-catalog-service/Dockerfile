# Build context: project root (context: .)
FROM node:20-alpine AS deps
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS runtime
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

# Copy shared library
COPY services/shared ./shared

# Copy Prisma schema và generated client
COPY prisma/schema-auth.prisma   ./prisma/schema-auth.prisma
COPY prisma/schema-catalog.prisma ./prisma/schema-catalog.prisma
COPY generated/prisma-auth   ./generated/prisma-auth
COPY generated/prisma-catalog ./generated/prisma-catalog
COPY generated/prisma-analytics ./generated/prisma-analytics

# Copy toàn bộ source cần thiết (modules, config, utils)
COPY modules/events      ./modules/events
COPY modules/categories  ./modules/categories
COPY modules/admin       ./modules/admin
COPY modules/errorHandling ./modules/errorHandling
COPY config/database-catalog.js   ./config/database-catalog.js
COPY config/database-analytics.js ./config/database-analytics.js
COPY config/database-auth.js      ./config/database-auth.js
COPY config/redis.js               ./config/redis.js
COPY middlewares/authMiddleware.js ./middlewares/authMiddleware.js
COPY middlewares/uploadImageMiddleware.js ./middlewares/uploadImageMiddleware.js
COPY utils ./utils

# Copy service files
COPY services/event-catalog-service/app.js    ./services/event-catalog-service/app.js
COPY services/event-catalog-service/server.js ./services/event-catalog-service/server.js

EXPOSE 3030
CMD ["node", "services/event-catalog-service/server.js"]

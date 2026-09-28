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
COPY prisma/schema-booking.prisma ./prisma/schema-booking.prisma
COPY generated/prisma-booking ./generated/prisma-booking
COPY generated/prisma-auth    ./generated/prisma-auth

# Copy source modules
COPY modules/Booking       ./modules/Booking
COPY modules/orders        ./modules/orders
COPY modules/errorHandling ./modules/errorHandling
COPY config/database-booking.js ./config/database-booking.js
COPY config/database-auth.js    ./config/database-auth.js
COPY config/redis.js             ./config/redis.js
COPY config/redisPublisher.js    ./config/redisPublisher.js
COPY config/eventCatalog.js      ./config/eventCatalog.js
COPY middlewares/authMiddleware.js ./middlewares/authMiddleware.js
COPY utils ./utils

# Copy service files
COPY services/booking-service/app.js    ./services/booking-service/app.js
COPY services/booking-service/server.js ./services/booking-service/server.js

EXPOSE 3040
CMD ["node", "services/booking-service/server.js"]

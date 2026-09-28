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

# Copy Prisma generated client
COPY generated/prisma-auth ./generated/prisma-auth

# Copy source modules
COPY modules/queue         ./modules/queue
COPY modules/errorHandling ./modules/errorHandling
COPY modules/jobs/workers/queueWorker.js ./modules/jobs/workers/queueWorker.js
COPY modules/jobs/queues.js ./modules/jobs/queues.js
COPY config/database-auth.js    ./config/database-auth.js
COPY config/redis.js             ./config/redis.js
COPY config/redisPublisher.js    ./config/redisPublisher.js
COPY config/redisSubscriber.js   ./config/redisSubscriber.js
COPY config/eventCatalog.js      ./config/eventCatalog.js
COPY middlewares/authMiddleware.js ./middlewares/authMiddleware.js
COPY utils/ResponseFactory.js   ./utils/ResponseFactory.js
COPY utils/validate.js           ./utils/validate.js

# Copy service files
COPY services/queue-service/app.js    ./services/queue-service/app.js
COPY services/queue-service/server.js ./services/queue-service/server.js

EXPOSE 3001
CMD ["node", "services/queue-service/server.js"]

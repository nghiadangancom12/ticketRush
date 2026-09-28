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

# Copy source modules (socket gateway is fully decoupled, only needs Redis)
COPY modules/errorHandling ./modules/errorHandling

# Copy service files (server.js now uses shared/ directly)
COPY services/socket-gateway/server.js ./services/socket-gateway/server.js

EXPOSE 3002
CMD ["node", "services/socket-gateway/server.js"]

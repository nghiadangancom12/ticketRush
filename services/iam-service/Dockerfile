# ─── Stage 1: Dependencies ────────────────────────────────────────────────────
FROM node:20-alpine AS deps

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy package files của IAM service
COPY services/iam-service/package*.json ./

RUN npm ci --omit=dev

# ─── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy node_modules từ stage deps
COPY --from=deps /app/node_modules ./node_modules

# Copy shared library (tường minh, không dùng bind mount)
COPY services/shared ./shared

# Copy prisma schema riêng cho IAM (auth schema)
COPY prisma/schema-auth.prisma ./prisma/schema.prisma
COPY prisma/migrations ./prisma/migrations

# Copy generated Prisma clients cần thiết
COPY generated/prisma-auth ./generated/prisma-auth

# Copy source code của IAM service
COPY services/iam-service ./

# Copy utilities từ root (email.js dùng nodemailer)
COPY utils/email.js ./utils/email.js

# Generate Prisma Client
ENV DIRECT_URL="postgresql://dummy:dummy@dummy:5432/dummy"
ENV DATABASE_URL="postgresql://dummy:dummy@dummy:5432/dummy"
RUN npx prisma generate --schema=./prisma/schema.prisma

EXPOSE 3010

CMD ["node", "server.js"]

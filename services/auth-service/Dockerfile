FROM node:20-alpine

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV DIRECT_URL="postgresql://dummy:dummy@dummy:5432/dummy"
ENV DATABASE_URL="postgresql://dummy:dummy@dummy:5432/dummy"
RUN npx prisma generate --schema=prisma/schema-auth.prisma

EXPOSE 3010

CMD ["node", "services/auth-service/server.js"]

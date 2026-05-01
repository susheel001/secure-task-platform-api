FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

ARG DATABASE_URL=postgresql://postgres:postgres@localhost:5432/task_platform?schema=public
ARG DIRECT_URL=postgresql://postgres:postgres@localhost:5432/task_platform?schema=public

RUN DATABASE_URL="${DATABASE_URL}" DIRECT_URL="${DIRECT_URL}" npx prisma generate && npm run build

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]

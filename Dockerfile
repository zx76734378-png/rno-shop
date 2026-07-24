# RNO-SHOP Production Dockerfile
# Multi-stage build: build Vue apps, then run Express + serve static files

FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for all services
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/
COPY admin/package*.json ./admin/

# Install all dependencies
RUN cd server && npm ci --omit=dev && cd ..
RUN cd client && npm ci && cd ..
RUN cd admin && npm ci && cd ..

# Copy source code
COPY server/ ./server/
COPY client/ ./client/
COPY admin/ ./admin/

# Generate Prisma client (PostgreSQL)
COPY server/prisma ./server/prisma/
RUN cd server && npx prisma generate

# Build Vue frontends
RUN cd client && npx vite build
RUN cd admin && npx vite build --base=/admin/

# ---- Production stage ----
FROM node:20-alpine

WORKDIR /app

# Copy server with built frontends
COPY --from=builder /app/server/ ./server/
COPY --from=builder /app/client/dist/ ./client/dist/
COPY --from=builder /app/admin/dist/ ./admin/dist/

# Install production server dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy Prisma artifacts
COPY --from=builder /app/server/node_modules/.prisma ./server/node_modules/.prisma
COPY --from=builder /app/server/node_modules/@prisma ./server/node_modules/@prisma

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Use shell form to allow env var substitution for DATABASE_URL
CMD cd /app/server && npx prisma db push --skip-generate && node src/app.js

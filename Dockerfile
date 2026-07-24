FROM node:20-alpine

# Prisma needs OpenSSL on Alpine
RUN apk add --no-cache openssl

WORKDIR /app

# Copy all source (node_modules excluded via .dockerignore)
COPY . .

# Install and build everything
RUN cd server && npm ci && npx prisma generate
RUN cd client && npm ci && npx vite build
RUN cd admin && npm ci && npx vite build --base=/admin/

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Start
CMD cd /app/server && npx prisma db push --skip-generate && npx prisma db seed && node src/app.js

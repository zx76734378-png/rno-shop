# LVON-SHOP

A full-stack e-commerce website for international modern home essentials, built for learning purposes.

## Tech Stack

- **Frontend**: Vue 3 + Vite + Tailwind CSS + Pinia
- **Backend**: Node.js + Express.js + Prisma ORM
- **Database**: SQLite (zero-config, file-based)
- **Admin**: Vue 3 + Vite

## Getting Started

### Prerequisites

- Node.js 18+

### Setup

```bash
# 1. Install all dependencies
npm run install:all

# 2. Run database migrations
npm run db:migrate

# 3. Seed sample data
npm run db:seed

# 4. Start all services
npm run dev
```

### Access

| Service | URL |
|---------|-----|
| Storefront | http://localhost:5173 |
| Admin Panel | http://localhost:5174 |
| API Server | http://localhost:3000 |
| Prisma Studio | http://localhost:5555 |

### Default Admin Account

- Email: `admin@lvon-shop.com`
- Password: `password123`

### Test Customer Account

- Email: `customer@example.com`
- Password: `password123`

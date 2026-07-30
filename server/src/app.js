require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const routes = require('./routes/index');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// ==================== Trust Proxy ====================
// Required behind nginx, Cloudflare, AWS ALB, Render, etc.
// This ensures rate limiting sees real client IPs, not proxy IPs
app.set('trust proxy', 1);

// ==================== Security ====================
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: isProduction ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "https:", "data:"],
      connectSrc: ["'self'", "https://api.cloudinary.com"],
    },
  } : false,
}));

// ==================== CORS ====================
// In production with same-origin deployment (Render web service),
// CORS can be minimal. The env vars still allow different origins if needed.
const corsOrigins = [];
if (process.env.FRONTEND_URL) corsOrigins.push(process.env.FRONTEND_URL);
if (process.env.ADMIN_URL) corsOrigins.push(process.env.ADMIN_URL);
if (corsOrigins.length === 0) corsOrigins.push('http://localhost:5173', 'http://localhost:5174');

app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));

// ==================== Rate Limiting ====================
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 500 : 1000, // Stricter in production
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', globalLimiter);

// ==================== Body Parsing ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== Logging ====================
if (isProduction) {
  app.use(morgan('combined')); // Detailed logs for production
} else {
  app.use(morgan('dev'));
}

// ==================== Static Files ====================
// Uploaded images
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), {
  maxAge: isProduction ? '30d' : 0,
}));

// In production, serve built static files from client and admin
// (Development uses Vite dev server with proxy instead)
if (isProduction) {
  const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
  const adminDist = path.join(__dirname, '..', '..', 'admin', 'dist');

  // Serve admin SPA
  app.use('/admin', express.static(adminDist, { maxAge: '7d' }));
  app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(adminDist, 'index.html'));
  });

  // Serve client SPA (must be last, handles all remaining routes)
  app.use(express.static(clientDist, { maxAge: '7d' }));
  app.get('*', (req, res, next) => {
    // Don't interfere with API routes
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// ==================== API Routes ====================
app.use(routes);

// ==================== Error Handling ====================
app.use(notFound);
app.use(errorHandler);

// ==================== Process Safety ====================
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
  // Graceful shutdown on uncaught exception
  const prisma = require('./config/database');
  prisma.$disconnect().finally(() => process.exit(1));
});

process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

// ==================== Graceful Shutdown ====================
async function shutdown(signal) {
  console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);
  try {
    const prisma = require('./config/database');
    await prisma.$disconnect();
    console.log('✓ Database disconnected');
  } catch (err) {
    console.error('Error during shutdown:', err);
  }
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ==================== Start ====================
app.listen(PORT, () => {
  console.log(`\n🏠 LVON-SHOP API running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  if (!isProduction) {
    console.log(`   Frontend:   http://localhost:5173`);
    console.log(`   Admin:      http://localhost:5174\n`);
  }
});

module.exports = app;

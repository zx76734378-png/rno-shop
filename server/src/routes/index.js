const { Router } = require('express');
const prisma = require('../config/database');
const authRoutes = require('./auth');
const productRoutes = require('./products');
const categoryRoutes = require('./categories');
const cartRoutes = require('./cart');
const orderRoutes = require('./orders');
const userRoutes = require('./users');
const contentRoutes = require('./content');
const adminRoutes = require('./admin/index');

const router = Router();

// Health check endpoint (for load balancers / monitoring)
router.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      database: 'connected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      error: process.env.NODE_ENV === 'production' ? 'Service unavailable' : err.message,
    });
  }
});

router.use('/api', authRoutes);
router.use('/api', productRoutes);
router.use('/api', categoryRoutes);
router.use('/api', cartRoutes);
router.use('/api', orderRoutes);
router.use('/api', userRoutes);
router.use('/api', contentRoutes);
router.use('/api', adminRoutes);

module.exports = router;

const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const ctrl = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = Router();

// Strict rate limiter for auth endpoints (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again in 15 minutes.' },
});

router.post('/auth/register', authLimiter, ctrl.register);
router.post('/auth/login', authLimiter, ctrl.login);
router.post('/auth/refresh', ctrl.refresh);
router.post('/auth/forgot-password', authLimiter, ctrl.forgotPassword);
router.post('/auth/reset-password', authLimiter, ctrl.resetPassword);
router.get('/me', authenticate, ctrl.getMe);
router.put('/me', authenticate, ctrl.updateMe);
router.put('/me/password', authenticate, ctrl.changePassword);

module.exports = router;

const { Router } = require('express');
const ctrl = require('../controllers/orderController');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = Router();

router.post('/orders', optionalAuth, ctrl.placeOrder);
router.get('/me/orders', authenticate, ctrl.getUserOrders);
router.get('/me/orders/:id', authenticate, ctrl.getUserOrder);

module.exports = router;

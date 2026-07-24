const { Router } = require('express');
const ctrl = require('../controllers/cartController');
const { optionalAuth } = require('../middleware/auth');

const router = Router();

router.get('/cart', optionalAuth, ctrl.getCart);
router.post('/cart/items', optionalAuth, ctrl.addItem);
router.put('/cart/items/:itemId', optionalAuth, ctrl.updateItem);
router.delete('/cart/items/:itemId', optionalAuth, ctrl.removeItem);
router.delete('/cart', optionalAuth, ctrl.clearCart);
router.post('/cart/coupon', optionalAuth, ctrl.applyCoupon);

module.exports = router;

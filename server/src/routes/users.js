const { Router } = require('express');
const ctrl = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.get('/me/addresses', authenticate, ctrl.getAddresses);
router.post('/me/addresses', authenticate, ctrl.createAddress);
router.put('/me/addresses/:id', authenticate, ctrl.updateAddress);
router.delete('/me/addresses/:id', authenticate, ctrl.deleteAddress);
router.get('/me/wishlist', authenticate, ctrl.getWishlist);
router.post('/me/wishlist', authenticate, ctrl.addToWishlist);
router.delete('/me/wishlist/:productId', authenticate, ctrl.removeFromWishlist);

module.exports = router;

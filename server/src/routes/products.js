const { Router } = require('express');
const ctrl = require('../controllers/productController');

const router = Router();

router.get('/products', ctrl.getProducts);
router.get('/products/featured', ctrl.getFeatured);
router.get('/products/new', ctrl.getNew);
router.get('/products/bestsellers', ctrl.getBestsellers);
router.get('/products/:slug', ctrl.getProduct);
router.get('/products/:slug/related', ctrl.getRelated);

module.exports = router;

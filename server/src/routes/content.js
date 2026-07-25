const { Router } = require('express');
const ctrl = require('../controllers/pageController');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.get('/pages/:slug', ctrl.getPage);
router.get('/hero-banners', ctrl.getHeroBanners);
router.get('/faqs', ctrl.getFaqs);
router.get('/site-settings', ctrl.getSiteSettings);
router.get('/site-setting/:key', ctrl.getSiteSetting);
router.get('/memberships', ctrl.getMemberships);
router.post('/memberships/subscribe', authenticate, ctrl.subscribeMembership);
router.post('/newsletter/subscribe', ctrl.subscribeNewsletter);
router.post('/reviews', authenticate, ctrl.createReview);
router.get('/products/:productId/reviews', ctrl.getProductReviews);

module.exports = router;

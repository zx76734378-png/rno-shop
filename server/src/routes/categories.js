const { Router } = require('express');
const ctrl = require('../controllers/categoryController');

const router = Router();

router.get('/categories', ctrl.getCategories);
router.get('/categories/:slug', ctrl.getCategory);

module.exports = router;

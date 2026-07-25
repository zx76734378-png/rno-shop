const { Router } = require('express');
const { authenticate, adminOnly } = require('../../middleware/auth');
const upload = require('../../config/upload');
const ctrl = require('../../controllers/adminController');

const router = Router();

// All admin routes require auth + admin role
router.use(authenticate, adminOnly);

// Dashboard
router.get('/admin/dashboard', ctrl.getDashboard);

// Products
router.get('/admin/products', ctrl.adminGetProducts);
router.get('/admin/products/:id', ctrl.adminGetProduct);
router.post('/admin/products', ctrl.adminCreateProduct);
router.put('/admin/products/:id', ctrl.adminUpdateProduct);
router.delete('/admin/products/:id', ctrl.adminDeleteProduct);
router.post('/admin/products/:id/images', upload.single('image'), ctrl.adminUploadProductImage);
router.post('/admin/products/:id/images/by-url', ctrl.adminAddProductImageUrl);
router.delete('/admin/products/:id/images/:imageId', ctrl.adminDeleteProductImage);

// Categories
router.get('/admin/categories', ctrl.adminGetCategories);
router.post('/admin/categories', ctrl.adminCreateCategory);
router.put('/admin/categories/:id', ctrl.adminUpdateCategory);
router.delete('/admin/categories/:id', ctrl.adminDeleteCategory);

// Orders
router.get('/admin/orders', ctrl.adminGetOrders);
router.get('/admin/orders/:id', ctrl.adminGetOrder);
router.put('/admin/orders/:id/status', ctrl.adminUpdateOrderStatus);

// Users
router.get('/admin/users', ctrl.adminGetUsers);
router.get('/admin/users/:id', ctrl.adminGetUser);

// Pages
router.get('/admin/pages', ctrl.adminGetPages);
router.get('/admin/pages/:id', ctrl.adminGetPage);
router.post('/admin/pages', ctrl.adminCreatePage);
router.put('/admin/pages/:id', ctrl.adminUpdatePage);
router.delete('/admin/pages/:id', ctrl.adminDeletePage);

// Banners
router.get('/admin/banners', ctrl.adminGetBanners);
router.post('/admin/banners', ctrl.adminCreateBanner);
router.put('/admin/banners/:id', ctrl.adminUpdateBanner);
router.delete('/admin/banners/:id', ctrl.adminDeleteBanner);

// Coupons
router.get('/admin/coupons', ctrl.adminGetCoupons);
router.post('/admin/coupons', ctrl.adminCreateCoupon);
router.put('/admin/coupons/:id', ctrl.adminUpdateCoupon);
router.delete('/admin/coupons/:id', ctrl.adminDeleteCoupon);

// Reviews
router.get('/admin/reviews', ctrl.adminGetReviews);
router.put('/admin/reviews/:id/approve', ctrl.adminApproveReview);
router.delete('/admin/reviews/:id', ctrl.adminDeleteReview);

// Settings
router.get('/admin/settings', ctrl.adminGetSettings);
router.put('/admin/settings', ctrl.adminUpdateSettings);

// Media
router.get('/admin/media', ctrl.adminGetMedia);
router.post('/admin/media', upload.single('file'), ctrl.adminUploadMedia);

module.exports = router;

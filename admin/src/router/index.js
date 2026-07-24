import { createRouter, createWebHistory } from 'vue-router';
import { useAdminAuth } from '@/stores/auth';

const routes = [
  { path: '/login', name: 'login', component: () => import('@/pages/LoginPage.vue') },
  {
    path: '/', component: () => import('@/components/layout/AdminLayout.vue'), meta: { requiresAuth: true },
    children: [
      { path: '', name: 'dashboard', component: () => import('@/pages/DashboardPage.vue'), meta: { title: 'Dashboard' } },
      { path: 'products', name: 'products', component: () => import('@/pages/ProductsPage.vue'), meta: { title: 'Products' } },
      { path: 'products/new', name: 'product-new', component: () => import('@/pages/ProductEditPage.vue'), meta: { title: 'New Product' } },
      { path: 'products/:id/edit', name: 'product-edit', component: () => import('@/pages/ProductEditPage.vue'), meta: { title: 'Edit Product' } },
      { path: 'categories', name: 'categories', component: () => import('@/pages/CategoriesPage.vue'), meta: { title: 'Categories' } },
      { path: 'orders', name: 'orders', component: () => import('@/pages/OrdersPage.vue'), meta: { title: 'Orders' } },
      { path: 'orders/:id', name: 'order-detail', component: () => import('@/pages/OrderDetailPage.vue'), meta: { title: 'Order Detail' } },
      { path: 'users', name: 'users', component: () => import('@/pages/UsersPage.vue'), meta: { title: 'Customers' } },
      { path: 'pages', name: 'pages', component: () => import('@/pages/PagesPage.vue'), meta: { title: 'Pages' } },
      { path: 'pages/:id/edit', name: 'page-edit', component: () => import('@/pages/PageEditPage.vue'), meta: { title: 'Edit Page' } },
      { path: 'coupons', name: 'coupons', component: () => import('@/pages/CouponsPage.vue'), meta: { title: 'Coupons' } },
      { path: 'reviews', name: 'reviews', component: () => import('@/pages/ReviewsPage.vue'), meta: { title: 'Reviews' } },
      { path: 'banners', name: 'banners', component: () => import('@/pages/BannersPage.vue'), meta: { title: 'Banners' } },
      { path: 'settings', name: 'settings', component: () => import('@/pages/SettingsPage.vue'), meta: { title: 'Settings' } },
    ],
  },
];

// In production, admin is served under /admin prefix. In dev, it's standalone on :5174.
const router = createRouter({ history: createWebHistory(import.meta.env.PROD ? '/admin' : '/'), routes });

router.beforeEach((to, from, next) => {
  const auth = useAdminAuth();
  if (to.meta.requiresAuth && !auth.isAuthenticated) return next('/login');
  if (to.path === '/login' && auth.isAuthenticated) return next('/');
  next();
});

export default router;

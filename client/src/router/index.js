import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/HomePage.vue'),
  },
  {
    path: '/shop',
    name: 'shop',
    component: () => import('@/pages/ShopPage.vue'),
  },
  {
    path: '/collections/:slug',
    name: 'collection',
    component: () => import('@/pages/ShopPage.vue'),
  },
  {
    path: '/products/:slug',
    name: 'product',
    component: () => import('@/pages/ProductPage.vue'),
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('@/pages/SearchPage.vue'),
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('@/pages/CartPage.vue'),
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: () => import('@/pages/CheckoutPage.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/LoginPage.vue'),
    meta: { guest: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/pages/RegisterPage.vue'),
    meta: { guest: true },
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('@/pages/ForgotPasswordPage.vue'),
  },
  {
    path: '/account',
    component: () => import('@/pages/account/DashboardPage.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/account/orders' },
      { path: 'orders', name: 'account-orders', component: () => import('@/pages/account/OrdersPage.vue') },
      { path: 'orders/:id', name: 'account-order-detail', component: () => import('@/pages/account/OrderDetailPage.vue') },
      { path: 'addresses', name: 'account-addresses', component: () => import('@/pages/account/AddressesPage.vue') },
      { path: 'wishlist', name: 'account-wishlist', component: () => import('@/pages/account/WishlistPage.vue') },
      { path: 'profile', name: 'account-profile', component: () => import('@/pages/account/ProfilePage.vue') },
    ],
  },
  {
    path: '/pages/:slug',
    name: 'page',
    component: () => import('@/pages/ContentPage.vue'),
  },
  {
    path: '/membership',
    name: 'membership',
    component: () => import('@/pages/MembershipPage.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/NotFoundPage.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();

  // Fetch user on first load if token exists
  if (auth.accessToken && !auth.user) {
    await auth.fetchUser();
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } });
  }

  if (to.meta.guest && auth.isAuthenticated) {
    return next({ name: 'home' });
  }

  next();
});

export default router;

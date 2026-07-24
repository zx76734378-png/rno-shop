<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />
    <main class="flex-1">
      <router-view :key="$route.fullPath" />
    </main>
    <AppFooter />
    <CartDrawer />
    <ToastContainer />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import AppHeader from '@/components/layout/AppHeader.vue';
import AppFooter from '@/components/layout/AppFooter.vue';
import CartDrawer from '@/components/cart/CartDrawer.vue';
import ToastContainer from '@/components/ui/ToastContainer.vue';
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';

const cart = useCartStore();
const auth = useAuthStore();

onMounted(async () => {
  await cart.fetchCart();
  if (auth.accessToken) {
    await auth.fetchUser();
  }
});
</script>

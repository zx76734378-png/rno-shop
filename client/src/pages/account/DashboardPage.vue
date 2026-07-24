<template>
  <div class="container-custom py-10">
    <h1 class="font-serif text-3xl mb-10">My Account</h1>
    <div class="grid md:grid-cols-[200px_1fr] gap-10">
      <!-- Sidebar -->
      <nav class="space-y-1">
        <router-link to="/account/orders" class="block py-2 text-sm text-charcoal/70 hover:text-sage transition-colors">My Orders</router-link>
        <router-link to="/account/addresses" class="block py-2 text-sm text-charcoal/70 hover:text-sage transition-colors">Addresses</router-link>
        <router-link to="/account/wishlist" class="block py-2 text-sm text-charcoal/70 hover:text-sage transition-colors">Wishlist</router-link>
        <router-link to="/account/profile" class="block py-2 text-sm text-charcoal/70 hover:text-sage transition-colors">Profile</router-link>
        <button @click="handleLogout" class="block py-2 text-sm text-red-500 hover:text-red-700 transition-colors">Sign Out</button>
      </nav>
      <!-- Content -->
      <div>
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

function handleLogout() {
  auth.logout();
  router.push('/');
}
</script>

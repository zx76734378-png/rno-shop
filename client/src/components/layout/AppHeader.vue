<template>
  <header class="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-gray-100">
    <div class="container-custom">
      <div class="flex items-center justify-between h-16 md:h-20">
        <!-- Mobile menu button -->
        <button @click="ui.openMobileMenu()" class="md:hidden p-2 -ml-2">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Logo -->
        <router-link to="/" class="flex-shrink-0">
          <img src="/images/logo.png" alt="RNO-SHOP" class="h-14 md:h-16 w-auto" />
        </router-link>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-8">
          <router-link to="/shop" class="text-sm tracking-wide text-charcoal/70 hover:text-charcoal transition-colors uppercase">Shop</router-link>
          <router-link to="/collections/home-fragrance" class="text-sm tracking-wide text-charcoal/70 hover:text-charcoal transition-colors uppercase">Fragrance</router-link>
          <router-link to="/collections/body-care" class="text-sm tracking-wide text-charcoal/70 hover:text-charcoal transition-colors uppercase">Body Care</router-link>
          <router-link to="/collections/pantry" class="text-sm tracking-wide text-charcoal/70 hover:text-charcoal transition-colors uppercase">Pantry</router-link>
          <router-link to="/collections/gift-sets" class="text-sm tracking-wide text-charcoal/70 hover:text-charcoal transition-colors uppercase">Gifts</router-link>
          <router-link to="/pages/the-estate" class="text-sm tracking-wide text-charcoal/70 hover:text-charcoal transition-colors uppercase">The Estate</router-link>
        </nav>

        <!-- Right icons -->
        <div class="flex items-center space-x-1 md:space-x-3">
          <!-- Search -->
          <button @click="$router.push('/search')" class="p-2 text-charcoal/70 hover:text-charcoal transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <!-- Account -->
          <router-link v-if="auth.isAuthenticated" to="/account" class="p-2 text-charcoal/70 hover:text-charcoal transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </router-link>
          <router-link v-else to="/login" class="p-2 text-charcoal/70 hover:text-charcoal transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </router-link>

          <!-- Wishlist -->
          <router-link v-if="auth.isAuthenticated" to="/account/wishlist" class="p-2 text-charcoal/70 hover:text-charcoal transition-colors hidden sm:block">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </router-link>

          <!-- Cart -->
          <button @click="ui.openCart()" class="relative p-2 text-charcoal/70 hover:text-charcoal transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span v-if="cart.itemCount" class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-sage text-white text-[10px] font-medium rounded-full flex items-center justify-center">
              {{ cart.itemCount }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <MobileMenu />
  </header>
</template>

<script setup>
import { useUIStore } from '@/stores/ui';
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';
import MobileMenu from './MobileMenu.vue';

const ui = useUIStore();
const cart = useCartStore();
const auth = useAuthStore();
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="ui.isMobileMenuOpen" class="fixed inset-0 z-50 md:hidden" @click.self="ui.closeMobileMenu()">
        <div class="absolute inset-0 bg-black/30" />
        <div class="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-cream shadow-xl">
          <div class="flex items-center justify-between p-4 border-b">
            <span class="font-serif text-lg">Menu</span>
            <button @click="ui.closeMobileMenu()" class="p-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav class="p-4 flex flex-col space-y-1">
            <router-link @click="ui.closeMobileMenu()" to="/shop" class="py-3 text-lg border-b border-gray-100">Shop All</router-link>
            <router-link @click="ui.closeMobileMenu()" to="/collections/home-fragrance" class="py-3 text-lg border-b border-gray-100">Home Fragrance</router-link>
            <router-link @click="ui.closeMobileMenu()" to="/collections/body-care" class="py-3 text-lg border-b border-gray-100">Body Care</router-link>
            <router-link @click="ui.closeMobileMenu()" to="/collections/hand-care" class="py-3 text-lg border-b border-gray-100">Hand Care</router-link>
            <router-link @click="ui.closeMobileMenu()" to="/collections/bath-essentials" class="py-3 text-lg border-b border-gray-100">Bath</router-link>
            <router-link @click="ui.closeMobileMenu()" to="/collections/skincare" class="py-3 text-lg border-b border-gray-100">Skincare</router-link>
            <router-link @click="ui.closeMobileMenu()" to="/collections/pantry" class="py-3 text-lg border-b border-gray-100">Pantry</router-link>
            <router-link @click="ui.closeMobileMenu()" to="/collections/home-goods" class="py-3 text-lg border-b border-gray-100">Home Goods</router-link>
            <router-link @click="ui.closeMobileMenu()" to="/collections/gift-sets" class="py-3 text-lg border-b border-gray-100">Gift Sets</router-link>
            <router-link @click="ui.closeMobileMenu()" to="/pages/the-estate" class="py-3 text-lg border-b border-gray-100">The Estate</router-link>
            <router-link @click="ui.closeMobileMenu()" to="/membership" class="py-3 text-lg border-b border-gray-100">Membership</router-link>
            <router-link v-if="auth.isAuthenticated" @click="ui.closeMobileMenu()" to="/account" class="py-3 text-lg">My Account</router-link>
            <router-link v-else @click="ui.closeMobileMenu()" to="/login" class="py-3 text-lg">Sign In</router-link>
          </nav>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useUIStore } from '@/stores/ui';
import { useAuthStore } from '@/stores/auth';

const ui = useUIStore();
const auth = useAuthStore();
</script>

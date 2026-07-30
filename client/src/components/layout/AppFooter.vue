<template>
  <footer class="bg-charcoal text-cream/80 mt-20">
    <div class="container-custom py-16">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <!-- Brand -->
        <div>
          <h3 class="font-serif text-cream text-2xl tracking-wide mb-4">LVON-SHOP</h3>
          <p class="text-sm leading-relaxed text-cream/60">
            International Modern Home. Curated fragrances, body care, and home essentials from around the world.
          </p>
        </div>

        <!-- Shop -->
        <div>
          <h4 class="text-cream text-sm font-medium uppercase tracking-wider mb-4">Shop</h4>
          <ul class="space-y-2 text-sm">
            <li><router-link to="/shop" class="text-cream/60 hover:text-cream transition-colors">All Products</router-link></li>
            <li><router-link to="/collections/home-fragrance" class="text-cream/60 hover:text-cream transition-colors">Home Fragrance</router-link></li>
            <li><router-link to="/collections/body-care" class="text-cream/60 hover:text-cream transition-colors">Body Care</router-link></li>
            <li><router-link to="/collections/pantry" class="text-cream/60 hover:text-cream transition-colors">Pantry</router-link></li>
            <li><router-link to="/collections/gift-sets" class="text-cream/60 hover:text-cream transition-colors">Gift Sets</router-link></li>
          </ul>
        </div>

        <!-- About -->
        <div>
          <h4 class="text-cream text-sm font-medium uppercase tracking-wider mb-4">About</h4>
          <ul class="space-y-2 text-sm">
            <li><router-link to="/pages/the-estate" class="text-cream/60 hover:text-cream transition-colors">The Estate</router-link></li>
            <li><router-link to="/pages/the-lvon-fund" class="text-cream/60 hover:text-cream transition-colors">The LVON Fund</router-link></li>
            <li><router-link to="/membership" class="text-cream/60 hover:text-cream transition-colors">Membership</router-link></li>
            <li><router-link to="/pages/faq" class="text-cream/60 hover:text-cream transition-colors">FAQ</router-link></li>
          </ul>
        </div>

        <!-- Newsletter -->
        <div>
          <h4 class="text-cream text-sm font-medium uppercase tracking-wider mb-4">Stay in Touch</h4>
          <p class="text-sm text-cream/60 mb-4">Sign up for stories, seasonal rituals, and first access to new releases.</p>
          <NewsletterSignup />
        </div>
      </div>

      <div class="border-t border-cream/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-sm text-cream/40">
        <p>&copy; {{ new Date().getFullYear() }} LVON-SHOP. All rights reserved.</p>
        <div class="flex space-x-6 mt-4 sm:mt-0">
          <a href="#" class="hover:text-cream/60 transition-colors">Privacy Policy</a>
          <a href="#" class="hover:text-cream/60 transition-colors">Terms of Service</a>
          <a href="#" class="hover:text-cream/60 transition-colors">Accessibility</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import NewsletterSignup from '@/components/layout/NewsletterSignup.vue';
</script>

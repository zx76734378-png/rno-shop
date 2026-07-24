<template>
  <div>
    <h2 class="font-serif text-xl mb-6">My Wishlist</h2>
    <div v-if="!wishlist.items.length" class="text-center py-10 text-charcoal/50">
      <p>Your wishlist is empty.</p>
      <router-link to="/shop" class="text-sage hover:underline mt-2 inline-block">Discover Products</router-link>
    </div>
    <div v-else class="product-grid">
      <ProductCard v-for="product in wishlist.items" :key="product.id || product.productId" :product="product" />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useWishlistStore } from '@/stores/wishlist';
import ProductCard from '@/components/product/ProductCard.vue';

const wishlist = useWishlistStore();
onMounted(() => wishlist.fetchWishlist());
</script>

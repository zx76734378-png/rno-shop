<template>
  <section class="py-16 md:py-20" v-if="products.length">
    <div class="container-custom">
      <h2 class="section-title">{{ title }}</h2>
      <p v-if="subtitle" class="section-subtitle">{{ subtitle }}</p>
      <div class="product-grid">
        <ProductCard v-for="product in products" :key="product.id" :product="product" />
      </div>
      <div v-if="showViewAll" class="text-center mt-12">
        <router-link :to="linkTo" class="btn-outline">View All</router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/utils/api';
import ProductCard from '@/components/product/ProductCard.vue';

const props = defineProps({
  title: { type: String, default: 'Featured Products' },
  subtitle: { type: String, default: '' },
  endpoint: { type: String, default: '/products/featured' },
  showViewAll: { type: Boolean, default: true },
  linkTo: { type: String, default: '/shop' },
});

const products = ref([]);

onMounted(async () => {
  try {
    const { data } = await api.get(props.endpoint);
    products.value = data.products;
  } catch { /* ignore */ }
});
</script>

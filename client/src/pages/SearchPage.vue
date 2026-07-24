<template>
  <div class="container-custom py-10">
    <h1 class="font-serif text-3xl mb-8">Search</h1>
    <div class="max-w-xl mb-10">
      <div class="flex gap-2">
        <input v-model="query" @keyup.enter="search" type="search" placeholder="Search products..." class="input-field flex-1" />
        <button @click="search" class="btn-primary" :disabled="loading">{{ loading ? '...' : 'Search' }}</button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-10"><div class="inline-block w-8 h-8 border-2 border-sage border-t-transparent rounded-full animate-spin" /></div>

    <div v-else-if="searched && !results.length" class="text-center py-16">
      <p class="text-lg text-charcoal/60">No results found for "{{ searchedQuery }}".</p>
      <router-link to="/shop" class="text-sage hover:underline mt-2 inline-block">Browse all products</router-link>
    </div>

    <div v-else-if="results.length" class="product-grid">
      <ProductCard v-for="product in results" :key="product.id" :product="product" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '@/utils/api';
import ProductCard from '@/components/product/ProductCard.vue';

const query = ref('');
const searchedQuery = ref('');
const searched = ref(false);
const loading = ref(false);
const results = ref([]);

async function search() {
  if (!query.value.trim()) return;
  loading.value = true;
  searched.value = true;
  searchedQuery.value = query.value.trim();
  try {
    const { data } = await api.get('/products', { params: { search: searchedQuery.value, limit: 50 } });
    results.value = data.products;
  } catch { results.value = []; }
  finally { loading.value = false; }
}
</script>

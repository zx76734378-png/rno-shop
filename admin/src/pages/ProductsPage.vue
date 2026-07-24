<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="font-serif text-xl">Products ({{ total }})</h2>
      <router-link to="/products/new" class="admin-btn-primary">+ Add Product</router-link>
    </div>
    <div class="bg-white rounded-sm shadow-sm overflow-x-auto">
      <table class="admin-table">
        <thead><tr><th>Product</th><th>SKU</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr></thead>
        <tbody>
          <tr v-for="p in products" :key="p.id">
            <td class="flex items-center gap-3">
              <img :src="p.images?.[0]?.url || 'https://picsum.photos/seed/placeholder/60/60'" class="w-10 h-10 object-cover rounded" />
              <span>{{ p.name }}</span>
            </td>
            <td class="text-gray-500">{{ p.sku || '—' }}</td>
            <td>{{ formatPrice(p.price) }}</td>
            <td>{{ p.stockQuantity }}</td>
            <td><span :class="p.isActive ? 'text-green-600' : 'text-red-500'">{{ p.isActive ? 'Active' : 'Inactive' }}</span></td>
            <td>
              <router-link :to="`/products/${p.id}/edit`" class="text-sage hover:underline text-xs">Edit</router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="totalPages > 1" class="flex justify-center gap-2 mt-6">
      <button @click="page--; fetch()" :disabled="page <= 1" class="admin-btn-outline">Prev</button>
      <span class="px-4 py-2 text-sm text-gray-500">{{ page }} / {{ totalPages }}</span>
      <button @click="page++; fetch()" :disabled="page >= totalPages" class="admin-btn-outline">Next</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/utils/api';
import { formatPrice } from '@/utils/format';

const products = ref([]);
const page = ref(1);
const total = ref(0);
const totalPages = ref(0);

async function fetch() {
  const { data } = await api.get('/admin/products', { params: { page: page.value, limit: 20 } });
  products.value = data.products;
  total.value = data.total;
  totalPages.value = data.totalPages;
}

onMounted(fetch);
</script>

<template>
  <div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-white p-5 rounded-sm shadow-sm">
        <p class="text-sm text-gray-500">Total Revenue</p>
        <p class="text-2xl font-semibold mt-1">{{ formatPrice(stats.totalRevenue) }}</p>
      </div>
      <div class="bg-white p-5 rounded-sm shadow-sm">
        <p class="text-sm text-gray-500">Orders</p>
        <p class="text-2xl font-semibold mt-1">{{ stats.totalOrders }}</p>
      </div>
      <div class="bg-white p-5 rounded-sm shadow-sm">
        <p class="text-sm text-gray-500">Customers</p>
        <p class="text-2xl font-semibold mt-1">{{ stats.totalCustomers }}</p>
      </div>
      <div class="bg-white p-5 rounded-sm shadow-sm">
        <p class="text-sm text-gray-500">Products</p>
        <p class="text-2xl font-semibold mt-1">{{ stats.totalProducts }}</p>
      </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Recent Orders -->
      <div class="bg-white rounded-sm shadow-sm p-5">
        <h3 class="font-medium mb-4">Recent Orders</h3>
        <table class="admin-table">
          <thead><tr><th>Order #</th><th>Customer</th><th>Status</th><th>Total</th></tr></thead>
          <tbody>
            <tr v-for="o in stats.recentOrders" :key="o.id">
              <td><router-link :to="`/orders/${o.id}`" class="text-sage hover:underline">{{ o.orderNumber }}</router-link></td>
              <td class="text-gray-500">{{ o.email }}</td>
              <td><span :class="['px-2 py-0.5 text-xs rounded', statusClass(o.status)]">{{ o.status }}</span></td>
              <td>{{ formatPrice(o.total) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Top Products -->
      <div class="bg-white rounded-sm shadow-sm p-5">
        <h3 class="font-medium mb-4">Top Products</h3>
        <ul class="divide-y divide-gray-100">
          <li v-for="p in stats.topProducts" :key="p.id" class="py-3 flex justify-between items-center">
            <span class="text-sm">{{ p.name }}</span>
            <span class="text-sm text-gray-500">{{ p.reviewCount }} reviews · ★ {{ p.rating }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/utils/api';
import { formatPrice } from '@/utils/format';

function statusClass(s) {
  const map = { confirmed: 'bg-blue-100 text-blue-800', processing: 'bg-purple-100 text-purple-800', shipped: 'bg-indigo-100 text-indigo-800', delivered: 'bg-green-100 text-green-800' };
  return map[s] || 'bg-gray-100 text-gray-800';
}

const stats = ref({ recentOrders: [], topProducts: [], totalRevenue: 0, totalOrders: 0, totalCustomers: 0, totalProducts: 0 });

onMounted(async () => {
  try {
    const { data } = await api.get('/admin/dashboard');
    stats.value = { ...data.stats, recentOrders: data.recentOrders || [], topProducts: data.topProducts || [] };
  } catch { /* dashboard load failed */ }
});
</script>

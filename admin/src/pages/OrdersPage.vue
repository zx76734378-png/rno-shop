<template>
  <div>
    <h2 class="font-serif text-xl mb-6">Orders ({{ total }})</h2>
    <div class="bg-white rounded-sm shadow-sm overflow-x-auto">
      <table class="admin-table">
        <thead><tr><th>Order #</th><th>Customer</th><th>Date</th><th>Status</th><th>Total</th><th></th></tr></thead>
        <tbody>
          <tr v-for="o in orders" :key="o.id">
            <td class="font-medium">{{ o.orderNumber }}</td>
            <td class="text-gray-500">{{ o.email }}</td>
            <td class="text-gray-500">{{ formatDate(o.createdAt) }}</td>
            <td><span :class="['px-2 py-0.5 text-xs rounded', statusClass(o.status)]">{{ o.status }}</span></td>
            <td>{{ formatPrice(o.total) }}</td>
            <td><router-link :to="`/orders/${o.id}`" class="text-sage hover:underline text-xs">View</router-link></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/utils/api';
import { formatPrice, formatDate } from '@/utils/format';

function statusClass(s) {
  const m = { confirmed: 'bg-blue-100 text-blue-800', processing: 'bg-purple-100 text-purple-800', shipped: 'bg-indigo-100 text-indigo-800', delivered: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800' };
  return m[s] || 'bg-gray-100 text-gray-800';
}

const orders = ref([]); const total = ref(0);
onMounted(async () => { const { data } = await api.get('/admin/orders', { params: { limit: 50 } }); orders.value = data.orders; total.value = data.total; });
</script>

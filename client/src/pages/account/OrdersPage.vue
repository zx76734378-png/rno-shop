<template>
  <div>
    <h2 class="font-serif text-xl mb-6">My Orders</h2>
    <div v-if="loading" class="text-center py-10">
      <div class="inline-block w-6 h-6 border-2 border-sage border-t-transparent rounded-full animate-spin" />
    </div>
    <div v-else-if="!orders.length" class="text-center py-10 text-charcoal/50">
      <p>No orders yet.</p>
      <router-link to="/shop" class="text-sage hover:underline mt-2 inline-block">Start Shopping</router-link>
    </div>
    <div v-else class="space-y-4">
      <div v-for="order in orders" :key="order.id" class="bg-white p-6">
        <div class="flex flex-wrap justify-between items-start gap-4 mb-3">
          <div>
            <p class="font-medium">{{ order.orderNumber }}</p>
            <p class="text-sm text-charcoal/50">{{ formatDate(order.createdAt) }}</p>
          </div>
          <span :class="['px-3 py-1 text-xs font-medium', statusClass(order.status)]">{{ order.status }}</span>
        </div>
        <div class="text-sm text-charcoal/60">
          <p>{{ order.items?.length || 0 }} items · {{ formatPrice(order.total) }}</p>
        </div>
        <router-link :to="`/account/orders/${order.id}`" class="text-sage text-sm hover:underline mt-2 inline-block">View Details</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/utils/api';
import { formatPrice, formatDate } from '@/utils/format';

const orders = ref([]);
const loading = ref(true);

function statusClass(status) {
  const map = { pending: 'bg-yellow-100 text-yellow-800', confirmed: 'bg-blue-100 text-blue-800', processing: 'bg-purple-100 text-purple-800', shipped: 'bg-indigo-100 text-indigo-800', delivered: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800' };
  return map[status] || 'bg-gray-100 text-gray-800';
}

onMounted(async () => {
  try {
    const { data } = await api.get('/me/orders');
    orders.value = data.orders;
  } finally {
    loading.value = false;
  }
});
</script>

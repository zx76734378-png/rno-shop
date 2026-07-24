<template>
  <div v-if="order">
    <router-link to="/account/orders" class="text-sm text-sage hover:underline mb-4 inline-block">&larr; Back to Orders</router-link>
    <h2 class="font-serif text-xl mb-6">Order {{ order.orderNumber }}</h2>

    <div class="bg-white p-6 mb-6">
      <div class="flex flex-wrap gap-6 text-sm mb-6">
        <div><span class="text-charcoal/50">Date:</span> {{ formatDate(order.createdAt) }}</div>
        <div><span class="text-charcoal/50">Status:</span> <span :class="['px-2 py-0.5 text-xs font-medium rounded', statusClass(order.status)]">{{ order.status }}</span></div>
        <div><span class="text-charcoal/50">Email:</span> {{ order.email }}</div>
      </div>

      <!-- Status Timeline -->
      <div class="flex items-center gap-2 mb-8">
        <template v-for="(s, i) in statuses" :key="s.key">
          <div :class="['flex items-center gap-1 text-xs', statusIndex(order.status) >= i ? 'text-sage' : 'text-gray-300']">
            <span :class="['w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white', statusIndex(order.status) >= i ? 'bg-sage' : 'bg-gray-300']">{{ i + 1 }}</span>
            <span class="hidden sm:inline">{{ s.label }}</span>
          </div>
          <div v-if="i < statuses.length - 1" :class="['flex-1 h-px', statusIndex(order.status) > i ? 'bg-sage' : 'bg-gray-200']" />
        </template>
      </div>

      <!-- Items -->
      <h3 class="font-medium mb-3">Items</h3>
      <div class="space-y-3">
        <div v-for="item in order.items" :key="item.id" class="flex justify-between text-sm py-2 border-b border-gray-100">
          <div>
            <p class="font-medium">{{ item.productName }}</p>
            <p v-if="item.variantName" class="text-charcoal/50">{{ item.variantName }}</p>
            <p class="text-charcoal/50">Qty: {{ item.quantity }}</p>
          </div>
          <span>{{ formatPrice(item.total) }}</span>
        </div>
      </div>

      <div class="border-t border-gray-200 mt-4 pt-4 space-y-1 text-sm text-right">
        <p><span class="text-charcoal/50">Subtotal:</span> {{ formatPrice(order.subtotal) }}</p>
        <p><span class="text-charcoal/50">Shipping:</span> {{ formatPrice(order.shippingCost) }}</p>
        <p><span class="text-charcoal/50">Tax:</span> {{ formatPrice(order.tax) }}</p>
        <p class="font-serif text-lg mt-2"><span class="text-charcoal/50">Total:</span> {{ formatPrice(order.total) }}</p>
      </div>
    </div>

    <!-- Shipping Address -->
    <div v-if="order.shippingAddress" class="bg-white p-6">
      <h3 class="font-medium mb-3">Shipping Address</h3>
      <p class="text-sm text-charcoal/60">
        {{ order.shippingAddress.firstName }} {{ order.shippingAddress.lastName }}<br />
        {{ order.shippingAddress.street }}<br />
        {{ order.shippingAddress.city }}, {{ order.shippingAddress.state }} {{ order.shippingAddress.zipCode }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/utils/api';
import { formatPrice, formatDate } from '@/utils/format';

const route = useRoute();
const order = ref(null);

const statuses = [
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

function statusIndex(status) { return statuses.findIndex(s => s.key === status); }
function statusClass(status) {
  const map = { confirmed: 'bg-blue-100 text-blue-800', processing: 'bg-purple-100 text-purple-800', shipped: 'bg-indigo-100 text-indigo-800', delivered: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800' };
  return map[status] || 'bg-gray-100 text-gray-800';
}

onMounted(async () => {
  try {
    const { data } = await api.get(`/me/orders/${route.params.id}`);
    order.value = data.order;
  } catch { order.value = null; }
});
</script>

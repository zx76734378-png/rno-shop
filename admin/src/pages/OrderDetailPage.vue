<template>
  <div v-if="order">
    <router-link to="/orders" class="text-sage hover:underline text-sm mb-4 inline-block">&larr; Back</router-link>
    <div class="flex flex-wrap items-center gap-4 mb-6">
      <h2 class="font-serif text-xl">{{ order.orderNumber }}</h2>
      <span :class="['px-2 py-0.5 text-xs rounded', statusClass(order.status)]">{{ order.status }}</span>
    </div>

    <div class="grid lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-white p-6 rounded-sm shadow-sm">
        <h3 class="font-medium mb-3">Items</h3>
        <table class="admin-table"><thead><tr><th>Product</th><th>Variant</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
          <tbody><tr v-for="item in order.items" :key="item.id">
            <td>{{ item.productName }}</td><td class="text-gray-500">{{ item.variantName || '—' }}</td>
            <td>{{ item.quantity }}</td><td>{{ formatPrice(item.price) }}</td><td>{{ formatPrice(item.total) }}</td>
          </tr></tbody>
        </table>
        <div class="border-t pt-4 mt-4 space-y-1 text-right text-sm">
          <p><span class="text-gray-500">Subtotal:</span> {{ formatPrice(order.subtotal) }}</p>
          <p><span class="text-gray-500">Shipping:</span> {{ formatPrice(order.shippingCost) }}</p>
          <p><span class="text-gray-500">Tax:</span> {{ formatPrice(order.tax) }}</p>
          <p class="font-medium text-lg">{{ formatPrice(order.total) }}</p>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-white p-6 rounded-sm shadow-sm">
          <h3 class="font-medium mb-3">Customer</h3>
          <p class="text-sm text-gray-600">{{ order.email }}</p>
        </div>

        <div class="bg-white p-6 rounded-sm shadow-sm">
          <h3 class="font-medium mb-3">Update Status</h3>
          <select v-model="newStatus" class="admin-input mb-2 text-sm">
            <option value="confirmed">Confirmed</option><option value="processing">Processing</option>
            <option value="shipped">Shipped</option><option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input v-model="statusNote" placeholder="Note (optional)" class="admin-input mb-2 text-sm" />
          <button @click="updateStatus" :disabled="updating" class="admin-btn-primary w-full text-xs">{{ updating ? '...' : 'Update' }}</button>
        </div>

        <div v-if="order.shippingAddress" class="bg-white p-6 rounded-sm shadow-sm">
          <h3 class="font-medium mb-3">Shipping Address</h3>
          <p class="text-sm text-gray-600">
            {{ order.shippingAddress.firstName }} {{ order.shippingAddress.lastName }}<br />
            {{ order.shippingAddress.street }}<br />
            {{ order.shippingAddress.city }}, {{ order.shippingAddress.state }} {{ order.shippingAddress.zipCode }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/utils/api';
import { formatPrice } from '@/utils/format';

function statusClass(s) {
  const m = { confirmed: 'bg-blue-100 text-blue-800', processing: 'bg-purple-100 text-purple-800', shipped: 'bg-indigo-100 text-indigo-800', delivered: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800' };
  return m[s] || 'bg-gray-100 text-gray-800';
}

const route = useRoute();
const order = ref(null);
const newStatus = ref('');
const statusNote = ref('');
const updating = ref(false);

async function updateStatus() {
  updating.value = true;
  await api.put(`/admin/orders/${route.params.id}/status`, { status: newStatus.value, notes: statusNote.value });
  const { data } = await api.get(`/admin/orders/${route.params.id}`);
  order.value = data.order;
  updating.value = false;
}

onMounted(async () => {
  const { data } = await api.get(`/admin/orders/${route.params.id}`);
  order.value = data.order;
  newStatus.value = data.order.status;
});
</script>

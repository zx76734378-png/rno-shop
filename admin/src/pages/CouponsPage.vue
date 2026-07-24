<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="font-serif text-xl">Coupons</h2>
      <button @click="showForm = true" v-if="!showForm" class="admin-btn-primary">+ New Coupon</button>
    </div>

    <form v-if="showForm" @submit.prevent="createCoupon" class="bg-white p-4 rounded-sm shadow-sm mb-6 max-w-md space-y-3">
      <input v-model="form.code" placeholder="Code (e.g., WELCOME10)" required class="admin-input" />
      <div class="flex gap-3">
        <select v-model="form.type" class="admin-input flex-1"><option value="percentage">Percentage</option><option value="fixed">Fixed Amount</option></select>
        <input v-model.number="form.value" type="number" step="0.01" placeholder="Value" required class="admin-input w-32" />
      </div>
      <div class="flex gap-3">
        <button type="submit" :disabled="creating" class="admin-btn-primary text-xs">{{ creating ? '...' : 'Create' }}</button>
        <button type="button" @click="showForm = false" class="admin-btn-outline text-xs">Cancel</button>
      </div>
    </form>

    <div class="bg-white rounded-sm shadow-sm overflow-x-auto">
      <table class="admin-table">
        <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Used</th><th>Active</th><th></th></tr></thead>
        <tbody>
          <tr v-for="c in coupons" :key="c.id">
            <td class="font-medium">{{ c.code }}</td><td>{{ c.type }}</td>
            <td>{{ c.type === 'percentage' ? `${c.value}%` : formatPrice(c.value) }}</td>
            <td>{{ c.usedCount }}{{ c.usageLimit ? ` / ${c.usageLimit}` : '' }}</td>
            <td><span :class="c.isActive ? 'text-green-600' : 'text-red-500'">{{ c.isActive ? 'Yes' : 'No' }}</span></td>
            <td><button @click="deleteCoupon(c.id)" class="text-red-500 hover:underline text-xs">Delete</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '@/utils/api';
import { formatPrice } from '@/utils/format';

const coupons = ref([]); const showForm = ref(false); const creating = ref(false);
const form = reactive({ code: '', type: 'percentage', value: 10 });

async function fetch() { const { data } = await api.get('/admin/coupons'); coupons.value = data.coupons; }
async function createCoupon() {
  creating.value = true;
  try { await api.post('/admin/coupons', form); showForm.value = false; Object.assign(form, { code: '', type: 'percentage', value: 10 }); await fetch(); }
  finally { creating.value = false; }
}
async function deleteCoupon(id) { if (!confirm('Delete?')) return; await api.delete(`/admin/coupons/${id}`); await fetch(); }
onMounted(fetch);
</script>

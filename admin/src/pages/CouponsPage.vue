<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="font-serif text-xl">Coupons</h2>
      <button @click="openCreate" v-if="!showForm" class="admin-btn-primary">+ New Coupon</button>
    </div>

    <form v-if="showForm" @submit.prevent="submitForm" class="bg-white p-4 rounded-sm shadow-sm mb-6 max-w-md space-y-3">
      <input v-model="form.code" placeholder="Code (e.g., WELCOME10)" required class="admin-input" />
      <div class="flex gap-3">
        <select v-model="form.type" class="admin-input flex-1"><option value="percentage">Percentage</option><option value="fixed">Fixed Amount</option></select>
        <input v-model.number="form.value" type="number" step="0.01" placeholder="Value" required class="admin-input w-32" />
      </div>
      <div class="flex gap-3">
        <button type="submit" :disabled="saving" class="admin-btn-primary text-xs">{{ saving ? '...' : (editingId ? 'Update' : 'Create') }}</button>
        <button type="button" @click="cancelForm" class="admin-btn-outline text-xs">Cancel</button>
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
            <td><button @click="editCoupon(c)" class="text-sage hover:underline text-xs mr-3">Edit</button><button @click="deleteCoupon(c.id)" class="text-red-500 hover:underline text-xs">Delete</button></td>
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

const coupons = ref([]); const showForm = ref(false); const saving = ref(false); const editingId = ref(null);
const emptyForm = { code: '', type: 'percentage', value: 10 };
const form = reactive({ ...emptyForm });

async function fetch() { const { data } = await api.get('/admin/coupons'); coupons.value = data.coupons; }

function openCreate() { editingId.value = null; Object.assign(form, emptyForm); showForm.value = true; }
function editCoupon(c) { editingId.value = c.id; Object.assign(form, { code: c.code, type: c.type, value: c.value }); showForm.value = true; }
function cancelForm() { showForm.value = false; editingId.value = null; }

async function submitForm() {
  saving.value = true;
  try {
    if (editingId.value) {
      await api.put(`/admin/coupons/${editingId.value}`, form);
    } else {
      await api.post('/admin/coupons', form);
    }
    cancelForm();
    await fetch();
  } finally { saving.value = false; }
}

async function deleteCoupon(id) { if (!confirm('Delete?')) return; await api.delete(`/admin/coupons/${id}`); await fetch(); }
onMounted(fetch);
</script>

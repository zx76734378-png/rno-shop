<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="font-serif text-xl">My Addresses</h2>
      <button @click="showForm = true" v-if="!showForm" class="btn-outline text-xs">Add Address</button>
    </div>

    <!-- Address List -->
    <div v-if="!showForm && addresses.length" class="grid md:grid-cols-2 gap-4">
      <div v-for="addr in addresses" :key="addr.id" class="bg-white p-5 relative">
        <span v-if="addr.isDefault" class="text-xs text-sage font-medium">Default</span>
        <p class="text-sm mt-1">
          {{ addr.firstName }} {{ addr.lastName }}<br />
          {{ addr.street }}<br v-if="addr.apartment" />
          {{ addr.apartment }}<br v-if="addr.apartment" />
          {{ addr.city }}, {{ addr.state }} {{ addr.zipCode }}<br />
          {{ addr.phone }}
        </p>
        <div class="flex gap-3 mt-3">
          <button @click="editAddress(addr)" class="text-xs text-sage hover:underline">Edit</button>
          <button @click="deleteAddress(addr.id)" class="text-xs text-red-500 hover:underline">Delete</button>
        </div>
      </div>
    </div>

    <p v-if="!showForm && !addresses.length" class="text-charcoal/50 text-center py-10">No saved addresses.</p>

    <!-- Address Form -->
    <div v-if="showForm" class="bg-white p-6 max-w-lg">
      <h3 class="font-medium mb-4">{{ editingId ? 'Edit' : 'Add' }} Address</h3>
      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div><label class="text-xs mb-1 block">First Name</label><input v-model="form.firstName" class="input-field text-sm" /></div>
          <div><label class="text-xs mb-1 block">Last Name</label><input v-model="form.lastName" class="input-field text-sm" /></div>
        </div>
        <div><label class="text-xs mb-1 block">Street</label><input v-model="form.street" class="input-field text-sm" /></div>
        <div><label class="text-xs mb-1 block">Apartment</label><input v-model="form.apartment" class="input-field text-sm" /></div>
        <div class="grid grid-cols-3 gap-3">
          <div><label class="text-xs mb-1 block">City</label><input v-model="form.city" class="input-field text-sm" /></div>
          <div><label class="text-xs mb-1 block">State</label><input v-model="form.state" class="input-field text-sm" /></div>
          <div><label class="text-xs mb-1 block">Zip Code</label><input v-model="form.zipCode" class="input-field text-sm" /></div>
        </div>
        <div><label class="text-xs mb-1 block">Phone</label><input v-model="form.phone" class="input-field text-sm" /></div>
        <label class="flex items-center gap-2 text-sm"><input type="checkbox" v-model="form.isDefault" class="accent-sage" /> Set as default</label>
      </div>
      <div class="flex gap-3 mt-4">
        <button @click="saveAddress" :disabled="saving" class="btn-primary text-xs px-6">{{ saving ? 'Saving...' : 'Save' }}</button>
        <button @click="showForm = false; editingId = null" class="btn-ghost">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import api from '@/utils/api';

const addresses = ref([]);
const showForm = ref(false);
const editingId = ref(null);
const saving = ref(false);

const form = reactive({ firstName: '', lastName: '', street: '', apartment: '', city: '', state: '', zipCode: '', phone: '', isDefault: false });

function editAddress(addr) {
  editingId.value = addr.id;
  Object.assign(form, {
    firstName: addr.firstName, lastName: addr.lastName, street: addr.street, apartment: addr.apartment || '',
    city: addr.city, state: addr.state, zipCode: addr.zipCode, phone: addr.phone || '', isDefault: addr.isDefault,
  });
  showForm.value = true;
}

async function saveAddress() {
  saving.value = true;
  try {
    if (editingId.value) {
      await api.put(`/me/addresses/${editingId.value}`, form);
    } else {
      await api.post('/me/addresses', form);
    }
    showForm.value = false;
    editingId.value = null;
    await fetchAddresses();
  } finally {
    saving.value = false;
  }
}

async function deleteAddress(id) {
  if (!confirm('Delete this address?')) return;
  await api.delete(`/me/addresses/${id}`);
  await fetchAddresses();
}

async function fetchAddresses() {
  try {
    const { data } = await api.get('/me/addresses');
    addresses.value = data.addresses;
  } catch { addresses.value = []; }
}

onMounted(fetchAddresses);
</script>

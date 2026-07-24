<template>
  <div>
    <h2 class="font-serif text-xl mb-6">Customers ({{ total }})</h2>
    <div class="bg-white rounded-sm shadow-sm overflow-x-auto">
      <table class="admin-table">
        <thead><tr><th>Name</th><th>Email</th><th>Orders</th><th>Joined</th><th>Status</th></tr></thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td>{{ [u.firstName, u.lastName].filter(Boolean).join(' ') || '—' }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u._count?.orders || 0 }}</td>
            <td class="text-gray-500">{{ formatDate(u.createdAt) }}</td>
            <td><span :class="u.isActive ? 'text-green-600' : 'text-red-500'">{{ u.isActive ? 'Active' : 'Inactive' }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/utils/api';
import { formatDate } from '@/utils/format';

const users = ref([]); const total = ref(0);
onMounted(async () => { const { data } = await api.get('/admin/users', { params: { limit: 50 } }); users.value = data.users; total.value = data.total; });
</script>

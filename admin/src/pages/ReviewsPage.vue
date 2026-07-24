<template>
  <div>
    <h2 class="font-serif text-xl mb-6">Reviews</h2>
    <div class="bg-white rounded-sm shadow-sm overflow-x-auto">
      <table class="admin-table">
        <thead><tr><th>Product</th><th>User</th><th>Rating</th><th>Review</th><th>Approved</th><th></th></tr></thead>
        <tbody>
          <tr v-for="r in reviews" :key="r.id">
            <td>{{ r.product?.name || '—' }}</td>
            <td class="text-gray-500">{{ r.user?.email || '—' }}</td>
            <td>★ {{ r.rating }}</td>
            <td class="max-w-xs truncate text-gray-500">{{ r.title || r.body?.slice(0, 60) || '—' }}</td>
            <td><span :class="r.isApproved ? 'text-green-600' : 'text-yellow-600'">{{ r.isApproved ? 'Yes' : 'No' }}</span></td>
            <td class="flex gap-2">
              <button v-if="!r.isApproved" @click="approve(r.id)" class="text-sage hover:underline text-xs">Approve</button>
              <button @click="deleteReview(r.id)" class="text-red-500 hover:underline text-xs">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/utils/api';

const reviews = ref([]);
async function fetch() { const { data } = await api.get('/admin/reviews'); reviews.value = data.reviews; }
async function approve(id) { await api.put(`/admin/reviews/${id}/approve`); await fetch(); }
async function deleteReview(id) { if (!confirm('Delete?')) return; await api.delete(`/admin/reviews/${id}`); await fetch(); }
onMounted(fetch);
</script>

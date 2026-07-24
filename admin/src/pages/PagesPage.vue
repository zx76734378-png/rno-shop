<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="font-serif text-xl">Content Pages</h2>
      <router-link to="/pages/new/edit" class="admin-btn-primary">+ New Page</router-link>
    </div>
    <div class="bg-white rounded-sm shadow-sm overflow-x-auto">
      <table class="admin-table">
        <thead><tr><th>Title</th><th>Slug</th><th>Published</th><th></th></tr></thead>
        <tbody>
          <tr v-for="p in pages" :key="p.id">
            <td class="font-medium">{{ p.title }}</td>
            <td class="text-gray-500">{{ p.slug }}</td>
            <td><span :class="p.isPublished ? 'text-green-600' : 'text-gray-400'">{{ p.isPublished ? 'Yes' : 'No' }}</span></td>
            <td><router-link :to="`/pages/${p.id}/edit`" class="text-sage hover:underline text-xs">Edit</router-link></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/utils/api';
const pages = ref([]);
onMounted(async () => { const { data } = await api.get('/admin/pages'); pages.value = data.pages; });
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="font-serif text-xl">Categories</h2>
      <button @click="openNew" class="admin-btn-primary">+ Add Category</button>
    </div>

    <div v-if="showForm" class="bg-white p-4 rounded-sm shadow-sm mb-6 max-w-md">
      <h3 class="font-medium text-sm mb-3">{{ editingId ? 'Edit Category' : 'New Category' }}</h3>
      <div class="space-y-3">
        <input v-model="form.name" placeholder="Category name *" class="admin-input" />
        <select v-model="form.parentId" class="admin-input">
          <option value="">No parent (top-level)</option>
          <option v-for="c in categories" :key="c.id" :value="c.id" :disabled="c.id === editingId">{{ c.name }}</option>
        </select>
        <input v-model="form.description" placeholder="Description" class="admin-input" />
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="form.isActive" class="accent-sage" /> Active
        </label>
        <div class="flex gap-3">
          <button @click="saveCategory" class="admin-btn-primary text-xs">Save</button>
          <button @click="closeForm" class="admin-btn-outline text-xs">Cancel</button>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-sm shadow-sm">
      <table class="admin-table">
        <thead><tr><th>Name</th><th>Slug</th><th>Parent</th><th>Status</th><th></th></tr></thead>
        <tbody>
          <tr v-for="c in categories" :key="c.id">
            <td class="font-medium">{{ c.name }}</td>
            <td class="text-gray-500">{{ c.slug }}</td>
            <td class="text-gray-500">{{ c.parent?.name || '—' }}</td>
            <td><span :class="c.isActive ? 'text-green-600' : 'text-red-500'">{{ c.isActive ? 'Active' : 'Inactive' }}</span></td>
            <td class="flex gap-3">
              <button @click="editCategory(c)" class="text-sage hover:underline text-xs">Edit</button>
              <button @click="deleteCategory(c.id)" class="text-red-500 hover:underline text-xs">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '@/utils/api';

const categories = ref([]);
const showForm = ref(false);
const editingId = ref(null);
const form = reactive({ name: '', description: '', parentId: '', isActive: true });

function openNew() {
  editingId.value = null;
  Object.assign(form, { name: '', description: '', parentId: '', isActive: true });
  showForm.value = true;
}

function editCategory(c) {
  editingId.value = c.id;
  Object.assign(form, {
    name: c.name,
    description: c.description || '',
    parentId: c.parentId || '',
    isActive: c.isActive,
  });
  showForm.value = true;
}

function closeForm() {
  showForm.value = false;
  editingId.value = null;
}

async function fetch() {
  const { data } = await api.get('/admin/categories');
  categories.value = data.categories;
}

async function saveCategory() {
  const payload = {
    name: form.name,
    description: form.description,
    parentId: form.parentId || null,
    isActive: form.isActive,
  };
  if (editingId.value) {
    await api.put(`/admin/categories/${editingId.value}`, payload);
  } else {
    await api.post('/admin/categories', payload);
  }
  closeForm();
  await fetch();
}

async function deleteCategory(id) {
  if (!confirm('Delete this category?')) return;
  await api.delete(`/admin/categories/${id}`);
  await fetch();
}

onMounted(fetch);
</script>

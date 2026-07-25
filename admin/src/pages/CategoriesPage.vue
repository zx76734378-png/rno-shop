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

        <!-- Image Upload -->
        <div>
          <label class="text-xs mb-1 block font-medium">Category Image</label>
          <div v-if="form.image" class="relative w-32 h-32 mb-2 rounded overflow-hidden bg-gray-100">
            <img :src="form.image" class="w-full h-full object-cover" />
            <button @click="form.image = ''" class="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">&times;</button>
          </div>
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-sage transition-colors cursor-pointer"
            @click="$refs.catFileInput.click()">
            <svg class="w-6 h-6 text-gray-300 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="text-xs text-gray-400">Click to upload image</p>
            <input ref="catFileInput" type="file" accept="image/png,image/jpeg,image/webp" class="hidden" @change="uploadCatImage" />
          </div>
          <p v-if="uploadingImage" class="text-xs text-blue-500 mt-1">Uploading...</p>
        </div>

        <div class="flex gap-3">
          <button @click="saveCategory" class="admin-btn-primary text-xs">Save</button>
          <button @click="closeForm" class="admin-btn-outline text-xs">Cancel</button>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-sm shadow-sm">
      <table class="admin-table">
        <thead><tr><th></th><th>Name</th><th>Slug</th><th>Parent</th><th>Status</th><th></th></tr></thead>
        <tbody>
          <tr v-for="c in categories" :key="c.id">
            <td><img v-if="c.image" :src="c.image" class="w-10 h-10 object-cover rounded" /></td>
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
const uploadingImage = ref(false);
const catFileInput = ref(null);
const form = reactive({ name: '', description: '', parentId: '', isActive: true, image: '' });

function openNew() {
  editingId.value = null;
  Object.assign(form, { name: '', description: '', parentId: '', isActive: true, image: '' });
  showForm.value = true;
}

function editCategory(c) {
  editingId.value = c.id;
  Object.assign(form, {
    name: c.name,
    description: c.description || '',
    parentId: c.parentId || '',
    isActive: c.isActive,
    image: c.image || '',
  });
  showForm.value = true;
}

function closeForm() {
  showForm.value = false;
  editingId.value = null;
}

async function uploadCatImage(e) {
  const file = e.target.files[0];
  if (!file) return;
  uploadingImage.value = true;
  try {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', 'rno_shop_upload');
    const res = await fetch('https://api.cloudinary.com/v1_1/oy1ugvxg/image/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.secure_url) form.image = data.secure_url;
  } catch {} finally { uploadingImage.value = false; }
}

async function loadCategories() {
  const { data } = await api.get('/admin/categories');
  categories.value = data.categories;
}

async function saveCategory() {
  const payload = {
    name: form.name,
    description: form.description,
    parentId: form.parentId || null,
    isActive: form.isActive,
    image: form.image || null,
  };
  if (editingId.value) {
    await api.put(`/admin/categories/${editingId.value}`, payload);
  } else {
    await api.post('/admin/categories', payload);
  }
  closeForm();
  await loadCategories();
}

async function deleteCategory(id) {
  if (!confirm('Delete this category?')) return;
  await api.delete(`/admin/categories/${id}`);
  await loadCategories();
}

onMounted(loadCategories);
</script>

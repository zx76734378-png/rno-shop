<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="font-serif text-xl">Hero Banners</h2>
      <button @click="openCreate" v-if="!showForm" class="admin-btn-primary">+ Add Banner</button>
    </div>

    <form v-if="showForm" @submit.prevent="submitForm" class="bg-white p-4 rounded-sm shadow-sm mb-6 max-w-xl space-y-3">
      <input v-model="form.title" placeholder="Title" required class="admin-input" />
      <input v-model="form.subtitle" placeholder="Subtitle" class="admin-input" />
      <div class="grid grid-cols-2 gap-3">
        <input v-model="form.imageDesktop" placeholder="Desktop Image URL" required class="admin-input" />
        <input v-model="form.imageMobile" placeholder="Mobile Image URL" class="admin-input" />
      </div>
      <div class="grid grid-cols-2 gap-3">
        <input v-model="form.buttonText" placeholder="Button Text" class="admin-input" />
        <input v-model="form.buttonLink" placeholder="Button Link" class="admin-input" />
      </div>
      <div class="flex gap-3">
        <button type="submit" :disabled="saving" class="admin-btn-primary text-xs">{{ saving ? '...' : (editingId ? 'Update' : 'Create') }}</button>
        <button type="button" @click="cancelForm" class="admin-btn-outline text-xs">Cancel</button>
      </div>
    </form>

    <div class="bg-white rounded-sm shadow-sm overflow-x-auto">
      <table class="admin-table">
        <thead><tr><th>Title</th><th>Image</th><th>Active</th><th>Order</th><th></th></tr></thead>
        <tbody>
          <tr v-for="b in banners" :key="b.id">
            <td class="font-medium">{{ b.title }}</td>
            <td><img :src="b.imageDesktop" class="w-16 h-10 object-cover rounded" /></td>
            <td><span :class="b.isActive ? 'text-green-600' : 'text-red-500'">{{ b.isActive ? 'Yes' : 'No' }}</span></td>
            <td>{{ b.sortOrder }}</td>
            <td><button @click="editBanner(b)" class="text-sage hover:underline text-xs mr-3">Edit</button><button @click="deleteBanner(b.id)" class="text-red-500 hover:underline text-xs">Delete</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '@/utils/api';

const banners = ref([]); const showForm = ref(false); const saving = ref(false); const editingId = ref(null);
const emptyForm = { title: '', subtitle: '', imageDesktop: '', imageMobile: '', buttonText: '', buttonLink: '' };
const form = reactive({ ...emptyForm });

async function fetch() { const { data } = await api.get('/admin/banners'); banners.value = data.banners; }

function openCreate() { editingId.value = null; Object.assign(form, emptyForm); showForm.value = true; }
function editBanner(b) { editingId.value = b.id; Object.assign(form, { title: b.title, subtitle: b.subtitle || '', imageDesktop: b.imageDesktop, imageMobile: b.imageMobile || '', buttonText: b.buttonText || '', buttonLink: b.buttonLink || '' }); showForm.value = true; }
function cancelForm() { showForm.value = false; editingId.value = null; }

async function submitForm() {
  saving.value = true;
  try {
    if (editingId.value) {
      await api.put(`/admin/banners/${editingId.value}`, form);
    } else {
      await api.post('/admin/banners', form);
    }
    cancelForm();
    await fetch();
  } finally { saving.value = false; }
}

async function deleteBanner(id) { if (!confirm('Delete?')) return; await api.delete(`/admin/banners/${id}`); await fetch(); }
onMounted(fetch);
</script>

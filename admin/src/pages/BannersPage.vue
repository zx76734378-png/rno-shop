<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="font-serif text-xl">Hero Banners</h2>
      <button @click="openCreate" v-if="!showForm" class="admin-btn-primary">+ Add Banner</button>
    </div>

    <form v-if="showForm" @submit.prevent="submitForm" class="bg-white p-4 rounded-sm shadow-sm mb-6 max-w-xl space-y-3">
      <input v-model="form.title" placeholder="Title" required class="admin-input" />
      <input v-model="form.subtitle" placeholder="Subtitle" class="admin-input" />

      <!-- Desktop Image -->
      <div>
        <label class="text-xs mb-1 block font-medium">Desktop Image</label>
        <div v-if="form.imageDesktop" class="relative w-full h-32 mb-2 rounded overflow-hidden bg-gray-100">
          <img :src="form.imageDesktop" class="w-full h-full object-cover" />
          <button @click="form.imageDesktop = ''" class="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">&times;</button>
        </div>
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-sage transition-colors cursor-pointer"
          @click="$refs.desktopInput.click()">
          <svg class="w-6 h-6 text-gray-300 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <p class="text-xs text-gray-400">Click to upload (recommended: 1920×1080)</p>
          <input ref="desktopInput" type="file" accept="image/png,image/jpeg,image/webp" class="hidden" @change="e => uploadBannerImage(e, 'imageDesktop')" />
        </div>
        <p v-if="uploading === 'imageDesktop'" class="text-xs text-blue-500 mt-1">Uploading...</p>
      </div>

      <!-- Mobile Image -->
      <div>
        <label class="text-xs mb-1 block font-medium">Mobile Image (optional)</label>
        <div v-if="form.imageMobile" class="relative w-32 h-48 mb-2 rounded overflow-hidden bg-gray-100">
          <img :src="form.imageMobile" class="w-full h-full object-cover" />
          <button @click="form.imageMobile = ''" class="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">&times;</button>
        </div>
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-sage transition-colors cursor-pointer"
          @click="$refs.mobileInput.click()">
          <p class="text-xs text-gray-400">Click to upload (recommended: 800×1200)</p>
          <input ref="mobileInput" type="file" accept="image/png,image/jpeg,image/webp" class="hidden" @change="e => uploadBannerImage(e, 'imageMobile')" />
        </div>
        <p v-if="uploading === 'imageMobile'" class="text-xs text-blue-500 mt-1">Uploading...</p>
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

const banners = ref([]); const showForm = ref(false); const saving = ref(false); const editingId = ref(null); const uploading = ref(null);
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

async function uploadBannerImage(e, field) {
  const file = e.target.files[0];
  if (!file) return;
  uploading.value = field;
  try {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', 'rno_shop_upload');
    const res = await fetch('https://api.cloudinary.com/v1_1/oy1ugvxg/image/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.secure_url) form[field] = data.secure_url;
  } catch {} finally { uploading.value = null; }
}

async function deleteBanner(id) { if (!confirm('Delete?')) return; await api.delete(`/admin/banners/${id}`); await fetch(); }
onMounted(fetch);
</script>

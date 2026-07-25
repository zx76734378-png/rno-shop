<template>
  <div>
    <h2 class="font-serif text-xl mb-6">Site Settings</h2>
    <div class="bg-white p-6 rounded-sm shadow-sm max-w-xl">
      <div v-for="s in settings" :key="s.id" class="mb-4">
        <label class="text-xs mb-1 block font-medium text-gray-500">{{ s.key }} <span class="text-gray-300">({{ s.group }})</span></label>

        <!-- Image settings: show upload + preview -->
        <template v-if="s.key.endsWith('_image')">
          <div v-if="s.value" class="relative w-48 h-32 mb-2 rounded overflow-hidden bg-gray-100">
            <img :src="s.value" class="w-full h-full object-cover" />
            <button @click="s.value = ''; updateSetting(s)" class="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">&times;</button>
          </div>
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-sage transition-colors cursor-pointer"
            @click="triggerUpload(s)">
            <p class="text-xs text-gray-400">Click to upload image</p>
          </div>
          <p v-if="uploadingKey === s.key" class="text-xs text-blue-500 mt-1">Uploading...</p>
        </template>

        <!-- Normal text settings -->
        <input v-else v-model="s.value" class="admin-input" @blur="updateSetting(s)" />
      </div>
      <div class="text-sm text-gray-400 mt-4">Changes are saved automatically on blur.</div>
    </div>

    <!-- Hidden shared file input for image uploads -->
    <input ref="fileInput" type="file" accept="image/png,image/jpeg,image/webp" class="hidden" @change="onFileChange" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/utils/api';

const settings = ref([]);
const uploadingKey = ref(null);
const fileInput = ref(null);
let pendingSetting = null;

async function fetch() {
  const { data } = await api.get('/admin/settings');
  settings.value = data.settings;
  // Ensure story_image exists in the list
  if (!settings.value.find(s => s.key === 'story_image')) {
    settings.value.push({ id: 'new_story_image', key: 'story_image', value: '', group: 'general' });
  }
}

async function updateSetting(s) {
  await api.put('/admin/settings', { settings: [{ key: s.key, value: s.value, group: s.group }] });
}

function triggerUpload(s) {
  pendingSetting = s;
  fileInput.value.click();
}

async function onFileChange(e) {
  const file = e.target.files[0];
  if (!file || !pendingSetting) return;
  uploadingKey.value = pendingSetting.key;
  try {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', 'rno_shop_upload');
    const res = await fetch('https://api.cloudinary.com/v1_1/oy1ugvxg/image/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.secure_url) {
      pendingSetting.value = data.secure_url;
      await updateSetting(pendingSetting);
    }
  } catch {} finally {
    uploadingKey.value = null;
    fileInput.value.value = '';
    pendingSetting = null;
  }
}

onMounted(fetch);
</script>

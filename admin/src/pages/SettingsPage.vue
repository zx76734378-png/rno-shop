<template>
  <div>
    <h2 class="font-serif text-xl mb-6">Site Settings</h2>

    <!-- Story Image Upload (same pattern as ProductEditPage) -->
    <div class="bg-white p-6 rounded-sm shadow-sm mb-6 max-w-xl">
      <label class="text-xs mb-2 block font-medium">Story Image (首页品牌故事图)</label>

      <!-- Current saved image -->
      <div v-if="storyImageUrl && !storyPreview" class="relative w-64 h-48 mb-3 rounded overflow-hidden bg-gray-100">
        <img :src="storyImageUrl" class="w-full h-full object-cover" />
        <button @click="removeStoryImage" class="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm flex items-center justify-center">&times;</button>
      </div>

      <!-- New file preview before upload -->
      <div v-if="storyPreview" class="flex items-center gap-3 p-2 bg-gray-50 rounded text-sm mb-3">
        <img :src="storyPreview" class="w-12 h-12 object-cover rounded" />
        <span class="flex-1 truncate">{{ storyFileName }}</span>
        <button v-if="!storyUploading" @click="uploadStoryImage" class="admin-btn-primary text-xs">Upload</button>
        <span v-else class="text-blue-500 text-xs">Uploading...</span>
        <button @click="cancelStoryUpload" class="text-red-400 text-xs">&times;</button>
      </div>

      <!-- Drop zone -->
      <div v-if="!storyPreview" class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-sage transition-colors cursor-pointer"
        @click="$refs.storyFileInput.click()" @dragover.prevent @drop.prevent="handleStoryDrop">
        <svg class="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p class="text-sm text-gray-500 mb-1">
          <span class="text-sage font-medium">Click to upload</span> or drag and drop
        </p>
        <p class="text-xs text-gray-400">PNG, JPG, WEBP up to 5MB</p>
        <input ref="storyFileInput" type="file" accept="image/png,image/jpeg,image/webp" class="hidden" @change="handleStoryFile" />
      </div>

      <p v-if="storyMessage" :class="['text-xs mt-2', storyMessageType === 'error' ? 'text-red-500' : 'text-green-600']">{{ storyMessage }}</p>
    </div>

    <!-- Other Settings -->
    <div class="bg-white p-6 rounded-sm shadow-sm max-w-xl">
      <h3 class="font-medium text-sm mb-4">Other Settings</h3>
      <div v-for="s in textSettings" :key="s.id" class="mb-4">
        <label class="text-xs mb-1 block font-medium text-gray-500">{{ s.key }} <span class="text-gray-300">({{ s.group }})</span></label>
        <input v-model="s.value" class="admin-input" @blur="updateSetting(s)" />
      </div>
      <div class="text-sm text-gray-400 mt-4">Changes are saved automatically on blur.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/utils/api';

const settings = ref([]);
const storyFileInput = ref(null);
const storyUploading = ref(false);
const storyPreview = ref('');
const storyFileName = ref('');
const storyFile = ref(null);
const storyMessage = ref('');
const storyMessageType = ref('success');

const storyImageUrl = computed(() => {
  const s = settings.value.find(s => s.key === 'story_image');
  return s?.value || '';
});

const textSettings = computed(() => settings.value.filter(s => s.key !== 'story_image'));

async function fetch() {
  const { data } = await api.get('/admin/settings');
  settings.value = data.settings;
  if (!settings.value.find(s => s.key === 'story_image')) {
    settings.value.push({ id: 'story_image_new', key: 'story_image', value: '', group: 'general' });
  }
}

async function updateSetting(s) {
  await api.put('/admin/settings', { settings: [{ key: s.key, value: s.value, group: s.group }] });
}

function handleStoryFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  storyFile.value = file;
  storyFileName.value = file.name;
  storyPreview.value = URL.createObjectURL(file);
  storyMessage.value = '';
  // Reset input so same file can be re-selected
  if (storyFileInput.value) storyFileInput.value.value = '';
}

function handleStoryDrop(e) {
  const file = e.dataTransfer.files[0];
  if (!file) return;
  storyFile.value = file;
  storyFileName.value = file.name;
  storyPreview.value = URL.createObjectURL(file);
  storyMessage.value = '';
}

function cancelStoryUpload() {
  storyFile.value = null;
  storyFileName.value = '';
  storyPreview.value = '';
}

async function uploadStoryImage() {
  if (!storyFile.value) return;
  storyUploading.value = true;
  storyMessage.value = '';

  // Step 1: Upload to Cloudinary
  let secureUrl;
  try {
    const fd = new FormData();
    fd.append('file', storyFile.value);
    fd.append('upload_preset', 'rno_shop_upload');
    const res = await fetch('https://api.cloudinary.com/v1_1/oy1ugvxg/image/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (!data.secure_url) {
      storyMessage.value = 'Cloudinary: ' + (data.error?.message || 'unknown error');
      storyMessageType.value = 'error';
      storyUploading.value = false;
      return;
    }
    secureUrl = data.secure_url;
  } catch (err) {
    storyMessage.value = 'Network error uploading image. Please try again.';
    storyMessageType.value = 'error';
    storyUploading.value = false;
    return;
  }

  // Step 2: Save URL to database
  try {
    await api.put('/admin/settings', { settings: [{ key: 'story_image', value: secureUrl, group: 'general' }] });
    const s = settings.value.find(s => s.key === 'story_image');
    if (s) s.value = secureUrl;
    cancelStoryUpload();
    storyMessage.value = 'Image uploaded and saved!';
    storyMessageType.value = 'success';
  } catch (err) {
    const msg = err.response?.data?.error || err.message || 'Failed to save';
    storyMessage.value = 'Uploaded but save failed: ' + msg;
    storyMessageType.value = 'error';
  }

  storyUploading.value = false;
}

async function removeStoryImage() {
  await api.put('/admin/settings', { settings: [{ key: 'story_image', value: '', group: 'general' }] });
  const s = settings.value.find(s => s.key === 'story_image');
  if (s) s.value = '';
  storyMessage.value = 'Image removed';
  storyMessageType.value = 'success';
}

onMounted(fetch);
</script>

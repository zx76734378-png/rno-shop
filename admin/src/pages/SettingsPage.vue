<template>
  <div>
    <h2 class="font-serif text-xl mb-6">Site Settings</h2>
    <div class="bg-white p-6 rounded-sm shadow-sm max-w-xl">
      <div v-for="s in settings" :key="s.id" class="mb-4">
        <label class="text-xs mb-1 block font-medium text-gray-500">{{ s.key }} <span class="text-gray-300">({{ s.group }})</span></label>
        <input v-model="s.value" class="admin-input" @blur="updateSetting(s)" />
      </div>
      <div class="text-sm text-gray-400 mt-4">Changes are saved automatically on blur.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/utils/api';

const settings = ref([]);

async function fetch() { const { data } = await api.get('/admin/settings'); settings.value = data.settings; }
async function updateSetting(s) {
  await api.put('/admin/settings', { settings: [{ key: s.key, value: s.value, group: s.group }] });
}

onMounted(fetch);
</script>

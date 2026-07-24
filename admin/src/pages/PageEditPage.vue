<template>
  <div class="max-w-3xl">
    <h2 class="font-serif text-xl mb-6">{{ isNew ? 'New Page' : 'Edit Page' }}</h2>
    <form @submit.prevent="save" class="bg-white p-6 rounded-sm shadow-sm space-y-4">
      <div><label class="text-xs mb-1 block font-medium">Title *</label><input v-model="form.title" required class="admin-input" /></div>
      <div><label class="text-xs mb-1 block font-medium">Slug *</label><input v-model="form.slug" required class="admin-input" /></div>
      <div><label class="text-xs mb-1 block font-medium">Content (HTML)</label><textarea v-model="form.content" rows="15" class="admin-input font-mono text-xs" /></div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="text-xs mb-1 block font-medium">Meta Title</label><input v-model="form.metaTitle" class="admin-input" /></div>
        <div><label class="text-xs mb-1 block font-medium">Meta Description</label><input v-model="form.metaDescription" class="admin-input" /></div>
      </div>
      <label class="flex items-center gap-2 text-sm"><input type="checkbox" v-model="form.isPublished" class="accent-sage" /> Published</label>
      <div class="flex gap-3">
        <button type="submit" :disabled="saving" class="admin-btn-primary">{{ saving ? 'Saving...' : 'Save' }}</button>
        <router-link to="/pages" class="admin-btn-outline">Cancel</router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/utils/api';

const route = useRoute(); const router = useRouter();
const isNew = computed(() => !route.params.id || route.params.id === 'new');
const saving = ref(false);
const form = reactive({ title: '', slug: '', content: '', metaTitle: '', metaDescription: '', isPublished: true });

async function save() {
  saving.value = true;
  try {
    if (isNew.value) await api.post('/admin/pages', form);
    else await api.put(`/admin/pages/${route.params.id}`, form);
    router.push('/pages');
  } finally { saving.value = false; }
}

onMounted(async () => {
  if (!isNew.value) {
    const { data } = await api.get(`/admin/pages/${route.params.id}`);
    Object.assign(form, { title: data.page.title, slug: data.page.slug, content: data.page.content || '', metaTitle: data.page.metaTitle || '', metaDescription: data.page.metaDescription || '', isPublished: data.page.isPublished });
  }
});
</script>

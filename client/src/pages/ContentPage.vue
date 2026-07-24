<template>
  <div class="container-custom py-16 max-w-3xl" v-if="page">
    <h1 class="font-serif text-3xl md:text-4xl mb-10">{{ page.title }}</h1>
    <div v-if="page.featuredImage" class="mb-10">
      <img :src="page.featuredImage" :alt="page.title" class="w-full max-h-96 object-cover" />
    </div>
    <div class="prose prose-lg max-w-none" v-html="page.content" />
  </div>
  <div v-else-if="!loading" class="container-custom py-20 text-center">
    <h1 class="font-serif text-3xl mb-4">Page Not Found</h1>
    <router-link to="/" class="btn-primary">Return Home</router-link>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/utils/api';

const route = useRoute();
const page = ref(null);
const loading = ref(true);

onMounted(async () => {
  try {
    const { data } = await api.get(`/pages/${route.params.slug}`);
    page.value = data.page;
  } catch { page.value = null; }
  finally { loading.value = false; }
});
</script>

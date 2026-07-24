<template>
  <section class="py-16 md:py-20 bg-white">
    <div class="container-custom">
      <h2 class="section-title">Shop by Category</h2>
      <p class="section-subtitle">Explore our collections of botanically-driven products</p>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <router-link
          v-for="cat in categories"
          :key="cat.slug"
          :to="`/collections/${cat.slug}`"
          class="group relative aspect-square bg-warm/50 overflow-hidden"
        >
          <img
            :src="cat.image || `https://picsum.photos/seed/${cat.slug}/400/400`"
            :alt="cat.name"
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div class="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
          <div class="absolute inset-0 flex items-center justify-center">
            <h3 class="font-serif text-xl md:text-2xl text-white text-center px-4">{{ cat.name }}</h3>
          </div>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/utils/api';

const categories = ref([]);

onMounted(async () => {
  try {
    const { data } = await api.get('/categories');
    categories.value = data.categories;
  } catch { /* ignore */ }
});
</script>

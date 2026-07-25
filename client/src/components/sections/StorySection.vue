<template>
  <section class="py-16 md:py-24">
    <div class="container-custom">
      <div class="grid md:grid-cols-2 gap-12 items-center">
        <div class="relative aspect-[4/5] bg-warm/50 overflow-hidden">
          <img
            :src="storyImage"
            alt="RNO-SHOP Collection"
            class="w-full h-full object-contain"
          />
        </div>
        <div class="max-w-lg">
          <p class="text-sage text-sm uppercase tracking-widest mb-4">Our Philosophy</p>
          <h2 class="font-serif text-3xl md:text-4xl mb-6 leading-tight">Quality Living Starts at Home</h2>
          <p class="text-charcoal/60 leading-relaxed mb-6">
            RNO-SHOP brings you a carefully curated collection of modern home essentials. From luxury fragrances to body care and pantry staples, every product is selected for its quality, craftsmanship, and ability to elevate your daily rituals.
          </p>
          <p class="text-charcoal/60 leading-relaxed mb-8">
            We partner with artisans and brands from around the world to bring you products that are both beautiful and functional. Every item in our collection tells a story of dedication, tradition, and modern living.
          </p>
          <router-link to="/pages/the-estate" class="btn-ghost">Discover Our Story</router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/utils/api';

const storyImage = ref('https://picsum.photos/seed/garden-story/800/1000');

onMounted(async () => {
  try {
    const { data } = await api.get('/site-setting/story_image');
    if (data.value) storyImage.value = data.value;
  } catch { /* use default */ }
});
</script>

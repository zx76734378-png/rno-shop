<template>
  <div class="relative w-full overflow-hidden bg-charcoal" v-if="banners.length">
    <div class="relative h-[70vh] min-h-[500px] max-h-[800px]">
      <Transition name="fade" mode="out-in">
        <div :key="currentIndex" class="absolute inset-0">
          <img
            :src="currentBanner.imageDesktop"
            :alt="currentBanner.title"
            class="w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-black/20" />
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center text-white max-w-2xl px-4">
              <h2 class="font-serif text-3xl md:text-5xl lg:text-6xl mb-4 leading-tight">{{ currentBanner.title }}</h2>
              <p v-if="currentBanner.subtitle" class="text-lg md:text-xl text-white/80 mb-8">{{ currentBanner.subtitle }}</p>
              <router-link
                v-if="currentBanner.buttonText"
                :to="currentBanner.buttonLink || '/shop'"
                class="inline-block px-10 py-4 bg-white text-charcoal font-medium text-sm uppercase tracking-wider hover:bg-sage hover:text-white transition-colors"
              >
                {{ currentBanner.buttonText }}
              </router-link>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Dots -->
    <div v-if="banners.length > 1" class="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
      <button
        v-for="(_, i) in banners"
        :key="i"
        @click="currentIndex = i"
        :class="['w-2 h-2 rounded-full transition-all', i === currentIndex ? 'bg-white w-6' : 'bg-white/50']"
      />
    </div>

    <!-- Arrows -->
    <button v-if="banners.length > 1" @click="prev" class="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/80 hover:text-white transition-colors">
      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7" /></svg>
    </button>
    <button v-if="banners.length > 1" @click="next" class="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/80 hover:text-white transition-colors">
      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7" /></svg>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import api from '@/utils/api';

const banners = ref([]);
const currentIndex = ref(0);

const currentBanner = computed(() => banners.value[currentIndex.value] || {});

function next() { currentIndex.value = (currentIndex.value + 1) % banners.value.length; }
function prev() { currentIndex.value = (currentIndex.value - 1 + banners.value.length) % banners.value.length; }

let timer;
onMounted(async () => {
  try {
    const { data } = await api.get('/hero-banners');
    banners.value = data.banners;
    if (banners.value.length > 1) timer = setInterval(next, 6000);
  } catch { /* ignore */ }
});
onUnmounted(() => clearInterval(timer));
</script>

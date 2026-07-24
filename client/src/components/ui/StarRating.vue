<template>
  <div class="flex items-center" :style="{ gap: `${size / 4}px` }">
    <template v-for="i in 5" :key="i">
      <svg :width="size" :height="size" viewBox="0 0 24 24" :fill="fillForStar(i)" :class="fillForStar(i) === 'none' ? 'text-gray-300' : 'text-amber-400'">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    </template>
  </div>
</template>

<script setup>
const props = defineProps({
  rating: { type: Number, default: 0 },
  size: { type: Number, default: 14 },
});

function fillForStar(star) {
  const r = Math.round(props.rating * 2) / 2;
  if (star <= Math.floor(r)) return 'currentColor';
  if (star === Math.ceil(r) && r % 1 !== 0) return 'url(#half)';
  return 'none';
}
</script>

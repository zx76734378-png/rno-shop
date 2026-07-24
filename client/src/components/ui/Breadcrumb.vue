<template>
  <nav v-if="items.length" class="py-4 text-sm text-charcoal/50">
    <ol class="flex items-center flex-wrap gap-x-1">
      <li><router-link to="/" class="hover:text-sage transition-colors">Home</router-link></li>
      <template v-for="(item, i) in items" :key="i">
        <li class="mx-1">/</li>
        <li v-if="i === items.length - 1" class="text-charcoal/80">{{ item.label }}</li>
        <li v-else>
          <router-link :to="item.to" class="hover:text-sage transition-colors">{{ item.label }}</router-link>
        </li>
      </template>
    </ol>
  </nav>
</template>

<script setup>
defineProps({
  items: { type: Array, default: () => [] },
});
</script>

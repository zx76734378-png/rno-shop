<template>
  <Teleport to="body">
    <div class="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      <TransitionGroup name="fade">
        <div
          v-for="toast in ui.toasts"
          :key="toast.id"
          :class="[
            'px-5 py-3 rounded-sm shadow-lg text-sm font-medium max-w-sm',
            toast.type === 'success' ? 'bg-sage text-white' :
            toast.type === 'error' ? 'bg-red-600 text-white' :
            'bg-charcoal text-cream'
          ]"
        >
          {{ toast.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useUIStore } from '@/stores/ui';
const ui = useUIStore();
</script>

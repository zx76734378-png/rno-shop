<template>
  <div class="inline-flex items-center border border-gray-300">
    <button
      @click="$emit('update:modelValue', Math.max(1, modelValue - 1))"
      class="w-9 h-9 flex items-center justify-center text-charcoal/60 hover:text-charcoal transition-colors"
      :disabled="modelValue <= 1"
    >−</button>
    <span class="w-10 text-center text-sm font-medium select-none">{{ modelValue }}</span>
    <button
      @click="$emit('update:modelValue', Math.min(max, modelValue + 1))"
      class="w-9 h-9 flex items-center justify-center text-charcoal/60 hover:text-charcoal transition-colors"
      :disabled="modelValue >= max"
    >+</button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: Number, required: true },
  max: { type: Number, default: 99 },
});
defineEmits(['update:modelValue']);
</script>

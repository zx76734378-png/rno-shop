<template>
  <div class="flex gap-4 py-4 border-b border-gray-100">
    <router-link :to="`/products/${item.product.slug}`" class="flex-shrink-0 w-20 h-24 bg-warm/50">
      <img :src="item.image || 'https://picsum.photos/seed/placeholder/200/240'" :alt="item.product.name" class="w-full h-full object-contain" />
    </router-link>
    <div class="flex-1 min-w-0">
      <router-link :to="`/products/${item.product.slug}`" class="text-sm font-medium text-charcoal hover:text-sage transition-colors line-clamp-1">
        {{ item.product.name }}
      </router-link>
      <p v-if="item.variant" class="text-xs text-charcoal/50 mt-0.5">{{ item.variant.name }}</p>
      <p class="text-sm mt-1">{{ formatPrice(item.price) }}</p>
      <div class="flex items-center justify-between mt-2">
        <QuantitySelector v-model="localQty" :max="99" @update:model-value="handleQtyChange" />
        <button @click="cart.removeItem(item.id)" class="text-xs text-charcoal/40 hover:text-red-500 transition-colors underline">Remove</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { formatPrice } from '@/utils/format';
import { useCartStore } from '@/stores/cart';
import QuantitySelector from '@/components/ui/QuantitySelector.vue';

const props = defineProps({ item: { type: Object, required: true } });
const cart = useCartStore();
const localQty = ref(props.item.quantity);

let debounceTimer;
function handleQtyChange(val) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => cart.updateQuantity(props.item.id, val), 300);
}

watch(() => props.item.quantity, (val) => { localQty.value = val; });
</script>

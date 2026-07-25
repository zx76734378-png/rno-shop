<template>
  <div class="group">
    <router-link :to="`/products/${product.slug}`" class="block relative overflow-hidden bg-warm/50">
      <img
        :src="currentImage"
        :alt="product.name"
        class="w-full aspect-[4/5] object-contain transition-opacity duration-500"
        loading="lazy"
      />
      <!-- Badges -->
      <div class="absolute top-3 left-3 flex flex-col gap-1">
        <span v-if="product.isNew" class="badge-new">New</span>
        <span v-if="product.isBestSeller" class="badge-bestseller">Best Seller</span>
      </div>
      <!-- Quick add button on hover -->
      <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          @click.prevent="handleQuickAdd"
          class="w-full py-3 bg-white text-charcoal text-sm font-medium uppercase tracking-wider hover:bg-sage hover:text-white transition-colors"
        >
          {{ hasVariants ? 'View Options' : 'Add to Basket' }}
        </button>
      </div>
    </router-link>

    <div class="mt-4 text-center">
      <router-link :to="`/products/${product.slug}`" class="block">
        <h3 class="font-serif text-lg text-charcoal group-hover:text-sage transition-colors">{{ product.name }}</h3>
        <p v-if="product.shortDesc" class="text-sm text-charcoal/50 mt-1 line-clamp-1">{{ product.shortDesc }}</p>
      </router-link>
      <div class="mt-2 flex items-center justify-center space-x-2">
        <span class="font-medium">{{ formatPrice(product.price) }}</span>
        <span v-if="product.comparePrice" class="text-charcoal/40 line-through text-sm">{{ formatPrice(product.comparePrice) }}</span>
      </div>
      <!-- Rating -->
      <div v-if="product.reviewCount" class="mt-1 flex items-center justify-center space-x-1">
        <StarRating :rating="product.rating" :size="12" />
        <span class="text-xs text-charcoal/40">({{ product.reviewCount }})</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { formatPrice } from '@/utils/format';
import { useCartStore } from '@/stores/cart';
import { useUIStore } from '@/stores/ui';
import StarRating from '@/components/ui/StarRating.vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  product: { type: Object, required: true },
});

const cart = useCartStore();
const ui = useUIStore();
const router = useRouter();

const currentImage = computed(() => props.product.images?.[0]?.url || 'https://picsum.photos/seed/placeholder/800/1000');
const hasVariants = computed(() => props.product.variants?.length > 1);

function handleQuickAdd() {
  if (hasVariants.value) {
    router.push(`/products/${props.product.slug}`);
  } else {
    const variantId = props.product.variants?.[0]?.id || null;
    cart.addItem(props.product.id, variantId).then(() => {
      ui.addToast('Added to basket', 'success');
      ui.openCart();
    }).catch(() => {
      ui.addToast('Failed to add. Please try again.', 'error');
    });
  }
}
</script>

<template>
  <div class="container-custom py-10" v-if="product">
    <Breadcrumb :items="breadcrumbs" />

    <div class="grid md:grid-cols-2 gap-8 lg:gap-16 mt-4">
      <!-- Image Gallery -->
      <div>
        <div class="aspect-[4/5] bg-warm/50 overflow-hidden mb-4">
          <img :src="activeImage" :alt="product.name" class="w-full h-full object-cover" />
        </div>
        <div v-if="product.images?.length > 1" class="grid grid-cols-4 gap-2">
          <button
            v-for="(img, i) in product.images"
            :key="i"
            @click="activeIndex = i"
            :class="['aspect-square bg-warm/50 overflow-hidden border-2 transition-colors', i === activeIndex ? 'border-sage' : 'border-transparent']"
          >
            <img :src="img.url" :alt="img.altText || product.name" class="w-full h-full object-cover" />
          </button>
        </div>
      </div>

      <!-- Product Info -->
      <div>
        <div class="mb-6">
          <div class="flex flex-wrap gap-2 mb-2">
            <span v-if="product.isNew" class="badge-new">New</span>
            <span v-if="product.isBestSeller" class="badge-bestseller">Best Seller</span>
          </div>
          <h1 class="font-serif text-3xl md:text-4xl mb-2">{{ product.name }}</h1>
          <p v-if="product.shortDesc" class="text-charcoal/60 text-lg">{{ product.shortDesc }}</p>
        </div>

        <!-- Price -->
        <div class="flex items-baseline gap-3 mb-6">
          <span class="font-serif text-2xl">{{ formatPrice(selectedPrice) }}</span>
          <span v-if="product.comparePrice" class="text-charcoal/40 line-through text-lg">{{ formatPrice(product.comparePrice) }}</span>
        </div>

        <!-- Variants -->
        <div v-if="product.variants?.length > 1" class="mb-6">
          <label class="text-sm font-medium uppercase tracking-wider mb-2 block">Size / Scent</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="v in product.variants"
              :key="v.id"
              @click="selectedVariant = v"
              :class="['px-4 py-2 border text-sm transition-colors', selectedVariant?.id === v.id ? 'border-sage bg-sage-light text-sage' : 'border-gray-300 hover:border-sage']"
            >
              {{ v.name }}
              <span v-if="v.price" class="text-charcoal/50 ml-1">{{ formatPrice(v.price) }}</span>
            </button>
          </div>
        </div>

        <!-- Add to Cart -->
        <div class="flex items-center gap-4 mb-8">
          <QuantitySelector v-model="quantity" :max="maxStock" />
          <button @click="addToCart" :disabled="!inStock" class="btn-primary flex-1">
            {{ inStock ? 'Add to Basket' : 'Out of Stock' }}
          </button>
        </div>

        <!-- Stock indicator -->
        <p v-if="lowStock" class="text-amber-600 text-sm mb-4">Only {{ selectedStock }} left in stock</p>
        <p v-else-if="!inStock" class="text-red-500 text-sm mb-4">Currently out of stock</p>

        <!-- Wishlist -->
        <button v-if="auth.isAuthenticated" @click="toggleWishlist" class="btn-ghost mb-8">
          {{ isWishlisted ? '♥ Saved' : '♡ Add to Wishlist' }}
        </button>

        <!-- Accordion Info -->
        <div class="border-t border-gray-200 pt-6 space-y-4">
          <details v-if="product.description" class="group" open>
            <summary class="text-sm font-medium uppercase tracking-wider cursor-pointer list-none flex items-center justify-between">
              Description
              <svg class="w-4 h-4 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <div class="mt-3 text-charcoal/60 leading-relaxed text-sm" v-html="product.description" />
          </details>
          <details v-if="product.ingredients" class="group">
            <summary class="text-sm font-medium uppercase tracking-wider cursor-pointer list-none flex items-center justify-between">
              Ingredients
              <svg class="w-4 h-4 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <div class="mt-3 text-charcoal/60 leading-relaxed text-sm" v-html="product.ingredients" />
          </details>
          <details v-if="product.howToUse" class="group">
            <summary class="text-sm font-medium uppercase tracking-wider cursor-pointer list-none flex items-center justify-between">
              How to Use
              <svg class="w-4 h-4 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <div class="mt-3 text-charcoal/60 leading-relaxed text-sm" v-html="product.howToUse" />
          </details>
        </div>
      </div>
    </div>

    <!-- Related Products -->
    <section class="mt-20">
      <h2 class="section-title mb-10">You May Also Like</h2>
      <div class="product-grid">
        <ProductCard v-for="p in related" :key="p.id" :product="p" />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/utils/api';
import { formatPrice } from '@/utils/format';
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';
import { useWishlistStore } from '@/stores/wishlist';
import { useUIStore } from '@/stores/ui';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import QuantitySelector from '@/components/ui/QuantitySelector.vue';
import ProductCard from '@/components/product/ProductCard.vue';

const route = useRoute();
const cart = useCartStore();
const auth = useAuthStore();
const wishlist = useWishlistStore();
const ui = useUIStore();

const product = ref(null);
const related = ref([]);
const activeIndex = ref(0);
const selectedVariant = ref(null);
const quantity = ref(1);

const activeImage = computed(() => product.value?.images?.[activeIndex.value]?.url || 'https://picsum.photos/seed/placeholder/800/1000');
const selectedPrice = computed(() => selectedVariant.value?.price ? Number(selectedVariant.value.price) : Number(product.value?.price || 0));
const selectedStock = computed(() => selectedVariant.value ? selectedVariant.value.stockQuantity : product.value?.stockQuantity || 0);
const inStock = computed(() => selectedStock.value > 0);
const lowStock = computed(() => selectedStock.value > 0 && selectedStock.value <= (product.value?.lowStockAlert || 5));
const maxStock = computed(() => Math.min(selectedStock.value, 99));
const isWishlisted = computed(() => wishlist.isInWishlist(product.value?.id));

const breadcrumbs = computed(() => product.value ? [
  { label: 'Shop', to: '/shop' },
  { label: product.value.name, to: `/products/${product.value.slug}` },
] : []);

async function fetchProduct() {
  try {
    const { data } = await api.get(`/products/${route.params.slug}`);
    product.value = data.product;
    selectedVariant.value = data.product.variants?.[0] || null;
  } catch { product.value = null; }
}

async function fetchRelated() {
  try {
    const { data } = await api.get(`/products/${route.params.slug}/related`);
    related.value = data.products;
  } catch { related.value = []; }
}

async function addToCart() {
  if (!inStock.value) return;
  try {
    await cart.addItem(product.value.id, selectedVariant.value?.id || null, quantity.value);
    ui.addToast('Added to basket', 'success');
    ui.openCart();
  } catch {
    ui.addToast('Failed to add to basket', 'error');
  }
}

async function toggleWishlist() {
  if (isWishlisted.value) {
    await wishlist.removeFromWishlist(product.value.id);
    ui.addToast('Removed from wishlist', 'info');
  } else {
    await wishlist.addToWishlist(product.value.id);
    ui.addToast('Added to wishlist', 'success');
  }
}

onMounted(async () => {
  await Promise.all([fetchProduct(), fetchRelated()]);
  if (auth.isAuthenticated) await wishlist.fetchWishlist();
});
</script>

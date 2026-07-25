<template>
  <div class="container-custom py-10">
    <Breadcrumb :items="[{ label: 'Cart', to: '/cart' }]" />

    <h1 class="font-serif text-3xl md:text-4xl mb-10">Your Basket</h1>

    <div v-if="cart.isEmpty" class="text-center py-20">
      <svg class="w-20 h-20 text-charcoal/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      <p class="text-charcoal/60 text-lg mb-6">Your basket is empty.</p>
      <router-link to="/shop" class="btn-primary">Start Shopping</router-link>
    </div>

    <div v-else class="grid lg:grid-cols-3 gap-10">
      <!-- Items -->
      <div class="lg:col-span-2">
        <div class="space-y-0">
          <div v-for="item in cart.items" :key="item.id" class="flex gap-4 py-6 border-b border-gray-200">
            <router-link :to="`/products/${item.product.slug}`" class="flex-shrink-0 w-24 h-28 bg-warm/50">
              <img :src="item.image || 'https://picsum.photos/seed/placeholder/200/240'" :alt="item.product.name" class="w-full h-full object-contain" />
            </router-link>
            <div class="flex-1">
              <router-link :to="`/products/${item.product.slug}`" class="font-serif text-lg hover:text-sage transition-colors">{{ item.product.name }}</router-link>
              <p v-if="item.variant" class="text-sm text-charcoal/50">{{ item.variant.name }}</p>
              <p class="text-charcoal/60 mt-1">{{ formatPrice(item.price) }}</p>
              <div class="flex items-center justify-between mt-4">
                <QuantitySelector v-model="qtyValues[item.id]" :max="99" @update:model-value="val => cart.updateQuantity(item.id, val)" />
                <button @click="cart.removeItem(item.id)" class="text-sm text-charcoal/40 hover:text-red-500 transition-colors underline">Remove</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="lg:col-span-1">
        <div class="bg-white p-6 sticky top-24">
          <h2 class="font-serif text-xl mb-4">Order Summary</h2>

          <!-- Coupon -->
          <div class="flex gap-2 mb-6">
            <input v-model="couponCode" type="text" placeholder="Coupon code" class="input-field text-sm flex-1" />
            <button @click="applyCoupon" :disabled="!couponCode || couponLoading" class="btn-outline text-xs px-4">Apply</button>
          </div>
          <p v-if="couponError" class="text-red-500 text-xs -mt-4 mb-4">{{ couponError }}</p>

          <div class="space-y-2 text-sm mb-4">
            <div class="flex justify-between"><span class="text-charcoal/60">Subtotal</span><span>{{ formatPrice(cart.subtotal) }}</span></div>
            <div v-if="cart.coupon" class="flex justify-between text-sage">
              <span>Discount ({{ cart.coupon.code }})</span>
              <span>-{{ cart.coupon.type === 'percentage' ? `${cart.coupon.value}%` : formatPrice(cart.coupon.value) }}</span>
            </div>
            <div class="flex justify-between"><span class="text-charcoal/60">Shipping</span><span>Calculated at checkout</span></div>
          </div>

          <div class="border-t border-gray-200 pt-4 mb-6">
            <div class="flex justify-between font-serif text-lg font-semibold">
              <span>Estimated Total</span>
              <span>{{ formatPrice(estimatedTotal) }}</span>
            </div>
          </div>

          <router-link to="/checkout" class="btn-primary w-full block text-center">Proceed to Checkout</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useCartStore } from '@/stores/cart';
import { formatPrice } from '@/utils/format';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import QuantitySelector from '@/components/ui/QuantitySelector.vue';

const cart = useCartStore();
const couponCode = ref('');
const couponLoading = ref(false);
const couponError = ref('');

const qtyValues = reactive({});
watch(() => cart.items, (items) => {
  items.forEach(i => { if (!(i.id in qtyValues)) qtyValues[i.id] = i.quantity; });
}, { immediate: true });

const estimatedTotal = computed(() => {
  let total = cart.subtotal;
  if (cart.coupon) {
    if (cart.coupon.type === 'percentage') total *= (1 - cart.coupon.value / 100);
    else total -= Number(cart.coupon.value);
  }
  return Math.max(0, total);
});

async function applyCoupon() {
  couponLoading.value = true;
  couponError.value = '';
  try {
    await cart.applyCouponCode(couponCode.value.toUpperCase());
    couponCode.value = '';
  } catch (err) {
    couponError.value = typeof err === 'string' ? err : 'Invalid coupon code';
  } finally {
    couponLoading.value = false;
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="ui.isCartOpen" class="fixed inset-0 z-[60]" @click.self="ui.closeCart()">
        <div class="absolute inset-0 bg-black/40" />
        <Transition name="slide">
          <div v-if="ui.isCartOpen" class="absolute right-0 top-0 bottom-0 w-full max-w-md bg-cream shadow-2xl flex flex-col">
            <!-- Header -->
            <div class="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 class="font-serif text-xl">
                Your Basket
                <span v-if="cart.itemCount" class="text-sm text-charcoal/50 ml-1">({{ cart.itemCount }})</span>
              </h2>
              <button @click="ui.closeCart()" class="p-1 hover:text-sage transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Items -->
            <div v-if="cart.isEmpty" class="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <svg class="w-16 h-16 text-charcoal/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p class="text-charcoal/60 mb-6">Your basket is empty.</p>
              <router-link @click="ui.closeCart()" to="/shop" class="btn-primary">Start Shopping</router-link>
            </div>

            <div v-else class="flex-1 overflow-y-auto p-5">
              <CartItem v-for="item in cart.items" :key="item.id" :item="item" />
            </div>

            <!-- Footer -->
            <div v-if="!cart.isEmpty" class="border-t border-gray-200 p-5">
              <div class="flex justify-between items-center mb-4">
                <span class="text-charcoal/70">Subtotal</span>
                <span class="font-serif text-lg font-semibold">{{ formatPrice(cart.subtotal) }}</span>
              </div>
              <p class="text-xs text-charcoal/40 mb-4 text-center">Shipping & taxes calculated at checkout</p>
              <router-link @click="ui.closeCart()" to="/checkout" class="btn-primary w-full block text-center mb-3">Checkout</router-link>
              <button @click="ui.closeCart()" class="btn-ghost w-full">Continue Shopping</button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useUIStore } from '@/stores/ui';
import { useCartStore } from '@/stores/cart';
import { formatPrice } from '@/utils/format';
import CartItem from './CartItem.vue';

const ui = useUIStore();
const cart = useCartStore();
</script>

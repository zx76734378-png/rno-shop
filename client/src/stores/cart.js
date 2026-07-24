import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/utils/api';

function getCartToken() {
  let token = localStorage.getItem('cartToken');
  if (!token) {
    token = crypto.randomUUID?.() || `cart_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('cartToken', token);
  }
  return token;
}

export const useCartStore = defineStore('cart', () => {
  const items = ref([]);
  const isLoading = ref(false);
  const coupon = ref(null);

  const itemCount = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0));
  const subtotal = computed(() => {
    return items.value.reduce((sum, i) => sum + i.price * i.quantity, 0);
  });
  const isEmpty = computed(() => items.value.length === 0);

  async function fetchCart() {
    try {
      const { data } = await api.get('/cart');
      items.value = data.cart.items;
      if (data.cart.sessionToken) {
        localStorage.setItem('cartToken', data.cart.sessionToken);
      }
    } catch {
      // Cart not found — that's ok
    }
  }

  async function addItem(productId, variantId = null, quantity = 1) {
    isLoading.value = true;
    try {
      const { data } = await api.post('/cart/items', { productId, variantId, quantity });
      items.value = data.cart.items;
      if (data.cart.sessionToken) {
        localStorage.setItem('cartToken', data.cart.sessionToken);
      }
      return data;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateQuantity(itemId, quantity) {
    if (quantity <= 0) return removeItem(itemId);
    try {
      const { data } = await api.put(`/cart/items/${itemId}`, { quantity });
      items.value = data.cart.items;
    } catch {
      await fetchCart(); // rollback
    }
  }

  async function removeItem(itemId) {
    try {
      const { data } = await api.delete(`/cart/items/${itemId}`);
      items.value = data.cart.items;
    } catch {
      await fetchCart();
    }
  }

  async function clearCart() {
    try {
      await api.delete('/cart');
      items.value = [];
      coupon.value = null;
    } catch {
      // ignore
    }
  }

  async function applyCouponCode(code) {
    try {
      const { data } = await api.post('/cart/coupon', { code });
      coupon.value = data.coupon;
      return data;
    } catch (err) {
      throw err.response?.data?.error || 'Invalid coupon';
    }
  }

  // Initialize cart token
  getCartToken();

  return { items, isLoading, coupon, itemCount, subtotal, isEmpty, fetchCart, addItem, updateQuantity, removeItem, clearCart, applyCouponCode };
});

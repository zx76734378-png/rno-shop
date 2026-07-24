import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/utils/api';

export const useWishlistStore = defineStore('wishlist', () => {
  const items = ref([]);
  const isLoading = ref(false);

  const wishlistIds = computed(() => new Set(items.value.map(i => i.id || i.productId)));

  async function fetchWishlist() {
    try {
      const { data } = await api.get('/me/wishlist');
      items.value = data.wishlist;
    } catch {
      items.value = [];
    }
  }

  async function addToWishlist(productId) {
    try {
      await api.post('/me/wishlist', { productId });
      await fetchWishlist();
    } catch {
      // ignore
    }
  }

  async function removeFromWishlist(productId) {
    try {
      await api.delete(`/me/wishlist/${productId}`);
      items.value = items.value.filter(i => (i.id || i.productId) !== productId);
    } catch {
      // ignore
    }
  }

  function isInWishlist(productId) {
    return wishlistIds.value.has(productId);
  }

  return { items, isLoading, wishlistIds, fetchWishlist, addToWishlist, removeFromWishlist, isInWishlist };
});

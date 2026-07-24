import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUIStore = defineStore('ui', () => {
  const isCartOpen = ref(false);
  const isMobileMenuOpen = ref(false);
  const isSearchOpen = ref(false);
  const toasts = ref([]);

  let toastId = 0;

  function openCart() { isCartOpen.value = true; }
  function closeCart() { isCartOpen.value = false; }
  function toggleCart() { isCartOpen.value = !isCartOpen.value; }

  function openMobileMenu() { isMobileMenuOpen.value = true; }
  function closeMobileMenu() { isMobileMenuOpen.value = false; }

  function addToast(message, type = 'info', duration = 4000) {
    const id = ++toastId;
    toasts.value.push({ id, message, type });
    setTimeout(() => removeToast(id), duration);
  }

  function removeToast(id) {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }

  return { isCartOpen, isMobileMenuOpen, isSearchOpen, toasts, openCart, closeCart, toggleCart, openMobileMenu, closeMobileMenu, addToast, removeToast };
});

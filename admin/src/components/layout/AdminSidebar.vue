<template>
  <aside class="w-60 bg-charcoal text-cream/80 flex-shrink-0 hidden lg:block">
    <router-link to="/" class="block px-5 py-6 border-b border-cream/10">
      <img src="/logo.png" alt="LVON-SHOP" class="h-8 w-auto mb-1" style="filter: brightness(0) invert(1)" />
      <p class="text-xs text-cream/40 mt-1">Admin Panel</p>
    </router-link>
    <nav class="p-4 space-y-1">
      <router-link to="/" class="sidebar-link">Dashboard</router-link>
      <router-link to="/products" class="sidebar-link">Products</router-link>
      <router-link to="/categories" class="sidebar-link">Categories</router-link>
      <router-link to="/orders" class="sidebar-link">Orders</router-link>
      <router-link to="/users" class="sidebar-link">Customers</router-link>
      <router-link to="/pages" class="sidebar-link">Pages</router-link>
      <router-link to="/banners" class="sidebar-link">Banners</router-link>
      <router-link to="/coupons" class="sidebar-link">Coupons</router-link>
      <router-link to="/reviews" class="sidebar-link">Reviews</router-link>
      <router-link to="/settings" class="sidebar-link">Settings</router-link>
      <a href="/" target="_blank" class="sidebar-link text-sage-light">→ View Store</a>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar-link {
  @apply block px-3 py-2 text-sm rounded-sm transition-colors text-cream/60 hover:text-cream hover:bg-cream/5;
}
.sidebar-link.router-link-active {
  @apply bg-cream/10 text-cream;
}
</style>

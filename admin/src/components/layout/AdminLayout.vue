<template>
  <div class="flex h-screen bg-gray-50">
    <AdminSidebar />
    <div class="flex-1 flex flex-col overflow-hidden">
      <AdminHeader />
      <main class="flex-1 overflow-y-auto p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import AdminSidebar from './AdminSidebar.vue';
import AdminHeader from './AdminHeader.vue';
</script>

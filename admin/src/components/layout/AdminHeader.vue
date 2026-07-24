<template>
  <header class="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
    <h2 class="text-lg font-medium">{{ $route.meta.title || 'Dashboard' }}</h2>
    <div class="flex items-center gap-4">
      <span class="text-sm text-gray-500">{{ auth.user?.email }}</span>
      <button @click="auth.logout(); $router.push('/login')" class="text-sm text-red-500 hover:underline">Sign Out</button>
    </div>
  </header>
</template>

<script setup>
import { useAdminAuth } from '@/stores/auth';
import { useRoute } from 'vue-router';
const auth = useAdminAuth();
const $route = useRoute();
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="bg-white p-8 rounded-lg shadow-sm w-full max-w-sm">
      <h1 class="font-serif text-2xl text-center mb-6">Admin Login</h1>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div><label class="text-xs mb-1 block">Email</label><input v-model="email" type="email" required class="admin-input" /></div>
        <div><label class="text-xs mb-1 block">Password</label><input v-model="password" type="password" required class="admin-input" /></div>
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
        <button type="submit" :disabled="loading" class="admin-btn-primary w-full">{{ loading ? 'Signing in...' : 'Sign In' }}</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAdminAuth } from '@/stores/auth';

const router = useRouter();
const auth = useAdminAuth();
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

async function handleLogin() {
  loading.value = true; error.value = '';
  try {
    await auth.login(email.value, password.value);
    router.push('/');
  } catch (err) {
    error.value = err.response?.data?.error || 'Invalid credentials';
  } finally {
    loading.value = false;
  }
}
</script>

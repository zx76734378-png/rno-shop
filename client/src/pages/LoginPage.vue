<template>
  <div class="container-custom py-16 max-w-md mx-auto">
    <h1 class="font-serif text-3xl text-center mb-8">Sign In</h1>
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div><label class="text-sm mb-1 block">Email</label><input v-model="email" type="email" required class="input-field" /></div>
      <div><label class="text-sm mb-1 block">Password</label><input v-model="password" type="password" required class="input-field" /></div>
      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
      <button type="submit" :disabled="auth.isLoading" class="btn-primary w-full">
        {{ auth.isLoading ? 'Signing in...' : 'Sign In' }}
      </button>
    </form>
    <div class="text-center mt-6 space-y-2 text-sm">
      <p><router-link to="/forgot-password" class="text-sage hover:underline">Forgot your password?</router-link></p>
      <p class="text-charcoal/60">Don't have an account? <router-link to="/register" class="text-sage hover:underline">Create one</router-link></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const email = ref('');
const password = ref('');
const error = ref('');

async function handleSubmit() {
  error.value = '';
  try {
    await auth.login(email.value, password.value);
    router.push(route.query.redirect || '/');
  } catch (err) {
    error.value = err.response?.data?.error || 'Invalid email or password';
  }
}
</script>

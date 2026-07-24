<template>
  <div class="container-custom py-16 max-w-md mx-auto">
    <h1 class="font-serif text-3xl text-center mb-4">Forgot Password</h1>
    <p class="text-charcoal/60 text-center mb-8">Enter your email and we'll send you a reset link.</p>
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div><label class="text-sm mb-1 block">Email</label><input v-model="email" type="email" required class="input-field" /></div>
      <p v-if="message" class="text-sage text-sm">{{ message }}</p>
      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
      <button type="submit" :disabled="loading" class="btn-primary w-full">{{ loading ? 'Sending...' : 'Send Reset Link' }}</button>
    </form>
    <p class="text-center mt-6 text-sm"><router-link to="/login" class="text-sage hover:underline">&larr; Back to Sign In</router-link></p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '@/utils/api';

const email = ref('');
const loading = ref(false);
const message = ref('');
const error = ref('');

async function handleSubmit() {
  loading.value = true; error.value = ''; message.value = '';
  try {
    await api.post('/auth/forgot-password', { email: email.value });
    message.value = 'If an account with that email exists, a reset link has been sent.';
  } catch { error.value = 'Something went wrong.'; }
  finally { loading.value = false; }
}
</script>

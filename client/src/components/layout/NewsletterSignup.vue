<template>
  <form @submit.prevent="handleSubmit" class="flex gap-2">
    <input
      v-model="email"
      type="email"
      required
      placeholder="Your email address"
      class="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 text-white placeholder:text-cream/40 focus:outline-none focus:border-cream/40 text-sm"
    />
    <button
      type="submit"
      :disabled="loading"
      class="px-4 py-2.5 bg-cream text-charcoal text-sm font-medium hover:bg-white transition-colors disabled:opacity-50"
    >
      {{ loading ? '...' : 'Sign Up' }}
    </button>
  </form>
  <p v-if="success" class="text-sage-light text-sm mt-2">Thank you for subscribing!</p>
  <p v-if="error" class="text-red-400 text-sm mt-2">{{ error }}</p>
</template>

<script setup>
import { ref } from 'vue';
import api from '@/utils/api';

const email = ref('');
const loading = ref(false);
const success = ref(false);
const error = ref('');

async function handleSubmit() {
  loading.value = true;
  error.value = '';
  try {
    await api.post('/newsletter/subscribe', { email: email.value });
    success.value = true;
    email.value = '';
  } catch {
    error.value = 'Something went wrong. Please try again.';
  } finally {
    loading.value = false;
  }
}
</script>

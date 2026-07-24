<template>
  <div class="container-custom py-16 max-w-md mx-auto">
    <h1 class="font-serif text-3xl text-center mb-8">Create Account</h1>
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div><label class="text-sm mb-1 block">First Name</label><input v-model="firstName" class="input-field" /></div>
        <div><label class="text-sm mb-1 block">Last Name</label><input v-model="lastName" class="input-field" /></div>
      </div>
      <div><label class="text-sm mb-1 block">Email *</label><input v-model="email" type="email" required class="input-field" /></div>
      <div><label class="text-sm mb-1 block">Password *</label><input v-model="password" type="password" required minlength="6" class="input-field" /></div>
      <div><label class="text-sm mb-1 block">Confirm Password *</label><input v-model="confirmPassword" type="password" required minlength="6" class="input-field" /></div>
      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
      <button type="submit" :disabled="auth.isLoading" class="btn-primary w-full">
        {{ auth.isLoading ? 'Creating account...' : 'Create Account' }}
      </button>
    </form>
    <p class="text-center mt-6 text-sm text-charcoal/60">
      Already have an account? <router-link to="/login" class="text-sage hover:underline">Sign in</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const auth = useAuthStore();

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const firstName = ref('');
const lastName = ref('');
const error = ref('');

async function handleSubmit() {
  error.value = '';
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }
  try {
    await auth.register(email.value, password.value, firstName.value, lastName.value);
    router.push('/');
  } catch (err) {
    error.value = err.response?.data?.error || 'Registration failed';
  }
}
</script>

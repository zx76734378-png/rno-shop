<template>
  <div class="container-custom py-16 max-w-2xl" v-if="membership">
    <h1 class="font-serif text-3xl md:text-4xl text-center mb-4">{{ membership.name }}</h1>
    <p class="text-charcoal/60 text-center mb-12">{{ membership.description }}</p>

    <div class="bg-white p-8 text-center mb-10">
      <p class="text-4xl font-serif text-sage mb-2">{{ formatPrice(membership.price) }}<span class="text-lg text-charcoal/50">/year</span></p>
      <h2 class="font-serif text-xl mt-6 mb-4">Member Benefits</h2>
      <ul class="space-y-3 text-left max-w-sm mx-auto">
        <li v-for="(benefit, i) in benefits" :key="i" class="flex items-start gap-2 text-sm">
          <svg class="w-5 h-5 text-sage flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          {{ benefit }}
        </li>
      </ul>
    </div>

    <div class="text-center">
      <button @click="subscribe" :disabled="loading" class="btn-primary">
        {{ loading ? 'Processing...' : 'Join the Estate' }}
      </button>
      <p v-if="message" class="text-sage text-sm mt-4">{{ message }}</p>
      <p v-if="error" class="text-red-500 text-sm mt-4">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/utils/api';
import { formatPrice } from '@/utils/format';

const membership = ref(null);
const loading = ref(false);
const message = ref('');
const error = ref('');

const benefits = computed(() => {
  if (!membership.value?.benefits) return [];
  try { return JSON.parse(membership.value.benefits); }
  catch { return Array.isArray(membership.value.benefits) ? membership.value.benefits : []; }
});

async function subscribe() {
  loading.value = true; message.value = ''; error.value = '';
  try {
    await api.post('/memberships/subscribe', { membershipId: membership.value.id });
    message.value = 'Thank you for joining! Welcome to RNO-SHOP.';
  } catch (err) {
    error.value = err.response?.data?.error || 'Something went wrong.';
  }
  finally { loading.value = false; }
}

onMounted(async () => {
  try {
    const { data } = await api.get('/memberships');
    membership.value = data.memberships?.[0] || null;
  } catch { /* ignore */ }
});
</script>

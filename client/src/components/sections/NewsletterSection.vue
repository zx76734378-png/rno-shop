<template>
  <section class="py-16 md:py-24 bg-sage">
    <div class="container-custom max-w-2xl text-center">
      <h2 class="font-serif text-2xl md:text-3xl text-white mb-4">Join the Estate</h2>
      <p class="text-white/70 mb-8">
        Sign up for stories from the garden, seasonal rituals, and first access to new releases and exclusive offers.
      </p>
      <div class="max-w-md mx-auto">
        <NewsletterSignup />
      </div>
    </div>
  </section>
</template>

<script setup>
import NewsletterSignup from '@/components/layout/NewsletterSignup.vue';
</script>

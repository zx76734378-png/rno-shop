<template>
  <div>
    <HeroBanner />
    <CategoryShowcase />
    <FeaturedProducts
      title="Best Sellers"
      subtitle="The products our customers love most"
      endpoint="/products/bestsellers"
      link-to="/shop?bestseller=true"
    />
    <StorySection />
    <FeaturedProducts
      title="New Arrivals"
      subtitle="Fresh from the garden"
      endpoint="/products/new"
      link-to="/shop?isNew=true"
    />
    <NewsletterSection />
  </div>
</template>

<script setup>
import HeroBanner from '@/components/sections/HeroBanner.vue';
import CategoryShowcase from '@/components/sections/CategoryShowcase.vue';
import FeaturedProducts from '@/components/sections/FeaturedProducts.vue';
import StorySection from '@/components/sections/StorySection.vue';
import NewsletterSection from '@/components/sections/NewsletterSection.vue';
</script>

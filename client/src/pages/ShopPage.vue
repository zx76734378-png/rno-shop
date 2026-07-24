<template>
  <div class="container-custom py-10">
    <Breadcrumb :items="breadcrumbs" />

    <!-- Header -->
    <div class="mb-10">
      <h1 class="font-serif text-3xl md:text-4xl mb-2">{{ pageTitle }}</h1>
      <p v-if="categoryDesc" class="text-charcoal/60">{{ categoryDesc }}</p>
    </div>

    <div class="flex gap-8">
      <!-- Filters Sidebar -->
      <aside class="hidden lg:block w-56 flex-shrink-0">
        <div class="sticky top-24">
          <h3 class="text-sm font-medium uppercase tracking-wider mb-4">Categories</h3>
          <ul class="space-y-2 mb-8">
            <li>
              <button @click="clearCategory" :class="['text-sm transition-colors', !activeCategory ? 'text-sage font-medium' : 'text-charcoal/60 hover:text-charcoal']">
                All Products
              </button>
            </li>
            <li v-for="cat in categories" :key="cat.slug">
              <button @click="setCategory(cat.slug)" :class="['text-sm transition-colors', activeCategory === cat.slug ? 'text-sage font-medium' : 'text-charcoal/60 hover:text-charcoal']">
                {{ cat.name }}
              </button>
            </li>
          </ul>

          <h3 class="text-sm font-medium uppercase tracking-wider mb-4">Sort By</h3>
          <select v-model="sort" @change="fetchProducts" class="input-field text-sm">
            <option value="">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A-Z</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </aside>

      <!-- Product Grid -->
      <div class="flex-1">
        <!-- Mobile filter bar -->
        <div class="lg:hidden flex gap-3 mb-6">
          <select v-model="sort" @change="fetchProducts" class="input-field text-sm flex-1">
            <option value="">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A-Z</option>
            <option value="rating">Top Rated</option>
          </select>
          <select v-model="activeCategory" @change="fetchProducts" class="input-field text-sm flex-1">
            <option value="">All Categories</option>
            <option v-for="cat in categories" :key="cat.slug" :value="cat.slug">{{ cat.name }}</option>
          </select>
        </div>

        <div v-if="loading" class="text-center py-20">
          <div class="inline-block w-8 h-8 border-2 border-sage border-t-transparent rounded-full animate-spin" />
        </div>

        <div v-else-if="!products.length" class="text-center py-20">
          <p class="text-charcoal/50 text-lg">No products found.</p>
        </div>

        <div v-else class="product-grid">
          <ProductCard v-for="product in products" :key="product.id" :product="product" />
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-12">
          <button @click="goToPage(page - 1)" :disabled="page <= 1" class="px-4 py-2 border border-gray-300 text-sm hover:border-sage transition-colors disabled:opacity-30">Previous</button>
          <template v-for="p in totalPages" :key="p">
            <button
              v-if="p === 1 || p === totalPages || Math.abs(p - page) <= 1"
              @click="goToPage(p)"
              :class="['px-3 py-2 text-sm', p === page ? 'bg-sage text-white' : 'border border-gray-300 hover:border-sage']"
            >{{ p }}</button>
            <span v-else-if="Math.abs(p - page) === 2" class="px-2">...</span>
          </template>
          <button @click="goToPage(page + 1)" :disabled="page >= totalPages" class="px-4 py-2 border border-gray-300 text-sm hover:border-sage transition-colors disabled:opacity-30">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/utils/api';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import ProductCard from '@/components/product/ProductCard.vue';

const route = useRoute();

const products = ref([]);
const categories = ref([]);
const loading = ref(true);
const page = ref(1);
const total = ref(0);
const totalPages = ref(0);
const sort = ref('');
const activeCategory = ref('');

const pageTitle = computed(() => {
  if (activeCategory.value) {
    const cat = categories.value.find(c => c.slug === activeCategory.value);
    return cat?.name || 'Shop';
  }
  return 'Shop All';
});

const categoryDesc = computed(() => {
  if (activeCategory.value) {
    const cat = categories.value.find(c => c.slug === activeCategory.value);
    return cat?.description || '';
  }
  return '';
});

const breadcrumbs = computed(() => {
  const items = [{ label: 'Shop', to: '/shop' }];
  if (activeCategory.value) {
    items.push({ label: pageTitle.value, to: `/collections/${activeCategory.value}` });
  }
  return items;
});

async function fetchProducts() {
  loading.value = true;
  try {
    const params = { page: page.value, limit: 12, sort: sort.value || undefined };
    if (activeCategory.value) params.category = activeCategory.value;
    if (route.query.bestseller) params.bestseller = 'true';
    if (route.query.isNew) params.isNew = 'true';

    const { data } = await api.get('/products', { params });
    products.value = data.products;
    total.value = data.total;
    totalPages.value = data.totalPages;
  } catch {
    products.value = [];
  } finally {
    loading.value = false;
  }
}

async function fetchCategories() {
  try {
    const { data } = await api.get('/categories');
    categories.value = data.categories;
  } catch { /* ignore */ }
}

function setCategory(slug) {
  activeCategory.value = slug;
  page.value = 1;
  fetchProducts();
}

function clearCategory() {
  activeCategory.value = '';
  page.value = 1;
  fetchProducts();
}

function goToPage(p) {
  page.value = p;
  fetchProducts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

onMounted(() => {
  if (route.params.slug) activeCategory.value = route.params.slug;
  fetchCategories();
  fetchProducts();
});

watch(() => route.params.slug, (slug) => {
  activeCategory.value = slug || '';
  page.value = 1;
  fetchProducts();
});
</script>

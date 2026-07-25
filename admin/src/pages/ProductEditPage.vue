<template>
  <div>
    <h2 class="font-serif text-xl mb-6">{{ isNew ? 'New Product' : 'Edit Product' }}</h2>
    <form @submit.prevent="save" class="bg-white p-6 rounded-sm shadow-sm max-w-3xl space-y-5">

      <!-- Basic Info -->
      <div class="grid grid-cols-2 gap-4">
        <div class="col-span-2"><label class="text-xs mb-1 block font-medium">Name *</label><input v-model="form.name" required class="admin-input" /></div>
        <div><label class="text-xs mb-1 block font-medium">Price *</label><input v-model.number="form.price" type="number" step="0.01" required class="admin-input" /></div>
        <div><label class="text-xs mb-1 block font-medium">Compare-at Price</label><input v-model.number="form.comparePrice" type="number" step="0.01" class="admin-input" /></div>
        <div><label class="text-xs mb-1 block font-medium">SKU</label><input v-model="form.sku" class="admin-input" /></div>
        <div><label class="text-xs mb-1 block font-medium">Stock Quantity</label><input v-model.number="form.stockQuantity" type="number" class="admin-input" /></div>
      </div>
      <div><label class="text-xs mb-1 block font-medium">Short Description</label><textarea v-model="form.shortDesc" rows="2" class="admin-input" /></div>
      <div><label class="text-xs mb-1 block font-medium">Full Description</label><textarea v-model="form.description" rows="5" class="admin-input" /></div>
      <div><label class="text-xs mb-1 block font-medium">Ingredients</label><textarea v-model="form.ingredients" rows="2" class="admin-input" /></div>
      <div><label class="text-xs mb-1 block font-medium">How to Use</label><textarea v-model="form.howToUse" rows="2" class="admin-input" /></div>
      <div><label class="text-xs mb-1 block font-medium">Fragrance Notes</label><input v-model="form.fragranceNotes" class="admin-input" /></div>
      <div class="flex gap-6 flex-wrap">
        <label class="flex items-center gap-2 text-sm"><input type="checkbox" v-model="form.isActive" class="accent-sage" /> Active</label>
        <label class="flex items-center gap-2 text-sm"><input type="checkbox" v-model="form.isFeatured" class="accent-sage" /> Featured</label>
        <label class="flex items-center gap-2 text-sm"><input type="checkbox" v-model="form.isNew" class="accent-sage" /> New</label>
        <label class="flex items-center gap-2 text-sm"><input type="checkbox" v-model="form.isBestSeller" class="accent-sage" /> Best Seller</label>
      </div>

      <!-- Variants -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="text-xs font-medium">Variants (size, scent, etc.)</label>
          <button type="button" @click="addVariant" class="text-xs text-sage hover:underline">+ Add Variant</button>
        </div>
        <div v-for="(v, i) in form.variants" :key="i" class="flex gap-2 items-end mb-2">
          <div class="flex-1"><input v-model="v.name" placeholder="Name (e.g., 8 oz)" class="admin-input text-xs" /></div>
          <div class="w-24"><input v-model.number="v.price" type="number" step="0.01" placeholder="Price" class="admin-input text-xs" /></div>
          <div class="w-20"><input v-model.number="v.stockQuantity" type="number" placeholder="Stock" class="admin-input text-xs" /></div>
          <button type="button" @click="form.variants.splice(i, 1)" class="text-red-400 text-lg">&times;</button>
        </div>
      </div>

      <!-- ============ Images Section ============ -->
      <div>
        <label class="text-xs mb-2 block font-medium">Product Images</label>

        <!-- Existing images (for edit mode) -->
        <div v-if="existingImages.length" class="flex flex-wrap gap-3 mb-4">
          <div v-for="(img, i) in existingImages" :key="img.id" class="relative group w-24 h-24 bg-gray-100 rounded overflow-hidden">
            <img :src="img.url" class="w-full h-full object-cover" />
            <button type="button" @click="deleteImage(img.id, i)"
              class="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete image">&times;</button>
            <span v-if="img.isPrimary" class="absolute bottom-0 left-0 right-0 bg-sage text-white text-[10px] text-center py-0.5">Primary</span>
          </div>
        </div>

        <!-- Upload section -->
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-sage transition-colors cursor-pointer"
          @click="$refs.fileInput.click()" @dragover.prevent @drop.prevent="handleDrop">
          <svg class="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-sm text-gray-500 mb-1">
            <span class="text-sage font-medium">Click to upload</span> or drag and drop
          </p>
          <p class="text-xs text-gray-400">PNG, JPG, WEBP up to 5MB each</p>
          <input ref="fileInput" type="file" multiple accept="image/png,image/jpeg,image/webp" class="hidden" @change="handleFiles" />
        </div>

        <!-- Upload queue -->
        <div v-if="uploadQueue.length" class="mt-3 space-y-2">
          <div v-for="(f, i) in uploadQueue" :key="i" class="flex items-center gap-3 p-2 bg-gray-50 rounded text-sm">
            <img v-if="f.preview" :src="f.preview" class="w-10 h-10 object-cover rounded" />
            <span class="flex-1 truncate">{{ f.file.name }}</span>
            <span v-if="f.uploading" class="text-blue-500 text-xs">Uploading...</span>
            <span v-else-if="f.done" class="text-green-600 text-xs">✓ Done</span>
            <span v-else-if="f.error" class="text-red-500 text-xs">{{ f.error }}</span>
            <button v-if="!f.uploading && !f.done" type="button" @click="uploadSingle(f, i)" class="text-xs text-sage font-medium">Upload</button>
            <button type="button" @click="uploadQueue.splice(i, 1)" class="text-red-400 text-xs">&times;</button>
          </div>
          <button v-if="uploadQueue.some(f => !f.done && !f.uploading)" type="button" @click="uploadAll" class="admin-btn-primary text-xs">Upload All</button>
        </div>

        <!-- Or paste URLs -->
        <details class="mt-4">
          <summary class="text-xs text-gray-400 cursor-pointer hover:text-gray-600">Or paste image URLs (one per line)</summary>
          <textarea v-model="imageUrls" rows="3" placeholder="https://example.com/image.jpg" class="admin-input mt-2 text-xs" />
        </details>
      </div>

      <!-- Save -->
      <div class="flex gap-3 pt-4">
        <button type="submit" :disabled="saving" class="admin-btn-primary">{{ saving ? 'Saving...' : 'Save Product' }}</button>
        <router-link to="/products" class="admin-btn-outline">Cancel</router-link>
        <button v-if="!isNew" type="button" @click="deleteProduct" :disabled="deleting" class="admin-btn-outline text-red-500 border-red-300 hover:bg-red-50">{{ deleting ? 'Deleting...' : 'Delete Product' }}</button>
      </div>
      <p v-if="message" :class="['text-sm', messageType === 'error' ? 'text-red-500' : 'text-sage']">{{ message }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/utils/api';

const route = useRoute();
const router = useRouter();
const isNew = computed(() => !route.params.id);
const saving = ref(false);
const message = ref('');
const messageType = ref('success');
const imageUrls = ref('');
const fileInput = ref(null);

const form = reactive({
  name: '', price: 0, comparePrice: null, sku: '', stockQuantity: 0,
  shortDesc: '', description: '', ingredients: '', howToUse: '', fragranceNotes: '',
  isActive: true, isFeatured: false, isNew: false, isBestSeller: false,
  variants: [],
});

const existingImages = ref([]);
const uploadQueue = ref([]); // { file, preview, uploading, done, error }
let productId = null;

function addVariant() { form.variants.push({ name: '', price: null, stockQuantity: 0 }); }

// ============ File Upload Logic ============

function handleFiles(e) {
  addFiles(Array.from(e.target.files));
  if (fileInput.value) fileInput.value.value = '';
}

function handleDrop(e) {
  addFiles(Array.from(e.dataTransfer.files));
}

function addFiles(files) {
  const imageFiles = files.filter(f => f.type.startsWith('image/'));
  for (const file of imageFiles) {
    uploadQueue.value.push({
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      done: false,
      error: null,
    });
  }
}

async function uploadSingle(item, index) {
  if (!productId) {
    // For new products, save first to get an ID
    await saveProduct();
    if (!productId) return;
  }

  item.uploading = true;
  try {
    // Upload directly to Cloudinary (not via Render server)
    const formData = new FormData();
    formData.append('file', item.file);
    formData.append('upload_preset', 'rno_shop_upload');

    const cloudRes = await fetch('https://api.cloudinary.com/v1_1/oy1ugvxg/image/upload', {
      method: 'POST',
      body: formData,
    });
    const cloudData = await cloudRes.json();

    if (!cloudData.secure_url) {
      throw new Error(cloudData.error?.message || 'Upload failed');
    }

    // Save the Cloudinary URL to database
    await api.post(`/admin/products/${productId}/images/by-url`, { url: cloudData.secure_url });
    item.done = true;
    // Refresh images
    await loadExistingImages();
  } catch (err) {
    item.error = err.message || 'Upload failed';
  } finally {
    item.uploading = false;
  }
}

async function uploadAll() {
  const pending = uploadQueue.value.filter(f => !f.done && !f.uploading);
  for (let i = 0; i < pending.length; i++) {
    const idx = uploadQueue.value.indexOf(pending[i]);
    await uploadSingle(pending[i], idx);
  }
  // Clean up done items
  uploadQueue.value = uploadQueue.value.filter(f => !f.done);
  message.value = 'All images uploaded!';
  messageType.value = 'success';
}

async function deleteImage(imageId, index) {
  if (!confirm('Delete this image?')) return;
  try {
    await api.delete(`/admin/products/${productId}/images/${imageId}`);
    existingImages.value.splice(index, 1);
  } catch (err) {
    console.error(err);
  }
}

async function loadExistingImages() {
  if (!productId) return;
  try {
    const { data } = await api.get(`/admin/products/${productId}`);
    existingImages.value = data.product.images || [];
  } catch { /* ignore */ }
}

// ============ Save Product ============

async function saveProduct() {
  saving.value = true; message.value = '';
  const payload = {
    ...form,
    price: Number(form.price),
    comparePrice: form.comparePrice ? Number(form.comparePrice) : null,
    stockQuantity: Number(form.stockQuantity),
    images: imageUrls.value ? imageUrls.value.split('\n').map(u => u.trim()).filter(Boolean) : [],
    variants: form.variants.filter(v => v.name).map(v => ({ ...v, price: v.price ? Number(v.price) : null, stockQuantity: Number(v.stockQuantity) || 0 })),
  };
  try {
    if (isNew.value) {
      const { data } = await api.post('/admin/products', payload);
      productId = data.product.id;
      router.replace(`/products/${productId}/edit`);
    } else {
      await api.put(`/admin/products/${route.params.id}`, payload);
      productId = route.params.id;
    }
    message.value = 'Product saved!';
    messageType.value = 'success';
    await loadExistingImages();
    // After saving a new product, upload any pending files
    if (uploadQueue.value.some(f => !f.done)) {
      message.value += ' Now upload your images above.';
    }
  } catch (err) {
    message.value = err.response?.data?.error || 'Failed to save';
    messageType.value = 'error';
  } finally {
    saving.value = false;
  }
}

async function save() {
  await saveProduct();
}

const deleting = ref(false);
async function deleteProduct() {
  if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
  deleting.value = true;
  try {
    await api.delete(`/admin/products/${productId}`);
    router.push('/products');
  } catch (err) {
    message.value = err.response?.data?.error || 'Failed to delete';
    messageType.value = 'error';
  } finally {
    deleting.value = false;
  }
}

onMounted(async () => {
  if (!isNew.value) {
    productId = route.params.id;
    const { data } = await api.get(`/admin/products/${productId}`);
    const p = data.product;
    Object.assign(form, {
      name: p.name, price: Number(p.price), comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
      sku: p.sku || '', stockQuantity: p.stockQuantity, shortDesc: p.shortDesc || '',
      description: p.description || '', ingredients: p.ingredients || '', howToUse: p.howToUse || '',
      fragranceNotes: p.fragranceNotes || '', isActive: p.isActive, isFeatured: p.isFeatured,
      isNew: p.isNew, isBestSeller: p.isBestSeller, variants: p.variants?.map(v => ({
        name: v.name, price: v.price ? Number(v.price) : null, stockQuantity: v.stockQuantity,
      })) || [],
    });
    existingImages.value = p.images || [];
  }
});
</script>

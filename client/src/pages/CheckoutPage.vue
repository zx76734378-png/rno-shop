<template>
  <div class="container-custom py-10 max-w-3xl" v-if="!cart.isEmpty || orderCreated">
    <div v-if="orderCreated">
      <div class="text-center py-16">
        <div class="w-16 h-16 bg-sage-light rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 class="font-serif text-3xl mb-4">Thank You for Your Order!</h1>
        <p class="text-charcoal/60 mb-2">Your order <strong>{{ orderCreated.orderNumber }}</strong> has been placed.</p>
        <p class="text-charcoal/60 mb-8">A confirmation email has been sent to {{ orderCreated.email }}.</p>
        <router-link to="/shop" class="btn-primary">Continue Shopping</router-link>
      </div>
    </div>

    <div v-else>
      <Breadcrumb :items="[{ label: 'Cart', to: '/cart' }, { label: 'Checkout', to: '/checkout' }]" />
      <h1 class="font-serif text-3xl md:text-4xl mb-10">Checkout</h1>

      <form @submit.prevent="placeOrder">
        <section class="mb-10">
          <h2 class="font-serif text-xl mb-4">Shipping Address</h2>
          <div v-if="auth.isAuthenticated && addresses.length" class="mb-4">
            <label class="text-sm font-medium mb-2 block">Saved Addresses</label>
            <select v-model="selectedAddressId" class="input-field" @change="useSavedAddress">
              <option value="">Enter new address</option>
              <option v-for="addr in addresses" :key="addr.id" :value="addr.id">
                {{ addr.street }}, {{ addr.city }}, {{ addr.state }} {{ addr.zipCode }}
              </option>
            </select>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label class="text-sm mb-1 block">First Name *</label><input v-model="form.firstName" required class="input-field" /></div>
            <div><label class="text-sm mb-1 block">Last Name *</label><input v-model="form.lastName" required class="input-field" /></div>
            <div class="md:col-span-2"><label class="text-sm mb-1 block">Street Address *</label><input v-model="form.street" required class="input-field" /></div>
            <div class="md:col-span-2"><label class="text-sm mb-1 block">Apartment</label><input v-model="form.apartment" class="input-field" /></div>
            <div><label class="text-sm mb-1 block">City *</label><input v-model="form.city" required class="input-field" /></div>
            <div><label class="text-sm mb-1 block">State *</label><input v-model="form.state" required class="input-field" /></div>
            <div><label class="text-sm mb-1 block">Zip Code *</label><input v-model="form.zipCode" required class="input-field" /></div>
            <div><label class="text-sm mb-1 block">Phone</label><input v-model="form.phone" class="input-field" /></div>
          </div>
        </section>

        <section class="mb-10" v-if="!auth.isAuthenticated">
          <h2 class="font-serif text-xl mb-4">Contact</h2>
          <div><label class="text-sm mb-1 block">Email *</label><input v-model="form.email" type="email" required class="input-field" /></div>
        </section>

        <section class="mb-10">
          <h2 class="font-serif text-xl mb-4">Shipping Method</h2>
          <div class="space-y-3">
            <label v-for="method in shippingMethods" :key="method.id" class="flex items-center gap-3 p-4 border cursor-pointer hover:border-sage transition-colors" :class="{ 'border-sage bg-sage-light/30': form.shippingMethod === method.id }">
              <input type="radio" :value="method.id" v-model="form.shippingMethod" class="accent-sage" />
              <div class="flex-1"><span class="font-medium">{{ method.name }}</span><p class="text-sm text-charcoal/50">{{ method.description }}</p></div>
              <span class="font-medium">{{ formatPrice(method.price) }}</span>
            </label>
          </div>
        </section>

        <section class="mb-10">
          <h2 class="font-serif text-xl mb-4">Payment</h2>
          <p class="text-sm text-charcoal/50 mb-4">This is a demo. No real payment will be processed.</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2"><label class="text-sm mb-1 block">Card Number</label><input v-model="form.cardNumber" placeholder="4242 4242 4242 4242" class="input-field" /></div>
            <div><label class="text-sm mb-1 block">Expiry</label><input v-model="form.cardExpiry" placeholder="MM/YY" class="input-field" /></div>
            <div><label class="text-sm mb-1 block">CVC</label><input v-model="form.cardCvc" placeholder="123" class="input-field" /></div>
          </div>
        </section>

        <section class="bg-white p-6 mb-8">
          <h2 class="font-serif text-xl mb-4">Order Summary</h2>
          <div class="space-y-3">
            <div v-for="item in cart.items" :key="item.id" class="flex justify-between text-sm">
              <span>{{ item.product.name }} × {{ item.quantity }}</span>
              <span>{{ formatPrice(item.price * item.quantity) }}</span>
            </div>
          </div>
          <div class="border-t mt-4 pt-4 space-y-1 text-sm">
            <div class="flex justify-between"><span class="text-charcoal/60">Subtotal</span><span>{{ formatPrice(cart.subtotal) }}</span></div>
            <div class="flex justify-between"><span class="text-charcoal/60">Shipping</span><span>{{ formatPrice(shippingCost) }}</span></div>
            <div class="flex justify-between"><span class="text-charcoal/60">Tax</span><span>{{ formatPrice(tax) }}</span></div>
          </div>
          <div class="border-t mt-4 pt-4 flex justify-between font-serif text-lg font-semibold">
            <span>Total</span><span>{{ formatPrice(total) }}</span>
          </div>
        </section>

        <button type="submit" :disabled="submitting" class="btn-primary w-full">
          {{ submitting ? 'Placing Order...' : `Place Order – ${formatPrice(total)}` }}
        </button>
        <p v-if="error" class="text-red-500 text-sm mt-4 text-center">{{ error }}</p>
      </form>
    </div>
  </div>

  <div v-else class="container-custom py-20 text-center">
    <p class="text-lg text-charcoal/60 mb-6">Your basket is empty.</p>
    <router-link to="/shop" class="btn-primary">Start Shopping</router-link>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/utils/api';
import { formatPrice } from '@/utils/format';
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';

const cart = useCartStore();
const auth = useAuthStore();

const addresses = ref([]);
const selectedAddressId = ref('');
const orderCreated = ref(null);
const submitting = ref(false);
const error = ref('');

const shippingMethods = [
  { id: 'standard', name: 'Standard Shipping', description: '3–7 business days', price: 10 },
  { id: 'express', name: 'Express Shipping', description: '1–2 business days', price: 25 },
];

const form = reactive({
  firstName: '', lastName: '', street: '', apartment: '', city: '', state: '', zipCode: '', phone: '',
  email: '', shippingMethod: 'standard', cardNumber: '', cardExpiry: '', cardCvc: '',
});

const shippingCost = computed(() => shippingMethods.find(m => m.id === form.shippingMethod)?.price || 10);
const tax = computed(() => Math.round(cart.subtotal * 0.0875 * 100) / 100);
const discountAmount = computed(() => {
  if (!cart.coupon) return 0;
  if (cart.coupon.type === 'percentage') return Math.round(cart.subtotal * (Number(cart.coupon.value) / 100) * 100) / 100;
  return Number(cart.coupon.value);
});
const total = computed(() => Math.round((cart.subtotal + shippingCost.value + tax.value - discountAmount.value) * 100) / 100);

function useSavedAddress() {
  const addr = addresses.value.find(a => a.id === selectedAddressId.value);
  if (addr) {
    Object.assign(form, {
      firstName: addr.firstName, lastName: addr.lastName, street: addr.street,
      apartment: addr.apartment || '', city: addr.city, state: addr.state, zipCode: addr.zipCode, phone: addr.phone || '',
    });
  }
}

async function placeOrder() {
  submitting.value = true;
  error.value = '';
  try {
    const payload = {
      email: auth.user?.email || form.email,
      shippingMethod: form.shippingMethod,
    };
    if (cart.coupon?.code) {
      payload.couponCode = cart.coupon.code;
    }
    if (selectedAddressId.value) {
      payload.shippingAddressId = selectedAddressId.value;
    } else {
      payload.shippingAddress = {
        firstName: form.firstName, lastName: form.lastName, street: form.street,
        apartment: form.apartment, city: form.city, state: form.state,
        zipCode: form.zipCode, phone: form.phone,
      };
    }
    const { data } = await api.post('/orders', payload);
    orderCreated.value = data.order;
    await cart.clearCart();
  } catch (err) {
    error.value = err.response?.data?.error || 'Something went wrong. Please try again.';
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  if (auth.isAuthenticated) {
    try {
      const { data } = await api.get('/me/addresses');
      addresses.value = data.addresses;
    } catch { /* ignore */ }
  }
});
</script>

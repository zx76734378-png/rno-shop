<template>
  <div>
    <h2 class="font-serif text-xl mb-6">Profile</h2>
    <div class="bg-white p-6 max-w-lg">
      <div class="space-y-4 mb-8">
        <div class="grid grid-cols-2 gap-4">
          <div><label class="text-xs mb-1 block">First Name</label><input v-model="form.firstName" class="input-field text-sm" /></div>
          <div><label class="text-xs mb-1 block">Last Name</label><input v-model="form.lastName" class="input-field text-sm" /></div>
        </div>
        <div><label class="text-xs mb-1 block">Email</label><input :value="auth.user?.email" disabled class="input-field text-sm bg-gray-50" /></div>
        <div><label class="text-xs mb-1 block">Phone</label><input v-model="form.phone" class="input-field text-sm" /></div>
      </div>
      <button @click="saveProfile" :disabled="saving" class="btn-primary text-xs px-6">{{ saving ? 'Saving...' : 'Update Profile' }}</button>
      <p v-if="message" class="text-sage text-sm mt-3">{{ message }}</p>
    </div>

    <!-- Change Password -->
    <div class="bg-white p-6 max-w-lg mt-6">
      <h3 class="font-medium mb-4">Change Password</h3>
      <div class="space-y-3">
        <div><label class="text-xs mb-1 block">Current Password</label><input v-model="pw.current" type="password" class="input-field text-sm" /></div>
        <div><label class="text-xs mb-1 block">New Password</label><input v-model="pw.new" type="password" class="input-field text-sm" /></div>
      </div>
      <button @click="changePw" :disabled="pwSaving" class="btn-outline text-xs px-6 mt-4">{{ pwSaving ? 'Changing...' : 'Change Password' }}</button>
      <p v-if="pwMessage" :class="['text-sm mt-3', pwError ? 'text-red-500' : 'text-sage']">{{ pwMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const saving = ref(false);
const message = ref('');
const pwSaving = ref(false);
const pwMessage = ref('');
const pwError = ref(false);

const form = reactive({ firstName: '', lastName: '', phone: '' });
const pw = reactive({ current: '', new: '' });

async function saveProfile() {
  saving.value = true;
  try {
    await auth.updateProfile(form);
    message.value = 'Profile updated!';
  } catch { message.value = 'Failed to update profile'; }
  finally { saving.value = false; }
}

async function changePw() {
  pwSaving.value = true; pwMessage.value = ''; pwError.value = false;
  try {
    await auth.changePassword(pw.current, pw.new);
    pwMessage.value = 'Password changed!';
    pw.current = ''; pw.new = '';
  } catch (err) {
    pwMessage.value = err.response?.data?.error || 'Failed to change password';
    pwError.value = true;
  }
  finally { pwSaving.value = false; }
}

onMounted(() => {
  if (auth.user) {
    form.firstName = auth.user.firstName || '';
    form.lastName = auth.user.lastName || '';
    form.phone = auth.user.phone || '';
  }
});
</script>

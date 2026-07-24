import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/utils/api';

export const useAdminAuth = defineStore('adminAuth', () => {
  const user = ref(JSON.parse(localStorage.getItem('adminUser') || 'null'));
  const token = ref(localStorage.getItem('adminToken'));
  const isAuthenticated = computed(() => !!token.value && user.value?.isAdmin);

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    if (!data.user.isAdmin) throw new Error('Admin access required');
    user.value = data.user;
    token.value = data.accessToken;
    localStorage.setItem('adminToken', data.accessToken);
    localStorage.setItem('adminUser', JSON.stringify(data.user));
    return data;
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  }

  return { user, token, isAuthenticated, login, logout };
});

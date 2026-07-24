import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/utils/api';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const accessToken = ref(localStorage.getItem('accessToken'));
  const refreshToken = ref(localStorage.getItem('refreshToken'));
  const isLoading = ref(false);

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value);
  const isAdmin = computed(() => user.value?.isAdmin === true);
  const fullName = computed(() => {
    if (!user.value) return '';
    return [user.value.firstName, user.value.lastName].filter(Boolean).join(' ') || user.value.email;
  });

  async function login(email, password) {
    isLoading.value = true;
    try {
      const { data } = await api.post('/auth/login', { email, password });
      user.value = data.user;
      accessToken.value = data.accessToken;
      refreshToken.value = data.refreshToken;
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      return data;
    } finally {
      isLoading.value = false;
    }
  }

  async function register(email, password, firstName, lastName) {
    isLoading.value = true;
    try {
      const { data } = await api.post('/auth/register', { email, password, firstName, lastName });
      user.value = data.user;
      accessToken.value = data.accessToken;
      refreshToken.value = data.refreshToken;
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      return data;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchUser() {
    if (!accessToken.value) return;
    try {
      const { data } = await api.get('/me');
      user.value = data.user;
    } catch (err) {
      // Only logout on 401 (invalid/expired token) — not on network errors
      if (err.response?.status === 401) {
        logout();
      }
    }
  }

  async function updateProfile(profileData) {
    const { data } = await api.put('/me', profileData);
    user.value = data.user;
    return data;
  }

  async function changePassword(currentPassword, newPassword) {
    const { data } = await api.put('/me/password', { currentPassword, newPassword });
    return data;
  }

  function logout() {
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  return { user, accessToken, refreshToken, isLoading, isAuthenticated, isAdmin, fullName, login, register, fetchUser, updateProfile, changePassword, logout };
});

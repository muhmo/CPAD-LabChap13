import { defineStore } from 'pinia';
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const useAuth = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })(),
  }),

  getters: {
    isAuthenticated: (s) => !!s.token,
    isAdmin:         (s) => s.user?.role === 'admin',
  },

  actions: {
    async login(email, password) {
      const { data } = await axios.post(`${baseURL}/auth/login`, { email, password });
      this.token = data.access_token;
      localStorage.setItem('token', this.token);

      const me = await axios.get(`${baseURL}/auth/me`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      this.user = me.data;
      localStorage.setItem('user', JSON.stringify(this.user));
    },

    async register(name, email, password) {
      await axios.post(`${baseURL}/auth/register`, { name, email, password });
      await this.login(email, password);
    },

    logout() {
      this.token = null;
      this.user  = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});
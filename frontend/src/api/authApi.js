import api from './axios';

export const authApi = {
  register: (payload) => api.post('/auth/register/', payload),
  login: (payload) => api.post('/auth/login/', payload),
  getMe: () => api.get('/auth/me/'),
  updateMe: (payload) => api.patch('/auth/me/', payload),
  changePassword: (payload) => api.post('/auth/change-password/', payload),
};
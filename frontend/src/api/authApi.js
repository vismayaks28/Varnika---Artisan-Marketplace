import api from './axios';

export const authApi = {
  registerBuyer: (payload) => api.post('/auth/register/', payload),
  applySeller: (formData) =>
    api.post('/auth/seller/apply/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  login: (payload) => api.post('/auth/login/', payload),
  getMe: () => api.get('/auth/me/'),
  updateMe: (payload) => api.patch('/auth/me/', payload),
  changePassword: (payload) => api.post('/auth/change-password/', payload),
};
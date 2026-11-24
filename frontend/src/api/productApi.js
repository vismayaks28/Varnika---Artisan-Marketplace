import api from './axios';

export const productApi = {
  getCategories: () => api.get('/products/categories/'),
  getProducts: (params = {}) => api.get('/products/', { params }),
  getProductById: (id) => api.get(`/products/${id}/`),
};
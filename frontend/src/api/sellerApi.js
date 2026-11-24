import api from './axios';

export const sellerApi = {
  getDashboard: () => api.get('/seller/dashboard/'),
  getProducts: () => api.get('/seller/products/'),
  getProductById: (id) => api.get(`/seller/products/${id}/`),
  createProduct: (formData) =>
    api.post('/seller/products/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateProduct: (id, payload, isMultipart = false) =>
    api.patch(
      `/seller/products/${id}/`,
      payload,
      isMultipart ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined
    ),
  deleteProduct: (id) => api.delete(`/seller/products/${id}/`),
  deleteProductImage: (productId, imageId) =>
    api.delete(`/seller/products/${productId}/images/${imageId}/`),
  getEnquiries: (status = '') =>
    api.get('/seller/enquiries/', { params: status ? { status } : {} }),
  getEnquiryById: (id) => api.get(`/seller/enquiries/${id}/`),
  updateEnquiryStatus: (id, payload) =>
    api.patch(`/seller/enquiries/${id}/status/`, payload),
};
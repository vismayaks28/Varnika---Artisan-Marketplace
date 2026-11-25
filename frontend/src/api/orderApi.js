import api from './axios';

export const orderApi = {
  getWishlist: () => api.get('/orders/wishlist/'),
  toggleWishlist: (productId) => api.post('/orders/wishlist/', { product: productId }),
  getCart: () => api.get('/orders/cart/'),
  addToCart: (productId, quantity = 1) =>
    api.post('/orders/cart/', { product: productId, quantity }),
  updateCartItem: (itemId, quantity) =>
    api.patch(`/orders/cart/items/${itemId}/`, { quantity }),
  removeCartItem: (itemId) => api.delete(`/orders/cart/items/${itemId}/`),
  getAddresses: () => api.get('/orders/addresses/'),
  createAddress: (payload) => api.post('/orders/addresses/', payload),
  updateAddress: (id, payload) => api.patch(`/orders/addresses/${id}/`, payload),
  deleteAddress: (id) => api.delete(`/orders/addresses/${id}/`),
  checkout: (payload) => api.post('/orders/checkout/', payload),
  verifyPayment: (orderNumber, payload) =>
    api.post(`/orders/${orderNumber}/verify-payment/`, payload),
  getOrders: () => api.get('/orders/'),
  getOrderDetail: (orderNumber) => api.get(`/orders/${orderNumber}/`),
};
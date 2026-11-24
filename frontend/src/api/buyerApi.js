import api from './axios';

export const buyerApi = {
  getDashboard: () => api.get('/buyer/dashboard/'),
  getEnquiries: (status = '') =>
    api.get('/buyer/enquiries/', { params: status ? { status } : {} }),
  createEnquiry: (payload) => api.post('/buyer/enquiries/', payload),
};

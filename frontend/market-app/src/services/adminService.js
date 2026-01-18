import api from './api';

export const adminService = {
  // Admin Analytics
  getAdminAnalytics: async (period = 'month') => {
    const response = await api.get(`/admin/analytics/overview?period=${period}`);
    return response.data.data;
  },

  getAdminSalesAnalytics: async (period = 'month', groupBy = 'day') => {
    const response = await api.get(`/admin/analytics/sales?period=${period}&group_by=${groupBy}`);
    return response.data.data;
  },

  getAdminUserAnalytics: async (period = 'month') => {
    const response = await api.get(`/admin/analytics/users?period=${period}`);
    return response.data.data;
  },

  getAdminProductAnalytics: async (period = 'month') => {
    const response = await api.get(`/admin/analytics/products?period=${period}`);
    return response.data.data;
  },

  getAdminMerchantAnalytics: async (period = 'month') => {
    const response = await api.get(`/admin/analytics/merchants?period=${period}`);
    return response.data.data;
  },

  getAdminOrderAnalytics: async (period = 'month') => {
    const response = await api.get(`/admin/analytics/orders?period=${period}`);
    return response.data.data;
  },

  getAdminReviewAnalytics: async (period = 'month') => {
    const response = await api.get(`/admin/analytics/reviews?period=${period}`);
    return response.data.data;
  },

  // User Management
  getUsers: async (params = '') => {
    const response = await api.get(`/admin/users?${params}`);
    return response.data.data;
  },

  getUser: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data.data;
  },

  updateUser: async (userId, userData) => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data.data;
  },

  resetUserPassword: async (userId, newPassword) => {
    const response = await api.post(`/admin/users/${userId}/reset-password`, { new_password: newPassword });
    return response.data;
  },

  deleteUser: async (userId, hardDelete = false) => {
    const params = hardDelete ? '?hard_delete=true' : '';
    const response = await api.delete(`/admin/users/${userId}${params}`);
    return response.data;
  }
};

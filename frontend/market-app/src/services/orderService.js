import api from './api';

export const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data.data;
  },

  getOrders: async () => {
    const response = await api.get('/orders');
    return response.data.data;
  },

  getOrder: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data.data;
  },

  cancelOrder: async (id, reason) => {
    const response = await api.post(`/orders/${id}/cancel`, { reason });
    return response.data.data;
  },

  getRefundStatus: async (id) => {
    const response = await api.get(`/orders/${id}/refund-status`);
    return response.data.data;
  },

  // Merchant endpoints
  getMerchantOrders: async () => {
    const response = await api.get('/merchant/orders');
    return response.data.data;
  },

  updateOrderStatus: async (id, status, notes) => {
    const response = await api.patch(`/merchant/orders/${id}/status`, {
      status,
      notes
    });
    return response.data.data;
  },

  // Merchant Analytics
  getMerchantAnalytics: async (period = 'month') => {
    const response = await api.get(`/merchant/analytics/overview?period=${period}`);
    return response.data.data;
  },

  getMerchantSalesAnalytics: async (period = 'month', groupBy = 'day') => {
    const response = await api.get(`/merchant/analytics/sales?period=${period}&group_by=${groupBy}`);
    return response.data.data;
  },

  getMerchantProductAnalytics: async (period = 'month') => {
    const response = await api.get(`/merchant/analytics/products?period=${period}`);
    return response.data.data;
  }
};

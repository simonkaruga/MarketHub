import api from './api';

export const paymentService = {
  // Initiate M-Pesa STK Push
  initiateStkPush: async (orderId, phoneNumber) => {
    const response = await api.post('/payments/mpesa/stk-push', {
      order_id: orderId,
      phone_number: phoneNumber
    });
    return response.data;
  },

  // Check payment status
  checkPaymentStatus: async (orderId) => {
    const response = await api.get(`/payments/status/${orderId}`);
    return response.data;
  },

  // Get payment history
  getPaymentHistory: async () => {
    const response = await api.get('/payments/history');
    return response.data;
  },

  // Verify payment
  verifyPayment: async (orderId) => {
    const response = await api.post(`/payments/verify/${orderId}`, {});
    return response.data;
  }
};

export default paymentService;

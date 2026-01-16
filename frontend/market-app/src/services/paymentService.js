import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const paymentService = {
  // Initiate M-Pesa STK Push
  initiateStkPush: async (orderId, phoneNumber) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_BASE_URL}/payments/mpesa/stk-push`,
      {
        order_id: orderId,
        phone_number: phoneNumber
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  // Check payment status
  checkPaymentStatus: async (orderId) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${API_BASE_URL}/payments/status/${orderId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  // Get payment history
  getPaymentHistory: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${API_BASE_URL}/payments/history`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  // Verify payment
  verifyPayment: async (orderId) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_BASE_URL}/payments/verify/${orderId}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }
};

export default paymentService;

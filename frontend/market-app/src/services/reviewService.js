import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const reviewService = {
  // Get reviews for a product
  async getProductReviews(productId, page = 1, limit = 10) {
    const response = await api.get(`/reviews/product/${productId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get reviews by user
  async getUserReviews(page = 1, limit = 10) {
    const response = await api.get(`/reviews/user?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Create a new review
  async createReview(reviewData) {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  // Update a review
  async updateReview(reviewId, reviewData) {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  // Delete a review
  async deleteReview(reviewId) {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  // Mark review as helpful
  async markHelpful(reviewId) {
    const response = await api.post(`/reviews/${reviewId}/helpful`);
    return response.data;
  },

  // Report a review
  async reportReview(reviewId, reason) {
    const response = await api.post(`/reviews/${reviewId}/report`, { reason });
    return response.data;
  },

  // Get review statistics for a product
  async getReviewStats(productId) {
    const response = await api.get(`/reviews/stats/${productId}`);
    return response.data;
  },

  // Get review statistics for a merchant
  async getMerchantReviewStats(merchantId) {
    const response = await api.get(`/reviews/stats/merchant/${merchantId}`);
    return response.data;
  },

  // Check if user can review a product
  async canReviewProduct(productId) {
    const response = await api.get(`/reviews/can-review/${productId}`);
    return response.data;
  },
};

export default reviewService;

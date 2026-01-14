import api from './api';

export const reviewService = {
  createReview: async (reviewData) => {
    const formData = new FormData();
    formData.append('product_id', reviewData.product_id);
    formData.append('rating', reviewData.rating);
    formData.append('comment', reviewData.comment);
    
    if (reviewData.title) {
      formData.append('title', reviewData.title);
    }
    
    if (reviewData.images) {
      reviewData.images.forEach((image, index) => {
        formData.append('images', image);
      });
    }

    const response = await api.post('/reviews', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  },

  getProductReviews: async (productId, params = {}) => {
    const response = await api.get(`/products/${productId}/reviews`, { params });
    return response.data.data;
  },

  updateReview: async (id, reviewData) => {
    const response = await api.put(`/reviews/${id}`, reviewData);
    return response.data.data;
  },

  deleteReview: async (id) => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },

  markHelpful: async (id) => {
    const response = await api.post(`/reviews/${id}/helpful`);
    return response.data;
  },

  // Merchant endpoints
  getMerchantReviews: async () => {
    const response = await api.get('/merchant/reviews');
    return response.data.data;
  },

  replyToReview: async (id, reply) => {
    const response = await api.post(`/merchant/reviews/${id}/reply`, { reply });
    return response.data.data;
  }
};

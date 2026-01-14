import api from './api';

export const productService = {
  getProducts: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data.data;
  },

  getProduct: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  },

  searchProducts: async (query) => {
    const response = await api.get(`/products/search?q=${query}`);
    return response.data.data;
  },

  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data.data;
  },

  // Merchant endpoints
  createProduct: async (productData) => {
    const formData = new FormData();
    Object.keys(productData).forEach(key => {
      if (key === 'image' && productData[key]) {
        formData.append('image', productData[key]);
      } else {
        formData.append(key, productData[key]);
      }
    });

    const response = await api.post('/merchant/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  },

  updateProduct: async (id, productData) => {
    const formData = new FormData();
    Object.keys(productData).forEach(key => {
      if (key === 'image' && productData[key]) {
        formData.append('image', productData[key]);
      } else if (productData[key] !== undefined) {
        formData.append(key, productData[key]);
      }
    });

    const response = await api.put(`/merchant/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/merchant/products/${id}`);
    return response.data;
  },

  getMerchantProducts: async () => {
    const response = await api.get('/merchant/products');
    return response.data.data;
  }
};

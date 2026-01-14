import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

export const productService = {
  // Get all products with optional filters
  async getProducts(filters = {}) {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });

    const response = await api.get(`/products?${params}`);
    return response.data;
  },

  // Get single product by ID
  async getProduct(id) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Create new product (merchant only)
  async createProduct(productData) {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Update product (merchant only)
  async updateProduct(id, productData) {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Delete product (merchant only)
  async deleteProduct(id) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Get products by merchant
  async getMerchantProducts(merchantId) {
    const response = await api.get(`/products/merchant/${merchantId}`);
    return response.data;
  },

  // Search products
  async searchProducts(query) {
    const response = await api.get(`/products/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Get product categories
  async getCategories() {
    const response = await api.get('/categories');
    return response.data;
  },

  // Upload product image
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default productService;

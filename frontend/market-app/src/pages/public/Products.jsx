import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../../services/productService';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ProductGrid from '../../components/product/ProductGrid';
import ProductFilter from '../../components/product/ProductFilter';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const data = await productService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');

      const searchQuery = searchParams.get('search');
      let data;

      if (searchQuery) {
        data = await productService.searchProducts(searchQuery);
      } else {
        const params = {
          category_id: searchParams.get('category'),
          min_price: searchParams.get('min_price'),
          max_price: searchParams.get('max_price'),
          sort_by: searchParams.get('sort_by')
        };
        data = await productService.getProducts(params);
      }

      setProducts(data.products || data || []);
    } catch (error) {
      setError('Failed to load products');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters) => {
    const params = new URLSearchParams();

    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.set(key, filters[key]);
      }
    });

    window.history.pushState({}, '', `?${params.toString()}`);
    fetchProducts();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container-custom py-8 flex-1">
        <h1 className="text-3xl font-bold mb-8">All Products</h1>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <ProductFilter
              categories={categories}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <ProductGrid
              products={products}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Products;

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
  const [pagination, setPagination] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const response = await productService.getCategories();
      // API returns { success: true, data: [...] }
      setCategories(response.data || []);
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
          category: searchParams.get('category'),
          min_price: searchParams.get('min_price'),
          max_price: searchParams.get('max_price'),
          sort_by: searchParams.get('sort_by'),
          page: searchParams.get('page') || 1,
          per_page: 50  // Increase to show more products per page
        };
        data = await productService.getProducts(params);
      }

      // API returns { success: true, data: { products: [...], pagination: {...} } }
      setProducts(data.data?.products || []);
      setPagination(data.data?.pagination || null);
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

    setSearchParams(params);
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

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set('page', pagination.page - 1);
                    setSearchParams(params);
                  }}
                  disabled={!pagination.has_prev}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Previous
                </button>

                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.total_pages}
                </span>

                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set('page', pagination.page + 1);
                    setSearchParams(params);
                  }}
                  disabled={!pagination.has_next}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Products;

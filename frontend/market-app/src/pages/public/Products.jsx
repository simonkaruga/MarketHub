import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Count active filters
  const activeFiltersCount = ['category', 'min_price', 'max_price', 'sort_by']
    .filter(key => searchParams.get(key)).length;

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

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    if (!pagination) return [];
    const pages = [];
    const total = pagination.total_pages;
    const current = pagination.page;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, '...', total);
      } else if (current >= total - 2) {
        pages.push(1, '...', total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', total);
      }
    }
    return pages;
  };

  const goToPage = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a]">
      <Navbar />

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-80 max-w-full bg-slate-800 shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-600 px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Filters</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-300 hover:bg-slate-700 rounded-lg"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="p-4">
              <ProductFilter
                categories={categories}
                onFilterChange={(filters) => {
                  handleFilterChange(filters);
                  setMobileFiltersOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Full Width Container */}
      <div className="flex-1 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header with title and mobile filter button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">All Products</h1>
            {pagination && (
              <p className="text-sm text-gray-300 mt-1">
                Showing {products.length} of {pagination.total_items} products
              </p>
            )}
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <FiFilter size={18} />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-orange-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-6 lg:gap-8">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-20 bg-slate-800 rounded-xl shadow-sm border border-slate-600 p-5">
              <h2 className="text-lg font-semibold text-white mb-4">Filters</h2>
              <ProductFilter
                categories={categories}
                onFilterChange={handleFilterChange}
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            <ProductGrid
              products={products}
              loading={loading}
              error={error}
            />

            {/* Enhanced Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="flex items-center gap-1">
                  {/* Previous Button */}
                  <button
                    onClick={() => goToPage(pagination.page - 1)}
                    disabled={!pagination.has_prev}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                    aria-label="Previous page"
                  >
                    <FiChevronLeft size={20} />
                  </button>

                  {/* Page Numbers */}
                  <div className="hidden sm:flex items-center gap-1">
                    {getPageNumbers().map((page, index) => (
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">...</span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`min-w-[40px] px-3 py-2 rounded-lg font-medium transition-colors ${
                            page === pagination.page
                              ? 'bg-primary-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    ))}
                  </div>

                  {/* Mobile page indicator */}
                  <span className="sm:hidden px-4 py-2 text-sm text-gray-600">
                    Page {pagination.page} of {pagination.total_pages}
                  </span>

                  {/* Next Button */}
                  <button
                    onClick={() => goToPage(pagination.page + 1)}
                    disabled={!pagination.has_next}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                    aria-label="Next page"
                  >
                    <FiChevronRight size={20} />
                  </button>
                </div>
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

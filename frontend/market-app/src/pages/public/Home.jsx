import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import ProductGrid from '../../components/product/ProductGrid';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { FiShoppingBag, FiTruck, FiShield, FiUsers } from 'react-icons/fi';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const data = await productService.getProducts({ limit: 8 });
      setFeaturedProducts(data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container-custom">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-6">
              Welcome to MarketHub
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              Kenya's premier online marketplace. Buy and sell with confidence.
              Shop from verified merchants with secure M-Pesa payments and cash on delivery.
            </p>
            <div className="flex gap-4">
              <Link to="/products" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Start Shopping
              </Link>
              <Link to="/register" className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors">
                Become a Merchant
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShoppingBag className="text-primary-600" size={32} />
              </div>
              <h3 className="font-semibold text-lg mb-2">Wide Selection</h3>
              <p className="text-gray-600 text-sm">
                Thousands of products from verified merchants
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTruck className="text-primary-600" size={32} />
              </div>
              <h3 className="font-semibold text-lg mb-2">Fast Delivery</h3>
              <p className="text-gray-600 text-sm">
                Quick shipping and convenient hub pickup
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShield className="text-primary-600" size={32} />
              </div>
              <h3 className="font-semibold text-lg mb-2">Secure Payment</h3>
              <p className="text-gray-600 text-sm">
                M-Pesa and cash on delivery options
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUsers className="text-primary-600" size={32} />
              </div>
              <h3 className="font-semibold text-lg mb-2">Trusted Merchants</h3>
              <p className="text-gray-600 text-sm">
                All merchants verified and rated by customers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Link to="/products" className="text-primary-600 hover:text-primary-700 font-semibold">
              View All →
            </Link>
          </div>

          <ProductGrid products={featuredProducts} loading={loading} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Selling?</h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of successful merchants on MarketHub
          </p>
          <Link to="/register" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block">
            Become a Merchant
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;

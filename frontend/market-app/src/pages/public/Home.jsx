import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import ProductGrid from '../../components/product/ProductGrid';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { FiShoppingBag, FiTruck, FiShield, FiUsers, FiStar, FiAward, FiCheck } from 'react-icons/fi';

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
      <section className="relative text-white py-24 overflow-hidden" style={{ backgroundColor: '#0f172a' }}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="container-custom relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-primary-100 text-sm font-medium">
                <FiAward className="mr-2" size={16} />
                Kenya's #1 Online Marketplace
              </span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
              Shop Smart,<br />
              <span className="text-primary-200">Sell Confidently</span>
            </h1>

            <p className="text-xl md:text-2xl mb-12 text-primary-100 leading-relaxed max-w-3xl mx-auto">
              Discover amazing products from verified Kenyan merchants.
              Secure payments with M-Pesa, fast delivery, and cash on delivery available.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <Link to="/products" className="bg-white text-primary-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                 Start Shopping
              </Link>
              <Link to="/register" className="border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-primary-600 transition-all duration-200">
                 Become a Merchant
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-primary-200">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-primary-300 rounded-full border-2 border-white"></div>
                  <div className="w-8 h-8 bg-primary-400 rounded-full border-2 border-white"></div>
                  <div className="w-8 h-8 bg-primary-500 rounded-full border-2 border-white"></div>
                </div>
                <span className="text-sm">10,000+ Happy Customers</span>
              </div>
              <div className="flex items-center gap-1">
                <FiStar className="text-yellow-400 fill-current" size={16} />
                <FiStar className="text-yellow-400 fill-current" size={16} />
                <FiStar className="text-yellow-400 fill-current" size={16} />
                <FiStar className="text-yellow-400 fill-current" size={16} />
                <FiStar className="text-yellow-400 fill-current" size={16} />
                <span className="text-sm ml-2">4.8/5 Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-[#0f172a]">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose MarketHub?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Experience the future of online shopping in Kenya with our innovative platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-slate-700 to-slate-800 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                <FiShoppingBag className="text-orange-400" size={36} />
              </div>
              <h3 className="font-bold text-xl mb-3 text-white">Wide Selection</h3>
              <p className="text-gray-300 leading-relaxed">
                Discover thousands of products from verified Kenyan merchants across all categories
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-slate-700 to-slate-800 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                <FiTruck className="text-orange-400" size={36} />
              </div>
              <h3 className="font-bold text-xl mb-3 text-white">Lightning Fast Delivery</h3>
              <p className="text-gray-300 leading-relaxed">
                Get your orders delivered quickly or pick up conveniently at our hub locations
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-slate-700 to-slate-800 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                <FiShield className="text-orange-400" size={36} />
              </div>
              <h3 className="font-bold text-xl mb-3 text-white">Secure Payments</h3>
              <p className="text-gray-300 leading-relaxed">
                Pay safely with M-Pesa or choose cash on delivery for complete peace of mind
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-slate-700 to-slate-800 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                <FiUsers className="text-orange-400" size={36} />
              </div>
              <h3 className="font-bold text-xl mb-3 text-white">Trusted Community</h3>
              <p className="text-gray-300 leading-relaxed">
                All merchants are verified and rated by our community of satisfied customers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-[#0f172a]">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Featured Products
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover trending products from our verified merchants
            </p>
          </div>

          <ProductGrid products={featuredProducts} loading={loading} />

          <div className="text-center mt-12">
            <Link to="/products" className="bg-orange-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-orange-600 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl inline-block">
              Explore All Products →
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-[#0f172a]">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-300">
              Real experiences from real customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  <FiStar className="fill-current" size={20} />
                  <FiStar className="fill-current" size={20} />
                  <FiStar className="fill-current" size={20} />
                  <FiStar className="fill-current" size={20} />
                  <FiStar className="fill-current" size={20} />
                </div>
              </div>
              <p className="text-gray-300 mb-4 italic">
                "MarketHub made it so easy to find authentic Kenyan products. The delivery was faster than expected!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  S
                </div>
                <div>
                  <p className="font-semibold text-white">Sarah Wanjiku</p>
                  <p className="text-sm text-gray-400">Nairobi</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 p-8 rounded-2xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  <FiStar className="fill-current" size={20} />
                  <FiStar className="fill-current" size={20} />
                  <FiStar className="fill-current" size={20} />
                  <FiStar className="fill-current" size={20} />
                  <FiStar className="fill-current" size={20} />
                </div>
              </div>
              <p className="text-gray-300 mb-4 italic">
                "As a merchant, MarketHub has helped me reach customers I never could before. The platform is amazing!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  J
                </div>
                <div>
                  <p className="font-semibold text-white">James Kiprop</p>
                  <p className="text-sm text-gray-400">Eldoret</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 p-8 rounded-2xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  <FiStar className="fill-current" size={20} />
                  <FiStar className="fill-current" size={20} />
                  <FiStar className="fill-current" size={20} />
                  <FiStar className="fill-current" size={20} />
                  <FiStar className="fill-current" size={20} />
                </div>
              </div>
              <p className="text-gray-300 mb-4 italic">
                "M-Pesa integration works perfectly. I love the cash on delivery option for peace of mind."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  M
                </div>
                <div>
                  <p className="font-semibold text-white">Mary Achieng</p>
                  <p className="text-sm text-gray-400">Kisumu</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#0f172a] text-white py-20">
        <div className="container-custom text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Start Your Success Story?
            </h2>
            <p className="text-xl md:text-2xl mb-12 text-gray-300 leading-relaxed">
              Join thousands of successful merchants and customers on MarketHub.
              Start selling today or discover amazing products from verified sellers.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/register" className="bg-orange-500 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-orange-600 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl inline-block">
                 Become a Merchant
              </Link>
              <Link to="/products" className="border-2 border-orange-500 text-orange-500 px-10 py-4 rounded-xl font-bold text-lg hover:bg-orange-500 hover:text-white transition-all duration-200 inline-block">
                 Start Shopping
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-gray-400">
              <div className="flex items-center gap-2">
                <FiCheck className="text-green-400" size={20} />
                <span>Free to Join</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCheck className="text-green-400" size={20} />
                <span>No Setup Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCheck className="text-green-400" size={20} />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;

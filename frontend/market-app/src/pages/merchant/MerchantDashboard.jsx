import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { FiPackage, FiDollarSign, FiShoppingBag, FiStar } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatters';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Loading from '../../components/common/Loading';

const MerchantDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const data = await orderService.getMerchantAnalytics('month');
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 bg-gray-50">
          <h1 className="text-3xl font-bold mb-8">Merchant Dashboard</h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {formatCurrency(analytics?.revenue?.total || 0)}
                  </p>
                </div>
                <FiDollarSign className="text-primary-600" size={32} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Orders</p>
                  <p className="text-2xl font-bold">{analytics?.orders?.total || 0}</p>
                </div>
                <FiShoppingBag className="text-blue-600" size={32} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Products</p>
                  <p className="text-2xl font-bold">{analytics?.products?.total || 0}</p>
                </div>
                <FiPackage className="text-green-600" size={32} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Avg Rating</p>
                  <p className="text-2xl font-bold">{analytics?.performance?.average_rating || 0}★</p>
                </div>
                <FiStar className="text-yellow-500" size={32} />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/merchant/products" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">Manage Products</h3>
              <p className="text-gray-600 text-sm">Add, edit, or remove products</p>
            </Link>

            <Link to="/merchant/orders" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">View Orders</h3>
              <p className="text-gray-600 text-sm">Process and manage orders</p>
            </Link>

            <Link to="/merchant/analytics" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">Analytics</h3>
              <p className="text-gray-600 text-sm">View detailed performance metrics</p>
            </Link>

            <Link to="/merchant/reviews" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">Reviews</h3>
              <p className="text-gray-600 text-sm">View and respond to reviews</p>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MerchantDashboard;

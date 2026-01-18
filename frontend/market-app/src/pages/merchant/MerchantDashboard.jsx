import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { FiPackage, FiDollarSign, FiShoppingBag, FiStar, FiPlus, FiList, FiBarChart2, FiMessageSquare } from 'react-icons/fi';
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

  const StatCard = ({ title, value, icon: Icon, gradient }) => (
    <div className={`relative overflow-hidden rounded-2xl ${gradient} p-6 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 backdrop-blur-sm bg-opacity-90 border border-white/20`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/90">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
        </div>
        <div className="p-3 rounded-full bg-white/20 text-white">
          <Icon size={32} />
        </div>
      </div>
      <div className="absolute -top-4 -right-4 w-20 h-20 bg-white opacity-10 rounded-full"></div>
    </div>
  );

  const ActionCard = ({ to, title, description, icon: Icon, color }) => (
    <Link to={to} className="group">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-lg ${color} text-white`}>
            <Icon size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
              {title}
            </h3>
            <p className="text-gray-300 text-sm">{description}</p>
          </div>
          <div className="text-white/60 group-hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">Merchant Control Center</h1>
              <p className="text-gray-300 text-lg">Manage your marketplace presence and track performance</p>
              <div className="mt-4 h-1 w-24 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Revenue"
                value={formatCurrency(analytics?.revenue?.total || 0)}
                icon={FiDollarSign}
                gradient="bg-gradient-to-r from-green-600 to-emerald-600"
              />
              <StatCard
                title="Total Orders"
                value={analytics?.orders?.total || 0}
                icon={FiShoppingBag}
                gradient="bg-gradient-to-r from-blue-600 to-cyan-600"
              />
              <StatCard
                title="Products"
                value={analytics?.products?.total || 0}
                icon={FiPackage}
                gradient="bg-gradient-to-r from-purple-600 to-pink-600"
              />
              <StatCard
                title="Avg Rating"
                value={`${analytics?.performance?.average_rating || 0}★`}
                icon={FiStar}
                gradient="bg-gradient-to-r from-yellow-600 to-orange-600"
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ActionCard
                  to="/merchant/products"
                  title="Product Management"
                  description="Add, edit, or remove your products"
                  icon={FiPlus}
                  color="bg-green-600"
                />
                <ActionCard
                  to="/merchant/orders"
                  title="Order Processing"
                  description="Process and manage customer orders"
                  icon={FiList}
                  color="bg-blue-600"
                />
                <ActionCard
                  to="/merchant/analytics"
                  title="Performance Analytics"
                  description="View detailed sales and performance metrics"
                  icon={FiBarChart2}
                  color="bg-purple-600"
                />
                <ActionCard
                  to="/merchant/reviews"
                  title="Customer Reviews"
                  description="View and respond to customer feedback"
                  icon={FiMessageSquare}
                  color="bg-orange-600"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MerchantDashboard;

import { useState, useEffect } from 'react';
import { FiTrendingUp, FiDollarSign, FiShoppingBag, FiUsers, FiPackage, FiUserCheck } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/formatters';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [analytics, setAnalytics] = useState({
    platform_revenue: 0,
    total_orders: 0,
    total_users: 0,
    total_merchants: 0,
    total_products: 0,
    active_customers: 0,
    revenue_growth: 0,
    users_growth: 0,
    orders_growth: 0,
    revenue_by_day: [],
    top_merchants: [],
    top_products: [],
    user_registrations: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/admin/analytics?days=${timeRange}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load analytics');
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Analytics</h1>
              <p className="text-gray-600">Monitor overall platform performance and growth</p>
            </div>
            <div>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="365">Last Year</option>
              </select>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
            {/* Platform Revenue */}
            <div className="bg-white overflow-hidden shadow rounded-lg col-span-2">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="rounded-md bg-primary-500 p-3">
                      <FiDollarSign className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Platform Revenue</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {formatCurrency(analytics.platform_revenue)}
                        </div>
                        {analytics.revenue_growth !== 0 && (
                          <div className={`ml-2 flex items-baseline text-sm font-semibold ${analytics.revenue_growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            <FiTrendingUp className="self-center flex-shrink-0 h-4 w-4" />
                            <span className="ml-1">
                              {analytics.revenue_growth > 0 ? '+' : ''}{analytics.revenue_growth.toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Orders */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="rounded-md bg-blue-500 p-3">
                      <FiShoppingBag className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {analytics.total_orders}
                        </div>
                        {analytics.orders_growth !== 0 && (
                          <div className={`ml-2 flex items-baseline text-xs font-semibold ${analytics.orders_growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {analytics.orders_growth > 0 ? '+' : ''}{analytics.orders_growth.toFixed(1)}%
                          </div>
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Users */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="rounded-md bg-green-500 p-3">
                      <FiUsers className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {analytics.total_users}
                        </div>
                        {analytics.users_growth !== 0 && (
                          <div className={`ml-2 flex items-baseline text-xs font-semibold ${analytics.users_growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {analytics.users_growth > 0 ? '+' : ''}{analytics.users_growth.toFixed(1)}%
                          </div>
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Merchants */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="rounded-md bg-purple-500 p-3">
                      <FiUserCheck className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Merchants</dt>
                      <dd className="text-2xl font-semibold text-gray-900">
                        {analytics.total_merchants}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Products */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="rounded-md bg-orange-500 p-3">
                      <FiPackage className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Products</dt>
                      <dd className="text-2xl font-semibold text-gray-900">
                        {analytics.total_products}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Chart */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Revenue Trend</h2>
              {analytics.revenue_by_day && analytics.revenue_by_day.length > 0 ? (
                <div className="space-y-3">
                  {analytics.revenue_by_day.slice(-10).map((day, index) => {
                    const maxRevenue = Math.max(...analytics.revenue_by_day.map(d => d.revenue));
                    const barWidth = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;

                    return (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          <span className="font-medium text-gray-900">{formatCurrency(day.revenue)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No revenue data available</p>
              )}
            </div>

            {/* User Registrations Chart */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">User Growth</h2>
              {analytics.user_registrations && analytics.user_registrations.length > 0 ? (
                <div className="space-y-3">
                  {analytics.user_registrations.slice(-10).map((day, index) => {
                    const maxUsers = Math.max(...analytics.user_registrations.map(d => d.count));
                    const barWidth = maxUsers > 0 ? (day.count / maxUsers) * 100 : 0;

                    return (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          <span className="font-medium text-gray-900">{day.count} new users</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-green-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No user registration data available</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Merchants */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Top Merchants by Revenue</h2>
              {analytics.top_merchants && analytics.top_merchants.length > 0 ? (
                <div className="space-y-4">
                  {analytics.top_merchants.map((merchant, index) => (
                    <div key={merchant.id} className="flex items-center justify-between pb-4 border-b last:border-b-0">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-gray-400">
                          #{index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{merchant.name}</h3>
                          <p className="text-sm text-gray-500">
                            {merchant.products_count} products • {merchant.orders_count} orders
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(merchant.total_revenue)}
                        </p>
                        <p className="text-sm text-gray-500">Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No merchant data available</p>
              )}
            </div>

            {/* Top Products */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Top Selling Products</h2>
              {analytics.top_products && analytics.top_products.length > 0 ? (
                <div className="space-y-4">
                  {analytics.top_products.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between pb-4 border-b last:border-b-0">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-gray-400">
                          #{index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{product.name}</h3>
                          <p className="text-sm text-gray-500">
                            {product.merchant_name} • {product.total_sold} sold
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(product.total_revenue)}
                        </p>
                        <p className="text-sm text-gray-500">Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No product data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;

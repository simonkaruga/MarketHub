import { useState, useEffect } from 'react';
import { FiTrendingUp, FiDollarSign, FiShoppingBag, FiUsers, FiPackage, FiUserCheck } from 'react-icons/fi';
import { adminService } from '../../services/adminService';
import { formatCurrency } from '../../utils/formatters';
import AdminLayout from '../../components/layout/AdminLayout';

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month'); // 'today', 'week', 'month', 'year'
  const [overview, setOverview] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [merchantData, setMerchantData] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [overviewData, salesData, userData, merchantData] = await Promise.all([
        adminService.getAdminAnalytics(timeRange),
        adminService.getAdminSalesAnalytics(timeRange, 'day'),
        adminService.getAdminUserAnalytics(timeRange),
        adminService.getAdminMerchantAnalytics(timeRange)
      ]);

      setOverview(overviewData);
      setSalesData(salesData);
      setUserData(userData);
      setMerchantData(merchantData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Platform Analytics</h1>
          <p className="text-gray-300 text-lg">Monitor overall platform performance and growth</p>
          <div className="mt-4 h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        </div>
        <div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
          >
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
        {/* Platform Revenue */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl p-6 col-span-2">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600">
                <FiDollarSign className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-300 truncate">Platform Revenue</dt>
                <dd className="flex items-baseline">
                  <div className="text-3xl font-bold text-white">
                    {formatCurrency(overview?.revenue?.total || 0)}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600">
                <FiShoppingBag className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-300 truncate">Total Orders</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-bold text-white">
                    {overview?.orders?.total || 0}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
                <FiUsers className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-300 truncate">Total Users</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-bold text-white">
                    {userData?.user_counts?.reduce((sum, role) => sum + role.count, 0) || 0}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Active Merchants */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 rounded-lg bg-gradient-to-r from-orange-600 to-red-600">
                <FiUserCheck className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-300 truncate">Merchants</dt>
                <dd className="text-2xl font-bold text-white">
                  {overview?.users?.active_merchants || 0}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600">
                <FiPackage className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-300 truncate">Products</dt>
                <dd className="text-2xl font-bold text-white">
                  {overview?.products?.total || 0}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Revenue Trend</h2>
          {salesData?.sales_trend && salesData.sales_trend.length > 0 ? (
            <div className="space-y-4">
              {salesData.sales_trend.slice(-10).map((day, index) => {
                const maxRevenue = Math.max(...salesData.sales_trend.map(d => d.revenue));
                const barWidth = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;

                return (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">{day.period}</span>
                      <span className="font-semibold text-white">{formatCurrency(day.revenue)}</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-4">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-300"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No revenue data available</p>
          )}
        </div>

        {/* User Registrations Chart */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">User Growth</h2>
          {userData?.new_users_trend && userData.new_users_trend.length > 0 ? (
            <div className="space-y-4">
              {userData.new_users_trend.slice(-10).map((day, index) => {
                const maxUsers = Math.max(...userData.new_users_trend.map(d => d.count));
                const barWidth = maxUsers > 0 ? (day.count / maxUsers) * 100 : 0;

                return (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">{day.date}</span>
                      <span className="font-semibold text-white">{day.count} new users</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-4">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full transition-all duration-300"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No user registration data available</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Merchants */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Top Merchants by Revenue</h2>
          {merchantData?.top_merchants && merchantData.top_merchants.length > 0 ? (
            <div className="space-y-4">
              {merchantData.top_merchants.map((merchant, index) => (
                <div key={merchant.id} className="flex items-center justify-between pb-4 border-b border-white/10 last:border-b-0">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-gray-300">
                      #{index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{merchant.name}</h3>
                      <p className="text-sm text-gray-400">
                        {merchant.order_count} orders • {formatCurrency(merchant.total_revenue)} revenue
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">
                      {formatCurrency(merchant.payout)}
                    </p>
                    <p className="text-sm text-gray-400">Payout</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No merchant data available</p>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Top Selling Products</h2>
          {salesData?.top_products && salesData.top_products.length > 0 ? (
            <div className="space-y-4">
              {salesData.top_products.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between pb-4 border-b border-white/10 last:border-b-0">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-gray-300">
                      #{index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{product.name}</h3>
                      <p className="text-sm text-gray-400">
                        {product.units_sold} units sold
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">
                      {formatCurrency(product.revenue)}
                    </p>
                    <p className="text-sm text-gray-400">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No product data available</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;

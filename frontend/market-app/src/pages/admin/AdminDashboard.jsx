import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import AdminLayout from '../../components/layout/AdminLayout';
import { FaUsers, FaShoppingCart, FaMoneyBillWave, FaUserCog, FaStore, FaClipboardList, FaChartLine, FaWarehouse } from 'react-icons/fa';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [analyticsData, userData] = await Promise.all([
          adminService.getAdminAnalytics('month'),
          adminService.getAdminUserAnalytics('month')
        ]);
        setAnalytics(analyticsData);
        setUserStats(userData);
      } catch (err) {
        if (err.response?.status === 403 || err.response?.status === 422) {
          setError('Admin access required. Please log in as an administrator.');
        } else {
          setError('Failed to load dashboard data');
        }
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  const totalUsers = userStats?.user_counts?.reduce((sum, role) => sum + role.count, 0) || 0;
  const totalOrders = analytics?.orders?.total || 0;
  const totalRevenue = analytics?.revenue?.total || 0;

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
      <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-xl`}>
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
    <AdminLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">MarketHub Admin Control</h1>
            <p className="text-gray-300 text-lg">Enterprise management dashboard for your marketplace</p>
            <div className="mt-4 h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={totalUsers.toLocaleString()}
              icon={FaUsers}
              gradient="bg-gradient-to-r from-blue-600 to-cyan-600"
            />
            <StatCard
              title="Total Orders"
              value={totalOrders.toLocaleString()}
              icon={FaShoppingCart}
              gradient="bg-gradient-to-r from-green-600 to-emerald-600"
            />
            <StatCard
              title="Total Revenue"
              value={`KES ${totalRevenue.toLocaleString()}`}
              icon={FaMoneyBillWave}
              gradient="bg-gradient-to-r from-purple-600 to-pink-600"
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ActionCard
                to="/admin/users"
                title="User Management"
                description="Manage users, roles, and permissions"
                icon={FaUserCog}
                color="bg-blue-600"
              />
              <ActionCard
                to="/admin/merchant-applications"
                title="Merchant Applications"
                description="Review and approve new merchants"
                icon={FaStore}
                color="bg-green-600"
              />
              <ActionCard
                to="/admin/orders"
                title="Order Management"
                description="Monitor and manage marketplace orders"
                icon={FaClipboardList}
                color="bg-purple-600"
              />
              <ActionCard
                to="/admin/analytics"
                title="Analytics Dashboard"
                description="View detailed marketplace analytics"
                icon={FaChartLine}
                color="bg-orange-600"
              />
              <ActionCard
                to="/admin/hub-staff"
                title="Hub Staff Management"
                description="Manage delivery hub personnel"
                icon={FaWarehouse}
                color="bg-red-600"
              />
            </div>
          </div>

          {/* System Status */}
          <div className="mt-8 bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">System Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">99.9%</div>
                <div className="text-sm text-gray-300">System Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{totalOrders}</div>
                <div className="text-sm text-gray-300">Active Orders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{totalUsers}</div>
                <div className="text-sm text-gray-300">Registered Users</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

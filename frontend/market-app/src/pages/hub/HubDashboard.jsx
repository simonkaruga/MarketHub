import { useState, useEffect } from 'react';
import { FiPackage, FiCheckCircle, FiClock, FiCamera, FiSearch } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/formatters';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const HubDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // pending, ready, completed
  const [searchTerm, setSearchTerm] = useState('');
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [stats, setStats] = useState({
    pending_verification: 0,
    ready_for_pickup: 0,
    completed_today: 0,
    total_items: 0
  });

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();

      if (filter !== 'all') {
        params.append('status', filter);
      }

      const response = await axios.get(`${API_BASE_URL}/hub/orders?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/hub/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const dashboardData = response.data.data;
        setStats({
          pending_verification: dashboardData.statistics.pending_verification,
          ready_for_pickup: dashboardData.statistics.ready_for_pickup,
          completed_today: dashboardData.statistics.completed_today,
          total_items: dashboardData.statistics.pending_verification +
                      dashboardData.statistics.ready_for_pickup +
                      dashboardData.statistics.completed_today
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleVerifyOrder = async (orderId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/hub/orders/${orderId}/verify`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Order ${status === 'approved' ? 'approved' : 'rejected'}`);
      fetchOrders();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to verify order');
    }
  };

  const handleMarkPickedUp = async (orderId) => {
    if (!confirm('Mark this order as picked up by customer?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/hub/orders/${orderId}/pickup`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Order marked as picked up');
      fetchOrders();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark order as picked up');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      AT_HUB_VERIFICATION_PENDING: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending Verification' },
      QUALITY_CHECK_FAILED: { color: 'bg-red-100 text-red-800', text: 'Quality Check Failed' },
      APPROVED_FOR_DELIVERY: { color: 'bg-green-100 text-green-800', text: 'Ready for Pickup' },
      PICKED_UP: { color: 'bg-blue-100 text-blue-800', text: 'Picked Up' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };

    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' ||
      order.id.toString().includes(searchTerm) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.tracking_code?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Hub Operations Dashboard</h1>
            <p className="text-gray-600">Manage order verification and customer pickups</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FiClock className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Verification</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.pending_verification}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FiPackage className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Ready for Pickup</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.ready_for_pickup}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FiCheckCircle className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Completed Today</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.completed_today}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FiPackage className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Items</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.total_items}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by order ID, customer name, or tracking code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-4 py-2 rounded-lg ${
                    filter === 'pending'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilter('ready')}
                  className={`px-4 py-2 rounded-lg ${
                    filter === 'ready'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Ready
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`px-4 py-2 rounded-lg ${
                    filter === 'completed'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Completed
                </button>
              </div>

              {/* QR Scanner Button */}
              <button
                onClick={() => setShowQrScanner(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <FiCamera />
                Scan QR
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Products
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.customer_name}</div>
                          <div className="text-sm text-gray-500">{order.customer_phone}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {order.items?.map(item => item.product_name).join(', ') || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(order.total_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {order.status === 'AT_HUB_VERIFICATION_PENDING' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleVerifyOrder(order.id, 'approved')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleVerifyOrder(order.id, 'rejected')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {order.status === 'APPROVED_FOR_DELIVERY' && (
                            <button
                              onClick={() => handleMarkPickedUp(order.id)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              Mark Picked Up
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQrScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <FiCamera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">QR Code Scanner</h3>
              <p className="text-gray-600 mb-4">
                QR code scanning functionality will be integrated here. This will allow you to quickly verify orders by scanning the customer's QR code.
              </p>
              <button
                onClick={() => setShowQrScanner(false)}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HubDashboard;

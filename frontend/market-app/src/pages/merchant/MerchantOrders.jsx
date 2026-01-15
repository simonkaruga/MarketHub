import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import toast from 'react-hot-toast';
import axios from 'axios';
import { FiPackage, FiTruck, FiCheck, FiClock, FiEye } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MerchantOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/merchant/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus('');
    setShowStatusModal(true);
  };

  const closeStatusModal = () => {
    setShowStatusModal(false);
    setSelectedOrder(null);
    setNewStatus('');
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      toast.error('Please select a status');
      return;
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_BASE_URL}/merchant/orders/${selectedOrder.id}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success('Order status updated successfully!');
        closeStatusModal();
        fetchOrders();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusOptions = (currentStatus) => {
    const transitions = {
      'PAID_AWAITING_SHIPMENT': ['SHIPPED'],
      'SHIPPED': ['IN_TRANSIT'],
      'IN_TRANSIT': ['DELIVERED'],
      'PENDING_MERCHANT_DELIVERY': ['AT_HUB_VERIFICATION_PENDING']
    };

    return transitions[currentStatus] || [];
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING_PAYMENT: { color: 'bg-yellow-100 text-yellow-800', icon: FiClock },
      PAID_AWAITING_SHIPMENT: { color: 'bg-blue-100 text-blue-800', icon: FiPackage },
      PENDING_MERCHANT_DELIVERY: { color: 'bg-orange-100 text-orange-800', icon: FiPackage },
      SHIPPED: { color: 'bg-purple-100 text-purple-800', icon: FiTruck },
      IN_TRANSIT: { color: 'bg-indigo-100 text-indigo-800', icon: FiTruck },
      AT_HUB_VERIFICATION_PENDING: { color: 'bg-cyan-100 text-cyan-800', icon: FiClock },
      AT_HUB_READY_FOR_PICKUP: { color: 'bg-teal-100 text-teal-800', icon: FiCheck },
      DELIVERED: { color: 'bg-green-100 text-green-800', icon: FiCheck },
      CANCELLED: { color: 'bg-red-100 text-red-800', icon: FiCheck }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: FiClock };
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={12} />
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => {
        if (filter === 'pending') return ['PENDING_PAYMENT', 'PAID_AWAITING_SHIPMENT', 'PENDING_MERCHANT_DELIVERY'].includes(order.status);
        if (filter === 'active') return ['SHIPPED', 'IN_TRANSIT', 'AT_HUB_VERIFICATION_PENDING', 'AT_HUB_READY_FOR_PICKUP'].includes(order.status);
        if (filter === 'completed') return order.status === 'DELIVERED';
        return false;
      });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-1 container-custom py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Orders Management</h1>
          <p className="text-gray-600">Manage and fulfill your product orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
              <FiPackage className="text-primary-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Action</p>
                <p className="text-2xl font-bold">
                  {orders.filter(o => ['PAID_AWAITING_SHIPMENT', 'PENDING_MERCHANT_DELIVERY'].includes(o.status)).length}
                </p>
              </div>
              <FiClock className="text-yellow-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Transit</p>
                <p className="text-2xl font-bold">
                  {orders.filter(o => ['SHIPPED', 'IN_TRANSIT'].includes(o.status)).length}
                </p>
              </div>
              <FiTruck className="text-blue-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">
                  {orders.filter(o => o.status === 'DELIVERED').length}
                </p>
              </div>
              <FiCheck className="text-green-600" size={32} />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 border-b">
          {[
            { key: 'all', label: 'All Orders' },
            { key: 'pending', label: 'Pending' },
            { key: 'active', label: 'Active' },
            { key: 'completed', label: 'Completed' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 font-medium ${
                filter === key
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FiPackage className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">No orders found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {order.product?.name || 'Product'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Qty: {order.quantity}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.main_order?.user?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(order.subtotal)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {getStatusOptions(order.status).length > 0 && (
                          <button
                            onClick={() => openStatusModal(order)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            Update Status
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Update Status Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Update Order Status</h2>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Order #{selectedOrder.id}</p>
              <p className="font-medium mb-2">Current Status:</p>
              {getStatusBadge(selectedOrder.status)}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select new status...</option>
                {getStatusOptions(selectedOrder.status).map((status) => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeStatusModal}
                disabled={updating}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={updating || !newStatus}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MerchantOrders;

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPackage, FiTruck, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/formatters';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/admin/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setOrder(response.data.data);
    } catch (error) {
      toast.error('Failed to load order details');
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      toast.error('Please select a status');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_BASE_URL}/admin/orders/${id}/status`,
        { status: newStatus, note: statusNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Order status updated successfully');
      setShowStatusModal(false);
      setNewStatus('');
      setStatusNote('');
      fetchOrderDetail();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_BASE_URL}/admin/orders/${id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Order cancelled successfully');
      fetchOrderDetail();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING_PAYMENT: { color: 'bg-yellow-100 text-yellow-800', icon: FiClock, text: 'Pending Payment' },
      PAID_AWAITING_SHIPMENT: { color: 'bg-blue-100 text-blue-800', icon: FiPackage, text: 'Paid - Awaiting Shipment' },
      SHIPPED: { color: 'bg-purple-100 text-purple-800', icon: FiTruck, text: 'Shipped' },
      IN_TRANSIT: { color: 'bg-indigo-100 text-indigo-800', icon: FiTruck, text: 'In Transit' },
      DELIVERED: { color: 'bg-green-100 text-green-800', icon: FiCheckCircle, text: 'Delivered' },
      CANCELLED: { color: 'bg-red-100 text-red-800', icon: FiAlertCircle, text: 'Cancelled' },
      PENDING_MERCHANT_DELIVERY: { color: 'bg-orange-100 text-orange-800', icon: FiClock, text: 'Pending Merchant Delivery' },
      AT_HUB_VERIFICATION_PENDING: { color: 'bg-teal-100 text-teal-800', icon: FiPackage, text: 'At Hub - Verification Pending' },
      QUALITY_CHECK_FAILED: { color: 'bg-red-100 text-red-800', icon: FiAlertCircle, text: 'Quality Check Failed' },
      APPROVED_FOR_DELIVERY: { color: 'bg-green-100 text-green-800', icon: FiCheckCircle, text: 'Approved for Delivery' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: FiClock, text: status };
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${config.color}`}>
        <Icon size={16} />
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
          <Link to="/admin/orders" className="text-primary-600 hover:text-primary-700">
            Back to Orders
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/admin/orders')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <FiArrowLeft />
              Back to Orders
            </button>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Order #{order.id}</h1>
                <p className="text-gray-600">
                  Placed on {new Date(order.created_at).toLocaleDateString()} at{' '}
                  {new Date(order.created_at).toLocaleTimeString()}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {getStatusBadge(order.status)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Order Items</h2>
                <div className="space-y-4">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                      <img
                        src={item.product?.image_url || '/placeholder.png'}
                        alt={item.product?.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.product?.name}</h3>
                        <p className="text-sm text-gray-500">
                          Merchant: {item.merchant?.name || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Quantity: {item.quantity} × {formatCurrency(item.price_at_time)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(item.quantity * item.price_at_time)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{getStatusBadge(item.status)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium">{order.payment_method || 'M-Pesa'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-medium">{order.mpesa_receipt_number || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone Number:</span>
                    <span className="font-medium">{order.mpesa_phone_number || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
                <div className="space-y-2">
                  <p className="text-gray-900">{order.shipping_address?.full_name}</p>
                  <p className="text-gray-600">{order.shipping_address?.phone_number}</p>
                  <p className="text-gray-600">{order.shipping_address?.address_line1}</p>
                  {order.shipping_address?.address_line2 && (
                    <p className="text-gray-600">{order.shipping_address.address_line2}</p>
                  )}
                  <p className="text-gray-600">
                    {order.shipping_address?.city}, {order.shipping_address?.state_province}
                  </p>
                  <p className="text-gray-600">{order.shipping_address?.postal_code}</p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(order.total_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium">Free</span>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Total:</span>
                      <span className="font-bold text-primary-600">{formatCurrency(order.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Customer</h2>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">{order.customer?.name}</p>
                  <p className="text-gray-600">{order.customer?.email}</p>
                  <p className="text-gray-600">{order.customer?.phone_number}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Actions</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowStatusModal(true)}
                    className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Update Status
                  </button>
                  {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                    <button
                      onClick={handleCancelOrder}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Update Order Status</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select status...</option>
                  <option value="PENDING_PAYMENT">Pending Payment</option>
                  <option value="PAID_AWAITING_SHIPMENT">Paid - Awaiting Shipment</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="IN_TRANSIT">In Transit</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="PENDING_MERCHANT_DELIVERY">Pending Merchant Delivery</option>
                  <option value="AT_HUB_VERIFICATION_PENDING">At Hub - Verification Pending</option>
                  <option value="QUALITY_CHECK_FAILED">Quality Check Failed</option>
                  <option value="APPROVED_FOR_DELIVERY">Approved for Delivery</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note (Optional)
                </label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Add a note about this status change..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setNewStatus('');
                    setStatusNote('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStatus}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrderDetail;

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import OrderStatus from '../../components/order/OrderStatus';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const data = await orderService.getOrder(id);
      setOrder(data);
    } catch (error) {
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    setCancelling(true);
    try {
      await orderService.cancelOrder(id, cancelReason);
      toast.success('Order cancelled successfully');
      setCancelModalOpen(false);
      fetchOrder();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const canCancel = (status) => {
    return ['pending_payment', 'paid_awaiting_shipment', 'pending_merchant_delivery'].includes(status);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <Loading />
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container-custom py-8 flex-1 text-center">
          <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
          <Link to="/orders" className="text-primary-600 hover:text-primary-700">
            Back to Orders
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container-custom py-8 flex-1">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Order #{order.id}</h1>
            <p className="text-gray-600">Placed on {formatDateTime(order.created_at)}</p>
          </div>
          
          {order.suborders?.[0] && canCancel(order.suborders[0].status) && !order.is_cancelled && (
            <Button variant="danger" onClick={() => setCancelModalOpen(true)}>
              Cancel Order
            </Button>
          )}
        </div>

        {/* Order Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Order Items</h3>
              
              {order.suborders?.map((suborder) => (
                <div key={suborder.id} className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-semibold">From: {suborder.merchant?.name}</p>
                    <OrderStatus status={suborder.status} />
                  </div>
                  
                  <div className="space-y-3">
                    {suborder.items?.map((item) => (
                      <div key={item.id} className="flex gap-4 border-b pb-3">
                        <img
                          src={item.product?.image_url || '/placeholder.png'}
                          alt={item.product?.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.product?.name}</h4>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          <p className="text-primary-600 font-semibold">
                            {formatCurrency(item.price_at_purchase)}
                          </p>
                        </div>
                        <p className="font-bold">
                          {formatCurrency(item.price_at_purchase * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{formatCurrency(order.total_amount)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-lg font-bold text-primary-600">
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Payment</h3>
              <p className="text-gray-600 mb-2">Method</p>
              <p className="font-semibold mb-4">
                {order.payment_method === 'mpesa_delivery' ? 'M-Pesa' : 'Cash on Delivery'}
              </p>
              
              {order.mpesa_phone_number && (
                <>
                  <p className="text-gray-600 mb-2">Phone Number</p>
                  <p className="font-semibold">{order.mpesa_phone_number}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Order"
      >
        <p className="mb-4">Please provide a reason for cancelling this order:</p>
        <textarea
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          className="input-field min-h-[100px] mb-4"
          placeholder="e.g., Changed my mind, Found better price, etc."
        />
        <div className="flex gap-4">
          <Button onClick={() => setCancelModalOpen(false)} variant="secondary" className="flex-1">
            Keep Order
          </Button>
          <Button onClick={handleCancelOrder} variant="danger" disabled={cancelling} className="flex-1">
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </Button>
        </div>
      </Modal>

      <Footer />
    </div>
  );
};

export default OrderDetail;
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatters';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import ErrorMessage from '../../components/common/ErrorMessage';
import MpesaPaymentModal from '../../components/payment/MpesaPaymentModal';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mpesa_delivery');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [hubId, setHubId] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);

  useEffect(() => {
    if (!cart || cart.items?.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const orderData = {
        payment_method: paymentMethod
      };

      if (paymentMethod === 'mpesa_delivery') {
        if (!mpesaPhone) {
          setError('M-Pesa phone number is required');
          setLoading(false);
          return;
        }
        orderData.mpesa_phone_number = mpesaPhone;
      } else {
        if (!hubId) {
          setError('Please select a pickup hub');
          setLoading(false);
          return;
        }
        orderData.hub_id = parseInt(hubId);
      }

      const order = await orderService.createOrder(orderData);
      setCreatedOrderId(order.id);

      // If M-Pesa payment, show payment modal
      if (paymentMethod === 'mpesa_delivery') {
        setShowPaymentModal(true);
      } else {
        // For cash on delivery, just redirect
        await clearCart();
        toast.success('Order placed successfully!');
        navigate(`/orders/${order.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    await clearCart();
    toast.success('Payment successful! Order placed.');
    navigate(`/orders/${createdOrderId}`);
  };

  if (!cart || cart.items?.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container-custom py-8 flex-1">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
              {error && <ErrorMessage message={error} />}

              {/* Payment Method */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                
                <div className="space-y-3">
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="mpesa_delivery"
                      checked={paymentMethod === 'mpesa_delivery'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-semibold">M-Pesa Payment</p>
                      <p className="text-sm text-gray-600">Pay now with M-Pesa STK Push</p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="cash_on_delivery"
                      checked={paymentMethod === 'cash_on_delivery'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-semibold">Cash on Delivery</p>
                      <p className="text-sm text-gray-600">Pay when you pick up at hub</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* M-Pesa Phone */}
              {paymentMethod === 'mpesa_delivery' && (
                <div className="mb-6">
                  <Input
                    label="M-Pesa Phone Number"
                    type="tel"
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value)}
                    placeholder="254712345678"
                    required
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    You will receive an STK push to complete payment
                  </p>
                </div>
              )}

              {/* Hub Selection */}
              {paymentMethod === 'cash_on_delivery' && (
                <div className="mb-6">
                  <label className="label">Select Pickup Hub *</label>
                  <select
                    value={hubId}
                    onChange={(e) => setHubId(e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">Select a hub</option>
                    <option value="1">Nairobi Hub - CBD</option>
                    <option value="2">Westlands Hub</option>
                    <option value="3">Thika Road Hub</option>
                  </select>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading ? 'Processing...' : 'Place Order'}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-20">
              <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.product.name} x {item.quantity}
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{formatCurrency(cart.total)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary-600">{formatCurrency(cart.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* M-Pesa Payment Modal */}
      <MpesaPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        orderId={createdOrderId}
        amount={cart?.total || 0}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default Checkout;
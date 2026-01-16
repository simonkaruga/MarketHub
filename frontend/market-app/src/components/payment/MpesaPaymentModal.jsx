import { useState, useEffect } from 'react';
import { FiX, FiCheckCircle, FiLoader, FiAlertCircle, FiSmartphone } from 'react-icons/fi';
import { paymentService } from '../../services/paymentService';
import toast from 'react-hot-toast';

const MpesaPaymentModal = ({ isOpen, onClose, orderId, amount, onSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, pending, success, failed
  const [checkoutRequestId, setCheckoutRequestId] = useState(null);
  const [statusCheckInterval, setStatusCheckInterval] = useState(null);

  useEffect(() => {
    // Clear interval on unmount
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [statusCheckInterval]);

  const formatPhoneNumber = (phone) => {
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // If starts with 0, replace with 254
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    }

    // If doesn't start with 254, add it
    if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }

    return cleaned;
  };

  const handleInitiatePayment = async () => {
    if (!phoneNumber) {
      toast.error('Please enter your phone number');
      return;
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);

    if (formattedPhone.length !== 12) {
      toast.error('Please enter a valid Kenyan phone number');
      return;
    }

    setLoading(true);
    setPaymentStatus('pending');

    try {
      const response = await paymentService.initiateStkPush(orderId, formattedPhone);

      if (response.success) {
        setCheckoutRequestId(response.data.checkout_request_id);
        toast.success('Payment request sent! Please check your phone.');

        // Start polling for payment status
        const interval = setInterval(async () => {
          try {
            const statusResponse = await paymentService.checkPaymentStatus(orderId);

            if (statusResponse.data.status === 'COMPLETED') {
              clearInterval(interval);
              setPaymentStatus('success');
              toast.success('Payment successful!');
              setTimeout(() => {
                onSuccess();
                onClose();
              }, 2000);
            } else if (statusResponse.data.status === 'FAILED' || statusResponse.data.status === 'CANCELLED') {
              clearInterval(interval);
              setPaymentStatus('failed');
              toast.error('Payment failed. Please try again.');
            }
          } catch (error) {
            console.error('Error checking payment status:', error);
          }
        }, 3000); // Check every 3 seconds

        setStatusCheckInterval(interval);

        // Stop checking after 2 minutes
        setTimeout(() => {
          clearInterval(interval);
          if (paymentStatus === 'pending') {
            setPaymentStatus('failed');
            toast.error('Payment timeout. Please try again.');
          }
        }, 120000);
      } else {
        setPaymentStatus('failed');
        toast.error(response.message || 'Failed to initiate payment');
      }
    } catch (error) {
      setPaymentStatus('failed');
      toast.error(error.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval);
    }
    setPaymentStatus('idle');
    setPhoneNumber('');
    setCheckoutRequestId(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">M-Pesa Payment</h3>
            <p className="text-sm text-gray-500 mt-1">Amount: KES {amount.toLocaleString()}</p>
          </div>
          <button
            onClick={handleClose}
            disabled={paymentStatus === 'pending'}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content based on status */}
        {paymentStatus === 'idle' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                M-Pesa Phone Number
              </label>
              <div className="relative">
                <FiSmartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0712345678 or 254712345678"
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter the phone number registered with M-Pesa
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>How it works:</strong>
              </p>
              <ol className="text-sm text-blue-700 mt-2 space-y-1 list-decimal list-inside">
                <li>Enter your M-Pesa phone number</li>
                <li>Click "Pay with M-Pesa"</li>
                <li>Check your phone for the M-Pesa prompt</li>
                <li>Enter your M-Pesa PIN to complete payment</li>
              </ol>
            </div>

            <button
              onClick={handleInitiatePayment}
              disabled={loading || !phoneNumber}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Initiating Payment...' : 'Pay with M-Pesa'}
            </button>
          </div>
        )}

        {paymentStatus === 'pending' && (
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <div className="animate-spin">
                <FiLoader size={48} className="text-primary-600" />
              </div>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Waiting for Payment...
            </h4>
            <p className="text-gray-600 mb-4">
              Please check your phone and enter your M-Pesa PIN
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                A payment prompt has been sent to <strong>{phoneNumber}</strong>
              </p>
            </div>
          </div>
        )}

        {paymentStatus === 'success' && (
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <FiCheckCircle size={64} className="text-green-500" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Payment Successful!
            </h4>
            <p className="text-gray-600">
              Your payment has been processed successfully.
            </p>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <FiAlertCircle size={64} className="text-red-500" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Payment Failed
            </h4>
            <p className="text-gray-600 mb-4">
              Your payment could not be processed. Please try again.
            </p>
            <button
              onClick={() => {
                setPaymentStatus('idle');
                setCheckoutRequestId(null);
              }}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Cancel button for idle state */}
        {paymentStatus === 'idle' && (
          <button
            onClick={handleClose}
            className="w-full mt-3 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default MpesaPaymentModal;

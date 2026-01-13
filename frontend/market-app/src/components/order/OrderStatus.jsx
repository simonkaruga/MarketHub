import { ORDER_STATUS_LABELS } from '../../utils/constants';

const OrderStatus = ({ status }) => {
  const getStatusColor = (status) => {
    const colors = {
      pending_payment: 'bg-yellow-100 text-yellow-800',
      paid_awaiting_shipment: 'bg-blue-100 text-blue-800',
      pending_merchant_delivery: 'bg-orange-100 text-orange-800',
      shipped: 'bg-purple-100 text-purple-800',
      in_transit: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      at_hub_verification_pending: 'bg-yellow-100 text-yellow-800',
      at_hub_ready_for_pickup: 'bg-green-100 text-green-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
      {ORDER_STATUS_LABELS[status] || status}
    </span>
  );
};

export default OrderStatus;
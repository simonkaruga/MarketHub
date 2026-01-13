import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../utils/formatters';
import OrderStatus from './OrderStatus';

const OrderCard = ({ order }) => {
  return (
    <Link to={`/orders/${order.id}`}>
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg">Order #{order.id}</h3>
            <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
          </div>
          <OrderStatus status={order.suborders?.[0]?.status} />
        </div>

        {/* Items */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {order.suborders?.[0]?.items?.length || 0} item(s)
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div>
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-xl font-bold text-primary-600">
              {formatCurrency(order.total_amount)}
            </p>
          </div>
          
          <div className="text-sm">
            <span className="text-gray-600">Payment: </span>
            <span className="font-semibold">
              {order.payment_method === 'mpesa_delivery' ? 'M-Pesa' : 'Cash on Delivery'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default OrderCard;
import { useEffect, useState } from 'react';
import { orderService } from '../../services/orderService';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import OrderCard from '../../components/order/OrderCard';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (err) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container-custom py-8 flex-1">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No orders yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Orders;
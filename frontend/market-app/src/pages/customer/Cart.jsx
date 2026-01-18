import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CartItem from '../../components/cart/CartItem';
import CartSummary from '../../components/cart/CartSummary';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';

const Cart = () => {
  const { cart, loading } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout');
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container-custom py-8 flex-1">
        <h1 className="text-3xl font-bold mb-8 text-white">Shopping Cart</h1>

        {!cart || cart.items?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-300 text-lg mb-6">Your cart is empty</p>
            <Button onClick={() => navigate('/products')}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            {/* Summary */}
            <div>
              <CartSummary cart={cart} onCheckout={handleCheckout} />
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Cart;

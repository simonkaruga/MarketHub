import { formatCurrency } from '../../utils/formatters';
import Button from '../common/Button';

const CartSummary = ({ cart, onCheckout }) => {
  if (!cart) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md sticky top-20">
      <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
      
      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-semibold">{formatCurrency(cart.total)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Delivery</span>
          <span className="font-semibold">Calculated at checkout</span>
        </div>
        
        <div className="border-t pt-3 flex justify-between">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-lg font-bold text-primary-600">
            {formatCurrency(cart.total)}
          </span>
        </div>
      </div>

      <Button
        onClick={onCheckout}
        className="w-full"
        size="lg"
      >
        Proceed to Checkout
      </Button>

      <p className="text-xs text-gray-500 text-center mt-4">
        Taxes and shipping calculated at checkout
      </p>
    </div>
  );
};

export default CartSummary;
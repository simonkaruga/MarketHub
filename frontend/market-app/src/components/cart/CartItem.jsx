import { FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatters';
import { useCart } from '../../hooks/useCart';

const CartItem = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;
    if (newQuantity > item.product.stock_quantity) {
      return;
    }
    await updateQuantity(item.id, newQuantity);
  };

  const handleRemove = async () => {
    await removeItem(item.id);
  };

  return (
    <div className="flex gap-4 bg-white p-4 rounded-lg shadow-md">
      {/* Image */}
      <img
        src={item.product.image_url || '/placeholder.png'}
        alt={item.product.name}
        className="w-24 h-24 object-cover rounded-lg"
      />

      {/* Details */}
      <div className="flex-1">
        <h3 className="font-semibold text-lg">{item.product.name}</h3>
        <p className="text-gray-600 text-sm mt-1">
          by {item.product.merchant?.name}
        </p>
        <p className="text-primary-600 font-semibold mt-2">
          {formatCurrency(item.product.price)}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex flex-col items-end justify-between">
        <button
          onClick={handleRemove}
          className="text-red-600 hover:text-red-700"
          title="Remove item"
        >
          <FiTrash2 size={20} />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="p-1 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
          >
            <FiMinus size={16} />
          </button>
          
          <span className="w-12 text-center font-semibold">
            {item.quantity}
          </span>
          
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={item.quantity >= item.product.stock_quantity}
            className="p-1 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
          >
            <FiPlus size={16} />
          </button>
        </div>

        <p className="font-bold text-lg">
          {formatCurrency(item.product.price * item.quantity)}
        </p>
      </div>
    </div>
  );
};

export default CartItem;
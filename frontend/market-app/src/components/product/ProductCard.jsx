import { Link } from 'react-router-dom';
import { FiShoppingCart, FiStar } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatters';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      await addToCart(product.id, 1);
    } catch (error) {
      // Error handled in context
    }
  };

  return (
    <Link to={`/products/${product.id}`} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
        {/* Image */}
        <div className="relative h-64 bg-gray-200 overflow-hidden">
          <img
            src={product.image_url || '/placeholder.png'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          
          {product.stock_quantity === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
                Out of Stock
              </span>
            </div>
          )}
          
          {product.stock_quantity > 0 && product.stock_quantity < 10 && (
            <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
              Only {product.stock_quantity} left
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">
            {product.name}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>

          {/* Rating */}
          {product.average_rating > 0 && (
            <div className="flex items-center mb-3">
              <FiStar className="text-yellow-400 fill-current" size={16} />
              <span className="ml-1 text-sm text-gray-600">
                {product.average_rating.toFixed(1)} ({product.review_count})
              </span>
            </div>
          )}

          {/* Price and Actions */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-primary-600">
                {formatCurrency(product.price)}
              </span>
            </div>
            
            {product.stock_quantity > 0 && (
              <button
                onClick={handleAddToCart}
                className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 transition-colors"
                title="Add to cart"
              >
                <FiShoppingCart size={20} />
              </button>
            )}
          </div>

          {/* Merchant */}
          <div className="mt-3 text-xs text-gray-500">
            by {product.merchant?.name || 'MarketHub'}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;



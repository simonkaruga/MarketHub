import { Link } from 'react-router-dom';
import { FiShoppingCart, FiStar, FiHeart, FiTrendingUp, FiAward, FiShield } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatters';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated, isCustomer } = useAuth();

  // Enhanced placeholder for broken images
  const BLUE_PLACEHOLDER = 'https://placehold.co/800x800/5B7EE5/white/png?text=Premium+Product';

  const handleAddToCart = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (!isCustomer) {
      toast.error('Only customers can add items to cart');
      return;
    }

    try {
      await addToCart(product.id, 1);
    } catch (error) {
      // Error handled in context
    }
  };

  const handleImageError = (e) => {
    e.target.src = BLUE_PLACEHOLDER;
  };

  return (
    <div className="group relative">
      {/* Premium Card Container */}
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-primary-200 overflow-hidden transform hover:-translate-y-2">

        {/* Premium Badge */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            <FiAward size={12} />
            Premium
          </div>
        </div>

        {/* Stock Status Badges */}
        {product.stock_quantity === 0 && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-black/60 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="bg-red-500 text-white px-6 py-3 rounded-2xl font-bold text-lg shadow-2xl border-2 border-white/20">
              Out of Stock
            </div>
          </div>
        )}

        {product.stock_quantity > 0 && product.stock_quantity < 10 && (
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
              Only {product.stock_quantity} left
            </div>
          </div>
        )}

        {/* Image Container */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          <img
            src={product.image_url || BLUE_PLACEHOLDER}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            onError={handleImageError}
          />

          {/* Overlay gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Quick actions overlay */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <button className="bg-white/90 backdrop-blur-sm text-gray-700 p-2 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-200">
              <FiHeart size={16} />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-4">

          {/* Title */}
          <div>
            <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-700 transition-colors duration-200 leading-tight">
              {product.name}
            </h3>

            {/* Merchant badge */}
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <FiShield size={12} />
                {product.merchant?.name || 'MarketHub'}
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
            {product.description}
          </p>

          {/* Rating */}
          {product.average_rating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <FiStar className="text-yellow-400 fill-current" size={16} />
                <span className="font-semibold text-gray-900">
                  {product.average_rating.toFixed(1)}
                </span>
              </div>
              <span className="text-gray-500 text-sm">
                ({product.review_count} reviews)
              </span>
              <div className="ml-auto flex items-center gap-1 text-green-600 text-xs font-medium">
                <FiTrendingUp size={12} />
                Trending
              </div>
            </div>
          )}

          {/* Price Section */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex flex-col">
              <span className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                {formatCurrency(product.price)}
              </span>
              <span className="text-xs text-gray-500 font-medium">Free shipping</span>
            </div>

            {/* Add to Cart Button */}
            {product.stock_quantity > 0 && (
              <button
                onClick={handleAddToCart}
                className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white p-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group/btn"
                title="Add to cart"
              >
                <FiShoppingCart size={20} className="group-hover/btn:rotate-12 transition-transform duration-200" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom accent */}
        <div className="h-1 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      </div>
    </div>
  );
};

export default ProductCard;

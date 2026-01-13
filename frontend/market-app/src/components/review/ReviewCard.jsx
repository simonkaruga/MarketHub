import { FiThumbsUp } from 'react-icons/fi';
import { formatRelativeTime } from '../../utils/formatters';
import StarRating from './StarRating';

const ReviewCard = ({ review, onMarkHelpful }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold">{review.customer?.name}</span>
            {review.verified_purchase && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
                Verified Purchase
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">{formatRelativeTime(review.created_at)}</p>
        </div>
        <StarRating rating={review.rating} readonly />
      </div>

      {/* Title */}
      {review.title && (
        <h4 className="font-semibold mb-2">{review.title}</h4>
      )}

      {/* Comment */}
      <p className="text-gray-700 mb-4">{review.comment}</p>

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mb-4">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Review ${index + 1}`}
              className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80"
            />
          ))}
        </div>
      )}

      {/* Merchant Reply */}
      {review.merchant_reply && (
        <div className="bg-gray-50 p-4 rounded-lg mt-4">
          <p className="text-sm font-semibold text-gray-700 mb-1">Merchant Response:</p>
          <p className="text-sm text-gray-600">{review.merchant_reply}</p>
        </div>
      )}

      {/* Helpful Button */}
      <button
        onClick={() => onMarkHelpful && onMarkHelpful(review.id)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 mt-4"
      >
        <FiThumbsUp size={16} />
        <span>Helpful ({review.helpful_count || 0})</span>
      </button>
    </div>
  );
};

export default ReviewCard;
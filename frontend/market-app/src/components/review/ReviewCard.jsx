import { FiStar, FiThumbsUp, FiFlag } from 'react-icons/fi';
import { formatDateTime, formatRelativeTime } from '../../utils/formatters';
import Button from '../common/Button';

const ReviewCard = ({ review, onMarkHelpful, showActions = true }) => {
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FiStar
        key={i}
        className={`inline ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        size={16}
      />
    ));
  };

  const handleMarkHelpful = () => {
    if (onMarkHelpful) {
      onMarkHelpful(review.id);
    }
  };

  const handleReport = () => {
    // TODO: Implement report functionality
    console.log('Report review:', review.id);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-semibold text-sm">
              {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{review.user?.name || 'Anonymous'}</h4>
            <div className="flex items-center gap-2">
              <div className="flex">
                {renderStars(review.rating)}
              </div>
              <span className="text-sm text-gray-600">
                {formatRelativeTime(review.created_at)}
              </span>
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkHelpful}
              className="flex items-center gap-1"
            >
              <FiThumbsUp size={14} />
              Helpful ({review.helpful_count || 0})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReport}
              className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
            >
              <FiFlag size={14} />
              Report
            </Button>
          </div>
        )}
      </div>

      {/* Review Content */}
      <div className="mb-4">
        {review.title && (
          <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
        )}
        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
      </div>

      {/* Review Images */}
      {review.images && review.images.length > 0 && (
        <div className="mb-4">
          <div className="flex gap-2 overflow-x-auto">
            {review.images.map((image, index) => (
              <img
                key={index}
                src={image.url}
                alt={`Review image ${index + 1}`}
                className="w-20 h-20 object-cover rounded-lg border border-gray-200 flex-shrink-0"
              />
            ))}
          </div>
        </div>
      )}

      {/* Review Meta */}
      <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-3">
        <div className="flex items-center gap-4">
          {review.verified_purchase && (
            <span className="flex items-center gap-1 text-green-600">
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              Verified Purchase
            </span>
          )}
          {review.helpful_count > 0 && (
            <span>{review.helpful_count} people found this helpful</span>
          )}
        </div>

        {review.updated_at && review.updated_at !== review.created_at && (
          <span>Edited {formatDateTime(review.updated_at)}</span>
        )}
      </div>

      {/* Merchant Response */}
      {review.merchant_response && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-xs">M</span>
            </div>
            <div>
              <span className="font-medium text-blue-900">Merchant Response</span>
              <span className="text-sm text-blue-600 ml-2">
                {formatRelativeTime(review.merchant_response.created_at)}
              </span>
            </div>
          </div>
          <p className="text-blue-800">{review.merchant_response.comment}</p>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;

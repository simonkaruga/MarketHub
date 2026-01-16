import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import axios from 'axios';
import { FiStar, FiEdit2, FiTrash2 } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ProductReviews = ({ productId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: ''
  });
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/products/${productId}/reviews`);

      if (response.data.success) {
        setReviews(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to submit a review');
      return;
    }

    if (formData.comment.length < 10) {
      toast.error('Review comment must be at least 10 characters');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const reviewFormData = new FormData();

      reviewFormData.append('product_id', productId);
      reviewFormData.append('rating', formData.rating);
      if (formData.title) reviewFormData.append('title', formData.title);
      reviewFormData.append('comment', formData.comment);

      // Add images
      images.forEach((image) => {
        reviewFormData.append('images', image);
      });

      const url = editingReview
        ? `${API_BASE_URL}/reviews/${editingReview.id}`
        : `${API_BASE_URL}/reviews`;

      const method = editingReview ? 'put' : 'post';

      const response = await axios[method](url, reviewFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success(editingReview ? 'Review updated!' : 'Review submitted successfully!');
        setShowReviewForm(false);
        setEditingReview(null);
        setFormData({ rating: 5, title: '', comment: '' });
        setImages([]);
        fetchReviews();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setFormData({
      rating: review.rating,
      title: review.title || '',
      comment: review.comment
    });
    setShowReviewForm(true);
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_BASE_URL}/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Review deleted');
        fetchReviews();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete review');
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      toast.error('Maximum 3 images allowed');
      return;
    }
    setImages(files);
  };

  const renderStars = (rating, interactive = false, onChange = null) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            size={interactive ? 24 : 16}
            className={`${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:fill-yellow-300 hover:text-yellow-300' : ''}`}
            onClick={() => interactive && onChange && onChange(star)}
          />
        ))}
      </div>
    );
  };

  const getAverageRating = () => {
    if (!Array.isArray(reviews) || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingBreakdown = () => {
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (Array.isArray(reviews)) {
      reviews.forEach((review) => {
        breakdown[review.rating]++;
      });
    }
    return breakdown;
  };

  const userHasReviewed = Array.isArray(reviews) && reviews.some(review => review.customer?.id === user?.id);

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

      {/* Review Summary */}
      {Array.isArray(reviews) && reviews.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold">{getAverageRating()}</div>
              <div className="mt-2">{renderStars(Math.round(getAverageRating()))}</div>
              <div className="text-sm text-gray-600 mt-1">
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </div>
            </div>

            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = getRatingBreakdown()[rating];
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-2 mb-2">
                    <span className="text-sm w-8">{rating} ★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Write Review Button */}
      {user && !userHasReviewed && !showReviewForm && (
        <button
          onClick={() => setShowReviewForm(true)}
          className="mb-6 px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium"
        >
          Write a Review
        </button>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-white border-2 border-primary-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingReview ? 'Edit Your Review' : 'Write a Review'}
          </h3>
          <form onSubmit={handleSubmitReview}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating <span className="text-red-500">*</span>
              </label>
              {renderStars(formData.rating, true, (rating) =>
                setFormData({ ...formData, rating })
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Title (Optional)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Summary of your review"
                maxLength={200}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Tell us about your experience with this product (minimum 10 characters)..."
                required
                minLength={10}
                maxLength={2000}
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.comment.length}/2000 characters (minimum 10)
              </p>
            </div>

            {!editingReview && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Photos (Optional, max 3)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {images.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {images.length} image(s) selected
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowReviewForm(false);
                  setEditingReview(null);
                  setFormData({ rating: 5, title: '', comment: '' });
                  setImages([]);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || formData.comment.length < 10}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 font-medium"
              >
                {submitting ? 'Submitting...' : editingReview ? 'Update Review' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : !Array.isArray(reviews) || reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.isArray(reviews) && reviews.map((review) => (
            <div key={review.id} className="border-b pb-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {renderStars(review.rating)}
                    {review.verified_purchase && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  {review.title && (
                    <h4 className="font-semibold text-gray-900">{review.title}</h4>
                  )}
                </div>

                {user?.id === review.customer?.id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(review)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Edit review"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete review"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-2">
                By {review.customer?.name || 'Anonymous'} •{' '}
                {new Date(review.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>

              <p className="text-gray-700 whitespace-pre-wrap">{review.comment}</p>

              {review.image_urls && review.image_urls.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {review.image_urls.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Review image ${idx + 1}`}
                      className="w-20 h-20 object-cover rounded-md cursor-pointer hover:opacity-75"
                      onClick={() => window.open(url, '_blank')}
                    />
                  ))}
                </div>
              )}

              {review.merchant_response && (
                <div className="mt-4 ml-6 bg-gray-50 p-4 rounded-md">
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    Response from Merchant
                  </p>
                  <p className="text-sm text-gray-700">{review.merchant_response}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(review.merchant_response_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;

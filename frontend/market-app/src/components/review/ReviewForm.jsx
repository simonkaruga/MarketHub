import { useState } from 'react';
import StarRating from './StarRating';
import Button from '../common/Button';
import Input from '../common/Input';

const ReviewForm = ({ onSubmit, loading }) => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      alert('Maximum 3 images allowed');
      return;
    }
    setImages(files);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      alert('Please write a review');
      return;
    }

    onSubmit({
      rating,
      title,
      comment,
      images
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Write a Review</h3>

      {/* Rating */}
      <div className="mb-4">
        <label className="label">Your Rating *</label>
        <StarRating rating={rating} onChange={setRating} size={32} />
      </div>

      {/* Title */}
      <Input
        label="Review Title (Optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Summarize your experience..."
        maxLength={100}
      />

      {/* Comment */}
      <div className="mb-4">
        <label className="label">Your Review *</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this product..."
          className="input-field min-h-[120px]"
          maxLength={500}
          required
        />
        <p className="text-xs text-gray-500 mt-1">{comment.length}/500</p>
      </div>

      {/* Images */}
      <div className="mb-6">
        <label className="label">Add Photos (Optional - Max 3)</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
};

export default ReviewForm;
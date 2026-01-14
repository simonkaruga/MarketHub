import { FiStar } from 'react-icons/fi';

const StarRating = ({ rating, readonly = false, onChange, size = 20 }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex gap-1">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange && onChange(star)}
          disabled={readonly}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        >
          <FiStar
            size={size}
            className={star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
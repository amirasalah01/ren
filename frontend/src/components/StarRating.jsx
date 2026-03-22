import React from 'react';
import './StarRating.css';

const StarRating = ({ rating, size = 'medium', interactive = false, onRatingChange }) => {
  const stars = [1, 2, 3, 4, 5];

  const handleClick = (value) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  const getStarClass = (index) => {
    const value = index + 1;
    if (rating >= value) {
      return 'star filled';
    } else if (rating >= value - 0.5) {
      return 'star half';
    }
    return 'star empty';
  };

  return (
    <div className={`star-rating ${size} ${interactive ? 'interactive' : ''}`}>
      {stars.map((star, index) => (
        <span
          key={index}
          className={getStarClass(index)}
          onClick={() => handleClick(star)}
          role={interactive ? 'button' : undefined}
          tabIndex={interactive ? 0 : undefined}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;

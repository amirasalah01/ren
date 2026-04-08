import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addFavorite, removeFavorite } from '../api/properties';
import StarRating from './StarRating';
import './PropertyCard.css';

const PropertyCard = ({ property, onFavoriteChange }) => {
  const { isAuthenticated } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && property.is_favorite !== undefined) {
      setIsFavorited(property.is_favorite);
      setFavoriteId(property.favorite_id);
    }
  }, [property, isAuthenticated]);

  const handleFavoriteToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      alert('Please login to add favorites');
      return;
    }

    setLoading(true);
    try {
      if (isFavorited && favoriteId) {
        await removeFavorite(favoriteId);
        setIsFavorited(false);
        setFavoriteId(null);
      } else {
        const response = await addFavorite(property.id);
        setIsFavorited(true);
        setFavoriteId(response.id);
      }
      if (onFavoriteChange) {
        onFavoriteChange();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Error updating favorite status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="property-card">
      <div className="property-card-image">
        <div className="property-image-placeholder">
          <span className="property-image-icon">🏠</span>
        </div>
        {isAuthenticated && (
          <button
            className={`favorite-btn ${isFavorited ? 'favorited' : ''}`}
            onClick={handleFavoriteToggle}
            disabled={loading}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorited ? '❤️' : '🤍'}
          </button>
        )}
        <span className="property-type-badge">{property.property_type}</span>
      </div>

      <div className="property-card-content">
        <h3 className="property-card-title">{property.title}</h3>
        <p className="property-card-location">
          📍 {property.city}, {property.country}
        </p>

        <div className="property-card-details">
          <span className="property-detail">
            🛏️ {property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}
          </span>
          <span className="property-detail">
            🚿 {property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}
          </span>
          {property.square_feet && (
            <span className="property-detail">📐 {property.square_feet} sq ft</span>
          )}
        </div>

        <div className="property-card-footer">
          <div className="property-price">
            <span className="price-amount">${property.price_per_month}</span>
            <span className="price-period">/month</span>
          </div>
          {property.average_rating !== undefined && (
            <div className="property-rating">
              <StarRating rating={property.average_rating} size="small" />
              <span className="rating-text">({property.review_count || 0})</span>
            </div>
          )}
        </div>

        <Link to={`/property/${property.id}`} className="property-card-link">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default PropertyCard;

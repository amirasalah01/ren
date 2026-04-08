import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getProperty,
  getPropertyReviews,
  createReview,
  addFavorite,
  removeFavorite,
} from '../api/properties';
import { sendMessage } from '../api/messages';
import StarRating from '../components/StarRating';
import './PropertyDetail.css';

const PropertyDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);

  const [showMessageForm, setShowMessageForm] = useState(false);
  const [messageData, setMessageData] = useState({ subject: '', body: '' });
  const [sendingMessage, setSendingMessage] = useState(false);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchPropertyDetails();
    fetchReviews();
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      const data = await getProperty(id);
      setProperty(data);
      setIsFavorited(data.is_favorite || false);
      setFavoriteId(data.favorite_id);
    } catch (err) {
      console.error('Error fetching property:', err);
      setError('Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const data = await getPropertyReviews(id);
      setReviews(data.results || data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      alert('Please login to add favorites');
      navigate('/login');
      return;
    }

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
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Error updating favorite status');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please login to send messages');
      navigate('/login');
      return;
    }

    setSendingMessage(true);
    try {
      await sendMessage({
        receiver: property.owner.id,
        subject: messageData.subject || `Inquiry about ${property.title}`,
        body: messageData.body,
        property: property.id,
      });
      alert('Message sent successfully!');
      setShowMessageForm(false);
      setMessageData({ subject: '', body: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please login to submit a review');
      navigate('/login');
      return;
    }

    setSubmittingReview(true);
    try {
      await createReview(id, reviewData);
      alert('Review submitted successfully!');
      setShowReviewForm(false);
      setReviewData({ rating: 5, title: '', comment: '' });
      fetchReviews();
      fetchPropertyDetails();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading property details...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error || 'Property not found'}</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Back to Home
        </button>
      </div>
    );
  }

  const isOwner = user && property.owner && user.id === property.owner.id;

  return (
    <div className="property-detail-page">
      <div className="property-detail-container">
        <div className="property-header">
          <div className="property-header-image">
            <div className="property-image-placeholder">
              <span className="property-image-icon">🏠</span>
            </div>
          </div>

          <div className="property-header-content">
            <div className="property-title-row">
              <h1>{property.title}</h1>
              {isAuthenticated && !isOwner && (
                <button
                  onClick={handleFavoriteToggle}
                  className={`favorite-btn-large ${isFavorited ? 'favorited' : ''}`}
                >
                  {isFavorited ? '❤️ Saved' : '🤍 Save'}
                </button>
              )}
            </div>

            <p className="property-location">
              📍 {property.address}, {property.city}, {property.country}
            </p>

            <div className="property-meta">
              <span className="property-type-badge">{property.property_type}</span>
              <span className={`availability-badge ${property.is_available ? 'available' : ''}`}>
                {property.is_available ? 'Available' : 'Not Available'}
              </span>
            </div>

            <div className="property-stats">
              <div className="stat">
                <span className="stat-icon">🛏️</span>
                <span className="stat-value">{property.bedrooms}</span>
                <span className="stat-label">Bedrooms</span>
              </div>
              <div className="stat">
                <span className="stat-icon">🚿</span>
                <span className="stat-value">{property.bathrooms}</span>
                <span className="stat-label">Bathrooms</span>
              </div>
              {property.square_feet && (
                <div className="stat">
                  <span className="stat-icon">📐</span>
                  <span className="stat-value">{property.square_feet}</span>
                  <span className="stat-label">Sq Ft</span>
                </div>
              )}
              <div className="stat">
                <span className="stat-icon">👁️</span>
                <span className="stat-value">{property.view_count || 0}</span>
                <span className="stat-label">Views</span>
              </div>
            </div>

            <div className="property-price-section">
              <div className="price-large">
                <span className="price-amount">${property.price_per_month}</span>
                <span className="price-period">/month</span>
              </div>
              {property.available_from && (
                <p className="available-from">
                  Available from: {new Date(property.available_from).toLocaleDateString()}
                </p>
              )}
            </div>

            {!isOwner && isAuthenticated && (
              <button
                onClick={() => setShowMessageForm(!showMessageForm)}
                className="contact-owner-btn"
              >
                📧 Contact Owner
              </button>
            )}
          </div>
        </div>

        {showMessageForm && (
          <div className="message-form-section">
            <h3>Send Message to Owner</h3>
            <form onSubmit={handleSendMessage} className="message-form">
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  value={messageData.subject}
                  onChange={(e) => setMessageData({ ...messageData, subject: e.target.value })}
                  placeholder={`Inquiry about ${property.title}`}
                />
              </div>
              <div className="form-group">
                <label htmlFor="body">Message</label>
                <textarea
                  id="body"
                  value={messageData.body}
                  onChange={(e) => setMessageData({ ...messageData, body: e.target.value })}
                  required
                  rows="5"
                  placeholder="Write your message here..."
                />
              </div>
              <div className="form-actions">
                <button type="submit" disabled={sendingMessage} className="btn-primary">
                  {sendingMessage ? 'Sending...' : 'Send Message'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMessageForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="property-description">
          <h2>Description</h2>
          <p>{property.description}</p>
        </div>

        <div className="property-owner-info">
          <h3>Property Owner</h3>
          <p>
            <strong>
              {property.owner?.first_name} {property.owner?.last_name}
            </strong>
          </p>
          {property.owner?.email && <p>Email: {property.owner.email}</p>}
          {property.owner?.phone && <p>Phone: {property.owner.phone}</p>}
        </div>

        <div className="reviews-section">
          <div className="reviews-header">
            <h2>Reviews</h2>
            {property.average_rating !== undefined && (
              <div className="average-rating">
                <StarRating rating={property.average_rating} size="large" />
                <span className="rating-value">{property.average_rating.toFixed(1)}</span>
                <span className="review-count">({reviews.length} reviews)</span>
              </div>
            )}
          </div>

          {!isOwner && isAuthenticated && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="add-review-btn"
            >
              ✍️ Write a Review
            </button>
          )}

          {showReviewForm && (
            <div className="review-form-section">
              <h3>Write Your Review</h3>
              <form onSubmit={handleSubmitReview} className="review-form">
                <div className="form-group">
                  <label>Rating</label>
                  <StarRating
                    rating={reviewData.rating}
                    size="large"
                    interactive={true}
                    onRatingChange={(rating) => setReviewData({ ...reviewData, rating })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input
                    type="text"
                    id="title"
                    value={reviewData.title}
                    onChange={(e) => setReviewData({ ...reviewData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="comment">Review</label>
                  <textarea
                    id="comment"
                    value={reviewData.comment}
                    onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                    required
                    rows="5"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" disabled={submittingReview} className="btn-primary">
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p className="no-reviews">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div>
                      <strong>
                        {review.reviewer?.first_name} {review.reviewer?.last_name}
                      </strong>
                      <StarRating rating={review.rating} size="small" />
                    </div>
                    <span className="review-date">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="review-title">{review.title}</h4>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;

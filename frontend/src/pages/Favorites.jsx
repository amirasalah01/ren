import React, { useState, useEffect } from 'react';
import { getFavorites } from '../api/properties';
import PropertyCard from '../components/PropertyCard';
import './Favorites.css';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const data = await getFavorites();
      setFavorites(data.results || data);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading favorites...</p>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <div className="favorites-container">
        <div className="page-header">
          <h1>My Favorites</h1>
          <p>Properties you've saved for later</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {favorites.length === 0 ? (
          <div className="no-favorites">
            <p>You haven't added any properties to your favorites yet.</p>
            <p>Browse properties and click the heart icon to save them here.</p>
          </div>
        ) : (
          <div className="favorites-grid">
            {favorites.map((favorite) => (
              <PropertyCard
                key={favorite.id}
                property={favorite.property_detail}
                onFavoriteChange={fetchFavorites}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;

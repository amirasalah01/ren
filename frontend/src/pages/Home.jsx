import React, { useState, useEffect } from 'react';
import { getProperties } from '../api/properties';
import PropertyCard from '../components/PropertyCard';
import SearchFilter from '../components/SearchFilter';
import './Home.css';

const Home = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ is_available: true, ordering: '-created_at' });

  useEffect(() => {
    fetchProperties();
  }, [currentPage, filters]);

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { ...filters, page: currentPage };
      const data = await getProperties(params);
      setProperties(data.results || data);
      if (data.count) {
        setTotalPages(Math.ceil(data.count / (data.results?.length || 10)));
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-btn"
        >
          ← Previous
        </button>
        {startPage > 1 && (
          <>
            <button onClick={() => handlePageChange(1)} className="pagination-btn">
              1
            </button>
            {startPage > 2 && <span className="pagination-ellipsis">...</span>}
          </>
        )}
        {pages}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="pagination-ellipsis">...</span>}
            <button onClick={() => handlePageChange(totalPages)} className="pagination-btn">
              {totalPages}
            </button>
          </>
        )}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-btn"
        >
          Next →
        </button>
      </div>
    );
  };

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>Find Your Perfect Rental</h1>
        <p>Discover amazing properties available for rent</p>
      </div>

      <SearchFilter onSearch={handleFilterChange} />

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading properties...</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="no-results">
          <p>No properties found matching your criteria.</p>
          <p>Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <>
          <div className="properties-grid">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onFavoriteChange={fetchProperties}
              />
            ))}
          </div>
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default Home;

import React, { useState } from 'react';
import './SearchFilter.css';

const SearchFilter = ({ onFilterChange, onSearch }) => {
  const [filters, setFilters] = useState({
    search: '',
    price_min: '',
    price_max: '',
    property_type: '',
    bedrooms: '',
    bathrooms: '',
    is_available: true,
    ordering: '-created_at',
  });

  const [showFilters, setShowFilters] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newFilters = {
      ...filters,
      [name]: type === 'checkbox' ? checked : value,
    };
    setFilters(newFilters);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== '' && value !== null)
    );
    if (onFilterChange) {
      onFilterChange(cleanFilters);
    }
    if (onSearch) {
      onSearch(cleanFilters);
    }
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      price_min: '',
      price_max: '',
      property_type: '',
      bedrooms: '',
      bathrooms: '',
      is_available: true,
      ordering: '-created_at',
    };
    setFilters(resetFilters);
    if (onFilterChange) {
      onFilterChange({ is_available: true, ordering: '-created_at' });
    }
    if (onSearch) {
      onSearch({ is_available: true, ordering: '-created_at' });
    }
  };

  return (
    <div className="search-filter">
      <form onSubmit={handleSubmit} className="search-filter-form">
        <div className="search-bar">
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Search by title, city, or country..."
            className="search-input"
          />
          <button type="submit" className="search-btn">
            🔍 Search
          </button>
          <button
            type="button"
            className="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? '▲ Hide' : '▼ Filters'}
          </button>
        </div>

        <div className={`filters-panel ${showFilters ? 'active' : ''}`}>
          <div className="filter-grid">
            <div className="filter-group">
              <label htmlFor="price_min">Min Price</label>
              <input
                type="number"
                id="price_min"
                name="price_min"
                value={filters.price_min}
                onChange={handleChange}
                placeholder="Min"
                min="0"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="price_max">Max Price</label>
              <input
                type="number"
                id="price_max"
                name="price_max"
                value={filters.price_max}
                onChange={handleChange}
                placeholder="Max"
                min="0"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="property_type">Property Type</label>
              <select
                id="property_type"
                name="property_type"
                value={filters.property_type}
                onChange={handleChange}
              >
                <option value="">All Types</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="condo">Condo</option>
                <option value="villa">Villa</option>
                <option value="studio">Studio</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="bedrooms">Bedrooms</label>
              <select
                id="bedrooms"
                name="bedrooms"
                value={filters.bedrooms}
                onChange={handleChange}
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="bathrooms">Bathrooms</label>
              <select
                id="bathrooms"
                name="bathrooms"
                value={filters.bathrooms}
                onChange={handleChange}
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="ordering">Sort By</label>
              <select
                id="ordering"
                name="ordering"
                value={filters.ordering}
                onChange={handleChange}
              >
                <option value="-created_at">Newest First</option>
                <option value="created_at">Oldest First</option>
                <option value="price_per_month">Price: Low to High</option>
                <option value="-price_per_month">Price: High to Low</option>
                <option value="-view_count">Most Viewed</option>
              </select>
            </div>
          </div>

          <div className="filter-checkbox">
            <label>
              <input
                type="checkbox"
                name="is_available"
                checked={filters.is_available}
                onChange={handleChange}
              />
              <span>Show only available properties</span>
            </label>
          </div>

          <div className="filter-actions">
            <button type="submit" className="apply-filters-btn">
              Apply Filters
            </button>
            <button type="button" onClick={handleReset} className="reset-filters-btn">
              Reset
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchFilter;

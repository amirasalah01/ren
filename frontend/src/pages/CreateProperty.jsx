import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createProperty, updateProperty, getProperty } from '../api/properties';
import './CreateProperty.css';

const CreateProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    country: '',
    property_type: 'apartment',
    price_per_month: '',
    bedrooms: '',
    bathrooms: '',
    square_feet: '',
    available_from: '',
    is_available: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      const data = await getProperty(id);
      setFormData({
        title: data.title || '',
        description: data.description || '',
        address: data.address || '',
        city: data.city || '',
        country: data.country || '',
        property_type: data.property_type || 'apartment',
        price_per_month: data.price_per_month || '',
        bedrooms: data.bedrooms || '',
        bathrooms: data.bathrooms || '',
        square_feet: data.square_feet || '',
        available_from: data.available_from || '',
        is_available: data.is_available !== undefined ? data.is_available : true,
      });
    } catch (err) {
      console.error('Error fetching property:', err);
      setError('Failed to load property details');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEditing) {
        await updateProperty(id, formData);
        alert('Property updated successfully!');
      } else {
        await createProperty(formData);
        alert('Property created successfully!');
      }
      navigate('/my-properties');
    } catch (err) {
      console.error('Error saving property:', err);
      const errorMsg =
        err.response?.data?.detail ||
        Object.values(err.response?.data || {}).flat().join(', ') ||
        'Failed to save property';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-property-page">
      <div className="create-property-container">
        <div className="page-header">
          <h1>{isEditing ? 'Edit Property' : 'Create New Property'}</h1>
          <button onClick={() => navigate('/my-properties')} className="btn-back">
            ← Back to My Properties
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="property-form">
          <div className="form-section">
            <h2>Basic Information</h2>

            <div className="form-group">
              <label htmlFor="title">
                Property Title <span className="required">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="e.g., Beautiful 2BR Apartment in Downtown"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">
                Description <span className="required">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                disabled={loading}
                rows="6"
                placeholder="Describe your property in detail..."
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Location</h2>

            <div className="form-group">
              <label htmlFor="address">
                Address <span className="required">*</span>
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Street address"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">
                  City <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="country">
                  Country <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Property Details</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="property_type">
                  Property Type <span className="required">*</span>
                </label>
                <select
                  id="property_type"
                  name="property_type"
                  value={formData.property_type}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="condo">Condo</option>
                  <option value="villa">Villa</option>
                  <option value="studio">Studio</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="price_per_month">
                  Price per Month ($) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="price_per_month"
                  name="price_per_month"
                  value={formData.price_per_month}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="bedrooms">
                  Bedrooms <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="bedrooms"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bathrooms">
                  Bathrooms <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="bathrooms"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  min="0"
                  step="0.5"
                />
              </div>

              <div className="form-group">
                <label htmlFor="square_feet">
                  Square Feet <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="square_feet"
                  name="square_feet"
                  value={formData.square_feet}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Availability</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="available_from">
                  Available From <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="available_from"
                  name="available_from"
                  value={formData.available_from}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="is_available"
                    checked={formData.is_available}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <span>Property is currently available</span>
                </label>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Saving...' : isEditing ? 'Update Property' : 'Create Property'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/my-properties')}
              className="btn-cancel"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProperty;

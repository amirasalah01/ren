import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyProperties, deleteProperty } from '../api/properties';
import './MyProperties.css';

const MyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyProperties();
  }, []);

  const fetchMyProperties = async () => {
    setLoading(true);
    try {
      const data = await getMyProperties();
      setProperties(data.results || data);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load your properties');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      await deleteProperty(id);
      setProperties(properties.filter((p) => p.id !== id));
      alert('Property deleted successfully');
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your properties...</p>
      </div>
    );
  }

  return (
    <div className="my-properties-page">
      <div className="my-properties-container">
        <div className="page-header">
          <h1>My Properties</h1>
          <Link to="/create-property" className="btn-primary">
            ➕ Add New Property
          </Link>
        </div>

        {error && <div className="error-message">{error}</div>}

        {properties.length === 0 ? (
          <div className="no-properties">
            <p>You haven't listed any properties yet.</p>
            <Link to="/create-property" className="btn-primary">
              Create Your First Property
            </Link>
          </div>
        ) : (
          <div className="properties-table-container">
            <table className="properties-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Views</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property) => (
                  <tr key={property.id}>
                    <td className="property-title-cell">
                      <Link to={`/property/${property.id}`}>{property.title}</Link>
                    </td>
                    <td>
                      {property.city}, {property.country}
                    </td>
                    <td className="property-type-cell">{property.property_type}</td>
                    <td className="property-price-cell">${property.price_per_month}/mo</td>
                    <td>
                      <span className={`status-badge ${property.is_available ? 'available' : ''}`}>
                        {property.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="property-views-cell">{property.view_count || 0}</td>
                    <td className="actions-cell">
                      <button
                        onClick={() => navigate(`/edit-property/${property.id}`)}
                        className="btn-edit"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(property.id, property.title)}
                        className="btn-delete"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProperties;

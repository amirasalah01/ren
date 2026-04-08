import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user, isPropertyOwner } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await getDashboard();
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.first_name || user?.username}!</h1>
          <p>Here's an overview of your activity</p>
        </div>

        <div className="stats-grid">
          {isPropertyOwner && (
            <Link to="/my-properties" className="stat-card stat-card-primary">
              <div className="stat-icon">🏠</div>
              <div className="stat-content">
                <div className="stat-value">{stats?.properties?.count || 0}</div>
                <div className="stat-label">My Properties</div>
              </div>
            </Link>
          )}

          <Link to="/favorites" className="stat-card stat-card-secondary">
            <div className="stat-icon">❤️</div>
            <div className="stat-content">
              <div className="stat-value">{stats?.favorites?.count || 0}</div>
              <div className="stat-label">Favorites</div>
            </div>
          </Link>

          <Link to="/inbox" className="stat-card stat-card-success">
            <div className="stat-icon">📨</div>
            <div className="stat-content">
              <div className="stat-value">{stats?.messages?.total_received || 0}</div>
              <div className="stat-label">Received Messages</div>
            </div>
          </Link>

          {stats?.messages?.unread_count > 0 && (
            <Link to="/inbox" className="stat-card stat-card-warning">
              <div className="stat-icon">🔔</div>
              <div className="stat-content">
                <div className="stat-value">{stats.messages.unread_count}</div>
                <div className="stat-label">Unread Messages</div>
              </div>
            </Link>
          )}
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/" className="action-card">
              <span className="action-icon">🔍</span>
              <span className="action-label">Browse Properties</span>
            </Link>
            <Link to="/favorites" className="action-card">
              <span className="action-icon">❤️</span>
              <span className="action-label">View Favorites</span>
            </Link>
            <Link to="/inbox" className="action-card">
              <span className="action-icon">✉️</span>
              <span className="action-label">Check Messages</span>
            </Link>
            {isPropertyOwner && (
              <>
                <Link to="/my-properties" className="action-card">
                  <span className="action-icon">🏠</span>
                  <span className="action-label">Manage Properties</span>
                </Link>
                <Link to="/create-property" className="action-card action-card-primary">
                  <span className="action-icon">➕</span>
                  <span className="action-label">Add New Property</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

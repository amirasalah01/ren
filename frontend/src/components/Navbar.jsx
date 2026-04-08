import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboard } from '../api/auth';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated, isPropertyOwner } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    const controller = new AbortController();
    getDashboard()
      .then((data) => {
        if (!controller.signal.aborted) setUnreadCount(data.messages?.unread_count || 0);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          console.error('Error fetching unread count:', error);
        }
      });
    return () => {
      controller.abort();
    };
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🏠</span>
          Rentify
        </Link>

        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          <Link to="/" className="navbar-link" onClick={() => setMenuOpen(false)}>
            Home
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="navbar-link" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
              <Link to="/favorites" className="navbar-link" onClick={() => setMenuOpen(false)}>
                Favorites
              </Link>
              <Link to="/inbox" className="navbar-link navbar-link-with-badge" onClick={() => setMenuOpen(false)}>
                Messages
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
              </Link>
              {isPropertyOwner && (
                <Link to="/my-properties" className="navbar-link" onClick={() => setMenuOpen(false)}>
                  My Properties
                </Link>
              )}
              <div className="navbar-user">
                <span className="navbar-username">{user?.username}</span>
                <button onClick={handleLogout} className="navbar-logout-btn">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="navbar-link navbar-register" onClick={() => setMenuOpen(false)}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

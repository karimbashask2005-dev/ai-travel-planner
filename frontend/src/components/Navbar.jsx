import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, Briefcase, LogOut, User, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../App';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass-panel" style={{
      margin: '1rem 1.5rem 0 1.5rem',
      borderRadius: '12px',
      padding: '0.75rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: '1rem',
      zIndex: 100
    }}>
      {/* Brand Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 800 }}>
        <Compass style={{ color: '#6366f1' }} size={24} />
        <span className="gradient-text" style={{ fontFamily: 'var(--font-display)' }}>Voyager AI</span>
      </Link>

      {/* Main Navigation Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {user ? (
          <>
            <Link 
              to="/" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: isActive('/') ? '#f1f5f9' : '#94a3b8',
                borderBottom: isActive('/') ? '2px solid #6366f1' : '2px solid transparent',
                padding: '0.25rem 0',
                transition: 'all 0.2s'
              }}
            >
              <Compass size={16} />
              Planner
            </Link>

            <Link 
              to="/saved-trips" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: isActive('/saved-trips') ? '#f1f5f9' : '#94a3b8',
                borderBottom: isActive('/saved-trips') ? '2px solid #6366f1' : '2px solid transparent',
                padding: '0.25rem 0',
                transition: 'all 0.2s'
              }}
            >
              <Briefcase size={16} />
              Saved Trips
            </Link>
          </>
        ) : null}
      </div>

      {/* Auth Widgets */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '0.4rem 0.8rem',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              fontSize: '0.85rem'
            }}>
              <User size={14} style={{ color: '#a855f7' }} />
              <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{user.name}</span>
            </div>
            
            <button 
              onClick={handleLogout} 
              className="btn btn-secondary" 
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <LogIn size={14} />
              Sign In
            </Link>
            
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <UserPlus size={14} />
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

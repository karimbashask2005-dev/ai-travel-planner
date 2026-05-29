import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tripService } from '../services/tripService';
import { Briefcase, Calendar, DollarSign, Users, ExternalLink, Trash2, ArrowRight } from 'lucide-react';

export default function SavedTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const data = await tripService.getTrips();
        setTrips(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch itineraries.');
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const handleDelete = async (id, e) => {
    e.preventDefault(); // Prevents triggers on link wrapping
    if (!window.confirm('Are you sure you want to delete this trip itinerary?')) return;
    
    setDeletingId(id);
    try {
      await tripService.deleteTrip(id);
      setTrips(trips.filter(t => t._id !== id));
    } catch (err) {
      alert(err.message || 'Could not delete the trip.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="loading-container fade-in" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Retrieving your saved itineraries...</p>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>Saved Itineraries</h2>
        <p style={{ color: 'var(--text-muted)' }}>Manage and explore your planned journeys</p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: '#ef4444',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}

      {/* Empty State */}
      {trips.length === 0 ? (
        <div className="glass-panel" style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          maxWidth: '500px',
          margin: '3rem auto'
        }}>
          <div style={{
            background: 'rgba(99, 102, 241, 0.1)',
            padding: '1rem',
            borderRadius: '50%',
            color: '#6366f1'
          }}>
            <Briefcase size={36} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No trips planned yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Create a personalized trip outline using our agent-driven workflow.</p>
          </div>
          <Link to="/" className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem' }}>
            Plan a Trip
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        /* Trips Grid */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {trips.map(trip => (
            <div 
              key={trip._id} 
              className="glass-panel" 
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.75rem',
                transition: 'all 0.3s',
                hover: { transform: 'translateY(-4px)' }
              }}
            >
              <div>
                {/* Title */}
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontFamily: 'var(--font-display)' }}>
                  {trip.tripTitle}
                </h3>
                
                {/* Stats row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <Calendar size={13} style={{ color: '#a855f7' }} />
                    <span>{trip.days} Days</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <DollarSign size={13} style={{ color: '#10b981' }} />
                    <span>${trip.budget}</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <Users size={13} style={{ color: '#3b82f6' }} />
                    <span>{trip.travelers} Traveler{trip.travelers > 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Summary */}
                <p style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  marginBottom: '1.5rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {trip.summary}
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                paddingTop: '1rem',
                marginTop: '1rem'
              }}>
                <Link to={`/trip/${trip._id}`} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', gap: '0.35rem' }}>
                  <ExternalLink size={14} />
                  View Details
                </Link>
                
                <button 
                  onClick={(e) => handleDelete(trip._id, e)} 
                  className="btn btn-danger" 
                  style={{ padding: '0.5rem 0.8rem', borderRadius: '8px' }}
                  disabled={deletingId === trip._id}
                >
                  {deletingId === trip._id ? (
                    <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }}></div>
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

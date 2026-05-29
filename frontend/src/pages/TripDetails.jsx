import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { tripService } from '../services/tripService';
import { ArrowLeft, Calendar, DollarSign, Users, Compass, ShieldAlert, Sparkles, MapPin, Tag, ListTodo, Activity, CheckCircle, RefreshCcw } from 'lucide-react';

export default function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Data states
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit & Regenerate states
  const [editInstruction, setEditInstruction] = useState('');
  const [regenerating, setRegenerating] = useState(false);
  const [regeneratingMessage, setRegeneratingMessage] = useState('Consulting the planner agent...');

  // Cycle loader messages to simulate multi-agent tasks during editing
  useEffect(() => {
    if (!regenerating) return;
    
    const messages = [
      'Planner Agent: Reviewing previous itinerary and edit instruction...',
      'Planner Agent: Restructuring activity sequence...',
      'Weather Agent: Reviewing local forecast adjustments...',
      'Budget Agent: Readjusting day cost distributions...',
      'Itinerary Agent: Compiling revised structured itinerary...',
      'Saving updated travel plans to database...'
    ];
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % messages.length;
      setRegeneratingMessage(messages[currentIndex]);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [regenerating]);

  const fetchTripDetails = async () => {
    try {
      const data = await tripService.getTripById(id);
      setTrip(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve trip details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  const handleRegenerate = async (e) => {
    e.preventDefault();
    if (!editInstruction.trim()) return;
    
    setError('');
    setRegenerating(true);
    setRegeneratingMessage('Planner Agent: Initiating revision flow...');
    
    try {
      const updatedTrip = await tripService.regenerateTrip(id, editInstruction);
      setTrip(updatedTrip);
      setEditInstruction('');
    } catch (err) {
      setError(err.message || 'Failed to modify itinerary. Ensure LLM services are running.');
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container fade-in" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Assembling itinerary details...</p>
      </div>
    );
  }

  if (error && !trip) {
    return (
      <div className="glass-panel fade-in" style={{
        maxWidth: '500px',
        margin: '4rem auto',
        padding: '3rem 2rem',
        textAlign: 'center',
        border: '1px solid rgba(239, 68, 68, 0.2)'
      }}>
        <ShieldAlert size={48} style={{ color: '#ef4444', marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Failed to Load Trip</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>{error}</p>
        <Link to="/saved-trips" className="btn btn-secondary" style={{ display: 'inline-flex', gap: '0.35rem' }}>
          <ArrowLeft size={16} />
          Back to Saved Trips
        </Link>
      </div>
    );
  }

  // Calculate total itinerary cost
  const calculatedTotalCost = trip.itinerary.reduce((acc, curr) => acc + curr.estimatedCost, 0);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* Back navigation */}
      <div>
        <Link to="/saved-trips" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
          <ArrowLeft size={16} />
          Back to Saved Trips
        </Link>
      </div>

      {/* Hero Stats Card */}
      <section className="glass-panel" style={{
        padding: '2.5rem',
        border: '1px solid var(--card-border)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow detail */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '120px',
          height: '120px',
          background: 'rgba(99, 102, 241, 0.15)',
          filter: 'blur(30px)',
          borderRadius: '50%'
        }}></div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              color: '#818cf8',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase'
            }}>
              {trip.travelStyle}
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              color: 'var(--text-muted)',
              fontSize: '0.85rem'
            }}>
              <MapPin size={12} />
              {trip.destination}
            </span>
          </div>

          <h2 style={{ fontSize: '2.25rem', fontFamily: 'var(--font-display)', lineHeight: '1.2' }}>{trip.tripTitle}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6', maxWidth: '800px' }}>{trip.summary}</p>
          
          {/* Quick Metrics Bar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            paddingTop: '1.5rem',
            marginTop: '0.5rem'
          }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Duration</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-bright)' }}>
                <Calendar size={18} style={{ color: '#6366f1' }} />
                {trip.days} Days
              </span>
            </div>
            
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Budget Limit</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-bright)' }}>
                <DollarSign size={18} style={{ color: '#10b981' }} />
                ${trip.budget}
              </span>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Actual Plan Cost</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b' }}>
                <DollarSign size={18} />
                ${calculatedTotalCost}
              </span>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Travelers Group</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-bright)' }}>
                <Users size={18} style={{ color: '#3b82f6' }} />
                {trip.travelers} Traveler{trip.travelers > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Edit & Regenerate UI panel */}
      <section className="glass-panel" style={{
        padding: '2rem',
        border: '1px solid rgba(168, 85, 247, 0.15)',
        background: 'rgba(20, 29, 47, 0.45)'
      }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)' }}>
          <Sparkles size={18} style={{ color: '#a855f7' }} />
          Refine with AI Instructions
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          Suggest modifications like <em>"make the activities cheaper"</em>, <em>"swap Day 2 for nature trails"</em>, or <em>"add luxury restaurant suggestions"</em>. Our agents will regenerate the itinerary instantly.
        </p>

        {regenerating ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.5rem',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center'
          }}>
            <div className="spinner" style={{ width: '30px', height: '30px' }}></div>
            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-bright)' }}>{regeneratingMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleRegenerate} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Make it more luxury, focus on food tours, add nightlife to day 2..." 
              value={editInstruction}
              onChange={(e) => setEditInstruction(e.target.value)}
              style={{ flex: 1, minWidth: '280px' }}
              required
            />
            <button type="submit" className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem' }}>
              <RefreshCcw size={16} />
              Update Plan
            </button>
          </form>
        )}
      </section>

      {/* Itinerary Section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ListTodo size={20} style={{ color: '#6366f1' }} />
          Daily Schedule
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {trip.itinerary.map((dayPlan, index) => (
            <div 
              key={dayPlan.day || index} 
              className="glass-panel" 
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr',
                padding: '2rem',
                border: '1px solid var(--card-border)',
                gap: '1.5rem'
              }}
            >
              {/* Day Circle */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'var(--primary-gradient)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  fontFamily: 'var(--font-display)',
                  color: 'var(--text-bright)',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                }}>
                  D{dayPlan.day}
                </div>
                <div style={{
                  marginTop: '0.75rem',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  color: '#10b981',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  ${dayPlan.estimatedCost}
                </div>
              </div>

              {/* Day Content */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-display)', color: 'var(--text-bright)' }}>
                  {dayPlan.title}
                </h4>
                
                <ul style={{ listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {dayPlan.activities.map((activity, idx) => (
                    <li key={idx} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      fontSize: '0.95rem',
                      lineHeight: '1.5',
                      color: '#cbd5e1'
                    }}>
                      <CheckCircle size={16} style={{ color: '#6366f1', marginTop: '0.25rem', flexShrink: 0 }} />
                      <span>{activity}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

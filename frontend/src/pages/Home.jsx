import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripService } from '../services/tripService';
import { Globe, Calendar, DollarSign, Users, Award, Tag, Sparkles, Navigation } from 'lucide-react';

const INTEREST_OPTIONS = [
  'Sightseeing', 'Food & Dining', 'Adventure', 'Nature & Parks', 
  'Art & Museums', 'Shopping', 'History & Culture', 'Nightlife', 'Relaxation'
];

const STYLE_OPTIONS = [
  { value: 'balanced', label: 'Balanced (Mix of comfort & budget)' },
  { value: 'luxury', label: 'Luxury (High-end resorts & fine dining)' },
  { value: 'budget', label: 'Budget (Hostels, street food & free tours)' },
  { value: 'adventure', label: 'Adventure (Thrills, hiking & exploration)' },
  { value: 'slow', label: 'Slow Travel (Relaxed pace, deep local focus)' }
];

export default function Home() {
  const navigate = useNavigate();
  
  // Form State
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState(1500);
  const [travelStyle, setTravelStyle] = useState('balanced');
  const [travelers, setTravelers] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState([]);
  
  // UI Status
  const [loading, setLoading] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState('Consulting the travel agents...');
  const [error, setError] = useState('');

  // Cycle loader messages to simulate multi-agent tasks
  useEffect(() => {
    if (!loading) return;
    
    const messages = [
      'Planner Agent: Analyzing destination mapping and interests...',
      'Weather Agent: Retrieving real-time forecasts from Open-Meteo...',
      'Weather Agent: Compiling weather-aware recommendations...',
      'Budget Agent: Allocating costs for stay, transit, and food...',
      'Itinerary Agent: Synthesizing day-by-day itineraries...',
      'Structuring final JSON itinerary layout...'
    ];
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % messages.length;
      setLoaderMessage(messages[currentIndex]);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [loading]);

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!destination || days <= 0 || budget <= 0 || travelers <= 0) {
      setError('Please fill in all details with valid inputs.');
      return;
    }
    
    setError('');
    setLoading(true);
    setLoaderMessage('Planner Agent: Drafting strategic travel route...');
    
    try {
      const newTrip = await tripService.generateTrip({
        destination,
        days: Number(days),
        budget: Number(budget),
        travelStyle,
        interests: selectedInterests,
        travelers: Number(travelers)
      });
      
      // Redirect to newly saved trip page
      navigate(`/trip/${newTrip._id}`);
    } catch (err) {
      setError(err.message || 'Error occurred during generation. Check API services.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container glass-panel fade-in" style={{
        maxWidth: '600px',
        margin: '4rem auto',
        padding: '4rem 2rem',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div className="spinner"></div>
        <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)' }} className="gradient-text">Generating Your Dream Trip</h3>
        <p style={{ color: 'var(--text-bright)', fontWeight: 500, minHeight: '24px' }}>{loaderMessage}</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>This can take up to 20-30 seconds as our LLM agents consult each other.</p>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      
      {/* Hero Banner Section */}
      <section style={{ textAlign: 'center', padding: '2rem 1rem 1rem 1rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          padding: '0.5rem 1rem',
          borderRadius: '30px',
          fontSize: '0.85rem',
          color: '#818cf8',
          fontWeight: 600,
          marginBottom: '1.5rem'
        }}>
          <Sparkles size={14} />
          Next-Gen Multi-Agent Itinerary Builder
        </div>
        <h1 style={{ fontSize: '3.5rem', lineHeight: '1.15', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
          Craft Your Perfect <span className="gradient-text">Adventure</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto' }}>
          Input your preferences and let our specialized AI agents organize your route, check local forecasts, plan your budget, and construct daily itineraries.
        </p>
      </section>

      {/* Main Questionnaire form */}
      <section className="glass-panel" style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2.5rem',
        width: '100%'
      }}>
        <h3 style={{ fontSize: '1.35rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Navigation size={20} style={{ color: '#a855f7' }} />
          Traveler Preferences
        </h3>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleGenerate}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            
            {/* Destination */}
            <div className="form-group">
              <label className="form-label" htmlFor="destination-input">
                <Globe size={14} style={{ marginRight: '0.35rem', verticalAlign: 'middle', color: '#6366f1' }} />
                Where to? (Destination)
              </label>
              <input 
                type="text" 
                id="destination-input"
                className="form-input" 
                placeholder="e.g. Paris, Tokyo, Bali..." 
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            </div>

            {/* Travel Days */}
            <div className="form-group">
              <label className="form-label" htmlFor="days-input">
                <Calendar size={14} style={{ marginRight: '0.35rem', verticalAlign: 'middle', color: '#6366f1' }} />
                Trip Duration (Days)
              </label>
              <input 
                type="number" 
                id="days-input"
                className="form-input" 
                min="1" 
                max="14"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                required
              />
            </div>

            {/* Budget */}
            <div className="form-group">
              <label className="form-label" htmlFor="budget-input">
                <DollarSign size={14} style={{ marginRight: '0.35rem', verticalAlign: 'middle', color: '#6366f1' }} />
                Total Budget ($ USD)
              </label>
              <input 
                type="number" 
                id="budget-input"
                className="form-input" 
                min="1"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                required
              />
            </div>

            {/* Travelers */}
            <div className="form-group">
              <label className="form-label" htmlFor="travelers-input">
                <Users size={14} style={{ marginRight: '0.35rem', verticalAlign: 'middle', color: '#6366f1' }} />
                Number of Travelers
              </label>
              <input 
                type="number" 
                id="travelers-input"
                className="form-input" 
                min="1"
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
                required
              />
            </div>

            {/* Style */}
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label" htmlFor="travel-style-select">
                <Award size={14} style={{ marginRight: '0.35rem', verticalAlign: 'middle', color: '#6366f1' }} />
                Travel Style
              </label>
              <select 
                id="travel-style-select"
                className="form-select" 
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value)}
              >
                {STYLE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            
          </div>

          {/* Interests */}
          <div className="form-group" style={{ marginTop: '1.5rem', marginBottom: '2.5rem' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Tag size={14} style={{ color: '#6366f1' }} />
              Interests & Hobbies
            </label>
            <div className="interests-grid" style={{ marginTop: '0.5rem' }}>
              {INTEREST_OPTIONS.map(interest => {
                const isActive = selectedInterests.includes(interest);
                return (
                  <div 
                    key={interest} 
                    className={`interest-tag ${isActive ? 'active' : ''}`}
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Generate Button */}
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem', display: 'flex', gap: '0.5rem', fontSize: '1.1rem' }}
          >
            <Sparkles size={20} />
            Generate Custom Itinerary
          </button>

        </form>
      </section>
    </div>
  );
}

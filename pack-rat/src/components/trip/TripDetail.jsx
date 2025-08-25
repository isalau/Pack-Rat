import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import PackingList from "../packing/PackingList";
import PackingListSummary from "../packing/PackingListSummary";
import './TripDetail.css';

const TripDetail = ({ trip: initialTrip, onBack }) => {
  const { id } = useParams();
  const [view, setView] = useState('days'); // 'days' or 'summary'
  const [trip, setTrip] = useState(initialTrip);
  const [isLoading, setIsLoading] = useState(!initialTrip);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setTrip(data);
      } catch (err) {
        console.error('Error fetching trip:', err);
        setError('Failed to load trip details');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchTrip();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="loading-state">
        <p>Loading trip details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <p>{error}</p>
        <Link to="/" className="btn btn-primary">Back to Trips</Link>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="empty-state">
        <p>Trip not found</p>
        <Link to="/" className="btn btn-primary">Back to Trips</Link>
      </div>
    );
  }

  // Generate array of packing days
  const packingDays = trip ? Array.from({ length: trip.packing_days || 1 }, (_, i) => i + 1) : [];

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="trip-detail-container">
      <div className="trip-header">
        <Link to="/" className="btn btn-secondary">← Back to Trips</Link>
        <h1>{trip.trip_name || 'Unnamed Trip'}</h1>
      </div>

      <div className="trip-overview">
        <h2>Trip Overview</h2>
        <div className="trip-info-grid">
          <div className="info-item">
            <span className="label">Origin:</span>
            <span>{trip.origin || 'Not specified'}</span>
          </div>
          <div className="info-item">
            <span className="label">Destination:</span>
            <span>{trip.destination || 'Not specified'}</span>
          </div>
          <div className="info-item">
            <span className="label">Start Date:</span>
            <span>{new Date(trip.start_date).toLocaleDateString()}</span>
          </div>
          <div className="info-item">
            <span className="label">End Date:</span>
            <span>{new Date(trip.end_date).toLocaleDateString()}</span>
          </div>
          <div className="info-item">
            <span className="label">Packing Days:</span>
            <span>{trip.packing_days}</span>
          </div>
        </div>
        {trip.notes && (
          <div className="trip-notes">
            <h3>Notes</h3>
            <p>{trip.notes}</p>
          </div>
        )}
      </div>

      <div className="packing-views">
        <div className="view-tabs">
          <button 
            className={`view-tab ${view === 'days' ? 'active' : ''}`}
            onClick={() => setView('days')}
          >
            By Day
          </button>
          <button 
            className={`view-tab ${view === 'summary' ? 'active' : ''}`}
            onClick={() => setView('summary')}
          >
            Summary
          </button>
        </div>

        {view === 'days' ? (
          <div className="packing-days">
            <h2>Packing Days</h2>
            <div className="days-container">
              {packingDays.map((day) => (
                <div key={day} className="day-section">
                  <div className="day-header">
                    <h3>Day {day}</h3>
                  </div>
                  <PackingList 
                    tripId={trip.id} 
                    day={day} 
                    totalDays={packingDays.length} 
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <PackingListSummary 
            tripId={trip.id} 
            days={packingDays} 
          />
        )}
      </div>
    </div>
  );
};

export default TripDetail;

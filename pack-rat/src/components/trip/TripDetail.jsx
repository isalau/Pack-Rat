import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import './TripDetail.css';

const TripDetail = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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
  const packingDays = Array.from({ length: trip.packing_days || 1 }, (_, i) => i + 1);

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

      <div className="packing-days">
        <h2>Packing Days</h2>
        <div className="days-grid">
          {packingDays.map(day => (
            <div key={day} className="day-card">
              <h3>Day {day}</h3>
              <div className="packing-list">
                {/* Packing items will go here */}
                <p className="empty-message">Add items to pack for this day</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TripDetail;

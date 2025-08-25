import { useState } from 'react';
import TripForm from './TripForm';
import './TripsList.css';

const TripsList = () => {
  const [trips, setTrips] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const handleSaveTrip = (tripData) => {
    const newTrip = {
      id: Date.now(),
      ...tripData,
      createdAt: new Date().toISOString()
    };
    
    setTrips([...trips, newTrip]);
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  return (
    <div className="trips-container">
      <div className="trips-header">
        <h1>My Trips</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Create Trip
        </button>
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <TripForm 
              onSave={handleSaveTrip} 
              onCancel={handleCancel} 
            />
          </div>
        </div>
      )}

      {trips.length === 0 ? (
        <div className="empty-state">
          <p>No trips yet. Create your first trip to get started!</p>
        </div>
      ) : (
        <div className="trips-grid">
          {trips.map(trip => (
            <div key={trip.id} className="trip-card">
              <h3>{trip.tripName || 'Unnamed Trip'}</h3>
              <p className="trip-destination">
                {trip.origin} → {trip.destination}
              </p>
              <div className="trip-details">
                <p className="trip-detail">
                  <span className="label">Dates:</span> {trip.startDate} to {trip.endDate}
                </p>
                <p className="trip-detail">
                  <span className="label">Packing Days:</span> {trip.packingDays}
                </p>
              </div>
              {trip.notes && (
                <p className="trip-notes">
                  <span className="label">Notes:</span> {trip.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TripsList;

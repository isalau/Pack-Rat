import { useState } from 'react';
import { FaTrash, FaTimes } from 'react-icons/fa';
import TripForm from './TripForm';
import ConfirmationModal from '../common/ConfirmationModal';
import './TripsList.css';

const TripsList = () => {
  const [trips, setTrips] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [tripToDelete, setTripToDelete] = useState(null);

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

  const handleDeleteClick = (trip) => {
    setTripToDelete(trip);
  };

  const handleConfirmDelete = () => {
    if (tripToDelete) {
      setTrips(trips.filter(trip => trip.id !== tripToDelete.id));
      setTripToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setTripToDelete(null);
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
            <button 
              className="close-button"
              onClick={handleCancel}
              aria-label="Close form"
            >
              <FaTimes />
            </button>
            <TripForm 
              onSave={handleSaveTrip} 
              onCancel={handleCancel} 
            />
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!tripToDelete}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Trip"
        message={`Are you sure you want to delete the trip "${tripToDelete?.tripName || 'Unnamed Trip'}"? This action cannot be undone.`}
      />

      {trips.length === 0 ? (
        <div className="empty-state">
          <p>No trips yet. Create your first trip to get started!</p>
        </div>
      ) : (
        <div className="trips-grid">
          {trips.map(trip => (
            <div key={trip.id} className="trip-card">
              <div className="trip-card-header">
                <h3>{trip.tripName || 'Unnamed Trip'}</h3>
                <button 
                  className="delete-trip-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(trip);
                  }}
                  aria-label="Delete trip"
                >
                  <FaTrash />
                </button>
              </div>
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

import { useState, useEffect } from 'react';
import { FaTrash, FaTimes, FaSpinner } from 'react-icons/fa';
import TripForm from './TripForm';
import ConfirmationModal from '../common/ConfirmationModal';
import { fetchTrips, addTrip, deleteTrip } from '../../lib/supabase';
import './TripsList.css';

const TripsList = () => {
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [tripToDelete, setTripToDelete] = useState(null);
  const [error, setError] = useState(null);

  // Fetch trips on component mount
  useEffect(() => {
    const loadTrips = async () => {
      try {
        setIsLoading(true);
        const tripsData = await fetchTrips();
        setTrips(tripsData);
      } catch (err) {
        console.error('Failed to load trips:', err);
        setError('Failed to load trips. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTrips();
  }, []);

  const handleSaveTrip = async (tripData) => {
    try {
      const newTrip = await addTrip(tripData);
      if (newTrip) {
        setTrips([newTrip, ...trips]);
        setShowForm(false);
      }
    } catch (err) {
      console.error('Error saving trip:', err);
      setError('Failed to save trip. Please try again.');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  const handleDeleteClick = (trip) => {
    setTripToDelete(trip);
  };

  const handleConfirmDelete = async () => {
    if (!tripToDelete) return;

    try {
      await deleteTrip(tripToDelete.id);
      setTrips(trips.filter(trip => trip.id !== tripToDelete.id));
      setTripToDelete(null);
    } catch (err) {
      console.error('Error deleting trip:', err);
      setError('Failed to delete trip. Please try again.');
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

      {isLoading ? (
        <div className="loading-state">
          <FaSpinner className="spinner" />
          <p>Loading trips...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
        </div>
      ) : trips.length === 0 ? (
        <div className="empty-state">
          <p>No trips yet. Create your first trip to get started!</p>
        </div>
      ) : (
        <div className="trips-grid">
          {trips.map(trip => (
            <div key={trip.id} className="trip-card">
              <div className="trip-card-header">
                <h3>{trip.trip_name || 'Unnamed Trip'}</h3>
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
                  <span className="label">Dates:</span> {trip.start_date} to {trip.end_date}
                </p>
                <p className="trip-detail">
                  <span className="label">Packing Days:</span> {trip.packing_days}
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

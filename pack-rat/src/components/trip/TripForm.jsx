import { useState } from 'react';
import './TripForm.css';

const TripForm = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    destination: '',
    origin: '',
    startDate: '',
    endDate: '',
    notes: '',
    packingDays: 1
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'packingDays' ? parseInt(value, 10) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="trip-form-container">
      <h2>Create New Trip</h2>
      <form onSubmit={handleSubmit} className="trip-form">
        <div className="form-group">
          <label htmlFor="origin">From:</label>
          <input
            type="text"
            id="origin"
            name="origin"
            value={formData.origin}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="destination">To:</label>
          <input
            type="text"
            id="destination"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Start Date:</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date:</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="packingDays">Packing Days:</label>
          <input
            type="number"
            id="packingDays"
            name="packingDays"
            min="1"
            value={formData.packingDays}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes:</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn btn-cancel">
            Cancel
          </button>
          <button type="submit" className="btn btn-save">
            Save Trip
          </button>
        </div>
      </form>
    </div>
  );
};

export default TripForm;

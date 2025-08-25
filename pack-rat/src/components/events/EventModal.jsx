import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import './EventModal.css';

const EventModal = ({ isOpen, onClose, onSelectEvent, tripId, day }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchEvents();
    }
  }, [isOpen]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = () => {
    if (selectedEvent) {
      onSelectEvent(selectedEvent);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Select an Event</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          {loading ? (
            <div className="loading">Loading events...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : events.length === 0 ? (
            <div className="empty">No events found. Create an event first.</div>
          ) : (
            <div className="event-list">
              {events.map(event => (
                <div 
                  key={event.id}
                  className={`event-item ${selectedEvent?.id === event.id ? 'selected' : ''}`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="event-name">{event.name}</div>
                  {event.description && (
                    <div className="event-description">{event.description}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSelect}
            disabled={!selectedEvent}
          >
            Add to Day {day}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;

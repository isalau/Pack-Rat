import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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

  const modalRoot = useRef(document.getElementById('modal-root') || document.body);
  const el = useRef(document.createElement('div'));

  useEffect(() => {
    const modalRootElement = modalRoot.current;
    const element = el.current;
    
    // Append the element to the DOM when the component mounts
    modalRootElement.appendChild(element);
    
    // Clean up by removing the element when the component unmounts
    return () => {
      modalRootElement.removeChild(element);
    };
  }, []);

  if (!isOpen) return null;

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const handleClose = (e) => {
    e.stopPropagation();
    onClose();
  };

  const modalContent = (
    <div 
      className="modal-overlay" 
      onClick={handleClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(2px)',
        pointerEvents: 'auto'
      }}
    >
      <div 
        className="modal-content" 
        onClick={handleModalClick}
        style={{
          background: 'white',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '500px',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          position: 'relative',
          zIndex: 1001,
          pointerEvents: 'auto'
        }}
      >
        <div className="modal-header">
          <h3>Select an Event</h3>
          <button className="close-button" onClick={handleClose}>&times;</button>
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

  return createPortal(modalContent, el.current);
};

export default EventModal;

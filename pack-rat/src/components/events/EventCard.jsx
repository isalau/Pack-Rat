import { Link } from 'react-router-dom';
import { FaTrash, FaEdit, FaPlus, FaCalendarPlus } from 'react-icons/fa';
import { supabase } from '../../lib/supabase';

const EventCard = ({ event, onDelete, onAddToDay, showAddButton = false }) => {
  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm(`Are you sure you want to delete "${event.name}"?`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id);
        
      if (error) throw error;
      onDelete();
    } catch (err) {
      console.error('Error deleting event:', err);
      alert('Failed to delete event');
    }
  };

  return (
    <div className="event-card">
      <div className="event-card-header">
        <h3>{event.name}</h3>
        <div className="event-actions">
          {showAddButton && onAddToDay && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToDay();
              }}
              className="icon-button primary"
              title="Add to day"
            >
              <FaCalendarPlus />
            </button>
          )}
          <Link 
            to={`/events/${event.id}/edit`} 
            className="icon-button" 
            title="Edit event"
          >
            <FaEdit />
          </Link>
          <button 
            onClick={handleDelete} 
            className="icon-button danger"
            title="Delete event"
          >
            <FaTrash />
          </button>
        </div>
      </div>
      
      {event.description && (
        <p className="event-description">{event.description}</p>
      )}
      
      {event.event_items && event.event_items.length > 0 && (
        <div className="event-items">
          <h4>Items:</h4>
          <ul>
            {event.event_items.map(item => (
              <li key={item.id}>
                {item.name} 
                {item.quantity > 1 && ` (${item.quantity})`}
                {item.category && ` [${item.category}]`}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="event-footer">
        <Link to={`/events/${event.id}`} className="btn btn-sm">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default EventCard;

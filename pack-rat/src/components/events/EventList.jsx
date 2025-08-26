import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import EventCard from './EventCard';
import './EventList.css';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const tripId = searchParams.get('tripId');
  const day = searchParams.get('day');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_items (*)
        `)
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    fetchEvents();
  };
  
  const handleAddToDay = async (eventId) => {
    if (!tripId || !day) return;
    
    try {
      // Add event to the specified day
      const { error: instanceError } = await supabase
        .from('event_instances')
        .insert([{
          event_id: eventId,
          trip_id: tripId,
          day: parseInt(day, 10)
        }]);
        
      if (instanceError) throw instanceError;
      
      // Add event items to the packing list
      const { data: items, error: itemsError } = await supabase
        .from('event_items')
        .select('*')
        .eq('event_id', eventId);
        
      if (itemsError) throw itemsError;
      
      if (items && items.length > 0) {
        const itemsToAdd = items.map(item => ({
          trip_id: tripId,
          name: item.name,
          category: item.category,
          quantity: item.quantity || 1,
          day: parseInt(day, 10),
          is_packed: false
        }));
        
        const { error: insertError } = await supabase
          .from('packing_items')
          .insert(itemsToAdd);
          
        if (insertError) throw insertError;
      }
      
      // Navigate back to the trip
      navigate(`/trip/${tripId}`);
      
    } catch (err) {
      console.error('Error adding event to day:', err);
      setError('Failed to add event to day');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) return <div className="loading">Loading events...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="event-list">
      <div className="event-list-header">
        <h2>
          {tripId && day ? `Add Event to Day ${day}` : 'My Events'}
        </h2>
        <div className="event-actions">
          <Link 
            to={tripId && day ? `/events/new?tripId=${tripId}&day=${day}` : '/events/new'} 
            className="btn btn-primary"
          >
            Create New Event
          </Link>
          {tripId && day && (
            <button 
              onClick={() => navigate(`/trip/${tripId}`)}
              className="btn btn-secondary"
            >
              Back to Trip
            </button>
          )}
        </div>
      </div>
      
      <div className="events-grid">
        {events.length > 0 ? (
          events.map((event) => (
            <EventCard 
              key={event.id} 
              event={event} 
              onDelete={handleDelete}
              onAddToDay={tripId && day ? () => handleAddToDay(event.id) : null}
              showAddButton={!!(tripId && day)}
            />
          ))
        ) : (
          <div className="empty-state">
            <p>No events found. Create your first event!</p>
            <Link to="/events/new" className="btn btn-primary">
              Create Event
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventList;

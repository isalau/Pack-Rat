import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import EventCard from './EventCard';
import './EventList.css';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_items (*)
        `)
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

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) return <div className="loading">Loading events...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="event-list">
      <div className="event-list-header">
        <h2>My Events</h2>
        <Link to="/events/new" className="btn btn-primary">
          Create New Event
        </Link>
      </div>
      
      <div className="events-grid">
        {events.length > 0 ? (
          events.map(event => (
            <EventCard 
              key={event.id} 
              event={event} 
              onDelete={() => fetchEvents()}
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

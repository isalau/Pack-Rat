import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import './EventInstanceManager.css';

const EventInstanceManager = () => {
  const { eventId, tripId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(1);
  const [error, setError] = useState('');
  const [existingDays, setExistingDays] = useState(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch event data
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*, event_items(*)')
          .eq('id', eventId)
          .single();
          
        if (eventError) throw eventError;
        
        // Fetch trip data
        const { data: tripData, error: tripError } = await supabase
          .from('trips')
          .select('*')
          .eq('id', tripId)
          .single();
          
        if (tripError) throw tripError;
        
        // Fetch existing instances of this event
        const { data: instances, error: instancesError } = await supabase
          .from('event_instances')
          .select('day')
          .eq('event_id', eventId)
          .eq('trip_id', tripId);
          
        if (instancesError) throw instancesError;
        
        setEvent(eventData);
        setTrip(tripData);
        setExistingDays(new Set(instances.map(i => i.day)));
        
        // Set initial selected day to first day not already used
        if (instances.length > 0) {
          for (let i = 1; i <= tripData.packing_days; i++) {
            if (!instances.some(inst => inst.day === i)) {
              setSelectedDay(i);
              break;
            }
          }
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load event data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [eventId, tripId]);

  const handleAddToDay = async () => {
    try {
      setLoading(true);
      
      // Add event instance
      const { error: instanceError } = await supabase
        .from('event_instances')
        .insert([{
          event_id: eventId,
          trip_id: tripId,
          day: selectedDay
        }]);
        
      if (instanceError) throw instanceError;
      
      // Add items to packing list
      const itemsToAdd = event.event_items.map(item => ({
        trip_id: tripId,
        name: item.name,
        category: item.category,
        day: selectedDay,
        quantity: item.quantity || 1,
        is_packed: false
      }));
      
      const { error: itemsError } = await supabase
        .from('packing_items')
        .insert(itemsToAdd);
        
      if (itemsError) throw itemsError;
      
      // Navigate back to the trip
      navigate(`/trips/${tripId}`);
      
    } catch (err) {
      console.error('Error adding event to day:', err);
      setError('Failed to add event to day');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!event || !trip) {
    return <div className="error">Event or trip not found</div>;
  }

  // Generate array of available days (1 to trip.packing_days)
  const availableDays = Array.from({ length: trip.packing_days }, (_, i) => i + 1)
    .filter(day => !existingDays.has(day));

  if (availableDays.length === 0) {
    return (
      <div className="event-instance-manager">
        <h2>Add "{event.name}" to a Day</h2>
        <p>This event has already been added to all days of your trip.</p>
        <button 
          onClick={() => navigate(`/trips/${tripId}`)}
          className="btn btn-primary"
        >
          Back to Trip
        </button>
      </div>
    );
  }

  return (
    <div className="event-instance-manager">
      <h2>Add "{event.name}" to a Day</h2>
      
      <div className="form-group">
        <label htmlFor="day">Select Day</label>
        <select
          id="day"
          value={selectedDay}
          onChange={(e) => setSelectedDay(parseInt(e.target.value, 10))}
          className="day-select"
        >
          {availableDays.map(day => (
            <option key={day} value={day}>
              Day {day}
            </option>
          ))}
        </select>
      </div>
      
      {event.event_items && event.event_items.length > 0 && (
        <div className="event-items-preview">
          <h4>Items to be added:</h4>
          <ul>
            {event.event_items.map((item, index) => (
              <li key={index}>
                {item.name}
                {item.quantity > 1 && ` (${item.quantity})`}
                {item.category && ` [${item.category}]`}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="form-actions">
        <button
          onClick={() => navigate(`/events/${eventId}`)}
          className="btn btn-secondary"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handleAddToDay}
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add to Day'}
        </button>
      </div>
    </div>
  );
};

export default EventInstanceManager;

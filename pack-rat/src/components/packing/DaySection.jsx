import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import PackingList from './PackingList';
import EventModal from '../events/EventModal';
import { supabase } from '../../lib/supabase';
import './DaySection.css';

const DaySection = ({ day, tripId, totalDays }) => {
  const [showEventModal, setShowEventModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const handleAddEvent = async (event) => {
    try {
      setIsAdding(true);
      
      // Add event instance
      const { error: instanceError } = await supabase
        .from('event_instances')
        .insert([{
          event_id: event.id,
          trip_id: tripId,
          day: day
        }]);
        
      if (instanceError) throw instanceError;
      
      // Add event items to packing list
      const { data: items, error: itemsError } = await supabase
        .from('event_items')
        .select('*')
        .eq('event_id', event.id);
        
      if (itemsError) throw itemsError;
      
      if (items && items.length > 0) {
        const itemsToAdd = items.map(item => ({
          trip_id: tripId,
          name: item.name,
          category: item.category || 'Other',
          day: day,
          is_packed: false
        }));
        
        const { error: insertError } = await supabase
          .from('packing_items')
          .insert(itemsToAdd);
          
        if (insertError) throw insertError;
      }
      
      setShowEventModal(false);
      
    } catch (err) {
      console.error('Error adding event to day:', err);
      alert('Failed to add event to day');
    } finally {
      setIsAdding(false);
    }
  };
  
  return (
    <div className="day-section">
      <div className="day-header">
        <h3>Day {day}</h3>
        <div className="day-actions">
          <div className="dropdown">
            <button 
              className="btn btn-sm btn-secondary"
              onClick={() => setShowEventModal(true)}
              disabled={isAdding}
            >
              <FaPlus /> {isAdding ? 'Adding...' : 'Add Event'}
            </button>
          </div>
        </div>
      </div>
      
      <EventModal 
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        onSelectEvent={handleAddEvent}
        tripId={tripId}
        day={day}
      />
      <PackingList 
        tripId={tripId} 
        day={day} 
        totalDays={totalDays} 
      />
    </div>
  );
};

export default DaySection;

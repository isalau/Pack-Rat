import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import PackingList from './PackingList';
import { supabase } from '../../lib/supabase';
import './DaySection.css';

const DaySection = ({ day, tripId, totalDays, onAddEvent }) => {
  const [isAdding, setIsAdding] = useState(false);
  
  const handleAddClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onAddEvent) {
      onAddEvent();
    }
  };
  
  return (
    <div className="day-section" style={{ position: 'relative' }}>
      <div className="day-header">
        <h3>Day {day}</h3>
        <div className="day-actions">
          <button 
            className="btn btn-sm btn-secondary"
            onClick={handleAddClick}
            onMouseDown={e => e.stopPropagation()}
            onMouseUp={e => e.stopPropagation()}
            disabled={isAdding}
          >
            <FaPlus /> {isAdding ? 'Adding...' : 'Add Event'}
          </button>
        </div>
      </div>
      
      <PackingList 
        tripId={tripId} 
        day={day} 
        totalDays={totalDays} 
      />
    </div>
  );
};

export default DaySection;

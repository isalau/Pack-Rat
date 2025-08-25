import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import PackingList from './PackingList';
import './DaySection.css';

const DaySection = ({ day, tripId, totalDays }) => {
  const [showEventDropdown, setShowEventDropdown] = useState(false);
  
  return (
    <div className="day-section">
      <div className="day-header">
        <h3>Day {day}</h3>
        <div className="day-actions">
          <div className="dropdown">
            <button 
              className="btn btn-sm btn-secondary"
              onClick={() => setShowEventDropdown(!showEventDropdown)}
            >
              <FaPlus /> Add Event
            </button>
            {showEventDropdown && (
              <div className="dropdown-content">
                <Link 
                  to={`/events/new?tripId=${tripId}&day=${day}`}
                  className="dropdown-item"
                >
                  Create New Event
                </Link>
                <Link 
                  to={`/events?tripId=${tripId}&day=${day}`}
                  className="dropdown-item"
                >
                  Add Existing Event
                </Link>
              </div>
            )}
          </div>
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

import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaPlus } from 'react-icons/fa';
import './MainNav.css';

const MainNav = () => {
  const location = useLocation();
  
  // Don't show nav on the home page or when adding an event to a trip
  if (location.pathname === '/' || location.pathname.includes('add-to-trip')) {
    return null;
  }

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <Link to="/" className="nav-link" title="Home">
          <FaHome className="nav-icon" />
          <span className="nav-text">Home</span>
        </Link>
        
        <Link to="/events" className="nav-link" title="Events">
          <FaCalendarAlt className="nav-icon" />
          <span className="nav-text">Events</span>
        </Link>
        
        <Link to="/events/new" className="nav-link new-event" title="New Event">
          <FaPlus className="nav-icon" />
          <span className="nav-text">New Event</span>
        </Link>
      </div>
    </nav>
  );
};

export default MainNav;

import { Link, useLocation } from "react-router-dom";
import { FaHome, FaCalendarAlt, FaPlus } from "react-icons/fa";
import LogoutButton from "../auth/LogoutButton";
import { useAuth } from "../../context/AuthContext";
import "./MainNav.css";

const MainNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Don't show nav on the home page, login, signup, or when adding an event to a trip
  if (location.pathname === "/" || 
      location.pathname === "/login" || 
      location.pathname === "/signup" ||
      location.pathname.includes("add-to-trip")) {
    return null;
  }

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <div className="flex-1 flex items-center">
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
        
        {user && (
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-4 hidden md:inline">
              {user.email}
            </span>
            <LogoutButton />
          </div>
        )}
      </div>
    </nav>
  );
};

export default MainNav;

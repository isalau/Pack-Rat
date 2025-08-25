import { Link, useLocation } from "react-router-dom";
import { FaSignOutAlt, FaCalendarAlt, FaUser } from "react-icons/fa";
import LogoutButton from "../auth/LogoutButton";
import { useAuth } from "../../context/AuthContext";
import "./MainNav.css";

const MainNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Only show nav if user is logged in
  if (!user) {
    return null;
  }

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <Link to="/" className="nav-link" title="Home">
          <div className="logo-nav">
            <img src="/packityrat.png" alt="Pack Rat Logo" />
          </div>
        </Link>

        <Link to="/events" className="nav-link" title="Events">
          <FaCalendarAlt className="nav-icon" />
          <span className="nav-text">Events</span>
        </Link>

        {user && (
          <div className="nav-link">
            <FaUser className="nav-icon" />
            <span className="nav-text">{user.email}</span>
          </div>
        )}
        {user && (
          <div className="nav-link">
            <LogoutButton className="nav-text" />
          </div>
        )}
      </div>
    </nav>
  );
};

export default MainNav;

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaSignOutAlt,
  FaCalendarAlt,
  FaUser,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import LogoutButton from "../auth/LogoutButton";
import { useAuth } from "../../context/AuthContext";
import "./MainNav.css";

const MainNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 450);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 450;
      setIsMobile(mobile);
      if (!mobile) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close menu when location changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Only show nav if user is logged in
  if (!user) {
    return null;
  }

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      {isMobile && (
        <button
          className="mobile-menu-toggle"
          onClick={toggleMenu}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      )}
      <nav className={`main-nav ${isOpen ? "nav-open" : ""}`}>
        <div className={`nav-container ${isOpen ? "nav-container-open" : ""}`}>
          <Link to="/home" className="nav-link" title="Home">
            <div className="logo-nav">
              <img src="/packityrat.png" alt="Pack Rat Logo" />
            </div>
          </Link>

          <Link to="/events" className="nav-link" title="Events">
            <FaCalendarAlt className="nav-icon" />
            <span className="nav-text">Events</span>
          </Link>

          {user && (
            <Link to="/account" className="nav-link">
              <FaUser className="nav-icon" />
              <span className="nav-text">Account</span>
            </Link>
          )}
          {user && (
            <div className="nav-link">
              <LogoutButton className="nav-text" />
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default MainNav;

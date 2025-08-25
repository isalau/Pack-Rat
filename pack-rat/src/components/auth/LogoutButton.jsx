import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaSignOutAlt } from "react-icons/fa";
import "./LogoutButton.css";

function LogoutButton({ className = "" }) {
  const [loading, setLoading] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      setLoading(true);
      const { error } = await signOut();
      if (error) throw error;
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`logout-button`}
    >
      <FaSignOutAlt className="nav-icon" />
      <span className="nav-text">Logout</span>
    </button>
  );
}

export default LogoutButton;

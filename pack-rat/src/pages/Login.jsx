import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaEnvelope, FaLock, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for success message in location state
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return setError("Please fill in all fields");
    }

    try {
      setError("");
      setLoading(true);
      const { error: signInError } = await signIn(email, password);

      if (signInError) throw signInError;

      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <button 
        onClick={() => navigate('/')} 
        className="back-button"
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'none',
          border: 'none',
          color: '#6b46c1',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 500
        }}
      >
        <FaArrowLeft /> Back to Home
      </button>
      <div className="login-card">
        <div className="login-header">
          <div className="logo-container">
            <img
              src="/packityrat.png"
              alt="Pack Rat Logo"
              className="login-logo"
            />
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to continue to Pack Rat</p>
        </div>

        {error && (
          <div className="error-message">
            <svg className="error-icon" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="success-message">
            <svg
              className="success-icon"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <FaEnvelope className="input-icon" />
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="password-header">
              <label htmlFor="password">Password</label>
              <Link to="/forgot-password" className="forgot-password">
                Forgot password?
              </Link>
            </div>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
            <FaArrowRight className="button-icon" />
          </button>
        </form>

        <div className="signup-link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;

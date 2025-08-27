import { Link } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  return (
    <div className="landing-container">
      <div className="landing-content">
        <div className="logo-container">
          <img src="/packityrat.png" alt="PackRat Logo" className="logo" />
        </div>
        <h1>Welcome to PackRat!</h1>
        <p className="tagline">
          Your trip, your list, zero stress. Pack smarter not harder. Let
          PackRat help you plan your next adventure.
        </p>

        <div className="cta-buttons">
          <Link to="/login" className="btn btn-primary">
            Log In
          </Link>
          <Link to="/signup" className="btn btn-secondary">
            Sign Up
          </Link>
        </div>

        <div className="steps">
          <div className="step">
            <div className="step-icon">1</div>
            <div className="step-content">
              <h3>Create Trips</h3>
              <p>Start by creating a new trip</p>
            </div>
          </div>
          <div className="step-arrow">
            <span className="arrow-down">↓</span>
          </div>
          <div className="step">
            <div className="step-icon">2</div>
            <div className="step-content">
              <h3>Add Items to Events</h3>
              <p>Add what you'll need for each event</p>
            </div>
          </div>
          <div className="step-arrow">
            <span className="arrow-down">↓</span>
          </div>
          <div className="step">
            <div className="step-icon">3</div>
            <div className="step-content">
              <h3>Add Events to Trips</h3>
              <p>Organize your schedule</p>
            </div>
          </div>
          <div className="step-arrow">
            <span className="arrow-down">↓</span>
          </div>
          <div className="step">
            <div className="step-icon">4</div>
            <div className="step-content">
              <h3>Get a Packing List</h3>
              <p>Your personalized packing list is ready!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

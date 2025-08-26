import { useState, useContext } from "react";
import { useAuth } from "../../context/AuthContext";
import './Account.css';

const Account = () => {
  const { currentUser, updateEmail, updatePassword, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [formData, setFormData] = useState({
    displayName: currentUser?.displayName || "",
    email: currentUser?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const { displayName, email, currentPassword, newPassword, confirmPassword } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (newPassword !== confirmPassword) {
      return setError("New passwords do not match");
    }

    try {
      setLoading(true);
      
      // Update display name if changed
      if (displayName !== currentUser.displayName) {
        await updateProfile({ displayName });
      }
      
      // Update email if changed
      if (email !== currentUser.email) {
        await updateEmail(email);
      }
      
      // Update password if provided
      if (newPassword) {
        await updatePassword(newPassword);
      }
      
      setSuccess("Account updated successfully!");
      // Clear password fields
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (err) {
      console.error("Failed to update account:", err);
      setError(err.message || "Failed to update account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="account-container">
      <h2>Account Settings</h2>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <form onSubmit={handleSubmit} className="account-form">
        <div className="form-group">
          <label htmlFor="displayName">Username</label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            value={displayName}
            onChange={handleChange}
            placeholder="Enter your username"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div className="password-section">
          <h3>Change Password</h3>
          
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={currentPassword}
              onChange={handleChange}
              placeholder="Enter current password"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
              minLength={6}
            />
            <small className="hint">Leave blank to keep current password</small>
          </div>
          
          {newPassword && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                disabled={!newPassword}
              />
            </div>
          )}
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Account'}
        </button>
      </form>
    </div>
  );
};

export default Account;

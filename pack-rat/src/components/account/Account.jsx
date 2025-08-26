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
  
  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  const { displayName, email, currentPassword, newPassword, confirmPassword } = formData;

  const validatePassword = (password) => {
    if (password.length > 0 && password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return "";
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    if (password !== confirmPassword) {
      return "Passwords do not match";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data
    const newFormData = {
      ...formData,
      [name]: value
    };
    
    // Validate passwords
    if (name === 'newPassword') {
      setErrors({
        ...errors,
        newPassword: validatePassword(value),
        confirmPassword: validateConfirmPassword(value, formData.confirmPassword)
      });
    } else if (name === 'confirmPassword') {
      setErrors({
        ...errors,
        confirmPassword: validateConfirmPassword(formData.newPassword, value)
      });
    }
    
    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Validate all fields before submission
    const passwordError = validatePassword(newPassword);
    const confirmPasswordError = validateConfirmPassword(newPassword, confirmPassword);
    
    if (passwordError || confirmPasswordError) {
      setErrors({
        newPassword: passwordError,
        confirmPassword: confirmPasswordError
      });
      return setError("Please fix the form errors before submitting.");
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
              className={errors.newPassword ? 'error' : ''}
            />
            {errors.newPassword && (
              <small className="error-message">{errors.newPassword}</small>
            )}
            <small className="hint">Leave blank to keep current password (minimum 6 characters)</small>
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
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && (
                <small className="error-message">{errors.confirmPassword}</small>
              )}
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

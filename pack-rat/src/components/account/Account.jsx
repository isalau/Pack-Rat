import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import "./Account.css";

const Account = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;

  const userName = user?.user_metadata?.full_name || "n/a";
  const email = user?.email || "n/a";
  const password = user?.password || "n/a";

  const handleUserNameSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.username,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error updating user:", error);
    }
    // Show success message
    alert("Your new username has been saved.");
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      alert("Please enter a new email address");
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.updateUser({
        email: formData.email,
      });

      if (error) throw error;

      // Show success message
      alert(
        "Please check your email for a confirmation link to update your email address. Your email change will not reflect below until confirmed."
      );

      // Clear the email field
      setFormData((prev) => ({
        ...prev,
        email: "",
      }));
    } catch (error) {
      console.error("Error updating email:", error);
      alert(`Error updating email: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    if (formData.password !== formData.confirm_password) {
      alert("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    e.preventDefault();
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error updating password:", error);
    }
    // Show success message
    alert("Your new password has been saved.");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className="account-container">
      <h1>Account Settings</h1>
      {/* Change Username */}
      <form onSubmit={handleUserNameSubmit}>
        <p>Current Username: {userName}</p>
        <div className="account-form">
          <div className="account-form-group">
            <label htmlFor="displayName">Change Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="New Username"
              required
              className="account-form-control"
            />
          </div>
          <button type="submit" className="btn btn-primary mt-3 account-button">
            Update Username
          </button>
        </div>
      </form>
      <hr></hr>

      {/* Change Email */}
      <form onSubmit={handleEmailSubmit}>
        <p>Current Email: {email}</p>
        <div className="account-form">
          <div className="account-form-group">
            <label htmlFor="email">New Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="New Email Address"
              required
              className="account-form-control"
            />
          </div>
          <button type="submit" className="btn btn-primary mt-3 account-button">
            Update Email
          </button>
        </div>
      </form>
      <hr></hr>

      {/* Change Password */}
      <form onSubmit={handlePasswordSubmit}>
        <div className="account-form-group">
          <label htmlFor="password">New Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="New Password"
            required
            className="account-form-control"
          />
        </div>
        <div className="account-form-group">
          <label htmlFor="confirm_password">Confirm New Password:</label>
          <input
            type="password"
            id="confirm_password"
            name="confirm_password"
            value={formData.confirm_password}
            onChange={handleChange}
            placeholder="Confirm New Password"
            required
            className="account-form-control"
          />
        </div>
        <button type="submit" className="btn btn-primary mt-3 account-button">
          Update Password
        </button>
      </form>
    </div>
  );
};

export default Account;

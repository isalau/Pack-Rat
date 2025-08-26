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
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          email: formData.email,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error updating user:", error);
    }
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
            />
          </div>
          <button type="submit" className="btn btn-primary mt-3">
            Update Username
          </button>
        </div>
      </form>
      <hr style={{ borderColor: "blue", borderWidth: "2px" }}></hr>

      {/* Change Email */}
      <form onSubmit={handleEmailSubmit}>
        <p>Current Email: {email}</p>
        <div className="account-form">
          <div className="account-form-group">
            <label htmlFor="displayName">Change Email:</label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="btn btn-primary mt-3">
            Update Email
          </button>
        </div>
      </form>
    </div>
  );
};

export default Account;

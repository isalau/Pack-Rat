import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import TripsList from "./components/trip/TripsList";
import TripDetail from "./components/trip/TripDetail";
import EventList from "./components/events/EventList";
import EventForm from "./components/events/EventForm";
import EventInstanceManager from "./components/events/EventInstanceManager";
import Account from "./components/account";
import MainNav from "./components/layout/MainNav";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ProtectedLayout from "./components/layout/ProtectedLayout";

// A wrapper for routes that require authentication
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Component that has access to auth context
const AppContent = () => {
  const { user, loading } = useAuth();

  // Don't render anything while checking auth state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/" replace /> : <SignUp />}
          />
          <Route
            path="/forgot-password"
            element={user ? <Navigate to="/" replace /> : <ForgotPassword />}
          />

          {/* Protected routes */}
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <Routes>
                  <Route element={<ProtectedLayout />}>
                    <Route path="/" element={<TripsList />} />
                    <Route path="/trip/:id" element={<TripDetail />} />
                    <Route path="/events" element={<EventList />} />
                    <Route path="/events/new" element={<EventForm />} />
                    <Route path="/events/:id/edit" element={<EventForm />} />
                    <Route
                      path="/events/:eventId/add-to-trip/:tripId"
                      element={<EventInstanceManager />}
                    />
                    {/* <Route path="/account" element={<Account />} /> */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

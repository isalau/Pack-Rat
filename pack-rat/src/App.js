import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TripsList from "./components/trip/TripsList";
import TripDetail from "./components/trip/TripDetail";
import EventList from "./components/events/EventList";
import EventForm from "./components/events/EventForm";
import EventInstanceManager from "./components/events/EventInstanceManager";
import MainNav from "./components/layout/MainNav";

function App() {
  return (
    <Router>
      <div className="App">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<TripsList />} />
            <Route path="/trip/:id" element={<TripDetail />} />
            
            {/* Event Routes */}
            <Route path="/events" element={<EventList />} />
            <Route path="/events/new" element={<EventForm />} />
            <Route path="/events/:id/edit" element={<EventForm />} />
            <Route 
              path="/events/:eventId/add-to-trip/:tripId" 
              element={<EventInstanceManager />} 
            />
          </Routes>
        </main>
        <MainNav />
      </div>
    </Router>
  );
}

export default App;

import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TripsList from "./components/trip/TripsList";
import TripDetail from "./components/trip/TripDetail";

function App() {
  return (
    <Router>
      <div className="App">
        <main>
          <Routes>
            <Route path="/" element={<TripsList />} />
            <Route path="/trip/:id" element={<TripDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

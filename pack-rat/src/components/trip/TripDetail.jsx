import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import PackingListSummary from "../packing/PackingListSummary";
import DaySection from "../packing/DaySection";
import EventModal from "../events/EventModal";
import { FaPlus } from "react-icons/fa";
import "./TripDetail.css";

const TripDetail = ({ trip: initialTrip, onBack }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [view, setView] = useState("days"); // 'days' or 'summary'
  const [trip, setTrip] = useState(initialTrip);
  const [isLoading, setIsLoading] = useState(!initialTrip);
  const [error, setError] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("trips")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setTrip(data);
      } catch (err) {
        console.error("Error fetching trip:", err);
        setError("Failed to load trip details");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchTrip();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="loading-state">
        <p>Loading trip details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <p>{error}</p>
        <Link to="/" className="btn btn-primary">
          Back to Trips
        </Link>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="empty-state">
        <p>Trip not found</p>
        <Link to="/" className="btn btn-primary">
          Back to Trips
        </Link>
      </div>
    );
  }

  // Generate array of packing days
  const packingDays = trip
    ? Array.from({ length: trip.packing_days || 1 }, (_, i) => i + 1)
    : [];

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="trip-detail">
      <div className="trip-header">
        {/* <Link to="/" className="back-link">
          &larr; Back to Trips
        </Link> */}
        <div className="trip-title-container">
          <h1>{trip.trip_name}</h1>
          {/* <button
            onClick={() => navigate("/events")}
            className="btn btn-primary"
          >
            <FaPlus /> Manage Events
          </button> */}
        </div>
        {/* <p className="trip-dates">
          {new Date(trip.start_date).toLocaleDateString()} -{" "}
          {new Date(trip.end_date).toLocaleDateString()}
        </p>
        <p className="trip-days">{trip.packing_days} days</p> */}
      </div>

      <div className="trip-overview">
        <h2>Trip Overview</h2>
        <div className="trip-info-grid">
          <div className="info-item">
            <span className="label">Origin:</span>
            <span>{trip.origin || "Not specified"}</span>
          </div>
          <div className="info-item">
            <span className="label">Destination:</span>
            <span>{trip.destination || "Not specified"}</span>
          </div>
          <div className="info-item">
            <span className="label">Start Date:</span>
            <span>{new Date(trip.start_date).toLocaleDateString()}</span>
          </div>
          <div className="info-item">
            <span className="label">End Date:</span>
            <span>{new Date(trip.end_date).toLocaleDateString()}</span>
          </div>
          <div className="info-item">
            <span className="label">Packing Days:</span>
            <span>{trip.packing_days}</span>
          </div>
        </div>
        {trip.notes && (
          <div className="trip-notes">
            <h3>Notes</h3>
            <p>{trip.notes}</p>
          </div>
        )}
      </div>

      <div className="packing-views">
        <div className="view-tabs">
          <button
            className={`view-tab ${view === "days" ? "active" : ""}`}
            onClick={() => setView("days")}
          >
            By Day
          </button>
          <button
            className={`view-tab ${view === "summary" ? "active" : ""}`}
            onClick={() => setView("summary")}
          >
            Summary
          </button>
        </div>

        {view === "days" ? (
          <div className="packing-days">
            <h2>Packing Days</h2>
            <div className="days-container">
              {packingDays.map((day) => (
                <DaySection
                  key={day}
                  day={day}
                  tripId={trip.id}
                  totalDays={packingDays.length}
                  onAddEvent={() => {
                    setSelectedDay(day);
                    setShowEventModal(true);
                  }}
                />
              ))}
              <EventModal
                isOpen={showEventModal}
                onClose={() => setShowEventModal(false)}
                onSelectEvent={async (event) => {
                  if (!selectedDay) return;
                  
                  try {
                    setIsAdding(true);
                    
                    // Add event instance
                    const { error: instanceError } = await supabase
                      .from('event_instances')
                      .insert([{
                        event_id: event.id,
                        trip_id: trip.id,
                        day: selectedDay
                      }]);
                      
                    if (instanceError) throw instanceError;
                    
                    // Add event items to packing list
                    const { data: items, error: itemsError } = await supabase
                      .from('event_items')
                      .select('*')
                      .eq('event_id', event.id);
                      
                    if (itemsError) throw itemsError;
                    
                    if (items && items.length > 0) {
                      const itemsToAdd = items.map(item => ({
                        trip_id: trip.id,
                        name: item.name,
                        category: item.category || 'Other',
                        day: selectedDay,
                        is_packed: false
                      }));
                      
                      const { error: insertError } = await supabase
                        .from('packing_items')
                        .insert(itemsToAdd);
                        
                      if (insertError) throw insertError;
                    }
                    
                    // Refresh the trip data to show the new event
                    const { data: updatedTrip } = await supabase
                      .from('trips')
                      .select('*')
                      .eq('id', trip.id)
                      .single();
                      
                    if (updatedTrip) {
                      setTrip(updatedTrip);
                    }
                    
                  } catch (err) {
                    console.error('Error adding event to day:', err);
                    alert('Failed to add event to day');
                  } finally {
                    setIsAdding(false);
                    setShowEventModal(false);
                  }
                }}
                tripId={trip.id}
                day={selectedDay}
              />
            </div>
          </div>
        ) : (
          <PackingListSummary tripId={trip.id} days={packingDays} />
        )}
      </div>
    </div>
  );
};

export default TripDetail;

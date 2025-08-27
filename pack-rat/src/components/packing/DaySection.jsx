import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import PackingList from "./PackingList";
import { supabase } from "../../lib/supabase";
import "./DaySection.css";

const DaySection = ({ day, tripId, totalDays, onAddEvent }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from("event_instances")
          .select(
            `
            *,
            events (
              name
            )
          `
          )
          .eq("trip_id", tripId)
          .eq("day", day);

        if (error) throw error;

        setEvents(data || []);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();

    // Set up real-time subscription
    const subscription = supabase
      .channel("event_instances")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_instances",
          filter: `trip_id=eq.${tripId}`,
        },
        () => fetchEvents()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [tripId, day]);

  const handleAddClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onAddEvent) {
      onAddEvent();
    }
  };

  if (isLoading) {
    return (
      <div className="day-section">
        <div className="day-header">
          <h3>Day {day}</h3>
          <div className="day-actions">
            <button className="btn btn-sm btn-secondary" disabled>
              <FaPlus /> Loading...
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="day-section" style={{ position: "relative" }}>
      <div className="day-header">
        <h3>Day {day}</h3>
        {events.length > 0 && (
          <div className="day-events">
            {events.map((event, index) => (
              <span key={index} className="event-tag">
                {event.events?.name}
              </span>
            ))}
          </div>
        )}
        <div className="day-actions">
          <button
            className="btn btn-sm btn-secondary"
            onClick={handleAddClick}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            disabled={isAdding}
          >
            <FaPlus /> {isAdding ? "Adding..." : "Add Event"}
          </button>
        </div>
      </div>

      <PackingList tripId={tripId} day={day} totalDays={totalDays} />
    </div>
  );
};

export default DaySection;

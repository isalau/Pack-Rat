import { useState } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaTrash } from "react-icons/fa";
import PackingList from "./PackingList";
import { supabase } from "../../lib/supabase";
import "./DaySection.css";

const DaySection = ({ day, tripId, totalDays, onAddEvent }) => {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onAddEvent) {
      onAddEvent();
    }
  };

  const handleDeleteDay = async (e) => {
    // e.stopPropagation();
    // e.preventDefault();
    // try {
    //   const { error } = await supabase
    //     .from("days")
    //     .delete()
    //     .eq("trip_id", tripId)
    //     .eq("day", day);
    //   if (error) throw error;
    // } catch (error) {
    //   console.error("Error deleting day:", error);
    // }
  };

  return (
    <div className="day-section" style={{ position: "relative" }}>
      <div className="day-header">
        <h3>Day {day}</h3>
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
          <button
            className="btn btn-sm btn-secondary"
            onClick={handleDeleteDay}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
          >
            <FaTrash /> Delete Day
          </button>
        </div>
      </div>

      <PackingList tripId={tripId} day={day} totalDays={totalDays} />
    </div>
  );
};

export default DaySection;
